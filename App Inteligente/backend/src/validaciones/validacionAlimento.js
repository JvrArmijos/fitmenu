/**
 * Valida los datos para la creación o actualización de un alimento.
 */
export function validarAlimento(datos) {
  const errores = [];
  const { nombre, categoriaId, temporadaId, precioAprox, proteinas, grasas, carbohidratos, calorias } = datos;

  if (!nombre || nombre.trim().length < 2) {
    errores.push('El nombre del alimento es obligatorio y debe tener al menos 2 caracteres.');
  }

  if (!categoriaId || isNaN(categoriaId)) {
    errores.push('Debe seleccionar una categoría de alimentos válida.');
  }

  if (!temporadaId || isNaN(temporadaId)) {
    errores.push('Debe seleccionar una temporada de alimentos válida.');
  }

  if (precioAprox === undefined || isNaN(precioAprox) || precioAprox < 0) {
    errores.push('El precio aproximado debe ser un número mayor o igual a 0.');
  }

  if (proteinas !== undefined && (isNaN(proteinas) || proteinas < 0)) {
    errores.push('Las proteínas deben ser un número mayor o igual a 0.');
  }

  if (grasas !== undefined && (isNaN(grasas) || grasas < 0)) {
    errores.push('Las grasas deben ser un número mayor o igual a 0.');
  }

  if (carbohidratos !== undefined && (isNaN(carbohidratos) || carbohidratos < 0)) {
    errores.push('Los carbohidratos deben ser un número mayor o igual a 0.');
  }

  if (calorias !== undefined && (isNaN(calorias) || calorias < 0)) {
    errores.push('Las calorías deben ser un número mayor o igual a 0.');
  }

  return {
    esValido: errores.length === 0,
    errores
  };
}

export default {
  validarAlimento
};
