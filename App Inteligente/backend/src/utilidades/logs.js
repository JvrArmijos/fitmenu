import { CONFIG } from '../configuracion/variablesEntorno.js';

export function info(mensaje, detalle = '') {
  const timestamp = new Date().toISOString();
  console.log(`[INFO] [${timestamp}] ${mensaje}`, detalle ? JSON.stringify(detalle) : '');
}

export function error(mensaje, err = '') {
  const timestamp = new Date().toISOString();
  console.error(`[ERROR] [${timestamp}] ${mensaje}`, err ? (err.stack || err) : '');
}

export function advertencia(mensaje, detalle = '') {
  const timestamp = new Date().toISOString();
  console.warn(`[WARN] [${timestamp}] ${mensaje}`, detalle ? JSON.stringify(detalle) : '');
}

export default {
  info,
  error,
  advertencia
};
