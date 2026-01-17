import { Logo } from '@/components/logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Facebook, Instagram } from 'lucide-react';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      {...props}
    >
      <path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91a9.878 9.878 0 0 0-2.91-7.01zM12.04 20.13h-.01c-1.43 0-2.8-.39-4.02-1.12l-.29-.17-3 1.58.79-2.92-.19-.31a8.08 8.08 0 0 1-1.23-4.22c0-4.42 3.59-8.02 8.02-8.02s8.02 3.59 8.02 8.02c0 4.42-3.59 8.02-8.02 8.02zm4.46-5.83c-.24-.12-1.43-.7-1.66-.78-.22-.08-.38-.12-.54.12-.16.24-.63.78-.77.94-.14.16-.28.18-.52.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.42-1.72-.18-.24-.03-.38.11-.5.12-.11.26-.28.39-.42.13-.14.17-.24.26-.4.09-.16.04-.3-.02-.42-.06-.12-.54-1.3-1.12-1.84-.57-.54-.91-.45-1.05-.45h-.2c-.2 0-.52.08-.79.38-.27.3-.9.84-1.04 2.14s.69 3.82 2.2 5.48c1.5 1.66 3.24 2.65 5.5 3.5.76.29 1.39.46 1.86.58.47.12.89.1.91.1.53-.02 1.53-.62 1.74-1.22.22-.6.22-1.11.15-1.21-.07-.1-.23-.16-.48-.28z"/>
    </svg>
);


export function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <Logo />
            <p className="text-sm">Tecnología y comodidad en un solo lugar.</p>
            <div className="flex space-x-4">
              <Link href="#" aria-label="Facebook de AVERON Market PY" className="hover:text-foreground"><Facebook className="h-5 w-5" /></Link>
              <Link href="#" aria-label="Instagram de AVERON Market PY" className="hover:text-foreground"><Instagram className="h-5 w-5" /></Link>
              <Link href="https://wa.me/595986230534" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp de AVERON Market PY" className="hover:text-foreground"><WhatsAppIcon className="h-5 w-5" /></Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Navegación</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-foreground">Inicio</Link></li>
              <li><Link href="/#products" className="hover:text-foreground">Productos</Link></li>
              <li><Link href="/about" className="hover:text-foreground">Sobre Nosotros</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">Contacto</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="hover:text-foreground">Términos de Servicio</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">Política de Privacidad</Link></li>
              <li><Link href="/returns" className="hover:text-foreground">Política de Devoluciones</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Suscríbete</h4>
            <p className="text-sm mb-2">Recibe ofertas especiales y noticias.</p>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input type="email" placeholder="Email" />
              <Button type="submit" variant="secondary">OK</Button>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm">
          <p>
            <Link href="/login" className="opacity-50 hover:opacity-100" aria-label="Iniciar sesión para administrar el sitio">
                &copy;
            </Link>
            {' '}{new Date().getFullYear()} AVERON Market PY. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
