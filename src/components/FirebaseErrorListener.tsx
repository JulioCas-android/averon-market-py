'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * A client-side component that listens for custom 'permission-error' events
 * and displays appropriate feedback to the user. In development, it logs
 * a detailed error to the console for easier debugging of security rules.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: unknown) => {
      // In development, log the rich, contextual error to the dev console.
      // This will be picked up by the Next.js error overlay.
      if (process.env.NODE_ENV === 'development') {
        if (error instanceof FirestorePermissionError) {
          console.error(error);
        }
      }

      // In all environments, show a user-friendly toast notification.
      toast({
        variant: 'destructive',
        title: 'Error de permisos',
        description: 'No tienes los permisos necesarios para realizar esta acción.',
      });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null; // This component does not render anything to the DOM.
}
