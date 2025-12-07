from django.db import models

class Conversation(models.Model):
    session_id = models.CharField(max_length=255)  # Unique identifier for each conversation
    message = models.TextField()  # The actual message text
    is_user = models.BooleanField(default=True)  # True if the message is from the user, False if from chatbot
    timestamp = models.DateTimeField(auto_now_add=True)  # Timestamp of the message

    def __str__(self):
        return f"Session {self.session_id} - {'User' if self.is_user else 'Chatbot'}: {self.message}"
