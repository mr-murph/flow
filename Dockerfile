FROM node:20-alpine AS base

# Installiamo OpenSSL
RUN apk add --no-cache openssl libc6-compat
# Installiamo PNPM
RUN npm install -g pnpm

WORKDIR /app

# Copiamo tutto il progetto
COPY . .

# Installiamo dipendenze
RUN pnpm install --no-frozen-lockfile

# Generiamo il client Prisma
RUN npx prisma generate --schema=/app/packages/db/prisma/schema.prisma

# --- BACKEND BUILDER ---
FROM base AS backend-builder
WORKDIR /app
RUN pnpm --filter=api build

# --- BACKEND RUNNER ---
FROM node:20-alpine AS backend-runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl libc6-compat
USER node
COPY --from=base --chown=node:node /app/node_modules ./node_modules
COPY --from=backend-builder --chown=node:node /app/apps/api/dist ./dist
COPY --from=base --chown=node:node /app/packages ./packages
CMD ["node", "dist/main"]

# --- FRONTEND BUILDER ---
FROM base AS frontend-builder
WORKDIR /app
ENV NODE_ENV=production
# Next.js build needs to know it's production
RUN pnpm --filter=web build

# --- FRONTEND RUNNER ---
FROM node:20-alpine AS frontend-runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache libc6-compat
USER node

# Copy standalone output
COPY --from=frontend-builder --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=frontend-builder --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=frontend-builder --chown=node:node /app/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
