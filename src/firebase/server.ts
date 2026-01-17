
import { initializeApp, getApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

if (!getApps().length) {
  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    // If no service account is provided, Firebase Admin will try to use
    // Application Default Credentials. This is the default behavior for many
    // Google Cloud environments, including App Hosting.
    initializeApp();
  }
}

export const firestore = getFirestore();
