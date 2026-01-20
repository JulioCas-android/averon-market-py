
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// En App Hosting, el Admin SDK se configura automáticamente con las credenciales
// apropiadas a través de Application Default Credentials (ADC). No es necesario
// proporcionar manualmente una clave de cuenta de servicio.
if (!getApps().length) {
  initializeApp();
}

export const firestore = getFirestore();
