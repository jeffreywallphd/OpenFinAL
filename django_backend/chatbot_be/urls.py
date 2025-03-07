from django.urls import path
from .views.settings import settings_view
from .views.model_statistics import ModelStatisticsView
from .views.chatbot import chatbot_view
from .views.home import home_view
from .views.model_training import train_model_view, stream_training_output
from .views.model_training_workflow import stream_training_workflow_output, train_model_workflow, model_stats_workflow
from .views.scrape import ScrapeDataView, UploadPDFView, scrape_view, SaveManualTextView
from .views import SessionCreateView, ConversationListView, ConversationCreateView, SessionListView, ChatbotGenerateResponseView
from .views.generate_q_and_a import generate_q_and_a, document_detail, download_json, delete_document
from .views.dataset_workflow import dataset_workflow_view, dataset_workflow_document_processor
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('chatbot/', SessionCreateView.as_view(), name='create-session'),
    path('chatbot/sessions/', SessionListView.as_view(), name='list-sessions'),
    path('chatbot/<str:session_id>/', ConversationListView.as_view(), name='get-conversation'),
    path('chatbot/<str:session_id>/add/', ConversationCreateView.as_view(), name='post-message'),
    path('chatbot/<str:session_id>/response/', ChatbotGenerateResponseView.as_view(), name='generate-response'),
    path("model_statistics/", ModelStatisticsView.as_view(), name="model-statistics"),
    path('chatbot_view/', chatbot_view, name='chatbot-view'),  
    path('home_view/', home_view, name='home-view'),  
    path('scrape_view/', scrape_view, name='scrape-view'),
    path("train_model/", train_model_view, name="train-view"),
    path("stream-training/",stream_training_output, name="stream-training"),
    path('stream_training_workflow/',stream_training_workflow_output, name='stream-training-workflow'),
    path('train_model_workflow/',train_model_workflow, name='train-model-workflow'),
    path('model_stats_workflow/',model_stats_workflow, name='model-stats-workflow'),
    path('settings_view/', settings_view, name='settings-view'),
    path('scrape/', ScrapeDataView.as_view(), name='scrape-data'),
    path('upload_pdf/', UploadPDFView.as_view(), name='upload-pdf'),
    path('save_manual_text/', SaveManualTextView.as_view(), name='save-manual-text'),

    path('dataset_workflow/', dataset_workflow_view, name='dataset-workflow'),
    path('document_processor/', dataset_workflow_document_processor, name='document-processor'),

    path('generate_q_and_a/', generate_q_and_a, name='generate_q_and_a'),
    path("document_detail/", document_detail, name="document_detail"),
    path('document/download_json/', download_json, name='download_json'),
    path('delete_document/<int:document_id>/<path:redirect_url>', delete_document, name='delete_document'),
]


urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)