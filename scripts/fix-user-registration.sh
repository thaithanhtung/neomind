#!/bin/bash

# Script để fix lỗi user registration
# Issue: Database error saving new user do trigger bị block bởi RLS

echo "🔧 Fixing User Registration Issue..."
echo ""

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Check if SUPABASE_DB_URL is set
if [ -z "$SUPABASE_DB_URL" ]; then
  echo "❌ Error: SUPABASE_DB_URL not found in .env file"
  echo ""
  echo "Vui lòng thêm SUPABASE_DB_URL vào file .env:"
  echo "SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"
  echo ""
  exit 1
fi

echo "📋 Migration sẽ thực hiện:"
echo "  1. ✅ Fix RLS policy cho user_profiles"
echo "  2. ✅ Update trigger function với SECURITY DEFINER"
echo "  3. ✅ Thêm exception handling"
echo "  4. ✅ Verify existing users"
echo ""

read -p "Tiếp tục? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Cancelled"
  exit 1
fi

echo ""
echo "🚀 Running migration..."
echo ""

# Run migration
psql "$SUPABASE_DB_URL" -f supabase/migrations/006_fix_user_profile_trigger.sql

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Migration completed successfully!"
  echo ""
  echo "📊 Summary:"
  echo "  ✅ Fixed trigger function to bypass RLS"
  echo "  ✅ Added error handling"
  echo "  ✅ Updated RLS policies"
  echo ""
  echo "🧪 Test registration:"
  echo "  1. Thử đăng ký user mới"
  echo "  2. Check console - không còn error"
  echo "  3. Verify profile được tạo tự động"
  echo ""
  echo "🎉 Ready to use!"
else
  echo ""
  echo "❌ Migration failed!"
  echo ""
  echo "Troubleshooting:"
  echo "  1. Check SUPABASE_DB_URL trong .env"
  echo "  2. Verify database connection"
  echo "  3. Check migration file syntax"
  echo ""
  exit 1
fi
