
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Phone, Info, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


const contactSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  subject: z.string().min(3, 'El asunto es requerido'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

export default function ContactPage() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  function onSubmit(values: z.infer<typeof contactSchema>) {
    console.log(values);
    toast({
      title: 'Mensaje Enviado',
      description: 'Gracias por contactarnos. Te responderemos pronto.',
    });
    form.reset();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">Contáctanos</h1>
        <p className="text-muted-foreground mt-2 text-lg">Estamos aquí para ayudarte. ¿Tienes alguna pregunta?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader className="flex-row items-center gap-4">
              <Phone className="w-8 h-8 text-primary" />
              <CardTitle>Llámanos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Habla directamente con nuestro equipo.</p>
              <a href="tel:+595986230534" className="text-lg font-semibold text-primary hover:underline mt-2 block">+595 986 230534</a>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
               <CardTitle>Escríbenos</CardTitle>
               <CardDescription>Envía un correo al departamento correspondiente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <ShoppingCart className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Ventas y Pedidos</h4>
                  <p className="text-sm text-muted-foreground">Consultas sobre productos y compras.</p>
                  <a href="mailto:ventas@averon.com" className="text-sm font-medium text-primary hover:underline">ventas@averon.com</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Info className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Información General</h4>
                  <p className="text-sm text-muted-foreground">Preguntas generales sobre nosotros.</p>
                  <a href="mailto:info@averon.com" className="text-sm font-medium text-primary hover:underline">info@averon.com</a>
                </div>
              </div>
               <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Soporte</h4>
                  <p className="text-sm text-muted-foreground">Ayuda con tu cuenta o un pedido.</p>
                  <a href="mailto:soporte@averon.com" className="text-sm font-medium text-primary hover:underline">soporte@averon.com</a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Envía un Mensaje</CardTitle>
              <CardDescription>Completa el formulario y nos pondremos en contacto contigo.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu nombre" {...field} />
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
                            <Input placeholder="tu@email.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asunto</FormLabel>
                        <FormControl>
                          <Input placeholder="Motivo de tu consulta" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensaje</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Escribe tu mensaje aquí..." className="min-h-[120px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" size="lg" className="w-full">Enviar Mensaje</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
