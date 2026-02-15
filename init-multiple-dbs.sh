#!/bin/bash
set -e

until PGPASSWORD=$POSTGRESQL_PASSWORD psql -U "$POSTGRESQL_USERNAME" -d "$POSTGRESQL_DATABASE" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - creating hospital database"

PGPASSWORD=$POSTGRESQL_PASSWORD psql -U "$POSTGRESQL_USERNAME" -d "$POSTGRESQL_DATABASE" <<-EOSQL
    SELECT 'CREATE DATABASE hospital'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'hospital')\gexec
EOSQL

echo "Database 'hospital' created successfully!"
