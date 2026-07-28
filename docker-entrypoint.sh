#!/usr/bin/env sh
set -eu

echo "Waiting for PostgreSQL..."

until pg_isready -d "$DATABASE_URL"
do
    sleep 2
done

echo "Database is ready."

echo "Running migrations..."
npm run migrate

echo "Starting Pulse Monitor..."

exec npm start