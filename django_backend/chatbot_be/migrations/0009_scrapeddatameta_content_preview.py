# Generated by Django 4.2.18 on 2025-02-10 07:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chatbot_be', '0008_scrapeddatameta'),
    ]

    operations = [
        migrations.AddField(
            model_name='scrapeddatameta',
            name='content_preview',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
