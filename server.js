// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';
import authRoutes from './api/routes/auth.js';

dotenv.config();
const uri = process.env.MONGO_URI;
if (!uri) throw new Error('MONGO_URI no definido');
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

async function startServer() {
  await client.connect();
  console.log('✅ MongoDB Atlas conectado');

  const db = client.db('Aplication-web');
  const app = express();

  // 1) CORS: sólo aquí pones tus URLs completas
  app.use(cors({
    origin: [
      'http://localhost:5173',
      'https://shopping-application-web-production.up.railway.app'
    ],
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    credentials: true
  }));

  // 2) JSON body parser
  app.use(express.json());

  // 3) Rutas de tu API (RUTAS RELATIVAS, NUNCA full URLs)
  app.use('/api/v1/auth', authRoutes(db));

  // 4) (Opcional) Sirve frontend estático en producción
  // app.use(process.env.VITE_BASE_PATH || '/', express.static('dist'));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 API listening on port ${PORT}`));
}

startServer().catch(err => {
  console.error(err);
  process.exit(1);
});
