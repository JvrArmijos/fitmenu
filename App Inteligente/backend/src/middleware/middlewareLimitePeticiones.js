import rateLimit from 'express-rate-limit';

/**
 * Limitador general para todas las rutas API.
 * Permite 150 peticiones cada 15 minutos por IP.
 */
export const limiteGeneral = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 150,
  message: {
    ok: false,
    mensaje: 'Demasiadas peticiones desde esta dirección IP. Por favor, intente de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Limitador estricto para rutas de autenticación y generación de dietas por IA.
 * Permite 20 peticiones cada 15 minutos.
 */
export const limiteAutenticacionYIa = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,
  message: {
    ok: false,
    mensaje: 'Límite de solicitudes de seguridad o IA excedido. Por favor, espere 15 minutos antes de volver a intentar.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
