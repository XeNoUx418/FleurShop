FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV DJANGO_SECRET_KEY=dummy-build-key
RUN python manage.py collectstatic --noinput

RUN chmod +x start.sh
EXPOSE 8003
CMD ["sh", "start.sh"]