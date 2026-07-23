import React, { createContext, useState, useEffect, useContext } from 'react';
import clienteApi from '../servicios/clienteApi.js';
import { useTemaPersonalizado } from './contextoTema.jsx';

const ContextoAutenticacion = createContext();

export const ProveedorAutenticacion = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const { alternarTema } = useTemaPersonalizado();

  // Cargar sesión persistida al iniciar la aplicación
  useEffect(() => {
    const cargarSesion = async () => {
      const token = localStorage.getItem('fitmenu_token');
      const usuarioGuardado = localStorage.getItem('fitmenu_usuario');
      
      if (token && usuarioGuardado) {
        try {
          const usr = JSON.parse(usuarioGuardado);
          setUsuario(usr);
          
          // Sincronizar estado actual del perfil desde el backend
          const res = await clienteApi.get('/usuarios/perfil');
          const usrActualizado = {
            usuarioId: res.data.datos.UsuarioId,
            nombreCompleto: res.data.datos.NombreCompleto,
            email: res.data.datos.Email,
            rol: res.data.datos.Rol,
            rolId: res.data.datos.RolId,
            perfilNutricional: res.data.datos.perfilNutricional,
            restricciones: res.data.datos.restricciones,
            modoOscuro: res.data.datos.modoOscuro
          };
          setUsuario(usrActualizado);
          localStorage.setItem('fitmenu_usuario', JSON.stringify(usrActualizado));
        } catch (err) {
          console.error('Error al sincronizar perfil del usuario:', err);
          // Token corrupto o expirado, limpiar
          cerrarSesion();
        }
      }
      setCargando(false);
    };

    cargarSesion();
  }, []);

  const iniciarSesion = async (email, contrasena) => {
    setCargando(true);
    try {
      const res = await clienteApi.post('/autenticacion/login', { email, contrasena });
      const { token, usuario: datosUsuario } = res.data;

      localStorage.setItem('fitmenu_token', token);
      localStorage.setItem('fitmenu_usuario', JSON.stringify(datosUsuario));
      setUsuario(datosUsuario);

      // Si el tema guardado en BD es diferente al del local, sincronizar
      const modoOscuroLocal = localStorage.getItem('fitmenu_modo_oscuro') === 'true';
      if (datosUsuario.modoOscuro !== modoOscuroLocal) {
        alternarTema(token);
      }

      return datosUsuario;
    } catch (err) {
      throw err.response?.data?.mensaje || 'Error al iniciar sesión.';
    } finally {
      setCargando(false);
    }
  };

  const registrar = async (nombreCompleto, email, contrasena) => {
    setCargando(true);
    try {
      await clienteApi.post('/autenticacion/registrar', { nombreCompleto, email, contrasena });
    } catch (err) {
      throw err.response?.data?.errores?.join('\n') || err.response?.data?.mensaje || 'Error al registrar usuario.';
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('fitmenu_token');
    localStorage.removeItem('fitmenu_usuario');
    setUsuario(null);
  };

  const actualizarPerfilPersonal = async (nombreCompleto, email) => {
    try {
      const res = await clienteApi.put('/usuarios/perfil', { nombreCompleto, email });
      const { datos } = res.data;

      const usrActualizado = {
        ...usuario,
        nombreCompleto: datos.NombreCompleto,
        email: datos.Email,
        perfilNutricional: datos.perfilNutricional,
        restricciones: datos.restricciones
      };

      setUsuario(usrActualizado);
      localStorage.setItem('fitmenu_usuario', JSON.stringify(usrActualizado));
      return usrActualizado;
    } catch (err) {
      throw err.response?.data?.mensaje || 'Error al actualizar perfil.';
    }
  };

  const guardarPerfilNutricional = async (datosPerfil) => {
    try {
      const res = await clienteApi.post('/usuarios/perfil/nutricional', datosPerfil);
      const { datos } = res.data;

      // Actualizar el estado del usuario con los datos de nutrición actualizados
      const usrActualizado = {
        ...usuario,
        perfilNutricional: datos.perfilNutricional,
        restricciones: datos.restricciones
      };

      setUsuario(usrActualizado);
      localStorage.setItem('fitmenu_usuario', JSON.stringify(usrActualizado));
      return usrActualizado;
    } catch (err) {
      throw err.response?.data?.errores?.join('\n') || err.response?.data?.mensaje || 'Error al guardar perfil nutricional.';
    }
  };

  const cambiarContrasena = async (contrasenaActual, nuevaContrasena) => {
    try {
      await clienteApi.put('/usuarios/perfil/contrasena', { contrasenaActual, nuevaContrasena });
    } catch (err) {
      throw err.response?.data?.mensaje || 'Error al cambiar contraseña.';
    }
  };

  const eliminarCuenta = async () => {
    try {
      await clienteApi.delete('/usuarios/cuenta');
      cerrarSesion();
    } catch (err) {
      throw err.response?.data?.mensaje || 'Error al eliminar cuenta.';
    }
  };

  return (
    <ContextoAutenticacion.Provider
      value={{
        usuario,
        cargando,
        iniciarSesion,
        registrar,
        cerrarSesion,
        actualizarPerfilPersonal,
        guardarPerfilNutricional,
        cambiarContrasena,
        eliminarCuenta
      }}
    >
      {children}
    </ContextoAutenticacion.Provider>
  );
};

export const useAutenticacion = () => useContext(ContextoAutenticacion);
export default ContextoAutenticacion;
