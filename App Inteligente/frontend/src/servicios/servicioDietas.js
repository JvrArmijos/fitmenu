import clienteApi from './clienteApi.js';
import axios from 'axios';

export const generarDietaInteligente = async () => {
  const res = await clienteApi.post('/dietas/generar');
  return res.data.datos;
};

export const obtenerHistorialDietas = async () => {
  const res = await clienteApi.get('/dietas');
  return res.data.datos;
};

export const obtenerDetalleDieta = async (id) => {
  const res = await clienteApi.get(`/dietas/${id}`);
  return res.data.datos;
};

export const eliminarDieta = async (id) => {
  const res = await clienteApi.delete(`/dietas/${id}`);
  return res.data;
};

export const marcarDietaFavorita = async (id, esFavorita) => {
  const res = await clienteApi.put(`/dietas/${id}/favorita`, { esFavorita });
  return res.data;
};

export const duplicarDieta = async (id) => {
  const res = await clienteApi.post(`/dietas/${id}/duplicar`);
  return res.data.datos;
};

export const marcarProductoComprado = async (listaId, comprado) => {
  const res = await clienteApi.put(`/dietas/compra/${listaId}`, { comprado });
  return res.data;
};

export const obtenerEstadisticasDashboard = async () => {
  const res = await clienteApi.get('/estadisticas');
  return res.data.datos;
};

// --- DESCARGAS DE ARCHIVOS UTILIZANDO BLOB Y AUTENTICACIÓN JWT ---

export const descargarPdf = async (id) => {
  try {
    const token = localStorage.getItem('fitmenu_token');
    const response = await axios.get(`http://localhost:5000/api/v1/dietas/${id}/pdf`, {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FitMenuLocal_Plan_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error al descargar el PDF:', err);
    throw new Error('No se pudo descargar el archivo PDF.');
  }
};

export const descargarExcel = async (id) => {
  try {
    const token = localStorage.getItem('fitmenu_token');
    const response = await axios.get(`http://localhost:5000/api/v1/dietas/${id}/excel`, {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FitMenuLocal_Plan_${id}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error al descargar el Excel:', err);
    throw new Error('No se pudo descargar el archivo Excel.');
  }
};

export default {
  generarDietaInteligente,
  obtenerHistorialDietas,
  obtenerDetalleDieta,
  eliminarDieta,
  marcarDietaFavorita,
  duplicarDieta,
  marcarProductoComprado,
  obtenerEstadisticasDashboard,
  descargarPdf,
  descargarExcel
};
