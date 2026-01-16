export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  imageHint: string;
  category: string;
  onSale?: boolean;
  availability: 'in-stock' | 'out-of-stock';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'customer' | 'admin';
}

export interface Order {
  id: string;
  userId?: string; // For registered users
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPhone: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Procesando' | 'Pendiente de Pago' | 'Pagado' | 'Enviado' | 'Entregado' | 'Cancelado';
}
