
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
import { Loader2 } from 'lucide-react';
import type { Order } from '@/lib/types';

const shippingSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  email: z.string().email('El email es requerido'),
  address: z.string().min(5, 'La dirección es requerida'),
  city: z.string().min(2, 'La ciudad es requerida'),
  phone: z.string().min(6, 'El teléfono es requerido'),
});

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<z.infer<typeof shippingSchema>>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      name: '',
      email: '',
      address: '',
      city: '',
      phone: '',
    },
  });

  if (items.length === 0 && !isProcessing) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mt-2">Agrega productos para poder continuar con la compra.</p>
        <Button onClick={() => router.push('/')} className="mt-6">Volver a la tienda</Button>
      </div>
    );
  }

  const handleCheckout = async (paymentMethod: 'Google Pay' | 'COD') => {
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

    const shippingInfo = form.getValues();
    const ordersCollection = collection(firestore, 'orders');

    const newOrder: Omit<Order, 'id'> = {
      ...(user && { userId: user.uid }),
      customerName: shippingInfo.name,
      customerEmail: shippingInfo.email,
      shippingAddress: shippingInfo.address,
      shippingCity: shippingInfo.city,
      shippingPhone: shippingInfo.phone,
      items: items.map(item => ({...item, product: { ...item.product } })), // Ensure plain objects
      total,
      status: paymentMethod === 'COD' ? 'Pendiente de Pago' : 'Procesando',
      createdAt: new Date().toISOString(),
    };
    
    // For COD, save to Firestore. For Google Pay, this would be inside the payment success callback.
    if (paymentMethod === 'COD') {
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
    } else {
        // Placeholder for Google Pay. In a real app, you'd initiate payment here,
        // and only run the code above on successful payment.
        console.log('Simulating Google Pay flow...');
        clearCart();
        router.push(`/order-confirmation?method=${paymentMethod}`);
        //setIsProcessing(false); // This would be in the payment flow
    }
  };

  const onSubmit = () => {
    // This function is for COD
    handleCheckout('COD');
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Finalizar Compra</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto y Envío</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form id="shipping-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu nombre" {...field} disabled={isProcessing}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email de Contacto</FormLabel>
                          <FormControl>
                            <Input placeholder="tu@email.com" type="email" {...field} disabled={isProcessing}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Input placeholder="Calle, número, etc." {...field} disabled={isProcessing}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ciudad</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu ciudad" {...field} disabled={isProcessing}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono de Contacto</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu número de teléfono" type="tel" {...field} disabled={isProcessing}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map(item => (
                <div key={item.product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Image src={item.product.image} alt={item.product.name} width={48} height={48} className="rounded-md object-cover" />
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">Gs. {(item.product.price * item.quantity).toLocaleString('es-PY')}</p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <p>Total</p>
                <p>Gs. {total.toLocaleString('es-PY')}</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
               <Button 
                variant="secondary" 
                className="w-full bg-black text-white hover:bg-gray-800" 
                onClick={() => form.formState.isValid ? handleCheckout('Google Pay') : form.trigger()}
                disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="animate-spin" /> : 'Pagar con Google Pay'}
              </Button>
              <Button form="shipping-form" type="submit" className="w-full" disabled={isProcessing}>
                {isProcessing ? <Loader2 className="animate-spin" /> : 'Pagar Contra Entrega'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
