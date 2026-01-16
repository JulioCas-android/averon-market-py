'use client';

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

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mt-2">Agrega productos para poder continuar con la compra.</p>
        <Button onClick={() => router.push('/')} className="mt-6">Volver a la tienda</Button>
      </div>
    );
  }

  const handleCheckout = (paymentMethod: 'Google Pay' | 'COD') => {
    // In a real app, you would process payment and save the order here.
    const orderData = {
      customerInfo: form.getValues(),
      items: items,
      total: total,
      paymentMethod: paymentMethod,
      status: 'Procesando'
    };

    console.log('Procesando pedido:', orderData);
    
    // For COD, you would save to Firestore with 'Pendiente de pago' status.
    if (paymentMethod === 'COD') {
      console.log("Pedido registrado en Firestore como 'Pendiente de pago'.");
    }
    
    clearCart();
    router.push(`/order-confirmation?method=${paymentMethod}`);
  };

  const onSubmit = () => {
    // This function is mainly for COD, Google Pay has its own flow.
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
                            <Input placeholder="Tu nombre" {...field} />
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
                            <Input placeholder="tu@email.com" type="email" {...field} />
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
                          <Input placeholder="Calle, número, etc." {...field} />
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
                            <Input placeholder="Tu ciudad" {...field} />
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
                            <Input placeholder="Tu número de teléfono" type="tel" {...field} />
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
                onClick={() => form.formState.isValid ? handleCheckout('Google Pay') : form.trigger()}>
                Pagar con Google Pay
              </Button>
              <Button form="shipping-form" type="submit" className="w-full">
                Pagar Contra Entrega
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
