
'use server';

import { sendPersonalizedOfferNotification, PersonalizedOfferNotificationInput } from '@/ai/flows/personalized-offer-notifications';

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
