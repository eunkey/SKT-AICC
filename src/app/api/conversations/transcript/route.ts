import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, speaker, text, isFinal } = body;

    if (!sessionId || !speaker || !text) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, speaker, text' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Supabase가 설정되지 않은 경우 로컬 응답 반환
    if (!supabaseUrl || !supabaseKey) {
      const localTranscript = {
        id: `local-transcript-${Date.now()}`,
        session_id: sessionId,
        speaker,
        text,
        is_final: isFinal ?? true,
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json({ transcript: localTranscript });
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('transcripts')
      .insert({
        session_id: sessionId,
        speaker: speaker as 'customer' | 'counselor',
        text,
        is_final: isFinal ?? true,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('대화 저장 오류:', error);
      // Supabase 오류 시에도 로컬 응답 반환
      const localTranscript = {
        id: `local-transcript-${Date.now()}`,
        session_id: sessionId,
        speaker,
        text,
        is_final: isFinal ?? true,
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json({ transcript: localTranscript });
    }

    return NextResponse.json({ transcript: data });
  } catch (error) {
    console.error('대화 저장 API 오류:', error);
    return NextResponse.json(
      { error: 'Failed to save transcript' },
      { status: 500 }
    );
  }
}
