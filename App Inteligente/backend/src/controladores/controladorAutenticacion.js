import servicioAutenticacion from '../servicios/servicioAutenticacion.js';
import { validarRegistro, validarLogin } from '../validaciones/validacionUsuario.js';

export async function registrarUsuario(req, res, next) {
  try {
    const validacion = validarRegistro(req.body);
    if (!validacion.esValido) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Datos de registro inválidos.',
        errores: validacion.errores
      });
    }

    const { nombreCompleto, email, contrasena } = req.body;
    const resultado = await servicioAutenticacion.registrar(nombreCompleto, email, contrasena);

    return res.status(201).json({
      ok: true,
      mensaje: 'Usuario registrado con éxito.',
      datos: resultado
    });
  } catch (err) {
    next(err);
  }
}

export async function iniciarSesionUsuario(req, res, next) {
  try {
    const validacion = validarLogin(req.body);
    if (!validacion.esValido) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Campos requeridos faltantes o inválidos.',
        errores: validacion.errores
      });
    }

    const { email, contrasena } = req.body;
    const resultado = await servicioAutenticacion.iniciarSesion(email, contrasena);

    return res.status(200).json({
      ok: true,
      mensaje: 'Sesión iniciada con éxito.',
      ...resultado
    });
  } catch (err) {
    // Si es error de credenciales incorrectas, respondemos con 401 en lugar de 500
    if (err.message.includes('incorrectos')) {
      return res.status(401).json({
        ok: false,
        mensaje: err.message
      });
    }
    next(err);
  }
}

export default {
  registrarUsuario,
  iniciarSesionUsuario
};
