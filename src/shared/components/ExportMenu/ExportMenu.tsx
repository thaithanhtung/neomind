import { useState, useRef, useEffect } from 'react';
import {
  Download,
  FileImage,
  FileText,
  FileJson,
  FileCode,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import {
  exportToPNG,
  exportToPDF,
  exportToJSON,
  exportToMarkdown,
} from '@/shared/utils/exportUtils';
import { Node, Edge, ReactFlowInstance } from 'reactflow';
import { NodeData } from '@/features/mindmap/types';

interface ExportMenuProps {
  reactFlowInstance: ReactFlowInstance | null;
  nodes: Node<NodeData>[];
  edges: Edge[];
  title: string;
}

export const ExportMenu = ({
  reactFlowInstance,
  nodes,
  edges,
  title,
}: ExportMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Đóng menu khi click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as HTMLElement)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleExport = async (type: 'png' | 'pdf' | 'json' | 'markdown') => {
    if (!reactFlowInstance || isExporting) return;

    setIsExporting(true);
    setIsOpen(false);

    try {
      const filename =
        title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'mindmap';

      switch (type) {
        case 'png':
          await exportToPNG(reactFlowInstance, filename);
          break;
        case 'pdf':
          await exportToPDF(reactFlowInstance, filename, title);
          break;
        case 'json':
          exportToJSON(nodes, edges, title, filename);
          break;
        case 'markdown':
          exportToMarkdown(nodes, edges, title, filename);
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Có lỗi xảy ra khi export. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className='relative' ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting || !reactFlowInstance}
        className='flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        title='Export mind map'
      >
        {isExporting ? (
          <>
            <Loader2 className='w-4 h-4 animate-spin' />
            <span className='hidden sm:inline'>Đang export...</span>
          </>
        ) : (
          <>
            <Download className='w-4 h-4' />
            <span className='hidden sm:inline'>Export</span>
            <ChevronDown className='w-4 h-4' />
          </>
        )}
      </button>

      {isOpen && (
        <div className='absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50'>
          <button
            onClick={() => handleExport('png')}
            className='w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors'
          >
            <FileImage className='w-5 h-5 text-blue-600' />
            <div className='text-left'>
              <div className='font-medium'>Export PNG</div>
              <div className='text-xs text-gray-500'>
                Hình ảnh chất lượng cao
              </div>
            </div>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className='w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors'
          >
            <FileText className='w-5 h-5 text-red-600' />
            <div className='text-left'>
              <div className='font-medium'>Export PDF</div>
              <div className='text-xs text-gray-500'>Tài liệu PDF</div>
            </div>
          </button>
          <button
            onClick={() => handleExport('markdown')}
            className='w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors'
          >
            <FileCode className='w-5 h-5 text-purple-600' />
            <div className='text-left'>
              <div className='font-medium'>Export Markdown</div>
              <div className='text-xs text-gray-500'>Định dạng Markdown</div>
            </div>
          </button>
          <button
            onClick={() => handleExport('json')}
            className='w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors'
          >
            <FileJson className='w-5 h-5 text-yellow-600' />
            <div className='text-left'>
              <div className='font-medium'>Export JSON</div>
              <div className='text-xs text-gray-500'>Backup dữ liệu</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
