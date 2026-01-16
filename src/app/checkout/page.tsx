'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image';
import { useAuth, useFirestore } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, ShoppingCart } from 'lucide-react';
import type { Order } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';


const checkoutSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  email: z.string().email('El email es inválido'),
  phone: z.string().min(6, 'El teléfono es requerido'),
  address: z.string(),
  city: z.string(),
  deliveryOption: z.enum(['delivery', 'pickup']).default('delivery')
}).superRefine((data, ctx) => {
  if (data.deliveryOption === 'delivery') {
    if (data.address.trim().length < 5) {
      ctx.addIssue({ code: 'custom', path: ['address'], message: 'La dirección completa es requerida.' });
    }
    if (data.city.trim().length < 2) {
      ctx.addIssue({ code: 'custom', path: ['city'], message: 'La ciudad es requerida.' });
    }
  }
});


export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      email: '',
      address: '',
      city: '',
      phone: '',
      deliveryOption: 'delivery',
    },
  });

  const deliveryOption = form.watch('deliveryOption');

  if (items.length === 0 && !isProcessing) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mt-2">Agrega productos para poder continuar con la compra.</p>
        <Button onClick={() => router.push('/')} className="mt-6">Volver a la tienda</Button>
      </div>
    );
  }

  const handleCheckout = async (paymentMethod: 'COD' = 'COD') => {
      const isValid = await form.trigger();
      if (!isValid) {
        toast({
            variant: 'destructive',
            title: 'Formulario incompleto',
            description: 'Por favor, completa los campos requeridos antes de continuar.',
        });
        return;
      }

      setIsProcessing(true);
    
    if (!firestore) {
        toast({
            variant: 'destructive',
            title: 'Error de conexión',
            description: 'No se pudo conectar a la base de datos. Inténtalo de nuevo.',
        });
        setIsProcessing(false);
        return;
    }

    const formValues = form.getValues();
    const ordersCollection = collection(firestore, 'orders');

    const newOrder: Omit<Order, 'id'> = {
      ...(user && { userId: user.uid }),
      customerName: formValues.name,
      customerEmail: formValues.email,
      shippingAddress: deliveryOption === 'delivery' ? formValues.address : 'Retiro en tienda',
      shippingCity: deliveryOption === 'delivery' ? formValues.city : 'Asunción',
      shippingPhone: formValues.phone,
      items: items.map(item => ({ ...item, product: { ...item.product } })), // Ensure plain objects
      total,
      status: 'Pendiente de Pago',
      createdAt: new Date().toISOString(),
    };
    
    addDoc(ordersCollection, newOrder)
    .then(() => {
        clearCart();
        router.push(`/order-confirmation?method=${paymentMethod}`);
    })
    .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
        path: ordersCollection.path,
        operation: 'create',
        requestResourceData: newOrder,
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsProcessing(false);
    });
  };

  const onSubmit = () => {
    handleCheckout('COD');
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Finalizar Compra</h1>
      
        <div className="space-y-8">
            <Card>
                <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                {items.map(item => (
                    <div key={item.product.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Image src={item.product.image} alt={item.product.name} width={64} height={64} className="rounded-md object-cover" />
                        <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                        </div>
                    </div>
                    <p className="font-semibold">Gs. {(item.product.price * item.quantity).toLocaleString('es-PY')}</p>
                    </div>
                ))}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                    <p>Total</p>
                    <p>Gs. {total.toLocaleString('es-PY')}</p>
                </div>
                </CardContent>
            </Card>

            <Form {...form}>
            <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Elegí una opción de entrega</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup 
                            value={deliveryOption} 
                            onValueChange={(value) => form.setValue('deliveryOption', value as 'delivery' | 'pickup', { shouldValidate: true })}
                            className="space-y-4"
                        >
                            <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:bg-muted/50">
                                <FormControl>
                                    <RadioGroupItem value="delivery" id="delivery"/>
                                </FormControl>
                                <FormLabel htmlFor="delivery" className="font-normal text-base cursor-pointer">
                                    Quiero agregar una nueva dirección
                                </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:bg-muted/50">
                                <FormControl>
                                    <RadioGroupItem value="pickup" id="pickup"/>
                                </FormControl>
                                <FormLabel htmlFor="pickup" className="font-normal text-base cursor-pointer">
                                    Prefiero pasar por la tienda (Asunción)
                                </FormLabel>
                            </FormItem>
                        </RadioGroup>
                    </CardContent>
                </Card>
                
                {deliveryOption === 'pickup' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Información de Retiro</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                      <p>Puede ser retirado de la tienda <strong>AVERON Market</strong> 3 horas después de recibir el mensaje con tu número de <strong>FACTURA</strong>, vía WhatsApp.</p>
                      <div>
                        <h4 className="font-semibold text-foreground">Dirección:</h4>
                        <p>Avda. Eusebio Ayala e/ Prof. Sergio Conradi. <a href="#" className="text-primary underline">Ver mapa</a></p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Horarios de Atención:</h4>
                        <p>Lunes a Domingo: 09:00 a 21:00</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Tus Datos de Contacto {deliveryOption === 'delivery' && 'y Envío'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Nombre Completo</FormLabel>
                                <FormControl><Input placeholder="Tu nombre" {...field} disabled={isProcessing}/></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Email de Contacto</FormLabel>
                                <FormControl><Input placeholder="tu@email.com" type="email" {...field} disabled={isProcessing}/></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}/>
                        </div>

                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Teléfono de Contacto</FormLabel>
                                <FormControl><Input placeholder="Tu número de teléfono" type="tel" {...field} disabled={isProcessing}/></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        
                        {deliveryOption === 'delivery' && (
                            <>
                            <FormField control={form.control} name="address" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dirección</FormLabel>
                                    <FormControl><Input placeholder="Calle, número, barrio, etc." {...field} disabled={isProcessing}/></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="city" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Ciudad</FormLabel>
                                <FormControl><Input placeholder="Tu ciudad" {...field} disabled={isProcessing}/></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}/>
                            </>
                        )}
                    </CardContent>
                </Card>

                 <div className="flex flex-col gap-4 pt-4">
                    <Button form="checkout-form" type="submit" size="lg" className="w-full h-12 text-base" disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="animate-spin" /> : 'Confirmar y Continuar con la Compra'}
                        {!isProcessing && <ArrowRight className="ml-2 h-5 w-5" />}
                    </Button>
                    <Button variant="outline" size="lg" asChild className="w-full h-12 text-base">
                        <Link href="/#products">
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Seguir Viendo Productos
                        </Link>
                    </Button>
                </div>
            </form>
            </Form>
        </div>
    </div>
  );
}
