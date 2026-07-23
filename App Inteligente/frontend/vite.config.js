import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración de Vite para React y Servidor de Desarrollo
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true // Abrir el navegador automáticamente al correr dev
  }
});
