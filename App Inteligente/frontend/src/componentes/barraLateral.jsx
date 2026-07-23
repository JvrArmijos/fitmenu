import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, Divider, Typography } from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import CalculateIcon from '@mui/icons-material/Calculate';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AppleIcon from '@mui/icons-material/Apple';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAutenticacion } from '../contextos/contextoAutenticacion.jsx';

const anchoDrawer = 240;

export const BarraLateral = ({ mobileOpen, alAlternarMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAutenticacion();

  const esAdministrador = usuario?.rol === 'Administrador';

  const menuClientes = [
    { texto: 'Inicio', ruta: '/', icono: <HomeIcon /> },
    { texto: 'Generar Dieta', ruta: '/generar-dieta', icono: <RestaurantMenuIcon /> },
    { texto: 'Historial', ruta: '/historial', icono: <HistoryIcon /> },
    { texto: 'Perfil Nutricional', ruta: '/perfil', icono: <PersonIcon /> },
    { texto: 'Calculadoras', ruta: '/calculadoras', icono: <CalculateIcon /> },
  ];

  const menuAdmin = [
    { texto: 'Inicio', ruta: '/', icono: <HomeIcon /> },
    { texto: 'Dashboard Global', ruta: '/dashboard', icono: <DashboardIcon /> },
    { texto: 'Catálogo de Alimentos', ruta: '/alimentos', icono: <AppleIcon /> },
    { texto: 'Mi Perfil', ruta: '/perfil', icono: <PersonIcon /> },
  ];

  const menuActual = esAdministrador ? menuAdmin : menuClientes;

  const renderizarMenu = (
    <Box>
      <Toolbar />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700 }}>
          {usuario?.rol.toUpperCase()}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {usuario?.nombreCompleto}
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuActual.map((item) => {
          const seleccionado = location.pathname === item.ruta;
          return (
            <ListItem key={item.texto} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.ruta);
                  if (mobileOpen) alAlternarMenu();
                }}
                selected={seleccionado}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  my: 0.2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                    '&:hover': {
                      backgroundColor: 'primary.main',
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ color: seleccionado ? 'inherit' : 'text.secondary', minWidth: 40 }}>
                  {item.icono}
                </ListItemIcon>
                <ListItemText primary={item.texto} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: anchoDrawer }, flexShrink: { sm: 0 } }}
      aria-label="opciones de navegacion"
    >
      {/* Drawer Móvil */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={alAlternarMenu}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: anchoDrawer },
        }}
      >
        {renderizarMenu}
      </Drawer>

      {/* Drawer Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: anchoDrawer },
        }}
        open
      >
        {renderizarMenu}
      </Drawer>
    </Box>
  );
};

export default BarraLateral;
