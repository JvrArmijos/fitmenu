import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import BarraNavegacion from '../componentes/barraNavegacion.jsx';
import BarraLateral from '../componentes/barraLateral.jsx';
import ChatBot from '../componentes/ChatBot.jsx';

const anchoDrawer = 240;

export const LayoutPrincipal = () => {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const manejarAlternarMenu = () => {
    setMenuMovilAbierto(!menuMovilAbierto);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Barra superior de navegación */}
      <BarraNavegacion alAlternarMenu={manejarAlternarMenu} />

      {/* Menú lateral (Sidebar) */}
      <BarraLateral mobileOpen={menuMovilAbierto} alAlternarMenu={manejarAlternarMenu} />

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${anchoDrawer}px)` },
          backgroundColor: 'background.default',
          transition: 'background-color 0.3s ease'
        }}
      >
        {/* Espaciador de la barra superior */}
        <Toolbar />
        
        {/* Renderiza las páginas secundarias de la ruta */}
        <Outlet />

        {/* Asistente Virtual Flotante */}
        <ChatBot />
      </Box>
    </Box>
  );
};

export default LayoutPrincipal;
