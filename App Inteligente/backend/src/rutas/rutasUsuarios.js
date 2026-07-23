import { Router } from 'express';
import controladorUsuarios from '../controladores/controladorUsuarios.js';
import { requiereAutenticacion } from '../middleware/middlewareAutenticacion.js';

const router = Router();

// Todas las rutas requieren token JWT
router.use(requiereAutenticacion);

router.get('/perfil', controladorUsuarios.obtenerMiPerfil);
router.put('/perfil', controladorUsuarios.actualizarMiPerfil);
router.put('/perfil/contrasena', controladorUsuarios.cambiarMiContrasena);
router.delete('/cuenta', controladorUsuarios.eliminarMiCuenta);

// Perfil Nutricional
router.post('/perfil/nutricional', controladorUsuarios.guardarMiPerfilNutricional);

// Configuración de visualización
router.put('/perfil/configuracion', controladorUsuarios.guardarConfiguracionTema);

// Chatbot Inteligente
router.post('/chatbot', controladorUsuarios.consultarAsistente);

export default router;
