/**
 * API Usage Badge - Hiển thị số lượng requests còn lại
 * Helps users track their daily API usage
 */

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { getAPIUsage } from '../services/edgeFunctionService';

interface APIUsage {
  count: number;
  limit: number;
  remaining: number;
}

export const APIUsageBadge = () => {
  const [usage, setUsage] = useState<APIUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsage();

    // Refresh every 30 seconds
    const interval = setInterval(loadUsage, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUsage = async () => {
    try {
      const data = await getAPIUsage();
      setUsage(data);
    } catch (error) {
      console.error('Failed to load API usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs'>
        <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600' />
        <span className='text-gray-600 dark:text-gray-400'>Loading...</span>
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  const percentage = (usage.count / usage.limit) * 100;

  // Color based on usage
  let bgColor = 'bg-green-100 dark:bg-green-900';
  let textColor = 'text-green-700 dark:text-green-300';
  let Icon = CheckCircle;

  if (percentage >= 90) {
    bgColor = 'bg-red-100 dark:bg-red-900';
    textColor = 'text-red-700 dark:text-red-300';
    Icon = XCircle;
  } else if (percentage >= 70) {
    bgColor = 'bg-yellow-100 dark:bg-yellow-900';
    textColor = 'text-yellow-700 dark:text-yellow-300';
    Icon = AlertCircle;
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 ${bgColor} rounded-lg text-xs font-medium ${textColor}`}
      title={`You have used ${usage.count} out of ${usage.limit} requests today`}
    >
      <Icon className='w-3.5 h-3.5' />
      <span>
        {usage.remaining} / {usage.limit} requests
      </span>
      {percentage >= 90 && (
        <span className='ml-1 text-xs opacity-75'>
          ({100 - Math.round(percentage)}% left)
        </span>
      )}
    </div>
  );
};
