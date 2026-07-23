import { Router } from 'express';
import controladorAlimentos from '../controladores/controladorAlimentos.js';
import { requiereAutenticacion } from '../middleware/middlewareAutenticacion.js';
import { requiereRol } from '../middleware/middlewareAutorizacion.js';

const router = Router();

// Todas las rutas requieren inicio de sesión
router.use(requiereAutenticacion);

// Rutas de lectura (Clientes y Administradores)
router.get('/', controladorAlimentos.listarAlimentos);
router.get('/combos', controladorAlimentos.obtenerCombos);
router.get('/:id', controladorAlimentos.obtenerAlimentoPorId);

// Rutas de escritura (Solo Administradores)
router.post('/', requiereRol('Administrador'), controladorAlimentos.crearNuevoAlimento);
router.put('/:id', requiereRol('Administrador'), controladorAlimentos.actualizarAlimentoExistente);
router.delete('/:id', requiereRol('Administrador'), controladorAlimentos.eliminarAlimentoExistente);

export default router;
