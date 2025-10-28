from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .neo import driver

@csrf_exempt
def recommendation(request):
    user_id = request.GET.get("userId", "u1")
    k = int(request.GET.get("k", "1"))

    cypher = """
          MATCH (u:User {id:$userId})
          MATCH (m:LearningModule)
          WHERE NOT (u)-[:COMPLETED]->(m)
          AND NOT (u)-[:STARTED]->(m)

          OPTIONAL MATCH (m)-[t:TEACHES]->(c:Concept)
          OPTIONAL MATCH (u)-[kn:KNOWS]->(c)
          WITH u,m,c,kn,
               coalesce(u.overalKnowledgeLevel, 1.0) AS baseLevel,
               coalesce(m.minLevel, 1.0) AS mDiff,
               coalesce(u.riskScore, 5.0) AS userRisk,
               coalesce(m.riskTag, 'low') AS modRisk

          // per-concept effective level = max(baseLevel, kn.level)
          WITH u,m,modRisk,userRisk,mDiff,baseLevel,c,kn,
               CASE WHEN kn IS NULL OR kn.level < baseLevel THEN baseLevel ELSE kn.level END AS effLevelPerConcept
          WITH u,m,modRisk,userRisk,mDiff,baseLevel,
               collect(effLevelPerConcept) AS effLevels,
               collect(c) AS concepts,
               sum(CASE WHEN kn IS NULL THEN 0 ELSE 1 END) AS knownConcepts

          // aggregate effective level across concepts (avg); if no concepts, use baseLevel
          WITH u,m,modRisk,userRisk,mDiff,baseLevel,concepts,knownConcepts,
               (CASE WHEN size(effLevels) > 0
                    THEN reduce(s=0.0, x IN effLevels | s + x) / toFloat(size(effLevels))
                    ELSE baseLevel END) AS effLevel,
               size(concepts) AS totalConcepts

          // compute gap fit
          WITH u,m,modRisk,userRisk,totalConcepts,knownConcepts,
               1.0 / (1.0 + abs(mDiff - effLevel)) AS gapFit

          // collect prerequisites first
          OPTIONAL MATCH (m)-[:REQUIRES]->(p:LearningModule)
          WITH u,m,modRisk,userRisk,gapFit,totalConcepts,knownConcepts, collect(p) AS prereqs

          // now count how many of those prereqs the user completed
          OPTIONAL MATCH (u)-[:COMPLETED]->(cp:LearningModule)
          WHERE cp IN prereqs
          WITH u,m,modRisk,userRisk,gapFit,totalConcepts,knownConcepts,
               size(prereqs) AS totalReq,
               count(cp) AS doneReq

          WITH u,m,modRisk,userRisk,gapFit,totalConcepts,knownConcepts,totalReq,doneReq,
               (CASE WHEN totalReq = 0 THEN 1.0 ELSE toFloat(doneReq)/toFloat(totalReq) END) AS prereqScore

          // risk fit (user 1..10 vs target per riskTag)
          WITH u,m,gapFit,prereqScore,totalConcepts,knownConcepts,userRisk,modRisk,
               CASE modRisk WHEN 'low' THEN 3.0 WHEN 'medium' THEN 6.0 ELSE 8.0 END AS targetRisk
          WITH u,m,gapFit,prereqScore,totalConcepts,knownConcepts,userRisk,targetRisk,
               (1.0 - (abs(userRisk - targetRisk) / 9.0)) AS riskFit

          // holdings = share of concepts already known; default 0.5 if no concepts
          WITH m,gapFit,prereqScore,riskFit,totalConcepts,knownConcepts,
               (CASE WHEN totalConcepts=0 THEN 0.5 ELSE toFloat(knownConcepts)/toFloat(totalConcepts) END) AS holdings

          WITH m,gapFit,prereqScore,riskFit,holdings,
               0.55*gapFit + 0.25*prereqScore + 0.15*riskFit + 0.05*holdings AS finalScore

          RETURN m{.id, .title, .description, .timeEstimate, .minLevel, .riskTag} AS module, finalScore
          ORDER BY finalScore DESC, module.minLevel ASC, module.title ASC
          LIMIT $k
          """

    with driver.session() as s:
        rows = s.run(cypher, userId=user_id, k=k).data()
    return JsonResponse({"ok": True, "items": rows})
