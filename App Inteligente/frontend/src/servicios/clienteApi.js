import axios from 'axios';

const clienteApi = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para inyectar automáticamente el token JWT en cada petición
clienteApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fitmenu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar desautenticación automática si el token expira (401)
clienteApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('fitmenu_token');
      localStorage.removeItem('fitmenu_usuario');
      // Redirigir al login si no estamos ya en él
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?sesion=expirada';
      }
    }
    return Promise.reject(error);
  }
);

export default clienteApi;
