'use client';

import { useEffect, type ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

export function PWAProvider({ children }: { children: ReactNode }) {
  const { toast, dismiss } = useToast();

  useEffect(() => {
    // 1. Registrar el service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Error al registrar el Service Worker:', err);
      });
    }

    // 2. Escuchar el aviso de instalación del navegador
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      
      const handleInstallClick = () => {
        // @ts-ignore
        e.prompt();
        // @ts-ignore
        e.userChoice.then(() => {
          dismiss('install-pwa-toast');
        });
      };
      
      toast({
        id: 'install-pwa-toast',
        title: 'Instalar Aplicación',
        description: '¡Lleva AVERON Market a tu pantalla de inicio para un acceso rápido!',
        action: (
          <Button onClick={handleInstallClick}>
            <Download className="mr-2 h-4 w-4" /> Instalar
          </Button>
        ),
        duration: Infinity,
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 3. Solicitar permisos de notificación tras un breve tiempo
    const timer = setTimeout(() => {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }, 10000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, [toast, dismiss]);

  return <>{children}</>;
}
