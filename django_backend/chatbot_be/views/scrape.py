from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
import json
from bs4 import BeautifulSoup
from django.shortcuts import render
from openpyxl import load_workbook
from io import BytesIO
from ..models.scraped_data import ScrapedData  # Import the model to save data
import pdfplumber
import markdown

from django.conf import settings
from django.conf.urls.static import static

class ScrapeDataView(APIView):
    def get(self, request):
        url = request.GET.get('url')
        title = request.GET.get('title')
        print(title)
        if not url:
            return Response({'error': 'Please provide a URL.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Fetch the data from the URL
            response = requests.get(url)
            response.raise_for_status()  # Raise an error for bad status codes
        except requests.RequestException as e:
            return Response({'error': f'Failed to retrieve data from the URL. Error: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        # Detect the content type
        content_type = response.headers.get('Content-Type', '').lower()

        # Initialize variables for content storage
        scraped_content = None
        binary_content = None
        file_type = None

        if 'application/json' in content_type:
            file_type = 'json'
            scraped_content = json.dumps(response.json(), indent=4)  # Convert JSON to string

        elif 'application/xml' in content_type or 'text/xml' in content_type:
            file_type = 'xml'
            scraped_content = response.content.decode('utf-8')  # Decode XML content

        elif 'text/plain' in content_type:
            file_type = 'text'
            scraped_content = response.content.decode('utf-8')  # Decode plain text content

        elif 'text/html' in content_type:
            file_type = 'html'
            scraped_content = BeautifulSoup(response.content, 'html.parser').prettify()  # Clean up HTML

        elif 'text/csv' in content_type or 'application/csv' in content_type:
            file_type = 'csv'
            scraped_content = response.content.decode('utf-8')  # Decode CSV content

        elif 'application/vnd.ms-excel' in content_type or 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' in content_type:
            file_type = 'xlsx'

            # For xlsx, we store the binary content
            try:
                binary_content = response.content  # Store the binary content as is
            except Exception as e:
                return Response({'error': f'Error processing xlsx file: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        else:
            return Response({'error': f'Unsupported content type: {content_type}'}, status=status.HTTP_400_BAD_REQUEST)

        # Save the scraped data to the database
        scraped_data = ScrapedData.objects.create(
            url=url,
            file_type=file_type,
            content=scraped_content if scraped_content else None,  # Store text content if available
            binary_content=binary_content if binary_content else None,  # Store binary content if available
            title = title
        )

        # return Response({'success': f'Successfully saved data from {url} to the database.'}, status=status.HTTP_200_OK)
    
        # Fetch the latest scraped data after saving
        latest_scraped_data = ScrapedData.objects.latest('created_at')

        # API response after saving the data
        return Response({
            'success': f'Successfully saved data from {url} to the database.',
            'url': latest_scraped_data.url,
            'file_type': latest_scraped_data.file_type,
            'content': latest_scraped_data.content
        }, status=status.HTTP_200_OK)

class UploadPDFView(APIView):
    def post(self, request):
        pdf_file = request.FILES.get('pdf_file')
        output_format = request.POST.get('output_format')
        title = request.POST.get('title')

        if not pdf_file or not output_format:
            return Response({'error': 'PDF file and output format are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Extract text from PDF using pdfplumber
            extracted_text = ""
            with pdfplumber.open(pdf_file) as pdf:
                for page in pdf.pages:
                    extracted_text += page.extract_text() + "\n\n"

            # Convert the extracted text to HTML or JSON
            file_type = ''
            converted_content = ''

            if output_format == 'html':
                # Convert extracted text to HTML
                converted_content = markdown.markdown(extracted_text)
                file_type = 'html'

            elif output_format == 'json':
                # Convert extracted text to JSON (as an array of lines)
                json_content = {"content": extracted_text.strip().split('\n')}
                converted_content = json_content
                file_type = 'json'

            elif output_format == 'text':
                converted_content = extracted_text.strip()
                file_type = 'text'

            else:
                return Response({'error': 'Unsupported output format.'}, status=status.HTTP_400_BAD_REQUEST)

            # Save the converted HTML or JSON to the database
            scraped_data = ScrapedData.objects.create(
                file_type=file_type,
                content=converted_content if file_type == 'html' else str(converted_content),
                title = title
                # pdf_file=pdf_file  
            )

            # Fetch the latest scraped data after saving
            latest_scraped_data = ScrapedData.objects.latest('created_at')

            return Response({
                'success': f'PDF successfully converted to {output_format.upper()}.',
                'file_type': file_type,
                'content': converted_content,
                'latest_scraped_data': {
                    'url': latest_scraped_data.url,
                    'file_type': latest_scraped_data.file_type,
                    'content': latest_scraped_data.content,
                    # 'pdf_file_url': latest_scraped_data.pdf_file.url if latest_scraped_data.pdf_file else None  
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': f'Error processing PDF: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# Template view to render the latest scraped data
def scrape_view(request):
    # Fetch the most recent scraped data
    try:
        latest_scraped_data = ScrapedData.objects.latest('created_at')  # Get the latest entry
    except ScrapedData.DoesNotExist:
        latest_scraped_data = None  # Handle case if no data exists

    # Pass the latest data to the template
    return render(request, 'scrape.html', {'latest_scraped_data': latest_scraped_data})

class SaveManualTextView(APIView):
    def post(self, request):
        text = request.data.get('text')
        title = request.data.get('title')
        if not text:
            return Response({'error': 'Please provide text.'}, status=status.HTTP_400_BAD_REQUEST)

        # Save the manually entered text to the database
        scraped_data = ScrapedData.objects.create(
            file_type='text',
            content=text,
            title=title
        )

        # Fetch the latest scraped data after saving
        latest_scraped_data = ScrapedData.objects.latest('created_at')

        return Response({
            'success': 'Successfully saved manually entered text.',
            'file_type': latest_scraped_data.file_type,
            'content': latest_scraped_data.content
        }, status=status.HTTP_200_OK)
