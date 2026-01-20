'use server';

import { sendPersonalizedOfferNotification, PersonalizedOfferNotificationInput } from '@/ai/flows/personalized-offer-notifications';
import { generateImage, GenerateImageInput } from '@/ai/flows/generate-image-flow';
import { generateProductDescription, GenerateProductDescriptionInput } from '@/ai/flows/generate-product-description-flow';
import { suggestProductCategory, SuggestProductCategoryInput } from '@/ai/flows/suggest-product-category-flow';
import { suggestProductMargin, SuggestProductMarginInput } from '@/ai/flows/suggest-product-margin-flow';
import { createPaymentOrder } from '@/lib/pagopar';
import type { Order } from '@/lib/types';
import { firestore } from '@/firebase/server';
import { headers } from 'next/headers';

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

export async function suggestProductMarginAction(input: SuggestProductMarginInput) {
    if (!input.productName || input.productCost <= 0) {
        return { success: false, message: 'El nombre y el costo del producto son requeridos.' };
    }

    try {
        const result = await suggestProductMargin(input);
        return { success: true, margin: result.margin };
    } catch (error: any) {
        console.error('Error suggesting product margin:', error);
        const errorMessage = error.message || 'Ocurrió un error desconocido.';
        return { success: false, message: `No se pudo sugerir un margen: ${errorMessage}` };
    }
}

export async function createPagoparPaymentAction(orderId: string) {
    try {
        const orderDocRef = firestore.doc(`orders/${orderId}`);
        const orderSnap = await orderDocRef.get();

        if (!orderSnap.exists) {
            throw new Error('El pedido no existe.');
        }

        const orderData = orderSnap.data() as Order;
        
        const headersList = headers();
        const host = headersList.get('host') || 'localhost:9002';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;

        const pagoparResponse = await createPaymentOrder(orderData, orderId, baseUrl);

        if (!pagoparResponse.success || !pagoparResponse.hash) {
             throw new Error(pagoparResponse.message || 'Error desconocido de Pagopar.');
        }

        // Save the transaction hash to the order
        await orderDocRef.update({ pagoparTransactionId: pagoparResponse.hash });

        return { success: true, paymentUrl: pagoparResponse.paymentUrl };
    } catch (error: any) {
        console.error('Error creating Pagopar payment:', error);
        return { success: false, message: error.message };
    }
}
