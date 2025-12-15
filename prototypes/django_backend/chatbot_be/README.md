1. chatbot_backend.py requires a Python 3.10 environment. Install required libraries using requirments.txt

2. A .env file is required. File contains your account information (copy the information below to .env):
```text
DATABASE_NAME=chatbotDB 
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_HOST=localhost
DATABASE_PORT=
```

3. Clone the fine-tuned TinyLlama model from the HuggingFace Repository

    Temporary link: https://huggingface.co/JudyJuezhu/Fine-tuned_TinyLlama

4. Your file structure in \backend should be like:
```text
backend
│   .env
│   chatbot_backend.py
│   README.md
│   requirements.txt
└───models
    └───TinyLlama-1.1B-Chat-v1.0
        └───checkpoint-730
                config.json
                generation_config.json
                model.safetensors
                special_tokens_map.json
                tokenizer.json
                tokenizer.model
                tokenizer_config.json
```
----------------------------------------
Sprint 5
Updates
- fine-tuned model path
- connect to MySQL chatbotDB database

Sprint 5
To Do:
- Create MySQL database when first time run backend.py
- Extract MySQL password from .env file.
- Reread chat history

