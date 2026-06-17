/**
 * 探针控制API - 24小时持续连接版
 * Probe Control API - 24/7 Connected
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getProbeState,
  sendProbeCommand,
  getCommandQueue,
  getCurrentCommand,
  connectAllEngines,
  getEngineConnections,
  getRealTimeDataStream,
  getAgentPerspective,
  startContinuousMonitoring,
  stopContinuousMonitoring,
  getProbeThoughtState,
  getProbeMindState,
  startThinking,
  stopThinking,
  analyzeAndDecideTarget,
  getProbeBrainState,
  EXPLORABLE_BODIES
} from '@/lib/agent-probe-controller';

let monitoringStarted = false;

// GET - 获取探针状态
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const view = searchParams.get('view');
  
  try {
    const probeState = getProbeState();
    const engineConnections = getEngineConnections();
    
    // 根据view参数返回不同数据
    switch (view) {
      case 'engines':
        return NextResponse.json({
          status: 'success',
          engines: engineConnections,
          realtimeStream: getRealTimeDataStream()
        });
        
      case 'agent':
        return NextResponse.json({
          status: 'success',
          perspective: getAgentPerspective()
        });
        
      case 'queue':
        return NextResponse.json({
          status: 'success',
          currentCommand: getCurrentCommand(),
          queue: getCommandQueue()
        });
        
      case 'bodies':
        return NextResponse.json({
          status: 'success',
          bodies: EXPLORABLE_BODIES
        });
        
      case 'thinking':
        return NextResponse.json({
          status: 'success',
          thoughtState: getProbeThoughtState(),
          mindState: getProbeMindState()
        });
        
      case 'decision': {
        // 返回当前任务决策
        const queue = getCommandQueue();
        const current = getCurrentCommand();
        const probe = getProbeState();
        const thought = getProbeThoughtState();
        
        // 检查是否有待处理的任务
        let currentMission;
        if (queue.length > 0) {
          // 有队列任务
          currentMission = {
            type: queue[0].type,
            targetBody: queue[0].targetBody,
            source: 'queue'
          };
        } else if (current) {
          // 有当前任务
          currentMission = {
            type: current.type,
            targetBody: current.targetBody,
            source: 'current'
          };
        } else {
          // 无任务时，调用探针大脑分析所有模块数据后自主决定目标
          console.log('[API] 无任务，分析所有模块数据决定自主目标...');
          const decision = analyzeAndDecideTarget();
          if (decision) {
            currentMission = {
              type: 'analyze',
              targetBody: decision.target,
              reasons: decision.reasons,
              score: decision.score,
              source: 'brain'
            };
          } else {
            currentMission = {
              type: 'explore',
              targetBody: 'Mars',
              source: 'default'
            };
          }
        }
        
        return NextResponse.json({
          status: 'success',
          probeStatus: probe.status,
          currentMission: currentMission,
          missionQueue: queue.slice(0, 3),
          awareness: thought.awareness,
          curiosity: thought.curiosity,
          brainState: getProbeBrainState()
        });
      }
        
      default:
        return NextResponse.json({
          status: 'success',
          probe: probeState,
          engines: engineConnections,
          monitoring: monitoringStarted ? 'running' : 'stopped'
        });
    }
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message
    }, { status: 500 });
  }
}

// POST - 发送探针指令或启动监控
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const command = body.command;
    const action = body.action;
    
    // 如果没有指定command或action，启动持续监控
    if (!command && !action) {
      // 启动24小时持续监控
      if (!monitoringStarted) {
        startContinuousMonitoring(30000); // 每30秒采集一次
        monitoringStarted = true;
      }
      
      // 启动24小时思考系统
      startThinking();
      
      const probeState = getProbeState();
      const engineConnections = getEngineConnections();
      const thoughtState = getProbeThoughtState();
      
      return NextResponse.json({
        status: 'success',
        message: '24小时持续监控和思考系统已启动',
        probe: probeState,
        engines: engineConnections,
        thought: thoughtState,
        realtimeStream: getRealTimeDataStream()
      });
    }
    
    // 启动持续监控
    if (!monitoringStarted) {
      startContinuousMonitoring(30000);
      monitoringStarted = true;
    }
    
    // 执行命令
    if (command) {
      const commandId = sendProbeCommand(command);
      
      return NextResponse.json({
        status: 'success',
        message: `命令已发送: ${command.type}`,
        commandId,
        queue: getCommandQueue()
      });
    }
    
    // 执行动作
    if (action === 'start-monitoring') {
      startContinuousMonitoring(30000);
      monitoringStarted = true;
      return NextResponse.json({
        status: 'success',
        message: '24小时持续监控已启动'
      });
    }
    
    if (action === 'stop-monitoring') {
      stopContinuousMonitoring();
      monitoringStarted = false;
      return NextResponse.json({
        status: 'success',
        message: '持续监控已停止'
      });
    }
    
    if (action === 'connect-engines') {
      const connections = connectAllEngines();
      return NextResponse.json({
        status: 'success',
        message: '引擎连接已刷新',
        engines: connections
      });
    }
    
    if (action === 'status') {
      return NextResponse.json({
        status: 'success',
        probe: getProbeState(),
        engines: getEngineConnections(),
        perspective: getAgentPerspective(),
        monitoring: monitoringStarted ? 'running' : 'stopped'
      });
    }
    
    return NextResponse.json({
      status: 'success',
      message: '命令已处理'
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message
    }, { status: 500 });
  }
}
