'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  doc,
  onSnapshot,
  type DocumentData,
  type DocumentSnapshot,
  type FirestoreError,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useDoc<T extends DocumentData>(
  docPath: string | null | undefined
) {
  const db = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const docRef = useMemo(() => {
    if (!docPath) return null;
    return doc(db, docPath);
  }, [db, docPath]);

  useEffect(() => {
    if (!docRef) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      async (err: FirestoreError) => {
        setError(err);
        setLoading(false);
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => unsubscribe();
  }, [docRef]);

  return { data, loading, error };
}
