
import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/firebase/server';
import { createHash } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar que el cuerpo de la petición tiene la estructura esperada
    if (!body.respuesta || !body.resultado || !body.resultado[0]) {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
    }

    const { pagado, hash_pedido, token } = body.resultado[0];
    const privateKey = process.env.PAGOPAR_PRIVATE_KEY || '';

    // Si no hay private key, no podemos validar el webhook, pero no debemos crashear
    if (!privateKey) {
        console.warn('Webhook de Pagopar recibido pero no hay clave privada configurada para validar.');
        // Respondemos 200 para que Pagopar no reintente.
        return NextResponse.json({ message: 'Webhook recibido, pero no procesado por falta de configuración.' }, { status: 200 });
    }

    // 1. Validar el token de seguridad
    const expectedToken = createHash('sha1').update(`${privateKey}${hash_pedido}`).digest('hex');

    if (token !== expectedToken) {
      console.warn('Intento de webhook de Pagopar con token inválido:', { hash_pedido });
      return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
    }

    // 2. Encontrar y actualizar el pedido en Firestore (usando el SDK de Admin correctamente)
    const ordersRef = firestore.collection('orders');
    const q = ordersRef.where('pagoparTransactionId', '==', hash_pedido);
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      console.error('No se encontró el pedido para el hash de Pagopar:', hash_pedido);
      // Aún respondemos 200 para que Pagopar no siga reintentando
      return NextResponse.json({ message: 'Pedido no encontrado, pero webhook recibido.' }, { status: 200 });
    }

    const orderDoc = querySnapshot.docs[0];
    let newStatus: 'Pagado' | 'Procesando' = 'Procesando'; // Estado por defecto

    if (pagado === true || pagado === 'true') {
        newStatus = 'Pagado';
    } 
    // Podrías añadir lógica para otros estados si es necesario (ej: cancelado)

    await orderDoc.ref.update({ status: newStatus });
    console.log(`Pedido ${orderDoc.id} actualizado a estado: ${newStatus}`);

    // 3. Responder a Pagopar para confirmar la recepción
    return NextResponse.json(body.resultado, { status: 200 });

  } catch (error) {
    console.error('Error procesando el webhook de Pagopar:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
