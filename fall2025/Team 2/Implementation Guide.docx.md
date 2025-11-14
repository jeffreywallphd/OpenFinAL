# **Implementation Guide: Neo4j Graph Database Integration (Steps 1–5)**

## **Step 1\. Run Neo4j (Local or Cloud)**

Neo4j is the graph database engine that stores and manages relationships for adaptive learning. You can run it locally (for development) or use Neo4j AuraDB (for production).

Option A – Local via Docker:

* docker run \-d \--name neo4j \-p 7474:7474 \-p 7687:7687 \-e NEO4J\_AUTH=neo4j/test123 \-e NEO4J\_PLUGINS='\["apoc"\]' neo4j:5  
* Option B – Cloud (AuraDB): create an AuraDB instance and copy its URI, user, and password.

## **Step 2\. Create Constraints (Initial Migration)**

Open Neo4j Browser (http://localhost:7474) or AuraDB console and execute the following Cypher commands to create uniqueness constraints for nodes:

CREATE CONSTRAINT user\_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE;  
CREATE CONSTRAINT module\_id IF NOT EXISTS FOR (m:Module) REQUIRE m.id IS UNIQUE;  
CREATE CONSTRAINT concept\_key IF NOT EXISTS FOR (c:Concept) REQUIRE c.key IS UNIQUE;  
CREATE CONSTRAINT stock\_ticker IF NOT EXISTS FOR (s:Stock) REQUIRE s.ticker IS UNIQUE;  
CREATE CONSTRAINT portfolio\_id IF NOT EXISTS FOR (p:Portfolio) REQUIRE p.id IS UNIQUE;

## **Step 3\. Seed Initial Data**

Insert a few sample modules, concepts, and prerequisite relationships to test the database setup:

// \--- Seed Modules \----------------------------------------------------------  
UNWIND \[  
  {id:'m101', title:'Introduction to Stocks',  topic:'Stock',              difficulty:1, minLevel:1, riskTag:'LOW',  modType:'slides', timeEstimate:10, keywords:\['stocks','equities','stock market','basics'\]},  
  {id:'m102', title:'Introduction to Bonds',   topic:'Bond',               difficulty:1, minLevel:1, riskTag:'LOW',  modType:'slides', timeEstimate:10, keywords:\['bonds','fixed income','yield','coupon'\]},  
  {id:'m103', title:'Risk Free Investments',   topic:'Risk Free Investments', difficulty:1, minLevel:1, riskTag:'LOW', modType:'slides', timeEstimate:10, keywords:\['risk-free','treasuries','CDs','savings'\]},  
  {id:'m201', title:'What is stock screening?',topic:'Stock Screening',    difficulty:2, minLevel:2, riskTag:'MED',  modType:'slides', timeEstimate:10, keywords:\['stock screening','filters','factors'\]},  
  {id:'m104', title:'Basics of Blockchain',    topic:'Blockchain',         difficulty:1, minLevel:1, riskTag:'LOW',  modType:'slides', timeEstimate:10, keywords:\['blockchain','crypto basics','consensus'\]},  
  {id:'m202', title:'Blockchain (Intermediate)', topic:'Blockchain',       difficulty:2, minLevel:2, riskTag:'MED',  modType:'slides', timeEstimate:10, keywords:\['blockchain intermediate','smart contracts','tokens'\]},  
  {id:'m301', title:'Advanced Stocks',         topic:'Stock',              difficulty:3, minLevel:3, riskTag:'HIGH', modType:'slides', timeEstimate:10, keywords:\['advanced stocks','factors','options overlay'\]},  
  {id:'m105', title:'A Beginner\\'s Overview To Blockchain', topic:'Blockchain', difficulty:1, minLevel:1, riskTag:'LOW', modType:'slides', timeEstimate:10, keywords:\['blockchain beginner','wallets','blocks'\]},  
  {id:'m302', title:'Blockchain Advanced',     topic:'Blockchain',         difficulty:3, minLevel:3, riskTag:'HIGH', modType:'slides', timeEstimate:10, keywords:\['blockchain advanced','scaling','security'\]},  
  {id:'m203', title:'Intermediate Stocks',     topic:'Stock',              difficulty:2, minLevel:2, riskTag:'MED',  modType:'slides', timeEstimate:10, keywords:\['intermediate stocks','valuation','dividends'\]},  
  {id:'m100', title:'Beginner Stocks',         topic:'Stock',              difficulty:1, minLevel:1, riskTag:'LOW',  modType:'slides', timeEstimate:10, keywords:\['beginner stocks','accounts','tickers'\]}  
\] AS m  
MERGE (mod:Module {id:m.id})  
SET mod \+= m;

// \--- Create Concepts automatically from topics \-----------------------------  
MATCH (mod:Module)  
MERGE (c:Concept {key:toLower(replace(mod.topic,' ','\_')), name:mod.topic})  
MERGE (mod)-\[:TEACHES {strength:1.0}\]-\>(c);

// \--- REQUIRES (prerequisites) \----------------------------------------------  
// Stocks ladder  
MATCH (a:Module {id:'m203'}),(b:Module {id:'m101'}) MERGE (a)-\[:REQUIRES\]-\>(b);   // Intermediate Stocks requires Intro to Stocks  
MATCH (a:Module {id:'m301'}),(b:Module {id:'m203'}) MERGE (a)-\[:REQUIRES\]-\>(b);   // Advanced Stocks requires Intermediate Stocks  
MATCH (a:Module {id:'m201'}),(b:Module {id:'m101'}) MERGE (a)-\[:REQUIRES\]-\>(b);   // Screening requires Intro to Stocks  
MATCH (a:Module {id:'m100'}),(b:Module {id:'m101'}) MERGE (a)-\[:REQUIRES\]-\>(b);   // Beginner Stocks after Intro (optional link)

// Blockchain ladder  
MATCH (a:Module {id:'m202'}),(b:Module {id:'m104'}) MERGE (a)-\[:REQUIRES\]-\>(b);   // Blockchain (Intermediate) requires Basics  
MATCH (a:Module {id:'m302'}),(b:Module {id:'m202'}) MERGE (a)-\[:REQUIRES\]-\>(b);   // Blockchain Advanced requires Intermediate  
MATCH (a:Module {id:'m104'}),(b:Module {id:'m105'}) MERGE (a)-\[:REQUIRES\]-\>(b);   // Basics after Beginner Overview

## **Step 4\. Environment Variables**

Store Neo4j credentials in the project’s .env file. This allows Django to securely connect to Neo4j.

Create a .env file in AUTOPROPHET/django\_backend:

NEO4J\_URI=neo4j+ssc://404db15c.databases.neo4j.io:7687

NEO4J\_USER=neo4j

NEO4J\_PASS=MyPass

SECRET\_KEY=past from settings.py

DEBUG=True

## **Step 5\. Create Graph Folder in Django**

In your Django project structure, create a new folder named 'graph' inside django\_backend/django\_backend/.

* Folder structure:  
* django\_backend/  
  ├── manage.py  
  ├── django\_backend/  
  │   ├── settings.py  
  │   ├── urls.py  
  │   ├── wsgi.py  
  │   └── graph/  
  │       ├── \_\_init\_\_.py  
  │       ├── neo.py  
  │       ├── write.py  
  │       └── read.py

These files will contain the connection setup (neo.py), write operations (write.py), and read queries (read.py).

**Neo.py:**  
from neo4j import GraphDatabase

from dotenv import load\_dotenv

import os

\# Load .env into environment

load\_dotenv()

URI \= os.getenv("NEO4J\_URI")                     \# e.g. neo4j+s://404db15c.databases.neo4j.io:7687

USER \= os.getenv("NEO4J\_USER", "neo4j")

PWD  = os.getenv("NEO4J\_PASS")               \# \<- must match .env key

print("NEO4J\_URI \=", URI)

print("NEO4J\_USER \=", USER)

driver \= GraphDatabase.driver(URI, auth=(USER, PWD))

\# Optional: run at import to fail fast with a clear message

try:

    driver.verify\_connectivity()

except Exception as e:

    raise RuntimeError(f"Neo4j connection failed: {e}")

def get\_session():

    """Utility to get a Neo4j session"""

    return driver.session()

def close\_driver():

    """Close driver on shutdown"""

    driver.close()

**write.py:**

from .neo import driver

def save\_pre\_assessment(user\_id:str, level:int, risk:str):

    cypher \= """

    MERGE (u:User {id:$userId})

    SET u.knowledgeLevel=$level, u.riskBucket=$risk, u.updatedAt=timestamp()

    """

    with driver.session() as s:

        s.execute\_write(lambda tx: tx.run(cypher, userId=user\_id, level=level, risk=risk))

def mark\_completed(user\_id:str, module\_id:str, quiz\_score=None):

    cypher \= """

    MATCH (u:User {id:$userId}), (m:Module {id:$moduleId})

    MERGE (u)-\[r:COMPLETED\]-\>(m)

    ON CREATE SET r.ts=timestamp(), r.score=$quizScore

    """

    with driver.session() as s:

        s.execute\_write(lambda tx: tx.run(cypher, userId=user\_id, moduleId=module\_id, quizScore=quiz\_score))

**read.py:**  
\# graph/read.py

from .neo import driver

def get\_recommendations(user\_id: str, max\_count: int \= 5):

    weights \= {"gap": 0.55, "prereq": 0.25, "risk": 0.15, "holdings": 0.05}

    sweet   \= {"delta": 1.0, "sharpness": 1.0}

    cypher \= """

    MATCH (u:User {id:$userId})

    MATCH (m:Module)

    WHERE NOT EXISTS { (u)-\[:COMPLETED\]-\>(m) }

    WITH u,m,abs(coalesce(m.difficulty,1)-(coalesce(u.knowledgeLevel,1)+$sweet.delta)) AS diffGap

    WITH u,m,1.0/(1.0+$sweet.sharpness\*diffGap) AS gapFitRaw

    WITH u,m,gapFitRaw,

         CASE WHEN coalesce(u.knowledgeLevel,1) \>= coalesce(m.minLevel,1) THEN 1.0 ELSE 0.0 END AS levelOK

    OPTIONAL MATCH (m)-\[:REQUIRES\]-\>(pm:Module)

    WITH u,m,gapFitRaw,levelOK,COLLECT(pm) AS prereqMods

    WITH u,m,gapFitRaw,

         CASE WHEN levelOK=1.0 AND (SIZE(prereqMods)=0 OR ALL(pm IN prereqMods WHERE EXISTS{(u)-\[:COMPLETED\]-\>(pm)}))

         THEN 1.0 ELSE 0.0 END AS prereqOK

    WITH u,m,gapFitRaw,prereqOK,

         coalesce(m.riskTag,'MED') AS mRisk, coalesce(u.riskBucket,'MED') AS uRisk

    WITH u,m,gapFitRaw,prereqOK,

         CASE WHEN mRisk=uRisk THEN 1.0

              WHEN (uRisk='HIGH' AND mRisk='MED') OR (uRisk='MED' AND mRisk='LOW') THEN 0.6

              ELSE 0.3 END AS riskFit

    WITH m,prereqOK,riskFit,

         CASE WHEN gapFitRaw\>1 THEN 1.0 ELSE gapFitRaw END AS gapFit,

         $weights AS W

    WHERE prereqOK=1.0

    RETURN m.id AS id, m.name AS name, m.topic AS topic,

           (W.gap\*gapFit \+ W.prereq\*prereqOK \+ W.risk\*riskFit) AS score

    ORDER BY score DESC

    LIMIT $maxCount

    """

    def \_run(tx):

        \# materialize rows while the tx/session is open

        return tx.run(

            cypher,

            userId=str(user\_id),

            maxCount=max\_count,

            weights=weights,

            sweet=sweet

        ).data()

    \# target Aura's default DB explicitly

    with driver.session(database="neo4j") as s:

        rows \= s.execute\_read(\_run)

    return rows

## **Step 6\. Modify settings.py**

Added below lines:

from dotenv import load\_dotenv \#Team2

\# Load environment variables \#Team2

load\_dotenv()

\# Neo4j configuration \#Team2

NEO4J\_URI \= os.getenv("NEO4J\_URI")

NEO4J\_USER \= os.getenv("NEO4J\_USER")

NEO4J\_PASS \= os.getenv("NEO4J\_PASS")

# **Steps for Testing Neo4j Connection in Django**

Below is the complete record of steps performed to configure and test the Neo4j connection with Django backend.

## **1\. Initial Setup**

\- Opened VS Code terminal inside project folder (D:\\AutoProphet\\django\_backend).  
\- Activated virtual environment using: .\\.venv\\Scripts\\activate  
\- Installed required dependencies step-by-step:  
  pip install django  
  pip install python-decouple  
  pip install python-dotenv  
  pip install djangorestframework  
  pip install django-cors-headers  
  pip install "neo4j\>=5,\<6"  
  pip install transformers  
  pip install torch  
  pip install evaluate

## **2\. Database Configuration in settings.py**

Initially, the project was configured for MySQL. It was changed to SQLite for local testing.  
Modified DATABASES section in django\_backend/settings.py as:  
DATABASES \= {  
    'default': {  
        'ENGINE': 'django.db.backends.sqlite3',  
        'NAME': os.path.join(BASE\_DIR, 'db.sqlite3'),  
    }  
}

## **3\. Disabling Chatbot Routes**

Commented out chatbot routes from django\_backend/urls.py to prevent unrelated dependencies from loading:  
\# path('api/', include('chatbot\_be.urls')),

## **4\. Neo4j Connection Setup**

Created or modified django\_backend/graph/neo.py with working Neo4j connection code:  
from neo4j import GraphDatabase  
from dotenv import load\_dotenv  
import os

load\_dotenv()

URI \= os.getenv("NEO4J\_URI")  
USER \= os.getenv("NEO4J\_USER", "neo4j")  
PWD  \= os.getenv("NEO4J\_PASS")

driver \= GraphDatabase.driver(URI, auth=(USER, PWD))

try:  
    driver.verify\_connectivity()  
    print("Neo4j connectivity OK")  
except Exception as e:  
    raise RuntimeError(f"Neo4j connection failed: {e}")

def get\_session():  
    return driver.session(database="neo4j")

def close\_driver():  
    driver.close()

## **5\. Environment Variables**

Created a .env file in project root (D:\\AutoProphet) with these values:

NEO4J\_URI=neo4j+ssc://404db15c.databases.neo4j.io:7687  
NEO4J\_USER=neo4j  
NEO4J\_PASSW=your\_real\_password

This configuration uses encrypted connection with skip-cert-check for AuraDB (neo4j+ssc://).

## **6\. Updating read.py to Fix ResultConsumedError**

Modified django\_backend/graph/read.py to collect query results inside session context:

from .neo import driver

def get\_recommendations(user\_id: str, max\_count: int \= 5):  
    weights \= {"gap": 0.55, "prereq": 0.25, "risk": 0.15, "holdings": 0.05}  
    sweet   \= {"delta": 1.0, "sharpness": 1.0}  
    cypher \= """\<Cypher query omitted for brevity\>"""

    def \_run(tx):  
        return tx.run(  
            cypher,  
            userId=str(user\_id),  
            maxCount=max\_count,  
            weights=weights,  
            sweet=sweet  
        ).data()

    with driver.session(database="neo4j") as s:  
        rows \= s.execute\_read(\_run)

    return rows

## **7\. Running Tests**

\- Started Django server:  
  python manage.py runserver  
\- Verified successful connection: "Neo4j connectivity OK"  
\- Tested endpoints:  
  /api/assessment/?userId=1\&level=1\&risk=low  
  /api/modules/101/complete/?userId=1\&score=90  
  /api/recommendations/?userId=1  
\- Assessment and completion returned {"ok": true}  
\- Recommendations endpoint initially gave ResultConsumedError, resolved after code fix.

## **8\. Final Status**

✅ Neo4j Aura connection successful via neo4j+ssc://  
✅ Django backend functional with SQLite local DB  
✅ All three endpoints operational

