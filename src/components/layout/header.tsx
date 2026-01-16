'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, User, Menu } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { CartSheet } from '@/components/cart-sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '../ui/sheet';

const NavLinks = ({ onLinkClick }: { onLinkClick?: () => void }) => (
  <>
    <Link href="/#products" onClick={onLinkClick} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">{"Productos"}</Link>
    <Link href="/about" onClick={onLinkClick} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">{"Sobre Nosotros"}</Link>
    <Link href="/contact" onClick={onLinkClick} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">{"Contacto"}</Link>
  </>
);

export function Header() {
  const { items } = useCart();
  const { user } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Logo />
        </div>
        
        {isMobile && (
           <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open Menu</span>
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
        )}
        
        <div className="flex items-center justify-between w-full">
          <div className="md:hidden">
            <Logo />
          </div>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <NavLinks />
          </nav>

          <div className="flex items-center justify-end space-x-4">
            <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 justify-center rounded-full p-0">
                  {totalItems}
                </Badge>
              )}
              <span className="sr-only">Shopping Cart</span>
            </Button>
            <Link href={user ? '/profile' : '/login'}>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">User Account</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} />
    </header>
  );
}
