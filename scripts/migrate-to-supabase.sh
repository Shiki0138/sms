#!/bin/bash

# Supabase Migration Script
# データベーススキーマとテストデータをSupabaseに投入

set -e

# 環境変数読み込み
source ../frontend/.env.production

# Supabase接続情報
SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"
SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY"

# PostgreSQL接続用URLを構築（Supabaseプロジェクト情報から）
# URL形式: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
PROJECT_REF="fqwdbywgknavgwqpnlkj"
# パスワードはSupabaseダッシュボードから取得が必要

echo "🔧 Supabase Database Migration Script"
echo "======================================"
echo "Project: $PROJECT_REF"
echo "URL: $SUPABASE_URL"

echo ""
echo "⚠️  Database password required!"
echo "Please get the database password from Supabase Dashboard:"
echo "1. Go to https://app.supabase.com/project/$PROJECT_REF/settings/database"
echo "2. Copy the database password"
echo "3. Run this script with password:"
echo ""
echo "PGPASSWORD=your_password ./migrate-to-supabase.sh"
echo ""

if [ -z "$PGPASSWORD" ]; then
    echo "❌ PGPASSWORD environment variable not set"
    exit 1
fi

DB_URL="postgresql://postgres:$PGPASSWORD@db.$PROJECT_REF.supabase.co:5432/postgres"

echo "🔍 Testing database connection..."
if /usr/local/opt/postgresql@14/bin/psql "$DB_URL" -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    exit 1
fi

echo ""
echo "📊 Running schema migration..."
if /usr/local/opt/postgresql@14/bin/psql "$DB_URL" -f ../supabase/schema.sql; then
    echo "✅ Schema migration completed"
else
    echo "❌ Schema migration failed"
    exit 1
fi

echo ""
echo "🌱 Inserting test data..."
if /usr/local/opt/postgresql@14/bin/psql "$DB_URL" -f ../supabase/seed-test-users.sql; then
    echo "✅ Test data insertion completed"
else
    echo "❌ Test data insertion failed"
    exit 1
fi

echo ""
echo "🔍 Verifying data..."
echo "Tenants count:"
/usr/local/opt/postgresql@14/bin/psql "$DB_URL" -c "SELECT COUNT(*) FROM tenants;"

echo "Staff count:"
/usr/local/opt/postgresql@14/bin/psql "$DB_URL" -c "SELECT COUNT(*) FROM staff;"

echo "Customers count:"
/usr/local/opt/postgresql@14/bin/psql "$DB_URL" -c "SELECT COUNT(*) FROM customers;"

echo ""
echo "🎉 Migration completed successfully!"
echo "✅ Database schema created"
echo "✅ Test data inserted"
echo "✅ 20 test users available (password: TestUser2024!)"