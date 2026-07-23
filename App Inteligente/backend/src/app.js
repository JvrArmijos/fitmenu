import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { CONFIG } from './configuracion/variablesEntorno.js';
import { limiteGeneral } from './middleware/middlewareLimitePeticiones.js';
import { manejadorGlobalErrores } from './middleware/middlewareErrores.js';
import logs from './utilidades/logs.js';

// Importar rutas
import rutasAutenticacion from './rutas/rutasAutenticacion.js';
import rutasUsuarios from './rutas/rutasUsuarios.js';
import rutasCatalogos from './rutas/rutasCatalogos.js';
import rutasAlimentos from './rutas/rutasAlimentos.js';
import rutasDietas from './rutas/rutasDietas.js';
import rutasEstadisticas from './rutas/rutasEstadisticas.js';

import dotenv from 'dotenv';

dotenv.config();


const app = express();

// Middlewares de seguridad y optimización
app.use(helmet());
app.use(cors({
  origin: '*', // Permitir cualquier origen para desarrollo local y fácil despliegue
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logs de peticiones entrantes
app.use((req, res, next) => {
  logs.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Aplicar rate-limiter general a todas las peticiones
app.use('/api/v1', limiteGeneral);

// Rutas de la API v1
app.use('/api/v1/autenticacion', rutasAutenticacion);
app.use('/api/v1/usuarios', rutasUsuarios);
app.use('/api/v1/catalogos', rutasCatalogos);
app.use('/api/v1/alimentos', rutasAlimentos);
app.use('/api/v1/dietas', rutasDietas);
app.use('/api/v1/estadisticas', rutasEstadisticas);

// Ruta de salud de la API
app.get('/api/v1/salud', (req, res) => {
  res.status(200).json({
    ok: true,
    mensaje: 'Servidor de FitMenu Local activo y respondiendo.',
    timestamp: new Date().toISOString()
  });
});

// Capturar rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({
    ok: false,
    mensaje: `La ruta solicitada [${req.method}] ${req.originalUrl} no existe en este servidor.`
  });
});

// Middleware global de manejo de excepciones
app.use(manejadorGlobalErrores);

export default app;
