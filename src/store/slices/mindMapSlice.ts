import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Node, Edge } from 'reactflow';
import { NodeData, HighlightedText } from '@/features/mindmap/types';
import { mindMapService } from '@/features/mindmap/services/supabaseService';
import type { MindMap } from '@/features/mindmap/services/supabaseService';

interface MindMapState {
  nodes: Node<NodeData>[];
  edges: Edge[];
  highlightedTexts: Map<string, HighlightedText[]>;
  isLoading: boolean;
  isLoadingData: boolean;
  mindMapId: string | null;
  mindMaps: MindMap[]; // Danh sách tất cả mind maps của user
  isLoadingMindMaps: boolean;
}

const initialState: MindMapState = {
  nodes: [],
  edges: [],
  highlightedTexts: new Map(),
  isLoading: false,
  isLoadingData: true,
  mindMapId: null,
  mindMaps: [],
  isLoadingMindMaps: false,
};

// Note: Map serialization is handled by Redux middleware configuration

// Async thunks
export const loadMindMapData = createAsyncThunk<
  {
    nodes: Node<NodeData>[];
    edges: Edge[];
    highlightedTexts: Map<string, HighlightedText[]>;
    mindMapId: string;
  },
  string
>('mindMap/loadData', async (mindMapId) => {
  const data = await mindMapService.loadMindMap(mindMapId);
  if (!data) {
    throw new Error('Failed to load mind map data');
  }

  return {
    ...data,
    mindMapId,
  };
});

export const loadMindMapsList = createAsyncThunk<MindMap[], string>(
  'mindMap/loadList',
  async (userId) => {
    const mindMaps = await mindMapService.getMindMaps(userId);
    return mindMaps;
  }
);

export const createNewMindMap = createAsyncThunk<
  { mindMapId: string; mindMap: MindMap },
  { userId: string; title: string }
>('mindMap/create', async ({ userId, title }) => {
  const mindMapId = await mindMapService.createMindMap(title, userId);
  if (!mindMapId) {
    throw new Error('Failed to create mind map');
  }

  // Load the created mind map
  const mindMaps = await mindMapService.getMindMaps(userId);
  const mindMap = mindMaps.find((m) => m.id === mindMapId);
  if (!mindMap) {
    throw new Error('Failed to find created mind map');
  }

  return { mindMapId, mindMap };
});

export const updateMindMapTitle = createAsyncThunk<
  { mindMapId: string; title: string },
  { mindMapId: string; title: string }
>('mindMap/updateTitle', async ({ mindMapId, title }) => {
  const success = await mindMapService.updateMindMapTitle(mindMapId, title);
  if (!success) {
    throw new Error('Failed to update mind map title');
  }
  return { mindMapId, title };
});

export const deleteMindMapAction = createAsyncThunk<
  string,
  { mindMapId: string }
>('mindMap/delete', async ({ mindMapId }) => {
  const success = await mindMapService.deleteMindMap(mindMapId);
  if (!success) {
    throw new Error('Failed to delete mind map');
  }
  return mindMapId;
});

export const saveMindMapData = createAsyncThunk<
  void,
  {
    mindMapId: string;
    nodes: Node<NodeData>[];
    edges: Edge[];
    highlightedTexts: Map<string, HighlightedText[]>;
  }
>('mindMap/saveData', async ({ mindMapId, nodes, edges, highlightedTexts }) => {
  await mindMapService.saveMindMap(mindMapId, nodes, edges, highlightedTexts);
});

const mindMapSlice = createSlice({
  name: 'mindMap',
  initialState,
  reducers: {
    setNodes: (state, action: PayloadAction<Node<NodeData>[]>) => {
      state.nodes = action.payload;
    },
    setEdges: (state, action: PayloadAction<Edge[]>) => {
      state.edges = action.payload;
    },
    setHighlightedTexts: (
      state,
      action: PayloadAction<Map<string, HighlightedText[]>>
    ) => {
      state.highlightedTexts = action.payload;
    },
    addNode: (state, action: PayloadAction<Node<NodeData>>) => {
      const exists = state.nodes.some((n) => n.id === action.payload.id);
      if (!exists) {
        state.nodes.push(action.payload);
      }
    },
    addEdge: (state, action: PayloadAction<Edge>) => {
      const exists = state.edges.some((e) => e.id === action.payload.id);
      if (!exists) {
        state.edges.push(action.payload);
      }
    },
    updateNode: (state, action: PayloadAction<Node<NodeData>>) => {
      const index = state.nodes.findIndex((n) => n.id === action.payload.id);
      if (index !== -1) {
        state.nodes[index] = action.payload;
      }
    },
    removeNode: (state, action: PayloadAction<string>) => {
      state.nodes = state.nodes.filter((n) => n.id !== action.payload);
      state.edges = state.edges.filter(
        (e) => e.source !== action.payload && e.target !== action.payload
      );
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearMindMap: (state) => {
      state.nodes = [];
      state.edges = [];
      state.highlightedTexts = new Map();
      state.mindMapId = null;
    },
    setMindMapId: (state, action: PayloadAction<string | null>) => {
      state.mindMapId = action.payload;
    },
    setLoadingData: (state, action: PayloadAction<boolean>) => {
      state.isLoadingData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load mind map data
      .addCase(loadMindMapData.pending, (state) => {
        state.isLoadingData = true;
      })
      .addCase(loadMindMapData.fulfilled, (state, action) => {
        state.nodes = action.payload.nodes;
        state.edges = action.payload.edges;
        state.highlightedTexts = action.payload.highlightedTexts;
        state.mindMapId = action.payload.mindMapId;
        state.isLoadingData = false;
      })
      .addCase(loadMindMapData.rejected, (state) => {
        state.isLoadingData = false;
        // Chỉ clear nếu đang load lần đầu
        if (!state.mindMapId) {
          state.nodes = [];
          state.edges = [];
          state.highlightedTexts = new Map();
          state.mindMapId = null;
        }
      })
      // Load mind maps list
      .addCase(loadMindMapsList.pending, (state) => {
        state.isLoadingMindMaps = true;
      })
      .addCase(loadMindMapsList.fulfilled, (state, action) => {
        state.mindMaps = action.payload;
        state.isLoadingMindMaps = false;
      })
      .addCase(loadMindMapsList.rejected, (state) => {
        state.isLoadingMindMaps = false;
      })
      // Create new mind map
      .addCase(createNewMindMap.fulfilled, (state, action) => {
        state.mindMaps.unshift(action.payload.mindMap);
        state.mindMapId = action.payload.mindMapId;
        // Clear current data để load mind map mới
        state.nodes = [];
        state.edges = [];
        state.highlightedTexts = new Map();
        state.isLoadingData = true;
      })
      // Update mind map title
      .addCase(updateMindMapTitle.fulfilled, (state, action) => {
        const index = state.mindMaps.findIndex(
          (m) => m.id === action.payload.mindMapId
        );
        if (index !== -1) {
          state.mindMaps[index].title = action.payload.title;
          state.mindMaps[index].updated_at = new Date().toISOString();
          // Sort lại theo updated_at
          state.mindMaps.sort(
            (a, b) =>
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime()
          );
        }
      })
      // Delete mind map
      .addCase(deleteMindMapAction.fulfilled, (state, action) => {
        state.mindMaps = state.mindMaps.filter((m) => m.id !== action.payload);
        // Nếu đang xem mind map bị xóa, clear data
        if (state.mindMapId === action.payload) {
          state.nodes = [];
          state.edges = [];
          state.highlightedTexts = new Map();
          state.mindMapId = null;
        }
      });
  },
});

export const {
  setNodes,
  setEdges,
  setHighlightedTexts,
  addNode,
  addEdge,
  updateNode,
  removeNode,
  setLoading,
  clearMindMap,
  setMindMapId,
  setLoadingData,
} = mindMapSlice.actions;

export default mindMapSlice.reducer;
