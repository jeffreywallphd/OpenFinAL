Oct 16, 2025 9:00 AM

# BA5200 Setup Local LLM

# 1\. Download the backend file and view file

1. Download the two files shared 

   * **chatbot\_backend.py**

     \# A simple Flask backend server that loads a fine-tuned Hugging Face model (e.g., GPT-2) and serves a /chat endpoint for chatbot inference. The server expects a POST request with a JSON body containing a 'messages' array, and returns a generated reply. Requires transformers, torch, flask

   * **Chatbot.jsx**

     \# This file defines a React component that provides a chat UI for interacting with a local AI chatbot backend. The component manages chat state, handles user input, and communicates with a local Node.js server (chatbot\_server.js) that runs a Hugging Face Transformers model (Xenova/gpt2) for text generation. The UI displays the chat history and allows the user to send messages and receive AI-generated replies.

2. Place the “**chatbot\_backend.py**” in the correct directory

   * Create the folder “\\backend” under “.\\OpenFinAL”

   * Place “chatbot\_backend.py” under the folder

     “.\\OpenFinAL\\backend”

3. Place the “**Chatbot.jsx**” in the correct directory

   * Go to “.\\OpenFinAL\\open-fin-al\\src\\View”

   * Create a “\\backup” folder

   * Drag the original “Chatbot.jsx” to \\backup to avoid overwriting

   * Place “Chatbot.jsx” in “.\\OpenFinAL\\open-fin-al\\src\\View”

# 2\. Set up backend required packages

1. Go to “.\\OpenFinAL\\backend”, right click on the white space, open CMD via “Open in Terminal”

2. Activate your AI chatbot virtual environment (a Python 3.11 environment you created during setup of the Django backend)

3. Install the "flask” and “flask-cors” packages along with any other required packages.

```shell
pip install flask
pip install flask-cors
pip install transformers
```

4. Run “chatbot\_backend.py”

```shell
python chatbot_backend.py
```

5. Open “".\\OpenFinAL\\open-fin-al\\src\\[main.js](http://main.js)"

   * Add “ [http://localhost:5000](http://localhost:5000)” in line “connect-src 'self' [http://localhost:3001](http://localhost:3001);\`”

Original version

```javascript
connect-src 'self' http://localhost:3001;`
```

Please update to:

```javascript
connect-src 'self' http://localhost:3001 http://localhost:5000;`
```

# 3\. Restart the computer and program

1. Restart your computer

2. Go to “.\\OpenFinAL\\backend”, right click on the white space, open CMD via “Open in Terminal”

3. Activate your AI chatbot virtual environment (a Python 3.11 environment you created during setup of the Django backend)

4. Run “chatbot\_backend.py”

```shell
python chatbot_backend.py
```

5. Now we will start the OpenFiNAL software. Go to “.\\OpenFinAL\\open-fin-al”,  right click on the white space, open CMD via “Open in Terminal”. Start the software by 

```shell
npm start
```

