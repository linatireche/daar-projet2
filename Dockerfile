# ==============================================================================
# Dockerfile Tout-en-un pour Déploiement Cloud (Render / Railway / Koyeb)
# Compile l'interface React et la sert directement via l'API FastAPI
# ==============================================================================

# Étape 1 : Construction du Frontend React
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Étape 2 : Image d'Exécution Backend FastAPI
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./

# Intégration du frontend compilé dans le dossier static du backend
COPY --from=frontend-builder /app/frontend/dist /app/static

RUN mkdir -p /app/data/books

EXPOSE 8000

# Utilise la variable PORT fournie par Render (ou 8000 par défaut)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
