import transformers
import torch
import os
from huggingface_hub import login
from transformers import AutoTokenizer, AutoModelForCausalLM, GenerationConfig


login("#")
# Don't forget to remove the Key when uploading to GitHub

os.environ["HF_HOME"] = "D:/huggingface_cache" 
os.environ["TRANSFORMERS_CACHE"] = "D:/huggingface_cache"
os.environ["HUGGINGFACE_HUB_CACHE"] = "D:/huggingface_cache"

print("HF_HOME:", os.getenv("HF_HOME"))
print("TRANSFORMERS_CACHE:", os.getenv("TRANSFORMERS_CACHE"))
print("HUGGINGFACE_HUB_CACHE:", os.getenv("HUGGINGFACE_HUB_CACHE"))


model_name = "deepseek-ai/deepseek-llm-7b-chat"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype=torch.bfloat16, device_map="auto")
model.generation_config = GenerationConfig.from_pretrained(model_name)
model.generation_config.pad_token_id = model.generation_config.eos_token_id

prompt = f"""
        Generate {1} question-answer pairs based on the following text segment. 
        Return the result in valid JSON format as a list of objects.

        Text Segment:
        
Wikipedia is a free online encyclopedia that anyone can edit, and millions already have.

Wikipedia's purpose is to benefit readers by presenting information on all branches of knowledge. Hosted by the Wikimedia Foundation, Wikipedia consists of freely editable content, with articles that usually contain numerous links guiding readers to more information.

Written collaboratively by volunteers known as Wikipedians, Wikipedia articles can be edited by anyone with Internet access, except in limited cases in which editing is restricted to prevent disruption or vandalism. Since its creation on January 15, 2001, it has grown into the world's largest reference website, attracting over a billion visitors each month. Wikipedia currently has more than sixty-four million articles in more than 300 languages, including 6,969,912 articles in English, with 125,967 active contributors in the past month.

Wikipedia's fundamental principles are summarized in its five pillars. While the Wikipedia community has developed many policies and guidelines, new editors do not need to be familiar with them before they start contributing.

Anyone can edit Wikipedia's text, data, references, and images. The quality of content is more important than the expertise of who contributes it. Wikipedia's content must conform with its policies, including being verifiable by published reliable sources. Contributions based on personal opinions, beliefs, or personal experiences, unreviewed research, libellous material, and copyright violations are not allowed, and will not remain. Wikipedia's software makes it easy to reverse errors, and experienced editors watch and patrol bad edits.

Wikipedia differs from printed references in important ways. Anyone can instantly improve it, add quality information, remove misinformation, and fix errors and vandalism. Since Wikipedia is continually updated, encyclopedic articles on major news events appear within minutes. 

        Response Format:
        [
            {{"question": "What is ...?", "answer": "The answer is ..."}},
            {{"question": "How does ... work?", "answer": "It works by ..."}}
        ]

        Question answers should be at least 250 words long.

        Do NOT include any explanation or pre-amble before or after the JSON output.
        Return ONLY valid JSON output.  

        Answer:
        """

messages = [
    {"role": "user", "content": prompt}
]
input_tensor = tokenizer.apply_chat_template(messages, add_generation_prompt=True, return_tensors="pt")
outputs = model.generate(input_tensor.to(model.device), max_new_tokens=100)

result = tokenizer.decode(outputs[0][input_tensor.shape[1]:], skip_special_tokens=True)
print(result)