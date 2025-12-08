import { Node } from 'reactflow';
import { NodeData } from '@/features/mindmap/types';

export const createNodeId = (): string => {
  return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const createEdgeId = (sourceId: string, targetId: string): string => {
  return `edge-${sourceId}-${targetId}`;
};

/**
 * Tính toán vị trí cho node mới dựa trên node cha và các node con hiện có
 */
export const getNodePosition = (
  parentNode: Node<NodeData>,
  existingNodes: Node<NodeData>[] = [],
  newNodeWidth: number = 400,
  newNodeHeight: number = 300
): { x: number; y: number } => {
  const parentWidth = parentNode.width || 400;
  const parentHeight = parentNode.height || 300;
  const parentX = parentNode.position.x || 0;
  const parentY = parentNode.position.y || 0;

  // Tìm tất cả các node con của parentNode
  const childNodes = existingNodes.filter(
    (node) => node.data.parentId === parentNode.id
  );

  // Khoảng cách giữa các node
  const spacingX = newNodeWidth + 50;
  const spacingY = newNodeHeight + 50;

  // Vị trí mặc định: đặt node con ở dưới node cha, căn giữa theo chiều ngang
  let newX = parentX + parentWidth / 2 - newNodeWidth / 2;
  let newY = parentY + parentHeight + spacingY / 2;

  // Nếu đã có node con, phân bố đều quanh node cha
  if (childNodes.length > 0) {
    const childCount = childNodes.length;
    
    // Tính góc để phân bố đều trên vòng tròn (bắt đầu từ dưới)
    const angleStep = (2 * Math.PI) / (childCount + 1);
    const angle = angleStep * (childCount + 1) - Math.PI / 2; // Bắt đầu từ dưới
    
    // Bán kính để đặt node con (khoảng cách từ tâm node cha)
    const radius = Math.max(parentWidth, parentHeight) + spacingX;
    
    // Tính vị trí dựa trên góc và bán kính
    newX = parentX + parentWidth / 2 + Math.cos(angle) * radius - newNodeWidth / 2;
    newY = parentY + parentHeight / 2 + Math.sin(angle) * radius - newNodeHeight / 2;
  }

  // Kiểm tra và điều chỉnh để tránh overlap với các node khác
  const padding = 20;
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    let hasOverlap = false;

    for (const existingNode of existingNodes) {
      const exX = existingNode.position.x || 0;
      const exY = existingNode.position.y || 0;
      const exWidth = existingNode.width || 400;
      const exHeight = existingNode.height || 300;

      // Kiểm tra overlap
      if (
        newX < exX + exWidth + padding &&
        newX + newNodeWidth + padding > exX &&
        newY < exY + exHeight + padding &&
        newY + newNodeHeight + padding > exY
      ) {
        hasOverlap = true;
        // Di chuyển sang phải một chút
        newX += spacingX / 2;
        break;
      }
    }

    if (!hasOverlap) {
      break;
    }

    attempts++;
  }

  return { x: newX, y: newY };
};

/**
 * Tính toán vị trí cho node đầu tiên (root node)
 */
export const getInitialNodePosition = (
  viewportWidth: number = 1200,
  viewportHeight: number = 800
): { x: number; y: number } => {
  // Đặt node đầu tiên ở giữa viewport, hơi lệch lên trên một chút
  return {
    x: viewportWidth / 2 - 200, // Trừ đi một nửa width của node (400/2)
    y: viewportHeight / 2 - 150, // Trừ đi một nửa height của node (300/2)
  };
};

