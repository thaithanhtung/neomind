import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { current } from '@reduxjs/toolkit';
import { Node, Edge } from 'reactflow';
import { NodeData, HighlightedText } from '@/features/mindmap/types';
import { mindMapService } from '@/features/mindmap/services/supabaseService';
import type { MindMap } from '@/features/mindmap/services/supabaseService';

interface HistorySnapshot {
  nodes: Node<NodeData>[];
  edges: Edge[];
  highlightedTexts:
    | Array<[string, HighlightedText[]]>
    | Map<string, HighlightedText[]>;
}

interface MindMapState {
  nodes: Node<NodeData>[];
  edges: Edge[];
  highlightedTexts: Map<string, HighlightedText[]>;
  isLoading: boolean;
  isLoadingData: boolean;
  mindMapId: string | null;
  mindMaps: MindMap[]; // Danh sách tất cả mind maps của user
  isLoadingMindMaps: boolean;
  systemPrompt: string;
  // History for undo/redo
  history: HistorySnapshot[];
  historyIndex: number;
  maxHistorySize: number;
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
  systemPrompt: '',
  history: [],
  historyIndex: -1,
  maxHistorySize: 50,
};

// Note: Map serialization is handled by Redux middleware configuration

// Helper function để convert Map sang array để serialize
const mapToArray = (
  map: Map<string, HighlightedText[]>
): Array<[string, HighlightedText[]]> => {
  return Array.from(map.entries());
};

// Helper function để convert array về Map
const arrayToMap = (
  arr: Array<[string, HighlightedText[]]>
): Map<string, HighlightedText[]> => {
  return new Map(arr);
};

// Helper function để tạo snapshot
// Lưu ý: Hàm này được gọi từ bên trong Immer producer, nên cần dùng current() để lấy giá trị thực
const createSnapshot = (state: MindMapState): HistorySnapshot => {
  // Dùng current() để lấy giá trị thực từ Immer proxy, tránh lỗi khi serialize Map
  const currentState = current(state);
  const highlightedTextsArray = mapToArray(currentState.highlightedTexts);

  return {
    nodes: JSON.parse(JSON.stringify(currentState.nodes)),
    edges: JSON.parse(JSON.stringify(currentState.edges)),
    highlightedTexts: highlightedTextsArray,
  };
};

// Helper function để apply snapshot
const applySnapshot = (
  state: MindMapState,
  snapshot: HistorySnapshot
): void => {
  state.nodes = JSON.parse(JSON.stringify(snapshot.nodes));
  state.edges = JSON.parse(JSON.stringify(snapshot.edges));
  state.highlightedTexts = arrayToMap(
    snapshot.highlightedTexts as Array<[string, HighlightedText[]]>
  );
};

// Async thunks
export const loadMindMapData = createAsyncThunk<
  {
    nodes: Node<NodeData>[];
    edges: Edge[];
    highlightedTexts: Map<string, HighlightedText[]>;
    mindMapId: string;
    systemPrompt: string;
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

export const updateSystemPrompt = createAsyncThunk<
  { mindMapId: string; systemPrompt: string },
  { mindMapId: string; systemPrompt: string }
>('mindMap/updateSystemPrompt', async ({ mindMapId, systemPrompt }) => {
  try {
    const success = await mindMapService.updateMindMapSystemPrompt(
      mindMapId,
      systemPrompt
    );
    // Nếu không thành công nhưng không throw error, có thể là do cột chưa tồn tại
    // Vẫn return success để update local state
    if (!success) {
      console.warn(
        'System prompt update skipped (column may not exist). Local state updated.'
      );
    }
    return { mindMapId, systemPrompt };
  } catch (error: any) {
    // Nếu là lỗi về missing column, vẫn update local state
    const errorMsg = String(error?.message || '');
    if (
      errorMsg.toLowerCase().includes('system_prompt') ||
      errorMsg.toLowerCase().includes('column') ||
      errorMsg.toLowerCase().includes('schema cache')
    ) {
      console.warn(
        'System prompt column does not exist. Local state updated but not saved to DB.'
      );
      return { mindMapId, systemPrompt };
    }
    // Re-throw các lỗi khác
    throw error;
  }
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
      state.systemPrompt = '';
      state.history = [];
      state.historyIndex = -1;
    },
    setMindMapId: (state, action: PayloadAction<string | null>) => {
      state.mindMapId = action.payload;
      // Reset history khi chuyển mind map
      if (action.payload !== state.mindMapId) {
        state.history = [];
        state.historyIndex = -1;
      }
    },
    setLoadingData: (state, action: PayloadAction<boolean>) => {
      state.isLoadingData = action.payload;
    },
    setSystemPrompt: (state, action: PayloadAction<string>) => {
      state.systemPrompt = action.payload;
    },
    // History actions
    saveToHistory: (state) => {
      // Chỉ save nếu có thay đổi thực sự
      if (state.nodes.length === 0 && state.history.length === 0) {
        return;
      }

      const snapshot = createSnapshot(state);

      // Xóa các snapshot sau index hiện tại (khi đã undo rồi làm action mới)
      if (state.historyIndex < state.history.length - 1) {
        state.history = state.history.slice(0, state.historyIndex + 1);
      }

      // Thêm snapshot mới
      state.history.push(snapshot);
      state.historyIndex = state.history.length - 1;

      // Giới hạn kích thước history
      if (state.history.length > state.maxHistorySize) {
        state.history.shift();
        state.historyIndex = state.history.length - 1;
      }
    },
    undo: (state) => {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        const snapshot = state.history[state.historyIndex];
        applySnapshot(state, snapshot);
      }
    },
    redo: (state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        const snapshot = state.history[state.historyIndex];
        applySnapshot(state, snapshot);
      }
    },
    clearHistory: (state) => {
      state.history = [];
      state.historyIndex = -1;
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
        state.systemPrompt = action.payload.systemPrompt || '';
        state.isLoadingData = false;
        // Reset history khi load data mới
        state.history = [];
        state.historyIndex = -1;
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
          state.systemPrompt = '';
        }
      })
      // Update system prompt
      .addCase(updateSystemPrompt.fulfilled, (state, action) => {
        const { mindMapId, systemPrompt } = action.payload;
        state.systemPrompt = systemPrompt;
        state.mindMaps = state.mindMaps.map((m) =>
          m.id === mindMapId ? { ...m, system_prompt: systemPrompt } : m
        );
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
  setSystemPrompt,
  saveToHistory,
  undo,
  redo,
  clearHistory,
} = mindMapSlice.actions;

export default mindMapSlice.reducer;
