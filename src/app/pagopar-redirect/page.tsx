'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function PagoparRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const orderId = searchParams.get('orderId');

    // En una aplicación real, aquí harías una llamada a tu backend
    // para obtener la URL de pago real de Pagopar y luego redirigir.
    // Para este prototipo, simulamos el proceso.

    const timer = setTimeout(() => {
      // Redirigir a la página de confirmación final, simulando
      // el regreso del usuario desde la pasarela de pago.
      router.push(`/order-confirmation?method=ONLINE&orderId=${orderId}`);
    }, 3000); // 3 segundos de retraso para simular llamadas a la API y redirección

    return () => clearTimeout(timer);
  }, [router, searchParams]);

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Conectando con la Pasarela de Pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">
            Estás siendo redirigido a Pagopar para completar tu pago de forma segura.
          </p>
          <p className="text-sm text-muted-foreground">
            Por favor, espera un momento...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
