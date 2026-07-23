import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde el .env del backend
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const CONFIG = {
  puerto: process.env.PUERTO || 5000,
  entorno: process.env.NODO_ENV || 'development',
  db: {
    rutaBaseDatos: process.env.RUTA_BASE_DATOS || './baseDatos/fitmenu_local.db'
  },
  jwt: {
    secreto: process.env.JWT_SECRET || 'firma_por_defecto_super_secreta_fitmenu_local',
    expiracion: process.env.JWT_EXPIRACION || '24h',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  }
};
