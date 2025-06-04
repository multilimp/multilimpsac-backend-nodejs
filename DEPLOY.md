# Despliegue de MULTILIMP SAC Backend en Dokploy

## 🚀 Configuración para Dokploy

### 1. **Build Type**: Dockerfile

### 2. **Variables de Entorno Requeridas**

Configura estas variables en la sección de Environment de Dokploy:

```env
# Base de datos PostgreSQL
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/base_datos
DIRECT_URL=postgresql://usuario:contraseña@host:puerto/base_datos

# JWT Authentication
JWT_SECRET=tu_secreto_jwt_muy_largo_y_seguro_minimo_32_caracteres
JWT_EXPIRES_IN=36000

# AWS S3 / Cloudflare R2
AWS_ACCESS_KEY_ID=tu_access_key_id
AWS_SECRET_ACCESS_KEY=tu_secret_access_key
AWS_S3_BUCKET=nombre_del_bucket
AWS_S3_ENDPOINT=https://endpoint-r2.cloudflare.com
R2_PUBLIC_URL=https://tu-dominio-publico.com

# Configuración del servidor
PORT=5000
NODE_ENV=production

# Puppeteer (ya configurado en Dockerfile)
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### 3. **Health Check**

- **Path**: `/health` o `/`
- **Port**: `5000`

### 4. **Recursos Recomendados**

- **CPU**: 1-2 cores
- **RAM**: 2-4 GB
- **Storage**: 10-20 GB

### 5. **Comandos Post-Deploy**

El Dockerfile ya incluye:
- Generación del cliente Prisma
- Ejecución automática de migraciones
- Compilación de TypeScript

### 6. **Estructura de Archivos Creados**

```
📁 multilimpsac-nodejs/
├── 🐳 Dockerfile
├── 📋 .dockerignore
├── ⚙️ .env.example
├── 🐙 docker-compose.yml
└── 📖 DEPLOY.md
```

### 7. **Notas Importantes**

- **Migraciones**: Se ejecutan automáticamente al iniciar el contenedor
- **Uploads**: El directorio `uploads/` está configurado como volumen persistente
- **Puppeteer**: Configurado para usar Chromium del sistema (optimización de tamaño)
- **Seguridad**: Usuario no-root para mayor seguridad

### 8. **Testing Local**

Para probar localmente antes del deploy:

```bash
# Construir imagen
docker build -t multilimp-backend .

# Ejecutar con docker-compose
docker-compose up -d

# Ver logs
docker-compose logs -f app
```

### 9. **Troubleshooting**

- **Error de migraciones**: Verificar `DATABASE_URL` y conexión a PostgreSQL
- **Error de Puppeteer**: Verificar que las variables de entorno estén configuradas
- **Error de archivos**: Verificar permisos del directorio `uploads/`

### 10. **Performance**

- El contenedor está optimizado para producción
- Multi-stage build para reducir tamaño
- Dependencias de desarrollo excluidas en producción
