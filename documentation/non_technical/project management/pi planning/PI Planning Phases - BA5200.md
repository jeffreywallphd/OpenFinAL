**Features:** 

1. Create an AI Chat Bot Financial Specialist   
2. Develop a Graph Database  
3. Survey to Access Risk Level   
4. Create Financial Education Questionnaire   
5. Develop interface for 10K/10Q

**Phase 1: Initial steps to complete features (Sprint 3\)**

**Team 1 — AI Chat Bot** 

* Created a responsive AI chat prototype concept / UX sketch.  
* Met with **Team 2** and **Team 5** to align on data model & ER needs (note on board: “Meet with Team 2 and Team 5 to help develop ERD”).  
* **Action items captured:**  
  * Pick an AI model candidate to evaluate (candidate list started).  
  * Create a training plan outline (dataset sources, steps, metrics).

**Team 2 — Adaptive Learning**

* Completed research on graph DB options and prepared an initial schema sketch.  
* Documented core node/edge types needed for adaptive learning content and for linking 10K/10Q entities.  
* **Action items captured:**  
  * Establish catalog pages/outcomes required by consumers (to inform schema).  
  * Prepare a short list of technical options and constraints for Sprint 4\.

**Team 3 — Risk Management**

* Researched risk categories and initial question sets; drafted mock survey questions.  
* Built a wireframe of the survey UI and mapped where results will feed downstream analytics.  
* **Action items captured:**  
  * Create a mock risk survey for validation.  
  * Draft data fields and minimal ERD additions to capture responses.

**Team 4 — Financial Streamlining**

* Drafted the first pass of the financial education questionnaire items and learning objectives.  
* Built a wireframe for the questionnaire UI and outlined validation criteria.  
* **Action items captured:**  
  * Create a mock questionnaire and plan for user testing.  
  * Identify data mapping needs for integration with the graph DB (Team 2).

**Team 5 — 10k/10Q**

* Researched 10K/10Q reporting formats and the required parsing/fields.  
* Built an initial interface wireframe and defined the high-level data pipeline requirements.  
* **Action items captured:**  
  * Define the ingest pipeline and example records for Team 2 and Team 1 to review.  
  * Capture downstream UI behaviors for linking into the chatbot and learning modules.

**Cross-team notes (Sprint 3):**

* Board arrows indicate active collaboration: Team1 ↔ Team2 ↔ Team5 (ERD/data contracts), Team2 supports Teams 3 & 4 for data modeling. All teams agreed on deliverables & data shape to enable Sprint 4 planning.

**Phase 2: Next steps before implementation (Sprint 4\)**  
**Team 1 — AI Chat Bot** 

* Finalize model selection based on Sprint 3 research (note on board: “Step 1: Pick an AI model to use”).  
* Create a concrete training plan/schedule and a minimal local workflow to run experiments (note: “Step 2: Create a plan to train the model”).  
* Create a local LLM/testing setup for initial model training runs (board shows training \+ local LLM work).  
* Collaborate with Team 5 to confirm UI hooks and with Team 2 for access to ERD/data model.

**Team 2 — Adaptive Learning**

* Lock down the graph DB schema and standing queries needed by adaptive learning & chatbot flows.  
* Create a data-stream visualization and an implementation plan to stream learning/activity data into the graph (board: “Create data stream visualization” / “implement plan to stream data”).  
* Prepare example ingestion scripts and documentation for Teams 1, 3, 4\.

**Team 3 — Risk Management**

* Create the mock risk survey and interactive wireframe; iterate on question wording from Sprint 3 feedback.  
* Finalize the UI wireframe and map survey outputs to the agreed ERD/graph schema (with Team2).  
* Prepare test plan and initial validation criteria for Sprint 5 pilot.

**Team 4 — Financial Streamlining**

* Convert the mock questionnaire into a working wireframe and simple front-end prototype (no full backend yet).  
* Confirm data fields and mapping to the graph DB and survey outputs (coordinate with Team2 & Team3).  
* Define acceptance criteria and end-to-end flow for the pilot.

**Team 5 — 10k/10q**

* Build the data pipeline proof-of-concept (parsers, minimal ETL) and a working UI mock that demonstrates expected end-user flows.  
* Prep a PR-ready branch and documentation for Sprint 5 merge attempts (board shows “create pipeline” / “prepare for PR”).  
* Coordinate with Team2 on ingestion and Team1 on any chatbot-accessible endpoints.

**Cross-team notes (Sprint 4):**

* Teams finish artifacts needed for implementation: training plan & local model (Team1), graph schema & stream plan (Team2), survey & questionnaire wireframes (Teams 3 & 4), and ETL/interface POC (Team5).  
* The board shows arrows where Teams 1,2,5 iterate together on data contracts and where Teams 2–4 align on schema for analytics.

**Phase 3: Implementation steps broken down (Sprint 5\)**  
**Team 1 — AI Chat Bot** 

* Implement model training runs and begin fine-tuning selected AI model (board: train AI model; create local LLM).  
* Integrate the selected/trained model into the chatbot front-end; enable fine-tuning UI flows.  
* Open PRs for chatbot backend/frontend; work with Team2 & Team5 to consume ERD/data endpoints.  
* Acceptance goal: Chatbot can answer basic financial specialist queries and call graph-backed lookups.

**Team 2 — Adaptive Learning**

* Implement the graph DB on a staging environment with real example data from Team5 ingestion.  
* Add learning modules and populate nodes/edges needed for adaptive learning (board: “Adding learning modules and developing graph database”).  
* Integrate streaming ingestion pipeline; validate queries used by Team1 and Team4.  
* Acceptance goal: Graph DB supports lookup/relations used by chatbot and learning modules.

**Team 3 — Risk Management**

* Implement survey front-end and backend storage, run a pilot round to collect test data.  
* Merge PRs and address integration feedback; ensure survey results write to the graph DB per the agreed mapping.  
* Acceptance goal: Functional survey with stored responses and analytical export.

**Team 4 — Financial Streamlining**

* Implement the questionnaire prototype and integrate with the graph DB for progress tracking.  
* Run usability checks and finalize UI/UX changes.  
* Acceptance goal: Questionnaire stores results, and learning progress is visible in the graph.

**Team 5 — 10k/10q**

* Finalize pipeline and push PRs to merge parsing/ingest code into the team branch (board: “Push to make a PR to be reviewed in the team branch / continue implementation”).  
* Integrate parsed 10K/10Q data into the graph DB and validate with Team2/Team1 workflows.  
* Acceptance goal: 10K/10Q content is searchable and linkable from chatbot and learning modules.

**Cross-team notes (Sprint 5):**

* Board shows heavy integration activity: PRs, pr review, and fixes. Teams jointly validate end-to-end flows: survey → graph DB → chatbot; 10K ingest → graph DB → UI.  
* Goal for Sprint 5 is “have functioning X by the beginning/end of Sprint 5” for each feature (survey, questionnaire, chatbot integration, graph DB populated, 10K interface).

**Phase 4: Documentation clean-up (Final Sprint)**  
**Team 1 — AI Chat Bot** 

* Finalize technical documentation for model selection, training experiments, and how to re-run fine-tuning.  
* Add README for chatbot repo, deployment steps, and troubleshooting notes.

**Team 2 — Adaptive Learning**

* Document graph schema, ingestion pipeline, sample queries, and admin/maintenance tasks.  
* Create a short “how-to” for other teams to add nodes/edges and to onboard new dataset types.  
* Contribute diagrams

**Team 3 — Risk Management**

* Clean up survey documentation, sample responses, and mapping to taxonomy/graph.  
* Record acceptance testing results and any known limitations.  
* Add user guide and presentation notes.

**Team 4 — Financial Streamlining**

* Document questionnaire logic, scoring rules, and how it ties into adaptive learning.  
* Provide export format and integration notes for analytics.  
* Contribute to the final report & deliverable deck.

**Team 5 — 10k/10q**

* Finalize documentation for ETL/parsing, data schema mapping, and how to add new filings.  
* Provide deployment/runbook and sample dataset for demos.  
* Add demo materials and slides to the final presentation.

**Final deliverables (across teams):**

* Complete Final Report and Presentation (one consolidated document and a slide deck).  
* All teams: push final docs to team folders, add README and onboarding notes, and reorganize content as the board indicates (“Add work to team folder, help reorganize and update content”).  
