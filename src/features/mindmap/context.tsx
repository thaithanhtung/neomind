import { createContext, useContext, ReactNode } from 'react';
import { SelectedText, HighlightedText } from '@/features/mindmap/types';

interface MindMapContextType {
  onTextSelected?: (selected: SelectedText, customPrompt?: string) => void;
  highlightedTexts?: Map<string, HighlightedText[]>;
  onDeleteNode?: (nodeId: string) => void;
  readOnly?: boolean;
}

const MindMapContext = createContext<MindMapContextType | undefined>(undefined);

export const MindMapProvider = ({
  children,
  onTextSelected,
  highlightedTexts,
  onDeleteNode,
  readOnly = false,
}: {
  children: ReactNode;
  onTextSelected: (selected: SelectedText, customPrompt?: string) => void;
  highlightedTexts?: Map<string, HighlightedText[]>;
  onDeleteNode?: (nodeId: string) => void;
  readOnly?: boolean;
}) => {
  return (
    <MindMapContext.Provider
      value={{ onTextSelected, highlightedTexts, onDeleteNode, readOnly }}
    >
      {children}
    </MindMapContext.Provider>
  );
};

export const useMindMapContext = () => {
  const context = useContext(MindMapContext);
  if (!context) {
    throw new Error('useMindMapContext must be used within MindMapProvider');
  }
  return context;
};
