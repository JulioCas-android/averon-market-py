'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, PackageCheck, Truck, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const firestore = useFirestore();
  const productsQuery = useMemo(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const { data: allProducts, loading } = useCollection<Product>(productsQuery);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');

  const categories = useMemo(() => {
    if (!allProducts) return ['all'];
    return ['all', ...Array.from(new Set(allProducts.map(p => p.category)))];
  }, [allProducts]);

  const filteredAndSortedProducts = useMemo(() => {
    if (!allProducts) return [];

    let filtered = allProducts;

    if (searchTerm) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }
    
    if (availability === 'in-stock') {
      filtered = filtered.filter(p => p.stock > 0);
    } else if (availability === 'out-of-stock') {
      filtered = filtered.filter(p => p.stock <= 0);
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }, [allProducts, searchTerm, category, availability, sortBy]);

  const ProductGridSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-[250px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-background">
      <section className="relative w-full bg-muted/30">
        <div className="container mx-auto flex justify-center py-4">
          <Image
            src="https://i.imgur.com/Hj82IwR.png"
            alt="AVERON Market PY Banner"
            width={800}
            height={140}
            priority
            className="object-contain"
          />
        </div>
      </section>
      
      <div className="container mx-auto text-center py-6">
        <Button size="lg" variant="secondary" asChild>
          <a href="#products">Ver Productos</a>
        </Button>
      </div>
      
      <section className="container mx-auto pb-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center group">
                <PackageCheck className="w-12 h-12 text-primary mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:animate-pulse" />
                <h3 className="text-xl font-semibold mb-2">Calidad Garantizada</h3>
                <p className="text-muted-foreground">Productos seleccionados para asegurar tu satisfacción.</p>
            </div>
            <div className="flex flex-col items-center group">
                <Truck className="w-12 h-12 text-primary mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:animate-pulse" />
                <h3 className="text-xl font-semibold mb-2">Envío Rápido</h3>
                <p className="text-muted-foreground">Recibe tus compras en la puerta de tu casa.</p>
            </div>
            <div className="flex flex-col items-center group">
                <ShieldCheck className="w-12 h-12 text-primary mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:animate-pulse" />
                <h3 className="text-xl font-semibold mb-2">Pago Seguro</h3>
                <p className="text-muted-foreground">Tus transacciones están protegidas con nosotros.</p>
            </div>
        </div>
      </section>

      <section id="products" className="container mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-8 font-headline">Nuestros Productos</h2>

        <div className="bg-card p-4 rounded-lg shadow-sm mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Categoría</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Disponibilidad</label>
            <Select value={availability} onValueChange={setAvailability}>
              <SelectTrigger>
                <SelectValue placeholder="Disponibilidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="in-stock">En Stock</SelectItem>
                <SelectItem value="out-of-stock">Agotado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
             <label className="text-sm font-medium text-muted-foreground">Ordenar por</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
                <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
                <SelectItem value="price-asc">Precio (Menor a Mayor)</SelectItem>
                <SelectItem value="price-desc">Precio (Mayor a Menor)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <ProductGridSkeleton />
        ) : filteredAndSortedProducts && filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-16">No se encontraron productos. El administrador puede agregar productos nuevos en el panel de administración.</p>
        )}
      </section>
    </div>
  );
}
