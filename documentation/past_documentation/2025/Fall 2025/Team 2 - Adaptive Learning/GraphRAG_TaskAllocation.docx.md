# GraphRAG Development Task Allocation

This document outlines the steps and deliverables for each team member in developing the GraphRAG system for the adaptive learning software. Tasks are divided so they can be developed in parallel.

# **Person A – Graph & Data (ETL \+ Neo4j)**

Goal: Project SQLite → Neo4j; expose Cypher queries for the recommender.

Steps:  
1\. Write \`etl/etl.py\` to upsert Users, Modules, Concepts, Outcomes, Assessments, and relationships into Neo4j.  
2\. Create \`cypher/queries.cypher\` with reusable Cypher queries (frontier, missing prereqs, candidates).  
3\. Create test data \`tests/neo4j\_fixtures.cypher\` with a small seed dataset.  
4\. Ensure node keys and edge types follow the agreed schema.  
Deliverables: \`etl.py\`, \`queries.cypher\`, \`neo4j\_fixtures.cypher\`.

# **Person B – Vector Store & Embeddings**

Goal: Chunk lesson text, create embeddings, and expose a search function.

Steps:  
1\. Implement \`vector/build\_index.py\` to chunk text, embed with Sentence-Transformers, and save FAISS index.  
2\. Implement \`vector/search.py\` with function \`search(query, k, whitelist\_node\_ids=None)\`.  
3\. Provide sample index and metadata: \`data/faiss.index\`, \`data/chunks.json\`.  
Deliverables: \`build\_index.py\`, \`search.py\`, FAISS index \+ metadata file.

# **Person C – LLM Adapter (Ollama now, Hosted later)**

Goal: Provide a swappable interface for local Ollama and hosted LLM.

Steps:  
1\. Implement \`llm/llm\_client.py\` with classes \`OllamaClient\`, \`HostedClient\`, and function \`get\_llm()\`.  
2\. Create prompt templates: \`prompts/system.txt\`, \`prompts/explain.txt\`.  
3\. Provide a \`FakeClient\` for local testing without a model.  
Deliverables: \`llm\_client.py\`, prompt files, FakeClient.

# **Person D – GraphRAG Orchestrator (API)**

Goal: Integrate Graph, Vector, and LLM into API endpoints.

Steps:  
1\. Implement \`api/service.py\` using FastAPI.  
   \- Endpoint \`POST /explain {user\_id, question}\` → {answer, citations}.  
   \- Endpoint \`GET /recommendations?user\_id=...\` → JSON list of recommended modules.  
2\. Use Person A’s Cypher queries and Person B’s \`search()\` function.  
3\. Call LLM through Person C’s \`get\_llm()\`.  
4\. Ensure output follows the agreed schema.  
Deliverables: \`service.py\`, supporting modules (\`graph\_scope.py\`, \`retriever.py\`, \`schemas.py\`).

# **Person E – Frontend/UX (Learn Tab Integration)**

Goal: Display recommendations and explanations in the existing Learn tab.

Steps:  
1\. Add a 'Recommended for you' section with lesson cards (title, time, difficulty, badges, Start button, Why this?).  
2\. Build 'Why this?' drawer showing explanation, reasons, and citations.  
3\. Add visual states on all lessons (Recommended, Prereq needed, Quick win, etc.).  
4\. First develop against mock JSON (\`ui/mock\_recommendations.json\`), then connect to live API.  
Deliverables: Updated Learn tab UI with recommendations integration.

# **Summary**

By splitting tasks into Graph/Data, Vector Store, LLM Adapter, API, and Frontend, the team can work in parallel. Interfaces are defined so each person can develop and test independently using fixtures or mock data.
