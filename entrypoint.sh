#!/bin/sh

set -e

echo "⏳ Waiting for database..."

until nc -z db 5432
do
  sleep 2
done

echo "✅ Database ready"

echo "🚀 Running migrations..."

npx prisma migrate deploy

echo "🚀 Starting application..."

node dist/server.js