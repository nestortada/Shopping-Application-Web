import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';
import authRoutes from './api/routes/auth.js';

dotenv.config();

const app = express();

async function startServer() {
  const client = new MongoClient(process.env.MONGO_URI, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
  });
  await client.connect();
  console.log('✅ MongoDB Atlas conectado');

  const db = client.db('Aplication-web');

  // Configuración de CORS
  app.use(cors({
    origin: [
      'http://localhost:5173', // Desarrollo local
      'https://shopping-application-web.vercel.app' // Frontend en Vercel
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true, // Permitir cookies y encabezados de autenticación
    allowedHeaders: ['Content-Type', 'Authorization'], // Permitir encabezados específicos
  }));

  app.use(express.json());

  // Rutas
  app.use('/api/v1/auth', authRoutes(db));

  const PORT = process.env.PORT || 5000;      // o el puerto que prefieras  
  app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  });
}

// Llama a la función para inicializar el servidor
startServer().catch(err => {
  console.error('❌ Error al iniciar el servidor:', err.message);
  process.exit(1);
});


// Exporta el servidor para que Vercel lo use
export default app;
