from django.core.management.base import BaseCommand
import requests

class Command(BaseCommand):
    help = 'Scrapes data from the provided URL and saves it to a local XML file'

    def add_arguments(self, parser):
        parser.add_argument('url', type=str, help='The URL to scrape data from')
        parser.add_argument('output_file', type=str, help='The name of the output file to save data')

    def handle(self, *args, **kwargs):
        url = kwargs['url']
        output_file = kwargs['output_file']

        response = requests.get(url)

        if response.status_code == 200:
            with open(output_file, 'wb') as file:
                file.write(response.content)
            self.stdout.write(self.style.SUCCESS(f'Successfully saved data to {output_file}'))
        else:
            self.stdout.write(self.style.ERROR(f'Failed to retrieve data. Status code: {response.status_code}'))
