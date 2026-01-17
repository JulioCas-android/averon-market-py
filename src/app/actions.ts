
'use server';

import { sendPersonalizedOfferNotification, PersonalizedOfferNotificationInput } from '@/ai/flows/personalized-offer-notifications';
import { generateImage, GenerateImageInput } from '@/ai/flows/generate-image-flow';
import { generateProductDescription, GenerateProductDescriptionInput } from '@/ai/flows/generate-product-description-flow';
import { suggestProductCategory, SuggestProductCategoryInput } from '@/ai/flows/suggest-product-category-flow';
import { createPaymentOrder } from '@/lib/pagopar';
import type { Order } from '@/lib/types';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/server';

export async function sendPersonalizedOfferNotificationAction() {
    // In a real application, you would fetch this data for the logged-in user.
    const mockInput: PersonalizedOfferNotificationInput = {
        userId: 'user-123',
        browsingHistory: ['Smartphone', 'Auriculares inalámbricos', 'Libro de ficción'],
        pastPurchases: ['Smartwatch', 'Laptop'],
    };

    try {
        const result = await sendPersonalizedOfferNotification(mockInput);
        return { success: true, message: result.notificationMessage };
    } catch (error) {
        console.error('Error generating personalized offer:', error);
        return { success: false, message: 'No se pudo generar una oferta personalizada en este momento.' };
    }
}

export async function generateProductImageAction(prompt: string) {
    if (!prompt) {
        return { success: false, message: 'La pista para la IA no puede estar vacía.' };
    }

    const input: GenerateImageInput = { prompt };

    try {
        const result = await generateImage(input);
        return { success: true, imageUrl: result.imageUrl };
    } catch (error: any) {
        console.error('Error generating product image:', error);
        const errorMessage = error.message || 'Ocurrió un error inesperado al generar la imagen.';
        return { success: false, message: `Error de IA: ${errorMessage}` };
    }
}

export async function generateProductDescriptionAction(productName: string) {
    if (!productName) {
        return { success: false, message: 'El nombre del producto no puede estar vacío.' };
    }

    const input: GenerateProductDescriptionInput = { productName };

    try {
        const result = await generateProductDescription(input);
        return { success: true, description: result.description };
    } catch (error: any) {
        console.error('Error generating product description:', error);
        const errorMessage = error.message || 'Ocurrió un error desconocido.';
        return { success: false, message: `No se pudo generar la descripción: ${errorMessage}` };
    }
}


export async function suggestProductCategoryAction(productName: string) {
    if (!productName) {
        return { success: false, message: 'El nombre del producto no puede estar vacío.' };
    }

    const input: SuggestProductCategoryInput = { productName };

    try {
        const result = await suggestProductCategory(input);
        return { success: true, category: result.category };
    } catch (error: any) {
        console.error('Error suggesting product category:', error);
        const errorMessage = error.message || 'Ocurrió un error desconocido.';
        return { success: false, message: `No se pudo sugerir una categoría: ${errorMessage}` };
    }
}

export async function createPagoparPaymentAction(orderId: string) {
    try {
        const orderDocRef = doc(firestore, 'orders', orderId);
        const orderSnap = await getDoc(orderDocRef);

        if (!orderSnap.exists()) {
            throw new Error('El pedido no existe.');
        }

        const orderData = orderSnap.data() as Order;

        const pagoparResponse = await createPaymentOrder(orderData, orderId);

        if (pagoparResponse.respuesta === false) {
             throw new Error(pagoparResponse.resultado?.[0]?.descripcion || 'Error desconocido de Pagopar.');
        }

        const transactionId = pagoparResponse.resultado[0].id_transaccion;
        const paymentUrl = pagoparResponse.resultado[0].url;

        // Save the transaction ID to the order
        await updateDoc(orderDocRef, { pagoparTransactionId: transactionId });

        return { success: true, paymentUrl };
    } catch (error: any) {
        console.error('Error creating Pagopar payment:', error);
        return { success: false, message: error.message };
    }
}
