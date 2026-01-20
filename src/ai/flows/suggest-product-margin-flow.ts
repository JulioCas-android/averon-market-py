'use server';

/**
 * @fileOverview A Genkit flow for suggesting a profit margin for a product.
 *
 * - suggestProductMargin - A function that suggests a margin.
 * - SuggestProductMarginInput - The input type for the function.
 * - SuggestProductMarginOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const SuggestProductMarginInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productCategory: z.string().describe('The category of the product.'),
  productCost: z.number().describe('The cost per unit of the product in Paraguayan Guarani.'),
});
export type SuggestProductMarginInput = z.infer<typeof SuggestProductMarginInputSchema>;

const SuggestProductMarginOutputSchema = z.object({
  margin: z.number().describe('A suggested profit margin percentage as a whole number (e.g., 35 for 35%).'),
});
export type SuggestProductMarginOutput = z.infer<typeof SuggestProductMarginOutputSchema>;

export async function suggestProductMargin(
  input: SuggestProductMarginInput
): Promise<SuggestProductMarginOutput> {
  return suggestProductMarginFlow(input);
}

const productMarginPrompt = ai.definePrompt({
  name: 'productMarginPrompt',
  input: {schema: SuggestProductMarginInputSchema},
  output: {schema: SuggestProductMarginOutputSchema},
  prompt: `Eres un experto en estrategia de precios para e-commerce en Paraguay. Basado en el nombre del producto, su categoría y su costo, sugiere un margen de ganancia porcentual (%) realista y competitivo.

  Producto: {{{productName}}}
  Categoría: {{{productCategory}}}
  Costo (en Gs.): {{{productCost}}}

  Considera las siguientes reglas generales:
  - **Electrónicos de alto valor** (Smartphones, Laptops): Márgenes más bajos, entre 15% y 25%.
  - **Accesorios y periféricos** (Cables, fundas, cargadores, mouse): Márgenes más altos, entre 50% y 150%.
  - **Productos de gama media** (Auriculares, smartwatches, teclados): Márgenes moderados, entre 30% y 50%.
  - **Productos de bajo costo** (menos de 100,000 Gs.): Pueden soportar márgenes porcentuales más altos.

  Tu respuesta debe ser únicamente el número entero del porcentaje sugerido (por ejemplo, si sugieres 35%, responde solo con el número 35).
  `,
});

const suggestProductMarginFlow = ai.defineFlow(
  {
    name: 'suggestProductMarginFlow',
    inputSchema: SuggestProductMarginInputSchema,
    outputSchema: SuggestProductMarginOutputSchema,
  },
  async input => {
    const {output} = await productMarginPrompt(input);
    return output!;
  }
);
