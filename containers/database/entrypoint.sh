#!/bin/bash
set -e

echo "🚀 Starting Aura MariaDB with automatic initialization..."

# Start MariaDB in background
/usr/local/bin/docker-entrypoint.sh mariadbd &
MARIADB_PID=$!

# Wait for MariaDB to be ready
echo "⏳ Waiting for MariaDB to start..."
for i in {1..60}; do
    if mariadb-admin ping -h localhost -u root -p$MYSQL_ROOT_PASSWORD --silent 2>/dev/null; then
        echo "✅ MariaDB is ready!"
        break
    fi
    echo "Waiting... ($i/60)"
    sleep 2
done

# Check if database exists and is properly initialized
echo "🔍 Checking database state..."
DB_EXISTS=$(mariadb -u root -p$MYSQL_ROOT_PASSWORD -e "SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='$MYSQL_DATABASE';" -s -N 2>/dev/null || echo "")

if [ -z "$DB_EXISTS" ]; then
    echo "📋 Database doesn't exist, creating..."
    mariadb -u root -p$MYSQL_ROOT_PASSWORD -e "CREATE DATABASE $MYSQL_DATABASE;"
fi

# Check table count
TABLE_COUNT=$(mariadb -u root -p$MYSQL_ROOT_PASSWORD -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$MYSQL_DATABASE';" -s -N 2>/dev/null || echo "0")

echo "📊 Current table count: $TABLE_COUNT"

if [ "$TABLE_COUNT" -lt "30" ]; then
    echo "🔧 Running complete Aura database initialization..."
    mariadb -u root -p$MYSQL_ROOT_PASSWORD < /aura-init.sql
    
    # Verify initialization
    NEW_COUNT=$(mariadb -u root -p$MYSQL_ROOT_PASSWORD -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$MYSQL_DATABASE';" -s -N)
    echo "✅ Database initialized with $NEW_COUNT tables"
    
    if [ "$NEW_COUNT" -ge "30" ]; then
        echo "🎉 Aura database ready for Azure deployment!"
    else
        echo "❌ Database initialization incomplete"
        exit 1
    fi
else
    echo "✅ Database already properly initialized with $TABLE_COUNT tables"
fi

echo "🔄 Aura MariaDB container ready - no manual steps needed!"

# Keep MariaDB running
wait $MARIADB_PID
