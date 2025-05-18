# Guía de Despliegue de SabanaPos en Render.com

Esta guía te ayudará a migrar tu backend con Socket.IO desde Vercel a Render.com para tener soporte completo de WebSockets.

## Preparación del Proyecto

Ya hemos realizado las siguientes modificaciones a tu código:

1. ✅ Actualizado `server.js` para escuchar en todos los entornos
2. ✅ Creado archivos de configuración para Render (`render.json`, `Procfile`)
3. ✅ Actualizado el servicio Socket.IO en el frontend
4. ✅ Agregado manejo de reconexión y mejor gestión de errores

## Pasos para Desplegar en Render.com

### 1. Crear una Cuenta en Render.com

1. Ve a [Render.com](https://render.com/) y regístrate (puedes usar tu cuenta de GitHub)

### 2. Configurar un Nuevo Servicio Web

1. Ve al Dashboard de Render
2. Haz clic en "New +" y selecciona "Web Service"
3. Conecta tu repositorio de GitHub o sube tu código manualmente
4. Configura el servicio:

   - **Name**: sabanapos-backend (o el nombre que prefieras)
   - **Runtime**: Node
   - **Build Command**: `cd Backend && npm install`
   - **Start Command**: `cd Backend && node server.js`
   - **Root Directory**: `/` (o `Backend/` si solo subes esa carpeta)

### 3. Variables de Entorno

En la sección "Environment" de tu servicio, añade las siguientes variables:

- `PORT` = Deja vacío (Render asigna automáticamente)
- `NODE_ENV` = production
- `MONGO_URI` = tu_uri_de_mongodb
- `DB_NAME` = tu_base_de_datos
- `FRONTEND_URLS` = https://tu-frontend.vercel.app,http://localhost:5173
- `JWT_SECRET` = tu_secreto_jwt

### 4. Configurar CORS Adecuadamente

Asegúrate de que la variable `FRONTEND_URLS` incluya todas las URL de tu frontend separadas por comas:
- URL de producción
- URL de desarrollo local
- URLs adicionales si las hay

### 5. Despliegue

1. Haz clic en "Create Web Service"
2. Render desplegará automáticamente tu aplicación
3. Anota la URL que te proporciona Render (ej: https://sabanapos-backend.onrender.com)

### 6. Actualizar Frontend

1. Modifica la variable de entorno `VITE_API_URL` en tu proyecto frontend para que apunte a tu nuevo backend:

```
VITE_API_URL=https://sabanapos-backend.onrender.com
```

2. Vuelve a desplegar tu frontend en Vercel

## Pruebas

Para verificar que todo funciona correctamente:

1. Visita la ruta de healthcheck: https://sabanapos-backend.onrender.com/api/health
2. Abre la consola del navegador en tu frontend para verificar la conexión Socket.IO
3. Prueba la página de prueba de notificaciones en tu aplicación

## Solución de Problemas

### Socket.IO no se conecta

- Verifica que los orígenes CORS estén correctamente configurados
- Asegúrate de que la URL del backend sea correcta en el frontend
- Revisa los logs en Render.com para ver errores específicos

### Errores de CORS

- Añade todas las URLs de frontend a la variable `FRONTEND_URLS`
- Comprueba que estás accediendo desde las URLs permitidas

## Ventajas de Render.com para Socket.IO

- ✅ Soporte completo para WebSockets
- ✅ Conexiones persistentes
- ✅ Planes gratuitos con limitaciones razonables
- ✅ Escalabilidad cuando sea necesario
- ✅ Fácil integración con repositorios Git

## Próximos Pasos

1. Monitorizar el rendimiento y uso
2. Considerar la migración a un plan de pago si el tráfico aumenta
3. Implementar pruebas de carga para Socket.IO
