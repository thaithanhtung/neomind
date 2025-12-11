/**
 * AI Service - Tích hợp OpenAI API để tạo nội dung
 * ✨ Optimized với caching và streaming
 */

import OpenAI from 'openai';
import { store } from '@/store';

/**
 * Cache OpenAI client instance để tránh tạo mới mỗi lần
 */
let cachedClient: OpenAI | null = null;
let lastApiKey: string | null = null;
let lastBaseURL: string | null = null;

/**
 * Khởi tạo hoặc reuse OpenAI client
 */
const getOpenAIClient = (): OpenAI | null => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const baseURL = import.meta.env.VITE_OPENAI_API_URL;

  if (!apiKey) {
    return null;
  }

  // Reuse client nếu config không thay đổi
  if (cachedClient && apiKey === lastApiKey && baseURL === lastBaseURL) {
    return cachedClient;
  }

  const config: {
    apiKey: string;
    baseURL?: string;
    dangerouslyAllowBrowser?: boolean;
  } = {
    apiKey,
    dangerouslyAllowBrowser: true, // Cho phép chạy trong browser
  };

  if (baseURL) {
    config.baseURL = baseURL;
  }

  // Cache client mới
  cachedClient = new OpenAI(config);
  lastApiKey = apiKey;
  lastBaseURL = baseURL || null;

  console.log('✅ OpenAI client created and cached');
  return cachedClient;
};

/**
 * Lấy AI model từ Redux store (cached) thay vì query database
 */
const getAIModel = (): string => {
  const state = store.getState();
  const cachedModel = state.userProfile.profile?.ai_model;

  if (cachedModel) {
    console.log('✅ Using cached AI model:', cachedModel);
    return cachedModel;
  }

  // Fallback về env variable
  const defaultModel = import.meta.env.VITE_OPENAI_MODEL || 'gpt-5-nano';
  console.log('⚠️ No cached model, using default:', defaultModel);
  return defaultModel;
};

/**
 * Gọi OpenAI API để tạo nội dung
 * ✨ Optimized: Sử dụng cached model từ Redux, không query database
 */
const callOpenAI = async (
  prompt: string,
  systemPrompt?: string
): Promise<string> => {
  const client = getOpenAIClient();

  if (!client) {
    throw new Error('OpenAI API key chưa được cấu hình');
  }

  try {
    // ✨ Lấy model từ Redux cache (KHÔNG query database)
    const model = getAIModel();

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      ...(systemPrompt
        ? [
            {
              role: 'system' as const,
              content: systemPrompt,
            },
          ]
        : []),
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    const response = await client.chat.completions.create({
      model: model,
      messages,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Không nhận được nội dung từ OpenAI');
    }

    return content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
};

/**
 * Gọi OpenAI API với STREAMING để hiển thị content theo thời gian thực
 * ✨ NEW: Streaming mode cho UX tốt hơn
 */
const callOpenAIStream = async (
  prompt: string,
  systemPrompt?: string,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  const client = getOpenAIClient();

  if (!client) {
    throw new Error('OpenAI API key chưa được cấu hình');
  }

  try {
    const model = getAIModel();

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      ...(systemPrompt
        ? [
            {
              role: 'system' as const,
              content: systemPrompt,
            },
          ]
        : []),
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    const stream = await client.chat.completions.create({
      model: model,
      messages,
      stream: true, // ✨ Enable streaming
    });

    let fullContent = '';

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) {
        fullContent += delta;
        // Callback để update UI real-time
        if (onChunk) {
          onChunk(fullContent);
        }
      }
    }

    if (!fullContent) {
      throw new Error('Không nhận được nội dung từ OpenAI');
    }

    return fullContent;
  } catch (error) {
    console.error('OpenAI API streaming error:', error);
    throw error;
  }
};

/**
 * Mock responses để fallback khi không có API key hoặc lỗi
 */
const getMockResponse = (prompt: string): string => {
  const mockResponses: Record<string, string> = {
    react: `React là một thư viện JavaScript mã nguồn mở được phát triển bởi Facebook để xây dựng giao diện người dùng. React sử dụng khái niệm component để tạo ra các phần tử UI có thể tái sử dụng. Mỗi component có thể quản lý state riêng của nó và React sử dụng Virtual DOM để tối ưu hóa việc render.`,
    typescript: `TypeScript là một ngôn ngữ lập trình được phát triển bởi Microsoft, là một superset của JavaScript. TypeScript thêm các tính năng như type checking, interfaces, và classes vào JavaScript. Nó giúp phát triển ứng dụng lớn dễ dàng hơn bằng cách phát hiện lỗi sớm trong quá trình phát triển.`,
    tailwindcss: `Tailwind CSS là một framework CSS utility-first cho phép bạn xây dựng giao diện hiện đại một cách nhanh chóng. Thay vì viết CSS tùy chỉnh, bạn sử dụng các class utility có sẵn. Tailwind CSS giúp tăng tốc độ phát triển và giảm kích thước file CSS cuối cùng nhờ tree-shaking.`,
    reactflow: `ReactFlow là một thư viện React để xây dựng các ứng dụng đồ thị và sơ đồ tư duy tương tác. Nó cung cấp các tính năng như kéo thả nodes, zoom, pan, và tùy chỉnh edges. ReactFlow sử dụng React và SVG để render các đồ thị mượt mà và hiệu suất cao.`,
  };

  const lowerPrompt = prompt.toLowerCase();
  for (const [keyword, response] of Object.entries(mockResponses)) {
    if (lowerPrompt.includes(keyword)) {
      return response;
    }
  }

  return `Đây là nội dung giải thích về "${prompt}". 

${prompt} là một khái niệm quan trọng trong lĩnh vực công nghệ thông tin. Nó được sử dụng rộng rãi trong các dự án hiện đại và cung cấp nhiều tính năng mạnh mẽ cho các nhà phát triển.

Các tính năng chính bao gồm:
- Hiệu suất cao và tối ưu hóa
- Dễ sử dụng và học tập
- Cộng đồng hỗ trợ lớn
- Tài liệu đầy đủ và chi tiết

Bạn có thể tìm hiểu thêm về các khái niệm liên quan như component, state management, và rendering để hiểu sâu hơn về ${prompt}.`;
};

/**
 * Tạo nội dung cho node mới dựa trên prompt
 * ✨ Optimized: Rút ngắn prompt, support streaming
 */
export const generateContent = async (
  prompt: string,
  systemPromptOverride?: string,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  // Nếu không có API key, sử dụng mock response
  if (!apiKey) {
    console.warn('OpenAI API key chưa được cấu hình. Sử dụng mock response.');
    await new Promise((resolve) => setTimeout(resolve, 500));
    return getMockResponse(prompt);
  }

  try {
    // ✨ Optimized: Rút ngắn system prompt
    const systemPrompt = systemPromptOverride
      ? systemPromptOverride
      : `Trợ lý AI giải thích khái niệm rõ ràng, chi tiết. Trả lời bằng tiếng Việt.`;

    // ✨ Optimized: Rút ngắn user prompt
    const userPrompt = `Giải thích: ${prompt}`;

    // ✨ Sử dụng streaming nếu có callback
    if (onChunk) {
      return await callOpenAIStream(userPrompt, systemPrompt, onChunk);
    }

    return await callOpenAI(userPrompt, systemPrompt);
  } catch (error) {
    console.error('Error calling OpenAI API, using mock response:', error);
    // Fallback về mock response nếu có lỗi
    await new Promise((resolve) => setTimeout(resolve, 500));
    return getMockResponse(prompt);
  }
};

/**
 * Tạo nội dung liên quan dựa trên text đã chọn và context
 * ✨ Optimized: Rút ngắn prompt, support streaming
 */
export const generateRelatedContent = async (
  selectedText: string,
  context: string,
  customPrompt?: string,
  systemPromptOverride?: string,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  // Nếu không có API key, sử dụng mock response
  if (!apiKey) {
    console.warn('OpenAI API key chưa được cấu hình. Sử dụng mock response.');
    await new Promise((resolve) => setTimeout(resolve, 500));
    return getMockRelatedContent(selectedText, context, customPrompt);
  }

  try {
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

    // ✨ Sử dụng streaming nếu có callback
    if (onChunk) {
      return await callOpenAIStream(userPrompt, systemPrompt, onChunk);
    }

    return await callOpenAI(userPrompt, systemPrompt);
  } catch (error) {
    console.error('Error calling OpenAI API, using mock response:', error);
    // Fallback về mock response nếu có lỗi
    await new Promise((resolve) => setTimeout(resolve, 500));
    return getMockRelatedContent(selectedText, context, customPrompt);
  }
};

/**
 * Mock response cho generateRelatedContent
 */
const getMockRelatedContent = (
  selectedText: string,
  context: string,
  customPrompt?: string
): string => {
  if (customPrompt) {
    return `Câu hỏi: ${customPrompt}

Dựa trên ngữ cảnh của "${context}" và text đã chọn "${selectedText}", đây là câu trả lời:

${customPrompt} liên quan đến ${selectedText} trong ${context}. 

Giải thích chi tiết: ${selectedText} là một phần quan trọng trong việc hiểu về ${customPrompt}. Trong ngữ cảnh của ${context}, chúng ta có thể thấy rằng:

- ${selectedText} đóng vai trò quan trọng trong việc giải quyết vấn đề liên quan đến ${customPrompt}
- Có mối liên hệ chặt chẽ giữa ${selectedText} và ${customPrompt}
- Việc hiểu rõ ${selectedText} sẽ giúp bạn hiểu sâu hơn về ${customPrompt}

Ứng dụng thực tế: Bạn có thể áp dụng kiến thức về ${selectedText} để giải quyết các vấn đề liên quan đến ${customPrompt} trong các dự án của mình.`;
  }

  return `Giải thích về "${selectedText}":

${selectedText} là một khái niệm quan trọng trong ngữ cảnh của ${context}. 

Định nghĩa: ${selectedText} đề cập đến một khái niệm hoặc thành phần cụ thể trong hệ thống.

Ứng dụng: Khái niệm này được sử dụng để giải quyết các vấn đề cụ thể và cải thiện hiệu suất của ứng dụng.

Ví dụ: Trong thực tế, ${selectedText} có thể được áp dụng trong nhiều tình huống khác nhau để đạt được kết quả mong muốn.`;
};
