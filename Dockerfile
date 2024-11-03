FROM python:3.13-slim

RUN pip install --upgrade pip
RUN apt-get update && apt-get install -y gcc g++ libc-dev
COPY ./requirements.txt .

RUN pip install -r requirements.txt

COPY . /app
WORKDIR /app

COPY ./entrypoint.sh .
ENTRYPOINT ["sh", "/app/entrypoint.sh"]