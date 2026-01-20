#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuración ---
# Nombre para tu backend en App Hosting.
BACKEND_ID="averon-market"
# --------------------

PROJECT_ID=$(gcloud config get-value project)
echo "Deploying to Firebase Project: $PROJECT_ID"
echo "Using App Hosting Backend ID: $BACKEND_ID"

# 1. Build the Next.js application for production.
echo "Building the application..."
npm run build

# 2. Create the App Hosting backend if it doesn't exist.
# The command will fail if the backend already exists, so we use `|| true` to continue.
echo "Ensuring App Hosting backend '$BACKEND_ID' exists..."
firebase apphosting:backends:create "$BACKEND_ID" --project="$PROJECT_ID" || true


# 3. Deploy the application to the specified backend in Firebase App Hosting.
echo "Deploying to Firebase App Hosting..."
# By specifying the backend, we avoid the interactive GitHub loop.
firebase deploy --only "apphosting:$BACKEND_ID" --project="$PROJECT_ID"

echo "Deployment complete!"
echo "You can view your deployed application soon."
