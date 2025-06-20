# Multi-stage build para MULTILIMP
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Instalar todas las dependencias (incluyendo dev)
RUN npm ci

# Generar cliente Prisma
RUN npx prisma generate

# Copiar código fuente
COPY src ./src/
COPY index.ts ./

# Compilar TypeScript
RUN npm run build

# Verificar que el build fue exitoso
RUN ls -la dist/ && test -f dist/index.js

# ===== STAGE 2: Production =====
FROM node:20-alpine AS production

WORKDIR /app

# Instalar solo dependencias de producción
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar archivos compilados
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S multilimp -u 1001 -G nodejs

RUN chown -R multilimp:nodejs /app
USER multilimp

# Exponer puerto
EXPOSE 5000

# Health check para MULTILIMP
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando con migraciones automáticas
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]