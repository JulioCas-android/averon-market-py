#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuración ---
BACKEND_ID="studio"
REGION="us-central1"
# --------------------

PROJECT_ID=$(gcloud config get-value project)
echo "Deploying to Firebase Project: $PROJECT_ID"
echo "Using App Hosting Backend ID: $BACKEND_ID"

# 1. Build the Next.js application for production.
echo "Building the application..."
npm run build

# 2. Deploy the application to the specified backend in Firebase App Hosting.
echo "Deploying to Firebase App Hosting..."
# By specifying the backend, we avoid the interactive GitHub loop.
firebase deploy --only "apphosting:$BACKEND_ID" --project="$PROJECT_ID"

echo "----------------------------------------"
echo "¡Despliegue completado!"
echo "Puedes ver tu aplicación en la siguiente URL:"
echo "https://${BACKEND_ID}--${PROJECT_ID}.${REGION}.hosted.app"
echo "----------------------------------------"
