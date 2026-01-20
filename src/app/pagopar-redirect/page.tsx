import { Suspense } from 'react';
import PagoparRedirectDetails from '@/components/pagopar-redirect-details';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

function PagoparRedirectSkeleton() {
    return (
        <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-12">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                <CardTitle className="text-2xl font-bold">Procesando tu Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
                <p className="text-lg text-muted-foreground">
                    Estamos confirmando los detalles de tu pago...
                </p>
                <p className="text-sm text-muted-foreground">
                    Serás redirigido en un momento...
                </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default function PagoparRedirectPage() {
  return (
    <Suspense fallback={<PagoparRedirectSkeleton />}>
      <PagoparRedirectDetails />
    </Suspense>
  );
}
