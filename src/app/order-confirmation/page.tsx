'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    // This is to avoid hydration errors from useSearchParams on server
    const method = searchParams.get('method') || 'pago';
    const id = searchParams.get('orderId') || '';
    setPaymentMethod(method);
    setOrderId(id);
  }, [searchParams]);

  let title = "¡Pedido Confirmado!";
  let message = `Tu pedido ${orderId ? `(#${orderId})` : ''} ha sido registrado con éxito.`;

  switch (paymentMethod) {
    case 'ONLINE':
      title = "¡Pago Exitoso!";
      message = `Tu pago ha sido procesado exitosamente. Recibirás una confirmación por correo electrónico para tu pedido ${orderId ? `#${orderId}` : ''}.`;
      break;
    case 'COD':
      message = `Tu pedido ${orderId ? `#${orderId}` : ''} ha sido registrado y será procesado pronto. Pagarás al momento de la entrega.`;
      break;
    case 'TRNF':
    case 'EWALLET':
    case 'DOWN_PAYMENT':
      message = `Tu pedido ${orderId ? `#${orderId}` : ''} está pendiente de pago. Por favor, realiza el pago correspondiente y envía el comprobante para confirmarlo.`;
      break;
  }


  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="mt-4 text-3xl font-bold">{title}</CardTitle>
          <CardDescription className="mt-2 text-lg text-muted-foreground">Gracias por tu compra.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-8">{message}</p>
          <Button onClick={() => router.push('/')} className="w-full max-w-xs">
            Seguir Comprando
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
