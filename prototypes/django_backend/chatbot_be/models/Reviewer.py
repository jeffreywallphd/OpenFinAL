from django.db import models

class Reviewer(models.Model):
    review_id = models.AutoField(primary_key=True)  # Unique identifier for each reviewer
    first_name = models.CharField(max_length=255)  # First name of the reviewer
    last_name = models.CharField(max_length=255)   # Last name of the reviewer

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
