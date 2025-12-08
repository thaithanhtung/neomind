-- Migration để enable RLS và authentication
-- Chạy migration này sau khi đã có authentication setup

-- Thay đổi user_id từ TEXT sang UUID để match với auth.users(id)
-- Lưu ý: Nếu đã có data, cần migrate data trước
ALTER TABLE mind_maps 
  ALTER COLUMN user_id TYPE UUID USING user_id::uuid;

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

