'use client';

import { useMemo, useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { PageHeader } from '@/components/admin/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Image from 'next/image';

const orderStatuses: Order['status'][] = ['Procesando', 'Pendiente de Pago', 'Pagado', 'Enviado', 'Entregado', 'Cancelado'];

export default function OrdersPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const ordersQuery = useMemo(() => firestore ? collection(firestore, 'orders') : null, [firestore]);
  const { data: orders, loading: ordersLoading } = useCollection<Order>(ordersQuery);

  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const sortedOrders = useMemo(() => {
    if (!orders) return [];
    return [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders]);

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    if (!firestore) return;
    const orderDocRef = doc(firestore, 'orders', orderId);
    updateDoc(orderDocRef, { status })
      .then(() => {
        toast({
          title: 'Estado Actualizado',
          description: `El pedido #${orderId.substring(0, 6)}... ahora está "${status}".`,
        });
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({ path: orderDocRef.path, operation: 'update', requestResourceData: { status } });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handlePrint = () => {
    const printContent = document.getElementById('print-area');
    if (printContent) {
        const newWindow = window.open('', '_blank');
        newWindow?.document.write(`
            <html>
                <head>
                    <title>Imprimir Pedido</title>
                    <style>
                        body { font-family: sans-serif; }
                        .print-container { padding: 20px; }
                        h2 { font-size: 1.5rem; font-weight: bold; }
                        h3 { font-size: 1.2rem; font-weight: bold; margin-top: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .total-section { float: right; width: 300px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="print-container">
                        ${printContent.innerHTML}
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            window.close();
                        }
                    </script>
                </body>
            </html>
        `);
        newWindow?.document.close();
    }
  };


  return (
    <>
      <PageHeader
        title="Gestión de Pedidos"
        description="Visualiza y gestiona los pedidos de tus clientes."
      />
      <div className="p-0 md:p-8 md:pt-0">
        <Card>
           <CardContent className="p-0 md:p-6">
                {/* Mobile View */}
                <div className="md:hidden">
                    {ordersLoading ? (
                        <div className="p-4 text-center">Cargando pedidos...</div>
                    ) : sortedOrders && sortedOrders.length > 0 ? (
                        <div className="divide-y divide-border">
                        {sortedOrders.map((order) => (
                            <div key={order.id} className="p-4 space-y-2" onClick={() => setViewingOrder(order)}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">{order.customerRazonSocial}</p>
                                        <p className="font-mono text-xs text-muted-foreground">#{order.id.substring(0, 7)}</p>
                                    </div>
                                    <p className="font-bold text-sm">Gs. {order.total.toLocaleString('es-PY')}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('es-PY')}</p>
                                    <div className="w-[150px]" onClick={(e) => e.stopPropagation()}>
                                        <Select
                                            defaultValue={order.status}
                                            onValueChange={(newStatus) => handleUpdateStatus(order.id, newStatus as Order['status'])}
                                            >
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue placeholder="Cambiar estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {orderStatuses.map(status => (
                                                <SelectItem key={status} value={status}>{status}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <p className="p-4 text-center">No se han realizado pedidos todavía.</p>
                    )}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Pedido ID</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className='w-[200px]'>Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {ordersLoading ? (
                        <TableRow><TableCell colSpan={5} className="text-center h-24">Cargando pedidos...</TableCell></TableRow>
                        ) : sortedOrders && sortedOrders.length > 0 ? (
                        sortedOrders.map((order) => (
                            <TableRow key={order.id} className="cursor-pointer" onClick={() => setViewingOrder(order)}>
                            <TableCell className="font-medium font-mono text-xs">#{order.id.substring(0, 7)}...</TableCell>
                            <TableCell>{order.customerRazonSocial}</TableCell>
                            <TableCell>{new Date(order.createdAt).toLocaleDateString('es-PY')}</TableCell>
                            <TableCell>Gs. {order.total.toLocaleString('es-PY')}</TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <Select
                                defaultValue={order.status}
                                onValueChange={(newStatus) => handleUpdateStatus(order.id, newStatus as Order['status'])}
                                >
                                <SelectTrigger className="w-full h-9">
                                    <SelectValue placeholder="Cambiar estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {orderStatuses.map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                            </TableCell>
                            </TableRow>
                        ))
                        ) : (
                        <TableRow><TableCell colSpan={5} className="text-center h-24">No se han realizado pedidos todavía.</TableCell></TableRow>
                        )}
                    </TableBody>
                    </Table>
                </div>
           </CardContent>
        </Card>
      </div>

      <Dialog open={!!viewingOrder} onOpenChange={(isOpen) => !isOpen && setViewingOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader className="bg-slate-900 text-white -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
            <DialogTitle>Detalle del Pedido</DialogTitle>
            <DialogDescription className="text-slate-400">Pedido #{viewingOrder?.id.substring(0,7)}</DialogDescription>
          </DialogHeader>
          {viewingOrder && (
            <div id="print-area" className="space-y-6 pt-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-bold mb-2">Cliente</h3>
                  <p>{viewingOrder.customerRazonSocial}</p>
                  <p>{viewingOrder.customerRuc}</p>
                  <p>{viewingOrder.customerEmail}</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Dirección de Envío</h3>
                  <p>{viewingOrder.shippingAddress}</p>
                  <p>{viewingOrder.shippingCity}</p>
                  <p>{viewingOrder.shippingPhone}</p>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-bold mb-2">Productos</h3>
                <div className="space-y-4">
                  {viewingOrder.items.map((item, index) => {
                    if (!item.product) return null;
                    return (
                      <div key={item.product.id || index} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {item.product.images && item.product.images.length > 0 && (
                            <Image src={item.product.images[0]} alt={item.product.name} width={48} height={48} className="rounded-md object-cover" />
                          )}
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-semibold">Gs. {(item.product.price * item.quantity).toLocaleString('es-PY')}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-medium">Gs. {viewingOrder.total.toLocaleString('es-PY')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Envío</span>
                        <span>A convenir</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-base font-bold">
                        <span>Total</span>
                        <span>Gs. {viewingOrder.total.toLocaleString('es-PY')}</span>
                    </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handlePrint}>Imprimir Ticket</Button>
                <Button onClick={() => setViewingOrder(null)}>Cerrar Detalle</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
