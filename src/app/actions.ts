
'use server';

import { sendPersonalizedOfferNotification, PersonalizedOfferNotificationInput } from '@/ai/flows/personalized-offer-notifications';
import { generateImage, GenerateImageInput } from '@/ai/flows/generate-image-flow';

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
    } catch (error) {
        console.error('Error generating product image:', error);
        return { success: false, message: 'No se pudo generar la imagen en este momento.' };
    }
}
