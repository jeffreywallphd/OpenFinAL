from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .neo import driver
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def recommendation(request):
    print("HIT /api/recommendation", request.GET.dict())
    user_id = request.GET.get("userId", 1)
    k = int(request.GET.get("k", "1"))

    cypher = """
          MATCH (u:User) WHERE toString(u.id) = toString($userId)
          MATCH (m:LearningModule)

          // Exclude modules already completed (works even if COMPLETED doesn't exist yet)
          OPTIONAL MATCH (u)-[rcm]->(m)
          WHERE type(rcm) = 'COMPLETED'
          WITH u, m, rcm
          WHERE rcm IS NULL

          // TEACHES / KNOWS (safe if these rel types don't exist yet)
          OPTIONAL MATCH (m)-[t]->(c:Concept)
          WHERE type(t) = 'TEACHES'
          OPTIONAL MATCH (u)-[kn]->(c)
          WHERE type(kn) = 'KNOWS'

          // Base values (assume integers already)
          WITH u, m, c, kn,
               coalesce(u.overalKnowledgeLevel, 1) AS baseLevel,   // int 1..?
               coalesce(m.minLevel, 1)             AS mMinLevel,   // int
               coalesce(u.riskScore, 2)            AS userRiskCat, // 1..3 (default medium=2)
               coalesce(m.riskTag, 2)              AS modRiskCat   // 1..3

          // Effective level per concept (fallback to base if no KNOWS or no level)
          WITH u, m, baseLevel, mMinLevel, userRiskCat, modRiskCat, c,
               CASE
               WHEN kn IS NULL OR coalesce(kn.level, -1) < baseLevel THEN baseLevel
               ELSE kn.level
               END AS effLevelPerConcept
          WITH u, m, baseLevel, mMinLevel, userRiskCat, modRiskCat,
               collect(effLevelPerConcept) AS effLevels,
               [x IN collect(c) WHERE x IS NOT NULL] AS taughtConcepts

          // Aggregate effective level (avg over taught; else base)
          WITH u, m, userRiskCat, modRiskCat, taughtConcepts, mMinLevel,
               CASE WHEN size(effLevels) > 0
                    THEN reduce(s=0.0, x IN effLevels | s + x) / size(effLevels)
                    ELSE baseLevel END AS effLevel,
               size(taughtConcepts) AS tCount

          // Gap fit
          WITH u, m, userRiskCat, modRiskCat, taughtConcepts, tCount,
               1.0 / (1.0 + abs(mMinLevel - effLevel)) AS gapFit

          // Prerequisites (safe if REQUIRES doesn't exist)
          OPTIONAL MATCH (m)-[rq]->(p:LearningModule)
          WHERE type(rq) = 'REQUIRES'
          WITH u, m, userRiskCat, modRiskCat, gapFit, taughtConcepts, tCount, collect(p) AS prereqs

          // Completed prereqs (safe if COMPLETED doesn't exist)
          OPTIONAL MATCH (u)-[rcp]->(cp:LearningModule)
          WHERE type(rcp) = 'COMPLETED' AND cp IN prereqs
          WITH u, m, userRiskCat, modRiskCat, gapFit, taughtConcepts, tCount, prereqs, count(cp) AS doneReq
          WITH u, m, userRiskCat, modRiskCat, gapFit, taughtConcepts, tCount,
               CASE WHEN size(prereqs)=0 THEN 1.0 ELSE (1.0*doneReq)/size(prereqs) END AS prereqScore

          // Risk fit on 1..3 scale: 1 if equal, 0.5 if off by 1, 0 if off by 2
          WITH u, m, gapFit, prereqScore, taughtConcepts, tCount, userRiskCat, modRiskCat,
               (1.0 - (abs(userRiskCat - modRiskCat) / 2.0)) AS riskFit

          // Holdings: share of taught concepts the user knows (default 0.5 if none taught)
          OPTIONAL MATCH (u)-[k2]->(kc:Concept)
          WHERE type(k2)='KNOWS'
          WITH m, gapFit, prereqScore, riskFit, taughtConcepts, tCount, collect(DISTINCT kc) AS knownConceptsList
          WITH m, gapFit, prereqScore, riskFit, tCount,
               CASE
               WHEN tCount = 0 THEN 0.5
               ELSE (1.0 * size([x IN taughtConcepts WHERE x IN knownConceptsList])) / tCount
               END AS holdings

          // Final score
          WITH m, gapFit, prereqScore, riskFit, holdings,
               0.55*gapFit + 0.25*prereqScore + 0.15*riskFit + 0.05*holdings AS finalScore

          RETURN
          m{.id, .title, .description, .timeEstimate, .minLevel, .riskTag} AS module,
          gapFit, prereqScore, riskFit, holdings, finalScore
          ORDER BY finalScore DESC, module.minLevel ASC, module.title ASC
          LIMIT $k;
          """

    with driver.session() as s:
        logger.info("recos: userId=%s k=%s", user_id, k)
        logger.debug("cypher=\n%s", cypher)
        result = s.run(cypher, userId=user_id, k=k)
        rows = [r.data() for r in result]

    return JsonResponse({"ok": True, "items": rows})
