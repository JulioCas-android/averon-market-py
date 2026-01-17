import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!geminiApiKey) {
  // In a real production environment, you might want to handle this more gracefully,
  // but for development, throwing an error is the clearest way to surface the issue.
  throw new Error(
    'GEMINI_API_KEY is not set in the environment variables. Please add it to your .env file and restart the development server.'
  );
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: geminiApiKey,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
