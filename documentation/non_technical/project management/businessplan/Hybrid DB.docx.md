# **Adaptive Learning Graph Database (Final Hybrid Architecture Version)**

Integration of SQLite and Neo4j for Personalized Learning Recommendation

This document defines the schema and logic of the adaptive learning knowledge graph (Neo4j) that works in combination with a relational database (SQLite). SQLite manages user and module records, while Neo4j stores their semantic relationships for recommendation, reasoning, and analytics.

## **1\) Overall Architecture**

| Layer | Technology | Purpose |
| :---- | :---- | :---- |
| Transactional Layer | SQLite | Stores core entities (User, Module, Concept table references, completion history, assessments, portfolio data). Acts as the single source of truth. |
| Knowledge Graph Layer | Neo4j | Stores interconnected entities (User, Module, Concept, Stock, etc.), enabling reasoning about learning paths, prerequisites, and concept relationships. |
| Integration Layer (Sync / API) | Django backend | Syncs data between SQLite and Neo4j via the graph/ module (e.g., write.py, read.py, neo.py). Responsible for ETL, updates, and recommendation queries. |

## **2\) Node Types (in Neo4j)**

Defines the entities represented as nodes in the Neo4j graph, synced from SQLite data.

| Label | Description | Key Properties |
| :---- | :---- | :---- |
| User | Represents each learner; mirrored from SQLite user table | id, name, email, overallKnowledgeLevel, riskLevel, createdAt |
| Module | Learning unit/course; created from SQLite module table | id, name, conceptKey, difficulty, estMins, createdAt |
| Concept | Abstract topic that modules teach | key, name, domain |
| Portfolio | User’s investment portfolio (optional) | id, name, createdAt |
| Stock | Financial instrument related to a concept | ticker, name, sector, volatility |

Removed nodes: Assessment and RiskProfile → Their data lives as attributes inside User records in SQLite and are copied to Neo4j.

## **3\) Relationship Types**

| Relationship | From → To | Meaning | Key Properties |
| :---- | :---- | :---- | :---- |
| COMPLETED | User → Module | User finished a module | ts, score |
| STARTED | User → Module | User started a module | ts |
| RECOMMENDED | User → Module | System-generated recommendation | score, reason, at |
| REQUIRES | Module → Module | Indicates prerequisite relationship | \- |
| TEACHES | Module → Concept | Indicates which concept a module teaches | strength |
| RELATED\_TO | Concept ↔ Concept | Concept similarity or dependency | w |
| OWNS | User → Portfolio | Portfolio ownership | createdAt |
| CONTAINS | Portfolio → Stock | Portfolio holdings | weight |
| RELATES\_TO | Stock → Concept | Stock–concept relevance | relevance |

## **4\) Knowledge Storage and Sync Logic**

SQLite is the authoritative source for transactional data. Each user has a JSON field named conceptLevels representing knowledge per concept. This is passed to Neo4j at runtime for reasoning.

Example of conceptLevels in SQLite:  
{ 'stocks': 2, 'options': 1, 'diversification': 3 }

Neo4j mirrors only semantic relationships. A Django process syncs data between SQLite and Neo4j using MERGE queries.

Optional: You can represent concept mastery inside Neo4j with (:User)-\[:KNOWS {level:int}\]-\>(:Concept) edges for visualization.

## **5\) Learning Logic: Boolean Readiness**

A user is ready for a module if user.conceptLevel\[conceptKey\] ≥ module.difficulty and all prerequisites (REQUIRES) are satisfied. This replaces distance-based scoring and ensures progression only through mastered concepts.

## **6\) Cypher Query — Recommendation Generation**

Example Cypher query using conceptLevels passed from SQLite as parameters:

MATCH (u:User {id:$userId})  
MATCH (m:Module)  
WHERE NOT EXISTS { (u)-\[:COMPLETED\]-\>(m) }  
WITH u, m, coalesce($conceptLevels\[m.conceptKey\], $fallbackOverall) AS userLevel  
WITH u, m, CASE WHEN userLevel \>= coalesce(m.difficulty,1) THEN 1 ELSE 0 END AS ready  
OPTIONAL MATCH (m)-\[:REQUIRES\]-\>(pm:Module)  
WITH u, m, ready, COLLECT(pm) AS prereqMods  
WITH u, m, ready,  
     CASE WHEN SIZE(prereqMods)=0 OR ALL(pm IN prereqMods WHERE EXISTS { (u)-\[:COMPLETED\]-\>(pm) })  
     THEN 1 ELSE 0 END AS prereqOK  
WHERE ready \= 1 AND prereqOK \= 1  
RETURN m.id AS moduleId, m.name AS moduleName, m.conceptKey AS conceptKey, m.difficulty AS difficulty, m.estMins AS estMins  
ORDER BY m.difficulty DESC, m.estMins ASC  
LIMIT $maxCount;

## **7\) Summary**

SQLite stores all user and concept-level data (conceptLevels, overallKnowledgeLevel, riskLevel). Neo4j holds nodes and relationships for reasoning. The integration via Django ensures consistency and enables adaptive recommendations.