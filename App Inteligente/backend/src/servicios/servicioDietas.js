import repositorioDietas from '../repositorios/repositorioDietas.js';
import repositorioUsuarios from '../repositorios/repositorioUsuarios.js';
import repositorioAlimentos from '../repositorios/repositorioAlimentos.js';
import { generarDietaInteligente } from '../ia/servicioGemini.js';

export async function generarDietaParaUsuario(usuarioId) {
  // 1. Obtener información nutricional completa del usuario
  const perfil = await repositorioUsuarios.obtenerInformacionNutricional(usuarioId);
  if (!perfil) {
    throw new Error('Debe completar su perfil nutricional (edad, peso, objetivo, ubicación) antes de generar una dieta.');
  }

  // 2. Obtener restricciones del usuario
  const restricciones = await repositorioUsuarios.obtenerRestriccionesUsuario(usuarioId);
  perfil.restricciones = restricciones;

  // 3. Obtener alimentos disponibles en la provincia del usuario
  // Se filtran los alimentos activos y que pertenezcan a la provincia del usuario (o nacionales)
  const alimentos = await repositorioAlimentos.buscarAlimentos({
    provinciaId: perfil.ProvinciaId,
    disponible: true
  });

  if (!alimentos || alimentos.length === 0) {
    throw new Error('No hay alimentos registrados en el catálogo para su provincia o a nivel nacional.');
  }

  // 4. Invocar a Gemini para que genere la dieta inteligente estructurada en JSON
  const dietaGenerada = await generarDietaInteligente(perfil, alimentos);

  // 5. Almacenar el plan alimenticio completo en la base de datos (con transaccionalidad)
  const dietaId = await repositorioDietas.guardarDietaCompleta(usuarioId, dietaGenerada);

  // 6. Retornar la dieta guardada completa
  return await repositorioDietas.obtenerDietaPorId(dietaId, usuarioId);
}

export async function obtenerHistorial(usuarioId) {
  return await repositorioDietas.obtenerHistorialDietas(usuarioId);
}

export async function obtenerDieta(dietaId, usuarioId) {
  const dieta = await repositorioDietas.obtenerDietaPorId(dietaId, usuarioId);
  if (!dieta) {
    throw new Error('Dieta no encontrada o no tiene permisos para verla.');
  }
  return dieta;
}

export async function eliminarDieta(dietaId, usuarioId) {
  const exito = await repositorioDietas.eliminarDieta(dietaId, usuarioId);
  if (!exito) {
    throw new Error('No se pudo eliminar la dieta. Es posible que no exista o no tenga permisos.');
  }
  return true;
}

export async function marcarFavorita(dietaId, usuarioId, esFavorita) {
  const exito = await repositorioDietas.marcarFavorita(dietaId, usuarioId, esFavorita);
  if (!exito) {
    throw new Error('No se pudo actualizar el estado de favorita de la dieta.');
  }
  return true;
}

export async function duplicarDieta(dietaId, usuarioId) {
  const nuevaDietaId = await repositorioDietas.duplicarDieta(dietaId, usuarioId);
  return await repositorioDietas.obtenerDietaPorId(nuevaDietaId, usuarioId);
}

export async function marcarItemLista(listaId, comprado) {
  const exito = await repositorioDietas.marcarItemListaCompra(listaId, comprado);
  if (!exito) {
    throw new Error('No se pudo actualizar el estado del producto en la lista de compras.');
  }
  return true;
}

export async function obtenerEstadisticas(usuarioId, rol) {
  if (rol === 'Administrador') {
    return await repositorioDietas.obtenerEstadisticasAdmin();
  } else {
    return await repositorioDietas.obtenerEstadisticasUsuario(usuarioId);
  }
}

export default {
  generarDietaParaUsuario,
  obtenerHistorial,
  obtenerDieta,
  eliminarDieta,
  marcarFavorita,
  duplicarDieta,
  marcarItemLista,
  obtenerEstadisticas
};
