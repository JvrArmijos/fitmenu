import servicioUsuarios from '../servicios/servicioUsuarios.js';
import { validarPerfilNutricional } from '../validaciones/validacionUsuario.js';

export async function obtenerMiPerfil(req, res, next) {
  try {
    const usuarioId = req.usuario.usuarioId;
    const perfil = await servicioUsuarios.obtenerPerfil(usuarioId);
    
    return res.status(200).json({
      ok: true,
      datos: perfil
    });
  } catch (err) {
    next(err);
  }
}

export async function actualizarMiPerfil(req, res, next) {
  try {
    const usuarioId = req.usuario.usuarioId;
    const { nombreCompleto, email } = req.body;

    if (!nombreCompleto || !email) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El nombre completo y correo electrónico son requeridos.'
      });
    }

    const perfilActualizado = await servicioUsuarios.actualizarPerfil(usuarioId, nombreCompleto, email);

    return res.status(200).json({
      ok: true,
      mensaje: 'Perfil actualizado con éxito.',
      datos: perfilActualizado
    });
  } catch (err) {
    next(err);
  }
}

export async function cambiarMiContrasena(req, res, next) {
  try {
    const usuarioId = req.usuario.usuarioId;
    const { contrasenaActual, nuevaContrasena } = req.body;

    if (!contrasenaActual || !nuevaContrasena) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Debe proporcionar la contraseña actual y la nueva contraseña.'
      });
    }

    if (nuevaContrasena.length < 6) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La nueva contraseña debe tener al menos 6 caracteres.'
      });
    }

    await servicioUsuarios.cambiarContrasena(usuarioId, contrasenaActual, nuevaContrasena);

    return res.status(200).json({
      ok: true,
      mensaje: 'Contraseña actualizada correctamente.'
    });
  } catch (err) {
    if (err.message.includes('incorrecta')) {
      return res.status(400).json({
        ok: false,
        mensaje: err.message
      });
    }
    next(err);
  }
}

export async function eliminarMiCuenta(req, res, next) {
  try {
    const usuarioId = req.usuario.usuarioId;
    await servicioUsuarios.eliminarCuenta(usuarioId);

    return res.status(200).json({
      ok: true,
      mensaje: 'Su cuenta ha sido eliminada permanentemente del sistema.'
    });
  } catch (err) {
    next(err);
  }
}

export async function guardarMiPerfilNutricional(req, res, next) {
  try {
    const usuarioId = req.usuario.usuarioId;
    const validacion = validarPerfilNutricional(req.body);
    if (!validacion.esValido) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Datos del perfil nutricional inválidos.',
        errores: validacion.errores
      });
    }

    const resultado = await servicioUsuarios.guardarPerfilNutricional(usuarioId, req.body);

    return res.status(200).json({
      ok: true,
      mensaje: 'Perfil nutricional y restricciones actualizados con éxito.',
      datos: resultado
    });
  } catch (err) {
    next(err);
  }
}

export async function guardarConfiguracionTema(req, res, next) {
  try {
    const usuarioId = req.usuario.usuarioId;
    const { modoOscuro } = req.body;

    if (modoOscuro === undefined) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Debe especificar el valor para modoOscuro.'
      });
    }

    const configuracion = await servicioUsuarios.actualizarConfiguracion(usuarioId, modoOscuro);

    return res.status(200).json({
      ok: true,
      mensaje: 'Configuración de tema guardada.',
      datos: configuracion
    });
  } catch (err) {
    next(err);
  }
}

export async function consultarAsistente(req, res, next) {
  try {
    const usuarioId = req.usuario.usuarioId;
    const { mensaje } = req.body;

    if (!mensaje) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Debe proporcionar un mensaje para el asistente.'
      });
    }

    const respuesta = await servicioUsuarios.consultarAsistente(usuarioId, mensaje);

    return res.status(200).json({
      ok: true,
      datos: { respuesta }
    });
  } catch (err) {
    next(err);
  }
}

export default {
  obtenerMiPerfil,
  actualizarMiPerfil,
  cambiarMiContrasena,
  eliminarMiCuenta,
  guardarMiPerfilNutricional,
  guardarConfiguracionTema,
  consultarAsistente
};
