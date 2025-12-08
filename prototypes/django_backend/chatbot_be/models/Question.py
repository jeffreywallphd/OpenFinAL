from django.db import models


class Question(models.Model):
    Question_ID = models.AutoField(primary_key=True)  # Primary key auto-increment
    Question = models.CharField(max_length=255)  # The question itself

    def __str__(self):
      return f"Question: {self.Question} - Answer: {self.answer_id}"
