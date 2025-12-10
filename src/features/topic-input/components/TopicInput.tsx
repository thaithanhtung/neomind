import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { analytics } from '@/shared/utils/analytics';

interface TopicInputProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
}

export const TopicInput = ({ onSubmit, isLoading }: TopicInputProps) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      const topicText = topic.trim();
      onSubmit(topicText);
      analytics.trackTopicSubmit(topicText);
      setTopic('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className='w-full max-w-2xl mx-auto'>
      <div className='relative flex items-center'>
        <input
          type='text'
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder='Nhập chủ đề hoặc câu hỏi của bạn...'
          className='w-full px-6 py-4 pr-14 text-lg rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors shadow-sm'
          disabled={isLoading}
        />
        <button
          type='submit'
          disabled={isLoading || !topic.trim()}
          className='absolute right-2 p-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          {isLoading ? (
            <Loader2 className='w-5 h-5 animate-spin' />
          ) : (
            <Send className='w-5 h-5' />
          )}
        </button>
      </div>
    </form>
  );
};
