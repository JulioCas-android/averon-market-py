
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  image: string;
  imageHint?: string;
  category: string;
  onSale?: boolean;
  featured?: boolean;
  stock: number;
  condition: 'Nuevo' | 'Usado' | 'Reacondicionado';
  color?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: 'customer' | 'admin';
}

export interface Order {
  id: string;
  userId?: string; // For registered users
  customerRazonSocial: string;
  customerRuc: string;
  customerEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPhone: string;
  createdAt: string;
  items: CartItem[];
  total: number;
  status: 'Procesando' | 'Pendiente de Pago' | 'Pagado' | 'Enviado' | 'Entregado' | 'Cancelado';
  paymentMethod: string;
  thirdPartyReceiver: boolean;
  thirdPartyName?: string;
  thirdPartyId?: string;
  pagoparTransactionId?: string;
}

export interface Sale {
    id: string;
    items: {
        productId: string;
        name: string;
        quantity: number;
        price: number;
    }[];
    total: number;
    createdAt: string;
}
