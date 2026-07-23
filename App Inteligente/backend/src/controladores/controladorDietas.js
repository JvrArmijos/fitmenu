import servicioDietas from '../servicios/servicioDietas.js';
import { exportarDietaPdf } from '../utilidades/exportadorPdf.js';
import { exportarDietaExcel } from '../utilidades/exportadorExcel.js';

export async function generarPlan(req, res, next) {
  try {
    const usuarioId = req.usuario.usuarioId;
    const plan = await servicioDietas.generarDietaParaUsuario(usuarioId);

    return res.status(201).json({
      ok: true,
      mensaje: 'Plan alimenticio local e inteligente generado con éxito.',
      datos: plan
    });
  } catch (err) {
    next(err);
  }
}

export async function obtenerHistorial(req, res, next) {
  try {
    const usuarioId = req.usuario.usuarioId;
    const historial = await servicioDietas.obtenerHistorial(usuarioId);

    return res.status(200).json({
      ok: true,
      datos: historial
    });
  } catch (err) {
    next(err);
  }
}

export async function obtenerDetalleDieta(req, res, next) {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.usuarioId;
    const dieta = await servicioDietas.obtenerDieta(parseInt(id, 10), usuarioId);

    return res.status(200).json({
      ok: true,
      datos: dieta
    });
  } catch (err) {
    next(err);
  }
}

export async function eliminarPlan(req, res, next) {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.usuarioId;
    await servicioDietas.eliminarDieta(parseInt(id, 10), usuarioId);

    return res.status(200).json({
      ok: true,
      mensaje: 'Plan alimenticio eliminado de su historial con éxito.'
    });
  } catch (err) {
    next(err);
  }
}

export async function actualizarFavorita(req, res, next) {
  try {
    const { id } = req.params;
    const { esFavorita } = req.body;
    const usuarioId = req.usuario.usuarioId;

    if (esFavorita === undefined) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Debe especificar el estado para esFavorita.'
      });
    }

    await servicioDietas.marcarFavorita(parseInt(id, 10), usuarioId, esFavorita);

    return res.status(200).json({
      ok: true,
      mensaje: esFavorita ? 'Plan alimenticio marcado como favorito.' : 'Plan alimenticio removido de favoritos.'
    });
  } catch (err) {
    next(err);
  }
}

export async function duplicarPlan(req, res, next) {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.usuarioId;
    const nuevoPlan = await servicioDietas.duplicarDieta(parseInt(id, 10), usuarioId);

    return res.status(201).json({
      ok: true,
      mensaje: 'Plan alimenticio duplicado correctamente en su historial.',
      datos: nuevoPlan
    });
  } catch (err) {
    next(err);
  }
}

export async function marcarProductoLista(req, res, next) {
  try {
    const { listaId } = req.params;
    const { comprado } = req.body;

    if (comprado === undefined) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Debe especificar el estado de comprado.'
      });
    }

    await servicioDietas.marcarItemLista(parseInt(listaId, 10), comprado);

    return res.status(200).json({
      ok: true,
      mensaje: comprado ? 'Ingrediente marcado como comprado.' : 'Ingrediente marcado como pendiente.'
    });
  } catch (err) {
    next(err);
  }
}

export async function descargarPdf(req, res, next) {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.usuarioId;
    
    // Obtener la dieta de la BD para asegurar pertenencia y permisos
    const dieta = await servicioDietas.obtenerDieta(parseInt(id, 10), usuarioId);
    
    exportarDietaPdf(dieta, res);
  } catch (err) {
    next(err);
  }
}

export async function descargarExcel(req, res, next) {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.usuarioId;
    
    // Obtener la dieta de la BD para asegurar pertenencia y permisos
    const dieta = await servicioDietas.obtenerDieta(parseInt(id, 10), usuarioId);
    
    exportarDietaExcel(dieta, res);
  } catch (err) {
    next(err);
  }
}

export default {
  generarPlan,
  obtenerHistorial,
  obtenerDetalleDieta,
  eliminarPlan,
  actualizarFavorita,
  duplicarPlan,
  marcarProductoLista,
  descargarPdf,
  descargarExcel
};
