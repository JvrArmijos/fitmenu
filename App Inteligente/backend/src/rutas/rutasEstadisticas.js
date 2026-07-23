import { Router } from 'express';
import controladorEstadisticas from '../controladores/controladorEstadisticas.js';
import { requiereAutenticacion } from '../middleware/middlewareAutenticacion.js';

const router = Router();

// Requerir autenticación para ver estadísticas
router.get('/', requiereAutenticacion, controladorEstadisticas.obtenerEstadisticasDashboard);

export default router;
