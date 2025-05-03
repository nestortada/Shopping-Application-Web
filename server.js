import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';
import authRoutes from './api/routes/auth.js';

dotenv.config();

async function startServer() {
  const client = new MongoClient(process.env.MONGO_URI, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
  });
  await client.connect();
  console.log('✅ MongoDB Atlas conectado');

  const db = client.db('Aplication-web');
  const app = express();

  // CORS para localhost y tu front en Vercel
  app.use(cors({
    origin: [
      'http://localhost:5173',
      'https://shopping-application-web.vercel.app'
    ],
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    credentials: true
  }));

  app.use(express.json());

  // ← Aquí NUNCA una URL absoluta, sólo ruta relativa
  app.use('/api/v1/auth', authRoutes(db));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 API escuchando en puerto ${PORT}`));
}

startServer().catch(err => {
  console.error(err);
  process.exit(1);
});
