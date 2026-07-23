import { Router } from 'express';
import controladorAutenticacion from '../controladores/controladorAutenticacion.js';
import { limiteAutenticacionYIa } from '../middleware/middlewareLimitePeticiones.js';

const router = Router();

// Rutas públicas de autenticación con rate-limiter estricto
router.post('/registrar', limiteAutenticacionYIa, controladorAutenticacion.registrarUsuario);
router.post('/login', limiteAutenticacionYIa, controladorAutenticacion.iniciarSesionUsuario);

export default router;
