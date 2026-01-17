'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
  type User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<FirebaseUser>;
  logout: () => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<FirebaseUser>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(true);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (userState) => {
      setUser(userState);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const login = async (email: string, pass: string) => {
    if (!auth) throw new Error('Servicio de autenticación no disponible.');
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
  };

  const logout = async () => {
    if (!auth) throw new Error('Servicio de autenticación no disponible.');
    await firebaseSignOut(auth);
  };

  const loginWithGoogle = async () => {
    if (!auth || !firestore) throw new Error('Servicio de Firebase no disponible.');
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    const additionalUserInfo = getAdditionalUserInfo(result);
    if (additionalUserInfo?.isNewUser && user.displayName && user.email) {
        const userProfile = {
            name: user.displayName,
            email: user.email,
            role: 'customer',
        };
        const userDocRef = doc(firestore, 'users', user.uid);
        
        // Ensure the user document is created before proceeding.
        // This prevents race conditions where subsequent code tries to read the document
        // before it has been written to the database.
        await setDoc(userDocRef, userProfile).catch((serverError) => {
            const permissionError = new FirestorePermissionError({
              path: userDocRef.path,
              operation: 'create',
              requestResourceData: userProfile,
            });
            errorEmitter.emit('permission-error', permissionError);
            // Re-throw the error so the calling component knows the registration failed.
            throw serverError;
        });
    }
    return user;
  };

  const register = async (name: string, email: string, pass: string) => {
    if (!auth || !firestore) throw new Error('Servicio de Firebase no disponible.');
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const firebaseUser = userCredential.user;

    // Update Firebase Auth profile displayName
    await updateProfile(firebaseUser, { displayName: name });
    
    // Create a user profile document in Firestore
    const userProfile = { name, email, role: 'customer' };
    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    
    setDoc(userDocRef, userProfile).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'create',
          requestResourceData: userProfile,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  const sendPasswordReset = async (email: string) => {
    if (!auth) throw new Error('Servicio de autenticación no disponible.');
    await sendPasswordResetEmail(auth, email);
  };

  const value = { user, loading, login, logout, register, loginWithGoogle, sendPasswordReset };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
