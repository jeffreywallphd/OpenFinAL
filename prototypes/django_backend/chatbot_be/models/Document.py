from django.db import models
from .Source import Source as SourceTable
from .License import License as LicenseTable

class Document(models.Model):
    DocID = models.CharField(max_length=255, primary_key= True)
    DocDescription = models.CharField(max_length=255)
    DocLink = models.CharField(max_length=255)
    LastDateScraped = models.DateField()
    DocName = models.CharField(max_length=255)
    Source_ID = models.ForeignKey(SourceTable,  on_delete=models.CASCADE, blank= False, null = False)
    License_ID = models.ForeignKey(LicenseTable,  on_delete=models.CASCADE, blank= False, null = False)
    RequiresAttribution = models.BooleanField()

    class DocValid(models.IntegerChoices): 
        RANDOM_UNVERIFIED = 1, 'Random/Unverified'
        SOURCED = 2, 'Sourced'
        PUBLISHED_AUDITED_GOVDATA = 3, 'Published/audited/GovData'

    DocValid = models.IntegerField(
        choices=DocValid.choices, 
        default=DocValid.RANDOM_UNVERIFIED
    )
    def __str__(self):
        return (
            f"Document {self.DocID} - {self.DocDescription} - Link: {self.DocLink} - "
            f"Scraped: {self.LastDateScraped} - Name: {self.DocName} - "
            f"Source: {self.Source_ID} - License: {self.License_ID} - "
            f"Attribution Required: {self.RequiresAttribution} "
            f"(Status: {self.get_DocValid_display()})"
        )
