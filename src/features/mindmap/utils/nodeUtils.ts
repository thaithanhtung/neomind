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
  const spacingX = newNodeWidth + 80;
  const spacingY = newNodeHeight + 80;

  // Vị trí mặc định: đặt node con ở dưới node cha, căn giữa theo chiều ngang
  let newX = parentX + parentWidth / 2 - newNodeWidth / 2;
  let newY = parentY + parentHeight + spacingY / 2;

  // Nếu đã có node con, sắp xếp các node con thành một hàng ngang phía dưới node cha
  if (childNodes.length > 0) {
    const childIndex = childNodes.length; // index của node mới trong danh sách con
    const totalChildren = childNodes.length + 1;

    // Tổng chiều rộng mà hàng con chiếm (theo spacingX)
    const totalWidth = (totalChildren - 1) * spacingX;

    // Căn giữa hàng con so với tâm node cha
    const centerX = parentX + parentWidth / 2 - newNodeWidth / 2;
    const startX = centerX - totalWidth / 2;

    newX = startX + childIndex * spacingX;
    newY = parentY + parentHeight + spacingY / 2;
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

/**
 * Auto arrange dạng cây dọc (top-down):
 * - Dựa vào level trong NodeData
 * - Mỗi level là một hàng ngang
 * - Các node trong cùng level được căn giữa theo trục X
 */
export const autoArrangeNodes = (
  nodes: Node<NodeData>[],
  options?: { spacingX?: number; spacingY?: number }
): Node<NodeData>[] => {
  if (!nodes || nodes.length === 0) return nodes;

  const spacingX = options?.spacingX ?? 120;
  const spacingY = options?.spacingY ?? 140;

  const levels = new Map<number, Node<NodeData>[]>();

  nodes.forEach((node) => {
    const level =
      node.data && typeof (node.data as NodeData).level === 'number'
        ? (node.data as NodeData).level
        : 0;
    if (!levels.has(level)) {
      levels.set(level, []);
    }
    levels.get(level)!.push(node);
  });

  const sortedLevels = Array.from(levels.entries()).sort(
    ([a], [b]) => a - b
  );

  const newNodes: Node<NodeData>[] = [];
  let globalMinX = Infinity;
  let globalMinY = Infinity;

  sortedLevels.forEach(([level, levelNodes]) => {
    if (levelNodes.length === 0) return;

    const sortedNodes = [...levelNodes].sort((a, b) => {
      const aParent = (a.data as NodeData).parentId || '';
      const bParent = (b.data as NodeData).parentId || '';
      if (aParent === bParent) {
        return a.id.localeCompare(b.id);
      }
      return aParent.localeCompare(bParent);
    });

    const count = sortedNodes.length;

    const widths = sortedNodes.map((node) => {
      const dataWidth = (node.data as NodeData)?.width;
      const runtimeWidth = node.width;
      return dataWidth ?? runtimeWidth ?? 400;
    });

    const heights = sortedNodes.map((node) => {
      const dataHeight = (node.data as NodeData)?.height;
      const runtimeHeight = node.height;
      return dataHeight ?? runtimeHeight ?? 300;
    });

    const totalNodesWidth = widths.reduce((sum, w) => sum + w, 0);
    const totalGapsWidth = (count - 1) * spacingX;
    const totalWidth = totalNodesWidth + totalGapsWidth;

    const startX = -totalWidth / 2;

    const maxHeight = heights.length > 0 ? Math.max(...heights) : 300;
    const y = level * (maxHeight + spacingY);

    let currentX = startX;

    sortedNodes.forEach((node, index) => {
      const width = widths[index] ?? 400;
      const x = currentX;

      const updatedNode: Node<NodeData> = {
        ...node,
        position: { x, y },
      };

      globalMinX = Math.min(globalMinX, x);
      globalMinY = Math.min(globalMinY, y);

      newNodes.push(updatedNode);

      currentX += width + spacingX;
    });
  });

  const padding = 50;
  if (globalMinX === Infinity || globalMinY === Infinity) {
    return newNodes;
  }

  const offsetX = globalMinX < 0 ? -globalMinX + padding : padding;
  const offsetY = globalMinY < 0 ? -globalMinY + padding : padding;

  return newNodes.map((node) => ({
    ...node,
    position: {
      x: node.position.x + offsetX,
      y: node.position.y + offsetY,
    },
  }));
};

