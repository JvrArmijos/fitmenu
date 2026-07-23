import React, { createContext, useState, useEffect, useContext } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import obtenerTema from '../estilos/temaMui.js';
import axios from 'axios';

const ContextoTema = createContext();

export const ProveedorTema = ({ children }) => {
  const [modo, setModo] = useState('light');

  // Recuperar preferencia de modo de LocalStorage al iniciar
  useEffect(() => {
    const modoGuardado = localStorage.getItem('fitmenu_modo_oscuro');
    if (modoGuardado) {
      setModo(modoGuardado === 'true' ? 'dark' : 'light');
    } else {
      // Verificar preferencia del sistema operativo
      const prefiereOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setModo(prefiereOscuro ? 'dark' : 'light');
    }
  }, []);

  const alternarTema = async (token = null) => {
    const nuevoModo = modo === 'light' ? 'dark' : 'light';
    setModo(nuevoModo);
    localStorage.setItem('fitmenu_modo_oscuro', (nuevoModo === 'dark').toString());

    // Si el usuario está autenticado, sincronizar con la base de datos
    const tokenSincronizar = token || localStorage.getItem('fitmenu_token');
    if (tokenSincronizar) {
      try {
        await axios.put(
          'http://localhost:5000/api/v1/usuarios/perfil/configuracion',
          { modoOscuro: nuevoModo === 'dark' },
          { headers: { Authorization: `Bearer ${tokenSincronizar}` } }
        );
      } catch (err) {
        console.error('No se pudo guardar la configuración de tema en el servidor', err);
      }
    }
  };

  const tema = obtenerTema(modo);

  return (
    <ContextoTema.Provider value={{ modo, alternarTema }}>
      <ThemeProvider theme={tema}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ContextoTema.Provider>
  );
};

export const useTemaPersonalizado = () => useContext(ContextoTema);
export default ContextoTema;
