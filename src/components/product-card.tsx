'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent link navigation when clicking the button
    e.stopPropagation();
    addItem(product);
    toast({
        title: 'Producto agregado',
        description: `${product.name} fue agregado a tu carrito.`,
    })
  }

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="p-0 relative">
          <div className="aspect-square w-full relative">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={product.imageHint}
            />
             {product.onSale && (
              <Badge variant="secondary" className="absolute top-3 right-3">OFERTA</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow flex flex-col">
            <p className="text-sm text-muted-foreground">{product.category}</p>
            <CardTitle className="text-base font-semibold mt-1 mb-2 leading-tight flex-grow">{product.name}</CardTitle>
            <p className="text-lg font-bold text-primary">Gs. {product.price.toLocaleString('es-PY')}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button 
            className="w-full" 
            variant="outline"
            onClick={handleAddToCart}
            disabled={product.availability === 'out-of-stock'}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.availability === 'in-stock' ? 'Agregar al carrito' : 'Agotado'}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
