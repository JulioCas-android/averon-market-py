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
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 12c0 1.77.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2M7.49 17.38c-.14-.24-.49-.39-.99-.68-.5-.29-2.98-1.46-3.44-1.63s-.79-.24-.79.24c0 .49.79 1.63.94 1.82.15.19 1.63 2.59 3.96 3.5.59.24.94.39 1.27.49.59.19 1.13.16 1.56.1.48-.07 1.49-.61 1.71-1.21.22-.59.22-1.11.15-1.21-.07-.1-.22-.16-.47-.29zm6.6-1.49c-.2-.35-.4-.4-.57-.4-.17 0-.36.01-.52.01-.33 0-.66.09-.96.39-.3.3-.99 1.13-.99 2.18s1.02 2.52 1.17 2.69c.15.17 2.01 3.2 4.88 4.25.68.27 1.22.43 1.64.56.66.19 1.26.16 1.71.1.5-.07 1.52-.62 1.74-1.22.23-.6.23-1.12.16-1.22-.07-.1-.23-.16-.48-.28s-1.52-.75-1.75-.83c-.23-.08-.39-.13-.56.13-.17.26-.66.83-.81.99-.15.16-.29.18-.54.06-.25-.12-1.07-.39-2.04-1.26-.76-.66-1.27-1.47-1.42-1.72s-.02-.38.11-.51c.12-.11.26-.29.39-.43.13-.14.18-.23.28-.39.09-.15.05-.29-.02-.41s-.56-1.35-.77-1.84c-.2-.5-.41-.43-.56-.43-.14 0-.3 0-.45 0z"/>
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
            <Link href="/admin" className="opacity-50 hover:opacity-100" aria-label="Acceder al panel de administración">
                &copy;
            </Link>
            {' '}{new Date().getFullYear()} AVERON Market PY. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
