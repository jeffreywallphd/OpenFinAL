from django.apps import AppConfig


class ChatbotBeConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'chatbot_be'

    def ready(self):
        import chatbot_be.signals
