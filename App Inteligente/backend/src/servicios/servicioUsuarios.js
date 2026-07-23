import repositorioUsuarios from '../repositorios/repositorioUsuarios.js';
import { cifrarContrasena, compararContrasena } from '../helpers/helperContrasena.js';
import { ejecutarConsulta } from '../configuracion/conexionBaseDatos.js';
import servicioGemini from '../ia/servicioGemini.js';

export async function obtenerPerfil(usuarioId) {
  const usuario = await repositorioUsuarios.buscarPorId(usuarioId);
  if (!usuario) {
    throw new Error('Usuario no encontrado.');
  }

  const infoNutricional = await repositorioUsuarios.obtenerInformacionNutricional(usuarioId);
  const restricciones = await repositorioUsuarios.obtenerRestriccionesUsuario(usuarioId);

  return {
    ...usuario,
    perfilNutricional: infoNutricional,
    restricciones
  };
}

export async function actualizarPerfil(usuarioId, nombreCompleto, email) {
  // Verificar si el email ya está en uso por otro usuario
  const usuarioExistente = await repositorioUsuarios.buscarPorEmail(email);
  if (usuarioExistente && usuarioExistente.UsuarioId !== usuarioId) {
    throw new Error('El correo electrónico ya está en uso por otro usuario.');
  }

  await repositorioUsuarios.actualizarPerfil(usuarioId, nombreCompleto, email);
  
  await ejecutarConsulta(
    `INSERT INTO HistorialConsultas (UsuarioId, Accion, Detalle) VALUES (@usuarioId, 'Actualizar perfil', 'Datos personales actualizados.')`,
    { usuarioId }
  );

  return obtenerPerfil(usuarioId);
}

export async function cambiarContrasena(usuarioId, contrasenaActual, nuevaContrasena) {
  const usuario = await ejecutarConsulta(`SELECT ContrasenaHash FROM Usuarios WHERE UsuarioId = @usuarioId`, { usuarioId });
  if (!usuario.recordset[0]) {
    throw new Error('Usuario no encontrado.');
  }

  const esValida = await compararContrasena(contrasenaActual, usuario.recordset[0].ContrasenaHash);
  if (!esValida) {
    throw new Error('La contraseña actual es incorrecta.');
  }

  const nuevaHash = await cifrarContrasena(nuevaContrasena);
  await repositorioUsuarios.actualizarContrasena(usuarioId, nuevaHash);

  await ejecutarConsulta(
    `INSERT INTO HistorialConsultas (UsuarioId, Accion, Detalle) VALUES (@usuarioId, 'Cambiar contraseña', 'Contraseña actualizada con éxito.')`,
    { usuarioId }
  );

  return true;
}

export async function eliminarCuenta(usuarioId) {
  await repositorioUsuarios.eliminarUsuario(usuarioId);
  
  await ejecutarConsulta(
    `INSERT INTO HistorialConsultas (UsuarioId, Accion, Detalle) VALUES (@usuarioId, 'Eliminar cuenta', 'Cuenta desactivada.')`,
    { usuarioId }
  );
  
  return true;
}

export async function guardarPerfilNutricional(usuarioId, datos) {
  // Calcular IMC: peso (kg) / (altura (m))^2
  const alturaMetros = datos.alturaCm / 100;
  const imc = parseFloat((datos.pesoKg / (alturaMetros * alturaMetros)).toFixed(2));
  
  const datosConImc = {
    ...datos,
    imc
  };

  // Guardar datos nutricionales
  const perfil = await repositorioUsuarios.guardarInformacionNutricional(usuarioId, datosConImc);

  // Guardar restricciones (alergias/enfermedades)
  const restricciones = await repositorioUsuarios.guardarRestriccionesUsuario(usuarioId, datos.restriccionesIds || []);

  await ejecutarConsulta(
    `INSERT INTO HistorialConsultas (UsuarioId, Accion, Detalle) VALUES (@usuarioId, 'Guardar perfil nutricional', 'Perfil nutricional actualizado.')`,
    { usuarioId }
  );

  return {
    perfilNutricional: perfil,
    restricciones
  };
}

export async function actualizarConfiguracion(usuarioId, modoOscuro) {
  const query = `
    IF EXISTS (SELECT 1 FROM ConfiguracionUsuario WHERE UsuarioId = @usuarioId)
      UPDATE ConfiguracionUsuario SET ModoOscuro = @modoOscuro WHERE UsuarioId = @usuarioId
    ELSE
      INSERT INTO ConfiguracionUsuario (UsuarioId, ModoOscuro) VALUES (@usuarioId, @modoOscuro)
  `;
  await ejecutarConsulta(query, { usuarioId, modoOscuro: modoOscuro ? 1 : 0 });
  return { modoOscuro };
}

export async function consultarAsistente(usuarioId, mensaje) {
  const perfil = await obtenerPerfil(usuarioId);
  const perfilNutricionalCompleto = perfil.perfilNutricional ? {
    ...perfil.perfilNutricional,
    NombreCompleto: perfil.NombreCompleto,
    restricciones: perfil.restricciones
  } : {
    NombreCompleto: perfil.NombreCompleto,
    restricciones: perfil.restricciones
  };
  return await servicioGemini.consultarChatbot(mensaje, perfilNutricionalCompleto);
}

export default {
  obtenerPerfil,
  actualizarPerfil,
  cambiarContrasena,
  eliminarCuenta,
  guardarPerfilNutricional,
  actualizarConfiguracion,
  consultarAsistente
};
