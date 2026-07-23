import { verificarToken } from '../helpers/helperToken.js';
import logs from '../utilidades/logs.js';

export function requiereAutenticacion(req, res, next) {
  try {
    const cabeceraAutorizacion = req.headers.authorization;

    if (!cabeceraAutorizacion || !cabeceraAutorizacion.startsWith('Bearer ')) {
      return res.status(401).json({
        ok: false,
        mensaje: 'No autorizado. No se proporcionó un token de acceso.'
      });
    }

    const token = cabeceraAutorizacion.split(' ')[1];
    const payload = verificarToken(token);

    // Asignar el usuario decodificado a la petición
    req.usuario = {
      usuarioId: payload.usuarioId,
      email: payload.email,
      rol: payload.rol, // 'Administrador' o 'Cliente'
      rolId: payload.rolId
    };

    next();
  } catch (err) {
    logs.advertencia('Intento de acceso fallido con token inválido.', err.message);
    return res.status(401).json({
      ok: false,
      mensaje: 'Token inválido o expirado. Vuelva a iniciar sesión.'
    });
  }
}
