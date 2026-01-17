'use client';

import { type ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from './provider';
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

function initializeClientFirebase(): FirebaseServices {
  if (!firebaseConfig.apiKey) {
    throw new Error(
      'La clave de API de Firebase no está definida. Por favor, agrega NEXT_PUBLIC_FIREBASE_API_KEY a tu archivo .env y reinicia el servidor de desarrollo.'
    );
  }
  
  if (getApps().length > 0) {
    const app = getApp();
    return {
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app),
    };
  }
  const firebaseApp = initializeApp(firebaseConfig);
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);
  return { firebaseApp, auth, firestore };
}

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [firebaseServices, setFirebaseServices] = useState<FirebaseServices | null>(null);

  useEffect(() => {
    // This effect runs only on the client, after hydration is complete.
    try {
      setFirebaseServices(initializeClientFirebase());
    } catch (error) {
      // The error from initializeClientFirebase (e.g., missing API key) will be caught here.
      // We can log it or show a more graceful error message to the user.
      console.error("Firebase initialization failed:", error);
    }
  }, []); // Empty dependency array ensures this runs only once on mount.

  if (!firebaseServices) {
    // Render nothing while waiting for Firebase to initialize on the client.
    // This prevents children from rendering and attempting to use a non-existent Firebase context.
    return null;
  }
  
  return <FirebaseProvider value={firebaseServices}>{children}</FirebaseProvider>;
}
