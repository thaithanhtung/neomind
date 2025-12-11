#!/bin/bash

# Script to run sharing feature migration

echo "🚀 Running Share Mind Map Migration..."
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
    echo "3. Copy and paste the content from: supabase/migrations/003_add_sharing_feature.sql"
    echo "4. Run the SQL query"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "supabase/migrations/003_add_sharing_feature.sql" ]; then
    echo "❌ Migration file not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

echo "📦 Migration file found: supabase/migrations/003_add_sharing_feature.sql"
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
    echo "1. Verify the 'mind_map_shares' table exists in your Supabase Dashboard"
    echo "2. Check RLS policies have been updated"
    echo "3. Test the sharing feature in your app"
    echo ""
    echo "📖 For more information, see: README_SHARING.md"
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
