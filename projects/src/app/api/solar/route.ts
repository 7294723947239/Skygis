import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get('table'); // bodies | orbits | surfaces | asteroids | comets
  const bodyType = searchParams.get('bodyType'); // star|planet|dwarf_planet|moon
  const bodyId = searchParams.get('bodyId');
  const name = searchParams.get('name');
  const limit = parseInt(searchParams.get('limit') || '200');

  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const supabase = getSupabaseClient(token);

  try {
    switch (table) {
      case 'bodies': {
        let query = supabase.from('solar_bodies').select('*').order('name').limit(limit);
        if (bodyType) query = query.eq('body_type', bodyType);
        if (name) query = query.ilike('name', `%${name}%`);
        const { data, error } = await query;
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ data });
      }
      case 'orbits': {
        let query = supabase.from('orbital_parameters').select('*, solar_bodies(name, body_type)').order('semi_major_axis_au').limit(limit);
        if (bodyId) query = query.eq('body_id', bodyId);
        const { data, error } = await query;
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ data });
      }
      case 'surfaces': {
        let query = supabase.from('surface_features').select('*, solar_bodies(name)').order('name').limit(limit);
        if (bodyId) query = query.eq('body_id', bodyId);
        const featureType = searchParams.get('featureType');
        if (featureType) query = query.eq('feature_type', featureType);
        const { data, error } = await query;
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ data });
      }
      case 'asteroids': {
        const { data, error } = await supabase.from('asteroids').select('*').order('diameter_km', { ascending: false }).limit(limit);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ data });
      }
      case 'comets': {
        const { data, error } = await supabase.from('comets').select('*').order('name').limit(limit);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ data });
      }
      case 'stats': {
        const [bodies, orbits, surfaces, asteroids, comets] = await Promise.all([
          supabase.from('solar_bodies').select('body_type', { count: 'exact', head: false }),
          supabase.from('orbital_parameters').select('id', { count: 'exact', head: true }),
          supabase.from('surface_features').select('feature_type', { count: 'exact', head: false }),
          supabase.from('asteroids').select('id', { count: 'exact', head: true }),
          supabase.from('comets').select('id', { count: 'exact', head: true }),
        ]);
        const bodyTypeCounts: Record<string, number> = {};
        (bodies.data || []).forEach((b: { body_type: string }) => {
          bodyTypeCounts[b.body_type] = (bodyTypeCounts[b.body_type] || 0) + 1;
        });
        const featureTypeCounts: Record<string, number> = {};
        (surfaces.data || []).forEach((s: { feature_type: string }) => {
          featureTypeCounts[s.feature_type] = (featureTypeCounts[s.feature_type] || 0) + 1;
        });
        return NextResponse.json({
          data: {
            bodies: { total: bodies.count || 0, byType: bodyTypeCounts },
            orbits: { total: orbits.count || 0 },
            surfaces: { total: surfaces.count || 0, byType: featureTypeCounts },
            asteroids: { total: asteroids.count || 0 },
            comets: { total: comets.count || 0 },
          }
        });
      }
      default:
        return NextResponse.json({ error: 'Invalid table. Use: bodies|orbits|surfaces|asteroids|comets|stats' }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const supabase = getSupabaseClient(token);

  try {
    const body = await request.json();
    const { table, data: insertData } = body;

    const tableMap: Record<string, string> = {
      bodies: 'solar_bodies',
      orbits: 'orbital_parameters',
      surfaces: 'surface_features',
      asteroids: 'asteroids',
      comets: 'comets',
    };

    const tableName = tableMap[table];
    if (!tableName) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
    }

    const { data, error } = await supabase.from(tableName).insert(insertData).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: data[0] });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const supabase = getSupabaseClient(token);

  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');
    const id = searchParams.get('id');

    const tableMap: Record<string, string> = {
      bodies: 'solar_bodies',
      orbits: 'orbital_parameters',
      surfaces: 'surface_features',
      asteroids: 'asteroids',
      comets: 'comets',
    };

    const tableName = tableMap[table || ''];
    if (!tableName || !id) {
      return NextResponse.json({ error: 'table and id required' }, { status: 400 });
    }

    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
