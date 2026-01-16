'use client';

import { useMemo, useState } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useDoc, useCollection } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Truck, ShieldCheck, Heart, MessageCircleQuestion, Minus, Plus } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function ProductPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-12 w-1/3" />
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div className="mt-12">
                <Skeleton className="h-40 w-full" />
            </div>
        </div>
    );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const { data: product, loading: productLoading } = useDoc<Product>(`products/${id}`);
  const { data: allProducts, loading: relatedLoading } = useCollection<Product>('products');

  const [quantity, setQuantity] = useState(1);

  const relatedProducts = useMemo(() => {
    if (!product || !allProducts) return [];
    return allProducts
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product, allProducts]);

  if (productLoading) {
    return <ProductPageSkeleton />;
  }

  if (!product) {
    notFound();
  }

  const isInStock = product.stock > 0;

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast({
      title: 'Producto agregado',
      description: `${quantity} x ${product.name} fue agregado a tu carrito.`,
    });
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    router.push('/checkout');
  };
  
  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, Math.min(product.stock, prev + amount)));
  }
  
  const soldCount = useMemo(() => Math.floor(Math.random() * 50) + 1, [product.id]);
  const reviewCount = useMemo(() => Math.floor(Math.random() * 200) + 10, [product.id]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 xl:gap-12">
        {/* Image Column */}
        <div className="lg:col-span-3">
          <div className="sticky top-24 bg-card p-4 rounded-lg shadow-sm aspect-square flex items-center justify-center border">
            <Image
              src={product.image}
              alt={product.name}
              width={600}
              height={600}
              className="rounded-lg object-contain max-h-[550px]"
              data-ai-hint={product.imageHint}
              priority
            />
          </div>
        </div>

        {/* Info & Actions Column */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold font-headline">{product.name}</h1>
            {product.color && <p className="text-sm text-muted-foreground mt-1">Color: {product.color}</p>}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current text-gray-300" />
                  <span className="text-muted-foreground ml-1">({reviewCount} reseñas)</span>
              </div>
              <span className='text-green-600 font-semibold'>{soldCount} vendidos</span>
            </div>
          </div>
          
          <Separator />
          
          <div className='space-y-4'>
            <p className="text-4xl font-bold text-primary">Gs. {product.price.toLocaleString('es-PY')}</p>
            <Badge variant={isInStock ? 'default' : 'destructive'} className={isInStock ? 'bg-green-600 hover:bg-green-700' : ''}>
              {isInStock ? 'En Stock' : 'Agotado'}
            </Badge>
          </div>
          
          <Card className='border-primary/50 border-2'>
            <CardContent className="pt-6 space-y-4">
               <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cantidad:</span>
                 <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center font-bold text-lg">{quantity}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(1)} disabled={quantity >= product.stock}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button size="lg" onClick={handleBuyNow} disabled={!isInStock} className="w-full h-12 text-lg">
                Comprar Ahora
              </Button>
              <Button size="lg" onClick={handleAddToCart} disabled={!isInStock} className="w-full h-12" variant="outline">
                Agregar al Carrito
              </Button>
              <Button size="lg" disabled className="w-full h-12" variant="ghost">
                <Heart className="mr-2 h-5 w-5" />
                Agregar a la lista de deseos
              </Button>
            </CardContent>
          </Card>

           <div className="mt-6 space-y-3 text-sm text-muted-foreground border p-4 rounded-lg">
              <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 text-primary flex-shrink-0"/>
                  <div>
                    <span className='font-semibold text-foreground'>Envío rápido y seguro</span>
                    <p>Recibe tu producto en todo el país.</p>
                  </div>
              </div>
               <Separator/>
              <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0"/>
                  <div>
                    <span className='font-semibold text-foreground'>Compra Protegida</span>
                     <p>Recibe el producto que esperabas o te devolvemos tu dinero.</p>
                  </div>
              </div>
          </div>
        </div>
      </div>
      
      {/* Details & Description Section */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-5 gap-8 xl:gap-12">
        <div className='lg:col-span-3'>
            <Card>
                <CardHeader><CardTitle>Acerca de este artículo</CardTitle></CardHeader>
                <CardContent>
                    <table className="w-full text-sm">
                        <tbody>
                            <tr className='border-b'>
                                <td className="py-3 font-medium text-muted-foreground pr-4">Condición</td>
                                <td className="py-3 font-semibold">{product.condition}</td>
                            </tr>
                            <tr className='border-b'>
                                <td className="py-3 font-medium text-muted-foreground pr-4">Categoría</td>
                                <td className="py-3 font-semibold">{product.category}</td>
                            </tr>
                             {product.color && (
                              <tr className='border-b'>
                                  <td className="py-3 font-medium text-muted-foreground pr-4">Color</td>
                                  <td className="py-3 font-semibold">{product.color}</td>
                              </tr>
                             )}
                            <tr className='border-b'>
                                <td className="py-3 font-medium text-muted-foreground pr-4">Stock</td>
                                <td className="py-3 font-semibold">{isInStock ? `${product.stock} disponibles` : 'Agotado'}</td>
                            </tr>
                             <tr>
                                <td className="py-3 font-medium text-muted-foreground pr-4">En oferta</td>
                                <td className="py-3 font-semibold">{product.onSale ? 'Sí' : 'No'}</td>
                            </tr>
                        </tbody>
                    </table>
                </CardContent>
            </Card>
             <Card className="mt-6">
                <CardHeader><CardTitle>Descripción del producto</CardTitle></CardHeader>
                <CardContent className="whitespace-pre-wrap text-muted-foreground">
                    {product.description}
                </CardContent>
            </Card>
        </div>
        <div className='lg:col-span-2'>
            {relatedProducts.length > 0 && (
              <div className="sticky top-24">
                  <h2 className="text-xl font-bold mb-4">Productos Relacionados</h2>
                  <div className="flex flex-col gap-4">
                    {relatedLoading ? 
                      Array.from({length: 2}).map((_, i) => <Skeleton key={i} className="h-28 w-full"/>)
                      : relatedProducts.map((p: Product) => (
                          <ProductCard key={p.id} product={p} layout="list" />
                      ))
                    }
                  </div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}
