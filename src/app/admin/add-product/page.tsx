'use client';

import { useState, useMemo } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

export default function AddProductPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const productsQuery = useMemo(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const { data: allProducts, loading: productsLoading } = useCollection<Product>(productsQuery);

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 pt-0">
        <div className="lg:col-span-2">
            <ProductForm 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            allProducts={allProducts || undefined}
            />
        </div>
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Productos Existentes</CardTitle>
                    <CardDescription>Una vista rápida de tu inventario.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[70vh]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead className="text-right">Stock</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {productsLoading ? (
                                    Array.from({length: 10}).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-1/2 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : allProducts && allProducts.length > 0 ? (
                                    allProducts.map(product => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={product.stock > 0 ? 'outline' : 'destructive'}>{product.stock}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="h-24 text-center">No hay productos.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
