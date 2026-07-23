import app from './src/app.js';
import { CONFIG } from './src/configuracion/variablesEntorno.js';
import { conectarBaseDatos } from './src/configuracion/conexionBaseDatos.js';
import logs from './src/utilidades/logs.js';

const PUERTO = CONFIG.puerto;

async function iniciarServidor() {
  try {
    // 1. Probar y abrir el pool de conexiones a SQL Server antes de escuchar peticiones
    await conectarBaseDatos();

    // 2. Iniciar el servidor HTTP
    app.listen(PUERTO, () => {
      logs.info(`Servidor escuchando peticiones en el puerto http://localhost:${PUERTO}`);
      logs.info(`Entorno actual de ejecución: ${CONFIG.entorno}`);
    });
  } catch (err) {
    logs.error('Fallo crítico al inicializar el servidor. Deteniendo ejecución.', err);
    process.exit(1);
  }
}

// Escuchar señales de terminación para cerrar conexiones limpiamente
process.on('SIGINT', async () => {
  logs.advertencia('Señal de terminación recibida. Cerrando servidor...');
  process.exit(0);
});

iniciarServidor();
