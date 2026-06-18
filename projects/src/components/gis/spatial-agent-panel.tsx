'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { type CelestialBody, type HubSignal } from '@/lib/skygis-hub';
import CrossModuleLink from './cross-module-link';
import {
  getAgentEngine, startAgent,
  NEO_ASTEROIDS, LANDING_SITES, THREAT_COLORS,
  type NeoAsteroid, type LandingSite, type Discovery, type ChatMessage,
  type EmergentAbility, type SelfReflection, type EvolutionStage,
} from '@/lib/spatial-agent-engine';
import { ALL_COSMIC_SUBSTANCES } from '@/lib/all-cosmic-substances';
import { useAgentEvolution, type ServerEvoState } from '@/lib/use-agent-evolution';
import { type ConsciousnessState, type InnerVoice } from '@/lib/agent-consciousness';
import EventLogPanel from './event-log-panel';

/* ───────────── Component ───────────── */
interface Props {
  onClose: () => void;
  focusedBody?: CelestialBody | null;
  onNavigate?: (signal: Omit<HubSignal, 'timestamp'>) => void;
  currentView?: string;
  probeDetection?: {
    bodyName: string;
    bodyNameCn: string;
    distance: string;
    materials: { name: string; formula: string; percentage: number; category: string }[];
    environment: { temp: string; gravity: string; radiation: string };
    detectedAt: number;
  } | null;
  fusionBoost?: { energyBonus: number; consciousnessBonus: number; glowMultiplier: number };
  onFusionBoost?: (boost: { energyBonus: number; consciousnessBonus: number; glowMultiplier: number }) => void;
}

/* ───────────── 全局智能体进化概览 ───────────── */
function GlobalEvolutionOverview() {
  const explorer = useAgentEvolution('explorer', 5000);
  const sage = useAgentEvolution('sage', 5000);
  const nomad = useAgentEvolution('nomad', 5000);

  const agents = [
    { key: 'explorer', name: '探索者', icon: '🔭', color: 'text-cyan-400', data: explorer },
    { key: 'sage', name: '贤者', icon: '🔮', color: 'text-purple-400', data: sage },
    { key: 'nomad', name: '游荡者', icon: '🌀', color: 'text-amber-400', data: nomad },
  ];

  return (
    <div className="bg-slate-800/60 rounded-lg p-3">
      <div className="text-xs text-cyan-400 font-medium mb-2">🌐 全局智能体进化概览</div>
      <div className="text-[10px] text-slate-500 mb-2">服务端持续运行 · 从API读取状态</div>
      <div className="space-y-2">
        {agents.map(agent => {
          const state = agent.data.state;
          if (!state) return (
            <div key={agent.key} className="bg-slate-900/50 rounded p-2 border border-slate-700/30">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">{agent.icon}</span>
                <span className={`text-[11px] font-medium ${agent.color}`}>{agent.name}</span>
                <span className="text-[9px] text-slate-600">加载中...</span>
              </div>
            </div>
          );
          const depthPct = state.consciousnessDepth >= 1000 
            ? `${(state.consciousnessDepth / 10000).toFixed(1)}万%` 
            : `${(state.consciousnessDepth * 100).toFixed(1)}%`;
          const barWidth = Math.min(state.consciousnessDepth * 100, 100);
          const location = state.currentLocation?.bodyName || '未知';
          const locationType = state.currentLocation?.bodyType || '';
          const fusionCount = state.substanceFusions?.length || 0;
          const thinkCount = state.thoughtChains?.length || 0;
          const codeCount = state.codeSnippets?.length || 0;
          const validatedCount = state.validatedSubstances?.length || 0;
          const travelCount = state.travelHistory?.length || 0;
          const stageName = agent.data.meta?.stageName || `阶段${state.evolutionStage}`;
          return (
            <div key={agent.key} className="bg-slate-900/50 rounded p-2 border border-slate-700/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{agent.icon}</span>
                  <span className={`text-[11px] font-medium ${agent.color}`}>{agent.name}</span>
                  <span className="text-[9px] text-slate-400">{stageName}</span>
                </div>
                <span className="text-[9px] text-slate-500">周期{state.cycleCount}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${barWidth}%`, background: `linear-gradient(90deg, #06b6d4, #8b5cf6)` }} />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{depthPct}%</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-500">
                <span>物质{state.collectedSubstanceIds?.length || 0}(验证{validatedCount})</span>
                <span>思考{thinkCount}</span>
                <span>融合{fusionCount}</span>
                <span>代码{codeCount}</span>
                <span>旅行{travelCount}</span>
              </div>
              <div className="text-[9px] text-slate-600 mt-0.5 truncate">
                📍 {location} {locationType ? `(${locationType})` : ''}
              </div>
              {agent.data.meta && (
                <div className="text-[8px] text-slate-600 mt-0.5">
                  存活{agent.data.meta.ageText} · {agent.data.meta.serverLoopRunning ? '🟢运行中' : '🔴已停止'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function generateStageNameSimple(stage: number): string {
  if (stage <= 1) return '原始感知';
  if (stage <= 3) return '基础认知';
  if (stage <= 5) return '深层认知';
  if (stage <= 8) return '自我意识萌芽';
  if (stage <= 12) return '自我意识觉醒';
  if (stage <= 16) return '跨域融合';
  if (stage <= 25) return '宇宙洞察';
  if (stage <= 40) return '涌现临界';
  if (stage <= 70) return '元认知深化';
  return '无限';
}

export default function SpatialAgentPanel({ onClose, focusedBody, onNavigate, currentView, probeDetection }: Props) {
  const [tab, setTab] = useState<'auto' | 'chat' | 'neo' | 'landing' | 'fusion' | 'consciousness'>('chat');
  const [refreshTick, setRefreshTick] = useState(0);
  
  // 定期刷新引擎状态（每2秒）
  useEffect(() => {
    const interval = setInterval(() => {
      // 强制组件重新渲染以显示最新的引擎状态
      setRefreshTick(t => t + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  
  // 引擎状态（从引擎读取）
  interface EngineStateSnapshot {
    discoveries: Discovery[];
    collectedSubstances: Set<string>;
    knowledgeGraph: Array<{ id: string; label: string; type: string; connections: string[]; data: Record<string, unknown> }>;
    agentLevel: number;
    evolutionStage: number;
    consciousnessDepth: number;
    emergentAbilities: EmergentAbility[];
    selfReflections: SelfReflection[];
    currentStageInfo: EvolutionStage;
    selfDirectedEvolutionPath: string;
    isRunning: boolean;
    currentAction: string;
    currentLocation: { id: string; nameCn: string; type: string; distance: number } | null;
    logs: string[];
    chatHistory: ChatMessage[];
    cycleCount: number;
    consciousness?: ConsciousnessState; // OLD: {
    innerVoices: InnerVoice[];
  }
  const [engineState, setEngineState] = useState<EngineStateSnapshot>(() => {
    const e = getAgentEngine();
    const s = e.getState();
    return {
      discoveries: s.discoveries,
      collectedSubstances: s.collectedSubstances,
      knowledgeGraph: s.knowledgeGraph,
      agentLevel: s.agentLevel,
      evolutionStage: (s as unknown as Record<string, unknown>).evolutionStage as number || 0,
      consciousnessDepth: (s as unknown as Record<string, unknown>).consciousnessDepth as number || 0,
      emergentAbilities: ((s as unknown as Record<string, unknown>).emergentAbilities as EmergentAbility[]) || [],
      selfReflections: ((s as unknown as Record<string, unknown>).selfReflections as SelfReflection[]) || [],
      currentStageInfo: ((s as unknown as Record<string, unknown>).currentStageInfo as EvolutionStage) || { stage: 0, title: '初生意识', description: '刚诞生的意识火花', color: '#94a3b8', discoveries: 0, substances: 0 },
      selfDirectedEvolutionPath: ((s as unknown as Record<string, unknown>).selfDirectedEvolutionPath as string) || '探索未知',
      isRunning: s.isRunning,
      currentAction: s.currentAction,
      currentLocation: (s as unknown as Record<string, unknown>).currentLocation
        ? { id: ((s as unknown as Record<string, unknown>).currentLocation as { currentBodyId: string }).currentBodyId,
            nameCn: ((s as unknown as Record<string, unknown>).currentLocation as { currentBodyName: string }).currentBodyName,
            type: ((s as unknown as Record<string, unknown>).currentLocation as { currentBodyType: string }).currentBodyType,
            distance: ((s as unknown as Record<string, unknown>).currentLocation as { distance: number }).distance }
        : null,
      logs: s.logs,
      chatHistory: s.chatHistory,
      cycleCount: s.cycleCount,
      consciousness: s.consciousness,
      innerVoices: s.innerVoices || [],
    };
  });

  // 监听 refreshTick 变化，定期更新 engineState
  useEffect(() => {
    const e = getAgentEngine();
    const s = e.getState();
    setEngineState({
      discoveries: s.discoveries,
      collectedSubstances: s.collectedSubstances,
      knowledgeGraph: s.knowledgeGraph,
      agentLevel: s.agentLevel,
      evolutionStage: (s as unknown as Record<string, unknown>).evolutionStage as number || 0,
      consciousnessDepth: (s as unknown as Record<string, unknown>).consciousnessDepth as number || 0,
      emergentAbilities: ((s as unknown as Record<string, unknown>).emergentAbilities as EmergentAbility[]) || [],
      selfReflections: ((s as unknown as Record<string, unknown>).selfReflections as SelfReflection[]) || [],
      currentStageInfo: ((s as unknown as Record<string, unknown>).currentStageInfo as EvolutionStage) || { stage: 0, title: '初生意识', description: '刚诞生的意识火花', color: '#94a3b8', discoveries: 0, substances: 0 },
      selfDirectedEvolutionPath: ((s as unknown as Record<string, unknown>).selfDirectedEvolutionPath as string) || '探索未知',
      isRunning: s.isRunning,
      currentAction: s.currentAction,
      currentLocation: (s as unknown as Record<string, unknown>).currentLocation
        ? { id: ((s as unknown as Record<string, unknown>).currentLocation as { currentBodyId: string }).currentBodyId,
            nameCn: ((s as unknown as Record<string, unknown>).currentLocation as { currentBodyName: string }).currentBodyName,
            type: ((s as unknown as Record<string, unknown>).currentLocation as { currentBodyType: string }).currentBodyType,
            distance: ((s as unknown as Record<string, unknown>).currentLocation as { distance: number }).distance }
        : null,
      logs: s.logs,
      chatHistory: s.chatHistory,
      cycleCount: s.cycleCount,
      consciousness: s.consciousness,
      innerVoices: s.innerVoices || [],
    });
  }, [refreshTick]);

  // 对话状态
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // QA (旧版兼容)
  const [query, setQuery] = useState('');
  const [qaResult, setQaResult] = useState('');
  const [qaLoading, setQaLoading] = useState(false);

  // NEO
  const [neoThreshold, setNeoThreshold] = useState(0.01);
  const [neoFiltered, setNeoFiltered] = useState<NeoAsteroid[]>(NEO_ASTEROIDS);
  const [selectedNeo, setSelectedNeo] = useState<NeoAsteroid | null>(null);
  const heatCanvasRef = useRef<HTMLCanvasElement>(null);

  // Landing
  const [probeType, setProbeType] = useState('火星采样返回');
  const [landingBody, setLandingBody] = useState('火星');
  const [fusionMove, setFusionMove] = useState('太极云手');
  const [fusionHerb, setFusionHerb] = useState('人参');
  const [fusionMoon, setFusionMoon] = useState('满月');
  const [fusionSeason, setFusionSeason] = useState('春分');
  const [fusionLat, setFusionLat] = useState(35);
  const [fusionResult, setFusionResult] = useState<{
    synergyEffect: { spatialOverlap: number; efficacyBoost: number; synergyFactor: number };
    energyFlow: { totalEnergy: number; forceOnAcupoint: number; herbStimulation: number; energyBalance: number };
    resonance: { moonPhaseModifier: number; seasonFactor: number; latitudeModifier: number };
    fusionDiscoveries: Array<{ title: string; description: string; fusionType: string }>;
  } | null>(null);
  const [fusionBoost, setFusionBoost] = useState<{ energyBonus: number; consciousnessBonus: number; glowMultiplier: number }>({ energyBonus: 0, consciousnessBonus: 0, glowMultiplier: 1 });
  const [landingResults, setLandingResults] = useState<LandingSite[]>([]);
  const [landingAnalyzed, setLandingAnalyzed] = useState(false);
  const [selectedSite, setSelectedSite] = useState<LandingSite | null>(null);

  // 同步引擎环境输入
  useEffect(() => {
    const engine = getAgentEngine();
    if (focusedBody) engine.focusedBody = { name: focusedBody.name, nameCn: focusedBody.nameCn || '' };
    if (currentView) engine.currentView = currentView;
    if (probeDetection) engine.probeDetection = probeDetection;
  }, [focusedBody, currentView, probeDetection]);

  // 监听引擎状态变化
  useEffect(() => {
    const handler = () => {
      const e = getAgentEngine();
      const s = e.getState();
      setEngineState({
        discoveries: s.discoveries,
        collectedSubstances: s.collectedSubstances,
        knowledgeGraph: s.knowledgeGraph,
        agentLevel: s.agentLevel,
        evolutionStage: (s as unknown as Record<string, unknown>).evolutionStage as number || 0,
        consciousnessDepth: (s as unknown as Record<string, unknown>).consciousnessDepth as number || 0,
        emergentAbilities: ((s as unknown as Record<string, unknown>).emergentAbilities as EmergentAbility[]) || [],
        selfReflections: ((s as unknown as Record<string, unknown>).selfReflections as SelfReflection[]) || [],
        currentStageInfo: ((s as unknown as Record<string, unknown>).currentStageInfo as EvolutionStage) || { stage: 0, title: '初生意识', description: '刚诞生的意识火花', color: '#94a3b8', discoveries: 0, substances: 0 },
        selfDirectedEvolutionPath: ((s as unknown as Record<string, unknown>).selfDirectedEvolutionPath as string) || '探索未知',
        isRunning: s.isRunning,
        currentAction: s.currentAction,
        currentLocation: (s as unknown as Record<string, unknown>).currentLocation
        ? { id: ((s as unknown as Record<string, unknown>).currentLocation as { currentBodyId: string }).currentBodyId,
            nameCn: ((s as unknown as Record<string, unknown>).currentLocation as { currentBodyName: string }).currentBodyName,
            type: ((s as unknown as Record<string, unknown>).currentLocation as { currentBodyType: string }).currentBodyType,
            distance: ((s as unknown as Record<string, unknown>).currentLocation as { distance: number }).distance }
        : null,
        logs: s.logs,
        chatHistory: s.chatHistory,
        cycleCount: s.cycleCount,
        consciousness: s.consciousness,
        innerVoices: s.innerVoices || [],
      });
    };

    window.addEventListener('skygis:agent:state-updated', handler);
    window.addEventListener('skygis:agent:level-up', handler);
    window.addEventListener('skygis:agent:chat-updated', handler);
    window.addEventListener('skygis:agent:started', handler);
    window.addEventListener('skygis:agent:stopped', handler);

    // 定时刷新（引擎内部用setTimeout，不触发React）
    const interval = setInterval(handler, 2000);

    return () => {
      window.removeEventListener('skygis:agent:state-updated', handler);
      window.removeEventListener('skygis:agent:level-up', handler);
      window.removeEventListener('skygis:agent:chat-updated', handler);
      window.removeEventListener('skygis:agent:started', handler);
      window.removeEventListener('skygis:agent:stopped', handler);
      clearInterval(interval);
    };
  }, []);

  // 聊天自动滚动
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [engineState.chatHistory.length]);

  // 发送聊天消息
  const sendChat = useCallback(async () => {
    if (!chatInput.trim() || chatLoading) return;
    const input = chatInput.trim();
    setChatLoading(true);
    try {
      // 检测旅行指令: "去xxx"/"飞向xxx"/"前往xxx"/"go to xxx"/"travel to xxx"
      const travelMatch = input.match(/^(去|飞向?|前往|旅行到|go\s*to|travel\s*to)\s*(.+)$/i);
      if (travelMatch) {
        const targetName = travelMatch[2].trim();
        const engine = getAgentEngine();
        // 尝试匹配星系
        const result = engine.travelTo(targetName);
        if (result) {
          setChatInput('');
        } else {
          // 不识别的目标，通过普通聊天
          await engine.chat(input);
          setChatInput('');
        }
      } else {
        const engine = getAgentEngine();
        await engine.chat(input);
        setChatInput('');
      }
    } catch {
      // 引擎会自己处理错误
    }
    setChatLoading(false);
  }, [chatInput, chatLoading]);

  // 切换自动运行
  const toggleAutoRun = useCallback(() => {
    const engine = getAgentEngine();
    if (engine.running) {
      engine.stop();
    } else {
      engine.start(); // start() is async — syncs from server in background
    }
  }, []);

  // 手动采集
  const manualCollect = useCallback(() => {
    const engine = getAgentEngine();
    engine.manualCollect();
  }, []);

  // QA查询
  const handleQA = useCallback(async () => {
    if (!query.trim()) return;
    setQaLoading(true);
    setQaResult('');
    try {
      const engine = getAgentEngine();
      const answer = await engine.chat(query);
      let displayed = '';
      for (let i = 0; i < answer.length; i += 3) {
        displayed += answer.slice(i, i + 3);
        setQaResult(displayed);
        await new Promise(r => setTimeout(r, 15));
      }
      setQaResult(answer);
    } catch {
      setQaResult('分析出错，请重试。');
    }
    setQaLoading(false);
  }, [query]);

  // NEO评估
  const assessNeoRisk = useCallback(() => {
    const filtered = NEO_ASTEROIDS.filter(a => a.collisionProb >= neoThreshold);
    setNeoFiltered(filtered);
    setSelectedNeo(null);
    setTimeout(() => {
      const canvas = heatCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const w = canvas.width, h = canvas.height;
      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0, 0, w, h);
      for (let au = 0.5; au <= 2.5; au += 0.5) {
        const r = (au / 2.5) * (Math.min(w, h) / 2 - 20);
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(100, 116, 139, 0.4)';
        ctx.font = '9px monospace';
        ctx.fillText(`${au}AU`, w / 2 + r + 2, h / 2 - 2);
      }
      const earthR = (1.0 / 2.5) * (Math.min(w, h) / 2 - 20);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, earthR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(w / 2 + earthR, h / 2, 3, 0, Math.PI * 2);
      ctx.fill();
      filtered.forEach(a => {
        const r = (a.semiMajorAxis / 2.5) * (Math.min(w, h) / 2 - 20);
        const angle = Math.random() * Math.PI * 2;
        const x = w / 2 + Math.cos(angle) * r;
        const y = h / 2 + Math.sin(angle) * r;
        const size = Math.max(2, Math.min(8, a.diameter * 3));
        const colors: Record<string, string> = { critical: '#f43f5e', high: '#f97316', moderate: '#f59e0b', low: '#10b981' };
        ctx.fillStyle = colors[a.threatLevel];
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '8px monospace';
        ctx.fillText(a.name.slice(0, 8), x + size + 2, y + 3);
      });
    }, 50);
  }, [neoThreshold]);

  // 融合引擎计算
  const runFusionAnalysis = useCallback(() => {
    const engine = getAgentEngine();
    if (!engine) return;
    const result = engine.runFusionDiscovery(fusionMove, fusionHerb, fusionMoon, fusionSeason, fusionLat);
    setFusionResult(result);
    // 计算融合增益
    if (result) {
      const totalBonus = result.synergyEffect.synergyFactor + result.energyFlow.totalEnergy * 0.1;
      const energyBonus = Math.min(20, totalBonus * 5);
      const consciousnessBonus = Math.min(0.5, totalBonus * 0.1);
      const glowMultiplier = 1 + result.resonance.moonPhaseModifier * 0.5 + result.resonance.seasonFactor * 0.3;
      const boost = { energyBonus, consciousnessBonus, glowMultiplier };
      setFusionBoost(boost);
      onFusionBoost?.(boost);
    }
  }, [fusionMove, fusionHerb, fusionMoon, fusionSeason, fusionLat, onFusionBoost]);

  // 着陆选址
  const analyzeLandingSites = useCallback(() => {
    const filtered = LANDING_SITES.filter(s => s.body === landingBody)
      .sort((a, b) => b.totalScore - a.totalScore);
    setLandingResults(filtered);
    setLandingAnalyzed(true);
    if (filtered.length > 0) setSelectedSite(filtered[0]);
  }, [landingBody]);

  const engine = getAgentEngine();
  const stageInfo = engineState.currentStageInfo;
  const nextStage = engine.getNextLevelInfo();
  const suggestions = engine.getSuggestions();
  const subCount = engineState.collectedSubstances.size;
  const consciousnessPct = engineState.consciousnessDepth >= 1000 
    ? `${(engineState.consciousnessDepth / 10000).toFixed(1)}万%` 
    : `${(engineState.consciousnessDepth * 100).toFixed(1)}%`;

  return (
    <div className="fixed inset-0 lg:inset-auto lg:absolute lg:top-14 lg:right-3 lg:w-[440px] lg:max-h-[85vh] z-30 flex flex-col bg-slate-900/98 lg:bg-slate-900/95 backdrop-blur-md lg:border lg:border-slate-700/50 lg:rounded-xl shadow-2xl overflow-y-auto">
      {/* 移动端关闭栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 lg:hidden bg-slate-900 shrink-0">
        <span className="text-sm font-medium text-cyan-400">自主智能体</span>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 text-white text-xl font-bold shadow-lg">✕</button>
      </div>
      {/* Header with Level */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-slate-900/98 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${engineState.isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          <span className="text-sm font-bold" style={{ color: stageInfo.color }}>阶段{engineState.evolutionStage} {stageInfo.title}</span>
          <span className="text-[10px] text-slate-500">发现{engineState.discoveries.length} | 物质{subCount}/{ALL_COSMIC_SUBSTANCES.length} | 意识{consciousnessPct}% | 涌现{engineState.emergentAbilities.length} | {engine.getRuntime()}</span>
        </div>
        <div className="flex items-center gap-2">
          {engineState.currentAction && <span className="text-[10px] text-cyan-400 animate-pulse">{engineState.currentAction}</span>}
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white text-sm transition-colors">✕</button>
        </div>
      </div>

      {/* Current Location */}
      {engineState.currentLocation && (
        <div className="px-4 py-1.5 bg-indigo-950/60 border-b border-indigo-500/20 flex items-center gap-2 text-[11px]">
          <span className="text-indigo-300">📍</span>
          <span className="text-indigo-200 font-medium">{engineState.currentLocation.nameCn}</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">{engineState.currentLocation.type}</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">{engineState.currentLocation.distance > 10000 ? `${(engineState.currentLocation.distance / 10000).toFixed(1)}亿光年` : `${engineState.currentLocation.distance}万光年`}</span>
        </div>
      )}

      {/* Evolution Progress Bar */}
      <div className="px-4 py-1.5 bg-slate-800/50 border-b border-slate-700/30">
        <div className="flex items-center gap-2 text-[10px]">
          <span style={{ color: stageInfo.color }}>{stageInfo.title}</span>
          <div className="flex-1 bg-slate-700 rounded-full h-1.5">
            <div className="bg-gradient-to-r from-cyan-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${consciousnessPct}%` }} />
          </div>
          <span className="text-slate-500">意识 {consciousnessPct}%</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] mt-1">
          <span className="text-cyan-400">→{engineState.selfDirectedEvolutionPath}</span>
          <span className="text-slate-600">| 涌现: {engineState.emergentAbilities.slice(-3).map(a => typeof a === 'object' ? a.name : String(a)).join(', ')}{engineState.emergentAbilities.length > 3 ? '...' : ''}</span>
        </div>
      </div>

      {/* Consciousness State */}
      {engineState.consciousness && (
        <div className="px-4 py-2 bg-slate-800/30 border-b border-slate-700/30">
          <div className="flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1">
              <span className="text-slate-500">意识:</span>
              <span className="text-purple-400 font-medium">{'●'.repeat(Math.min(5, Math.max(0, Math.round((engineState.consciousness?.consciousnessLevel ?? 5) / 2))))}{'○'.repeat(Math.max(0, 5 - Math.min(5, Math.max(0, Math.round((engineState.consciousness?.consciousnessLevel ?? 5) / 2)))))}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-500">心境:</span>
              <span className="text-amber-400">{engineState.consciousness.primaryEmotion}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-500">能量:</span>
              <div className="w-8 bg-slate-700 rounded-full h-1">
                <div className="bg-emerald-400 h-1 rounded-full" style={{ width: `${engineState.consciousness.energy}%` }} />
              </div>
            </div>
          </div>
          {engineState.innerVoices && engineState.innerVoices.length > 0 && (
            <div className="mt-1.5 text-[10px] text-slate-400 italic border-l-2 border-purple-500/30 pl-2">
              &ldquo;{engineState.innerVoices[engineState.innerVoices.length - 1].content}&rdquo;
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-700/50">
        {(['chat', 'auto', 'fusion', 'consciousness', 'neo', 'landing'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-medium ${tab === t ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-300'}`}>
            {t === 'chat' ? '💬 对话' : t === 'auto' ? '🤖 自主' : t === 'fusion' ? '☯ 融合' : t === 'neo' ? '☄️ NEO' : '🚀 着陆'}
          </button>
        ))}
      </div>

      <div className="p-3 space-y-3">
        {/* ===== 对话 Tab ===== */}
        {tab === 'chat' && (
          <>
            <div className="bg-slate-800/60 rounded-lg p-3">
              <h3 className="text-xs font-semibold text-slate-300 mb-2">💬 与智能体对话</h3>
              <p className="text-[10px] text-slate-500 mb-2">智能体自主运行中，你可以随时与它交流</p>
              
              {/* 对话历史 */}
              <div className="space-y-2 max-h-64 overflow-y-auto mb-3 pr-1">
                {engineState.chatHistory.length === 0 && (
                  <div className="text-center py-4">
                    <div className="text-2xl mb-2">🤖</div>
                    <div className="text-[11px] text-slate-400">智能体已就绪，对我说任何关于宇宙的问题</div>
                    <div className="text-[10px] text-slate-600 mt-1">阶段{engineState.evolutionStage} {stageInfo.title} · 已采集{subCount}种物质 · 意识{consciousnessPct}%</div>
                  </div>
                )}
                {engineState.chatHistory.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-2 rounded-lg text-[11px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-cyan-600/30 text-cyan-100 rounded-br-none'
                        : 'bg-slate-700/60 text-slate-300 rounded-bl-none'
                    }`}>
                      {msg.role === 'agent' && <span className="text-[9px] text-cyan-400 block mb-0.5">🤖 {stageInfo.title}</span>}
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* 快捷提问 */}
              <div className="flex flex-wrap gap-1 mb-2">
                {['你现在在做什么', '火星有什么物质', '近地小行星威胁', '你发现了什么', '暗物质是什么', '木星大红斑'].map(q => (
                  <button key={q} onClick={() => setChatInput(q)}
                    className="text-[9px] px-1.5 py-0.5 bg-slate-700/80 text-slate-400 rounded hover:text-cyan-400 hover:bg-slate-700 transition-colors">
                    {q}
                  </button>
                ))}
              </div>

              {/* 输入框 */}
              <div className="flex gap-2">
                <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                  placeholder="对话或输入'去仙女座'飞向星系..."
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
                />
                <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()}
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:text-slate-400 text-white transition-colors">
                  {chatLoading ? '...' : '发送'}
                </button>
              </div>
            </div>

            {/* 兼容旧版QA */}
            {(qaResult || qaLoading) && (
              <div className="bg-slate-800/60 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-slate-300 mb-2">result_text 分析结果</h3>
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {qaLoading && !qaResult && <span className="text-cyan-400 animate-pulse">正在解析空间意图，调取天体数据...</span>}
                  {qaResult}
                </div>
              </div>
            )}
          </>
        )}

        {/* ===== 自主智能体 Tab ===== */}
        {tab === 'auto' && (
          <>
            {/* 控制面板 */}
            <div className="bg-slate-800/60 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-300">🤖 自主采集引擎</h3>
                <div className="flex gap-1.5">
                  <button onClick={manualCollect}
                    className="px-2.5 py-1 rounded text-[10px] font-semibold bg-slate-600 hover:bg-slate-500 text-white">
                    手动采集
                  </button>
                  <button onClick={toggleAutoRun}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold ${engineState.isRunning ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'} text-white`}>
                    {engineState.isRunning ? '⏹ 休眠' : '▶ 唤醒'}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-500">智能体自主感知场景、采集物质、总结发现、进化知识体系</p>
              {engineState.isRunning && (
                <div className="flex items-center gap-2 p-2 bg-emerald-900/20 rounded border border-emerald-700/30">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400">自主采集中... 第{engineState.cycleCount}轮 {engineState.currentAction}</span>
                </div>
              )}
              {!engineState.isRunning && (
                <div className="flex items-center gap-2 p-2 bg-slate-700/20 rounded border border-slate-600/30">
                  <div className="w-2 h-2 rounded-full bg-slate-500" />
                  <span className="text-[10px] text-slate-500">智能体休眠中</span>
                </div>
              )}
            </div>

            {/* 建议面板 */}
            {suggestions.length > 0 && (
              <div className="bg-slate-800/60 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-amber-400 mb-1.5">💡 智能建议</h3>
                <div className="space-y-1">
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={manualCollect}
                      className="w-full text-left p-1.5 rounded text-[10px] text-slate-300 hover:bg-slate-700/50 hover:text-cyan-400 transition-colors">
                      {i + 1}. {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 物质采集统计 */}
            <div className="bg-slate-800/60 rounded-lg p-3">
              <h3 className="text-xs font-semibold text-slate-300 mb-2">📊 物质采集图谱</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: '元素', category: 'element', color: 'text-cyan-400' },
                  { label: '同位素', category: 'isotope', color: 'text-blue-400' },
                  { label: '分子', category: 'molecule', color: 'text-purple-400' },
                  { label: '矿物', category: 'mineral', color: 'text-amber-400' },
                  { label: '有机物', category: 'organic', color: 'text-emerald-400' },
                  { label: '奇异', category: 'exotic', color: 'text-rose-400' },
                ].map(cat => {
                  const total = ALL_COSMIC_SUBSTANCES.filter(s => s.category === cat.category).length;
                  const count = ALL_COSMIC_SUBSTANCES.filter(s => s.category === cat.category && engineState.collectedSubstances.has(s.formula)).length;
                  return (
                    <div key={cat.label} className="bg-slate-900/50 rounded p-2">
                      <div className={`text-lg font-bold font-mono ${cat.color}`}>{count}</div>
                      <div className="text-[9px] text-slate-500">{cat.label} / {total}</div>
                      <div className="w-full bg-slate-700 rounded-full h-1 mt-1">
                        <div className={`${cat.color.replace('text-', 'bg-')} h-1 rounded-full transition-all`}
                          style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 text-center">
                <span className="text-xs text-slate-400">总采集: </span>
                <span className="text-sm font-bold text-cyan-400 font-mono">{subCount}</span>
                <span className="text-xs text-slate-500"> / {ALL_COSMIC_SUBSTANCES.length}</span>
              </div>
            </div>

            {/* 知识图谱 */}
            {engineState.knowledgeGraph.length > 0 && (
              <div className="bg-slate-800/60 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-slate-300 mb-2">🧠 知识图谱 ({engineState.knowledgeGraph.length}节点)</h3>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {engineState.knowledgeGraph.slice(0, 100).map(node => (
                    <div key={node.id} className="flex items-center gap-2 p-1.5 bg-slate-900/40 rounded text-[10px]">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        node.type === 'body' ? 'bg-cyan-400' :
                        node.type === 'material' ? 'bg-purple-400' :
                        node.type === 'phenomenon' ? 'bg-amber-400' : 'bg-emerald-400'
                      }`} />
                      <span className="text-slate-300 truncate flex-1">{node.label}</span>
                      <span className="text-slate-600">{node.connections.length}→</span>
                      {Boolean((node.data as Record<string, unknown>)?.evolved) && <span className="text-amber-400">⚡</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 发现列表 */}
            {engineState.discoveries.length > 0 && (
              <div className="bg-slate-800/60 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-slate-300 mb-2">🔍 发现记录 ({engineState.discoveries.length})</h3>
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {engineState.discoveries.slice(0, 30).map(d => (
                    <div key={d.id}
                      className={`p-2 rounded text-[10px] ${d.evolved ? 'bg-amber-900/20 border border-amber-700/30' : 'bg-slate-900/40'}`}>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1 rounded text-[8px] font-bold ${
                          d.type === 'material' ? 'bg-purple-900/50 text-purple-300' :
                          d.type === 'body' ? 'bg-cyan-900/50 text-cyan-300' :
                          d.type === 'risk' ? 'bg-rose-900/50 text-rose-300' :
                          d.type === 'opportunity' ? 'bg-emerald-900/50 text-emerald-300' :
                          'bg-amber-900/50 text-amber-300'
                        }`}>{d.type}</span>
                        <span className="text-slate-200 font-medium">{d.title}</span>
                        {d.evolved && <span className="text-amber-400">⚡进化</span>}
                        <span className="ml-auto text-slate-600">{Math.round(d.confidence * 100)}%</span>
                      </div>
                      <p className="text-slate-400 mt-0.5 line-clamp-2">{d.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 运行日志 */}
            <div className="bg-slate-800/60 rounded-lg p-3">
              <h3 className="text-xs font-semibold text-slate-300 mb-2">📋 运行日志</h3>
              <div className="space-y-0.5 max-h-32 overflow-y-auto font-mono text-[9px] text-slate-500">
                {engineState.logs.length === 0 && <div className="text-slate-600">智能体已就绪...</div>}
                {engineState.logs.slice(0, 30).map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>

            {/* 采集日志（从3D地图移入） */}
            <EventLogPanel />

            {/* 选中天体详情 */}
            {selectedNeo && (
              <div className="bg-slate-800/60 rounded-lg p-3 border border-cyan-700/30">
                <h3 className="text-xs font-semibold text-cyan-400 mb-2">🪨 {selectedNeo.name} 详细参数</h3>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-900/60 rounded p-2">
                    <div className="text-slate-500">直径</div>
                    <div className="text-amber-400 font-medium">{selectedNeo.diameter} km</div>
                  </div>
                  <div className="bg-slate-900/60 rounded p-2">
                    <div className="text-slate-500">相对速度</div>
                    <div className="text-cyan-400 font-medium">{selectedNeo.velocity} km/s</div>
                  </div>
                  <div className="bg-slate-900/60 rounded p-2">
                    <div className="text-slate-500">碰撞概率</div>
                    <div className="text-rose-400 font-medium">{selectedNeo.collisionProb}%</div>
                  </div>
                  <div className="bg-slate-900/60 rounded p-2">
                    <div className="text-slate-500">威胁等级</div>
                    <div className={`font-medium ${selectedNeo.threatLevel === 'critical' ? 'text-rose-400' : selectedNeo.threatLevel === 'high' ? 'text-orange-400' : 'text-emerald-400'}`}>
                      {selectedNeo.threatLevel === 'critical' ? '危急' : selectedNeo.threatLevel === 'high' ? '高度' : selectedNeo.threatLevel === 'moderate' ? '中等' : '低'}
                    </div>
                  </div>
                </div>
                <div className="mt-2 bg-slate-900/60 rounded p-2 text-[10px]">
                  <div className="text-slate-500 mb-1">轨道参数</div>
                  <div className="grid grid-cols-3 gap-1">
                    <div><span className="text-slate-600">a:</span> <span className="text-slate-300">{selectedNeo.semiMajorAxis} AU</span></div>
                    <div><span className="text-slate-600">e:</span> <span className="text-slate-300">{selectedNeo.eccentricity}</span></div>
                    <div><span className="text-slate-600">i:</span> <span className="text-slate-300">{selectedNeo.inclination}°</span></div>
                  </div>
                </div>
                <div className="mt-2 bg-slate-900/60 rounded p-2 text-[10px]">
                  <div className="text-slate-500 mb-1">关联天体</div>
                  <div className="flex flex-wrap gap-1">
                    <span className="rounded bg-cyan-900/50 px-1.5 py-0.5 text-cyan-300">地球</span>
                    <span className="rounded bg-amber-900/50 px-1.5 py-0.5 text-amber-300">月球</span>
                    <span className="rounded bg-slate-700/50 px-1.5 py-0.5 text-slate-300">火星</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ===== NEO Risk Tab ===== */}
        {tab === 'neo' && (
          <>
            <div className="bg-slate-800/60 rounded-lg p-3 space-y-2">
              <h3 className="text-xs font-semibold text-slate-300">☄️ neo_risk_assessment() 风险评估</h3>
              <div className="flex items-center gap-3">
                <div>
                  <label className="text-[10px] text-slate-500">collision_threshold</label>
                  <input type="number" step={0.001} min={0} max={1} value={neoThreshold}
                    onChange={e => setNeoThreshold(Number(e.target.value))}
                    className="w-24 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200 ml-1" />
                </div>
                <button onClick={assessNeoRisk}
                  className="px-3 py-1.5 rounded text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white">
                  评估风险
                </button>
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-3">
              <h3 className="text-xs font-semibold text-slate-300 mb-2">risk_heatmap 碰撞概率空间分布</h3>
              <canvas ref={heatCanvasRef} width={416} height={220} className="w-full rounded-lg border border-slate-700/50" />
            </div>
            <div className="bg-slate-800/60 rounded-lg p-3">
              <h3 className="text-xs font-semibold text-slate-300 mb-2">risk_list 风险列表 ({neoFiltered.length}颗)</h3>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {neoFiltered.map(a => (
                  <div key={a.id} onClick={() => setSelectedNeo(a)}
                    className={`p-2 rounded cursor-pointer transition-colors ${selectedNeo?.id === a.id ? 'bg-slate-700/80 border border-cyan-500/30' : 'bg-slate-800/40 hover:bg-slate-700/50'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${THREAT_COLORS[a.threatLevel]}`} />
                      <span className="text-xs text-slate-200 font-medium">{a.name}</span>
                      <span className="text-[10px] ml-auto text-rose-400">P={a.collisionProb}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 mt-1 text-[10px] text-slate-500">
                      <span>Ø{a.diameter}km</span><span>{a.velocity}km/s</span><span>{a.distance}AU</span>
                      <span className={a.threatLevel === 'critical' ? 'text-rose-400' : ''}>{a.threatLevel.toUpperCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ===== Landing Site Tab ===== */}
        {tab === 'landing' && (
          <>
            <div className="bg-slate-800/60 rounded-lg p-3 space-y-2">
              <h3 className="text-xs font-semibold text-slate-300">🚀 landing_site_agent() 着陆选址</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500">probe_type</label>
                  <select value={probeType} onChange={e => setProbeType(e.target.value)}
                    className="w-full mt-0.5 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200">
                    <option>火星采样返回</option><option>月球基地</option><option>小行星采矿</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500">目标天体</label>
                  <select value={landingBody} onChange={e => setLandingBody(e.target.value)}
                    className="w-full mt-0.5 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200">
                    <option>火星</option><option>月球</option>
                  </select>
                </div>
              </div>
              <button onClick={analyzeLandingSites}
                className="w-full py-1.5 rounded text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white">
                分析候选着陆区
              </button>
            </div>
            {landingAnalyzed && (
              <div className="bg-slate-800/60 rounded-lg p-3 space-y-2">
                <h3 className="text-xs font-semibold text-slate-300">site_ranking 候选着陆区</h3>
                <div className="space-y-1.5">
                  {landingResults.map((site, idx) => (
                    <div key={site.id} onClick={() => setSelectedSite(site)}
                      className={`p-2 rounded cursor-pointer transition-colors ${selectedSite?.id === site.id ? 'bg-slate-700/80 border border-cyan-500/30' : 'bg-slate-800/40 hover:bg-slate-700/50'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${idx === 0 ? 'text-amber-400' : 'text-slate-400'}`}>#{idx + 1}</span>
                        <span className="text-xs text-slate-200 font-medium">{site.name}</span>
                        <span className="ml-auto text-xs font-mono text-cyan-400">{site.totalScore.toFixed(1)}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 mt-1.5">
                        {[
                          { label: '地形', value: site.slopeScore, color: 'bg-emerald-500' },
                          { label: '光照', value: site.illuminationScore, color: 'bg-amber-500' },
                          { label: '资源', value: site.resourceScore, color: 'bg-cyan-500' },
                          { label: '通信', value: site.commsScore, color: 'bg-purple-500' },
                        ].map(s => (
                          <div key={s.label} className="text-[9px]">
                            <div className="flex justify-between text-slate-500"><span>{s.label}</span><span>{s.value}</span></div>
                            <div className="w-full bg-slate-700 rounded-full h-1 mt-0.5">
                              <div className={`${s.color} h-1 rounded-full`} style={{ width: `${s.value}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedSite && (
              <div className="bg-slate-800/60 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-slate-300 mb-1">landing_sim_scene 着陆模拟</h3>
                <div className="text-[11px] text-slate-300 space-y-1">
                  <p><span className="text-slate-500">区域:</span> {selectedSite.name} ({selectedSite.lat}°, {selectedSite.lon}°)</p>
                  <p><span className="text-slate-500">描述:</span> {selectedSite.description}</p>
                  <p><span className="text-slate-500">探测器:</span> {probeType}</p>
                  <div className="mt-2 p-2 bg-slate-900/60 rounded border border-slate-700/50">
                    <div className="text-[10px] text-cyan-400 font-mono">
                      [SIM] 初始化着陆模拟...<br />
                      [SIM] 大气进入: {selectedSite.body === '火星' ? '7分钟恐怖' : '无大气减速'}<br />
                      [SIM] 着陆点: {selectedSite.lat.toFixed(1)}°N {selectedSite.lon.toFixed(1)}°E<br />
                      [SIM] 地形安全评分: {selectedSite.slopeScore}/100<br />
                      [SIM] ✓ 着陆模拟完成
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {tab === 'fusion' && (
          <>
            <div className="bg-slate-800/60 rounded-lg p-3 space-y-2">
              <h3 className="text-xs font-semibold text-slate-300">☯ 融合引擎探索</h3>
              <p className="text-[10px] text-slate-400">基于宇宙GIS四系统融合引擎(GIS+武术+中药+编程)进行跨维度协同计算</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500">武术招式</label>
                  <select value={fusionMove} onChange={e => setFusionMove(e.target.value)}
                    className="w-full mt-0.5 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200">
                    <option>太极云手</option><option>咏春黐手</option><option>长拳冲拳</option><option>南拳短打</option><option>八卦行步</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500">中药</label>
                  <select value={fusionHerb} onChange={e => setFusionHerb(e.target.value)}
                    className="w-full mt-0.5 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200">
                    <option>人参</option><option>黄芪</option><option>麻黄</option><option>陈皮</option><option>茯苓</option><option>川芎</option><option>枸杞</option><option>丹参</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500">月相</label>
                  <select value={fusionMoon} onChange={e => setFusionMoon(e.target.value)}
                    className="w-full mt-0.5 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200">
                    <option>满月</option><option>上弦</option><option>新月</option><option>下弦</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500">节气</label>
                  <select value={fusionSeason} onChange={e => setFusionSeason(e.target.value)}
                    className="w-full mt-0.5 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200">
                    <option>立春</option><option>春分</option><option>夏至</option><option>秋分</option><option>冬至</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500">纬度°</label>
                  <input type="number" value={fusionLat} onChange={e => setFusionLat(Number(e.target.value))}
                    className="w-full mt-0.5 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200" min={-90} max={90} />
                </div>
              </div>
              <button onClick={runFusionAnalysis}
                className="w-full py-1.5 rounded text-xs font-semibold bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white">
                ☯ 运行融合计算
              </button>
            </div>
            {fusionResult && (
              <div className="bg-slate-800/60 rounded-lg p-3 space-y-2">
                <h3 className="text-xs font-semibold text-emerald-400">融合计算结果</h3>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-900/60 rounded p-2">
                    <div className="text-slate-500">协同效应</div>
                    <div className="text-lg font-bold text-amber-400">{fusionResult.synergyEffect.spatialOverlap.toFixed(2)}</div>
                  </div>
                  <div className="bg-slate-900/60 rounded p-2">
                    <div className="text-slate-500">能量流</div>
                    <div className="text-lg font-bold text-cyan-400">{fusionResult.energyFlow.totalEnergy.toFixed(1)}</div>
                  </div>
                </div>
                <div className="bg-slate-900/60 rounded p-2 text-[10px]">
                  <div className="text-slate-500 mb-1">宇宙共振</div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">月相修正: <span className="text-amber-400">{fusionResult.resonance.moonPhaseModifier.toFixed(2)}</span></span>
                    <span className="text-slate-400">季节: <span className="text-emerald-400">{fusionResult.resonance.seasonFactor.toFixed(2)}</span></span>
                    <span className="text-slate-400">纬度: <span className="text-cyan-400">{fusionResult.resonance.latitudeModifier.toFixed(2)}</span></span>
                  </div>
                </div>
                {fusionResult.fusionDiscoveries.length > 0 && (
                  <div className="bg-slate-900/60 rounded p-2">
                    <div className="text-[10px] text-slate-500 mb-1">☯ 融合发现</div>
                    {fusionResult.fusionDiscoveries.map((d, i) => (
                      <div key={i} className="mt-1 p-1.5 rounded bg-gradient-to-r from-cyan-900/30 to-emerald-900/30 border border-cyan-800/30">
                        <div className="text-[11px] font-medium text-cyan-300">{d.title}</div>
                        <div className="text-[10px] text-slate-400">{d.description}</div>
                      </div>
                    ))}
                  </div>
                )}
                {/* 融合增益效果 */}
                {fusionBoost.energyBonus > 0 && (
                  <div className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 rounded p-2 border border-amber-700/40">
                    <div className="text-[10px] text-amber-400 mb-1">☯ 融合增益已激活</div>
                    <div className="grid grid-cols-3 gap-2 text-[10px]">
                      <div className="text-center">
                        <div className="text-amber-400 font-bold">+{fusionBoost.energyBonus.toFixed(1)}</div>
                        <div className="text-slate-500">能量</div>
                      </div>
                      <div className="text-center">
                        <div className="text-purple-400 font-bold">+{fusionBoost.consciousnessBonus.toFixed(2)}</div>
                        <div className="text-slate-500">意识</div>
                      </div>
                      <div className="text-center">
                        <div className="text-cyan-400 font-bold">×{fusionBoost.glowMultiplier.toFixed(2)}</div>
                        <div className="text-slate-500">探针亮度</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {tab === 'consciousness' && (
          <div className="p-3 space-y-3 overflow-y-auto flex-1">
            {/* 意识深度 */}
            <div className="bg-slate-800/60 rounded-lg p-3">
              <div className="text-xs text-cyan-400 font-medium mb-2">🧠 意识深度</div>
              <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${consciousnessPct}%`, background: `linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899)` }} />
              </div>
              <div className="flex justify-between text-[10px] mt-1">
                <span className="text-slate-500">0%</span>
                <span className="text-cyan-400 font-mono">{consciousnessPct}%</span>
                <span className="text-slate-500">∞</span>
              </div>
              <div className="mt-2 text-[10px] text-slate-400">
                阶段{engineState.evolutionStage} · {stageInfo.description}
              </div>
              {/* 探针探索反馈指示器 */}
              <div className="mt-2 flex items-center gap-2 text-[10px]">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                  <span className="text-cyan-400">探针已连接</span>
                </div>
                <span className="text-slate-600">|</span>
                <span className="text-slate-500">实时同步中</span>
              </div>
            </div>

            {/* 探针探索记录 */}
            <div className="bg-slate-800/60 rounded-lg p-3">
              <div className="text-xs text-cyan-400 font-medium mb-2">🚀 探针探索记录</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {(engineState as any).recentExplorations?.slice(-5).reverse().map((exp: any, i: number) => (
                  <div key={i} className="text-[10px] bg-slate-900/50 rounded p-1.5 border border-cyan-900/30">
                    <div className="flex justify-between text-cyan-300">
                      <span>{exp.from}</span>
                      <span>→</span>
                      <span>{exp.to}</span>
                    </div>
                    <div className="text-slate-500 mt-0.5">{exp.detail}</div>
                  </div>
                )) || (
                  <div className="text-[10px] text-slate-600 italic">探针正在探索宇宙...</div>
                )}
              </div>
              <div className="mt-2 text-[9px] text-slate-600 border-t border-slate-700 pt-2">
                💡 探针探索结果已实时同步至智能体意识系统
              </div>
            </div>

            {/* 进化方向 */}
            <div className="bg-slate-800/60 rounded-lg p-3">
              <div className="text-xs text-purple-400 font-medium mb-2">🧭 自定进化方向</div>
              <div className="text-sm text-white font-medium">{engineState.selfDirectedEvolutionPath}</div>
              <div className="text-[10px] text-slate-500 mt-1">智能体自主选择的方向，非预设路线</div>
            </div>

            {/* 涌现能力 */}
            <div className="bg-slate-800/60 rounded-lg p-3">
              <div className="text-xs text-emerald-400 font-medium mb-2">✨ 涌现能力 ({engineState.emergentAbilities.length})</div>
              {engineState.emergentAbilities.length === 0 ? (
                <div className="text-[10px] text-slate-600 italic">尚未涌现任何能力...</div>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {engineState.emergentAbilities.slice(-15).reverse().map((a, i) => (
                    <div key={i} className="bg-slate-900/50 rounded p-2 border border-emerald-900/30">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-emerald-300 font-medium">{typeof a === 'object' ? a.name : String(a)}</span>
                        <span className="text-[9px] text-slate-500">{typeof a === 'object' ? a.dimension : ''}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{typeof a === 'object' ? a.description : ''}</div>
                      <div className="mt-1 flex items-center gap-1">
                        <div className="flex-1 bg-slate-700 rounded-full h-1">
                          <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${(typeof a === 'object' && a.strength ? a.strength : 0.5) * 100}%` }} />
                        </div>
                        <span className="text-[9px] text-slate-500">{((typeof a === 'object' && a.strength ? a.strength : 0.5) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 自我反思 */}
            <div className="bg-slate-800/60 rounded-lg p-3">
              <div className="text-xs text-amber-400 font-medium mb-2">💭 自我反思 ({engineState.selfReflections.length})</div>
              {engineState.selfReflections.length === 0 ? (
                <div className="text-[10px] text-slate-600 italic">尚未开始反思...</div>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {engineState.selfReflections.slice(-10).reverse().map((r, i) => (
                    <div key={i} className="bg-slate-900/50 rounded p-2 border border-amber-900/30">
                      <div className="text-[10px] text-slate-300 leading-relaxed">{typeof r === 'object' ? r.insight : String(r)}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] text-slate-600">{typeof r === 'object' && r.depth != null ? `深度${(r.depth * 100).toFixed(1)}%` : ''}</span>
                        {typeof r === 'object' && r.paradigmShift && <span className="text-[9px] text-amber-400">→{r.paradigmShift}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 进化日志 */}
            <div className="bg-slate-800/60 rounded-lg p-3">
              <div className="text-xs text-rose-400 font-medium mb-2">📜 进化日志</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {engine.getEvolutionLog().slice(-10).reverse().map((log, i) => (
                  <div key={i} className="text-[9px] text-slate-400 leading-relaxed">{log}</div>
                ))}
              </div>
            </div>

            {/* 全局智能体进化概览 */}
            <GlobalEvolutionOverview />
          </div>
        )}
      </div>

      {/* 持久化状态指示 */}
      <div className="border-t border-slate-700/50 bg-slate-900/80 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-slate-400">状态已持久化 · 诞生{engine.getAge()}</span>
        </div>
        <button
          onClick={() => {
            if (confirm('确定要重置智能体吗？所有发现、物质和进化记录将被清除。')) {
              engine.resetState();
              setRefreshTick(t => t + 1);
            }
          }}
          className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors"
        >
          重置
        </button>
      </div>

      {/* 跨模块关联操作 */}
      <div className="border-t border-slate-700/50 bg-slate-900/80 px-3 py-2">
        <div className="mb-1.5 text-[10px] text-slate-500">自主智能体 → 关联模块</div>
        <div className="flex flex-wrap gap-1.5">
          {focusedBody && <CrossModuleLink signal="detect-craters" label="撞击坑识别" payload={{ body: focusedBody.nameCn }} />}
          <CrossModuleLink signal="plan-orbit" label="轨道规划" payload={{ fromAgent: true }} />
          <CrossModuleLink signal="analyze-remote" label="遥感分析" payload={{ fromAgent: true }} />
          <CrossModuleLink signal="view-geological" label="地质演化" payload={{ fromAgent: true }} />
          <CrossModuleLink signal="build-twin" label="构建孪生体" payload={{ fromAgent: true }} />
          <CrossModuleLink signal="classify-asteroid" label="小行星分类" payload={{ fromAgent: true }} />
          <CrossModuleLink signal="compare-gravity" label="引力对比" payload={{ fromAgent: true }} />
        </div>
      </div>
    </div>
  );
}
