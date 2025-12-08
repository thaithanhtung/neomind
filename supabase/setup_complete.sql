-- ============================================
-- Complete Database Setup Script for NeoMind
-- ============================================
-- Chạy script này trong Supabase SQL Editor để setup toàn bộ database
-- File này bao gồm cả migration 001 và 002

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Migration 001: Initial Schema
-- ============================================

-- Bảng mind_maps (mỗi user có thể có nhiều mind maps)
CREATE TABLE IF NOT EXISTS mind_maps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Mind Map',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng nodes
CREATE TABLE IF NOT EXISTS nodes (
  id TEXT PRIMARY KEY,
  mind_map_id UUID NOT NULL REFERENCES mind_maps(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'custom',
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  width INTEGER NOT NULL DEFAULT 400,
  height INTEGER NOT NULL DEFAULT 300,
  label TEXT NOT NULL,
  content TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 0,
  parent_id TEXT REFERENCES nodes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng edges
CREATE TABLE IF NOT EXISTS edges (
  id TEXT PRIMARY KEY,
  mind_map_id UUID NOT NULL REFERENCES mind_maps(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  target_id TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'smoothstep',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng highlighted_texts
CREATE TABLE IF NOT EXISTS highlighted_texts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  start_index INTEGER NOT NULL,
  end_index INTEGER NOT NULL,
  target_node_id TEXT REFERENCES nodes(id) ON DELETE SET NULL,
  level INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes để tối ưu query
CREATE INDEX IF NOT EXISTS idx_nodes_mind_map_id ON nodes(mind_map_id);
CREATE INDEX IF NOT EXISTS idx_nodes_parent_id ON nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_edges_mind_map_id ON edges(mind_map_id);
CREATE INDEX IF NOT EXISTS idx_edges_source_id ON edges(source_id);
CREATE INDEX IF NOT EXISTS idx_edges_target_id ON edges(target_id);
CREATE INDEX IF NOT EXISTS idx_highlighted_texts_node_id ON highlighted_texts(node_id);
CREATE INDEX IF NOT EXISTS idx_mind_maps_user_id ON mind_maps(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at for mind_maps
DROP TRIGGER IF EXISTS update_mind_maps_updated_at ON mind_maps;
CREATE TRIGGER update_mind_maps_updated_at BEFORE UPDATE ON mind_maps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update updated_at for nodes
DROP TRIGGER IF EXISTS update_nodes_updated_at ON nodes;
CREATE TRIGGER update_nodes_updated_at BEFORE UPDATE ON nodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Migration 002: Enable RLS và Policies
-- ============================================

-- Enable Row Level Security
ALTER TABLE mind_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlighted_texts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies nếu có
DROP POLICY IF EXISTS "Users can view their own mind maps" ON mind_maps;
DROP POLICY IF EXISTS "Users can create their own mind maps" ON mind_maps;
DROP POLICY IF EXISTS "Users can update their own mind maps" ON mind_maps;
DROP POLICY IF EXISTS "Users can delete their own mind maps" ON mind_maps;

DROP POLICY IF EXISTS "Users can view nodes in their mind maps" ON nodes;
DROP POLICY IF EXISTS "Users can create nodes in their mind maps" ON nodes;
DROP POLICY IF EXISTS "Users can update nodes in their mind maps" ON nodes;
DROP POLICY IF EXISTS "Users can delete nodes in their mind maps" ON nodes;

DROP POLICY IF EXISTS "Users can view edges in their mind maps" ON edges;
DROP POLICY IF EXISTS "Users can create edges in their mind maps" ON edges;
DROP POLICY IF EXISTS "Users can update edges in their mind maps" ON edges;
DROP POLICY IF EXISTS "Users can delete edges in their mind maps" ON edges;

DROP POLICY IF EXISTS "Users can view highlighted texts in their mind maps" ON highlighted_texts;
DROP POLICY IF EXISTS "Users can create highlighted texts in their mind maps" ON highlighted_texts;
DROP POLICY IF EXISTS "Users can update highlighted texts in their mind maps" ON highlighted_texts;
DROP POLICY IF EXISTS "Users can delete highlighted texts in their mind maps" ON highlighted_texts;

-- Policies cho mind_maps
CREATE POLICY "Users can view their own mind maps"
  ON mind_maps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mind maps"
  ON mind_maps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mind maps"
  ON mind_maps FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mind maps"
  ON mind_maps FOR DELETE
  USING (auth.uid() = user_id);

-- Policies cho nodes (thông qua mind_map_id)
CREATE POLICY "Users can view nodes in their mind maps"
  ON nodes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mind_maps 
      WHERE mind_maps.id = nodes.mind_map_id 
      AND mind_maps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create nodes in their mind maps"
  ON nodes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mind_maps 
      WHERE mind_maps.id = nodes.mind_map_id 
      AND mind_maps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update nodes in their mind maps"
  ON nodes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM mind_maps 
      WHERE mind_maps.id = nodes.mind_map_id 
      AND mind_maps.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mind_maps 
      WHERE mind_maps.id = nodes.mind_map_id 
      AND mind_maps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete nodes in their mind maps"
  ON nodes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM mind_maps 
      WHERE mind_maps.id = nodes.mind_map_id 
      AND mind_maps.user_id = auth.uid()
    )
  );

-- Policies cho edges (thông qua mind_map_id)
CREATE POLICY "Users can view edges in their mind maps"
  ON edges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mind_maps 
      WHERE mind_maps.id = edges.mind_map_id 
      AND mind_maps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create edges in their mind maps"
  ON edges FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mind_maps 
      WHERE mind_maps.id = edges.mind_map_id 
      AND mind_maps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update edges in their mind maps"
  ON edges FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM mind_maps 
      WHERE mind_maps.id = edges.mind_map_id 
      AND mind_maps.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mind_maps 
      WHERE mind_maps.id = edges.mind_map_id 
      AND mind_maps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete edges in their mind maps"
  ON edges FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM mind_maps 
      WHERE mind_maps.id = edges.mind_map_id 
      AND mind_maps.user_id = auth.uid()
    )
  );

-- Policies cho highlighted_texts (thông qua node_id -> mind_map_id)
CREATE POLICY "Users can view highlighted texts in their mind maps"
  ON highlighted_texts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM nodes
      JOIN mind_maps ON mind_maps.id = nodes.mind_map_id
      WHERE nodes.id = highlighted_texts.node_id
      AND mind_maps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create highlighted texts in their mind maps"
  ON highlighted_texts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM nodes
      JOIN mind_maps ON mind_maps.id = nodes.mind_map_id
      WHERE nodes.id = highlighted_texts.node_id
      AND mind_maps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update highlighted texts in their mind maps"
  ON highlighted_texts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM nodes
      JOIN mind_maps ON mind_maps.id = nodes.mind_map_id
      WHERE nodes.id = highlighted_texts.node_id
      AND mind_maps.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM nodes
      JOIN mind_maps ON mind_maps.id = nodes.mind_map_id
      WHERE nodes.id = highlighted_texts.node_id
      AND mind_maps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete highlighted texts in their mind maps"
  ON highlighted_texts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM nodes
      JOIN mind_maps ON mind_maps.id = nodes.mind_map_id
      WHERE nodes.id = highlighted_texts.node_id
      AND mind_maps.user_id = auth.uid()
    )
  );

-- ============================================
-- Setup Complete!
-- ============================================
-- Sau khi chạy script này, refresh schema cache trong Supabase:
-- 1. Vào Settings > API
-- 2. Click "Refresh Schema Cache" hoặc đợi vài phút để tự động refresh

