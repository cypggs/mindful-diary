import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key-for-build';

// Create a Supabase client with service role for bypassing RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY not set' },
        { status: 500 }
      );
    }

    // Get the Bearer token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token and get the user_id
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('api_tokens')
      .select('user_id')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Update last_used_at
    await supabaseAdmin
      .from('api_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('token', token);

    // Parse request body
    const body = await request.json();
    const { content, mood } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate mood if provided
    const validMoods = ['happy', 'calm', 'sad', 'excited', 'thoughtful', 'grateful'];
    if (mood && !validMoods.includes(mood)) {
      return NextResponse.json(
        { error: `Invalid mood. Must be one of: ${validMoods.join(', ')}` },
        { status: 400 }
      );
    }

    // Create the diary entry
    const { data: diary, error: diaryError } = await supabaseAdmin
      .from('diary_entries')
      .insert([
        {
          user_id: tokenData.user_id,
          content: content.trim(),
          mood: mood || null,
        },
      ])
      .select()
      .single();

    if (diaryError) {
      console.error('Error creating diary entry:', diaryError);
      return NextResponse.json(
        { error: 'Failed to create diary entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: diary,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
