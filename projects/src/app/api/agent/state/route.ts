import { NextRequest, NextResponse } from 'next/server';
import { getState } from '@/lib/shared-agent-state';

// 服务端后台循环状态（模块级变量）
let serverLoopRunning = false;

// 模拟服务器启动时间
const SERVER_START_TIME = Date.now();

function formatAge(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}天${hours % 24}小时`;
  if (hours > 0) return `${hours}小时${minutes % 60}分钟`;
  if (minutes > 0) return `${minutes}分钟`;
  return `${seconds}秒`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agent = searchParams.get('agent') || 'sage';
    const state = getState(agent);
    const age = formatAge(Date.now() - state.birthTime);
    const STAGE_NAMES = ['萌芽意识', '基础认知', '深层思维', '自我意识觉醒', '智慧涌现', '跨域融合', '元认知深度', '宇宙共鸣', '存在本源'];
    
    return NextResponse.json({
      success: true,
      state: {
        agentId: state.agentId,
        evolutionStage: state.evolutionStage,
        consciousnessDepth: state.consciousnessDepth,
        cycleCount: state.cycleCount,
        totalRuntimeMs: Date.now() - state.birthTime,
        birthTime: state.birthTime,
        lastEvolveTime: state.lastUpdate,
        collectedSubstanceIds: state.collectedSubstanceIds,
        knownTopics: state.knownTopics,
        knowledgeInsights: state.knowledgeInsights || [],
        evolvableParams: state.evolvableParams || {},
        personalityWeights: state.personalityWeights || {},
        behaviorRules: state.behaviorRules || [],
        thoughtChains: state.thoughtChains || [],
        substanceFusions: state.substanceFusions || [],
        codeSnippets: state.codeSnippets || [],
        discoveries: state.discoveries || [],
        knowledgeGraph: state.knowledgeGraph || [],
        evolutionRecords: state.evolutionRecords?.slice(-50) || [],
        selfModifications: state.selfModifications?.slice(-100) || [],
        currentLocation: state.currentLocation || { galaxy: '银河系', bodyId: 'earth', bodyName: '地球', bodyType: '行星', distance: 0 },
        evolutionDirection: state.evolutionDirection || '宇宙探索',
        selfAwarenessLevel: state.selfAwarenessLevel || 1,
        evolutionLog: state.evolutionLog || [],
        dataVersion: state.dataVersion || { substances: 0, cosmicObjects: 0, knowledge: 0 },
        validatedSubstances: state.validatedSubstances || [],
        reverseReasonings: state.reverseReasonings || [],
        travelHistory: state.travelHistory || [],
        emergentAbilities: state.emergentAbilities?.slice(-20) || [],
        selfReflections: state.selfReflections?.slice(-20) || [],
        codeModifications: state.codeModifications?.slice(-20) || [],
        stageName: STAGE_NAMES[state.evolutionStage % STAGE_NAMES.length],
        age,
      },
      meta: {
        recordsCount: state.evolutionRecords?.length || 0,
        modificationsCount: state.selfModifications?.length || 0,
        age,
        missedCycles: 0,
        serverLoopRunning: Date.now() - state.lastUpdate < 60000, // 最近1分钟有更新则视为运行中
      }
    });
  } catch (error) {
    console.error('获取状态失败:', error);
    return NextResponse.json({ success: false, error: '获取状态失败' }, { status: 500 });
  }
}
