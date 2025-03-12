# LMForge Setup Steps:

1. First, ensure you have requisite programs installed. You will need 

* Python (most of features have been tested on versions 3.10 and 3.11).
* MySQL 

2. Next, create a Python environment using the following command in the terminal (you should be located in the outer django_backend folder):

* For Windows:
- To create a virtual environment : python -m venv venv
- To activate virtual environment : .\venv\Scripts\activate

* For Linux / macOS:
- To create a virtual environment : python3 -m venv venv
- To activate virtual environment : source venv/bin/activate

3. Then, install dependencies. Most dependencies can be installed using the command below. However, torch with CUDA support must be configured according to your environment.
- pip install -r requirements.txt
- Visit the following site to retrieve the appropriate pip install for torch: https://pytorch.org/

4. Next, create .env file in your django_backend > django_backend folder which should contain the following information:
    DATABASE_NAME=mydatabase 
    DATABASE_USER=myuser
    DATABASE_PASSWORD=mypassword
    DATABASE_HOST=localhost
    DATABASE_PORT=3306
    WANDB_API_KEY=yourKey
    HF_API_KEY=yourKey
    OPENAI_API_KEY=yourKey
- Be sure to change the values above to values for your system. 

5. Last, make sure your file location in your terminal is in the outer django_backend folder. Then, run the commands below one by one:
- python manage.py makemigrations
- python manage.py migrate
- python manage.py runserver

* Whenever you want to start the applicatoin again, start your Python virtual environment and simply run the last of the three above commands.