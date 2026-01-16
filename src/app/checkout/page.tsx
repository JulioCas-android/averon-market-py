
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image';
import { useAuth, useFirestore } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, Check, Square } from 'lucide-react';
import type { Order } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const checkoutSchema = z.object({
  // Step 1
  deliveryOption: z.enum(['delivery', 'pickup']).default('delivery'),
  address: z.string(),
  city: z.string(),
  // Step 2
  razonSocial: z.string().min(2, 'La razón social es requerida'),
  ruc: z.string().min(6, 'El RUC o CI es requerido').regex(/^[0-9-]+$/, 'Solo números y guiones permitidos.'),
  email: z.string().email('El email es inválido'),
  phone: z.string().min(6, 'El teléfono es requerido'),
  // Step 3
  paymentMethod: z.string({ required_error: 'Debes seleccionar un método de pago.' }).min(1, 'Debes seleccionar un método de pago.'),
  thirdPartyReceiver: z.boolean().default(false),
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

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const ProgressIndicator = ({ step, totalSteps }: { step: number, totalSteps: number}) => (
    <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Paso {step}/{totalSteps}</span>
        <Progress value={(step / totalSteps) * 100} className="w-24 h-2" />
    </div>
);


export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryOption: 'delivery',
      address: '',
      city: '',
      razonSocial: '',
      ruc: '',
      email: '',
      phone: '',
      paymentMethod: '',
      thirdPartyReceiver: false,
    },
  });

  useEffect(() => {
    if (user) {
        form.reset({
            ...form.getValues(),
            razonSocial: user.displayName || '',
            email: user.email || '',
        });
    }
  }, [user, form]);

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

  const handleNextStep = async () => {
    let fieldsToValidate: FieldPath<CheckoutFormValues>[] = [];
    if (step === 1) {
        fieldsToValidate = ['deliveryOption', 'address', 'city'];
    } else if (step === 2) {
        fieldsToValidate = ['razonSocial', 'ruc', 'email', 'phone'];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(s => s + 1);
    } else {
        toast({
            variant: 'destructive',
            title: 'Campos incompletos',
            description: 'Por favor, revisa los campos marcados en rojo.',
        });
    }
  };

  const handlePlaceOrder = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
          variant: 'destructive',
          title: 'Formulario incompleto',
          description: 'Por favor, completa todos los pasos antes de continuar.',
      });
      return;
    }

    setIsProcessing(true);
  
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error de conexión' });
        setIsProcessing(false);
        return;
    }

    const formValues = form.getValues();
    const ordersCollection = collection(firestore, 'orders');

    const newOrder: Omit<Order, 'id'> = {
      ...(user?.uid && { userId: user.uid }),
      customerRazonSocial: formValues.razonSocial,
      customerRuc: formValues.ruc,
      customerEmail: formValues.email,
      shippingAddress: deliveryOption === 'delivery' ? formValues.address : 'Retiro en tienda',
      shippingCity: deliveryOption === 'delivery' ? formValues.city : 'Asunción',
      shippingPhone: formValues.phone,
      items: items.map(item => ({ ...item, product: { ...item.product } })), // Ensure plain objects
      total,
      status: 'Pendiente de Pago',
      createdAt: new Date().toISOString(),
      paymentMethod: formValues.paymentMethod,
      thirdPartyReceiver: formValues.thirdPartyReceiver,
    };
    
    addDoc(ordersCollection, newOrder)
    .then((docRef) => {
        clearCart();
        router.push(`/order-confirmation?method=${formValues.paymentMethod}`);
    })
    .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: ordersCollection.path,
          operation: 'create',
          requestResourceData: newOrder,
        });
        errorEmitter.emit('permission-error', permissionError);
    })
    .finally(() => {
        setIsProcessing(false);
    });
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
          {/* Step 1: Delivery Options */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>1. Elegí una opción de entrega</CardTitle>
              <ProgressIndicator step={1} totalSteps={3} />
            </CardHeader>
            {step === 1 ? (
                <CardContent className="space-y-6">
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

                    {deliveryOption === 'delivery' && (
                        <div className="space-y-4 pt-4 border-t">
                            <FormField control={form.control} name="address" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dirección</FormLabel>
                                    <FormControl><Input placeholder="Calle, número, barrio, etc." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="city" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ciudad</FormLabel>
                                    <FormControl><Input placeholder="Tu ciudad" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                    )}
                    {deliveryOption === 'pickup' && (
                      <div className="space-y-4 pt-4 border-t text-sm text-muted-foreground">
                        <p>Puede ser retirado de la tienda <strong>AVERON Market</strong> 3 horas después de recibir el mensaje con tu número de <strong>FACTURA</strong>, vía WhatsApp.</p>
                        <div>
                          <h4 className="font-semibold text-foreground">Dirección:</h4>
                          <p>Avda. Eusebio Ayala e/ Prof. Sergio Conradi. <a href="#" className="text-primary underline">Ver mapa</a></p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">Horarios de Atención:</h4>
                          <p>Lunes a Domingo: 09:00 a 21:00</p>
                        </div>
                      </div>
                    )}
                </CardContent>
            ) : (
                <CardContent>
                    <div className="flex items-center justify-between text-sm">
                        <div>
                            <p className="font-semibold">{deliveryOption === 'pickup' ? 'Retiro en tienda' : 'Envío a domicilio'}</p>
                            <p className="text-muted-foreground">{deliveryOption === 'delivery' ? `${form.getValues('address')}, ${form.getValues('city')}` : 'Avda. Eusebio Ayala e/ Prof. Sergio Conradi'}</p>
                        </div>
                        <Button variant="link" onClick={() => setStep(1)}>Cambiar</Button>
                    </div>
                </CardContent>
            )}
          </Card>

          {/* Step 2: Billing Information */}
          <Card className={step < 2 ? 'opacity-50 pointer-events-none' : ''}>
             <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>2. Facturación</CardTitle>
              {step >= 2 && <ProgressIndicator step={2} totalSteps={3} />}
            </CardHeader>
            {step === 2 && (
                <CardContent className="space-y-6">
                    <p className="text-sm text-muted-foreground">Cargá y verificá cuidadosamente tus datos para la emisión de la FACTURA ELECTRÓNICA. Ya no podrán ser modificados.</p>
                    <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Celular*</FormLabel>
                            <FormControl><Input placeholder="09XX-XXXXXX" type="tel" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                     <FormField control={form.control} name="ruc" render={({ field }) => (
                        <FormItem>
                            <FormLabel>RUC o CI</FormLabel>
                            <FormControl><Input placeholder="Tu RUC o CI" {...field} /></FormControl>
                             <p className="text-xs text-muted-foreground">RUC: Favor separar con guión (-). Ej.: 123456-0</p>
                            <FormMessage />
                        </FormItem>
                    )}/>
                     <FormField control={form.control} name="razonSocial" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Razón social</FormLabel>
                            <FormControl><Input placeholder="Tu nombre completo o razón social" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                     <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input placeholder="tu@email.com" type="email" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </CardContent>
            )}
            {step > 2 && (
                 <CardContent>
                    <div className="flex items-center justify-between text-sm">
                        <div>
                            <p className="font-semibold">{form.getValues('razonSocial')}</p>
                            <p className="text-muted-foreground">RUC/CI: {form.getValues('ruc')}</p>
                        </div>
                        <Button variant="link" onClick={() => setStep(2)}>Cambiar</Button>
                    </div>
                </CardContent>
            )}
          </Card>
          
          {/* Step 3: Payment */}
          <Card className={step < 3 ? 'opacity-50 pointer-events-none' : ''}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>3. Método de Pago</CardTitle>
                 {step >= 3 && <ProgressIndicator step={3} totalSteps={3} />}
              </CardHeader>
              {step === 3 && (
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Elegí una Opción</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="-- Selecciona tu Método de Pago--" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="COD">Pago contra entrega (Efectivo)</SelectItem>
                                {/* Add other payment methods here */}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Totales</h3>
                    <div className="space-y-2 text-muted-foreground">
                        <div className="flex justify-between">
                            <span>Sub-Total (IVA Incld.)</span>
                            <span className="font-medium text-foreground">Gs. {total.toLocaleString('es-PY')}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                            <span className="text-foreground">Total (IVA Incld.)</span>
                            <span className="text-foreground">Gs. {total.toLocaleString('es-PY')}</span>
                        </div>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="thirdPartyReceiver"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Un tercero recibirá o retirará los productos
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              )}
          </Card>


          <div className="flex flex-col gap-4 pt-4">
              {step < 3 ? (
                 <Button onClick={handleNextStep} size="lg" className="w-full h-12 text-base" disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="animate-spin" /> : 'Continuar'}
                    {!isProcessing && <ArrowRight className="ml-2 h-5 w-5" />}
                 </Button>
              ) : (
                 <Button onClick={handlePlaceOrder} size="lg" variant="secondary" className="w-full h-12 text-lg font-bold" disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="animate-spin" /> : '¡COMPRAR!'}
                    {!isProcessing && <Check className="ml-2 h-6 w-6" />}
                 </Button>
              )}
          </div>
        </Form>
      </div>
    </div>
  );
}
