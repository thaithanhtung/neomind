// Supabase Edge Function: Generate AI Content
// This function handles OpenAI API calls server-side to keep API keys secure

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  prompt: string;
  systemPrompt?: string;
  stream?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase client with user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Get user's AI model preference
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('ai_model')
      .eq('user_id', user.id)
      .single();

    const aiModel = profile?.ai_model || 'gpt-5-nano';

    // 3. Parse request body
    const {
      prompt,
      systemPrompt,
      stream = true,
    }: RequestBody = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Check rate limiting
    const today = new Date().toISOString().split('T')[0];
    const { data: usage } = await supabaseClient
      .from('user_api_usage')
      .select('request_count')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    const requestCount = usage?.request_count || 0;
    const MAX_REQUESTS = 1000; // Max requests per day

    if (requestCount >= MAX_REQUESTS) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: `You have reached the daily limit of ${MAX_REQUESTS} requests`,
          retry_after: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 5. Increment usage counter
    await supabaseClient.rpc('increment_api_usage', {
      p_user_id: user.id,
      p_date: today,
    });

    // 6. Call OpenAI API
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const openaiBaseUrl =
      Deno.env.get('OPENAI_API_URL') || 'https://api.openai.com/v1';

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const messages = [];
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }
    messages.push({
      role: 'user',
      content: prompt,
    });

    const openaiResponse = await fetch(`${openaiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiModel,
        messages,
        stream,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI API error:', error);
      return new Response(
        JSON.stringify({
          error: 'OpenAI API error',
          details: error,
        }),
        {
          status: openaiResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 7. Return response (streaming or non-streaming)
    if (stream) {
      // Stream response back to client
      return new Response(openaiResponse.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    } else {
      // Return complete response
      const data = await openaiResponse.json();
      return new Response(JSON.stringify(data), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
