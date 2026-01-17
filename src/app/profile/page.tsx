'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Order } from '@/lib/types';
import OfferNotification from '@/components/offer-notification';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const firestore = useFirestore();

  const userOrdersQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'orders'), where('userId', '==', user.uid));
  }, [user, firestore]);

  const { data: fetchedOrders, loading: ordersLoading } = useCollection<Order>(userOrdersQuery);

  const userOrders = useMemo(() => {
    if (!fetchedOrders) return [];
    return [...fetchedOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [fetchedOrders]);


  const loading = authLoading || !user;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-64" />
            </div>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-40" />
                        <Skeleton className="h-5 w-60 mt-2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-8">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.photoURL || `https://i.pravatar.cc/150?u=${user.email}`} />
            <AvatarFallback>{user.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{user.displayName}</h1>
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
                  {ordersLoading ? (
                    <TableRow><TableCell colSpan={4} className="h-24 text-center">Cargando tus pedidos...</TableCell></TableRow>
                  ) : userOrders.length > 0 ? (
                    userOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium font-mono text-xs">#{order.id.substring(0, 7)}...</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString('es-PY')}</TableCell>
                        <TableCell>{order.status}</TableCell>
                        <TableCell className="text-right">Gs. {order.total.toLocaleString('es-PY')}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={4} className="h-24 text-center">Aún no has realizado ningún pedido.</TableCell></TableRow>
                  )}
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
