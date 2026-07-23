import { Router } from 'express';
import controladorDietas from '../controladores/controladorDietas.js';
import { requiereAutenticacion } from '../middleware/middlewareAutenticacion.js';
import { limiteAutenticacionYIa } from '../middleware/middlewareLimitePeticiones.js';

const router = Router();

// Todas las rutas requieren inicio de sesión
router.use(requiereAutenticacion);

// Generar dieta inteligente usando IA (con rate-limiter estricto)
router.post('/generar', limiteAutenticacionYIa, controladorDietas.generarPlan);

// Historial y CRUD de dietas del usuario
router.get('/', controladorDietas.obtenerHistorial);
router.get('/:id', controladorDietas.obtenerDetalleDieta);
router.delete('/:id', controladorDietas.eliminarPlan);
router.put('/:id/favorita', controladorDietas.actualizarFavorita);
router.post('/:id/duplicar', controladorDietas.duplicarPlan);

// Lista de compras
router.put('/compra/:listaId', controladorDietas.marcarProductoLista);

// Exportaciones
router.get('/:id/pdf', controladorDietas.descargarPdf);
router.get('/:id/excel', controladorDietas.descargarExcel);

export default router;
