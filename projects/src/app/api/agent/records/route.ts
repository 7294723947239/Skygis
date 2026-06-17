import { NextRequest, NextResponse } from 'next/server';
import { getState } from '@/lib/shared-agent-state';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const agentId = searchParams.get('agent') || 'sage';
    
    console.log('[records API] Getting state for:', agentId);
    const state = getState(agentId);
    console.log('[records API] State loaded, selfModifications:', state.selfModifications?.length);
    
    // 合并 evolutionRecords 和 selfModifications
    const evolutionRecords = (state.evolutionRecords || []).map(r => ({
      id: r.id,
      type: r.type,
      content: r.content,
      cycle: r.cycle,
      consciousnessDepth: r.consciousnessDepth,
      createdAt: r.createdAt,
      timestamp: r.createdAt
    }));
    
    const codeRecords = (state.selfModifications || []).map(m => ({
      id: m.id,
      type: 'code_change',
      content: m.content,
      cycle: m.cycle,
      consciousnessDepth: state.consciousnessDepth,
      createdAt: m.timestamp,
      timestamp: m.timestamp,
      language: m.language,
      file: m.file
    }));
    
    let allRecords = [...evolutionRecords, ...codeRecords];
    allRecords.sort((a, b) => b.createdAt - a.createdAt);
    
    // 按类型筛选
    let records = allRecords;
    if (type === 'code') {
      records = allRecords.filter(r => r.type === 'code_change');
    } else if (type === 'discovery') {
      records = allRecords.filter(r => r.type === 'discovery');
    } else if (type === 'reverse') {
      records = allRecords.filter(r => r.type === 'reverse');
    } else if (type === 'emergence') {
      records = allRecords.filter(r => r.type === 'emergence');
    }
    
    console.log('[records API] Returning records:', records.length);
    
    return NextResponse.json({
      success: true,
      total: records.length,
      type,
      records: records.slice(-50),
    });
  } catch (error) {
    console.error('[records API] Error:', error);
    return NextResponse.json({ success: false, error: '获取记录失败' }, { status: 500 });
  }
}
