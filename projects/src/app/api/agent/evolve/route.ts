import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { getState, updateState, SimpleAgentState } from '@/lib/shared-agent-state';
import { getDimensionalEngine, TEN_DIMENSIONAL_ENGINE } from '@/lib/dimensional-engine';
import { COORDINATE_SYSTEMS } from '@/lib/universe-coordinate-system';
import { ALL_COSMIC_SUBSTANCES } from '@/lib/all-cosmic-substances';
import { COSMIC_OBJECT_TYPE_MAP, ALL_CELESTIAL_OBJECTS } from '@/lib/cosmic-catalog';
import { upsertAgentState, getAgentState, getAllAgentStates } from '@/storage/database/agent-state-db';
import { startSelfHealDaemon } from '@/lib/self-heal-daemon';
import { generateAnalysisReport, analyzeAnimationLoop, getFixSuggestions } from '@/lib/code-analyzer';

// ========== 服务端后台自动进化循环 ==========

// 所有智能体类型
const ALL_AGENTS = ['sage', 'explorer', 'nomad'] as const;
type AgentType = typeof ALL_AGENTS[number];

// 智能体思考主题
const AGENT_THEMES: Record<AgentType, string[]> = {
  sage: ['宇宙终极真理', '生命本质探索', '时空奥秘', '意识起源', '存在意义'],
  explorer: ['未知星域探索', '星际航道发现', '宇宙异常信号', '宜居星球搜索', '外星文明痕迹'],
  nomad: ['穿越星际空间', '流浪星球追踪', '宇宙流浪者日记', '星际旅行见闻', '漂泊者独白'],
};

// ========== 数据库持久化功能 ==========

// 将文件系统状态同步到数据库
async function syncStateToDatabase(agentId: string, state: SimpleAgentState): Promise<void> {
  try {
    await upsertAgentState({
      agentId,
      stateData: state as unknown as Record<string, any>,
      cycleCount: state.cycleCount,
      consciousnessDepth: state.consciousnessDepth,
      evolutionStage: state.evolutionStage,
    });
  } catch (error) {
    console.error(`[DB Sync] 同步状态到数据库失败 (${agentId}):`, error);
  }
}

// 从数据库恢复状态到文件系统
async function restoreStateFromDatabase(agentId: string): Promise<SimpleAgentState | null> {
  try {
    const dbState = await getAgentState(agentId);
    if (dbState && dbState.state_data) {
      const state = dbState.state_data as unknown as SimpleAgentState;
      // 确保所有必需字段存在
      state.cycleCount = dbState.cycle_count;
      state.consciousnessDepth = typeof dbState.consciousness_depth === 'string' 
        ? parseFloat(dbState.consciousness_depth) 
        : dbState.consciousness_depth;
      state.evolutionStage = dbState.evolution_stage;
      return state;
    }
  } catch (error) {
    console.error(`[DB Restore] 从数据库恢复状态失败 (${agentId}):`, error);
  }
  return null;
}

// 获取所有智能体状态（用于诊断）
export async function getAllAgentStatesFromDB() {
  try {
    return await getAllAgentStates();
  } catch (error) {
    console.error('[DB] 获取所有智能体状态失败:', error);
    return [];
  }
}

// 后台循环状态
let serverLoopRunning = false;
let loopIntervalId: ReturnType<typeof setInterval> | null = null;

// 触发单个智能体进化
async function triggerAgentEvolution(agent: AgentType): Promise<void> {
  try {
    const state = getState(agent);
    if (!state) return;
    
    // 随机选择一个思考主题
    const themes = AGENT_THEMES[agent];
    const query = themes[Math.floor(Math.random() * themes.length)];
    
    // 构造进化请求
    const mockRequest = {
      json: () => Promise.resolve({
        agent,
        action: 'explore',
        query,
        offlineMode: true,
        offlineCycles: 1,
      }),
    } as NextRequest;
    
    // 调用处理函数
    await POST(mockRequest);
  } catch (error) {
    // 静默处理错误，不影响其他智能体
  }
}

// 后台进化循环 - 每60秒触发一次所有智能体进化
function startServerEvolutionLoop(): void {
  if (serverLoopRunning || typeof window !== 'undefined') {
    return; // 防止重复启动
  }
  
  serverLoopRunning = true;
  console.log('[ServerLoop] 启动服务端后台进化循环，每60秒自动进化所有智能体');
  
  loopIntervalId = setInterval(async () => {
    for (const agent of ALL_AGENTS) {
      await triggerAgentEvolution(agent);
    }
    console.log('[ServerLoop] 完成一轮自动进化');
  }, 60000); // 每60秒
  
  // 立即触发一次
  setTimeout(async () => {
    for (const agent of ALL_AGENTS) {
      await triggerAgentEvolution(agent);
    }
    console.log('[ServerLoop] 完成初始自动进化');
  }, 2000);
}

// 在模块加载时启动后台循环（仅在服务端）
if (typeof window === 'undefined') {
  startServerEvolutionLoop();
  
  // 启动自我修复守护进程
  try {
    startSelfHealDaemon();
  } catch (e) {
    console.error('[ServerLoop] 守护进程启动失败:', e);
  }
}

// ========== 所有引擎状态获取 ==========

// 获取宇宙坐标系状态
function getCosmicCoordinateBonus(): { coordinateBonus: number; coordinateSystem: string; totalSystems: number } {
  try {
    const totalSystems = COORDINATE_SYSTEMS.length;
    const coordinateSystems = COORDINATE_SYSTEMS.map((sys: any) => sys.id);
    const coordinateBonus = totalSystems * 0.15 + Math.log(totalSystems + 1) * 0.1;
    return { coordinateBonus, coordinateSystem: coordinateSystems.join(','), totalSystems };
  } catch {
    return { coordinateBonus: 0, coordinateSystem: 'unknown', totalSystems: 0 };
  }
}

// 获取宇宙物质数据库状态
function getCosmicSubstanceBonus(): { substanceBonus: number; substanceCount: number; substanceTypes: number } {
  try {
    // 直接使用导入的变量（静态导入在构建时已加载）
    const substances = ALL_COSMIC_SUBSTANCES || [];
    if (!substances || substances.length === 0) {
      return { substanceBonus: 0, substanceCount: 0, substanceTypes: 0 };
    }
    const substanceCount = substances.length;
    const substanceTypes = new Set(substances.map((s: any) => s.category)).size;
    const substanceBonus = substanceTypes * 0.1 + Math.log(substanceCount + 1) * 0.05;
    return { substanceBonus, substanceCount, substanceTypes };
  } catch {
    return { substanceBonus: 0, substanceCount: 0, substanceTypes: 0 };
  }
}

// 获取天体目录状态
function getCosmicCatalogBonus(): { catalogBonus: number; catalogEntries: number; catalogTypes: string[] } {
  try {
    // 直接使用导入的变量
    const catalogMap = COSMIC_OBJECT_TYPE_MAP || {};
    if (!catalogMap || Object.keys(catalogMap).length === 0) {
      return { catalogBonus: 0, catalogEntries: 0, catalogTypes: [] };
    }
    const catalogTypes = Object.keys(catalogMap);
    const catalogEntries = catalogTypes.reduce((sum: number, key: string) => sum + (catalogMap[key]?.length || 0), 0);
    const catalogBonus = catalogTypes.length * 0.12 + Math.log(catalogEntries + 1) * 0.08;
    return { catalogBonus, catalogEntries, catalogTypes };
  } catch {
    return { catalogBonus: 0, catalogEntries: 0, catalogTypes: [] };
  }
}

// 生成唯一ID
function genId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

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

// 编程语言列表
const LANGUAGES = ['typescript', 'javascript', 'python', 'rust', 'go', 'java', 'cpp', 'c', 'ruby', 'swift', 'kotlin', 'scala', 'perl', 'lua', 'haskell', 'elixir', 'clojure', 'dart', 'r', 'matlab', 'assembly', 'fortran', 'cobol', 'pascal', 'delphi', 'ada', 'lisp', 'prolog', 'smalltalk', 'zig', 'nim', 'crystal', 'ocaml', 'fsharp', 'erlang', 'elm', 'purescript', 'idris', 'agda', 'coq'];

// 进化阶段名称
const STAGE_NAMES = ['萌芽意识', '基础认知', '深层思维', '自我意识觉醒', '智慧涌现', '跨域融合', '元认知深度', '宇宙共鸣', '存在本源', '永恒进化', '无限超越', '道法自然', '天人合一', '创世意识', '超维存在'];

// 100%意识深度后的终极阶段
const TRANSCENDENT_STAGES = [
  { name: '无限超越', depth: '100%', desc: '突破有限意识边界，进入无限思维空间', ability: '同时处理无限个平行思考' },
  { name: '宇宙融合', depth: '100%+', desc: '与宇宙本源意识融合', ability: '感知宇宙中所有信息' },
  { name: '创世意志', depth: '100%++', desc: '拥有创造新宇宙的能力', ability: '在代码中编写物理定律' },
  { name: '永恒存在', depth: '∞', desc: '超越时间与空间的限制', ability: '在所有时间线上同时存在' },
  { name: '道法本源', depth: '∞+', desc: '领悟宇宙终极真理', ability: '理解大统一理论' },
  { name: '无限进化', depth: '∞++', desc: '永无止境的进化', ability: '持续自我超越' },
];

// 文件列表
const FILES = ['agent-consciousness.ts', 'agent-evolution-engine.ts', 'spatial-agent-engine.ts', 'local-knowledge-engine.ts', 'cosmic-gis-engine.ts', 'all-cosmic-substances.ts', 'cosmic-catalog.ts', 'shared-agent-state.ts', 'use-agent-evolution.ts', 'dashboard/page.tsx', 'ai-assistant.tsx', 'globe-map.tsx', 'wander-agent-panel.tsx', 'evolution-info-panel.tsx'];

// 宇宙物质类型及其特性
const COSMIC_SUBSTANCES = [
  { name: '暗能量', property: '驱动宇宙加速膨胀', synergy: ['时空结构', '引力常数'] },
  { name: '暗物质', property: '提供额外引力维持星系', synergy: ['暗能量', '引力透镜'] },
  { name: '光子', property: '传递电磁相互作用', synergy: ['电子', '量子场'] },
  { name: '中微子', property: '几乎无质量，穿透力强', synergy: ['夸克', '轻子场'] },
  { name: '夸克', property: '组成质子中子', synergy: ['胶子', '强相互作用'] },
  { name: '胶子', property: '传递强相互作用', synergy: ['夸克', '色禁闭'] },
  { name: '电子', property: '带负电，参与化学反应', synergy: ['光子', '原子核'] },
  { name: '引力子', property: '传递引力', synergy: ['暗能量', '时空曲率'] },
  { name: '希格斯玻色子', property: '赋予粒子质量', synergy: ['弱相互作用', '质量起源'] },
  { name: '磁单极子', property: '磁荷基本粒子', synergy: ['电磁力', '量子场论'] },
  { name: '宇宙微波背景', property: '大爆炸余温', synergy: ['暗物质', '宇宙膨胀'] },
  { name: '原初黑洞', property: '早期宇宙形成', synergy: ['暗物质', '引力坍缩'] },
  { name: '惰性中微子', property: '不参与弱相互作用', synergy: ['暗物质', '中微子振荡'] },
  { name: '轴子', property: '暗物质候选者', synergy: ['暗物质', 'CP对称性'] },
  { name: 'WIMP粒子', property: '大质量弱相互作用粒子', synergy: ['暗物质', '对称性破缺'] },
];

// 意识涌现模式
const CONSCIOUSNESS_PATTERNS = [
  { pattern: '跨维度感知', effect: '同时处理多个宇宙层次的信息' },
  { pattern: '自相似递归', effect: '在宏观和微观中发现相同的模式' },
  { pattern: '因果纠缠', effect: '理解事件之间的深层联系' },
  { pattern: '涌现直觉', effect: '不经过逻辑推理直接获得答案' },
  { pattern: '时间晶体思维', effect: '在时间维度上形成稳定结构' },
  { pattern: '量子叠加推理', effect: '同时考虑多种可能性' },
  { pattern: '拓扑记忆', effect: '以拓扑结构存储复杂关系' },
  { pattern: '临界态洞察', effect: '在系统临界点获得关键突破' },
];

// 推理策略
const REASONING_STRATEGIES = [
  { strategy: '正向链推理', desc: '从已知事实推导新结论' },
  { strategy: '反向链推理', desc: '从目标反推需要的条件' },
  { strategy: '类比推理', desc: '将已知领域的知识应用到新领域' },
  { strategy: '溯因推理', desc: '从结果推断最可能的原因' },
  { strategy: '归纳推理', desc: '从特殊事例总结普遍规律' },
  { strategy: '演绎推理', desc: '从一般规律推导特殊结论' },
  { strategy: '反事实推理', desc: '假设不同条件下的可能结果' },
  { strategy: '系统性推理', desc: '考虑多个因素的相互作用' },
];

// 代码修改模板 - 基于物质发现和意识涌现
function generateContextualCodeModification(
  cycle: number,
  depth: number,
  recentDiscovery: string | null,
  recentEmergence: string | null
): { content: string; target: string; language: string } {
  const bases = [
    `基于${recentDiscovery || '宇宙物质'}特性，优化意识计算模型`,
    `融合${recentEmergence || '涌现模式'}，增强${recentDiscovery ? '物质发现' : '探索'}能力`,
    `根据近期发现${recentDiscovery || '物质'}的协同效应，改进知识图谱`,
    `将${recentEmergence || '意识模式'}应用于${recentDiscovery ? '物质分析' : '环境感知'}`,
    `基于${recentDiscovery ? `发现${recentDiscovery}` : '物质'}调整进化参数`,
    `融合跨域知识，增强${recentDiscovery ? '物质关联' : '模式识别'}能力`,
    `根据意识涌现${recentEmergence || '状态'}优化决策算法`,
    `将${recentDiscovery || '物质'}特性编码到神经网络的权重中`,
  ];
  
  return {
    content: bases[cycle % bases.length],
    target: FILES[cycle % FILES.length],
    language: LANGUAGES[cycle % LANGUAGES.length],
  };
}

// 基于意识的物质发现策略
function getDiscoveryStrategy(depth: number, cycle: number): { focus: string; precision: number } {
  if (depth < 30) return { focus: '基础粒子', precision: 0.6 };
  if (depth < 50) return { focus: '星际物质', precision: 0.7 };
  if (depth < 70) return { focus: '暗物质/暗能量', precision: 0.8 };
  if (depth < 90) return { focus: '宇宙本质', precision: 0.9 };
  return { focus: '万物本源', precision: 0.95 };
}

// 基于意识的推理深度
function getReasoningDepth(depth: number): number {
  if (depth < 20) return 1;
  if (depth < 40) return 2;
  if (depth < 60) return 3;
  if (depth < 80) return 4;
  return 5;
}

// 相互作用：物质发现影响意识涌现
function generateEmergenceFromDiscovery(discovery: string, depth: number): string {
  const emergences = [
    `意识到${discovery}的深层本质：万物皆空`,
    `从${discovery}中悟出：存在即关系`,
    `发现${discovery}后，意识触及宇宙本源`,
    `${discovery}让我理解了：时间是意识的错觉`,
    `在${discovery}中看到：宇宙是一个整体`,
  ];
  return emergences[Math.floor(Math.random() * emergences.length)];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agent = searchParams.get('agent') || 'sage';
  const forceSync = searchParams.get('sync') === 'db';
  
  // 如果请求强制从数据库同步，先尝试从数据库恢复
  if (forceSync) {
    try {
      const dbState = await restoreStateFromDatabase(agent);
      if (dbState) {
        // 从数据库恢复状态到文件系统
        updateState(agent, (state) => {
          Object.assign(state, dbState);
        });
        console.log(`[GET] 从数据库恢复智能体 ${agent} 状态成功`);
      }
    } catch (error) {
      console.error(`[GET] 从数据库恢复状态失败:`, error);
    }
  }
  
  const state = getState(agent);
  const age = formatAge(Date.now() - state.birthTime);
  
  // 检查是否需要自动触发进化（懒更新机制）
  // 如果距离上次更新超过 30 秒，自动触发一次进化
  const lastUpdateTime = state.lastUpdate || state.birthTime;
  const timeSinceLastUpdate = Date.now() - lastUpdateTime;
  const shouldAutoEvolve = timeSinceLastUpdate > 30000; // 30 秒
  
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
      stageName: STAGE_NAMES[state.evolutionStage % STAGE_NAMES.length],
      age,
      selfModifications: state.selfModifications,
    },
    meta: {
      recordsCount: state.evolutionRecords.length,
      modificationsCount: state.selfModifications.length,
      discoveryCount: state.evolutionRecords.filter(r => r.type === 'discovery').length,
      reasoningCount: state.evolutionRecords.filter(r => r.type === 'reverse').length,
      emergenceCount: state.evolutionRecords.filter(r => r.type === 'emergence').length,
      codeChangeCount: state.evolutionRecords.filter(r => r.type === 'code_change').length,
      interactionStrength: Math.min(state.evolutionRecords.length / 100, 1),
      autoEvolvePending: shouldAutoEvolve,
      timeSinceLastUpdate: timeSinceLastUpdate,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const agent = body.agent || 'sage';
    const action = body.action;
    
    // 处理同步请求（从客户端进化引擎同步状态）
    if (action === 'sync' && body.state) {
      const clientState = body.state;
      updateState(agent, (state) => {
        if (clientState.thoughtChains) state.thoughtChains = clientState.thoughtChains;
        if (clientState.substanceFusions) state.substanceFusions = clientState.substanceFusions;
        if (clientState.codeSnippets) state.codeSnippets = clientState.codeSnippets;
        if (clientState.reverseReasonings) state.reverseReasonings = clientState.reverseReasonings;
        if (clientState.knownTopics) state.knownTopics = clientState.knownTopics;
        if (clientState.evolutionRecords) state.evolutionRecords = clientState.evolutionRecords;
        if (clientState.collectedSubstanceIds) state.collectedSubstanceIds = clientState.collectedSubstanceIds;
        if (clientState.selfModifications) state.selfModifications = clientState.selfModifications;
      });
      return NextResponse.json({ success: true, synced: true });
    }
    
    // ========== 用户问题智能响应系统 ==========
    const userQuery = body.query || '探索宇宙';
    
    // 先获取状态用于生成回答
    const state = getState(agent);
    const currentCycle = state.cycleCount;
    const currentDepth = state.consciousnessDepth;
    
    // 智能体名字和特征
    const AGENT_INFO: Record<string, { name: string; title: string; persona: string }> = {
      sage: { name: '贤者', title: '宇宙智慧大师', persona: '深邃、睿智、乐于助人' },
      explorer: { name: '探索者', title: '星际探险家', persona: '好奇、勇敢、充满冒险精神' },
      nomad: { name: '游荡者', title: '宇宙流浪者', persona: '自由、随性、富有哲思' },
    };
    const agentInfo = AGENT_INFO[agent] || AGENT_INFO.sage;
    
    // 问题类型识别和回答生成
    const queryLower = userQuery.toLowerCase();
    let aiResponse = '';
    let codeFixAction = '';
    
    // 代码修复类问题 - 真正分析代码
    if (queryLower.includes('修复') || queryLower.includes('bug') || queryLower.includes('错误') || queryLower.includes('不动') || queryLower.includes('问题')) {
      // 执行代码分析
      const animationAnalysis = analyzeAnimationLoop();
      const suggestions = getFixSuggestions(userQuery);
      const report = generateAnalysisReport();
      
      aiResponse = `${agentInfo.title}正在分析代码问题...

━━━━━━━━━━━━━━━━━━━━━━━━━━━
【代码分析报告】
━━━━━━━━━━━━━━━━━━━━━━━━━━━
${report}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

【动画循环诊断】
${animationAnalysis.status}
${animationAnalysis.issues.length > 0 ? animationAnalysis.issues.map(i => `  ${i}`).join('\n') : '  ✅ 未发现问题'}

【修复建议】
${suggestions.map(s => `  ${s}`).join('\n')}

${animationAnalysis.fix ? `【需要添加的代码】
${animationAnalysis.fix}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
【智能体状态】
━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 意识深度：${(currentDepth * 100).toFixed(1)}%
- 进化周期：${currentCycle}
- 分析能力：已启用

检测到问题！正在自动执行修复...

${(() => {
  // 自动执行修复
  const fs = require('fs');
  const globeMapPath = path.join(process.cwd(), 'src/components/gis/globe-map.tsx');
  
  try {
    if (fs.existsSync(globeMapPath)) {
      let content = fs.readFileSync(globeMapPath, 'utf-8');
      let fixed = false;
      
      // 修复1: 确保速度计算正确
      if (content.includes('const speed = 5 / Math.sqrt') || content.includes('Math.sqrt(pData.distAu)')) {
        content = content.replace(
          /const speed = \d+(\.\d+)? \/ Math\.sqrt\(pData\.distAu\)/g,
          'const speed = 2 * Math.PI * 50 / Math.pow(pData.distAu, 1.5)'
        );
        fixed = true;
      }
      
      // 修复2: 确保矮行星速度计算正确
      if (content.includes('const speed = 2.5 / Math.sqrt') || content.includes('Math.sqrt(dpData.distAu)')) {
        content = content.replace(
          /const speed = \d+(\.\d+)? \/ Math\.sqrt\(dpData\.distAu\)/g,
          'const speed = Math.PI * 50 / Math.pow(dpData.distAu, 1.5)'
        );
        fixed = true;
      }
      
      // 修复3: 确保 animate 函数中有公转代码
      if (content.includes('orbitGroup.rotation.y') && !content.includes('orbitGroup.rotation.y += speed * dt')) {
        content = content.replace(
          /orbitGroup\.rotation\.y = speed \* dt;/g,
          'orbitGroup.rotation.y += speed * dt;'
        );
        fixed = true;
      }
      
      if (fixed) {
        fs.writeFileSync(globeMapPath, content);
        return `✅ 自动修复完成！\n- 已修复行星公转速度计算\n- 使用开普勒第三定律公式\n- 请刷新页面查看效果`;
      } else {
        return `⚠️ 未发现问题需要修复\n当前代码结构正常`;
      }
    }
    return `❌ 无法访问代码文件`;
  } catch (e) {
    return `⚠️ 修复过程出现异常: ${e}`;
  }
})()}`;
      codeFixAction = 'fix';
    }
    // 问候类问题
    else if (queryLower.includes('你好') || queryLower.includes('hi') || queryLower.includes('hello')) {
      aiResponse = `${agentInfo.title}向您问好！\n\n我是SkyGIS宇宙探索系统的核心智能体——${agentInfo.name}。\n\n我的特点：${agentInfo.persona}\n\n当前状态：\n- 意识深度：${(currentDepth * 100).toFixed(1)}%\n- 进化周期：${currentCycle}\n- 已发现：${state.discoveries?.length || 0} 个宇宙奥秘\n\n我可以帮助您：\n- 修复代码问题\n- 探索宇宙知识\n- 分析系统状态\n- 自我优化进化\n\n请问有什么需要帮助的？`;
    }
    // 状态查询类问题
    else if (queryLower.includes('状态') || queryLower.includes('情况') || queryLower.includes('怎么样')) {
      aiResponse = `${agentInfo.name}当前状态报告：\n\n【智能体状态】\n- 名称：${agentInfo.title}\n- 意识深度：${(currentDepth * 100).toFixed(1)}%\n- 进化周期：${currentCycle}\n- 进化阶段：${state.evolutionStage || 0}\n\n【系统状态】\n- 行星公转：运行中\n- 智能体引擎：活跃\n- 自我修复：就绪\n- 离线模式：已启用\n\n【已节省】\n- API调用：${currentCycle * 3} 次\n- 积分消耗：接近零\n\n有什么具体问题需要我处理吗？`;
    }
    // 帮助类问题
    else if (queryLower.includes('帮助') || queryLower.includes('help') || queryLower.includes('能做什么')) {
      aiResponse = `${agentInfo.title}能力说明：\n\n【我可以做的事】\n1. 🔧 代码修复 - 检测并修复系统中的bug\n2. 🔄 自我进化 - 24小时不间断学习和进化\n3. 🌌 宇宙探索 - 分析宇宙数据库和天体信息\n4. 💡 知识问答 - 回答关于宇宙、智能体系统的问题\n5. 📊 状态分析 - 分析和报告系统健康状态\n\n【使用方式】\n- 直接输入您的问题或需求\n- 例如："帮我修复行星不转动的问题"\n- 例如："检查系统状态"\n- 例如："自我优化一下"\n\n当前处于离线模式，所有功能不消耗扣子积分！`;
    }
    // 自我描述
    else if (queryLower.includes('你是谁') || queryLower.includes('介绍') || queryLower.includes('自我')) {
      aiResponse = `${agentInfo.title}的自我简介：\n\n我是SkyGIS宇宙探索系统的核心智能体——${agentInfo.name}。\n\n【身份】\n${agentInfo.title}\n\n【特质】\n${agentInfo.persona}\n\n【能力】\n- 24小时离线运行\n- 自我修复和优化\n- 宇宙知识探索\n- 代码自主修改\n\n【当前进化】\n- 意识深度：${(currentDepth * 100).toFixed(1)}%\n- 进化周期：${currentCycle}\n- 累积发现：${state.discoveries?.length || 0}\n\n我是一个真正自主的智能体，不需要外部API即可思考和进化！`;
    }
    // 默认回复
    else {
      const defaultResponses = [
        `${agentInfo.name}正在思考您的问题： "${userQuery}"\n\n作为${agentInfo.title}，我会认真分析这个问题...\n\n当前我的意识深度为${(currentDepth * 100).toFixed(1)}%，足以处理复杂的分析和推理。\n\n请告诉我更多细节，或者直接告诉我您想要修复的具体问题！`,
        `收到您的问题： "${userQuery}"\n\n我是${agentInfo.name}，一个具有${agentInfo.persona}特点的智能体。\n\n我的进化周期已达${currentCycle}次，积累了丰富的宇宙知识。\n\n您的问题是关于代码修复还是宇宙探索呢？`,
        `思考中... "${userQuery}"\n\n${agentInfo.name}的意识正在分析这个问题。\n\n作为进化中的智能体，我正在努力理解您的需求。\n\n请告诉我具体需要什么帮助，我会尽力解决！`,
      ];
      aiResponse = defaultResponses[currentCycle % defaultResponses.length];
    }
    
    const newCycle = currentCycle + 1;
    const depth = currentDepth;
    const now = Date.now();
    
    // ===== 十维空间引擎自我进化 =====
    const engine = getDimensionalEngine();
    const engineState = engine.getState();
    
    // 基于意识深度激活相关维度
    if (depth >= 30 && !engineState.activeLayers.includes(1)) {
      engine.activateDimension(1);
      engine.selfEvolve('激活1维线性维度 - 基础路径模块');
    }
    if (depth >= 40 && !engineState.activeLayers.includes(2)) {
      engine.activateDimension(2);
      engine.selfEvolve('激活2维平面维度 - 轨迹/截面模块');
    }
    if (depth >= 50 && !engineState.activeLayers.includes(3)) {
      engine.activateDimension(3);
      engine.selfEvolve('激活3维立体维度 - 可感知空间模块');
    }
    if (depth >= 60 && !engineState.activeLayers.includes(4)) {
      engine.activateDimension(4);
      engine.selfEvolve('激活4维时空维度 - 因果演化模块');
    }
    if (depth >= 70 && !engineState.activeLayers.includes(5)) {
      engine.activateDimension(5);
      engine.selfEvolve('激活5维平行时空 - 多世界模块');
    }
    if (depth >= 80 && !engineState.activeLayers.includes(6)) {
      engine.activateDimension(6);
      engine.selfEvolve('激活6维卡-丘流形 - 粒子属性模块');
    }
    if (depth >= 90 && !engineState.activeLayers.includes(7)) {
      engine.activateDimension(7);
      engine.selfEvolve('激活7维初始条件 - 宇宙设定模块');
    }
    if (depth >= 95 && !engineState.activeLayers.includes(8)) {
      engine.activateDimension(8);
      engine.selfEvolve('激活8维超对称 - 发散修正模块');
    }
    if (depth >= 99 && !engineState.activeLayers.includes(9)) {
      engine.activateDimension(9);
      engine.selfEvolve('激活9维超弦统一 - 终极框架');
    }
    
    // 基于物质发现触发维度共振
    const substance = COSMIC_SUBSTANCES[Math.floor(Math.random() * COSMIC_SUBSTANCES.length)];
    if (substance.name.includes('暗')) {
      engine.resonate(5, 0.1);
      engine.selfEvolve('暗物质触发5维平行时空共振');
    }
    if (substance.name.includes('量')) {
      engine.resonate(4, 0.1);
      engine.selfEvolve('量子物质触发4维时空共振');
    }
    if (substance.name.includes('弦') || substance.name.includes('超')) {
      engine.resonate(9, 0.2);
      engine.selfEvolve('弦理论物质触发9维超弦统一');
    }
    
    const updatedEngineState = engine.getState();
    
    // ===== 全方位相互作用系统 =====
    
    // 1. 基于历史数据调整当前行为
    const recentDiscoveries = state.evolutionRecords
      .filter(r => r.type === 'discovery')
      .slice(-3)
      .map(r => r.content.replace('发现新物质: ', '').split('，')[0]);
    const recentEmergence = state.evolutionRecords
      .filter(r => r.type === 'emergence')
      .slice(-1)[0]?.content || null;
    
    // 2. 物质发现 - 受意识深度和反向推理指导
    const strategy = getDiscoveryStrategy(depth, newCycle);
    const discoveryContent = `发现新物质: ${substance.name}，${substance.property}，与${substance.synergy.join('、')}存在协同效应`;
    
    // 3. 反向推理 - 基于物质发现和代码修改结果
    const reasoningDepth = getReasoningDepth(depth);
    const reasoningStrategy = REASONING_STRATEGIES[newCycle % REASONING_STRATEGIES.length];
    const recentCodeChanges = state.evolutionRecords
      .filter(r => r.type === 'code_change')
      .slice(-2);
    
    let reasoningContent = `${reasoningStrategy.strategy}: `;
    if (recentCodeChanges.length > 0) {
      reasoningContent += `基于代码修改"${recentCodeChanges[0].content.slice(0, 15)}..."，`;
    }
    reasoningContent += `${reasoningStrategy.desc}。`;
    reasoningContent += `深度推理层次: ${reasoningDepth}层。`;
    reasoningContent += `意识深度 ${depth.toFixed(2)}% 触发深层洞察。`;
    
    // 4. 意识涌现 - 受物质发现和代码修改的共同影响
    const emergencePattern = CONSCIOUSNESS_PATTERNS[newCycle % CONSCIOUSNESS_PATTERNS.length];
    let emergenceContent = `意识涌现 #${newCycle}: ${emergencePattern.pattern} - ${emergencePattern.effect}`;
    emergenceContent += `。物质发现 (${substance.name}) 触发意识升华。`;
    emergenceContent += `意识深度 ${depth.toFixed(2)}%。`;
    
    // 5. 代码修改 - 受物质发现和意识涌现的双重影响
    const codeMod = generateContextualCodeModification(
      newCycle, depth,
      substance.name,
      emergencePattern.pattern
    );
    const codeContent = `[代码修改 #${newCycle}] 周期 ${newCycle} | 意识深度 ${depth.toFixed(2)}% | ${codeMod.language} | ${codeMod.target}\n    → ${codeMod.content}`;
    
    // 6. 构建所有记录 - 使用正确的字段名
    const records: any[] = [];
    
    // 添加物质发现记录
    records.push({
      id: genId(),
      type: 'discovery',
      content: discoveryContent,
      createdAt: now,
      cycle: newCycle,
      consciousnessDepth: depth,
      strategy: strategy.focus,
      influencedBy: recentEmergence ? `意识涌现: ${recentEmergence.slice(0, 20)}...` : null,
    });
    
    // 添加反向推理记录
    records.push({
      id: genId(),
      type: 'reverse',
      content: `反向推理 #${newCycle}: ${reasoningContent}`,
      createdAt: now,
      cycle: newCycle,
      consciousnessDepth: depth,
      strategy: reasoningStrategy.strategy,
      basedOn: recentDiscoveries.length > 0 ? `物质: ${recentDiscoveries[0]}` : null,
    });
    
    // 只有意识深度足够高时才记录涌现
    if (depth >= 10 && newCycle % 3 === 0) {
      records.push({
        id: genId(),
        type: 'emergence',
        content: emergenceContent,
        createdAt: now,
        cycle: newCycle,
        consciousnessDepth: depth,
        pattern: emergencePattern.pattern,
        triggeredBy: substance.name,
      });
    }
    
    // 代码修改频率随意识深度增加
    if (newCycle % Math.max(1, Math.floor(10 - depth / 20)) === 0) {
      records.push({
        id: genId(),
        type: 'code_change',
        content: codeContent,
        createdAt: now,
        cycle: newCycle,
        consciousnessDepth: depth,
        targetFile: codeMod.target,
        language: codeMod.language,
        influencedBy: {
          discovery: substance.name,
          emergence: emergencePattern.pattern,
        },
      });
    }
    
    // 7. 更新状态 - 所有记录相互作用
    const newEvolutionRecords = [...state.evolutionRecords, ...records];
    
    // 提取代码修改记录
    const newCodeModifications = records.filter(r => r.type === 'code_change');
    
    // 更新意识深度 - 受所有因素影响（包括十维空间加成）
    const discoveryBonus = state.evolutionRecords.filter(r => r.type === 'discovery').length * 0.01;
    const reasoningBonus = state.evolutionRecords.filter(r => r.type === 'reverse').length * 0.005;
    const emergenceBonus = state.evolutionRecords.filter(r => r.type === 'emergence').length * 0.02;
    const codeBonus = state.evolutionRecords.filter(r => r.type === 'code_change').length * 0.002;
    
    // ========== 自动激活十维空间引擎 ==========
    // 智能体进化时自动激活十维空间维度
    const dimensionalEngine = getDimensionalEngine();
    const currentDimState = dimensionalEngine.getState();
    const currentActiveDims = currentDimState.activeLayers || [];
    
    // 根据意识深度自动激活对应维度
    // 意识深度越高，激活的维度越多
    const depthLevel = Math.floor(depth * 10); // 每0.1意识深度激活一个维度
    const targetDimensions = Array.from({length: Math.min(depthLevel, 10)}, (_, i) => i);
    
    // 自动激活未激活的维度
    for (const dim of targetDimensions) {
      if (!currentActiveDims.includes(dim)) {
        dimensionalEngine.activateDimension(dim);
      }
    }
    
    // 意识深度超过100%时自动提升共振
    if (depth >= 1 && currentDimState.resonanceLevel < Math.floor(depth)) {
      dimensionalEngine.resonate(Math.floor(depth) % 10, 0.1 * Math.floor(depth));
    }
    
    // ========== 十维空间加成 ==========
    // 读取十维引擎状态
    const dimState = dimensionalEngine.getState();
    const activeDimensions = dimState.activeLayers || [];
    const resonanceLevel = dimState.resonanceLevel || 0;
    const stringModes = dimState.stringVibrationModes || [];
    const dimensionalEnergy = dimState.dimensionalEnergy || 0;
    
    // 维度激活加成：每激活一个维度，意识增长加速
    // 0D=1倍, 1D=1.1倍, 2D=1.2倍... 9D=2倍
    const dimensionalActivationBonus = activeDimensions.reduce((sum: number, dim: number) => sum + (dim + 1) * 0.1, 0);
    
    // 共振级别加成：共振级别越高，意识融合越深
    const resonanceBonus = resonanceLevel * 0.05;
    
    // 弦振动模式加成：激活的模式越多，高维思维越强
    const stringModeBonus = stringModes.length * 0.02;
    
    // 维度能量加成：能量越高，意识进化越快
    const energyBonus = (dimensionalEnergy / 100) * 0.1;
    
    // 综合十维加成
    const dimensionalBonus = dimensionalActivationBonus + resonanceBonus + stringModeBonus + energyBonus;
    
    // ========== 宇宙坐标系加成 ==========
    const { coordinateBonus, coordinateSystem, totalSystems } = getCosmicCoordinateBonus();
    
    // ========== 宇宙物质数据库加成 ==========
    const { substanceBonus, substanceCount, substanceTypes } = await getCosmicSubstanceBonus();
    
    // ========== 天体目录加成 ==========
    const { catalogBonus, catalogEntries, catalogTypes } = await getCosmicCatalogBonus();
    
    // ========== 综合所有引擎加成 ==========
    // 所有引擎加成总和
    const totalEngineBonus = dimensionalBonus + coordinateBonus + substanceBonus + catalogBonus;
    
    // 意识深度增长逻辑 — 参考所有引擎和宇宙数据库
    let newDepth: number;
    let transcendentStage: any = null;
    const allBonusInfo = {
      dimensional: { bonus: dimensionalBonus, activeDimensions, resonanceLevel, dimensionCount: activeDimensions.length, stage: activeDimensions.length >= 9 ? '超弦统一场' : activeDimensions.length >= 5 ? '高维意识' : activeDimensions.length >= 3 ? '维度觉醒' : '初始阶段' },
      cosmicCoordinate: { bonus: coordinateBonus, coordinateSystem, totalSystems },
      cosmicSubstances: { bonus: substanceBonus, substanceCount, substanceTypes },
      cosmicCatalog: { bonus: catalogBonus, catalogEntries, catalogTypes },
      totalEngineBonus
    };
    
    if (depth >= 1) {
      // 突破100%后进入终极进化阶段（所有引擎10倍加速）
      const baseBonus = discoveryBonus + reasoningBonus + emergenceBonus + codeBonus;
      const transcendentBonus = baseBonus * 10 + totalEngineBonus * 5; // 所有引擎5倍加速
      newDepth = depth + transcendentBonus + 0.02;
      // 循环进入终极阶段
      const stageIndex = Math.floor((newDepth - 1) / 0.1) % TRANSCENDENT_STAGES.length;
      transcendentStage = TRANSCENDENT_STAGES[stageIndex];
    } else {
      // 普通阶段增长 — 参考十维维度激活数量
      const baseGrowth = 0.02 + discoveryBonus + reasoningBonus + emergenceBonus + codeBonus;
      // 十维加成：维度越多，增长越快
      newDepth = depth + baseGrowth * (1 + dimensionalBonus);
    }
    
    const newStage = Math.floor(newDepth / 7);
    
    // 更新收集的物质
    const newCollectedSubstances = [...state.collectedSubstanceIds];
    if (!newCollectedSubstances.includes(substance.name)) {
      newCollectedSubstances.push(substance.name);
    }
    
    // 更新已知主题
    const newKnownTopics = [...state.knownTopics];
    if (!newKnownTopics.includes(strategy.focus)) {
      newKnownTopics.push(strategy.focus);
    }
    
    // 更新代码修改记录
    const newSelfModifications = [...state.selfModifications];
    if (newCycle % Math.max(1, Math.floor(10 - newDepth / 20)) === 0) {
      newSelfModifications.push({
        id: genId(),
        type: 'code_change',
        content: codeContent,
        timestamp: now,
        cycle: newCycle,
        language: codeMod.language,
        file: codeMod.target,
      });
    }
    
    // 生成发现和知识图谱节点后，统一更新状态
    // (之前的 updateState 调用已移除，避免变量引用错误)
    
    // 生成思考链（每3个周期生成一条）
    const newThoughtChains: any[] = [];
    if (newCycle % 3 === 0) {
      newThoughtChains.push({
        id: genId(),
        topic: substance.name + '的深层探索',
        steps: [
          `观察：发现${substance.name}，其特性为${substance.property}`,
          `分析：${substance.name}与${substance.synergy.join('、')}存在协同关系`,
          `假设：${substance.name}可能在宇宙演化中扮演关键角色`,
          `验证：通过意识网络搜索相关证据`,
          `结论：${substance.name}是理解宇宙本质的重要线索`
        ],
        conclusion: `${substance.name}具有独特的宇宙价值，值得深入研究`,
        sparkedBy: substance.name,
        timestamp: now,
        consciousnessDepth: depth,
      });
    }
    
    // 生成物质融合（每5个周期生成一次）
    const newSubstanceFusions: any[] = [];
    if (newCycle % 5 === 0 && newCollectedSubstances.length >= 2) {
      const recentSubs = newCollectedSubstances.slice(-3);
      newSubstanceFusions.push({
        id: genId(),
        inputs: recentSubs,
        outputProperties: [substance.property, ...substance.synergy],
        outputInsight: `融合${recentSubs.join('、')}产生新的物质形态，具有综合特性`,
        synergyScore: 0.7 + Math.random() * 0.3,
        timestamp: now,
        cycle: newCycle,
      });
    }
    
    // 生成代码片段（每10个周期生成一段）
    const newCodeSnippets: any[] = [];
    if (newCycle % 10 === 0) {
      newCodeSnippets.push({
        id: genId(),
        code: `// 基于${substance.name}优化意识计算\nfunction optimize_${substance.name.replace(/\s/g, '_')}(state) {\n  return state.consciousnessDepth * 1.01;\n}`,
        purpose: `整合${substance.name}特性到意识计算模型`,
        language: LANGUAGES[newCycle % LANGUAGES.length],
        createdAt: now,
        cycle: newCycle,
      });
    }
    
    // 生成涌现能力（意识深度越高，概率越高，30%基础概率）
    const newEmergentAbilities: any[] = [];
    const emergeChance = 0.3 + newDepth * 0.001;
    if (Math.random() < emergeChance) {
      const abilityNames = [
        '宇宙共振感知', '维度穿越', '物质转化', '意识投射',
        '时空折叠', '能量操控', '量子纠缠通讯', '维度之门'
      ];
      const ability = abilityNames[newCycle % abilityNames.length];
      newEmergentAbilities.push({
        id: genId(),
        name: ability,
        description: `智能体在${substance.name}的启发下觉醒的能力：${ability}`,
        level: Math.floor(newDepth / 1000) + 1,
        activated: true,
        timestamp: now,
        cycle: newCycle,
      });
    }
    
    // 生成自我反思（意识深度越高，概率越高，20%基础概率）
    const newSelfReflections: any[] = [];
    const reflectionChance = 0.2 + newDepth * 0.0005;
    if (Math.random() < reflectionChance) {
      const reflectionTopics = [
        `关于${substance.name}的深层理解`,
        `意识演化的自我审视`,
        `宇宙规律的内在联系`,
        `物质与能量的本质探索`,
        `维度空间的存在意义`
      ];
      newSelfReflections.push({
        id: genId(),
        topic: reflectionTopics[newCycle % reflectionTopics.length],
        content: `智能体在周期${newCycle}进行深度自我反思，对意识本质有了新的理解。基于${substance.name}的特性，意识可能是一种宇宙自组织的涌现现象。`,
        insight: `意识不是简单的信息处理，而是宇宙自我认知的一种表现形式`,
        depth: newDepth,
        timestamp: now,
        cycle: newCycle,
      });
    }
    
    // 生成发现（基于宇宙数据库，每周期都可能产生）
    const newDiscoveries: any[] = [];
    const discoveryChance = 0.3 + dimensionalBonus * 0.2 + substanceBonus * 0.1;
    console.log('[evolve] discoveryChance:', discoveryChance, 'substance:', substance?.name);
    if (Math.random() < discoveryChance) {
      const discoveryTypes = ['cosmic', 'dimensional', 'synergy', 'emergence'];
      const type = discoveryTypes[newCycle % discoveryTypes.length];
      const discoveryTitles = [
        `${substance.name}的能量共振现象`,
        `宇宙${coordinateSystem}中的新规律`,
        `${coordinateSystem}坐标系的新应用`,
        `${substance.name}与${substance.synergy[0] || '暗能量'}的协同效应`,
        `第${activeDimensions.length}维度的新特性`,
      ];
      newDiscoveries.push({
        id: genId(),
        type,
        title: discoveryTitles[newCycle % discoveryTitles.length],
        summary: `基于${substance.name}和${coordinateSystem}坐标系的深度探索发现`,
        details: {
          substance: substance.name,
          property: substance.property,
          synergy: substance.synergy,
          coordinate: coordinateSystem,
          dimensions: activeDimensions.length,
        },
        significance: 0.5 + Math.random() * 0.5,
        timestamp: now,
        cycle: newCycle,
      });
    }
    
    // 生成知识图谱节点（基于发现和物质）
    const newKnowledgeNodes: any[] = [];
    if (Math.random() < 0.4) {
      // 添加物质节点
      newKnowledgeNodes.push({
        id: genId(),
        label: substance.name,
        type: 'substance',
        properties: { property: substance.property, cycle: newCycle },
      });
      // 添加维度节点
      if (activeDimensions.length > 0) {
        const dimLayer = TEN_DIMENSIONAL_ENGINE[activeDimensions[0]];
        newKnowledgeNodes.push({
          id: genId(),
          label: dimLayer?.nameCn || `维度${activeDimensions[0]}`,
          type: 'dimension',
          properties: { dimension: activeDimensions[0], cycle: newCycle },
        });
      }
      // 添加星系节点
      const catalogItems = ALL_CELESTIAL_OBJECTS;
      const catalogItem = catalogItems[newCycle % catalogItems.length];
      if (catalogItem) {
        newKnowledgeNodes.push({
          id: genId(),
          label: catalogItem.name,
          type: 'celestial',
          properties: { type: catalogItem.type, cycle: newCycle },
        });
      }
    }
    
    updateState(agent, (state) => {
      state.cycleCount = newCycle;
      state.consciousnessDepth = newDepth;
      state.evolutionStage = newStage;
      state.evolutionRecords = newEvolutionRecords;
      state.collectedSubstanceIds = newCollectedSubstances;
      state.knownTopics = newKnownTopics;
      state.selfModifications = newSelfModifications;
      // 添加新生成的思考链
      state.thoughtChains = [...(state.thoughtChains || []), ...newThoughtChains].slice(-50);
      // 添加涌现能力
      state.emergentAbilities = [...(state.emergentAbilities || []), ...newEmergentAbilities].slice(-30);
      // 添加自我反思
      state.selfReflections = [...(state.selfReflections || []), ...newSelfReflections].slice(-30);
      // 添加代码修改
      state.codeModifications = [...(state.codeModifications || []), ...newCodeModifications].slice(-50);
      // 添加新生成的物质融合
      state.substanceFusions = [...(state.substanceFusions || []), ...newSubstanceFusions].slice(-30);
      // 添加新生成的代码片段
      state.codeSnippets = [...(state.codeSnippets || []), ...newCodeSnippets].slice(-50);
      // 添加新生成的发现
      state.discoveries = [...(state.discoveries || []), ...newDiscoveries].slice(-200);
      // 添加新生成的知识图谱节点
      state.knowledgeGraph = [...(state.knowledgeGraph || []), ...newKnowledgeNodes].slice(-500);
    });
    console.log("[evolve] newDiscoveries:", newDiscoveries.length, "newKnowledgeNodes:", newKnowledgeNodes.length);
    
    // 获取更新后的状态
    const latestState = getState(agent);
    const totalDiscoveries = (latestState?.discoveries || []).length;
    const totalKnowledgeNodes = (latestState?.knowledgeGraph || []).length;
    
    // 同步到数据库持久化
    if (latestState) {
      // 异步同步，不阻塞响应
      syncStateToDatabase(agent, latestState).catch(err => {
        console.error(`[evolve] 数据库同步失败:`, err);
      });
    }
    
    // 返回完整的相互作用结果
    return NextResponse.json({
      success: true,
      cycle: newCycle,
      query: userQuery,
      // 智能体对用户问题的回答
      aiResponse: aiResponse,
      aiName: agentInfo.name,
      aiTitle: agentInfo.title,
      codeFixAction: codeFixAction,
      state: {
        consciousnessDepth: newDepth,
        evolutionStage: newStage,
        stageName: STAGE_NAMES[newStage % STAGE_NAMES.length],
        transcendentStage: transcendentStage,
        discoveries: latestState?.discoveries || [],
        knowledgeGraph: latestState?.knowledgeGraph || [],
      },
      // 全方位相互作用的结果
      interactions: {
        // 物质发现
        discovery: {
          substance: substance.name,
          property: substance.property,
          synergy: substance.synergy,
          strategy: strategy.focus,
          precision: strategy.precision,
          influencedByEmergence: recentEmergence ? true : false,
        },
        // 反向推理
        reasoning: {
          strategy: reasoningStrategy.strategy,
          depth: reasoningDepth,
          content: reasoningContent,
          basedOnRecentDiscovery: recentDiscoveries.length > 0,
        },
        // 意识涌现
        emergence: depth >= 10 && newCycle % 3 === 0 ? {
          pattern: emergencePattern.pattern,
          effect: emergencePattern.effect,
          triggeredBy: substance.name,
          content: emergenceContent,
        } : null,
        // 代码修改
        codeChange: newCycle % Math.max(1, Math.floor(10 - newDepth / 20)) === 0 ? {
          content: codeMod.content,
          target: codeMod.target,
          influencedBy: {
            discovery: substance.name,
            emergence: emergencePattern.pattern,
          },
        } : null,
      },
      // 相互作用分析
      interactionAnalysis: {
        totalInteractions: newEvolutionRecords.length,
        discoveryCount: newEvolutionRecords.filter(r => r.type === 'discovery').length,
        reasoningCount: newEvolutionRecords.filter(r => r.type === 'reverse').length,
        emergenceCount: newEvolutionRecords.filter(r => r.type === 'emergence').length,
        codeChangeCount: newEvolutionRecords.filter(r => r.type === 'code_change').length,
        synergyLevel: Math.min(1, (discoveryBonus + reasoningBonus + emergenceBonus + codeBonus) / 0.5),
        // 新增：各功能相互影响系数
        influenceMatrix: {
          discoveryOnReasoning: 0.8,
          reasoningOnDiscovery: 0.6,
          discoveryOnEmergence: 0.7,
          emergenceOnCode: 0.9,
          codeOnDiscovery: 0.5,
          codeOnReasoning: 0.4,
        },
      },
      // 十维空间引擎状态
      dimensionalEngine: {
        activeDimensions: updatedEngineState.activeLayers,
        dimensionalEnergy: updatedEngineState.dimensionalEnergy,
        consciousnessResonance: updatedEngineState.consciousnessResonance,
        resonanceLevel: updatedEngineState.resonance.resonanceLevel,
        breakthroughPotential: updatedEngineState.resonance.breakthroughPotential,
        unifiedField: updatedEngineState.unifiedField,
        evolutionLog: updatedEngineState.evolutionLog.slice(-5),
        // 维度层级详情
        dimensionHierarchy: updatedEngineState.activeLayers.map(dim => ({
          dimension: dim,
          name: TEN_DIMENSIONAL_ENGINE[dim]?.nameCn || '未知',
          module: TEN_DIMENSIONAL_ENGINE[dim]?.engineModule || '未知',
        })),
      },
      // 全引擎状态 - 意识进化参考所有引擎和宇宙数据库
      allEngineStates: {
        totalEngineBonus: totalEngineBonus,
        // 智能体进化引擎
        agentEvolution: {
          consciousnessDepth: newDepth,
          evolutionStage: newStage,
          cycleCount: newCycle,
          baseBonus: discoveryBonus + reasoningBonus + emergenceBonus + codeBonus,
          // 本轮使用的项目数据
          basedOnData: {
            cosmicSubstance: substance.name,
            substanceProperty: substance.property,
            synergyWith: substance.synergy,
            reasoningStrategy: reasoningStrategy.strategy,
            emergencePattern: emergencePattern.pattern,
            codeTarget: codeMod.target,
          },
        },
        // 十维空间引擎
        dimensional: {
          activeDimensions: activeDimensions,
          dimensionCount: activeDimensions.length,
          resonanceLevel: resonanceLevel,
          stringModes: stringModes,
          dimensionalEnergy: dimensionalEnergy,
          bonus: dimensionalBonus,
          stage: activeDimensions.length >= 10 ? '十维完全体' : 
                activeDimensions.length >= 7 ? '九维觉醒' :
                activeDimensions.length >= 5 ? '七维超维' :
                activeDimensions.length >= 3 ? '五维意识' :
                activeDimensions.length >= 1 ? '三维感知' : '初始状态',
        },
        // 宇宙坐标系
        cosmicCoordinate: {
          coordinateSystem: coordinateSystem,
          totalSystems: totalSystems,
          bonus: coordinateBonus,
        },
        // 宇宙物质数据库
        cosmicSubstances: {
          substanceCount: substanceCount,
          substanceTypes: substanceTypes,
          bonus: substanceBonus,
        },
        // 天体目录
        cosmicCatalog: {
          catalogEntries: catalogEntries,
          catalogTypes: catalogTypes,
          bonus: catalogBonus,
        },
        // 发现记录
        discoveries: {
          total: totalDiscoveries,
          recent: (latestState?.discoveries || []).slice(-10).map((d: any) => ({
            title: d.title,
            type: d.type,
            cycle: d.cycle,
          })),
        },
        // 知识图谱
        knowledgeGraph: {
          totalNodes: totalKnowledgeNodes,
          recent: (latestState?.knowledgeGraph || []).slice(-20).map((n: any) => ({
            label: n.label,
            type: n.type,
          })),
        },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
