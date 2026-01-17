'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  type Query,
  type DocumentData,
  type QuerySnapshot,
  type FirestoreError,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useCollection<T extends DocumentData>(
  query: Query<DocumentData> | null | undefined
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!query) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          result.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(result);
        setLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        setError(err);
        setLoading(false);
        // It's hard to get a precise path from a generic query object.
        // We will pass a generic path for the error context.
        const permissionError = new FirestorePermissionError({
          path: 'collection query',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => unsubscribe();
  }, [query]); // The dependency is now the query object itself.

  return { data, loading, error };
}
