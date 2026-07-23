import { obtenerCantones, obtenerProvincias, obtenerParroquias } from './src/repositorios/repositorioUbicaciones.js';
import { conectarBaseDatos } from './src/configuracion/conexionBaseDatos.js';

async function test() {
  conectarBaseDatos();
  
  console.log("--- PROVINCIAS ---");
  const provs = await obtenerProvincias();
  console.log(provs.slice(0, 5));

  console.log("--- CANTONES PARA PROVINCIA '1' ---");
  const cantones1 = await obtenerCantones('1');
  console.log(cantones1);

  console.log("--- CANTONES PARA PROVINCIA 1 (Number) ---");
  const cantones1Num = await obtenerCantones(1);
  console.log(cantones1Num);

  console.log("--- CANTONES PARA PROVINCIA '2' (Guayas) ---");
  const cantones2 = await obtenerCantones('2');
  console.log(cantones2);

  console.log("--- CANTONES PARA PROVINCIA 2 (Number) ---");
  const cantones2Num = await obtenerCantones(2);
  console.log(cantones2Num);

  process.exit(0);
}

test();
