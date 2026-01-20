// NOTA: Este archivo se rellena automáticamente con la configuración de tu proyecto de Firebase.

// Esta lógica mejorada permite que la app use la configuración automática
// de App Hosting en producción, pero sigue funcionando con las variables de entorno
// locales para el desarrollo.
let config;

if (process.env.FIREBASE_CONFIG) {
  // En producción (App Hosting), Firebase inyecta esta variable automáticamente.
  try {
    config = JSON.parse(process.env.FIREBASE_CONFIG);
  } catch (e) {
    console.error("Error al parsear FIREBASE_CONFIG, usando fallback.", e);
  }
}

if (!config || !config.apiKey) {
  // Para desarrollo local, usamos las variables de entorno del archivo .env.
  config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

export const firebaseConfig = config;
