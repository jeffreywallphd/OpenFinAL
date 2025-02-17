from django.shortcuts import render
from django.conf import settings
from django.conf.urls.static import static

from huggingface_hub import HfApi
from decouple import config

DEFAULT_HF_KEY = config("HF_API_KEY", default="")
DEFAULT_HF_ACCOUNT = config("HF_ACCOUNT_NAME", default=None)

def home_view(request):
    models=[]
    datasets=[]
    messages=[]

    try:
        if DEFAULT_HF_ACCOUNT is not None:
            hf = HfApi(token=DEFAULT_HF_KEY)

            HFmodels = hf.list_models(author=DEFAULT_HF_ACCOUNT)
            for model in HFmodels:
                models.append(model)

            HFdatasets = hf.list_datasets(author=DEFAULT_HF_ACCOUNT)
            for dataset in HFdatasets:
                datasets.append(dataset)
        else:
            raise Exception()
    except Exception as e:
        message = f"You have not yet configured the software with the details of your HuggingFace account. Please visit the Settings page."
        messages.append(message)

    return render(request, 'home.html', {"messages": messages, "models": models, "datasets": datasets})