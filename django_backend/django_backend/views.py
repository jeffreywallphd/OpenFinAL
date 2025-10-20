from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django_backend.graph.write import save_pre_assessment, mark_completed
from django_backend.graph.read import get_recommendations

@csrf_exempt
def save_assessment_view(request):
    user_id = request.GET.get('userId') or request.POST.get('userId')
    level   = int(request.GET.get('level') or request.POST.get('level', 1))
    risk    = (request.GET.get('risk') or request.POST.get('risk') or 'MED')
    save_pre_assessment(user_id, level, risk)
    return JsonResponse({'ok': True})

@csrf_exempt
def complete_module_view(request, module_id):
    user_id = request.GET.get('userId') or request.POST.get('userId')
    score   = float(request.GET.get('score') or request.POST.get('score', 0))
    mark_completed(user_id, module_id, score)
    return JsonResponse({'ok': True})

def recommend_view(request):
    user_id = request.GET.get('userId')
    return JsonResponse({'recommendations': get_recommendations(user_id)})
