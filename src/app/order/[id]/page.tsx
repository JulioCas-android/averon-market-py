'use client';

import { useParams } from 'next/navigation';
import { useDoc } from '@/firebase';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Loader2, FileText, User, Truck, CreditCard } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function OrderDetailPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-6 bg-muted rounded w-1/2 mb-8"></div>
        <div className="space-y-8">
          <Card><CardContent className="h-48 bg-muted rounded-lg"></CardContent></Card>
          <Card><CardContent className="h-64 bg-muted rounded-lg"></CardContent></Card>
          <Card><CardContent className="h-32 bg-muted rounded-lg"></CardContent></Card>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data: order, loading } = useDoc<Order>(`orders/${id}`);

  if (loading) {
    return <OrderDetailPageSkeleton />;
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Pedido no encontrado</h1>
        <p className="text-muted-foreground mt-2">No pudimos encontrar los detalles para este pedido.</p>
      </div>
    );
  }

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'Pagado':
      case 'Enviado':
      case 'Entregado':
        return 'bg-green-600 hover:bg-green-700';
      case 'Pendiente de Pago':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Cancelado':
        return 'destructive';
      case 'Procesando':
      default:
        return 'secondary';
    }
  };
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl print:py-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-bold font-headline">Detalles del Pedido</h1>
          <p className="text-muted-foreground">Pedido #{order.id.substring(0, 7)}... &bull; {new Date(order.createdAt).toLocaleDateString('es-PY', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
        <Button variant="outline" onClick={handlePrint}>
            <FileText className="mr-2" />
            Imprimir / Guardar PDF
        </Button>
      </div>

      {/* For printing purposes */}
      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold">Detalles del Pedido #{order.id}</h1>
        <p className="text-muted-foreground">Fecha: {new Date(order.createdAt).toLocaleDateString('es-PY')}</p>
        <p className="text-muted-foreground">Cliente: {order.customerRazonSocial}</p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="text-primary" />
              Resumen del Pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] hidden sm:table-cell">Imagen</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-center">Cantidad</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map(item => (
                  <TableRow key={item.product.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image src={item.product.image} alt={item.product.name} width={64} height={64} className="rounded-md object-cover" />
                    </TableCell>
                    <TableCell className="font-medium">{item.product.name}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">Gs. {(item.product.price * item.quantity).toLocaleString('es-PY')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Separator className="my-4" />
            <div className="flex justify-end">
              <div className="w-full max-w-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Gs. {order.total.toLocaleString('es-PY')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span>A convenir</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>Gs. {order.total.toLocaleString('es-PY')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Truck className="text-primary" />Datos de Envío</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="font-medium">{order.customerRazonSocial}</p>
              <p className="text-muted-foreground">{order.shippingAddress}</p>
              <p className="text-muted-foreground">{order.shippingCity}</p>
              <p className="text-muted-foreground">{order.shippingPhone}</p>
              <p className="text-muted-foreground">{order.customerEmail}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard className="text-primary" />Estado del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div>
                 <p className="text-sm font-medium mb-1">Estado del Pago</p>
                 <Badge variant="secondary" className={getStatusVariant(order.status)}>
                    {order.status}
                 </Badge>
               </div>
               <div>
                 <p className="text-sm font-medium mb-1">Método de Pago</p>
                 <p className="text-muted-foreground">{order.paymentMethod}</p>
               </div>
            </CardContent>
          </Card>
        </div>
        
        {order.thirdPartyReceiver && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="text-primary" />Autorizado a Recibir</CardTitle>
              <CardDescription>Este pedido será recibido por un tercero.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><strong>Nombre:</strong> {order.thirdPartyName}</p>
              <p><strong>Cédula:</strong> {order.thirdPartyId}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
