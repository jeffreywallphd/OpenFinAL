#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_backend.settings')

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Ensure it's installed and available on your PYTHONPATH. "
            "Did you forget to activate a virtual environment?"
        ) from exc

    # Prevents Django's auto-reloader from running if `runserver` is used
    if "runserver" in sys.argv and "--noreload" not in sys.argv:
        sys.argv.append("--noreload")

    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
