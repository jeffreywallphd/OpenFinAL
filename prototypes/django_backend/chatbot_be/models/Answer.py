from django.db import models
from .Document import Document as DocumentTable
from .License import License as LicenseTable
from .Question import Question as QuestionTable

class Answer(models.Model):
    Answer_ID = models.IntegerField(primary_key=True)
    Link = models.CharField(max_length=255, null=True)
    PageNum = models.IntegerField(null=True, blank=True)
    Answer = models.CharField(max_length=255)
    LastDayScraped = models.DateField()
    CopyrightDate = models.DateField(null=True, blank=True)
    
    # Define as IntegerFields since IntegerChoices isn't suitable without defined options
    OutdatedFlag = models.IntegerField(null=True, blank=True)
    FlagNewAnswerID = models.IntegerField(null=True, blank=True)
    AnswerRating = models.IntegerField(null=True, blank=True)

    class AnswerValid(models.IntegerChoices): 
        RANDOM_UNVERIFIED = 1, 'Random/Unverified'
        SOURCED = 2, 'Sourced'
        PUBLISHED_AUDITED_GOVDATA = 3, 'Published/audited/GovData'

    AnswerValid = models.IntegerField(
        choices=AnswerValid.choices, 
        default=AnswerValid.RANDOM_UNVERIFIED
    )
    Doc_id = models.ForeignKey(DocumentTable, on_delete=models.CASCADE, blank=False, null=False)
    License_ID = models.ForeignKey(LicenseTable, on_delete=models.CASCADE, blank=False, null=False)
    Question_ID = models.ForeignKey(QuestionTable, on_delete=models.CASCADE, blank=False, null=False)

    def __str__(self):
        return (
            f"Answer {self.Answer_ID} - Link: {self.Link} - Page: {self.PageNum} - "
            f"Answer: {self.Answer} - Scraped: {self.LastDayScraped} - Copyright: {self.CopyrightDate} - "
            f"Doc: {self.Doc_id} - License: {self.License_ID} - Question: {self.Question_ID} "
            f"(Status: {self.get_AnswerValid_display()})"
        )
