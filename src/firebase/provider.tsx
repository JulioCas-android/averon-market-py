'use client';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { createContext, useContext, type ReactNode } from 'react';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseContextValue {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

// The context can now hold `null` for server-side rendering.
const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: FirebaseContextValue | null; // Allow null value
}) {
  return (
    <FirebaseContext.Provider value={value}>
      {children}
      {/* The listener should only be active when firebase is initialized on the client */}
      {value && <FirebaseErrorListener />}
    </FirebaseContext.Provider>
  );
}

// Hooks are updated to be safe during SSR when the context value is `null`.
// They will return `undefined` instead of throwing an error.

export function useFirebase() {
  return useContext(FirebaseContext);
}
export function useFirebaseApp() {
  return useFirebase()?.firebaseApp;
}
export function useFirestore() {
  return useFirebase()?.firestore;
}
export function useAuth() {
  return useFirebase()?.auth;
}
