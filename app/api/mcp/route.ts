import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key-for-build';

// Create Supabase client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Verify token and get user_id
async function verifyToken(token: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('api_tokens')
    .select('user_id')
    .eq('token', token)
    .single();

  if (error || !data) {
    return null;
  }

  // Update last_used_at
  await supabaseAdmin
    .from('api_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('token', token);

  return data.user_id;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY not set' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get Bearer token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid Authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.substring(7);
    const userId = await verifyToken(token);

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON-RPC request
    const body = await request.json();
    const { jsonrpc, id, method, params } = body;

    if (jsonrpc !== '2.0') {
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          id,
          error: { code: -32600, message: 'Invalid Request' },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Handle different MCP methods
    if (method === 'tools/list') {
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          id,
          result: {
            tools: [
              {
                name: 'create_diary_entry',
                description: 'Create a new diary entry. Use this to record thoughts, feelings, or experiences.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    content: {
                      type: 'string',
                      description: 'The diary entry content. Can be plain text or markdown.',
                    },
                    mood: {
                      type: 'string',
                      enum: ['happy', 'calm', 'sad', 'excited', 'thoughtful', 'grateful'],
                      description: 'Optional mood indicator for the entry',
                    },
                  },
                  required: ['content'],
                },
              },
            ],
          },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'tools/call') {
      const { name, arguments: args } = params;

      if (name === 'create_diary_entry') {
        const { content, mood } = args as { content: string; mood?: string };

        if (!content || typeof content !== 'string') {
          return new Response(
            JSON.stringify({
              jsonrpc: '2.0',
              id,
              error: {
                code: -32602,
                message: 'Invalid params: content is required and must be a string',
              },
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        }

        // Create the diary entry
        const { data: diary, error } = await supabaseAdmin
          .from('diary_entries')
          .insert([
            {
              user_id: userId,
              content: content.trim(),
              mood: mood || null,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error('Error creating diary entry:', error);
          return new Response(
            JSON.stringify({
              jsonrpc: '2.0',
              id,
              error: {
                code: -32603,
                message: `Error creating diary entry: ${error.message}`,
              },
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: `日记创建成功！\n\nID: ${diary.id}\n创建时间: ${new Date(diary.created_at).toLocaleString('zh-CN')}\n心情: ${diary.mood ? diary.mood : '无'}`,
                },
              ],
            },
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Unknown tool: ${name}` },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Handle initialize request
    if (method === 'initialize') {
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            serverInfo: {
              name: 'mindful-diary',
              version: '1.0.0',
            },
            capabilities: {
              tools: {},
            },
          },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Method not found: ${method}` },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('MCP server error:', error);
    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32603, message: 'Internal error' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET(request: NextRequest) {
  return new Response(
    JSON.stringify({
      name: 'Mindful Diary MCP Server',
      version: '1.0.0',
      description: 'MCP server for creating diary entries',
      tools: ['create_diary_entry'],
      transport: 'http',
      endpoint: '/api/mcp',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
