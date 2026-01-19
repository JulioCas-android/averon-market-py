
'use server';

import type { Order } from './types';
import { createHash } from 'crypto';

const PAGOPAR_API_URL = 'https://api.pagopar.com/api/comercios/2.0/iniciar-transaccion';
const PAGOPAR_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAGOPAR_PUBLIC_KEY || '';
const PAGOPAR_PRIVATE_KEY = process.env.PAGOPAR_PRIVATE_KEY || '';

interface PagoparSuccessResponse {
  respuesta: true;
  resultado: [
    {
      data: string; // This is the hash
      pedido: string;
    }
  ];
}

interface PagoparErrorResponse {
  respuesta: false;
  resultado: string;
}

type PagoparResponse = PagoparSuccessResponse | PagoparErrorResponse;

export async function createPaymentOrder(order: Order, orderId: string): Promise<{ success: boolean; paymentUrl: string; hash?: string, message?: string }> {
  if (!PAGOPAR_PUBLIC_KEY || !PAGOPAR_PRIVATE_KEY) {
    throw new Error('Las claves de API de Pagopar no están configuradas en el servidor.');
  }

  // 1. Generate the security hash with sha1
  const token = createHash('sha1')
    .update(`${PAGOPAR_PRIVATE_KEY}${orderId}${String(order.total)}`)
    .digest('hex');

  // 2. Prepare order data for Pagopar API v2.0
  const items = order.items.map((item) => ({
    ciudad: '1',
    nombre: item.product.name,
    cantidad: item.quantity,
    categoria: '909', // Generic category ID from Pagopar docs
    public_key: PAGOPAR_PUBLIC_KEY,
    url_imagen: item.product.images && item.product.images.length > 0 ? item.product.images[0] : '',
    descripcion: item.product.description.substring(0, 100), // Description has a limit
    id_producto: item.product.id,
    precio_total: item.product.price * item.quantity,
    vendedor_telefono: '',
    vendedor_direccion: '',
    vendedor_direccion_referencia: '',
    vendedor_direccion_coordenadas: '',
  }));

  const payload = {
    token: token,
    comprador: {
      ruc: order.customerRuc,
      email: order.customerEmail,
      ciudad: '1',
      nombre: order.customerRazonSocial,
      telefono: order.shippingPhone,
      direccion: order.shippingAddress,
      documento: order.customerRuc, // Using RUC/CI as document
      coordenadas: '',
      razon_social: order.customerRazonSocial,
      tipo_documento: 'CI',
      direccion_referencia: '',
    },
    public_key: PAGOPAR_PUBLIC_KEY,
    monto_total: order.total,
    tipo_pedido: 'VENTA-COMERCIO',
    compras_items: items,
    fecha_maxima_pago: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), // 24 hours to pay
    id_pedido_comercio: orderId,
    descripcion_resumen: `Pedido #${orderId.substring(0, 7)}`,
    url_retorno: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/pagopar-redirect?orderId=${orderId}`, // Client redirect URL
  };

  // 3. Send request to Pagopar
  try {
    const response = await fetch(PAGOPAR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(payload),
    });

    const data: PagoparResponse = await response.json();

    if (data.respuesta === true) {
      const hash = data.resultado[0].data;
      const paymentUrl = `https://www.pagopar.com/pagos/${hash}`;
      return { success: true, paymentUrl, hash };
    } else {
       console.error('Error en la API de Pagopar:', data.resultado);
       const errorMessage = typeof data.resultado === 'string' ? data.resultado : 'Error desconocido al crear el pedido en Pagopar.';
       return { success: false, paymentUrl: '', message: errorMessage };
    }
  } catch (error) {
    console.error('Fetch error con Pagopar:', error);
    throw error;
  }
}
