from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .write import mark_started, mark_completed

@csrf_exempt
def start_module(request):
    if request.method != "POST":
        return JsonResponse({"ok": False, "error": "POST only"}, status=405)
    data = json.loads(request.body.decode("utf-8"))
    print("start_module payload:", data)
    mark_started(str(data["userId"]), str(data["moduleId"]))
    return JsonResponse({"ok": True})

@csrf_exempt
def complete_module(request):
    if request.method != "POST":
        return JsonResponse({"ok": False, "error": "POST only"}, status=405)
    data = json.loads(request.body.decode("utf-8"))
    # score is expected in [0,1] (e.g., 0.72). If you send 0–100, divide by 100 on the frontend.
    mark_completed(str(data["userId"]), str(data["moduleId"]), float(data["score"]))
    return JsonResponse({"ok": True})
