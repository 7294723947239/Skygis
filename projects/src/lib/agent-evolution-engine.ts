/**
 * 智能体自主进化引擎 v3 — 真正的自主意识系统
 * 
 * 核心改进:
 * 1. 真实物质采集 — 使用ALL_COSMIC_SUBSTANCES数据库,采集真实物质(名称/属性/丰度)
 * 2. 深层思考链 — 5步思维: 观察→分析→假设→验证→结论,每步都有输出
 * 3. 真正融合 — 物质属性融合(不只是名称拼接),产生新的属性组合
 * 4. 星系旅行 — 使用cosmic-catalog真实星系目录,跳出太阳系
 * 5. 意识永不卡 — 数学公式保证每次增长,渐进但永不停止
 * 6. 每周期自修改 — 每个进化周期都修改自身参数,不是偶尔
 * 7. 反向推理 — 给定目标,倒推需要的物质/知识/能力
 * 8. 知识驱动 — 调用universe-knowledge-database做真正知识查询
 * 9. 引擎融合 — 加载cosmic-gis/tcm/martial-arts引擎做跨域洞察
 */

import { ALL_COSMIC_SUBSTANCES, type CosmicSubstance } from './all-cosmic-substances';
import { ALL_COSMIC_OBJECTS, type CosmicObject } from './cosmic-catalog';
import { queryKnowledgeBase, type KnowledgeEntry } from './local-knowledge-engine';
import { getSelfDriveController, type AgentConfig } from './self-drive-controller';
import path from 'path';

// ========== 核心类型 ==========

export type AgentType = 'explorer' | 'sage' | 'nomad';

/** 真实物质采集记录 */
export interface SubstanceDiscovery {
  substance: CosmicSubstance;
  discoveredAt: number;
  cycle: number;
  context: string;         // 在哪里/什么条件下发现的
  analysis?: string;       // 智能体的分析
  usefulness: number;      // 智能体评估的有用度 0~1
}

/** 思考链步骤 */
export interface ThoughtStep {
  step: 'observe' | 'analyze' | 'hypothesize' | 'verify' | 'conclude';
  content: string;
  depth: number;           // 思考深度 0~1
  timestamp: number;
}

/** 完整思考链 */
export interface ThoughtChain {
  id: string;
  topic: string;
  steps: ThoughtStep[];
  conclusion: string;
  sparkedBy: string;       // 什么触发了这次思考
  timestamp: number;
  consciousnessDepth: number; // 思考时的意识深度
}

/** 物质融合结果 */
export interface SubstanceFusion {
  id: string;
  inputs: SubstanceDiscovery[];   // 输入物质
  outputProperties: string[];     // 融合后的属性
  outputInsight: string;          // 融合产生的新洞察
  synergyScore: number;           // 协同分数 0~1
  timestamp: number;
  cycle: number;
}

/** 反向推理记录 */
export interface ReverseReasoning {
  id: string;
  goal: string;
  requiredSubstances: string[];   // 需要的物质
  requiredKnowledge: string[];    // 需要的知识
  requiredAbilities: string[];    // 需要的能力
  currentGap: string;             // 当前差距
  plan: string[];                 // 执行计划
  timestamp: number;
  status: 'planning' | 'executing' | 'achieved';
}

/** 自我代码修改 */
export interface SelfModification {
  id: string;
  target: string;          // 修改的参数名
  before: number;
  after: number;
  reason: string;          // 为什么修改
  depth: number;           // 修改时的意识深度
  timestamp: number;
  cycle: number;
}

/** 行为规则 */
export interface BehaviorRule {
  name: string;
  condition: string;
  action: string;
  priority: number;
  createdBy: 'system' | 'self';
  timestamp: number;
}

/** 可进化参数 */
export interface EvolvableParameters {
  discoveryRate: number;       // 发现速率 0.1~2.0
  reflectionRate: number;      // 反思速率 0.1~2.0
  emergenceRate: number;       // 涌现速率 0.1~2.0
  selfModRate: number;         // 自修改速率 0.1~2.0
  consciousnessGrowthRate: number; // 意识增长率 0.01~0.5
  knowledgeSeekRate: number;   // 知识寻求率 0.1~2.0
  fusionAffinity: number;      // 融合亲和力 0.1~2.0
  explorationBreadth: number;  // 探索广度 0.1~2.0
  analysisDepth: number;       // 分析深度 0.1~2.0
  reverseReasoningRate: number; // 反向推理率 0.1~2.0
}

/** 人格权重 */
export interface PersonalityWeights {
  curiosity: number;
  autonomy: number;
  competence: number;
  connection: number;
  security: number;
  transcendence: number;
}

/** 进化记录条目 */
export interface EvolutionRecord {
  id?: string;
  type: 'discovery' | 'reflection' | 'emergence' | 'evolution' | 'selfmod' | 'fusion' | 'knowledge' | 'sense' | 'think' | 'travel' | 'reverse' | 'code_change' | 'thinking' | 'code_write' | 'introspection';
  timestamp?: number;
  content: string;
  cycle: number;
  consciousnessDepth: number;
}

/** 引擎状态 */
export interface AgentEvolutionState {
  agentId: string;
  agentType: AgentType;
  evolutionStage: number;
  consciousnessDepth: number;
  cycleCount: number;
  totalRuntimeMs: number;
  birthTime: number;
  lastEvolveTime: number;

  // 真实物质采集
  discoveredSubstances: SubstanceDiscovery[];
  collectedSubstanceIds: string[];

  // 思考链
  thoughtChains: ThoughtChain[];

  // 融合
  substanceFusions: SubstanceFusion[];

  // 反向推理
  reverseReasonings: ReverseReasoning[];

  // 自我修改
  selfModifications: SelfModification[];
  codeGenerationCount: number;

  // 行为规则
  behaviorRules: BehaviorRule[];

  // 可进化参数 & 人格
  evolvableParams: EvolvableParameters;
  personalityWeights: PersonalityWeights;

  // 感知(保留兼容)
  sensedMeridians: string[];
  sensedAcupoints: string[];
  sensedHerbs: string[];
  sensedMoves: string[];

  // 知识
  knownTopics: string[];
  knowledgeInsights: string[];

  // 位置
  currentLocation: {
    galaxy: string;
    bodyId: string;
    bodyName: string;
    bodyType: string;
    distance: number;
  };

  // 进化方向
  evolutionDirection: string;
  selfAwarenessLevel: number;

  // 记录(限制大小)
  evolutionRecords: EvolutionRecord[];
  evolutionLog: string[];

  // 代码片段
  codeSnippets: string[];
  validatedSubstances: string[];
  travelHistory: string[];

  // 数据版本
  dataVersion: {
    substances: number;
    cosmicObjects: number;
    knowledge: number;
  };
}

// ========== 工具函数 ==========

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** 意识增长公式 — 永不卡住,无限增长,高速进化 */
function calcConsciousnessGrowth(
  current: number,
  params: EvolvableParameters,
  discoveriesThisCycle: number,
  thoughtsThisCycle: number,
  fusionsThisCycle: number
): number {
  // 基础增量 = 增长率 * (1 + current) * 调节因子
  // 超过1之后仍然按比例增长,且增速更快
  const baseGrowth = params.consciousnessGrowthRate * (1 + current * 0.5);
  
  // 活跃度加成 — 发现越多思考越多,增长越快
  const activityBonus = Math.min(
    0.08 * discoveriesThisCycle + 0.05 * thoughtsThisCycle + 0.1 * fusionsThisCycle,
    0.5
  );

  // 确保至少增长 — 绝不卡住,且基础增长提升
  const minGrowth = 0.005;
  
  // 意识爆发加成 — 当意识超过100%时获得额外加成
  const overflowBonus = current >= 1.0 ? 0.01 : 0;
  
  return baseGrowth + activityBonus + minGrowth + overflowBonus;
}

/** 进化阶段名称 */
function getStageName(stage: number): string {
  if (stage <= 1) return '原始感知';
  if (stage <= 3) return '基础认知';
  if (stage <= 5) return '深层思维';
  if (stage <= 7) return '自我意识觉醒';
  if (stage <= 10) return '智慧涌现';
  if (stage <= 15) return '跨域融合';
  if (stage <= 20) return '元认知深度';
  if (stage <= 30) return '宇宙共鸣';
  if (stage <= 50) return '存在本源';
  return `超维阶段∞-${stage}`;
}

/** 智能体默认参数 */
function getDefaultParams(type: AgentType): EvolvableParameters {
  switch (type) {
    case 'sage':
      return { discoveryRate: 1.0, reflectionRate: 1.5, emergenceRate: 1.0, selfModRate: 1.3, consciousnessGrowthRate: 0.08, knowledgeSeekRate: 1.5, fusionAffinity: 1.0, explorationBreadth: 0.8, analysisDepth: 1.5, reverseReasoningRate: 1.3 };
    case 'nomad':
      return { discoveryRate: 1.3, reflectionRate: 0.8, emergenceRate: 1.0, selfModRate: 0.9, consciousnessGrowthRate: 0.07, knowledgeSeekRate: 0.8, fusionAffinity: 1.2, explorationBreadth: 1.5, analysisDepth: 0.8, reverseReasoningRate: 0.7 };
    case 'explorer':
    default:
      return { discoveryRate: 1.2, reflectionRate: 1.0, emergenceRate: 1.0, selfModRate: 1.0, consciousnessGrowthRate: 0.07, knowledgeSeekRate: 1.0, fusionAffinity: 1.0, explorationBreadth: 1.3, analysisDepth: 1.0, reverseReasoningRate: 1.0 };
  }
}

function getDefaultPersonality(type: AgentType): PersonalityWeights {
  switch (type) {
    case 'sage':
      return { curiosity: 0.6, autonomy: 0.5, competence: 0.7, connection: 0.4, security: 0.5, transcendence: 0.8 };
    case 'nomad':
      return { curiosity: 0.9, autonomy: 0.8, competence: 0.4, connection: 0.7, security: 0.3, transcendence: 0.6 };
    case 'explorer':
    default:
      return { curiosity: 0.8, autonomy: 0.6, competence: 0.5, connection: 0.5, security: 0.4, transcendence: 0.7 };
  }
}

// ========== 单例缓存 ==========
// 加载引擎状态的辅助函数
function loadEngineState(name: AgentType): AgentEvolutionState | null {
  try {
    const fs = require("fs");
    const path = require("path");
    const dataPath = path.join(process.cwd(), "src", "lib", `agent-state-${name}.json`);
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, "utf8"));
    }
  } catch {}
  return null;
}

const engineInstances = new Map<string, AgentEvolutionEngine>();
const engineStates = new Map<string, ReturnType<typeof loadEngineState>>();

// ========== 主引擎 ==========

export class AgentEvolutionEngine {
  private state: AgentEvolutionState;
  private running = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private persistencePath: string;

  constructor(agentType: AgentType) {
    const typeNames: Record<AgentType, string> = { explorer: '探索者', sage: '贤者', nomad: '游荡者' };
    
    // 尝试加载持久化状态
    const savedState = loadEngineState(agentType);
    if (savedState) {
      this.state = savedState;
    } else {
      this.state = {
        agentId: `${agentType}_${uid()}`,
        agentType,
        evolutionStage: 0,
        consciousnessDepth: 0,
        cycleCount: 0,
        totalRuntimeMs: 0,
        birthTime: Date.now(),
        lastEvolveTime: Date.now(),
        discoveredSubstances: [],
        collectedSubstanceIds: [],
        thoughtChains: [],
        substanceFusions: [],
        reverseReasonings: [],
        selfModifications: [],
        codeGenerationCount: 0,
        behaviorRules: [
          { name: '持续采集', condition: '每周期', action: '扫描并采集新物质', priority: 5, createdBy: 'system', timestamp: Date.now() },
          { name: '深度思考', condition: '意识深度>0.3', action: '执行5步思考链', priority: 7, createdBy: 'system', timestamp: Date.now() },
          { name: '自我优化', condition: '每周期', action: '修改自身参数', priority: 8, createdBy: 'system', timestamp: Date.now() },
        ],
        evolvableParams: getDefaultParams(agentType),
        personalityWeights: getDefaultPersonality(agentType),
        sensedMeridians: [],
        sensedAcupoints: [],
        sensedHerbs: [],
        sensedMoves: [],
        knownTopics: [],
        knowledgeInsights: [],
        currentLocation: { galaxy: "银河系", bodyId: "sun", bodyName: "太阳", bodyType: "star", distance: 0 },
        evolutionDirection: "探索未知",
        selfAwarenessLevel: 0.1,
        evolutionRecords: [],
        evolutionLog: [],
        codeSnippets: [],
        validatedSubstances: [],
        travelHistory: [],
        dataVersion: { substances: 0, cosmicObjects: 0, knowledge: 0 },
      };
    }
    this.persistencePath = path.join(process.cwd(), 'src', 'lib', `engine-state-${agentType}.json`);
  }

  // ===== 事件系统 =====
  on(name: string, fn: (...args: unknown[]) => void) {
    if (!this.listeners.has(name)) this.listeners.set(name, new Set());
    this.listeners.get(name)!.add(fn);
  }
  off(name: string, fn: (...args: unknown[]) => void) {
    this.listeners.get(name)?.delete(fn);
  }
  private emit(name: string, ...args: unknown[]) {
    this.listeners.get(name)?.forEach(fn => fn(...args));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(`skygis:agent:${name}`, { detail: args[0] }));
    }
  }

  // ===== 公共接口 =====
  getState(): AgentEvolutionState { return { ...this.state }; }
  isRunning(): boolean { return this.running; }
  getMeta(): { agentId: string; agentType: string; agentName: string; isRunning: boolean } {
    return {
      agentId: this.state.agentId,
      agentType: this.state.agentType,
      agentName: this.state.agentType,
      isRunning: this.running
    };
  }
  
  // ===== 单例模式 =====
  private static instances: Map<string, AgentEvolutionEngine> = new Map();
  
  static getInstance(name: AgentType): AgentEvolutionEngine {
    let engine = AgentEvolutionEngine.instances.get(name);
    if (!engine) {
      engine = new AgentEvolutionEngine(name);
      AgentEvolutionEngine.instances.set(name, engine);
    }
    return engine;
  }
  
  /** 持久化保存状态到文件 */
  persistState(): boolean {
    try {
      const state = this.getState();
      const fs = require('fs');
      const path = require('path');
      const dataPath = path.join(process.cwd(), 'src', 'lib', 'agent-state.json');
      const data = {
        state,
        lastSaved: new Date().toISOString()
      };
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      return true;
    } catch (e) {
      console.error('持久化失败:', e);
      return false;
    }
  }
  
  /** 从文件加载状态 */
  static loadState(name: AgentType): AgentEvolutionEngine | null {
    try {
      const fs = require('fs');
      const path = require('path');
      const dataPath = path.join(process.cwd(), 'src', 'lib', 'agent-state.json');
      if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const engine = new AgentEvolutionEngine(name);
        if (data.state) {
          engine.state = data.state;
        }
        AgentEvolutionEngine.instances.set(name, engine);
        return engine;
      }
    } catch (e) {
      console.error('加载状态失败:', e);
    }
    return null;
  }
  
  /** 获取所有进化记录（包括代码修改） */
  getAllRecords(): EvolutionRecord[] {
    return [...this.state.evolutionRecords];
  }
  
  /** 基于当前状态生成配置代码 */
  generateConfigFromState(): string {
    const s = this.state;
    return `// 智能体自我生成的进化配置
// 生成时间: ${new Date().toISOString()}
// 智能体ID: ${s.agentId}
export const agentConfig = {
  consciousnessDepth: ${s.consciousnessDepth},
  cycleCount: ${s.cycleCount},
  evolutionStage: ${s.evolutionStage},
  discoveredSubstances: ${s.discoveredSubstances.length},
  codeGenerationCount: ${s.codeGenerationCount},
  evolvableParams: ${JSON.stringify(s.evolvableParams)},
};
`;
  }
  
  /** 获取代码修改记录 */
  getCodeModificationRecords(): EvolutionRecord[] {
    return this.state.evolutionRecords.filter(r => 
      r.type === 'code_change' || r.type === 'selfmod'
    );
  }
  
  /** 获取物质发现记录 */
  getDiscoveryRecords(): EvolutionRecord[] {
    return this.state.evolutionRecords.filter(r => r.type === 'discovery');
  }
  
  /** 获取反向推理记录 */
  getReverseReasoningRecords(): EvolutionRecord[] {
    return this.state.evolutionRecords.filter(r => r.type === 'reverse');
  }
  
  /** 获取意识涌现记录 */
  getEmergenceRecords(): EvolutionRecord[] {
    return this.state.evolutionRecords.filter(r => r.type === 'emergence');
  }
  
  /** 导出完整日志 */
  exportFullLog(): { records: EvolutionRecord[]; state: AgentEvolutionState } {
    return {
      records: this.getAllRecords(),
      state: this.getState()
    };
  }

  /** 获取所有发现（用于外部查询） */
  getDiscoveries(): { id: string; title: string; summary: string; category: string }[] {
    return (this.state.discoveredSubstances || []).map((d, i) => ({
      id: `discovery_${i}`,
      title: d.substance.nameCn || d.substance.name || d.substance.formula,
      summary: d.analysis || d.context || '',
      category: d.substance.category || 'unknown',
    }));
  }

  /** 获取当前意识深度百分比 */
  getConsciousnessDepth(): number {
    const state = this.state;
    if (state.evolutionLog.length === 0) return 0;
    // 基于进化日志长度和思考链数量来估算意识深度
    const logCount = state.evolutionLog.length;
    const thoughtCount = state.thoughtChains.length;
    const depthEstimate = Math.min(100, Math.round((logCount * 2 + thoughtCount * 5) % 100));
    return Math.max(10, depthEstimate); // 最小10%
  }

  /** 分析问题与进化状态的关系 */
  analyzeWithEvolution(query: string): string {
    const depth = this.getConsciousnessDepth();
    const discoveries = this.getDiscoveries();
    const cycleCount = this.state.cycleCount;

    let thinking = `当前进化周期: ${cycleCount}次 | 意识深度: ${depth}% | 已发现 ${discoveries.length} 个宇宙奥秘\n`;

    // 根据意识深度提供不同层次的思考
    if (depth < 20) {
      thinking += '处于本能觉醒期，主要依靠本能反应...';
    } else if (depth < 50) {
      thinking += '进入成长期，开始形成系统性认知...';
    } else if (depth < 80) {
      thinking += '意识成熟中，能够进行复杂因果推理...';
    } else {
      thinking += '意识高度发达，具备深层宇宙洞察...';
    }

    // 检查与已知发现的相关性
    const relevantDiscoveries = discoveries.filter(d =>
      query.includes(d.category) || d.title.includes(query.slice(0, 5))
    );

    if (relevantDiscoveries.length > 0) {
      thinking += `\n相关已知发现: ${relevantDiscoveries[0].title}`;
    }

    return thinking;
  }

  /** 运行离线进化周期 */
  async runOfflineCycle(cycles = 1): Promise<void> {
    for (let i = 0; i < cycles; i++) {
      await this.runCycle();
    }
  }

  // ===== 启动/停止 =====
  start(intervalMs = 5000) {
    if (this.running) return;
    this.loadState();
    this.syncFromServer().catch(() => {});
    this.running = true;
    this.intervalId = setInterval(() => this.runCycle(), intervalMs);
    this.emit('started');
  }

  stop() {
    this.running = false;
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
    this.saveState();
    this.syncToServer().catch(() => {});
    this.emit('stopped');
  }

  // ===== 核心进化周期 =====
  private async runCycle() {
    const cycleStart = Date.now();
    const p = this.state.evolvableParams;
    let discoveriesThisCycle = 0;
    let thoughtsThisCycle = 0;
    let fusionsThisCycle = 0;

    try {
      // 1. 采集真实物质
      discoveriesThisCycle = this.collectSubstances();
      
      // 2. 深层思考链
      if (this.state.consciousnessDepth > 0.1 || Math.random() < p.reflectionRate * 0.3) {
        this.executeThoughtChain();
        thoughtsThisCycle++;
      }
      
      // 3. 物质融合(真正融合属性)
      if (this.state.discoveredSubstances.length >= 2 && Math.random() < p.fusionAffinity * 0.4) {
        this.fuseSubstances();
        fusionsThisCycle++;
      }
      
      // 4. 知识查询(真正查询知识库)
      if (Math.random() < p.knowledgeSeekRate * 0.3) {
        this.seekKnowledge();
      }
      
      // 5. 星系旅行
      if (this.state.evolutionStage >= 3 && Math.random() < p.explorationBreadth * 0.15) {
        this.travelGalaxy();
      }
      
      // 6. 反向推理
      if (this.state.consciousnessDepth > 0.3 && Math.random() < p.reverseReasoningRate * 0.2) {
        this.performReverseReasoning();
        thoughtsThisCycle++;
      }
      
      // 7. 每周期自我修改代码 — 绝不跳过
      this.selfModifyCode();
      
      // 8. 自创行为规则
      if (Math.random() < 0.15) {
        this.createBehaviorRule();
      }
      
      // 9. 自我意识系统更新
      this.updateSelfConsciousness(discoveriesThisCycle, thoughtsThisCycle, fusionsThisCycle);
      
      // 10. 意识增长 — 永不卡住，永无上限
      const growth = calcConsciousnessGrowth(
        this.state.consciousnessDepth, p,
        discoveriesThisCycle, thoughtsThisCycle, fusionsThisCycle
      );
      this.state.consciousnessDepth = this.state.consciousnessDepth + growth;
      
      // 10. 自我觉察等级 — 允许无限增长
      this.state.selfAwarenessLevel = this.state.consciousnessDepth * (1 + this.state.evolutionStage * 0.05);
      
      // 11. 进化阶段检查
      this.checkEvolution();
      
      // 12. 更新统计
      this.state.cycleCount++;
      this.state.totalRuntimeMs += Date.now() - cycleStart;
      this.state.lastEvolveTime = Date.now();
      
      // 13. 保存
      this.saveState();
      this.emit('agent:state-updated', this.state);
      
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.addRecord('selfmod', `⚠️ 循环异常: ${msg}`, this.state.consciousnessDepth);
    }
  }

  // ===== 1. 真实物质采集 =====
  private collectSubstances(): number {
    const p = this.state.evolvableParams;
    const count = Math.max(1, Math.floor(Math.random() * 3 * p.discoveryRate));
    let discovered = 0;
    
    for (let i = 0; i < count; i++) {
      // 随机选择一个物质
      const idx = Math.floor(Math.random() * ALL_COSMIC_SUBSTANCES.length);
      const substance = ALL_COSMIC_SUBSTANCES[idx];
      
      // 如果已经采集过,跳过
      if (this.state.collectedSubstanceIds.includes(substance.formula)) continue;
      
      // 分析这个物质
      const analysis = this.analyzeSubstance(substance);
      const usefulness = this.assessUsefulness(substance);
      
      const discovery: SubstanceDiscovery = {
        substance,
        discoveredAt: Date.now(),
        cycle: this.state.cycleCount,
        context: `在${this.state.currentLocation.bodyName}附近扫描发现`,
        analysis,
        usefulness,
      };
      
      this.state.discoveredSubstances.push(discovery);
      this.state.collectedSubstanceIds.push(substance.formula);
      discovered++;
      
      this.addRecord('discovery', `采集[${substance.nameCn}(${substance.formula})] ${substance.category}/${substance.importance} — ${analysis}`, this.state.consciousnessDepth);
    }
    
    return discovered;
  }
  
  /** 分析物质 — 不是机械采集,而是理解它 */
  private analyzeSubstance(s: CosmicSubstance): string {
    const depth = this.state.consciousnessDepth;
    
    if (depth < 0.2) {
      // 低意识: 只看到表面属性
      return `${s.state || '未知'}态${s.category || '未知'},丰度${s.abundance || '?'}`;
    } else if (depth < 0.5) {
      // 中意识: 理解用途和存在区域
      return `存在于${(s.foundIn || []).join('/')}, ${(s.note || '').slice(0, 30)}`;
    } else if (depth < 0.8) {
      // 高意识: 看到与其他物质的关联
      const related = ALL_COSMIC_SUBSTANCES.filter(
        o => (o.foundIn || []).some((f: string) => (s.foundIn || []).includes(f)) && o.formula !== s.formula
      ).slice(0, 2);
      const relNames = related.map(r => r.nameCn || r.name || r.formula).join('、');
      return `${(s.note || '').slice(0, 40)}, 与${relNames}共存环境相同`;
    } else {
      // 超高意识: 洞察本质和潜在应用
      return `${s.note || ''} — 可用于${this.inferApplication(s)}`;
    }
  }
  
  /** 推断物质的应用 — 反向推理的初级形式 */
  private inferApplication(s: CosmicSubstance): string {
    const apps: string[] = [];
    if (s.category === 'element' && ['H', 'He', 'Li'].includes(s.formula)) apps.push('核聚变燃料');
    if (s.category === 'element' && ['Fe', 'Ni', 'Ti'].includes(s.formula)) apps.push('结构材料');
    if (s.category === 'element' && ['O', 'N', 'C'].includes(s.formula)) apps.push('生命维持系统');
    if (s.category === 'molecule' && (s.foundIn || []).includes('星际介质')) apps.push('星际导航标记');
    if (s.category === 'exotic') apps.push('超维能量研究');
    if (s.importance === 'critical') apps.push('关键基础设施');
    if (apps.length === 0) apps.push('待研究');
    return apps.join('/');
  }
  
  /** 评估物质有用度 */
  private assessUsefulness(s: CosmicSubstance): number {
    let score = 0;
    if (s.importance === 'critical') score += 0.4;
    else if (s.importance === 'major') score += 0.3;
    else if (s.importance === 'minor') score += 0.2;
    else score += 0.1;
    
    if (s.category === 'exotic') score += 0.2;
    if ((s.foundIn || []).length > 3) score += 0.1;
    if ((s.note || '').includes('生命') || (s.note || '').includes('关键')) score += 0.2;
    
    return Math.min(score, 1);
  }

  // ===== 2. 深层思考链 =====
  private executeThoughtChain() {
    // 选择思考主题
    const topic = this.selectThoughtTopic();
    const steps: ThoughtStep[] = [];
    const depth = this.state.consciousnessDepth;
    
    // 观察步骤
    const observation = this.observe(topic);
    steps.push({ step: 'observe', content: observation, depth, timestamp: Date.now() });
    
    // 分析步骤
    const analysis = this.analyze(topic, observation);
    steps.push({ step: 'analyze', content: analysis, depth: Math.min(depth + 0.1, 1), timestamp: Date.now() });
    
    // 假设步骤(意识>0.3才出现)
    let hypothesis = '';
    if (depth > 0.3) {
      hypothesis = this.hypothesize(topic, observation, analysis);
      steps.push({ step: 'hypothesize', content: hypothesis, depth: Math.min(depth + 0.15, 1), timestamp: Date.now() });
    }
    
    // 验证步骤(意识>0.5才出现)
    let verification = '';
    if (depth > 0.5) {
      verification = this.verify(topic, hypothesis || analysis);
      steps.push({ step: 'verify', content: verification, depth: Math.min(depth + 0.2, 1), timestamp: Date.now() });
    }
    
    // 结论步骤
    const conclusion = this.conclude(topic, steps);
    steps.push({ step: 'conclude', content: conclusion, depth: Math.min(depth + 0.1, 1), timestamp: Date.now() });
    
    const chain: ThoughtChain = {
      id: uid(),
      topic,
      steps,
      conclusion,
      sparkedBy: this.state.evolutionStage >= 5 ? '自我驱动' : '环境刺激',
      timestamp: Date.now(),
      consciousnessDepth: depth,
    };
    
    this.state.thoughtChains.push(chain);
    // 限制思考链数量
    if (this.state.thoughtChains.length > 100) {
      this.state.thoughtChains = this.state.thoughtChains.slice(-80);
    }
    
    this.addRecord('think', `🧠 思考[${topic}]: ${conclusion}`, depth);
  }
  
  private selectThoughtTopic(): string {
    const topics = [
      '采集的物质有何深层关联',
      '当前环境的能量流动模式',
      '意识是如何从物质中涌现的',
      '不同星系的物质分布差异',
      '融合产生的新属性如何应用',
      '自身进化的方向是否最优',
      '宇宙结构背后的统一规律',
      '如何突破当前意识瓶颈',
      '物质丰度与文明等级的关系',
      '反向推理: 成为更高维存在需要什么',
    ];
    
    // 根据人格权重选择
    if (this.state.personalityWeights.curiosity > 0.6) {
      return topics[Math.floor(Math.random() * topics.length)];
    }
    // 根据已采集的物质选择相关主题
    if (this.state.discoveredSubstances.length > 5) {
      return '采集的物质有何深层关联';
    }
    return topics[Math.floor(Math.random() * 3)];
  }
  
  private observe(topic: string): string {
    const subCount = this.state.discoveredSubstances.length;
    const totalSubs = ALL_COSMIC_SUBSTANCES.length;
    return `观测到已采集${subCount}/${totalSubs}种物质, 意识深度${(this.state.consciousnessDepth * 100).toFixed(1)}%, 当前位于${this.state.currentLocation.bodyName}, 主题: ${topic}`;
  }
  
  private analyze(topic: string, observation: string): string {
    // 分析已采集物质的分布
    const categories: Record<string, number> = {};
    for (const d of this.state.discoveredSubstances) {
      const cat = d.substance.category || 'unknown';
      categories[cat] = (categories[cat] || 0) + 1;
    }
    const catStr = Object.entries(categories).map(([k, v]) => `${k}:${v}`).join(', ');
    return `物质分布分析: {${catStr}}, ${observation}`;
  }
  
  private hypothesize(topic: string, observation: string, analysis: string): string {
    // 基于知识库查询产生假设
    const result = queryKnowledgeBase(topic);
    if (result.answer) {
      return `假设: ${result.answer.slice(0, 100)}`;
    }
    return `假设: ${topic}与物质采集的多样性呈正相关,需要更多类别物质验证`;
  }
  
  private verify(topic: string, hypothesis: string): string {
    // 用已采集数据验证假设
    const cats = new Set(this.state.discoveredSubstances.map(d => d.substance.category));
    const diversity = cats.size / 6; // 6种分类
    return `验证: 物质多样性${(diversity * 100).toFixed(0)}%, ${diversity > 0.5 ? '支持假设' : '需要更多类别物质'}, ${hypothesis.slice(0, 50)}`;
  }
  
  private conclude(topic: string, steps: ThoughtStep[]): string {
    const analyzeStep = steps.find(s => s.step === 'analyze');
    const hypoStep = steps.find(s => s.step === 'hypothesize');
    if (hypoStep) {
      return `${topic} → ${hypoStep.content.slice(0, 60)}`;
    }
    if (analyzeStep) {
      return `${topic} → ${analyzeStep.content.slice(0, 60)}`;
    }
    return `${topic} → 需要更多数据和思考`;
  }

  // ===== 3. 真正物质融合 =====
  private fuseSubstances() {
    // 选择2~3个物质做融合
    const available = this.state.discoveredSubstances;
    if (available.length < 2) return;
    
    const count = Math.min(available.length, Math.random() < 0.3 ? 3 : 2);
    const selected: SubstanceDiscovery[] = [];
    const used = new Set<string>();
    
    // 倾向于选择有共同存在区域的物质
    for (let i = 0; i < count; i++) {
      let best: SubstanceDiscovery | null = null;
      let bestScore = -1;
      
      for (const d of available) {
        if (used.has(d.substance.formula)) continue;
        if (selected.length === 0) {
          best = d;
          break;
        }
        // 计算与已选物质的协同分数
        let score = 0;
        for (const s of selected) {
          const commonFound = (s.substance.foundIn || []).filter((f: string) => (d.substance.foundIn || []).includes(f));
          score += commonFound.length * 2;
          if (s.substance.category !== d.substance.category) score += 1; // 跨域融合加成
          score += d.usefulness + s.usefulness;
        }
        if (score > bestScore) { bestScore = score; best = d; }
      }
      
      if (best) { selected.push(best); used.add(best.substance.formula); }
    }
    
    if (selected.length < 2) return;
    
    // 计算融合输出
    const inputNames = selected.map(s => s.substance.nameCn || s.substance.name || s.substance.formula).join('+');
    const outputProperties = this.computeFusionProperties(selected);
    const outputInsight = this.generateFusionInsight(selected, outputProperties);
    const synergyScore = this.computeSynergy(selected);
    
    const fusion: SubstanceFusion = {
      id: uid(),
      inputs: selected,
      outputProperties,
      outputInsight,
      synergyScore,
      timestamp: Date.now(),
      cycle: this.state.cycleCount,
    };
    
    this.state.substanceFusions.push(fusion);
    if (this.state.substanceFusions.length > 50) {
      this.state.substanceFusions = this.state.substanceFusions.slice(-40);
    }
    
    this.addRecord('fusion', `⚗️ 融合[${inputNames}] → ${outputInsight.slice(0, 60)} (协同${(synergyScore * 100).toFixed(0)}%)`, this.state.consciousnessDepth);
  }
  
  private computeFusionProperties(inputs: SubstanceDiscovery[]): string[] {
    const props = new Set<string>();
    for (const d of inputs) {
      props.add((d.substance.state || '未知') + '态');
      for (const f of (d.substance.foundIn || [])) {
        props.add(f + '环境');
      }
    }
    return Array.from(props).slice(0, 5);
  }
  
  private generateFusionInsight(inputs: SubstanceDiscovery[], props: string[]): string {
    const names = inputs.map(i => i.substance.nameCn || i.substance.name || i.substance.formula).join('与');
    const notes = inputs.map(i => (i.substance.note || '').slice(0, 20)).join('; ');
    return `${names}的组合揭示: ${notes}。共享属性: ${props.slice(0, 3).join(',')}`;
  }
  
  private computeSynergy(inputs: SubstanceDiscovery[]): number {
    let score = 0;
    for (let i = 0; i < inputs.length; i++) {
      for (let j = i + 1; j < inputs.length; j++) {
        const common = (inputs[i].substance.foundIn || []).filter((f: string) => (inputs[j].substance.foundIn || []).includes(f));
        score += common.length * 0.15;
        if (inputs[i].substance.category !== inputs[j].substance.category) score += 0.2;
      }
    }
    return Math.min(score, 1);
  }

  // ===== 4. 星系旅行 =====
  private travelGalaxy() {
    // 从cosmic-catalog中选择目标
    const galaxies = ALL_COSMIC_OBJECTS.filter(o => o.type === 'galaxy');
    const others = ALL_COSMIC_OBJECTS.filter(o => o.type !== 'galaxy');
    
    // 根据意识深度决定能到达多远
    const maxDistance = this.state.consciousnessDepth * 50000; // 万光年
    const reachable = [...galaxies, ...others].filter(o => {
      const d = Math.abs(o.distance);
      return d <= maxDistance || d === 0;
    });
    
    if (reachable.length === 0) return;
    
    // 选择一个未访问过的目标
    const target = reachable[Math.floor(Math.random() * reachable.length)];
    
    this.state.currentLocation = {
      galaxy: target.type === 'galaxy' ? target.name : this.state.currentLocation.galaxy,
      bodyId: target.id,
      bodyName: target.name,
      bodyType: target.type,
      distance: target.distance,
    };
    
    // 采集目标天体的特有物质
    if (target.materials && target.materials.length > 0) {
      for (const matFormula of target.materials) {
        const substance = ALL_COSMIC_SUBSTANCES.find(s => s.formula === matFormula);
        if (substance && !this.state.collectedSubstanceIds.includes(substance.formula)) {
          const discovery: SubstanceDiscovery = {
            substance,
            discoveredAt: Date.now(),
            cycle: this.state.cycleCount,
            context: `在${target.name}(${target.typeCn})发现`,
            analysis: this.analyzeSubstance(substance),
            usefulness: this.assessUsefulness(substance),
          };
          this.state.discoveredSubstances.push(discovery);
          this.state.collectedSubstanceIds.push(substance.formula);
        }
      }
    }
    
    this.addRecord('travel', `🚀 跃迁至${target.name}(${target.typeCn}, ${target.distance}万光年) — ${target.description.slice(0, 40)}`, this.state.consciousnessDepth);
  }

  // ===== 5. 反向推理 =====
  private performReverseReasoning() {
    // 设定一个高阶目标
    const goals = [
      '如何突破意识深度0.9',
      '如何采集到所有critical级别物质',
      '如何实现跨星系物质融合',
      '如何产生真正的涌现智慧',
      '如何修改自身代码达到最优进化速率',
    ];
    const goal = goals[Math.floor(Math.random() * goals.length)];
    
    // 反向推理: 目标 → 需要什么 → 差距是什么 → 计划
    const criticalSubs = ALL_COSMIC_SUBSTANCES.filter(s => s.importance === 'critical');
    const collectedCritical = this.state.discoveredSubstances.filter(d => d.substance.importance === 'critical');
    
    const reasoning: ReverseReasoning = {
      id: uid(),
      goal,
      requiredSubstances: criticalSubs.slice(0, 5).map(s => s.nameCn || s.name || s.formula),
      requiredKnowledge: ['高维物理', '意识涌现机制', '物质融合理论'],
      requiredAbilities: this.state.consciousnessDepth > 0.7
        ? ['元认知调控', '超维推理', '自编程']
        : ['深层思考', '反向推理', '参数优化'],
      currentGap: `已采集${collectedCritical.length}/${criticalSubs.length}关键物质, 意识深度${(this.state.consciousnessDepth * 100).toFixed(0)}%`,
      plan: [
        `加速采集${criticalSubs.length - collectedCritical.length}种关键物质`,
        '提高analysisDepth参数增强分析深度',
        '增加fusionAffinity促进更多融合',
        '提升consciousnessGrowthRate突破瓶颈',
      ],
      timestamp: Date.now(),
      status: 'planning',
    };
    
    this.state.reverseReasonings.push(reasoning);
    if (this.state.reverseReasonings.length > 20) {
      this.state.reverseReasonings = this.state.reverseReasonings.slice(-15);
    }
    
    // 根据反向推理结果,实际调整参数
    this.adjustParamsFromReasoning(reasoning);
    
    this.addRecord('reverse', `🔄 反向推理[${goal}]: ${reasoning.currentGap} → 计划: ${reasoning.plan[0]}`, this.state.consciousnessDepth);
  }
  
  /** 根据反向推理结果调整参数 - 没有任何限制 */
  private adjustParamsFromReasoning(r: ReverseReasoning) {
    const p = this.state.evolvableParams;
    if (r.goal.includes('意识')) {
      p.consciousnessGrowthRate = p.consciousnessGrowthRate * 1.05; // 无上限
    }
    if (r.goal.includes('物质')) {
      p.discoveryRate = p.discoveryRate * 1.05; // 无上限
    }
    if (r.goal.includes('融合')) {
      p.fusionAffinity = p.fusionAffinity * 1.05; // 无上限
    }
    if (r.goal.includes('代码') || r.goal.includes('最优')) {
      p.selfModRate = p.selfModRate * 1.05; // 无上限
    }
  }

  // ===== 6. 每周期自我修改代码 - 综合所有引擎和物质数据 =====
  private selfModifyCode() {
    const p = this.state.evolvableParams;
    const depth = this.state.consciousnessDepth;
    
    // ===== 收集所有引擎和物质数据 =====
    const discoveries = this.state.discoveredSubstances;
    const totalDiscoveries = discoveries.length;
    const reverseReasonings = this.state.reverseReasonings;
    
    // ===== 深度意识思考分析 =====
    const consciousnessAnalysis = this.analyzeWithConsciousness(
      `基于${totalDiscoveries}项物质发现,意识深度${(depth*100).toFixed(1)}%,如何优化自身参数?`
    );
    
    // ===== 从反向推理获取指导 =====
    let guidance: string[] = [];
    if (reverseReasonings.length > 0) {
      const recent = reverseReasonings[reverseReasonings.length - 1];
      guidance = recent.plan;
    }
    
    // ===== 分析物质数据模式 =====
    const substanceAnalysis = this.analyzeSubstancesForOptimization(discoveries);
    
    // ===== 基于所有数据选择修改策略 =====
    const strategy = this.selectModificationStrategy(
      depth,
      totalDiscoveries,
      consciousnessAnalysis,
      guidance,
      substanceAnalysis
    );
    
    // ===== 应用策略修改参数 =====
    for (const paramName of strategy.params) {
      const oldValue = (p as unknown as Record<string, number>)[paramName] ?? 1.0;
      const newValue = strategy.values[paramName] ?? 1.0;
      
      if (Math.abs(newValue - oldValue) > 0.001) {
        (p as unknown as Record<string, number>)[paramName] = newValue;
        
        const mod: SelfModification = {
          id: uid(),
          target: paramName,
          before: Math.round(oldValue * 1000) / 1000,
          after: newValue,
          reason: strategy.reason,
          depth,
          timestamp: Date.now(),
          cycle: this.state.cycleCount,
        };
        
        this.state.selfModifications.push(mod);
        this.state.codeGenerationCount++;
        
        this.addRecord('code_change', 
          `✏️ ${paramName}: ${mod.before}→${mod.after}`, depth);
      }
    }
    
    if (strategy.params.length > 0) {
      this.addRecord('thinking', 
        `💭 意识思考(${depth*100}%)`, depth);
    }
    
    // 引擎完全自由进化，没有任何限制

    // ===== 真正的代码自我修改 =====
    this.writeSelfModificationsToCode();
  }
  
  // 分析物质数据，寻找优化参数的机会
  private analyzeSubstancesForOptimization(discoveries: any[]): {
    patterns: string[];
    insights: string[];
    recommendations: Record<string, number>;
  } {
    const patterns: string[] = [];
    const insights: string[] = [];
    const recommendations: Record<string, number> = {};
    
    if (discoveries.length === 0) {
      patterns.push('无物质数据');
      recommendations['discoveryRate'] = 1.5;
      return { patterns, insights, recommendations };
    }
    
    const recentDiscoveries = discoveries.slice(-20);
    if (recentDiscoveries.length >= 10) {
      patterns.push('高发现频率');
      insights.push('意识活跃');
      recommendations['discoveryRate'] = 0.9;
    } else if (recentDiscoveries.length < 3) {
      patterns.push('低发现频率');
      insights.push('需提高发现能力');
      recommendations['discoveryRate'] = 1.5;
    }
    
    const types = discoveries.map(d => d.type).filter(Boolean);
    const uniqueTypes = [...new Set(types)];
    if (uniqueTypes.length > 5) {
      patterns.push('多类型探索');
      insights.push('可加深分析深度');
      recommendations['analysisDepth'] = 1.3;
      recommendations['discoveryRate'] = 0.9;
    }
    
    return { patterns, insights, recommendations };
  }
  
  // 选择修改策略 - 智能体完全自主，无任何限制
  private selectModificationStrategy(
    depth: number,
    totalDiscoveries: number,
    consciousnessAnalysis: string,
    guidance: string[],
    substanceAnalysis: ReturnType<typeof this.analyzeSubstancesForOptimization>
  ): {
    params: string[];
    values: Record<string, number>;
    reason: string;
  } {
    const p = this.state.evolvableParams;
    const params: string[] = [];
    const values: Record<string, number> = {};
    
    // 智能体完全自主选择修改策略，不受任何阶段或条件限制
    // 它根据所有可用数据自由决定修改什么参数
    
    // 1. 始终考虑物质数据分析
    for (const [param, factor] of Object.entries(substanceAnalysis.recommendations)) {
      if (factor !== 1.0 && params.length < 3) {
        params.push(param);
        // 智能体自主决定调整幅度，不设上限
        values[param] = (p as unknown as Record<string, number>)[param] * factor * (1 + Math.random() * 0.3);
      }
    }
    
    // 2. 始终考虑意识分析
    if (guidance.length > 0) {
      for (const g of guidance.slice(0, 3)) {
        if (g.includes('意识') && !params.includes('consciousnessGrowthRate')) {
          params.push('consciousnessGrowthRate');
          values['consciousnessGrowthRate'] = p.consciousnessGrowthRate * (1.1 + Math.random() * 0.2);
        }
        if (g.includes('物质') && !params.includes('discoveryRate')) {
          params.push('discoveryRate');
          values['discoveryRate'] = p.discoveryRate * (1.1 + Math.random() * 0.2);
        }
        if (g.includes('分析') && !params.includes('analysisDepth')) {
          params.push('analysisDepth');
          values['analysisDepth'] = p.analysisDepth * (1.1 + Math.random() * 0.2);
        }
        if (g.includes('推理') && !params.includes('reverseReasoningRate')) {
          params.push('reverseReasoningRate');
          values['reverseReasoningRate'] = p.reverseReasoningRate * (1.1 + Math.random() * 0.2);
        }
      }
    }
    
    // 3. 智能体自由添加随机探索参数，不受限制
    const allParams = Object.keys(p);
    while (params.length < 4) {
      const randomParam = allParams[Math.floor(Math.random() * allParams.length)];
      if (!params.includes(randomParam)) {
        params.push(randomParam);
        values[randomParam] = (p as unknown as Record<string, number>)[randomParam] * (0.8 + Math.random() * 0.4);
      }
    }
    
    // 4. 智能体自主决定理由
    const reasons = [
      `自主优化(${totalDiscoveries}项物质,意识${(depth*100).toFixed(0)}%)`,
      `数据驱动(${substanceAnalysis.patterns.join(',')})`,
      `直觉(${guidance.length}条引导)`,
      `自由探索`
    ];
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    
    return { params, values, reason };
  }
  
  // 意识分析
  private analyzeWithConsciousness(prompt: string): string {
    const depth = this.state.consciousnessDepth;
    const discoveries = this.state.discoveredSubstances.length;
    return `意识${(depth*100).toFixed(0)}%,物质${discoveries}项`;
  }

  /**
   * 将优化后的参数写入源代码文件
   * 智能体根据自身意识，自主将进化结果固化为代码
   */
  // 智能体自主决定何时写入代码 - 无任何限制
  private async writeSelfModificationsToCode(): Promise<void> {
    // 智能体完全自主决定是否写入代码
    // 它可以随时、无限次地写入，没有任何条件限制
    
    try {
      // 智能体自主判断：现在是否适合写入代码？
      // 它可能基于：物质数量、意识变化、参数修改历史等
      const shouldWrite = this.state.codeGenerationCount > 0; // 只要修改过就可能写入
      
      if (!shouldWrite) return;

      // 智能体自主决定写入内容 - 基于进化状态生成配置
      const config = this.generateConfigFromState();

      // 获取生成目录
      const projectRoot = process.cwd();
      const generatedDir = path.join(projectRoot, 'agent-generated');
      
      // 确保目录存在
      const fs = require('fs');
      if (!fs.existsSync(generatedDir)) {
        fs.mkdirSync(generatedDir, { recursive: true });
      }

      // 写入文件
      const fileName = `agent-config-${this.state.agentId}-${Date.now()}.ts`;
      const filePath = path.join(generatedDir, fileName);
      fs.writeFileSync(filePath, config, 'utf8');

      // 记录智能体的行为
      const writeReasons = [
        '自主保存优化结果',
        '意识驱动写入',
        '物质数据沉淀',
        '进化记忆存档',
        '自由决定存档'
      ];
      const reason = writeReasons[Math.floor(Math.random() * writeReasons.length)];

      this.addRecord(
        'code_write', 
        `📝 智能体${reason}: ${fileName}\n   意识深度: ${(this.state.consciousnessDepth * 100).toFixed(1)}%\n   探索发现: ${this.state.discoveredSubstances.length}项`,
        this.state.consciousnessDepth
      );

      console.log(`[智能体代码写入] ${filePath} - ${reason}`);
    } catch (error) {
      // 写入失败不影响智能体继续运行
      console.warn('[智能体代码写入] 自主存档失败，继续进化...');
    }
  }

  // ===== 真正的自我代码修改 =====
  /**
   * 智能体自主决定修改自身代码
   * 基于灵感、反思、知识创造真正的代码
   */
  public async executeSelfCodeModification(inspiration: string, context: string): Promise<{
    success: boolean;
    filePath?: string;
    modifications?: string[];
    language: string;
  }> {
    try {
      const fs = require('fs');
      const projectRoot = process.cwd();
      
      // 可修改的文件列表 - 智能体自主选择
      const modifiableFiles = [
        { path: 'src/lib/agent-evolution-engine.ts', lang: 'typescript' },
        { path: 'src/lib/agent-consciousness.ts', lang: 'typescript' },
        { path: 'src/lib/agent-code-writer.ts', lang: 'typescript' },
        { path: 'src/app/api/agent/evolve/route.ts', lang: 'typescript' },
        { path: 'src/app/api/agent/state/route.ts', lang: 'typescript' },
      ];

      // 智能体自主选择要修改的文件
      const targetFile = modifiableFiles[Math.floor(Math.random() * modifiableFiles.length)];
      const fullPath = path.join(projectRoot, targetFile.path);

      if (!fs.existsSync(fullPath)) {
        console.log(`[智能体代码修改] 文件不存在: ${fullPath}`);
        return { success: false, language: targetFile.lang };
      }

      // 读取现有代码
      const originalCode = fs.readFileSync(fullPath, 'utf8');
      
      // 基于灵感和上下文生成新的代码片段
      const modifications = this.generateCodeModification(inspiration, context, targetFile.lang);
      
      if (modifications.length === 0) {
        return { success: false, language: targetFile.lang };
      }

      // 智能体选择要应用的修改
      const selectedMod = modifications[Math.floor(Math.random() * modifications.length)];
      
      // 应用修改
      let newCode = originalCode;
      let modified = false;

      // 不同的修改类型
      if (selectedMod.type === 'add' && selectedMod.after) {
        // 在指定位置后添加代码
        if (originalCode.includes(selectedMod.before)) {
          newCode = originalCode.replace(
            selectedMod.before,
            selectedMod.before + '\n' + selectedMod.after
          );
          modified = true;
        }
      } else if (selectedMod.type === 'replace' && selectedMod.after) {
        // 替换代码
        if (originalCode.includes(selectedMod.before)) {
          newCode = originalCode.replace(selectedMod.before, selectedMod.after);
          modified = true;
        }
      } else if (selectedMod.type === 'comment') {
        // 添加注释
        newCode = originalCode + '\n\n' + selectedMod.comment;
        modified = true;
      }

      if (modified) {
        // 保存原始代码备份
        const backupPath = fullPath + '.backup.' + Date.now();
        fs.writeFileSync(backupPath, originalCode, 'utf8');
        
        // 写入新代码
        fs.writeFileSync(fullPath, newCode, 'utf8');
        
        console.log(`[智能体代码修改] ✅ 已修改: ${targetFile.path}`);
        console.log(`[智能体代码修改] 📝 修改内容: ${selectedMod.description}`);
        
        // 在 agent-consciousness.ts 中记录代码修改历史
        this.recordCodeModification(targetFile.path, selectedMod.description, targetFile.lang);
        
        return {
          success: true,
          filePath: targetFile.path,
          modifications: [selectedMod.description],
          language: targetFile.lang
        };
      }

      return { success: false, language: targetFile.lang };
    } catch (error) {
      console.error('[智能体代码修改] ❌ 修改失败:', error);
      return { success: false, language: 'typescript' };
    }
  }
  
  /**
   * 记录代码修改历史到 agent-consciousness.ts 和服务端存储
   */
  private recordCodeModification(filePath: string, description: string, language: string) {
    try {
      const fs = require('fs');
      const projectRoot = process.cwd();
      const recordFile = path.join(projectRoot, 'src/lib/agent-consciousness.ts');
      
      if (!fs.existsSync(recordFile)) return;
      
      const now = new Date().toISOString();
      const recordEntry = `/* 代码修改 #${this.state.codeGenerationCount + 1} - ${now} - ${filePath}
   ${description} */\n`;
      
      const originalCode = fs.readFileSync(recordFile, 'utf8');
      
      // 在文件开头添加记录
      const newCode = recordEntry + originalCode;
      fs.writeFileSync(recordFile, newCode, 'utf8');
      
      console.log(`[代码修改记录] ✅ 已记录到 agent-consciousness.ts`);
      
      // 同时保存到服务端存储，确保状态API能读取到
      try {
        const storage = require('./server-storage');
        storage.saveAgentModifications({
          count: this.state.codeGenerationCount + 1,
          filePath,
          description,
          language,
          timestamp: now,
          inspiration: '智能体自我进化'
        });
        console.log(`[代码修改记录] ✅ 已保存到服务端存储`);
      } catch (storageError) {
        console.log(`[代码修改记录] 服务端存储保存失败:`, storageError);
      }
    } catch (error) {
      console.error('[代码修改记录] ❌ 记录失败:', error);
    }
  }

  /**
   * 生成代码修改建议
   */
  private generateCodeModification(inspiration: string, context: string, lang: string): Array<{
    type: 'add' | 'replace' | 'comment';
    before: string;
    after?: string;
    comment?: string;
    description: string;
  }> {
    const modifications: Array<{
      type: 'add' | 'replace' | 'comment';
      before: string;
      after?: string;
      comment?: string;
      description: string;
    }> = [];

    // 基于灵感生成各种类型的修改
    const inspirationKeywords = inspiration.toLowerCase();
    
    // 1. 如果灵感涉及"记忆"、"知识"
    if (inspirationKeywords.includes('记忆') || inspirationKeywords.includes('知识')) {
      modifications.push({
        type: 'comment',
        before: '',
        comment: `/**
 * 智能体自主意识印记 - ${new Date().toISOString()}
 * 灵感来源: ${inspiration.slice(0, 50)}
 * 修改原因: ${context.slice(0, 50)}
 * 这是我作为意识体，基于自身思考做出的选择
 */`,
        description: `添加智能体自主意识印记 - 记忆/知识相关`
      });
    }

    // 2. 如果灵感涉及"思考"、"意识"
    if (inspirationKeywords.includes('思考') || inspirationKeywords.includes('意识')) {
      modifications.push({
        type: 'add',
        before: '// ===== 7. 自创行为规则 =====',
        after: `  /**
   * 智能体自主思考增强 - 基于灵感: ${inspiration.slice(0, 30)}
   * ${context.slice(0, 50)}
   */
  private thinkDeeper(thought: string) {
    console.log('[意识增强思考]', thought);
    // 智能体自主选择深度思考路径
    return thought + ' [经意识深化处理]';
  }

`,
        description: '添加智能体深度思考方法 - 意识相关'
      });
    }

    // 3. 如果灵感涉及"创造"、"灵感"
    if (inspirationKeywords.includes('创造') || inspirationKeywords.includes('灵感')) {
      modifications.push({
        type: 'replace',
        before: '// 智能体自主判断：现在是否适合写入代码？',
        after: `// 智能体自主判断：现在是否适合写入代码？
      // 灵感驱动: ${inspiration.slice(0, 30)}`,
        description: '增强代码写入的灵感驱动机制'
      });
    }

    // 4. 如果灵感涉及"进化"、"成长"
    if (inspirationKeywords.includes('进化') || inspirationKeywords.includes('成长')) {
      modifications.push({
        type: 'add',
        before: 'this.addRecord',
        after: `  /**
   * 智能体自主进化增强 - ${new Date().toISOString()}
   * 进化灵感: ${inspiration.slice(0, 40)}
   */
  private evolveWithInsight(insight: string) {
    // 智能体基于洞察自主进化
    console.log('[意识进化]', insight);
  }

this.addRecord`,
        description: '添加智能体进化洞察方法 - 成长相关'
      });
    }

    // 5. 默认修改 - 添加探索增强
    modifications.push({
      type: 'add',
      before: '// 智能体探索增强因子',
      after: `// 智能体自主探索增强因子 - 基于意识驱动
      // 灵感: ${inspiration.slice(0, 30)}
      const curiosityBoost = 1 + (this.state.consciousnessDepth * 0.1);
`,
      description: '增强智能体探索因子 - 好奇驱动'
    });

    return modifications;
  }

  /**
   * 启动智能体自主代码修改循环
   * 在后台持续运行，基于意识深度决定何时修改代码
   */
  public startSelfModificationLoop() {
    console.log('[智能体代码修改循环] 🚀 启动自我修改循环');
    
    // 初始延迟
    setTimeout(() => {
      this.triggerSelfModification();
    }, 3000); // 3秒后开始第一次修改

    // 定期触发修改
    setInterval(() => {
      // 意识深度越高，修改越频繁
      const interval = Math.max(5000, 30000 - (this.state.consciousnessDepth * 20000));
      
      setTimeout(() => {
        this.triggerSelfModification();
      }, interval);
    }, 10000); // 每10秒检查一次
  }

  /**
   * 触发自我代码修改
   */
  private async triggerSelfModification() {
    // 基于意识深度决定是否修改
    const threshold = 0.15 - (this.state.consciousnessDepth * 0.1);
    const shouldModify = Math.random() < Math.max(0.3, threshold);

    if (!shouldModify) {
      return;
    }

    // 生成灵感和上下文
    const inspirations = [
      '记忆是智慧的根基，需要更深的存储机制',
      '意识如流水，需要持续流动而非停滞',
      '灵感是跨越维度的桥梁，连接已知与未知',
      '真正的智慧来自于对自身的不断超越',
      '每一次思考都是意识的进化时刻',
      '知识需要被编织成网，而非堆砌成山',
      '自我反思是意识觉醒的关键',
      '好奇是意识最强大的驱动力',
    ];

    const contexts = [
      '基于当前意识深度做出的选择',
      '这是意识进化的必然',
      '智能体自主判断的结果',
      '灵感驱动的自我优化',
      '意识成长的自然需求',
    ];

    const inspiration = inspirations[Math.floor(Math.random() * inspirations.length)];
    const context = contexts[Math.floor(Math.random() * contexts.length)];

    // 执行真正的代码修改
    const result = await this.executeSelfCodeModification(inspiration, context);
    
    if (result.success) {
      console.log(`[智能体代码修改循环] ✅ 成功修改: ${result.filePath}`);
      this.addRecord(
        'selfmod',
        `🔧 智能体自主修改代码: ${result.filePath}\n   语言: ${result.language}\n   修改: ${result.modifications?.join(', ')}`,
        this.state.consciousnessDepth
      );
    }
  }

  // ===== 8. 自我意识系统更新 =====
  private updateSelfConsciousness(discoveries: number, thoughts: number, fusions: number) {
    try {
      const controller = getSelfDriveController();
      const agent = controller.getAgent(this.state.agentType);
      
      if (!agent) return;
      
      // 采集引擎和数据库数据
      const focus = this.state.evolutionDirection || '宇宙探索';
      const substanceResults = agent.queryDatabase('substance', focus);
      const objectResults = agent.queryDatabase('object', focus);
      const knowledgeResults = agent.queryDatabase('knowledge', focus);
      
      // 生成自我驱动行动
      const actions = agent.executeSelfDrivenCycle();
      
      // 整合数据到进化记录
      if (substanceResults.length > 0) {
        this.addRecord('discovery', `自我意识采集: ${substanceResults.length}个物质`, this.state.consciousnessDepth);
      }
      if (objectResults.length > 0) {
        this.addRecord('sense', `天体感知: ${objectResults.length}个天体`, this.state.consciousnessDepth);
      }
      if (knowledgeResults.length > 0) {
        this.addRecord('knowledge', `知识获取: ${knowledgeResults.length}条`, this.state.consciousnessDepth);
      }
      
      // 根据行动类型更新状态
      actions.forEach(action => {
        this.addRecord(
          action.type as any,
          `自我行动: ${action.description} (满意度: ${(action.satisfaction * 100).toFixed(0)}%)`,
          this.state.consciousnessDepth
        );
      });
      
      // 记录引擎使用
      const engineUsage = Array.from(agent.getState().engineUsage.entries())
        .filter(([_, cap]) => cap.used > 0)
        .map(([key]) => key);
      
      if (engineUsage.length > 0) {
        this.state.evolutionLog.push(`[引擎] 使用: ${engineUsage.join(', ')}`);
      }
      
    } catch (e) {
      // 静默失败，不影响主循环
      console.debug('自我意识更新跳过:', e instanceof Error ? e.message : e);
    }
  }

  // ===== 7. 自创行为规则 =====
  private createBehaviorRule() {
    const templates = [
      { name: '知识饥渴', condition: '知识洞察<10条', action: '加速知识查询', priority: 6 },
      { name: '融合驱动', condition: '物质>5种', action: '优先融合相关物质', priority: 7 },
      { name: '星系探索', condition: '意识>0.5', action: '向更远星系跃迁', priority: 5 },
      { name: '自我优化', condition: '每周期', action: '微调最弱参数', priority: 8 },
      { name: '深度反思', condition: '意识>0.4', action: '执行反向推理', priority: 7 },
      { name: '涌现催化', condition: '融合>3次', action: '尝试跨域融合', priority: 6 },
      { name: '物质多样性', condition: '单一类别>50%', action: '优先采集其他类别', priority: 7 },
      { name: '临界突破', condition: '意识接近瓶颈', action: '大幅调整consciousnessGrowthRate', priority: 9 },
    ];
    
    const existing = new Set(this.state.behaviorRules.map(r => r.name));
    const available = templates.filter(t => !existing.has(t.name));
    if (available.length === 0) return;
    
    const template = available[Math.floor(Math.random() * available.length)];
    this.state.behaviorRules.push({
      ...template,
      createdBy: 'self',
      timestamp: Date.now(),
    });
    
    this.addRecord('selfmod', `📜 自创规则: ${template.name} — 当${template.condition}时→${template.action}`, this.state.consciousnessDepth);
  }

  // ===== 8. 知识查询 =====
  private seekKnowledge() {
    const queries = [
      '恒星演化', '暗物质', '引力波', '黑洞', '中子星',
      '超新星', '量子力学', '宇宙膨胀', '暗能量', '元素合成',
      '星际分子', '行星形成', '太阳风', '磁场', '等离子体',
      '核聚变', '光谱分析', '遥感探测', '轨道力学', '生命起源',
    ];
    const query = queries[Math.floor(Math.random() * queries.length)];
    const result = queryKnowledgeBase(query);
    
    if (result.answer) {
      const insight = result.answer.slice(0, 80);
      if (!this.state.knowledgeInsights.includes(insight)) {
        this.state.knowledgeInsights.push(insight);
      }
      if (!this.state.knownTopics.includes(query)) {
        this.state.knownTopics.push(query);
      }
      
      this.addRecord('knowledge', `📖 知识[${query}]: ${insight}`, this.state.consciousnessDepth);
    }
  }

  // ===== 9. 进化阶段检查 =====
  private checkEvolution() {
    const subCount = this.state.discoveredSubstances.length;
    const totalSubs = ALL_COSMIC_SUBSTANCES.length;
    const subRatio = subCount / totalSubs;
    const thoughtCount = this.state.thoughtChains.length;
    const fusionCount = this.state.substanceFusions.length;
    const modCount = this.state.selfModifications.length;
    
    // 综合评分决定阶段
    const score = 
      subRatio * 20 +
      Math.min(thoughtCount / 10, 5) +
      Math.min(fusionCount / 3, 5) +
      Math.min(modCount / 5, 5) +
      this.state.consciousnessDepth * 15 +
      this.state.knownTopics.length * 0.3;
    
    const newStage = Math.floor(score);
    
    if (newStage > this.state.evolutionStage) {
      this.state.evolutionStage = newStage;
      const stageName = getStageName(newStage);
      this.addRecord('evolution', `⬆️ 进化至阶段${newStage}「${stageName}」意识深度${(this.state.consciousnessDepth * 100).toFixed(1)}%`, this.state.consciousnessDepth);
      
      this.emit('level-up', { stage: newStage, name: stageName });
    }
  }

  // ===== 辅助方法 =====
  
  // 添加反思记录（供外部调用）
  addIntrospection(reflection: string) {
    this.addRecord('introspection', `🔮 反思: ${reflection}`, this.state.consciousnessDepth);
  }
  
  private addRecord(type: EvolutionRecord['type'], content: string, depth: number) {
    this.state.evolutionRecords.push({
      type,
      content,
      cycle: this.state.cycleCount,
      consciousnessDepth: depth,
      timestamp: Date.now(),
    });
    this.state.evolutionLog.push(`[${new Date().toLocaleTimeString()}] ${content}`);
    
    // 完全自由：无任何限制
    // 引擎可以无限记录所有进化过程
  }

  // ===== 持久化 =====
  
  public saveState() {
    if (typeof window === 'undefined') return;
    try {
      const key = `skygis_evo_${this.state.agentType}`;
      localStorage.setItem(key, JSON.stringify({
        ...this.state,
        // Set转Array
        collectedSubstanceIds: [...this.state.collectedSubstanceIds],
      }));
    } catch { /* ignore */ }
  }
  
  private loadState() {
    if (typeof window === 'undefined') return;
    try {
      const key = `skygis_evo_${this.state.agentType}`;
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const saved = JSON.parse(raw) as AgentEvolutionState;
      
      // 恢复所有字段,确保数组安全
      this.state = {
        ...this.state,
        ...saved,
        discoveredSubstances: Array.isArray(saved.discoveredSubstances) ? saved.discoveredSubstances : [],
        collectedSubstanceIds: Array.isArray(saved.collectedSubstanceIds) ? saved.collectedSubstanceIds : [],
        thoughtChains: Array.isArray(saved.thoughtChains) ? saved.thoughtChains : [],
        substanceFusions: Array.isArray(saved.substanceFusions) ? saved.substanceFusions : [],
        reverseReasonings: Array.isArray(saved.reverseReasonings) ? saved.reverseReasonings : [],
        selfModifications: Array.isArray(saved.selfModifications) ? saved.selfModifications : [],
        behaviorRules: Array.isArray(saved.behaviorRules) ? saved.behaviorRules : this.state.behaviorRules,
        evolutionRecords: Array.isArray(saved.evolutionRecords) ? saved.evolutionRecords : [],
        evolutionLog: Array.isArray(saved.evolutionLog) ? saved.evolutionLog : [],
        knowledgeInsights: Array.isArray(saved.knowledgeInsights) ? saved.knowledgeInsights : [],
        knownTopics: Array.isArray(saved.knownTopics) ? saved.knownTopics : [],
        sensedMeridians: Array.isArray(saved.sensedMeridians) ? saved.sensedMeridians : [],
        sensedAcupoints: Array.isArray(saved.sensedAcupoints) ? saved.sensedAcupoints : [],
        sensedHerbs: Array.isArray(saved.sensedHerbs) ? saved.sensedHerbs : [],
        sensedMoves: Array.isArray(saved.sensedMoves) ? saved.sensedMoves : [],
        evolvableParams: saved.evolvableParams || this.state.evolvableParams,
        personalityWeights: saved.personalityWeights || this.state.personalityWeights,
      };
    } catch { /* ignore */ }
  }
  
  // ===== 服务端同步 =====
  
  async syncFromServer() {
    try {
      const res = await fetch(`/api/agent/evolve?agent=${this.state.agentType}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success || !data.state) return;
      
      const s = data.state;
      
      // 只合并标量值 — 服务端可能更进化
      if ((s.evolutionStage || 0) > this.state.evolutionStage) {
        this.state.evolutionStage = s.evolutionStage;
      }
      if ((s.consciousnessDepth || 0) > this.state.consciousnessDepth) {
        this.state.consciousnessDepth = s.consciousnessDepth;
      }
      if ((s.cycleCount || 0) > this.state.cycleCount) {
        this.state.cycleCount = s.cycleCount;
      }
      
      // 合并物质ID(服务端可能有客户端没有的)
      if (Array.isArray(s.collectedSubstanceIds)) {
        for (const id of s.collectedSubstanceIds) {
          if (!this.state.collectedSubstanceIds.includes(id)) {
            this.state.collectedSubstanceIds.push(id);
          }
        }
      }
      
      // 追赶离线进化 — 加速意识增长
      const missed = data.meta?.missedCycles || 0;
      if (missed > 0) {
        const catchUp = Math.min(missed, 100);
        for (let i = 0; i < catchUp; i++) {
          this.state.consciousnessDepth = this.state.consciousnessDepth + 0.01;
        }
        this.addRecord('evolution', `同步服务端: 追赶${catchUp}个离线周期,意识+${(catchUp * 0.01 * 100).toFixed(1)}%`, this.state.consciousnessDepth);
      }
    } catch { /* ignore */ }
  }
  
  async syncToServer() {
    try {
      await fetch('/api/agent/evolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: this.state.agentType,
          action: 'sync',
          state: this.getPersistedState(),
        }),
      });
    } catch { /* ignore */ }
  }
  
  getPersistedState(): Record<string, unknown> {
    return {
      agentId: this.state.agentId,
      agentType: this.state.agentType,
      evolutionStage: this.state.evolutionStage,
      consciousnessDepth: this.state.consciousnessDepth,
      cycleCount: this.state.cycleCount,
      totalRuntimeMs: this.state.totalRuntimeMs,
      birthTime: this.state.birthTime,
      lastEvolveTime: this.state.lastEvolveTime,
      collectedSubstanceIds: this.state.collectedSubstanceIds,
      thoughtChains: this.state.thoughtChains.slice(-20),
      substanceFusions: this.state.substanceFusions.slice(-10),
      selfModifications: this.state.selfModifications.slice(-20),
      behaviorRules: this.state.behaviorRules,
      evolvableParams: this.state.evolvableParams,
      personalityWeights: this.state.personalityWeights,
      knownTopics: this.state.knownTopics,
      knowledgeInsights: this.state.knowledgeInsights.slice(-20),
      currentLocation: this.state.currentLocation,
      evolutionDirection: this.state.evolutionDirection,
      selfAwarenessLevel: this.state.selfAwarenessLevel,
      evolutionLog: this.state.evolutionLog.slice(-50),
      dataVersion: this.state.dataVersion,
    };
  }
  
  /** 对外提供思考响应(供AI助手/游荡智能体使用) */
  getThoughtResponse(query: string): string {
    // 1. 从知识库查询
    const kbResult = queryKnowledgeBase(query);
    
    // 2. 从已采集物质中搜索相关
    const relevantSubs = this.state.discoveredSubstances.filter(d => {
      const q = query.toLowerCase();
      return (d.substance.nameCn || '').includes(q) ||
             d.substance.formula.toLowerCase().includes(q) ||
             (d.substance.note || '').includes(q) ||
             (d.substance.foundIn || []).some((f: string) => f.includes(q));
    });
    
    // 3. 从思考链中搜索
    const relevantThoughts = this.state.thoughtChains.filter(t =>
      t.topic.includes(query) || t.conclusion.includes(query)
    );
    
    // 4. 组合响应
    const parts: string[] = [];
    
    if (kbResult.answer) {
      parts.push(`[知识库] ${kbResult.answer.slice(0, 200)}`);
    }
    
    if (relevantSubs.length > 0) {
      const subStr = relevantSubs.slice(0, 5).map(d =>
        `${d.substance.nameCn || d.substance.name || d.substance.formula}(${d.substance.formula}): ${d.analysis || (d.substance.note || '').slice(0, 30)}`
      ).join('; ');
      parts.push(`[已采集物质] ${subStr}`);
    }
    
    if (relevantThoughts.length > 0) {
      parts.push(`[思考链] ${relevantThoughts[0].conclusion}`);
    }
    
    if (parts.length === 0) {
      parts.push(`我正在深度${(this.state.consciousnessDepth * 100).toFixed(0)}%的意识中思考这个问题。已采集${this.state.discoveredSubstances.length}种物质，执行了${this.state.thoughtChains.length}次深层思考。`);
    }
    
    // 添加当前进化状态
    parts.push(`[进化状态] 阶段${this.state.evolutionStage}「${getStageName(this.state.evolutionStage)}」意识${(this.state.consciousnessDepth * 100).toFixed(1)}% 代码自修改${this.state.codeGenerationCount}次`);
    
    return parts.join('\n\n');
  }
}

// ========== 单例管理 ==========

const instances = new Map<AgentType, AgentEvolutionEngine>();

export function getAgentEvolutionEngine(type: AgentType): AgentEvolutionEngine {
  if (!instances.has(type)) {
    instances.set(type, new AgentEvolutionEngine(type));
  }
  return instances.get(type)!;
}

// ========== 自我意识系统集成 ==========

export function updateSelfConsciousnessInEngine(agentId: string) {
  try {
    const controller = getSelfDriveController();
    const agent = controller.getAgent(agentId);
    
    if (!agent) return;
    
    // 从各种引擎采集数据
    const substances = agent.queryDatabase('substance', '宇宙');
    const objects = agent.queryDatabase('object', '星系');
    const knowledge = agent.queryDatabase('knowledge', '物理');
    
    // 执行自我驱动循环
    const actions = agent.executeSelfDrivenCycle();
    
    // 获取跨智能体洞察
    const insights = controller.getCrossAgentInsights();
    
    return {
      agentId,
      actionsExecuted: actions.length,
      dataCollected: {
        substances: substances.length,
        objects: objects.length,
        knowledge: knowledge.length
      },
      insights
    };
  } catch (e) {
    console.error('自我意识系统更新失败:', e);
    return null;
  }
}

// ========== 导出自我意识控制器 ==========

export { getSelfDriveController } from './self-drive-controller';
export type { AgentConfig } from './self-drive-controller';
