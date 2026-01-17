'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';

export default function PagoparRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    
    // El usuario es redirigido aquí al volver de Pagopar.
    // El estado del pago se confirma a través del Webhook.
    // Aquí, simplemente limpiamos el carrito y lo llevamos a la página de confirmación.
    
    clearCart();
    
    const timer = setTimeout(() => {
      // Redirigir a la página de confirmación final.
      router.push(`/order-confirmation?method=ONLINE&orderId=${orderId || ''}`);
    }, 2000); // 2 segundos de retraso para dar sensación de procesamiento

    return () => clearTimeout(timer);
  }, [router, searchParams, clearCart]);

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Procesando tu Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">
            ¡Gracias por tu compra! Estamos confirmando los detalles de tu pedido.
          </p>
          <p className="text-sm text-muted-foreground">
            Serás redirigido en un momento...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
