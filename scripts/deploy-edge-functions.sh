#!/bin/bash

# Script to deploy Supabase Edge Functions
# Includes migration, secrets setup, and deployment

echo "🚀 Deploying Supabase Edge Functions..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found!${NC}"
    echo ""
    echo "Install with:"
    echo "  macOS: brew install supabase/tap/supabase"
    echo "  Linux: brew install supabase/tap/supabase"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI found${NC}"
echo ""

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Supabase${NC}"
    echo "Running: supabase login"
    supabase login
fi

echo -e "${GREEN}✅ Logged in to Supabase${NC}"
echo ""

# Step 1: Run migration
echo "📋 Step 1: Running database migration..."
echo ""

if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

if [ -z "$SUPABASE_DB_URL" ]; then
  echo -e "${RED}❌ SUPABASE_DB_URL not found in .env${NC}"
  echo "Please add it to .env file"
  exit 1
fi

psql "$SUPABASE_DB_URL" -f supabase/migrations/008_add_rate_limiting.sql

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Migration completed${NC}"
else
  echo -e "${RED}❌ Migration failed${NC}"
  exit 1
fi

echo ""

# Step 2: Set secrets
echo "🔐 Step 2: Setting OpenAI API Key..."
echo ""

if [ -z "$OPENAI_API_KEY" ]; then
  echo -e "${YELLOW}⚠️  OPENAI_API_KEY not found in environment${NC}"
  read -p "Enter your OpenAI API Key (sk-...): " OPENAI_API_KEY
fi

if [ -z "$OPENAI_API_KEY" ]; then
  echo -e "${RED}❌ OpenAI API key required${NC}"
  exit 1
fi

supabase secrets set OPENAI_API_KEY="$OPENAI_API_KEY"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Secret set successfully${NC}"
else
  echo -e "${RED}❌ Failed to set secret${NC}"
  exit 1
fi

echo ""

# Step 3: Deploy function
echo "🚀 Step 3: Deploying Edge Function..."
echo ""

supabase functions deploy generate-content

if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ Edge Function deployed successfully!${NC}"
else
  echo ""
  echo -e "${RED}❌ Deployment failed${NC}"
  exit 1
fi

echo ""

# Step 4: Test function
echo "🧪 Step 4: Testing Edge Function..."
echo ""

FUNCTION_URL=$(supabase functions list | grep generate-content | awk '{print $2}')

if [ -z "$FUNCTION_URL" ]; then
  echo -e "${YELLOW}⚠️  Could not get function URL. Please test manually.${NC}"
else
  echo "Function URL: $FUNCTION_URL"
  echo ""
  echo "Test with:"
  echo "curl --request POST \\"
  echo "  '$FUNCTION_URL' \\"
  echo "  --header 'Authorization: Bearer \$VITE_SUPABASE_ANON_KEY' \\"
  echo "  --header 'Content-Type: application/json' \\"
  echo "  --data '{\"prompt\": \"Test\", \"stream\": false}'"
fi

echo ""
echo "======================================"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "======================================"
echo ""
echo "Next steps:"
echo "  1. ✅ Remove VITE_OPENAI_API_KEY from .env (no longer needed)"
echo "  2. ✅ Test creating a node in the app"
echo "  3. ✅ Check console for: '🔒 Using secure Edge Function'"
echo "  4. ✅ Monitor logs: supabase functions logs generate-content"
echo ""
echo "Rate limiting:"
echo "  - Default: 1000 requests/day per user"
echo "  - Check usage: SELECT * FROM user_api_usage;"
echo ""
echo "Troubleshooting:"
echo "  - View logs: supabase functions logs generate-content --follow"
echo "  - List secrets: supabase secrets list"
echo "  - Redeploy: supabase functions deploy generate-content"
echo ""
