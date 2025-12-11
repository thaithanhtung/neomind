import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { MindMap } from '@/features/mindmap/services/supabaseService';
import { getTagsForMindMap } from '@/shared/utils/tags';

interface MindMapSearchBarProps {
  mindMaps: MindMap[];
  onSearchChange?: (filteredMaps: MindMap[]) => void;
}

export const MindMapSearchBar = ({
  mindMaps,
  onSearchChange,
}: MindMapSearchBarProps) => {
  const [query, setQuery] = useState('');

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);

    if (!searchQuery.trim()) {
      if (onSearchChange) {
        onSearchChange(mindMaps);
      }
      return;
    }

    const searchTerm = searchQuery.toLowerCase();
    const filtered = mindMaps.filter((mindMap) => {
      // Tìm theo title
      const titleMatch = mindMap.title.toLowerCase().includes(searchTerm);

      // Tìm theo tags
      const tags = getTagsForMindMap(mindMap.id);
      const tagMatch = tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm)
      );

      return titleMatch || tagMatch;
    });

    if (onSearchChange) {
      onSearchChange(filtered);
    }
  };

  return (
    <div className='relative w-full max-w-md'>
      <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
      <input
        type='text'
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder='Tìm kiếm mind map...'
        className='w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
      />
      {query && (
        <button
          onClick={() => {
            setQuery('');
            handleSearch('');
          }}
          className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
        >
          <X className='w-4 h-4' />
        </button>
      )}
    </div>
  );
};


