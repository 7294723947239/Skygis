'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { type CelestialBody, type DigitalTwinState, type HubSignal } from '@/lib/skygis-hub';
import CrossModuleLink from './cross-module-link';

/* ───────────── Types ───────────── */
interface OrbitPlan {
  id: string;
  name: string;
  startBody: string;
  targetBody: string;
  transferType: string;
  deltaV: number;       // km/s
  duration: number;     // days
  fuelCost: number;     // relative
  jupiterPerturb: number;
  description: string;
}

interface MiningResource {
  id: string;
  name: string;
  type: string;
  body: string;
  lat: number;
  lon: number;
  richness: number;     // 0-100
  accessibility: number;
  quantity: string;
  depth: string;
}

interface MiningPath {
  id: string;
  waypoints: string[];
  totalDistance: number;
  totalTime: number;
  totalResource: number;
  safetyScore: number;
  steps: { from: string; to: string; distance: number; hazard: string }[];
}

/* ───────────── Static Data ───────────── */
const ORBIT_PLANS: OrbitPlan[] = [
  { id: 'op1', name: '霍曼转移-标准', startBody: '地球', targetBody: '火星', transferType: 'Hohmann', deltaV: 5.59, duration: 259, fuelCost: 1.0, jupiterPerturb: 0.02, description: '经典霍曼转移轨道，最省燃料但耗时最长' },
  { id: 'op2', name: '快速转移-1', startBody: '地球', targetBody: '火星', transferType: 'Fast', deltaV: 8.42, duration: 150, fuelCost: 1.85, jupiterPerturb: 0.03, description: '增大速度增量，缩短50%转移时间' },
  { id: 'op3', name: '快速转移-2', startBody: '地球', targetBody: '火星', transferType: 'Fast', deltaV: 12.1, duration: 90, fuelCost: 3.2, jupiterPerturb: 0.04, description: '高能量快速直达，适合紧急任务' },
  { id: 'op4', name: '引力辅助-金星', startBody: '地球', targetBody: '火星', transferType: 'Gravity Assist', deltaV: 4.23, duration: 310, fuelCost: 0.75, jupiterPerturb: 0.01, description: '经金星引力弹弓，节省25%燃料' },
  { id: 'op5', name: '霍曼转移-标准', startBody: '地球', targetBody: '木星', transferType: 'Hohmann', deltaV: 14.31, duration: 2720, fuelCost: 1.0, jupiterPerturb: 0, description: '标准转移至木星，耗时约7.5年' },
  { id: 'op6', name: '引力辅助-木星', startBody: '地球', targetBody: '木星', transferType: 'Gravity Assist', deltaV: 9.87, duration: 2190, fuelCost: 0.65, jupiterPerturb: 0, description: '经地球/金星引力辅助，节省35%燃料' },
];

const MINING_RESOURCES: MiningResource[] = [
  { id: 'mr1', name: '沙克尔顿水冰', type: '水冰', body: '月球', lat: -89.7, lon: 0, richness: 98, accessibility: 55, quantity: '~6亿吨', depth: '0-2m' },
  { id: 'mr2', name: 'Aristarchus氦-3', type: '氦-3', body: '月球', lat: 25.5, lon: -47.5, richness: 82, accessibility: 85, quantity: '~100万吨', depth: '0-3m' },
  { id: 'mr3', name: 'Mare Tranquillitatis钛铁矿', type: '钛铁矿', body: '月球', lat: 1.0, lon: 31.4, richness: 75, accessibility: 92, quantity: '~10亿吨', depth: '0-5m' },
  { id: 'mr4', name: 'Jezero含水矿物', type: '含水矿物', body: '火星', lat: 18.4, lon: 77.5, richness: 88, accessibility: 78, quantity: '~5000万吨', depth: '0-10m' },
  { id: 'mr5', name: 'Utopia地下冰层', type: '水冰', body: '火星', lat: 43.0, lon: 110.0, richness: 92, accessibility: 45, quantity: '~1亿吨', depth: '2-20m' },
  { id: 'mr6', name: 'Bennu铂族金属', type: '铂族金属', body: '近地小行星', lat: 0, lon: 0, richness: 95, accessibility: 35, quantity: '~1000吨', depth: '表面' },
  { id: 'mr7', name: 'Ryugu碳质矿物', type: '有机物', body: '近地小行星', lat: 0, lon: 0, richness: 80, accessibility: 40, quantity: '~500万吨', depth: '表面' },
];

/* ───────────── Component ───────────── */
interface Props {
  onClose: () => void;
  focusedBody?: CelestialBody | null;
  twinState?: DigitalTwinState;
  onNavigate?: (signal: Omit<HubSignal, 'timestamp'>) => void;
}

export default function EngineeringPanel({ onClose, focusedBody, twinState, onNavigate }: Props) {
  const [tab, setTab] = useState<'orbit' | 'mining'>('orbit');
  const [startBody, setStartBody] = useState('地球');
  const [targetBody, setTargetBody] = useState('火星');
  const [fuelLimit, setFuelLimit] = useState(15);
  const [timeLimit, setTimeLimit] = useState(365);
  const [orbitResults, setOrbitResults] = useState<OrbitPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<OrbitPlan | null>(null);
  const [orbitAnalyzed, setOrbitAnalyzed] = useState(false);
  const orbitCanvasRef = useRef<HTMLCanvasElement>(null);
  const orbitAnimRef = useRef<number>(0);

  const [resourceType, setResourceType] = useState('水冰');
  const [miningTarget, setMiningTarget] = useState(100);
  const [miningTimeLimit, setMiningTimeLimit] = useState(24);
  const [miningPaths, setMiningPaths] = useState<MiningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<MiningPath | null>(null);
  const [miningAnalyzed, setMiningAnalyzed] = useState(false);
  const miningCanvasRef = useRef<HTMLCanvasElement>(null);
  const miningAnimRef = useRef<number>(0);

  // orbit_planning_ai
  const analyzeOrbits = useCallback(() => {
    const filtered = ORBIT_PLANS.filter(p =>
      p.startBody === startBody && p.targetBody === targetBody
    ).map(p => ({
      ...p,
      fuelCost: +(p.fuelCost * (fuelLimit < 10 ? 1.2 : 1)).toFixed(2),
    })).filter(p => p.duration <= timeLimit && p.deltaV <= fuelLimit)
      .sort((a, b) => a.fuelCost - b.fuelCost);

    setOrbitResults(filtered);
    setOrbitAnalyzed(true);
    if (filtered.length > 0) setSelectedPlan(filtered[0]);
  }, [startBody, targetBody, fuelLimit, timeLimit]);

  // Orbit visualization
  useEffect(() => {
    if (!orbitAnalyzed || !selectedPlan) return;
    const canvas = orbitCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;

    const bodyDistances: Record<string, number> = { '地球': 1.0, '火星': 1.524, '木星': 5.203, '金星': 0.723 };
    const maxAU = bodyDistances[targetBody] * 1.2;

    const animate = () => {
      const t = Date.now() * 0.001;
      ctx.fillStyle = '#050810';
      ctx.fillRect(0, 0, w, h);

      const cx = w * 0.15, cy = h * 0.5;

      // Sun
      const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12);
      sg.addColorStop(0, '#fbbf24');
      sg.addColorStop(1, 'rgba(251,191,36,0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.fill();

      // Planet orbits
      Object.entries(bodyDistances).forEach(([name, au]) => {
        const r = (au / maxAU) * (w * 0.75);
        ctx.strokeStyle = 'rgba(100,116,139,0.2)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // Planet position
        const angle = t * (0.5 / Math.sqrt(au)) + (name === startBody ? 0 : Math.PI * 0.4);
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;

        const colors: Record<string, string> = { '地球': '#06b6d4', '火星': '#ef4444', '木星': '#f59e0b', '金星': '#fbbf24' };
        ctx.fillStyle = colors[name] || '#94a3b8';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '9px monospace';
        ctx.fillText(name, px + 6, py + 3);
      });

      // Transfer orbit
      const startR = (bodyDistances[startBody] / maxAU) * (w * 0.75);
      const endR = (bodyDistances[targetBody] / maxAU) * (w * 0.75);
      const startAngle = t * (0.5 / Math.sqrt(bodyDistances[startBody]));
      const transferAngle = startAngle + Math.PI;

      // Draw transfer ellipse
      ctx.strokeStyle = 'rgba(6,182,212,0.6)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.ellipse(
        cx + (endR - startR) / 2 * Math.cos(transferAngle),
        cy + (endR - startR) / 2 * Math.sin(transferAngle),
        (startR + endR) / 2,
        Math.abs(endR - startR) / 2,
        transferAngle,
        0, Math.PI * 2
      );
      ctx.stroke();
      ctx.setLineDash([]);

      // Spacecraft
      const scProgress = (t * 0.1) % 1;
      const scAngle = startAngle + scProgress * Math.PI;
      const scR = startR + (endR - startR) * scProgress;
      const scx = cx + Math.cos(scAngle) * scR;
      const scy = cy + Math.sin(scAngle) * scR;
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(scx, scy, 3, 0, Math.PI * 2);
      ctx.fill();
      // Trail
      ctx.strokeStyle = 'rgba(6,182,212,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(scx, scy);
      ctx.lineTo(cx + Math.cos(scAngle - 0.3) * (startR + (endR - startR) * (scProgress - 0.1)), cy + Math.sin(scAngle - 0.3) * (startR + (endR - startR) * (scProgress - 0.1)));
      ctx.stroke();

      // Jupiter perturbation indicator
      if (selectedPlan.jupiterPerturb > 0) {
        ctx.fillStyle = 'rgba(245,158,11,0.3)';
        ctx.font = '8px monospace';
        ctx.fillText(`木星扰动: ${selectedPlan.jupiterPerturb}%`, 8, h - 8);
      }

      orbitAnimRef.current = requestAnimationFrame(animate);
    };
    orbitAnimRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(orbitAnimRef.current);
  }, [orbitAnalyzed, selectedPlan, startBody, targetBody]);

  // resource_mining_path
  const analyzeMiningPaths = useCallback(() => {
    // Filter resources matching type
    const matched = MINING_RESOURCES.filter(r => r.type === resourceType);
    if (matched.length === 0) {
      setMiningPaths([]);
      setMiningAnalyzed(true);
      return;
    }

    // Generate path combinations
    const paths: MiningPath[] = [];
    const bodies = [...new Set(matched.map(r => r.body))];

    if (bodies.length >= 2) {
      paths.push({
        id: 'mp1', waypoints: bodies, totalDistance: 2.5 + Math.random() * 3,
        totalTime: 18, totalResource: Math.round(miningTarget * 0.85), safetyScore: 92,
        steps: bodies.map((b, i) => ({
          from: i === 0 ? '地球' : bodies[i - 1],
          to: b,
          distance: 0.5 + Math.random() * 2,
          hazard: i === 0 ? '辐射带' : '微陨石'
        }))
      });
    }

    paths.push({
      id: 'mp2', waypoints: [bodies[0]], totalDistance: 0.8 + Math.random(),
      totalTime: 8, totalResource: Math.round(miningTarget * 0.6), safetyScore: 96,
      steps: [{ from: '地球', to: bodies[0], distance: 0.4 + Math.random(), hazard: '辐射带' }]
    });

    if (bodies.length >= 2) {
      paths.push({
        id: 'mp3', waypoints: bodies.reverse(), totalDistance: 3 + Math.random() * 2,
        totalTime: 22, totalResource: Math.round(miningTarget * 1.1), safetyScore: 80,
        steps: bodies.map((b, i) => ({
          from: i === 0 ? '地球' : bodies[i - 1],
          to: b,
          distance: 0.8 + Math.random() * 2.5,
          hazard: i === 0 ? '辐射带' : '小行星密集区'
        }))
      });
    }

    setMiningPaths(paths);
    setMiningAnalyzed(true);
    if (paths.length > 0) setSelectedPath(paths[0]);
  }, [resourceType, miningTarget]);

  // Mining path visualization
  useEffect(() => {
    if (!miningAnalyzed || !selectedPath) return;
    const canvas = miningCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;

    const animate = () => {
      const t = Date.now() * 0.001;
      ctx.fillStyle = '#050810';
      ctx.fillRect(0, 0, w, h);

      // Draw path between waypoints
      const waypoints = ['地球', ...selectedPath.waypoints];
      const total = waypoints.length;
      const spacing = w / (total + 1);

      waypoints.forEach((wp, i) => {
        const x = spacing * (i + 1);
        const y = h / 2 + Math.sin(t + i) * 5;

        const colors: Record<string, string> = { '地球': '#06b6d4', '月球': '#94a3b8', '火星': '#ef4444', '近地小行星': '#a78bfa' };
        const color = colors[wp] || '#64748b';

        // Glow
        const g = ctx.createRadialGradient(x, y, 0, x, y, 15);
        g.addColorStop(0, `${color}80`);
        g.addColorStop(1, `${color}00`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(wp, x, y + 20);
      });

      // Path lines
      ctx.strokeStyle = 'rgba(6,182,212,0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      for (let i = 0; i < total; i++) {
        const x = spacing * (i + 1);
        const y = h / 2 + Math.sin(t + i) * 5;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Moving miner
      const progress = (t * 0.15) % 1;
      const segIdx = Math.floor(progress * (total - 1));
      const segProg = (progress * (total - 1)) - segIdx;
      const x1 = spacing * (segIdx + 1);
      const x2 = spacing * (segIdx + 2);
      const y1 = h / 2 + Math.sin(t + segIdx) * 5;
      const y2 = h / 2 + Math.sin(t + segIdx + 1) * 5;
      const mx = x1 + (x2 - x1) * segProg;
      const my = y1 + (y2 - y1) * segProg;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(mx, my, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.textAlign = 'left';
      miningAnimRef.current = requestAnimationFrame(animate);
    };
    miningAnimRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(miningAnimRef.current);
  }, [miningAnalyzed, selectedPath]);

  return (
    <div className="fixed inset-0 lg:inset-auto lg:absolute lg:top-14 lg:right-3 lg:w-[440px] lg:max-h-[85vh] z-30 flex flex-col bg-slate-900/98 lg:bg-slate-900/95 backdrop-blur-md lg:border lg:border-slate-700/50 lg:rounded-xl shadow-2xl overflow-y-auto">
      {/* 移动端关闭栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 lg:hidden bg-slate-900 shrink-0">
        <span className="text-sm font-medium text-cyan-400">工程应用</span>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 text-white text-xl font-bold shadow-lg">✕</button>
      </div>
      <div className="sticky top-0 z-10 hidden lg:flex items-center justify-between px-4 py-3 bg-slate-900/98 border-b border-slate-700/50">
        <h2 className="text-sm font-bold text-cyan-400">工程应用</h2>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white text-lg transition-colors">✕</button>
      </div>

      <div className="flex border-b border-slate-700/50">
        {(['orbit', 'mining'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-medium ${tab === t ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-300'}`}>
            {t === 'orbit' ? '轨道规划' : '资源勘探'}
          </button>
        ))}
      </div>

      <div className="p-3 space-y-3">
        {tab === 'orbit' && (
          <>
            <div className="bg-slate-800/60 rounded-lg p-3 space-y-2">
              <h3 className="text-xs font-semibold text-slate-300">orbit_planning_ai() 轨道规划</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500">start_body</label>
                  <select value={startBody} onChange={e => setStartBody(e.target.value)}
                    className="w-full mt-0.5 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200">
                    <option>地球</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500">target_body</label>
                  <select value={targetBody} onChange={e => setTargetBody(e.target.value)}
                    className="w-full mt-0.5 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200">
                    <option>火星</option><option>木星</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500">fuel_limit (km/s)</label>
                  <input type="number" value={fuelLimit} onChange={e => setFuelLimit(Number(e.target.value))}
                    className="w-full mt-0.5 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500">time_limit (days)</label>
                  <input type="number" value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))}
                    className="w-full mt-0.5 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200" />
                </div>
              </div>
              <button onClick={analyzeOrbits}
                className="w-full py-1.5 rounded text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white">
                计算轨道方案
              </button>
            </div>

            {/* Results */}
            {orbitAnalyzed && (
              <>
                <div className="bg-slate-800/60 rounded-lg p-3">
                  <h3 className="text-xs font-semibold text-slate-300 mb-2">orbit_plans 方案列表 ({orbitResults.length}套)</h3>
                  {orbitResults.length === 0 ? (
                    <p className="text-[11px] text-slate-500">无满足约束条件的方案，请调整参数</p>
                  ) : (
                    <div className="space-y-1.5">
                      {orbitResults.map((p, idx) => (
                        <div key={p.id}
                          onClick={() => setSelectedPlan(p)}
                          className={`p-2 rounded cursor-pointer transition-colors ${selectedPlan?.id === p.id ? 'bg-slate-700/80 border border-cyan-500/30' : 'bg-slate-800/40 hover:bg-slate-700/50'}`}>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${idx === 0 ? 'text-amber-400' : 'text-slate-400'}`}>#{idx + 1}</span>
                            <span className="text-xs text-slate-200">{p.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded ml-auto">{p.transferType}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 mt-1.5 text-[10px]">
                            <div className="text-center">
                              <div className="text-cyan-400 font-mono">{p.deltaV}</div>
                              <div className="text-slate-500">Δv km/s</div>
                            </div>
                            <div className="text-center">
                              <div className="text-amber-400 font-mono">{p.duration}</div>
                              <div className="text-slate-500">天</div>
                            </div>
                            <div className="text-center">
                              <div className="text-emerald-400 font-mono">{p.fuelCost}x</div>
                              <div className="text-slate-500">燃料</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Visualization */}
                {selectedPlan && (
                  <>
                    <div className="bg-slate-800/60 rounded-lg p-3">
                      <h3 className="text-xs font-semibold text-slate-300 mb-2">orbit_visual 轨道可视化</h3>
                      <canvas ref={orbitCanvasRef} width={416} height={200} className="w-full rounded-lg border border-slate-700/50" />
                    </div>
                    <div className="bg-slate-800/60 rounded-lg p-3">
                      <div className="text-[11px] text-slate-300">{selectedPlan.description}</div>
                      {selectedPlan.jupiterPerturb > 0 && (
                        <div className="mt-1 text-[10px] text-amber-400">
                          ⚠ 木星引力扰动: {selectedPlan.jupiterPerturb}%轨道偏移
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}

        {tab === 'mining' && (
          <>
            <div className="bg-slate-800/60 rounded-lg p-3 space-y-2">
              <h3 className="text-xs font-semibold text-slate-300">resource_mining_path() 勘探路径</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500">resource_type</label>
                  <select value={resourceType} onChange={e => setResourceType(e.target.value)}
                    className="w-full mt-0.5 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200">
                    <option>水冰</option><option>氦-3</option><option>含水矿物</option><option>铂族金属</option><option>有机物</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500">mining_target</label>
                  <div className="flex items-center gap-1 mt-0.5">
                    <input type="number" value={miningTarget} onChange={e => setMiningTarget(Number(e.target.value))}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200" />
                    <span className="text-[10px] text-slate-500">kg</span>
                  </div>
                </div>
              </div>
              <button onClick={analyzeMiningPaths}
                className="w-full py-1.5 rounded text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white">
                规划勘探路径
              </button>
            </div>

            {/* Resource map */}
            <div className="bg-slate-800/60 rounded-lg p-3">
              <h3 className="text-xs font-semibold text-slate-300 mb-2">资源富集区</h3>
              <div className="space-y-1">
                {MINING_RESOURCES.filter(r => r.type === resourceType).map(r => (
                  <div key={r.id} className="flex items-center gap-2 text-[11px] p-1.5 bg-slate-800/40 rounded">
                    <span className="text-slate-200 w-32">{r.name}</span>
                    <span className="text-slate-500 w-16">{r.body}</span>
                    <div className="flex-1 flex items-center gap-1">
                      <div className="flex-1 bg-slate-700 rounded-full h-1">
                        <div className="bg-cyan-500 h-1 rounded-full" style={{ width: `${r.richness}%` }} />
                      </div>
                      <span className="text-[9px] text-cyan-400 w-8">{r.richness}</span>
                    </div>
                    <span className="text-[9px] text-slate-500">{r.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mining Paths */}
            {miningAnalyzed && (
              <>
                <div className="bg-slate-800/60 rounded-lg p-3">
                  <h3 className="text-xs font-semibold text-slate-300 mb-2">mining_path 路径方案 ({miningPaths.length}条)</h3>
                  <div className="space-y-1.5">
                    {miningPaths.map((p, idx) => (
                      <div key={p.id}
                        onClick={() => setSelectedPath(p)}
                        className={`p-2 rounded cursor-pointer transition-colors ${selectedPath?.id === p.id ? 'bg-slate-700/80 border border-cyan-500/30' : 'bg-slate-800/40 hover:bg-slate-700/50'}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-200 font-medium">方案 {idx + 1}</span>
                          <span className="text-[10px] text-slate-500">途经: {p.waypoints.join('→')}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1 mt-1.5 text-[10px] text-center">
                          <div><span className="text-cyan-400 font-mono">{p.totalDistance.toFixed(1)}</span><br/><span className="text-slate-500">AU</span></div>
                          <div><span className="text-amber-400 font-mono">{p.totalTime}h</span><br/><span className="text-slate-500">耗时</span></div>
                          <div><span className="text-emerald-400 font-mono">{p.totalResource}</span><br/><span className="text-slate-500">kg</span></div>
                          <div><span className="text-purple-400 font-mono">{p.safetyScore}</span><br/><span className="text-slate-500">安全</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Path Visualization */}
                {selectedPath && (
                  <div className="bg-slate-800/60 rounded-lg p-3">
                    <h3 className="text-xs font-semibold text-slate-300 mb-2">path_visual 路径可视化</h3>
                    <canvas ref={miningCanvasRef} width={416} height={140} className="w-full rounded-lg border border-slate-700/50" />
                    <div className="mt-2 space-y-1">
                      {selectedPath.steps.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="text-cyan-400">{s.from}</span>
                          <span className="text-slate-600">→</span>
                          <span className="text-emerald-400">{s.to}</span>
                          <span className="text-slate-500 ml-auto">{s.distance.toFixed(1)}AU</span>
                          <span className="text-amber-500/70">⚠{s.hazard}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* 跨模块关联操作 */}
      <div className="border-t border-slate-700/50 bg-slate-900/80 px-3 py-2">
        <div className="mb-1.5 text-[10px] text-slate-500">工程应用 → 关联模块</div>
        <div className="flex flex-wrap gap-1.5">
          <CrossModuleLink signal="compare-gravity" label="引力场分析" payload={{ fromEngineering: true }} />
          <CrossModuleLink signal="assess-neo-risk" label="NEO风险评估" payload={{ fromEngineering: true }} />
          <CrossModuleLink signal="select-landing" label="着陆选址" payload={{ fromEngineering: true }} />
          <CrossModuleLink signal="analyze-remote" label="遥感分析" payload={{ fromEngineering: true }} />
          <CrossModuleLink signal="query-spatial" label="空间查询" payload={{ fromEngineering: true }} />
          <CrossModuleLink signal="build-twin" label="构建孪生体" payload={{ fromEngineering: true }} />
        </div>
      </div>
    </div>
  );
}
