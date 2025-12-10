import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Node } from 'reactflow';
import { NodeData } from '@/features/mindmap/types';

interface SearchBarProps {
  nodes: Node<NodeData>[];
  onNodeSelect?: (nodeId: string) => void;
  onSearch?: (query: string, results: Node<NodeData>[]) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export const SearchBar = ({
  nodes,
  onNodeSelect,
  onSearch,
  inputRef: externalInputRef,
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Node<NodeData>[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const internalInputRef = useRef<HTMLInputElement>(null);
  const inputRef = externalInputRef || internalInputRef;

  // Tìm kiếm nodes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(-1);
      if (onSearch) {
        onSearch('', []);
      }
      return;
    }

    const searchTerm = query.toLowerCase();
    const matchedNodes = nodes.filter((node) => {
      const label = node.data.label?.toLowerCase() || '';
      const content =
        node.data.content?.replace(/<[^>]+>/g, '').toLowerCase() || '';
      return label.includes(searchTerm) || content.includes(searchTerm);
    });

    setResults(matchedNodes);
    setSelectedIndex(-1);
    if (onSearch) {
      onSearch(query, matchedNodes);
    }
  }, [query, nodes, onSearch]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        handleSelectNode(results[selectedIndex].id);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, results, selectedIndex]);

  const handleSelectNode = (nodeId: string) => {
    if (onNodeSelect) {
      onNodeSelect(nodeId);
    }
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
  };

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className='bg-yellow-200'>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className='relative'>
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
        <input
          ref={inputRef}
          type='text'
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder='Tìm kiếm trong mind map...'
          className='w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              setResults([]);
            }}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
          >
            <X className='w-4 h-4' />
          </button>
        )}
      </div>

      {isOpen && query && (
        <div className='absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50'>
          {results.length === 0 ? (
            <div className='p-4 text-center text-gray-500'>
              Không tìm thấy kết quả nào
            </div>
          ) : (
            <>
              <div className='p-2 text-xs text-gray-500 border-b border-gray-200'>
                Tìm thấy {results.length} kết quả
              </div>
              {results.map((node, index) => (
                <button
                  key={node.id}
                  onClick={() => handleSelectNode(node.id)}
                  className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                    index === selectedIndex ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className='font-semibold text-gray-900 mb-1'>
                    {highlightText(node.data.label || '', query)}
                  </div>
                  {node.data.content && (
                    <div className='text-sm text-gray-600 line-clamp-2'>
                      {highlightText(
                        node.data.content
                          .replace(/<[^>]+>/g, '')
                          .substring(0, 100),
                        query
                      )}
                    </div>
                  )}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};
