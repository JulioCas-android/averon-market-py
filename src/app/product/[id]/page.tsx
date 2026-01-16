'use client';

import { useMemo } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { products as allProducts } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const product = allProducts.find(p => p.id === params.id);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product]);

  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: 'Producto agregado',
      description: `${product.name} fue agregado a tu carrito.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start">
        <div className="bg-card p-4 rounded-lg shadow-sm aspect-square flex items-center justify-center">
          <Image
            src={product.image}
            alt={product.name}
            width={500}
            height={500}
            className="rounded-lg object-contain max-h-[500px]"
            data-ai-hint={product.imageHint}
          />
        </div>

        <div>
          {product.onSale && <Badge variant="secondary" className="mb-2">OFERTA</Badge>}
          <h1 className="text-3xl lg:text-4xl font-bold font-headline mb-2">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-yellow-500">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current text-gray-300" />
            </div>
            <span className="text-sm text-muted-foreground">(32 reseñas)</span>
          </div>
          <p className="text-3xl font-semibold text-primary mb-6">Gs. {product.price.toLocaleString('es-PY')}</p>
          <p className="text-muted-foreground mb-6">{product.description}</p>
          
          <div className="mb-6">
            <Badge variant={product.availability === 'in-stock' ? 'default' : 'destructive'} className={product.availability === 'in-stock' ? 'bg-green-600 hover:bg-green-700' : ''}>
              {product.availability === 'in-stock' ? 'En Stock' : 'Agotado'}
            </Badge>
          </div>

          <Button 
            size="lg" 
            onClick={handleAddToCart} 
            disabled={product.availability === 'out-of-stock'}
            className="w-full md:w-auto"
          >
            Agregar al Carrito
          </Button>

           <div className="mt-8 space-y-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-primary"/>
                  <span>Envío rápido y seguro a todo el país.</span>
              </div>
              <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary"/>
                  <span>Compra protegida y garantía de calidad.</span>
              </div>
          </div>
        </div>
      </div>
      {relatedProducts.length > 0 && (
          <div className="mt-20">
              <h2 className="text-2xl font-bold mb-6 text-center">Productos Relacionados</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((p: Product) => (
                      <ProductCard key={p.id} product={p} />
                  ))}
              </div>
          </div>
      )}
    </div>
  );
}
