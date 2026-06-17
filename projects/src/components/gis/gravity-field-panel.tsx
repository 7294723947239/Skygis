'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { type CelestialBody as HubCelestialBody, type HubSignal } from '@/lib/skygis-hub';
import CrossModuleLink from './cross-module-link';

/* ===== 多体引力场动态可视化与轨道扰动模拟 ===== */

// 万有引力常数 (AU³/(kg·day²))
const G_AU = 2.9592e-4; // G in AU³/(solar_mass·day²)

interface SimBody {
  name: string;
  mass_solar: number; // 太阳质量单位
  x: number; y: number; z: number; // AU
  vx: number; vy: number; vz: number; // AU/day
  color: string;
  radius: number; // 显示半径
}

// 初始天体数据 (简化二维平面, z=0)
const INITIAL_BODIES: SimBody[] = [
  { name: '太阳', mass_solar: 1.0, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, color: '#fbbf24', radius: 8 },
  { name: '水星', mass_solar: 1.66e-7, x: 0.387, y: 0, z: 0, vx: 0, vy: 0.0286, vz: 0, color: '#a1a1aa', radius: 3 },
  { name: '金星', mass_solar: 2.45e-6, x: 0.723, y: 0, z: 0, vx: 0, vy: 0.0202, vz: 0, color: '#f59e0b', radius: 4 },
  { name: '地球', mass_solar: 3.003e-6, x: 1.0, y: 0, z: 0, vx: 0, vy: 0.01720, vz: 0, color: '#3b82f6', radius: 4 },
  { name: '火星', mass_solar: 3.23e-7, x: 1.524, y: 0, z: 0, vx: 0, vy: 0.01394, vz: 0, color: '#ef4444', radius: 3.5 },
  { name: '木星', mass_solar: 9.55e-4, x: 5.203, y: 0, z: 0, vx: 0, vy: 0.00754, vz: 0, color: '#f97316', radius: 6 },
  { name: '土星', mass_solar: 2.86e-4, x: 9.537, y: 0, z: 0, vx: 0, vy: 0.00557, vz: 0, color: '#eab308', radius: 5.5 },
];

// 特洛伊小行星位置 (木星L4/L5点)
const TROJAN_ASTEROIDS = Array.from({ length: 40 }, (_, i) => {
  const angle = (i / 40) * Math.PI * 0.3 - Math.PI * 0.15;
  const r = 5.203 + (Math.random() - 0.5) * 0.8;
  const isL4 = i < 20;
  const baseAngle = isL4 ? Math.PI / 3 : -Math.PI / 3;
  return {
    x: r * Math.cos(baseAngle + angle),
    y: r * Math.sin(baseAngle + angle),
    z: (Math.random() - 0.5) * 0.3,
    group: isL4 ? 'L4 特洛伊群' : 'L5 特洛伊群',
  };
});

type SimMode = 'gravity-field' | 'orbital-resonance' | 'mass-perturbation';

export default function GravityFieldPanel({ onClose, focusedBody, onNavigate }: {
  onClose: () => void;
  focusedBody?: HubCelestialBody | null;
  onNavigate?: (signal: Omit<HubSignal, 'timestamp'>) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [mode, setMode] = useState<SimMode>('gravity-field');
  const [simTime, setSimTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [jupiterMassFactor, setJupiterMassFactor] = useState(1.0);
  const [showFieldLines, setShowFieldLines] = useState(true);
  const [showTrojans, setShowTrojans] = useState(true);
  const [selectedBody, setSelectedBody] = useState<string | null>(null);
  const [perturbResult, setPerturbResult] = useState<string>('');

  const bodiesRef = useRef<SimBody[]>(INITIAL_BODIES.map(b => ({ ...b })));
  const trailsRef = useRef<Map<string, { x: number; y: number }[]>>(new Map());

  // N体引力计算 (Velocity Verlet)
  const computeAccelerations = useCallback((bodies: SimBody[]) => {
    const acc = bodies.map(() => ({ ax: 0, ay: 0, az: 0 }));
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const dx = bodies[j].x - bodies[i].x;
        const dy = bodies[j].y - bodies[i].y;
        const dz = bodies[j].z - bodies[i].z;
        const r2 = dx * dx + dy * dy + dz * dz;
        const r = Math.sqrt(r2);
        const r3 = r2 * r + 1e-10;
        const f = G_AU / r3;
        acc[i].ax += f * bodies[j].mass_solar * dx;
        acc[i].ay += f * bodies[j].mass_solar * dy;
        acc[i].az += f * bodies[j].mass_solar * dz;
        acc[j].ax -= f * bodies[i].mass_solar * dx;
        acc[j].ay -= f * bodies[i].mass_solar * dy;
        acc[j].az -= f * bodies[i].mass_solar * dz;
      }
    }
    return acc;
  }, []);

  // 绘制引力场矢量流
  const drawGravityField = useCallback((ctx: CanvasRenderingContext2D, bodies: SimBody[], w: number, h: number, scale: number) => {
    const step = 30;
    for (let px = 0; px < w; px += step) {
      for (let py = 0; py < h; py += step) {
        const sx = (px - w / 2) / scale;
        const sy = (py - h / 2) / scale;
        let fx = 0, fy = 0;
        for (const b of bodies) {
          const dx = b.x - sx;
          const dy = b.y - sy;
          const r2 = dx * dx + dy * dy + 0.01;
          const r = Math.sqrt(r2);
          const f = G_AU * b.mass_solar / (r2 * r);
          fx += f * dx;
          fy += f * dy;
        }
        const mag = Math.sqrt(fx * fx + fy * fy);
        if (mag < 1e-12) continue;
        const len = Math.min(12, Math.log10(mag + 1e-10) * 3 + 18);
        const nx = fx / mag;
        const ny = fy / mag;
        const ex = px + nx * len;
        const ey = py + ny * len;
        const alpha = Math.min(0.6, Math.max(0.1, (Math.log10(mag) + 8) / 4));
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = `rgba(6,182,212,${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        // 箭头
        const aLen = 3;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - aLen * (nx * 0.8 - ny * 0.5), ey - aLen * (ny * 0.8 + nx * 0.5));
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - aLen * (nx * 0.8 + ny * 0.5), ey - aLen * (ny * 0.8 - nx * 0.5));
        ctx.stroke();
      }
    }
  }, []);

  // 主绘制循环
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const scale = mode === 'gravity-field' ? w / 4.5 : w / 13;

    // 背景
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // 引力场矢量
    if (showFieldLines && mode === 'gravity-field') {
      drawGravityField(ctx, bodiesRef.current, w, h, scale);
    }

    // 引力等势线
    if (showFieldLines) {
      const levels = [0.01, 0.03, 0.1, 0.3, 1.0];
      for (const level of levels) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(6,182,212,0.15)`;
        ctx.lineWidth = 0.5;
        for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
          // 简化: 太阳引力等势面
          const r = Math.sqrt(G_AU * 1.0 / level);
          const px = w / 2 + r * Math.cos(angle) * scale;
          const py = h / 2 + r * Math.sin(angle) * scale;
          if (angle === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }

    // 特洛伊小行星
    if (showTrojans && (mode === 'orbital-resonance' || mode === 'gravity-field')) {
      const jupiter = bodiesRef.current.find(b => b.name === '木星');
      if (jupiter) {
        for (const a of TROJAN_ASTEROIDS) {
          const ax = w / 2 + (a.x + jupiter.x * 0.1) * scale;
          const ay = h / 2 + (a.y + jupiter.y * 0.1) * scale;
          ctx.beginPath();
          ctx.arc(ax, ay, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = a.group === 'L4 特洛伊群' ? 'rgba(251,191,36,0.6)' : 'rgba(249,115,22,0.6)';
          ctx.fill();
        }
        // L4/L5 标签
        ctx.font = '10px monospace';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('L4', w / 2 + 5.203 * scale * 0.5, h / 2 - 5.203 * scale * 0.85);
        ctx.fillStyle = '#f97316';
        ctx.fillText('L5', w / 2 + 5.203 * scale * 0.5, h / 2 + 5.203 * scale * 0.95);
      }
    }

    // 轨道轨迹
    for (const [name, trail] of trailsRef.current) {
      if (trail.length < 2) continue;
      const body = INITIAL_BODIES.find(b => b.name === name);
      if (!body) continue;
      ctx.beginPath();
      for (let i = 0; i < trail.length; i++) {
        const px = w / 2 + trail[i].x * scale;
        const py = h / 2 + trail[i].y * scale;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = body.color + '40';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 天体
    for (const body of bodiesRef.current) {
      const px = w / 2 + body.x * scale;
      const py = h / 2 + body.y * scale;
      // 光晕
      const grd = ctx.createRadialGradient(px, py, 0, px, py, body.radius * 2.5);
      grd.addColorStop(0, body.color + '60');
      grd.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(px, py, body.radius * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
      // 天体
      ctx.beginPath();
      ctx.arc(px, py, body.radius, 0, Math.PI * 2);
      ctx.fillStyle = body.color;
      ctx.fill();
      // 名称
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#e2e8f0';
      ctx.textAlign = 'center';
      ctx.fillText(body.name, px, py - body.radius - 4);
      // 选中高亮
      if (selectedBody === body.name) {
        ctx.beginPath();
        ctx.arc(px, py, body.radius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // 信息叠加
    ctx.font = '11px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText(`模拟时间: ${(simTime / 365.25).toFixed(2)} 年`, 10, 20);
    ctx.fillText(`速度: ${speed}x`, 10, 35);
    if (mode === 'mass-perturbation') {
      ctx.fillText(`木星质量: ${jupiterMassFactor.toFixed(2)}×`, 10, 50);
    }

    // 轨道共振标注
    if (mode === 'orbital-resonance') {
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#06b6d4';
      ctx.fillText('木星-小行星轨道共振效应', w / 2 - 100, 25);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('3:2 共振带 (2.50 AU)', 10, h - 30);
      ctx.fillText('2:1 共振带 (3.28 AU)', 10, h - 15);
      // 绘制共振带
      [2.50, 3.28].forEach((r, idx) => {
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, r * scale, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 0 ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }
  }, [mode, simTime, speed, jupiterMassFactor, showFieldLines, showTrojans, selectedBody, drawGravityField]);

  // 模拟步进
  const step = useCallback(() => {
    const bodies = bodiesRef.current;
    // 木星质量调节
    const jupiter = bodies.find(b => b.name === '木星');
    if (jupiter) {
      jupiter.mass_solar = 9.55e-4 * jupiterMassFactor;
    }
    const dt = speed * 0.5; // 0.5天/步
    const acc = computeAccelerations(bodies);
    for (let i = 1; i < bodies.length; i++) { // 跳过太阳
      bodies[i].vx += acc[i].ax * dt;
      bodies[i].vy += acc[i].ay * dt;
      bodies[i].vz += acc[i].az * dt;
      bodies[i].x += bodies[i].vx * dt;
      bodies[i].y += bodies[i].vy * dt;
      bodies[i].z += bodies[i].vz * dt;
    }
    // 轨迹
    for (const b of bodies) {
      let trail = trailsRef.current.get(b.name);
      if (!trail) { trail = []; trailsRef.current.set(b.name, trail); }
      trail.push({ x: b.x, y: b.y });
      if (trail.length > 800) trail.shift();
    }
    setSimTime(t => t + dt);
  }, [speed, jupiterMassFactor, computeAccelerations]);

  // 动画循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    let frame = 0;
    const animate = () => {
      if (isPlaying) {
        for (let i = 0; i < 2; i++) step();
      }
      draw();
      frame++;
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, step, draw]);

  // 重置
  const handleReset = () => {
    bodiesRef.current = INITIAL_BODIES.map(b => ({ ...b }));
    trailsRef.current.clear();
    setSimTime(0);
    setPerturbResult('');
  };

  // 彗星质量损失模拟
  const simulateCometMassLoss = () => {
    const bodies = bodiesRef.current;
    const earth = bodies.find(b => b.name === '地球');
    if (!earth) return;
    // 添加虚拟彗星
    const comet: SimBody = {
      name: '彗星', mass_solar: 1e-14,
      x: 2.5, y: 1.5, z: 0,
      vx: -0.008, vy: 0.012, vz: 0,
      color: '#a855f7', radius: 3,
    };
    bodies.push(comet);
    trailsRef.current.set('彗星', []);
    setPerturbResult('已注入虚拟彗星（初始位置2.5AU,1.5AU），模拟彗星挥发物质损失导致的轨道偏移...');
  };

  return (
    <div className="fixed inset-0 lg:inset-auto lg:absolute lg:top-14 lg:left-3 lg:w-[520px] lg:max-h-[85vh] z-30 pointer-events-auto flex flex-col bg-[#1e293b]/98 lg:bg-[#1e293b]/95 backdrop-blur-md lg:border lg:border-[#334155] lg:rounded-lg shadow-2xl overflow-y-auto">
      {/* 移动端关闭栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 lg:hidden bg-slate-900 shrink-0">
        <span className="text-sm font-medium text-cyan-400">多体引力场可视化</span>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 text-white text-xl font-bold shadow-lg">✕</button>
      </div>
      {/* 标题栏 */}
      <div className="sticky top-0 z-10 hidden lg:flex items-center justify-between px-4 py-3 bg-[#1e293b] border-b border-[#334155]">
        <h2 className="text-sm font-semibold text-[#f1f5f9]">多体引力场动态可视化 & 轨道扰动模拟</h2>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white text-lg transition-colors">&times;</button>
      </div>

      {/* 模式切换 */}
      <div className="flex gap-1 px-3 pt-3">
        {([
          ['gravity-field', '引力场矢量'],
          ['orbital-resonance', '轨道共振'],
          ['mass-perturbation', '质量扰动'],
        ] as [SimMode, string][]).map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); handleReset(); }}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${mode === m ? 'bg-[#06b6d4] text-white' : 'bg-[#334155] text-[#94a3b8] hover:bg-[#475569]'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="relative mx-3 mt-3 rounded-md overflow-hidden border border-[#334155]" style={{ height: 360 }}>
        <canvas ref={canvasRef} className="w-full h-full" style={{ width: '100%', height: '100%' }} />
        {/* 播放控制 */}
        <div className="absolute bottom-2 left-2 flex items-center gap-2">
          <button onClick={() => setIsPlaying(!isPlaying)}
            className="w-7 h-7 flex items-center justify-center rounded bg-[#0f172a]/80 text-[#06b6d4] text-xs hover:bg-[#1e293b]">
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button onClick={handleReset}
            className="w-7 h-7 flex items-center justify-center rounded bg-[#0f172a]/80 text-[#94a3b8] text-xs hover:bg-[#1e293b]">
            ↺
          </button>
          <select value={speed} onChange={e => setSpeed(Number(e.target.value))}
            className="bg-[#0f172a]/80 text-[#94a3b8] text-xs rounded px-1 py-0.5 border border-[#334155]">
            {[0.5, 1, 2, 5, 10].map(s => <option key={s} value={s}>{s}x</option>)}
          </select>
        </div>
        {/* 右下角切换 */}
        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          <label className="flex items-center gap-1 text-[10px] text-[#94a3b8]">
            <input type="checkbox" checked={showFieldLines} onChange={e => setShowFieldLines(e.target.checked)} className="w-3 h-3" />
            场线
          </label>
          <label className="flex items-center gap-1 text-[10px] text-[#94a3b8]">
            <input type="checkbox" checked={showTrojans} onChange={e => setShowTrojans(e.target.checked)} className="w-3 h-3" />
            特洛伊
          </label>
        </div>
      </div>

      {/* 模式特定控制 */}
      <div className="px-3 pt-3 pb-3 space-y-3">
        {/* 引力场模式说明 */}
        {mode === 'gravity-field' && (
          <div className="bg-[#0f172a] rounded-md p-3 text-xs text-[#94a3b8] space-y-1.5">
            <p className="text-[#06b6d4] font-semibold">三维引力场矢量流图</p>
            <p>箭头方向指向引力合力方向，长度和透明度表示引力强度</p>
            <p>虚线圆为太阳引力等势面，不同距离引力强度差异明显</p>
            <p>点击天体名称查看引力参数</p>
          </div>
        )}

        {/* 轨道共振模式 */}
        {mode === 'orbital-resonance' && (
          <div className="bg-[#0f172a] rounded-md p-3 text-xs text-[#94a3b8] space-y-1.5">
            <p className="text-[#10b981] font-semibold">木星轨道共振效应</p>
            <p>3:2 共振带 (2.50 AU): 小行星与木星公转周期比 3:2，形成稳定轨道</p>
            <p>2:1 共振带 (3.28 AU): 周期比 2:1，此区域小行星稀疏（柯克伍德空隙）</p>
            <p>黄色点: L4 特洛伊群 (领先木星60°)，橙色点: L5 特洛伊群 (落后60°)</p>
            <p>特洛伊群因引力锁定稳定存在于拉格朗日点</p>
          </div>
        )}

        {/* 质量扰动模式 */}
        {mode === 'mass-perturbation' && (
          <div className="space-y-2">
            <div className="bg-[#0f172a] rounded-md p-3 space-y-2">
              <p className="text-[#f59e0b] font-semibold text-xs">天体质量变化参数</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#94a3b8] w-20">木星质量:</span>
                <input type="range" min="0" max="5" step="0.1" value={jupiterMassFactor}
                  onChange={e => setJupiterMassFactor(Number(e.target.value))}
                  className="flex-1 h-1 accent-[#f97316]" />
                <span className="text-xs text-[#f97316] w-12 text-right font-mono">{jupiterMassFactor.toFixed(1)}×</span>
              </div>
              <p className="text-[10px] text-[#64748b]">
                调整木星质量观察对内行星轨道的影响 — 增大质量可压缩内行星轨道
              </p>
            </div>
            <button onClick={simulateCometMassLoss}
              className="w-full py-2 text-xs bg-[#7c3aed] text-white rounded-md hover:bg-[#6d28d9] transition-colors">
              注入彗星（模拟挥发物质损失导致轨道偏移）
            </button>
            {perturbResult && (
              <div className="bg-[#0f172a] rounded-md p-2 text-xs text-[#a855f7]">{perturbResult}</div>
            )}
          </div>
        )}

        {/* 天体数据表 */}
        <div className="bg-[#0f172a] rounded-md overflow-hidden">
          <div className="px-3 py-2 text-xs font-semibold text-[#06b6d4] border-b border-[#334155]">天体引力参数</div>
          <div className="max-h-40 overflow-y-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="text-[#64748b] border-b border-[#1e293b]">
                  <th className="px-2 py-1 text-left">天体</th>
                  <th className="px-2 py-1 text-right">质量(M☉)</th>
                  <th className="px-2 py-1 text-right">日距(AU)</th>
                  <th className="px-2 py-1 text-right">引力加速度</th>
                </tr>
              </thead>
              <tbody>
                {bodiesRef.current.filter(b => b.name !== '太阳').map(b => {
                  const r = Math.sqrt(b.x ** 2 + b.y ** 2 + b.z ** 2);
                  const gSun = G_AU * 1.0 / (r * r);
                  return (
                    <tr key={b.name}
                      className={`border-b border-[#1e293b] cursor-pointer hover:bg-[#1e293b] ${selectedBody === b.name ? 'bg-[#06b6d4]/10' : ''}`}
                      onClick={() => setSelectedBody(selectedBody === b.name ? null : b.name)}>
                      <td className="px-2 py-1 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                        <span className="text-[#e2e8f0]">{b.name}</span>
                      </td>
                      <td className="px-2 py-1 text-right text-[#94a3b8] font-mono">{b.mass_solar.toExponential(2)}</td>
                      <td className="px-2 py-1 text-right text-[#94a3b8] font-mono">{r.toFixed(3)}</td>
                      <td className="px-2 py-1 text-right text-[#06b6d4] font-mono">{gSun.toExponential(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 跨模块关联操作 */}
      <div className="border-t border-slate-700/50 bg-slate-900/80 px-3 py-2">
        <div className="mb-1.5 text-[10px] text-slate-500">引力场 → 关联模块</div>
        <div className="flex flex-wrap gap-1.5">
          <CrossModuleLink signal="plan-orbit" label="轨道规划" payload={{ fromGravity: true }} />
          <CrossModuleLink signal="query-spatial" label="空间查询" payload={{ fromGravity: true }} />
          <CrossModuleLink signal="run-simulation" label="时空推演" payload={{ fromGravity: true }} />
          <CrossModuleLink signal="assess-neo-risk" label="NEO风险" payload={{ fromGravity: true }} />
          <CrossModuleLink signal="build-twin" label="构建孪生体" payload={{ fromGravity: true }} />
        </div>
      </div>
    </div>
  );
}
