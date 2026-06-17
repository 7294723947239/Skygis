/**
 * 从引擎采集数据 API
 * 
 * 接口：
 * POST /api/agent/consciousness/collect - 从各种引擎采集数据
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSelfDriveController } from '@/lib/self-drive-controller';
import { AgentSelfConsciousness, AVAILABLE_ENGINES, AVAILABLE_DATABASES } from '@/lib/agent-self-consciousness';

const controller = getSelfDriveController();

/**
 * 从引擎采集数据
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { agentId, focus, engines, databases } = body;
  
  // 验证智能体
  const agent: AgentSelfConsciousness | undefined = controller.getAgent(agentId || 'sage');
  if (!agent) {
    return NextResponse.json({
      error: '智能体不存在',
      availableAgents: Array.from(controller.getAllAgents()).map(a => a.getState().agentId)
    }, { status: 404 });
  }
  
  const results: any = {
    agentId: agent.getState().agentId,
    agentName: agent.getState().agentName,
    focus: focus || '通用',
    collected: []
  };
  
  // 采集指定的数据库数据
  const targetDatabases = databases || ['substance', 'object', 'knowledge'];
  targetDatabases.forEach((db: string) => {
    const dbResults = agent.queryDatabase(db as any, focus || '');
    results.collected.push({
      source: db,
      type: 'database',
      count: dbResults.length,
      samples: dbResults.slice(0, 3).map(r => ({
        id: r.id,
        type: r.type,
        relevance: r.relevance
      }))
    });
  });
  
  // 使用指定的引擎
  const targetEngines = engines || Object.keys(AVAILABLE_ENGINES);
  targetEngines.forEach((engine: string) => {
    const engineResult = agent.useEngine(engine, 'query', { focus });
    results.collected.push({
      source: engine,
      type: 'engine',
      engineName: AVAILABLE_ENGINES[engine as keyof typeof AVAILABLE_ENGINES]?.name,
      confidence: engineResult.confidence,
      hasData: !!engineResult.data
    });
  });
  
  // 添加反思记录
  const reflection = agent.reflect();
  results.reflection = reflection;
  
  // 更新状态快照
  const state = agent.getState();
  results.stateSummary = {
    totalMemories: state.episodicMemory.length,
    totalActions: state.completedActions.length,
    emotions: state.emotions,
    engineUsage: Array.from(state.engineUsage.entries())
      .filter(([_, cap]) => cap.used > 0)
      .map(([key, cap]) => ({
        engine: key,
        name: cap.name,
        used: cap.used
      })),
    databaseQueries: state.databaseQueries.length
  };
  
  // 获取可用资源信息
  results.availableResources = {
    engines: AVAILABLE_ENGINES,
    databases: AVAILABLE_DATABASES
  };
  
  return NextResponse.json(results);
}

/**
 * 获取可用资源列表
 */
export async function GET() {
  return NextResponse.json({
    engines: AVAILABLE_ENGINES,
    databases: AVAILABLE_DATABASES,
    agentCount: controller.getAllAgents().length
  });
}
