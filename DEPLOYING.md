# Guía de Despliegue de AVERON Market PY

Esta guía te ayudará a desplegar tu aplicación Next.js en **Firebase App Hosting**.

## Requisitos Previos

1.  **Node.js:** Asegúrate de tener Node.js (versión 18 o superior) instalado.
2.  **gcloud CLI:** Necesitas tener la [CLI de Google Cloud](https://cloud.google.com/sdk/docs/install) instalada y autenticada. Para autenticarte, ejecuta:
    ```bash
    gcloud auth login
    ```
3.  **Firebase Tools:** Las herramientas de Firebase se instalaron como una dependencia de desarrollo, pero si prefieres tenerlas globalmente, puedes ejecutar:
    ```bash
    npm install -g firebase-tools
    ```
    Y luego autenticarte:
     ```bash
    firebase login
    ```

## Pasos para el Despliegue

He simplificado el proceso en un solo script. Solo tienes que seguir estos pasos:

### 1. Dar Permisos de Ejecución al Script

Primero, necesitas dar permisos de ejecución al script de despliegue. Abre tu terminal y ejecuta el siguiente comando:

```bash
chmod +x deploy.sh
```

### 2. Ejecutar el Script de Despliegue

Ahora, simplemente ejecuta el script. Este se encargará de todo: construir tu aplicación, configurar el backend en App Hosting y desplegar el código.

```bash
./deploy.sh
```

El script hará lo siguiente:
*   Identificará tu proyecto de Firebase automáticamente.
*   Construirá la versión de producción de tu tienda online.
*   Creará el backend de App Hosting si no existe.
*   Desplegará tu aplicación.

### 3. ¡Listo!

Una vez que el script termine, tu sitio estará desplegado en Firebase App Hosting. La terminal te mostrará la URL donde puedes ver tu tienda en vivo. ¡El proceso puede tardar unos minutos en completarse!

---

¡Eso es todo! Con estos simples pasos, tu tienda estará online y lista para recibir clientes.
