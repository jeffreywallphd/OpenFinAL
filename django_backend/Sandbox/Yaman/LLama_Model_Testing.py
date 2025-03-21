import transformers
import torch
import os
from huggingface_hub import login

login("#")
# Don't forget to remove the Key when uploading to GitHub

os.environ["HF_HOME"] = "D:/huggingface_cache" 
os.environ["TRANSFORMERS_CACHE"] = "D:/huggingface_cache"
os.environ["HUGGINGFACE_HUB_CACHE"] = "D:/huggingface_cache"

print("HF_HOME:", os.getenv("HF_HOME"))
print("TRANSFORMERS_CACHE:", os.getenv("TRANSFORMERS_CACHE"))
print("HUGGINGFACE_HUB_CACHE:", os.getenv("HUGGINGFACE_HUB_CACHE"))

transformers.utils.hub.TRANSFORMERS_CACHE = "D:/huggingface_cache"

model_id = "google/gemma-3-12b-it"

pipeline = transformers.pipeline(
    "text-generation", model=model_id, model_kwargs={"torch_dtype": torch.bfloat16}, device="cuda", cache_dir="D:/huggingface_cache"
)


