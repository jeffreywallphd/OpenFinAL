from django.db import models

class ScrapedData(models.Model):
    url = models.URLField(max_length=500)
    file_type = models.CharField(max_length=50)
    content = models.TextField(null=True, blank=True)  # For non-binary content
    binary_content = models.BinaryField(null=True, blank=True)  # For binary content
    pdf_file = models.FileField(upload_to='uploads/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=100)

    def __str__(self):
        return f'Scraped from {self.url} ({self.file_type})'
    
class ScrapedDataMeta(models.Model):
    scraped_data = models.OneToOneField(ScrapedData, on_delete=models.CASCADE, related_name='metadata')
    url = models.URLField(max_length=500)
    file_type = models.CharField(max_length=50)
    pdf_file = models.FileField(upload_to='uploads/', null=True, blank=True)
    created_at = models.DateTimeField()
    content_preview = models.CharField(max_length=100, blank=True, null=True) # Store a short preview
    title = models.CharField(max_length=100)
    
    def __str__(self):
        return f'Metadata for {self.url} ({self.file_type})'