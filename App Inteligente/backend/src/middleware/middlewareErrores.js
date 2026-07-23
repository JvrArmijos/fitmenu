import logs from '../utilidades/logs.js';
import { CONFIG } from '../configuracion/variablesEntorno.js';

/**
 * Middleware global para captura y manejo de errores.
 */
export function manejadorGlobalErrores(err, req, res, next) {
  logs.error(`Error capturado en [${req.method}] ${req.originalUrl}:`, err);

  const codigoEstado = err.status || err.statusCode || 500;
  const mensaje = err.message || 'Ocurrió un error inesperado en el servidor.';

  res.status(codigoEstado).json({
    ok: false,
    mensaje,
    error: CONFIG.entorno === 'development' ? {
      mensaje: err.message,
      stack: err.stack,
      detalle: err
    } : undefined
  });
}
