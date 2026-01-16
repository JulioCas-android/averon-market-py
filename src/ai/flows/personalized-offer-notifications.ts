'use server';

/**
 * @fileOverview This file defines a Genkit flow for sending personalized offer notifications to users based on their browsing history and past purchases.
 *
 * - `sendPersonalizedOfferNotification` -  A function that triggers the personalized offer notification flow for a given user.
 * - `PersonalizedOfferNotificationInput` - The input type for the `sendPersonalizedOfferNotification` function.
 * - `PersonalizedOfferNotificationOutput` - The return type for the `sendPersonalizedOfferNotification` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedOfferNotificationInputSchema = z.object({
  userId: z.string().describe('The ID of the user to send the notification to.'),
  browsingHistory: z.array(z.string()).describe('The user browsing history.'),
  pastPurchases: z.array(z.string()).describe('The user past purchases.'),
});
export type PersonalizedOfferNotificationInput = z.infer<typeof PersonalizedOfferNotificationInputSchema>;

const PersonalizedOfferNotificationOutputSchema = z.object({
  notificationMessage: z.string().describe('The personalized offer notification message to send to the user.'),
});
export type PersonalizedOfferNotificationOutput = z.infer<typeof PersonalizedOfferNotificationOutputSchema>;

export async function sendPersonalizedOfferNotification(
  input: PersonalizedOfferNotificationInput
): Promise<PersonalizedOfferNotificationOutput> {
  return personalizedOfferNotificationFlow(input);
}

const personalizedOfferNotificationPrompt = ai.definePrompt({
  name: 'personalizedOfferNotificationPrompt',
  input: {schema: PersonalizedOfferNotificationInputSchema},
  output: {schema: PersonalizedOfferNotificationOutputSchema},
  prompt: `You are an e-commerce assistant tasked with crafting personalized offer notifications for users.

  Based on the user's browsing history and past purchases, identify relevant products currently on sale and generate a compelling notification message.

  Browsing History: {{browsingHistory}}
  Past Purchases: {{pastPurchases}}

  Compose a concise and engaging notification message to entice the user to explore the offer.
  The message should be no more than 50 words.
`,
});

const personalizedOfferNotificationFlow = ai.defineFlow(
  {
    name: 'personalizedOfferNotificationFlow',
    inputSchema: PersonalizedOfferNotificationInputSchema,
    outputSchema: PersonalizedOfferNotificationOutputSchema,
  },
  async input => {
    const {output} = await personalizedOfferNotificationPrompt(input);
    return output!;
  }
);
