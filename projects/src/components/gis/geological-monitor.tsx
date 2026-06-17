'use client';

import { useState, useEffect } from 'react';
import { useGis, type SkyGISOverlayPoint } from '@/lib/gis-context';

interface RiskZone {
  id: string;
  name: string;
  type: 'landslide' | 'debris' | 'earthquake' | 'subsidence';
  level: 'low' | 'medium' | 'high' | 'critical';
  lat: number;
  lng: number;
  description: string;
  lastUpdate: string;
}

const ZONES: RiskZone[] = [
  { id: 'geo-1', name: '龙门山断裂带监测点', type: 'earthquake', level: 'critical', lat: 31.0, lng: 103.5, description: '活跃断裂带，近期微震频发', lastUpdate: '2分钟前' },
  { id: 'geo-2', name: '三峡库区滑坡监测', type: 'landslide', level: 'high', lat: 30.8, lng: 108.4, description: '库岸稳定性下降，位移速率增加', lastUpdate: '5分钟前' },
  { id: 'geo-3', name: '舟曲泥石流预警区', type: 'debris', level: 'high', lat: 33.8, lng: 104.4, description: '强降雨预警，泥石流风险高', lastUpdate: '10分钟前' },
  { id: 'geo-4', name: '太行山地面沉降区', type: 'subsidence', level: 'medium', lat: 38.0, lng: 114.5, description: '地下水超采，年沉降速率15mm', lastUpdate: '30分钟前' },
  { id: 'geo-5', name: '川藏公路崩塌监测', type: 'landslide', level: 'high', lat: 29.9, lng: 101.9, description: '坡体裂缝扩展，需持续监测', lastUpdate: '15分钟前' },
  { id: 'geo-6', name: '汶川地震余震区', type: 'earthquake', level: 'medium', lat: 31.5, lng: 104.0, description: '余震活动减弱，持续监测中', lastUpdate: '1小时前' },
];

const LEVEL_COLORS: Record<string, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

const LEVEL_LABELS: Record<string, string> = {
  low: '低风险',
  medium: '中风险',
  high: '高风险',
  critical: '极高风险',
};

const TYPE_LABELS: Record<string, string> = {
  landslide: '滑坡',
  debris: '泥石流',
  earthquake: '地震',
  subsidence: '地面沉降',
};

const TYPE_ICONS: Record<string, string> = {
  landslide: '⛰',
  debris: '🌊',
  earthquake: '💫',
  subsidence: '⬇',
};

export default function GeologicalMonitor({ onFlyTo, onClose }: { onFlyTo: (lat: number, lng: number) => void; onClose: () => void }) {
  const { skygisOverlays, registerSkygisPanel, unregisterSkygisPanel, skygisSelectedId, setSkygisSelectedId } = useGis();
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);

  // Register overlays when component mounts, clear when unmounts
  useEffect(() => {
    const points: SkyGISOverlayPoint[] = ZONES.map(z => ({
      id: z.id,
      lat: z.lat,
      lng: z.lng,
      title: z.name,
      description: z.description,
      color: LEVEL_COLORS[z.level],
      category: TYPE_LABELS[z.type],
      level: LEVEL_LABELS[z.level],
      panel: 'geological' as const,
    }));
    registerSkygisPanel('geological', points);
    return () => unregisterSkygisPanel('geological');
  }, [registerSkygisPanel, unregisterSkygisPanel]);

  const filtered = filterType === 'all' ? ZONES : ZONES.filter(z => z.type === filterType);
  const criticalCount = ZONES.filter(z => z.level === 'critical').length;
  const highCount = ZONES.filter(z => z.level === 'high').length;

  const handleSelectZone = (zone: RiskZone) => {
    const newSelected = selectedZone?.id === zone.id ? null : zone;
    setSelectedZone(newSelected);
    setSkygisSelectedId(newSelected?.id ?? null);
  };

  const handleFlyTo = (lat: number, lng: number) => {
    onFlyTo(lat, lng);
  };

  return (
    <div className="flex h-full flex-col border-l border-slate-700/50 bg-slate-900/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-sm">
            ⚠
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">地质灾害监测</h2>
            <p className="text-[10px] text-slate-500">感知层 → 应用层 · 实时监测预警</p>
          </div>
        </div>
        <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex gap-2 border-b border-slate-700/50 px-4 py-2">
        <div className="flex-1 rounded-md bg-red-500/10 px-2 py-1.5 text-center">
          <div className="text-xs font-bold text-red-400">{criticalCount}</div>
          <div className="text-[9px] text-red-400/70">极高风险</div>
        </div>
        <div className="flex-1 rounded-md bg-orange-500/10 px-2 py-1.5 text-center">
          <div className="text-xs font-bold text-orange-400">{highCount}</div>
          <div className="text-[9px] text-orange-400/70">高风险</div>
        </div>
        <div className="flex-1 rounded-md bg-amber-500/10 px-2 py-1.5 text-center">
          <div className="text-xs font-bold text-amber-400">{ZONES.filter(z => z.level === 'medium').length}</div>
          <div className="text-[9px] text-amber-400/70">中风险</div>
        </div>
        <div className="flex-1 rounded-md bg-emerald-500/10 px-2 py-1.5 text-center">
          <div className="text-xs font-bold text-emerald-400">{ZONES.filter(z => z.level === 'low').length}</div>
          <div className="text-[9px] text-emerald-400/70">低风险</div>
        </div>
      </div>

      {/* Map indicator */}
      <div className="flex items-center gap-2 border-b border-slate-700/50 px-4 py-1.5 bg-red-500/5">
        <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
        <span className="text-[10px] text-red-300/80">已将 {ZONES.length} 个监测点标记到地图上</span>
      </div>

      {/* Filter */}
      <div className="flex gap-1 border-b border-slate-700/50 px-4 py-2">
        {['all', 'earthquake', 'landslide', 'debris', 'subsidence'].map(type => (
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
                  ? 'border-slate-600 bg-slate-800 ring-1 ring-red-500/30'
                  : 'border-slate-700/30 bg-slate-800/50 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-base">{TYPE_ICONS[zone.type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-200 truncate">{zone.name}</span>
                    <span
                      className="shrink-0 rounded px-1 py-0.5 text-[9px] font-medium"
                      style={{
                        backgroundColor: LEVEL_COLORS[zone.level] + '20',
                        color: LEVEL_COLORS[zone.level],
                      }}
                    >
                      {LEVEL_LABELS[zone.level]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-400">{zone.description}</p>
                  <div className="mt-1 flex items-center gap-2 text-[9px] text-slate-500">
                    <span>{TYPE_LABELS[zone.type]}</span>
                    <span>·</span>
                    <span>{zone.lat.toFixed(2)}°N {zone.lng.toFixed(2)}°E</span>
                    <span>·</span>
                    <span>{zone.lastUpdate}</span>
                  </div>
                </div>
              </div>
              {selectedZone?.id === zone.id && (
                <div className="mt-2 flex gap-2 border-t border-slate-700/30 pt-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleFlyTo(zone.lat, zone.lng); }}
                    className="flex-1 rounded-md bg-cyan-600/20 px-2 py-1.5 text-[10px] font-medium text-cyan-400 hover:bg-cyan-600/30"
                  >
                    定位到地图
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleFlyTo(zone.lat, zone.lng); }}
                    className="flex-1 rounded-md bg-red-600/20 px-2 py-1.5 text-[10px] font-medium text-red-400 hover:bg-red-600/30"
                  >
                    预警发布
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack footer */}
      <div className="border-t border-slate-700/50 px-4 py-2">
        <div className="text-[9px] text-slate-500">
          <span className="font-medium text-slate-400">技术栈：</span>
          感知层(LiDAR+传感器) → 网络层(5G+SDTP) → 平台层(ArcGIS+ML) → 应用层(风险评估模型)
        </div>
      </div>
    </div>
  );
}
