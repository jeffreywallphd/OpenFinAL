from django.shortcuts import get_object_or_404
from ...models.scraped_data import ScrapedData, ScrapedDataMeta
from django.contrib import messages
from django.shortcuts import render, redirect

def delete_document(request, document_id, redirect_url):
    print(request)

    document = get_object_or_404(ScrapedData, id=document_id)
    if request.method == "POST":
        document.delete()
        messages.success(request, 'The document has been deleted successfully!')
        return redirect(redirect_url)
    else:
        # If the request is not POST, redirect
        return redirect(redirect_url)