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
