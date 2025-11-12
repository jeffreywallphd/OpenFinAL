from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

###  NEW: Import MySQL connector to connect Flask → MySQL
import mysql.connector

### NEW: Load variables from .env into the environment
from dotenv import load_dotenv
import os
load_dotenv()

# -------------------- MODEL SETUP --------------------
# MODEL_DIR = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

MODEL_DIR = "models/TinyLlama-1.1B-Chat-v1.0/checkpoint-730"

torch_device = "cuda" if torch.cuda.is_available() else "cpu"
tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
model = AutoModelForCausalLM.from_pretrained(MODEL_DIR).to(torch_device)
# -----------------------------------------------------

# -------------------- FLASK SETUP --------------------
app = Flask(__name__)
CORS(app, resources={r"/chat": {"origins": "http://localhost:3000"}}, supports_credentials=True)
# -----------------------------------------------------

### NEW: MySQL database configuration
db_config = {
    'host': os.getenv("DATABASE_HOST"),            # Get MySQL host (localhost if local)
    'user': os.getenv("DATABASE_USER"),            # Get MySQL username
    'password': os.getenv("DATABASE_PASSWORD"),    # Get MySQL password
    'database': os.getenv("DATABASE_NAME")         # Get MySQL schema name
}

### NEW: Function to create a database connection
def get_db_connection():
    conn = mysql.connector.connect(**db_config)
    return conn
# -----------------------------------------------------

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True)
    messages = data.get("messages", [])
    user_message = messages[-1]["content"] if messages else ""

    if not user_message:
        return jsonify({"reply": "Please enter a message."})

    # ---------------- MODEL GENERATION ----------------
    messages = [{"role": "user", "content": user_message}]
    inputs = tokenizer.apply_chat_template(
        messages,
        add_generation_prompt=True,
        tokenize=True,
        return_dict=True,
        return_tensors="pt",
    ).to(model.device)

    outputs = model.generate(**inputs, max_new_tokens=100)
    reply = tokenizer.decode(outputs[0][inputs["input_ids"].shape[-1]:])
    # --------------------------------------------------

    ###  NEW: Save both question and answer to MySQL
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Find next conversation_id for this session
        cursor.execute("SELECT COUNT(*) FROM ChatSession WHERE session_id = 1")
        conversation_id = cursor.fetchone()[0] + 1

        # Insert user's question
        cursor.execute(
            "INSERT INTO ChatSession (session_id, conversation_id, qna, message) VALUES (%s, %s, %s, %s)",
            (1, conversation_id, 'Q', user_message)
        )

        # Insert chatbot's reply
        cursor.execute(
            "INSERT INTO ChatSession (session_id, conversation_id, qna, message) VALUES (%s, %s, %s, %s)",
            (1, conversation_id + 1, 'A', reply)
        )

        conn.commit()
        cursor.close()
        conn.close()

    except Exception as e:
        print(" Database error:", e)
    ###  END NEW DATABASE SECTION --------------------

    return jsonify({"reply": reply})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
