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
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    // This effect runs only on the client, after hydration is complete.
    try {
      setFirebaseServices(initializeClientFirebase());
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
        setInitError(error);
      }
    }
  }, []); // Empty dependency array ensures this runs only once on mount.
  
  if (initError) {
    return (
      <div style={{ padding: '2rem', margin: '2rem', textAlign: 'center', backgroundColor: '#fffbe6', color: '#9a3412', border: '1px solid #fef3c7', borderRadius: '0.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Error de Configuración de Firebase</h1>
        <p style={{ marginTop: '1rem' }}>No se pudo conectar a Firebase. Por favor, revisa tus variables de entorno.</p>
        <pre style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem', textAlign: 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.875rem' }}>
          {initError.message}
        </pre>
      </div>
    );
  }

  if (!firebaseServices) {
    // Render nothing on the server or while waiting for client-side initialization.
    return null;
  }
  
  return <FirebaseProvider value={firebaseServices}>{children}</FirebaseProvider>;
}
