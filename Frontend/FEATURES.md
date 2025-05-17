# Guía de la Aplicación

Este documento proporciona información sobre las características principales de la aplicación.

## Características

### Favoritos

La aplicación permite a los usuarios guardar productos como favoritos, que se mantienen persistentes incluso después de cerrar y volver a abrir la aplicación. Los productos favoritos se almacenan en Firestore y están vinculados a la cuenta del usuario.

#### Datos almacenados para cada favorito:

- **productId**: ID único del producto
- **productName**: Nombre del producto
- **productPrice**: Precio del producto
- **productDescription**: Descripción del producto
- **productImage**: URL de la imagen del producto
- **locationId**: ID del restaurante al que pertenece el producto
- **locationName**: Nombre del restaurante
- **userId**: ID del usuario que ha marcado el producto como favorito
- **createdAt**: Fecha en que se añadió a favoritos

#### Cómo utilizar los favoritos:

1. **Ver favoritos**: Navega a la página de Favoritos desde la barra de navegación inferior.
2. **Añadir a favoritos**: 
   - En cualquier tarjeta de producto, pulsa el icono de corazón para añadir o eliminar de favoritos.
   - En la página de Favoritos, utiliza el botón "Agregar favorito" para buscar restaurantes y productos.
3. **Eliminar de favoritos**: Pulsa el icono de corazón en un producto que ya está en favoritos.
4. **Ordenar favoritos**: Usa el selector "Ordenar por" para organizar tus favoritos por nombre, precio, restaurante o fecha de adición.
5. **Navegar entre páginas**: Si tienes muchos favoritos, usa los controles de paginación para ver más productos.

#### Implementación técnica:

Los favoritos utilizan Firestore para almacenar los datos de forma persistente:

- La colección `favorites` contiene documentos para cada producto favorito.
- Las reglas de seguridad de Firestore aseguran que los usuarios sólo pueden ver y modificar sus propios favoritos.
- El contexto `FavoritesContext` proporciona funciones para gestionar favoritos en toda la aplicación.
- La autenticación se realiza mediante tokens JWT, almacenados en localStorage para persistencia entre sesiones.
- La función de búsqueda permite encontrar restaurantes y productos para agregarlos a favoritos.
- La paginación y ordenamiento mejoran la experiencia del usuario al manejar colecciones grandes de favoritos.

## Configuración

### Firebase

La aplicación utiliza Firebase para autenticación y almacenamiento de datos. Para configurar Firebase en tu propia instancia:

1. Crea un proyecto en la [consola de Firebase](https://console.firebase.google.com/).
2. Habilita Firestore como base de datos.
3. Configura la autenticación (email/password, Google, etc.).
4. Agrega las reglas de seguridad necesarias para la colección `favorites`.
5. Actualiza el archivo `firebaseConfig.js` con tus credenciales.

### Reglas de seguridad de Firestore

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write their own favorites only
    match /favorites/{favoriteId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read, delete: if request.auth != null && resource.data.userId == request.auth.uid;
      allow update: if false; // Generally we add or remove favorites, not update them
    }

    // Allow users to read product information
    match /products/{productId} {
      allow read: if request.auth != null;
    }

    // Allow users to read location information
    match /locations/{locationId} {
      allow read: if request.auth != null;
    }
  }
}
```
