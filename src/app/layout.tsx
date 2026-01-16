import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { AuthProvider } from '@/hooks/use-auth';
import { CartProvider } from '@/hooks/use-cart';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'AVERON Market PY',
  description: 'Tecnología y comodidad en un solo lugar.',
  themeColor: '#0B57D0',
  icons: {
    icon: 'https://i.imgur.com/UpxHMxI.png',
    apple: 'https://i.imgur.com/UpxHMxI.png',
  },
};

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      {...props}
    >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 12c0 1.77.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2M7.49 17.38c-.14-.24-.49-.39-.99-.68-.5-.29-2.98-1.46-3.44-1.63s-.79-.24-.79.24c0 .49.79 1.63.94 1.82.15.19 1.63 2.59 3.96 3.5.59.24.94.39 1.27.49.59.19 1.13.16 1.56.1.48-.07 1.49-.61 1.71-1.21.22-.59.22-1.11.15-1.21-.07-.1-.22-.16-.47-.29zm6.6-1.49c-.2-.35-.4-.4-.57-.4-.17 0-.36.01-.52.01-.33 0-.66.09-.96.39-.3.3-.99 1.13-.99 2.18s1.02 2.52 1.17 2.69c.15.17 2.01 3.2 4.88 4.25.68.27 1.22.43 1.64.56.66.19 1.26.16 1.71.1.5-.07 1.52-.62 1.74-1.22.23-.6.23-1.12.16-1.22-.07-.1-.23-.16-.48-.28s-1.52-.75-1.75-.83c-.23-.08-.39-.13-.56.13-.17.26-.66.83-.81.99-.15.16-.29.18-.54.06-.25-.12-1.07-.39-2.04-1.26-.76-.66-1.27-1.47-1.42-1.72s-.02-.38.11-.51c.12-.11.26-.29.39-.43.13-.14.18-.23.28-.39.09-.15.05-.29-.02-.41s-.56-1.35-.77-1.84c-.2-.5-.41-.43-.56-.43-.14 0-.3 0-.45 0z"/>
    </svg>
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const whatsappMessage = "¡Hola! Estoy visitando AVERON Market PY y me gustaría recibir más información.";
  const whatsappUrl = `https://wa.me/595986230534?text=${encodeURIComponent(whatsappMessage)}`;
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AuthProvider>
            <CartProvider>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </FirebaseClientProvider>
        <Link
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 rounded-full bg-[#25D366] p-3 text-white shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
          aria-label="Contactar por WhatsApp"
        >
          <WhatsAppIcon className="h-8 w-8" />
        </Link>
      </body>
    </html>
  );
}
