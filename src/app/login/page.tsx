'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import type { UserProfile } from '@/lib/types';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.58 2.03-4.56 2.03-3.86 0-7-3.14-7-7s3.14-7 7-7c2.18 0 3.66.86 4.54 1.7l2.43-2.43C18.49 3.48 15.98 2 12.48 2 6.98 2 2.53 6.45 2.53 12s4.45 10 9.95 10c5.79 0 9.4-3.83 9.4-9.53 0-.63-.05-1.22-.16-1.78l-9.25-.01z" fill="currentColor"/>
    </svg>
);

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const checkRoleAndRedirect = async (user: FirebaseUser) => {
    if (!user) return;

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userProfile = userDocSnap.data() as UserProfile;
        if (userProfile.role === 'admin') {
          toast({
            title: 'Inicio de Sesión Exitoso',
            description: 'Bienvenido, administrador.',
          });
          router.push('/admin');
          return;
        }
      }
      // Redirección por defecto para no-admins o si el perfil no existe
      toast({
        title: 'Inicio de Sesión Exitoso',
        description: 'Bienvenido de nuevo.',
      });
      router.push('/profile');
    } catch (error) {
      console.error("Error al verificar el rol del usuario:", error);
      // Redirección de respaldo en caso de error
      toast({
        title: 'Inicio de Sesión Exitoso',
        description: 'Bienvenido de nuevo.',
      });
      router.push('/profile');
    }
  };


  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      const user = await login(values.email, values.password);
      await checkRoleAndRedirect(user);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error de Inicio de Sesión',
        description: 'Credenciales incorrectas. Por favor, inténtalo de nuevo.',
      });
       setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await loginWithGoogle();
      await checkRoleAndRedirect(user);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error de Inicio de Sesión con Google',
        description: error.message || 'No se pudo iniciar sesión. Por favor, inténtalo de nuevo.',
      });
      setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>Ingresa a tu cuenta de Averon Market</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="tu@email.com" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Contraseña</FormLabel>
                       <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Ingresar'}
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                O continuar con
                </span>
            </div>
          </div>
           <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
              <GoogleIcon className="mr-2 h-4 w-4" />
              Ingresar con Google
           </Button>

          <div className="mt-6 text-center text-sm">
            ¿No tienes una cuenta?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Regístrate
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
