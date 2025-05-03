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

  // CORS para localhost y tu front en Vercel
  app.use(cors({
    origin: [
      'http://localhost:5173',
      'https://shopping-application-web.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  }));

  app.use(express.json());

  // Rutas
  app.use('/api/v1/auth', authRoutes(db));
}

// Llama a la función para inicializar el servidor
startServer().catch(err => {
  console.error('❌ Error al iniciar el servidor:', err.message);
  process.exit(1);
});

// Exporta el servidor para que Vercel lo use
export default app;
