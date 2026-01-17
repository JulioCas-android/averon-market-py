'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, User, Menu, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { CartSheet } from '@/components/cart-sheet';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';

const NavLinks = ({ onLinkClick }: { onLinkClick?: () => void }) => (
  <>
    <Link
      href="/#products"
      onClick={onLinkClick}
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
    >
      Productos
    </Link>
    <Link
      href="/about"
      onClick={onLinkClick}
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
    >
      Sobre Nosotros
    </Link>
    <Link
      href="/contact"
      onClick={onLinkClick}
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
    >
      Contacto
    </Link>
  </>
);

export function Header() {
  const { items } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Left Section: Menu, Logo, Nav */}
        <div className="flex items-center gap-2 md:gap-6">
          {/* Mobile Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir Menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              <SheetHeader className="border-b p-4">
                <SheetTitle className="sr-only">Menú Principal</SheetTitle>
                <Logo />
              </SheetHeader>
              <nav className="flex flex-col gap-4 p-4">
                <NavLinks onLinkClick={() => setIsMenuOpen(false)} />
              </nav>
            </SheetContent>
          </Sheet>
          
          <Logo />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <NavLinks />
          </nav>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {isClient && totalItems > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-2 -right-2 h-5 w-5 justify-center rounded-full p-0 text-xs"
              >
                {totalItems}
              </Badge>
            )}
            <span className="sr-only">Carrito de Compras</span>
          </Button>

          {isClient ? (
            authLoading ? (
              <Button variant="ghost" size="icon" disabled>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="sr-only">Cargando cuenta</span>
              </Button>
            ) : (
              <Link href={user ? '/profile' : '/login'}>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Cuenta de Usuario</span>
                </Button>
              </Link>
            )
          ) : (
            <div className="h-10 w-10 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
        </div>
      </div>
      <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} />
    </header>
  );
}
