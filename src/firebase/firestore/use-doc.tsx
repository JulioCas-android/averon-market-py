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
    // Return null if db or docPath is not available
    if (!db || !docPath) return null;
    return doc(db, docPath);
  }, [db, docPath]);

  useEffect(() => {
    if (!docRef) {
      // If we don't have a doc ref, we are either not ready (db missing)
      // or there is no path. If there's a path but no db, we are loading.
      // If there's no path, we are not loading.
      if (docPath && !db) {
        setLoading(true);
      } else {
        setLoading(false);
      }
      setData(null);
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
  }, [docRef, db, docPath]); // Dependencies updated to correctly manage loading state

  return { data, loading, error };
}
