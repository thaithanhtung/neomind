import { useMemo, useCallback, useRef } from 'react';
import { NodeProps, ReactFlowInstance } from 'reactflow';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  Connection,
  NodeTypes,
  NodeChange,
  EdgeChange,
  MarkerType,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { NodeData } from '@/features/mindmap/types';
import { CustomNode } from '@/features/mindmap/components/Node';
import { useUserSettings } from '@/shared/hooks/useUserSettings';

// Định nghĩa nodeTypes bên ngoài component để tránh warning
const nodeTypes: NodeTypes = {
  custom: (props: NodeProps) => {
    return <CustomNode {...props} />;
  },
};

interface MindMapProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  onPaneDoubleClick?: (event: React.MouseEvent) => void;
  onReactFlowInstanceReady?: (instance: ReactFlowInstance) => void;
  readOnly?: boolean; // Read-only mode for shared mind maps
}

export const MindMap = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onPaneDoubleClick,
  onReactFlowInstanceReady,
  readOnly = false,
}: MindMapProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { settings } = useUserSettings();
  const uiConfig = settings.uiConfig;

  const handleReactFlowInit = useCallback(
    (instance: ReactFlowInstance) => {
      if (onReactFlowInstanceReady) {
        onReactFlowInstanceReady(instance);
      }
    },
    [onReactFlowInstanceReady]
  );

  const backgroundVariantMap: Record<string, BackgroundVariant> = {
    dots: BackgroundVariant.Dots,
    lines: BackgroundVariant.Lines,
    cross: BackgroundVariant.Cross,
  };

  const defaultEdgeOptions = useMemo(
    () => ({
      style: {
        stroke: uiConfig.edgeColor,
        strokeWidth: uiConfig.edgeWidth,
        strokeDasharray: '0',
        strokeLinecap: 'round' as const,
      },
      type: 'smoothstep' as const,
      animated: false,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: uiConfig.edgeColor,
      },
    }),
    [uiConfig.edgeColor, uiConfig.edgeWidth]
  );

  const processedNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      draggable: readOnly ? false : !node.selected,
    }));
  }, [nodes, readOnly]);

  // Cập nhật màu sắc cho tất cả edges khi UI config thay đổi
  const processedEdges = useMemo(() => {
    return edges.map((edge) => {
      const existingStyle = edge.style || {};
      const existingMarkerEnd = edge.markerEnd || {};

      return {
        ...edge,
        style: {
          ...(typeof existingStyle === 'object' && existingStyle !== null
            ? existingStyle
            : {}),
          stroke: uiConfig.edgeColor,
          strokeWidth: uiConfig.edgeWidth,
        },
        markerEnd: {
          ...(typeof existingMarkerEnd === 'object' &&
          existingMarkerEnd !== null
            ? existingMarkerEnd
            : {}),
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: uiConfig.edgeColor,
        },
      };
    });
  }, [edges, uiConfig.edgeColor, uiConfig.edgeWidth]);

  const handleNodeDragStart = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (node.selected) {
        return false;
      }

      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        return false;
      }

      const target = event.target as HTMLElement;
      if (target.closest('.nodrag')) {
        return false;
      }
    },
    []
  );

  const lastClickRef = useRef<{ time: number; x: number; y: number } | null>(
    null
  );

  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      // Clear text selection khi click vào pane (background)
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }

      // Detect double-click
      const now = Date.now();
      const clickX = event.clientX;
      const clickY = event.clientY;

      if (
        lastClickRef.current &&
        now - lastClickRef.current.time < 300 &&
        Math.abs(clickX - lastClickRef.current.x) < 10 &&
        Math.abs(clickY - lastClickRef.current.y) < 10
      ) {
        // Double-click detected
        if (onPaneDoubleClick) {
          onPaneDoubleClick(event);
        }
        lastClickRef.current = null;
      } else {
        lastClickRef.current = { time: now, x: clickX, y: clickY };
      }
    },
    [onPaneDoubleClick]
  );

  return (
    <div className='w-full h-full' ref={reactFlowWrapper}>
      <ReactFlow
        nodes={processedNodes}
        edges={processedEdges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        nodesConnectable={!readOnly}
        nodesDraggable={!readOnly}
        elementsSelectable={!readOnly}
        selectNodesOnDrag={false}
        preventScrolling={false}
        onNodeDragStart={readOnly ? undefined : handleNodeDragStart}
        onNodeClick={readOnly ? undefined : onNodeClick}
        onPaneClick={readOnly ? undefined : handlePaneClick}
        onInit={handleReactFlowInit}
        // Cho phép zoom out xa hơn
        minZoom={0.1}
      >
        <Background
          color={uiConfig.backgroundColor}
          gap={20}
          variant={
            backgroundVariantMap[uiConfig.backgroundVariant] ||
            BackgroundVariant.Dots
          }
          size={1.5}
        />
        <Controls
          className='!bg-white/90 !backdrop-blur-lg !border !border-gray-200/50 !rounded-2xl !shadow-xl'
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
};
