
import { initializeApp, getApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let serviceAccount: object | undefined;

// Safely parse the service account key
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } catch (e) {
    console.error(
      'Error parsing FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it is a valid JSON string. Falling back to Application Default Credentials.',
      e
    );
    serviceAccount = undefined;
  }
}


if (!getApps().length) {
  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    // If no service account is provided, or if parsing failed,
    // Firebase Admin will try to use Application Default Credentials.
    // This is the default behavior for many Google Cloud environments, including App Hosting.
    initializeApp();
  }
}

export const firestore = getFirestore();
