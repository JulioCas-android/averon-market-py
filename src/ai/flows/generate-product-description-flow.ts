'use server';

/**
 * @fileOverview A Genkit flow for generating product descriptions based on a product name.
 *
 * - generateProductDescription - A function that generates a description.
 * - GenerateProductDescriptionInput - The input type for the function.
 * - GenerateProductDescriptionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

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
  prompt: `Eres un experto en redacción para e-commerce. Tu tarea es crear una descripción para "AVERON Market PY".

  Producto: {{{productName}}}

  Genera una descripción que cumpla con los siguientes requisitos:
  1.  **Descripción Breve:** Un párrafo introductorio corto y atractivo (máximo 2 frases) que destaque el principal beneficio del producto.
  2.  **Especificaciones Técnicas:** Una lista de 3 a 5 especificaciones clave.
      - Si el producto es un dispositivo electrónico (como un smartphone o smartwatch), **investiga y menciona si tiene funciones especiales como NFC**, carga inalámbrica, o resistencia al agua.
      - Cada especificación debe tener el siguiente formato exacto:
      TITULO DE LA ESPECIFICACION
      Descripción de la especificación en una línea.

      Ejemplo:
      PROCESADOR
      Chip A17 Pro con Neural Engine de 16 núcleos.

      CONECTIVIDAD
      NFC para pagos sin contacto y emparejamiento rápido.

      PANTALLA
      Super Retina XDR de 6.1 pulgadas con ProMotion.

  Importante: El resultado debe ser un único bloque de texto plano. No utilices ningún tipo de formato Markdown (como asteriscos o guiones). Utiliza saltos de línea para separar los elementos.
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
