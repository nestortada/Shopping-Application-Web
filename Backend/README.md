# Backend de SabanaPos con Socket.IO

Este es el backend de la aplicación SabanaPos, con soporte para notificaciones en tiempo real usando Socket.IO.

## Requisitos

- Node.js
- MongoDB

## Configuración Local

1. Clona el repositorio
2. Instala las dependencias: `npm install`
3. Crea un archivo `.env` basado en `.env.example`
4. Inicia el servidor: `npm run dev`

## Despliegue en Render.com

1. Crea una cuenta en [Render.com](https://render.com)
2. Selecciona "Web Service" y conecta tu repositorio de GitHub
3. Configura el servicio:
   - **Name**: nombre-de-tu-servicio
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment Variables**: Añade todas las variables de `.env.example` con sus valores reales
   - **Plan**: Free o Superior

4. Configura el CORS:
   - Añade la URL de tu frontend a la variable `FRONTEND_URLS` separada por comas
   - Ejemplo: `https://tu-frontend.vercel.app,http://localhost:5173`

5. ¡Haz clic en "Create Web Service"!

## Variables de Entorno Importantes

- `PORT`: Puerto en el que se ejecutará el servidor (Render asigna automáticamente)
- `MONGO_URI`: URL de conexión a MongoDB
- `DB_NAME`: Nombre de la base de datos
- `FRONTEND_URLS`: URLs del frontend separadas por comas (para CORS)
- `JWT_SECRET`: Secreto para firmar tokens JWT

## Socket.IO

Este servidor incluye un namespace de Socket.IO en `/notifications` para notificaciones en tiempo real.

Desde el frontend, conéctate así:

```javascript
import { io } from 'socket.io-client';

const socket = io('https://tu-backend-en-render.onrender.com/notifications', {
  auth: {
    token: 'tu-token-jwt',
    userEmail: 'email@ejemplo.com',
    locationId: 'ubicacion-id'
  }
});

socket.on('newNotification', (notification) => {
  console.log('Nueva notificación:', notification);
  // Actualizar UI con la notificación
});
```
