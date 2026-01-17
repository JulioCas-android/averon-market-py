
'use server';

import type { Order } from './types';
import { createHash } from 'crypto';

const PAGOPAR_API_URL = 'https://api.pagopar.com/v1/comercios/1/transacciones';
const PAGOPAR_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAGOPAR_PUBLIC_KEY || '';
const PAGOPAR_PRIVATE_KEY = process.env.PAGOPAR_PRIVATE_KEY || '';

interface PagoparResponse {
  respuesta: boolean;
  resultado: [
    {
      id_transaccion: string;
      url: string;
      descripcion?: string;
    }
  ];
}


export async function createPaymentOrder(order: Order, orderId: string): Promise<PagoparResponse> {
  if (!PAGOPAR_PUBLIC_KEY || !PAGOPAR_PRIVATE_KEY) {
    throw new Error('Las claves de API de Pagopar no están configuradas en el servidor.');
  }

  // 1. Generar el hash de seguridad
  const token = createHash('md5')
    .update(`${PAGOPAR_PRIVATE_KEY}${orderId}${order.total}`)
    .digest('hex');

  // 2. Preparar los datos del pedido para Pagopar
  const items = order.items.map((item, index) => ({
    ciudad: 1, // Usar 1 para "Asunción" como valor por defecto o determinarlo dinámicamente
    nombre: item.product.name,
    cantidad: item.quantity,
    precio_unitario: item.product.price,
    descripcion: item.product.id,
    categoria_producto_id: 909, // ID de categoría de producto genérico de Pagopar
    vendedor_telefono: '',
    vendedor_direccion: '',
    vendedor_direccion_referencia: '',
  }));

  const payload = {
    token: token,
    comprador: {
      ruc: order.customerRuc,
      email: order.customerEmail,
      nombre: order.customerRazonSocial,
      telefono: order.shippingPhone,
      direccion: order.shippingAddress,
      razon_social: order.customerRazonSocial,
      documento: order.customerRuc, // CI del comprador
      coordenadas: '',
    },
    public_key: PAGOPAR_PUBLIC_KEY,
    monto_total: order.total,
    tipo_pedido: 'VENTA-COMERCIO',
    id_pedido_comercio: orderId,
    descripcion_resumen: `Pedido #${orderId.substring(0, 7)}`,
    fecha_maxima_pago: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), // 24 horas para pagar
    url_retorno: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/pagopar-redirect`, // URL de retorno
    compras_items: items,
  };

  // 3. Enviar la solicitud a Pagopar
  try {
    const response = await fetch(PAGOPAR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error en la API de Pagopar:', data);
      throw new Error(data.resultado?.[0]?.descripcion || 'Error al comunicarse con Pagopar');
    }
    
    return data;
  } catch (error) {
    console.error('Fetch error con Pagopar:', error);
    throw error;
  }
}
