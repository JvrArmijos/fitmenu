-- ==========================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS FITMENU LOCAL
-- ==========================================
-- Servidor compatible: Microsoft SQL Server
-- ==========================================

-- Crear base de datos
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'FitMenuLocal')
BEGIN
    CREATE DATABASE FitMenuLocal;
END
GO

USE FitMenuLocal;
GO

-- ==========================================
-- ELIMINAR TABLAS EN ORDEN INVERSO DE RELACIÓN SI EXISTEN
-- ==========================================
IF OBJECT_ID('dbo.HistorialConsultas', 'U') IS NOT NULL DROP TABLE dbo.HistorialConsultas;
IF OBJECT_ID('dbo.ConfiguracionUsuario', 'U') IS NOT NULL DROP TABLE dbo.ConfiguracionUsuario;
IF OBJECT_ID('dbo.ListaCompras', 'U') IS NOT NULL DROP TABLE dbo.ListaCompras;
IF OBJECT_ID('dbo.Recetas', 'U') IS NOT NULL DROP TABLE dbo.Recetas;
IF OBJECT_ID('dbo.DetallePlanAlimenticio', 'U') IS NOT NULL DROP TABLE dbo.DetallePlanAlimenticio;
IF OBJECT_ID('dbo.Dietas', 'U') IS NOT NULL DROP TABLE dbo.Dietas;
IF OBJECT_ID('dbo.Alimentos', 'U') IS NOT NULL DROP TABLE dbo.Alimentos;
IF OBJECT_ID('dbo.Temporadas', 'U') IS NOT NULL DROP TABLE dbo.Temporadas;
IF OBJECT_ID('dbo.CategoriasAlimentos', 'U') IS NOT NULL DROP TABLE dbo.CategoriasAlimentos;
IF OBJECT_ID('dbo.RestriccionesUsuario', 'U') IS NOT NULL DROP TABLE dbo.RestriccionesUsuario;
IF OBJECT_ID('dbo.AlergiasEnfermedades', 'U') IS NOT NULL DROP TABLE dbo.AlergiasEnfermedades;
IF OBJECT_ID('dbo.InformacionNutricional', 'U') IS NOT NULL DROP TABLE dbo.InformacionNutricional;
IF OBJECT_ID('dbo.ObjetivosNutricionales', 'U') IS NOT NULL DROP TABLE dbo.ObjetivosNutricionales;
IF OBJECT_ID('dbo.Usuarios', 'U') IS NOT NULL DROP TABLE dbo.Usuarios;
IF OBJECT_ID('dbo.Roles', 'U') IS NOT NULL DROP TABLE dbo.Roles;
IF OBJECT_ID('dbo.Parroquias', 'U') IS NOT NULL DROP TABLE dbo.Parroquias;
IF OBJECT_ID('dbo.Cantones', 'U') IS NOT NULL DROP TABLE dbo.Cantones;
IF OBJECT_ID('dbo.Provincias', 'U') IS NOT NULL DROP TABLE dbo.Provincias;
IF OBJECT_ID('dbo.Regiones', 'U') IS NOT NULL DROP TABLE dbo.Regiones;
GO

-- ==========================================
-- CREACIÓN DE TABLAS
-- ==========================================

-- 1. Tabla Roles
CREATE TABLE dbo.Roles (
    RolId INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Tabla Regiones
CREATE TABLE dbo.Regiones (
    RegionId INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL UNIQUE
);

-- 3. Tabla Provincias
CREATE TABLE dbo.Provincias (
    ProvinciaId INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL UNIQUE,
    RegionId INT NOT NULL,
    CONSTRAINT FK_Provincias_Regiones FOREIGN KEY (RegionId) REFERENCES dbo.Regiones(RegionId)
);

-- 4. Tabla Cantones
CREATE TABLE dbo.Cantones (
    CantonId INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    ProvinciaId INT NOT NULL,
    CONSTRAINT FK_Cantones_Provincias FOREIGN KEY (ProvinciaId) REFERENCES dbo.Provincias(ProvinciaId)
);

-- 5. Tabla Parroquias
CREATE TABLE dbo.Parroquias (
    ParroquiaId INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    CantonId INT NOT NULL,
    CONSTRAINT FK_Parroquias_Cantones FOREIGN KEY (CantonId) REFERENCES dbo.Cantones(CantonId)
);

-- 6. Tabla Usuarios
CREATE TABLE dbo.Usuarios (
    UsuarioId INT IDENTITY(1,1) PRIMARY KEY,
    NombreCompleto VARCHAR(150) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE,
    ContrasenaHash VARCHAR(255) NOT NULL,
    RolId INT NOT NULL,
    FechaRegistro DATETIME DEFAULT GETDATE(),
    Activo BIT DEFAULT 1,
    CONSTRAINT FK_Usuarios_Roles FOREIGN KEY (RolId) REFERENCES dbo.Roles(RolId)
);

-- 7. Tabla ObjetivosNutricionales
CREATE TABLE dbo.ObjetivosNutricionales (
    ObjetivoId INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL UNIQUE,
    Descripcion VARCHAR(255) NULL
);

-- 8. Tabla InformacionNutricional
CREATE TABLE dbo.InformacionNutricional (
    InfoNutricionalId INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioId INT NOT NULL UNIQUE,
    Edad INT NOT NULL CONSTRAINT CK_InfoNutricional_Edad CHECK (Edad >= 0 AND Edad <= 120),
    Sexo CHAR(1) NOT NULL CONSTRAINT CK_InfoNutricional_Sexo CHECK (Sexo IN ('M', 'F')),
    PesoKg DECIMAL(5,2) NOT NULL CONSTRAINT CK_InfoNutricional_Peso CHECK (PesoKg > 0),
    AlturaCm DECIMAL(5,2) NOT NULL CONSTRAINT CK_InfoNutricional_Altura CHECK (AlturaCm > 0),
    NivelActividad VARCHAR(50) NOT NULL CONSTRAINT CK_InfoNutricional_Actividad CHECK (NivelActividad IN ('Sedentario', 'Ligero', 'Moderado', 'Activo', 'Muy Activo')),
    IMC DECIMAL(4,2) NULL,
    ObjetivoNutricionalId INT NOT NULL,
    PresupuestoDiario DECIMAL(8,2) NOT NULL CONSTRAINT CK_InfoNutricional_Presupuesto CHECK (PresupuestoDiario >= 0),
    ParroquiaId INT NOT NULL,
    FechaActualizacion DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_InfoNutricional_Usuarios FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(UsuarioId) ON DELETE CASCADE,
    CONSTRAINT FK_InfoNutricional_Objetivos FOREIGN KEY (ObjetivoNutricionalId) REFERENCES dbo.ObjetivosNutricionales(ObjetivoId),
    CONSTRAINT FK_InfoNutricional_Parroquias FOREIGN KEY (ParroquiaId) REFERENCES dbo.Parroquias(ParroquiaId)
);

-- 9. Tabla AlergiasEnfermedades
CREATE TABLE dbo.AlergiasEnfermedades (
    RestriccionId INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL UNIQUE,
    Tipo VARCHAR(20) NOT NULL CONSTRAINT CK_AlergiasEnfermedades_Tipo CHECK (Tipo IN ('Alergia', 'Enfermedad'))
);

-- 10. Tabla RestriccionesUsuario (Tabla puente)
CREATE TABLE dbo.RestriccionesUsuario (
    UsuarioId INT NOT NULL,
    RestriccionId INT NOT NULL,
    PRIMARY KEY (UsuarioId, RestriccionId),
    CONSTRAINT FK_RestriccionesUsuario_Usuarios FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(UsuarioId) ON DELETE CASCADE,
    CONSTRAINT FK_RestriccionesUsuario_Alergias FOREIGN KEY (RestriccionId) REFERENCES dbo.AlergiasEnfermedades(RestriccionId) ON DELETE CASCADE
);

-- 11. Tabla CategoriasAlimentos
CREATE TABLE dbo.CategoriasAlimentos (
    CategoriaId INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL UNIQUE
);

-- 12. Tabla Temporadas
CREATE TABLE dbo.Temporadas (
    TemporadaId INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL UNIQUE
);

-- 13. Tabla Alimentos
CREATE TABLE dbo.Alimentos (
    AlimentoId INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(150) NOT NULL,
    CategoriaId INT NOT NULL,
    TemporadaId INT NOT NULL,
    Proteinas DECIMAL(5,2) DEFAULT 0 CONSTRAINT CK_Alimentos_Proteinas CHECK (Proteinas >= 0),
    Grasas DECIMAL(5,2) DEFAULT 0 CONSTRAINT CK_Alimentos_Grasas CHECK (Grasas >= 0),
    Carbohidratos DECIMAL(5,2) DEFAULT 0 CONSTRAINT CK_Alimentos_Carbohidratos CHECK (Carbohidratos >= 0),
    Calorias DECIMAL(6,2) DEFAULT 0 CONSTRAINT CK_Alimentos_Calorias CHECK (Calorias >= 0),
    PrecioAprox DECIMAL(6,2) NOT NULL CONSTRAINT CK_Alimentos_Precio CHECK (PrecioAprox >= 0),
    Disponible BIT DEFAULT 1,
    ProvinciaId INT NULL,
    CantonesId INT NULL,
    ParroquiaId INT NULL,
    CONSTRAINT FK_Alimentos_Categorias FOREIGN KEY (CategoriaId) REFERENCES dbo.CategoriasAlimentos(CategoriaId),
    CONSTRAINT FK_Alimentos_Temporadas FOREIGN KEY (TemporadaId) REFERENCES dbo.Temporadas(TemporadaId),
    CONSTRAINT FK_Alimentos_Provincias FOREIGN KEY (ProvinciaId) REFERENCES dbo.Provincias(ProvinciaId),
    CONSTRAINT FK_Alimentos_Cantones FOREIGN KEY (CantonesId) REFERENCES dbo.Cantones(CantonId),
    CONSTRAINT FK_Alimentos_Parroquias FOREIGN KEY (ParroquiaId) REFERENCES dbo.Parroquias(ParroquiaId)
);

-- 14. Tabla Dietas
CREATE TABLE dbo.Dietas (
    DietaId INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioId INT NOT NULL,
    FechaCreacion DATETIME DEFAULT GETDATE(),
    Objetivo VARCHAR(100) NOT NULL,
    CaloriasTotales DECIMAL(6,2) NOT NULL,
    ProteinasTotales DECIMAL(5,2) NOT NULL,
    GrasasTotales DECIMAL(5,2) NOT NULL,
    CarbohidratosTotales DECIMAL(5,2) NOT NULL,
    PresupuestoEstimado DECIMAL(8,2) NOT NULL,
    EsFavorita BIT DEFAULT 0,
    CONSTRAINT FK_Dietas_Usuarios FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(UsuarioId) ON DELETE CASCADE
);

-- 15. Tabla DetallePlanAlimenticio
CREATE TABLE dbo.DetallePlanAlimenticio (
    DetalleId INT IDENTITY(1,1) PRIMARY KEY,
    DietaId INT NOT NULL,
    TipoComida VARCHAR(20) NOT NULL CONSTRAINT CK_DetallePlan_Tipo CHECK (TipoComida IN ('Desayuno', 'Media mañana', 'Almuerzo', 'Merienda', 'Cena')),
    AlimentoSugerido VARCHAR(150) NOT NULL,
    Cantidad VARCHAR(100) NOT NULL,
    Calorias DECIMAL(6,2) NOT NULL,
    Proteinas DECIMAL(5,2) NOT NULL,
    Grasas DECIMAL(5,2) NOT NULL,
    Carbohidratos DECIMAL(5,2) NOT NULL,
    CONSTRAINT FK_DetallePlan_Dietas FOREIGN KEY (DietaId) REFERENCES dbo.Dietas(DietaId) ON DELETE CASCADE
);

-- 16. Tabla Recetas
CREATE TABLE dbo.Recetas (
    RecetaId INT IDENTITY(1,1) PRIMARY KEY,
    DietaId INT NOT NULL,
    Nombre VARCHAR(150) NOT NULL,
    Ingredientes NVARCHAR(MAX) NOT NULL,
    Preparacion NVARCHAR(MAX) NOT NULL,
    TiempoEstimadoMinutos INT NOT NULL,
    CONSTRAINT FK_Recetas_Dietas FOREIGN KEY (DietaId) REFERENCES dbo.Dietas(DietaId) ON DELETE CASCADE
);

-- 17. Tabla ListaCompras
CREATE TABLE dbo.ListaCompras (
    ListaId INT IDENTITY(1,1) PRIMARY KEY,
    DietaId INT NOT NULL,
    Ingrediente VARCHAR(150) NOT NULL,
    Cantidad VARCHAR(100) NOT NULL,
    CostoAproximado DECIMAL(6,2) NOT NULL,
    Comprado BIT DEFAULT 0,
    CONSTRAINT FK_ListaCompras_Dietas FOREIGN KEY (DietaId) REFERENCES dbo.Dietas(DietaId) ON DELETE CASCADE
);

-- 18. Tabla ConfiguracionUsuario
CREATE TABLE dbo.ConfiguracionUsuario (
    ConfiguracionId INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioId INT NOT NULL UNIQUE,
    ModoOscuro BIT DEFAULT 0,
    CONSTRAINT FK_ConfiguracionUsuario_Usuarios FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(UsuarioId) ON DELETE CASCADE
);

-- 19. Tabla HistorialConsultas
CREATE TABLE dbo.HistorialConsultas (
    HistorialId INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioId INT NULL,
    Fecha DATETIME DEFAULT GETDATE(),
    Accion VARCHAR(150) NOT NULL,
    Detalle NVARCHAR(MAX) NULL,
    CONSTRAINT FK_HistorialConsultas_Usuarios FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(UsuarioId) ON DELETE SET NULL
);
GO

-- ==========================================
-- CREACIÓN DE ÍNDICES PARA OPTIMIZACIÓN
-- ==========================================
CREATE INDEX IX_Usuarios_Email ON dbo.Usuarios(Email);
CREATE INDEX IX_Alimentos_Nombre ON dbo.Alimentos(Nombre);
CREATE INDEX IX_Alimentos_Categoria ON dbo.Alimentos(CategoriaId);
CREATE INDEX IX_Alimentos_Ubicacion ON dbo.Alimentos(ProvinciaId, CantonesId);
CREATE INDEX IX_Dietas_Usuario ON dbo.Dietas(UsuarioId);
CREATE INDEX IX_DetallePlan_Dieta ON dbo.DetallePlanAlimenticio(DietaId);
CREATE INDEX IX_Recetas_Dieta ON dbo.Recetas(DietaId);
CREATE INDEX IX_ListaCompras_Dieta ON dbo.ListaCompras(DietaId);
GO

-- ==========================================
-- INSERTAR DATOS INICIALES (SEMILLAS)
-- ==========================================

-- 1. Insertar Roles
INSERT INTO dbo.Roles (Nombre) VALUES ('Administrador'), ('Cliente');

-- 2. Insertar Regiones
INSERT INTO dbo.Regiones (Nombre) VALUES ('Costa'), ('Sierra'), ('Amazonía'), ('Insular');

-- 3. Insertar Provincias
INSERT INTO dbo.Provincias (Nombre, RegionId) VALUES 
('Pichincha', 2), -- Sierra (ID 2)
('Guayas', 1),     -- Costa (ID 1)
('Azuay', 2),      -- Sierra
('Manabí', 1),     -- Costa
('Loja', 2),       -- Sierra
('Imbabura', 2),   -- Sierra
('Tungurahua', 2), -- Sierra
('Chimborazo', 2), -- Sierra
('El Oro', 1),     -- Costa
('Esmeraldas', 1), -- Costa
('Los Ríos', 1),   -- Costa
('Carchi', 2),     -- Sierra
('Cotopaxi', 2),   -- Sierra
('Bolívar', 2),    -- Sierra
('Cañar', 2),      -- Sierra
('Santo Domingo de los Tsáchilas', 1), -- Costa/Sierra
('Santa Elena', 1), -- Costa
('Sucumbíos', 3),  -- Amazonía (ID 3)
('Napo', 3),       -- Amazonía
('Pastaza', 3),    -- Amazonía
('Orellana', 3),   -- Amazonía
('Morona Santiago', 3), -- Amazonía
('Zamora Chinchipe', 3), -- Amazonía
('Galápagos', 4);  -- Insular (ID 4)

-- 4. Insertar Cantones (Representativos para las provincias principales)
-- Pichincha (ProvinciaId 1)
INSERT INTO dbo.Cantones (Nombre, ProvinciaId) VALUES ('Quito', 1), ('Rumiñahui', 1), ('Mejía', 1);
-- Guayas (ProvinciaId 2)
INSERT INTO dbo.Cantones (Nombre, ProvinciaId) VALUES ('Guayaquil', 2), ('Samborondón', 2), ('Durán', 2);
-- Azuay (ProvinciaId 3)
INSERT INTO dbo.Cantones (Nombre, ProvinciaId) VALUES ('Cuenca', 3), ('Gualaceo', 3), ('Paute', 3);
-- Manabí (ProvinciaId 4)
INSERT INTO dbo.Cantones (Nombre, ProvinciaId) VALUES ('Portoviejo', 4), ('Manta', 4), ('Chone', 4);
-- Loja (ProvinciaId 5)
INSERT INTO dbo.Cantones (Nombre, ProvinciaId) VALUES ('Loja', 5), ('Catamayo', 5), ('Cariamanga', 5);
-- Otras provincias (6 a 24)
INSERT INTO dbo.Cantones (Nombre, ProvinciaId) VALUES ('Ibarra', 6);
INSERT INTO dbo.Cantones (Nombre, ProvinciaId) VALUES ('Ambato', 7);
INSERT INTO dbo.Cantones (Nombre, ProvinciaId) VALUES ('Riobamba', 8);
INSERT INTO dbo.Cantones (Nombre, ProvinciaId) VALUES ('Machala', 9);
INSERT INTO dbo.Cantones (Nombre, ProvinciaId) VALUES ('Esmeraldas', 10);
INSERT INTO dbo.Cantones (Nombre, ProvinciaId) VALUES ('Babahoyo', 11);
INSERT INTO dbo.Cantones (Nombre, ProvinciaId) VALUES ('Tulcán', 12);
INSERT INTO dbo.Cantones (Nombre, ProvinciaId) VALUES ('Latacunga', 13);
INSERT INTO dbo.Cantones (Nombre, ProvinciaId) VALUES ('Guaranda', 14);
INSERT INTO dbo.Cantones (Nombre, ProvinciaId) VALUES ('Azogues', 15);
INSERT INTO dbo.Cantones (Nombre, ProvinciaId) VALUES ('Santo Domingo', 16);
INSERT INTO dbo.Cantones (Nombre, ProvinciaId) VALUES ('Santa Elena', 17);
INSERT INTO dbo.Cantones (Nombre, ProvinciaId) VALUES ('Nueva Loja', 18);
INSERT INTO dbo.Cantones (Nombre, ProvinciaId) VALUES ('Tena', 19);
INSERT INTO dbo.Cantones (Nombre, ProvinciaId) VALUES ('Puyo', 20);
INSERT INTO dbo.Cantones (Nombre, ProvinciaId) VALUES ('El Coca', 21);
INSERT INTO dbo.Cantones (Nombre, ProvinciaId) VALUES ('Macas', 22);
INSERT INTO dbo.Cantones (Nombre, ProvinciaId) VALUES ('Zamora', 23);
INSERT INTO dbo.Cantones (Nombre, ProvinciaId) VALUES ('Puerto Ayora', 24);

-- 5. Insertar Parroquias
-- Quito (CantonId 1)
INSERT INTO dbo.Parroquias (Nombre, CantonId) VALUES ('Iñaquito', 1), ('Centro Histórico', 1), ('Cumbayá', 1), ('Calderón', 1);
-- Rumiñahui (CantonId 2)
INSERT INTO dbo.Parroquias (Nombre, CantonId) VALUES ('Sangolquí', 2), ('Cotogchoa', 2);
-- Guayaquil (CantonId 4)
INSERT INTO dbo.Parroquias (Nombre, CantonId) VALUES ('Tarqui', 4), ('Ximena', 4), ('Chongón', 4), ('Pascuales', 4);
-- Cuenca (CantonId 7)
INSERT INTO dbo.Parroquias (Nombre, CantonId) VALUES ('El Sagrario', 7), ('San Sebastián', 7), ('Baños', 7), ('Ricaurte', 7);
-- Portoviejo (CantonId 10)
INSERT INTO dbo.Parroquias (Nombre, CantonId) VALUES ('Andrés de Vera', 10), ('Crucita', 10);
-- Loja (CantonId 13)
INSERT INTO dbo.Parroquias (Nombre, CantonId) VALUES ('El Sagrario (Loja)', 13), ('Vilcabamba', 13), ('San Lucas', 13);
-- Parroquias de otras provincias (CantonId 16 a 34)
INSERT INTO dbo.Parroquias (Nombre, CantonId) VALUES ('San Francisco', 16);
INSERT INTO dbo.Parroquias (Nombre, CantonId) VALUES ('Atocha', 17);
INSERT INTO dbo.Parroquias (Nombre, CantonId) VALUES ('Lizarzaburu', 18);
INSERT INTO dbo.Parroquias (Nombre, CantonId) VALUES ('El Cambio', 19);
INSERT INTO dbo.Parroquias (Nombre, CantonId) VALUES ('5 de Agosto', 20);
INSERT INTO dbo.Parroquias (Nombre, CantonId) VALUES ('Clemente Baquerizo', 21);
INSERT INTO dbo.Parroquias (Nombre, CantonId) VALUES ('González Suárez', 22);
INSERT INTO dbo.Parroquias (Nombre, CantonId) VALUES ('Ignacio Flores', 23);
INSERT INTO dbo.Parroquias (Nombre, CantonId) VALUES ('Veintimilla', 24);
INSERT INTO dbo.Parroquias (Nombre, CantonId) VALUES ('Aurelio Bayas', 25);
INSERT INTO dbo.Parroquias (Nombre, CantonId) VALUES ('Chinto', 26);
INSERT INTO dbo.Parroquias (Nombre, CantonId) VALUES ('Ballenita', 27);
INSERT INTO dbo.Parroquias (Nombre, CantonId) VALUES ('Lago Agrio', 28);
INSERT INTO dbo.Parroquias (Nombre, CantonId) VALUES ('Puerto Napo', 29);
INSERT INTO dbo.Parroquias (Nombre, CantonId) VALUES ('Tarqui (Pastaza)', 30);
INSERT INTO dbo.Parroquias (Nombre, CantonId) VALUES ('El Coca Parroquia', 31);
INSERT INTO dbo.Parroquias (Nombre, CantonId) VALUES ('Alshi', 32);
INSERT INTO dbo.Parroquias (Nombre, CantonId) VALUES ('El Limón', 33);
INSERT INTO dbo.Parroquias (Nombre, CantonId) VALUES ('Puerto Ayora Parroquia', 34);

-- 6. Objetivos Nutricionales
INSERT INTO dbo.ObjetivosNutricionales (Nombre, Descripcion) VALUES 
('Perder peso', 'Reducción de grasa corporal manteniendo masa muscular mediante déficit calórico.'),
('Mantener peso', 'Equilibrio energético para conservar el peso actual y mejorar la salud general.'),
('Ganar masa muscular', 'Aumento de tejido muscular limpio mediante superávit calórico y distribución óptima de proteínas.');

-- 7. Alergias y Enfermedades
INSERT INTO dbo.AlergiasEnfermedades (Nombre, Tipo) VALUES 
('Diabetes Tipo 2', 'Enfermedad'),
('Hipertensión Arterial', 'Enfermedad'),
('Celíaco (Gluten)', 'Alergia'),
('Intolerancia a la Lactosa', 'Alergia'),
('Alergia a los Mariscos', 'Alergia'),
('Alergia al Maní', 'Alergia');

-- 8. Categorías de Alimentos
INSERT INTO dbo.CategoriasAlimentos (Nombre) VALUES 
('Cereales y Tubérculos'),
('Verduras y Hortalizas'),
('Frutas'),
('Carnes, Aves, Pescados y Huevos'),
('Lácteos y Derivados'),
('Grasas y Aceites'),
('Legumbres y Granos');

-- 9. Temporadas
INSERT INTO dbo.Temporadas (Nombre) VALUES 
('Todo el año'),
('Lluviosa (Invierno)'),
('Seca (Verano)');

-- 10. Alimentos Locales de Ecuador (Semilla para que la IA disponga de datos precisos)
-- Formato: Nombre, CategoriaId, TemporadaId, Proteinas, Grasas, Carbohidratos, Calorias, PrecioAprox, Disponible, ProvinciaId
INSERT INTO dbo.Alimentos (Nombre, CategoriaId, TemporadaId, Proteinas, Grasas, Carbohidratos, Calorias, PrecioAprox, Disponible, ProvinciaId) VALUES
-- Sierra (Pichincha/Azuay)
('Mote cocido', 1, 1, 3.40, 0.90, 32.00, 150.00, 0.40, 1, 3),         -- Azuay
('Chochos picados', 7, 1, 15.00, 7.00, 9.00, 160.00, 0.60, 1, 1),       -- Pichincha
('Quinua en grano', 1, 1, 14.10, 6.00, 64.00, 368.00, 1.20, 1, 1),      -- Pichincha
('Papa chola', 1, 1, 2.00, 0.10, 19.00, 85.00, 0.25, 1, 1),             -- Pichincha
('Habas tiernas', 7, 1, 5.60, 0.30, 12.40, 72.00, 0.50, 1, 1),          -- Pichincha
('Mellocos', 1, 1, 1.50, 0.10, 14.00, 60.00, 0.45, 1, 1),               -- Pichincha
('Queso de mesa andino', 5, 1, 18.00, 22.00, 2.00, 280.00, 1.50, 1, 1),  -- Pichincha

-- Costa (Guayas/Manabí)
('Plátano Verde (Barraganete)', 1, 1, 1.30, 0.30, 32.00, 122.00, 0.15, 1, 2), -- Guayas
('Yuca fresca', 1, 1, 1.30, 0.30, 38.00, 160.00, 0.30, 1, 2),            -- Guayas
('Tilapia fresca de río/mar', 4, 1, 20.00, 1.70, 0.00, 96.00, 1.80, 1, 2),-- Guayas
('Atún fresco de Manta', 4, 1, 23.00, 4.90, 0.00, 144.00, 2.50, 1, 4),   -- Manabí
('Camarón de piscina', 4, 1, 20.00, 1.00, 0.90, 99.00, 3.00, 1, 2),      -- Guayas
('Maní en grano tostado', 6, 1, 26.00, 49.00, 16.00, 567.00, 0.80, 1, 4),-- Manabí
('Aguacate nacional (Hass/Fuerte)', 6, 1, 2.00, 15.00, 9.00, 160.00, 0.50, 1, 2), -- Guayas

-- Frutas Tropicales y Andinas
('Maracuyá (Fruta de la pasión)', 3, 1, 2.20, 0.70, 23.00, 97.00, 0.20, 1, NULL),
('Tamarindo', 3, 1, 2.80, 0.60, 62.50, 239.00, 0.50, 1, NULL),
('Banana / Guineo', 3, 1, 1.10, 0.30, 22.80, 89.00, 0.10, 1, NULL),
('Naranjilla de Pastaza', 3, 1, 0.60, 0.20, 7.00, 25.00, 0.15, 1, 20), -- Pastaza
('Taxo', 3, 1, 1.50, 0.20, 10.00, 45.00, 0.20, 1, NULL),
('Tomate de árbol', 3, 1, 1.50, 0.20, 10.00, 40.00, 0.25, 1, NULL),

-- Verduras genéricas locales
('Zanahoria blanca', 1, 1, 1.00, 0.20, 26.00, 109.00, 0.40, 1, NULL),
('Cebolla paiteña', 2, 1, 1.10, 0.10, 9.00, 40.00, 0.20, 1, NULL),
('Tomate riñón', 2, 1, 0.90, 0.20, 3.90, 18.00, 0.25, 1, NULL),
('Cilantro (Yerbita)', 2, 1, 2.10, 0.50, 3.70, 23.00, 0.10, 1, NULL),
('Zapallo nacional', 2, 1, 1.00, 0.10, 6.50, 26.00, 0.30, 1, NULL),

-- Proteínas comunes y económicas
('Huevo de gallina criolla', 4, 1, 12.50, 10.50, 0.70, 143.00, 0.15, 1, NULL),
('Pollo entero limpio', 4, 1, 27.00, 14.00, 0.00, 239.00, 1.30, 1, NULL),
('Carne de res magra nacional', 4, 1, 22.00, 7.00, 0.00, 150.00, 2.20, 1, NULL);

-- 11. Crear un Administrador Inicial
-- La contraseña por defecto es "Administrador123*" cifrada con bcrypt (cost 10)
-- $2b$10$wE9m84Y2YkE0B7tqWp9qOuN96sWfX4a8h6cWwP4n8q9r0s1t2u3v4 (Representativa para pruebas)
INSERT INTO dbo.Usuarios (NombreCompleto, Email, ContrasenaHash, RolId, Activo) VALUES 
('Administrador FitMenu', 'admin@fitmenu.local', '$2b$10$RbHci1I8P3tcv19/mqUbiufrKy3LC02Dsjhs7BoDjMpghw5ecpVSe', 1, 1);

-- 12. Crear un Cliente de prueba
-- Contrasena por defecto es "Cliente123*"
-- $2b$10$y7yNZ8mb3N82Ke6zRq1au.S/PyV12Dq.7ytg2GdjPOQTQibYTrPT6 (Correcta)
INSERT INTO dbo.Usuarios (NombreCompleto, Email, ContrasenaHash, RolId, Activo) VALUES 
('Juan Pérez', 'juan@fitmenu.local', '$2b$10$y7yNZ8mb3N82Ke6zRq1au.S/PyV12Dq.7ytg2GdjPOQTQibYTrPT6', 2, 1);

-- Crear perfil nutricional para Juan Pérez (UsuarioId 2) en Vilcabamba, Loja
-- Vilcabamba es ParroquiaId 14 (Loja CantonId 13)
INSERT INTO dbo.InformacionNutricional (UsuarioId, Edad, Sexo, PesoKg, AlturaCm, NivelActividad, IMC, ObjetivoNutricionalId, PresupuestoDiario, ParroquiaId) VALUES
(2, 30, 'M', 75.00, 175.00, 'Moderado', 24.49, 1, 5.00, 14);

-- Crear preferencia de Modo Claro/Oscuro para Juan Pérez
INSERT INTO dbo.ConfiguracionUsuario (UsuarioId, ModoOscuro) VALUES (2, 0);

PRINT 'Base de datos FitMenuLocal creada y sembrada con éxito.';
GO
