import repositorioAlimentos from '../repositorios/repositorioAlimentos.js';
import repositorioUbicaciones from '../repositorios/repositorioUbicaciones.js';

export async function listarAlimentos(filtros) {
  return await repositorioAlimentos.buscarAlimentos(filtros);
}

export async function obtenerAlimento(alimentoId) {
  const alimento = await repositorioAlimentos.obtenerAlimentoPorId(alimentoId);
  if (!alimento) {
    throw new Error('Alimento no encontrado.');
  }
  return alimento;
}

export async function crearAlimento(datos) {
  // Calcular calorías aproximadas si no se envían
  // Proteína = 4 kcal/g, Carbohidratos = 4 kcal/g, Grasa = 9 kcal/g
  if (datos.calorias === undefined || datos.calorias === null || datos.calorias === 0) {
    const prot = datos.proteinas || 0;
    const carb = datos.carbohidratos || 0;
    const gras = datos.grasas || 0;
    datos.calorias = (prot * 4) + (carb * 4) + (gras * 9);
  }

  const alimentoId = await repositorioAlimentos.crearAlimento(datos);
  return await obtenerAlimento(alimentoId);
}

export async function actualizarAlimento(alimentoId, datos) {
  await obtenerAlimento(alimentoId); // Verifica existencia

  if (datos.calorias === undefined || datos.calorias === null || datos.calorias === 0) {
    const prot = datos.proteinas || 0;
    const carb = datos.carbohidratos || 0;
    const gras = datos.grasas || 0;
    datos.calorias = (prot * 4) + (carb * 4) + (gras * 9);
  }

  await repositorioAlimentos.actualizarAlimento(alimentoId, datos);
  return await obtenerAlimento(alimentoId);
}

export async function eliminarAlimento(alimentoId) {
  await obtenerAlimento(alimentoId); // Verifica existencia
  return await repositorioAlimentos.eliminarAlimento(alimentoId);
}

export async function obtenerCombosCatalogo() {
  const categorias = await repositorioAlimentos.obtenerCategorias();
  const temporadas = await repositorioAlimentos.obtenerTemporadas();
  const provincias = await repositorioUbicaciones.obtenerProvincias();

  return {
    categorias,
    temporadas,
    provincias
  };
}

export default {
  listarAlimentos,
  obtenerAlimento,
  crearAlimento,
  actualizarAlimento,
  eliminarAlimento,
  obtenerCombosCatalogo
};
