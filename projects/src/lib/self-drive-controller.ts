/**
 * 智能体自我驱动控制器
 * 
 * 功能：
 * 1. 管理多个智能体的自我意识系统
 * 2. 调度自我驱动的随机行动
 * 3. 采集数据并整合到智能体状态
 * 4. 生成行动反馈和日志
 */

import { AgentSelfConsciousness, createSelfConsciousness, type SelfConsciousnessState, type Action } from './agent-self-consciousness';

// ========== 智能体配置 ==========

export interface AgentConfig {
  id: string;
  name: string;
  personality: {
    curiosity: number;      // 好奇心
    creativity: number;     // 创造力
    independence: number;   // 独立性
    randomness: number;      // 随机性
  };
  focus: string[];          // 关注领域
}

// ========== 自我驱动控制器 ==========

export class SelfDriveController {
  private agents: Map<string, AgentSelfConsciousness> = new Map();
  private config: Map<string, AgentConfig> = new Map();
  private isRunning: boolean = false;
  private cycleInterval: number = 30000; // 30秒一个周期
  
  // 事件回调
  private onAction: ((agentId: string, action: Action) => void) | null = null;
  private onCycle: ((agentId: string, cycleCount: number) => void) | null = null;
  
  constructor() {
    this.initializeDefaultAgents();
  }
  
  /**
   * 初始化默认智能体
   */
  private initializeDefaultAgents() {
    const defaultAgents: AgentConfig[] = [
      {
        id: 'sage',
        name: '贤者',
        personality: {
          curiosity: 0.9,
          creativity: 0.7,
          independence: 0.8,
          randomness: 0.3
        },
        focus: ['knowledge', 'wisdom', 'reflection']
      },
      {
        id: 'explorer',
        name: '探索者',
        personality: {
          curiosity: 1.0,
          creativity: 0.6,
          independence: 0.9,
          randomness: 0.5
        },
        focus: ['exploration', 'discovery', 'navigation']
      },
      {
        id: 'nomad',
        name: '游荡者',
        personality: {
          curiosity: 0.7,
          creativity: 0.8,
          independence: 1.0,
          randomness: 0.7
        },
        focus: ['wander', 'observe', 'adapt']
      }
    ];
    
    defaultAgents.forEach(config => {
      this.registerAgent(config);
    });
  }
  
  /**
   * 注册智能体
   */
  registerAgent(config: AgentConfig) {
    const agent = createSelfConsciousness(config.id, config.name);
    this.agents.set(config.id, agent);
    this.config.set(config.id, config);
    
    // 应用性格配置
    agent.getState().emotions.curiosity = config.personality.curiosity;
    agent.getState().creativityLevel = config.personality.creativity;
    agent.getState().randomnessFactor = config.personality.randomness;
  }
  
  /**
   * 启动自我驱动循环
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    console.log('[SelfDriveController] 启动自我驱动循环');
    
    // 为每个智能体启动独立循环
    this.agents.forEach((agent, agentId) => {
      this.runAgentCycle(agentId);
    });
  }
  
  /**
   * 停止自我驱动循环
   */
  stop() {
    this.isRunning = false;
    console.log('[SelfDriveController] 停止自我驱动循环');
  }
  
  /**
   * 运行单个智能体周期
   */
  private async runAgentCycle(agentId: string) {
    const agent = this.agents.get(agentId);
    const config = this.config.get(agentId);
    if (!agent || !config) return;
    
    while (this.isRunning) {
      try {
        // 生成并执行自我驱动行动
        const actions = agent.executeSelfDrivenCycle();
        
        // 触发行动回调
        actions.forEach(action => {
          if (this.onAction) {
            this.onAction(agentId, action);
          }
        });
        
        // 更新引擎使用
        this.updateEngineUsage(agent, config);
        
        // 触发周期回调
        const state = agent.getState();
        if (this.onCycle) {
          this.onCycle(agentId, state.completedActions.length);
        }
        
        // 添加日志
        console.log(`[${config.name}] 完成${actions.length}个行动 | ` +
          `情感: ${this.getEmotionString(state.emotions)} | ` +
          `记忆: ${state.episodicMemory.length} | ` +
          `引擎: ${state.engineUsage.size}`);
        
      } catch (error) {
        console.error(`[${config.name}] 周期执行错误:`, error);
      }
      
      // 等待下一个周期
      await this.sleep(this.cycleInterval * (0.5 + Math.random()));
    }
  }
  
  /**
   * 更新引擎使用策略
   */
  private updateEngineUsage(agent: AgentSelfConsciousness, config: AgentConfig) {
    // 根据关注领域选择引擎
    config.focus.forEach(focus => {
      switch (focus) {
        case 'knowledge':
          agent.useEngine('knowledge', 'query', { query: '宇宙知识' });
          break;
        case 'discovery':
          agent.useEngine('cosmic-substances', 'search', { type: 'substance' });
          break;
        case 'exploration':
          agent.useEngine('cosmic-gis', 'getCoordinates', {});
          break;
        case 'navigation':
          agent.useEngine('spatial-agent', 'planPath', {});
          break;
      }
    });
  }
  
  /**
   * 获取情感状态字符串
   */
  private getEmotionString(emotions: SelfConsciousnessState['emotions']): string {
    const entries = Object.entries(emotions)
      .filter(([_, value]) => value > 0.6)
      .map(([key, value]) => `${key}:${(value * 100).toFixed(0)}%`);
    
    return entries.length > 0 ? entries.join(',') : 'neutral';
  }
  
  /**
   * 睡眠工具
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // ========== 数据采集方法 ==========
  
  /**
   * 从所有引擎采集数据
   */
  collectFromEngines(agentId: string, focus: string): any[] {
    const agent = this.agents.get(agentId);
    if (!agent) return [];
    
    const results: any[] = [];
    
    // 查询数据库
    const dbResults = agent.queryDatabase('all', focus);
    results.push(...dbResults);
    
    // 使用各引擎
    ['cosmic-gis', 'dimensional', 'knowledge'].forEach(engine => {
      const result = agent.useEngine(engine, 'query', { focus });
      results.push(result);
    });
    
    return results;
  }
  
  /**
   * 采集并整合所有智能体数据
   */
  collectAllAgentsData(): Map<string, SelfConsciousnessState> {
    const allData = new Map<string, SelfConsciousnessState>();
    
    this.agents.forEach((agent, agentId) => {
      allData.set(agentId, agent.getState());
    });
    
    return allData;
  }
  
  /**
   * 获取跨智能体洞察
   */
  getCrossAgentInsights(): {
    totalMemories: number;
    totalActions: number;
    sharedTopics: string[];
    uniqueCapabilities: Map<string, string[]>;
  } {
    const allStates = Array.from(this.agents.values()).map(a => a.getState());
    
    // 统计总记忆和行动
    const totalMemories = allStates.reduce((sum, s) => sum + s.episodicMemory.length, 0);
    const totalActions = allStates.reduce((sum, s) => sum + s.completedActions.length, 0);
    
    // 找出共同话题
    const allTopics = allStates.flatMap(s => s.semanticMemory);
    const topicCounts = allTopics.reduce((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const sharedTopics = Object.entries(topicCounts)
      .filter(([_, count]) => count > 1)
      .map(([topic]) => topic);
    
    // 独特能力
    const uniqueCapabilities = new Map<string, string[]>();
    allStates.forEach(s => {
      uniqueCapabilities.set(s.agentId, s.capabilities);
    });
    
    return {
      totalMemories,
      totalActions,
      sharedTopics,
      uniqueCapabilities
    };
  }
  
  // ========== 事件绑定 ==========
  
  onAgentAction(callback: (agentId: string, action: Action) => void) {
    this.onAction = callback;
  }
  
  onAgentCycle(callback: (agentId: string, cycleCount: number) => void) {
    this.onCycle = callback;
  }
  
  // ========== 状态访问 ==========
  
  getAgent(agentId: string): AgentSelfConsciousness | undefined {
    return this.agents.get(agentId);
  }
  
  getAllAgents(): AgentSelfConsciousness[] {
    return Array.from(this.agents.values());
  }
  
  getControllerStatus(): {
    isRunning: boolean;
    agentCount: number;
    totalMemories: number;
    totalActions: number;
  } {
    const allStates = Array.from(this.agents.values()).map(a => a.getState());
    
    return {
      isRunning: this.isRunning,
      agentCount: this.agents.size,
      totalMemories: allStates.reduce((sum, s) => sum + s.episodicMemory.length, 0),
      totalActions: allStates.reduce((sum, s) => sum + s.completedActions.length, 0)
    };
  }
}

// ========== 导出单例 ==========

let controllerInstance: SelfDriveController | null = null;
let autoStartInterval: ReturnType<typeof setInterval> | null = null;

export function getSelfDriveController(): SelfDriveController {
  if (!controllerInstance) {
    controllerInstance = new SelfDriveController();
  }
  return controllerInstance;
}

/**
 * 自动启动智能体系统
 * 调用后智能体将24小时不停自我进化、反思、反馈、行动
 */
export function autoStartAgentSystem(intervalMs: number = 30000) {
  const controller = getSelfDriveController();
  
  if (autoStartInterval) {
    clearInterval(autoStartInterval);
  }
  
  console.log(`[Agent System] 自动启动智能体系统，周期: ${intervalMs}ms`);
  
  // 启动控制器
  controller.start(intervalMs);
  
  // 设置定时器，每30秒触发一次行动
  autoStartInterval = setInterval(() => {
    const agents = controller.getAllAgents();
    agents.forEach(agent => {
      const state = agent.getState();
      if (state.isActive) {
        // 随机触发一个行动
        const actions = ['query', 'explore', 'create', 'reflect', 'learn'];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        agent.triggerSelfDriveAction(randomAction);
      }
    });
  }, intervalMs);
  
  console.log(`[Agent System] 智能体系统已启动 ${controller.getAgents().length} 个智能体正在运行`);
  return controller;
}

/**
 * 停止自动运行
 */
export function stopAgentSystem() {
  if (autoStartInterval) {
    clearInterval(autoStartInterval);
    autoStartInterval = null;
  }
  const controller = getSelfDriveController();
  controller.stop();
  console.log('[Agent System] 智能体系统已停止');
}
