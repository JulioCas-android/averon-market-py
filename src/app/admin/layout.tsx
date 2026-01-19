'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Package, ShoppingCart, Tag, PlusCircle, User, LogOut, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

const AdminNav = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const menuItems = [
    { href: '/admin', label: 'Panel', icon: Home },
    { href: '/admin/orders', label: 'Pedidos', icon: ShoppingCart },
    { href: '/admin/catalog', label: 'Catálogo', icon: Package },
    { href: '/admin/add-product', label: 'Agregar Producto', icon: PlusCircle },
    { href: '/admin/sales', label: 'Ventas', icon: Tag },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-semibold">Mi Tienda</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  onClick={() => router.push(item.href)}
                  tooltip={item.label}
                >
                  <a>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip="Cerrar Sesión">
                <LogOut />
                <span>Cerrar Sesión</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => router.push('/profile')}
                variant="outline"
                className="group/menu-item flex items-center gap-2"
                size="lg"
              >
                <Avatar className="size-8">
                  <AvatarImage src={user?.photoURL ?? undefined} />
                  <AvatarFallback>{user?.displayName?.charAt(0) ?? 'A'}</AvatarFallback>
                </Avatar>
                <span className="flex flex-col text-left">
                  <span className="font-medium">{user?.displayName}</span>
                  <span className="text-xs text-sidebar-foreground/70">{user?.email}</span>
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center justify-between border-b bg-background px-4 md:hidden">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-semibold">Mi Tienda</span>
          </div>
          <SidebarTrigger />
        </header>
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [authorizationStatus, setAuthorizationStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');

  useEffect(() => {
    if (authLoading || !firestore) {
      setAuthorizationStatus('loading');
      return;
    }

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Acceso Denegado',
        description: 'Debes iniciar sesión para acceder a esta página.',
      });
      router.replace('/login');
      setAuthorizationStatus('unauthorized');
      return;
    }

    const checkAdminRole = async () => {
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
          setAuthorizationStatus('authorized');
        } else {
          setAuthorizationStatus('unauthorized');
          toast({
            variant: 'destructive',
            title: 'Acceso Denegado',
            description: 'Debes ser un administrador para ver esta página.',
          });
          router.replace('/');
        }
      } catch (error) {
        console.error("Error al verificar el rol de administrador:", error);
        setAuthorizationStatus('unauthorized');
        toast({
          variant: 'destructive',
          title: 'Error de Permisos',
          description: 'No se pudo verificar tu rol de usuario.',
        });
        router.replace('/');
      }
    };
    
    checkAdminRole();
    
  }, [user, authLoading, firestore, router, toast]);

  if (authorizationStatus !== 'authorized') {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-semibold">Verificando permisos...</h2>
          <p className="text-muted-foreground">Un momento, por favor.</p>
        </div>
      </div>
    );
  }

  return <AdminNav>{children}</AdminNav>;
}
