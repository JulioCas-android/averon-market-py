'use server';

/**
 * @fileOverview A Genkit flow for generating product descriptions based on a product name.
 *
 * - generateProductDescription - A function that generates a description.
 * - GenerateProductDescriptionInput - The input type for the function.
 * - GenerateProductDescriptionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name and model of the product.'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

const GenerateProductDescriptionOutputSchema = z.object({
  description: z.string().describe('A compelling and detailed product description in Spanish, provided as plain text without any Markdown formatting. It should include technical specifications if applicable and be well-structured for an e-commerce website.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

export async function generateProductDescription(
  input: GenerateProductDescriptionInput
): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}

const productDescriptionPrompt = ai.definePrompt({
  name: 'productDescriptionPrompt',
  input: {schema: GenerateProductDescriptionInputSchema},
  output: {schema: GenerateProductDescriptionOutputSchema},
  prompt: `Eres un experto en marketing y redacción para e-commerce. Tu tarea es crear una descripción de producto atractiva y detallada en español para la tienda online "AVERON Market PY".

  Producto: {{{productName}}}

  Genera una descripción que sea:
  1.  Vendedora y Atractiva: Usa un lenguaje que incite a la compra y destaque los beneficios.
  2.  Informativa: Incluye características clave y especificaciones técnicas relevantes para el producto. Si no conoces el producto, inventa características plausibles y deseables basadas en su nombre.
  3.  Bien Estructurada: Organiza la información de forma clara, con un párrafo introductorio y luego una lista de puntos o características.
  
  Importante: El resultado debe ser un único bloque de texto plano. No utilices ningún tipo de formato Markdown (como asteriscos para **negrita** o guiones para listas). Estructura los puntos usando saltos de línea.
  `,
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await productDescriptionPrompt(input);
    return output!;
  }
);
