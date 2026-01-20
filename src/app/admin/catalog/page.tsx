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
            <Skeleton className="h-24 w-full md:h-10" />
            <Skeleton className="h-24 w-full md:h-10" />
            <Skeleton className="h-24 w-full md:h-10" />
            <Skeleton className="h-24 w-full md:h-10" />
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
      <div className="p-0 md:p-8 md:pt-0">
        <Card>
          <CardContent className="p-0 md:p-6">
            {productsLoading ? (
                <div className="p-4 md:p-0"><CatalogPageSkeleton /></div>
            ) : products && products.length > 0 ? (
                <>
                    {/* Mobile View */}
                    <div className="md:hidden">
                        <div className="divide-y divide-border">
                        {products.map((product) => (
                            <div key={product.id} className="p-4 flex gap-4">
                                {product.images && product.images.length > 0 ? (
                                    <Image
                                        alt={product.name}
                                        className="aspect-square rounded-md object-cover"
                                        height="80"
                                        src={product.images[0]}
                                        width="80"
                                    />
                                ) : (
                                    <div className="aspect-square w-20 h-20 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">Sin img.</div>
                                )}
                                <div className="flex-1 space-y-1">
                                    <p className="font-semibold">{product.name}</p>
                                    <p className="text-sm text-muted-foreground">Gs. {product.price.toLocaleString('es-PY')}</p>
                                    <Badge variant={product.stock > 0 ? 'outline' : 'destructive'}>
                                        {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
                                    </Badge>
                                </div>
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
                                        <DropdownMenuItem onClick={() => handleToggle(product, 'onSale')}>
                                            <Switch className="mr-2 h-4 w-4" checked={product.onSale} /> {product.onSale ? 'Quitar Oferta' : 'Poner en Oferta'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleToggle(product, 'featured')}>
                                            <Switch className="mr-2 h-4 w-4" checked={product.featured} /> {product.featured ? 'Quitar Destacado' : 'Destacar'}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => setDeletingProduct(product)} className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                        </div>
                    </div>

                    {/* Desktop view: Table */}
                    <div className="hidden md:block">
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead className="hidden w-[100px] sm:table-cell">
                                <span className="sr-only">Imagen</span>
                            </TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Precio Venta</TableHead>
                            <TableHead className="hidden lg:table-cell">Precio Oferta</TableHead>
                            <TableHead className="hidden lg:table-cell">En Oferta</TableHead>
                            <TableHead className="hidden lg:table-cell">Destacado</TableHead>
                            <TableHead>
                                <span className="sr-only">Acciones</span>
                            </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id}>
                                <TableCell className="hidden sm:table-cell">
                                    {product.images && product.images.length > 0 ? (
                                    <Image
                                        alt={product.name}
                                        className="aspect-square rounded-md object-cover"
                                        height="64"
                                        src={product.images[0]}
                                        width="64"
                                    />
                                    ) : (
                                    <div className="aspect-square w-16 h-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">Sin img.</div>
                                    )}
                                </TableCell>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>
                                    <Badge variant={product.stock > 0 ? 'outline' : 'destructive'}>
                                        {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
                                    </Badge>
                                </TableCell>
                                <TableCell>Gs. {product.price.toLocaleString('es-PY')}</TableCell>
                                <TableCell className="hidden lg:table-cell">{product.salePrice ? `Gs. ${product.salePrice.toLocaleString('es-PY')}` : '-'}</TableCell>
                                <TableCell className="hidden lg:table-cell"><Switch checked={product.onSale} onCheckedChange={() => handleToggle(product, 'onSale')} /></TableCell>
                                <TableCell className="hidden lg:table-cell"><Switch checked={product.featured} onCheckedChange={() => handleToggle(product, 'featured')} /></TableCell>
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
                            ))}
                        </TableBody>
                        </Table>
                    </div>
                </>
            ) : (
                <p className="h-24 text-center flex items-center justify-center">No hay productos. Agrega uno nuevo.</p>
            )}
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
