'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useCollection } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { PageHeader } from '@/components/admin/page-header';
import { ProductForm, productFormSchema } from '@/components/admin/product-form';
import { z } from 'zod';
import type { Product } from '@/lib/types';

export default function AddProductPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const productsQuery = firestore ? collection(firestore, 'products') : null;
  const { data: allProducts } = useCollection<Product>(productsQuery);

  const handleSubmit = async (values: z.infer<typeof productFormSchema>) => {
    if (!firestore) return;
    setIsSubmitting(true);
    
    const productsCollection = collection(firestore, 'products');
    const dataToSave = { ...values };
    
    if (!dataToSave.color) delete (dataToSave as Partial<typeof dataToSave>).color;
    if (!dataToSave.imageHint) delete (dataToSave as Partial<typeof dataToSave>).imageHint;
    if (dataToSave.salePrice === 0 || dataToSave.salePrice === undefined) delete (dataToSave as Partial<typeof dataToSave>).salePrice;

    addDoc(productsCollection, dataToSave)
      .then(() => {
        toast({ title: 'Producto Agregado', description: `El producto "${values.name}" ha sido creado.` });
        router.push('/admin/catalog');
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({ path: productsCollection.path, operation: 'create', requestResourceData: dataToSave });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <>
      <PageHeader
        title="Registrar Nuevo Producto"
        description="Rellena la información para añadir un producto a tu inventario."
      />
      <div className="p-8 pt-0">
        <ProductForm 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          allProducts={allProducts || undefined}
        />
      </div>
    </>
  );
}
