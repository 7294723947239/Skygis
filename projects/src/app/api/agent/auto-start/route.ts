/**
 * 智能体系统自动启动 API
 * POST /api/agent/auto-start
 * 
 * 启动后智能体将24小时不停自我进化、反思、反馈、行动
 */

import { NextResponse } from 'next/server';
import { autoStartAgentSystem, stopAgentSystem, getSelfDriveController } from '@/lib/self-drive-controller';
import { getAgentEvolutionEngine } from '@/lib/agent-evolution-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const intervalMs = body.intervalMs || 30000; // 默认30秒
    
    // 启动智能体系统
    const controller = autoStartAgentSystem(intervalMs);
    
    // 同时启动进化引擎
    const evolutionEngine = getAgentEvolutionEngine();
    evolutionEngine.start(intervalMs);
    
    return NextResponse.json({
      success: true,
      message: '智能体系统已启动，24小时自我进化反思反馈行动',
      status: controller.getControllerStatus(),
      intervalMs
    });
  } catch (error) {
    console.error('[AutoStart] 启动失败:', error);
    return NextResponse.json(
      { success: false, error: '启动失败' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    stopAgentSystem();
    const evolutionEngine = getAgentEvolutionEngine();
    evolutionEngine.stop();
    
    return NextResponse.json({
      success: true,
      message: '智能体系统已停止'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '停止失败' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const controller = getSelfDriveController();
  const status = controller.getControllerStatus();
  
  return NextResponse.json({
    isRunning: status.isRunning,
    agentCount: status.agentCount,
    message: status.isRunning 
      ? '智能体系统正在运行中' 
      : '智能体系统未启动'
  });
}
