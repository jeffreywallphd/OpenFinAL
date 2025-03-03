from django.shortcuts import get_object_or_404
from ...models.scraped_data import ScrapedData, ScrapedDataMeta
from django.contrib import messages
from django.shortcuts import render, redirect
from django.http import HttpResponseRedirect

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
    
def delete_document_mul(request):
    selected_document_ids = request.POST.getlist('selected_documents')
    print(selected_document_ids)

    documents = ScrapedData.objects.filter(id__in=selected_document_ids)

    if request.method == "POST":
        request.session['selected_document_ids'] = selected_document_ids
        print(documents)
        print(type(documents))

        if documents.exists():
            documents.delete()
            messages.success(request, 'The document has been deleted successfully!')
        else:
            messages.warning(request, 'Please select files to delete first')

        return HttpResponseRedirect(request.META.get('HTTP_REFERER', '/'))