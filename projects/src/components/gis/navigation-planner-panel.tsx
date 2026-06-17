'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { type CelestialBody, type HubSignal } from '@/lib/skygis-hub';
import CrossModuleLink from './cross-module-link';

/* ===== 星际航行路径优化与资源补给点智能规划 ===== */

const AU_KM = 149597870.7; // 1 AU = km
const MU_SUN = 1.327e11; // km³/s² 太阳引力参数
const AU_PER_YR_TO_KMPS = 4.7405; // AU/yr → km/s

interface CelestialTarget {
  name: string;
  a_au: number; // 半长轴 AU
  period_yr: number;
  color: string;
  radius: number;
  resources?: string[];
}

const TARGETS: CelestialTarget[] = [
  { name: '月球', a_au: 0.00257, period_yr: 0.0748, color: '#a1a1aa', radius: 3, resources: ['水冰(极地)', '氦-3', '钛铁矿'] },
  { name: '火星', a_au: 1.524, period_yr: 1.881, color: '#ef4444', radius: 4, resources: ['水冰(极地)', 'CO₂大气', '铁矿'] },
  { name: '木星', a_au: 5.203, period_yr: 11.86, color: '#f97316', radius: 6, resources: ['卫星水资源', '氦-3(大气)'] },
  { name: '土星', a_au: 9.537, period_yr: 29.46, color: '#eab308', radius: 5, resources: ['土卫六甲烷', '冰环资源'] },
  { name: '小行星带', a_au: 2.77, period_yr: 4.6, color: '#94a3b8', radius: 3, resources: ['铂族金属', '镍铁', '水冰'] },
];

interface TransferOrbit {
  type: string;
  delta_v: number; // km/s
  transfer_time: number; // 天
  depart_angle: number; // 度
  arrive_angle: number;
  path: { x: number; y: number }[];
  fuel_score: number; // 0-100
  time_score: number; // 0-100
  resource_score: number; // 0-100
}

// 霍曼转移轨道计算
function computeHohmann(r1_au: number, r2_au: number): Omit<TransferOrbit, 'path' | 'fuel_score' | 'time_score' | 'resource_score' | 'type'> {
  const r1 = r1_au * AU_KM;
  const r2 = r2_au * AU_KM;
  const a_transfer = (r1 + r2) / 2;
  const v1_circular = Math.sqrt(MU_SUN / r1);
  const v2_circular = Math.sqrt(MU_SUN / r2);
  const v1_transfer = Math.sqrt(MU_SUN * (2 / r1 - 1 / a_transfer));
  const v2_transfer = Math.sqrt(MU_SUN * (2 / r2 - 1 / a_transfer));
  const dv1 = Math.abs(v1_transfer - v1_circular);
  const dv2 = Math.abs(v2_circular - v2_transfer);
  const total_dv = dv1 + dv2;
  const transfer_time_s = Math.PI * Math.sqrt(a_transfer ** 3 / MU_SUN);
  const transfer_time_days = transfer_time_s / 86400;
  return {
    delta_v: total_dv,
    transfer_time: transfer_time_days,
    depart_angle: 0,
    arrive_angle: 180,
  };
}

function generateEllipsePath(r1_au: number, r2_au: number, n: number = 100): { x: number; y: number }[] {
  const a = (r1_au + r2_au) / 2;
  const e = Math.abs(r2_au - r1_au) / (r2_au + r1_au);
  const c = a * e;
  const path: { x: number; y: number }[] = [];
  for (let i = 0; i <= n; i++) {
    const theta = (i / n) * Math.PI; // 半椭圆
    const r = a * (1 - e * e) / (1 + e * Math.cos(theta));
    path.push({ x: r * Math.cos(theta), y: r * Math.sin(theta) });
  }
  return path;
}

type Strategy = 'fast' | 'balanced' | 'resource';

export default function NavigationPlannerPanel({ onClose, focusedBody, onNavigate }: {
  onClose: () => void;
  focusedBody?: CelestialBody | null;
  onNavigate?: (signal: Omit<HubSignal, 'timestamp'>) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fromBody, setFromBody] = useState('地球');
  const [toBody, setToBody] = useState('火星');
  const [strategy, setStrategy] = useState<Strategy>('balanced');
  const [result, setResult] = useState<TransferOrbit | null>(null);
  const [showWaypoints, setShowWaypoints] = useState(true);
  const [animProgress, setAnimProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animRef = useRef<number>(0);

  const fromTarget = TARGETS.find(t => t.name === fromBody) || TARGETS[0];
  // 目标可能不在TARGETS列表里(地球)
  const fromAU = fromBody === '地球' ? 1.0 : fromTarget.a_au;
  const toTarget = TARGETS.find(t => t.name === toBody);

  // 计算转移轨道
  const calculateOrbit = useCallback(() => {
    if (!toTarget) return;
    const r1 = fromAU;
    const r2 = toTarget.a_au;
    const hohmann = computeHohmann(r1, r2);
    const path = generateEllipsePath(r1, r2);

    // 根据策略调整
    let adjustedDv = hohmann.delta_v;
    let adjustedTime = hohmann.transfer_time;
    let fuelScore = 80;
    let timeScore = 70;
    let resourceScore = 60;
    let type = '霍曼转移轨道';

    if (strategy === 'fast') {
      // 快速直达: 增加delta-v缩短时间
      adjustedDv = hohmann.delta_v * 1.8;
      adjustedTime = hohmann.transfer_time * 0.55;
      fuelScore = 30;
      timeScore = 95;
      resourceScore = 40;
      type = '快速直达轨道';
    } else if (strategy === 'resource') {
      // 资源补给优先: 增加经停点
      adjustedDv = hohmann.delta_v * 0.7; // 分段节省
      adjustedTime = hohmann.transfer_time * 1.5;
      fuelScore = 90;
      timeScore = 35;
      resourceScore = 95;
      type = '资源补给优先轨道';
    }

    setResult({
      ...hohmann,
      delta_v: adjustedDv,
      transfer_time: adjustedTime,
      type,
      path,
      fuel_score: fuelScore,
      time_score: timeScore,
      resource_score: resourceScore,
    });
    setAnimProgress(0);
    setIsAnimating(true);
  }, [fromAU, toTarget, strategy]);

  useEffect(() => {
    calculateOrbit();
  }, [calculateOrbit]);

  // 绘制
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const scale = w / 24;
    const cx = w / 2;
    const cy = h / 2;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // 太阳
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();

    // 行星轨道 (圆)
    const orbits = [
      { name: '地球', r: 1.0, color: '#3b82f6' },
      { name: '火星', r: 1.524, color: '#ef4444' },
      { name: '小行星带', r: 2.77, color: '#94a3b880' },
      { name: '木星', r: 5.203, color: '#f97316' },
      { name: '土星', r: 9.537, color: '#eab308' },
    ];
    for (const orb of orbits) {
      ctx.beginPath();
      ctx.arc(cx, cy, orb.r * scale, 0, Math.PI * 2);
      ctx.strokeStyle = orb.color + '30';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // 行星位置 (简化: 按角度分布)
    const planetPositions: Record<string, { x: number; y: number }> = {};
    orbits.forEach((orb, idx) => {
      const angle = (idx / orbits.length) * Math.PI * 2 + 0.5;
      const px = cx + orb.r * scale * Math.cos(angle);
      const py = cy + orb.r * scale * Math.sin(angle);
      planetPositions[orb.name] = { x: px, y: py };
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = orb.color.replace('80', '');
      ctx.fill();
      ctx.font = '9px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText(orb.name, px, py - 7);
    });

    // 转移轨道
    if (result) {
      const drawLen = Math.floor(result.path.length * Math.min(animProgress, 1));
      if (drawLen > 1) {
        ctx.beginPath();
        for (let i = 0; i < drawLen; i++) {
          const p = result.path[i];
          const px = cx + p.x * scale;
          const py = cy - p.y * scale;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.stroke();

        // 飞行器位置
        const lastP = result.path[drawLen - 1];
        const fpx = cx + lastP.x * scale;
        const fpy = cy - lastP.y * scale;
        ctx.beginPath();
        ctx.arc(fpx, fpy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#06b6d4';
        ctx.fill();
        // 飞行器光晕
        const grd = ctx.createRadialGradient(fpx, fpy, 0, fpx, fpy, 10);
        grd.addColorStop(0, '#06b6d480');
        grd.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(fpx, fpy, 10, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      // 资源补给点
      if (showWaypoints && strategy === 'resource') {
        const waypoints = [
          { name: '月球水冰站', r: 0.00257, angle: 0.1, resource: '水冰' },
          { name: '近地小行星', r: 1.2, angle: 0.8, resource: '镍铁' },
          { name: '火星补给站', r: 1.524, angle: 1.6, resource: 'CO₂燃料' },
        ];
        for (const wp of waypoints) {
          const wx = cx + wp.r * scale * Math.cos(wp.angle);
          const wy = cy + wp.r * scale * Math.sin(wp.angle);
          ctx.beginPath();
          ctx.arc(wx, wy, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#10b98180';
          ctx.fill();
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.font = '8px sans-serif';
          ctx.fillStyle = '#10b981';
          ctx.textAlign = 'center';
          ctx.fillText(wp.name, wx, wy - 8);
        }
      }
    }

    // AU刻度
    ctx.font = '9px monospace';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'left';
    for (let au = 2; au <= 10; au += 2) {
      const px = cx + au * scale;
      ctx.fillText(`${au} AU`, px - 10, cy + 3);
    }
  }, [result, animProgress, showWaypoints, strategy]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    draw();
  }, [draw]);

  // 动画
  useEffect(() => {
    if (!isAnimating) return;
    const animate = () => {
      setAnimProgress(p => {
        if (p >= 1) { setIsAnimating(false); return 1; }
        return p + 0.005;
      });
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isAnimating]);

  return (
    <div className="fixed inset-0 lg:inset-auto lg:absolute lg:top-14 lg:left-3 lg:w-[520px] lg:max-h-[85vh] z-30 pointer-events-auto flex flex-col bg-[#1e293b]/98 lg:bg-[#1e293b]/95 backdrop-blur-md lg:border lg:border-[#334155] lg:rounded-lg shadow-2xl overflow-y-auto">
      {/* 移动端关闭栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 lg:hidden bg-slate-900 shrink-0">
        <span className="text-sm font-medium text-cyan-400">星际航行路径规划</span>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 text-white text-xl font-bold shadow-lg">✕</button>
      </div>
      <div className="sticky top-0 z-10 hidden lg:flex items-center justify-between px-4 py-3 bg-[#1e293b] border-b border-[#334155]">
        <h2 className="text-sm font-semibold text-[#f1f5f9]">星际航行路径优化 & 资源补给规划</h2>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white text-lg transition-colors">&times;</button>
      </div>

      {/* 起点终点选择 */}
      <div className="flex items-center gap-2 px-3 pt-3">
        <div className="flex-1">
          <label className="text-[10px] text-[#64748b] block mb-1">出发地</label>
          <select value={fromBody} onChange={e => setFromBody(e.target.value)}
            className="w-full bg-[#0f172a] text-[#e2e8f0] text-xs rounded px-2 py-1.5 border border-[#334155]">
            <option value="地球">地球 (1.0 AU)</option>
            {TARGETS.map(t => <option key={t.name} value={t.name}>{t.name} ({t.a_au} AU)</option>)}
          </select>
        </div>
        <div className="text-[#06b6d4] mt-4">→</div>
        <div className="flex-1">
          <label className="text-[10px] text-[#64748b] block mb-1">目的地</label>
          <select value={toBody} onChange={e => setToBody(e.target.value)}
            className="w-full bg-[#0f172a] text-[#e2e8f0] text-xs rounded px-2 py-1.5 border border-[#334155]">
            {TARGETS.map(t => <option key={t.name} value={t.name}>{t.name} ({t.a_au} AU)</option>)}
          </select>
        </div>
      </div>

      {/* 策略选择 */}
      <div className="flex gap-1 px-3 pt-2">
        {([
          ['fast', '快速直达', '🚀'],
          ['balanced', '均衡方案', '⚖️'],
          ['resource', '资源补给优先', '⛽'],
        ] as [Strategy, string, string][]).map(([s, label, icon]) => (
          <button key={s} onClick={() => setStrategy(s)}
            className={`flex-1 px-2 py-1.5 text-xs rounded-md transition-colors ${strategy === s ? 'bg-[#06b6d4] text-white' : 'bg-[#334155] text-[#94a3b8] hover:bg-[#475569]'}`}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="relative mx-3 mt-3 rounded-md overflow-hidden border border-[#334155]" style={{ height: 300 }}>
        <canvas ref={canvasRef} className="w-full h-full" style={{ width: '100%', height: '100%' }} />
        <label className="absolute top-2 right-2 flex items-center gap-1 text-[10px] text-[#94a3b8]">
          <input type="checkbox" checked={showWaypoints} onChange={e => setShowWaypoints(e.target.checked)} className="w-3 h-3" />
          补给点
        </label>
      </div>

      {/* 计算结果 */}
      {result && (
        <div className="px-3 pt-3 pb-3 space-y-3">
          {/* 核心参数 */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#0f172a] rounded-md p-2 text-center">
              <div className="text-[10px] text-[#64748b]">总 Δv</div>
              <div className="text-sm font-mono font-semibold text-[#06b6d4]">{result.delta_v.toFixed(2)}</div>
              <div className="text-[9px] text-[#64748b]">km/s</div>
            </div>
            <div className="bg-[#0f172a] rounded-md p-2 text-center">
              <div className="text-[10px] text-[#64748b]">转移时间</div>
              <div className="text-sm font-mono font-semibold text-[#f59e0b]">
                {result.transfer_time > 365 ? `${(result.transfer_time / 365.25).toFixed(1)}` : result.transfer_time.toFixed(0)}
              </div>
              <div className="text-[9px] text-[#64748b]">{result.transfer_time > 365 ? '年' : '天'}</div>
            </div>
            <div className="bg-[#0f172a] rounded-md p-2 text-center">
              <div className="text-[10px] text-[#64748b]">轨道类型</div>
              <div className="text-[10px] font-semibold text-[#e2e8f0] leading-tight mt-1">{result.type}</div>
            </div>
          </div>

          {/* 三维评分 */}
          <div className="bg-[#0f172a] rounded-md p-3">
            <div className="text-[10px] text-[#64748b] mb-2">燃料-时间-资源 三维优化评分</div>
            <div className="space-y-1.5">
              {[
                { label: '燃料效率', score: result.fuel_score, color: '#10b981' },
                { label: '时间效率', score: result.time_score, color: '#3b82f6' },
                { label: '资源补给', score: result.resource_score, color: '#f59e0b' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="text-[10px] text-[#94a3b8] w-16">{item.label}</span>
                  <div className="flex-1 h-2 bg-[#1e293b] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${item.score}%`, backgroundColor: item.color }} />
                  </div>
                  <span className="text-[10px] font-mono text-[#94a3b8] w-8 text-right">{item.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 资源补给点 */}
          {toTarget?.resources && (
            <div className="bg-[#0f172a] rounded-md p-3">
              <div className="text-[10px] text-[#64748b] mb-1">目的地可利用资源</div>
              <div className="flex flex-wrap gap-1">
                {toTarget.resources.map(r => (
                  <span key={r} className="px-2 py-0.5 text-[10px] bg-[#10b981]/10 text-[#10b981] rounded-full">{r}</span>
                ))}
              </div>
            </div>
          )}

          {/* 航行建议 */}
          <div className="bg-[#0f172a] rounded-md p-3 text-xs text-[#94a3b8]">
            <p className="text-[#06b6d4] font-semibold mb-1">航行建议</p>
            {strategy === 'fast' && (
              <p>快速直达方案使用高推力加速，燃料消耗较大，但可在最短时间内到达目标。建议携带额外燃料储备以应对轨道修正需求。</p>
            )}
            {strategy === 'balanced' && (
              <p>均衡方案基于霍曼转移轨道，是燃料效率与航行时间的最优折中。标准双脉冲点火，技术成熟可靠。</p>
            )}
            {strategy === 'resource' && (
              <p>资源补给优先方案途经月球、近地小行星和火星进行资源补充，大幅降低起始载荷，但总航行时间较长。适合大规模运输任务。</p>
            )}
          </div>
        </div>
      )}

      {/* 跨模块关联操作 */}
      <div className="border-t border-slate-700/50 bg-slate-900/80 px-3 py-2">
        <div className="mb-1.5 text-[10px] text-slate-500">航行规划 → 关联模块</div>
        <div className="flex flex-wrap gap-1.5">
          <CrossModuleLink signal="plan-orbit" label="轨道规划" payload={{ fromNavigation: true }} />
          <CrossModuleLink signal="compare-gravity" label="引力场分析" payload={{ fromNavigation: true }} />
          <CrossModuleLink signal="select-landing" label="着陆选址" payload={{ fromNavigation: true }} />
          <CrossModuleLink signal="assess-neo-risk" label="NEO风险" payload={{ fromNavigation: true }} />
          <CrossModuleLink signal="build-twin" label="构建孪生体" payload={{ fromNavigation: true }} />
        </div>
      </div>
    </div>
  );
}
