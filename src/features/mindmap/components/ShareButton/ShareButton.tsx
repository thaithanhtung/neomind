import { useState } from 'react';
import { Share2, Copy, Check, X, Trash2 } from 'lucide-react';
import {
  mindMapService,
  MindMapShare,
} from '@/features/mindmap/services/supabaseService';

interface ShareButtonProps {
  mindMapId: string;
}

export const ShareButton = ({ mindMapId }: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shareLinks, setShareLinks] = useState<MindMapShare[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleOpenDialog = async () => {
    setIsOpen(true);
    await loadShareLinks();
  };

  const loadShareLinks = async () => {
    setIsLoading(true);
    const links = await mindMapService.getShareLinks(mindMapId);
    setShareLinks(links);
    setIsLoading(false);
  };

  const handleCreateShare = async () => {
    setIsLoading(true);
    const result = await mindMapService.createShareLink(mindMapId);
    if (result) {
      await loadShareLinks();
      // Auto copy to clipboard
      navigator.clipboard.writeText(result.url);
      setCopiedToken(result.token);
      setTimeout(() => setCopiedToken(null), 2000);
    }
    setIsLoading(false);
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/shared/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleRevokeLink = async (token: string) => {
    if (
      !confirm(
        'Bạn có chắc muốn vô hiệu hóa link này? Người khác sẽ không thể truy cập nữa.'
      )
    ) {
      return;
    }
    await mindMapService.revokeShareLink(token);
    await loadShareLinks();
  };

  const handleDeleteLink = async (token: string) => {
    if (!confirm('Bạn có chắc muốn xóa link này?')) {
      return;
    }
    await mindMapService.deleteShareLink(token);
    await loadShareLinks();
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleOpenDialog}
        className='flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
        title='Share Mind Map'
      >
        <Share2 size={20} />
        <span>Share</span>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black bg-opacity-50 z-40'
        onClick={() => setIsOpen(false)}
      />

      {/* Dialog */}
      <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-2xl max-h-[80vh] overflow-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b'>
          <h2 className='text-xl font-semibold flex items-center gap-2'>
            <Share2 size={24} />
            Chia sẻ Mind Map
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 space-y-4'>
          {/* Create Share Link Button */}
          <div className='flex flex-col gap-2'>
            <button
              onClick={handleCreateShare}
              disabled={isLoading}
              className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <Share2 size={20} />
              <span>Tạo link chia sẻ mới (Chỉ xem)</span>
            </button>
            <p className='text-sm text-gray-500 text-center'>
              Người khác chỉ có thể xem, không thể chỉnh sửa mind map của bạn
            </p>
          </div>

          {/* Share Links List */}
          {isLoading && shareLinks.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>Đang tải...</div>
          ) : shareLinks.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              Chưa có link chia sẻ nào. Tạo link đầu tiên!
            </div>
          ) : (
            <div className='space-y-3'>
              <h3 className='font-medium text-gray-700'>Links đã tạo:</h3>
              {shareLinks.map((share) => (
                <div
                  key={share.id}
                  className={`flex items-center gap-2 p-3 border rounded-lg ${
                    share.is_active ? 'bg-white' : 'bg-gray-50 opacity-60'
                  }`}
                >
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          share.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {share.is_active ? 'Hoạt động' : 'Đã vô hiệu hóa'}
                      </span>
                      <span className='text-xs text-gray-500'>
                        {share.permission === 'view'
                          ? '👁️ Chỉ xem'
                          : '✏️ Chỉnh sửa'}
                      </span>
                    </div>
                    <p className='text-sm text-gray-600 truncate font-mono'>
                      {`${window.location.origin}/shared/${share.share_token}`}
                    </p>
                    <p className='text-xs text-gray-400 mt-1'>
                      Tạo lúc:{' '}
                      {new Date(share.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className='flex gap-1'>
                    {share.is_active && (
                      <button
                        onClick={() => handleCopyLink(share.share_token)}
                        className='p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors'
                        title='Copy link'
                      >
                        {copiedToken === share.share_token ? (
                          <Check size={18} className='text-green-600' />
                        ) : (
                          <Copy size={18} />
                        )}
                      </button>
                    )}
                    {share.is_active && (
                      <button
                        onClick={() => handleRevokeLink(share.share_token)}
                        className='p-2 text-orange-600 hover:bg-orange-50 rounded transition-colors'
                        title='Vô hiệu hóa'
                      >
                        <X size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteLink(share.share_token)}
                      className='p-2 text-red-600 hover:bg-red-50 rounded transition-colors'
                      title='Xóa'
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
