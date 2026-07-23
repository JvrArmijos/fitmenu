# FitMenu Local 🇪🇨 - Planificación Alimentaria Regional Inteligente

FitMenu Local es una solución web profesional y lista para producción diseñada para democratizar el acceso a la nutrición saludable en el Ecuador. A diferencia de las aplicaciones convencionales que sugieren ingredientes costosos o importados (ej. salmón, arándanos, espárragos o kale), FitMenu Local emplea Inteligencia Artificial (Google Gemini) para diseñar menús nutricionales diarios utilizando exclusivamente alimentos locales, típicos y de temporada según la provincia, cantón y parroquia del usuario, ajustándose estrictamente a su presupuesto y restricciones médicas.

---

## Arquitectura del Sistema (Clean Architecture)

El proyecto está diseñado bajo una arquitectura limpia y desacoplada organizada por responsabilidades en español:

### Estructura de Directorios

```
/
├── baseDatos/
│   └── script_creacion.sql     # Script SQL completo de base de datos
├── backend/
│   ├── src/
│   │   ├── configuracion/      # Carga de entorno y pool de SQL Server
│   │   ├── controladores/      # Control de peticiones HTTP
│   │   ├── rutas/              # Enrutamiento de la API (/api/v1/)
│   │   ├── servicios/          # Lógica de negocio y orquestación
│   │   ├── repositorios/       # Capa de acceso a datos mediante SQL directo
│   │   ├── modelos/            # Esquemas y entidades
│   │   ├── middleware/         # Autenticación, límites de peticiones, seguridad
│   │   ├── validaciones/       # Validación de payloads entrantes
│   │   ├── helpers/            # Cifrado de claves y tokens JWT
│   │   ├── utilidades/         # logs y exportación (PDF / Excel)
│   │   └── ia/                 # Integración de la API de Google Gemini
│   ├── app.js                  # Configuración y middleware de Express
│   ├── servidor.js             # Punto de entrada HTTP y base de datos
│   └── package.json
└── frontend/
    ├── src/
    │   ├── componentes/        # Componentes compartidos y reutilizables
    │   ├── paginas/            # Vistas de página completa
    │   ├── layouts/            # Layouts estructurados (Autenticación/Principal)
    │   ├── servicios/          # Clientes Axios de API
    │   ├── contextos/          # Contextos de Autenticación y Temas
    │   ├── rutas/              # Configuración de React Router y guards de seguridad
    │   ├── estilos/            # Definición del tema de Material UI (MUI)
    │   ├── App.jsx             # Componente raíz
    │   └── main.jsx            # Entrada React
    └── package.json
```

---

## Tecnologías Utilizadas

### Backend
- **Node.js** con soporte nativo para **ES Modules**.
- **Express.js** como framework web de API REST.
- **SQL Server (mssql)** para conexión directa sin ORMs.
- **jsonwebtoken (JWT)** para autenticación de sesiones.
- **bcrypt** para cifrado seguro de contraseñas.
- **Google Gemini API (@google/generative-ai)** para generación inteligente de planes en formato JSON.
- **Helmet & CORS** para seguridad HTTP y control de recursos cruzados.
- **express-rate-limit** para mitigar ataques de denegación de servicios.
- **pdfkit** y **xlsx** para exportación y descarga de archivos.

### Frontend
- **React 18** inicializado mediante **Vite**.
- **Material UI (MUI)** para el diseño de componentes visuales premium responsivos.
- **React Router DOM v6** para enrutamiento seguro y guards de perfiles.
- **Axios** para comunicación asíncrona con la API del backend.

---

## Configuración y Variables de Entorno

### Base de Datos (SQL Server)
1. Instale y levante su instancia local o nube de **Microsoft SQL Server**.
2. Cree una base de datos llamada `FitMenuLocal`.
3. Ejecute el contenido del archivo `baseDatos/script_creacion.sql` dentro de su manejador de bases de datos (SQL Server Management Studio o Azure Data Studio). Este script creará todas las tablas, relaciones, índices, restricciones y sembrará los catálogos geográficos del Ecuador (provincias, cantones, parroquias) y alimentos típicos andinos y costeños.

### Configuración del Backend
1. Navegue al directorio `backend/`.
2. Cree el archivo `.env` tomando como base el archivo `.env.example`:
   ```bash
   PUERTO=5000
   NODO_ENV=development
   
   DB_USER=tu_usuario_sql # por ejemplo: sa
   DB_PASSWORD=tu_contrasena_sql
   DB_SERVER=localhost
   DB_NAME=FitMenuLocal
   DB_PORT=1433
   DB_TRUST_SERVER_CERTIFICATE=true
   DB_ENCRYPT=false
   
   JWT_SECRET=una_firma_secreta_muy_larga_y_robusta
   JWT_EXPIRACION=24h
   
   GEMINI_API_KEY=AIzaSy...TuClaveDeAPIObtenidaDeGoogleAIStudio
   ```

---

## Ejecución del Proyecto

### 1. Iniciar el Backend
Desde la raíz del proyecto, ejecute:
```bash
cd backend
npm install
npm run dev
```
El servidor backend se ejecutará en `http://localhost:5000` y cargará el pool de conexiones de SQL Server.

### 2. Iniciar el Frontend
En otra ventana de la terminal, ejecute:
```bash
cd frontend
npm install
npm run dev
```
La aplicación React se compilará y abrirá automáticamente en tu navegador predeterminado bajo el puerto `http://localhost:3000`.

---

## Despliegue en la Nube

### Backend en Render (Node.js Web Service)
1. Conecte su repositorio GitHub a **Render.com**.
2. Cree un **Web Service**.
3. Seleccione el subdirectorio de compilación estableciendo **Root Directory** como `backend`.
4. Defina el **Build Command** como: `npm install`
5. Defina el **Start Command** como: `npm start`
6. En la pestaña **Environment**, agregue las variables declaradas en el `.env` (incluyendo su conexión a SQL Server remota y su `GEMINI_API_KEY`).

### Frontend en Vercel (React SPA)
1. Conecte su repositorio GitHub a **Vercel.com**.
2. Agregue un nuevo proyecto y seleccione la subcarpeta `frontend` para el despliegue.
3. Configure los comandos:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Despliegue. Vercel creará una URL segura HTTPS que ejecutará tu interfaz de React.

---
*Desarrollado bajo principios SOLID, Arquitectura Limpia y buenas prácticas de desarrollo de software para el Ecuador.*


juan@fitmenu.local
Cliente123*