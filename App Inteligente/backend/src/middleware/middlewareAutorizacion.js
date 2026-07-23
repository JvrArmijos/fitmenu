/**
 * Middleware para restringir acceso según el rol del usuario.
 * @param {...string} rolesPermitidos - Lista de roles que tienen permiso. Ej: 'Administrador'
 */
export function requiereRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        ok: false,
        mensaje: 'No autenticado. Se requiere inicio de sesión.'
      });
    }

    const tieneRol = rolesPermitidos.includes(req.usuario.rol);
    if (!tieneRol) {
      return res.status(403).json({
        ok: false,
        mensaje: 'Acceso prohibido. No tienes permisos para realizar esta acción.'
      });
    }

    next();
  };
}
