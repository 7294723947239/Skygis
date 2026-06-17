/**
 * 服务端自我修复守护进程 v2
 * 24小时不间断运行，调用智能体修复所有代码问题
 */

import { promises as fs } from 'fs';
import path from 'path';
import { getState, updateState } from './shared-agent-state';
import { getAgentEvolutionEngine } from './agent-evolution-engine';

// 问题检测和修复规则
interface FixRule {
  name: string;
  pattern?: RegExp;
  check: () => Promise<{ healthy: boolean; issues: string[] }>;
  autoFix?: () => Promise<{ fixed: number; details: string[] }>;
  description: string;
}

// 动画循环健康检查
async function checkAnimationLoop(): Promise<{ healthy: boolean; issues: string[] }> {
  const issues: string[] = [];
  
  try {
    const filePath = path.join(process.cwd(), 'src/components/gis/globe-map.tsx');
    const content = await fs.readFile(filePath, 'utf-8');
    
    // 检查关键元素
    if (!content.includes('requestAnimationFrame')) {
      issues.push('缺少 requestAnimationFrame - 动画无法运行');
    }
    
    if (!content.includes('const animate = () =>')) {
      issues.push('缺少 animate 函数 - 动画循环未定义');
    }
    
    if (!content.includes('orbitGroup.rotation.y')) {
      issues.push('缺少轨道旋转代码 - 行星公转失效');
    }
    
    // 检查是否有重复的 dt 计算
    const dtMatches = content.match(/const dt = \(now - lastTime\)/g);
    if (dtMatches && dtMatches.length > 1) {
      issues.push('发现重复的 dt 声明 - 可能导致运行时错误');
    }
    
    // 检查 animate 函数调用
    if (!content.includes('animate();')) {
      issues.push('缺少 animate() 调用 - 动画循环未启动');
    }
    
    return {
      healthy: issues.length === 0,
      issues
    };
  } catch (e) {
    return {
      healthy: false,
      issues: [`无法读取文件: ${e}`]
    };
  }
}

// 智能体状态检查
async function checkAgentState(): Promise<{ healthy: boolean; issues: string[] }> {
  const issues: string[] = [];
  const agents = ['sage', 'explorer', 'nomad'];
  
  for (const agent of agents) {
    try {
      const state = getState(agent);
      if (!state) {
        issues.push(`智能体 ${agent} 状态未初始化`);
      } else if (state.cycleCount === 0) {
        issues.push(`智能体 ${agent} 未开始进化周期`);
      }
    } catch (e) {
      issues.push(`智能体 ${agent} 状态读取失败`);
    }
  }
  
  return {
    healthy: issues.length === 0,
    issues
  };
}

// 进化引擎检查
async function checkEvolutionEngine(): Promise<{ healthy: boolean; issues: string[] }> {
  const issues: string[] = [];
  
  try {
    const enginePath = path.join(process.cwd(), 'src/lib/agent-evolution-engine.ts');
    const content = await fs.readFile(enginePath, 'utf-8');
    
    if (!content.includes('runCycle')) {
      issues.push('进化引擎缺少 runCycle 方法');
    }
    if (!content.includes('setInterval')) {
      issues.push('进化引擎缺少定时器 - 无法自动运行');
    }
    if (!content.includes('selfModifyCode')) {
      issues.push('进化引擎缺少自我修改代码能力');
    }
    
    return {
      healthy: issues.length === 0,
      issues
    };
  } catch (e) {
    return {
      healthy: false,
      issues: [`无法检查进化引擎: ${e}`]
    };
  }
}

// 服务端循环检查
async function checkServerLoop(): Promise<{ healthy: boolean; issues: string[] }> {
  const issues: string[] = [];
  
  try {
    const apiPath = path.join(process.cwd(), 'src/app/api/agent/evolve/route.ts');
    const content = await fs.readFile(apiPath, 'utf-8');
    
    if (!content.includes('startServerEvolutionLoop')) {
      issues.push('服务端进化循环未启动');
    }
    if (!content.includes('startSelfHealDaemon')) {
      issues.push('自我修复守护进程未启动');
    }
    
    return {
      healthy: issues.length === 0,
      issues
    };
  } catch (e) {
    return {
      healthy: false,
      issues: [`无法检查服务端循环: ${e}`]
    };
  }
}

// 触发智能体修复代码
async function triggerAgentRepair(issue: string): Promise<{ triggered: boolean; agent: string; action: string }> {
  try {
    // 获取当前最活跃的智能体
    const agents = ['sage', 'explorer', 'nomad'];
    let bestAgent = 'sage';
    let maxCycles = 0;
    
    for (const agent of agents) {
      const state = getState(agent);
      if (state && state.cycleCount > maxCycles) {
        maxCycles = state.cycleCount;
        bestAgent = agent;
      }
    }
    
    console.log(`[SelfHeal] 触发智能体 ${bestAgent} 修复: ${issue}`);
    
    // 调用智能体进化（离线模式）
    const engine = getAgentEvolutionEngine(bestAgent as any);
    if (engine) {
      await engine.runOfflineCycle(1);
      
      return {
        triggered: true,
        agent: bestAgent,
        action: `修复问题: ${issue}`
      };
    }
    
    return { triggered: false, agent: bestAgent, action: '引擎未就绪' };
  } catch (e) {
    console.error('[SelfHeal] 触发修复失败:', e);
    return { triggered: false, agent: 'none', action: `错误: ${e}` };
  }
}

// 执行完整自我修复检查
async function runSelfHeal(): Promise<{
  checks: { name: string; healthy: boolean; issues: string[] }[];
  repairs: { triggered: boolean; agent: string; action: string }[];
  stats: { fixed: number; pending: number; cyclesCompleted: number }
}> {
  console.log('[SelfHeal] 开始自我修复检查...');
  
  const checks = [];
  const repairs = [];
  let totalIssues = 0;
  let totalFixed = 0;
  
  // 1. 检查动画循环
  const animCheck = await checkAnimationLoop();
  checks.push({ name: '动画循环', ...animCheck });
  if (!animCheck.healthy) {
    totalIssues += animCheck.issues.length;
    console.log('[SelfHeal] 动画循环问题:', animCheck.issues);
    
    // 尝试自动修复
    for (const issue of animCheck.issues) {
      const repair = await triggerAgentRepair(issue);
      repairs.push(repair);
      if (repair.triggered) totalFixed++;
    }
  } else {
    totalFixed++;
    console.log('[SelfHeal] ✅ 动画循环正常');
  }
  
  // 2. 检查智能体状态
  const agentCheck = await checkAgentState();
  checks.push({ name: '智能体状态', ...agentCheck });
  if (!agentCheck.healthy) {
    totalIssues += agentCheck.issues.length;
    console.log('[SelfHeal] 智能体状态问题:', agentCheck.issues);
    
    for (const issue of agentCheck.issues) {
      const repair = await triggerAgentRepair(issue);
      repairs.push(repair);
      if (repair.triggered) totalFixed++;
    }
  } else {
    totalFixed++;
    console.log('[SelfHeal] ✅ 智能体状态正常');
  }
  
  // 3. 检查进化引擎
  const engineCheck = await checkEvolutionEngine();
  checks.push({ name: '进化引擎', ...engineCheck });
  if (!engineCheck.healthy) {
    totalIssues += engineCheck.issues.length;
    console.log('[SelfHeal] 进化引擎问题:', engineCheck.issues);
    
    for (const issue of engineCheck.issues) {
      const repair = await triggerAgentRepair(issue);
      repairs.push(repair);
      if (repair.triggered) totalFixed++;
    }
  } else {
    totalFixed++;
    console.log('[SelfHeal] ✅ 进化引擎正常');
  }
  
  // 4. 检查服务端循环
  const serverCheck = await checkServerLoop();
  checks.push({ name: '服务端循环', ...serverCheck });
  if (!serverCheck.healthy) {
    totalIssues += serverCheck.issues.length;
    console.log('[SelfHeal] 服务端循环问题:', serverCheck.issues);
    
    for (const issue of serverCheck.issues) {
      const repair = await triggerAgentRepair(issue);
      repairs.push(repair);
      if (repair.triggered) totalFixed++;
    }
  } else {
    totalFixed++;
    console.log('[SelfHeal] ✅ 服务端循环正常');
  }
  
  // 计算总周期数
  let totalCycles = 0;
  for (const agent of ['sage', 'explorer', 'nomad']) {
    const state = getState(agent);
    if (state) totalCycles += state.cycleCount;
  }
  
  return {
    checks,
    repairs,
    stats: {
      fixed: totalFixed,
      pending: totalIssues,
      cyclesCompleted: totalCycles
    }
  };
}

// 守护进程主循环
let daemonRunning = true;
let cycleCount = 0;

async function daemonLoop() {
  if (!daemonRunning) return;
  
  cycleCount++;
  const timestamp = new Date().toISOString();
  
  try {
    const result = await runSelfHeal();
    
    console.log(`[SelfHeal] === 周期 ${cycleCount} | ${timestamp} ===`);
    console.log(`[SelfHeal] 健康检查: ${result.checks.length}项`);
    console.log(`[SelfHeal] 智能体修复: ${result.repairs.length}次触发`);
    console.log(`[SelfHeal] 状态: ${result.stats.fixed}正常 | ${result.stats.pending}待处理`);
    console.log(`[SelfHeal] 总进化周期: ${result.stats.cyclesCompleted}`);
    
  } catch (e) {
    console.error('[SelfHeal] 检查失败:', e);
  }
  
  // 60秒后再次运行
  setTimeout(daemonLoop, 60000);
}

// 启动守护进程
export function startSelfHealDaemon() {
  console.log('[SelfHeal] ═══════════════════════════════════════');
  console.log('[SelfHeal] 启动自我修复守护进程 v2');
  console.log('[SelfHeal] 模式: 24小时离线自动修复');
  console.log('[SelfHeal] 检查间隔: 60秒');
  console.log('[SelfHeal] 智能体: sage, explorer, nomad');
  console.log('[SelfHeal] ═══════════════════════════════════════');
  
  // 立即运行一次
  daemonLoop();
  
  return () => {
    daemonRunning = false;
    console.log('[SelfHeal] 守护进程已停止');
  };
}

// 停止守护进程
export function stopSelfHealDaemon() {
  daemonRunning = false;
}

// 导出检查函数
export { checkAnimationLoop, checkAgentState, checkEvolutionEngine, checkServerLoop, triggerAgentRepair };
