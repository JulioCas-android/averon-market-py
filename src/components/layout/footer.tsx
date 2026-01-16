import { Logo } from '@/components/logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Github, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <Logo />
            <p className="text-sm">Confianza y calidad, a un clic de distancia.</p>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-foreground"><Github className="h-5 w-5" /></Link>
              <Link href="#" className="hover:text-foreground"><Twitter className="h-5 w-5" /></Link>
              <Link href="#" className="hover:text-foreground"><Instagram className="h-5 w-5" /></Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Navegación</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-foreground">Inicio</Link></li>
              <li><Link href="/#products" className="hover:text-foreground">Productos</Link></li>
              <li><Link href="#" className="hover:text-foreground">Sobre Nosotros</Link></li>
              <li><Link href="#" className="hover:text-foreground">Contacto</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-foreground">Términos de Servicio</Link></li>
              <li><Link href="#" className="hover:text-foreground">Política de Privacidad</Link></li>
              <li><Link href="#" className="hover:text-foreground">Política de Devoluciones</Link></li>
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
          <p>&copy; {new Date().getFullYear()} Averon Market PY. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
