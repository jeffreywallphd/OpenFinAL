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


def load_model_and_tokenizer(model_name, bf16):
    if "llama" in model_name.lower() or "meta" in model_name.lower() or "openelm" in model_name.lower():
        tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-hf", use_fast=False, trust_remote_code=True)
        tokenizer.add_bos_token = True
    else:
        tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)

    dtype = torch.bfloat16 if bf16 else None
    model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype=dtype, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token
    model.resize_token_embeddings(len(tokenizer))
    model.to("cuda" if torch.cuda.is_available() else "cpu")

    return model, tokenizer

def validate_constraints(min_length, max_length, top_p, top_k):
    if not (1 <= min_length <= max_length <= 1024):
        raise ValueError("min_length must be <= max_length and within valid range.")
    if not (0 <= top_p <= 1):
        raise ValueError("top_p must be between 0 and 1.")
    if top_k < 0:
        raise ValueError("top_k must be a non-negative integer.")

def preprocess_dataset(dataset, train_test_split_ratio):
    dataset = dataset.rename_column("input", "Question").rename_column("output", "Answer")
    dataset = dataset.remove_columns([col for col in dataset.column_names["train"] if col not in ["Question", "Answer"]])
    dataset = dataset["train"].train_test_split(test_size=train_test_split_ratio)
    return dataset["train"], dataset["test"]

def tokenize_function(examples, tokenizer):
    inputs = tokenizer([f"{q} {a}" for q, a in zip(examples["Question"], examples["Answer"])],
                       padding="max_length", truncation=True, max_length=128)
    inputs["labels"] = inputs["input_ids"]
    return inputs

def compute_average_scores(total_scores, num_questions):
    return {key: total / num_questions for key, total in total_scores.items()}
