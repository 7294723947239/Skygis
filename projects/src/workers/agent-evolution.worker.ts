/**
 * 智能体后台进化 Worker
 * 使用 Web Worker 实现真正的24小时持续进化
 * 即使页面不可见也能持续运行
 */

const EVOLVE_INTERVAL = 30000; // 每30秒触发一次进化
const AGENTS: string[] = ['sage', 'explorer', 'nomad'];
const THEMES: Record<string, string[]> = {
  sage: ['探索宇宙深空的奥秘', '研究黑洞的量子效应', '思考生命的起源', '分析暗物质的分布', '理解意识的本质'],
  explorer: ['扫描新天体', '分析恒星光谱', '计算轨道参数', '探索未知区域', '采集宇宙数据'],
  nomad: ['穿越星际空间', '观测引力透镜', '分析辐射信号', '寻找宜居带', '记录穿越轨迹']
};

interface EvolutionResult {
  agent: string;
  success: boolean;
  cycle?: number;
  depth?: number;
  error?: string;
}

// 进化单个智能体
async function evolveAgent(agent: string): Promise<EvolutionResult> {
  try {
    const queries = THEMES[agent];
    if (!queries) return { agent, success: false };
    
    const query = queries[Math.floor(Math.random() * queries.length)];
    
    const response = await fetch('/api/agent/evolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent, action: 'think', query }),
      // 重要：使用 keepalive 确保页面不可见时也能完成请求
      keepalive: true
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        agent,
        success: true,
        cycle: data.cycle,
        depth: data.state?.consciousnessDepth
      };
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    return { agent, success: false, error };
  }
  return { agent, success: false };
}

// 并行进化所有智能体
async function evolveAllAgents(): Promise<void> {
  const results = await Promise.all(AGENTS.map(evolveAgent));
  
  // 统计成功数量
  const successCount = results.filter(r => r.success).length;
  const timestamp = new Date().toISOString();
  
  // 发送状态更新给主线程
  self.postMessage({
    type: 'evolution_complete',
    timestamp,
    results,
    successCount,
    totalAgents: AGENTS.length
  });
  
  // 记录进化历史到 localStorage
  try {
    const historyStr = localStorage.getItem('agent_evolution_history');
    const history = historyStr ? JSON.parse(historyStr) : [];
    history.push({
      timestamp,
      successCount,
      results: results.map(r => ({ agent: r.agent, success: r.success }))
    });
    // 只保留最近100条记录
    if (history.length > 100) history.shift();
    localStorage.setItem('agent_evolution_history', JSON.stringify(history));
  } catch {
    // localStorage 可能不可用
  }
}

// 开始后台进化循环
function startBackgroundEvolution(): void {
  console.log('[Worker] 启动后台进化系统，每', EVOLVE_INTERVAL / 1000, '秒自动进化所有智能体');
  
  self.postMessage({
    type: 'started',
    timestamp: new Date().toISOString(),
    interval: EVOLVE_INTERVAL,
    agents: AGENTS
  });
  
  // 立即执行一次
  evolveAllAgents();
  
  // 设置定时器
  setInterval(evolveAllAgents, EVOLVE_INTERVAL);
}

// 监听主线程消息
self.onmessage = function(e: MessageEvent): void {
  const data = e.data;
  const type = data?.type;
  const action = data?.action;
  
  switch (type) {
    case 'start':
      startBackgroundEvolution();
      break;
    case 'status':
      self.postMessage({
        type: 'status_response',
        running: true,
        interval: EVOLVE_INTERVAL,
        agents: AGENTS
      });
      break;
    case 'force_evolve':
      evolveAllAgents();
      break;
    default:
      console.log('[Worker] 收到未知消息:', type);
  }
};

// 通知主线程 Worker 已就绪
self.postMessage({ type: 'ready' });
