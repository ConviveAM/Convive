# Despliegue con Docker 🐳

## Requisitos previos
- Docker instalado
- Docker Compose instalado

## Pasos para desplegar

1. Clona el repositorio:
git clone https://github.com/ConviveAM/Convive.git
cd Convive

2. Renombra el archivo .env.example a .env.local:
cp .env.example .env.local

3. Abre .env.local y rellena las claves con tus credenciales reales:
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=tu_clave_publishable
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
GROQ_API_KEY=tu_clave_de_groq

4. Levanta la aplicación:
docker-compose up -d

5. Abre el navegador en:
http://localhost:3000

## Por qué se necesita el .env.local
Las claves de acceso a Supabase y Groq son credenciales privadas que no pueden
subirse a GitHub por seguridad. GitHub bloquea automáticamente cualquier push
que contenga claves de API. Por eso se incluye un .env.example con la estructura
necesaria para que el usuario pueda configurar sus propias credenciales de forma
segura antes de arrancar la aplicación.

## Nota para el profesor
Las claves de acceso necesarias para probar la aplicación se adjuntan
por separado en la entrega de la tarea.

## Para parar la aplicación
docker-compose down

## Imagen en Docker Hub
https://hub.docker.com/r/manuela20065/convive-app
