#!/bin/sh

python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --no-input

gunicorn --bind 0.0.0.0:8000 --workers 3 --timeout 120 assosiacions2.wsgi:application