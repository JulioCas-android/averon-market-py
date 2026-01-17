'use server';

/**
 * @fileOverview A Genkit flow for suggesting a product category based on its name.
 *
 * - suggestProductCategory - A function that suggests a category.
 * - SuggestProductCategoryInput - The input type for the function.
 * - SuggestProductCategoryOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const SuggestProductCategoryInputSchema = z.object({
  productName: z.string().describe('The name and model of the product.'),
});
export type SuggestProductCategoryInput = z.infer<typeof SuggestProductCategoryInputSchema>;

const SuggestProductCategoryOutputSchema = z.object({
  category: z.string().describe('A single, concise, and relevant e-commerce category name in Spanish for the given product. Example: "Smartphones", "Auriculares", "Teclados".'),
});
export type SuggestProductCategoryOutput = z.infer<typeof SuggestProductCategoryOutputSchema>;

export async function suggestProductCategory(
  input: SuggestProductCategoryInput
): Promise<SuggestProductCategoryOutput> {
  return suggestProductCategoryFlow(input);
}

const productCategoryPrompt = ai.definePrompt({
  name: 'productCategoryPrompt',
  input: {schema: SuggestProductCategoryInputSchema},
  output: {schema: SuggestProductCategoryOutputSchema},
  prompt: `Eres un experto en categorización de productos para e-commerce. Basado en el nombre del producto, sugiere una única categoría principal, concisa y en español.

  Producto: {{{productName}}}
  
  Ejemplos:
  - Si el producto es "iPhone 15 Pro 256GB", la categoría debe ser "Smartphones".
  - Si el producto es "Auriculares Inalámbricos Sony WH-1000XM5", la categoría debe ser "Auriculares".
  - Si el producto es "Teclado Mecánico Logitech G Pro", la categoría debe ser "Teclados".

  Responde únicamente con el nombre de la categoría.
  `,
});

const suggestProductCategoryFlow = ai.defineFlow(
  {
    name: 'suggestProductCategoryFlow',
    inputSchema: SuggestProductCategoryInputSchema,
    outputSchema: SuggestProductCategoryOutputSchema,
  },
  async input => {
    const {output} = await productCategoryPrompt(input);
    return output!;
  }
);
