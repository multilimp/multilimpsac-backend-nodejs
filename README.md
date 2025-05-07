# BACKEND MULTILIMP SAC

## Descripción

Backend para la aplicación MULTILIMP SAC, desarrollado con Express, TypeScript y Prisma. Utiliza Cloudflare R2 para almacenamiento de archivos y Zod para validaciones.

## Instalación

1.  Clona el repositorio:
    ```bash
    git clone <url-del-repositorio>
    cd template-express
    ```

2.  Instala las dependencias:
    ```bash
    yarn install
    ```

3.  Configura las variables de entorno:
    Crea un archivo `.env` en la raíz del proyecto y añade las variables necesarias. Consulta `src/shared/config/env.ts` para ver todas las variables requeridas. Como mínimo, necesitarás:
    ```dotenv
    # Base de Datos (Prisma)
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
    DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

    # Cloudflare R2
    AWS_ACCESS_KEY_ID="TU_R2_ACCESS_KEY_ID"
    AWS_SECRET_ACCESS_KEY="TU_R2_SECRET_ACCESS_KEY"
    AWS_S3_BUCKET="TU_R2_BUCKET_NAME"
    AWS_S3_ENDPOINT="TU_R2_ENDPOINT_URL" # ej: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
    R2_PUBLIC_DOMAIN="TU_R2_DOMINIO_PUBLICO" # ej: r2.dominio.com o <BUCKET_NAME>.<ACCOUNT_ID>.r2.dev

    # JWT
    JWT_SECRET="ESTO_ES_UN_SECRETO_MUY_LARGO_Y_SEGURO_DE_AL_MENOS_32_CARACTERES"
    JWT_EXPIRES_IN="1h"

    # Aplicación
    PORT=5000
    ```

4.  Genera el cliente Prisma:
    ```bash
    yarn prisma generate
    ```

5.  Aplica las migraciones de la base de datos:
    ```bash
    yarn prisma migrate dev
    # O si prefieres no usar migraciones y solo sincronizar el esquema:
    # yarn prisma db push
    ```

## Ejecutando la aplicación

```bash
# Modo desarrollo (con recarga automática)
yarn dev

# Compilar para producción
yarn build

# Ejecutar en modo producción (después de compilar)
yarn start
