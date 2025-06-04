# Etapa base
FROM node:18-alpine AS base

# Instalar dependencias del sistema necesarias para Prisma y Puppeteer
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Configurar Puppeteer para usar Chromium instalado
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci --only=production

# Generar cliente Prisma
RUN npx prisma generate

# Instalar dependencias de desarrollo para build
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS runner

# Instalar dependencias del sistema para producción
RUN apk add --no-cache \
    openssl \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Configurar Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Crear usuario no root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copiar archivos compilados y dependencias desde la etapa base
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/prisma ./prisma

# Crear directorio de uploads
RUN mkdir -p uploads/temp && \
    chown -R nodejs:nodejs /app

USER nodejs

# Exponer puerto
EXPOSE 5000

# Variables de entorno por defecto
ENV NODE_ENV=production \
    PORT=5000

# Comando de inicio: ejecutar migraciones y iniciar servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
