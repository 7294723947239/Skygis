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

    const { searchParams } = new URL(request.url);
    const layerId = searchParams.get('layer_id');
    const featureType = searchParams.get('feature_type');

    const adminClient = getSupabaseClient();
    let query = adminClient
      .from('gis_features')
      .select('*, gis_layers(name, color)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (layerId) {
      query = query.eq('layer_id', layerId);
    }
    if (featureType) {
      query = query.eq('feature_type', featureType);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: `获取要素失败: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ features: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    const { title, description, feature_type, latitude, longitude, geometry, properties, layer_id } = body;

    if (!title || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: '标题、纬度、经度为必填项' }, { status: 400 });
    }

    const adminClient = getSupabaseClient();
    const { data, error } = await adminClient
      .from('gis_features')
      .insert({
        title,
        description: description || null,
        feature_type: feature_type || 'point',
        latitude: String(latitude),
        longitude: String(longitude),
        geometry: geometry || null,
        properties: properties || null,
        layer_id: layer_id || null,
        user_id: user.id,
      })
      .select('*, gis_layers(name, color)')
      .single();

    if (error) {
      return NextResponse.json({ error: `创建要素失败: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ feature: data });
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
    const { id, title, description, feature_type, latitude, longitude, geometry, properties, layer_id } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少要素 ID' }, { status: 400 });
    }

    const adminClient = getSupabaseClient();
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (feature_type !== undefined) updateData.feature_type = feature_type;
    if (latitude !== undefined) updateData.latitude = String(latitude);
    if (longitude !== undefined) updateData.longitude = String(longitude);
    if (geometry !== undefined) updateData.geometry = geometry;
    if (properties !== undefined) updateData.properties = properties;
    if (layer_id !== undefined) updateData.layer_id = layer_id;

    const { data, error } = await adminClient
      .from('gis_features')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*, gis_layers(name, color)')
      .single();

    if (error) {
      return NextResponse.json({ error: `更新要素失败: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ feature: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少要素 ID' }, { status: 400 });
    }

    const adminClient = getSupabaseClient();
    const { error } = await adminClient
      .from('gis_features')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: `删除要素失败: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
