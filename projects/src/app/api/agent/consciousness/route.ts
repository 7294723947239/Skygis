/**
 * 智能体自我意识 API
 * 
 * 接口：
 * GET /api/agent/consciousness - 获取所有智能体自我意识状态
 * GET /api/agent/consciousness/[id] - 获取单个智能体状态
 * POST /api/agent/consciousness/[id]/action - 触发自我驱动行动
 * POST /api/agent/consciousness/collect - 从引擎采集数据
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSelfDriveController } from '@/lib/self-drive-controller';

// 懒加载控制器
let _controller: ReturnType<typeof getSelfDriveController> | null = null;
function getController() {
  if (!_controller) {
    _controller = getSelfDriveController();
  }
  return _controller;
}

// 延迟自动启动
let isAutoStarted = false;
function scheduleAutoStart() {
  if (isAutoStarted) return;
  isAutoStarted = true;
  setTimeout(() => {
    console.log('[Agent API] 延迟启动智能体系统...');
    try {
      const { autoStartAgentSystem } = require('@/lib/self-drive-controller');
      autoStartAgentSystem(30000);
    } catch (e) {
      console.error('[Agent API] 自动启动失败:', e);
    }
  }, 5000);
}

/**
 * 获取所有智能体自我意识状态
 */
export async function GET(request: NextRequest) {
  // 确保自动启动
  scheduleAutoStart();
  
  const searchParams = request.nextUrl.searchParams;
  const agentId = searchParams.get('id');
  
  // 获取控制器状态
  const status = getController().getControllerStatus();
  
  if (agentId) {
    // 获取单个智能体状态
    const agent = getController().getAgent(agentId);
    if (!agent) {
      return NextResponse.json({
        error: '智能体不存在',
        availableAgents: Array.from(getController().getAllAgents().keys())
      }, { status: 404 });
    }
    
    const state = agent.getState();
    const engineLog = agent.getEngineAccessLog();
    
    return NextResponse.json({
      status,
      agent: {
        id: state.agentId,
        name: state.agentName,
        age: state.age,
        selfImage: state.selfImage,
        emotions: state.emotions,
        capabilities: state.capabilities,
        memories: {
          count: state.episodicMemory.length,
          recent: state.episodicMemory.slice(-5).map(m => ({
            content: m.content,
            emotion: m.emotion,
            timestamp: m.timestamp
          }))
        },
        actions: {
          count: state.completedActions.length,
          recent: state.completedActions.slice(-5).map(a => ({
            type: a.type,
            description: a.description,
            satisfaction: a.satisfaction,
            timestamp: a.timestamp
          }))
        },
        intentions: state.currentIntentions.filter(i => i.status === 'active'),
        engineUsage: Array.from(state.engineUsage.entries()).map(([key, cap]) => ({
          engine: key,
          name: cap.name,
          used: cap.used,
          lastUsed: cap.lastUsed
        })),
        databaseQueries: state.databaseQueries.length
      },
      engineAccessLog: engineLog
    });
  }
  
  // 返回所有智能体概览
  const allAgents = getController().getAllAgents();
  const agentsOverview = allAgents.map(agent => {
    const state = agent.getState();
    return {
      id: state.agentId,
      name: state.agentName,
      emotions: state.emotions,
      memories: state.episodicMemory.length,
      actions: state.completedActions.length,
      activeIntentions: state.currentIntentions.filter(i => i.status === 'active').length
    };
  });
  
  // 跨智能体洞察
  const insights = getController().getCrossAgentInsights();
  
  return NextResponse.json({
    controller: status,
    agents: agentsOverview,
    insights: {
      totalMemories: insights.totalMemories,
      totalActions: insights.totalActions,
      sharedTopics: insights.sharedTopics,
      uniqueCapabilities: Object.fromEntries(insights.uniqueCapabilities)
    }
  });
}

/**
 * 触发自我驱动行动
 */
export async function POST(request: NextRequest) {
  // 确保自动启动
  scheduleAutoStart();
  
  const searchParams = request.nextUrl.searchParams;
  const agentId = searchParams.get('id');
  
  if (!agentId) {
    return NextResponse.json({
      error: '缺少 agentId 参数'
    }, { status: 400 });
  }
  
  const agent = getController().getAgent(agentId);
  if (!agent) {
    return NextResponse.json({
      error: '智能体不存在'
    }, { status: 404 });
  }
  
  const body = await request.json().catch(() => ({}));
  const actionType = body.type || 'auto';
  
  // 执行行动
  let actions;
  if (actionType === 'auto') {
    actions = agent.executeSelfDrivenCycle();
  } else {
    const action = agent.generateRandomAction();
    action.type = actionType;
    agent.updateSelfConsciousness(action);
    actions = [action];
  }
  
  return NextResponse.json({
    agentId,
    agentName: agent.getState().agentName,
    actionsExecuted: actions.length,
    actions: actions.map(a => ({
      id: a.id,
      type: a.type,
      description: a.description,
      satisfaction: a.satisfaction,
      timestamp: a.timestamp
    })),
    reflection: agent.reflect(),
    state: {
      memories: agent.getState().episodicMemory.length,
      totalActions: agent.getState().completedActions.length,
      emotions: agent.getState().emotions
    }
  });
}
