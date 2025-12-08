import { createClient } from '@supabase/supabase-js';
import { Node, Edge } from 'reactflow';
import { NodeData, HighlightedText } from '@/features/mindmap/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Types
export interface MindMap {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

// Types for database rows
interface NodeRow {
  id: string;
  mind_map_id: string;
  type: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  label: string;
  content: string;
  level: number;
  parent_id: string | null;
}

interface EdgeRow {
  id: string;
  mind_map_id: string;
  source_id: string;
  target_id: string;
  type: string;
}

interface HighlightedTextRow {
  id: string;
  node_id: string;
  start_index: number;
  end_index: number;
  target_node_id: string | null;
  level: number;
}

/**
 * Convert ReactFlow Node to database row format
 */
const nodeToRow = (node: Node<NodeData>, mindMapId: string): NodeRow => ({
  id: node.id,
  mind_map_id: mindMapId,
  type: node.type || 'custom',
  position_x: node.position.x,
  position_y: node.position.y,
  width: node.width || node.data.width || 400,
  height: node.height || node.data.height || 300,
  label: node.data.label,
  content: node.data.content,
  level: node.data.level,
  parent_id: node.data.parentId || null,
});

/**
 * Convert database row to ReactFlow Node
 */
const rowToNode = (row: NodeRow): Node<NodeData> => ({
  id: row.id,
  type: row.type,
  position: { x: row.position_x, y: row.position_y },
  width: row.width,
  height: row.height,
  data: {
    id: row.id,
    label: row.label,
    content: row.content,
    level: row.level,
    parentId: row.parent_id || undefined,
    width: row.width,
    height: row.height,
  },
  selected: false,
});

/**
 * Mind Map Service - Handle all database operations
 */
export const mindMapService = {
  /**
   * Load mind map data from Supabase
   */
  async loadMindMap(mindMapId: string): Promise<{
    nodes: Node<NodeData>[];
    edges: Edge[];
    highlightedTexts: Map<string, HighlightedText[]>;
  } | null> {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase not configured, returning null');
      return null;
    }

    try {
      // Load nodes
      const { data: nodesData, error: nodesError } = await supabase
        .from('nodes')
        .select('*')
        .eq('mind_map_id', mindMapId)
        .order('created_at', { ascending: true });

      if (nodesError) {
        console.error('Error loading nodes:', nodesError);
        throw nodesError;
      }

      // Load edges
      const { data: edgesData, error: edgesError } = await supabase
        .from('edges')
        .select('*')
        .eq('mind_map_id', mindMapId);

      if (edgesError) {
        console.error('Error loading edges:', edgesError);
        throw edgesError;
      }

      // Load highlighted texts
      const { data: highlightsData, error: highlightsError } = await supabase
        .from('highlighted_texts')
        .select('*')
        .in('node_id', nodesData?.map((n) => n.id) || []);

      if (highlightsError) {
        console.error('Error loading highlighted texts:', highlightsError);
        throw highlightsError;
      }

      // Convert to ReactFlow format
      const nodes = (nodesData || []).map(rowToNode);
      const edges: Edge[] = (edgesData || []).map((row) => ({
        id: row.id,
        source: row.source_id,
        target: row.target_id,
        type: row.type,
      }));

      // Convert highlighted texts to Map
      const highlightedTexts = new Map<string, HighlightedText[]>();
      (highlightsData || []).forEach((row) => {
        const existing = highlightedTexts.get(row.node_id) || [];
        highlightedTexts.set(row.node_id, [
          ...existing,
          {
            startIndex: row.start_index,
            endIndex: row.end_index,
            nodeId: row.target_node_id || '',
            level: row.level,
          },
        ]);
      });

      return { nodes, edges, highlightedTexts };
    } catch (error) {
      console.error('Error loading mind map:', error);
      return null;
    }
  },

  /**
   * Save mind map data to Supabase
   */
  async saveMindMap(
    mindMapId: string,
    nodes: Node<NodeData>[],
    edges: Edge[],
    highlightedTexts: Map<string, HighlightedText[]>
  ): Promise<boolean> {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase not configured, skipping save');
      return false;
    }

    try {
      // Lọc ra các nodes không đang loading (chỉ lưu nodes đã hoàn thành)
      const completedNodes = nodes.filter((node) => !node.data.isLoading);

      // Lấy danh sách IDs của các nodes đã hoàn thành
      const completedNodeIds = new Set(completedNodes.map((n) => n.id));

      // Lấy tất cả node IDs hiện có trong database cho mind map này
      const { data: existingNodesData, error: fetchError } = await supabase
        .from('nodes')
        .select('id')
        .eq('mind_map_id', mindMapId);

      if (fetchError) {
        console.error('Error fetching existing nodes:', fetchError);
        // Continue anyway, không critical
      }

      // Tìm các nodes cần xóa (có trong database nhưng không còn trong state)
      const existingNodeIds = new Set(
        existingNodesData?.map((n) => n.id) || []
      );
      const nodesToDelete = Array.from(existingNodeIds).filter(
        (id) => !completedNodeIds.has(id)
      );

      // Xóa các nodes không còn trong state khỏi database
      if (nodesToDelete.length > 0) {
        const { error: deleteNodesError } = await supabase
          .from('nodes')
          .delete()
          .in('id', nodesToDelete);

        if (deleteNodesError) {
          console.error('Error deleting nodes:', deleteNodesError);
          throw deleteNodesError;
        }
      }

      // Lọc ra các edges chỉ liên quan đến nodes đã hoàn thành
      const validEdges = edges.filter(
        (edge) =>
          completedNodeIds.has(edge.source) && completedNodeIds.has(edge.target)
      );

      // Convert and upsert nodes (chỉ các nodes đã hoàn thành)
      const nodeRows = completedNodes.map((node) => nodeToRow(node, mindMapId));

      if (nodeRows.length > 0) {
        const { error: nodesError } = await supabase
          .from('nodes')
          .upsert(nodeRows, { onConflict: 'id' });

        if (nodesError) {
          console.error('Error saving nodes:', nodesError);
          throw nodesError;
        }
      }

      // Convert and upsert edges (chỉ các edges hợp lệ)
      const edgeRows: EdgeRow[] = validEdges.map((edge) => ({
        id: edge.id,
        mind_map_id: mindMapId,
        source_id: edge.source,
        target_id: edge.target,
        type: edge.type || 'smoothstep',
      }));

      if (edgeRows.length > 0) {
        const { error: edgesError } = await supabase
          .from('edges')
          .upsert(edgeRows, { onConflict: 'id' });

        if (edgesError) {
          console.error('Error saving edges:', edgesError);
          throw edgesError;
        }
      }

      // Xóa các edges không còn trong state khỏi database
      const { data: existingEdgesData, error: fetchEdgesError } = await supabase
        .from('edges')
        .select('id')
        .eq('mind_map_id', mindMapId);

      if (fetchEdgesError) {
        console.error('Error fetching existing edges:', fetchEdgesError);
        // Continue anyway
      } else {
        const existingEdgeIds = new Set(
          existingEdgesData?.map((e) => e.id) || []
        );
        const validEdgeIds = new Set(validEdges.map((e) => e.id));
        const edgesToDelete = Array.from(existingEdgeIds).filter(
          (id) => !validEdgeIds.has(id)
        );

        if (edgesToDelete.length > 0) {
          const { error: deleteEdgesError } = await supabase
            .from('edges')
            .delete()
            .in('id', edgesToDelete);

          if (deleteEdgesError) {
            console.error('Error deleting edges:', deleteEdgesError);
            // Continue anyway, không critical
          }
        }
      }

      // Delete old highlighted texts for completed nodes only
      if (completedNodeIds.size > 0) {
        const { error: deleteError } = await supabase
          .from('highlighted_texts')
          .delete()
          .in('node_id', Array.from(completedNodeIds));

        if (deleteError) {
          console.error('Error deleting old highlights:', deleteError);
          // Continue anyway, not critical
        }
      }

      // Insert new highlighted texts (chỉ cho các nodes đã hoàn thành)
      const highlightRows: HighlightedTextRow[] = [];
      highlightedTexts.forEach((highlights, nodeId) => {
        // Chỉ lưu highlights của các nodes đã hoàn thành
        if (completedNodeIds.has(nodeId)) {
          highlights.forEach((highlight) => {
            // Chỉ lưu highlight nếu target node cũng đã hoàn thành hoặc null
            if (!highlight.nodeId || completedNodeIds.has(highlight.nodeId)) {
              highlightRows.push({
                id: crypto.randomUUID(),
                node_id: nodeId,
                start_index: highlight.startIndex,
                end_index: highlight.endIndex,
                target_node_id: highlight.nodeId || null,
                level: highlight.level,
              });
            }
          });
        }
      });

      if (highlightRows.length > 0) {
        const { error: highlightsError } = await supabase
          .from('highlighted_texts')
          .insert(highlightRows);

        if (highlightsError) {
          console.error('Error saving highlighted texts:', highlightsError);
          throw highlightsError;
        }
      }

      // Update mind_map updated_at timestamp
      const { error: updateError } = await supabase
        .from('mind_maps')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', mindMapId);

      if (updateError) {
        console.warn('Error updating mind_map timestamp:', updateError);
        // Not critical, continue
      }

      return true;
    } catch (error) {
      console.error('Error saving mind map:', error);
      return false;
    }
  },

  /**
   * Create a new mind map
   */
  async createMindMap(
    title: string = 'Untitled Mind Map',
    userId?: string
  ): Promise<string | null> {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase not configured, cannot create mind map');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('mind_maps')
        .insert({
          title,
          user_id: userId,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating mind map:', error);
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error creating mind map:', error);
      return null;
    }
  },

  /**
   * Get list of all mind maps for a user
   */
  async getMindMaps(userId: string): Promise<MindMap[]> {
    if (!supabaseUrl || !supabaseAnonKey) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('mind_maps')
        .select('id, title, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching mind maps:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getMindMaps:', error);
      return [];
    }
  },

  /**
   * Update mind map title
   */
  async updateMindMapTitle(mindMapId: string, title: string): Promise<boolean> {
    if (!supabaseUrl || !supabaseAnonKey) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('mind_maps')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', mindMapId);

      if (error) {
        console.error('Error updating mind map title:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in updateMindMapTitle:', error);
      return false;
    }
  },

  /**
   * Delete mind map
   */
  async deleteMindMap(mindMapId: string): Promise<boolean> {
    if (!supabaseUrl || !supabaseAnonKey) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('mind_maps')
        .delete()
        .eq('id', mindMapId);

      if (error) {
        console.error('Error deleting mind map:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteMindMap:', error);
      return false;
    }
  },

  /**
   * Get or create default mind map (for single mind map app)
   * @deprecated Use getMindMaps and createMindMap instead
   */
  async getOrCreateDefaultMindMap(userId: string): Promise<string | null> {
    if (!supabaseUrl || !supabaseAnonKey) {
      return null;
    }

    try {
      // Try to get existing mind map
      const { data: existing, error: selectError } = await supabase
        .from('mind_maps')
        .select('id')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (selectError && selectError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned", which is fine
        console.error('Error fetching mind map:', selectError);
        throw selectError;
      }

      if (existing) {
        return existing.id;
      }

      // Create new one if doesn't exist
      return await mindMapService.createMindMap('My Mind Map', userId);
    } catch (error) {
      console.error('Error in getOrCreateDefaultMindMap:', error);
      return null;
    }
  },
};
