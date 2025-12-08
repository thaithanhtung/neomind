import { createContext, useContext, ReactNode } from 'react';
import { SelectedText } from '@/features/mindmap/types';

interface MindMapContextType {
  onTextSelected?: (selected: SelectedText, customPrompt?: string) => void;
}

const MindMapContext = createContext<MindMapContextType | undefined>(undefined);

export const MindMapProvider = ({
  children,
  onTextSelected,
}: {
  children: ReactNode;
  onTextSelected: (selected: SelectedText, customPrompt?: string) => void;
}) => {
  return (
    <MindMapContext.Provider value={{ onTextSelected }}>
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

