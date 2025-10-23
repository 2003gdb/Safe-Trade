# SafeTrade - Sistema de Reportes de Ciberseguridad

SafeTrade es una plataforma integral para reportes de incidentes de ciberseguridad que permite a usuarios reportar amenazas de forma segura, tanto identificados como anónimos, proporcionando análisis comunitarios y herramientas administrativas.

## Arquitectura del Proyecto

Este proyecto está organizado como un monorepo con **3 packages independientes**:

```
SafeTrade-Proyecto/
├── packages/
│   ├── backend/           # API NestJS (Puerto 3000)
│   ├── admin-portal/      # Portal Next.js (Puerto 3001)
│   └── mobile/            # App iOS SwiftUI
└── docs/                  # Documentación del proyecto
```

Cada package se instala y ejecuta de forma **completamente independiente**.

---

## Configuración de Base de Datos MySQL

### Prerrequisitos
- MySQL 8.0 o superior instalado y ejecutándose

### 1. Crear la Base de Datos

Conectarse a MySQL:
```bash
mysql -u root -p
```
Ejecutar los siguientes comandos SQL:

```sql
-- Crear la base de datos
CREATE DATABASE safetrade_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE safetrade_dev;

-- Crear tabla de usuarios regulares
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    pass_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de administradores (separada de usuarios por seguridad)
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    pass_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de catálogo: tipos de ataque
CREATE TABLE attack_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Crear tabla de catálogo: niveles de impacto
CREATE TABLE impacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Crear tabla de catálogo: estados de reporte
CREATE TABLE status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Crear tabla principal de reportes
CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    is_anonymous BOOLEAN DEFAULT TRUE,
    attack_type INT NOT NULL,
    incident_date DATETIME NOT NULL,
    attack_origin VARCHAR(255) NULL,
    evidence_url VARCHAR(500) NULL,
    suspicious_url TEXT NULL,
    message_content TEXT NULL,
    description TEXT NULL,
    impact INT NOT NULL,
    status INT NOT NULL DEFAULT 1,
    admin_notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (attack_type) REFERENCES attack_types(id),
    FOREIGN KEY (impact) REFERENCES impacts(id),
    FOREIGN KEY (status) REFERENCES status(id),
    INDEX idx_attack_type (attack_type),
    INDEX idx_incident_date (incident_date),
    INDEX idx_status (status),
    INDEX idx_impact (impact),
    INDEX idx_anonymous (is_anonymous),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);
```

### 2. Insertar Datos Iniciales de Catálogos

```sql
-- Tipos de ataque
INSERT INTO attack_types (name) VALUES
('email'),
('SMS'),
('whatsapp'),
('llamada'),
('redes_sociales'),
('otro');

-- Niveles de impacto
INSERT INTO impacts (name) VALUES
('ninguno'),
('robo_datos'),
('robo_dinero'),
('cuenta_comprometida');

-- Estados de reporte
INSERT INTO status (name) VALUES
('nuevo'),
('revisado'),
('en_investigacion'),
('cerrado');
```

## Package 1: Backend (NestJS API)

### Ubicación
```
packages/backend/
```

### Stack Tecnológico
- **Framework:** NestJS 10.2.0
- **Base de datos:** MySQL 8.0+ (conexión directa con mysql2)
- **Autenticación:** JWT + crypto
- **Puerto:** 3000

### Instalación

1. Navegar al directorio:
```bash
cd packages/backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `packages/backend/.env` con tus valores:
```bash
# Node Environment
NODE_ENV=development

# Database Configuration (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=safetrade_dev
DB_USER=root                 
DB_PASSWORD=tu_password_mysql

# JWT Configuration
JWT_SECRET=tu_secret_jwt_super_seguro_minimo_256_caracteres
JWT_REFRESH_SECRET=tu_refresh_secret_super_seguro_minimo_256_caracteres
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=3000

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760           # 10MB

# CORS Configuration
ADMIN_PORTAL_URL=http://localhost:3001
IOS_APP_URL=safetrade://

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000      # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Scripts Disponibles

```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm run build

# Linting
npm run lint
```

### Endpoints Principales

**Autenticación:**
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión

**Reportes:**
- `POST /reportes/upload-photo` - Subir evidencia fotográfica
- `POST /reportes` - Crear reporte
- `GET /reportes` - Listar reportes (requiere autenticación)
- `GET /reportes/:id` - Obtener reporte específico

**Catálogos:**
- `GET /catalog/attack-types` - Tipos de ataque
- `GET /catalog/impacts` - Niveles de impacto
- `GET /catalog/status` - Estados de reporte

**Administración:**
- `POST /admin/login` - Login de administrador
- `PUT /admin/reportes/:id/estado` - Actualizar estado de reporte

**Tendencias Comunitarias:**
- `GET /comunidad/tendencias` - Obtener tendencias
- `GET /comunidad/recomendaciones` - Recomendaciones de seguridad

**Documentación API:**
- Swagger UI: `http://localhost:3000/docs` (cuando el servidor esté corriendo)

---

## Package 2: Admin Portal (Next.js)

### Ubicación
```
packages/admin-portal/
```

### Stack Tecnológico
- **Framework:** Next.js 13.4.0 con App Router
- **UI:** Tailwind CSS
- **Lenguaje:** TypeScript
- **Puerto:** 3001

### Instalación

1. Navegar al directorio:
```bash
cd packages/admin-portal
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.local.example .env.local
```

Editar `packages/admin-portal/.env.local`:
```bash
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Application Configuration
NEXT_PUBLIC_APP_NAME=SafeTrade Admin Portal
NODE_ENV=development

# Authentication (debe coincidir con el backend)
JWT_SECRET=mismo_secret_que_backend

# Next.js Configuration
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Scripts Disponibles

```bash
# Desarrollo
npm run dev                # Inicia en http://localhost:3001

# Producción
npm run build
npm run start

# Linting y Type Checking
npm run lint
npm run type-check
```

### Funcionalidades

- **Dashboard:** Métricas y estadísticas de reportes
- **Gestión de Reportes:** Visualización, moderación y cambio de estado
- **Analíticas:** Tendencias y análisis comunitario
- **Autenticación:** Login para administradores

---

## 📱 Package 3: Mobile (iOS SwiftUI)

### Ubicación
```
packages/mobile/SafeTrade/
```

### Stack Tecnológico
- **Framework:** SwiftUI para iOS 14+
- **Lenguaje:** Swift 5.8+
- **Patrón:** MVVM
- **IDE:** Xcode 14.0+

### Requisitos Previos
- macOS con Xcode 14.0 o superior instalado
- iOS Simulator o dispositivo iOS 14+
- Apple Developer Account (para ejecutar en dispositivo físico)

### Configuración

1. Navegar al directorio:
```bash
cd packages/mobile/SafeTrade
```

2. Abrir el proyecto en Xcode:
```bash
open SafeTrade.xcodeproj
```

O usar Xcode GUI: `File → Open → packages/mobile/SafeTrade/SafeTrade.xcodeproj`

### Configurar API Endpoint

Editar el archivo de configuración del API:
```
packages/mobile/SafeTrade/SafeTrade/Services/APIService.swift
```

Buscar y actualizar la URL base:
```swift
private let baseURL = "http://localhost:3000"  // Para simulador
```

**Nota:** Si ejecutas en un dispositivo físico, reemplaza `localhost` con la IP de tu máquina donde corre el backend.

### Funcionalidades

- **Registro e Inicio de Sesión:** Autenticación de usuarios
- **Reportes Anónimos:** Crear reportes sin autenticación
- **Reportes Identificados:** Crear reportes con cuenta de usuario
- **Subida de Fotos:** Evidencia fotográfica de incidentes
- **Historial:** Ver reportes previos (usuarios autenticados)
- **Tendencias Comunitarias:** Análisis y recomendaciones

---

## 🚀 Orden de Inicio Recomendado

Para ejecutar el proyecto completo:

### 1. Base de Datos
```bash
# Verificar que MySQL esté corriendo
mysql -u root -p -e "USE safetrade_dev; SHOW TABLES;"
```

### 2. Backend API
```bash
cd packages/backend
npm install              # Solo la primera vez
npm run dev              # Puerto 3000
```

### 3. Admin Portal (Opcional)
```bash
cd packages/admin-portal
npm install              # Solo la primera vez
npm run dev              # Puerto 3001
```

### 4. Mobile App (Opcional)
```bash
cd packages/mobile/SafeTrade
open SafeTrade.xcodeproj  # Abrir en Xcode
# Presionar Cmd + R para ejecutar
```

---

## Características de Seguridad

- **Privacidad de Reportes Anónimos:** Sin registro de información personal
- **Autenticación Robusta:** JWT + crypto con salt único por usuario
- **Separación de Administradores:** Tabla `admin_users` separada de `users`
- **Validación de Archivos:** Verificación MIME type y límites de tamaño
- **SQL Injection Prevention:** Queries parametrizadas con mysql2
- **Mensajes en Español:** Todos los mensajes de error y validación
- **Registro de Admins Deshabilitado:** Los administradores solo pueden crearse mediante scripts seguros

---

## Crear Administradores

Por razones de seguridad, el registro público de administradores ha sido deshabilitado. Los administradores deben crearse manualmente mediante un script.

1. Navegar al directorio del backend:
```bash
cd packages/backend
```

2. Ejecutar el script de creación:
```bash
npm run create-admin
```

3. El script te pedirá el email y contraseña del nuevo administrador.

---

## 📁 Estructura Detallada del Proyecto

```
SafeTrade-Proyecto/
├── packages/
│   ├── backend/                 # API NestJS
│   │   ├── src/
│   │   │   ├── auth/           # Autenticación JWT
│   │   │   ├── reportes/       # Gestión de reportes
│   │   │   ├── admin/          # Endpoints administrativos
│   │   │   ├── comunidad/      # Tendencias comunitarias
│   │   │   ├── catalog/        # Catálogos
│   │   │   ├── db/             # Conexión MySQL
│   │   │   └── users/          # Gestión de usuarios
│   │   ├── test/               # Tests E2E
│   │   ├── .env.example
│   │   └── package.json
│   │
│   ├── admin-portal/           # Portal Next.js
│   │   ├── src/
│   │   │   ├── app/           # App Router (Next.js 13)
│   │   │   ├── components/    # Componentes React
│   │   │   ├── lib/           # Utilidades
│   │   │   └── types/         # Tipos TypeScript
│   │   ├── .env.local.example
│   │   └── package.json
│   │
│   └── mobile/                # App iOS
│       └── SafeTrade/
│           ├── SafeTrade/
│           │   ├── App/           # Entry point
│           │   ├── Views/         # Vistas SwiftUI
│           │   ├── ViewModels/    # ViewModels MVVM
│           │   ├── Models/        # Modelos de datos
│           │   ├── Services/      # API y servicios
│           │   └── Utils/         # Utilidades
│           └── SafeTrade.xcodeproj
│
└── docs/                      # Documentación
    ├── architecture/          # Arquitectura del sistema
    ├── prd/                   # Product Requirements
    └── stories/               # User Stories
```

## 📄 Licencia

MIT License - Ver archivo [LICENSE](LICENSE) para detalles.

---
