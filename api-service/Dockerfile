FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Dummy key just for collectstatic — overridden at runtime by .env
ENV DJANGO_SECRET_KEY=dummy-build-key
RUN python manage.py collectstatic --noinput

EXPOSE 8002

CMD ["python", "manage.py", "runserver", "0.0.0.0:8002"]
