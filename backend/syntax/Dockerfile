FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies for psycopg2 / psycopg and Pillow (if using images)
RUN apt-get update && apt-get install -y \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the full project
COPY . .

# Collect static files (will fail unless settings are correctly configured for production)
RUN python manage.py collectstatic --noinput

# Run the app with Daphne
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "syntax.asgi:application"]
