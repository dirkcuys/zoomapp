from python:3
workdir /opt/app
copy requirements.txt .
expose 8000
run pip install -r requirements.txt
cmd python manage.py runserver 0.0.0.0:8000
