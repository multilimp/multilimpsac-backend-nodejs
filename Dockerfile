FROM node:18-alpine AS base

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package.json ./
COPY prisma ./prisma/

RUN npm ci --only=production
RUN npx prisma generate
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/prisma ./prisma

RUN mkdir -p uploads/temp && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

ENV NODE_ENV=production \
    PORT=5000 \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]