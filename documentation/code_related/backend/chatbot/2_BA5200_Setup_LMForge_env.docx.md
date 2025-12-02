

Oct 10, 2025 1:00 PM

# BA5200 Setup Environment

Attendees [Eric Fosu-Kwabi](mailto:efosukwa@mtu.edu) [Mary Nnipaa Meteku](mailto:mmeteku@mtu.edu) [Judy Long](mailto:jlong2@mtu.edu)

# Agenda

| Topic | Time |
| :---- | :---- |
| Install MySQL on Windows | 10 min |
| Set up Python 3.11 required packages | 10 min |
| Create .env file and apply for APIs | 10 min |

# 1\. Install MySQL on Windows

1. Read LMForegse Setup Steps

   * [https://github.com/jeffreywallphd/OpenFinAL/tree/main/django\_backend](https://github.com/jeffreywallphd/OpenFinAL/tree/main/django_backend)

2. First step: Install MySQL on Windows

   * [https://dev.mysql.com/downloads/file/?id=544662](https://dev.mysql.com/downloads/file/?id=544662)

   * Remember your root user password.

3. Create a local database

   * Windows start \-\> all applications \-\> MySQL folder \-\> MySQL 8.0 command Line Client

   * Type your root user password

   * Create a local database using command:

     * CREATE DATABASE mydatabase;

# 2\. Set up Python 3.11 required packages

1. Read LMForegse Setup Steps

   * [https://github.com/jeffreywallphd/OpenFinAL/tree/main/django\_backend](https://github.com/jeffreywallphd/OpenFinAL/tree/main/django_backend)

2. (step 2\) Create a Python 3.11 environment

3. (step 3\) Install dependencies

# 3\. Create .env file and apply for APIs

1. Read LMForegse Setup Steps

   * [https://github.com/jeffreywallphd/OpenFinAL/tree/main/django\_backend](https://github.com/jeffreywallphd/OpenFinAL/tree/main/django_backend)

2. Create .ev file in “OpenFinAL/django\_backend “

3. Copy text, from “DATABASE\_NAME …… OPENAI\_API\_KEY=yourKey” to .env file.

4. Modify values to your own info

   * Keep DATABASE\_NAME=mydatabase

   * DATABASE\_USER=root

   * DATABASE\_PASSWORD=your root password

   * DATABASE\_HOST=localhost

   * DATABASE\_PORT=3306

   * Apply a WANDB\_API\_KEY through: [https://wandb.ai/authorize](https://wandb.ai/authorize)

   * Apply a HF\_API\_KEY through: [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

   * Apply an OPENAI\_API\_KEY through: [https://platform.openai.com/docs/overview](https://platform.openai.com/docs/overview)

     * You can add $5 (minimum bill amount) to your account if you want. Mark Anthony said we have some budget.

# 4\. Create .env file and apply for APIs

1. Read LMForegse Setup Steps

   * [https://github.com/jeffreywallphd/OpenFinAL/tree/main/django\_backend](https://github.com/jeffreywallphd/OpenFinAL/tree/main/django_backend)

2. (step 5\) run commands one by one

   * cd openfinal/django\_backend

   * python manage.py makemigrations

   * python manage.py migrate

   * python manage.py runserver

3. A LMForge website will pop up

