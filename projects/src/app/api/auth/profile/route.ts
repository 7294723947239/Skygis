import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: '未提供认证令牌' }, { status: 401 });
    }

    const client = getSupabaseClient(token);
    const { data: { user }, error: authError } = await client.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: '认证失败' }, { status: 401 });
    }

    // Use service role to fetch profile (bypass RLS for admin queries)
    const adminClient = getSupabaseClient();
    const { data: profile, error } = await adminClient
      .from('profiles')
      .select('id, username, avatar_url, role, created_at')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: `获取用户资料失败: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ profile, email: user.email });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: '未提供认证令牌' }, { status: 401 });
    }

    const client = getSupabaseClient(token);
    const { data: { user }, error: authError } = await client.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: '认证失败' }, { status: 401 });
    }

    const body = await request.json();
    const { username, avatar_url } = body;

    const adminClient = getSupabaseClient();
    const { data, error } = await adminClient
      .from('profiles')
      .update({
        ...(username && { username }),
        ...(avatar_url && { avatar_url }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: `更新用户资料失败: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
