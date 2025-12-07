from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from .Question import Question as QuestionTable
from .Reviewer import Reviewer as ReviewerTable

class ReviewAnswer(models.Model):
    RevAnswer_ID = models.AutoField(primary_key=True)  # Primary key auto-increment
    ScoreScale = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],  # Restricts values to 1-5
        help_text="Rating between 1 (worst) and 5 (best)"
    )
    Description = models.CharField(max_length=255, help_text="Brief description of the answer")  # Brief description of the answer
    question_id = models.ForeignKey(QuestionTable, on_delete=models.CASCADE, blank=False, null=False)
    reviewer = models.ForeignKey(ReviewerTable, on_delete=models.CASCADE, blank=False, null=False)

    def __str__(self):
        return f"ReviewAnswer {self.RevAnswer_ID} - Score: {self.ScoreScale} - {self.Description}"
