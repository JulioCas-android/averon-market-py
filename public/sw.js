// Este service worker se mantiene simple intencionadamente por ahora.
// Su propósito principal es hacer que la aplicación sea instalable (PWA).
// Aún no implementa estrategias avanzadas de caché.

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // Pasa directamente al estado 'activated'
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // Toma el control de todas las páginas bajo su alcance inmediatamente
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Por ahora, solo estamos pasando las solicitudes de fetch.
  // Este es el requisito mínimo para la instalabilidad de una PWA.
  // Se podría añadir una estrategia de red o caché más adelante.
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request));
  }
});
