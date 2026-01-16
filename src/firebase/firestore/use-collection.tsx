'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  type Query,
  type DocumentData,
  type QuerySnapshot,
  type FirestoreError,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useCollection<T extends DocumentData>(
  collectionPath: string | null | undefined
) {
  const db = useFirestore();
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const colRef = useMemo(() => {
    if (!collectionPath) return null;
    return collection(db, collectionPath);
  }, [db, collectionPath]);

  useEffect(() => {
    if (!colRef) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          result.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(result);
        setLoading(false);
        setError(null);
      },
      async (err: FirestoreError) => {
        setError(err);
        setLoading(false);
        const permissionError = new FirestorePermissionError({
          path: colRef.path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => unsubscribe();
  }, [colRef]);

  return { data, loading, error };
}
