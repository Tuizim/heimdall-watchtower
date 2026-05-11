# ─────────────────────────────────────────────
# Stage 1: Install all dependencies
# ─────────────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci

# ─────────────────────────────────────────────
# Stage 2: Development (docker-compose.yml)
# ─────────────────────────────────────────────
FROM node:22-alpine AS development

WORKDIR /app

ENV NODE_ENV=development

RUN apk add --no-cache netcat-openbsd

COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000

# Code is mounted via volume; command set in docker-compose.yml

# ─────────────────────────────────────────────
# Stage 3: Build frontend (Vite)
# ─────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate

RUN npm run build

# ─────────────────────────────────────────────
# Stage 4: Production runtime
# ─────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache netcat-openbsd

# Production deps only (tsx is now in dependencies)
COPY package*.json ./
RUN npm ci --omit=dev

# Frontend build (Vite output)
COPY --from=builder /app/dist ./dist

# Backend source (tsx runs it directly — no compile step needed)
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/api ./api

# Prisma schema + migrations
COPY --from=builder /app/prisma ./prisma

# Prisma generated client (overwrite stubs installed by npm ci)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
