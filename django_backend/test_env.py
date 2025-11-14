import django
from django.conf import settings

django.setup()
print(settings.NEO4J_URI)
print(settings.NEO4J_USER)
