'use client';

import { useState, useCallback } from 'react';
import { useGis } from '@/lib/gis-context';
import { toast } from 'sonner';

interface AnalysisPanelProps {
  onClose: () => void;
}

interface AnalysisResult {
  type: string;
  label: string;
  value: string;
  unit: string;
}

function CoordinateSearch() {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [label, setLabel] = useState('');
  const { flyToPosition, setFlyToPosition } = useGis();

  const handleSearch = useCallback(() => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      toast.error('请输入有效的坐标');
      return;
    }
    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      toast.error('坐标超出范围');
      return;
    }
    setFlyToPosition({ lat: latNum, lng: lngNum });
    toast.success('已定位到坐标', {
      description: `${latNum.toFixed(6)}, ${lngNum.toFixed(6)}`,
    });
  }, [lat, lng, setFlyToPosition]);

  const handlePreset = (name: string, latVal: string, lngVal: string) => {
    setLat(latVal);
    setLng(lngVal);
    setLabel(name);
  };

  const presets = [
    { name: '北京', lat: '39.9042', lng: '116.4074' },
    { name: '上海', lat: '31.2304', lng: '121.4737' },
    { name: '纽约', lat: '40.7128', lng: '-74.0060' },
    { name: '伦敦', lat: '51.5074', lng: '-0.1278' },
    { name: '东京', lat: '35.6762', lng: '139.6503' },
    { name: '悉尼', lat: '-33.8688', lng: '151.2093' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="text-[10px] text-slate-500 uppercase tracking-wider">纬度 Lat</label>
          <input
            type="text"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="39.9042"
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 font-mono"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-slate-500 uppercase tracking-wider">经度 Lng</label>
          <input
            type="text"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="116.4074"
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 font-mono"
          />
        </div>
        <button
          onClick={handleSearch}
          className="mt-3 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs rounded transition-colors"
        >
          定位
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {presets.map((p) => (
          <button
            key={p.name}
            onClick={() => handlePreset(p.name, p.lat, p.lng)}
            className="px-2 py-0.5 text-[10px] bg-slate-800/60 text-slate-400 hover:text-cyan-400 hover:bg-slate-700/60 rounded border border-slate-700/30 transition-colors"
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function DistanceCalculator() {
  const [points, setPoints] = useState<{ lat: string; lng: string }[]>([
    { lat: '', lng: '' },
    { lat: '', lng: '' },
  ]);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const calculate = useCallback(() => {
    if (points.length < 2) return;
    const pts = points.map((p) => ({
      lat: parseFloat(p.lat),
      lng: parseFloat(p.lng),
    }));
    if (pts.some((p) => isNaN(p.lat) || isNaN(p.lng))) {
      toast.error('请输入有效的坐标');
      return;
    }

    let totalDistance = 0;
    for (let i = 1; i < pts.length; i++) {
      totalDistance += haversineDistance(pts[i - 1].lat, pts[i - 1].lng, pts[i].lat, pts[i].lng);
    }

    const km = totalDistance;
    const display = km >= 1 ? `${km.toFixed(2)} km` : `${(km * 1000).toFixed(1)} m`;
    setResult({
      type: 'distance',
      label: '总距离',
      value: display,
      unit: '',
    });
  }, [points]);

  const addPoint = () => {
    setPoints([...points, { lat: '', lng: '' }]);
  };

  const removePoint = (index: number) => {
    if (points.length <= 2) return;
    setPoints(points.filter((_, i) => i !== index));
  };

  const updatePoint = (index: number, field: 'lat' | 'lng', value: string) => {
    const updated = [...points];
    updated[index] = { ...updated[index], [field]: value };
    setPoints(updated);
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1.5">
        {points.map((p, i) => (
          <div key={i} className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 w-4">{i + 1}</span>
            <input
              type="text"
              value={p.lat}
              onChange={(e) => updatePoint(i, 'lat', e.target.value)}
              placeholder="纬度"
              className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded px-2 py-0.5 text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 font-mono"
            />
            <input
              type="text"
              value={p.lng}
              onChange={(e) => updatePoint(i, 'lng', e.target.value)}
              placeholder="经度"
              className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded px-2 py-0.5 text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 font-mono"
            />
            {points.length > 2 && (
              <button onClick={() => removePoint(i)} className="text-slate-500 hover:text-red-400 text-xs">x</button>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={addPoint} className="text-[10px] text-cyan-400 hover:text-cyan-300">+ 添加点</button>
        <button onClick={calculate} className="px-2 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] rounded transition-colors">
          计算
        </button>
      </div>
      {result && (
        <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-800/40 rounded border border-slate-700/30">
          <span className="text-[10px] text-slate-500">{result.label}</span>
          <span className="text-sm font-mono font-semibold text-cyan-400">{result.value}</span>
        </div>
      )}
    </div>
  );
}

function AreaCalculator() {
  const [coordinates, setCoordinates] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const calculate = useCallback(() => {
    try {
      const lines = coordinates.trim().split('\n').filter(Boolean);
      const pts = lines.map((line) => {
        const parts = line.trim().split(/[,\s]+/);
        return { lat: parseFloat(parts[0]), lng: parseFloat(parts[1]) };
      });
      if (pts.length < 3) {
        toast.error('至少需要3个坐标点');
        return;
      }
      if (pts.some((p) => isNaN(p.lat) || isNaN(p.lng))) {
        toast.error('坐标格式错误');
        return;
      }

      const area = sphericalPolygonArea(pts);
      const km2 = area / 1e6;
      const display = km2 >= 1 ? `${km2.toFixed(4)} km²` : `${area.toFixed(2)} m²`;
      setResult({
        type: 'area',
        label: '面积',
        value: display,
        unit: '',
      });
    } catch {
      toast.error('计算失败，请检查坐标格式');
    }
  }, [coordinates]);

  return (
    <div className="space-y-2">
      <textarea
        value={coordinates}
        onChange={(e) => setCoordinates(e.target.value)}
        placeholder="输入坐标，每行一个（格式：纬度, 经度）&#10;例如：&#10;39.9042, 116.4074&#10;39.9142, 116.4174&#10;39.8942, 116.4274"
        className="w-full h-24 bg-slate-800/50 border border-slate-700/50 rounded px-2 py-1.5 text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 font-mono resize-none"
      />
      <button onClick={calculate} className="px-2 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] rounded transition-colors">
        计算面积
      </button>
      {result && (
        <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-800/40 rounded border border-slate-700/30">
          <span className="text-[10px] text-slate-500">{result.label}</span>
          <span className="text-sm font-mono font-semibold text-cyan-400">{result.value}</span>
        </div>
      )}
    </div>
  );
}

function CoordinateConverter() {
  const [input, setInput] = useState('');
  const [fromFormat, setFromFormat] = useState<'dd' | 'dms'>('dd');
  const [result, setResult] = useState<{ lat: string; lng: string } | null>(null);

  const convert = useCallback(() => {
    try {
      if (fromFormat === 'dd') {
        const parts = input.trim().split(/[,\s]+/);
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (isNaN(lat) || isNaN(lng)) {
          toast.error('格式错误');
          return;
        }
        setResult({ lat: decimalToDMS(lat, 'lat'), lng: decimalToDMS(lng, 'lng') });
      } else {
        const parts = input.trim().split(/[,\s]+/);
        const lat = dmsToDecimal(parts[0]);
        const lng = dmsToDecimal(parts[1]);
        if (isNaN(lat) || isNaN(lng)) {
          toast.error('格式错误');
          return;
        }
        setResult({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
      }
    } catch {
      toast.error('转换失败，请检查格式');
    }
  }, [input, fromFormat]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={() => setFromFormat('dd')}
          className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
            fromFormat === 'dd' ? 'bg-cyan-600 text-white' : 'bg-slate-800/60 text-slate-400'
          }`}
        >
          十进制度 (DD)
        </button>
        <button
          onClick={() => setFromFormat('dms')}
          className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
            fromFormat === 'dms' ? 'bg-cyan-600 text-white' : 'bg-slate-800/60 text-slate-400'
          }`}
        >
          度分秒 (DMS)
        </button>
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={fromFormat === 'dd' ? '39.9042, 116.4074' : '39°54\'15"N, 116°24\'27"E'}
        className="w-full bg-slate-800/50 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 font-mono"
      />
      <button onClick={convert} className="px-2 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] rounded transition-colors">
        转换
      </button>
      {result && (
        <div className="space-y-1 px-2 py-1.5 bg-slate-800/40 rounded border border-slate-700/30">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 w-8">纬度</span>
            <span className="text-xs font-mono text-emerald-400">{result.lat}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 w-8">经度</span>
            <span className="text-xs font-mono text-emerald-400">{result.lng}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Utility functions
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function sphericalPolygonArea(pts: { lat: number; lng: number }[]): number {
  const R = 6371000; // Earth radius in meters
  const n = pts.length;
  let total = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    total += toRad(pts[j].lng - pts[i].lng) * (2 + Math.sin(toRad(pts[i].lat)) + Math.sin(toRad(pts[j].lat)));
  }
  return Math.abs(total * R * R / 2);
}

function decimalToDMS(decimal: number, type: 'lat' | 'lng'): string {
  const abs = Math.abs(decimal);
  const d = Math.floor(abs);
  const minFloat = (abs - d) * 60;
  const m = Math.floor(minFloat);
  const s = ((minFloat - m) * 60).toFixed(2);
  const dir = type === 'lat' ? (decimal >= 0 ? 'N' : 'S') : decimal >= 0 ? 'E' : 'W';
  return `${d}°${m}'${s}"${dir}`;
}

function dmsToDecimal(dms: string): number {
  const match = dms.match(/(\d+)°(\d+)'([\d.]+)"([NSEW])/);
  if (!match) return NaN;
  const d = parseFloat(match[1]);
  const m = parseFloat(match[2]);
  const s = parseFloat(match[3]);
  const dir = match[4];
  let decimal = d + m / 60 + s / 3600;
  if (dir === 'S' || dir === 'W') decimal = -decimal;
  return decimal;
}

type TabType = 'locate' | 'distance' | 'area' | 'convert';

export default function AnalysisPanel({ onClose }: AnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('locate');

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'locate', label: '坐标定位', icon: '📍' },
    { key: 'distance', label: '距离测量', icon: '📏' },
    { key: 'area', label: '面积计算', icon: '📐' },
    { key: 'convert', label: '坐标转换', icon: '🔄' },
  ];

  return (
    <div className="flex h-full">
      {/* Tabs */}
      <div className="w-36 border-r border-slate-700/30 py-2 px-1 space-y-0.5">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">GIS 分析</span>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xs leading-none">✕</button>
        </div>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] transition-colors ${
              activeTab === tab.key
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/40'
            }`}
          >
            <span className="text-xs">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-3 overflow-auto">
        {activeTab === 'locate' && (
          <div>
            <h3 className="text-xs font-semibold text-slate-300 mb-2">坐标定位</h3>
            <CoordinateSearch />
          </div>
        )}
        {activeTab === 'distance' && (
          <div>
            <h3 className="text-xs font-semibold text-slate-300 mb-2">距离测量</h3>
            <DistanceCalculator />
          </div>
        )}
        {activeTab === 'area' && (
          <div>
            <h3 className="text-xs font-semibold text-slate-300 mb-2">面积计算</h3>
            <AreaCalculator />
          </div>
        )}
        {activeTab === 'convert' && (
          <div>
            <h3 className="text-xs font-semibold text-slate-300 mb-2">坐标转换</h3>
            <CoordinateConverter />
          </div>
        )}
      </div>
    </div>
  );
}
