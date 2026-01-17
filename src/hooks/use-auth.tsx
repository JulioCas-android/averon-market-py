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
  getAdditionalUserInfo,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<FirebaseUser>;
  logout: () => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!auth || !firestore) {
      setLoading(true);
      return;
    }
    
    // Listener principal del estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (userState) => {
      setUser(userState);
      setLoading(false);
    });

    // Procesa el resultado de la redirección de inicio de sesión
    getRedirectResult(auth)
      .then(async (result) => {
        if (!result) {
          return; // No es un inicio de sesión por redirección
        }
        
        setLoading(true);
        toast({ title: 'Iniciando sesión...', description: 'Un momento por favor.' });

        const user = result.user;
        const additionalUserInfo = getAdditionalUserInfo(result);
        const isNewUser = additionalUserInfo?.isNewUser ?? false;

        // Si es un usuario nuevo, crea su perfil en Firestore
        if (isNewUser && user.displayName && user.email) {
          const userProfile = {
            name: user.displayName,
            email: user.email,
            role: 'customer',
          };
          const userDocRef = doc(firestore, 'users', user.uid);
          
          await setDoc(userDocRef, userProfile).catch((serverError) => {
            const permissionError = new FirestorePermissionError({
              path: userDocRef.path,
              operation: 'create',
              requestResourceData: userProfile,
            });
            errorEmitter.emit('permission-error', permissionError);
          });

          toast({ title: '¡Bienvenido!', description: 'Tu cuenta ha sido creada.' });
          router.push('/profile');
          return;
        }

        // Si es un usuario existente, comprueba su rol y redirige
        if (!isNewUser) {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          toast({ title: 'Inicio de Sesión Exitoso', description: 'Bienvenido de nuevo.' });
          if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/profile');
          }
        }
      })
      .catch((error) => {
        console.error('Error en la redirección de inicio de sesión de Google:', error);
        toast({ variant: 'destructive', title: 'Error de inicio de sesión', description: 'No se pudo completar el inicio de sesión con Google.' });
        setLoading(false);
      });
      
    return () => unsubscribe();
  }, [auth, firestore, router, toast]);

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
    if (!auth) throw new Error('Servicio de Firebase no disponible.');
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  const register = async (name: string, email: string, pass: string) => {
    if (!auth || !firestore) throw new Error('Servicio de Firebase no disponible.');
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const firebaseUser = userCredential.user;

    await updateProfile(firebaseUser, { displayName: name });
    
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
