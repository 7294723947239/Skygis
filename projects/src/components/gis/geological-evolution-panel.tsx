'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { type CelestialBody, type HubSignal } from '@/lib/skygis-hub';
import CrossModuleLink from './cross-module-link';

/* ===== 地外天体"地质年代-地貌演化"时空叠合分析 ===== */

// 地质年代数据
const LUNAR_ERAS = [
  { id: 'pre-nectarian', name: '前酒海纪', start: -4600, end: -3920, color: '#7c3aed', desc: '月球形成初期，熔岩海洋冷却固化，地壳形成' },
  { id: 'nectarian', name: '酒海纪', start: -3920, end: -3850, color: '#6d28d9', desc: '晚期重轰炸期，大量小天体撞击月球，形成主要盆地' },
  { id: 'imbrium', name: '雨海纪', start: -3850, end: -3200, color: '#4f46e5', desc: '雨海盆地形成，大规模玄武岩喷发填充月海' },
  { id: 'eratosthenian', name: '爱拉托逊纪', start: -3200, end: -1100, color: '#2563eb', desc: '撞击频率降低，年轻撞击坑形成（射纹已消退）' },
  { id: 'copernican', name: '哥白尼纪', start: -1100, end: 0, color: '#06b6d4', desc: '最近地质时期，明亮射纹撞击坑形成' },
];

const MARS_ERAS = [
  { id: 'noachian', name: '诺亚纪', start: -4100, end: -3700, color: '#dc2626', desc: '火星温暖湿润期，大量水流侵蚀地貌，河谷形成' },
  { id: 'hesperian', name: '赫斯珀里亚纪', start: -3700, end: -3000, color: '#ea580c', desc: '火山活动高峰期，大规模熔岩平原形成，水逐渐消失' },
  { id: 'amazonian', name: '亚马逊纪', start: -3000, end: 0, color: '#f59e0b', desc: '寒冷干燥期，冰川活动，极地冰盖形成' },
];

// 地貌特征数据 (按地质年代分组)
const LUNAR_FEATURES = [
  { name: '风暴洋', type: '月海', era: 'imbrium', lat: 18.4, lon: -57.4, desc: '32亿年前玄武岩喷发填充' },
  { name: '雨海', type: '盆地', era: 'imbrium', lat: 32.8, lon: -18.5, desc: '38.5亿年前巨大撞击形成' },
  { name: '静海', type: '月海', era: 'imbrium', lat: 8.5, lon: 31.4, desc: '阿波罗11号着陆点' },
  { name: '东海盆地', type: '盆地', era: 'nectarian', lat: -18.5, lon: -84.0, desc: '晚期重轰炸期多环盆地' },
  { name: '酒海盆地', type: '盆地', era: 'nectarian', lat: -15.0, lon: 35.0, desc: '39.2亿年前撞击形成' },
  { name: '第谷撞击坑', type: '撞击坑', era: 'copernican', lat: -43.3, lon: -11.2, desc: '1.08亿年前形成，射纹遍布月球' },
  { name: '哥白尼撞击坑', type: '撞击坑', era: 'copernican', lat: 9.6, lon: -20.0, desc: '8亿年前形成，射纹系统壮观' },
  { name: '阿里斯塔克斯', type: '撞击坑', era: 'copernican', lat: 23.7, lon: -47.4, desc: '月球最亮撞击坑' },
  { name: '南海', type: '月海', era: 'eratosthenian', lat: -15.0, lon: 35.0, desc: '爱拉托逊纪玄武岩填充' },
  { name: '湿海', type: '月海', era: 'imbrium', lat: -24.5, lon: -38.7, desc: '雨海纪玄武岩填充' },
];

const MARS_FEATURES = [
  { name: '乌托邦平原古海洋', type: '古海洋', era: 'noachian', lat: 45.0, lon: 90.0, desc: '诺亚纪温暖期大型水体，现已干涸' },
  { name: '瓦勒斯马里纳斯', type: '峡谷', era: 'noachian', lat: -14.0, lon: -58.0, desc: '远古水流侵蚀形成的大峡谷系统' },
  { name: '赫拉斯盆地', type: '盆地', era: 'noachian', lat: -42.4, lon: 70.5, desc: '41亿年前巨大撞击，曾可能含有湖泊' },
  { name: '奥林帕斯山', type: '火山', era: 'hesperian', lat: 18.65, lon: -133.1, desc: '赫斯珀里亚纪火山活动高峰产物' },
  { name: '塔尔西斯高原', type: '火山高原', era: 'hesperian', lat: 0.0, lon: -105.0, desc: '持续20亿年的火山隆起' },
  { name: '水手号峡谷', type: '峡谷', era: 'hesperian', lat: -8.0, lon: -72.0, desc: '塔尔西斯隆起导致的地壳拉张断裂' },
  { name: '北极冰盖', type: '冰盖', era: 'amazonian', lat: 85.0, lon: 0.0, desc: '亚马逊纪极地水冰沉积' },
  { name: '盖尔撞击坑', type: '撞击坑', era: 'noachian', lat: -5.4, lon: 137.8, desc: '好奇号发现古湖泊沉积物' },
  { name: '杰泽罗撞击坑', type: '撞击坑', era: 'noachian', lat: 18.4, lon: 77.5, desc: '毅力号发现古河流三角洲' },
  { name: '埃律西昂平原', type: '熔岩平原', era: 'amazonian', lat: 25.0, lon: 150.0, desc: '亚马逊纪最年轻的火山区域' },
];

type TargetBody = 'moon' | 'mars';

export default function GeologicalEvolutionPanel({ onClose, focusedBody, onNavigate }: {
  onClose: () => void;
  focusedBody?: CelestialBody | null;
  onNavigate?: (signal: Omit<HubSignal, 'timestamp'>) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [target, setTarget] = useState<TargetBody>('moon');
  const [sliderValue, setSliderValue] = useState(0); // 百万年前
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const animRef = useRef<number>(0);

  const eras = target === 'moon' ? LUNAR_ERAS : MARS_ERAS;
  const features = target === 'moon' ? LUNAR_FEATURES : MARS_FEATURES;
  const maxAge = target === 'moon' ? 4600 : 4100;

  // 获取当前年代
  const currentEra = eras.find(e => sliderValue >= -e.start && sliderValue <= -e.end) || eras[0];
  const currentAgeMa = -sliderValue;

  // 绘制地图
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // 简化天体表面
    const centerX = w / 2;
    const centerY = h / 2;
    const r = Math.min(w, h) * 0.4;

    // 天体圆盘
    const bodyGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, r);
    if (target === 'moon') {
      bodyGrad.addColorStop(0, '#4a4a4a');
      bodyGrad.addColorStop(1, '#2a2a2a');
    } else {
      bodyGrad.addColorStop(0, '#8b4513');
      bodyGrad.addColorStop(1, '#5c2d0e');
    }
    ctx.beginPath();
    ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // 经纬网格
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 0.5;
    for (let lat = -60; lat <= 60; lat += 30) {
      const y = centerY - (lat / 90) * r;
      ctx.beginPath();
      ctx.moveTo(centerX - r * Math.cos((lat / 90) * Math.PI / 2), y);
      ctx.lineTo(centerX + r * Math.cos((lat / 90) * Math.PI / 2), y);
      ctx.stroke();
    }

    // 绘制地貌特征（根据地质年代着色）
    for (const f of features) {
      const era = eras.find(e => e.id === f.era);
      if (!era) continue;
      // 简化等距投影
      const latRad = (f.lat / 180) * Math.PI;
      const lonRad = (f.lon / 180) * Math.PI;
      const fx = centerX + (lonRad / Math.PI) * r * 0.9;
      const fy = centerY - (latRad / (Math.PI / 2)) * r * 0.45;

      const distFromCenter = Math.sqrt((fx - centerX) ** 2 + (fy - centerY) ** 2);
      if (distFromCenter > r) continue;

      // 判断该地貌是否在当前时间切片"已形成"
      const eraStart = -era.start;
      const isFormed = currentAgeMa <= eraStart;

      if (isFormed) {
        // 已形成: 实心标记
        const size = f.type.includes('盆地') || f.type.includes('海洋') || f.type.includes('月海') ? 8 : 5;
        ctx.beginPath();
        ctx.arc(fx, fy, size, 0, Math.PI * 2);
        ctx.fillStyle = era.color + '80';
        ctx.fill();
        ctx.strokeStyle = era.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // 名称
        ctx.font = '9px sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.textAlign = 'center';
        ctx.fillText(f.name, fx, fy - size - 3);
      } else {
        // 未形成: 空心虚线
        ctx.beginPath();
        ctx.arc(fx, fy, 4, 0, Math.PI * 2);
        ctx.strokeStyle = era.color + '30';
        ctx.setLineDash([2, 2]);
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 时间切片标注
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#f1f5f9';
    ctx.textAlign = 'center';
    ctx.fillText(`${currentAgeMa} 百万年前`, centerX, h - 10);

  }, [target, sliderValue, eras, features, currentAgeMa]);

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

  // 时间轴自动播放
  useEffect(() => {
    if (!isPlaying) { cancelAnimationFrame(animRef.current); return; }
    const animate = () => {
      setSliderValue(v => {
        const next = v + maxAge / 200;
        return next > maxAge ? 0 : next;
      });
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, maxAge]);

  return (
    <div className="fixed inset-0 lg:inset-auto lg:absolute lg:top-14 lg:left-3 lg:w-[520px] lg:max-h-[85vh] z-30 pointer-events-auto flex flex-col bg-[#1e293b]/98 lg:bg-[#1e293b]/95 backdrop-blur-md lg:border lg:border-[#334155] lg:rounded-lg shadow-2xl overflow-y-auto">
      {/* 移动端关闭栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 lg:hidden bg-slate-900 shrink-0">
        <span className="text-sm font-medium text-cyan-400">地质年代-地貌演化</span>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 text-white text-xl font-bold shadow-lg">✕</button>
      </div>
      <div className="sticky top-0 z-10 hidden lg:flex items-center justify-between px-4 py-3 bg-[#1e293b] border-b border-[#334155]">
        <h2 className="text-sm font-semibold text-[#f1f5f9]">地质年代-地貌演化 时空叠合分析</h2>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white text-lg transition-colors">&times;</button>
      </div>

      {/* 目标切换 */}
      <div className="flex gap-1 px-3 pt-3">
        <button onClick={() => { setTarget('moon'); setSliderValue(0); }}
          className={`px-3 py-1.5 text-xs rounded-md ${target === 'moon' ? 'bg-[#94a3b8] text-[#0f172a]' : 'bg-[#334155] text-[#94a3b8]'}`}>
          月球
        </button>
        <button onClick={() => { setTarget('mars'); setSliderValue(0); }}
          className={`px-3 py-1.5 text-xs rounded-md ${target === 'mars' ? 'bg-[#dc2626] text-white' : 'bg-[#334155] text-[#94a3b8]'}`}>
          火星
        </button>
      </div>

      {/* 地图 */}
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
            <input type="range" min="0" max={maxAge} step="10" value={sliderValue}
              onChange={e => { setIsPlaying(false); setSliderValue(Number(e.target.value)); }}
              className="w-full h-1 accent-[#06b6d4]" />
          </div>
          <span className="text-xs text-[#94a3b8] font-mono w-20 text-right">{currentAgeMa} Ma</span>
        </div>

        {/* 年代色带 */}
        <div className="flex h-4 rounded overflow-hidden">
          {eras.map(e => (
            <div key={e.id} style={{ flex: e.start - e.end, backgroundColor: e.color + '80' }}
              className={`flex items-center justify-center text-[8px] text-white font-medium cursor-pointer hover:opacity-80 transition-opacity ${currentEra.id === e.id ? 'ring-1 ring-white' : ''}`}
              onClick={() => setSliderValue(-(e.start + e.end) / 2)}
              title={e.name}>
              {e.name}
            </div>
          ))}
        </div>
      </div>

      {/* 当前年代信息 */}
      <div className="mx-3 mt-3 bg-[#0f172a] rounded-md p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: currentEra.color }} />
          <span className="text-xs font-semibold text-[#f1f5f9]">{currentEra.name}</span>
          <span className="text-[10px] text-[#64748b] font-mono">({-currentEra.start} ~ {-currentEra.end} Ma)</span>
        </div>
        <p className="text-xs text-[#94a3b8]">{currentEra.desc}</p>
      </div>

      {/* 地貌特征列表 */}
      <div className="mx-3 mt-3 mb-3 bg-[#0f172a] rounded-md overflow-hidden">
        <div className="px-3 py-2 text-xs font-semibold text-[#06b6d4] border-b border-[#334155]">
          当前时期已形成的地貌
        </div>
        <div className="max-h-48 overflow-y-auto">
          {features
            .filter(f => {
              const era = eras.find(e => e.id === f.era);
              return era && currentAgeMa <= -era.start;
            })
            .map(f => {
              const era = eras.find(e => e.id === f.era)!;
              return (
                <div key={f.name}
                  className={`px-3 py-2 border-b border-[#1e293b] cursor-pointer hover:bg-[#1e293b] ${selectedFeature === f.name ? 'bg-[#06b6d4]/10' : ''}`}
                  onClick={() => setSelectedFeature(selectedFeature === f.name ? null : f.name)}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: era.color }} />
                    <span className="text-xs text-[#e2e8f0] font-medium">{f.name}</span>
                    <span className="text-[10px] text-[#64748b]">{f.type}</span>
                    <span className="text-[10px] text-[#64748b] ml-auto font-mono">{-era.start} Ma</span>
                  </div>
                  {selectedFeature === f.name && (
                    <p className="text-[10px] text-[#94a3b8] mt-1 pl-4">{f.desc}</p>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* 跨模块关联操作 */}
      <div className="border-t border-slate-700/50 bg-slate-900/80 px-3 py-2">
        <div className="mb-1.5 text-[10px] text-slate-500">地质演化 → 关联模块</div>
        <div className="flex flex-wrap gap-1.5">
          <CrossModuleLink signal="detect-craters" label="撞击坑识别" payload={{ fromGeology: true }} />
          <CrossModuleLink signal="analyze-remote" label="遥感分析" payload={{ fromGeology: true }} />
          <CrossModuleLink signal="query-spatial" label="空间查询" payload={{ fromGeology: true }} />
          <CrossModuleLink signal="select-landing" label="着陆选址" payload={{ fromGeology: true }} />
          <CrossModuleLink signal="build-twin" label="构建孪生体" payload={{ fromGeology: true }} />
        </div>
      </div>
    </div>
  );
}
