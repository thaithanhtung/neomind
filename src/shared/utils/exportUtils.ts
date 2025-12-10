import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Node, Edge, ReactFlowInstance } from 'reactflow';
import { NodeData } from '@/features/mindmap/types';

/**
 * Export mind map thành PNG
 */
export const exportToPNG = async (
  reactFlowInstance: ReactFlowInstance | null,
  filename: string = 'mindmap'
): Promise<void> => {
  if (!reactFlowInstance) {
    throw new Error('ReactFlow instance không tồn tại');
  }

  try {
    // Lấy viewport element
    const viewportElement = document.querySelector(
      '.react-flow__viewport'
    ) as HTMLElement;
    if (!viewportElement) {
      throw new Error('Không tìm thấy ReactFlow viewport');
    }

    // Lấy nodes
    const nodes = reactFlowInstance.getNodes();
    if (nodes.length === 0) {
      throw new Error('Không có node nào để export');
    }

    const padding = 50;

    // Fit view để đảm bảo tất cả nodes được hiển thị
    reactFlowInstance.fitView({ padding: padding / 2 });

    // Đợi một chút để viewport cập nhật
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Tạo canvas từ viewport
    const canvas = await html2canvas(viewportElement, {
      backgroundColor: '#ffffff',
      useCORS: true,
      scale: 2, // Tăng độ phân giải
      logging: false,
    });

    // Convert sang blob và download
    canvas.toBlob((blob: Blob | null) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  } catch (error) {
    console.error('Error exporting to PNG:', error);
    throw error;
  }
};

/**
 * Export mind map thành PDF
 */
export const exportToPDF = async (
  reactFlowInstance: ReactFlowInstance | null,
  filename: string = 'mindmap',
  title?: string
): Promise<void> => {
  if (!reactFlowInstance) {
    throw new Error('ReactFlow instance không tồn tại');
  }

  try {
    // Lấy viewport element
    const viewportElement = document.querySelector(
      '.react-flow__viewport'
    ) as HTMLElement;
    if (!viewportElement) {
      throw new Error('Không tìm thấy ReactFlow viewport');
    }

    const nodes = reactFlowInstance.getNodes();
    if (nodes.length === 0) {
      throw new Error('Không có node nào để export');
    }

    const padding = 50;

    // Fit view
    reactFlowInstance.fitView({ padding: padding / 2 });
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Tạo canvas
    const canvas = await html2canvas(viewportElement, {
      backgroundColor: '#ffffff',
      useCORS: true,
      scale: 2,
      logging: false,
    });

    // Tạo PDF với kích thước A4
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    // Thêm title nếu có
    if (title) {
      pdf.setFontSize(16);
      pdf.text(title, pdfWidth / 2, 15, { align: 'center' });
    }

    // Thêm canvas vào PDF
    const imgData = canvas.toDataURL('image/png');
    let heightLeft = imgHeight;
    let position = title ? 25 : 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Thêm các trang tiếp theo nếu cần
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Download
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
};

/**
 * Export mind map thành JSON
 */
export const exportToJSON = (
  nodes: Node<NodeData>[],
  edges: Edge[],
  title: string,
  filename: string = 'mindmap'
): void => {
  const data = {
    title,
    nodes,
    edges,
    exportedAt: new Date().toISOString(),
    version: '1.0',
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${filename}.json`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Export mind map thành Markdown
 */
export const exportToMarkdown = (
  nodes: Node<NodeData>[],
  _edges: Edge[],
  title: string,
  filename: string = 'mindmap'
): void => {
  // Tìm root node (node không có parent)
  const rootNodes = nodes.filter((node) => !node.data.parentId);

  // Hàm đệ quy để tạo markdown từ node
  const nodeToMarkdown = (node: Node<NodeData>, level: number = 0): string => {
    const indent = '  '.repeat(level);
    const children = nodes.filter((n) => n.data.parentId === node.id);

    let markdown = `${indent}- **${node.data.label}**\n`;

    // Thêm content nếu có
    if (node.data.content) {
      const content = node.data.content
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .trim();
      if (content) {
        markdown += `${indent}  ${content.split('\n').join(`\n${indent}  `)}\n`;
      }
    }

    // Thêm children
    children.forEach((child) => {
      markdown += nodeToMarkdown(child, level + 1);
    });

    return markdown;
  };

  let markdown = `# ${title}\n\n`;
  markdown += `*Exported on ${new Date().toLocaleString('vi-VN')}*\n\n`;

  rootNodes.forEach((root) => {
    markdown += nodeToMarkdown(root);
  });

  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${filename}.md`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
};
