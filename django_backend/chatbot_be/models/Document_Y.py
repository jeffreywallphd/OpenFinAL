from django.db import models

class Document_y(models.Model):
    pdf_file = models.FileField(upload_to='uploads/', null=True, blank=True)
    large_text = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Document {self.id} - {self.created_at}"