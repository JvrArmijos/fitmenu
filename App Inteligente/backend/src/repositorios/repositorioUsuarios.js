import { ejecutarConsulta } from '../configuracion/conexionBaseDatos.js';

export async function buscarPorEmail(email) {
  const query = `
    SELECT u.*, r.Nombre AS Rol
    FROM Usuarios u
    INNER JOIN Roles r ON u.RolId = r.RolId
    WHERE u.Email = @email AND u.Activo = 1
  `;
  const resultado = await ejecutarConsulta(query, { email });
  return resultado.recordset[0] || null;
}

export async function buscarPorId(usuarioId) {
  const query = `
    SELECT u.UsuarioId, u.NombreCompleto, u.Email, u.RolId, r.Nombre AS Rol, u.FechaRegistro
    FROM Usuarios u
    INNER JOIN Roles r ON u.RolId = r.RolId
    WHERE u.UsuarioId = @usuarioId AND u.Activo = 1
  `;
  const resultado = await ejecutarConsulta(query, { usuarioId });
  return resultado.recordset[0] || null;
}

export async function crearUsuario(nombreCompleto, email, contrasenaHash, rolId = 2) {
  // rolId = 2 es Cliente por defecto
  const query = `
    INSERT INTO Usuarios (NombreCompleto, Email, ContrasenaHash, RolId, Activo)
    VALUES (@nombreCompleto, @email, @contrasenaHash, @rolId, 1)
    RETURNING UsuarioId, NombreCompleto, Email, RolId, FechaRegistro
  `;
  const resultado = await ejecutarConsulta(query, { nombreCompleto, email, contrasenaHash, rolId });
  return resultado.recordset[0];
}

export async function actualizarPerfil(usuarioId, nombreCompleto, email) {
  const query = `
    UPDATE Usuarios
    SET NombreCompleto = @nombreCompleto, Email = @email
    WHERE UsuarioId = @usuarioId AND Activo = 1
  `;
  await ejecutarConsulta(query, { usuarioId, nombreCompleto, email });
  return true;
}

export async function actualizarContrasena(usuarioId, contrasenaHash) {
  const query = `
    UPDATE Usuarios
    SET ContrasenaHash = @contrasenaHash
    WHERE UsuarioId = @usuarioId AND Activo = 1
  `;
  await ejecutarConsulta(query, { usuarioId, contrasenaHash });
  return true;
}

export async function eliminarUsuario(usuarioId) {
  const query = `
    UPDATE Usuarios
    SET Activo = 0
    WHERE UsuarioId = @usuarioId
  `;
  await ejecutarConsulta(query, { usuarioId });
  return true;
}

// --- PERFIL NUTRICIONAL Y RESTRICCIONES ---

export async function obtenerInformacionNutricional(usuarioId) {
  const query = `
    SELECT 
      inuf.*,
      p.Nombre AS Parroquia,
      c.CantonId,
      c.Nombre AS Canton,
      pr.ProvinciaId,
      pr.Nombre AS Provincia,
      reg.RegionId,
      reg.Nombre AS Region,
      obj.Nombre AS ObjetivoNombre
    FROM InformacionNutricional inuf
    INNER JOIN Parroquias p ON inuf.ParroquiaId = p.ParroquiaId
    INNER JOIN Cantones c ON p.CantonId = c.CantonId
    INNER JOIN Provincias pr ON c.ProvinciaId = pr.ProvinciaId
    INNER JOIN Regiones reg ON pr.RegionId = reg.RegionId
    INNER JOIN ObjetivosNutricionales obj ON inuf.ObjetivoNutricionalId = obj.ObjetivoId
    WHERE inuf.UsuarioId = @usuarioId
  `;
  const resultado = await ejecutarConsulta(query, { usuarioId });
  return resultado.recordset[0] || null;
}

export async function guardarInformacionNutricional(usuarioId, datos) {
  const { edad, sexo, pesoKg, alturaCm, nivelActividad, imc, objetivoNutricionalId, presupuestoDiario, parroquiaId } = datos;
  
  const query = `
    INSERT INTO InformacionNutricional (UsuarioId, Edad, Sexo, PesoKg, AlturaCm, NivelActividad, IMC, ObjetivoNutricionalId, PresupuestoDiario, ParroquiaId, FechaActualizacion)
    VALUES (@usuarioId, @edad, @sexo, @pesoKg, @alturaCm, @nivelActividad, @imc, @objetivoNutricionalId, @presupuestoDiario, @parroquiaId, CURRENT_TIMESTAMP)
    ON CONFLICT(UsuarioId) DO UPDATE SET
      Edad = excluded.Edad,
      Sexo = excluded.Sexo,
      PesoKg = excluded.PesoKg,
      AlturaCm = excluded.AlturaCm,
      NivelActividad = excluded.NivelActividad,
      IMC = excluded.IMC,
      ObjetivoNutricionalId = excluded.ObjetivoNutricionalId,
      PresupuestoDiario = excluded.PresupuestoDiario,
      ParroquiaId = excluded.ParroquiaId,
      FechaActualizacion = CURRENT_TIMESTAMP
  `;
  
  await ejecutarConsulta(query, {
    usuarioId,
    edad,
    sexo,
    pesoKg,
    alturaCm,
    nivelActividad,
    imc,
    objetivoNutricionalId,
    presupuestoDiario,
    parroquiaId
  });
  
  return await obtenerInformacionNutricional(usuarioId);
}

export async function obtenerRestriccionesUsuario(usuarioId) {
  const query = `
    SELECT ae.*
    FROM RestriccionesUsuario ru
    INNER JOIN AlergiasEnfermedades ae ON ru.RestriccionId = ae.RestriccionId
    WHERE ru.UsuarioId = @usuarioId
  `;
  const resultado = await ejecutarConsulta(query, { usuarioId });
  return resultado.recordset;
}

export async function guardarRestriccionesUsuario(usuarioId, restriccionesIds) {
  // Primero eliminamos todas las restricciones existentes
  const eliminarQuery = `DELETE FROM RestriccionesUsuario WHERE UsuarioId = @usuarioId`;
  await ejecutarConsulta(eliminarQuery, { usuarioId });

  // Luego insertamos las nuevas si existen
  if (restriccionesIds && restriccionesIds.length > 0) {
    for (const restriccionId of restriccionesIds) {
      const insertarQuery = `
        INSERT INTO RestriccionesUsuario (UsuarioId, RestriccionId)
        VALUES (@usuarioId, @restriccionId)
      `;
      await ejecutarConsulta(insertarQuery, { usuarioId, restriccionId });
    }
  }
  return await obtenerRestriccionesUsuario(usuarioId);
}

export async function obtenerAlergiasEnfermedadesCatalogo() {
  const query = `SELECT * FROM AlergiasEnfermedades ORDER BY Nombre`;
  const resultado = await ejecutarConsulta(query);
  return resultado.recordset;
}

export async function obtenerObjetivosCatalogo() {
  const query = `SELECT * FROM ObjetivosNutricionales ORDER BY Nombre`;
  const resultado = await ejecutarConsulta(query);
  return resultado.recordset;
}

export default {
  buscarPorEmail,
  buscarPorId,
  crearUsuario,
  actualizarPerfil,
  actualizarContrasena,
  eliminarUsuario,
  obtenerInformacionNutricional,
  guardarInformacionNutricional,
  obtenerRestriccionesUsuario,
  guardarRestriccionesUsuario,
  obtenerAlergiasEnfermedadesCatalogo,
  obtenerObjetivosCatalogo
};
