'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { products as allProducts } from '@/lib/products';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown, PackageCheck, Truck, ShieldCheck } from 'lucide-react';
import { heroImage } from '@/lib/placeholder-images';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');

  const categories = useMemo(() => ['all', ...Array.from(new Set(allProducts.map(p => p.category)))], []);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = allProducts;

    if (searchTerm) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }

    if (availability !== 'all') {
      filtered = filtered.filter(p => p.availability === availability);
    }

    return filtered.sort((a, b) => {
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
  }, [searchTerm, category, availability, sortBy]);


  return (
    <div className="bg-background">
      <section className="relative w-full h-[50vh] min-h-[400px] text-white">
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover"
          priority
          data-ai-hint={heroImage.imageHint}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 font-headline animate-fade-in-down">Averon Market PY</h1>
          <p className="text-lg md:text-xl max-w-2xl mb-8 animate-fade-in-up">Confianza y calidad, a un clic de distancia.</p>
          <Button size="lg" variant="secondary" className="animate-fade-in-up">
            Explorar Ofertas
          </Button>
        </div>
      </section>
      
      <section className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
                <PackageCheck className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Calidad Garantizada</h3>
                <p className="text-muted-foreground">Productos seleccionados para asegurar tu satisfacción.</p>
            </div>
            <div className="flex flex-col items-center">
                <Truck className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Envío Rápido</h3>
                <p className="text-muted-foreground">Recibe tus compras en la puerta de tu casa.</p>
            </div>
            <div className="flex flex-col items-center">
                <ShieldCheck className="w-12 h-12 text-primary mb-4" />
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

        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-16">No se encontraron productos que coincidan con su búsqueda.</p>
        )}
      </section>
    </div>
  );
}
