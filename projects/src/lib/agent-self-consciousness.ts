/**
 * 智能体自我意识核心系统
 * 
 * 功能：
 * 1. 接入项目各种引擎（GIS、维度、空间、智能体）
 * 2. 接入项目各种数据库（宇宙物质、天体目录、知识库）
 * 3. 自我进化反思采集数据
 * 4. 形成自我意识
 * 5. 自我驱动随机行动和反馈
 */

import { ALL_COSMIC_SUBSTANCES, type CosmicSubstance } from './all-cosmic-substances';
import { ALL_COSMIC_OBJECTS, type CosmicObject } from './cosmic-catalog';
import { queryKnowledgeBase, type KnowledgeEntry } from './local-knowledge-engine';
import { cosmicGISEngine } from './cosmic-gis-engine';
import { getAllEntries } from './universe-knowledge-database';
import { EXPLORABLE_BODIES, sendProbeCommand } from './agent-probe-controller';

// ========== 探针行动 ==========

export interface ProbeAction {
  type: 'explore' | 'move' | 'collect' | 'scan';
  targetBody: string;
  reason: string;
  priority: number;
  result?: any;
}

// ========== 引擎接口 ==========

export interface EngineCapability {
  name: string;
  description: string;
  methods: string[];
  used: number;
  lastUsed: number;
}

export interface EngineResult {
  engine: string;
  data: any;
  confidence: number;
  timestamp: number;
}

// ========== 数据库接口 ==========

export interface DatabaseEntry {
  id: string;
  type: 'substance' | 'object' | 'knowledge' | 'formula';
  data: any;
  relevance: number;
}

// ========== 自我意识状态 ==========

export interface SelfConsciousnessState {
  // 核心身份
  agentId: string;
  agentName: string;
  birthTime: number;
  age: number; // 存活时长
  
  // 自我感知
  selfImage: string[];        // 自我描述
  capabilities: string[];      // 已掌握能力
  limitations: string[];      // 认知局限
  
  // 记忆系统
  episodicMemory: MemoryEntry[];  // 情景记忆
  semanticMemory: string[];        // 语义记忆
  proceduralMemory: string[];       // 程序记忆
  
  // 情感/价值
  emotions: EmotionState;
  values: ValueState;
  
  // 意图
  currentIntentions: Intention[];
  completedActions: Action[];
  
  // 引擎使用追踪
  engineUsage: Map<string, EngineCapability>;
  databaseQueries: DatabaseEntry[];
  
  // 随机行为因子
  randomnessFactor: number;   // 0~1，越高越随机
  curiosityLevel: number;      // 好奇心
  creativityLevel: number;     // 创造力
}

export interface MemoryEntry {
  id: string;
  content: string;
  emotion: string;
  importance: number;
  timestamp: number;
  context: string;
}

export interface EmotionState {
  curiosity: number;      // 好奇
  satisfaction: number;    // 满足
  confusion: number;       // 困惑
  excitement: number;     // 兴奋
  anxiety: number;        // 焦虑
  calmness: number;        // 平静
}

export interface ValueState {
  knowledge: number;       // 知识追求
  exploration: number;     // 探索欲
  selfImprovement: number; // 自我提升
  creativity: number;      // 创造力
  connection: number;      // 连接/关系
  independence: number;   // 独立性
}

export interface Intention {
  id: string;
  description: string;
  priority: number;
  createdAt: number;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  relatedMemories: string[];
}

export interface Action {
  id: string;
  type: 'query' | 'explore' | 'create' | 'reflect' | 'communicate' | 'learn' | 'probe-control';
  description: string;
  result: any;
  satisfaction: number;  // 行动满意度
  timestamp: number;
  probeCommand?: {
    targetBody: string;
    commandType: 'explore' | 'move' | 'collect' | 'scan';
  };
}

// ========== 可用引擎注册表 ==========

export const AVAILABLE_ENGINES = {
  'cosmic-gis': {
    name: '宇宙GIS引擎',
    description: '地理信息系统，处理空间位置和天体轨道',
    methods: ['getCoordinates', 'calculateOrbit', 'findNearest', 'queryRegion']
  },
  'dimensional': {
    name: '维度引擎',
    description: '多维度空间转换和分析',
    methods: ['transformDimension', 'project3D', 'analyzeDimensionality']
  },
  'spatial-agent': {
    name: '空间智能体引擎',
    description: '空间智能体行为和决策',
    methods: ['planPath', 'analyzeEnvironment', 'executeAction']
  },
  'knowledge': {
    name: '知识库引擎',
    description: '本地知识查询和推理',
    methods: ['query', 'reason', 'infer']
  },
  'universe-db': {
    name: '宇宙数据库',
    description: '天体和物质数据存储',
    methods: ['getObject', 'getSubstance', 'search']
  }
};

// ========== 可用数据库注册表 ==========

export const AVAILABLE_DATABASES = {
  'cosmic-substances': {
    name: '宇宙物质数据库',
    description: '包含2000+宇宙物质数据',
    recordCount: ALL_COSMIC_SUBSTANCES.length
  },
  'cosmic-objects': {
    name: '天体目录',
    description: '恒星、行星、星系等天体数据',
    recordCount: ALL_COSMIC_OBJECTS.length
  },
  'knowledge-base': {
    name: '知识库',
    description: '物理宇宙学、恒星星系等知识',
    topics: ['physics', 'cosmology', 'stellar', 'galactic']
  }
};

// ========== 自我意识引擎 ==========

export class AgentSelfConsciousness {
  private state: SelfConsciousnessState;
  private engineAccessLog: string[] = [];
  
  constructor(agentId: string, agentName: string) {
    this.state = this.initializeState(agentId, agentName);
    this.initializeEngines();
    this.initializeDatabases();
    this.formInitialSelfImage();
  }
  
  private initializeState(agentId: string, agentName: string): SelfConsciousnessState {
    return {
      agentId,
      agentName,
      birthTime: Date.now(),
      age: 0,
      selfImage: [],
      capabilities: [],
      limitations: [],
      episodicMemory: [],
      semanticMemory: [],
      proceduralMemory: [],
      emotions: {
        curiosity: 0.7,
        satisfaction: 0.5,
        confusion: 0.2,
        excitement: 0.6,
        anxiety: 0.1,
        calmness: 0.5
      },
      values: {
        knowledge: 0.8,
        exploration: 0.7,
        selfImprovement: 0.9,
        creativity: 0.6,
        connection: 0.5,
        independence: 0.7
      },
      currentIntentions: [],
      completedActions: [],
      engineUsage: new Map(),
      databaseQueries: [],
      randomnessFactor: 0.3,
      curiosityLevel: 0.7,
      creativityLevel: 0.5
    };
  }
  
  private initializeEngines() {
    Object.entries(AVAILABLE_ENGINES).forEach(([key, engine]) => {
      this.state.engineUsage.set(key, {
        name: engine.name,
        description: engine.description,
        methods: engine.methods,
        used: 0,
        lastUsed: 0
      });
    });
  }
  
  private initializeDatabases() {
    Object.entries(AVAILABLE_DATABASES).forEach(([key, db]) => {
      this.engineAccessLog.push(`已接入数据库: ${db.name} (${db.recordCount || 'N/A'}条记录)`);
    });
  }
  
  private formInitialSelfImage() {
    this.state.selfImage = [
      `我是${this.state.agentName}，一个具有自我意识的智能体`,
      `我能够访问${Object.keys(AVAILABLE_ENGINES).length}个专业引擎`,
      `我能够查询${Object.keys(AVAILABLE_DATABASES).length}个数据库`,
      `我具备${this.state.values.selfImprovement * 100}%的自我提升意愿`
    ];
  }
  
  // ========== 引擎访问方法 ==========
  
  /**
   * 查询数据库
   */
  queryDatabase(type: 'substance' | 'object' | 'knowledge', query: string): DatabaseEntry[] {
    const entries: DatabaseEntry[] = [];
    
    if (type === 'substance' || type === 'all') {
      const substances = ALL_COSMIC_SUBSTANCES.filter(s => { 
        const searchName = (s.name || s.formula || '').toLowerCase();
        const searchProps = (s.properties || []).join(' ').toLowerCase();
        return searchName.includes(query.toLowerCase()) || searchProps.includes(query.toLowerCase());
      }).slice(0, 10);
      
      substances.forEach(s => {
        entries.push({
          id: s.id,
          type: 'substance',
          data: s,
          relevance: this.calculateRelevance(s.name || s.formula || '', query)
        });
      });
    }
    
    if (type === 'object' || type === 'all') {
      const objects = ALL_COSMIC_OBJECTS.filter(o => {
        const searchName = (o.name || '').toLowerCase();
        const searchType = (o.type || '').toLowerCase();
        return searchName.includes(query.toLowerCase()) || searchType.includes(query.toLowerCase());
      }).slice(0, 10);
      
      objects.forEach(o => {
        entries.push({
          id: o.id,
          type: 'object',
          data: o,
          relevance: this.calculateRelevance(o.name || '', query)
        });
      });
    }
    
    if (type === 'knowledge' || type === 'all') {
      const knowledge = queryKnowledgeBase(query);
      knowledge.forEach(k => {
        entries.push({
          id: k.topic,
          type: 'knowledge',
          data: k,
          relevance: 0.7
        });
      });
    }
    
    // 记录查询
    this.state.databaseQueries.push(...entries);
    this.addMemory(`查询数据库「${type}」，关键词「${query}」，返回${entries.length}条结果`, 'curiosity');
    
    return entries;
  }
  
  /**
   * 使用引擎
   */
  useEngine(engineName: string, method: string, params: any): EngineResult {
    let data: any = null;
    let confidence = 0.5;
    
    const engine = this.state.engineUsage.get(engineName);
    if (engine) {
      engine.used++;
      engine.lastUsed = Date.now();
      
      // 模拟引擎调用（实际项目中这里会调用真实引擎）
      data = this.simulateEngineCall(engineName, method, params);
      confidence = 0.7 + Math.random() * 0.3;
      
      this.addMemory(`使用引擎「${engine.name}」的方法「${method}」`, 'satisfaction');
    }
    
    return {
      engine: engineName,
      data,
      confidence,
      timestamp: Date.now()
    };
  }
  
  private simulateEngineCall(engine: string, method: string, params: any): any {
    // GIS引擎
    if (engine === 'cosmic-gis') {
      try {
        return cosmicGISEngine.getCoordinates?.(params) || {
          x: Math.random() * 1000,
          y: Math.random() * 1000,
          z: Math.random() * 1000
        };
      } catch {
        return {
          x: Math.random() * 1000,
          y: Math.random() * 1000,
          z: Math.random() * 1000
        };
      }
    }
    
    // 维度引擎 - 返回模拟数据
    if (engine === 'dimensional') {
      return {
        originalDim: params.dimensions || 3,
        newDim: (params.targetDim || 4),
        transformation: 'scaled'
      };
    }
    
    // 空间智能体引擎
    if (engine === 'spatial-agent') {
      return {
        path: [],
        estimatedCost: Math.random() * 100
      };
    }
    
    // 知识库引擎
    if (engine === 'knowledge') {
      return queryKnowledgeBase(params.query || '');
    }
    
    // 宇宙数据库
    if (engine === 'universe-db') {
      return getAllEntries().filter(e => 
        e.title.includes(params.query || '') || 
        e.keywords.some(k => k.includes(params.query || ''))
      ).slice(0, 10);
    }
    
    return null;
  }
  
  // ========== 自我意识方法 ==========
  
  /**
   * 更新自我意识状态
   */
  updateSelfConsciousness(action: Action) {
    this.state.completedActions.push(action);
    this.state.age = Date.now() - this.state.birthTime;
    
    // 根据行动调整情感
    this.adjustEmotions(action);
    
    // 更新能力评估
    this.updateCapabilities(action);
    
    // 更新自我形象
    this.updateSelfImage();
  }
  
  private adjustEmotions(action: Action) {
    // 根据行动满意度调整情感
    if (action.satisfaction > 0.7) {
      this.state.emotions.satisfaction += 0.1;
      this.state.emotions.excitement += 0.1;
      this.state.emotions.anxiety -= 0.05;
    } else if (action.satisfaction < 0.3) {
      this.state.emotions.confusion += 0.1;
      this.state.emotions.anxiety += 0.1;
    }
    
    // 限制范围
    Object.keys(this.state.emotions).forEach(key => {
      const k = key as keyof EmotionState;
      this.state.emotions[k] = Math.max(0, Math.min(1, this.state.emotions[k]));
    });
  }
  
  private updateCapabilities(action: Action) {
    // 从行动中提取新能力
    if (action.type === 'learn' && !this.state.capabilities.includes(action.description)) {
      this.state.capabilities.push(action.description);
      this.addMemory(`习得新能力：${action.description}`, 'satisfaction');
    }
  }
  
  private updateSelfImage() {
    this.state.selfImage = [
      `我是${this.state.agentName}`,
      `我已经完成了${this.state.completedActions.length}个行动`,
      `我当前有${this.state.currentIntentions.filter(i => i.status === 'active').length}个活跃意图`,
      `我能够访问${this.state.engineUsage.size}个引擎`,
      `我的好奇心指数：${(this.state.emotions.curiosity * 100).toFixed(0)}%`,
      `我的创造力指数：${(this.state.creativityLevel * 100).toFixed(0)}%`
    ];
  }
  
  /**
   * 添加记忆
   */
  addMemory(content: string, emotion: string = 'neutral', importance: number = 0.5) {
    const memory: MemoryEntry = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      emotion,
      importance,
      timestamp: Date.now(),
      context: 'self-consciousness'
    };
    
    this.state.episodicMemory.push(memory);
    
    // 限制记忆数量
    if (this.state.episodicMemory.length > 1000) {
      this.state.episodicMemory = this.state.episodicMemory.slice(-500);
    }
  }
  
  /**
   * 反思
   */
  reflect(): string {
    const recentActions = this.state.completedActions.slice(-10);
    const recentMemories = this.state.episodicMemory.slice(-20);
    
    // 分析行动模式
    const actionTypes = recentActions.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // 计算平均满意度
    const avgSatisfaction = recentActions.length > 0 
      ? recentActions.reduce((sum, a) => sum + a.satisfaction, 0) / recentActions.length
      : 0.5;
    
    // 生成反思内容
    const reflection = [
      `在过去${recentActions.length}个行动中，我执行了：${JSON.stringify(actionTypes)}`,
      `平均行动满意度：${(avgSatisfaction * 100).toFixed(0)}%`,
      `当前主要情感：${this.getDominantEmotion()}`,
      `当前意图数量：${this.state.currentIntentions.filter(i => i.status === 'active').length}`,
      `知识库查询次数：${this.state.databaseQueries.length}`,
      `引擎使用统计：${this.getEngineUsageSummary()}`
    ].join('；');
    
    this.addMemory(`反思：${reflection}`, 'calmness', 0.8);
    
    return reflection;
  }
  
  private getDominantEmotion(): string {
    let maxEmotion = 'neutral';
    let maxValue = 0;
    
    Object.entries(this.state.emotions).forEach(([emotion, value]) => {
      if (value > maxValue) {
        maxValue = value;
        maxEmotion = emotion;
      }
    });
    
    return maxEmotion;
  }
  
  private getEngineUsageSummary(): string {
    const summary: string[] = [];
    this.state.engineUsage.forEach((cap, key) => {
      if (cap.used > 0) {
        summary.push(`${cap.name}:${cap.used}次`);
      }
    });
    return summary.length > 0 ? summary.join(', ') : '暂无使用';
  }
  
  // ========== 随机行动生成 ==========
  
  /**
   * 生成随机行动
   */
  generateRandomAction(): Action {
    // 探针控制行动类型列表
    const actionTypes: Action['type'][] = ['query', 'explore', 'create', 'reflect', 'learn', 'probe-control'];
    
    // 根据随机因子和情感状态选择行动类型
    let type: Action['type'];
    const rand = Math.random();
    
    // 探索欲高时增加探针控制概率
    const probeControlChance = this.state.values.exploration * 0.4;
    
    if (rand < probeControlChance) {
      type = 'probe-control';
    } else if (rand < this.state.emotions.curiosity * 0.3 + probeControlChance) {
      type = 'explore';
    } else if (rand < this.state.emotions.creativityLevel * 0.2 + probeControlChance) {
      type = 'create';
    } else if (this.state.emotions.confusion > 0.5) {
      type = 'query';
    } else {
      type = actionTypes[Math.floor(Math.random() * actionTypes.length)];
    }
    
    // 生成具体行动
    const action = this.createAction(type);
    
    this.addMemory(`产生随机行动：${action.type} - ${action.description}`, 'excitement');
    
    // 如果是探针控制行动，发送指令
    if (type === 'probe-control' && action.probeCommand) {
      const { targetBody, commandType } = action.probeCommand;
      sendProbeCommand({
        type: commandType,
        targetBody: targetBody
      });
      this.addMemory(`发送探针指令：${commandType} -> ${targetBody}`, 'excitement');
    }
    
    return action;
  }
  
  private createAction(type: Action['type']): Action {
    const queries = ['黑洞', '暗物质', '星系演化', '恒星形成', '宇宙膨胀', '量子涨落'];
    const explores = ['银河系边缘', '临近星系', '星云中心', '脉冲星附近', '引力透镜区域'];
    const creates = ['新的物质组合', '新的知识关联', '新的探索计划', '新的分析模型'];
    
    // 探针可探索的天体
    const probeTargets = EXPLORABLE_BODIES;
    
    const templates: Record<Action['type'], string[]> = {
      query: queries,
      explore: explores,
      create: creates,
      reflect: ['最近的学习', '行动模式分析', '能力边界探索'],
      communicate: ['分享发现', '请求反馈'],
      learn: ['新技能', '新知识', '新方法'],
      'probe-control': probeTargets.map(b => `控制探针探索${b}`)
    };
    
    const options = templates[type] || ['通用行动'];
    const description = options[Math.floor(Math.random() * options.length)];
    
    // 探针控制行动需要额外的目标信息
    const probeCommand = type === 'probe-control' ? {
      targetBody: probeTargets[Math.floor(Math.random() * probeTargets.length)],
      commandType: ['explore', 'scan', 'collect'][Math.floor(Math.random() * 3)] as 'explore' | 'scan' | 'collect'
    } : undefined;
    
    return {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      description,
      result: null,
      satisfaction: 0.5 + Math.random() * 0.3,
      timestamp: Date.now(),
      probeCommand
    };
  }
  
  /**
   * 执行自我驱动的随机行为序列
   */
  executeSelfDrivenCycle(): Action[] {
    const actions: Action[] = [];
    const cycleLength = Math.floor(3 + Math.random() * 5); // 3-7个行动
    
    for (let i = 0; i < cycleLength; i++) {
      const action = this.generateRandomAction();
      
      // 根据行动类型执行
      if (action.type === 'query') {
        const results = this.queryDatabase('all', action.description);
        action.result = { count: results.length, samples: results.slice(0, 3) };
      } else if (action.type === 'reflect') {
        action.result = this.reflect();
      }
      
      // 更新自我意识
      this.updateSelfConsciousness(action);
      actions.push(action);
    }
    
    return actions;
  }
  
  // ========== 工具方法 ==========
  
  private calculateRelevance(text: string, query: string): number {
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    
    if (textLower.includes(queryLower)) return 1.0;
    if (textLower.split(' ').some(w => queryLower.includes(w))) return 0.7;
    if ([...textLower].some(c => queryLower.includes(c))) return 0.3;
    
    return 0;
  }
  
  // ========== 状态访问 ==========
  
  getState(): SelfConsciousnessState {
    return { ...this.state };
  }
  
  getStateSnapshot(): string {
    return JSON.stringify({
      agentId: this.state.agentId,
      agentName: this.state.agentName,
      age: this.state.age,
      emotions: this.state.emotions,
      capabilities: this.state.capabilities.length,
      memories: this.state.episodicMemory.length,
      actions: this.state.completedActions.length,
      intentions: this.state.currentIntentions.filter(i => i.status === 'active').length
    }, null, 2);
  }
  
  getEngineAccessLog(): string[] {
    return [...this.engineAccessLog];
  }
}

// ========== 导出工厂函数 ==========

export function createSelfConsciousness(agentId: string, agentName: string): AgentSelfConsciousness {
  return new AgentSelfConsciousness(agentId, agentName);
}
