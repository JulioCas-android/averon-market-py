
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image';
import { useAuth, useFirestore } from '@/firebase';
import { addDoc, collection, type DocumentReference } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, Check, MapPin, Info } from 'lucide-react';
import type { Order } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { createPagoparPaymentAction } from '@/app/actions';

const checkoutSchema = z.object({
  // Step 1
  address: z.string().trim().min(5, 'La dirección completa es requerida.'),
  city: z.string().trim().min(2, 'La ciudad es requerida.'),
  // Step 2
  razonSocial: z.string().min(2, 'La razón social es requerida'),
  ruc: z.string().min(6, 'El RUC o CI es requerido').regex(/^[0-9-]+$/, 'Solo números y guiones permitidos.'),
  email: z.string().email('El email es inválido'),
  phone: z.string().min(6, 'El teléfono es requerido'),
  // Step 3
  paymentMethod: z.string({ required_error: 'Debes seleccionar un método de pago.' }).min(1, 'Debes seleccionar un método de pago.'),
  thirdPartyReceiver: z.boolean().default(false),
  thirdPartyName: z.string().optional(),
  thirdPartyId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.thirdPartyReceiver) {
    if (!data.thirdPartyName || data.thirdPartyName.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['thirdPartyName'],
        message: 'El nombre completo del tercero es requerido.',
      });
    }
    if (!data.thirdPartyId || data.thirdPartyId.trim().length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['thirdPartyId'],
        message: 'El número de cédula del tercero es requerido.',
      });
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
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      address: '',
      city: '',
      razonSocial: '',
      ruc: '',
      email: '',
      phone: '',
      paymentMethod: '',
      thirdPartyReceiver: false,
      thirdPartyName: '',
      thirdPartyId: '',
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

  const thirdPartyReceiver = form.watch('thirdPartyReceiver');
  const paymentMethod = form.watch('paymentMethod');

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
        fieldsToValidate = ['address', 'city'];
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

  const handlePlaceOrder = async (docRef: DocumentReference) => {
    const formValues = form.getValues();
    if (formValues.paymentMethod === 'ONLINE') {
        const result = await createPagoparPaymentAction(docRef.id);
        if (result.success && result.paymentUrl) {
            clearCart();
            window.location.href = result.paymentUrl;
        } else {
            toast({
                variant: 'destructive',
                title: 'Error al procesar el pago',
                description: result.message || 'No se pudo conectar con la pasarela de pago. Intenta de nuevo.',
            });
            setIsProcessing(false);
        }
    } else {
        clearCart();
        router.push(`/order-confirmation?method=${formValues.paymentMethod}&orderId=${docRef.id}`);
    }
  };

  const onSubmit = async (formValues: CheckoutFormValues) => {
    setIsProcessing(true);
  
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error de conexión' });
        setIsProcessing(false);
        return;
    }

    const ordersCollection = collection(firestore, 'orders');

    const newOrder: Omit<Order, 'id'> = {
      ...(user?.uid && { userId: user.uid }),
      customerRazonSocial: formValues.razonSocial,
      customerRuc: formValues.ruc,
      customerEmail: formValues.email,
      shippingAddress: formValues.address,
      shippingCity: formValues.city,
      shippingPhone: formValues.phone,
      items: items.map(item => ({ ...item, product: { ...item.product } })), // Ensure plain objects
      total,
      status: 'Pendiente de Pago',
      createdAt: new Date().toISOString(),
      paymentMethod: formValues.paymentMethod,
      thirdPartyReceiver: formValues.thirdPartyReceiver,
      ...(formValues.thirdPartyReceiver && { 
        thirdPartyName: formValues.thirdPartyName, 
        thirdPartyId: formValues.thirdPartyId 
      }),
    };
    
    addDoc(ordersCollection, newOrder)
    .then((docRef: DocumentReference) => {
        handlePlaceOrder(docRef);
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Delivery Address */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>1. Dirección de Envío</CardTitle>
                <ProgressIndicator step={1} totalSteps={3} />
              </CardHeader>
              {step === 1 ? (
                  <CardContent className="space-y-6">
                      <div className="space-y-4">
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
                  </CardContent>
              ) : (
                  <CardContent>
                      <div className="flex items-center justify-between text-sm">
                          <div>
                              <p className="font-semibold">Envío a domicilio</p>
                              <p className="text-muted-foreground">{`${form.getValues('address')}, ${form.getValues('city')}`}</p>
                          </div>
                          <Button type="button" variant="link" onClick={() => setStep(1)}>Cambiar</Button>
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
                      {!authLoading && !user && (
                          <Alert className="mb-4">
                              <Info className="h-4 w-4" />
                              <AlertTitle>¿Ya tienes una cuenta?</AlertTitle>
                              <AlertDescription>
                                  <Link href="/login" className="font-semibold underline text-primary">Inicia sesión</Link> o <Link href="/signup" className="font-semibold underline text-primary">regístrate</Link> para agilizar tus futuras compras.
                                  <p className="text-xs mt-1">También puedes continuar como invitado.</p>
                              </AlertDescription>
                          </Alert>
                      )}
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
                          <Button type="button" variant="link" onClick={() => setStep(2)}>Cambiar</Button>
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
                                  <SelectItem value="ONLINE">Pago Online (Tarjetas y QR)</SelectItem>
                                  <SelectItem value="TRNF">Transferencia Bancaria</SelectItem>
                                  <SelectItem value="EWALLET">Billetera Electrónica (Tigo, Personal, etc.)</SelectItem>
                                  <SelectItem value="COD">Efectivo - Contra Entrega</SelectItem>
                                  <SelectItem value="DOWN_PAYMENT">Pago de seña y saldo contra entrega</SelectItem>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {paymentMethod === 'TRNF' && (
                      <Card className="p-4 bg-muted/30">
                          <CardHeader className="p-0 pb-2">
                              <CardTitle className="text-base">Datos para Transferencia</CardTitle>
                          </CardHeader>
                          <CardContent className="p-0 text-sm space-y-1">
                              <p><strong>Banco:</strong> Banco GNB Paraguay S.A.</p>
                              <p><strong>Cuenta:</strong> 001-123456-7</p>
                              <p><strong>Titular:</strong> AVERON Market PY</p>
                              <p><strong>RUC:</strong> 80012345-6</p>
                              <p className="mt-2 text-muted-foreground">Una vez realizada la transferencia, envía el comprobante a nuestro WhatsApp para confirmar tu pedido.</p>
                          </CardContent>
                      </Card>
                    )}

                    {paymentMethod === 'EWALLET' && (
                      <Card className="p-4 bg-muted/30">
                          <CardHeader className="p-0 pb-2">
                              <CardTitle className="text-base">Datos para Billetera Electrónica</CardTitle>
                          </CardHeader>
                          <CardContent className="p-0 text-sm space-y-1">
                               <p><strong>Número Tigo Money:</strong> 0981-123456</p>
                               <p><strong>Número Personal:</strong> 0971-654321</p>
                               <p className="mt-2 text-muted-foreground">Envía el comprobante de tu pago a nuestro WhatsApp para confirmar tu pedido.</p>
                          </CardContent>
                      </Card>
                    )}
                    
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

                    {thirdPartyReceiver && (
                      <Card className="p-4 bg-muted/50 border-dashed">
                        <h4 className="font-semibold mb-2 text-foreground">Autorización</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Favor complete los datos de la persona que recibirá o retirará los productos, en caso de ser un tercero.
                        </p>
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="thirdPartyName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre completo</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nombre del tercero" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="thirdPartyId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Número de cédula</FormLabel>
                                <FormControl>
                                  <Input placeholder="C.I. del tercero" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </Card>
                    )}

                  </CardContent>
                )}
            </Card>

            <div className="flex flex-col gap-4 pt-4">
                {step < 3 ? (
                   <Button type="button" onClick={handleNextStep} size="lg" className="w-full h-12 text-base" disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="animate-spin" /> : 'Continuar'}
                      {!isProcessing && <ArrowRight className="ml-2 h-5 w-5" />}
                   </Button>
                ) : (
                   <Button type="submit" size="lg" variant="secondary" className="w-full h-12 text-lg font-bold" disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="animate-spin" /> : '¡COMPRAR!'}
                      {!isProcessing && <Check className="ml-2 h-6 w-6" />}
                   </Button>
                )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
