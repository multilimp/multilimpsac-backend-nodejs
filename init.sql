-- Script de inicialización opcional para PostgreSQL
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor por primera vez

-- Configuraciones de rendimiento y límites
-- ALTER SYSTEM SET max_connections = '200';
-- ALTER SYSTEM SET shared_buffers = '256MB';
-- ALTER SYSTEM SET effective_cache_size = '1GB';
-- ALTER SYSTEM SET maintenance_work_mem = '64MB';
-- ALTER SYSTEM SET checkpoint_completion_target = '0.9';
-- ALTER SYSTEM SET wal_buffers = '16MB';
-- ALTER SYSTEM SET default_statistics_target = '100';

-- Crear usuario adicional para desarrollo (opcional)
-- CREATE USER multilimp_dev WITH PASSWORD 'dev123';
-- GRANT ALL PRIVILEGES ON DATABASE multilimp TO multilimp_dev;

-- Extensiones útiles para desarrollo
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";