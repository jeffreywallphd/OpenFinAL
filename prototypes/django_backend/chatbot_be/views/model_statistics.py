from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from evaluate import load
from datasets import load_dataset, Dataset
import torch
from django.shortcuts import render
import traceback
import pandas as pd
import requests
from io import StringIO
import random

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def model_stats(prompt, model_name, max_length=200, min_length=100, top_k=50, top_p=0.95, max_new_tokens=300, no_repeat_ngrams=0, references=[]):
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


class ModelStatisticsView(APIView):

    def get(self, request):
        return render(request, 'model_statistics.html')

    """
    API endpoint to generate a chatbot response and compute metrics.
    """
    def post(self, request):
        dataset_url = request.data.get("dataset_url")
        dataset_file = request.FILES.get("dataset_file") # Optional
        num_questions = int(request.data.get("num_questions", 10))
        # model_name = request.data.get("model_name")
        models = request.data.get("models")
        max_length = int(request.data.get("max_length", 200))
        min_length = int(request.data.get("min_length", 100))
        top_k = int(request.data.get("top_k", 50))
        top_p = float(request.data.get("top_p", 0.95))
        max_new_tokens = int(request.data.get("max_new_tokens", 300))
        no_repeat_ngrams = int(request.data.get("no_repeat_ngrams", 0))

        # Validate inputs
        if not models:
            return Response({"error": "At least one model name is required"}, status=status.HTTP_400_BAD_REQUEST)

        model_list =  [model.strip() for model in models.split(",")]

        try:
            
            if dataset_url:
                    dataset = load_dataset(dataset_url) 
            elif dataset_file:
                dataset = self.handle_uploaded_file(dataset_file)
            else:
                return Response({"error": "Provide either dataset URL or file."}, status=status.HTTP_400_BAD_REQUEST)

            print(f"Dataset loaded: {dataset}") 
            df = dataset["train"] 
            # convert into dataframe 
            df = pd.DataFrame(df)
            print(f"Dataset loaded: {df}")
            print(f"Dataset loaded: {df}")

            if "input" not in df.columns or "output" not in df.columns:
                return Response({"error": "Dataset must contain 'input' and 'output' columns."}, status=status.HTTP_400_BAD_REQUEST)

            df.dropna(subset=["input", "output"], inplace=True)

            if df.empty:
                return Response({"error": "Dataset is empty after filtering."}, status=status.HTTP_400_BAD_REQUEST)


            # Randomly sample N questions
            num_questions = min(num_questions, len(df))
            sampled_data = df.sample(n=num_questions, random_state = 42)
            questions = sampled_data["input"].tolist()
            references = sampled_data["output"].tolist()
        
        except Exception as e:
            return Response({"error": f"Error loading dataset: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        results = {}

        # Compute scores for multiple questions
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

            # Constraints validation
            if not (1 <= min_length <= max_length <= 1024):
                return Response({"error": "min_length must be <= max_length and within valid range."}, status=status.HTTP_400_BAD_REQUEST)
            if not (0 <= top_p <= 1):
                return Response({"error": "top_p must be between 0 and 1."}, status=status.HTTP_400_BAD_REQUEST)
            if top_k < 0:
                return Response({"error": "top_k must be a non-negative integer."}, status=status.HTTP_400_BAD_REQUEST)

            for question, reference in zip(questions, references):
                try:
                        scores = model_stats(
                            prompt=question,
                            model_name=model_name,
                            top_k=top_k,
                            top_p=top_p,
                            max_new_tokens=max_new_tokens,
                            no_repeat_ngrams=no_repeat_ngrams,
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

        print(f"Results: {results}")
        return Response(results, status=status.HTTP_200_OK)
    
    def handle_uploaded_file(self, file):
        # Convert CSV to Hugging Face Dataset
        df = pd.read_csv(file)
        
        # Ensure 'input' and 'output' columns are present
        if "input" not in df.columns or "output" not in df.columns:
            raise ValueError("CSV must contain 'input' and 'output' columns.")
        
        dataset = Dataset.from_pandas(df)
        return dataset

def chatbot_view(request):
    return render(request, 'model_statistics.html')
