import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { CONFIG } from './variablesEntorno.js';
import logs from '../utilidades/logs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(CONFIG.db.rutaBaseDatos);

let db = null;
let initPromise = null;

// Adaptar script de SQL Server a SQLite
function adaptarSqlParaSQLite(sqlOriginal) {
  let sql = sqlOriginal;

  // 1. Eliminar bloques de creación de base de datos SQL Server
  sql = sql.replace(/IF NOT EXISTS\s*\(\s*SELECT\s+name\s+FROM\s+sys\.databases[\s\S]+?END/gi, '');
  
  // 2. Eliminar "USE FitMenuLocal;" y "GO"
  sql = sql.replace(/USE\s+\w+;\s*(?:GO)?/gi, '');
  sql = sql.replace(/^\s*GO\s*$/gim, '');

  // 3. Reemplazar "dbo." prefijos
  sql = sql.replace(/\bdbo\./gi, '');

  // 4. Reemplazar "IF OBJECT_ID('...', 'U') IS NOT NULL DROP TABLE ...;"
  sql = sql.replace(/IF\s+OBJECT_ID\(\s*'(?:\w+\.)?(\w+)'\s*,\s*'U'\s*\)\s+IS\s+NOT\s+NULL\s+DROP\s+TABLE\s+(?:\w+\.)?\1;?/gi, 'DROP TABLE IF EXISTS $1;');

  // 5. Traducir "INT IDENTITY(1,1) PRIMARY KEY" a "INTEGER PRIMARY KEY AUTOINCREMENT"
  sql = sql.replace(/\bINT\s+IDENTITY\s*\(\s*1\s*,\s*1\s*\)\s+PRIMARY\s+KEY\b/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');

  // 6. Reemplazar BIT a INTEGER
  sql = sql.replace(/\bBIT\s+DEFAULT\s+1\b/gi, 'INTEGER DEFAULT 1');
  sql = sql.replace(/\bBIT\s+DEFAULT\s+0\b/gi, 'INTEGER DEFAULT 0');
  
  // 7. Reemplazar GETDATE() con CURRENT_TIMESTAMP
  sql = sql.replace(/\bGETDATE\(\)/gi, 'CURRENT_TIMESTAMP');

  // 8. NVARCHAR(MAX) -> TEXT
  sql = sql.replace(/\bNVARCHAR\s*\(\s*MAX\s*\)/gi, 'TEXT');
  
  // 9. Eliminar sentencias PRINT
  sql = sql.replace(/\bPRINT\s+['"].*?['"];?/gi, '');

  return sql;
}

async function inicializarBaseDatos() {
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  logs.info(`Estableciendo conexión con la base de datos SQLite en: ${dbPath}`);
  db = new sqlite3.Database(dbPath);

  // Comprobar si las tablas ya están creadas comprobando la última tabla
  const tablasExistentes = await new Promise((resolve) => {
    db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='HistorialConsultas'",
      [],
      (err, row) => {
        if (err || !row) {
          resolve(false);
        } else {
          resolve(true);
        }
      }
    );
  });

  if (!tablasExistentes) {
    logs.info('La base de datos SQLite no está inicializada o está incompleta. Creando esquema...');
    const scriptOriginalPath = path.join(__dirname, '../../../baseDatos/script_creacion.sql');
    if (!fs.existsSync(scriptOriginalPath)) {
      throw new Error(`No se encontró el script de creación original en: ${scriptOriginalPath}`);
    }

    const sqlOriginal = fs.readFileSync(scriptOriginalPath, 'utf-8');
    const sqlAdaptado = adaptarSqlParaSQLite(sqlOriginal);

    return new Promise((resolve, reject) => {
      db.serialize(() => {
        // Habilitar claves foráneas
        db.run("PRAGMA foreign_keys = ON;");
        db.exec(sqlAdaptado, (err) => {
          if (err) {
            logs.error('Error al inicializar la base de datos SQLite:', err);
            reject(err);
          } else {
            logs.info('Base de datos SQLite inicializada y sembrada con éxito.');
            resolve();
          }
        });
      });
    });
  } else {
    // Si la base de datos ya está completamente inicializada, solo habilitar foreign keys
    return new Promise((resolve, reject) => {
      db.run("PRAGMA foreign_keys = ON;", (err) => {
        if (err) {
          logs.error('Error al habilitar claves foráneas en SQLite:', err);
          reject(err);
        } else {
          logs.info('Conexión a SQLite establecida con éxito y claves foráneas habilitadas.');
          resolve();
        }
      });
    });
  }
}

export function conectarBaseDatos() {
  if (!initPromise) {
    initPromise = inicializarBaseDatos();
  }
  return db;
}

// Mapear campos booleanos conocidos en SQLite (0/1) a booleanos JS (false/true)
const camposBooleanos = new Set(['Activo', 'Disponible', 'EsFavorita', 'Comprado', 'ModoOscuro']);

function sanitizarFilas(rows) {
  if (!rows || !Array.isArray(rows)) return rows;
  return rows.map(row => {
    const nuevoRow = { ...row };
    for (const [key, val] of Object.entries(nuevoRow)) {
      if (camposBooleanos.has(key)) {
        nuevoRow[key] = val === 1 || val === true;
      }
    }
    return nuevoRow;
  });
}

/**
 * Ejecuta una consulta SQL en SQLite.
 */
export async function ejecutarConsulta(consultaSql, parametros = {}) {
  if (!initPromise) {
    initPromise = inicializarBaseDatos();
  }
  await initPromise;

  let query = consultaSql;
  const paramsSqlite = {};

  // Mapear parámetros de @param a SQLite
  for (const [clave, valor] of Object.entries(parametros)) {
    let val = valor;
    if (typeof valor === 'boolean') {
      val = valor ? 1 : 0;
    }
    paramsSqlite[`@${clave}`] = val;
  }

  // Interceptar la consulta de UPSERT específica de ModoOscuro en servicioUsuarios.js
  if (query.trim().toUpperCase().includes('IF EXISTS') && query.toUpperCase().includes('CONFIGURACIONUSUARIO')) {
    query = `
      INSERT INTO ConfiguracionUsuario (UsuarioId, ModoOscuro)
      VALUES (@usuarioId, @modoOscuro)
      ON CONFLICT(UsuarioId) DO UPDATE SET ModoOscuro = excluded.ModoOscuro
    `;
  }

  return new Promise((resolve, reject) => {
    const queryLimpia = query.trim().toUpperCase();
    const esWrite = queryLimpia.startsWith('INSERT') || queryLimpia.startsWith('UPDATE') || queryLimpia.startsWith('DELETE');
    const tieneReturning = queryLimpia.includes('RETURNING');

    if (esWrite && !tieneReturning) {
      db.run(query, paramsSqlite, function (err) {
        if (err) {
          logs.error('Error ejecutando consulta de escritura SQL:', { query, parametros, err });
          reject(err);
        } else {
          resolve({
            recordset: [],
            rowsAffected: [this.changes],
            lastID: this.lastID
          });
        }
      });
    } else {
      db.all(query, paramsSqlite, (err, rows) => {
        if (err) {
          logs.error('Error ejecutando consulta de lectura SQL:', { query, parametros, err });
          reject(err);
        } else {
          resolve({
            recordset: sanitizarFilas(rows),
            rowsAffected: [rows ? rows.length : 0]
          });
        }
      });
    }
  });
}

export async function obtenerPool() {
  conectarBaseDatos();
  return db;
}

// Exportamos un mock de 'sql' para mantener compatibilidad si algún archivo lo importa directamente.
export const sql = {
  Int: 'INT',
  VarChar: 'VARCHAR',
  Decimal: () => 'DECIMAL',
  NVarChar: 'NVARCHAR',
  Transaction: class {
    constructor() {
      // Mock de transacción
    }
    async begin() {
      await ejecutarConsulta('BEGIN TRANSACTION');
    }
    async commit() {
      await ejecutarConsulta('COMMIT');
    }
    async rollback() {
      try {
        await ejecutarConsulta('ROLLBACK');
      } catch (e) {}
    }
  },
  Request: class {
    constructor(transaccion) {
      this.params = {};
    }
    input(name, type, value) {
      this.params[name] = value;
      return this;
    }
    async query(queryText) {
      return await ejecutarConsulta(queryText, this.params);
    }
  }
};
