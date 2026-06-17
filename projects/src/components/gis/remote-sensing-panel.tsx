'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { type CelestialBody, type HubSignal } from '@/lib/skygis-hub';
import CrossModuleLink from './cross-module-link';

/* ===== 多波段遥感数据融合"天体物理特征"专题分析 ===== */

type BandType = 'visible' | 'infrared' | 'radar' | 'uv' | 'xray';
type TargetBody = 'mars' | 'jupiter' | 'moon';

interface BandInfo {
  id: BandType;
  name: string;
  wavelength: string;
  color: string;
  detects: string;
  weight: number;
}

const BANDS: BandInfo[] = [
  { id: 'visible', name: '可见光', wavelength: '400-700nm', color: '#e2e8f0', detects: '表面形貌、颜色差异', weight: 50 },
  { id: 'infrared', name: '红外', wavelength: '700nm-1mm', color: '#ef4444', detects: '温度分布、水冰、矿物', weight: 60 },
  { id: 'radar', name: '雷达', wavelength: '1mm-1m', color: '#3b82f6', detects: '地下结构、冰层、地形', weight: 40 },
  { id: 'uv', name: '紫外', wavelength: '10-400nm', color: '#a855f7', detects: '大气成分、极光活动', weight: 30 },
  { id: 'xray', name: 'X射线', wavelength: '0.01-10nm', color: '#06b6d4', detects: '高能粒子、辐射环境', weight: 20 },
];

interface ThematicMap {
  id: string;
  name: string;
  body: TargetBody;
  layers: BandType[];
  desc: string;
  thresholds: { param: string; min: number; max: number; unit: string }[];
}

const THEMATIC_MAPS: ThematicMap[] = [
  {
    id: 'mars-water',
    name: '火星水冰分布专题图',
    body: 'mars',
    layers: ['infrared', 'radar'],
    desc: '叠加雷达探测数据（地下冰层）与红外数据（表面冰盖），标注潜在可利用水源',
    thresholds: [
      { param: '温度', min: -150, max: -50, unit: '°C' },
      { param: '水冰含量', min: 5, max: 100, unit: '%' },
    ],
  },
  {
    id: 'jupiter-storm',
    name: '木星大气风暴动态图',
    body: 'jupiter',
    layers: ['visible', 'infrared', 'uv'],
    desc: '基于哈勃望远镜观测数据，追踪大红斑的收缩与移动，预测其强度变化',
    thresholds: [
      { param: '风速', min: 150, max: 620, unit: 'km/h' },
      { param: '温度异常', min: -10, max: 30, unit: 'K' },
    ],
  },
  {
    id: 'mars-mineral',
    name: '火星赤铁矿分布专题图',
    body: 'mars',
    layers: ['visible', 'infrared'],
    desc: '自动加权可见光波段识别赤铁矿分布区域，标注矿物富集带',
    thresholds: [
      { param: '赤铁矿丰度', min: 0, max: 100, unit: '%' },
      { param: '海拔', min: -8, max: 21, unit: 'km' },
    ],
  },
  {
    id: 'moon-radiation',
    name: '月球辐射环境专题图',
    body: 'moon',
    layers: ['xray', 'uv', 'infrared'],
    desc: '综合X射线和紫外数据评估月球表面辐射环境，标注安全区域',
    thresholds: [
      { param: '辐射剂量', min: 0, max: 300, unit: 'mSv/yr' },
      { param: '表面温度', min: -173, max: 127, unit: '°C' },
    ],
  },
];

// 生成模拟遥感数据网格
function generateGridData(band: BandType, body: TargetBody, size: number = 40): number[][] {
  const data: number[][] = [];
  for (let y = 0; y < size; y++) {
    const row: number[] = [];
    for (let x = 0; x < size; x++) {
      let val = 0;
      const cx = size / 2;
      const cy = size / 2;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / size;

      if (band === 'visible') {
        // 可见光: 表面亮度
        val = 0.3 + 0.5 * Math.random() + 0.2 * Math.sin(x * 0.3) * Math.cos(y * 0.2);
        if (body === 'jupiter') val += 0.3 * Math.sin(y * 0.5); // 条纹
      } else if (band === 'infrared') {
        // 红外: 温度分布
        val = 0.5 - dist * 0.3 + 0.3 * Math.random();
        if (body === 'mars') {
          // 极地冰盖
          if (y < 5 || y > size - 5) val = 0.1 + Math.random() * 0.1;
        }
      } else if (band === 'radar') {
        // 雷达: 地下结构
        val = 0.2 + 0.4 * Math.random();
        if (body === 'mars' && y > size - 10) val += 0.3; // 地下冰
      } else if (band === 'uv') {
        // 紫外: 大气活动
        val = 0.1 + 0.2 * Math.random();
        if (body === 'jupiter') val += 0.4 * Math.exp(-((x - 25) ** 2 + (y - 20) ** 2) / 50); // 大红斑
      } else if (band === 'xray') {
        // X射线: 辐射
        val = 0.2 + 0.3 * Math.random();
        if (body === 'moon') val += 0.2 * (1 - dist); // 向阳面高辐射
      }
      row.push(Math.max(0, Math.min(1, val)));
    }
    data.push(row);
  }
  return data;
}

export default function RemoteSensingPanel({ onClose, focusedBody, onNavigate }: {
  onClose: () => void;
  focusedBody?: CelestialBody | null;
  onNavigate?: (signal: Omit<HubSignal, 'timestamp'>) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [target, setTarget] = useState<TargetBody>('mars');
  const [activeBands, setActiveBands] = useState<Set<BandType>>(new Set(['visible', 'infrared']));
  const [bandWeights, setBandWeights] = useState<Record<BandType, number>>({
    visible: 50, infrared: 60, radar: 40, uv: 30, xray: 20,
  });
  const [selectedMap, setSelectedMap] = useState<string | null>('mars-water');
  const [thresholds, setThresholds] = useState<Record<string, { min: number; max: number }>>({});
  const [autoWeight, setAutoWeight] = useState(false);
  const gridCacheRef = useRef<Map<string, number[][]>>(new Map());

  // 当前专题图
  const currentMap = THEMATIC_MAPS.find(m => m.id === selectedMap);

  // 初始化阈值
  useEffect(() => {
    const t: Record<string, { min: number; max: number }> = {};
    for (const map of THEMATIC_MAPS) {
      for (const th of map.thresholds) {
        t[th.param] = { min: th.min, max: th.max };
      }
    }
    setThresholds(t);
  }, []);

  // 应用预设专题图
  useEffect(() => {
    if (!currentMap) return;
    setTarget(currentMap.body);
    setActiveBands(new Set(currentMap.layers));
    if (autoWeight && currentMap.id === 'mars-mineral') {
      setBandWeights(prev => ({ ...prev, visible: 80, infrared: 70 }));
    }
  }, [selectedMap, autoWeight, currentMap]);

  // 生成或缓存网格数据
  const getGridData = useCallback((band: BandType, body: TargetBody) => {
    const key = `${band}-${body}`;
    if (!gridCacheRef.current.has(key)) {
      gridCacheRef.current.set(key, generateGridData(band, body));
    }
    return gridCacheRef.current.get(key)!;
  }, []);

  // 波段权重自适应算法
  const applyAdaptiveWeight = useCallback(() => {
    if (!currentMap) return;
    const weights = { ...bandWeights };
    if (currentMap.id === 'mars-mineral') {
      weights.visible = 85;
      weights.infrared = 75;
      weights.radar = 20;
      weights.uv = 10;
      weights.xray = 5;
    } else if (currentMap.id === 'mars-water') {
      weights.infrared = 80;
      weights.radar = 90;
      weights.visible = 30;
      weights.uv = 15;
      weights.xray = 10;
    } else if (currentMap.id === 'jupiter-storm') {
      weights.visible = 70;
      weights.infrared = 60;
      weights.uv = 80;
      weights.radar = 10;
      weights.xray = 15;
    } else if (currentMap.id === 'moon-radiation') {
      weights.xray = 90;
      weights.uv = 75;
      weights.infrared = 50;
      weights.visible = 20;
      weights.radar = 30;
    }
    setBandWeights(weights);
  }, [currentMap, bandWeights]);

  useEffect(() => {
    if (autoWeight) applyAdaptiveWeight();
  }, [autoWeight, selectedMap, applyAdaptiveWeight]);

  // 绘制融合图
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const gridSize = 40;
    const cellW = w / gridSize;
    const cellH = h / gridSize;

    // 获取所有活跃波段数据
    const bandData: { band: BandType; data: number[][]; weight: number; color: [number, number, number] }[] = [];
    const colorMap: Record<BandType, [number, number, number]> = {
      visible: [226, 232, 240],
      infrared: [239, 68, 68],
      radar: [59, 130, 246],
      uv: [168, 85, 247],
      xray: [6, 182, 212],
    };

    for (const band of activeBands) {
      bandData.push({
        band,
        data: getGridData(band, target),
        weight: bandWeights[band],
        color: colorMap[band],
      });
    }

    if (bandData.length === 0) {
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText('请选择至少一个波段', w / 2, h / 2);
      return;
    }

    const totalWeight = bandData.reduce((s, b) => s + b.weight, 0);

    // 渲染融合图像
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const cx = x * cellW;
        const cy = y * cellH;

        // 圆形裁剪 (模拟天体盘面)
        const dx = (x - gridSize / 2) / (gridSize / 2);
        const dy = (y - gridSize / 2) / (gridSize / 2);
        if (dx * dx + dy * dy > 1) continue;

        let r = 0, g = 0, b = 0;
        for (const bd of bandData) {
          const val = bd.data[y][x];
          const w_factor = bd.weight / totalWeight;
          r += bd.color[0] * val * w_factor;
          g += bd.color[1] * val * w_factor;
          b += bd.color[2] * val * w_factor;
        }

        ctx.fillStyle = `rgb(${Math.min(255, Math.round(r))},${Math.min(255, Math.round(g))},${Math.min(255, Math.round(b))})`;
        ctx.fillRect(cx, cy, cellW + 0.5, cellH + 0.5);
      }
    }

    // 叠加标注
    if (currentMap) {
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'center';

      if (currentMap.id === 'mars-water') {
        ctx.fillText('❄ 北极冰盖', w / 2, 25);
        ctx.fillText('❄ 南极冰盖', w / 2, h - 15);
        ctx.fillStyle = '#3b82f6';
        ctx.fillText('💧 地下冰层', w * 0.3, h * 0.7);
      } else if (currentMap.id === 'jupiter-storm') {
        ctx.fillStyle = '#ef4444';
        ctx.fillText('🌀 大红斑', w * 0.55, h * 0.45);
        ctx.fillStyle = '#a855f7';
        ctx.fillText('⚡ 极光活动', w * 0.3, h * 0.2);
      } else if (currentMap.id === 'mars-mineral') {
        ctx.fillStyle = '#f97316';
        ctx.fillText('⛏ 赤铁矿富集', w * 0.6, h * 0.5);
      } else if (currentMap.id === 'moon-radiation') {
        ctx.fillStyle = '#10b981';
        ctx.fillText('🛡 安全区域(极地)', w / 2, h * 0.15);
        ctx.fillStyle = '#ef4444';
        ctx.fillText('☢ 高辐射区(赤道)', w / 2, h * 0.55);
      }
    }

  }, [target, activeBands, bandWeights, currentMap, getGridData]);

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

  const toggleBand = (band: BandType) => {
    setActiveBands(prev => {
      const next = new Set(prev);
      if (next.has(band)) next.delete(band);
      else next.add(band);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 lg:inset-auto lg:absolute lg:top-14 lg:left-3 lg:w-[520px] lg:max-h-[85vh] z-30 pointer-events-auto flex flex-col bg-[#1e293b]/98 lg:bg-[#1e293b]/95 backdrop-blur-md lg:border lg:border-[#334155] lg:rounded-lg shadow-2xl overflow-y-auto">
      {/* 移动端关闭栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 lg:hidden bg-slate-900 shrink-0">
        <span className="text-sm font-medium text-cyan-400">多波段遥感分析</span>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 text-white text-xl font-bold shadow-lg">✕</button>
      </div>
      <div className="sticky top-0 z-10 hidden lg:flex items-center justify-between px-4 py-3 bg-[#1e293b] border-b border-[#334155]">
        <h2 className="text-sm font-semibold text-[#f1f5f9]">多波段遥感数据融合 专题分析</h2>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white text-lg transition-colors">&times;</button>
      </div>

      {/* 专题图预设 */}
      <div className="px-3 pt-3">
        <div className="text-[10px] text-[#64748b] mb-1">预设专题图</div>
        <div className="flex gap-1 flex-wrap">
          {THEMATIC_MAPS.map(m => (
            <button key={m.id} onClick={() => setSelectedMap(m.id)}
              className={`px-2 py-1 text-[10px] rounded-md transition-colors ${selectedMap === m.id ? 'bg-[#06b6d4] text-white' : 'bg-[#334155] text-[#94a3b8] hover:bg-[#475569]'}`}>
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* 融合图 */}
      <div className="relative mx-3 mt-3 rounded-md overflow-hidden border border-[#334155]" style={{ height: 280 }}>
        <canvas ref={canvasRef} className="w-full h-full" style={{ width: '100%', height: '100%' }} />
      </div>

      {/* 波段选择 & 权重 */}
      <div className="px-3 pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[10px] text-[#64748b]">波段选择 & 权重调节</div>
          <label className="flex items-center gap-1 text-[10px] text-[#f59e0b]">
            <input type="checkbox" checked={autoWeight} onChange={e => setAutoWeight(e.target.checked)} className="w-3 h-3" />
            自适应权重
          </label>
        </div>
        {BANDS.map(band => (
          <div key={band.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${activeBands.has(band.id) ? 'bg-[#0f172a]' : 'opacity-40'}`}>
            <input type="checkbox" checked={activeBands.has(band.id)} onChange={() => toggleBand(band.id)} className="w-3 h-3" />
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: band.color }} />
            <span className="text-[10px] text-[#e2e8f0] w-12">{band.name}</span>
            <span className="text-[9px] text-[#64748b] font-mono w-16">{band.wavelength}</span>
            <input type="range" min="0" max="100" value={bandWeights[band.id]}
              onChange={e => setBandWeights(prev => ({ ...prev, [band.id]: Number(e.target.value) }))}
              className="flex-1 h-1" style={{ accentColor: band.color }} />
            <span className="text-[10px] text-[#94a3b8] font-mono w-6 text-right">{bandWeights[band.id]}</span>
          </div>
        ))}
      </div>

      {/* 当前专题图说明 */}
      {currentMap && (
        <div className="mx-3 mt-3 bg-[#0f172a] rounded-md p-3 space-y-2">
          <div className="text-xs font-semibold text-[#f1f5f9]">{currentMap.name}</div>
          <p className="text-[10px] text-[#94a3b8]">{currentMap.desc}</p>
          <div className="text-[10px] text-[#64748b]">活跃波段: {currentMap.layers.map(l => BANDS.find(b => b.id === l)?.name).join(' + ')}</div>
        </div>
      )}

      {/* 参数阈值筛选 */}
      {currentMap && (
        <div className="mx-3 mt-3 mb-3 bg-[#0f172a] rounded-md p-3 space-y-2">
          <div className="text-[10px] text-[#06b6d4] font-semibold">物理参数阈值筛选</div>
          {currentMap.thresholds.map(th => (
            <div key={th.param} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#94a3b8]">{th.param}</span>
                <span className="text-[10px] text-[#94a3b8] font-mono">
                  {thresholds[th.param]?.min ?? th.min} ~ {thresholds[th.param]?.max ?? th.max} {th.unit}
                </span>
              </div>
              <div className="flex gap-2">
                <input type="range" min={th.min} max={th.max} step="1" value={thresholds[th.param]?.min ?? th.min}
                  onChange={e => setThresholds(prev => ({ ...prev, [th.param]: { ...prev[th.param], min: Number(e.target.value) } }))}
                  className="flex-1 h-1 accent-[#06b6d4]" />
                <input type="range" min={th.min} max={th.max} step="1" value={thresholds[th.param]?.max ?? th.max}
                  onChange={e => setThresholds(prev => ({ ...prev, [th.param]: { ...prev[th.param], max: Number(e.target.value) } }))}
                  className="flex-1 h-1 accent-[#f59e0b]" />
              </div>
            </div>
          ))}
          <p className="text-[9px] text-[#64748b]">
            调整阈值可快速筛选符合条件的空间范围，如"温度&lt;-150°C的区域"标记为潜在水冰存储区
          </p>
        </div>
      )}

      {/* 跨模块关联操作 */}
      <div className="border-t border-slate-700/50 bg-slate-900/80 px-3 py-2">
        <div className="mb-1.5 text-[10px] text-slate-500">遥感分析 → 关联模块</div>
        <div className="flex flex-wrap gap-1.5">
          <CrossModuleLink signal="detect-craters" label="撞击坑识别" payload={{ fromRemoteSensing: true }} />
          <CrossModuleLink signal="select-landing" label="着陆选址" payload={{ fromRemoteSensing: true }} />
          <CrossModuleLink signal="query-spatial" label="空间查询" payload={{ fromRemoteSensing: true }} />
          <CrossModuleLink signal="view-geological" label="地质演化" payload={{ fromRemoteSensing: true }} />
          <CrossModuleLink signal="plan-mining" label="资源勘探" payload={{ fromRemoteSensing: true }} />
        </div>
      </div>
    </div>
  );
}
