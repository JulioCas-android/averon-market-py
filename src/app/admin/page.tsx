'use client';

import { useCollection, useFirestore } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Product } from '@/lib/types';
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
import { Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { generateProductImageAction } from '@/app/actions';

const productSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción es muy corta'),
  price: z.coerce.number().positive('El precio debe ser un número positivo'),
  category: z.string().min(2, 'La categoría es requerida'),
  image: z.string().min(10, 'La URL o Data URI de la imagen es requerida.'),
  imageHint: z.string().min(2, 'La pista para la IA es requerida').max(40, "La pista para la IA no debe exceder dos palabras"),
  availability: z.enum(['in-stock', 'out-of-stock']),
  onSale: z.boolean().default(false),
});

export default function AdminPage() {
  const firestore = useFirestore();
  const { data: products, loading: productsLoading } = useCollection<Product>('products');
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: '',
      image: '',
      imageHint: '',
      availability: 'in-stock',
      onSale: false,
    },
  });

  const imageUrl = form.watch('image');

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    setIsSubmitting(true);
    const productsCollection = collection(firestore, 'products');
    
    addDoc(productsCollection, values)
      .then(() => {
        toast({
          title: 'Producto Agregado',
          description: `El producto "${values.name}" ha sido creado con éxito.`,
        });
        form.reset();
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: productsCollection.path,
          operation: 'create',
          requestResourceData: values,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleGenerateImage = async () => {
    const imageHint = form.getValues('imageHint');
    if (!imageHint) {
        toast({
            variant: 'destructive',
            title: 'Pista Requerida',
            description: 'Por favor, ingresa una pista para la IA antes de generar la imagen.',
        });
        return;
    }

    setIsGeneratingImage(true);
    const result = await generateProductImageAction(imageHint);
    setIsGeneratingImage(false);

    if (result.success && result.imageUrl) {
        form.setValue('image', result.imageUrl, { shouldValidate: true });
        toast({
            title: 'Imagen Generada',
            description: 'La imagen ha sido generada y añadida al formulario.',
        });
    } else {
        toast({
            variant: 'destructive',
            title: 'Error de Generación',
            description: result.message || 'Ocurrió un error inesperado.',
        });
    }
  };


  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Crear Nuevo Producto</CardTitle>
              <CardDescription>Completa el formulario para agregar un nuevo producto a la tienda.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Producto</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Smartphone X1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe el producto..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio (Gs.)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="500000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Tecnología" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="imageHint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pista para IA de Imagen</FormLabel>
                          <FormControl>
                            <Input placeholder="ej: smartphone moderno" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleGenerateImage} disabled={isGeneratingImage}>
                      {isGeneratingImage ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      Generar con IA
                    </Button>
                  </div>

                  {imageUrl && (
                    <div className="border rounded-md p-2">
                       <Image src={imageUrl} alt="Vista previa de imagen generada" width={100} height={100} className="rounded-md object-cover mx-auto" />
                    </div>
                   )}

                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL de la Imagen</FormLabel>
                        <FormControl>
                          <Textarea placeholder="https://... o genera una con IA." className="min-h-[60px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="availability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disponibilidad</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona disponibilidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="in-stock">En Stock</SelectItem>
                            <SelectItem value="out-of-stock">Agotado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <Button type="submit" disabled={isSubmitting || isGeneratingImage} className="w-full">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Agregar Producto'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
           <Card>
            <CardHeader>
              <CardTitle>Productos Existentes</CardTitle>
              <CardDescription>Lista de todos los productos actualmente en la tienda.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagen</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Cargando productos...</TableCell>
                    </TableRow>
                  ) : products && products.length > 0 ? (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Image src={product.image} alt={product.name} width={40} height={40} className="rounded-md object-cover" />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>Gs. {product.price.toLocaleString('es-PY')}</TableCell>
                        <TableCell>{product.availability === 'in-stock' ? 'En Stock' : 'Agotado'}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">Editar</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                     <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">No hay productos. Agrega uno nuevo para empezar.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
