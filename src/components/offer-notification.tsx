'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { sendPersonalizedOfferNotificationAction } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, Loader2 } from 'lucide-react';

export default function OfferNotification() {
  const [notification, setNotification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateOffer = async () => {
    setLoading(true);
    setNotification(null);
    setError(null);
    const result = await sendPersonalizedOfferNotificationAction();
    if (result.success) {
      setNotification(result.message);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleGenerateOffer} disabled={loading} className="w-full">
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        Generar Oferta Personalizada
      </Button>

      {notification && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertTitle>¡Oferta Especial para ti!</AlertTitle>
          <AlertDescription>{notification}</AlertDescription>
        </Alert>
      )}
       {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
