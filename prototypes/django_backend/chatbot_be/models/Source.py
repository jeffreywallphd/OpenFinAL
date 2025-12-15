from django.db import models
from .License import License as LicenseTable



class Source(models.Model):
    SourceID = models.CharField(max_length=255, primary_key=True)
    SourceName = models.CharField(max_length=255)
    License_ID = models.ForeignKey(LicenseTable,  on_delete=models.CASCADE, blank= False, null = False)
    SourceDescription = models.CharField(max_length=255)
    SourceLink = models.CharField(max_length=255)


    class SourceValid(models.IntegerChoices): 
        RANDOM_UNVERIFIED = 1, 'Random/Unverified'
        SOURCED = 2, 'Sourced'
        PUBLISHED_AUDITED_GOVDATA = 3, 'Published/audited/GovData'

    SourceValid = models.IntegerField(
        choices=SourceValid.choices, 
        default=SourceValid.RANDOM_UNVERIFIED
    )
    def __str__(self):
        return (
            f"Source {self.SourceID} - {self.SourceName} - License: {self.License_ID} - "
            f"{self.SourceDescription} - {self.SourceLink} (Status: {self.get_SourceValid_display()})"
        )
