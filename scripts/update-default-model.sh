#!/bin/bash

# Script để update default AI model sang gpt-5-nano
# Lý do: gpt-5-nano rẻ hơn, phù hợp làm default

echo "🔄 Updating Default AI Model to gpt-5-nano..."
echo ""

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Check if SUPABASE_DB_URL is set
if [ -z "$SUPABASE_DB_URL" ]; then
  echo "❌ Error: SUPABASE_DB_URL not found in .env file"
  echo ""
  echo "Vui lòng thêm SUPABASE_DB_URL vào file .env"
  exit 1
fi

echo "📋 Migration sẽ thực hiện:"
echo "  1. ✅ Update table default: gpt-5-mini → gpt-5-nano"
echo "  2. ✅ Update trigger function"
echo "  3. ⚠️  Option: Migrate existing users (commented out)"
echo ""
echo "💰 Lý do đổi:"
echo "  - gpt-5-nano: $0.01 / 1K tokens (rẻ nhất)"
echo "  - gpt-5-mini: $0.05 / 1K tokens"
echo "  - gpt-5: $0.15 / 1K tokens"
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
psql "$SUPABASE_DB_URL" -f supabase/migrations/007_update_default_model_to_nano.sql

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Migration completed successfully!"
  echo ""
  echo "📊 Summary:"
  echo "  ✅ Default model: gpt-5-nano"
  echo "  ✅ Trigger updated"
  echo "  ⚠️  Existing users: KHÔNG thay đổi (giữ nguyên setting)"
  echo ""
  echo "💡 Nếu muốn migrate existing users:"
  echo "  1. Uncomment dòng UPDATE trong migration file"
  echo "  2. Chạy lại migration"
  echo ""
  echo "🧪 Test:"
  echo "  1. Đăng ký user mới"
  echo "  2. Check user_profiles → ai_model = 'gpt-5-nano'"
  echo ""
  echo "🎉 Done!"
else
  echo ""
  echo "❌ Migration failed!"
  echo ""
  exit 1
fi
