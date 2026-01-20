#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# 1. Get the Project ID from the gcloud config.
PROJECT_ID=$(gcloud config get-value project)
echo "Deploying to Firebase Project: $PROJECT_ID"

# 2. Build the Next.js application for production.
echo "Building the application..."
npm run build

# 3. Create the App Hosting backend if it doesn't exist.
# The command will fail gracefully if the backend already exists.
echo "Ensuring App Hosting backend exists..."
firebase apphosting:backends:create --project=$PROJECT_ID || echo "Backend already exists or there was an issue creating it. Continuing..."


# 4. Deploy the application to Firebase App Hosting.
echo "Deploying to Firebase App Hosting..."
firebase deploy --only apphosting --project=$PROJECT_ID

echo "Deployment complete!"
echo "You can view your deployed application soon."
