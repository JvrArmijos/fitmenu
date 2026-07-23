import clienteApi from './clienteApi.js';

export const buscarAlimentos = async (filtros = {}) => {
  const res = await clienteApi.get('/alimentos', { params: filtros });
  return res.data.datos;
};

export const obtenerCombosAlimentos = async () => {
  const res = await clienteApi.get('/alimentos/combos');
  return res.data.datos;
};

export const obtenerAlimentoPorId = async (id) => {
  const res = await clienteApi.get(`/alimentos/${id}`);
  return res.data.datos;
};

export const crearAlimento = async (datos) => {
  const res = await clienteApi.post('/alimentos', datos);
  return res.data.datos;
};

export const actualizarAlimento = async (id, datos) => {
  const res = await clienteApi.put(`/alimentos/${id}`, datos);
  return res.data.datos;
};

export const eliminarAlimento = async (id) => {
  const res = await clienteApi.delete(`/alimentos/${id}`);
  return res.data;
};

// Cargar catálogos geográficos públicos
export const obtenerProvincias = async () => {
  const res = await clienteApi.get('/catalogos/provincias');
  return res.data.datos;
};

export const obtenerCantones = async (provinciaId) => {
  const res = await clienteApi.get('/catalogos/cantones', { params: { provinciaId } });
  return res.data.datos;
};

export const obtenerParroquias = async (cantonId) => {
  const res = await clienteApi.get('/catalogos/parroquias', { params: { cantonId } });
  return res.data.datos;
};

export const obtenerObjetivos = async () => {
  const res = await clienteApi.get('/catalogos/objetivos');
  return res.data.datos;
};

export const obtenerRestricciones = async () => {
  const res = await clienteApi.get('/catalogos/restricciones');
  return res.data.datos;
};

export default {
  buscarAlimentos,
  obtenerCombosAlimentos,
  obtenerAlimentoPorId,
  crearAlimento,
  actualizarAlimento,
  eliminarAlimento,
  obtenerProvincias,
  obtenerCantones,
  obtenerParroquias,
  obtenerObjetivos,
  obtenerRestricciones
};
