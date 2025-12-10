import { useState, useEffect, KeyboardEvent } from 'react';
import { X, Tag } from 'lucide-react';
import { getTagsForMindMap, saveTagsForMindMap } from '@/shared/utils/tags';

interface TagInputProps {
  mindMapId: string;
  onTagsChange?: (tags: string[]) => void;
}

export const TagInput = ({ mindMapId, onTagsChange }: TagInputProps) => {
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  // Load tags khi mindMapId thay đổi
  useEffect(() => {
    if (mindMapId) {
      const loadedTags = getTagsForMindMap(mindMapId);
      setTags(loadedTags);
    } else {
      setTags([]);
    }
  }, [mindMapId]);

  const handleAddTag = (tag: string) => {
    if (!mindMapId) return;

    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      setTags(newTags);
      saveTagsForMindMap(mindMapId, newTags);
      if (onTagsChange) {
        onTagsChange(newTags);
      }
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!mindMapId) return;

    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    saveTagsForMindMap(mindMapId, newTags);
    if (onTagsChange) {
      onTagsChange(newTags);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      handleRemoveTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className='space-y-2'>
      <label className='text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2'>
        <Tag className='w-4 h-4' />
        Tags
      </label>
      <div className='flex flex-wrap gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 min-h-[40px]'>
        {tags.map((tag) => (
          <span
            key={tag}
            className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm'
          >
            {tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className='hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded p-0.5 transition-colors'
            >
              <X className='w-3 h-3' />
            </button>
          </span>
        ))}
        <input
          type='text'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Thêm tag...'
          className='flex-1 min-w-[120px] outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500'
        />
      </div>
    </div>
  );
};
