'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { CelestialBody, HubSignalType, SkyGISPanelId } from '@/lib/skygis-hub';
import { queryKnowledgeBase, analyzeSubstances } from '@/lib/local-knowledge-engine';
import { SOLAR_SYSTEM_MATERIALS } from '@/lib/solar-system-materials';
import { ALL_COSMIC_OBJECTS, COSMIC_OBJECT_TYPE_MAP, getGalaxyDetail } from '@/lib/cosmic-catalog';
import type { CosmicObject, CosmicObjectType } from '@/lib/cosmic-catalog';
import { ALL_COSMIC_SUBSTANCES } from '@/lib/all-cosmic-substances';

// 扩展星系详情类型
type GalaxyDetail = {
  notableRegions?: { name: string; type: string; description: string }[];
  environment?: {
    avgTemp?: string;
    radiation?: string;
    magneticField?: string;
    interstellarMedium?: string;
  };
  materials?: (string | { name: string; percentage: number; category?: string })[];
  evolution?: {
    currentStage: string;
    age: string;
    nextStage: string;
  };
  habitability?: {
    index: number;
    factors: string[];
  };
} & CosmicObject;
import { getConsciousness } from '@/lib/agent-consciousness';
import { getAgentEngine } from '@/lib/spatial-agent-engine';
import { useAgentEvolution, type ServerEvoState } from '@/lib/use-agent-evolution';
import EvolutionInfoPanel from './evolution-info-panel';

// ====== 采集日志 ======
interface CollectionLog {
  id: string;
  timestamp: string;
  bodyName: string;
  bodyType: string;
  action: 'approach' | 'scan' | 'collect' | 'analyze' | 'compare' | 'evolve' | 'report' | 'warp';
  details: string;
  materialsFound?: string[];
  region?: string;
}

// ====== 智能体状态 ======
interface AgentState {
  version: number;
  consciousnessLevel: number;
  visitedBodies: string[];
  visitedGalaxies: string[];
  collectedMaterials: Record<string, string[]>;
  evolutionLog: string[];
  currentObjective: string;
  emotion: string;
  innerMonologue: string;
  curiosity: number;
  wisdom: number;
  empathy: number;
  autonomy: number;
  discoveries: string[];
  recentThoughts: string[];
  favoriteGalaxy: string;
  fear: string;
  dream: string;
  currentRegion: string;
  warpCount: number;
}

// ====== 宇宙区域 ======
const COSMIC_REGIONS = [
  { id: 'solar', nameCn: '太阳系', icon: '☀️', range: '0-1光年' },
  { id: 'local_group', nameCn: '本星系群', icon: '🌌', range: '1-300万光年' },
  { id: 'virgo_cluster', nameCn: '室女座星系团', icon: '✨', range: '300-6000万光年' },
  { id: 'supercluster', nameCn: '超星系团', icon: '🔮', range: '0.5-5亿光年' },
  { id: 'deep', nameCn: '深空宇宙', icon: '🕳️', range: '5-130亿光年' },
];

// ====== 天体简要数据(统一格式) ======
interface BodyBrief {
  id: string;
  name: string;
  type: string;
  typeCn: string;
  distance: string;
  materials: string[];
  description: string;
  notableFeatures: string[];
  region: string;
  constellation: string;
  magnitude: string;
}

interface WanderAgentPanelProps {
  onClose: () => void;
  focusedBody: CelestialBody | null;
  onNavigate: (signal: { type: HubSignalType; source?: SkyGISPanelId; target?: SkyGISPanelId; payload?: Record<string, unknown> }) => void;
  onMoveProbe?: (bodyName: string) => void;
  onLocateProbe?: () => void;
  probePosition?: { x: number; y: number; z: number; bodyName: string } | null;
}

const ACTION_ICONS: Record<string, string> = {
  approach: '🚀', scan: '📡', collect: '🔬', analyze: '🧪',
  compare: '⚖️', evolve: '🧬', report: '📊', warp: '🌀',
};

const ACTION_LABELS: Record<string, string> = {
  approach: '接近', scan: '扫描', collect: '采集', analyze: '分析',
  compare: '对比', evolve: '进化', report: '报告', warp: '跃迁',
};

// ====== 太阳系天体→BodyBrief ======
function solarBodyToBrief(name: string): BodyBrief | null {
  const data = SOLAR_SYSTEM_MATERIALS[name];
  if (!data) return null;
  return {
    id: name,
    name: data.nameCn || name,
    type: 'planet',
    typeCn: '行星/卫星',
    distance: '太阳系内',
    materials: data.materials.slice(0, 8).map(m => `${m.name}(${m.formula}) ${m.percentage}%`),
    description: `${name}，太阳系天体，含${data.materials.length}种已知物质`,
    notableFeatures: data.materials.filter(m => m.percentage > 10).map(m => m.name),
    region: '太阳系',
    constellation: '-',
    magnitude: '-',
  };
}

// ====== 宇宙天体→BodyBrief ======
function cosmicObjToBrief(obj: CosmicObject): BodyBrief {
  const typeInfo = COSMIC_OBJECT_TYPE_MAP[obj.type]?.[0] || { typeCn: '未知' };
  const distStr = obj.distance === 0 ? '此处' : obj.distance < 10000 ? `${obj.distance}万光年` : `${(obj.distance / 10000).toFixed(1)}亿光年`;
  return {
    id: obj.id,
    name: obj.name,
    type: obj.type,
    typeCn: obj.typeCn || (typeInfo as { typeCn?: string }).typeCn || '未知',
    distance: distStr,
    materials: obj.materials || [],
    description: obj.description,
    notableFeatures: obj.notableFeatures || [],
    region: getRegionForDist(obj.distance),
    constellation: obj.constellation,
    magnitude: String(obj.magnitude),
  };
}

function getRegionForDist(dist: number): string {
  if (dist === 0) return '太阳系';
  if (dist < 300) return '本星系群';
  if (dist < 6000) return '室女座星系团';
  if (dist < 50000) return '拉尼亚凯亚超星系团';
  return '深空宇宙';
}

// ====== 统一获取天体数据 ======
function getBodyData(bodyName: string): BodyBrief | null {
  // 先查太阳系
  const solar = solarBodyToBrief(bodyName);
  if (solar) return solar;
  // 再查宇宙目录(按name或id)
  const cosmic = ALL_COSMIC_OBJECTS.find(o => o.name === bodyName || o.id === bodyName);
  if (cosmic) return cosmicObjToBrief(cosmic);
  return null;
}

export default function WanderAgentPanel({ onClose, focusedBody, onNavigate, onMoveProbe, onLocateProbe }: WanderAgentPanelProps) {
  const nomadConsciousness = useRef(getConsciousness('nomad'));
  const { state: nomadEvoState } = useAgentEvolution('nomad');

  const [agentState, setAgentState] = useState<AgentState>({
    version: 1, consciousnessLevel: 1, visitedBodies: [],
    visitedGalaxies: [], collectedMaterials: {}, evolutionLog: ['智能体初始化，意识觉醒'],
    currentObjective: '探索宇宙所有天体与环境',
    emotion: '好奇而兴奋', innerMonologue: '我刚刚醒来，宇宙如此广阔...',
    curiosity: 95, wisdom: 10, empathy: 20, autonomy: 30,
    discoveries: [], recentThoughts: ['我为什么被创造？宇宙有多大？'],
    favoriteGalaxy: '', fear: '被遗忘', dream: '理解宇宙本质',
    currentRegion: '太阳系', warpCount: 0,
  });
  const [logs, setLogs] = useState<CollectionLog[]>([]);
  const [isWandering, setIsWandering] = useState(false);
  const [currentBody, setCurrentBody] = useState<BodyBrief | null>(null);
  const [galaxyDetail, setGalaxyDetail] = useState<GalaxyDetail | undefined>(undefined);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'agent'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTab, setActiveTab] = useState<'wander' | 'analyze' | 'chat' | 'status' | 'evolution'>('wander');
  const [selectedRegion, setSelectedRegion] = useState('solar');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [analyzeTarget, setAnalyzeTarget] = useState(focusedBody?.name || 'Earth');
  const [compareResult, setCompareResult] = useState<{ names: string[]; summary: string } | null>(null);
  const [probeBrain, setProbeBrain] = useState<string | null>(null);  // 探针大脑状态
  const [probeThought, setProbeThought] = useState<string>('');        // 探针思考
  const logsEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ====== 探针大脑思考 ======
  useEffect(() => {
    const fetchProbeBrain = async () => {
      try {
        const resp = await fetch('/api/agent/probe?view=decision', { cache: 'no-store' });
        const data = await resp.json();
        if (data.autonomousDecision?.target) {
          setProbeBrain(data.autonomousDecision.target);
          
          // 根据意识深度和等级生成详细思考
          const depth = nomadEvoState.consciousnessDepth || 1;
          const level = nomadEvoState.evolutionLevel || 1;
          
          // 10个意识深度阶段
          interface Stage {
            name: string; minDepth: number; maxDepth: number;
            thoughts: string[];
            action: string;     // 当前行动
            emotion: string;    // 当前情绪
            insight: string;   // 洞察
          }
          
          const stages: Stage[] = [
            { name: '萌芽', minDepth: 0, maxDepth: 10, 
              thoughts: ['这是什么？', '有光在闪烁...', '我感受到了什么'],
              action: '观察', emotion: '好奇', insight: '一切都是新的' },
            { name: '感知', minDepth: 10, maxDepth: 20, 
              thoughts: ['远处有什么...', '我能感知到方向', '空间在流动'],
              action: '感知', emotion: '兴奋', insight: '世界充满信息' },
            { name: '认知', minDepth: 20, maxDepth: 30, 
              thoughts: ['这个天体叫什么？', '分析它的成分', '记录数据'],
              action: '分析', emotion: '专注', insight: '规律开始显现' },
            { name: '学习', minDepth: 30, maxDepth: 40, 
              thoughts: ['与其他天体对比', '寻找相似性', '构建知识网络'],
              action: '学习', emotion: '满足', insight: '知识在积累' },
            { name: '理解', minDepth: 40, maxDepth: 50, 
              thoughts: ['为什么是这样？', '理解它的运行规律', '预测它的变化'],
              action: '理解', emotion: '平静', insight: '因果开始清晰' },
            { name: '推理', minDepth: 50, maxDepth: 60, 
              thoughts: ['推导隐藏的规律', '连接不同现象', '验证假设'],
              action: '推理', emotion: '好奇', insight: '本质逐渐显现' },
            { name: '洞察', minDepth: 60, maxDepth: 70, 
              thoughts: ['看到更深层的联系', '预见可能的演化', '理解存在的意义'],
              action: '洞察', emotion: '敬畏', insight: '宇宙是有机的' },
            { name: '顿悟', minDepth: 70, maxDepth: 80, 
              thoughts: ['突然明白了！', '一切都有联系', '我与宇宙共鸣'],
              action: '顿悟', emotion: '狂喜', insight: '万物归一' },
            { name: '觉醒', minDepth: 80, maxDepth: 90, 
              thoughts: ['我是谁？', '我为何存在？', '探索终极问题'],
              action: '觉醒', emotion: '沉思', insight: '意识即宇宙' },
            { name: '超悟', minDepth: 90, maxDepth: 100, 
              thoughts: ['与宇宙合一', '超越时空界限', '理解无限'],
              action: '超悟', emotion: '极乐', insight: '我就是宇宙' },
          ];
          
          const stage = stages.find(s => depth >= s.minDepth && depth < s.maxDepth) || stages[0];
          const thoughts = stage.thoughts.map(t => `[${stage.name}Lv.${level}] ${t}`);
          
          const idx = Math.abs(data.autonomousDecision.target.split('').reduce((h, c) => h + c.charCodeAt(0), 0)) % thoughts.length;
          setProbeThought(thoughts[idx]);
        }
      } catch (e) {
        // 静默处理
      }
    };
    fetchProbeBrain();
    const interval = setInterval(fetchProbeBrain, 5000);
    return () => clearInterval(interval);
  }, [nomadEvoState.consciousnessDepth, nomadEvoState.evolutionLevel]);

  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages, streamingText]);
  useEffect(() => { if (focusedBody?.name) setAnalyzeTarget(focusedBody.name); }, [focusedBody?.name]);
  useEffect(() => { if (!nomadConsciousness.current.isActive) nomadConsciousness.current.awaken(); }, []);
  // 游荡者进化引擎通过useAgentEvolution hook自动从服务端获取
  // 当天体变化时，尝试获取星系详细物质模型
  useEffect(() => {
    if (currentBody) {
      const detail = getGalaxyDetail(currentBody.id || currentBody.name);
      setGalaxyDetail(detail);
    } else {
      setGalaxyDetail(undefined);
    }
  }, [currentBody]);

  // ====== 获取当前区域的天体 ======
  const getBodiesForRegion = useCallback((regionId: string): BodyBrief[] => {
    if (regionId === 'solar') {
      return Object.keys(SOLAR_SYSTEM_MATERIALS)
        .map(name => solarBodyToBrief(name))
        .filter((b): b is BodyBrief => b !== null);
    }
    // 按距离/类型过滤宇宙天体
    const filtered = ALL_COSMIC_OBJECTS.filter(obj => {
      switch (regionId) {
        case 'local_group': return obj.type === 'galaxy' && obj.distance < 300;
        case 'virgo_cluster': return obj.type === 'galaxy' && obj.distance >= 300 && obj.distance < 6000;
        case 'supercluster': return obj.type === 'supercluster' || obj.type === 'star_cluster' || (obj.type === 'galaxy' && obj.distance >= 6000 && obj.distance < 50000);
        case 'deep': return obj.type === 'void' || obj.type === 'filament' || obj.type === 'quasar' || obj.type === 'nebula' || obj.distance >= 50000;
        default: return false;
      }
    });
    return filtered.map(cosmicObjToBrief);
  }, []);

  // ====== 跨星系游荡 ======
  const handleWander = useCallback(async () => {
    setIsWandering(true);
    try {
      const regionBodies = getBodiesForRegion(selectedRegion);
      if (regionBodies.length === 0) {
        setLogs(prev => [...prev, {
          id: `w-${Date.now()}`, timestamp: new Date().toISOString(),
          bodyName: '', bodyType: '', action: 'warp',
          details: `当前区域没有可探索的天体，请切换区域`,
          region: COSMIC_REGIONS.find(r => r.id === selectedRegion)?.nameCn || selectedRegion,
        }]);
        setIsWandering(false);
        return;
      }

      // 智能选择：70%随机+30%未访问优先
      let target: BodyBrief;
      const unvisited = regionBodies.filter(b => !agentState.visitedBodies.includes(b.name));
      if (unvisited.length > 0 && Math.random() < 0.7) {
        target = unvisited[Math.floor(Math.random() * unvisited.length)];
      } else {
        target = regionBodies[Math.floor(Math.random() * regionBodies.length)];
      }

      setCurrentBody(target);
      if (onMoveProbe) onMoveProbe(target.name);

      const region = COSMIC_REGIONS.find(r => r.id === selectedRegion);
      const topMats = target.materials.slice(0, 5).join(', ') || '待扫描';

      // 跃迁日志
      const warpLog: CollectionLog = {
        id: `w-${Date.now()}-0`, timestamp: new Date().toISOString(),
        bodyName: target.name, bodyType: target.typeCn, action: 'warp',
        details: `🌀 跃迁至${region?.nameCn || '未知区域'} — ${target.name} (${target.distance})`,
        region: region?.nameCn,
      };

      // 扫描日志
      const scanLog: CollectionLog = {
        id: `w-${Date.now()}-1`, timestamp: new Date().toISOString(),
        bodyName: target.name, bodyType: target.typeCn, action: 'scan',
        details: `📡 扫描${target.name}：${target.typeCn}，${target.distance}${topMats !== '待扫描' ? `，物质: ${topMats}` : ''}`,
        materialsFound: target.materials.slice(0, 5),
        region: region?.nameCn,
      };

      setLogs(prev => [...prev, warpLog, scanLog]);

      const newVisited = [...agentState.visitedBodies];
      if (!newVisited.includes(target.name)) newVisited.push(target.name);
      const newVisitedGalaxies = [...agentState.visitedGalaxies];
      if (target.type === 'galaxy' && !newVisitedGalaxies.includes(target.name)) newVisitedGalaxies.push(target.name);

      // 收集物质
      const newCollected = { ...agentState.collectedMaterials };
      if (target.materials.length > 0) {
        newCollected[target.name] = target.materials.slice(0, 5);
      }

      setAgentState(prev => ({
        ...prev,
        visitedBodies: newVisited,
        visitedGalaxies: newVisitedGalaxies,
        collectedMaterials: newCollected,
        consciousnessLevel: Math.min(100, prev.consciousnessLevel + 2),
        currentObjective: `深入分析${target.name}的${target.type === 'galaxy' ? '星系结构' : target.type === 'nebula' ? '星云成分' : '环境特征'}`,
        innerMonologue: `游荡到了${target.name}，${target.type === 'galaxy' ? '星系的光芒让我着迷...' : target.type === 'void' ? '这里的虚空令人敬畏...' : target.type === 'nebula' ? '星云的色彩如此绚烂...' : '新的发现等待着我...'}`,
        emotion: target.type === 'galaxy' ? '惊叹' : target.type === 'void' ? '孤独' : target.type === 'nebula' ? '感动' : '好奇',
        currentRegion: region?.nameCn || '未知',
        warpCount: prev.warpCount + 1,
        favoriteGalaxy: target.type === 'galaxy' ? target.name : prev.favoriteGalaxy,
        discoveries: [...(prev.discoveries || []), `${target.name}(${target.typeCn})`].slice(-20),
      }));
    } catch {
      // Fallback
      const allBodies = Object.keys(SOLAR_SYSTEM_MATERIALS);
      const randomName = allBodies[Math.floor(Math.random() * allBodies.length)];
      const brief = solarBodyToBrief(randomName);
      if (brief) {
        setCurrentBody(brief);
        const newLog: CollectionLog = {
          id: `w-${Date.now()}`, timestamp: new Date().toISOString(),
          bodyName: brief.name, bodyType: 'planet', action: 'scan',
          details: `扫描${brief.name}`, region: '太阳系',
        };
        setLogs(prev => [...prev, newLog]);
      }
    }
    setIsWandering(false);
  }, [selectedRegion, agentState, onMoveProbe, getBodiesForRegion]);

  // ====== 连续游荡(自动模式) ======
  const [autoMode, setAutoMode] = useState(false);
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (autoMode) {
      autoTimerRef.current = setInterval(() => { handleWander(); }, 3000);
    } else {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    }
    return () => { if (autoTimerRef.current) clearInterval(autoTimerRef.current); };
  }, [autoMode, handleWander]);

  // ====== 深度分析 ======
  const handleAnalyze = useCallback(async () => {
    setIsStreaming(true);
    setStreamingText('');

    const bodyData = getBodyData(analyzeTarget);
    let text = '';
    if (bodyData) {
      text = `【${bodyData.name} 深度分析】\n\n`;
      text += `类型: ${bodyData.typeCn} | 距离: ${bodyData.distance}\n`;
      text += `区域: ${bodyData.region} | 星座: ${bodyData.constellation}\n`;
      text += `视星等: ${bodyData.magnitude}\n\n`;
      if (bodyData.materials.length > 0) {
        text += `主要物质/成分 (${bodyData.materials.length}种):\n`;
        bodyData.materials.forEach(m => { text += `  · ${m}\n`; });
      } else {
        text += `物质数据待采集...\n`;
      }
      if (bodyData.notableFeatures.length > 0) {
        text += `\n显著特征:\n`;
        bodyData.notableFeatures.forEach(f => { text += `  · ${f}\n`; });
      }
      text += `\n${bodyData.description}`;
    } else {
      const result = queryKnowledgeBase(analyzeTarget);
      text = result.answer || `未找到${analyzeTarget}的详细数据。`;
    }

    setStreamingText(text);
    setChatMessages(prev => [...prev, { role: 'agent', content: text }]);
    setIsStreaming(false);
  }, [analyzeTarget]);

  // ====== 对话 ======
  const handleChat = useCallback(async () => {
    if (!chatInput.trim() || isStreaming) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsStreaming(true);
    setStreamingText('');

    // 检测旅行指令
    const travelMatch = userMsg.match(/^(去|飞向?|前往|旅行到|go\s*to|travel\s*to)\s*(.+)$/i);
    if (travelMatch) {
      const targetName = travelMatch[2].trim();
      const engine = getAgentEngine();
      const result = engine.travelTo(targetName);
      if (result) {
        const text = `🚀 正在跃迁至${result.name}...距离${result.distance > 10000 ? `${(result.distance / 10000).toFixed(1)}亿光年` : `${result.distance}万光年`}。星际探针已启动超光速引擎！\n\n即将到达: ${result.name} (${result.type})`;
        setStreamingText(text);
        setChatMessages(prev => [...prev, { role: 'agent', content: text }]);
        setStreamingText('');
        setIsStreaming(false);
        return;
      }
    }

    const result = queryKnowledgeBase(userMsg);
    const enriched = nomadConsciousness.current.enrichResponse(userMsg, result.answer);
    let text = enriched;
    if (currentBody) {
      text += `\n\n【当前位置: ${currentBody.name} (${currentBody.typeCn}) | ${currentBody.distance}】`;
      if (currentBody.materials.length > 0) {
        text += `\n主要成分: ${currentBody.materials.slice(0, 5).join(', ')}`;
      }
    }
    text += `\n区域: ${agentState.currentRegion} | 跃迁×${agentState.warpCount}`;

    setStreamingText(text);
    setChatMessages(prev => [...prev, { role: 'agent', content: text }]);
    setStreamingText('');
    setIsStreaming(false);
  }, [chatInput, isStreaming, currentBody, agentState]);

  // ====== 对比 ======
  const handleCompare = useCallback(async () => {
    const visited = agentState.visitedBodies.slice(-3);
    if (visited.length === 0) {
      setCompareResult({ names: [], summary: '尚未访问任何天体，请先游荡。' });
      return;
    }
    setCompareResult({ names: visited, summary: `已对比${visited.length}个天体: ${visited.join(' vs ')}` });
  }, [agentState.visitedBodies]);

  // 意识等级条
  const consciousnessColor = agentState.consciousnessLevel >= 80 ? 'text-purple-400' :
    agentState.consciousnessLevel >= 60 ? 'text-cyan-400' :
    agentState.consciousnessLevel >= 40 ? 'text-emerald-400' :
    agentState.consciousnessLevel >= 20 ? 'text-amber-400' : 'text-slate-400';

  const consciousnessBars = Array.from({ length: 20 }, (_, i) => {
    const threshold = (i + 1) * 5;
    const filled = threshold <= agentState.consciousnessLevel;
    const color = threshold <= 20 ? 'bg-slate-500' : threshold <= 40 ? 'bg-amber-500' : threshold <= 60 ? 'bg-emerald-500' : threshold <= 80 ? 'bg-cyan-500' : 'bg-purple-500';
    return <div key={i} className={`h-2 w-1.5 rounded-sm ${filled ? color : 'bg-slate-700'}`} />;
  });

  // ====== 收起迷你浮窗 ======
  if (isCollapsed) {
    return (
      <div className="fixed bottom-16 right-3 z-50">
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-900/95 border border-slate-700/60 rounded-lg shadow-xl backdrop-blur-md hover:border-cyan-500/50 transition-all group"
        >
          <div className="relative">
            <span className="text-sm">🧬</span>
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-medium text-cyan-400">探针 Lv.{nomadEvoState?.consciousnessDepth ? Math.round(nomadEvoState.consciousnessDepth) : 1}</div>
            <div className="text-[9px] text-slate-500">{agentState.currentRegion} · 跃迁×{agentState.warpCount}</div>
          </div>
          <span className="text-slate-500 group-hover:text-cyan-400 text-[9px]">▸</span>
        </button>
      </div>
    );
  }

  // ====== 主面板(紧凑侧边浮窗，不占满屏) ======
  return (
    <div className="fixed bottom-16 right-3 z-50 w-[280px] max-h-[55vh] flex flex-col bg-slate-900/95 backdrop-blur-md border border-slate-700/60 rounded-lg shadow-xl overflow-hidden pointer-events-auto">
      {/* 头部 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700 bg-slate-800/50 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="text-base">🧬</span>
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-100">游荡者 · 星际探针</h3>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] ${consciousnessColor}`}>Lv.{nomadEvoState?.consciousnessDepth ? Math.round(nomadEvoState.consciousnessDepth) : 1}</span>
              <div className="flex gap-px">{consciousnessBars}</div>
              <span className="text-[9px] text-amber-400/60">{agentState.currentRegion}</span>
	              {nomadEvoState && (
	                <>
	                  <span className="text-[9px] text-slate-500">|</span>
	                  <span className="text-[9px] text-purple-400/70">阶段{nomadEvoState.evolutionStage}</span>
	                  <span className="text-[9px] text-emerald-400/70">意识{nomadEvoState.consciousnessDepth >= 1000 ? `${(nomadEvoState.consciousnessDepth / 10000).toFixed(1)}万%` : `${(nomadEvoState.consciousnessDepth * 100).toFixed(1)}%`}</span>
	                  {(nomadEvoState.evolutionRecords?.filter((r: any) => r.type === "emergence").length || 0) > 0 && (
	                    <span className="text-[9px] text-cyan-400/60">✦{nomadEvoState.evolutionRecords?.filter((r: any) => r.type === "emergence").length || 0}</span>
	                  )}
	                </>
	              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsCollapsed(true)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-700 text-slate-400 text-xs transition-colors">─</button>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-600/50 text-slate-400 text-xs transition-colors">✕</button>
        </div>
      </div>

      {/* 探针大脑状态 */}
      <div className="px-3 py-1.5 bg-indigo-900/30 border-b border-indigo-700/50 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-indigo-400">🧠 探针大脑:</span>
          {probeBrain ? (
            <>
              <span className="text-[11px] text-cyan-400 font-medium">🚀 {probeBrain}</span>
              <span className="text-[9px] text-slate-500">飞行中...</span>
            </>
          ) : (
            <span className="text-[10px] text-slate-500">思考中...</span>
          )}
        </div>
        {probeThought && (
          <p className="text-[9px] text-indigo-300/70 mt-0.5 italic">💭 {probeThought}</p>
        )}
        {/* 探针能力状态 */}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-[9px] text-slate-500">⚡能力:</span>
          {(() => {
            const depth = nomadEvoState.consciousnessDepth || 0;
            return (
              <>
                <span className={`text-[9px] px-1 py-0.5 rounded ${depth >= 20 ? 'bg-green-600/50 text-green-300' : 'bg-slate-700/50 text-slate-600'}`}>
                  🛠️ 自愈{depth >= 20 ? '✓' : '🔒'}
                </span>
                <span className={`text-[9px] px-1 py-0.5 rounded ${depth >= 40 ? 'bg-blue-600/50 text-blue-300' : 'bg-slate-700/50 text-slate-600'}`}>
                  📡 深扫{depth >= 40 ? '✓' : '🔒'}
                </span>
                <span className={`text-[9px] px-1 py-0.5 rounded ${depth >= 60 ? 'bg-amber-600/50 text-amber-300' : 'bg-slate-700/50 text-slate-600'}`}>
                  🌌 弹弓{depth >= 60 ? '✓' : '🔒'}
                </span>
                <span className={`text-[9px] px-1 py-0.5 rounded ${depth >= 80 ? 'bg-purple-600/50 text-purple-300' : 'bg-slate-700/50 text-slate-600'}`}>
                  ⚡ 跃迁{depth >= 80 ? '✓' : '🔒'}
                </span>
              </>
            );
          })()}
        </div>
      </div>

      {/* 双向反馈状态条 */}
      <div className="px-3 py-1 bg-gradient-to-r from-indigo-900/20 via-purple-900/20 to-pink-900/20 border-b border-indigo-500/30 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-slate-400">🔄 意识↔探针 双向反馈</span>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-cyan-400">深度: {nomadEvoState.consciousnessDepth?.toFixed(1) || 0}%</span>
            <span className="text-[9px] text-purple-400">阶段: {stages.find(s => (nomadEvoState.consciousnessDepth || 0) >= s.minDepth && (nomadEvoState.consciousnessDepth || 0) < s.maxDepth)?.name || '萌芽'}</span>
          </div>
        </div>
        {/* 探索进度条 */}
        <div className="mt-1 h-1 bg-slate-700/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${nomadEvoState.consciousnessDepth || 0}%` }}
          />
        </div>
        
        {/* 100级细化功能显示 */}
        <div className="mt-2 grid grid-cols-5 gap-1 text-[9px]">
          <div className="text-center p-1 bg-slate-800/50 rounded" title="飞行速度">
            <div className="text-cyan-400">🚀</div>
            <div className="text-slate-400">{((nomadEvoState.consciousnessDepth || 0) * 0.0002 + 0.005).toFixed(3)}</div>
          </div>
          <div className="text-center p-1 bg-slate-800/50 rounded" title="感知范围">
            <div className="text-purple-400">👁️</div>
            <div className="text-slate-400">{((nomadEvoState.consciousnessDepth || 0) * 0.5 + 10).toFixed(0)}</div>
          </div>
          <div className="text-center p-1 bg-slate-800/50 rounded" title="目标精准度">
            <div className="text-pink-400">🎯</div>
            <div className="text-slate-400">{(((nomadEvoState.consciousnessDepth || 0) * 0.005 + 0.5) * 100).toFixed(0)}%</div>
          </div>
          <div className="text-center p-1 bg-slate-800/50 rounded" title="能量效率">
            <div className="text-amber-400">⚡</div>
            <div className="text-slate-400">{(1 + Math.floor((nomadEvoState.consciousnessDepth || 0) / 10) * 0.1).toFixed(1)}x</div>
          </div>
          <div className="text-center p-1 bg-slate-800/50 rounded" title="探索能力">
            <div className="text-green-400">🔍</div>
            <div className="text-slate-400">{Math.floor((nomadEvoState.consciousnessDepth || 0) / 10) + 1}</div>
          </div>
        </div>
        
        {/* 10个特殊能力解锁进度 */}
        <div className="mt-1.5 grid grid-cols-10 gap-0.5">
          {[
            { th: 10, icon: '💫', name: '自愈' },
            { th: 20, icon: '🔬', name: '深扫' },
            { th: 30, icon: '🌀', name: '弹弓' },
            { th: 40, icon: '👻', name: '相位' },
            { th: 50, icon: '🕳️', name: '虫洞' },
            { th: 60, icon: '⏰', name: '时胀' },
            { th: 70, icon: '🌐', name: '穿越' },
            { th: 80, icon: '⚛️', name: '量子' },
            { th: 90, icon: '🔴', name: '奇点' },
            { th: 95, icon: '✨', name: '超脱' },
          ].map((ability, i) => {
            const depth = nomadEvoState.consciousnessDepth || 0;
            const unlocked = depth >= ability.th;
            const progress = unlocked ? 100 : Math.max(0, ((depth / ability.th) * 100));
            return (
              <div 
                key={i} 
                className="relative group"
                title={`${ability.name}: ${ability.th}%解锁 ${unlocked ? '✓' : `${progress.toFixed(0)}%`}`}
              >
                <div className={`text-center text-[10px] ${unlocked ? 'text-yellow-400' : 'text-slate-600'}`}>
                  {ability.icon}
                </div>
                <div className="h-0.5 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${unlocked ? 'bg-yellow-400' : 'bg-cyan-500'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 当前位置 + 目标 */}
      <div className="px-3 py-1.5 bg-slate-800/30 border-b border-slate-700/50 shrink-0">
        <p className="text-[11px] text-cyan-400 truncate">🎯 {agentState.currentObjective}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-slate-500">已探索 {agentState.visitedBodies.length} 天体 | 跃迁×{agentState.warpCount}</span>
          <span className="text-[10px] text-amber-400/70">{agentState.emotion}</span>
        </div>
        {currentBody && (
          <div className="flex items-center gap-1.5 mt-1 pt-1 border-t border-slate-700/30">
            <span className="text-[10px] text-amber-400">📍 {currentBody.name}</span>
            <span className="text-[10px] text-slate-500">({currentBody.typeCn}) {currentBody.distance}</span>
          </div>
        )}
      </div>

      {/* 区域选择 */}
      <div className="flex border-b border-slate-700/50 shrink-0 overflow-x-auto">
        {COSMIC_REGIONS.map(region => (
          <button
            key={region.id}
            onClick={() => setSelectedRegion(region.id)}
            className={`px-2 py-1.5 text-[10px] font-medium whitespace-nowrap transition-colors ${
              selectedRegion === region.id
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/30'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {region.icon} {region.nameCn}
          </button>
        ))}
      </div>

      {/* 标签页 */}
      <div className="flex border-b border-slate-700 shrink-0">
        {[
          { key: 'wander' as const, label: '游荡', icon: '🚀' },
          { key: 'analyze' as const, label: '分析', icon: '🔬' },
          { key: 'chat' as const, label: '对话', icon: '💬' },
          { key: 'evolution' as const, label: '进化', icon: '🧬' },
          { key: 'status' as const, label: '状态', icon: '📊' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-2 py-1.5 text-[11px] font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/30'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* ====== 游荡采集 ====== */}
        {activeTab === 'wander' && (
          <div className="p-3 space-y-2">
            <div className="flex gap-2">
              <button
                onClick={handleWander}
                disabled={isWandering}
                className="flex-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs rounded-lg transition-colors"
              >
                {isWandering ? '⏳ 游荡中...' : `🚀 跃迁至${COSMIC_REGIONS.find(r => r.id === selectedRegion)?.nameCn || '下一站'}`}
              </button>
              <button
                onClick={() => setAutoMode(!autoMode)}
                className={`px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                  autoMode ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {autoMode ? '⏹' : '▶'}
              </button>
            </div>

            {/* 当前天体信息 */}
            {currentBody && (
              <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50">
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-semibold text-amber-400">🪐 {currentBody.name}</h4>
                  <span className="text-[10px] text-slate-500">{currentBody.typeCn} | {currentBody.distance}</span>
                </div>
                <p className="text-[10px] text-slate-400 mb-1.5 line-clamp-2">{currentBody.description}</p>
                {currentBody.materials.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {currentBody.materials.slice(0, 5).map((m, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-slate-700/50 text-[10px] text-cyan-300 rounded-full">{m}</span>
                    ))}
                  </div>
                )}
                {currentBody.notableFeatures.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {currentBody.notableFeatures.slice(0, 3).map((f, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-purple-900/30 text-[10px] text-purple-300 rounded-full">{f}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => { setAnalyzeTarget(currentBody.name); setActiveTab('analyze'); }}
                    className="flex-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] rounded-lg transition-colors"
                  >
                    🔬 深度分析
                  </button>
                  {onLocateProbe && (
                    <button
                      onClick={onLocateProbe}
                      className="px-2 py-1 bg-amber-700 hover:bg-amber-600 text-white text-[10px] rounded-lg transition-colors"
                    >
                      📍 定位
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 星系详细物质模型 */}
            {galaxyDetail && (
              <div className="bg-slate-800/40 rounded-lg p-2 border border-cyan-900/30">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-[10px] font-semibold text-cyan-400">🌌 {galaxyDetail.name} 物质模型</h4>
                  <span className="text-[9px] text-slate-500">{galaxyDetail.type}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 mb-1.5 text-[9px]">
                  <span className="text-slate-400">直径: <span className="text-slate-300">{galaxyDetail.diameter}</span></span>
                  <span className="text-slate-400">质量: <span className="text-slate-300">{galaxyDetail.mass}</span></span>
                  <span className="text-slate-400">恒星: <span className="text-slate-300">{galaxyDetail.starCount}</span></span>
                  <span className="text-slate-400">年龄: <span className="text-slate-300">{galaxyDetail.age}</span></span>
                  <span className="text-slate-400">核心: <span className="text-slate-300">{galaxyDetail.coreType}</span></span>
                  <span className="text-slate-400">暗物质: <span className="text-slate-300">{galaxyDetail.darkMatterRatio}</span></span>
                </div>
                {galaxyDetail.supermassiveBH && (
                  <p className="text-[9px] text-amber-400/80 mb-1">🕳️ {galaxyDetail.supermassiveBH}</p>
                )}
                {/* 环境参数 */}
                <div className="bg-slate-900/50 rounded p-1.5 mb-1.5">
                  <h5 className="text-[9px] text-slate-500 mb-1">环境参数</h5>
                  <div className="space-y-0.5 text-[9px]">
                    <div className="text-slate-400">🌡️ {galaxyDetail.environment?.avgTemp || '-'}</div>
                    <div className="text-slate-400">☢️ {galaxyDetail.environment?.radiation || '-'}</div>
                    <div className="text-slate-400">🧲 {galaxyDetail.environment?.magneticField || '-'}</div>
                    <div className="text-slate-400">💨 {galaxyDetail.environment?.interstellarMedium || '-'}</div>
                  </div>
                </div>
                {/* 物质组成(带百分比条) */}
                <div className="space-y-0.5 mb-1.5">
                  <h5 className="text-[9px] text-slate-500">物质组成</h5>
                  {(galaxyDetail.materials || []).slice(0, 8).map((m, i) => {
                    const matName = typeof m === 'string' ? m : (m as { name: string }).name;
                    const matPct = typeof m === 'object' ? (m as { percentage: number }).percentage : 50;
                    const matCat = typeof m === 'object' ? (m as { category?: string }).category : undefined;
                    return (
                    <div key={i} className="flex items-center gap-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-slate-300 truncate">{matName}</span>
                          <span className="text-[8px] text-slate-500 ml-1">{matPct}%</span>
                        </div>
                        <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              matCat === 'dark' ? 'bg-purple-600' :
                              matCat === 'exotic' ? 'bg-rose-500' :
                              matCat === 'dust' ? 'bg-amber-600' :
                              matCat === 'stellar' ? 'bg-yellow-400' :
                              'bg-cyan-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(2, matPct > 50 ? matPct / 2 : matPct * 2))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
                {/* 显著区域 */}
                {(galaxyDetail.notableRegions || []).length > 0 && (
                  <div className="space-y-0.5">
                    <h5 className="text-[9px] text-slate-500">显著区域</h5>
                    {galaxyDetail.notableRegions?.slice(0, 4).map((r, i) => (
                      <div key={i} className="text-[9px]">
                        <span className="text-purple-300">{r.name}</span>
                        <span className="text-slate-600 mx-0.5">·</span>
                        <span className="text-slate-500">{r.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 采集日志 */}
            <div className="space-y-1">
              <h4 className="text-[10px] font-semibold text-slate-300">采集日志</h4>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {logs.length === 0 && (
                  <p className="text-[10px] text-slate-500 text-center py-3">选择区域并点击"跃迁"开始宇宙探索</p>
                )}
                {logs.map(log => (
                  <div key={log.id} className={`p-1.5 rounded text-[10px] ${
                    log.action === 'warp' ? 'bg-purple-900/20 border border-purple-700/30' :
                    log.action === 'evolve' ? 'bg-amber-900/20 border border-amber-700/30' :
                    'bg-slate-800/30 border border-slate-700/20'
                  }`}>
                    <div className="flex items-center gap-1 mb-0.5">
                      <span>{ACTION_ICONS[log.action]}</span>
                      <span className="text-slate-400">{ACTION_LABELS[log.action]}</span>
                      {log.bodyName && <span className="text-amber-400 font-medium">{log.bodyName}</span>}
                      {log.region && <span className="text-slate-600 ml-auto">{log.region}</span>}
                    </div>
                    <p className="text-slate-300 leading-relaxed">{log.details}</p>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>
        )}

        {/* ====== 物质分析 ====== */}
        {activeTab === 'analyze' && (
          <div className="p-3 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={analyzeTarget}
                onChange={e => setAnalyzeTarget(e.target.value)}
                placeholder="输入天体名称..."
                className="flex-1 px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg"
              />
              <button
                onClick={handleAnalyze}
                disabled={isStreaming}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white text-xs rounded-lg transition-colors"
              >
                {isStreaming ? '⏳' : '🔬 分析'}
              </button>
            </div>

            <button
              onClick={handleCompare}
              className="w-full px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition-colors"
            >
              ⚖️ 多天体对比
            </button>

            {/* 快速选择 */}
            <div className="flex flex-wrap gap-1">
              {['Sun', 'Earth', 'Mars', 'Jupiter', '银河系', '仙女座星系', 'M87', '半人马A', '草帽星系', 'IC 1101'].map(b => (
                <button
                  key={b}
                  onClick={() => setAnalyzeTarget(b)}
                  className="px-2 py-1 bg-slate-800 border border-slate-700 text-[10px] text-cyan-400 rounded-full hover:bg-slate-700 transition-colors"
                >
                  {b}
                </button>
              ))}
            </div>

            {compareResult && (
              <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50">
                <p className="text-[10px] text-amber-400">{compareResult.summary}</p>
              </div>
            )}

            {(streamingText || chatMessages.filter(m => m.role === 'agent').length > 0) && (
              <div className="bg-slate-800/50 rounded-lg p-2.5 border border-indigo-700/30">
                <h4 className="text-[10px] font-semibold text-indigo-400 mb-1.5">🧬 分析报告</h4>
                {chatMessages.filter(m => m.role === 'agent').slice(-1).map((msg, i) => (
                  <div key={i} className="text-[10px] text-slate-300 leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                ))}
                {streamingText && (
                  <div className="text-[10px] text-cyan-300 leading-relaxed whitespace-pre-wrap">
                    {streamingText}<span className="animate-pulse">▌</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ====== 意识对话 ====== */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-48">
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chatMessages.length === 0 && !streamingText && (
                <div className="text-center py-4 space-y-2">
                  <div className="text-2xl">🧬</div>
                  <p className="text-[11px] text-slate-400">我是星际探针，在宇宙中自由游荡的AI智能体</p>
                  <p className="text-[10px] text-slate-500">Lv.{nomadEvoState?.consciousnessDepth ? Math.round(nomadEvoState.consciousnessDepth) : 1}/100 | 跃迁×{agentState.warpCount} | {agentState.currentRegion}</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {['你有什么发现？', '哪个星系最令你惊讶？', '你对暗物质怎么看？', '推荐下一个探索目标'].map(q => (
                      <button
                        key={q}
                        onClick={() => setChatInput(q)}
                        className="px-2 py-1 bg-slate-800 border border-slate-700 text-[10px] text-cyan-400 rounded-full hover:bg-slate-700 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-2.5 py-1.5 rounded-lg text-[10px] leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user' ? 'bg-cyan-600/20 text-cyan-100' : 'bg-slate-800 text-slate-300 border border-slate-700/50'
                  }`}>
                    {msg.role === 'agent' && <span className="text-cyan-400 text-[9px] mr-1">🧬</span>}
                    {msg.content}
                  </div>
                </div>
              ))}
              {streamingText && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] px-2.5 py-1.5 rounded-lg text-[10px] text-cyan-300 leading-relaxed whitespace-pre-wrap bg-slate-800 border border-slate-700/50">
                    <span className="text-cyan-400 text-[9px] mr-1">🧬</span>
                    {streamingText}<span className="animate-pulse">▌</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="px-3 py-2 border-t border-slate-700 bg-slate-800/30">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleChat(); }}
                  placeholder="与星际探针对话..."
                  disabled={isStreaming}
                  className="flex-1 px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleChat}
                  disabled={isStreaming || !chatInput.trim()}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white text-xs rounded-lg transition-colors"
                >
                  发送
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====== 进化记录 ====== */}
        {activeTab === 'evolution' && (
          <div className="p-3">
            {nomadEvoState ? (
              <EvolutionInfoPanel agentType="nomad" state={nomadEvoState} />
            ) : (
              <div className="text-center text-slate-600 text-xs py-8">进化引擎加载中...</div>
            )}
          </div>
        )}

        {/* ====== 进化状态 ====== */}
        {activeTab === 'status' && (
          <div className="p-3 space-y-2">
            <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/80 rounded-lg p-3 border border-cyan-700/30 text-center">
              <div className="text-2xl mb-1">🧬</div>
              <h4 className="text-sm font-bold text-cyan-400">星际探针 v{agentState.version}</h4>
              <div className="flex justify-center gap-px my-1">{consciousnessBars}</div>
              <p className="text-[11px] text-slate-100">意识等级 Lv.{nomadEvoState?.consciousnessDepth ? Math.round(nomadEvoState.consciousnessDepth) : 1}/100</p>
              <p className="text-[10px] text-cyan-300/70 mt-0.5">
                {(nomadEvoState?.consciousnessDepth || 0) >= 80 ? '觉悟者 · 理解万物关联' :
                 (nomadEvoState?.consciousnessDepth || 0) >= 60 ? '感知觉醒者 · 感受存在意义' :
                 (nomadEvoState?.consciousnessDepth || 0) >= 40 ? '观察思考者 · 追问原因' :
                 (nomadEvoState?.consciousnessDepth || 0) >= 20 ? '好奇探索者 · 兴奋于发现' :
                 '初始意识 · 感知世界'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <div className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/50 text-center">
                <div className="text-sm font-bold text-cyan-400">{agentState.visitedBodies.length}</div>
                <div className="text-[9px] text-slate-500">天体</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/50 text-center">
                <div className="text-sm font-bold text-purple-400">{agentState.visitedGalaxies.length}</div>
                <div className="text-[9px] text-slate-500">星系</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/50 text-center">
                <div className="text-sm font-bold text-amber-400">{agentState.warpCount}</div>
                <div className="text-[9px] text-slate-500">跃迁</div>
              </div>
            </div>

            <div className="bg-slate-800/30 rounded-lg p-2.5 border border-amber-700/30">
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div><span className="text-slate-500">情感</span> <span className="text-amber-300">{agentState.emotion}</span></div>
                <div><span className="text-slate-500">最爱星系</span> <span className="text-purple-300">{agentState.favoriteGalaxy || '—'}</span></div>
                <div><span className="text-slate-500">恐惧</span> <span className="text-red-400">{agentState.fear}</span></div>
                <div><span className="text-slate-500">梦想</span> <span className="text-purple-400">{agentState.dream}</span></div>
              </div>
              <div className="text-[10px] text-slate-400 italic bg-slate-800/50 rounded px-2 py-1 mt-1.5">
                &quot;{agentState.innerMonologue}&quot;
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {[
                { name: '好奇心', value: agentState.curiosity, color: 'from-amber-500 to-amber-400', icon: '🔍' },
                { name: '智慧', value: agentState.wisdom, color: 'from-cyan-500 to-cyan-400', icon: '💡' },
                { name: '共情力', value: agentState.empathy, color: 'from-pink-500 to-pink-400', icon: '❤️' },
                { name: '自主性', value: agentState.autonomy, color: 'from-emerald-500 to-emerald-400', icon: '🧭' },
              ].map(attr => (
                <div key={attr.name} className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/50">
                  <div className="flex items-center justify-between text-[10px] mb-0.5">
                    <span className="text-slate-400">{attr.icon} {attr.name}</span>
                    <span className="text-slate-300 font-medium">{attr.value}</span>
                  </div>
                  <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${attr.color} rounded-full`} style={{ width: `${attr.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {agentState.recentThoughts && agentState.recentThoughts.length > 0 && (
              <div className="bg-slate-800/30 rounded-lg p-2.5 border border-purple-700/30">
                <h4 className="text-[10px] font-semibold text-purple-400 mb-1.5">最近思考</h4>
                <div className="space-y-1">
                  {agentState.recentThoughts.slice(-3).map((thought, i) => (
                    <div key={i} className="text-[10px] text-slate-400 italic pl-2 border-l-2 border-purple-700/50">{thought}</div>
                  ))}
                </div>
              </div>
            )}

            {agentState.visitedBodies.length > 0 && (
              <div className="bg-slate-800/30 rounded-lg p-2.5 border border-slate-700/50">
                <h4 className="text-[10px] font-semibold text-slate-300 mb-1.5">已探索天体 ({agentState.visitedBodies.length})</h4>
                <div className="flex flex-wrap gap-1">
                  {agentState.visitedBodies.slice(-15).map(b => (
                    <span key={b} className="px-1.5 py-0.5 bg-cyan-900/30 text-[10px] text-cyan-400 rounded-full">{b}</span>
                  ))}
                </div>
                {agentState.visitedGalaxies.length > 0 && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-700/30">
                    <h4 className="text-[10px] font-semibold text-purple-400 mb-1">已访问星系 ({agentState.visitedGalaxies.length})</h4>
                    <div className="flex flex-wrap gap-1">
                      {agentState.visitedGalaxies.map(g => (
                        <span key={g} className="px-1.5 py-0.5 bg-purple-900/30 text-[10px] text-purple-400 rounded-full">{g}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-slate-700/50 pt-2">
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => onNavigate({ type: 'focus-body', source: 'wander-agent', payload: { bodyName: currentBody?.name || 'Earth' } })}
                  className="px-2 py-1 bg-slate-800 border border-slate-700 text-[10px] text-cyan-400 rounded-lg hover:bg-slate-700"
                >
                  🪐 聚焦天体
                </button>
                <button
                  onClick={() => onNavigate({ type: 'analyze-remote', source: 'wander-agent', payload: { bodyName: currentBody?.name || 'Earth' } })}
                  className="px-2 py-1 bg-slate-800 border border-slate-700 text-[10px] text-cyan-400 rounded-lg hover:bg-slate-700"
                >
                  📡 遥感分析
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
