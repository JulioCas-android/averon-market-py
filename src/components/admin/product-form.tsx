'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Upload, FileCheck2, Switch } from 'lucide-react';
import { useState, useRef, useMemo } from 'react';
import Image from 'next/image';
import { generateProductImageAction, generateProductDescriptionAction, suggestProductCategoryAction } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export const productFormSchema = z.object({
  name: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().trim().min(10, 'La descripción es muy corta'),
  price: z.coerce.number().positive('El precio debe ser un número positivo'),
  salePrice: z.coerce.number().optional(),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser un número negativo.'),
  category: z.string().trim().min(2, 'La categoría es requerida'),
  condition: z.enum(['Nuevo', 'Usado', 'Reacondicionado']),
  color: z.string().trim().optional(),
  image: z.string().trim().min(10, 'La URL o Data URI de la imagen es requerida.'),
  imageHint: z.string().trim().max(40, "La pista para la IA no debe exceder los 40 caracteres").optional(),
  onSale: z.boolean().default(false),
  featured: z.boolean().default(false),
});

type ProductFormProps = {
  initialData?: Product | null;
  allProducts?: Product[];
  onSubmit: (values: z.infer<typeof productFormSchema>) => Promise<void>;
  isSubmitting: boolean;
};

export function ProductForm({ initialData, allProducts, onSubmit, isSubmitting }: ProductFormProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isSuggestingCategory, setIsSuggestingCategory] = useState(false);

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData ? {
      ...initialData,
      salePrice: initialData.salePrice ?? undefined,
    } : {
      name: '',
      description: '',
      price: 0,
      salePrice: undefined,
      stock: 1,
      category: '',
      condition: 'Nuevo',
      color: '',
      image: '',
      imageHint: '',
      onSale: false,
      featured: false,
    },
  });

  const categories = useMemo(() => {
    if (!allProducts) return [];
    return [...new Set(allProducts.map(p => p.category).filter(Boolean))];
  }, [allProducts]);

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

  const imageUrl = form.watch('image');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Producto</CardTitle>
              <CardDescription>Completa los detalles principales de tu producto.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  <FormControl><Textarea placeholder="Describe el producto..." {...field} rows={6} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Imágenes</CardTitle>
              <CardDescription>Añade una imagen para tu producto.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              {imageUrl && <div className="border rounded-md p-2 bg-background max-w-[150px]"><Image src={imageUrl} alt="Vista previa" width={150} height={150} className="rounded-md object-contain mx-auto aspect-square" /></div>}
              <FormField control={form.control} name="image" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">URL o Data URI</FormLabel>
                  <FormControl><Textarea placeholder="Genera, sube o pega una URL aquí." className="min-h-[80px]" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Precios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio de Venta (Gs.)</FormLabel>
                  <FormControl><Input type="number" placeholder="500000" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="salePrice" render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio de Oferta (Gs.)</FormLabel>
                  <FormControl><Input type="number" placeholder="450000" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="stock" render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl><Input type="number" placeholder="10" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
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
              <FormField control={form.control} name="color" render={({ field }) => (
                <FormItem>
                  <FormLabel>Color (Opcional)</FormLabel>
                  <FormControl><Input placeholder="Ej: Negro, Plateado" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="onSale" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>En Oferta</FormLabel>
                    <FormMessage />
                  </div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
               <FormField control={form.control} name="featured" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Destacado</FormLabel>
                     <FormMessage />
                  </div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
            </CardContent>
          </Card>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? <Loader2 className="animate-spin" /> : <><FileCheck2 className="mr-2 h-4 w-4" />{initialData ? 'Guardar Cambios' : 'Guardar Producto'}</>}
          </Button>
        </div>
      </form>
    </Form>
  );
}
