/**
 * Edge Function Service - Calls Supabase Edge Functions for AI content generation
 * This keeps OpenAI API keys secure on the server-side
 */

import { supabase } from '@/features/mindmap/services/supabaseService';

// Types for Edge Function requests and responses (for documentation)
// These interfaces document the expected API shape

/**
 * Extract content from various OpenAI response formats
 * Handles multiple possible response structures from Edge Function
 */
const extractContentFromResponse = (data: any): string | null => {
  if (!data) return null;

  // Try all possible formats
  const formats = [
    // Format 1: Standard OpenAI chat completion
    () => data?.choices?.[0]?.message?.content,
    // Format 2: OpenAI completion (older models)
    () => data?.choices?.[0]?.text,
    // Format 3: Wrapped content
    () => data?.content,
    // Format 4: Nested data (Supabase wrapper)
    () => data?.data?.choices?.[0]?.message?.content,
    // Format 5: Direct string
    () => (typeof data === 'string' && data.trim() ? data : null),
  ];

  for (const format of formats) {
    try {
      const content = format();
      if (content && typeof content === 'string' && content.trim().length > 0) {
        return content;
      }
    } catch (e) {
      // Skip to next format
      continue;
    }
  }

  return null;
};

/**
 * Generate content using Supabase Edge Function (Server-side OpenAI call)
 * ✅ Secure: API keys stay on server
 * ✅ Rate limiting: Tracked in database
 * ✅ Streaming: Real-time response
 */
export const generateContentViaEdgeFunction = async (
  prompt: string,
  systemPrompt?: string,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke(
      'generate-content',
      {
        body: {
          prompt,
          systemPrompt,
          stream: !!onChunk, // Enable streaming if callback provided
        },
      }
    );

    // Debug: Log response

    if (error) {
      console.error('❌ Edge Function error:', error);

      // Check if function not found/not deployed
      if (
        error.message?.includes('not found') ||
        error.message?.includes('FunctionsRelayError')
      ) {
        throw new Error(
          'Edge Function chưa được deploy. Vui lòng chạy: supabase functions deploy generate-content'
        );
      }

      // Handle rate limiting
      if (error.message?.includes('Rate limit')) {
        throw new Error(
          'Bạn đã đạt giới hạn số lượng requests hôm nay. Vui lòng thử lại vào ngày mai.'
        );
      }

      throw new Error(error.message || 'Failed to generate content');
    }

    // CRITICAL: Parse Response object if needed
    // Supabase sometimes returns raw Response instead of parsed JSON
    let parsedData = data;
    if (data instanceof Response) {
      const contentType = data.headers.get('content-type');

      if (contentType?.includes('text/event-stream')) {
        // Streaming response
        if (onChunk) {
          return await handleStreamingResponse(
            data.body as ReadableStream,
            onChunk
          );
        }
      } else if (contentType?.includes('application/json')) {
        // JSON response - parse it
        parsedData = await data.json();
      } else {
        // Text response
        parsedData = await data.text();
      }
    }

    // Handle streaming response (if not already handled above)
    if (onChunk && parsedData instanceof ReadableStream) {
      return await handleStreamingResponse(parsedData, onChunk);
    }

    // Try to extract content using helper function
    const content = extractContentFromResponse(parsedData);

    if (content) {
      return content;
    }

    // If no content found, log full response for debugging
    console.warn('⚠️ Could not extract content from Edge Function response');
    console.warn('Parsed data:', JSON.stringify(parsedData, null, 2));
    console.warn('Data type:', typeof parsedData);
    console.warn('Is null?', parsedData === null);
    console.warn(
      'Is empty object?',
      parsedData &&
        typeof parsedData === 'object' &&
        Object.keys(parsedData).length === 0
    );

    throw new Error(
      'Edge Function not deployed or misconfigured. ' +
        'Please run: supabase functions deploy generate-content. ' +
        'Or add VITE_OPENAI_API_KEY to .env for fallback.'
    );
  } catch (error) {
    console.error('❌ Error calling Edge Function:', error);
    throw error;
  }
};

/**
 * Handle streaming response from Edge Function
 */
const handleStreamingResponse = async (
  stream: ReadableStream,
  onChunk: (chunk: string) => void
): Promise<string> => {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') {
            break;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;

            if (content) {
              fullContent += content;
              onChunk(fullContent);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    return fullContent;
  } finally {
    reader.releaseLock();
  }
};

/**
 * Get current API usage for rate limiting display
 */
export const getAPIUsage = async (): Promise<{
  count: number;
  limit: number;
  remaining: number;
}> => {
  try {
    const { data, error } = await supabase.rpc('get_api_usage');

    if (error) {
      console.error('Error getting API usage:', error);
      return { count: 0, limit: 1000, remaining: 1000 };
    }

    const count = data || 0;
    const limit = 1000;

    return {
      count,
      limit,
      remaining: Math.max(0, limit - count),
    };
  } catch (error) {
    console.error('Error getting API usage:', error);
    return { count: 0, limit: 1000, remaining: 1000 };
  }
};

/**
 * Check if user can make more API requests
 */
export const canMakeRequest = async (): Promise<boolean> => {
  const usage = await getAPIUsage();
  return usage.remaining > 0;
};
