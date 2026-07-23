/**
 * Valida los datos para el registro de un nuevo usuario.
 */
export function validarRegistro(datos) {
  const errores = [];
  const { nombreCompleto, email, contrasena } = datos;

  if (!nombreCompleto || nombreCompleto.trim().length < 3) {
    errores.push('El nombre completo es obligatorio y debe tener al menos 3 caracteres.');
  }

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !regexEmail.test(email)) {
    errores.push('El correo electrónico ingresado no tiene un formato válido.');
  }

  if (!contrasena || contrasena.length < 6) {
    errores.push('La contraseña es obligatoria y debe tener al menos 6 caracteres.');
  }

  return {
    esValido: errores.length === 0,
    errores
  };
}

/**
 * Valida los datos de inicio de sesión.
 */
export function validarLogin(datos) {
  const errores = [];
  const { email, contrasena } = datos;

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !regexEmail.test(email)) {
    errores.push('Debe ingresar un correo electrónico válido.');
  }

  if (!contrasena) {
    errores.push('La contraseña es requerida.');
  }

  return {
    esValido: errores.length === 0,
    errores
  };
}

/**
 * Valida el perfil de información nutricional del usuario.
 */
export function validarPerfilNutricional(datos) {
  const errores = [];
  const { edad, sexo, pesoKg, alturaCm, nivelActividad, objetivoNutricionalId, presupuestoDiario, parroquiaId } = datos;

  if (edad === undefined || isNaN(edad) || edad < 0 || edad > 120) {
    errores.push('La edad debe ser un número válido entre 0 y 120 años.');
  }

  if (!sexo || !['M', 'F'].includes(sexo)) {
    errores.push('El sexo debe ser "M" (Masculino) o "F" (Femenino).');
  }

  if (pesoKg === undefined || isNaN(pesoKg) || pesoKg <= 0) {
    errores.push('El peso debe ser un número mayor a 0 kg.');
  }

  if (alturaCm === undefined || isNaN(alturaCm) || alturaCm <= 0) {
    errores.push('La altura debe ser un número mayor a 0 cm.');
  }

  const nivelesPermitidos = ['Sedentario', 'Ligero', 'Moderado', 'Activo', 'Muy Activo'];
  if (!nivelActividad || !nivelesPermitidos.includes(nivelActividad)) {
    errores.push(`El nivel de actividad debe ser uno de: ${nivelesPermitidos.join(', ')}.`);
  }

  if (!objetivoNutricionalId || isNaN(objetivoNutricionalId)) {
    errores.push('Debe seleccionar un objetivo nutricional válido.');
  }

  if (presupuestoDiario === undefined || isNaN(presupuestoDiario) || presupuestoDiario < 0) {
    errores.push('El presupuesto diario debe ser un número mayor o igual a 0.');
  }

  if (!parroquiaId || isNaN(parroquiaId)) {
    errores.push('Debe especificar su ubicación (parroquia) para poder sugerir ingredientes locales.');
  }

  return {
    esValido: errores.length === 0,
    errores
  };
}

export default {
  validarRegistro,
  validarLogin,
  validarPerfilNutricional
};
