-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bảng mind_maps (mỗi user có thể có nhiều mind maps)
-- user_id sẽ được thay đổi thành UUID trong migration 002
CREATE TABLE IF NOT EXISTS mind_maps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
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
CREATE TRIGGER update_mind_maps_updated_at BEFORE UPDATE ON mind_maps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update updated_at for nodes
CREATE TRIGGER update_nodes_updated_at BEFORE UPDATE ON nodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - Disabled for now to allow anonymous access
-- Uncomment and configure when you add authentication
-- ALTER TABLE mind_maps ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE edges ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE highlighted_texts ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users (uncomment when adding auth)
-- CREATE POLICY "Users can view their own mind maps"
--   ON mind_maps FOR SELECT
--   USING (auth.uid()::text = user_id OR user_id = 'anonymous');
--
-- CREATE POLICY "Users can create their own mind maps"
--   ON mind_maps FOR INSERT
--   WITH CHECK (auth.uid()::text = user_id OR user_id = 'anonymous');
--
-- CREATE POLICY "Users can update their own mind maps"
--   ON mind_maps FOR UPDATE
--   USING (auth.uid()::text = user_id OR user_id = 'anonymous');
--
-- CREATE POLICY "Users can delete their own mind maps"
--   ON mind_maps FOR DELETE
--   USING (auth.uid()::text = user_id OR user_id = 'anonymous');

