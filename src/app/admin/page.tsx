'use client';

import { useCollection, useFirestore, useAuth, useDoc } from '@/firebase';
import { addDoc, collection, deleteDoc, doc, updateDoc, query } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Product, Order, UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Loader2, Sparkles, Upload, Pencil, Trash2, Package, ShoppingCart as ShoppingCartIcon } from 'lucide-react';
import { useState, useRef, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { generateProductImageAction, generateProductDescriptionAction, suggestProductCategoryAction } from '@/app/actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';


const productSchema = z.object({
  name: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().trim().min(10, 'La descripción es muy corta'),
  price: z.coerce.number().positive('El precio debe ser un número positivo'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser un número negativo.'),
  category: z.string().trim().min(2, 'La categoría es requerida'),
  condition: z.enum(['Nuevo', 'Usado', 'Reacondicionado']),
  color: z.string().trim().optional(),
  image: z.string().trim().min(10, 'La URL o Data URI de la imagen es requerida.'),
  imageHint: z.string().trim().max(40, "La pista para la IA no debe exceder los 40 caracteres").optional(),
  onSale: z.boolean().default(false),
});

const orderStatuses: Order['status'][] = ['Procesando', 'Pendiente de Pago', 'Pagado', 'Enviado', 'Entregado', 'Cancelado'];


export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(user ? `users/${user.uid}` : null);
  
  const isAuthorized = useMemo(() => userProfile?.role === 'admin', [userProfile]);

  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!user || !isAuthorized) {
        toast({
            variant: 'destructive',
            title: 'Acceso Denegado',
            description: 'Debes ser un administrador para ver esta página.',
        });
        router.replace('/');
      }
    }
  }, [authLoading, profileLoading, user, isAuthorized, router, toast]);

  const firestore = useFirestore();
  // Prevent queries from running if not authorized
  const productsQuery = useMemo(() => (isAuthorized && firestore) ? collection(firestore, 'products') : null, [firestore, isAuthorized]);
  const { data: products, loading: productsLoading } = useCollection<Product>(productsQuery);
  const ordersQuery = useMemo(() => (isAuthorized && firestore) ? collection(firestore, 'orders') : null, [firestore, isAuthorized]);
  const { data: orders, loading: ordersLoading } = useCollection<Order>(ordersQuery);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isSuggestingCategory, setIsSuggestingCategory] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 1,
      category: '',
      condition: 'Nuevo',
      color: '',
      image: '',
      imageHint: '',
      onSale: false,
    },
  });

  const categories = useMemo(() => {
    if (!products) return [];
    return [...new Set(products.map(p => p.category).filter(Boolean))];
  }, [products]);

  const sortedOrders = useMemo(() => {
    if (!orders) return [];
    return [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders]);


  const imageUrl = form.watch('image');

  const handleSuggestCategory = async () => {
    const productName = form.getValues('name');
    if (!productName || form.getValues('category')) return;
    setIsSuggestingCategory(true);
    const result = await suggestProductCategoryAction(productName);
    setIsSuggestingCategory(false);
    if (result.success && result.category) {
        form.setValue('category', result.category, { shouldValidate: true });
        toast({ title: 'Categoría Sugerida', description: `Se sugirió la categoría "${result.category}".` });
    } else {
        console.warn('Could not suggest a category:', result.message);
    }
  };

  const onCreateSubmit = async (values: z.infer<typeof productSchema>) => {
    if (!firestore) return;
    setIsSubmitting(true);
    const productsCollection = collection(firestore, 'products');
    const dataToSave = { ...values };
    
    if (!dataToSave.color) delete (dataToSave as Partial<typeof dataToSave>).color;
    if (!dataToSave.imageHint) delete (dataToSave as Partial<typeof dataToSave>).imageHint;
    
    addDoc(productsCollection, dataToSave)
      .then(() => {
        toast({ title: 'Producto Agregado', description: `El producto "${values.name}" ha sido creado.` });
        form.reset();
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({ path: productsCollection.path, operation: 'create', requestResourceData: dataToSave });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setIsSubmitting(false));
  };
  
  const onUpdateSubmit = async (values: z.infer<typeof productSchema>) => {
    if (!editingProduct || !firestore) return;
    setIsSubmitting(true);
    const productDocRef = doc(firestore, 'products', editingProduct.id);
    
    updateDoc(productDocRef, values)
      .then(() => {
        toast({ title: 'Producto Actualizado', description: `El producto "${values.name}" ha sido guardado.` });
        setIsEditDialogOpen(false);
        setEditingProduct(null);
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({ path: productDocRef.path, operation: 'update', requestResourceData: values });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    form.reset(product);
    setIsEditDialogOpen(true);
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

  const handleGenerateImage = async () => {
    const imageHint = form.getValues('imageHint');
    if (!imageHint) {
        toast({ variant: 'destructive', title: 'Pista Requerida', description: 'Por favor, ingresa una pista para la IA.' });
        return;
    }
    setIsGeneratingImage(true);
    const result = await generateProductImageAction(imageHint);
    setIsGeneratingImage(false);
    if (result.success && result.imageUrl) {
        form.setValue('image', result.imageUrl, { shouldValidate: true });
        toast({ title: 'Imagen Generada', description: 'La imagen ha sido generada y añadida.' });
    } else {
        toast({ variant: 'destructive', title: 'Error de Generación', description: result.message || 'Ocurrió un error inesperado.' });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 750 * 1024) {
        toast({ variant: 'destructive', title: 'Archivo muy grande', description: 'La imagen debe ser menor a 750KB.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('image', reader.result as string, { shouldValidate: true });
        toast({ title: 'Imagen Cargada', description: 'La imagen ha sido añadida.' });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleGenerateDescription = async () => {
    const productName = form.getValues('name');
    if (!productName) {
        toast({ variant: 'destructive', title: 'Nombre Requerido', description: 'Ingresa un nombre de producto.' });
        return;
    }
    setIsGeneratingDescription(true);
    const result = await generateProductDescriptionAction(productName);
    setIsGeneratingDescription(false);
    if (result.success && result.description) {
        form.setValue('description', result.description, { shouldValidate: true });
        toast({ title: 'Descripción Generada', description: 'La descripción ha sido generada y añadida.' });
    } else {
        toast({ variant: 'destructive', title: 'Error de Generación', description: result.message || 'Ocurrió un error inesperado.' });
    }
  };

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    if (!firestore) return;
    const orderDocRef = doc(firestore, 'orders', orderId);
    updateDoc(orderDocRef, { status })
      .then(() => {
        toast({
          title: 'Estado Actualizado',
          description: `El pedido #${orderId.substring(0, 6)}... ahora está "${status}".`,
        });
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({ path: orderDocRef.path, operation: 'update', requestResourceData: { status } });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const isLoading = authLoading || profileLoading;
  if (isLoading || !isAuthorized) {
    return (
        <div className="container mx-auto px-4 py-12 flex items-center justify-center h-[70vh]">
            <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                <h2 className="text-xl font-semibold">Verificando permisos...</h2>
                <p className="text-muted-foreground">Un momento, por favor.</p>
            </div>
        </div>
    );
  }

  // Common form fields component to avoid repetition
  const ProductFormFields = () => (
    <>
      <FormField control={form.control} name="name" render={({ field }) => (
        <FormItem>
          <FormLabel>Nombre del Producto</FormLabel>
          <FormControl><Input placeholder="Ej: Smartphone X1" {...field} onBlur={handleSuggestCategory} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name="description" render={({ field }) => (
        <FormItem>
          <div className="flex justify-between items-center mb-2">
            <FormLabel>Descripción</FormLabel>
            <Button type="button" variant="outline" size="sm" onClick={handleGenerateDescription} disabled={isGeneratingDescription || !form.watch('name')}>
              {isGeneratingDescription ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />} Generar con IA
            </Button>
          </div>
          <FormControl><Textarea placeholder="Describe el producto..." {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <div className="grid grid-cols-2 gap-4">
        <FormField control={form.control} name="price" render={({ field }) => (
          <FormItem><FormLabel>Precio (Gs.)</FormLabel><FormControl><Input type="number" placeholder="500000" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="stock" render={({ field }) => (
          <FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" placeholder="10" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField control={form.control} name="category" render={({ field }) => (
          <FormItem>
            <FormLabel>Categoría</FormLabel>
            <div className="relative">
              <FormControl><Input placeholder="Ej: Tecnología" {...field} list="category-list" disabled={isSuggestingCategory} /></FormControl>
              {isSuggestingCategory && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
              <datalist id="category-list">{categories.map(cat => <option key={cat} value={cat} />)}</datalist>
            </div>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="condition" render={({ field }) => (
          <FormItem>
            <FormLabel>Condición</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona una condición" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Nuevo">Nuevo</SelectItem><SelectItem value="Usado">Usado</SelectItem><SelectItem value="Reacondicionado">Reacondicionado</SelectItem></SelectContent></Select>
            <FormMessage />
          </FormItem>
        )} />
      </div>
      <FormField control={form.control} name="color" render={({ field }) => (
        <FormItem><FormLabel>Color (Opcional)</FormLabel><FormControl><Input placeholder="Ej: Negro, Plateado" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <Card className="bg-muted/50 p-4 space-y-4 border-dashed">
        <FormLabel className="text-base font-semibold">Imagen del Producto</FormLabel>
        <FormField control={form.control} name="imageHint" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">Pista para IA (Opcional)</FormLabel>
            <FormControl><Input placeholder="ej: smartphone moderno, fondo blanco" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleGenerateImage} disabled={isGeneratingImage}>{isGeneratingImage ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />} Generar con IA</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting || isGeneratingImage}><Upload className="mr-2 h-4 w-4" /> Subir archivo</Button>
          <Input ref={fileInputRef} type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileSelect} />
        </div>
        {imageUrl && <div className="border rounded-md p-2 bg-background"><Image src={imageUrl} alt="Vista previa" width={120} height={120} className="rounded-md object-contain mx-auto aspect-square" /></div>}
        <FormField control={form.control} name="image" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">URL o Data URI</FormLabel>
            <FormControl><Textarea placeholder="Genera, sube o pega una URL aquí." className="min-h-[80px]" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </Card>
    </>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products"><Package className="mr-2 h-4 w-4"/>Gestionar Productos</TabsTrigger>
            <TabsTrigger value="orders"><ShoppingCartIcon className="mr-2 h-4 w-4"/>Gestionar Pedidos</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1">
                <Card>
                    <CardHeader><CardTitle>Crear Nuevo Producto</CardTitle><CardDescription>Completa el formulario para agregar un producto.</CardDescription></CardHeader>
                    <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-6">
                        <ProductFormFields />
                        <Button type="submit" disabled={isSubmitting || isGeneratingImage || isGeneratingDescription} className="w-full">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Agregar Producto'}
                        </Button>
                        </form>
                    </Form>
                    </CardContent>
                </Card>
                </div>
                <div className="lg:col-span-2">
                <Card>
                    <CardHeader><CardTitle>Productos Existentes</CardTitle><CardDescription>Lista de todos los productos en la tienda.</CardDescription></CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Imagen</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {productsLoading ? (
                            <TableRow><TableCell colSpan={5} className="text-center">Cargando productos...</TableCell></TableRow>
                        ) : products && products.length > 0 ? (
                            products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell><Image src={product.image} alt={product.name} width={40} height={40} className="rounded-md object-cover" /></TableCell>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>Gs. {product.price.toLocaleString('es-PY')}</TableCell>
                                <TableCell>{product.stock > 0 ? product.stock : 'Agotado'}</TableCell>
                                <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(product)}>
                                    <Pencil className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog open={!!deletingProduct && deletingProduct.id === product.id} onOpenChange={(isOpen) => !isOpen && setDeletingProduct(null)}>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeletingProduct(product)}>
                                        <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
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
                                </div>
                                </TableCell>
                            </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={5} className="text-center h-24">No hay productos. Agrega uno nuevo.</TableCell></TableRow>
                        )}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
                </div>
            </div>
        </TabsContent>
        <TabsContent value="orders">
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Pedidos</CardTitle>
                    <CardDescription>Visualiza y gestiona los pedidos de tus clientes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pedido ID</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead className='w-[180px]'>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {ordersLoading ? (
                            <TableRow><TableCell colSpan={5} className="text-center h-24">Cargando pedidos...</TableCell></TableRow>
                        ) : sortedOrders && sortedOrders.length > 0 ? (
                            sortedOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium font-mono text-xs">#{order.id.substring(0, 7)}...</TableCell>
                                    <TableCell>{order.customerRazonSocial}</TableCell>
                                    <TableCell>{new Date(order.createdAt).toLocaleDateString('es-PY')}</TableCell>
                                    <TableCell>Gs. {order.total.toLocaleString('es-PY')}</TableCell>
                                    <TableCell>
                                        <Select 
                                            defaultValue={order.status} 
                                            onValueChange={(newStatus) => handleUpdateStatus(order.id, newStatus as Order['status'])}
                                        >
                                            <SelectTrigger className="w-full h-9">
                                                <SelectValue placeholder="Cambiar estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {orderStatuses.map(status => (
                                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={5} className="text-center h-24">No se han realizado pedidos todavía.</TableCell></TableRow>
                        )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>Realiza cambios en el producto. Haz clic en "Guardar" cuando termines.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onUpdateSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto px-1">
               <ProductFormFields />
            </form>
          </Form>
           <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" onClick={form.handleSubmit(onUpdateSubmit)} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Guardar Cambios'}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
