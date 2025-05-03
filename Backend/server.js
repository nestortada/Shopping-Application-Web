// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';
import authRoutes from './api/routes/auth.js';

dotenv.config();

const app = express();

// Cargar orígenes permitidos desde .env (separados por coma)
const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(',').map(u => u.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // origin === undefined ocurre en herramientas como Postman
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: Origen ${origin} no permitido`));
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type','Authorization']
}));

app.use(express.json());

async function startServer() {
  const client = new MongoClient(process.env.MONGO_URI, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
  });
  await client.connect();
  console.log('✅ MongoDB Atlas conectado');

  const db = client.db(process.env.DB_NAME || 'Aplication-web');

  // Rutas de autenticación
  app.use('/api/v1/auth', authRoutes(db));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('❌ Error al iniciar el servidor:', err.message);
  process.exit(1);
});

// Para despliegues serverless como Vercel
export default app;
