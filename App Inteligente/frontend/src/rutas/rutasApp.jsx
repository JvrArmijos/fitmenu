import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LayoutPrincipal from '../layouts/layoutPrincipal.jsx';
import LayoutAutenticacion from '../layouts/layoutAutenticacion.jsx';
import RutasProtegidas from './rutasProtegidas.jsx';

// Importar Páginas
import PaginaInicio from '../paginas/paginaInicio.jsx';
import PaginaLogin from '../paginas/paginaLogin.jsx';
import PaginaRegistro from '../paginas/paginaRegistro.jsx';
import PaginaPerfil from '../paginas/paginaPerfil.jsx';
import PaginaCalculadoras from '../paginas/paginaCalculadoras.jsx';
import PaginaGeneradorDietas from '../paginas/paginaGeneradorDietas.jsx';
import PaginaDetalleDieta from '../paginas/paginaDetalleDieta.jsx';
import PaginaHistorial from '../paginas/paginaHistorial.jsx';
import PaginaDashboard from '../paginas/paginaDashboard.jsx';
import PaginaCatalogoAlimentos from '../paginas/paginaCatalogoAlimentos.jsx';
import PaginaNoEncontrada from '../paginas/paginaNoEncontrada.jsx';

export const RutasApp = () => {
  return (
    <Routes>
      {/* 1. RUTA PÚBLICA PRINCIPAL (LANDING) */}
      <Route element={<LayoutPrincipal />}>
        <Route path="/" element={<PaginaInicio />} />
      </Route>

      {/* 2. RUTAS PÚBLICAS DE AUTENTICACIÓN (LOGIN / REGISTRO) */}
      <Route element={<LayoutAutenticacion />}>
        <Route path="/login" element={<PaginaLogin />} />
        <Route path="/registro" element={<PaginaRegistro />} />
      </Route>

      {/* 3. RUTAS PROTEGIDAS PARA CLIENTES (NIVEL DE ACCESO AUTENTICADO) */}
      <Route element={<RutasProtegidas />}>
        <Route element={<LayoutPrincipal />}>
          <Route path="/generar-dieta" element={<PaginaGeneradorDietas />} />
          <Route path="/dieta/:id" element={<PaginaDetalleDieta />} />
          <Route path="/historial" element={<PaginaHistorial />} />
          <Route path="/perfil" element={<PaginaPerfil />} />
          <Route path="/calculadoras" element={<PaginaCalculadoras />} />
        </Route>
      </Route>

      {/* 4. RUTAS PROTEGIDAS PARA ADMINISTRADORES */}
      <Route element={<RutasProtegidas rolRequerido="Administrador" />}>
        <Route element={<LayoutPrincipal />}>
          <Route path="/dashboard" element={<PaginaDashboard />} />
          <Route path="/alimentos" element={<PaginaCatalogoAlimentos />} />
        </Route>
      </Route>

      {/* 5. CAPTURA DE ERROR 404 */}
      <Route element={<LayoutPrincipal />}>
        <Route path="/404" element={<PaginaNoEncontrada />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
};

export default RutasApp;
