import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';
import authRoutes from './api/routes/auth.js';

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

async function startServer() {
  await client.connect();
  const db = client.db('Aplication-web');

  const app = express();

  // 1) CONFIGURA CORS AQUÍ:
  app.use(cors({
    origin: [
      'http://localhost:5173',                             // tu dev server
      'https://shopping-application-web-production.up.railway.app' // tu front en producción
    ],
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  }));
  app.options('*', cors()); // responde preflight

  app.use(express.json());
  app.use('/api/v1/auth', authRoutes(db));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`API escuchando en ${PORT}`));
}

startServer().catch(err => {
  console.error(err);
  process.exit(1);
});
