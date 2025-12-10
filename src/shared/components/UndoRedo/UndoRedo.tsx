import { Undo2, Redo2 } from 'lucide-react';

interface UndoRedoProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const UndoRedo = ({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: UndoRedoProps) => {
  return (
    <div className='flex items-center gap-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden'>
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
        title='Undo (Ctrl+Z)'
      >
        <Undo2 className='w-4 h-4' />
      </button>
      <div className='w-px h-6 bg-gray-200' />
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
        title='Redo (Ctrl+Shift+Z)'
      >
        <Redo2 className='w-4 h-4' />
      </button>
    </div>
  );
};
