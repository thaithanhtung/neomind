import { useCallback } from 'react';
import { generateContent } from '@/features/ai/services/aiService';
import { Node } from 'reactflow';
import { NodeData } from '@/features/mindmap/types';

export const useTopicInput = (
  onCreateNode: (node: Node<NodeData>) => void,
  onUpdateNode: (node: Node<NodeData>) => void,
  setIsLoading: (loading: boolean) => void
) => {
  const handleTopicSubmit = useCallback(
    async (topic: string) => {
      setIsLoading(true);
      try {
        const newNodeId = `node-${Date.now()}`;

        // ✨ Tạo node với loading state trước
        const loadingNode: Node<NodeData> = {
          id: newNodeId,
          type: 'custom',
          position: {
            x: Math.random() * 400 + 100,
            y: Math.random() * 400 + 100,
          },
          data: {
            id: newNodeId,
            label: topic,
            content: '',
            level: 0,
            isLoading: true,
          },
          selected: false,
        };

        onCreateNode(loadingNode);

        // ✨ Generate content với STREAMING
        const content = await generateContent(
          topic,
          undefined,
          // Streaming callback: update node content real-time
          (streamedContent) => {
            const streamNode: Node<NodeData> = {
              ...loadingNode,
              data: {
                ...loadingNode.data,
                content: streamedContent.replace(/\n/g, '<br>'),
                isLoading: false, // ✨ TẮT loading để hiển thị content ngay
              },
            };
            onUpdateNode(streamNode);
          }
        );

        // Cập nhật node cuối cùng
        const finalNode: Node<NodeData> = {
          ...loadingNode,
          data: {
            ...loadingNode.data,
            content: content.replace(/\n/g, '<br>'),
            isLoading: false,
          },
        };

        onUpdateNode(finalNode);
      } catch (error) {
        console.error('Error generating content:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [onCreateNode, onUpdateNode, setIsLoading]
  );

  return { handleTopicSubmit };
};
