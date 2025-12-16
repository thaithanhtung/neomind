/**
 * AI Service - Tích hợp OpenAI API để tạo nội dung
 * ✨ Optimized với caching và streaming
 * 🔒 Secure: Uses Supabase Edge Functions để keep API keys safe
 */

import { generateContentViaEdgeFunction } from './edgeFunctionService';

/**
 * Tạo nội dung cho node mới dựa trên prompt
 * ✨ Optimized: Rút ngắn prompt, support streaming
 * 🔒 Secure: Uses Edge Function by default
 */
export const generateContent = async (
  prompt: string,
  systemPromptOverride?: string,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  // ✨ Optimized: Rút ngắn system prompt
  const systemPrompt = systemPromptOverride
    ? systemPromptOverride
    : `Trợ lý AI giải thích khái niệm rõ ràng, chi tiết. Trả lời bằng tiếng Việt.`;

  // ✨ Optimized: Rút ngắn user prompt
  const userPrompt = `Giải thích: ${prompt}`;

  // 🔒 Use Edge Function (secure, server-side API call)
  try {
    return await generateContentViaEdgeFunction(
      userPrompt,
      systemPrompt,
      onChunk
    );
  } catch (error) {
    console.error('❌ Edge Function failed:', error);
    // Báo lỗi luôn, không fallback sang client-side API
    throw error;
  }
};

/**
 * Tạo nội dung liên quan dựa trên text đã chọn và context
 * ✨ Optimized: Rút ngắn prompt, support streaming
 * 🔒 Secure: Uses Edge Function by default
 */
export const generateRelatedContent = async (
  selectedText: string,
  context: string,
  customPrompt?: string,
  systemPromptOverride?: string,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  const systemPrompt = systemPromptOverride
    ? systemPromptOverride
    : `Trợ lý AI giải thích khái niệm rõ ràng, dễ hiểu. Trả lời bằng tiếng Việt.`;

  // ✨ Optimized: Rút ngắn prompt, bỏ từ thừa
  let userPrompt: string;

  if (customPrompt) {
    userPrompt = `Context: "${context}"
Selected: "${selectedText}"
Q: "${customPrompt}"

Giải thích "${customPrompt}" dựa trên context.`;
  } else {
    userPrompt = `Context: "${context}"
Selected: "${selectedText}"

Giải thích "${selectedText}".`;
  }

  // 🔒 Use Edge Function (secure, server-side API call)
  try {
    return await generateContentViaEdgeFunction(
      userPrompt,
      systemPrompt,
      onChunk
    );
  } catch (error) {
    console.error('❌ Edge Function failed:', error);
    // Báo lỗi luôn, không fallback sang client-side API
    throw error;
  }
};
