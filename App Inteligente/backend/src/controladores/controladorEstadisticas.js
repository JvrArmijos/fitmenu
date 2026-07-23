import servicioDietas from '../servicios/servicioDietas.js';

export async function obtenerEstadisticasDashboard(req, res, next) {
  try {
    const usuarioId = req.usuario.usuarioId;
    const rol = req.usuario.rol;

    const estadisticas = await servicioDietas.obtenerEstadisticas(usuarioId, rol);

    return res.status(200).json({
      ok: true,
      datos: estadisticas
    });
  } catch (err) {
    next(err);
  }
}

export default {
  obtenerEstadisticasDashboard
};
