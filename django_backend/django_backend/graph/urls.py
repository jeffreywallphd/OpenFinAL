from django.urls import path
from . import views_sync, views_recommendation, views_progress

urlpatterns = [
    path("api/sync", views_sync.sync),
    path("api/recommendation", views_recommendation.recommendation),
    path("api/module/start", views_progress.start_module),
    path("api/module/complete", views_progress.complete_module),
]