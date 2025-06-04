#!/bin/bash

# Pre-Deploy Checklist para MULTILIMP SAC Backend
echo "🔍 VERIFICACIÓN PRE-DEPLOY - MULTILIMP SAC"
echo "========================================="

# 1. Verificar archivos críticos
echo "✅ Archivos de configuración:"
if [ -f "Dockerfile" ]; then echo "  ✓ Dockerfile"; else echo "  ❌ Dockerfile FALTANTE"; fi
if [ -f "package.json" ]; then echo "  ✓ package.json"; else echo "  ❌ package.json FALTANTE"; fi
if [ -f "tsconfig.json" ]; then echo "  ✓ tsconfig.json"; else echo "  ❌ tsconfig.json FALTANTE"; fi
if [ -f "prisma/schema.prisma" ]; then echo "  ✓ prisma/schema.prisma"; else echo "  ❌ schema.prisma FALTANTE"; fi
if [ -f "index.ts" ]; then echo "  ✓ index.ts"; else echo "  ❌ index.ts FALTANTE"; fi

echo ""
echo "🔧 CONFIGURACIÓN EN DOKPLOY:"
echo "============================="
echo "Build Type: Dockerfile"
echo "Port: 5000"
echo ""
echo "📋 VARIABLES DE ENTORNO REQUERIDAS:"
echo "DATABASE_URL=postgresql://usuario:password@host:5432/db"
echo "DIRECT_URL=postgresql://usuario:password@host:5432/db"
echo "JWT_SECRET=secreto_muy_largo_32_caracteres_minimo"
echo "JWT_EXPIRES_IN=36000"
echo "AWS_ACCESS_KEY_ID=tu_key"
echo "AWS_SECRET_ACCESS_KEY=tu_secret"
echo "AWS_S3_BUCKET=tu_bucket"
echo "AWS_S3_ENDPOINT=https://tu-endpoint.r2.cloudflarestorage.com"
echo "R2_PUBLIC_URL=https://tu-dominio.com"
echo "PORT=5000"
echo "NODE_ENV=production"
echo "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true"
echo "PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser"
echo ""
echo "🎯 TODO LISTO PARA DEPLOY"
echo "========================="
echo "1. Sube tu código a Dokploy"
echo "2. Selecciona 'Dockerfile' como Build Type"
echo "3. Configura las variables de entorno"
echo "4. ¡Deploy!"
