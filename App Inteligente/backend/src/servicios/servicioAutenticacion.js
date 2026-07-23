import repositorioUsuarios from '../repositorios/repositorioUsuarios.js';
import { cifrarContrasena, compararContrasena } from '../helpers/helperContrasena.js';
import { generarToken } from '../helpers/helperToken.js';
import { ejecutarConsulta } from '../configuracion/conexionBaseDatos.js';

export async function registrar(nombreCompleto, email, contrasena) {
  // 1. Verificar si el correo ya existe
  const usuarioExistente = await repositorioUsuarios.buscarPorEmail(email);
  if (usuarioExistente) {
    throw new Error('El correo electrónico ya se encuentra registrado.');
  }

  // 2. Cifrar contraseña
  const contrasenaHash = await cifrarContrasena(contrasena);

  // 3. Crear usuario (rol Cliente = 2 por defecto)
  const nuevoUsuario = await repositorioUsuarios.crearUsuario(nombreCompleto, email, contrasenaHash, 2);

  // 4. Crear configuración por defecto (Modo Claro) y registrar en Historial
  await ejecutarConsulta(
    `INSERT INTO ConfiguracionUsuario (UsuarioId, ModoOscuro) VALUES (@usuarioId, 0)`,
    { usuarioId: nuevoUsuario.UsuarioId }
  );

  await ejecutarConsulta(
    `INSERT INTO HistorialConsultas (UsuarioId, Accion, Detalle) VALUES (@usuarioId, 'Registro', 'Creación de cuenta de usuario.')`,
    { usuarioId: nuevoUsuario.UsuarioId }
  );

  return {
    usuarioId: nuevoUsuario.UsuarioId,
    nombreCompleto: nuevoUsuario.NombreCompleto,
    email: nuevoUsuario.Email,
    rolId: nuevoUsuario.RolId
  };
}

export async function iniciarSesion(email, contrasena) {
  // 1. Buscar usuario por email
  const usuario = await repositorioUsuarios.buscarPorEmail(email);
  if (!usuario) {
    throw new Error('El correo electrónico o la contraseña son incorrectos.');
  }

  // 2. Verificar contraseña
  const contrasenaValida = await compararContrasena(contrasena, usuario.ContrasenaHash);
  if (!contrasenaValida) {
    throw new Error('El correo electrónico o la contraseña son incorrectos.');
  }

  // 3. Obtener configuración de usuario (Modo Oscuro/Claro)
  const resConfig = await ejecutarConsulta(
    `SELECT ModoOscuro FROM ConfiguracionUsuario WHERE UsuarioId = @usuarioId`,
    { usuarioId: usuario.UsuarioId }
  );
  const modoOscuro = resConfig.recordset[0]?.ModoOscuro === true;

  // 4. Generar Token JWT
  const token = generarToken({
    usuarioId: usuario.UsuarioId,
    email: usuario.Email,
    rol: usuario.Rol,
    rolId: usuario.RolId
  });

  // Registrar inicio de sesión en historial
  await ejecutarConsulta(
    `INSERT INTO HistorialConsultas (UsuarioId, Accion, Detalle) VALUES (@usuarioId, 'Inicio de Sesion', 'Sesión iniciada con éxito.')`,
    { usuarioId: usuario.UsuarioId }
  );

  return {
    token,
    usuario: {
      usuarioId: usuario.UsuarioId,
      nombreCompleto: usuario.NombreCompleto,
      email: usuario.Email,
      rol: usuario.Rol,
      rolId: usuario.RolId,
      modoOscuro
    }
  };
}

export default {
  registrar,
  iniciarSesion
};
