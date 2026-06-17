'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { type CelestialBody, type DigitalTwinState, type HubSignal, type SkyGISPanelId } from '@/lib/skygis-hub';
import CrossModuleLink from './cross-module-link';

/* ───────────── Types ───────────── */
interface DataSource {
  id: string;
  name: string;
  url: string;
  status: 'online' | 'offline' | 'syncing';
  lastSync: string;
  records: number;
  precision: string;
}

interface TwinBody {
  id: string;
  name: string;
  type: string;
  precision: string;
  dataAge: string;
  modelStatus: 'loaded' | 'partial' | 'stale';
  texture: boolean;
  orbit: boolean;
  surface: boolean;
  children: TwinBody[];
}

interface EvoEvent {
  time: string;       // e.g. "-4600Ma"
  label: string;
  description: string;
  sceneType: 'nebula' | 'accretion' | 'bombardment' | 'cooling' | 'modern';
}

/* ───────────── Static Data ───────────── */
const DATA_SOURCES: DataSource[] = [
  { id: 'nasa_pds', name: 'NASA PDS', url: 'pds.nasa.gov', status: 'online', lastSync: '2026-05-30 14:20', records: 2840000, precision: 'cm级' },
  { id: 'esa_gaia', name: 'ESA Gaia DR3', url: 'gea.esac.esa.int', status: 'online', lastSync: '2026-05-30 12:00', records: 1811000000, precision: 'μas级' },
  { id: 'jpl_horizons', name: 'JPL Horizons', url: 'ssd.jpl.nasa.gov', status: 'online', lastSync: '2026-05-30 14:30', records: 1200000, precision: 'km级' },
  { id: 'usgs_astro', name: 'USGS Astrogeology', url: 'astrogeology.usgs.gov', status: 'syncing', lastSync: '2026-05-30 10:45', records: 450000, precision: 'm级' },
  { id: 'minor_planet', name: 'MPC小行星中心', url: 'minorplanetcenter.net', status: 'online', lastSync: '2026-05-30 14:15', records: 1300000, precision: '10km级' },
];

const TWIN_TREE: TwinBody[] = [
  {
    id: 'sun', name: '太阳', type: 'star', precision: 'cm级', dataAge: '2分钟前', modelStatus: 'loaded', texture: true, orbit: true, surface: false,
    children: [
      { id: 'mercury', name: '水星', type: 'planet', precision: 'm级', dataAge: '4小时前', modelStatus: 'loaded', texture: true, orbit: true, surface: true, children: [] },
      { id: 'venus', name: '金星', type: 'planet', precision: 'm级', dataAge: '6小时前', modelStatus: 'loaded', texture: true, orbit: true, surface: true, children: [] },
      {
        id: 'earth', name: '地球', type: 'planet', precision: 'cm级', dataAge: '实时', modelStatus: 'loaded', texture: true, orbit: true, surface: true,
        children: [
          { id: 'moon', name: '月球', type: 'moon', precision: 'm级', dataAge: '1小时前', modelStatus: 'loaded', texture: true, orbit: true, surface: true, children: [] },
        ]
      },
      { id: 'mars', name: '火星', type: 'planet', precision: 'm级', dataAge: '3小时前', modelStatus: 'loaded', texture: true, orbit: true, surface: true, children: [] },
      {
        id: 'jupiter', name: '木星', type: 'planet', precision: '10km级', dataAge: '12小时前', modelStatus: 'partial', texture: true, orbit: true, surface: false,
        children: [
          { id: 'io', name: '木卫一', type: 'moon', precision: '100m级', dataAge: '1天前', modelStatus: 'partial', texture: true, orbit: true, surface: true, children: [] },
          { id: 'europa', name: '木卫二', type: 'moon', precision: '100m级', dataAge: '1天前', modelStatus: 'partial', texture: true, orbit: true, surface: true, children: [] },
        ]
      },
      { id: 'saturn', name: '土星', type: 'planet', precision: '10km级', dataAge: '1天前', modelStatus: 'partial', texture: true, orbit: true, surface: false, children: [] },
      { id: 'uranus', name: '天王星', type: 'planet', precision: '100km级', dataAge: '3天前', modelStatus: 'stale', texture: true, orbit: true, surface: false, children: [] },
      { id: 'neptune', name: '海王星', type: 'planet', precision: '100km级', dataAge: '5天前', modelStatus: 'stale', texture: true, orbit: true, surface: false, children: [] },
    ]
  }
];

const EVO_EVENTS: EvoEvent[] = [
  { time: '-4600', label: '星云坍缩', description: '太阳星云在引力作用下开始坍缩，角动量守恒导致旋转加速，形成扁平原行星盘。', sceneType: 'nebula' },
  { time: '-4567', label: '太阳点火', description: '核心温度达到1000万K，氢聚变反应启动，太阳进入主序星阶段，剩余物质形成行星。', sceneType: 'accretion' },
  { time: '-4540', label: '行星胚胎', description: '微行星吸积形成行星胚胎，内太阳系形成类地行星，外太阳系形成气态巨行星。', sceneType: 'accretion' },
  { time: '-4500', label: '大碰撞假说', description: '火星大小的原行星忒伊亚撞击原始地球，抛射物形成月球。地球自转轴倾斜23.5°。', sceneType: 'bombardment' },
  { time: '-4100', label: '晚期重轰炸', description: '木星/土星轨道共振引发小行星带扰动，大量小天体被抛入内太阳系，持续约3亿年。', sceneType: 'bombardment' },
  { time: '-3800', label: '酒海纪开始', description: '月球形成雨海等大型撞击盆地，地球海洋可能在此期间形成，最早的生命证据出现。', sceneType: 'cooling' },
  { time: '-2500', label: '大氧化事件', description: '蓝藻光合作用产生大量氧气，地球大气从还原性转为氧化性，铁帽矿床形成。', sceneType: 'cooling' },
  { time: '-540', label: '寒武纪大爆发', description: '复杂多细胞生物爆发式演化，地球生物圈发生根本性改变。', sceneType: 'modern' },
  { time: '-66', label: 'K-Pg大灭绝', description: '直径10km小行星撞击尤卡坦半岛，恐龙灭绝，哺乳动物崛起。', sceneType: 'bombardment' },
  { time: '0', label: '现代', description: '人类文明时代，深空探测开启，旅行者号飞出日球层。', sceneType: 'modern' },
];

/* ───────────── Component ───────────── */
interface Props {
  onClose: () => void;
  focusedBody?: CelestialBody | null;
  twinState?: DigitalTwinState;
  onTwinUpdate?: (state: DigitalTwinState) => void;
  onNavigate?: (signal: Omit<HubSignal, 'timestamp'>) => void;
}

export default function DigitalTwinPanel({ onClose, focusedBody, twinState, onTwinUpdate, onNavigate }: Props) {
  const [tab, setTab] = useState<'twin' | 'simulation'>('twin');
  const [precision, setPrecision] = useState('m级');
  const [updateInterval, setUpdateInterval] = useState(15);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [twinBuilt, setTwinBuilt] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['sun', 'earth', 'jupiter']));
  const [simTime, setSimTime] = useState(-4600);
  const [simRunning, setSimRunning] = useState(false);
  const [simSpeed, setSimSpeed] = useState(100);
  const [simScene, setSimScene] = useState<EvoEvent | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const simTimeRef = useRef(simTime);

  // Build solar twin simulation
  const buildTwin = useCallback(() => {
    setIsBuilding(true);
    setBuildProgress(0);
    const steps = [
      { pct: 10, msg: '连接NASA PDS...' },
      { pct: 25, msg: '获取ESA Gaia DR3数据...' },
      { pct: 40, msg: '加载JPL Horizons轨道数据...' },
      { pct: 55, msg: '构建层级化3D模型...' },
      { pct: 70, msg: 'S3M格式转换...' },
      { pct: 85, msg: '建立对象级更新队列...' },
      { pct: 95, msg: '数据索引生成...' },
      { pct: 100, msg: '数字孪生体就绪!' },
    ];
    let i = 0;
    const iv = setInterval(() => {
      i++;
      if (i < steps.length) {
        setBuildProgress(steps[i].pct);
      } else {
        clearInterval(iv);
        setIsBuilding(false);
        setTwinBuilt(true);
        // 同步数字孪生状态到kkk
        onTwinUpdate?.({
          enabled: true,
          activeNodes: [],
          simulationTime: Date.now(),
          dataStreams: {},
          built: true,
          precision: precision,
          updateInterval: `${updateInterval}min`,
          bodyCount: 10,
          lastUpdate: new Date().toISOString(),
          bodies: focusedBody ? [focusedBody] : [],
        });
      }
    }, 400);
  }, []);

  // Scene rendering
  const renderScene = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, scene: EvoEvent | null, time: number) => {
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, w, h);

    if (!scene) return;

    const t = Date.now() * 0.001;

    switch (scene.sceneType) {
      case 'nebula': {
        // Swirling nebula particles
        for (let i = 0; i < 200; i++) {
          const angle = (i / 200) * Math.PI * 2 + t * 0.3;
          const r = 40 + Math.sin(i * 0.7 + t * 0.5) * 60 + i * 0.5;
          const x = w / 2 + Math.cos(angle) * r;
          const y = h / 2 + Math.sin(angle) * r * 0.5;
          const size = 1 + Math.random() * 2;
          const alpha = 0.3 + Math.sin(i + t) * 0.3;
          ctx.fillStyle = `rgba(${150 + i % 100}, ${80 + i % 80}, ${200 + i % 55}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
        // Central bright core
        const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, 30);
        grad.addColorStop(0, 'rgba(255, 220, 150, 0.8)');
        grad.addColorStop(1, 'rgba(255, 150, 50, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        break;
      }
      case 'accretion': {
        // Accretion disk + forming bodies
        for (let i = 0; i < 300; i++) {
          const angle = (i / 300) * Math.PI * 4 + t * (0.2 + (i % 3) * 0.1);
          const r = 30 + (i / 300) * 120;
          const x = w / 2 + Math.cos(angle) * r;
          const y = h / 2 + Math.sin(angle) * r * 0.35;
          const size = 0.5 + (i % 4) * 0.8;
          const hue = 30 + (i % 40);
          ctx.fillStyle = `hsla(${hue}, 70%, ${50 + (i % 30)}%, ${0.3 + (i % 5) * 0.1})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
        // Forming proto-planets
        const bodies = [0.3, 0.55, 0.7, 0.85];
        bodies.forEach((pos, idx) => {
          const angle = t * (0.3 - idx * 0.05) + idx * 1.5;
          const r = 50 + pos * 100;
          const x = w / 2 + Math.cos(angle) * r;
          const y = h / 2 + Math.sin(angle) * r * 0.35;
          const s = 3 + idx * 2;
          ctx.fillStyle = `hsl(${20 + idx * 30}, 60%, 60%)`;
          ctx.beginPath();
          ctx.arc(x, y, s, 0, Math.PI * 2);
          ctx.fill();
        });
        // Sun
        const sg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, 20);
        sg.addColorStop(0, 'rgba(255, 240, 100, 1)');
        sg.addColorStop(0.5, 'rgba(255, 180, 50, 0.5)');
        sg.addColorStop(1, 'rgba(255, 100, 20, 0)');
        ctx.fillStyle = sg;
        ctx.fillRect(w / 2 - 25, h / 2 - 25, 50, 50);
        break;
      }
      case 'bombardment': {
        // Planet + impacts
        const px = w / 2, py = h / 2, pr = 50;
        ctx.fillStyle = '#4a5568';
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
        // Impact flashes
        for (let i = 0; i < 8; i++) {
          const ia = Math.random() * Math.PI * 2;
          const ir = Math.random() * pr;
          const ix = px + Math.cos(ia) * ir;
          const iy = py + Math.sin(ia) * ir;
          const flash = Math.sin(t * 5 + i * 2) > 0.3;
          if (flash) {
            const fg = ctx.createRadialGradient(ix, iy, 0, ix, iy, 8);
            fg.addColorStop(0, 'rgba(255, 200, 50, 0.9)');
            fg.addColorStop(1, 'rgba(255, 100, 20, 0)');
            ctx.fillStyle = fg;
            ctx.fillRect(ix - 10, iy - 10, 20, 20);
          }
        }
        // Incoming projectiles
        for (let i = 0; i < 5; i++) {
          const sx = Math.random() * w;
          const sy = Math.random() * h * 0.3;
          const tx = px + (Math.random() - 0.5) * pr;
          const ty = py + (Math.random() - 0.5) * pr;
          const prog = ((t * 0.5 + i * 0.7) % 1);
          const cx = sx + (tx - sx) * prog;
          const cy = sy + (ty - sy) * prog;
          ctx.strokeStyle = `rgba(255, 150, 50, ${1 - prog})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + (sx - tx) * 0.1, cy + (sy - ty) * 0.1);
          ctx.stroke();
          ctx.fillStyle = `rgba(255, 200, 100, ${1 - prog})`;
          ctx.beginPath();
          ctx.arc(cx, cy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'cooling': {
        // Planet with volcanic glow
        const px = w / 2, py = h / 2, pr = 55;
        // Surface
        ctx.fillStyle = '#6b4a3a';
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
        // Cooling lava patches
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          const r = 10 + Math.sin(i * 2.3) * 25;
          const x = px + Math.cos(a) * r;
          const y = py + Math.sin(a) * r;
          const glow = 0.3 + Math.sin(t * 2 + i) * 0.2;
          ctx.fillStyle = `rgba(255, ${80 + i * 5}, 20, ${glow})`;
          ctx.beginPath();
          ctx.arc(x, y, 5 + Math.sin(i + t) * 3, 0, Math.PI * 2);
          ctx.fill();
        }
        // Atmosphere forming
        const ag = ctx.createRadialGradient(px, py, pr - 5, px, py, pr + 15);
        ag.addColorStop(0, 'rgba(100, 150, 200, 0)');
        ag.addColorStop(0.5, 'rgba(100, 150, 200, 0.15)');
        ag.addColorStop(1, 'rgba(100, 150, 200, 0)');
        ctx.fillStyle = ag;
        ctx.beginPath();
        ctx.arc(px, py, pr + 15, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'modern': {
        // Earth-like planet with oceans
        const px = w / 2, py = h / 2, pr = 55;
        // Ocean
        ctx.fillStyle = '#1a4a7a';
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
        // Continents
        const continents = [
          { x: -15, y: -10, w: 20, h: 15 },
          { x: 10, y: 5, w: 25, h: 20 },
          { x: -25, y: 15, w: 15, h: 12 },
        ];
        continents.forEach(c => {
          ctx.fillStyle = '#3a7a3a';
          ctx.beginPath();
          ctx.ellipse(px + c.x, py + c.y, c.w / 2, c.h / 2, 0.2, 0, Math.PI * 2);
          ctx.fill();
        });
        // Atmosphere
        const ag = ctx.createRadialGradient(px, py, pr - 2, px, py, pr + 10);
        ag.addColorStop(0, 'rgba(100, 180, 255, 0)');
        ag.addColorStop(0.6, 'rgba(100, 180, 255, 0.1)');
        ag.addColorStop(1, 'rgba(100, 180, 255, 0)');
        ctx.fillStyle = ag;
        ctx.beginPath();
        ctx.arc(px, py, pr + 10, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }

    // Time label
    ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillText(`${time} Ma`, 8, h - 8);
  }, []);

  // Simulation animation loop
  useEffect(() => {
    simTimeRef.current = simTime;
  }, [simTime]);

  useEffect(() => {
    if (!simRunning) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTs = 0;
    const animate = (ts: number) => {
      if (!lastTs) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      const newTime = simTimeRef.current + simSpeed * dt * 0.001;
      setSimTime(prev => {
        const next = prev + simSpeed * dt * 0.001;
        if (next >= 0) { setSimRunning(false); return 0; }
        return next;
      });

      // Find closest event
      const closest = EVO_EVENTS.reduce((best, e) => {
        const d = Math.abs(parseFloat(e.time) - simTimeRef.current);
        return d < best.d ? { e, d } : best;
      }, { e: EVO_EVENTS[0], d: Infinity });

      setSimScene(closest.e);
      renderScene(ctx, canvas.width, canvas.height, closest.e, simTimeRef.current);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [simRunning, simSpeed, renderScene]);

  // Manual scene update when not running
  useEffect(() => {
    if (simRunning) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const closest = EVO_EVENTS.reduce((best, e) => {
      const d = Math.abs(parseFloat(e.time) - simTime);
      return d < best.d ? { e, d } : best;
    }, { e: EVO_EVENTS[0], d: Infinity });
    setSimScene(closest.e);
    renderScene(ctx, canvas.width, canvas.height, closest.e, simTime);
  }, [simTime, simRunning, renderScene]);

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const statusColor = (s: string) => s === 'loaded' ? 'text-emerald-400' : s === 'partial' ? 'text-amber-400' : 'text-rose-400';
  const srcStatusColor = (s: string) => s === 'online' ? 'bg-emerald-500' : s === 'syncing' ? 'bg-amber-500' : 'bg-rose-500';

  const renderTree = (node: TwinBody, depth: number) => (
    <div key={node.id}>
      <div
        className="flex items-center gap-1.5 py-1 px-1 rounded cursor-pointer hover:bg-slate-700/50"
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={() => node.children.length > 0 && toggleNode(node.id)}
      >
        {node.children.length > 0 ? (
          <span className="text-[10px] text-slate-500 w-3">{expandedNodes.has(node.id) ? '▼' : '▶'}</span>
        ) : <span className="w-3" />}
        <span className="text-slate-300 text-xs">{node.name}</span>
        <span className={`text-[10px] ml-auto ${statusColor(node.modelStatus)}`}>●</span>
        <span className="text-[10px] text-slate-500">{node.precision}</span>
      </div>
      {expandedNodes.has(node.id) && node.children.map(c => renderTree(c, depth + 1))}
    </div>
  );

  return (
    <div className="fixed inset-0 lg:inset-auto lg:absolute lg:top-14 lg:right-3 lg:w-[440px] lg:max-h-[85vh] z-30 flex flex-col bg-slate-900/98 lg:bg-slate-900/95 backdrop-blur-md lg:border lg:border-slate-700/50 lg:rounded-xl shadow-2xl overflow-y-auto">
      {/* 移动端关闭栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 lg:hidden bg-slate-900 shrink-0">
        <span className="text-sm font-medium text-cyan-400">全时空数字孪生</span>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 text-white text-xl font-bold shadow-lg">✕</button>
      </div>
      {/* Header */}
      <div className="sticky top-0 z-10 hidden lg:flex items-center justify-between px-4 py-3 bg-slate-900/98 border-b border-slate-700/50">
        <h2 className="text-sm font-bold text-cyan-400">全时空数字孪生</h2>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white text-lg transition-colors">✕</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700/50">
        {(['twin', 'simulation'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-medium ${tab === t ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-300'}`}>
            {t === 'twin' ? '数字孪生体' : '时空推演'}
          </button>
        ))}
      </div>

      <div className="p-3 space-y-3">
        {tab === 'twin' && (
          <>
            {/* Config */}
            <div className="bg-slate-800/60 rounded-lg p-3 space-y-2">
              <h3 className="text-xs font-semibold text-slate-300">build_solar_twin() 配置</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500">模型精度</label>
                  <select value={precision} onChange={e => setPrecision(e.target.value)}
                    className="w-full mt-0.5 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200">
                    <option>cm级</option><option>m级</option><option>km级</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500">更新间隔(分钟)</label>
                  <select value={updateInterval} onChange={e => setUpdateInterval(Number(e.target.value))}
                    className="w-full mt-0.5 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200">
                    <option value={5}>5</option><option value={15}>15</option><option value={60}>60</option>
                  </select>
                </div>
              </div>
              {!twinBuilt ? (
                <button onClick={buildTwin} disabled={isBuilding}
                  className="w-full py-1.5 rounded text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:text-slate-400 text-white transition-colors">
                  {isBuilding ? `构建中 ${buildProgress}%` : '构建数字孪生体'}
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-emerald-400">● 孪生体就绪</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-400">精度: {precision}</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-400">间隔: {updateInterval}min</span>
                </div>
              )}
              {isBuilding && (
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div className="bg-cyan-500 h-1.5 rounded-full transition-all" style={{ width: `${buildProgress}%` }} />
                </div>
              )}
            </div>

            {/* Data Sources */}
            <div className="bg-slate-800/60 rounded-lg p-3">
              <h3 className="text-xs font-semibold text-slate-300 mb-2">数据源状态</h3>
              <div className="space-y-1.5">
                {DATA_SOURCES.map(ds => (
                  <div key={ds.id} className="flex items-center gap-2 text-[11px]">
                    <span className={`w-2 h-2 rounded-full ${srcStatusColor(ds.status)}`} />
                    <span className="text-slate-300 w-28">{ds.name}</span>
                    <span className="text-slate-500 flex-1">{ds.records.toLocaleString()}条</span>
                    <span className="text-slate-500">{ds.precision}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Twin Tree */}
            {twinBuilt && (
              <div className="bg-slate-800/60 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-slate-300 mb-2">solar_twin_obj 层级结构</h3>
                <div className="max-h-48 overflow-y-auto">
                  {TWIN_TREE.map(n => renderTree(n, 0))}
                </div>
              </div>
            )}

            {/* Data Index */}
            {twinBuilt && (
              <div className="bg-slate-800/60 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-slate-300 mb-2">data_index 索引表</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-700">
                        <th className="text-left py-1">数据集</th>
                        <th className="text-left py-1">来源</th>
                        <th className="text-left py-1">精度</th>
                        <th className="text-left py-1">更新时间</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      {DATA_SOURCES.map(ds => (
                        <tr key={ds.id} className="border-b border-slate-700/50">
                          <td className="py-1">{ds.name}</td>
                          <td className="py-1 text-cyan-400/70">{ds.url}</td>
                          <td className="py-1">{ds.precision}</td>
                          <td className="py-1">{ds.lastSync}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'simulation' && (
          <>
            {/* temporal_simulation() controls */}
            <div className="bg-slate-800/60 rounded-lg p-3 space-y-2">
              <h3 className="text-xs font-semibold text-slate-300">temporal_simulation() 时空推演</h3>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-500">target_time</label>
                  <input type="range" min={-4600} max={0} step={10} value={simTime}
                    onChange={e => setSimTime(Number(e.target.value))}
                    className="w-full accent-cyan-500" />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>-4600Ma</span>
                    <span className="text-cyan-400 font-mono">{simTime}Ma</span>
                    <span>0</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSimRunning(!simRunning)}
                  className={`px-3 py-1 rounded text-xs font-semibold ${simRunning ? 'bg-rose-600 hover:bg-rose-500' : 'bg-cyan-600 hover:bg-cyan-500'} text-white`}>
                  {simRunning ? '⏸ 暂停' : '▶ 推演'}
                </button>
                <div className="flex items-center gap-1">
                  <label className="text-[10px] text-slate-500">time_step:</label>
                  <select value={simSpeed} onChange={e => setSimSpeed(Number(e.target.value))}
                    className="bg-slate-700 border border-slate-600 rounded px-1.5 py-0.5 text-[10px] text-slate-200">
                    <option value={10}>10Ma/秒</option>
                    <option value={50}>50Ma/秒</option>
                    <option value={100}>100Ma/秒</option>
                    <option value={500}>500Ma/秒</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Scene Canvas */}
            <div className="bg-slate-800/60 rounded-lg p-3">
              <h3 className="text-xs font-semibold text-slate-300 mb-2">simulation_scene 场景</h3>
              <canvas ref={canvasRef} width={416} height={220} className="w-full rounded-lg border border-slate-700/50" />
              {simScene && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 bg-cyan-900/50 text-cyan-400 rounded">{simScene.label}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{simScene.time}Ma</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{simScene.description}</p>
                </div>
              )}
            </div>

            {/* Evolution Log */}
            <div className="bg-slate-800/60 rounded-lg p-3">
              <h3 className="text-xs font-semibold text-slate-300 mb-2">evolution_log 演化日志</h3>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {EVO_EVENTS.map(ev => {
                  const evTime = parseFloat(ev.time);
                  const isActive = Math.abs(evTime - simTime) < Math.abs(parseFloat(EVO_EVENTS[0].time) - simTime) * 0.1;
                  return (
                    <div key={ev.time} className={`flex items-start gap-2 text-[11px] ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                      <span className="font-mono shrink-0 w-16">{ev.time}Ma</span>
                      <div>
                        <span className={isActive ? 'font-semibold' : ''}>{ev.label}</span>
                        {isActive && <p className="text-[10px] text-slate-400 mt-0.5">{ev.description.slice(0, 50)}...</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 跨模块关联操作 */}
      {twinBuilt && (
        <div className="border-t border-slate-700/50 bg-slate-900/80 px-3 py-2">
          <div className="mb-1.5 text-[10px] text-slate-500">数字孪生 → 关联模块</div>
          <div className="flex flex-wrap gap-1.5">
            <CrossModuleLink signal="run-simulation" label="时空推演" payload={{ fromTwin: true }} />
            <CrossModuleLink signal="plan-orbit" label="轨道规划" payload={{ twinPrecision: precision }} />
            <CrossModuleLink signal="query-spatial" label="空间查询" payload={{ twinBuilt: true }} />
            <CrossModuleLink signal="analyze-remote" label="遥感分析" payload={{ twinBuilt: true }} />
            <CrossModuleLink signal="detect-craters" label="撞击坑识别" payload={{ twinBuilt: true }} />
          </div>
        </div>
      )}
    </div>
  );
}
