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
  ReactFlowInstance,
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
  updateNode,
  removeNode,
  setMindMapId,
  setLoadingData,
  saveToHistory,
  undo as undoAction,
  redo as redoAction,
  setSystemPrompt,
  updateSystemPrompt,
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
import { analytics } from '@/shared/utils/analytics';

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
    history,
    historyIndex,
    systemPrompt,
  } = useAppSelector((state) => state.mindMap);

  const creatingNodeRef = useRef<Set<string>>(new Set());
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const loadedUserIdRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);
  const justLoadedRef = useRef(false); // Flag để skip auto-save ngay sau khi load

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
    } else if (
      mindMaps.length === 0 &&
      !isLoadingMindMaps &&
      !mindMapId &&
      isLoadingData
    ) {
      // Nếu không có mind map nào và đã load xong danh sách, set loading = false
      // Điều này xảy ra khi user mới chưa có mind map nào
      dispatch(setLoadingData(false));
    }
  }, [mindMaps, mindMapId, isLoadingMindMaps, isLoadingData, dispatch]);

  // Load mind map được chọn (chỉ load khi mindMapId thay đổi, không load lại khi nodes thay đổi)
  useEffect(() => {
    if (!mindMapId || isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    justLoadedRef.current = true; // Set flag khi bắt đầu load
    dispatch(loadMindMapData(mindMapId)).finally(() => {
      isLoadingRef.current = false;
      // Reset flag sau 2 giây để cho phép auto-save lại
      setTimeout(() => {
        justLoadedRef.current = false;
      }, 2000);
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
    // Skip auto-save nếu:
    // - Đang load data
    // - Chưa có mindMapId
    // - Chưa có nodes
    // - Vừa mới load data (trong vòng 2 giây)
    if (
      isLoadingData ||
      !mindMapId ||
      nodes.length === 0 ||
      justLoadedRef.current
    ) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      // Double check lại trước khi save
      if (mindMapId && !justLoadedRef.current) {
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
      // Reset flag khi có user action rõ ràng (di chuyển node, resize node)
      // Không reset cho các changes khác vì có thể đến từ nhiều nguồn
      const hasUserAction = changes.some(
        (c) => c.type === 'position' || c.type === 'dimensions'
      );
      if (hasUserAction) {
        justLoadedRef.current = false;
      }

      // Lấy nodes hiện tại từ store thay vì từ closure
      dispatch((dispatch, getState) => {
        const currentNodes = getState().mindMap.nodes;
        const updatedNodes = applyNodeChanges(changes, currentNodes);

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

        // Save to history nếu có user action quan trọng
        if (hasUserAction) {
          dispatch(saveToHistory());
        }
      });
    },
    [dispatch]
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
      // Reset flag khi có user action (kết nối node)
      justLoadedRef.current = false;

      // Track node connect
      if (connection.source && connection.target) {
        analytics.trackNodeConnect(connection.source, connection.target);
      }

      const newEdge = addEdge(connection, edges);
      dispatch(setEdges(newEdge));
    },
    [edges, dispatch]
  );

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      // Track node click
      analytics.trackNodeClick(node.id);

      // Lấy nodes hiện tại từ store thay vì từ closure để tránh stale data
      dispatch((dispatch, getState) => {
        const currentNodes = getState().mindMap.nodes;
        const updatedNodes = currentNodes.map((n) => ({
          ...n,
          selected: n.id === node.id ? !n.selected : false,
        }));
        dispatch(setNodes(updatedNodes));
      });
    },
    [dispatch]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      if (
        !confirm(
          'Bạn có chắc muốn xóa node này? Tất cả các node con và edges liên quan cũng sẽ bị xóa.'
        )
      ) {
        return;
      }

      // Track node delete
      analytics.trackNodeDelete(nodeId);

      dispatch((dispatch, getState) => {
        const state = getState().mindMap;

        // Hàm đệ quy để tìm tất cả node con (bao gồm cả node con của node con)
        const findAllChildNodes = (
          parentId: string,
          allNodes: Node<NodeData>[]
        ): string[] => {
          const childIds: string[] = [];
          const directChildren = allNodes.filter(
            (n) => n.data.parentId === parentId
          );

          directChildren.forEach((child) => {
            childIds.push(child.id);
            // Tìm node con của node con (đệ quy)
            const grandChildren = findAllChildNodes(child.id, allNodes);
            childIds.push(...grandChildren);
          });

          return childIds;
        };

        // Tìm tất cả node con cần xóa
        const childNodeIds = findAllChildNodes(nodeId, state.nodes);
        const allNodesToDelete = [nodeId, ...childNodeIds];

        // Xóa từng node (bắt đầu từ node con trước để tránh lỗi)
        // Xóa theo thứ tự ngược lại (node con trước, node cha sau)
        allNodesToDelete.reverse().forEach((id) => {
          dispatch(removeNode(id));
        });

        // Xóa highlighted texts liên quan đến tất cả các node bị xóa
        const newHighlightedTexts = new Map(state.highlightedTexts);
        allNodesToDelete.forEach((id) => {
          // Xóa highlights của node bị xóa
          newHighlightedTexts.delete(id);
        });

        // Xóa highlights có target_node_id là một trong các node bị xóa
        newHighlightedTexts.forEach((highlights, nodeIdKey) => {
          const filteredHighlights = highlights.filter(
            (h) => !allNodesToDelete.includes(h.nodeId)
          );
          if (filteredHighlights.length !== highlights.length) {
            if (filteredHighlights.length === 0) {
              newHighlightedTexts.delete(nodeIdKey);
            } else {
              newHighlightedTexts.set(nodeIdKey, filteredHighlights);
            }
          }
        });

        dispatch(setHighlightedTexts(newHighlightedTexts));

        // Force save ngay sau khi xóa node để đảm bảo được lưu vào database
        // Lấy state mới nhất sau khi đã xóa
        const updatedState = getState().mindMap;
        if (updatedState.mindMapId) {
          // Clear timeout hiện tại nếu có để tránh conflict
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
          // Save ngay lập tức với state mới nhất
          dispatch(
            saveMindMapData({
              mindMapId: updatedState.mindMapId,
              nodes: updatedState.nodes,
              edges: updatedState.edges,
              highlightedTexts: updatedState.highlightedTexts,
            })
          );
        }
      });
    },
    [dispatch]
  );

  const handleTextSelected = useCallback(
    async (selected: SelectedText, customPrompt?: string) => {
      const requestKey = `${selected.nodeId}-${selected.text}-${
        customPrompt || ''
      }`;

      // Chỉ kiểm tra duplicate request, không kiểm tra isLoading global
      if (creatingNodeRef.current.has(requestKey)) {
        return;
      }

      creatingNodeRef.current.add(requestKey);

      // Track text select
      analytics.trackTextSelect(selected.text.length);

      let newNodeId: string | null = null;

      try {
        const parentNode = nodes.find((n) => n.id === selected.nodeId);
        if (!parentNode) {
          creatingNodeRef.current.delete(requestKey);
          return;
        }

        newNodeId = createNodeId();
        const parentData = parentNode.data as NodeData;
        const nodeLabel = customPrompt || selected.text;

        const position = getNodePosition(parentNode, nodes, 400, 300);

        // Tạo node với loading state trước
        const newNode: Node<NodeData> = {
          id: newNodeId,
          type: 'custom',
          position,
          width: 400,
          height: 300,
          data: {
            id: newNodeId,
            label: nodeLabel,
            content: '',
            level: parentData.level + 1,
            parentId: selected.nodeId,
            width: 400,
            height: 300,
            isLoading: true,
          },
          selected: false,
        };

        const newEdge: Edge = {
          id: createEdgeId(selected.nodeId, newNodeId),
          source: selected.nodeId,
          target: newNodeId,
          type: 'smoothstep',
        };

        // Reset flag khi có user action (tạo node từ text selection)
        justLoadedRef.current = false;

        // Thêm node và edge với loading state
        dispatch(addNode(newNode));
        dispatch(addEdgeAction(newEdge));

        // ✨ Không đợi save to history, chạy song song với AI call
        // Giảm latency bằng cách không block
        dispatch(saveToHistory());

        // ✨ Generate content với STREAMING để update real-time
        const content = await generateRelatedContent(
          selected.text,
          parentNode.data.label,
          customPrompt,
          systemPrompt,
          // Streaming callback: update node content theo thời gian thực
          (streamedContent) => {
            const streamNode: Node<NodeData> = {
              ...newNode,
              data: {
                ...newNode.data,
                content: streamedContent.replace(/\n/g, '<br>'),
                isLoading: false, // ✨ TẮT loading để hiển thị content ngay
              },
            };
            dispatch(updateNode(streamNode));
          }
        );

        // Cập nhật node với content cuối cùng và tắt loading
        const updatedNode: Node<NodeData> = {
          ...newNode,
          data: {
            ...newNode.data,
            content: content.replace(/\n/g, '<br>'),
            isLoading: false,
          },
        };

        dispatch(updateNode(updatedNode));

        // Track node create from text selection
        analytics.trackNodeCreate(newNodeId, nodeLabel);

        const highlightedText: HighlightedText = {
          startIndex: selected.startIndex,
          endIndex: selected.endIndex,
          nodeId: newNodeId,
          level: parentData.level + 1,
        };

        const newMap = new Map(highlightedTexts);
        const parentHighlights = newMap.get(selected.nodeId) || [];
        newMap.set(selected.nodeId, [...parentHighlights, highlightedText]);
        dispatch(setHighlightedTexts(newMap));
      } catch (error) {
        console.error('Error in handleTextSelected:', error);
        // Xóa node và edge nếu có lỗi
        if (newNodeId) {
          dispatch(removeNode(newNodeId));
        }
      } finally {
        creatingNodeRef.current.delete(requestKey);
      }
    },
    [nodes, highlightedTexts, dispatch, systemPrompt]
  );

  const handleCreateNewMindMap = useCallback(
    async (title: string = 'Untitled Mind Map'): Promise<string | null> => {
      if (!user?.id) return null;
      const result = await dispatch(
        createNewMindMap({ userId: user.id, title })
      );
      if (createNewMindMap.fulfilled.match(result)) {
        // Track mind map create
        analytics.trackMindMapCreate(result.payload.mindMapId);
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
        // Track mind map select
        analytics.trackMindMapSelect(selectedMindMapId);
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
        await dispatch(
          deleteMindMapAction({ mindMapId: mindMapIdToDelete })
        ).unwrap();

        // Track mind map delete
        analytics.trackMindMapDelete(mindMapIdToDelete);

        // Tính toán remaining maps bằng cách loại bỏ mind map đã xóa
        // (Reducer đã cập nhật state, nhưng component chưa re-render nên dùng giá trị hiện tại)
        const remainingMaps = mindMaps.filter(
          (m) => m.id !== mindMapIdToDelete
        );

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
    async (topic: string, position?: { x: number; y: number }) => {
      if (!mindMapId) {
        throw new Error('Chưa chọn mind map');
      }

      const newNodeId = createNodeId();
      const nodePosition = position || getInitialNodePosition();

      // Tạo node với loading state trước
      const newNode: Node<NodeData> = {
        id: newNodeId,
        type: 'custom',
        position: nodePosition,
        width: 400,
        height: 300,
        data: {
          id: newNodeId,
          label: topic,
          content: '',
          level: 0,
          width: 400,
          height: 300,
          isLoading: true,
        },
        selected: false,
      };

      // Reset flag khi có user action (tạo node từ topic input)
      justLoadedRef.current = false;

      // Thêm node với loading state - node sẽ hiển thị loading spinner
      dispatch(addNode(newNode));
      dispatch(saveToHistory());

      try {
        // ✨ Generate content với STREAMING để update real-time
        const content = await generateContent(
          topic,
          systemPrompt,
          // Streaming callback: update node content theo thời gian thực
          (streamedContent) => {
            const streamNode: Node<NodeData> = {
              ...newNode,
              data: {
                ...newNode.data,
                content: streamedContent.replace(/\n/g, '<br>'),
                isLoading: false, // ✨ TẮT loading để hiển thị content ngay
              },
            };
            dispatch(updateNode(streamNode));
          }
        );

        // Cập nhật node với content cuối cùng và tắt loading
        const updatedNode: Node<NodeData> = {
          ...newNode,
          data: {
            ...newNode.data,
            content: content.replace(/\n/g, '<br>'),
            isLoading: false,
          },
        };

        dispatch(updateNode(updatedNode));

        // Track node create from topic input
        analytics.trackNodeCreate(newNodeId, topic);
      } catch (error) {
        console.error('Error creating node:', error);
        // Xóa node nếu có lỗi
        dispatch(removeNode(newNodeId));
        throw error;
      }
    },
    [mindMapId, dispatch, systemPrompt]
  );

  const handlePaneDoubleClick = useCallback(
    async (
      event: React.MouseEvent,
      reactFlowInstance: ReactFlowInstance | null
    ) => {
      if (!mindMapId || !reactFlowInstance) {
        return;
      }

      // Lấy vị trí click trên viewport
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Convert sang tọa độ trong flow
      const position = reactFlowInstance.screenToFlowPosition({
        x,
        y,
      });

      // Điều chỉnh để node xuất hiện ở giữa điểm click
      const adjustedPosition = {
        x: position.x - 200, // Trừ đi một nửa width của node (400/2)
        y: position.y - 150, // Trừ đi một nửa height của node (300/2)
      };

      // Prompt user để nhập topic
      const topic = prompt('Nhập tên cho node mới:', 'Untitled Node');
      if (topic && topic.trim()) {
        try {
          await handleCreateNode(topic.trim(), adjustedPosition);
        } catch (error) {
          console.error('Error creating node from double-click:', error);
          alert('Có lỗi xảy ra khi tạo node mới. Vui lòng thử lại.');
        }
      }
    },
    [mindMapId, handleCreateNode]
  );

  const handleUndo = useCallback(() => {
    dispatch(undoAction());
  }, [dispatch]);

  const handleRedo = useCallback(() => {
    dispatch(redoAction());
  }, [dispatch]);

  const handleUpdateSystemPrompt = useCallback(
    (prompt: string) => {
      if (!mindMapId) return;
      dispatch(setSystemPrompt(prompt));
      dispatch(updateSystemPrompt({ mindMapId, systemPrompt: prompt }));
    },
    [dispatch, mindMapId]
  );

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    nodes,
    edges,
    isLoading,
    isLoadingData,
    highlightedTexts,
    mindMaps,
    isLoadingMindMaps,
    currentMindMapId: mindMapId,
    systemPrompt,
    onNodesChange,
    onEdgesChange,
    onConnect,
    handleNodeClick,
    handleTextSelected,
    handleDeleteNode,
    setNodes: (nodes: Node<NodeData>[]) => dispatch(setNodes(nodes)),
    onCreateNode: handleCreateNode,
    onCreateNewMindMap: handleCreateNewMindMap,
    onSelectMindMap: handleSelectMindMap,
    onUpdateMindMapTitle: handleUpdateTitle,
    onDeleteMindMap: handleDeleteMindMap,
    onUpdateSystemPrompt: handleUpdateSystemPrompt,
    onPaneDoubleClick: handlePaneDoubleClick,
    undo: handleUndo,
    redo: handleRedo,
    canUndo,
    canRedo,
  };
};
