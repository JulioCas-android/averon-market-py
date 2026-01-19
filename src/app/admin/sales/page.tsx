'use client';

import { useMemo, useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import type { Product, Sale } from '@/lib/types';
import { PageHeader } from '@/components/admin/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronsUpDown, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type SaleItem = {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    stock: number;
}

export default function SalesPage() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const productsQuery = useMemo(() => firestore ? collection(firestore, 'products') : null, [firestore]);
    const { data: products, loading: productsLoading } = useCollection<Product>(productsQuery);

    const salesQuery = useMemo(() => firestore ? collection(firestore, 'sales') : null, [firestore]);
    const { data: sales, loading: salesLoading } = useCollection<Sale>(salesQuery);

    const [popoverOpen, setPopoverOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [currentSaleItems, setCurrentSaleItems] = useState<SaleItem[]>([]);

    const totalVentas = useMemo(() => {
        if (!sales) return 0;
        return sales.reduce((acc, sale) => acc + sale.total, 0);
    }, [sales]);

    const handleAddProductToSale = () => {
        if (!selectedProduct) {
            toast({ variant: 'destructive', title: 'Selecciona un producto' });
            return;
        }

        const existingItem = currentSaleItems.find(item => item.productId === selectedProduct.id);
        if (existingItem) {
            if (existingItem.quantity < selectedProduct.stock) {
                setCurrentSaleItems(currentSaleItems.map(item =>
                    item.productId === selectedProduct.id ? { ...item, quantity: item.quantity + 1 } : item
                ));
            } else {
                toast({ variant: 'destructive', title: 'Stock insuficiente' });
            }
        } else {
             if (selectedProduct.stock > 0) {
                setCurrentSaleItems([...currentSaleItems, {
                    productId: selectedProduct.id,
                    name: selectedProduct.name,
                    quantity: 1,
                    price: selectedProduct.onSale && selectedProduct.salePrice ? selectedProduct.salePrice : selectedProduct.price,
                    stock: selectedProduct.stock
                }]);
             } else {
                 toast({ variant: 'destructive', title: 'Producto sin stock'});
             }
        }
    };

    const handleRemoveItem = (productId: string) => {
        setCurrentSaleItems(currentSaleItems.filter(item => item.productId !== productId));
    }
    
    const handleUpdateQuantity = (productId: string, newQuantity: number) => {
        const item = currentSaleItems.find(item => item.productId === productId);
        if (!item) return;

        if (newQuantity > 0 && newQuantity <= item.stock) {
            setCurrentSaleItems(currentSaleItems.map(i => i.productId === productId ? {...i, quantity: newQuantity} : i));
        } else if (newQuantity > item.stock) {
            toast({ variant: 'destructive', title: 'Stock insuficiente' });
        }
    }

    const currentSaleTotal = useMemo(() => {
        return currentSaleItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [currentSaleItems]);
    
    const handleRegisterSale = async () => {
        if (currentSaleItems.length === 0 || !firestore) return;

        const newSale = {
            items: currentSaleItems.map(({productId, name, quantity, price}) => ({productId, name, quantity, price})),
            total: currentSaleTotal,
            createdAt: new Date().toISOString()
        };

        const salesCollection = collection(firestore, 'sales');

        addDoc(salesCollection, newSale)
        .then(() => {
            toast({ title: 'Venta Registrada', description: 'La venta se ha guardado con éxito.' });
            setCurrentSaleItems([]);
            setSelectedProduct(null);
        })
        .catch((serverError) => {
            const permissionError = new FirestorePermissionError({ path: salesCollection.path, operation: 'create', requestResourceData: newSale });
            errorEmitter.emit('permission-error', permissionError);
        });
    }

  return (
    <>
      <PageHeader
        title="Módulo de Ventas"
        description="Registra ventas directas y consulta el historial."
      />
      <div className="p-8 pt-0 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Venta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={popoverOpen}
                      className="w-full justify-between"
                    >
                      {selectedProduct ? selectedProduct.name : 'Seleccionar producto...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar producto..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron productos.</CommandEmpty>
                        <CommandGroup>
                          {products?.map((product) => (
                            <CommandItem
                              key={product.id}
                              value={product.name}
                              onSelect={() => {
                                setSelectedProduct(product);
                                setPopoverOpen(false);
                              }}
                            >
                              {product.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Button onClick={handleAddProductToSale}><Plus className="mr-2 h-4 w-4"/> Agregar</Button>
              </div>

                <div className='min-h-[200px] border rounded-md'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead>Cantidad</TableHead>
                                <TableHead>Precio Unit.</TableHead>
                                <TableHead>Subtotal</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentSaleItems.length > 0 ? (
                                currentSaleItems.map(item => (
                                    <TableRow key={item.productId}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>
                                            <input 
                                                type="number" 
                                                value={item.quantity} 
                                                onChange={(e) => handleUpdateQuantity(item.productId, parseInt(e.target.value))}
                                                className="w-16 rounded-md border p-1 text-center bg-transparent"
                                                min="1"
                                                max={item.stock}
                                            />
                                        </TableCell>
                                        <TableCell>Gs. {item.price.toLocaleString('es-PY')}</TableCell>
                                        <TableCell>Gs. {(item.price * item.quantity).toLocaleString('es-PY')}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.productId)}>
                                                <Trash2 className="h-4 w-4 text-destructive"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">Agrega productos para iniciar la venta.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex justify-end items-center gap-4">
                    <span className="text-lg font-bold">Total: Gs. {currentSaleTotal.toLocaleString('es-PY')}</span>
                    <Button onClick={handleRegisterSale} disabled={currentSaleItems.length === 0}>
                        Registrar Venta
                    </Button>
                </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Ventas Totales</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">Gs. {totalVentas.toLocaleString('es-PY')}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Últimas Ventas</CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {salesLoading ? (
                                <TableRow><TableCell colSpan={2} className="h-24 text-center">Cargando...</TableCell></TableRow>
                            ) : sales && sales.length > 0 ? (
                                sales.slice(0, 5).map((sale) => (
                                <TableRow key={sale.id}>
                                    <TableCell>{new Date(sale.createdAt).toLocaleDateString('es-PY')}</TableCell>
                                    <TableCell>Gs. {sale.total.toLocaleString('es-PY')}</TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={2} className="h-24 text-center">No hay ventas registradas.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
