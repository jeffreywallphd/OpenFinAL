from django.shortcuts import render
from django.http import JsonResponse
from ..models.model_stats import ModelStats
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from transformers import TrainingArguments, Trainer
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, Trainer
from datasets import load_dataset, DatasetDict, Dataset
from evaluate import load
from django.views.decorators.csrf import csrf_protect
import os
import sys
import wandb
import pandas as pd
import gc
import torch
import traceback
from decouple import config
from huggingface_hub import login
import subprocess
from django.http import StreamingHttpResponse, JsonResponse
import signal
from threading import Lock


# Retrieve API keys from environment variables
DEFAULT_WANDB_API_KEY = config("WANDB_API_KEY", default="")
DEFAULT_HF_API_KEY = config("HF_API_KEY", default="")

print(f"CUDA available: {torch.cuda.is_available()}")

# Store the training process ID
training_process = None
process_lock = Lock()

def stream_training_workflow_output(request):
    # Start subprocess to run model training and capture terminal output
    def event_stream():
        env = os.environ.copy()
        env['PYTHONUNBUFFERED'] = '1'  # Ensure real-time output

        process = subprocess.Popen(
            [sys.executable, "manage.py", "model_training_workflow"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True,
            env=env
        )

        for line in iter(process.stdout.readline, ''):
            yield f"data: {line.strip()}\n\n"
            sys.stdout.flush()

        for line in iter(process.stderr.readline, ''):
            yield f"data: [ERROR] {line.strip()}\n\n"
            sys.stderr.flush()

        process.stdout.close()
        process.wait()

    return StreamingHttpResponse(event_stream(), content_type="text/event-stream")

def train_model_workflow(request):
    global training_process

    if request.method == "POST":

        try:
            # Check if a training process is already running
            if training_process and training_process.poll() is None:
                return JsonResponse({
                    "status": "error",
                    "message": "A training process is already running. Please stop it before starting a new one."
                })

            # Parse user-configurable parameters from the request
            model_name = request.POST.get("model_name", "gpt2")
            learning_rate = float(request.POST.get("learning_rate", 2e-5))
            num_epochs = int(request.POST.get("num_epochs", 3))
            batch_size = int(request.POST.get("batch_size", 1))
            project_name = request.POST.get("project_name", "your_project_name")
            gradient_checkpointing = request.POST.get("gradient_checkpointing") == "on"
            max_grad_norm = float(request.POST.get("max_grad_norm", 1.0))
            fp16 = request.POST.get("fp16") == "on"
            bf16 = request.POST.get("bf16") == "on"
            weight_decay = float(request.POST.get("weight_decay", 0.01))
            model_repo = request.POST.get("model_repo", "OpenFinAL/your-model-name")
            dataset_name = request.POST.get("dataset_name", "FinGPT/fingpt-fiqa_qa")  # User-specified dataset
            train_test_split_ratio = float(request.POST.get("train_test_split_ratio", 0.1))  # Split ratio
            num_questions = int(request.POST.get("num_questions", 10))  # Number of questions to evaluate

            model_list = [model_name,model_repo]

            # Retrieve API keys from the form or fall back to .env values
            wandb_key = request.POST.get("wandb_key") or DEFAULT_WANDB_API_KEY
            hf_key = request.POST.get("hf_key") or DEFAULT_HF_API_KEY

            if not wandb_key or not hf_key:
                return JsonResponse({
                    "status": "error",
                    "message": "Both W&B and Hugging Face API keys are required either in the .env file or via the form."
                })
            

            # Start the training as a subprocess
            training_process = subprocess.Popen(
                [sys.executable, "manage.py", "model_training_workflow"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
            )

            print(f"Training started with PID: {training_process.pid}")

            # Check for GPU
            device = "cuda" if torch.cuda.is_available() else "cpu"
            if device == "cpu":
                return JsonResponse({
                    "status": "error",
                    "message": "No GPU found. Please ensure a GPU is available and properly configured."
                })

            # Initialize W&B
            wandb.login(key=wandb_key)
            wandb.init(project=project_name)

            # Login to Hugging Face
            login(token=hf_key)

            # Load dataset
            dataset = load_dataset(dataset_name)
            dataset = dataset.rename_column("input", "Question").rename_column("output", "Answer")
            dataset = dataset.remove_columns([col for col in dataset.column_names["train"] if col not in ["Question", "Answer"]])
            # Split dataset based on user-provided ratio
            train_test_split = dataset["train"].train_test_split(test_size=train_test_split_ratio)
            train_dataset = train_test_split["train"]
            eval_dataset = train_test_split["test"]

            # Save split datasets to HF hub
            split_dataset = DatasetDict({"train": train_dataset, "test": eval_dataset})
            split_dataset.push_to_hub(f"{model_repo}-split-dataset", token=hf_key)

            # Load model and tokenizer dynamically with Meta and OpenELM support
            if "llama" in model_name.lower() or "meta" in model_name.lower() or "openelm" in model_name.lower():
                # If model is Llama, Meta, or OpenELM, use a special configuration
                tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-hf", use_fast=False, trust_remote_code=True)
                tokenizer.add_bos_token = True  
                dtype = torch.bfloat16 if bf16 else None
                model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype=dtype, trust_remote_code=True)

            else:
                # Default to Hugging Face Auto classes for other models
                tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
                dtype = torch.bfloat16 if bf16 else None
                model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype=dtype, trust_remote_code=True)

            # Set padding token
            tokenizer.pad_token = tokenizer.eos_token
            model.resize_token_embeddings(len(tokenizer))
            model.to(device)
            
            # Tokenization function
            def tokenize_function(examples):
                inputs = tokenizer(
                    [f"{q} {a}" for q, a in zip(examples["Question"], examples["Answer"])],
                    padding="max_length",
                    truncation=True,
                    max_length=128  # Adjust max_length as needed
                )
                inputs["labels"] = inputs["input_ids"]
                return inputs

            # Tokenize split datasets directly
            train_dataset = train_dataset.map(tokenize_function, batched=True)
            eval_dataset = eval_dataset.map(tokenize_function, batched=True)

            print("Sample tokenized data:", train_dataset[0])

            # Training arguments
            training_args = TrainingArguments(
                output_dir=os.path.join("results", model_name),  # Results directory
                evaluation_strategy="epoch",
                learning_rate=learning_rate,
                per_device_train_batch_size=batch_size,
                per_device_eval_batch_size=batch_size,
                num_train_epochs=num_epochs,
                weight_decay=weight_decay,
                logging_dir=os.path.join("logs"),
                load_best_model_at_end=True,
                save_strategy="epoch",
                report_to="wandb",
                gradient_checkpointing=gradient_checkpointing,
                max_grad_norm=max_grad_norm,
                fp16=fp16,
                bf16=bf16,
            )

            # Trainer
            trainer = Trainer(
                model=model,
                args=training_args,
                train_dataset=train_dataset,
                eval_dataset=eval_dataset,
                tokenizer=tokenizer,  # Add tokenizer for tokenized output
            )

            # Train the model
            trainer.train()

            # Save model to Hugging Face directly
            model.push_to_hub(model_repo, use_auth_token=hf_key)
            tokenizer.push_to_hub(model_repo, use_auth_token=hf_key)

            # Randomly select 5 questions from test set for evaluation
            sampled_data = eval_dataset.shuffle(seed=42).select(range(min(5, len(eval_dataset))))
            questions = sampled_data["Question"]
            references = sampled_data["Answer"]

            results = {}
            for model_name in model_list:
            
                total_scores = {
                    "ROUGE1": 0,
                    "ROUGE2": 0,
                    "ROUGEL": 0,
                    "ROUGELSUM": 0,
                    "BERTScoreF1": 0,
                    "BERTScorePrecision": 0,
                    "BERTScoreRecall": 0,
                }

                # Randomly select `num_questions` from eval_dataset
                sampled_dataset = eval_dataset.shuffle(seed=42).select(range(min(num_questions, len(eval_dataset))))
                questions = sampled_dataset["Question"]
                references = sampled_dataset["Answer"]

                for question, reference in zip(questions, references):
                    try:
                            scores = model_stats_workflow(
                                prompt=question,
                                model_name=model_name,
                                top_k=50,
                                top_p=0.95,
                                max_new_tokens=300,
                                no_repeat_ngrams=0,
                                references=[reference]
                            )
                            
                            # Sum up scores
                            for key in total_scores:
                                total_scores[key] += scores[key] 
                            
                            # print(f"Scores for question '{question}': {scores}")
                        
                    except Exception as e:
                        return Response({"error": f"Error processing question '{question}': {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                # Compute average scores
                avg_scores = {key: total / num_questions for key, total in total_scores.items()}
                results[model_name] = avg_scores
                print(f"Average scores: {avg_scores}")

                # Save evaluation results to the database
                for model_name, scores in results.items():
                    ModelStats.objects.create(
                        model_name=model_name,
                        dataset=dataset_name,  # The dataset used for evaluation
                        ROUGE1=scores["ROUGE1"],
                        ROUGE2=scores["ROUGE2"],
                        ROUGE_L=scores["ROUGEL"],
                        ROUGE_LSum=scores["ROUGELSUM"],
                        BERTScoreF1=scores["BERTScoreF1"],
                        BERTScorePrecision=scores["BERTScorePrecision"],
                        BERTScoreRecall=scores["BERTScoreRecall"]
                    )

            # Cleanup
            del train_dataset, eval_dataset, model, tokenizer
            gc.collect()
            torch.cuda.empty_cache()
            
            print(f"Results: {results}")
            return JsonResponse({"status": "success", "message": f"Training completed successfully for {model_name}!","evaluation_results": results})

        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)})
    
    return render(request, "model_training_workflow.html")

@csrf_protect
def stop_training_workflow(request):
    global training_process
    if request.method == "POST":
        with process_lock:
            try:
                if training_process and training_process.poll() is None:
                    # Send SIGTERM to the training process
                    training_process.terminate()
                    training_process.wait()
                    training_process = None

                    print("Training process terminated successfully.")
                    return JsonResponse({
                        "status": "success",
                        "message": "Training process terminated successfully."
                    })
                else:
                    return JsonResponse({
                        "status": "error",
                        "message": "No training process is running."
                    })

            except Exception as e:
                return JsonResponse({
                    "status": "error",
                    "message": f"Failed to terminate the training process: {str(e)}"
                })
    return JsonResponse({"status": "error", "message": "Invalid request method."})


def model_stats_workflow(prompt, model_name, top_k=50, top_p=0.95, max_new_tokens=300, no_repeat_ngrams=0, references=[]):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    try:
        # Load tokenizer and model with your logic
        if "llama" in model_name.lower() or "meta" in model_name.lower() or "openelm" in model_name.lower():
            tokenizer = AutoTokenizer.from_pretrained(
                "meta-llama/Llama-2-7b-hf", use_fast=False, trust_remote_code=True
            )
            tokenizer.add_bos_token = True
            model = AutoModelForCausalLM.from_pretrained(model_name, trust_remote_code=True)
        else:
            tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
            model = AutoModelForCausalLM.from_pretrained(model_name, trust_remote_code=True)

        tokenizer.pad_token = tokenizer.eos_token
        model.resize_token_embeddings(len(tokenizer))
        model.to(device)

        # Tokenize the input prompt
        inputs = tokenizer(
            prompt,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=128
        ).to(device)

        # Generate the response
        outputs = model.generate(
            inputs['input_ids'],
            attention_mask=inputs['attention_mask'],
            do_sample=True,
            top_k=top_k,
            top_p=top_p,
            num_return_sequences=1,
            max_new_tokens=max_new_tokens,
            no_repeat_ngram_size=no_repeat_ngrams,
            pad_token_id=tokenizer.pad_token_id
        )

        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        predictions = [str(response)]  # Wrap the prediction in a list

        # Calculate metrics
        rouge_metric = load("rouge",trusted_remote_code=True)
        bertscore_metric = load("bertscore",trusted_remote_code=True)

        rouge_scores = rouge_metric.compute(predictions=predictions, references=references)
        bertscore_scores = bertscore_metric.compute(predictions=predictions, references=references,lang="en",device=device) 

        print(f"ROUGE scores: {rouge_scores}")
        print(f"BERTScore scores: {bertscore_scores}")
        
        return {
            "ROUGE1" : rouge_scores.get("rouge1",0),
            "ROUGE2" : rouge_scores.get("rouge2",0),
            "ROUGEL" : rouge_scores.get("rougeL",0),
            "ROUGELSUM" : rouge_scores.get("rougeLsum",0),
            "BERTScoreF1" : bertscore_scores["f1"][0],
            "BERTScorePrecision" : bertscore_scores["precision"][0],
            "BERTScoreRecall" : bertscore_scores["recall"][0],
        }
    
    except Exception as e:
        print(f"Error in model_stats: {e}") 
        print(traceback.format_exc())
        raise RuntimeError(f"Error in model_stats: {e}")
    
def get_model_stats(request):
    # Extract dataset name from query parameters
    dataset_name = request.GET.get('dataset_name')
    if not dataset_name:
        return JsonResponse({"error": "Dataset name is required."}, status=400)

    # Fetch the last four models trained on the same dataset
    stats = ModelStats.objects.filter(dataset=dataset_name).order_by('-created_at')[:4]

    # If no stats found, return empty response
    if not stats.exists():
        return JsonResponse({"message": "No models found for the specified dataset."}, status=404)

    # Prepare response data
    data = [{
        "model_name": stat.model_name,
        "dataset": stat.dataset,
        "ROUGE1": stat.ROUGE1,
        "ROUGE2": stat.ROUGE2,
        "ROUGE_L": stat.ROUGE_L,
        "ROUGE_LSum": stat.ROUGE_LSum,
        "BERTScoreF1": stat.BERTScoreF1,
        "BERTScorePrecision": stat.BERTScorePrecision,
        "BERTScoreRecall": stat.BERTScoreRecall,
        "created_at": stat.created_at.strftime('%Y-%m-%d %H:%M:%S')
    } for stat in stats]

    return JsonResponse(data, safe=False, status=200)
