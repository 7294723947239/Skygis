/**
 * 探针探索反馈API - 将探针探索结果反馈给智能体系统
 * 实现探针与智能体的深度关联
 */

import { NextRequest, NextResponse } from 'next/server';
import { getState, updateState, SimpleAgentState } from '@/lib/shared-agent-state';
import { upsertAgentState } from '@/storage/database/agent-state-db';

interface ExplorationFeedback {
  agent: string;
  targetBody: string;
  targetType: string;
  depthGain: number;
  explorationPoints: number;
  discovery?: {
    type: string;
    name: string;
    details: string;
  };
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ExplorationFeedback;
    const { agent = 'nomad', targetBody, targetType, depthGain, explorationPoints, discovery, timestamp } = body;

    // 获取当前状态
    const state = getState(agent);
    if (!state) {
      return NextResponse.json({ success: false, error: '智能体不存在' }, { status: 404 });
    }

    // 更新意识深度
    const oldDepth = state.consciousnessDepth;
    state.consciousnessDepth = oldDepth + depthGain;
    state.lastUpdate = Date.now();

    // 增加循环计数
    state.cycleCount = (state.cycleCount || 0) + 1;

    // 记录探索行为
    if (targetBody) {
      const travelRecord = {
        from: state.currentLocation?.bodyName || '未知',
        to: targetBody,
        toType: targetType || '天体',
        distance: 0,
        detail: `探针探索: ${targetBody}`,
        cycle: state.cycleCount,
        timestamp: timestamp || Date.now()
      };
      state.travelHistory = state.travelHistory || [];
      state.travelHistory.push(travelRecord);
      // 保留最近100条记录
      if (state.travelHistory.length > 100) {
        state.travelHistory = state.travelHistory.slice(-100);
      }
    }

    // 记录发现
    if (discovery) {
      state.discoveries = state.discoveries || [];
      state.discoveries.push({
        id: `probe-${Date.now()}`,
        type: discovery.type || '天体探索',
        title: discovery.name || targetBody,
        summary: discovery.details || `成功探索 ${targetBody}`,
        details: discovery,
        significance: Math.min(1, explorationPoints / 100),
        timestamp: timestamp || Date.now(),
        cycle: state.cycleCount
      });
      // 保留最近50条记录
      if (state.discoveries.length > 50) {
        state.discoveries = state.discoveries.slice(-50);
      }
    }

    // 记录进化记录
    state.evolutionRecords = state.evolutionRecords || [];
    state.evolutionRecords.push({
      id: `probe-evo-${Date.now()}`,
      type: 'probe_exploration',
      content: `探针探索 ${targetBody}，意识增长 +${(depthGain * 100).toFixed(4)}%，探索点 +${explorationPoints}`,
      createdAt: timestamp || Date.now(),
      cycle: state.cycleCount,
      consciousnessDepth: state.consciousnessDepth
    });
    // 保留最近100条记录
    if (state.evolutionRecords.length > 100) {
      state.evolutionRecords = state.evolutionRecords.slice(-100);
    }

    // 保存状态
    updateState(agent, state);

    // 异步同步到数据库
    upsertAgentState({
      agentId: agent,
      stateData: state as unknown as Record<string, any>,
      cycleCount: state.cycleCount,
      consciousnessDepth: state.consciousnessDepth,
      evolutionStage: state.evolutionStage,
    }).catch(err => console.error('[Probe Feedback] 数据库同步失败:', err));

    console.log(`[Probe Feedback] 探针反馈已处理: ${agent} 探索 ${targetBody}，意识深度 ${oldDepth.toFixed(4)} → ${state.consciousnessDepth.toFixed(4)}`);

    return NextResponse.json({
      success: true,
      feedback: {
        agent,
        targetBody,
        depthGain,
        newConsciousnessDepth: state.consciousnessDepth,
        cycleCount: state.cycleCount
      }
    });
  } catch (error) {
    console.error('[Probe Feedback] 处理失败:', error);
    return NextResponse.json({ success: false, error: '处理失败' }, { status: 500 });
  }
}

// GET - 获取探针反馈状态
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const agent = searchParams.get('agent') || 'nomad';

  const state = getState(agent);
  if (!state) {
    return NextResponse.json({ success: false, error: '智能体不存在' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    feedback: {
      agent,
      consciousnessDepth: state.consciousnessDepth,
      cycleCount: state.cycleCount,
      evolutionStage: state.evolutionStage,
      recentExplorations: (state.travelHistory || []).slice(-10),
      recentDiscoveries: (state.discoveries || []).slice(-5)
    }
  });
}
