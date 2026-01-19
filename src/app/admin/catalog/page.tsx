'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductForm, productFormSchema } from '@/components/admin/product-form';
import { z } from 'zod';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

function CatalogPageSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    )
}

export default function CatalogPage() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  const productsQuery = useMemo(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const { data: products, loading: productsLoading } = useCollection<Product>(productsQuery);
  const { data: allProducts } = useCollection<Product>(productsQuery);


  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggle = async (product: Product, field: 'onSale' | 'featured') => {
    if (!firestore) return;
    const productDocRef = doc(firestore, 'products', product.id);
    await updateDoc(productDocRef, { [field]: !product[field] }).catch((serverError) => {
        const permissionError = new FirestorePermissionError({ path: productDocRef.path, operation: 'update', requestResourceData: { [field]: !product[field] } });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleDelete = async () => {
    if (!deletingProduct || !firestore) return;
    const productDocRef = doc(firestore, 'products', deletingProduct.id);
    deleteDoc(productDocRef)
      .then(() => {
        toast({ title: 'Producto Eliminado', description: `"${deletingProduct.name}" fue eliminado.` });
        setDeletingProduct(null);
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({ path: productDocRef.path, operation: 'delete' });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleUpdateSubmit = async (values: z.infer<typeof productFormSchema>) => {
    if (!editingProduct || !firestore) return;
    setIsSubmitting(true);
    const productDocRef = doc(firestore, 'products', editingProduct.id);

    const dataToUpdate = { ...values };
    if (dataToUpdate.salePrice === 0 || dataToUpdate.salePrice === undefined) {
        (dataToUpdate as Partial<typeof dataToUpdate>).salePrice = undefined;
    }
    
    await updateDoc(productDocRef, dataToUpdate)
      .then(() => {
        toast({ title: 'Producto Actualizado', description: `El producto "${values.name}" ha sido guardado.` });
        setEditingProduct(null);
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({ path: productDocRef.path, operation: 'update', requestResourceData: values });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <>
      <PageHeader title="Administrar Catálogo" description="Gestiona los productos de tu tienda.">
        <Button onClick={() => router.push('/admin/add-product')}>Agregar Producto</Button>
      </PageHeader>
      <div className="p-8 pt-0">
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Imagen</span>
                  </TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Precio Venta</TableHead>
                  <TableHead>Precio Oferta</TableHead>
                  <TableHead>En Oferta</TableHead>
                  <TableHead>Destacado</TableHead>
                  <TableHead>
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsLoading ? (
                    <TableRow><TableCell colSpan={8} className="h-24 text-center"><CatalogPageSkeleton /></TableCell></TableRow>
                ) : products && products.length > 0 ? (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="hidden sm:table-cell">
                        <Image
                          alt={product.name}
                          className="aspect-square rounded-md object-cover"
                          height="64"
                          src={product.image}
                          width="64"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant={product.stock > 0 ? 'outline' : 'destructive'}>
                            {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
                        </Badge>
                      </TableCell>
                      <TableCell>Gs. {product.price.toLocaleString('es-PY')}</TableCell>
                      <TableCell>{product.salePrice ? `Gs. ${product.salePrice.toLocaleString('es-PY')}` : '-'}</TableCell>
                      <TableCell><Switch checked={product.onSale} onCheckedChange={() => handleToggle(product, 'onSale')} /></TableCell>
                      <TableCell><Switch checked={product.featured} onCheckedChange={() => handleToggle(product, 'featured')} /></TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                              <Pencil className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setDeletingProduct(product)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                    <TableRow><TableCell colSpan={8} className="h-24 text-center">No hay productos. Agrega uno nuevo.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(isOpen) => !isOpen && setEditingProduct(null)}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>Realiza cambios en el producto. Haz clic en "Guardar" cuando termines.</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto -mx-6 px-6">
            <ProductForm 
                initialData={editingProduct} 
                onSubmit={handleUpdateSubmit}
                isSubmitting={isSubmitting}
                allProducts={allProducts || undefined}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Alert */}
      <AlertDialog open={!!deletingProduct} onOpenChange={(isOpen) => !isOpen && setDeletingProduct(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                  Esta acción es permanente y no se puede deshacer. Se eliminará el producto: <span className="font-semibold">{deletingProduct?.name}</span>.
              </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
