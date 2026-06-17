'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { type CelestialBody, type HubSignal } from '@/lib/skygis-hub';
import CrossModuleLink from './cross-module-link';

/* ===== 沉浸式"天体演化史"时空漫游 ===== */

interface EvolutionEvent {
  time_ma: number; // 百万年前
  era: string;
  title: string;
  desc: string;
  scene: string; // 场景描述
  color: string;
  icon: string;
}

const EVOLUTION_TIMELINE: EvolutionEvent[] = [
  { time_ma: 4600, era: '太阳星云', title: '分子云坍缩', desc: '一片巨分子云在引力扰动下开始坍缩，核心温度和密度急剧上升', scene: '深空中弥漫着暗红色尘埃云，缓缓向中心聚拢', color: '#7c3aed', icon: '☁️' },
  { time_ma: 4567, era: '原恒星', title: '太阳点燃', desc: '核心温度达到1000万K，氢聚变反应启动，太阳进入主序星阶段', scene: '中心骤然迸发耀眼白光，周围尘埃盘旋转加速', color: '#fbbf24', icon: '☀️' },
  { time_ma: 4540, era: '原行星盘', title: '行星胚胎形成', desc: '吸积盘中的尘埃颗粒碰撞粘连，形成千米级微行星', scene: '扁平旋转盘面上无数亮点碰撞融合', color: '#f97316', icon: '💫' },
  { time_ma: 4500, era: '行星分化', title: '类地行星诞生', desc: '微行星持续碰撞生长，水星/金星/地球/火星先后形成', scene: '四颗红色炽热球体在内太阳系剧烈碰撞中成型', color: '#ef4444', icon: '🔴' },
  { time_ma: 4480, era: '大碰撞', title: '月球形成', desc: '火星大小的忒伊亚撞击原始地球，抛射物凝聚成月球', scene: '一颗巨大天体猛烈撞向地球，碎片飞溅形成环', color: '#a1a1aa', icon: '🌙' },
  { time_ma: 4400, era: '气态巨行星', title: '木星/土星形成', desc: '冰线外侧气态物质快速吸积，木星率先形成并塑造太阳系格局', scene: '两颗巨大气态行星在外围旋转，引力扰动清扫轨道', color: '#f97316', icon: '🪐' },
  { time_ma: 4200, era: '晚期重轰炸', title: '晚期重轰炸期开始', desc: '木星/土星轨道迁移扰动柯伊伯带，大量小天体射入内太阳系', scene: '无数火球从天而降，月球表面遍布撞击闪光', color: '#dc2626', icon: '☄️' },
  { time_ma: 3900, era: '重轰炸结束', title: '晚期重轰炸期结束', desc: '内太阳系撞击率骤降，地球表面开始冷却', scene: '撞击逐渐稀少，熔岩海洋凝固为深色地壳', color: '#7c3aed', icon: '🌋' },
  { time_ma: 3800, era: '生命起源', title: '最早生命迹象', desc: '地球上出现最早的单细胞生命，可能在深海热泉口', scene: '深蓝色海洋中，热泉口周围闪烁微弱荧光', color: '#10b981', icon: '🧬' },
  { time_ma: 2500, era: '大氧化', title: '大氧化事件', desc: '蓝藻光合作用释放氧气，大气成分根本性改变', scene: '海洋由绿色变为蓝色，大气逐渐透明', color: '#06b6d4', icon: '💨' },
  { time_ma: 540, era: '寒武纪', title: '寒武纪生命大爆发', desc: '多细胞生物快速多样化，几乎所有现代动物门出现', scene: '浅海中形态各异的生物蓬勃涌现', color: '#10b981', icon: '🐚' },
  { time_ma: 66, era: 'K-Pg灭绝', title: '恐龙灭绝', desc: '小行星撞击尤卡坦半岛，非鸟恐龙和75%物种灭绝', scene: '天空被尘埃遮蔽，巨型撞击坑冒出浓烟', color: '#dc2626', icon: '💀' },
  { time_ma: 0, era: '现代', title: '人类太空时代', desc: '人类发射探测器，建立空间站，开始探索太阳系', scene: '蓝色地球上方，空间站缓缓旋转', color: '#3b82f6', icon: '🛰️' },
];

export default function EvolutionHistoryPanel({ onClose, focusedBody, onNavigate }: {
  onClose: () => void;
  focusedBody?: CelestialBody | null;
  onNavigate?: (signal: Omit<HubSignal, 'timestamp'>) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sliderValue, setSliderValue] = useState(4600);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EvolutionEvent | null>(null);
  const [jupiterOffset, setJupiterOffset] = useState(0);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number }[]>([]);

  // 当前最近事件
  const currentEvent = EVOLUTION_TIMELINE.reduce((prev, curr) =>
    Math.abs(curr.time_ma - sliderValue) < Math.abs(prev.time_ma - sliderValue) ? curr : prev
  );

  // 初始化粒子
  useEffect(() => {
    const particles = Array.from({ length: 200 }, () => ({
      x: Math.random() * 500 - 250,
      y: Math.random() * 500 - 250,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
    }));
    particlesRef.current = particles;
  }, []);

  // 绘制场景
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // 背景渐变 - 根据时代变化
    const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200);
    if (sliderValue > 4500) {
      // 星云阶段
      bgGrad.addColorStop(0, '#2d1b69');
      bgGrad.addColorStop(0.5, '#1a0f3d');
      bgGrad.addColorStop(1, '#0a0516');
    } else if (sliderValue > 4200) {
      // 重轰炸
      bgGrad.addColorStop(0, '#4a1515');
      bgGrad.addColorStop(0.5, '#1f0808');
      bgGrad.addColorStop(1, '#0a0205');
    } else if (sliderValue > 3800) {
      // 冷却
      bgGrad.addColorStop(0, '#1a2a4a');
      bgGrad.addColorStop(0.5, '#0d1525');
      bgGrad.addColorStop(1, '#050a14');
    } else {
      // 现代深空
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.5, '#0b1120');
      bgGrad.addColorStop(1, '#050a14');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 星云/尘埃粒子
    for (const p of particlesRef.current) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x > 250) p.x = -250;
      if (p.x < -250) p.x = 250;
      if (p.y > 250) p.y = -250;
      if (p.y < -250) p.y = 250;

      const px = cx + p.x;
      const py = cy + p.y;

      if (sliderValue > 4540) {
        // 星云阶段: 粒子向中心汇聚
        const angle = Math.atan2(py - cy, px - cx);
        const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
        const pull = Math.max(0, 1 - (4600 - sliderValue) / 100) * 0.3;
        p.vx -= Math.cos(angle) * pull * 0.01;
        p.vy -= Math.sin(angle) * pull * 0.01;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124,58,237,${p.alpha * 0.5})`;
        ctx.fill();
      } else if (sliderValue > 4200) {
        // 重轰炸: 火球
        ctx.beginPath();
        ctx.arc(px, py, p.size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(239,68,68,${p.alpha * 0.4})`;
        ctx.fill();
      } else {
        // 现代: 星星
        ctx.beginPath();
        ctx.arc(px, py, p.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.alpha * 0.6})`;
        ctx.fill();
      }
    }

    // 太阳
    if (sliderValue < 4567) {
      // 原恒星
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
      glow.addColorStop(0, '#fbbf2480');
      glow.addColorStop(0.5, '#f9731630');
      glow.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
    } else {
      // 主序星
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 25);
      glow.addColorStop(0, '#fff7ed');
      glow.addColorStop(0.3, '#fbbf24');
      glow.addColorStop(0.7, '#f9731640');
      glow.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, 25, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
    }

    // 行星 (简化)
    const planets = [
      { name: '水星', dist: 30, color: '#a1a1aa', size: 2, show: sliderValue < 4500 },
      { name: '金星', dist: 42, color: '#f59e0b', size: 2.5, show: sliderValue < 4500 },
      { name: '地球', dist: 55, color: '#3b82f6', size: 3, show: sliderValue < 4500 },
      { name: '火星', dist: 68, color: '#ef4444', size: 2.5, show: sliderValue < 4500 },
      { name: '木星', dist: 100, color: '#f97316', size: 7, show: sliderValue < 4400, offset: jupiterOffset },
      { name: '土星', dist: 130, color: '#eab308', size: 6, show: sliderValue < 4400 },
    ];

    for (const p of planets) {
      if (!p.show) continue;
      const angle = (sliderValue / 100 + (p.offset || 0)) * 0.1;
      const px = cx + p.dist * Math.cos(angle);
      const py = cy + p.dist * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      // 地球特殊效果
      if (p.name === '地球') {
        if (sliderValue < 3800) {
          // 熔岩地球
          ctx.beginPath();
          ctx.arc(px, py, p.size + 2, 0, Math.PI * 2);
          ctx.strokeStyle = '#ef444440';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (sliderValue < 2500) {
          // 海洋形成
          ctx.beginPath();
          ctx.arc(px, py, p.size + 1, 0, Math.PI * 2);
          ctx.strokeStyle = '#06b6d440';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        // 月球
        if (sliderValue < 4480) {
          const moonAngle = angle + 1.5;
          const moonDist = 8;
          ctx.beginPath();
          ctx.arc(px + moonDist * Math.cos(moonAngle), py + moonDist * Math.sin(moonAngle), 1.5, 0, Math.PI * 2);
          ctx.fillStyle = '#a1a1aa';
          ctx.fill();
        }
      }
    }

    // 小行星撞击效果 (重轰炸期)
    if (sliderValue > 3800 && sliderValue < 4200) {
      const t = Date.now() * 0.003;
      for (let i = 0; i < 5; i++) {
        const angle = t + i * 1.2;
        const r = 30 + i * 15;
        const sx = cx + r * Math.cos(angle);
        const sy = cy + r * Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + 6 * Math.cos(angle + Math.PI), sy + 6 * Math.sin(angle + Math.PI));
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // 时代标签
    ctx.font = '14px sans-serif';
    ctx.fillStyle = currentEvent.color;
    ctx.textAlign = 'center';
    ctx.fillText(currentEvent.era, cx, 25);
    ctx.font = '11px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${Math.round(sliderValue)} 百万年前`, cx, 42);

  }, [sliderValue, currentEvent, jupiterOffset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const render = () => {
      draw();
      animRef.current = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  // 自动播放
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSliderValue(v => {
        const next = v - 5;
        if (next < 0) { setIsPlaying(false); return 0; }
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="fixed inset-0 lg:inset-auto lg:absolute lg:top-14 lg:left-3 lg:w-[520px] lg:max-h-[85vh] z-30 pointer-events-auto flex flex-col bg-[#1e293b]/98 lg:bg-[#1e293b]/95 backdrop-blur-md lg:border lg:border-[#334155] lg:rounded-lg shadow-2xl overflow-y-auto">
      {/* 移动端关闭栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 lg:hidden bg-slate-900 shrink-0">
        <span className="text-sm font-medium text-cyan-400">天体演化史 时空漫游</span>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 text-white text-xl font-bold shadow-lg">✕</button>
      </div>
      <div className="sticky top-0 z-10 hidden lg:flex items-center justify-between px-4 py-3 bg-[#1e293b] border-b border-[#334155]">
        <h2 className="text-sm font-semibold text-[#f1f5f9]">天体演化史 时空漫游</h2>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white text-lg transition-colors">&times;</button>
      </div>

      {/* 场景画布 */}
      <div className="relative mx-3 mt-3 rounded-md overflow-hidden border border-[#334155]" style={{ height: 320 }}>
        <canvas ref={canvasRef} className="w-full h-full" style={{ width: '100%', height: '100%' }} />
      </div>

      {/* 时间轴 */}
      <div className="px-3 pt-3 space-y-2">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsPlaying(!isPlaying)}
            className="w-7 h-7 flex items-center justify-center rounded bg-[#0f172a] text-[#06b6d4] text-xs">
            {isPlaying ? '⏸' : '▶'}
          </button>
          <div className="flex-1">
            <input type="range" min="0" max="4600" step="10" value={sliderValue}
              onChange={e => { setIsPlaying(false); setSliderValue(Number(e.target.value)); }}
              className="w-full h-1 accent-[#06b6d4]" />
          </div>
        </div>

        {/* 年代色带 */}
        <div className="flex h-5 rounded overflow-hidden text-[7px]">
          {EVOLUTION_TIMELINE.slice().reverse().map((e, i) => (
            <div key={i} style={{ flex: i === 0 ? e.time_ma : e.time_ma - EVOLUTION_TIMELINE.slice().reverse()[i - 1].time_ma, backgroundColor: e.color + '60' }}
              className={`flex items-center justify-center text-white cursor-pointer hover:opacity-80 ${currentEvent.time_ma === e.time_ma ? 'ring-1 ring-white' : ''}`}
              onClick={() => { setIsPlaying(false); setSliderValue(e.time_ma); }}
              title={e.title}>
              {e.era.length > 3 ? e.era.slice(0, 3) : e.era}
            </div>
          ))}
        </div>
      </div>

      {/* 当前事件卡片 */}
      <div className="mx-3 mt-3 bg-[#0f172a] rounded-md p-4 border-l-4" style={{ borderColor: currentEvent.color }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{currentEvent.icon}</span>
          <span className="text-sm font-semibold text-[#f1f5f9]">{currentEvent.title}</span>
          <span className="text-[10px] text-[#64748b] font-mono ml-auto">{currentEvent.time_ma} Ma</span>
        </div>
        <p className="text-xs text-[#94a3b8] mb-2">{currentEvent.desc}</p>
        <div className="bg-[#1e293b] rounded px-3 py-2 text-[11px] text-[#06b6d4] italic">
          {currentEvent.scene}
        </div>
      </div>

      {/* 干预模拟: 木星位置调整 */}
      <div className="mx-3 mt-3 mb-3 bg-[#0f172a] rounded-md p-3 space-y-2">
        <div className="text-[10px] text-[#f59e0b] font-semibold">用户干预模拟</div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#94a3b8] w-24">木星轨道偏移:</span>
          <input type="range" min="-2" max="2" step="0.1" value={jupiterOffset}
            onChange={e => setJupiterOffset(Number(e.target.value))}
            className="flex-1 h-1 accent-[#f97316]" />
          <span className="text-[10px] text-[#f97316] font-mono w-12 text-right">{jupiterOffset > 0 ? '+' : ''}{jupiterOffset.toFixed(1)} AU</span>
        </div>
        <p className="text-[10px] text-[#64748b]">
          调整木星形成位置，观察对内行星轨道的连锁影响。木星向内偏移可能导致火星轨道不稳定，向外偏移可能使小行星带增宽。
        </p>
      </div>

      {/* 事件列表 */}
      <div className="mx-3 mb-3 bg-[#0f172a] rounded-md overflow-hidden">
        <div className="px-3 py-2 text-xs font-semibold text-[#06b6d4] border-b border-[#334155]">46亿年演化事件</div>
        <div className="max-h-40 overflow-y-auto">
          {EVOLUTION_TIMELINE.map((e, i) => (
            <div key={i}
              className={`px-3 py-2 border-b border-[#1e293b] cursor-pointer hover:bg-[#1e293b] transition-colors ${selectedEvent?.time_ma === e.time_ma ? 'bg-[#06b6d4]/10' : ''} ${currentEvent.time_ma === e.time_ma ? 'border-l-2' : ''}`}
              style={{ borderLeftColor: currentEvent.time_ma === e.time_ma ? e.color : undefined }}
              onClick={() => { setSelectedEvent(e); setIsPlaying(false); setSliderValue(e.time_ma); }}>
              <div className="flex items-center gap-2">
                <span className="text-xs">{e.icon}</span>
                <span className="text-[11px] text-[#e2e8f0]">{e.title}</span>
                <span className="text-[9px] text-[#64748b] font-mono ml-auto">{e.time_ma} Ma</span>
              </div>
              {selectedEvent?.time_ma === e.time_ma && (
                <p className="text-[10px] text-[#94a3b8] mt-1 pl-5">{e.desc}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 跨模块关联操作 */}
      <div className="border-t border-slate-700/50 bg-slate-900/80 px-3 py-2">
        <div className="mb-1.5 text-[10px] text-slate-500">演化漫游 → 关联模块</div>
        <div className="flex flex-wrap gap-1.5">
          <CrossModuleLink signal="view-geological" label="地质演化" payload={{ fromEvolution: true }} />
          <CrossModuleLink signal="run-simulation" label="时空推演" payload={{ fromEvolution: true }} />
          <CrossModuleLink signal="detect-craters" label="撞击坑识别" payload={{ fromEvolution: true }} />
          <CrossModuleLink signal="build-twin" label="构建孪生体" payload={{ fromEvolution: true }} />
        </div>
      </div>
    </div>
  );
}
