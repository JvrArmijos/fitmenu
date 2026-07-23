import servicioAlimentos from '../servicios/servicioAlimentos.js';
import { validarAlimento } from '../validaciones/validacionAlimento.js';

export async function listarAlimentos(req, res, next) {
  try {
    const alimentos = await servicioAlimentos.listarAlimentos(req.query);
    return res.status(200).json({
      ok: true,
      datos: alimentos
    });
  } catch (err) {
    next(err);
  }
}

export async function obtenerAlimentoPorId(req, res, next) {
  try {
    const { id } = req.params;
    const alimento = await servicioAlimentos.obtenerAlimento(parseInt(id, 10));
    return res.status(200).json({
      ok: true,
      datos: alimento
    });
  } catch (err) {
    next(err);
  }
}

export async function crearNuevoAlimento(req, res, next) {
  try {
    const validacion = validarAlimento(req.body);
    if (!validacion.esValido) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Datos del alimento inválidos.',
        errores: validacion.errores
      });
    }

    const nuevoAlimento = await servicioAlimentos.crearAlimento(req.body);
    return res.status(201).json({
      ok: true,
      mensaje: 'Alimento creado con éxito en el catálogo.',
      datos: nuevoAlimento
    });
  } catch (err) {
    next(err);
  }
}

export async function actualizarAlimentoExistente(req, res, next) {
  try {
    const { id } = req.params;
    const validacion = validarAlimento(req.body);
    if (!validacion.esValido) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Datos de edición del alimento inválidos.',
        errores: validacion.errores
      });
    }

    const alimentoActualizado = await servicioAlimentos.actualizarAlimento(parseInt(id, 10), req.body);
    return res.status(200).json({
      ok: true,
      mensaje: 'Alimento actualizado con éxito.',
      datos: alimentoActualizado
    });
  } catch (err) {
    next(err);
  }
}

export async function eliminarAlimentoExistente(req, res, next) {
  try {
    const { id } = req.params;
    await servicioAlimentos.eliminarAlimento(parseInt(id, 10));
    return res.status(200).json({
      ok: true,
      mensaje: 'Alimento eliminado correctamente del catálogo.'
    });
  } catch (err) {
    next(err);
  }
}

export async function obtenerCombos(req, res, next) {
  try {
    const combos = await servicioAlimentos.obtenerCombosCatalogo();
    return res.status(200).json({
      ok: true,
      datos: combos
    });
  } catch (err) {
    next(err);
  }
}

export default {
  listarAlimentos,
  obtenerAlimentoPorId,
  crearNuevoAlimento,
  actualizarAlimentoExistente,
  eliminarAlimentoExistente,
  obtenerCombos
};
