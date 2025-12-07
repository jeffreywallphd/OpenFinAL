from django.db import models

class License(models.Model):
    License_ID = models.IntegerField(primary_key=True)  # Unique identifier for each conversation
    License_Name = models.CharField(max_length=255)  # The actual message text
    License_Valid = models.BooleanField()  # Timestamp of the message
    

    class LicenseValid(models.IntegerChoices): 
        RANDOM_UNVERIFIED = 1, 'Random/Unverified'
        SOURCED = 2, 'Sourced'
        PUBLISHED_AUDITED_GOVDATA = 3, 'Published/audited/GovData'           
    
    LicenseValid = models.IntegerField(
        choices=LicenseValid.choices, 
        default=LicenseValid.RANDOM_UNVERIFIED
    )


    def __str__(self):
        return f"License {self.License_ID} - {self.License_Name} (Status: {self.get_LicenseValid_display()})"
