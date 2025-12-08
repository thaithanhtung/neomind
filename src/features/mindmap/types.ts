export interface NodeData {
  id: string;
  label: string;
  content: string;
  level: number;
  parentId?: string;
  width?: number;
  height?: number;
}

export interface SelectedText {
  text: string;
  startIndex: number;
  endIndex: number;
  nodeId: string;
}

export interface HighlightedText {
  startIndex: number;
  endIndex: number;
  nodeId: string;
  level: number;
}

