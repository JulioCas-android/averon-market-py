'use client';

import { type ReactNode } from 'react';
import { FirebaseProvider } from './provider';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

function initializeClientFirebase() {
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

const firebaseServices = initializeClientFirebase();

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return <FirebaseProvider value={firebaseServices}>{children}</FirebaseProvider>;
}
