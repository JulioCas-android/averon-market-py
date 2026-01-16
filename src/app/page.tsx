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
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative h-full flex flex-col items-center justify-center text-center p-4">
          <div className="flex items-center space-x-4 mb-4 animate-fade-in-down">
            <svg aria-hidden="true" className="h-16 w-16 md:h-20 md:w-20" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="swoosh-gradient-logo-hero" x1="4.5" y1="36" x2="38" y2="8" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#F59E0B"/>
                        <stop offset="1" stopColor="#F97316"/>
                    </linearGradient>
                </defs>
                <path d="M21.33 1.33L0 40H8.33L13.66 26.66H30.33L35.66 40H44L27.66 1.33H21.33ZM17.33 21.33L22.5 8.33L27.66 21.33H17.33Z" fill="hsl(var(--primary))"/>
                <path d="M2 34C15 30, 30 30, 39 24C43 21, 41 15, 37 14C25 12, 10 20, 5 30C2.5 35, 0 36, 2 34Z" fill="url(#swoosh-gradient-logo-hero)"/>
                <path d="M37 12L38.5 9L40 12L43 13.5L40 15L38.5 18L37 15L34 13.5L37 12Z" fill="#FBBF24"/>
            </svg>
            <div className="flex flex-col items-start">
              <span className="font-extrabold text-4xl md:text-6xl tracking-tight averon-gradient-text">
                AVERON
              </span>
              <span className="bg-secondary text-secondary-foreground text-xs md:text-sm font-semibold px-3 py-1 rounded-sm -mt-1 md:-mt-2 tracking-widest shadow-sm">
                MARKET PY
              </span>
            </div>
          </div>
          <p className="text-lg md:text-xl max-w-2xl mb-8 animate-fade-in-up">Tecnología y comodidad en un solo lugar.</p>
          <Button size="lg" variant="secondary" className="animate-fade-in-up" asChild>
            <a href="#products">Ver Productos</a>
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
