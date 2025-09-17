# 🐘 Base de Datos Local con Docker

Este proyecto incluye soporte completo para ejecutar PostgreSQL localmente usando Docker, permitiendo desarrollo completamente offline y control total sobre la base de datos.

## 📋 Requisitos Previos

- **Docker Desktop** instalado y ejecutándose
- **Node.js** 18+ y **npm**
- **Git** (opcional, para control de versiones)

## 🚀 Inicio Rápido

### 1. Iniciar PostgreSQL
```bash
cd multilimp-backend
docker-compose up -d
```

### 2. Verificar estado
```bash
docker ps
```
Deberías ver: `multilimp-postgres` en estado `Up`

### 3. Ejecutar migraciones de Prisma
```bash
npm run migrate:dev
```

### 4. Iniciar el backend
```bash
npm run dev
```

### 5. Iniciar el frontend (en otra terminal)
```bash
cd ../multilimp-frontend
npm run dev
```

## 🔧 Configuración de Conexión

### Variables de Entorno (.env)
```bash
# Base de datos local con Docker
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/multilimp"
DIRECT_URL="postgresql://postgres:postgres123@localhost:5432/multilimp"
```

### Credenciales por Defecto
- **Host:** `localhost:5432`
- **Usuario:** `postgres`
- **Contraseña:** `postgres123`
- **Base de datos:** `multilimp`

## 📊 Gestión de la Base de Datos

### Conectar vía Terminal
```bash
# Conectar al contenedor
docker exec -it multilimp-postgres psql -U postgres -d multilimp

# Dentro de psql:
# \dt - Ver tablas
# \q - Salir
```

### Ver Logs en Tiempo Real
```bash
docker-compose logs -f postgres
```

### Backup de Datos
```bash
# Crear backup con timestamp
docker exec multilimp-postgres pg_dump -U postgres -d multilimp > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup comprimido
docker exec multilimp-postgres pg_dump -U postgres -d multilimp | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Restaurar Backup
```bash
# Desde archivo local
docker exec -i multilimp-postgres psql -U postgres -d multilimp < backup.sql

# Desde archivo comprimido
gunzip -c backup.sql.gz | docker exec -i multilimp-postgres psql -U postgres -d multilimp
```

### Resetear Base de Datos
```bash
# Opción 1: Recrear contenedor (pierde todos los datos)
docker-compose down -v
docker-compose up -d
npm run migrate:dev

# Opción 2: Limpiar datos manteniendo estructura
docker exec -it multilimp-postgres psql -U postgres -d multilimp -c "
TRUNCATE TABLE ordenes_proveedor, ordenes_compra, productos, clientes, proveedores RESTART IDENTITY CASCADE;
"
```

## 🔍 Troubleshooting

### Error: "Cannot connect to the Docker daemon"
```bash
# Verificar que Docker esté corriendo
docker ps

# Si no está corriendo, iniciar Docker Desktop
open -a Docker
```

### Error: "Port 5432 already in use"
```bash
# Ver qué está usando el puerto
lsof -i :5432

# Si es otro PostgreSQL, detenerlo
brew services stop postgresql@14

# O cambiar el puerto en docker-compose.yml
ports:
  - "5433:5432"  # Cambiar a 5433
```

### Error: "Database does not exist"
```bash
# Verificar que el contenedor esté creado
docker-compose ps

# Recrear si es necesario
docker-compose up -d --force-recreate
```

### Error de Conexión en la Aplicación
```bash
# Verificar conectividad
docker exec multilimp-postgres psql -U postgres -d multilimp -c "SELECT version();"

# Verificar variables de entorno
cat .env | grep DATABASE_URL

# Reiniciar backend después de cambiar .env
npm run dev
```

### Contenedor no Inicia
```bash
# Ver logs detallados
docker-compose logs postgres

# Verificar espacio en disco
df -h

# Limpiar imágenes no utilizadas
docker system prune -f
```

## 🛠️ Comandos Avanzados

### Acceder al Sistema de Archivos del Contenedor
```bash
docker exec -it multilimp-postgres bash
```

### Monitoreo de Recursos
```bash
# Ver uso de recursos del contenedor
docker stats multilimp-postgres

# Ver tamaño del volumen
docker system df -v
```

### Copiar Archivos al Contenedor
```bash
# Copiar archivo al contenedor
docker cp archivo.sql multilimp-postgres:/tmp/

# Copiar desde contenedor
docker cp multilimp-postgres:/var/lib/postgresql/data/pg_hba.conf .
```

### Ejecutar Consultas Personalizadas
```bash
# Contar registros por tabla
docker exec -it multilimp-postgres psql -U postgres -d multilimp -c "
SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del
FROM pg_stat_user_tables
ORDER BY n_tup_ins DESC;
"
```

## 🔄 Migración desde Supabase

Si necesitas migrar datos desde Supabase:

### Opción 1: Dump Completo (Recomendado)
```bash
# Crear dump desde Supabase
docker exec multilimp-postgres pg_dump "postgresql://usuario:password@host:5432/db" --no-owner --no-privileges --clean --if-exists --schema=public > supabase_dump.sql

# Restaurar en local
docker exec -i multilimp-postgres psql -U postgres -d multilimp < supabase_dump.sql
```

### Opción 2: Migración Selectiva
```bash
# Exportar tabla específica
docker exec multilimp-postgres pg_dump -U postgres -d supabase_db -t nombre_tabla --data-only > tabla.sql

# Importar tabla específica
docker exec -i multilimp-postgres psql -U postgres -d multilimp < tabla.sql
```

## 📈 Optimización y Rendimiento

### Configuraciones Recomendadas (init.sql)
```sql
-- Memoria y conexiones
ALTER SYSTEM SET max_connections = '50';
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';

-- Mantenimiento
ALTER SYSTEM SET maintenance_work_mem = '128MB';
ALTER SYSTEM SET checkpoint_completion_target = '0.9';

-- Logging
ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';
```

### Monitoreo de Consultas Lentas
```bash
-- Habilitar extensión de monitoreo
docker exec -it multilimp-postgres psql -U postgres -d multilimp -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"

-- Ver consultas más lentas
docker exec -it multilimp-postgres psql -U postgres -d multilimp -c "
SELECT query, calls, total_time, mean_time, rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
"
```

## � Despliegue en Producción

Para producción, considera usar:

### Docker Compose Completo
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: multilimp_prod
      POSTGRES_USER: prod_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
      - ./prod-init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - multilimp-network

  backend:
    build: .
    environment:
      DATABASE_URL: postgresql://prod_user:${DB_PASSWORD}@postgres:5432/multilimp_prod
    depends_on:
      - postgres
    networks:
      - multilimp-network

volumes:
  postgres_prod_data:

networks:
  multilimp-network:
```

## 📚 Referencias Útiles

- [Documentación Oficial de PostgreSQL](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [pg_dump Reference](https://www.postgresql.org/docs/current/app-pgdump.html)

## ❓ Preguntas Frecuentes

**¿Puedo usar esta configuración en Windows/Linux?**
Sí, solo cambia `open -a Docker` por el comando correspondiente de tu SO.

**¿Cómo actualizar PostgreSQL?**
Cambia la versión en `docker-compose.yml`: `image: postgres:16`

**¿Los datos persisten entre reinicios?**
Sí, gracias al volumen `postgres_data`.

**¿Cómo hacer backup automático?**
Configura un cron job o usa herramientas como `pgbackrest`.

---

**¿Necesitas ayuda con algún comando específico o tienes algún error?** Consulta la sección de Troubleshooting arriba. 🚀