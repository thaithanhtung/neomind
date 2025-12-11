#!/bin/bash

# Script to setup AI Model Configuration feature

echo "🤖 Setting up AI Model Configuration..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI is not installed."
    echo "Please install it first: https://supabase.com/docs/guides/cli"
    echo ""
    echo "Or you can run the migration manually:"
    echo "1. Go to your Supabase Dashboard"
    echo "2. Navigate to SQL Editor"
    echo "3. Copy and paste the content from: supabase/migrations/005_add_user_profiles.sql"
    echo "4. Run the SQL query"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "supabase/migrations/005_add_user_profiles.sql" ]; then
    echo "❌ Migration file not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

echo "📦 Migration file found: supabase/migrations/005_add_user_profiles.sql"
echo ""

# Ask for confirmation
read -p "Do you want to proceed with the migration? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Migration cancelled."
    exit 1
fi

# Run the migration
echo "⏳ Running migration..."
supabase db push

# Check if migration was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo ""
    echo "1. Set a user as Super Admin:"
    echo "   Go to Supabase Dashboard → SQL Editor"
    echo "   Run:"
    echo ""
    echo "   UPDATE user_profiles"
    echo "   SET role = 'super_admin'"
    echo "   WHERE user_id = ("
    echo "     SELECT id FROM auth.users WHERE email = 'your-email@example.com'"
    echo "   );"
    echo ""
    echo "2. Restart your dev server:"
    echo "   yarn dev"
    echo ""
    echo "3. Login with the Super Admin user"
    echo ""
    echo "4. Open any mind map and look for 'AI Model (Super Admin)' section"
    echo ""
    echo "📖 For more information, see: README_AI_MODEL_CONFIG.md"
else
    echo ""
    echo "❌ Migration failed!"
    echo ""
    echo "Please check the error message above and:"
    echo "1. Verify your Supabase connection"
    echo "2. Check if you have proper permissions"
    echo "3. Try running the migration manually from Supabase Dashboard"
    exit 1
fi
