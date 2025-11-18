from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json, time, logging
from .write import sync_to_graph
log = logging.getLogger(__name__)
@csrf_exempt
def sync(request):
    if request.method != "POST":
        return JsonResponse({"ok": False, "error": "POST only"}, status=405)
    payload = json.loads(request.body.decode("utf-8"))
    # DEBUG: show what arrived
    counts = {
        "has_user": bool(payload.get("user")),
        "modules": len(payload.get("modules", [])),
        "modulePages": len(payload.get("modulePages", [])),
        "concepts": len(payload.get("concepts", [])),
        "moduleConcepts": len(payload.get("moduleConcepts", [])),
        "userModules": len(payload.get("userModules", [])),
        "userConcepts": len(payload.get("userConcepts", [])),
        "modulePrereqs": len(payload.get("modulePrereqs", [])),
    }
    print("SYNC COUNTS:", counts)  # will show in Django terminal

    from .write import sync_to_graph
    try:
        sync_to_graph(payload)
        return JsonResponse({"ok": True, "counts": counts, "newLastSyncTs": int(time.time()*1000)})
    except Exception as e:
        # bubble the error so we can see it
        return JsonResponse({"ok": False, "error": str(e), "counts": counts}, status=500)