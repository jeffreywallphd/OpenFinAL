from django.db.models.signals import post_save
from django.dispatch import receiver
from .models.scraped_data import ScrapedData, ScrapedDataMeta

@receiver(post_save, sender=ScrapedData)
def create_scraped_data_meta(sender, instance, created, **kwargs):
    if created:
        ScrapedDataMeta.objects.create(
            scraped_data=instance,
            url=instance.url,
            file_type=instance.file_type,
            pdf_file=instance.pdf_file,
            created_at=instance.created_at,
            content_preview = instance.content[:50],
            title = instance.title
        )