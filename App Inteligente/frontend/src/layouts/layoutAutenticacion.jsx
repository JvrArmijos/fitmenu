import React from 'react';
import { Box, Card, useTheme } from '@mui/material';
import { Outlet, Navigate } from 'react-router-dom';
import { useAutenticacion } from '../contextos/contextoAutenticacion.jsx';

export const LayoutAutenticacion = () => {
  const theme = useTheme();
  const { usuario } = useAutenticacion();

  // Si ya hay sesión iniciada, redirigir al panel correspondiente
  if (usuario) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.mode === 'light'
          ? 'linear-gradient(135deg, #E8F5E9 0%, #FFF3E0 100%)'
          : 'linear-gradient(135deg, #022C22 0%, #0F172A 100%)',
        p: 2
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 450,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          backdropFilter: 'blur(16px)',
          backgroundColor: theme.palette.mode === 'light' 
            ? 'rgba(255, 255, 255, 0.9)' 
            : 'rgba(30, 41, 59, 0.8)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)'
        }}
      >
        <Outlet />
      </Card>
    </Box>
  );
};

export default LayoutAutenticacion;
