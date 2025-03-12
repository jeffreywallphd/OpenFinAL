from django.shortcuts import render
from django.http import JsonResponse
import os
from django.conf import settings

def settings_view(request):
    env_file = os.path.join(settings.BASE_DIR, 'django_backend', '.env')
    existing_values = {}
    message = None  # Initialize message to avoid UnboundLocalError
    message_type = None  # Initialize message type

    # Load existing values if the file exists
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            for line in f:
                if '=' in line:
                    key, value = line.strip().split('=', 1)
                    existing_values[key] = value

    if request.method == 'POST':
        # Fetch form data, keeping existing values if fields are empty
        env_data = {
            key: request.POST.get(key, "").strip() or existing_values.get(key, "")
            for key in [
                'DATABASE_NAME', 'DATABASE_USER', 'DATABASE_PASSWORD',
                'DATABASE_HOST', 'DATABASE_PORT', 'WANDB_API_KEY',
                'HF_API_KEY', 'OPENAI_API_KEY'
            ]
        }

        try:
            # Write updated values to .env
            with open(env_file, 'w') as f:
                for key, value in env_data.items():
                    f.write(f"{key}={value}\n")

            message = "Settings updated successfully!"
            message_type = "success"

        except Exception as e:
            message = f"Failed to update .env file: {e}"
            message_type = "error"

    return render(request, 'settings.html', {
        "existing_values": existing_values,
        "message": message,
        "message_type": message_type
    })