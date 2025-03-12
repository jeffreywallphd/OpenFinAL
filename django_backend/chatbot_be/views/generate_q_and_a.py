from django.shortcuts import render, redirect
from ..forms.forms import DocumentForm, DocumentProcessingForm
from ..models.scraped_data import ScrapedData, ScrapedDataMeta
from PyPDF2 import PdfReader
from django.shortcuts import get_object_or_404
from django.contrib import messages
import json
from django.http import JsonResponse, HttpResponse
from django.urls import reverse
from django.http import HttpResponseRedirect
import openai
from datetime import datetime
from openai import OpenAI, OpenAIError
import tiktoken
from decouple import config
from django.db.models import F, Func, Value
from django.core.paginator import Paginator
import pandas as pd
import io
import csv
from huggingface_hub import HfApi
from datasets import Dataset

client = OpenAI(
    api_key=config('OPENAI_API_KEY', default=""),
)
DEFAULT_HF_API_KEY = config("HF_API_KEY", default="")

# Tokenizer function (GPT-4 uses "cl100k_base" tokenizer)
def count_tokens(text):
    enc = tiktoken.get_encoding("cl100k_base")
    return len(enc.encode(text))


# Function to split text into segments while respecting token limits
def split_text(text, max_tokens=1000):
    paragraphs = text.split("\n\n")  # Split by paragraph
    chunks = []
    current_chunk = []
    current_tokens = 0

    for paragraph in paragraphs:
        para_tokens = count_tokens(paragraph)
        if current_tokens + para_tokens > max_tokens:
            chunks.append("\n\n".join(current_chunk))
            current_chunk = [paragraph]
            current_tokens = para_tokens
        else:
            current_chunk.append(paragraph)
            current_tokens += para_tokens

    if current_chunk:
        chunks.append("\n\n".join(current_chunk))

    return chunks




def extract_qa(text, chunk_limit, model="gpt-4", questions_num=5):
    text_chunks = split_text(text, max_tokens=1000)  # Adjust chunk size
    results = []

    total_chunks = len(text_chunks)

    for i, chunk in enumerate(text_chunks[:chunk_limit]):
        print(f'Total {total_chunks}, finished {i + 1}')
        prompt = f"""
        Generate {questions_num} question-answer pairs based on the following text segment. 
        Return the result in valid JSON format as a list of objects.

        Text Segment:
        {chunk}

        Response Format:
        [
            {{"question": "What is ...?", "answer": "The answer is ..."}},
            {{"question": "How does ... work?", "answer": "It works by ..."}}
        ]

        Return ONLY valid JSON output.
        """

        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5
        )

        try:
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5
            )

            json_data = json.loads(response.choices[0].message.content.strip())

            if isinstance(json_data, list):  
                results.extend(json_data)
            else:
                results.append({"error": "Unexpected JSON format"})

        except json.JSONDecodeError:
            results.append({"part": i + 1, "error": "Invalid JSON response"})
        
        except OpenAIError as e:
            return json.dumps({"error": f"OpenAI API Error: {str(e)}"}, indent=4)

    return json.dumps(results, indent=4)

def generate_q_and_a(request):
    documents_list = ScrapedDataMeta.objects.all().order_by('-created_at')  # Order by latest entries

    # Apply pagination (10 documents per page)
    paginator = Paginator(documents_list, 10)
    page_number = request.GET.get('page')
    documents = paginator.get_page(page_number)

    form = DocumentForm()

    return render(request, "generate_q_and_a.html", {"form": form, "documents":documents})


def document_detail(request):
    selected_document_ids = request.POST.getlist('selected_documents')
    # print(selected_document_ids)

    documents = ScrapedData.objects.filter(id__in=selected_document_ids)
    # print(documents)

    combined_text = "\n\n".join([doc.content for doc in documents])
    text_chunks = split_text(combined_text, max_tokens=1000)  # Adjust chunk size
    total_chunks = len(text_chunks)

    generated_json_data = None

    if request.method == "POST":
        if selected_document_ids:
            request.session['selected_document_ids'] = selected_document_ids


        form = DocumentProcessingForm(request.POST)
        if form.is_valid():
            test_type = form.cleaned_data['test_type']
            num_questions = form.cleaned_data['num_questions']
            num_paragraphs = form.cleaned_data['num_paragraphs']


            if test_type == 'mockup':
                json_file_path = 'media/JSON/New_Prompt_Simple_QA.json'
                try:
                    with open(json_file_path, 'r', encoding='utf-8') as file:
                        generated_json_text = file.read()

                    generated_json_data = json.loads(generated_json_text)
                    request.session[f'generated_json_combined'] = generated_json_text
                except (FileNotFoundError, json.JSONDecodeError):
                    generated_json_data = {"error": "Mock-up JSON file not found or invalid"}
            
            else:
                try:
                    generated_json_text = extract_qa(text=combined_text, chunk_limit = num_paragraphs, questions_num=num_questions)
                    generated_json_data = json.loads(generated_json_text)
                    request.session['generated_json_combined'] = generated_json_text

                except OpenAIError:
                    generated_json_data = {"error": "OpenAI API quota exceeded"}
                    request.session['generated_json_combined'] = json.dumps(generated_json_data)

    else:
        form = DocumentProcessingForm()

    return render(request, 'document_detail.html', {
        'documents': documents,
        'form': form,
        'json_data': generated_json_data, 
        'selected_document_ids': selected_document_ids, 
        'total_chunks': total_chunks,
    })


def download_json(request):
    """Serve the generated JSON data as a downloadable file."""
    session_key = f'generated_json_combined'
    generated_json_text = request.session.get(session_key, None)

    # print(generated_json_text)
    # print(type(generated_json_text))

    if generated_json_text is None:
        return JsonResponse({"error": "No generated JSON available for this document"}, status=404)

    response = HttpResponse(
        generated_json_text,
        content_type="application/json"
    )
    response['Content-Disposition'] = f'attachment; filename="document.json"'
    return response


def download_csv(request):
    """Serve the generated JSON data as a downloadable CSV file."""
    session_key = 'generated_json_combined'
    generated_json_text = request.session.get(session_key, None)

    if generated_json_text is None:
        return JsonResponse({"error": "No generated JSON available for this document"}, status=404)

    try:
        json_data = json.loads(generated_json_text)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)

    # Create a response object with CSV content
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="document.csv"'

    # Assuming JSON data is a list of dictionaries
    if isinstance(json_data, list) and json_data:
        fieldnames = json_data[0].keys()  # Get column headers from the first item
        writer = csv.DictWriter(response, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(json_data)
        print(response)
    else:
        return JsonResponse({"error": "Invalid JSON structure for CSV conversion"}, status=400)

    return response

def upload_parquet_to_huggingface(request):
    """Convert JSON string to Parquet and upload to Hugging Face Hub."""
    session_key = 'generated_json_combined'
    generated_json_text = request.session.get(session_key, None)

    if generated_json_text is None:
        return JsonResponse({"error": "No generated JSON available for this document"}, status=404)
    
    repo_name = config('HF_ACCOUNT_NAME', default="") if not request.GET.get("repo_name", "").strip().replace(" ", "_") else request.GET.get("repo_name", "").strip().replace(" ", "_")
    print(repo_name)
    file_name = request.GET.get("file_name", "").strip().replace(" ", "_")    

    if not file_name:
        return JsonResponse({"error": "No file name provided"}, status=400)
    
    if not repo_name:
        return JsonResponse({"error": "No repository name provided"}, status=400)

    try:
        json_data = json.loads(generated_json_text)

        # Ensure the JSON data is a list of dictionaries
        if not isinstance(json_data, list) or not all(isinstance(item, dict) for item in json_data):
            return JsonResponse({"error": "Invalid JSON format: Expected a list of dictionaries"}, status=400)

        # Convert JSON list to DataFrame dynamically
        df = pd.DataFrame(json_data)

        # Convert DataFrame to Parquet format
        buffer = io.BytesIO()
        df.to_parquet(buffer, index=False)
        buffer.seek(0)

        #api = HfApi()
        repo_id = f"{repo_name}/{file_name}"  

        try:
            dataset = Dataset.from_pandas(df)
            dataset.push_to_hub(repo_id, token=DEFAULT_HF_API_KEY) 
        except Exception as e:
            print(e)
            return JsonResponse({"error": "failed to connect to the HuggingFace repository"}, status=500)

        return JsonResponse({"success": f"Uploaded {file_name} to HuggingFace as {repo_id}"}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
api = HfApi()
user_info = api.whoami(token=DEFAULT_HF_API_KEY)  # Get user info
user_id = user_info["name"]  # Get your HF username
organizations = user_info["orgs"][0]["name"]  # Get list of organizations

print("User ID:", user_id)
print("Organizations:", organizations)