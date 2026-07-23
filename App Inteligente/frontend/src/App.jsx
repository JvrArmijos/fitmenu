import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ProveedorTema } from './contextos/contextoTema.jsx';
import { ProveedorAutenticacion } from './contextos/contextoAutenticacion.jsx';
import RutasApp from './rutas/rutasApp.jsx';
import ErrorBoundary from './componentes/ErrorBoundary.jsx';

export const App = () => {
  return (
    <BrowserRouter>
      <ProveedorTema>
        <ProveedorAutenticacion>
          <ErrorBoundary>
            <RutasApp />
          </ErrorBoundary>
        </ProveedorAutenticacion>
      </ProveedorTema>
    </BrowserRouter>
  );
};

export default App;
