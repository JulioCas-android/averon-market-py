'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Panel de Control</h1>
      <Card>
        <CardHeader>
          <CardTitle>¡Bienvenido, {user?.displayName || 'Admin'}!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Desde aquí puedes gestionar tu tienda. Usa el menú de la izquierda para navegar por las diferentes secciones.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
