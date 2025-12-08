import { Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface AddButtonProps {
  position: { top: number; left: number };
  onClick: (e: React.MouseEvent) => void;
}

export const AddButton = ({ position, onClick }: AddButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className='absolute z-[100] pointer-events-auto'
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        position: 'absolute',
      }}
    >
      {/* Tooltip */}
      <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap transition-all duration-200 ${
        isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'
      }`}>
        Tạo node mới
        <div className='absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900'></div>
      </div>
      
      {/* Button with animation */}
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className='relative group w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl'
        data-add-button="true"
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        {/* Glow effect */}
        <div className='absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300'></div>
        
        {/* Icon container */}
        <div className='relative flex items-center justify-center'>
          <Plus className='w-5 h-5 transition-transform duration-300 group-hover:rotate-90' />
          <Sparkles className='absolute w-3 h-3 -top-1 -right-1 text-yellow-300 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110' />
        </div>
      </button>
    </div>
  );
};

