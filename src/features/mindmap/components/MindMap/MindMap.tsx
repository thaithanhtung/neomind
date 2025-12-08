import { useMemo, useCallback } from 'react';
import { NodeProps } from 'reactflow';
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
import { NodeData, HighlightedText } from '@/features/mindmap/types';
import { CustomNode } from '@/features/mindmap/components/Node';

const createNodeTypes = (
  highlightedTexts?: Map<string, HighlightedText[]>
): NodeTypes => ({
  custom: (props: NodeProps) => {
    const nodeData = props.data as NodeData;
    const highlights = highlightedTexts?.get(nodeData.id) || [];
    return <CustomNode {...props} highlightedTexts={highlights} />;
  },
});

interface MindMapProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  highlightedTexts?: Map<string, HighlightedText[]>;
}

export const MindMap = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  highlightedTexts,
}: MindMapProps) => {
  const nodeTypes = useMemo(
    () => createNodeTypes(highlightedTexts),
    [highlightedTexts]
  );
  
  const defaultEdgeOptions = useMemo(
    () => ({
      style: { 
        stroke: '#6366f1', 
        strokeWidth: 3,
        strokeDasharray: '0',
        strokeLinecap: 'round' as const,
      },
      type: 'smoothstep' as const,
      animated: false,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#6366f1',
      },
    }),
    []
  );

  const processedNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      draggable: !node.selected,
    }));
  }, [nodes]);

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

  const handlePaneClick = useCallback(() => {
    // Clear text selection khi click vào pane (background)
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  }, []);

  return (
    <div className='w-full h-full'>
      <ReactFlow
        nodes={processedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        nodesConnectable={false}
        selectNodesOnDrag={false}
        preventScrolling={false}
        onNodeDragStart={handleNodeDragStart}
        onNodeClick={onNodeClick}
        onPaneClick={handlePaneClick}
      >
        <Background 
          color='#e5e7eb' 
          gap={20} 
          variant={BackgroundVariant.Dots}
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

