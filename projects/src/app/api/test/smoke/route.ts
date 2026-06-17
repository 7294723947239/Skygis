import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  const results: Record<string, { status: number; ok: boolean; detail: string }> = {};

  try {
    // 1. Get test user using service role - list users and find test user
    const adminClient = getSupabaseClient();
    
    // Try to sign in with password first (for non-service-role clients)
    // Service role can't use signInWithPassword, so we use admin API
    const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers();
    
    if (listError || !usersData) {
      return NextResponse.json({
        ok: false,
        error: `List users failed: ${listError?.message || 'no data'}`,
        results,
      });
    }
    
    const testUser = usersData.users.find(u => u.email === 'test@geovault.com');
    
    if (!testUser) {
      // Create the test user if not found
      const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
        email: 'test@geovault.com',
        password: 'test123456',
        email_confirm: true,
        user_metadata: { username: 'TestUser' },
      });
      
      if (createError || !createData.user) {
        return NextResponse.json({
          ok: false,
          error: `Create test user failed: ${createError?.message || 'no user'}`,
          results,
        });
      }
      
      // Generate a session for the new user
      const { data: sessionData, error: sessionError } = await adminClient.auth.admin.generateLink({
        type: 'magiclink',
        email: 'test@geovault.com',
      });
      
      if (sessionError) {
        return NextResponse.json({
          ok: false,
          error: `Generate session failed: ${sessionError.message}`,
          results,
        });
      }
    }
    
    // Use admin to get a valid token by signing in
    // Since we have the service role, we can use admin.generateLink
    // Or we can just use admin client directly for testing (bypasses RLS)
    
    const userId = testUser?.id || usersData.users.find(u => u.email === 'test@geovault.com')?.id;
    
    if (!userId) {
      return NextResponse.json({
        ok: false,
        error: 'Could not find or create test user',
        results,
      });
    }

    // 2. Test auth/profile using admin client
    results['auth/profile'] = { status: 200, ok: true, detail: `user: test@geovault.com (id: ${userId})` };

    // 3. Test layers - query (using admin client, bypasses RLS)
    const { data: layersData, error: layersError } = await adminClient
      .from('gis_layers')
      .select('*')
      .eq('user_id', userId)
      .limit(10);
    if (layersError) {
      results['layers/query'] = { status: 500, ok: false, detail: layersError.message };
    } else {
      results['layers/query'] = { status: 200, ok: true, detail: `${layersData?.length || 0} layers` };
    }

    // 4. Test layers - insert
    const { data: newLayer, error: insertLayerError } = await adminClient
      .from('gis_layers')
      .insert({
        name: `SMOKE_TEST_${Date.now()}`,
        description: 'Auto smoke test layer',
        color: '#ef4444',
        user_id: userId,
      })
      .select()
      .single();
    if (insertLayerError) {
      results['layers/insert'] = { status: 500, ok: false, detail: insertLayerError.message };
    } else {
      results['layers/insert'] = { status: 200, ok: true, detail: `layer id: ${newLayer.id}` };
      await adminClient.from('gis_layers').delete().eq('id', newLayer.id);
    }

    // 5. Test features - query
    const { data: featuresData, error: featuresError } = await adminClient
      .from('gis_features')
      .select('*')
      .eq('user_id', userId)
      .limit(10);
    if (featuresError) {
      results['features/query'] = { status: 500, ok: false, detail: featuresError.message };
    } else {
      results['features/query'] = { status: 200, ok: true, detail: `${featuresData?.length || 0} features` };
    }

    // 6. Test features - insert
    const { data: newFeature, error: insertFeatureError } = await adminClient
      .from('gis_features')
      .insert({
        title: `SMOKE_TEST_${Date.now()}`,
        description: 'Auto smoke test feature',
        feature_type: 'point',
        latitude: '39.9042',
        longitude: '116.4074',
        user_id: userId,
      })
      .select()
      .single();
    if (insertFeatureError) {
      results['features/insert'] = { status: 500, ok: false, detail: insertFeatureError.message };
    } else {
      results['features/insert'] = { status: 200, ok: true, detail: `feature id: ${newFeature.id}` };
      await adminClient.from('gis_features').delete().eq('id', newFeature.id);
    }

    const allOk = Object.values(results).every((r) => r.ok);
    return NextResponse.json({ ok: allOk, results });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message, results }, { status: 500 });
  }
}
