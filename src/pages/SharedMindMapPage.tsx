import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Node, Edge } from 'reactflow';
import { Eye, Lock, AlertCircle } from 'lucide-react';
import { MindMap } from '@/features/mindmap/components/MindMap';
import { MindMapProvider } from '@/features/mindmap/context';
import { LoadingOverlay } from '@/shared/components/LoadingOverlay';
import {
  mindMapService,
  MindMap as MindMapType,
} from '@/features/mindmap/services/supabaseService';
import { NodeData, HighlightedText } from '@/features/mindmap/types';

export const SharedMindMapPage = () => {
  const { token } = useParams<{ token: string }>();
  const [mindMap, setMindMap] = useState<MindMapType | null>(null);
  const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [highlightedTexts, setHighlightedTexts] = useState<
    Map<string, HighlightedText[]>
  >(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const loadSharedMindMap = async () => {
      if (!token) {
        setError('Link không hợp lệ');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await mindMapService.loadSharedMindMap(token);

        if (!result) {
          setError('Link không tồn tại hoặc đã hết hạn');
          setIsLoading(false);
          return;
        }

        setMindMap(result.mindMap);
        setNodes(result.nodes);
        setEdges(result.edges);
        setHighlightedTexts(result.highlightedTexts);
        setIsOwner(result.isOwner);
      } catch (err) {
        console.error('Error loading shared mind map:', err);
        setError('Có lỗi xảy ra khi tải mind map');
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedMindMap();
  }, [token]);

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (error || !mindMap) {
    return (
      <div className='w-full h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100'>
        <div className='max-w-md p-8 bg-white rounded-xl shadow-lg'>
          <div className='flex flex-col items-center gap-4 text-center'>
            <div className='p-4 bg-red-100 rounded-full'>
              <AlertCircle size={48} className='text-red-600' />
            </div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Không thể truy cập
            </h1>
            <p className='text-gray-600'>
              {error || 'Link chia sẻ không hợp lệ hoặc đã hết hạn.'}
            </p>
            <a
              href='/'
              className='mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              Về trang chủ
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100'>
      {/* Header với thông tin read-only */}
      <div className='bg-white border-b border-gray-200 shadow-sm'>
        <div className='px-6 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <h1 className='text-2xl font-bold text-gray-900'>
              {mindMap.title}
            </h1>
            {isOwner && (
              <span className='text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full'>
                Bạn là chủ sở hữu
              </span>
            )}
          </div>
          <a
            href='/'
            className='px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
          >
            Về trang chủ
          </a>
        </div>

        {/* Read-only banner */}
        {!isOwner && (
          <div className='px-6 py-3 bg-amber-50 border-t border-amber-100'>
            <div className='flex items-center gap-3 text-amber-800'>
              <Lock size={20} />
              <div className='flex-1'>
                <p className='font-semibold'>Chế độ chỉ xem</p>
                <p className='text-sm text-amber-700'>
                  Bạn đang xem mind map được chia sẻ. Không thể chỉnh sửa nội
                  dung.
                </p>
              </div>
              <Eye size={24} className='text-amber-600' />
            </div>
          </div>
        )}
      </div>

      {/* Mind Map Canvas */}
      <div className='flex-1 relative overflow-hidden'>
        {nodes.length === 0 ? (
          <div className='w-full h-full flex items-center justify-center'>
            <div className='text-center space-y-4'>
              <div className='text-6xl'>🤔</div>
              <h2 className='text-xl font-semibold text-gray-700'>
                Mind map này chưa có nội dung
              </h2>
              <p className='text-gray-500'>
                Chủ sở hữu chưa tạo node nào trong mind map này.
              </p>
            </div>
          </div>
        ) : (
          <div className='w-full h-full'>
            <MindMapProvider
              onTextSelected={() => {}} // Disabled in read-only mode
              highlightedTexts={highlightedTexts}
              onDeleteNode={() => {}} // Disabled in read-only mode
              readOnly={true} // READ-ONLY MODE
            >
              <MindMap
                nodes={nodes}
                edges={edges}
                onNodesChange={() => {}} // Disabled
                onEdgesChange={() => {}} // Disabled
                onConnect={() => {}} // Disabled
                onNodeClick={() => {}} // Disabled
                readOnly={true} // READ-ONLY MODE
              />
            </MindMapProvider>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className='bg-white border-t border-gray-200 px-6 py-3'>
        <p className='text-sm text-gray-500 text-center'>
          Powered by NeoMind • Mind Mapping Tool
        </p>
      </div>
    </div>
  );
};
