
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
}

export function ProductCard({ product, layout = 'grid' }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    // Generate random number on client to avoid hydration mismatch
    setReviewCount(Math.floor(Math.random() * 200) + 10);
  }, []);

  const isInStock = product.stock > 0;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  }

  const handleBuyNow = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    router.push('/checkout');
  }

  if (layout === 'list') {
    return (
        <Link href={`/product/${product.id}`} className="group block">
            <Card className="flex flex-row items-center gap-4 p-2 transition-all duration-300 hover:shadow-md hover:bg-muted/50">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    data-ai-hint={product.imageHint}
                    />
                </div>
                <div className="flex-grow">
                    <p className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">{product.name}</p>
                    <p className="text-base font-bold text-primary mt-1">Gs. {product.price.toLocaleString('es-PY')}</p>
                </div>
            </Card>
        </Link>
    )
  }

  return (
    <Link href={`/product/${product.id}`} className="group block h-full">
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
            <Badge variant={isInStock ? 'default' : 'destructive'} className={`absolute bottom-3 left-3 ${isInStock ? 'bg-green-600/90 hover:bg-green-700/90' : 'bg-destructive/90'}`}>
              {isInStock ? 'En Stock' : 'Agotado'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow flex flex-col">
            <CardTitle className="text-base font-semibold mt-1 mb-2 leading-tight flex-grow group-hover:text-primary transition-colors">{product.name}</CardTitle>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-0.5 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 text-gray-300 fill-gray-300" />
                </div>
                {reviewCount > 0 && <span className="text-muted-foreground/80">({reviewCount})</span>}
            </div>

            <p className="text-2xl font-bold text-primary">Gs. {product.price.toLocaleString('es-PY')}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-col gap-2">
            <Button 
                className="w-full" 
                onClick={handleBuyNow}
                disabled={!isInStock}
              >
              Comprar Ahora
            </Button>
            <Button 
                className="w-full" 
                variant="outline"
                onClick={handleAddToCart}
                disabled={!isInStock}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Agregar al carrito
            </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
