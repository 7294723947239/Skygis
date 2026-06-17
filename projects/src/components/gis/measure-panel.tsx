'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGis } from '@/lib/gis-context';

// ===== Coordinate Conversion Engine =====

type CoordFormat = 'dd' | 'dms' | 'utm' | 'gk' | 'unknown';

interface ParsedCoord {
  format: CoordFormat;
  lat: number;
  lng: number;
  raw: string;
  utmZone?: number;
  utmLetter?: string;
  utmEasting?: number;
  utmNorthing?: number;
  gkZone?: number;
  gkX?: number;
  gkY?: number;
}

function detectAndParse(input: string): ParsedCoord | null {
  const s = input.trim().replace(/\s+/g, ' ');
  if (!s) return null;

  // DMS patterns: 39°54'23"N 116°23'50"E or 39°54'23.5" 116°23'50.2"
  const dmsRegex = /(\d+)[°]\s*(\d+)[′']\s*([\d.]+)[″"]\s*([NS])[,;\s]+(\d+)[°]\s*(\d+)[′']\s*([\d.]+)[″"]\s*([EW])/i;
  const dmsMatch = s.match(dmsRegex);
  if (dmsMatch) {
    const lat = (parseFloat(dmsMatch[1]) + parseFloat(dmsMatch[2]) / 60 + parseFloat(dmsMatch[3]) / 3600) * (dmsMatch[4].toUpperCase() === 'S' ? -1 : 1);
    const lng = (parseFloat(dmsMatch[5]) + parseFloat(dmsMatch[6]) / 60 + parseFloat(dmsMatch[7]) / 3600) * (dmsMatch[8].toUpperCase() === 'W' ? -1 : 1);
    return { format: 'dms', lat, lng, raw: s };
  }

  // DMS without letters: 39 54 23 N 116 23 50 E
  const dms2Regex = /(\d+)\s+(\d+)\s+([\d.]+)\s*([NS])[,;\s]+(\d+)\s+(\d+)\s+([\d.]+)\s*([EW])/i;
  const dms2Match = s.match(dms2Regex);
  if (dms2Match) {
    const lat = (parseFloat(dms2Match[1]) + parseFloat(dms2Match[2]) / 60 + parseFloat(dms2Match[3]) / 3600) * (dms2Match[4].toUpperCase() === 'S' ? -1 : 1);
    const lng = (parseFloat(dms2Match[5]) + parseFloat(dms2Match[6]) / 60 + parseFloat(dms2Match[7]) / 3600) * (dms2Match[8].toUpperCase() === 'W' ? -1 : 1);
    return { format: 'dms', lat, lng, raw: s };
  }

  // UTM pattern: 50S 448251 4418423 or Zone 50S 448251mE 4418423mN
  const utmRegex = /(?:zone\s*)?(\d{1,2})\s*([C-X])[,;\s]+([\d.]+)[,;\s]+([\d.]+)/i;
  const utmMatch = s.match(utmRegex);
  if (utmMatch) {
    const zone = parseInt(utmMatch[1]);
    const letter = utmMatch[2].toUpperCase();
    const easting = parseFloat(utmMatch[3]);
    const northing = parseFloat(utmMatch[4]);
    // UTM to lat/lng conversion
    const { lat, lng } = utmToLatLon(zone, letter, easting, northing);
    return { format: 'utm', lat, lng, raw: s, utmZone: zone, utmLetter: letter, utmEasting: easting, utmNorthing: northing };
  }

  // Gauss-Kruger pattern: 39带 4418000 34500000 or 39 4418000 34500000
  const gkRegex = /(\d{1,2})[带度]?\s+([\d.]+)[,;\s]+([\d.]+)/;
  const gkMatch = s.match(gkRegex);
  if (gkMatch) {
    const zone = parseInt(gkMatch[1]);
    const x = parseFloat(gkMatch[2]);  // northing
    const y = parseFloat(gkMatch[3]);  // easting with zone prefix
    // Simple GK to lat/lng (approximate)
    const { lat, lng } = gkToLatLon(zone, x, y);
    return { format: 'gk', lat, lng, raw: s, gkZone: zone, gkX: x, gkY: y };
  }

  // DD patterns: 39.9042, 116.3974 or 39.9042 116.3974 or 39.9042 N 116.3974 E
  const ddRegex = /(-?[\d.]+)[°]?\s*([NS])?[,;\s]+(-?[\d.]+)[°]?\s*([EW])?/i;
  const ddMatch = s.match(ddRegex);
  if (ddMatch) {
    let lat = parseFloat(ddMatch[1]);
    let lng = parseFloat(ddMatch[3]);
    if (ddMatch[2] && ddMatch[2].toUpperCase() === 'S') lat = -Math.abs(lat);
    if (ddMatch[4] && ddMatch[4].toUpperCase() === 'W') lng = -Math.abs(lng);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { format: 'dd', lat, lng, raw: s };
    }
  }

  return null;
}

// UTM to Lat/Lon (WGS84 approximate)
function utmToLatLon(zone: number, letter: string, easting: number, northing: number): { lat: number; lng: number } {
  const k0 = 0.9996;
  const a = 6378137.0;
  const e = 0.081819191;
  const e2 = e * e;
  const e4 = e2 * e2;
  const e6 = e4 * e2;

  const x = easting - 500000.0;
  const northern = letter >= 'N';
  const y = northern ? northing : northing - 10000000.0;

  const M = y / k0;
  const mu = M / (a * (1 - e2 / 4 - 3 * e4 / 64 - 5 * e6 / 256));

  const n1 = 1 / Math.sqrt(1 - e2 * Math.pow(Math.sin(mu), 2));
  const phi1 = mu + (3 * e2 / 4 + 45 * e4 / 64 + 175 * e6 / 256) * Math.sin(2 * mu)
    + (15 * e4 / 32 + 175 * e6 / 384) * Math.sin(4 * mu)
    + (35 * e6 / 96) * Math.sin(6 * mu);

  const r1 = a * (1 - e2) / Math.pow(1 - e2 * Math.pow(Math.sin(phi1), 2), 1.5);
  const t1 = Math.pow(Math.tan(phi1), 2);
  const c1 = e2 / (1 - e2) * Math.pow(Math.cos(phi1), 2);
  const d = x / (n1 * k0);

  let lat = phi1 - (n1 * Math.tan(phi1) / r1) * (d * d / 2 - (5 + 3 * t1 + 10 * c1 - 4 * c1 * c1) * Math.pow(d, 4) / 24 + (61 + 90 * t1 + 298 * c1 + 45 * t1 * t1) * Math.pow(d, 6) / 720);
  const lng0 = (zone - 1) * 6 - 180 + 3;
  let lng = lng0 + (d - (1 + 2 * t1 + c1) * Math.pow(d, 3) / 6 + (5 - 2 * c1 + 28 * t1) * Math.pow(d, 5) / 120) / Math.cos(phi1);

  lat = lat * 180 / Math.PI;
  lng = lng * 180 / Math.PI;
  return { lat, lng };
}

// GK to Lat/Lon (approximate CGCS2000)
function gkToLatLon(zone: number, x: number, y: number): { lat: number; lng: number } {
  // Extract actual easting by removing zone prefix
  const zonePrefix = zone * 1000000 + 500000;
  const easting = y - zone * 1000000;
  // Approximate: use UTM conversion as base (close enough for visualization)
  const letter = x > 0 ? 'N' : 'S';
  return utmToLatLon(zone, letter, easting + 500000, Math.abs(x));
}

// Lat/Lon to DMS
function toDMS(lat: number, lng: number): string {
  const toDMSPart = (deg: number, pos: string, neg: string) => {
    const abs = Math.abs(deg);
    const d = Math.floor(abs);
    const mf = (abs - d) * 60;
    const m = Math.floor(mf);
    const s = ((mf - m) * 60).toFixed(2);
    return `${d}°${m}'${s}"${deg >= 0 ? pos : neg}`;
  };
  return `${toDMSPart(lat, 'N', 'S')}  ${toDMSPart(lng, 'E', 'W')}`;
}

// Lat/Lon to UTM
function toUTM(lat: number, lng: number): string {
  const k0 = 0.9996;
  const a = 6378137.0;
  const e = 0.081819191;
  const e2 = e * e;

  const latRad = lat * Math.PI / 180;
  const zone = Math.floor((lng + 180) / 6) + 1;
  const lng0 = (zone - 1) * 6 - 180 + 3;
  const lngRad0 = lng0 * Math.PI / 180;

  const n = a / Math.sqrt(1 - e2 * Math.pow(Math.sin(latRad), 2));
  const t = Math.pow(Math.tan(latRad), 2);
  const c = e2 / (1 - e2) * Math.pow(Math.cos(latRad), 2);
  const A = (lng - lng0) * Math.PI / 180 * Math.cos(latRad);

  const M = a * ((1 - e2 / 4 - 3 * e2 * e2 / 64) * latRad - (3 * e2 / 8 + 3 * e2 * e2 / 32) * Math.sin(2 * latRad) + (15 * e2 * e2 / 256) * Math.sin(4 * latRad));

  const easting = k0 * n * (A + (1 - t + c) * A * A * A / 6 + (5 - 18 * t + t * t) * Math.pow(A, 5) / 120) + 500000;
  const northing = k0 * (M + n * Math.tan(latRad) * (A * A / 2 + (5 - t + 9 * c + 4 * c * c) * Math.pow(A, 4) / 24 + (61 - 58 * t + t * t) * Math.pow(A, 6) / 720));

  const letter = lat >= 0 ? String.fromCharCode(78 + Math.floor(lat / 8)) : String.fromCharCode(67 + Math.floor((-lat) / 8));
  const adjNorthing = lat < 0 ? northing + 10000000 : northing;

  return `Zone ${zone}${letter}  E:${easting.toFixed(0)}  N:${adjNorthing.toFixed(0)}`;
}

// Lat/Lon to GK (approximate CGCS2000)
function toGK(lat: number, lng: number): string {
  const zone = Math.floor((lng + 1.5) / 3) + 1; // 3-degree zone
  // Approximate using UTM with adjustment
  const k0 = 1.0; // GK uses scale factor 1 at central meridian
  const a = 6378137.0;
  const e2 = 0.00669437999014;

  const latRad = lat * Math.PI / 180;
  const lng0 = zone * 3; // central meridian
  const dLng = (lng - lng0) * Math.PI / 180;

  const n = a / Math.sqrt(1 - e2 * Math.sin(latRad) * Math.sin(latRad));
  const t = Math.tan(latRad) * Math.tan(latRad);
  const c = e2 / (1 - e2) * Math.cos(latRad) * Math.cos(latRad);
  const A = dLng * Math.cos(latRad);

  const M = a * ((1 - e2 / 4 - 3 * e2 * e2 / 64) * latRad - (3 * e2 / 8 + 3 * e2 * e2 / 32) * Math.sin(2 * latRad) + (15 * e2 * e2 / 256) * Math.sin(4 * latRad));

  const x = M + n * Math.tan(latRad) * (A * A / 2 + (5 - t + 9 * c + 4 * c * c) * Math.pow(A, 4) / 24);
  const y = n * (A + (1 - t + c) * A * A * A / 6) + zone * 1000000 + 500000;

  return `第${zone}带  X:${x.toFixed(0)}m  Y:${y.toFixed(0)}m`;
}

// ===== Main Component =====

export default function MeasurePanel({ onClose }: { onClose: () => void }) {
  const { activeTool, setActiveTool, setFlyToPosition } = useGis();
  const [coordInput, setCoordInput] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedCoord | null>(null);
  const [convertedResults, setConvertedResults] = useState<Record<string, string>>({});
  const [measureHistory, setMeasureHistory] = useState<Array<{ type: string; value: string; time: string }>>([]);

  // Parse coordinate input on change
  useEffect(() => {
    if (!coordInput.trim()) {
      setParsedResult(null);
      setConvertedResults({});
      return;
    }
    const result = detectAndParse(coordInput);
    setParsedResult(result);
    if (result) {
      const { lat, lng } = result;
      setConvertedResults({
        '十进制度 (DD)': `${lat.toFixed(6)}°, ${lng.toFixed(6)}°`,
        '度分秒 (DMS)': toDMS(lat, lng),
        'UTM': toUTM(lat, lng),
        '高斯克吕格 (GK)': toGK(lat, lng),
      });
    } else {
      setConvertedResults({});
    }
  }, [coordInput]);

  const handleFlyToCoord = useCallback(() => {
    if (parsedResult) {
      setFlyToPosition({ lat: parsedResult.lat, lng: parsedResult.lng, alt: 50000 });
    }
  }, [parsedResult, setFlyToPosition]);

  const handleToolClick = useCallback((tool: 'measure' | 'measure-area' | 'draw-line' | 'draw-polygon') => {
    setActiveTool(activeTool === tool ? 'select' : tool);
  }, [activeTool, setActiveTool]);

  const handleClearMeasure = useCallback(() => {
    setActiveTool('select');
    setTimeout(() => {
      // Clear will happen via tool change in leaflet map
    }, 100);
  }, [setActiveTool]);

  const addMeasureRecord = useCallback((type: string, value: string) => {
    setMeasureHistory(prev => [{
      type,
      value,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    }, ...prev].slice(0, 20));
  }, []);

  // Monitor tool changes for history
  useEffect(() => {
    // This is for display purposes
  }, [activeTool]);

  const formatLabel = (fmt: CoordFormat): string => {
    switch (fmt) {
      case 'dd': return '十进制度 (DD)';
      case 'dms': return '度分秒 (DMS)';
      case 'utm': return 'UTM';
      case 'gk': return '高斯克吕格 (GK)';
      default: return '未知格式';
    }
  };

  const formatColor = (fmt: CoordFormat): string => {
    switch (fmt) {
      case 'dd': return 'text-cyan-400';
      case 'dms': return 'text-amber-400';
      case 'utm': return 'text-emerald-400';
      case 'gk': return 'text-purple-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3 text-sm">
      {/* Close button */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
          GIS 测量工具
        </h3>
        <button onClick={onClose} className="rounded p-1 text-slate-500 hover:bg-slate-700 hover:text-slate-300">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleToolClick('measure')}
            className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-xs font-medium transition-all ${
              activeTool === 'measure'
                ? 'bg-amber-600/20 text-amber-300 ring-1 ring-amber-600/50'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            测距
          </button>
          <button
            onClick={() => handleToolClick('measure-area')}
            className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-xs font-medium transition-all ${
              activeTool === 'measure-area'
                ? 'bg-emerald-600/20 text-emerald-300 ring-1 ring-emerald-600/50'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
            测面积
          </button>
          <button
            onClick={() => handleToolClick('draw-line')}
            className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-xs font-medium transition-all ${
              activeTool === 'draw-line'
                ? 'bg-cyan-600/20 text-cyan-300 ring-1 ring-cyan-600/50'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            画线
          </button>
          <button
            onClick={() => handleToolClick('draw-polygon')}
            className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-xs font-medium transition-all ${
              activeTool === 'draw-polygon'
                ? 'bg-blue-600/20 text-blue-300 ring-1 ring-blue-600/50'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
            </svg>
            画多边形
          </button>
        </div>

        {/* Active tool instruction */}
        {activeTool !== 'select' && (
          <div className={`mt-2 rounded-md px-3 py-2 text-xs ${
            activeTool === 'measure' ? 'bg-amber-900/30 text-amber-300 border border-amber-700/40' :
            activeTool === 'measure-area' ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-700/40' :
            activeTool === 'draw-line' ? 'bg-cyan-900/30 text-cyan-300 border border-cyan-700/40' :
            activeTool === 'draw-polygon' ? 'bg-blue-900/30 text-blue-300 border border-blue-700/40' :
            'bg-slate-800/60 text-slate-400'
          }`}>
            {activeTool === 'measure' && '在地图上点击添加测量点，每两点间显示距离，再次点击工具按钮结束测量'}
            {activeTool === 'measure-area' && '在地图上点击添加顶点（至少3个），双击结束绘制并计算面积'}
            {activeTool === 'draw-line' && '在地图上点击添加折线顶点，再次点击工具按钮结束绘制'}
            {activeTool === 'draw-polygon' && '在地图上点击添加多边形顶点，双击闭合多边形'}
          </div>
        )}

        <button
          onClick={handleClearMeasure}
          className="mt-2 w-full rounded-md bg-slate-700/40 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:bg-slate-600/40 hover:text-slate-200"
        >
          清除测量结果
        </button>
      </div>

      {/* ===== Coordinate Conversion Section ===== */}
      <div>
        <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
          </svg>
          坐标转换
        </h3>

        <div className="relative">
          <input
            type="text"
            value={coordInput}
            onChange={(e) => setCoordInput(e.target.value)}
            placeholder="输入坐标自动识别：&#10;39.9042, 116.3974&#10;39°54'23&quot;N 116°23'50&quot;E&#10;Zone 50S 448251 4418423&#10;39带 4418000 34500000"
            className="w-full rounded-md border border-slate-600/50 bg-slate-800/60 px-3 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
            style={{ minHeight: '60px' }}
          />
          {coordInput && (
            <button
              onClick={() => { setCoordInput(''); setParsedResult(null); }}
              className="absolute right-2 top-2 rounded-full bg-slate-700 p-1 text-slate-400 hover:text-white"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Detection result */}
        {parsedResult && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between rounded-md bg-slate-800/80 px-3 py-2">
              <span className="text-xs text-slate-400">识别格式</span>
              <span className={`text-xs font-semibold ${formatColor(parsedResult.format)}`}>
                {formatLabel(parsedResult.format)}
              </span>
            </div>

            {/* Converted results */}
            {Object.entries(convertedResults).map(([label, value]) => (
              <div key={label} className="rounded-md bg-slate-800/40 px-3 py-2">
                <div className="mb-1 text-[10px] text-slate-500">{label}</div>
                <div className="flex items-center justify-between gap-2">
                  <code className="flex-1 font-mono text-xs text-slate-200 break-all">{value}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(value);
                    }}
                    className="shrink-0 rounded p-1 text-slate-500 hover:bg-slate-700 hover:text-slate-300"
                    title="复制"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {/* Fly to coordinate */}
            <button
              onClick={handleFlyToCoord}
              className="w-full rounded-md bg-cyan-600/20 px-3 py-2 text-xs font-medium text-cyan-300 ring-1 ring-cyan-600/30 transition-colors hover:bg-cyan-600/30"
            >
              在地图上定位此坐标
            </button>
          </div>
        )}

        {coordInput && !parsedResult && (
          <div className="mt-2 rounded-md bg-red-900/20 px-3 py-2 text-xs text-red-400 border border-red-700/30">
            无法识别坐标格式，请检查输入。支持的格式：十进制度、度分秒、UTM、高斯克吕格
          </div>
        )}

        {/* Quick coordinate examples */}
        {!coordInput && (
          <div className="mt-2 space-y-1">
            <div className="text-[10px] text-slate-500">示例（点击填入）：</div>
            <button onClick={() => setCoordInput('39.9042, 116.3974')} className="block w-full rounded px-2 py-1 text-left text-xs text-slate-500 hover:bg-slate-800/60 hover:text-slate-300">
              39.9042, 116.3974 <span className="text-slate-600">(DD)</span>
            </button>
            <button onClick={() => setCoordInput('39°54\'23"N 116°23\'50"E')} className="block w-full rounded px-2 py-1 text-left text-xs text-slate-500 hover:bg-slate-800/60 hover:text-slate-300">
              39°54&apos;23&quot;N 116°23&apos;50&quot;E <span className="text-slate-600">(DMS)</span>
            </button>
            <button onClick={() => setCoordInput('50S 448251 4418423')} className="block w-full rounded px-2 py-1 text-left text-xs text-slate-500 hover:bg-slate-800/60 hover:text-slate-300">
              50S 448251 4418423 <span className="text-slate-600">(UTM)</span>
            </button>
            <button onClick={() => setCoordInput('39 4418000 39450000')} className="block w-full rounded px-2 py-1 text-left text-xs text-slate-500 hover:bg-slate-800/60 hover:text-slate-300">
              39 4418000 39450000 <span className="text-slate-600">(GK)</span>
            </button>
          </div>
        )}
      </div>

      {/* ===== Measurement History ===== */}
      {measureHistory.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>测量记录</span>
            <button onClick={() => setMeasureHistory([])} className="text-[10px] text-slate-500 hover:text-slate-300">清空</button>
          </h3>
          <div className="space-y-1">
            {measureHistory.map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded bg-slate-800/40 px-2 py-1.5 text-xs">
                <span className="text-slate-400">{item.type}</span>
                <span className="font-mono text-slate-200">{item.value}</span>
                <span className="text-[10px] text-slate-600">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
