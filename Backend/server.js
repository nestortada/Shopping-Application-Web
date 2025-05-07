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

async function startServer() {
  const client = new MongoClient(process.env.MONGO_URI, {
    serverApi: { version: ServerApiVersion.v1 }
  });
  
  try {
    // Intentamos conectar a MongoDB
    await client.connect();
    console.log('✅ MongoDB Atlas conectado');

    const db = client.db(process.env.DB_NAME);
    
    // Store db connection in app for use in routes
    app.set('db', db);
    
    // Utilizamos las rutas de autenticación
    app.use('/api/v1/auth', authRoutes(db));

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`✅ Servidor corriendo en puerto ${PORT}`)
    );

    // Handle server shutdown
    process.on('SIGINT', async () => {
      await client.close();
      process.exit(0);
    });

  } catch (err) {
    console.error('❌ Error al conectar a MongoDB:', err.message);
    process.exit(1);
  }
}

startServer().catch(err => {
  console.error('❌ Error al iniciar el servidor:', err.message);
  process.exit(1);
});

export default app;
