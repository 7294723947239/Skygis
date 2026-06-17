import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, username } = body;

    if (!email || !password) {
      return NextResponse.json({ error: '邮箱和密码不能为空' }, { status: 400 });
    }

    const supabaseUrl = process.env.COZE_SUPABASE_URL;
    const supabaseAnonKey = process.env.COZE_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase 配置缺失' }, { status: 500 });
    }

    // Use anon-key client for signInWithPassword (not service role)
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    const adminClient = getSupabaseClient();

    // Step 1: Try to sign in with password
    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email,
      password,
    });

    if (!signInError && signInData.user) {
      return NextResponse.json({
        ok: true,
        message: '登录成功',
        user: {
          id: signInData.user.id,
          email: signInData.user.email,
        },
        access_token: signInData.session?.access_token,
      });
    }

    // Step 2: Sign in failed - check if user exists
    const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers();

    if (listError) {
      return NextResponse.json({ error: '无法验证用户: ' + listError.message }, { status: 400 });
    }

    const existingUser = usersData?.users?.find((u: { email?: string }) => u.email === email);

    if (existingUser) {
      // User exists but password wrong - reset password and confirm email
      const { error: updateError } = await adminClient.auth.admin.updateUserById(existingUser.id, {
        password,
        email_confirm: true,
      });

      if (updateError) {
        return NextResponse.json({ error: '密码重置失败: ' + updateError.message }, { status: 400 });
      }

      // Try signing in again with new password
      const { data: retryData, error: retryError } = await anonClient.auth.signInWithPassword({
        email,
        password,
      });

      if (!retryError && retryData.user) {
        return NextResponse.json({
          ok: true,
          message: '密码已重置，登录成功',
          user: {
            id: retryData.user.id,
            email: retryData.user.email,
          },
          access_token: retryData.session?.access_token,
        });
      }

      return NextResponse.json({ error: '重置后仍无法登录，请重试' }, { status: 400 });
    }

    // Step 3: User doesn't exist - create with admin API
    const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username: username || 'User' },
    });

    if (createError) {
      return NextResponse.json({ error: '注册失败: ' + createError.message }, { status: 400 });
    }

    // Create profile
    if (createData.user) {
      await adminClient.from('profiles').upsert({
        id: createData.user.id,
        username: username || 'User',
        role: 'viewer',
      });
    }

    // Now sign in with the new user
    const { data: loginData, error: loginError } = await anonClient.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      return NextResponse.json({ ok: true, message: '注册成功，请重新登录' });
    }

    return NextResponse.json({
      ok: true,
      message: '注册并登录成功',
      user: {
        id: loginData.user.id,
        email: loginData.user.email,
      },
      access_token: loginData.session?.access_token,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '服务器错误' },
      { status: 500 }
    );
  }
}
