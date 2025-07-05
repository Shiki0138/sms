#!/bin/bash

echo "🗑️  Resetting database and adding comprehensive dummy data..."

cd /Users/MBP/LINE/backend

# Remove the database file
echo "📂 Removing existing database..."
rm -f dev.db

# Reset the schema
echo "🔄 Recreating database schema..."
npx prisma db push

# Run auto-message migration
echo "📮 Setting up auto-message system..."
npx ts-node scripts/migrate-auto-messages.ts

# Seed with comprehensive dummy data
echo "🌱 Seeding comprehensive dummy data..."
npx ts-node scripts/seed.ts

echo "✅ Database reset and seeded successfully!"
echo ""
echo "📊 Full dataset now includes:"
echo "   • 15 diverse customers with detailed profiles"
echo "   • 10+ message threads across LINE & Instagram"
echo "   • 25+ realistic messages in Japanese"
echo "   • 20+ reservations with various statuses"
echo "   • 6 staff members with different roles"
echo "   • Multiple tags and message templates"
echo "   • Auto-message templates and settings"
echo ""
echo "🌐 Access the system at: http://localhost:4003"