# backend/Dockerfile
FROM python:3.10-slim

# Evita que Python escriba archivos .pyc y fuerza los logs a pantalla
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Dependencias del SO requeridas para PostgreSQL y creación de PDFs (xhtml2pdf, pycairo, etc)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/

RUN pip install --upgrade pip
RUN pip install -r requirements.txt
# Gunicorn es el servidor recomendado para producción
RUN pip install gunicorn

COPY . /app/

EXPOSE 8000

# Usamos Gunicorn para servir Django, reemplaza 'gestion_transporte.wsgi' si tu app principal se llama diferente
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "gestion_transporte.wsgi:application"]
