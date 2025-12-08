import { useEffect, useCallback, useRef } from 'react';
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
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadMindMapData,
  saveMindMapData,
  loadMindMapsList,
  createNewMindMap,
  updateMindMapTitle,
  deleteMindMapAction,
  setNodes,
  setEdges,
  setHighlightedTexts,
  addNode,
  addEdge as addEdgeAction,
  setLoading,
  setMindMapId,
  setLoadingData,
} from '@/store/slices/mindMapSlice';
import {
  NodeData,
  SelectedText,
  HighlightedText,
} from '@/features/mindmap/types';
import {
  generateRelatedContent,
  generateContent,
} from '@/features/ai/services/aiService';
import {
  createNodeId,
  createEdgeId,
  getNodePosition,
  getInitialNodePosition,
} from '@/features/mindmap/utils/nodeUtils';

export const useMindMapRedux = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const {
    nodes,
    edges,
    highlightedTexts,
    isLoading,
    isLoadingData,
    mindMapId,
    mindMaps,
    isLoadingMindMaps,
  } = useAppSelector((state) => state.mindMap);

  const creatingNodeRef = useRef<Set<string>>(new Set());
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const loadedUserIdRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  // Load danh sách mind maps khi user thay đổi
  useEffect(() => {
    const userId = user?.id;
    if (!userId) {
      return;
    }

    // Load danh sách mind maps
    dispatch(loadMindMapsList(userId));
  }, [user?.id, dispatch]);

  // Tự động chọn mind map đầu tiên nếu chưa có mind map được chọn
  useEffect(() => {
    if (mindMaps.length > 0 && !mindMapId && !isLoadingMindMaps) {
      dispatch(setMindMapId(mindMaps[0].id));
    } else if (mindMaps.length === 0 && !isLoadingMindMaps && !mindMapId && isLoadingData) {
      // Nếu không có mind map nào và đã load xong danh sách, set loading = false
      // Điều này xảy ra khi user mới chưa có mind map nào
      dispatch(setLoadingData(false));
    }
  }, [mindMaps, mindMapId, isLoadingMindMaps, isLoadingData, dispatch]);

  // Load mind map được chọn
  useEffect(() => {
    if (!mindMapId || isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    dispatch(loadMindMapData(mindMapId)).finally(() => {
      isLoadingRef.current = false;
    });
  }, [mindMapId, dispatch]);

  // Clear data khi user logout
  useEffect(() => {
    if (!user) {
      dispatch(setNodes([]));
      dispatch(setEdges([]));
      dispatch(setHighlightedTexts(new Map()));
      dispatch(setMindMapId(null));
      loadedUserIdRef.current = null;
      isLoadingRef.current = false;
    }
  }, [user, dispatch]);

  // Auto-save với debounce
  useEffect(() => {
    if (isLoadingData || !mindMapId || nodes.length === 0) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (mindMapId) {
        dispatch(
          saveMindMapData({
            mindMapId,
            nodes,
            edges,
            highlightedTexts,
          })
        );
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [nodes, edges, highlightedTexts, mindMapId, isLoadingData, dispatch]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const updatedNodes = applyNodeChanges(changes, nodes);

      // Lưu width và height vào data khi node được resize
      const nodesWithData = updatedNodes.map((node) => {
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

      dispatch(setNodes(nodesWithData));
    },
    [nodes, dispatch]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const updatedEdges = applyEdgeChanges(changes, edges);
      dispatch(setEdges(updatedEdges));
    },
    [edges, dispatch]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = addEdge(connection, edges);
      dispatch(setEdges(newEdge));
    },
    [edges, dispatch]
  );

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const updatedNodes = nodes.map((n) => ({
        ...n,
        selected: n.id === node.id ? !n.selected : false,
      }));
      dispatch(setNodes(updatedNodes));
    },
    [nodes, dispatch]
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
      dispatch(setLoading(true));

      try {
        const parentNode = nodes.find((n) => n.id === selected.nodeId);
        if (!parentNode) {
          dispatch(setLoading(false));
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

        const position = getNodePosition(parentNode, nodes, 400, 300);

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

        dispatch(addNode(newNode));
        dispatch(addEdgeAction(newEdge));

        const newMap = new Map(highlightedTexts);
        const parentHighlights = newMap.get(selected.nodeId) || [];
        newMap.set(selected.nodeId, [...parentHighlights, highlightedText]);
        dispatch(setHighlightedTexts(newMap));
      } catch (error) {
        console.error('Error in handleTextSelected:', error);
      } finally {
        dispatch(setLoading(false));
        creatingNodeRef.current.delete(requestKey);
      }
    },
    [nodes, highlightedTexts, isLoading, dispatch]
  );

  const handleCreateNewMindMap = useCallback(
    async (title: string = 'Untitled Mind Map'): Promise<string | null> => {
      if (!user?.id) return null;
      const result = await dispatch(
        createNewMindMap({ userId: user.id, title })
      );
      if (createNewMindMap.fulfilled.match(result)) {
        // Mind map đã được tạo và selected tự động
        return result.payload.mindMapId;
      }
      return null;
    },
    [user?.id, dispatch]
  );

  const handleSelectMindMap = useCallback(
    (selectedMindMapId: string) => {
      if (selectedMindMapId !== mindMapId) {
        dispatch(setMindMapId(selectedMindMapId));
      }
    },
    [mindMapId, dispatch]
  );

  const handleUpdateTitle = useCallback(
    async (mindMapId: string, title: string) => {
      await dispatch(updateMindMapTitle({ mindMapId, title }));
    },
    [dispatch]
  );

  const handleDeleteMindMap = useCallback(
    async (mindMapIdToDelete: string) => {
      const wasViewingDeletedMap = mindMapIdToDelete === mindMapId;
      
      try {
        await dispatch(deleteMindMapAction({ mindMapId: mindMapIdToDelete })).unwrap();
        
        // Tính toán remaining maps bằng cách loại bỏ mind map đã xóa
        // (Reducer đã cập nhật state, nhưng component chưa re-render nên dùng giá trị hiện tại)
        const remainingMaps = mindMaps.filter((m) => m.id !== mindMapIdToDelete);
        
        // Nếu đang xem mind map bị xóa, chọn mind map đầu tiên còn lại
        // Không tự động tạo mind map mới khi xóa đến item cuối cùng
        if (wasViewingDeletedMap) {
          if (remainingMaps.length > 0) {
            // Chọn mind map đầu tiên còn lại
            dispatch(setMindMapId(remainingMaps[0].id));
          } else {
            // Không còn mind map nào, chỉ clear mindMapId
            // Component sẽ tự động redirect về trang list và hiển thị empty state
            dispatch(setMindMapId(null));
          }
        }
      } catch (error) {
        console.error('Error deleting mind map:', error);
      }
    },
    [mindMapId, mindMaps, dispatch]
  );

  const handleCreateNode = useCallback(
    async (topic: string) => {
      if (!mindMapId) {
        throw new Error('Chưa chọn mind map');
      }

      if (isLoading) {
        return;
      }

      dispatch(setLoading(true));

      try {
        const content = await generateContent(topic);
        const newNodeId = createNodeId();

        const position = getInitialNodePosition();

        const newNode: Node<NodeData> = {
          id: newNodeId,
          type: 'custom',
          position,
          width: 400,
          height: 300,
          data: {
            id: newNodeId,
            label: topic,
            content: content.replace(/\n/g, '<br>'),
            level: 0,
            width: 400,
            height: 300,
          },
          selected: false,
        };

        dispatch(addNode(newNode));
      } catch (error) {
        console.error('Error creating node:', error);
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [mindMapId, isLoading, dispatch]
  );

  return {
    nodes,
    edges,
    isLoading,
    isLoadingData,
    highlightedTexts,
    mindMaps,
    isLoadingMindMaps,
    currentMindMapId: mindMapId,
    onNodesChange,
    onEdgesChange,
    onConnect,
    handleNodeClick,
    handleTextSelected,
    setNodes: (nodes: Node<NodeData>[]) => dispatch(setNodes(nodes)),
    onCreateNode: handleCreateNode,
    onCreateNewMindMap: handleCreateNewMindMap,
    onSelectMindMap: handleSelectMindMap,
    onUpdateMindMapTitle: handleUpdateTitle,
    onDeleteMindMap: handleDeleteMindMap,
  };
};

