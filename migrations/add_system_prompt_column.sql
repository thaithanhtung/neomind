-- Migration: Add system_prompt column to mind_maps table
-- Run this SQL in your Supabase SQL Editor

-- Add system_prompt column to mind_maps table
ALTER TABLE mind_maps
ADD COLUMN IF NOT EXISTS system_prompt TEXT;

-- Add comment to column
COMMENT ON COLUMN mind_maps.system_prompt IS 'Custom system prompt for AI content generation per mind map';
