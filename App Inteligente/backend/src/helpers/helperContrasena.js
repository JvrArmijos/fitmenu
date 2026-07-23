import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Cifra una contraseña de texto plano en un hash seguro.
 * @param {string} contrasenaPlana
 * @returns {Promise<string>}
 */
export async function cifrarContrasena(contrasenaPlana) {
  return await bcrypt.hash(contrasenaPlana, SALT_ROUNDS);
}

/**
 * Compara una contraseña plana con su hash guardado.
 * @param {string} contrasenaPlana
 * @param {string} contrasenaHash
 * @returns {Promise<boolean>}
 */
export async function compararContrasena(contrasenaPlana, contrasenaHash) {
  return await bcrypt.compare(contrasenaPlana, contrasenaHash);
}
