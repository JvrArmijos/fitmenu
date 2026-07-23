import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAutenticacion } from '../contextos/contextoAutenticacion.jsx';
import { CircularProgress, Box } from '@mui/material';

/**
 * Guard para rutas que requieren estar autenticado.
 * @param {string} rolRequerido - Rol opcional que se requiere para acceder (ej: 'Administrador')
 */
export const RutasProtegidas = ({ rolRequerido }) => {
  const { usuario, cargando } = useAutenticacion();

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (rolRequerido && usuario.rol !== rolRequerido) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RutasProtegidas;
