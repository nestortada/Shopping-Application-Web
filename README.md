# 🛒 Shopping Application Web

<div align="center">

![Logo](https://img.shields.io/badge/Shopping-Application-3822B4?style=for-the-badge&logo=shopping-cart)

### 🌟 Plataforma de Pedidos Universitaria Inteligente

[![Live Demo](https://img.shields.io/badge/🌐_Demo_en_Vivo-Vercel-00C7B7?style=for-the-badge)](https://shopping-application-web.vercel.app)
[![JavaScript](https://img.shields.io/badge/JavaScript-99.3%25-F7DF1E?style=for-the-badge&logo=javascript)](https://github.com/nestortada/Shopping-Application-Web)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)

</div>

---

## 🎯 ¿Por qué se hizo este proyecto?

Esta aplicación nació para resolver una **necesidad real** en el entorno universitario: **facilitar y modernizar el proceso de pedidos de comida** en los restaurantes del campus de la Universidad de La Sabana. 

### 🚀 **Problemática que resuelve:**
- ❌ **Largas filas** y tiempos de espera en restaurantes universitarios
- ❌ **Procesos manuales** lentos para tomar pedidos
- ❌ **Falta de comunicación** entre clientes y puntos de venta
- ❌ **Gestión de inventario** ineficiente
- ❌ **Experiencia de usuario** fragmentada

### ✅ **Solución implementada:**
- ⚡ **Pedidos digitales** rápidos y eficientes
- 🔄 **Notificaciones en tiempo real** sobre el estado de pedidos
- 👥 **Sistema de roles** diferenciado (Clientes y POS)
- 📱 **Interfaz móvil** intuitiva y responsive
- 🎯 **Gestión centralizada** de inventario y pedidos

---

## 👥 ¿Para quién está dirigido?

### 🎓 **Estudiantes Universidad de La Sabana** (`@unisabana.edu.co`)
- **Rol:** Cliente
- **Beneficios:** 
  - 📱 Pedidos desde cualquier lugar del campus
  - ⏰ Conocer tiempo estimado de preparación
  - 💳 Múltiples métodos de pago (saldo virtual, tarjetas)
  - ❤️ Sistema de favoritos
  - 🎫 Cupones de descuento

### 🏪 **Personal de Restaurantes** (`@sabanapos.edu.co`)
- **Rol:** POS (Point of Sale)
- **Beneficios:**
  - 📊 Dashboard de pedidos en tiempo real
  - 📦 Gestión de inventario automática
  - 🔔 Notificaciones instantáneas de nuevos pedidos
  - 📈 Control de stock con alertas automáticas
  - ✅ Actualización de estados de pedidos

---

## 🎯 ¿A quién beneficia?

<div align="center">

| 👤 **Beneficiario** | 🎁 **Beneficios Clave** |
|:---:|:---|
| **🎓 Estudiantes** | • Ahorro de tiempo<br>• Experiencia digital moderna<br>• Control total sobre sus pedidos<br>• Transparencia en tiempos de espera |
| **🏪 Restaurantes** | • Reducción de filas<br>• Gestión automatizada<br>• Mejor control de inventario<br>• Comunicación eficiente con clientes |
| **🏫 Universidad** | • Modernización de servicios<br>• Mejores métricas y analytics<br>• Satisfacción estudiantil<br>• Optimización de recursos |

</div>

---

## ⚡ Funcionalidades Principales

### 🛒 **Para Estudiantes (Clientes)**

#### 🔐 **Autenticación Segura**
- Login con credenciales institucionales
- Recuperación de contraseñas
- Registro automático con validación de dominio

#### 🍽️ **Experiencia de Pedidos**
- 📍 **Selección de restaurantes** por ubicación en el mapa
- 🔍 **Búsqueda inteligente** de productos
- 🏷️ **Filtros por categorías** (Bebidas, Comidas, Postres, etc.)
- ⭐ **Sistema de calificaciones** y reseñas
- ❤️ **Lista de favoritos** personalizada

#### 💳 **Sistema de Pagos Flexible**
- 💰 **Saldo virtual** precargado
- 🎫 **Sistema de cupones** con descuentos
- 💻 **Tarjetas de crédito/débito** con cuotas
- 🔒 **Transacciones seguras** y encriptadas

#### 📱 **Seguimiento en Tiempo Real**
- 🔔 **Notificaciones push** sobre estado del pedido
- ⏱️ **Tiempo estimado** de preparación (5-15 minutos)
- 📊 **Historial completo** de pedidos
- 🎯 **Estado detallado**: Confirmado → En Preparación → Listo

### 🏪 **Para Personal POS (Restaurantes)**

#### 📊 **Dashboard de Gestión**
- 📋 **Vista centralizada** de todos los pedidos pendientes
- 🔄 **Actualización de estados** con un click
- 👤 **Información del cliente** y detalles del pedido
- ⏰ **Timestamps** automáticos

#### 📦 **Control de Inventario**
- 📈 **Stock en tiempo real** con actualizaciones automáticas
- ⚠️ **Alertas de stock bajo** (≤ 5 unidades)
- 🚫 **Prevención de sobreventa** automática
- 📊 **Reportes de movimientos** de inventario

#### 🔔 **Sistema de Notificaciones**
- 📢 **Alertas instantáneas** de nuevos pedidos
- 🔊 **Notificaciones de stock bajo**
- 💬 **Comunicación automática** con clientes
- 📱 **Integración con Socket.IO** para tiempo real

---

## 🛠️ Arquitectura Técnica

### 🎨 **Frontend (React + Vite)**
```javascript
📱 Tecnologías Principales:
• React 18.2.0 - UI Library
• React Router Dom 7.5.3 - Navegación
• Tailwind CSS 4.1.5 - Estilos
• Framer Motion 12.12.1 - Animaciones
• Socket.IO Client 4.8.1 - Tiempo Real
• React Hot Toast 2.5.2 - Notificaciones
```

### ⚙️ **Backend (Node.js + Express)**
```javascript
🖥️ Tecnologías Principales:
• Express 4.18.2 - Web Framework
• MongoDB 6.16.0 - Base de Datos
• Socket.IO 4.8.1 - WebSockets
• JWT 9.0.2 - Autenticación
• bcrypt 5.1.0 - Encriptación
• Firebase Admin 13.4.0 - Cloud Services
```

### 🗄️ **Base de Datos**
- **MongoDB** - Datos principales (usuarios, pedidos)
- **Firebase Firestore** - Productos e inventario
- **Storage** - Imágenes y assets

### 🔄 **Comunicación en Tiempo Real**
- **Socket.IO** para notificaciones instantáneas
- **Namespaces** separados por funcionalidad
- **Rooms** por ubicación y usuario
- **Event-driven architecture**

---

## 🚀 Instalación y Configuración

### 📋 **Prerrequisitos**
```bash
• Node.js 18+ 
• MongoDB 6+
• Git
• NPM o Yarn
```

### 🔧 **Configuración Backend**
```bash
# 1. Clonar repositorio
git clone https://github.com/nestortada/Shopping-Application-Web.git
cd Shopping-Application-Web/Backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 4. Iniciar servidor de desarrollo
npm run dev
```

### 🎨 **Configuración Frontend**
```bash
# 1. Navegar al frontend
cd ../Frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Configurar VITE_BACKEND_URL y otras variables

# 4. Iniciar aplicación
npm run dev
```

### 🌍 **Variables de Entorno Importantes**
```env
# Backend
MONGODB_URI=tu_conexion_mongodb
JWT_SECRET=tu_jwt_secret
FRONTEND_URLS=http://localhost:5173,https://tu-dominio.com

# Frontend
VITE_BACKEND_URL=http://localhost:3000
VITE_FIREBASE_CONFIG=tu_config_firebase
```
