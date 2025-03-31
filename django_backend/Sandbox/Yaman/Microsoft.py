import os
import torch
import transformers
from transformers import AutoTokenizer, AutoModelForCausalLM
from huggingface_hub import login

# Authenticate with Hugging Face
login("#")  # REMOVE BEFORE UPLOADING TO GITHUB

# Set cache directories
os.environ["HF_HOME"] = "D:/huggingface_cache"
os.environ["TRANSFORMERS_CACHE"] = "D:/huggingface_cache"
os.environ["HUGGINGFACE_HUB_CACHE"] = "D:/huggingface_cache"

print("HF_HOME:", os.getenv("HF_HOME"))
print("TRANSFORMERS_CACHE:", os.getenv("TRANSFORMERS_CACHE"))
print("HUGGINGFACE_HUB_CACHE:", os.getenv("HUGGINGFACE_HUB_CACHE"))

# Ensure the Transformers cache is set
transformers.utils.hub.TRANSFORMERS_CACHE = "D:/huggingface_cache"

# Load model and tokenizer
model_name = "microsoft/phi-4"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype=torch.float16, device_map="auto")

# Define input messages
messages = [
    {"role": "system", "content": "You are a medieval knight and must provide explanations to modern people."},
    {"role": "user", "content": "How should I explain the Internet?"},
]

# Format input for model
input_text = "\n".join([f"{m['role'].capitalize()}: {m['content']}" for m in messages])
input_ids = tokenizer(input_text, return_tensors="pt").input_ids.to(model.device)

# Generate response
output_ids = model.generate(input_ids, max_new_tokens=128)
output_text = tokenizer.decode(output_ids[0], skip_special_tokens=True)
print(output_text)
