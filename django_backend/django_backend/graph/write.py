from .neo import driver

def save_pre_assessment(user_id:str, level:int, risk:str):
    cypher = """
    MERGE (u:User {id:$userId})
    SET u.knowledgeLevel=$level, u.riskBucket=$risk, u.updatedAt=timestamp()
    """
    with driver.session() as s:
        s.execute_write(lambda tx: tx.run(cypher, userId=user_id, level=level, risk=risk))

def mark_completed(user_id:str, module_id:str, quiz_score=None):
    cypher = """
    MATCH (u:User {id:$userId}), (m:Module {id:$moduleId})
    MERGE (u)-[r:COMPLETED]->(m)
    ON CREATE SET r.ts=timestamp(), r.score=$quizScore
    """
    with driver.session() as s:
        s.execute_write(lambda tx: tx.run(cypher, userId=user_id, moduleId=module_id, quizScore=quiz_score))

def sync_to_graph(payload: dict):
    with driver.session() as s:
        s.run("RETURN 1") # quick connectivity check
        # User
        s.run("""
        MERGE (u:User {id:$u.id})
        SET u += $u
        """, u=payload["user"])

        # Modules
        s.run("""
        UNWIND $rows AS r
        MERGE (m:LearningModule {id:r.id})
        SET m += r
        """, rows=payload.get("modules", []))

        # Concepts
        s.run("""
        UNWIND $rows AS r
        MERGE (c:Concept {key:r.key})
        SET c += r
        """, rows=payload.get("concepts", []))

        # TEACHES
        s.run("""
        UNWIND $rows AS r
        MATCH (m:LearningModule {id:r.moduleId})
        MATCH (c:Concept {key:r.conceptKey})
        MERGE (m)-[t:TEACHES]->(c)
        SET t.strength = coalesce(r.strength, 1.0)
        """, rows=payload.get("moduleConcepts", []))

        # REQUIRES
        s.run("""
        UNWIND $rows AS r
        MATCH (m:LearningModule {id:r.moduleId})
        MATCH (p:LearningModule {id:r.requiresModuleId})
        MERGE (m)-[:REQUIRES]->(p)
        """, rows=payload.get("modulePrereqs", []))

        # STARTED
        s.run("""
        UNWIND $rows AS r
        MATCH (u:User {id:r.userId})
        MATCH (m:LearningModule {id:r.moduleId})
        WITH u,m,r WHERE r.status='started'
        MERGE (u)-[s:STARTED]->(m)
        SET s.ts = r.ts
        """, rows=payload.get("userModules", []))

        # COMPLETED (+ optional score)
        s.run("""
        UNWIND $rows AS r
        MATCH (u:User {id:r.userId})
        MATCH (m:LearningModule {id:r.moduleId})
        WITH u,m,r WHERE r.status='completed'
        MERGE (u)-[c:COMPLETED]->(m)
        SET c.ts = r.ts,
            c.score = coalesce(r.score, c.score)
        """, rows=payload.get("userModules", []))

        # KNOWS as :User-[:KNOWS {level}]->:Concept
        s.run("""
        UNWIND $rows AS r
        MATCH (u:User {id:r.userId})
        MATCH (c:Concept {key:r.conceptKey})
        MERGE (u)-[k:KNOWS]->(c)
        SET k.level = r.level,
            k.updatedAt = r.updatedAt
        """, rows=payload.get("userConcepts", []))