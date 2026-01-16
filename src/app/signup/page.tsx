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

const signupSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.58 2.03-4.56 2.03-3.86 0-7-3.14-7-7s3.14-7 7-7c2.18 0 3.66.86 4.54 1.7l2.43-2.43C18.49 3.48 15.98 2 12.48 2 6.98 2 2.53 6.45 2.53 12s4.45 10 9.95 10c5.79 0 9.4-3.83 9.4-9.53 0-.63-.05-1.22-.16-1.78l-9.25-.01z" fill="currentColor"/>
    </svg>
);

export default function SignupPage() {
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    try {
      await register(values.name, values.email, values.password);
      toast({
        title: 'Registro Exitoso',
        description: 'Tu cuenta ha sido creada.',
      });
      router.push('/profile');
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Error de Registro',
        description: error.code === 'auth/email-already-in-use' ? 'Este correo electrónico ya está en uso.' : 'No se pudo crear la cuenta. Por favor, inténtalo de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast({
        title: 'Registro Exitoso',
        description: 'Tu cuenta ha sido creada con Google.',
      });
      router.push('/profile');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error de Registro con Google',
        description: error.message || 'No se pudo crear la cuenta. Por favor, inténtalo de nuevo.',
      });
    } finally {
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
          <CardTitle className="text-2xl font-bold">Crear una Cuenta</CardTitle>
          <CardDescription>Únete a Averon Market para empezar a comprar</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Registrarse'}
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
              Registrarse con Google
           </Button>
          <div className="mt-6 text-center text-sm">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Inicia sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
