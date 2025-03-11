from django.db import models

class ModelStats(models.Model):
    model_name = models.CharField(max_length=255)
    dataset = models.CharField(max_length=255)
    ROUGE1 = models.FloatField()
    ROUGE2 = models.FloatField()
    ROUGE_L = models.FloatField()
    ROUGE_LSum = models.FloatField()
    BERTScoreF1 = models.FloatField()
    BERTScorePrecision = models.FloatField()
    BERTScoreRecall = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.model_name} - {self.dataset}"
