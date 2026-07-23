import { ejecutarConsulta } from '../configuracion/conexionBaseDatos.js';

export async function obtenerRegiones() {
  const query = `SELECT * FROM Regiones ORDER BY Nombre`;
  const resultado = await ejecutarConsulta(query);
  return resultado.recordset;
}

export async function obtenerProvincias(regionId = null) {
  let query = `SELECT * FROM Provincias`;
  const params = {};
  if (regionId) {
    query += ` WHERE RegionId = @regionId`;
    params.regionId = regionId;
  }
  query += ` ORDER BY Nombre`;
  const resultado = await ejecutarConsulta(query, params);
  return resultado.recordset;
}

export async function obtenerCantones(provinciaId = null) {
  let query = `SELECT * FROM Cantones`;
  const params = {};
  if (provinciaId) {
    query += ` WHERE ProvinciaId = @provinciaId`;
    params.provinciaId = provinciaId;
  }
  query += ` ORDER BY Nombre`;
  const resultado = await ejecutarConsulta(query, params);
  return resultado.recordset;
}

export async function obtenerParroquias(cantonId = null) {
  let query = `SELECT * FROM Parroquias`;
  const params = {};
  if (cantonId) {
    query += ` WHERE CantonId = @cantonId`;
    params.cantonId = cantonId;
  }
  query += ` ORDER BY Nombre`;
  const resultado = await ejecutarConsulta(query, params);
  return resultado.recordset;
}

export async function obtenerUbicacionCompleta(parroquiaId) {
  const query = `
    SELECT 
      p.ParroquiaId, p.Nombre AS Parroquia,
      c.CantonId, c.Nombre AS Canton,
      pr.ProvinciaId, pr.Nombre AS Provincia,
      r.RegionId, r.Nombre AS Region
    FROM Parroquias p
    INNER JOIN Cantones c ON p.CantonId = c.CantonId
    INNER JOIN Provincias pr ON c.ProvinciaId = pr.ProvinciaId
    INNER JOIN Regiones r ON pr.RegionId = r.RegionId
    WHERE p.ParroquiaId = @parroquiaId
  `;
  const resultado = await ejecutarConsulta(query, { parroquiaId });
  return resultado.recordset[0] || null;
}

export default {
  obtenerRegiones,
  obtenerProvincias,
  obtenerCantones,
  obtenerParroquias,
  obtenerUbicacionCompleta
};
