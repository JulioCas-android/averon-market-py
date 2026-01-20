
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
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

// --- Tipos para la Configuración de Pagos ---

export interface EWallet {
  id: string; // for react-hook-form field array key
  name: string;
  identifier: string;
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  accountHolderId: string;
  alias?: string;
}

export interface PaymentSettings {
  id: string; // Should be a fixed value like 'payment'
  bankAccount: BankAccount;
  eWallets: EWallet[];
}
