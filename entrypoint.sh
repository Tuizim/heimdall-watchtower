#!/bin/sh
set -e

# prisma.config.ts loads via jiti which needs a physical .env file
echo "DATABASE_URL=${DATABASE_URL}" > /app/.env

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting server..."
exec npx tsx server.ts
