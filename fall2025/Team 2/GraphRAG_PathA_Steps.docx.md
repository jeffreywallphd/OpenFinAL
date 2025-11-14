# GraphRAG Setup with LLaMA (Path A)

# **0\) Overview**

In Path A, you will run the system locally using:  
\- LLaMA via Ollama for the LLM  
\- Neo4j (via Docker) as the Graph Database  
\- FAISS as the Vector Store  
\- FastAPI as the service layer

SQLite remains your operational database. ETL scripts will copy data into Neo4j and FAISS.

# **1\) Install and Run LLaMA (Ollama)**

1\. Install Ollama from https://ollama.com/download (choose Windows/Mac/Linux).  
2\. After installation, open VS Code → Terminal and type:

   ollama pull llama3:8b-instruct  
   ollama run llama3:8b-instruct "Say hello in one sentence."

3\. This will download and run the LLaMA model locally. The Ollama API is now at http://localhost:11434.

# **2\) Start Neo4j**

1\. Install Docker Desktop and ensure it is running.  
2\. In VS Code terminal, run:

   docker run \-d \--name neo4j \-p 7474:7474 \-p 7687:7687 \-e NEO4J\_AUTH=neo4j/testpass neo4j:5.22

3\. Open your browser at http://localhost:7474 to access Neo4j Browser.  
4\. Create schema constraints in the Neo4j Browser (not VS Code terminal):

   CREATE CONSTRAINT user\_id IF NOT EXISTS FOR (u:User) REQUIRE u.user\_id IS UNIQUE;  
   CREATE CONSTRAINT concept\_id IF NOT EXISTS FOR (c:Concept) REQUIRE c.cid IS UNIQUE;  
   CREATE CONSTRAINT module\_id IF NOT EXISTS FOR (m:Module) REQUIRE m.mid IS UNIQUE;  
   CREATE CONSTRAINT outcome\_id IF NOT EXISTS FOR (o:Outcome) REQUIRE o.oid IS UNIQUE;  
   CREATE CONSTRAINT assess\_id IF NOT EXISTS FOR (a:Assessment) REQUIRE a.aid IS UNIQUE;

# **3\) Python Environment and Dependencies**

1\. In VS Code terminal, create a virtual environment:

   python \-m venv venv  
   .\\venv\\Scripts\\Activate.ps1   (on Windows PowerShell)  
   \# If blocked, run: Set-ExecutionPolicy \-Scope Process \-ExecutionPolicy Bypass

2\. Install dependencies:

   pip install fastapi uvicorn neo4j faiss-cpu numpy pandas sentence-transformers pydantic python-dotenv requests

# **4\) ETL Script (SQLite → Neo4j \+ FAISS)**

1\. Create a new file \`etl.py\` in VS Code and paste the ETL script provided.  
   \- It reads modules/concepts from your SQLite database.  
   \- Inserts them into Neo4j.  
   \- Creates embeddings of lesson text and saves them into FAISS.  
2\. Run the script:

   python etl.py

# **5\) GraphRAG Service (FastAPI)**

1\. Create a new file \`service.py\` in VS Code and paste the service code provided.  
   \- It connects to Neo4j.  
   \- Loads FAISS embeddings.  
   \- Accepts user questions via \`/explain\` endpoint.  
   \- Calls LLaMA via Ollama to generate answers.  
2\. Run the service:

   uvicorn service:app \--reload \--port 8000

3\. Test with curl or any HTTP client:

   curl \-X POST http://localhost:8000/explain \\  
        \-H "Content-Type: application/json" \\  
        \-d '{"user\_id":"ali","question":"I struggle with Bayesian updates"}'

# **6\) Next Steps**

1\. Update mastery edges in Neo4j after assessments.  
2\. Extend ETL to include more data tables.  
3\. Enhance LLaMA prompts to generate structured recommendations.  
4\. Add a UI panel to show 'Why this recommendation' with graph context and citations.