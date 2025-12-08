from django.contrib import admin 
from .models.scraped_data import ScrapedData as ScrapedDataTable
from .models.License import License as LicenseTable
from .models.Question import Question as QuestionTable
from .models.ReviewAnswer import ReviewAnswer as ReviewAnswerTable
from .models.QuestionAnswer import QuestionAnswer as QuestionAnswerTable
from .models.Reviewer import Reviewer as ReviewerTable
from .models.Answer import Answer as AnswerTable
from .models.Source import Source as SourceTable
from .models.Document import Document as DocumentTable

admin.site.register(ScrapedDataTable)
admin.site.register(LicenseTable)
admin.site.register(QuestionTable)
admin.site.register(ReviewAnswerTable)
admin.site.register(QuestionAnswerTable)
admin.site.register(ReviewerTable)
admin.site.register(AnswerTable)
admin.site.register(SourceTable)
admin.site.register(DocumentTable)
