// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';
import authRoutes from './api/routes/auth.js';

dotenv.config();
const app = express();

// Cargamos los orígenes permitidos desde FRONTEND_URLS
const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(',').map(u => u.trim())
  : ['http://localhost:5173']; // Default for development

app.use(cors({
  origin: (origin, callback) => {
    // Para herramientas sin origin (p.ej. Postman) o desarrollo local
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origen ${origin} no permitido`));
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type','Authorization']
}));

app.use(express.json());

// Crear una conexión reutilizable para el modo serverless
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(process.env.MONGO_URI, {
    serverApi: { version: ServerApiVersion.v1 }
  });

  await client.connect();
  const db = client.db(process.env.DB_NAME);
  
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}

// Para desarrollo local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`✅ Servidor corriendo en puerto ${PORT}`));
}

// Configurar rutas después de la conexión a la base de datos
app.use(async (req, res, next) => {
  try {
    const { db } = await connectToDatabase();
    req.app.set('db', db);
    next();
  } catch (error) {
    console.error('Error connecting to database:', error);
    res.status(500).json({ message: 'Database connection error' });
  }
});

app.use('/api/v1/auth', authRoutes());

// Ruta de healthcheck
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;
