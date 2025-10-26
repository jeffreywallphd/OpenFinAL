from django.urls import path
from . import views_sync

urlpatterns = [
    path("api/sync", views_sync.sync),
]
