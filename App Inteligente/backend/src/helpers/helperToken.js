import jwt from 'jsonwebtoken';
import { CONFIG } from '../configuracion/variablesEntorno.js';

/**
 * Genera un token JWT para un usuario.
 * @param {Object} payload - Objeto con datos del usuario (id, email, rol, etc.)
 * @returns {string} Token generado
 */
export function generarToken(payload) {
  return jwt.sign(payload, CONFIG.jwt.secreto, {
    expiresIn: CONFIG.jwt.expiracion
  });
}

/**
 * Verifica y decodifica un token JWT.
 * @param {string} token - Token JWT a verificar
 * @returns {Object} Payload decodificado si es válido, lanza error en caso contrario
 */
export function verificarToken(token) {
  return jwt.verify(token, CONFIG.jwt.secreto);
}
