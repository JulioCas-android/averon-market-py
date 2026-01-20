'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDoc, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { PageHeader } from '@/components/admin/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Skeleton } from '@/components/ui/skeleton';
import type { PaymentSettings } from '@/lib/types';

const settingsSchema = z.object({
  bankAccount: z.object({
    bankName: z.string().min(2, 'El nombre del banco es requerido.'),
    accountHolderName: z.string().min(3, 'El nombre del titular es requerido.'),
    accountNumber: z.string().min(5, 'El número de cuenta es requerido.'),
    accountHolderId: z.string().min(5, 'El RUC o CI del titular es requerido.'),
    alias: z.string().optional(),
  }),
  eWallets: z.array(z.object({
    id: z.string(),
    name: z.string().min(3, 'El nombre de la billetera es requerido.'),
    identifier: z.string().min(6, 'El identificador (ej: nro. de celular) es requerido.'),
  })),
});

export default function SettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { data: settingsData, loading: settingsLoading } = useDoc<PaymentSettings>('settings/payment');
  
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      bankAccount: {
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        accountHolderId: '',
        alias: '',
      },
      eWallets: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'eWallets',
  });

  useEffect(() => {
    if (settingsData) {
      form.reset({
        bankAccount: settingsData.bankAccount || {},
        eWallets: settingsData.eWallets || [],
      });
    }
  }, [settingsData, form]);

  const onSubmit = async (values: z.infer<typeof settingsSchema>) => {
    if (!firestore) return;
    const settingsDocRef = doc(firestore, 'settings', 'payment');
    
    setDoc(settingsDocRef, values, { merge: true })
      .then(() => {
        toast({ title: 'Configuración Guardada', description: 'Tus métodos de pago han sido actualizados.' });
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: settingsDocRef.path,
          operation: 'write',
          requestResourceData: values,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  if (settingsLoading) {
    return (
      <>
        <PageHeader title="Configuración de Pagos" />
        <div className="p-8 pt-0 space-y-8">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Configuración de Pagos"
        description="Administra los métodos de pago manuales que ofreces en tu tienda."
      />
      <div className="p-8 pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Cuenta Bancaria para Transferencias</CardTitle>
                <CardDescription>
                  Esta información se mostrará a los clientes que elijan pagar por transferencia.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="bankAccount.bankName" render={({ field }) => (
                  <FormItem><FormLabel>Nombre del Banco</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="bankAccount.accountHolderName" render={({ field }) => (
                  <FormItem><FormLabel>Nombre del Titular</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="bankAccount.accountNumber" render={({ field }) => (
                  <FormItem><FormLabel>Número de Cuenta</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="bankAccount.accountHolderId" render={({ field }) => (
                  <FormItem><FormLabel>CI o RUC del Titular</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="bankAccount.alias" render={({ field }) => (
                  <FormItem className="md:col-span-2"><FormLabel>Alias (Opcional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billeteras Electrónicas</CardTitle>
                <CardDescription>
                  Agrega las billeteras (Tigo Money, Personal, etc.) a las que los clientes pueden enviar pagos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex flex-col md:flex-row items-start gap-4 p-4 border rounded-lg">
                    <FormField control={form.control} name={`eWallets.${index}.name`} render={({ field }) => (
                      <FormItem className="flex-1 w-full"><FormLabel>Nombre (Ej: Tigo Money)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`eWallets.${index}.identifier`} render={({ field }) => (
                      <FormItem className="flex-1 w-full"><FormLabel>Identificador (Ej: 09XX-XXX-XXX)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="mt-auto md:mt-6">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => append({ id: crypto.randomUUID(), name: '', identifier: '' })}>
                  <Plus className="mr-2 h-4 w-4" /> Agregar Billetera
                </Button>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar Cambios
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
