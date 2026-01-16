'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Order } from '@/lib/types';
import OfferNotification from '@/components/offer-notification';

const mockOrders: Order[] = [
  { id: 'ORD-001', date: '2024-05-20', total: 2500000, status: 'Entregado', items: [] },
  { id: 'ORD-002', date: '2024-06-10', total: 750000, status: 'Enviado', items: [] },
  { id: 'ORD-003', date: '2024-07-01', total: 3200000, status: 'Pagado', items: [] },
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null; // or a loading spinner
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <Avatar className="h-20 w-20">
            <AvatarImage src={`https://i.pravatar.cc/150?u=${user.email}`} />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleLogout}>Cerrar Sesión</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Pedidos</CardTitle>
              <CardDescription>Aquí puedes ver tus pedidos recientes.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido ID</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell className="text-right">Gs. {order.total.toLocaleString('es-PY')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
            <Card>
                <CardHeader>
                <CardTitle>Ofertas para ti</CardTitle>
                <CardDescription>Usa nuestra IA para encontrar ofertas personalizadas basadas en tu actividad.</CardDescription>
                </CardHeader>
                <CardContent>
                    <OfferNotification />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle>Gestionar Cuenta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">Editar Datos de Contacto</Button>
                    <Button variant="outline" className="w-full justify-start">Cambiar Contraseña</Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
