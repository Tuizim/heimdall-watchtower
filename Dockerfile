# ─────────────────────────────────────────────
# Dependencies
# ─────────────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci

# ─────────────────────────────────────────────
# Builder
# ─────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

# Prisma generate
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate

# Build
RUN npm run build

# ─────────────────────────────────────────────
# Production
# ─────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache netcat-openbsd

COPY package*.json ./

RUN npm ci --omit=dev

# Build files
COPY --from=builder /app/dist ./dist

# Prisma
COPY --from=builder /app/prisma ./prisma

# Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Entrypoint
COPY entrypoint.sh ./entrypoint.sh

RUN chmod +x entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]