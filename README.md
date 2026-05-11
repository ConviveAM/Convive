# Convive

Aplicación web para gestionar gastos, facturas y organización en pisos compartidos.

## 1. Requisitos

- Node.js 20+
- npm 10+
- Docker + Docker Compose (si quieres desplegar por contenedor)
- Proyecto Supabase (cloud o local)

## 2. Instalar dependencias

```bash
npm install
```

## 3. Variables de entorno

Crea `.env.local` a partir de `.env.example`:

```bash
cp .env.example .env.local
```

Contenido mínimo:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=tu_clave_publishable
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
GROQ_API_KEY=tu_clave_de_groq
```

## 4. Entorno de desarrollo (local)

Arrancar en modo desarrollo:

```bash
npm run dev
```

Abrir:

- http://localhost:3000

Comandos útiles:

```bash
npm run build
npm run start
```

## 5. Despliegue con Docker Compose

El proyecto ya incluye:

- `Dockerfile`
- `docker-compose.yaml`

Levantar la app:

```bash
docker-compose up -d
```

Parar:

```bash
docker-compose down
```

Abrir:

- http://localhost:3000

Imagen usada en `docker-compose`:

- `manuela20065/convive-app:v1`

## 6. Despliegue / preparación de base de datos

Este proyecto usa **Supabase (PostgreSQL)**.

### Opción recomendada (Supabase cloud)

1. Crea un proyecto en Supabase.
2. Ve a `SQL Editor`.
3. Ejecuta el script completo de:
   - [`README-SQL.md`](./README-SQL.md)
4. Verifica que se crean tablas, funciones RPC, triggers y políticas RLS.
5. Crea el bucket de Storage esperado por la app:
   - `documents`
6. Copia URL + keys del proyecto en `.env.local`.

### Opción local (si usas Supabase CLI)

Puedes levantar Supabase local y ejecutar el mismo SQL de `README-SQL.md` contra esa instancia.

## 7. Estructura básica del proyecto

- `app/`: rutas Next.js + endpoints backend
- `components/`: pantallas y UI
- `lib/`: tipos y utilidades
- `docker-compose.yaml`: despliegue contenedorizado
- `README-SQL.md`: SQL de base de datos

## 8. Notas

- La extracción automática con IA (tickets/facturas/contrato) puede fallar en casos puntuales: revisa siempre los datos antes de guardar.
- No subas credenciales reales al repositorio.
