import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, NodeResizeControl } from 'reactflow';
import {
  Maximize2,
  Sparkles,
  Zap,
  Brain,
  Loader2,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { NodeData } from '@/features/mindmap/types';
import { useMindMapContext } from '@/features/mindmap/context';
import { LEVEL_COLORS } from '@/features/mindmap/constants/nodeColors';
import { NodeTitle } from './NodeTitle';
import { NodeContent } from './NodeContent';
import { useUserSettings } from '@/shared/hooks/useUserSettings';
import {
  getColorTemplateById,
  getDefaultColorTemplate,
} from '@/shared/utils/nodeColorTemplates';

interface CustomNodeProps extends NodeProps {
  data: NodeData;
}

export const CustomNode = memo(({ data, selected }: CustomNodeProps) => {
  const { onTextSelected, highlightedTexts, onDeleteNode } =
    useMindMapContext();
  const highlights = highlightedTexts?.get(data.id) || [];
  const { settings } = useUserSettings();
  const [isHovered, setIsHovered] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteNode) {
      onDeleteNode(data.id);
    }
  };

  // Hàm để extract text từ HTML
  const extractTextFromHTML = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Nếu đang đọc, dừng lại
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Lấy text từ content (bao gồm cả title)
    const titleText = data.label || '';
    const contentText = extractTextFromHTML(data.content || '');
    const fullText = `${titleText}. ${contentText}`.trim();

    if (!fullText || fullText === '.') {
      return;
    }

    // Tạo utterance
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'vi-VN'; // Tiếng Việt
    utterance.rate = 1.0; // Tốc độ đọc
    utterance.pitch = 1.0; // Cao độ
    utterance.volume = 1.0; // Âm lượng

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      speechSynthesisRef.current = null;
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      speechSynthesisRef.current = null;
    };

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Lấy color template từ settings
  const colorTemplate =
    getColorTemplateById(settings.uiConfig.nodeColorTemplate) ||
    getDefaultColorTemplate();
  const colorClass =
    colorTemplate.colors[data.level % colorTemplate.colors.length] ||
    LEVEL_COLORS[data.level % LEVEL_COLORS.length];

  // Sử dụng màu từ UI config
  const borderColor = settings.uiConfig.nodeBorderColor;
  const borderClass = selected
    ? 'border-gray-500'
    : isHovered
    ? 'border-gray-400'
    : 'border-gray-300';

  const controlStyle = {
    background: 'transparent',
    border: 'none',
    width: '24px',
    height: '24px',
    bottom: '6px',
    right: '6px',
  };

  // Lấy width và height từ data hoặc sử dụng giá trị mặc định nhỏ
  const nodeWidth = data.width || 400;
  const nodeHeight = data.height || 300;

  // Get icon based on level
  const getLevelIcon = () => {
    switch (data.level) {
      case 0:
        return <Brain className='w-4 h-4' />;
      case 1:
        return <Sparkles className='w-4 h-4' />;
      case 2:
        return <Zap className='w-4 h-4' />;
      default:
        return <Sparkles className='w-4 h-4' />;
    }
  };

  return (
    <div
      className={`rounded-2xl shadow-xl ${colorClass} border-2 ${borderClass} transition-all duration-300 relative transform ${
        selected ? 'ring-4 ring-offset-2 ring-blue-400 scale-[1.02]' : ''
      } ${isHovered && !selected ? 'shadow-2xl scale-[1.01]' : ''}`}
      style={{
        width: `${nodeWidth}px`,
        height: `${nodeHeight}px`,
        borderColor: borderColor,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* NodeResizeControl với icon - chỉ hiển thị khi node được chọn hoặc hover */}
      {(selected || isHovered) && (
        <NodeResizeControl
          style={controlStyle}
          minWidth={200}
          minHeight={150}
          // maxWidth={800}
          // maxHeight={600}
        >
          <div
            className='bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-full p-1.5 shadow-xl transition-all duration-200 cursor-nwse-resize transform hover:scale-110'
            data-tour='node-resize'
          >
            <Maximize2 className='w-3.5 h-3.5 text-white' />
          </div>
        </NodeResizeControl>
      )}
      <Handle
        type='target'
        position={Position.Top}
        className='w-4 h-4 !bg-gradient-to-br !from-blue-500 !to-indigo-600 !border-2 !border-white shadow-lg'
      />

      <div className='p-4 h-full flex flex-col overflow-hidden'>
        {/* Level indicator và Action buttons */}
        <div className='absolute top-3 right-3 flex items-center gap-2 z-30'>
          {/* Speak button - chỉ hiển thị nếu tính năng được bật */}
          {settings.enableTextToSpeech && !data.isLoading && data.content && (
            <button
              onClick={handleSpeak}
              className={`p-2 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-110 ${
                isSpeaking
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white opacity-90 hover:opacity-100'
              }`}
              title={isSpeaking ? 'Dừng đọc' : 'Đọc nội dung'}
            >
              {isSpeaking ? (
                <VolumeX className='w-4 h-4' />
              ) : (
                <Volume2 className='w-4 h-4' />
              )}
            </button>
          )}
          {/* Delete button - chỉ hiển thị khi selected hoặc hover */}
          {(selected || isHovered) && onDeleteNode && (
            <button
              onClick={handleDelete}
              className='p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-all duration-200 transform hover:scale-110 opacity-90 hover:opacity-100'
              title='Xóa node'
            >
              <Trash2 className='w-4 h-4' />
            </button>
          )}
          {selected && (
            <div className='text-xs text-blue-600 bg-blue-100 px-2.5 py-1.5 rounded-lg font-medium shadow-sm'>
              Text selectable
            </div>
          )}
          <div
            className={`p-1.5 rounded-lg shadow-sm ${
              data.level === 0
                ? 'bg-purple-100 text-purple-600'
                : data.level === 1
                ? 'bg-blue-100 text-blue-600'
                : data.level === 2
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {getLevelIcon()}
          </div>
        </div>
        <div className='flex-shrink-0 mb-3'>
          <NodeTitle
            label={data.label}
            selected={selected}
            onMouseDown={(e) => {
              if (selected) {
                e.stopPropagation();
              }
            }}
          />
        </div>
        <div className='flex-1 min-h-0 overflow-hidden'>
          {data.isLoading ? (
            <div className='w-full h-full flex items-center justify-center p-8'>
              <div className='flex flex-col items-center gap-4'>
                <div className='relative'>
                  <div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-xl opacity-40 animate-pulse'></div>
                  <div className='relative w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center animate-spin'>
                    <Loader2 className='w-6 h-6 text-white' />
                  </div>
                </div>
                <div className='text-center'>
                  <p className='text-sm font-medium text-gray-700'>
                    Đang tạo nội dung...
                  </p>
                  <p className='text-xs text-gray-500 mt-1'>
                    Vui lòng chờ trong giây lát
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <NodeContent
              content={data.content}
              nodeId={data.id}
              selected={selected}
              highlightedTexts={highlights}
              onTextSelected={onTextSelected}
            />
          )}
        </div>
      </div>

      <Handle
        type='source'
        position={Position.Bottom}
        className='w-4 h-4 !bg-gradient-to-br !from-blue-500 !to-indigo-600 !border-2 !border-white shadow-lg'
      />

      {/* Hover effect gradient */}
      {isHovered && !selected && (
        <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl pointer-events-none animate-fadeIn' />
      )}
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
