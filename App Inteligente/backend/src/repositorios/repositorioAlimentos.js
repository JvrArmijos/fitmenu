import { ejecutarConsulta } from '../configuracion/conexionBaseDatos.js';

export async function buscarAlimentos(filtros = {}) {
  let query = `
    SELECT 
      a.AlimentoId,
      a.Nombre,
      a.CategoriaId,
      c.Nombre AS Categoria,
      a.TemporadaId,
      t.Nombre AS Temporada,
      a.Proteinas,
      a.Grasas,
      a.Carbohidratos,
      a.Calorias,
      a.PrecioAprox,
      a.Disponible,
      a.ProvinciaId,
      p.Nombre AS Provincia,
      a.CantonesId,
      can.Nombre AS Canton,
      a.ParroquiaId,
      parr.Nombre AS Parroquia
    FROM Alimentos a
    INNER JOIN CategoriasAlimentos c ON a.CategoriaId = c.CategoriaId
    INNER JOIN Temporadas t ON a.TemporadaId = t.TemporadaId
    LEFT JOIN Provincias p ON a.ProvinciaId = p.ProvinciaId
    LEFT JOIN Cantones can ON a.CantonesId = can.CantonId
    LEFT JOIN Parroquias parr ON a.ParroquiaId = parr.ParroquiaId
    WHERE 1=1
  `;
  
  const params = {};

  if (filtros.nombre) {
    query += ` AND a.Nombre LIKE '%' || @nombre || '%'`;
    params.nombre = filtros.nombre;
  }
  if (filtros.categoriaId) {
    query += ` AND a.CategoriaId = @categoriaId`;
    params.categoriaId = parseInt(filtros.categoriaId, 10);
  }
  if (filtros.temporadaId) {
    query += ` AND a.TemporadaId = @temporadaId`;
    params.temporadaId = parseInt(filtros.temporadaId, 10);
  }
  if (filtros.maxPrecio) {
    query += ` AND a.PrecioAprox <= @maxPrecio`;
    params.maxPrecio = parseFloat(filtros.maxPrecio);
  }
  if (filtros.provinciaId) {
    // Alimentos que sean nacionales (NULL) o específicos de la provincia
    query += ` AND (a.ProvinciaId IS NULL OR a.ProvinciaId = @provinciaId)`;
    params.provinciaId = parseInt(filtros.provinciaId, 10);
  }
  if (filtros.disponible !== undefined) {
    query += ` AND a.Disponible = @disponible`;
    params.disponible = (filtros.disponible === 'true' || filtros.disponible === true) ? 1 : 0;
  }

  query += ` ORDER BY a.Nombre`;

  const resultado = await ejecutarConsulta(query, params);
  return resultado.recordset;
}

export async function obtenerAlimentoPorId(alimentoId) {
  const query = `
    SELECT 
      a.*,
      c.Nombre AS Categoria,
      t.Nombre AS Temporada,
      p.Nombre AS Provincia,
      can.Nombre AS Canton,
      parr.Nombre AS Parroquia
    FROM Alimentos a
    INNER JOIN CategoriasAlimentos c ON a.CategoriaId = c.CategoriaId
    INNER JOIN Temporadas t ON a.TemporadaId = t.TemporadaId
    LEFT JOIN Provincias p ON a.ProvinciaId = p.ProvinciaId
    LEFT JOIN Cantones can ON a.CantonesId = can.CantonId
    LEFT JOIN Parroquias parr ON a.ParroquiaId = parr.ParroquiaId
    WHERE a.AlimentoId = @alimentoId
  `;
  const resultado = await ejecutarConsulta(query, { alimentoId });
  return resultado.recordset[0] || null;
}

export async function crearAlimento(datos) {
  const { nombre, categoriaId, temporadaId, proteinas, grasas, carbohidratos, calorias, precioAprox, disponible, provinciaId, cantonesId, parroquiaId } = datos;
  
  const query = `
    INSERT INTO Alimentos (Nombre, CategoriaId, TemporadaId, Proteinas, Grasas, Carbohidratos, Calorias, PrecioAprox, Disponible, ProvinciaId, CantonesId, ParroquiaId)
    VALUES (@nombre, @categoriaId, @temporadaId, @proteinas, @grasas, @carbohidratos, @calorias, @precioAprox, @disponible, @provinciaId, @cantonesId, @parroquiaId)
    RETURNING AlimentoId
  `;
  
  const resultado = await ejecutarConsulta(query, {
    nombre,
    categoriaId,
    temporadaId,
    proteinas: proteinas || 0,
    grasas: grasas || 0,
    carbohidratos: carbohidratos || 0,
    calorias: calorias || 0,
    precioAprox,
    disponible: disponible === undefined ? 1 : (disponible ? 1 : 0),
    provinciaId: provinciaId || null,
    cantonesId: cantonesId || null,
    parroquiaId: parroquiaId || null
  });
  
  return resultado.recordset[0].AlimentoId;
}

export async function actualizarAlimento(alimentoId, datos) {
  const { nombre, categoriaId, temporadaId, proteinas, grasas, carbohidratos, calorias, precioAprox, disponible, provinciaId, cantonesId, parroquiaId } = datos;
  
  const query = `
    UPDATE Alimentos
    SET Nombre = @nombre,
        CategoriaId = @categoriaId,
        TemporadaId = @temporadaId,
        Proteinas = @proteinas,
        Grasas = @grasas,
        Carbohidratos = @carbohidratos,
        Calorias = @calorias,
        PrecioAprox = @precioAprox,
        Disponible = @disponible,
        ProvinciaId = @provinciaId,
        CantonesId = @cantonesId,
        ParroquiaId = @parroquiaId
    WHERE AlimentoId = @alimentoId
  `;
  
  await ejecutarConsulta(query, {
    alimentoId,
    nombre,
    categoriaId,
    temporadaId,
    proteinas: proteinas || 0,
    grasas: grasas || 0,
    carbohidratos: carbohidratos || 0,
    calorias: calorias || 0,
    precioAprox,
    disponible: disponible ? 1 : 0,
    provinciaId: provinciaId || null,
    cantonesId: cantonesId || null,
    parroquiaId: parroquiaId || null
  });
  
  return true;
}

export async function eliminarAlimento(alimentoId) {
  const query = `DELETE FROM Alimentos WHERE AlimentoId = @alimentoId`;
  await ejecutarConsulta(query, { alimentoId });
  return true;
}

export async function obtenerCategorias() {
  const query = `SELECT * FROM CategoriasAlimentos ORDER BY Nombre`;
  const resultado = await ejecutarConsulta(query);
  return resultado.recordset;
}

export async function obtenerTemporadas() {
  const query = `SELECT * FROM Temporadas ORDER BY Nombre`;
  const resultado = await ejecutarConsulta(query);
  return resultado.recordset;
}

export default {
  buscarAlimentos,
  obtenerAlimentoPorId,
  crearAlimento,
  actualizarAlimento,
  eliminarAlimento,
  obtenerCategorias,
  obtenerTemporadas
};
