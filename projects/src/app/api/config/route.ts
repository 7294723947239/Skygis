import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  try {
    // Trigger env loading by initializing the server client
    getSupabaseClient();

    const url = process.env.COZE_SUPABASE_URL || '';
    const anonKey = process.env.COZE_SUPABASE_ANON_KEY || '';

    if (!url || !anonKey) {
      return NextResponse.json({ error: 'Supabase 服务未配置' }, { status: 500 });
    }

    return NextResponse.json({ url, anonKey });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
