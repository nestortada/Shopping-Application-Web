// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';
import authRoutes from './api/routes/auth.js';

dotenv.config();

const uri = process.env.MONGO_URI;
if (!uri) throw new Error('MONGO_URI no definido en .env');

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

async function startServer() {
  await client.connect();
  console.log('✅ MongoDB Atlas conectado');

  const db = client.db('Aplication-web');

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/v1/auth', authRoutes(db));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 API en puerto ${PORT}`));
}

startServer().catch(err => {
  console.error(err);
  process.exit(1);
});
