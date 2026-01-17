import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/use-auth';
import { CartProvider } from '@/hooks/use-cart';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { WhatsAppFAB } from '@/components/whatsapp-fab';
import { PWAProvider } from '@/components/pwa-provider';

export const metadata: Metadata = {
  title: 'AVERON Market PY',
  description: 'Tecnología y comodidad en un solo lugar.',
  icons: {
    icon: 'https://i.imgur.com/UpxHMxI.png',
    apple: 'https://i.imgur.com/UpxHMxI.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0B57D0',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AuthProvider>
            <CartProvider>
              <PWAProvider>
                <div className="relative flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
                <Toaster />
              </PWAProvider>
            </CartProvider>
          </AuthProvider>
        </FirebaseClientProvider>
        <WhatsAppFAB />
      </body>
    </html>
  );
}
