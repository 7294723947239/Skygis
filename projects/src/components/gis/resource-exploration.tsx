'use client';

import { useState, useEffect } from 'react';
import { useGis, type SkyGISOverlayPoint } from '@/lib/gis-context';

interface ResourceSite {
  id: string;
  name: string;
  type: 'mineral' | 'energy' | 'water' | 'geothermal';
  resource: string;
  lat: number;
  lng: number;
  reserve: string;
  status: 'exploring' | 'developing' | 'producing' | 'depleted';
  confidence: number;
}

const SITES: ResourceSite[] = [
  { id: 'res-1', name: '攀枝花钒钛磁铁矿', type: 'mineral', resource: '钒钛磁铁矿', lat: 26.6, lng: 101.7, reserve: '储量13.4亿吨', status: 'producing', confidence: 95 },
  { id: 'res-2', name: '大庆油田', type: 'energy', resource: '石油', lat: 46.6, lng: 125.0, reserve: '剩余可采3.2亿吨', status: 'producing', confidence: 92 },
  { id: 'res-3', name: '白云鄂博稀土矿', type: 'mineral', resource: '稀土', lat: 41.8, lng: 110.0, reserve: '储量1亿吨(全球最大)', status: 'producing', confidence: 98 },
  { id: 'res-4', name: '塔里木天然气田', type: 'energy', resource: '天然气', lat: 39.5, lng: 83.0, reserve: '储量1.4万亿m³', status: 'developing', confidence: 88 },
  { id: 'res-5', name: '柴达木锂资源', type: 'mineral', resource: '锂矿', lat: 37.5, lng: 95.5, reserve: '盐湖锂储量1724万吨', status: 'exploring', confidence: 78 },
  { id: 'res-6', name: '羊八井地热田', type: 'geothermal', resource: '地热能', lat: 30.1, lng: 90.5, reserve: '装机容量25MW', status: 'producing', confidence: 90 },
  { id: 'res-7', name: '金昌镍矿', type: 'mineral', resource: '镍矿', lat: 38.5, lng: 102.2, reserve: '储量550万吨', status: 'producing', confidence: 94 },
  { id: 'res-8', name: '南海油气田', type: 'energy', resource: '石油+天然气', lat: 18.0, lng: 114.0, reserve: '预估石油200亿吨', status: 'exploring', confidence: 65 },
];

const TYPE_COLORS: Record<string, string> = {
  mineral: '#a78bfa',
  energy: '#f97316',
  water: '#06b6d4',
  geothermal: '#ef4444',
};

const TYPE_LABELS: Record<string, string> = {
  mineral: '矿产',
  energy: '能源',
  water: '水资源',
  geothermal: '地热',
};

const STATUS_LABELS: Record<string, string> = {
  exploring: '勘探中',
  developing: '开发中',
  producing: '生产中',
  depleted: '已枯竭',
};

const STATUS_COLORS: Record<string, string> = {
  exploring: '#06b6d4',
  developing: '#f59e0b',
  producing: '#10b981',
  depleted: '#64748b',
};

export default function ResourceExploration({ onFlyTo, onClose }: { onFlyTo: (lat: number, lng: number) => void; onClose: () => void }) {
  const { registerSkygisPanel, unregisterSkygisPanel } = useGis();
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedSite, setSelectedSite] = useState<ResourceSite | null>(null);

  useEffect(() => {
    const points: SkyGISOverlayPoint[] = SITES.map(s => ({
      id: s.id,
      lat: s.lat,
      lng: s.lng,
      title: s.name,
      description: `${s.resource} · ${s.reserve}`,
      color: TYPE_COLORS[s.type],
      category: TYPE_LABELS[s.type],
      level: STATUS_LABELS[s.status],
      panel: 'resource' as const,
    }));
    registerSkygisPanel('resource', points);
    return () => unregisterSkygisPanel('resource');
  }, [registerSkygisPanel, unregisterSkygisPanel]);

  const filtered = filterType === 'all' ? SITES : SITES.filter(s => s.type === filterType);

  const handleSelectSite = (site: ResourceSite) => {
    setSelectedSite(selectedSite?.id === site.id ? null : site);
  };

  return (
    <div className="flex h-full flex-col border-l border-slate-700/50 bg-slate-900/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-sm">
            💎
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">资源勘探</h2>
            <p className="text-[10px] text-slate-500">感知层 → 应用层 · 矿产能源分析</p>
          </div>
        </div>
        <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Map indicator */}
      <div className="flex items-center gap-2 border-b border-slate-700/50 px-4 py-1.5 bg-purple-500/5">
        <div className="h-2 w-2 rounded-full bg-purple-400" />
        <span className="text-[10px] text-purple-300/80">已将 {SITES.length} 个资源点标记到地图上</span>
      </div>

      {/* Filter */}
      <div className="flex gap-1 border-b border-slate-700/50 px-4 py-2">
        {['all', 'mineral', 'energy', 'water', 'geothermal'].map(type => (
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

      {/* Sites list */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="space-y-2">
          {filtered.map(site => (
            <div
              key={site.id}
              onClick={() => handleSelectSite(site)}
              className={`cursor-pointer rounded-md border p-2.5 transition-all ${
                selectedSite?.id === site.id
                  ? 'border-slate-600 bg-slate-800 ring-1 ring-purple-500/30'
                  : 'border-slate-700/30 bg-slate-800/50 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start gap-2">
                <div
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold"
                  style={{ backgroundColor: TYPE_COLORS[site.type] + '20', color: TYPE_COLORS[site.type] }}
                >
                  {TYPE_LABELS[site.type][0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-200 truncate">{site.name}</span>
                    <span
                      className="shrink-0 rounded px-1 py-0.5 text-[9px] font-medium"
                      style={{ backgroundColor: STATUS_COLORS[site.status] + '20', color: STATUS_COLORS[site.status] }}
                    >
                      {STATUS_LABELS[site.status]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-400">{site.resource} · {site.reserve}</p>
                  <div className="mt-1 flex items-center gap-2 text-[9px] text-slate-500">
                    <span>{site.lat.toFixed(2)}°N {site.lng.toFixed(2)}°E</span>
                    <span>·</span>
                    <span>置信度 {site.confidence}%</span>
                  </div>
                  {/* Confidence bar */}
                  <div className="mt-1 h-1 w-full rounded-full bg-slate-700">
                    <div
                      className="h-1 rounded-full transition-all"
                      style={{
                        width: `${site.confidence}%`,
                        backgroundColor: site.confidence > 85 ? '#10b981' : site.confidence > 70 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                </div>
              </div>
              {selectedSite?.id === site.id && (
                <div className="mt-2 flex gap-2 border-t border-slate-700/30 pt-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onFlyTo(site.lat, site.lng); }}
                    className="flex-1 rounded-md bg-cyan-600/20 px-2 py-1.5 text-[10px] font-medium text-cyan-400 hover:bg-cyan-600/30"
                  >
                    定位到地图
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onFlyTo(site.lat, site.lng); }}
                    className="flex-1 rounded-md bg-purple-600/20 px-2 py-1.5 text-[10px] font-medium text-purple-400 hover:bg-purple-600/30"
                  >
                    生成勘探报告
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
          感知层(高光谱+雷达) → 网络层(光纤+5G) → 平台层(PostGIS+TensorFlow) → 应用层(资源评价模型)
        </div>
      </div>
    </div>
  );
}
