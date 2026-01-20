'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Copy, ClipboardCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDoc } from '@/firebase';
import type { PaymentSettings } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const CopyButton = ({ textToCopy }: { textToCopy: string }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: 'Copiado',
      description: `Se ha copiado "${textToCopy}".`,
      duration: 3000,
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleCopy} aria-label={`Copiar ${textToCopy}`}>
      {copied ? <ClipboardCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
};

const DetailItem = ({ label, value }: { label: string, value: string }) => (
    <div className="flex justify-between items-center text-sm py-2 border-b last:border-b-0">
      <div>
        <p className="text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
      <CopyButton textToCopy={value} />
    </div>
);

export default function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderId, setOrderId] = useState('');
  
  const { data: paymentSettings, loading: settingsLoading } = useDoc<PaymentSettings>('settings/payment');
  const showManualPaymentInstructions = ['TRNF', 'EWALLET', 'DOWN_PAYMENT'].includes(paymentMethod);

  useEffect(() => {
    const method = searchParams.get('method') || 'pago';
    const id = searchParams.get('orderId') || '';
    setPaymentMethod(method);
    setOrderId(id);
  }, [searchParams]);

  let title = "¡Pedido Confirmado!";
  let message = `Tu pedido ${orderId ? `(#${orderId.substring(0,7)}...)` : ''} ha sido registrado con éxito.`;

  switch (paymentMethod) {
    case 'ONLINE':
      title = "¡Pago Exitoso!";
      message = `Tu pago ha sido procesado exitosamente. Recibirás una confirmación por correo electrónico para tu pedido ${orderId ? `#${orderId.substring(0,7)}...` : ''}.`;
      break;
    case 'COD':
      message = `Tu pedido ${orderId ? `#${orderId.substring(0,7)}...` : ''} ha sido registrado y será procesado pronto. Pagarás al momento de la entrega.`;
      break;
    case 'TRNF':
    case 'EWALLET':
    case 'DOWN_PAYMENT':
      message = `Tu pedido ${orderId ? `#${orderId.substring(0,7)}...` : ''} está pendiente de pago. Por favor, usa los datos a continuación para pagar y confirma por WhatsApp.`;
      break;
  }
  
  const handleWhatsAppConfirm = () => {
    const phone = "595986230534";
    const whatsappMessage = `¡Hola! Acabo de realizar el pago para mi pedido #${orderId.substring(0,7)}. Adjunto mi comprobante. ¡Gracias!`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="mt-4 text-3xl font-bold">{title}</CardTitle>
            <CardDescription className="mt-2 text-lg text-muted-foreground">Gracias por tu compra.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-8">{message}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => router.push('/')} className="w-full sm:w-auto">
                  Seguir Comprando
              </Button>
              {orderId && (
                  <Button asChild variant="outline" className="w-full sm:w-auto">
                      <Link href={`/order/${orderId}`}>Ver Detalles del Pedido</Link>
                  </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        {showManualPaymentInstructions && (
            <Card>
                <CardHeader>
                    <CardTitle>Instrucciones de Pago</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {settingsLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        <>
                          {paymentMethod === 'TRNF' && paymentSettings?.bankAccount?.bankName && (
                            <div>
                              <h3 className="font-semibold mb-2">Transferencia Bancaria</h3>
                              <DetailItem label="Banco" value={paymentSettings.bankAccount.bankName} />
                              <DetailItem label="Titular" value={paymentSettings.bankAccount.accountHolderName} />
                              <DetailItem label="Cuenta N°" value={paymentSettings.bankAccount.accountNumber} />
                              <DetailItem label="CI/RUC" value={paymentSettings.bankAccount.accountHolderId} />
                              {paymentSettings.bankAccount.alias && <DetailItem label="Alias" value={paymentSettings.bankAccount.alias} />}
                            </div>
                          )}

                          {paymentMethod === 'EWALLET' && paymentSettings?.eWallets && paymentSettings.eWallets.length > 0 && (
                            <div>
                                <h3 className="font-semibold mb-2">Billeteras Electrónicas</h3>
                                {paymentSettings.eWallets.map(wallet => (
                                    <DetailItem key={wallet.id} label={wallet.name} value={wallet.identifier} />
                                ))}
                            </div>
                          )}

                          {(paymentMethod === 'DOWN_PAYMENT') && (
                            <p className="text-sm text-center text-muted-foreground p-4 bg-muted rounded-md">Puedes usar cualquiera de los métodos de pago (transferencia o billetera) para realizar el pago de la seña. Por favor, confirma el monto por WhatsApp.</p>
                          )}
                        </>
                    )}

                    <div className="pt-4">
                        <Button onClick={handleWhatsAppConfirm} className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white">
                            Confirmar Pago por WhatsApp
                        </Button>
                        <p className="text-xs text-muted-foreground text-center mt-2">
                          Recuerda adjuntar tu comprobante de pago en el chat.
                        </p>
                    </div>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
