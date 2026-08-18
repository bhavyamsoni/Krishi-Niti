FROM python:3.11-slim

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install the local agronomic engine package
COPY ../packages/engine ./packages/engine
RUN pip install --no-cache-dir -e ./packages/engine

# Copy backend application
COPY . .

# Render injects $PORT — default 8000 for local use
ENV PORT=8000

EXPOSE 8000

# Use gunicorn in production; wsgi.py exposes flask_app as 'app'
CMD gunicorn wsgi:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
