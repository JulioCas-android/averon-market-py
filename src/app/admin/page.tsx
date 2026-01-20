'use client';

import { useMemo } from 'react';
import { useAuth, useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react';
import type { Order, Sale, Product } from '@/lib/types';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const firestore = useFirestore();

  const ordersQuery = useMemo(() => firestore ? collection(firestore, 'orders') : null, [firestore]);
  const { data: orders, loading: ordersLoading } = useCollection<Order>(ordersQuery);

  const salesQuery = useMemo(() => firestore ? collection(firestore, 'sales') : null, [firestore]);
  const { data: sales, loading: salesLoading } = useCollection<Sale>(salesQuery);
  
  const productsQuery = useMemo(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const { data: products, loading: productsLoading } = useCollection<Product>(productsQuery);

  const { totalRevenue, totalSales, totalProducts, recentOrders, monthlySalesData } = useMemo(() => {
    const validOrderStatuses: Order['status'][] = ['Pagado', 'Enviado', 'Entregado', 'Procesando'];
    const validOrders = orders?.filter(order => validOrderStatuses.includes(order.status)) || [];
    
    const orderRevenue = validOrders.reduce((acc, order) => acc + order.total, 0);
    const posRevenue = sales?.reduce((acc, sale) => acc + sale.total, 0) || 0;
    const totalRevenue = orderRevenue + posRevenue;

    const totalSales = (validOrders.length || 0) + (sales?.length || 0);
    const totalProducts = products?.length || 0;

    const sortedOrders = orders?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];
    const recentOrders = sortedOrders.slice(0, 5);
    
    const salesByMonth: { [key: string]: { total: number, date: Date } } = {};
    const allSales = [...(validOrders || []), ...(sales || [])];

    allSales.forEach(sale => {
        const date = new Date(sale.createdAt);
        const monthYear = date.toLocaleString('es-PY', { month: 'short', year: '2-digit' }).replace('.', '');
        if (!salesByMonth[monthYear]) {
            salesByMonth[monthYear] = { total: 0, date: new Date(date.getFullYear(), date.getMonth(), 1) };
        }
        salesByMonth[monthYear].total += sale.total;
    });

    const monthlySalesData = Object.entries(salesByMonth)
        .sort(([, a], [, b]) => a.date.getTime() - b.date.getTime())
        .slice(-6)
        .map(([name, data]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            total: data.total,
        }));

    return { totalRevenue, totalSales, totalProducts, recentOrders, monthlySalesData };
  }, [orders, sales, products]);
  
  const loading = ordersLoading || salesLoading || productsLoading;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Panel de Control</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gs. {loading ? '...' : totalRevenue.toLocaleString('es-PY')}</div>
            <p className="text-xs text-muted-foreground">Suma de ventas online y directas.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{loading ? '...' : totalSales}</div>
            <p className="text-xs text-muted-foreground">Cantidad de pedidos y ventas directas.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : totalProducts}</div>
            <p className="text-xs text-muted-foreground">Items totales en el catálogo.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bienvenido</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{user?.displayName || 'Admin'}</div>
            <p className="text-xs text-muted-foreground">¡Que tengas un día productivo!</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
            <CardDescription>
              Se han registrado {orders?.length || 0} pedidos online en total.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={4} className="h-24 text-center">Cargando...</TableCell></TableRow>
                  ) : recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="font-medium">{order.customerRazonSocial}</div>
                          <div className="hidden text-sm text-muted-foreground md:inline">{order.customerEmail}</div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{order.status}</Badge></TableCell>
                        <TableCell className="text-right">Gs. {order.total.toLocaleString('es-PY')}</TableCell>
                        <TableCell className="text-right">{new Date(order.createdAt).toLocaleDateString('es-PY')}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={4} className="h-24 text-center">No hay pedidos recientes.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Vista General de Ventas</CardTitle>
            <CardDescription>Resumen de ingresos de los últimos meses.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={monthlySalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Gs. ${((value as number) / 1000000).toFixed(1)}M`} />
                    <Tooltip 
                        cursor={{fill: 'hsl(var(--muted))'}}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="grid grid-cols-1 gap-2">
                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                        {payload[0].payload.name}
                                        </span>
                                        <span className="font-bold text-muted-foreground">
                                        Gs. {(payload[0].value as number).toLocaleString('es-PY')}
                                        </span>
                                    </div>
                                </div>
                                )
                            }
                            return null
                        }}
                    />
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
