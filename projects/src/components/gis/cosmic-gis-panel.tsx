'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cosmicGISEngine, type Point3D, type WuXing, type EnergyFlowResult, type ResonanceResult, type SynergyEffect, type MeridianNode, type AcupointData, type HerbData, type MartialMove } from '@/lib/cosmic-gis-engine';

// ============================================================
// 子组件：五行标识
// ============================================================
function WuXingBadge({ wx }: { wx: WuXing }) {
  const map: Record<WuXing, { label: string; color: string; bg: string }> = {
    wood: { label: '木', color: 'text-emerald-300', bg: 'bg-emerald-900/50' },
    fire: { label: '火', color: 'text-red-300', bg: 'bg-red-900/50' },
    earth: { label: '土', color: 'text-amber-300', bg: 'bg-amber-900/50' },
    metal: { label: '金', color: 'text-slate-200', bg: 'bg-slate-700/50' },
    water: { label: '水', color: 'text-blue-300', bg: 'bg-blue-900/50' },
  };
  const m = map[wx];
  return <span className={`inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${m.bg} ${m.color}`}>{m.label}</span>;
}

// ============================================================
// 子组件：能量流可视化 Canvas
// ============================================================
function EnergyFlowCanvas({ 
  activeMeridians, 
  activeHerbs, 
  activeMove, 
  synergyResult 
}: { 
  activeMeridians: string[];
  activeHerbs: string[];
  activeMove: string | null;
  synergyResult: EnergyFlowResult | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const tRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const t = tRef.current;

    // 清除
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, W, H);

    // 三层嵌套: 外层宇宙 → 中层地球 → 内层人体
    const cx = W / 2;
    const cy = H / 2;

    // 外层: 宇宙 - 行星轨道
    ctx.strokeStyle = 'rgba(6,182,212,0.15)';
    ctx.lineWidth = 0.5;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, 30 + i * 28, 0, Math.PI * 2);
      ctx.stroke();
      // 行星
      const angle = t * 0.3 + i * 1.5;
      const px = cx + Math.cos(angle) * (30 + i * 28);
      const py = cy + Math.sin(angle) * (30 + i * 28);
      ctx.fillStyle = `hsl(${200 + i * 20}, 70%, 60%)`;
      ctx.beginPath();
      ctx.arc(px, py, 2 + i * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // 中层: 地球 - 中药产区 (彩色面要素)
    ctx.strokeStyle = 'rgba(16,185,129,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 90, 0, Math.PI * 2);
    ctx.stroke();
    // 气候带
    for (let i = 0; i < 5; i++) {
      const bandAngle = t * 0.1 + i * 1.2;
      const bx = cx + Math.cos(bandAngle) * 80;
      const by = cy + Math.sin(bandAngle) * 50;
      ctx.fillStyle = `hsla(${120 + i * 30}, 60%, 50%, 0.15)`;
      ctx.beginPath();
      ctx.ellipse(bx, by, 20, 12, bandAngle, 0, Math.PI * 2);
      ctx.fill();
    }

    // 内层: 人体 - 经络 (红色矢量线)
    const meridians = cosmicGISEngine.getAllMeridians();
    const acupoints = cosmicGISEngine.getAllAcupoints();
    
    // 绘制经络线
    ctx.lineWidth = 1;
    for (const m of meridians) {
      const isActive = activeMeridians.includes(m.id);
      const mx = cx + m.position.x * 0.4;
      const my = cy - m.position.y * 0.18;
      
      if (isActive) {
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.6 + 0.3 * Math.sin(t * 3)})`;
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
        ctx.lineWidth = 0.5;
      }
      
      // 经络延伸线
      const endX = mx + (m.yinYang === 'yin' ? -8 : 8) * Math.sin(m.position.x * 0.1);
      const endY = my + 15;
      ctx.beginPath();
      ctx.moveTo(mx, my - 10);
      ctx.quadraticCurveTo(mx + (m.yinYang === 'yin' ? -5 : 5), my, endX, endY);
      ctx.stroke();
    }

    // 绘制穴位 (能量聚集区)
    for (const ap of acupoints) {
      const ax = cx + ap.position.x * 0.4;
      const ay = cy - ap.position.y * 0.18;
      const isHerbTarget = activeHerbs.some(h => {
        const herb = cosmicGISEngine.getHerb(h);
        return herb?.meridianTropism?.some(mt => ap.meridian === mt);
      });
      
      if (isHerbTarget) {
        // 活跃穴位 - 发光
        const glow = 0.5 + 0.5 * Math.sin(t * 4);
        ctx.fillStyle = `rgba(245, 158, 11, ${0.4 + glow * 0.4})`;
        ctx.beginPath();
        ctx.arc(ax, ay, 4 + glow * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(ax, ay, 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.beginPath();
        ctx.arc(ax, ay, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 丹田能量核心 (黄色球体)
    const dantianGlow = 0.6 + 0.4 * Math.sin(t * 2);
    const dantianX = cx;
    const dantianY = cy + 5;
    const gradient = ctx.createRadialGradient(dantianX, dantianY, 0, dantianX, dantianY, 12 + dantianGlow * 6);
    gradient.addColorStop(0, `rgba(250, 204, 21, ${0.8 * dantianGlow})`);
    gradient.addColorStop(0.5, `rgba(250, 204, 21, ${0.3 * dantianGlow})`);
    gradient.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(dantianX, dantianY, 12 + dantianGlow * 6, 0, Math.PI * 2);
    ctx.fill();

    // 武术发力轨迹 (如果在播放)
    if (activeMove) {
      const move = cosmicGISEngine.getMove(activeMove);
      if (move) {
        ctx.strokeStyle = `rgba(6, 182, 212, ${0.5 + 0.5 * Math.sin(t * 5)})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        const trailLen = 20;
        for (let i = 0; i < trailLen; i++) {
          const angle = (t * move.forceCurve.angularVelocity) + (i / trailLen) * Math.PI * 2;
          const r = move.trajectory.radius * 30;
          const px = cx + Math.cos(angle) * r;
          const py = cy - 20 + Math.sin(angle) * r * 0.3;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 宇宙射线 (蓝色粒子流)
    for (let i = 0; i < 15; i++) {
      const rayAngle = t * 0.5 + i * 0.42;
      const rayR = 120 + 20 * Math.sin(t + i);
      const rx = cx + Math.cos(rayAngle) * rayR;
      const ry = cy + Math.sin(rayAngle) * rayR;
      const progress = (t * 0.3 + i * 0.07) % 1;
      const rpx = cx + (rx - cx) * progress;
      const rpy = cy + (ry - cy) * progress;
      ctx.fillStyle = `rgba(59, 130, 246, ${0.3 + 0.3 * Math.sin(t * 2 + i)})`;
      ctx.beginPath();
      ctx.arc(rpx, rpy, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // 中药能量场 (绿色光晕)
    if (activeHerbs.length > 0) {
      for (let i = 0; i < activeHerbs.length; i++) {
        const herbAngle = t * 0.2 + i * 2;
        const hx = cx + Math.cos(herbAngle) * 70;
        const hy = cy + Math.sin(herbAngle) * 40;
        const herbGlow = 0.3 + 0.3 * Math.sin(t * 3 + i);
        const hGradient = ctx.createRadialGradient(hx, hy, 0, hx, hy, 15);
        hGradient.addColorStop(0, `rgba(16, 185, 129, ${herbGlow})`);
        hGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = hGradient;
        ctx.beginPath();
        ctx.arc(hx, hy, 15, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 协同效应连线
    if (synergyResult && synergyResult.meridianActivation.length > 0) {
      ctx.strokeStyle = `rgba(245, 158, 11, ${0.3 + 0.3 * Math.sin(t * 4)})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      for (let i = 0; i < synergyResult.meridianActivation.length - 1; i++) {
        const m1 = cosmicGISEngine.getMeridian(synergyResult.meridianActivation[i]);
        const m2 = cosmicGISEngine.getMeridian(synergyResult.meridianActivation[i + 1]);
        if (m1 && m2) {
          ctx.beginPath();
          ctx.moveTo(cx + m1.position.x * 0.4, cy - m1.position.y * 0.18);
          ctx.lineTo(cx + m2.position.x * 0.4, cy - m2.position.y * 0.18);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
    }

    tRef.current += 0.016;
    animRef.current = requestAnimationFrame(draw);
  }, [activeMeridians, activeHerbs, activeMove, synergyResult]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={360}
      height={320}
      className="w-full rounded-lg border border-slate-700/50 bg-[#0a0e1a]"
    />
  );
}

// ============================================================
// 主面板：宇宙GIS四系统融合引擎
// ============================================================
export default function CosmicGisPanel({ onClose }: { onClose: () => void }) {
  // Tab: 四个核心模块
  const [activeTab, setActiveTab] = useState<'overview' | 'martial' | 'tcm' | 'synergy'>('overview');
  
  // 武术模块状态
  const [selectedMove, setSelectedMove] = useState<string | null>(null);
  
  // 中药模块状态
  const [selectedHerb, setSelectedHerb] = useState<string | null>(null);
  
  // 协同模块状态
  const [selectedAcupoint, setSelectedAcupoint] = useState<string | null>(null);
  const [synergyResult, setSynergyResult] = useState<EnergyFlowResult | null>(null);
  const [resonanceResults, setResonanceResults] = useState<ResonanceResult[]>([]);
  const [lunarPhase, setLunarPhase] = useState(0.5);
  const [selectedSolarTerm, setSelectedSolarTerm] = useState('夏至');
  const [latitude, setLatitude] = useState(35);
  
  // 计算协同效应
  const computeSynergy = useCallback(() => {
    if (!selectedMove || !selectedHerb || !selectedAcupoint) return;
    const result = cosmicGISEngine.computeEnergyFlow(selectedMove, selectedHerb, selectedAcupoint);
    setSynergyResult(result);
  }, [selectedMove, selectedHerb, selectedAcupoint]);
  
  // 计算共振
  const computeResonance = useCallback(() => {
    const results = cosmicGISEngine.computeCosmicResonance(lunarPhase, selectedSolarTerm, latitude);
    setResonanceResults(results);
  }, [lunarPhase, selectedSolarTerm, latitude]);

  // 获取活跃经络
  const getActiveMeridians = (): string[] => {
    const set = new Set<string>();
    if (selectedMove) {
      const move = cosmicGISEngine.getMove(selectedMove);
      move?.meridianActivation.forEach(m => set.add(m));
    }
    if (selectedHerb) {
      const herb = cosmicGISEngine.getHerb(selectedHerb);
      herb?.meridianTropism.forEach(m => set.add(m));
    }
    return Array.from(set);
  };

  const activeMeridians = getActiveMeridians();
  const moves = cosmicGISEngine.getAllMoves();
  const herbs = cosmicGISEngine.getAllHerbs();
  const acupoints = cosmicGISEngine.getAllAcupoints();
  const meridians = cosmicGISEngine.getAllMeridians();
  const stats = cosmicGISEngine.getStats();
  const solarTerms = ['立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑','白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至','小寒','大寒'];

  return (
    <div className="flex h-full flex-col border-l border-slate-700/50 bg-slate-950/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-cyan-600 to-amber-500 text-[10px] font-bold text-white">
            宇
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">宇宙GIS融合引擎</h2>
            <p className="text-[10px] text-slate-500">空间建模·能量流动·功能协同·代码实现</p>
          </div>
        </div>
        <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-white">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-slate-700/50">
        {([
          ['overview', '总览', 'bg-cyan-600'],
          ['martial', '武术', 'bg-red-600'],
          ['tcm', '中药', 'bg-emerald-600'],
          ['synergy', '协同', 'bg-amber-600'],
        ] as const).map(([key, label, activeBg]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 px-2 py-1.5 text-xs font-medium transition-colors ${
              activeTab === key ? `${activeBg} text-white` : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        
        {/* ====== 总览 Tab ====== */}
        {activeTab === 'overview' && (
          <>
            {/* 能量流可视化 */}
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-cyan-400">人体-地球-宇宙 嵌套模型</h3>
              <EnergyFlowCanvas
                activeMeridians={activeMeridians}
                activeHerbs={selectedHerb ? [selectedHerb] : []}
                activeMove={selectedMove}
                synergyResult={synergyResult}
              />
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />宇宙轨道</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />中药能量场</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500" />经络</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />丹田</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />宇宙射线</span>
              </div>
            </div>

            {/* 四系统核心定位 */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-cyan-400">四系统核心定位</h3>
              
              <div className="rounded-lg border border-cyan-800/30 bg-cyan-950/30 p-2">
                <div className="text-[11px] font-semibold text-cyan-300">GIS — 空间坐标与能量载体</div>
                <p className="text-[10px] text-slate-400 mt-0.5">从微观(细胞/穴位)到宏观(地球圈层/宇宙星系)的多尺度坐标体系</p>
                <div className="flex gap-1 mt-1">
                  <span className="rounded bg-cyan-900/40 px-1 text-[9px] text-cyan-400">WGS84</span>
                  <span className="rounded bg-cyan-900/40 px-1 text-[9px] text-cyan-400">银道坐标</span>
                  <span className="rounded bg-cyan-900/40 px-1 text-[9px] text-cyan-400">CGCS2000</span>
                </div>
              </div>

              <div className="rounded-lg border border-red-800/30 bg-red-950/30 p-2">
                <div className="text-[11px] font-semibold text-red-300">武术 — 能量转化与空间动力学</div>
                <p className="text-[10px] text-slate-400 mt-0.5">人体生物能→机械能/场能，符合宇宙能量守恒</p>
                <div className="flex gap-1 mt-1">
                  <span className="rounded bg-red-900/40 px-1 text-[9px] text-red-400">动量守恒</span>
                  <span className="rounded bg-red-900/40 px-1 text-[9px] text-red-400">角动量守恒</span>
                  <span className="rounded bg-red-900/40 px-1 text-[9px] text-red-400">η=0.85</span>
                </div>
              </div>

              <div className="rounded-lg border border-emerald-800/30 bg-emerald-950/30 p-2">
                <div className="text-[11px] font-semibold text-emerald-300">中药 — 物质能量与宇宙场域共振</div>
                <p className="text-[10px] text-slate-400 mt-0.5">药性=中药成分×地球圈层能量×宇宙射线共振</p>
                <div className="flex gap-1 mt-1">
                  <span className="rounded bg-emerald-900/40 px-1 text-[9px] text-emerald-400">r=-0.72</span>
                  <span className="rounded bg-emerald-900/40 px-1 text-[9px] text-emerald-400">衰减率&lt;15%</span>
                  <span className="rounded bg-emerald-900/40 px-1 text-[9px] text-emerald-400">5行×2性</span>
                </div>
              </div>

              <div className="rounded-lg border border-amber-800/30 bg-amber-950/30 p-2">
                <div className="text-[11px] font-semibold text-amber-300">编程 — 跨系统协同的代码实现</div>
                <p className="text-[10px] text-slate-400 mt-0.5">F = k × 招式动量 × 中药活性成分浓度</p>
                <div className="flex gap-1 mt-1">
                  <span className="rounded bg-amber-900/40 px-1 text-[9px] text-amber-400">能量流算法</span>
                  <span className="rounded bg-amber-900/40 px-1 text-[9px] text-amber-400">协同系数1.2</span>
                </div>
              </div>
            </div>

            {/* 引擎统计 */}
            <div className="grid grid-cols-5 gap-1">
              {[
                { label: '经络', value: stats.meridians, color: 'text-red-400' },
                { label: '穴位', value: stats.acupoints, color: 'text-amber-400' },
                { label: '药材', value: stats.herbs, color: 'text-emerald-400' },
                { label: '招式', value: stats.moves, color: 'text-cyan-400' },
                { label: '算法', value: stats.algorithms, color: 'text-purple-400' },
              ].map(s => (
                <div key={s.label} className="rounded border border-slate-700/50 bg-slate-900/80 p-1.5 text-center">
                  <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-[9px] text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>

            {/* 空间交互机制 */}
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-cyan-400">三尺度空间交互</h3>
              <div className="rounded bg-slate-900/60 p-2 text-[10px] text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  <span className="font-medium text-blue-300">微观:</span> 细胞-穴位-能量场耦合，扩散系数D=1.2×10⁻⁹m²/s
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="font-medium text-emerald-300">宏观:</span> 地球圈层-武术流派-中药道地性，r=0.81
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span className="font-medium text-amber-300">宇宙:</span> 天体运动-人体节律-中药功效，T=365天
                </div>
              </div>
            </div>
          </>
        )}

        {/* ====== 武术 Tab ====== */}
        {activeTab === 'martial' && (
          <>
            <h3 className="text-xs font-semibold text-red-400">武术招式数据库</h3>
            {moves.map(move => {
              const isSelected = selectedMove === move.id;
              return (
                <button
                  key={move.id}
                  onClick={() => setSelectedMove(isSelected ? null : move.id)}
                  className={`w-full rounded-lg border p-2 text-left transition-colors ${
                    isSelected ? 'border-red-600/50 bg-red-950/40' : 'border-slate-700/50 bg-slate-900/60 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-200">{move.nameCn}</span>
                      <span className="ml-1.5 text-[10px] text-slate-500">{move.style}</span>
                    </div>
                    <span className="rounded bg-slate-800 px-1.5 text-[10px] text-slate-400">η={move.energyEfficiency}</span>
                  </div>
                  {isSelected && (
                    <div className="mt-2 space-y-1.5 text-[10px]">
                      <div className="grid grid-cols-2 gap-1">
                        <div className="rounded bg-slate-800/50 p-1">
                          <div className="text-slate-500">峰值力</div>
                          <div className="font-mono text-red-300">{move.forceCurve.peakForce} N</div>
                        </div>
                        <div className="rounded bg-slate-800/50 p-1">
                          <div className="text-slate-500">角速度</div>
                          <div className="font-mono text-red-300">{move.forceCurve.angularVelocity} rad/s</div>
                        </div>
                        <div className="rounded bg-slate-800/50 p-1">
                          <div className="text-slate-500">发力半径</div>
                          <div className="font-mono text-red-300">{move.trajectory.radius} m</div>
                        </div>
                        <div className="rounded bg-slate-800/50 p-1">
                          <div className="text-slate-500">转动惯量</div>
                          <div className="font-mono text-red-300">{move.biometricParams.momentOfInertia}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 mb-0.5">轨迹方程</div>
                        <code className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-cyan-300">{move.trajectory.paramEquation}</code>
                      </div>
                      <div>
                        <div className="text-slate-500 mb-0.5">激活经络</div>
                        <div className="flex flex-wrap gap-1">
                          {move.meridianActivation.map(mId => {
                            const m = cosmicGISEngine.getMeridian(mId);
                            return m ? (
                              <span key={mId} className="flex items-center gap-0.5 rounded bg-red-900/30 px-1 text-[9px] text-red-300">
                                <WuXingBadge wx={m.wuXing} />
                                {m.nameCn}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}

            {/* 经络网络 */}
            <h3 className="text-xs font-semibold text-red-400 mt-2">十四经络网络</h3>
            <div className="grid grid-cols-2 gap-1">
              {meridians.map(m => (
                <div key={m.id} className="flex items-center gap-1 rounded bg-slate-900/60 px-1.5 py-1">
                  <WuXingBadge wx={m.wuXing} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-slate-300 truncate">{m.nameCn}</div>
                    <div className="text-[9px] text-slate-600">{m.yinYang === 'yin' ? '阴' : '阳'}·{m.energyDensity}/cm²</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ====== 中药 Tab ====== */}
        {activeTab === 'tcm' && (
          <>
            <h3 className="text-xs font-semibold text-emerald-400">中药材物质能量数据库</h3>
            {herbs.map(herb => {
              const isSelected = selectedHerb === herb.id;
              return (
                <button
                  key={herb.id}
                  onClick={() => setSelectedHerb(isSelected ? null : herb.id)}
                  className={`w-full rounded-lg border p-2 text-left transition-colors ${
                    isSelected ? 'border-emerald-600/50 bg-emerald-950/40' : 'border-slate-700/50 bg-slate-900/60 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <WuXingBadge wx={herb.wuXing} />
                      <span className="text-xs font-semibold text-slate-200">{herb.nameCn}</span>
                      <span className="text-[10px] text-slate-500">{herb.latinName}</span>
                    </div>
                    <span className={`rounded px-1 text-[10px] ${
                      herb.nature === 'cold' ? 'bg-blue-900/40 text-blue-300' :
                      herb.nature === 'cool' ? 'bg-blue-900/30 text-blue-400' :
                      herb.nature === 'warm' ? 'bg-amber-900/40 text-amber-300' :
                      herb.nature === 'hot' ? 'bg-red-900/40 text-red-300' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {herb.nature === 'cold' ? '寒' : herb.nature === 'cool' ? '凉' : herb.nature === 'warm' ? '温' : herb.nature === 'hot' ? '热' : '平'}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="mt-2 space-y-1.5 text-[10px]">
                      {/* 归经 */}
                      <div>
                        <span className="text-slate-500">归经: </span>
                        <span className="text-emerald-300">{herb.meridianTropism.map(id => cosmicGISEngine.getMeridian(id)?.nameCn ?? id).join(', ')}</span>
                      </div>
                      {/* 味 */}
                      <div>
                        <span className="text-slate-500">味: </span>
                        <span className="text-amber-300">{herb.flavor.join(' ')}</span>
                      </div>
                      {/* 活性成分 */}
                      <div>
                        <div className="text-slate-500 mb-0.5">活性成分</div>
                        {herb.activeCompounds.map(ac => (
                          <div key={ac.nameCn} className="flex items-center justify-between rounded bg-slate-800/50 px-1.5 py-0.5 mb-0.5">
                            <span className="text-emerald-300">{ac.nameCn}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">{ac.concentration} mg/g</span>
                              <span className="text-slate-600">t½={ac.halfLife}h</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* 生长区域 */}
                      <div className="rounded bg-slate-800/40 p-1.5">
                        <div className="text-slate-500">生长区域</div>
                        <div className="text-slate-300">
                          {herb.growingRegion.latitude[0]}°N-{herb.growingRegion.latitude[1]}°N · {herb.growingRegion.climate}
                        </div>
                        <div className="flex gap-3 mt-0.5">
                          <span className="text-slate-500">宇宙射线: <span className="text-blue-300">{herb.growingRegion.cosmicRayFlux} μSv/h</span></span>
                          <span className="text-slate-500">地磁场: <span className="text-purple-300">{herb.growingRegion.geomagneticField} μT</span></span>
                        </div>
                      </div>
                      {/* 采收时间 */}
                      <div className="rounded bg-slate-800/40 p-1.5">
                        <div className="text-slate-500">采收时机</div>
                        <div className="text-slate-300">{herb.harvestTiming.optimalSeason} · {herb.harvestTiming.lunarPhase}</div>
                        <div className="text-slate-500">多糖峰值: <span className="text-emerald-300">{herb.harvestTiming.polysaccharidePeak}%</span></div>
                      </div>
                      {/* 扩散系数 */}
                      <div className="text-slate-500">
                        扩散系数: <span className="font-mono text-cyan-300">{herb.diffusionCoeff.toExponential(1)} m²/s</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}

            {/* 穴位网络 */}
            <h3 className="text-xs font-semibold text-emerald-400 mt-2">关键穴位网络</h3>
            <div className="space-y-1">
              {acupoints.map(ap => (
                <div key={ap.id} className="rounded bg-slate-900/60 px-2 py-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <WuXingBadge wx={ap.wuXing} />
                      <span className="text-[11px] font-medium text-slate-200">{ap.nameCn}</span>
                      <span className="text-[9px] text-slate-500">{ap.meridian}</span>
                    </div>
                    <span className="text-[9px] text-slate-500">d={ap.depth}mm r={ap.effectRadius}mm</span>
                  </div>
                  <div className="flex gap-1 mt-0.5">
                    {ap.herbAffinity.slice(0, 3).map(h => (
                      <span key={h} className="rounded bg-emerald-900/30 px-1 text-[9px] text-emerald-400">{h}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ====== 协同 Tab ====== */}
        {activeTab === 'synergy' && (
          <>
            <h3 className="text-xs font-semibold text-amber-400">能量流算法: F = k × 招式动量 × 药物浓度</h3>

            {/* 参数选择 */}
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-slate-500 mb-0.5 block">武术招式</label>
                <select
                  value={selectedMove ?? ''}
                  onChange={e => setSelectedMove(e.target.value || null)}
                  className="w-full rounded border border-slate-700/50 bg-slate-900 px-2 py-1 text-xs text-slate-200"
                >
                  <option value="">选择招式...</option>
                  {moves.map(m => <option key={m.id} value={m.id}>{m.nameCn} ({m.style})</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 mb-0.5 block">中药材</label>
                <select
                  value={selectedHerb ?? ''}
                  onChange={e => setSelectedHerb(e.target.value || null)}
                  className="w-full rounded border border-slate-700/50 bg-slate-900 px-2 py-1 text-xs text-slate-200"
                >
                  <option value="">选择药材...</option>
                  {herbs.map(h => <option key={h.id} value={h.id}>{h.nameCn}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 mb-0.5 block">作用穴位</label>
                <select
                  value={selectedAcupoint ?? ''}
                  onChange={e => setSelectedAcupoint(e.target.value || null)}
                  className="w-full rounded border border-slate-700/50 bg-slate-900 px-2 py-1 text-xs text-slate-200"
                >
                  <option value="">选择穴位...</option>
                  {acupoints.map(a => <option key={a.id} value={a.id}>{a.nameCn} ({a.meridian})</option>)}
                </select>
              </div>
              <button
                onClick={computeSynergy}
                disabled={!selectedMove || !selectedHerb || !selectedAcupoint}
                className="w-full rounded bg-amber-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40 hover:bg-amber-500 transition-colors"
              >
                计算协同效应
              </button>
            </div>

            {/* 协同效应结果 */}
            {synergyResult && (
              <div className="space-y-1.5">
                <h3 className="text-xs font-semibold text-amber-400">协同效应结果</h3>
                <div className="grid grid-cols-2 gap-1">
                  <div className="rounded border border-amber-800/30 bg-amber-950/20 p-2 text-center">
                    <div className="text-[10px] text-slate-500">穴位受力</div>
                    <div className="text-lg font-bold font-mono text-amber-300">{synergyResult.forceOnAcupoint.toFixed(2)}</div>
                  </div>
                  <div className="rounded border border-emerald-800/30 bg-emerald-950/20 p-2 text-center">
                    <div className="text-[10px] text-slate-500">药物刺激</div>
                    <div className="text-lg font-bold font-mono text-emerald-300">{synergyResult.herbStimulation.toFixed(2)}</div>
                  </div>
                  <div className="rounded border border-cyan-800/30 bg-cyan-950/20 p-2 text-center">
                    <div className="text-[10px] text-slate-500">协同效应</div>
                    <div className="text-lg font-bold font-mono text-cyan-300">{synergyResult.synergyEffect.toFixed(3)}</div>
                  </div>
                  <div className="rounded border border-purple-800/30 bg-purple-950/20 p-2 text-center">
                    <div className="text-[10px] text-slate-500">能量平衡</div>
                    <div className="text-lg font-bold font-mono text-purple-300">{(synergyResult.energyBalance * 100).toFixed(0)}%</div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 mb-0.5">激活经络链</div>
                  <div className="flex flex-wrap gap-1">
                    {synergyResult.meridianActivation.map(mId => {
                      const m = cosmicGISEngine.getMeridian(mId);
                      return m ? (
                        <span key={mId} className="flex items-center gap-0.5 rounded bg-amber-900/30 px-1.5 text-[10px] text-amber-300">
                          <WuXingBadge wx={m.wuXing} />
                          {m.nameCn}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 宇宙共振 */}
            <div className="mt-3 space-y-2">
              <h3 className="text-xs font-semibold text-amber-400">宇宙-人体-中药共振计算</h3>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="w-12 text-[10px] text-slate-500">月相</label>
                  <input
                    type="range" min="0" max="1" step="0.01"
                    value={lunarPhase}
                    onChange={e => setLunarPhase(Number(e.target.value))}
                    className="flex-1 h-1 accent-amber-500"
                  />
                  <span className="w-10 text-[10px] font-mono text-amber-300">{(lunarPhase * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-12 text-[10px] text-slate-500">节气</label>
                  <select
                    value={selectedSolarTerm}
                    onChange={e => setSelectedSolarTerm(e.target.value)}
                    className="flex-1 rounded border border-slate-700/50 bg-slate-900 px-1.5 py-0.5 text-[10px] text-slate-200"
                  >
                    {solarTerms.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-12 text-[10px] text-slate-500">纬度</label>
                  <input
                    type="range" min="-90" max="90" step="1"
                    value={latitude}
                    onChange={e => setLatitude(Number(e.target.value))}
                    className="flex-1 h-1 accent-amber-500"
                  />
                  <span className="w-10 text-[10px] font-mono text-amber-300">{latitude}°</span>
                </div>
                <button
                  onClick={computeResonance}
                  className="w-full rounded bg-amber-600/80 px-2 py-1 text-[10px] font-medium text-white hover:bg-amber-500"
                >
                  计算共振
                </button>
              </div>

              {resonanceResults.length > 0 && (
                <div className="space-y-1">
                  {resonanceResults.map((r, i) => (
                    <div key={i} className="rounded border border-slate-700/50 bg-slate-900/60 p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-300">{r.source} → {r.target}</span>
                        <span className={`rounded px-1 text-[10px] ${r.coefficient > 0 ? 'bg-emerald-900/40 text-emerald-300' : 'bg-red-900/40 text-red-300'}`}>
                          r={r.coefficient.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex gap-3 mt-0.5 text-[9px] text-slate-500">
                        <span>周期: {r.period}天</span>
                        <span>振幅: {r.amplitude.toFixed(2)}</span>
                        <span>p={r.pValue}</span>
                        <span>{r.scale === 'cosmic' ? '宇宙尺度' : r.scale === 'macro' ? '宏观尺度' : '微观尺度'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 地域适配 */}
            <div className="mt-3 space-y-1.5">
              <h3 className="text-xs font-semibold text-amber-400">地域-武术-中药适配</h3>
              {(['north', 'south'] as const).map(region => {
                const result = cosmicGISEngine.computeRegionalAdaptation(region);
                return (
                  <div key={region} className="rounded border border-slate-700/50 bg-slate-900/60 p-2">
                    <div className="text-[11px] font-medium text-slate-200">
                      {region === 'north' ? '北方 (温带季风区)' : '南方 (亚热带湿润区)'}
                    </div>
                    <div className="mt-1 space-y-0.5 text-[10px]">
                      <div><span className="text-slate-500">武术风格:</span> <span className="text-red-300">{result.martialStyle}</span></div>
                      <div><span className="text-slate-500">发力幅度:</span> <span className="font-mono text-cyan-300">{result.forceAmplitude}m</span></div>
                      <div><span className="text-slate-500">中药类别:</span> <span className="text-emerald-300">{result.herbCategory}</span></div>
                      <div className="flex gap-3">
                        <span><span className="text-slate-500">空间相关:</span> <span className="font-mono text-amber-300">r={result.spatialCorrelation}</span></span>
                        <span><span className="text-slate-500">区域重叠:</span> <span className="font-mono text-amber-300">{(result.regionOverlap * 100).toFixed(0)}%</span></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 五行生克 */}
            <div className="mt-3 space-y-1">
              <h3 className="text-xs font-semibold text-amber-400">五行生克关系</h3>
              <div className="rounded border border-slate-700/50 bg-slate-900/60 p-2">
                <div className="grid grid-cols-6 gap-1 text-center text-[9px]">
                  <div />
                  {(['wood','fire','earth','metal','water'] as WuXing[]).map(wx => (
                    <div key={wx} className="font-medium text-slate-400">
                      {wx === 'wood' ? '木' : wx === 'fire' ? '火' : wx === 'earth' ? '土' : wx === 'metal' ? '金' : '水'}
                    </div>
                  ))}
                  {(['wood','fire','earth','metal','water'] as WuXing[]).map(row => (
                    <div key={`row-${row}`} className="contents">
                      <div className="font-medium text-slate-400 flex items-center justify-center">
                        {row === 'wood' ? '木' : row === 'fire' ? '火' : row === 'earth' ? '土' : row === 'metal' ? '金' : '水'}
                      </div>
                      {(['wood','fire','earth','metal','water'] as WuXing[]).map(col => {
                        const rel = cosmicGISEngine.wuXingRelation(row, col);
                        return (
                          <div key={`${row}-${col}`} className={`h-4 rounded flex items-center justify-center ${
                            rel === 'same' ? 'bg-slate-700/50 text-slate-400' :
                            rel === 'generate' ? 'bg-emerald-900/40 text-emerald-300' :
                            rel === 'restrict' ? 'bg-red-900/40 text-red-300' :
                            'bg-slate-800/50 text-slate-600'
                          }`}>
                            {rel === 'same' ? '同' : rel === 'generate' ? '生' : rel === 'restrict' ? '克' : '—'}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-1.5 text-[9px]">
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded bg-emerald-500" />生(相生)</span>
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded bg-red-500" />克(相克)</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
