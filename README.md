# SISTEMA DE GESTIÓN DE INGRESO Y EGRESO (SGIE)

Este proyecto es una aplicación web construida con Next.js y Prisma, diseñada para gestionar transacciones financieras (ingresos y egresos) con un sistema de autenticación y reportes.

## Requisitos Previos

Asegúrate de tener instalado lo siguiente en tu entorno de desarrollo local:

*   [Node.js](https://nodejs.org) (versión recomendada: 18.x LTS o superior)
*   [npm](https://www.npmjs.com) (gestor de paquetes de Node.js)
*   [Git](https://git-scm.com) (sistema de control de versiones)
*   [PostgreSQL](https://www.postgresql.org) (base de datos) o cualquier base de datos compatible con Prisma

## Ejecución Local

Sigue estos pasos para poner en marcha el proyecto en tu máquina local:

### 1. Clonar el Repositorio

Clona este proyecto desde tu repositorio de GitHub:

```bash
git clone https://github.com/tu-usuario/sgie.git
cd sgie
```

### 2. Instalar Dependencias

Instala todas las dependencias del proyecto usando npm:

```bash
npm install
# o simplemente
npm i
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basándote en el archivo `.env.example`:

```bash
# Copia el archivo de ejemplo
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# Base de datos
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/sgie_db"

# Next.js
NEXTAUTH_SECRET="tu-secreto-seguro-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Otros ajustes
APP_ENV="development"
```

### 4. Generar el Cliente de Prisma

Genera el cliente de Prisma para que coincida con tu esquema:

```bash
npx prisma generate
```

### 5. Aplicar Migraciones

Aplica las migraciones a tu base de datos local:

```bash
# Para desarrollo
npx prisma migrate dev --name init

# O si prefieres sincronizar sin historial de migraciones:
npx prisma db push
```

### 6. Poblar la Base de Datos (Opcional)

Si tienes datos de ejemplo, ejecuta el seed:

```bash
npx prisma db seed
```

### 7. Ejecutar el Servidor de Desarrollo

Inicia la aplicación en modo desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## Ejecución en Producción (Vercel)

### Despliegue en Vercel

Para desplegar este proyecto en Vercel, sigue estos pasos:

#### 1. Requisitos y Configuración de Cuenta
- Asegúrate de tener una cuenta en [Vercel](https://vercel.com)
- Recomendamos enlazar tu cuenta de Vercel con tu cuenta de GitHub para despliegues automáticos

#### 2. Crear un Nuevo Proyecto en Vercel
1. Inicia sesión en tu panel de Vercel
2. Haz clic en "Add New..." → "Project"
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio del proyecto

#### 3. Configuración del Proyecto
Al importar el proyecto, configura los siguientes parámetros:

| Parámetro | Valor Recomendado |
|-----------|-------------------|
| **Project Name** | sgie (o el nombre que prefieras) |
| **Framework Preset** | Next.js (detectado automáticamente) |
| **Root Directory** | ./ (ruta predeterminada) |
| **Build Command** | `npx prisma generate && next build` |
| **Output Directory** | .next (predeterminado) |
| **Install Command** | `npm install` |

#### 4. Variables de Entorno
Configura las siguientes variables de entorno en Vercel:

```env
DATABASE_URL="tu_url_de_base_de_datos_en_producción"
NEXTAUTH_SECRET="tu-secreto-seguro-aqui"
NEXTAUTH_URL="https://tu-dominio.vercel.app"
APP_ENV="production"
```

#### 5. Desplegar
1. Haz clic en "Deploy"
2. Espera a que se complete el proceso de construcción y despliegue

#### 6. Aplicar Migraciones de Producción
Una vez desplegado, ejecuta las migraciones en producción:

```bash
# Opción 1: Usando la CLI de Vercel
npx vercel env pull .env.production.local
npx prisma migrate deploy

# Opción 2: Configurar en el despliegue (recomendado)
# Añade en el Build Command:
# npx prisma generate && npx prisma migrate deploy && next build
```

## Comandos Útiles

### Desarrollo
```bash
# Ejecutar en modo desarrollo
npm run dev

# Ejecutar con un puerto específico
npm run dev -- -p 4000
```

### Producción
```bash
# Construir para producción
npm run build

# Iniciar en modo producción
npm start
```

### Base de Datos
```bash
# Abrir Prisma Studio (interfaz visual)
npx prisma studio

# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Resetear base de datos
npx prisma migrate reset
```

### Linting y Formato
```bash
# Ejecutar ESLint
npm run lint

# Formatear código
npm run format
```

## Estructura del Proyecto

```
sgie/
├── app/                    # Rutas de Next.js 13+ (App Router)
│   ├── api/               # Endpoints de API
│   ├── (auth)/           # Rutas de autenticación
│   ├── dashboard/        # Panel principal
│   └── layout.tsx        # Layout principal
├── components/           # Componentes reutilizables
├── lib/                  # Utilidades y configuraciones
├── prisma/              # Esquema y migraciones de Prisma
│   ├── schema.prisma    # Esquema de base de datos
│   └── migrations/      # Migraciones
├── public/              # Archivos estáticos
└── styles/              # Estilos globales
```

## Solución de Problemas

### Errores Comunes

1. **Error de conexión a la base de datos**
   - Verifica que PostgreSQL esté corriendo: `sudo service postgresql status`
   - Confirma las credenciales en `.env`

2. **Error de migración de Prisma**
   - Elimina la carpeta `node_modules/.prisma` y regenera: `npx prisma generate`

3. **Error de puerto en uso**
   - Cambia el puerto: `npm run dev -- -p 3001`

### Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de Vercel](https://vercel.com/docs)

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Nota:** Asegúrate de nunca subir archivos sensibles como `.env` a tu repositorio. El archivo `.gitignore` ya está configurado para excluirlos.