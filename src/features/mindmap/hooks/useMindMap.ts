import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from 'reactflow';
import {
  NodeData,
  SelectedText,
  HighlightedText,
} from '@/features/mindmap/types';
import { generateRelatedContent } from '@/features/ai/services/aiService';
import {
  createNodeId,
  createEdgeId,
  getNodePosition,
} from '@/features/mindmap/utils/nodeUtils';
import { mindMapService } from '@/features/mindmap/services/supabaseService';
import { useAuth } from '@/features/auth/context/AuthContext';

export const useMindMap = () => {
  const { user } = useAuth();
  const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const creatingNodeRef = useRef<Set<string>>(new Set());
  const [highlightedTexts, setHighlightedTexts] = useState<
    Map<string, HighlightedText[]>
  >(new Map());
  const mindMapIdRef = useRef<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-save function với debounce
  const saveData = useCallback(async () => {
    // Note: This hook is deprecated, use useMindMapRedux instead
    // Skip save functionality in old hook
    return;

    if (!mindMapIdRef.current) {
      // Tạo mind map mới nếu chưa có
      // Note: This hook is deprecated, use useMindMapRedux instead
      return; // Skip save if using old hook
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (mindMapIdRef.current) {
        await mindMapService.saveMindMap(
          mindMapIdRef.current,
          nodes,
          edges,
          highlightedTexts
        );
      }
    }, 1000); // Debounce 1 giây
  }, [nodes, edges, highlightedTexts]);

  // Load data từ Supabase khi mount hoặc user thay đổi
  useEffect(() => {
    const loadData = async () => {
      // Chỉ load nếu user đã đăng nhập
      if (!user) {
        setIsLoadingData(false);
        setNodes([]);
        setEdges([]);
        setHighlightedTexts(new Map());
        mindMapIdRef.current = null;
        return;
      }

      setIsLoadingData(true);
      try {
        const mindMapId = await mindMapService.getOrCreateDefaultMindMap(
          user.id
        );
        if (mindMapId) {
          mindMapIdRef.current = mindMapId;
          const data = await mindMapService.loadMindMap(mindMapId);
          if (data) {
            setNodes(data.nodes);
            setEdges(data.edges);
            setHighlightedTexts(data.highlightedTexts);
          }
        }
      } catch (error) {
        console.error('Error loading mind map data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [user]);

  // Auto-save khi có thay đổi
  useEffect(() => {
    // Không save khi đang load data lần đầu
    if (isLoadingData) {
      return;
    }

    // Không save nếu chưa có nodes (chưa tạo mind map)
    if (nodes.length === 0) {
      return;
    }

    saveData();
  }, [nodes, edges, highlightedTexts, isLoadingData, saveData]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => {
      const updatedNodes = applyNodeChanges(changes, nds);

      // Lưu width và height vào data khi node được resize
      // NodeResizer tự động cập nhật node.width và node.height
      return updatedNodes.map((node) => {
        // Lưu width và height từ node vào data để persist
        if (node.width !== undefined || node.height !== undefined) {
          return {
            ...node,
            data: {
              ...node.data,
              width: node.width ?? node.data.width,
              height: node.height ?? node.data.height,
            },
          };
        }
        return node;
      });
    });
  }, []);

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          selected: n.id === node.id ? !n.selected : false,
        }))
      );
    },
    []
  );

  const handleTextSelected = useCallback(
    async (selected: SelectedText, customPrompt?: string) => {
      const requestKey = `${selected.nodeId}-${selected.text}-${
        customPrompt || ''
      }`;

      if (creatingNodeRef.current.has(requestKey) || isLoading) {
        return;
      }

      creatingNodeRef.current.add(requestKey);
      setIsLoading(true);

      try {
        let parentNode: Node<NodeData> | undefined;

        setNodes((currentNodes) => {
          parentNode = currentNodes.find((n) => n.id === selected.nodeId);
          return currentNodes;
        });

        await new Promise((resolve) => setTimeout(resolve, 0));

        if (!parentNode) {
          setIsLoading(false);
          creatingNodeRef.current.delete(requestKey);
          return;
        }

        const content = await generateRelatedContent(
          selected.text,
          parentNode.data.label,
          customPrompt
        );

        const newNodeId = createNodeId();
        const parentData = parentNode.data as NodeData;
        const nodeLabel = customPrompt || selected.text;

        // Lấy danh sách nodes hiện tại để tính toán vị trí tránh overlap
        let currentNodes: Node<NodeData>[] = [];
        setNodes((nds) => {
          currentNodes = nds;
          return nds;
        });

        const position = getNodePosition(
          parentNode,
          currentNodes,
          400, // newNodeWidth
          300 // newNodeHeight
        );

        const newNode: Node<NodeData> = {
          id: newNodeId,
          type: 'custom',
          position,
          width: 400,
          height: 300,
          data: {
            id: newNodeId,
            label: nodeLabel,
            content: content.replace(/\n/g, '<br>'),
            level: parentData.level + 1,
            parentId: selected.nodeId,
            width: 400,
            height: 300,
          },
          selected: false,
        };

        const newEdge: Edge = {
          id: createEdgeId(selected.nodeId, newNodeId),
          source: selected.nodeId,
          target: newNodeId,
          type: 'smoothstep',
        };

        const highlightedText: HighlightedText = {
          startIndex: selected.startIndex,
          endIndex: selected.endIndex,
          nodeId: newNodeId,
          level: parentData.level + 1,
        };

        setNodes((nds) => {
          const exists = nds.some((n) => n.id === newNodeId);
          if (exists) return nds;
          return [...nds, newNode];
        });

        setEdges((eds) => {
          const exists = eds.some((e) => e.id === newEdge.id);
          if (exists) return eds;
          return [...eds, newEdge];
        });

        setHighlightedTexts((prev) => {
          const newMap = new Map(prev);
          const parentHighlights = newMap.get(selected.nodeId) || [];
          newMap.set(selected.nodeId, [...parentHighlights, highlightedText]);
          return newMap;
        });
      } catch (error) {
        console.error('Error in handleTextSelected:', error);
      } finally {
        setIsLoading(false);
        creatingNodeRef.current.delete(requestKey);
      }
    },
    [isLoading]
  );

  // Cleanup timeout khi unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    nodes,
    edges,
    isLoading,
    isLoadingData,
    highlightedTexts,
    onNodesChange,
    onEdgesChange,
    onConnect,
    handleNodeClick,
    handleTextSelected,
    setNodes,
  };
};
