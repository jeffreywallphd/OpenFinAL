# graph/read.py
from .neo import driver

def get_recommendations(user_id: str, max_count: int = 5):
    weights = {"gap": 0.55, "prereq": 0.25, "risk": 0.15, "holdings": 0.05}
    sweet   = {"delta": 1.0, "sharpness": 1.0}

    cypher = """
    MATCH (u:User {id:$userId})
    MATCH (m:LearningModule)
    WHERE NOT EXISTS { (u)-[:COMPLETED]->(m) }
    WITH u,m,abs(coalesce(m.difficulty,1)-(coalesce(u.knowledgeLevel,1)+$sweet.delta)) AS diffGap
    WITH u,m,1.0/(1.0+$sweet.sharpness*diffGap) AS gapFitRaw
    WITH u,m,gapFitRaw,
         CASE WHEN coalesce(u.knowledgeLevel,1) >= coalesce(m.minLevel,1) THEN 1.0 ELSE 0.0 END AS levelOK
    OPTIONAL MATCH (m)-[:REQUIRES]->(pm:Module)
    WITH u,m,gapFitRaw,levelOK,COLLECT(pm) AS prereqMods
    WITH u,m,gapFitRaw,
         CASE WHEN levelOK=1.0 AND (SIZE(prereqMods)=0 OR ALL(pm IN prereqMods WHERE EXISTS{(u)-[:COMPLETED]->(pm)}))
         THEN 1.0 ELSE 0.0 END AS prereqOK
    WITH u,m,gapFitRaw,prereqOK,
         coalesce(m.riskTag,'MED') AS mRisk, coalesce(u.riskBucket,'MED') AS uRisk
    WITH u,m,gapFitRaw,prereqOK,
         CASE WHEN mRisk=uRisk THEN 1.0
              WHEN (uRisk='HIGH' AND mRisk='MED') OR (uRisk='MED' AND mRisk='LOW') THEN 0.6
              ELSE 0.3 END AS riskFit
    WITH m,prereqOK,riskFit,
         CASE WHEN gapFitRaw>1 THEN 1.0 ELSE gapFitRaw END AS gapFit,
         $weights AS W
    WHERE prereqOK=1.0
    RETURN m.id AS id, m.name AS name, m.topic AS topic,
           (W.gap*gapFit + W.prereq*prereqOK + W.risk*riskFit) AS score
    ORDER BY score DESC
    LIMIT $maxCount
    """

    def _run(tx):
        # materialize rows while the tx/session is open
        return tx.run(
            cypher,
            userId=str(user_id),
            maxCount=max_count,
            weights=weights,
            sweet=sweet
        ).data()

    # target Aura's default DB explicitly
    with driver.session(database="neo4j") as s:
        rows = s.execute_read(_run)

    return rows

