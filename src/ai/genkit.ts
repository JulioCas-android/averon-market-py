import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

const plugins = [];

if (geminiApiKey) {
  plugins.push(googleAI({ apiKey: geminiApiKey }));
} else {
  // This warning will be visible in server logs but won't crash the app.
  console.warn(
    '[Genkit] GEMINI_API_KEY no está configurada. Las funciones de IA estarán deshabilitadas. En un entorno de producción, asegúrate de que esté configurada como un secreto.'
  );
}

export const ai = genkit({
  plugins,
  // Conditionally set the default model only if the plugin is active
  ...(plugins.length > 0 && { model: 'googleai/gemini-2.5-flash' })
});
