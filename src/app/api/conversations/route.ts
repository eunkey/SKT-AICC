import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Supabase가 설정되지 않은 경우 로컬 세션 ID 생성
    if (!supabaseUrl || !supabaseKey) {
      const localSession = {
        id: `local-session-${Date.now()}`,
        counselor_id: 'ai-counselor',
        customer_name: null,
        customer_phone: null,
        status: 'active',
        started_at: new Date().toISOString(),
        ended_at: null,
        summary: null,
        created_at: new Date().toISOString(),
      };
      return NextResponse.json({ session: localSession });
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    const body = await request.json();
    const { counselorId, customerName, customerPhone } = body;

    const { data, error } = await supabase
      .from('call_sessions')
      .insert({
        counselor_id: counselorId || 'ai-counselor',
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('세션 생성 오류:', error);
      // Supabase 오류 시에도 로컬 세션 반환
      const localSession = {
        id: `local-session-${Date.now()}`,
        counselor_id: counselorId || 'ai-counselor',
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        status: 'active',
        started_at: new Date().toISOString(),
        ended_at: null,
        summary: null,
        created_at: new Date().toISOString(),
      };
      return NextResponse.json({ session: localSession });
    }

    return NextResponse.json({ session: data });
  } catch (error) {
    console.error('세션 API 오류:', error);
    // 오류 시에도 로컬 세션 반환
    const localSession = {
      id: `local-session-${Date.now()}`,
      counselor_id: 'ai-counselor',
      customer_name: null,
      customer_phone: null,
      status: 'active',
      started_at: new Date().toISOString(),
      ended_at: null,
      summary: null,
      created_at: new Date().toISOString(),
    };
    return NextResponse.json({ session: localSession });
  }
}
