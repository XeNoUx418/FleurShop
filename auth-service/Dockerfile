# Use official Python image
FROM python:3.13-slim

# Set working directory inside the container
WORKDIR /app

# Install dependencies first (better Docker caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY . .

# Dummy key just for collectstatic — overridden at runtime by .env
ENV DJANGO_SECRET_KEY=dummy-build-key
RUN python manage.py collectstatic --noinput

# Expose the port this service runs on
EXPOSE 8001

# Command to run when container starts
CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]
