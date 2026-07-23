import { ejecutarConsulta } from '../configuracion/conexionBaseDatos.js';

/**
 * Guarda una dieta completa transaccionalmente (Dieta, Detalles, Recetas, Lista de Compras, Historial).
 */
export async function guardarDietaCompleta(usuarioId, dietaData) {
  try {
    await ejecutarConsulta('BEGIN TRANSACTION');
    
    // 1. Insertar Dieta
    const queryDieta = `
      INSERT INTO Dietas (UsuarioId, Objetivo, CaloriasTotales, ProteinasTotales, GrasasTotales, CarbohidratosTotales, PresupuestoEstimado, EsFavorita)
      VALUES (@usuarioId, @objetivo, @caloriasTotales, @proteinasTotales, @grasasTotales, @carbohidratosTotales, @presupuestoEstimado, 0)
      RETURNING DietaId
    `;
    const resDieta = await ejecutarConsulta(queryDieta, {
      usuarioId,
      objetivo: dietaData.objetivo,
      caloriasTotales: dietaData.caloriasTotales,
      proteinasTotales: dietaData.proteinasTotales,
      grasasTotales: dietaData.grasasTotales,
      carbohidratosTotales: dietaData.carbohidratosTotales,
      presupuestoEstimado: dietaData.presupuestoEstimado
    });
    const dietaId = resDieta.recordset[0].DietaId;
    
    // 2. Insertar DetallePlanAlimenticio
    for (const d of dietaData.detalles) {
      const queryDetalle = `
        INSERT INTO DetallePlanAlimenticio (DietaId, TipoComida, AlimentoSugerido, Cantidad, Calorias, Proteinas, Grasas, Carbohidratos)
        VALUES (@dietaId, @tipoComida, @alimentoSugerido, @cantidad, @calorias, @proteinas, @grasas, @carbohidratos)
      `;
      await ejecutarConsulta(queryDetalle, {
        dietaId,
        tipoComida: d.tipoComida,
        alimentoSugerido: d.alimentoSugerido,
        cantidad: d.cantidad,
        calorias: d.calorias,
        proteinas: d.proteinas,
        grasas: d.grasas,
        carbohidratos: d.carbohidratos
      });
    }
    
    // 3. Insertar Recetas
    for (const r of dietaData.recetas) {
      const queryReceta = `
        INSERT INTO Recetas (DietaId, Nombre, Ingredientes, Preparacion, TiempoEstimadoMinutos)
        VALUES (@dietaId, @nombre, @ingredientes, @preparacion, @tiempoEstimadoMinutos)
      `;
      await ejecutarConsulta(queryReceta, {
        dietaId,
        nombre: r.nombre,
        ingredientes: r.ingredientes,
        preparacion: r.preparacion,
        tiempoEstimadoMinutos: r.tiempoEstimadoMinutos
      });
    }
    
    // 4. Insertar ListaCompras
    for (const c of dietaData.listaCompras) {
      const queryLista = `
        INSERT INTO ListaCompras (DietaId, Ingrediente, Cantidad, CostoAproximado, Comprado)
        VALUES (@dietaId, @ingrediente, @cantidad, @costoAproximado, 0)
      `;
      await ejecutarConsulta(queryLista, {
        dietaId,
        ingrediente: c.ingrediente,
        cantidad: c.cantidad,
        costoAproximado: c.costoAproximado
      });
    }

    // 5. Registrar en Historial
    const queryHist = `
      INSERT INTO HistorialConsultas (UsuarioId, Accion, Detalle)
      VALUES (@usuarioId, 'Generación de dieta', @detalle)
    `;
    await ejecutarConsulta(queryHist, {
      usuarioId,
      detalle: `Dieta inteligente ID ${dietaId} creada para el objetivo ${dietaData.objetivo}.`
    });
    
    await ejecutarConsulta('COMMIT');
    return dietaId;
  } catch (err) {
    try {
      await ejecutarConsulta('ROLLBACK');
    } catch (rbErr) {
      // Ignorar errores de rollback
    }
    throw err;
  }
}

export async function obtenerHistorialDietas(usuarioId) {
  const query = `
    SELECT DietaId, UsuarioId, FechaCreacion, Objetivo, CaloriasTotales, 
           ProteinasTotales, GrasasTotales, CarbohidratosTotales, PresupuestoEstimado, EsFavorita
    FROM Dietas
    WHERE UsuarioId = @usuarioId
    ORDER BY FechaCreacion DESC
  `;
  const resultado = await ejecutarConsulta(query, { usuarioId });
  return resultado.recordset;
}

export async function obtenerDietaPorId(dietaId, usuarioId) {
  // 1. Obtener encabezado
  const queryDieta = `
    SELECT * FROM Dietas 
    WHERE DietaId = @dietaId AND (UsuarioId = @usuarioId OR EXISTS (
      SELECT 1 FROM Usuarios WHERE UsuarioId = @usuarioId AND RolId = 1
    ))
  `;
  const resDieta = await ejecutarConsulta(queryDieta, { dietaId, usuarioId });
  const dieta = resDieta.recordset[0];
  
  if (!dieta) return null;

  // 2. Obtener Detalles
  const queryDetalles = `SELECT * FROM DetallePlanAlimenticio WHERE DietaId = @dietaId ORDER BY DetalleId`;
  const resDetalles = await ejecutarConsulta(queryDetalles, { dietaId });
  dieta.detalles = resDetalles.recordset;

  // 3. Obtener Recetas
  const queryRecetas = `SELECT * FROM Recetas WHERE DietaId = @dietaId ORDER BY RecetaId`;
  const resRecetas = await ejecutarConsulta(queryRecetas, { dietaId });
  dieta.recetas = resRecetas.recordset;

  // 4. Obtener Lista de Compras
  const queryLista = `SELECT * FROM ListaCompras WHERE DietaId = @dietaId ORDER BY ListaId`;
  const resLista = await ejecutarConsulta(queryLista, { dietaId });
  dieta.listaCompras = resLista.recordset;

  return dieta;
}

export async function eliminarDieta(dietaId, usuarioId) {
  const query = `
    DELETE FROM Dietas 
    WHERE DietaId = @dietaId AND UsuarioId = @usuarioId
  `;
  const resultado = await ejecutarConsulta(query, { dietaId, usuarioId });
  
  // Registrar acción
  await ejecutarConsulta(
    `INSERT INTO HistorialConsultas (UsuarioId, Accion, Detalle) VALUES (@usuarioId, 'Eliminar dieta', @detalle)`,
    { usuarioId, detalle: `Se eliminó la dieta ID ${dietaId}` }
  );

  return resultado.rowsAffected[0] > 0;
}

export async function marcarFavorita(dietaId, usuarioId, esFavorita) {
  const query = `
    UPDATE Dietas
    SET EsFavorita = @esFavorita
    WHERE DietaId = @dietaId AND UsuarioId = @usuarioId
  `;
  const resultado = await ejecutarConsulta(query, { dietaId, usuarioId, esFavorita: esFavorita ? 1 : 0 });
  return resultado.rowsAffected[0] > 0;
}

export async function marcarItemListaCompra(listaId, comprado) {
  const query = `
    UPDATE ListaCompras
    SET Comprado = @comprado
    WHERE ListaId = @listaId
  `;
  const resultado = await ejecutarConsulta(query, { listaId, comprado: comprado ? 1 : 0 });
  return resultado.rowsAffected[0] > 0;
}

export async function duplicarDieta(dietaId, usuarioId) {
  const dietaOriginal = await obtenerDietaPorId(dietaId, usuarioId);
  if (!dietaOriginal) throw new Error('Dieta original no encontrada.');

  const dietaNueva = {
    objetivo: dietaOriginal.Objetivo,
    caloriasTotales: dietaOriginal.CaloriasTotales,
    proteinasTotales: dietaOriginal.ProteinasTotales,
    grasasTotales: dietaOriginal.GrasasTotales,
    carbohidratosTotales: dietaOriginal.CarbohidratosTotales,
    presupuestoEstimado: dietaOriginal.PresupuestoEstimado,
    detalles: dietaOriginal.detalles.map(d => ({
      tipoComida: d.TipoComida,
      alimentoSugerido: d.AlimentoSugerido,
      cantidad: d.Cantidad,
      calorias: d.Calorias,
      proteinas: d.Proteinas,
      grasas: d.Grasas,
      carbohidratos: d.Carbohidratos
    })),
    recetas: dietaOriginal.recetas.map(r => ({
      nombre: r.Nombre,
      ingredientes: r.Ingredientes,
      preparacion: r.Preparacion,
      tiempoEstimadoMinutos: r.TiempoEstimadoMinutos
    })),
    listaCompras: dietaOriginal.listaCompras.map(c => ({
      ingrediente: c.Ingrediente,
      cantidad: c.Cantidad,
      costoAproximado: c.CostoAproximado
    }))
  };

  return await guardarDietaCompleta(usuarioId, dietaNueva);
}

// --- ESTADÍSTICAS ---

export async function obtenerEstadisticasAdmin() {
  const totalUsuarios = await ejecutarConsulta(`SELECT COUNT(*) AS total FROM Usuarios WHERE Activo = 1 AND RolId = 2`);
  const totalDietas = await ejecutarConsulta(`SELECT COUNT(*) AS total FROM Dietas`);
  const totalAlimentos = await ejecutarConsulta(`SELECT COUNT(*) AS total FROM Alimentos`);
  const totalCategorias = await ejecutarConsulta(`SELECT COUNT(*) AS total FROM CategoriasAlimentos`);

  // Distribución por provincia
  const distribucionProvincial = await ejecutarConsulta(`
    SELECT pr.Nombre AS Provincia, COUNT(inuf.UsuarioId) AS CantidadUsuarios
    FROM InformacionNutricional inuf
    INNER JOIN Parroquias p ON inuf.ParroquiaId = p.ParroquiaId
    INNER JOIN Cantones c ON p.CantonId = c.CantonId
    INNER JOIN Provincias pr ON c.ProvinciaId = pr.ProvinciaId
    GROUP BY pr.Nombre
  `);

  // Dietas por objetivo
  const dietasPorObjetivo = await ejecutarConsulta(`
    SELECT Objetivo, COUNT(*) AS Cantidad
    FROM Dietas
    GROUP BY Objetivo
  `);

  // Alimentos por categoría
  const alimentosPorCategoria = await ejecutarConsulta(`
    SELECT c.Nombre AS Categoria, COUNT(a.AlimentoId) AS Cantidad
    FROM Alimentos a
    INNER JOIN CategoriasAlimentos c ON a.CategoriaId = c.CategoriaId
    GROUP BY c.Nombre
  `);

  return {
    tarjetas: {
      usuarios: totalUsuarios.recordset[0].total,
      dietas: totalDietas.recordset[0].total,
      alimentos: totalAlimentos.recordset[0].total,
      categorias: totalCategorias.recordset[0].total
    },
    graficos: {
      provincias: distribucionProvincial.recordset,
      objetivos: dietasPorObjetivo.recordset,
      categorias: alimentosPorCategoria.recordset
    }
  };
}

export async function obtenerEstadisticasUsuario(usuarioId) {
  const dietas = await ejecutarConsulta(`
    SELECT COUNT(*) AS total, SUM(CASE WHEN EsFavorita = 1 THEN 1 ELSE 0 END) AS favoritas
    FROM Dietas WHERE UsuarioId = @usuarioId
  `, { usuarioId });

  const historial = await ejecutarConsulta(`
    SELECT FechaCreacion, CaloriasTotales, PresupuestoEstimado, Objetivo
    FROM Dietas WHERE UsuarioId = @usuarioId
    ORDER BY FechaCreacion DESC
    LIMIT 10
  `, { usuarioId });

  return {
    tarjetas: {
      totalDietas: dietas.recordset[0].total || 0,
      favoritas: dietas.recordset[0].favoritas || 0
    },
    historialCalorias: historial.recordset
  };
}

export default {
  guardarDietaCompleta,
  obtenerHistorialDietas,
  obtenerDietaPorId,
  eliminarDieta,
  marcarFavorita,
  marcarItemListaCompra,
  duplicarDieta,
  obtenerEstadisticasAdmin,
  obtenerEstadisticasUsuario
};
