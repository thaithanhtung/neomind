import { useCallback } from 'react';
import { generateContent } from '@/features/ai/services/aiService';
import { Node } from 'reactflow';
import { NodeData } from '@/features/mindmap/types';

export const useTopicInput = (
  onCreateNode: (node: Node<NodeData>) => void,
  setIsLoading: (loading: boolean) => void
) => {
  const handleTopicSubmit = useCallback(
    async (topic: string) => {
      setIsLoading(true);
      try {
        const content = await generateContent(topic);
        const newNodeId = `node-${Date.now()}`;

        const newNode: Node<NodeData> = {
          id: newNodeId,
          type: 'custom',
          position: {
            x: Math.random() * 400 + 100,
            y: Math.random() * 400 + 100,
          },
          data: {
            id: newNodeId,
            label: topic,
            content: content.replace(/\n/g, '<br>'),
            level: 0,
          },
          selected: false,
        };

        onCreateNode(newNode);
      } catch (error) {
        console.error('Error generating content:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [onCreateNode, setIsLoading]
  );

  return { handleTopicSubmit };
};
