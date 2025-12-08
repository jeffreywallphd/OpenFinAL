Adaptive Learning System — Backend \+ Frontend  Integration 

This document provides a complete overview of the Adaptive Learning branch, covering  backend (Django \+ Neo4j) and frontend (React/Electron \+ SQLite) implementations. It is  intended to help future teams understand, maintain, and extend the system. 

1\. System Overview 

This branch enables a full graph-based adaptive learning workflow for OpenFinAL. 

**Key capabilities added:** \- Personalized learning recommendations powered by Neo4j. \- User learning progress tracking: STARTED, COMPLETED, and KNOWS edges. \- Full  synchronization pipeline between SQLite (frontend) and Neo4j (backend). \- Responsive  slideshow viewer for learning modules (PDF/HTML/audio). 

2\. Backend Implementation (Django) 

The backend additions live in: 

django\_backend/django\_backend/graph/ 

This folder handles Neo4j connectivity, recommendation logic, syncing, and progress  tracking. 

2.1 neo.py — Neo4j Connection Manager 

• Loads environment variables (NEO4J\_URI, NEO4J\_USER, NEO4J\_PASS). • Initializes Neo4j Aura driver. 

• Performs fail-fast connectivity check. 

• Exposes helper functions (get\_session(), close\_driver()). 

2.2 Recommendation Engine 

Two versions included: 

A) Simple model — read.py 

• Computes recommendations using gap fit, prerequisites, risk fit, and concept  familiarity.  
B) Full model — views\_recommendation.py 

• Main production recommendation logic. 

• Adds effective knowledge estimation, prerequisite coverage, concept holdings, and  risk score difference. 

• Exposes endpoint: 

GET /api/recommendation?userId=\<id\>\&k=\<count\> 

2.3 Progress Tracking: views\_progress.py 

Endpoints: 

POST /api/module/start 

POST /api/module/complete 

Both call Neo4j write operations defined in write.py. 

mark\_started(userId, moduleId) 

• Creates STARTED edge unless COMPLETED already exists. 

mark\_completed(userId, moduleId, score) 

• Only completes if score ≥ 0.70. 

• Removes STARTED, creates COMPLETED, updates KNOWS on concepts. 2.4 Full Graph Sync Pipeline: views\_sync.py 

Exposes endpoint: 

POST /api/sync 

The payload includes user, modules, module pages, concepts, prerequisites, and user  progress. 

Calls sync\_to\_graph(payload) in write.py, which merges: \- Users \- Modules \- Concepts \- TEACHES and REQUIRES relationships \- User STARTED/COMPLETED edges \- User KNOWS concept mastery 

2.5 Project-Level Django Integration 

Modifications in settings.py 

• Adds django\_backend.graph to INSTALLED\_APPS. 

• Adds CORS support. 

• Loads environment variables for Neo4j configuration. 

Modifications in urls.py 

Adds:  
path("", include("django\_backend.graph.urls"))   
path("api/assessment/", views.save\_assessment\_view) 

path("api/modules/\<id\>/complete/", views.complete\_module\_view) Modifications in views.py 

Implements: \- /api/assessment/ → saves pre-assessment profile (user level \+ risk). \- /api/modules/\<id\>/complete/ → REST-style completion endpoint. 

3\. Frontend Implementation (React/Electron) The frontend changes are located primarily in:   
src/View/LearningModule/ 

3.1 Learn.jsx — Learning Dashboard 

• Fetches top recommendation from backend. 

• Displays recommended module card. 

• Loads module list from SQLite. 

• Contains placeholder progress values (future teams must connect real progress  from backend). 

3.2 LearningModuleDetails.jsx 

• Loads module pages from SQLite. 

• Sends POST /api/module/start to backend. 

• Navigates user to slideshow. 

3.3 Slideshow Viewer 

A) SlideshowWindow.jsx 

• Displays slide window. 

• Supports audio playback. 

• Buttons: 

o **Go to Learn** 

o **Complete Module** → Calls POST /api/module/complete. 

B) Slide.jsx 

• Loads and sanitizes HTML slide content. 

• Rewrites relative asset paths. 

• Makes embedded PDFs, images, frames responsive.  
• Handles optional voiceover audio. 

3.4 SQLite Schema Extensions (schema.sql) 

Adds tables for: \- LearningModule \- LearningModulePage \- LearningModuleConcept  (concept mapping) \- ModulePrereq \- UserModule (started/completed) \- UserConcept  (knowledge graph) \- Meta (sync timestamp) 

Also seeds example modules, concepts, relationships, and pages. 

4\. End-to-End Data Flow 

SQLite (local DB) 

 │   
 └── Frontend → POST /api/sync → Django → Neo4j   
 │ 

 ├── Modules, Concepts, Prereqs   
 ├── User STARTED/COMPLETED   
 └── User KNOWS concept mastery 

Backend → GET /api/recommendation → Frontend   
Frontend → show recommended module 

User starts module → POST /api/module/start 

User completes module → POST /api/module/complete 

5\. Tasks for Future Teams 

5.1 Fix Architecture Mismatches 

• Frontend stores data in SQLite; backend uses Neo4j → unify or automate syncing. • Replace all hardcoded userId=1 with authenticated user. 

5.2 Replace Mock Progress 

• Learn.jsx uses mock progress. 

• Should read real completion from Neo4j. 

5.3 Implement Quiz-Based Completion 

• Currently completion is score-based but quizzes are not integrated. • Use LearningModuleQuiz tables.  
5.4 Add LLM Recommendation Rationale 

• Generate reason text: “Recommended because your risk profile and concept  mastery match this module.” 

5.5 Local Neo4j Deployment 

• Replace Neo4j Aura connection for offline usage. 

6\. File Index 

Backend Files 

• graph/neo.py — Neo4j driver 

• graph/read.py — Simple recommendation model 

• graph/views\_recommendation.py — Main recommendation API • graph/views\_progress.py — Start/Complete module endpoints • graph/views\_sync.py — Full graph sync 

• graph/write.py — All Neo4j write logic 

• settings.py — Registers graph module \+ CORS 

• urls.py — Connects API routes 

• views.py — Assessment \+ REST completion endpoints 

Frontend Files 

• Learn.jsx — Recommendation \+ module list 

• LearningModuleDetails.jsx — Start module 

• LearningModulePage.jsx — Passes page context 

• SlideshowWindow.jsx — Slide viewer \+ complete module 

• Slide.jsx — Loads HTML/PDF slides 

• schema.sql — Learning modules schema 

7\. Summary 

This branch introduces a complete adaptive learning layer into OpenFinAL, connecting  local module data to a cloud Neo4j graph and powering personalized recommendations.  The system is functional but requires future alignment between architectures (SQLite  vs. Neo4j), progress tracking, and quiz integration. 

Future teams can extend this foundation for: \- Complete adaptive pathways \- Concept level diagnostics \- Portfolio-based learning \- LLM-based explanation and tutoring  
This document serves as the technical reference for all changes made in this branch.
