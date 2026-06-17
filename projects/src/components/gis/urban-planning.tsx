'use client';

import { useState, useEffect } from 'react';
import { useGis, type SkyGISOverlayPoint } from '@/lib/gis-context';

interface UrbanZone {
  id: string;
  name: string;
  type: 'residential' | 'commercial' | 'industrial' | 'green' | 'transport' | 'education' | 'medical';
  lat: number;
  lng: number;
  area: number;
  population: number;
  density: 'low' | 'medium' | 'high' | 'very-high';
  planStatus: 'existing' | 'planned' | 'under-construction';
}

const ZONES: UrbanZone[] = [
  { id: 'urban-1', name: '中关村科技园区', type: 'commercial', lat: 39.98, lng: 116.32, area: 5.2, population: 35000, density: 'very-high', planStatus: 'existing' },
  { id: 'urban-2', name: '望京居住区', type: 'residential', lat: 40.00, lng: 116.48, area: 8.5, population: 180000, density: 'very-high', planStatus: 'existing' },
  { id: 'urban-3', name: '亦庄经济开发区', type: 'industrial', lat: 39.77, lng: 116.51, area: 45.0, population: 250000, density: 'high', planStatus: 'existing' },
  { id: 'urban-4', name: '奥林匹克森林公园', type: 'green', lat: 40.02, lng: 116.39, area: 11.6, population: 0, density: 'low', planStatus: 'existing' },
  { id: 'urban-5', name: '大兴国际机场经济区', type: 'transport', lat: 39.51, lng: 116.41, area: 150.0, population: 80000, density: 'medium', planStatus: 'under-construction' },
  { id: 'urban-6', name: '通州副中心商务区', type: 'commercial', lat: 39.90, lng: 116.66, area: 12.0, population: 120000, density: 'high', planStatus: 'under-construction' },
  { id: 'urban-7', name: '海淀高校聚集区', type: 'education', lat: 39.96, lng: 116.31, area: 3.5, population: 95000, density: 'very-high', planStatus: 'existing' },
  { id: 'urban-8', name: '天坛医院新区', type: 'medical', lat: 39.84, lng: 116.35, area: 1.8, population: 8000, density: 'high', planStatus: 'existing' },
];

const TYPE_COLORS: Record<string, string> = {
  residential: '#60a5fa',
  commercial: '#f59e0b',
  industrial: '#a78bfa',
  green: '#10b981',
  transport: '#06b6d4',
  education: '#ec4899',
  medical: '#ef4444',
};

const TYPE_LABELS: Record<string, string> = {
  residential: '居住',
  commercial: '商业',
  industrial: '工业',
  green: '绿地',
  transport: '交通',
  education: '教育',
  medical: '医疗',
};

const DENSITY_LABELS: Record<string, string> = {
  'low': '低密度',
  'medium': '中密度',
  'high': '高密度',
  'very-high': '超高密度',
};

const STATUS_LABELS: Record<string, string> = {
  existing: '已建成',
  planned: '规划中',
  'under-construction': '建设中',
};

export default function UrbanPlanning({ onFlyTo, onClose }: { onFlyTo: (lat: number, lng: number) => void; onClose: () => void }) {
  const { registerSkygisPanel, unregisterSkygisPanel } = useGis();
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<UrbanZone | null>(null);

  useEffect(() => {
    const points: SkyGISOverlayPoint[] = ZONES.map(z => ({
      id: z.id,
      lat: z.lat,
      lng: z.lng,
      title: z.name,
      description: `${TYPE_LABELS[z.type]} · ${z.area}km² · ${DENSITY_LABELS[z.density]}`,
      color: TYPE_COLORS[z.type],
      category: TYPE_LABELS[z.type],
      level: STATUS_LABELS[z.planStatus],
      panel: 'urban' as const,
    }));
    registerSkygisPanel('urban', points);
    return () => unregisterSkygisPanel('urban');
  }, [registerSkygisPanel, unregisterSkygisPanel]);

  const filtered = filterType === 'all' ? ZONES : ZONES.filter(z => z.type === filterType);

  const handleSelectZone = (zone: UrbanZone) => {
    setSelectedZone(selectedZone?.id === zone.id ? null : zone);
  };

  const totalArea = ZONES.reduce((s, z) => s + z.area, 0);
  const totalPop = ZONES.reduce((s, z) => s + z.population, 0);

  return (
    <div className="flex h-full flex-col border-l border-slate-700/50 bg-slate-900/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-sm">
            🏙
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">城市规划</h2>
            <p className="text-[10px] text-slate-500">感知层 → 应用层 · 空间布局分析</p>
          </div>
        </div>
        <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-2 border-b border-slate-700/50 px-4 py-2">
        <div className="flex-1 rounded-md bg-blue-500/10 px-2 py-1.5 text-center">
          <div className="text-xs font-bold text-blue-400">{totalArea.toFixed(1)}</div>
          <div className="text-[9px] text-blue-400/70">总面积(km²)</div>
        </div>
        <div className="flex-1 rounded-md bg-cyan-500/10 px-2 py-1.5 text-center">
          <div className="text-xs font-bold text-cyan-400">{(totalPop / 10000).toFixed(1)}</div>
          <div className="text-[9px] text-cyan-400/70">人口(万)</div>
        </div>
        <div className="flex-1 rounded-md bg-amber-500/10 px-2 py-1.5 text-center">
          <div className="text-xs font-bold text-amber-400">{ZONES.length}</div>
          <div className="text-[9px] text-amber-400/70">功能分区</div>
        </div>
      </div>

      {/* Map indicator */}
      <div className="flex items-center gap-2 border-b border-slate-700/50 px-4 py-1.5 bg-blue-500/5">
        <div className="h-2 w-2 rounded-full bg-blue-400" />
        <span className="text-[10px] text-blue-300/80">已将 {ZONES.length} 个功能区标记到地图上</span>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-1 border-b border-slate-700/50 px-4 py-2">
        {['all', 'residential', 'commercial', 'industrial', 'green', 'transport', 'education', 'medical'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
              filterType === type ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {type === 'all' ? '全部' : TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Zone list */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="space-y-2">
          {filtered.map(zone => (
            <div
              key={zone.id}
              onClick={() => handleSelectZone(zone)}
              className={`cursor-pointer rounded-md border p-2.5 transition-all ${
                selectedZone?.id === zone.id
                  ? 'border-slate-600 bg-slate-800 ring-1 ring-blue-500/30'
                  : 'border-slate-700/30 bg-slate-800/50 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start gap-2">
                <div
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold"
                  style={{ backgroundColor: TYPE_COLORS[zone.type] + '20', color: TYPE_COLORS[zone.type] }}
                >
                  {TYPE_LABELS[zone.type][0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-200 truncate">{zone.name}</span>
                    <span
                      className="shrink-0 rounded px-1 py-0.5 text-[9px] font-medium"
                      style={{ backgroundColor: TYPE_COLORS[zone.type] + '20', color: TYPE_COLORS[zone.type] }}
                    >
                      {TYPE_LABELS[zone.type]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    面积 {zone.area}km² · {zone.population > 0 ? `人口 ${(zone.population / 10000).toFixed(1)}万` : '无居民'}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[9px] text-slate-500">
                    <span>{zone.lat.toFixed(2)}°N {zone.lng.toFixed(2)}°E</span>
                    <span>·</span>
                    <span>{DENSITY_LABELS[zone.density]}</span>
                    <span>·</span>
                    <span>{STATUS_LABELS[zone.planStatus]}</span>
                  </div>
                </div>
              </div>
              {selectedZone?.id === zone.id && (
                <div className="mt-2 flex gap-2 border-t border-slate-700/30 pt-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onFlyTo(zone.lat, zone.lng); }}
                    className="flex-1 rounded-md bg-cyan-600/20 px-2 py-1.5 text-[10px] font-medium text-cyan-400 hover:bg-cyan-600/30"
                  >
                    定位到地图
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onFlyTo(zone.lat, zone.lng); }}
                    className="flex-1 rounded-md bg-blue-600/20 px-2 py-1.5 text-[10px] font-medium text-blue-400 hover:bg-blue-600/30"
                  >
                    空间分析
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tech footer */}
      <div className="border-t border-slate-700/50 px-4 py-2">
        <div className="text-[9px] text-slate-500">
          <span className="font-medium text-slate-400">技术栈：</span>
          感知层(卫星遥感+LiDAR) → 网络层(光纤+5G) → 平台层(ArcGIS+PostGIS) → 应用层(空间优化模型)
        </div>
      </div>
    </div>
  );
}
