import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Button, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAutenticacion } from '../contextos/contextoAutenticacion.jsx';
import { useTemaPersonalizado } from '../contextos/contextoTema.jsx';
import { useNavigate } from 'react-router-dom';

export const BarraNavegacion = ({ alAlternarMenu }) => {
  const theme = useTheme();
  const { usuario, cerrarSesion } = useAutenticacion();
  const { modo, alternarTema } = useTemaPersonalizado();
  const navigate = useNavigate();

  const manejarCerrarSesion = () => {
    cerrarSesion();
    navigate('/login');
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="abrir menu lateral"
          edge="start"
          onClick={alAlternarMenu}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
            FitMenu
          </Typography>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 300, color: theme.palette.text.primary, ml: 0.5 }}>
            Local
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => alternarTema()} color="inherit">
            {modo === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {usuario && (
            <>
              <Button
                color="inherit"
                startIcon={<AccountCircleIcon />}
                onClick={() => navigate('/perfil')}
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                {usuario.nombreCompleto.split(' ')[0]}
              </Button>
              <IconButton
                color="error"
                onClick={manejarCerrarSesion}
                aria-label="cerrar sesion"
                sx={{ ml: 1 }}
              >
                <ExitToAppIcon />
              </IconButton>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default BarraNavegacion;
