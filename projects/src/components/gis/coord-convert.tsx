'use client';

import { useState, useCallback } from 'react';
import {
  convertCoordinates,
  cartesianToSpherical,
  convertDistance,
  getAllCoordinateSystems,
  type Vec3,
} from '@/lib/universe-coordinate-system';

// ========== Coordinate format detection & conversion ==========

type CoordFormat = 'dd' | 'dms' | 'dm' | 'utm' | 'gk' | 'unknown';

interface ConvertResult {
  dd: string;
  dms: string;
  dm: string;
  utm: string;
  gk: string;
  format: CoordFormat;
}

/** Detect coordinate format from input string */
function detectFormat(input: string): CoordFormat {
  const s = input.trim();
  // DMS: 39°54'23"N 116°23'50"E or 39°54'23" 116°23'50"
  if (/[°′'"][″"]?/i.test(s)) {
    if (/°/.test(s) && /['′]/.test(s)) return 'dms';
    if (/°/.test(s)) return 'dm';
  }
  // UTM: 50S 123456 4321000 or 50S1234564321000
  if (/\d{1,2}[A-Z]\s*\d{6}\s*\d{7}/i.test(s.replace(/\s+/g, ' '))) return 'utm';
  // GK: X=3456789.12 Y=39500000.00 or 39500000 3456789
  if (/y\s*=\s*\d{6,8}/i.test(s) || /\d{6,8}[,.]?\d*\s+\d{6,7}[,.]?\d*/.test(s.replace(/\s+/g,' '))) {
    if (/^\d{6,8}/.test(s.replace(/[^0-9.]/g,' ').trim())) return 'gk';
  }
  // DD: 39.9042 116.4074 or 39.9042, 116.4074 or 39.9042N 116.4074E
  const ddPattern = /(-?\d+\.?\d*)[°\s,]*([NS])?[\s,]*(-?\d+\.?\d*)[°\s,]*([EW])?/i;
  if (ddPattern.test(s)) return 'dd';
  return 'unknown';
}

/** Parse DD string → {lat, lng} */
function parseDD(input: string): { lat: number; lng: number } | null {
  const s = input.trim().toUpperCase();
  // 39.9042N 116.4074E
  const m1 = s.match(/(-?\d+\.?\d*)\s*[NS]\s*(-?\d+\.?\d*)\s*[EW]/);
  if (m1) {
    const lat = parseFloat(m1[1]) * (s.includes('S') ? -1 : 1);
    const lng = parseFloat(m1[2]) * (s.includes('W') ? -1 : 1);
    return { lat, lng };
  }
  // 39.9042, 116.4074 or 39.9042 116.4074
  const m2 = s.match(/(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/);
  if (m2) {
    const v1 = parseFloat(m2[1]);
    const v2 = parseFloat(m2[2]);
    if (Math.abs(v1) <= 90 && Math.abs(v2) <= 180) return { lat: v1, lng: v2 };
    if (Math.abs(v2) <= 90 && Math.abs(v1) <= 180) return { lat: v2, lng: v1 };
  }
  return null;
}

/** Parse DMS string → {lat, lng} */
function parseDMS(input: string): { lat: number; lng: number } | null {
  const s = input.trim().toUpperCase();
  const parts = s.split(/[,\s]+/);
  const dmsVal: number[] = [];
  const dirs: string[] = [];
  const dmsPattern = /(-?\d+)[°]\s*(\d+)?[′']?\s*(\d+\.?\d*)?[″"]?\s*([NSEW])?/;

  for (const part of parts) {
    const m = part.match(dmsPattern);
    if (m) {
      const d = parseFloat(m[1]);
      const min = m[2] ? parseFloat(m[2]) : 0;
      const sec = m[3] ? parseFloat(m[3]) : 0;
      const val = d + min / 60 + sec / 3600;
      dmsVal.push(val);
      if (m[4]) dirs.push(m[4]);
    }
  }
  if (dmsVal.length >= 2) {
    let lat = dmsVal[0];
    let lng = dmsVal[1];
    if (dirs[0] === 'S') lat = -lat;
    if (dirs[1] === 'W') lng = -lng;
    return { lat, lng };
  }
  return null;
}

/** Parse DM (degrees minutes) → {lat, lng} */
function parseDM(input: string): { lat: number; lng: number } | null {
  const s = input.trim().toUpperCase();
  const parts = s.split(/[,\s]+/);
  const vals: number[] = [];
  const dirs: string[] = [];
  const dmPattern = /(-?\d+)[°]\s*(\d+\.?\d*)[′']?\s*([NSEW])?/;

  for (const part of parts) {
    const m = part.match(dmPattern);
    if (m) {
      const d = parseFloat(m[1]);
      const min = m[2] ? parseFloat(m[2]) : 0;
      const val = d + min / 60;
      vals.push(val);
      if (m[3]) dirs.push(m[3]);
    }
  }
  if (vals.length >= 2) {
    let lat = vals[0];
    let lng = vals[1];
    if (dirs[0] === 'S') lat = -lat;
    if (dirs[1] === 'W') lng = -lng;
    return { lat, lng };
  }
  return null;
}

/** DD to DMS */
function ddToDms(dd: number, isLat: boolean): string {
  const dir = isLat ? (dd >= 0 ? 'N' : 'S') : (dd >= 0 ? 'E' : 'W');
  const abs = Math.abs(dd);
  const d = Math.floor(abs);
  const minFloat = (abs - d) * 60;
  const m = Math.floor(minFloat);
  const sec = ((minFloat - m) * 60).toFixed(2);
  return `${d}°${m}'${sec}"${dir}`;
}

/** DD to DM */
function ddToDm(dd: number, isLat: boolean): string {
  const dir = isLat ? (dd >= 0 ? 'N' : 'S') : (dd >= 0 ? 'E' : 'W');
  const abs = Math.abs(dd);
  const d = Math.floor(abs);
  const min = ((abs - d) * 60).toFixed(4);
  return `${d}°${min}'${dir}`;
}

/** DD to UTM — WGS84 ellipsoid */
function ddToUtm(lat: number, lng: number): string {
  if (lat < -80 || lat > 84) return '超出UTM范围';
  const a = 6378137.0;
  const f = 1 / 298.257223563;
  const e2 = 2 * f - f * f;
  const e2p = e2 / (1 - e2);
  const k0 = 0.9996;

  const latRad = lat * Math.PI / 180;
  let zone = Math.floor((lng + 180) / 6) + 1;
  if (lat >= 56 && lat < 64 && lng >= 3 && lng < 12) zone = 32;

  const lng0 = (zone - 1) * 6 - 180 + 3;
  const lngRad0 = lng0 * Math.PI / 180;
  const dlng = (lng - lng0) * Math.PI / 180;

  const N = a / Math.sqrt(1 - e2 * Math.sin(latRad) ** 2);
  const T = Math.tan(latRad) ** 2;
  const C = e2p * Math.cos(latRad) ** 2;
  const A_ = dlng * Math.cos(latRad);

  const M = a * (
    (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 ** 3 / 256) * latRad
    - (3 * e2 / 8 + 3 * e2 * e2 / 32 + 45 * e2 ** 3 / 1024) * Math.sin(2 * latRad)
    + (15 * e2 * e2 / 256 + 45 * e2 ** 3 / 1024) * Math.sin(4 * latRad)
    - (35 * e2 ** 3 / 3072) * Math.sin(6 * latRad)
  );

  const easting = k0 * N * (A_ + (1 - T + C) * A_ ** 3 / 6 + (5 - 18 * T + T * T + 72 * C - 58 * e2p) * A_ ** 5 / 120) + 500000;
  let northing = k0 * (M + N * Math.tan(latRad) * (A_ * A_ / 2 + (5 - T + 9 * C + 4 * C * C) * A_ ** 4 / 24 + (61 - 58 * T + T * T + 600 * C - 330 * e2p) * A_ ** 6 / 720));
  if (lat < 0) northing += 10000000;

  const bandLetter = 'CDEFGHJKLMNPQRSTUVWX'[Math.floor((lat + 80) / 8)];
  return `${zone}${bandLetter} ${easting.toFixed(0)} ${northing.toFixed(0)}`;
}

/** DD to Gauss-Kruger (6-degree zone, CGCS2000) */
function ddToGK(lat: number, lng: number): string {
  const a = 6378137.0;
  const f = 1 / 298.257222101; // CGCS2000
  const e2 = 2 * f - f * f;
  const e2p = e2 / (1 - e2);

  const zone = Math.floor((lng + 3) / 6) + 1;
  const lng0 = (zone - 0.5) * 6 - 3;
  const latRad = lat * Math.PI / 180;
  const dlng = (lng - lng0) * Math.PI / 180;

  const N = a / Math.sqrt(1 - e2 * Math.sin(latRad) ** 2);
  const T = Math.tan(latRad) ** 2;
  const C = e2p * Math.cos(latRad) ** 2;
  const A_ = dlng * Math.cos(latRad);

  const M = a * (
    (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 ** 3 / 256) * latRad
    - (3 * e2 / 8 + 3 * e2 * e2 / 32 + 45 * e2 ** 3 / 1024) * Math.sin(2 * latRad)
    + (15 * e2 * e2 / 256 + 45 * e2 ** 3 / 1024) * Math.sin(4 * latRad)
    - (35 * e2 ** 3 / 3072) * Math.sin(6 * latRad)
  );

  const x = M + N * Math.tan(latRad) * (A_ * A_ / 2 + (5 - T + 9 * C + 4 * C * C) * A_ ** 4 / 24 + (61 - 58 * T + T * T + 600 * C - 330 * e2p) * A_ ** 6 / 720);
  const y = N * (A_ + (1 - T + C) * A_ ** 3 / 6 + (5 - 18 * T + T * T + 72 * C - 58 * e2p) * A_ ** 5 / 120) + zone * 1000000 + 500000;

  return `X=${x.toFixed(2)} Y=${y.toFixed(2)} (${zone}带)`;
}

/** Main convert function */
function convertCoord(input: string): ConvertResult | null {
  const format = detectFormat(input);
  let dd: { lat: number; lng: number } | null = null;

  switch (format) {
    case 'dd': dd = parseDD(input); break;
    case 'dms': dd = parseDMS(input); break;
    case 'dm': dd = parseDM(input); break;
    case 'utm': {
      // Simple UTM inverse — approximate
      const m = input.trim().toUpperCase().match(/(\d{1,2})([A-Z])\s*(\d{6})\s*(\d{7})/);
      if (m) {
        const zone = parseInt(m[1]);
        const easting = parseFloat(m[3]);
        const northing = parseFloat(m[4]);
        const lat = (northing - 10000000 * (northing < 5000000 ? 1 : 0)) / 111000;
        const lng = (zone - 1) * 6 - 180 + 3 + (easting - 500000) / 111000 / Math.cos(lat * Math.PI / 180);
        dd = { lat, lng };
      }
      break;
    }
    case 'gk': {
      const nums = input.replace(/[^0-9.\-]/g, ' ').trim().split(/\s+/).map(Number);
      if (nums.length >= 2) {
        const x = nums[0]; // northing
        const y = nums[1]; // easting
        const zone = Math.floor(y / 1000000);
        const lat = x / 111000;
        const lng = (zone - 0.5) * 6 - 3;
        dd = { lat, lng };
      }
      break;
    }
    default: return null;
  }

  if (!dd || isNaN(dd.lat) || isNaN(dd.lng)) return null;

  const ns = dd.lat >= 0 ? 'N' : 'S';
  const ew = dd.lng >= 0 ? 'E' : 'W';

  return {
    format,
    dd: `${Math.abs(dd.lat).toFixed(6)}°${ns} ${Math.abs(dd.lng).toFixed(6)}°${ew}`,
    dms: `${ddToDms(dd.lat, true)} ${ddToDms(dd.lng, false)}`,
    dm: `${ddToDm(dd.lat, true)} ${ddToDm(dd.lng, false)}`,
    utm: ddToUtm(dd.lat, dd.lng),
    gk: ddToGK(dd.lat, dd.lng),
  };
}

// ========== Component ==========

const EXAMPLES = [
  { label: '十进制度 (DD)', value: '39.9042 116.4074' },
  { label: '度分秒 (DMS)', value: '39°54\'15"N 116°24\'26"E' },
  { label: '度分 (DM)', value: '39°54.252\'N 116°24.432\'E' },
  { label: 'UTM', value: '50S 449152 4418620' },
  { label: '高斯克吕格', value: 'X=4418620 Y=39449152' },
];

export default function CoordConvertPanel({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [copied, setCopied] = useState('');
  const [tab, setTab] = useState<'earth' | 'universe'>('earth');

  // UCS converter state
  const [ucsFrom, setUcsFrom] = useState('heliocentric');
  const [ucsTo, setUcsTo] = useState('ucs');
  const [ucsX, setUcsX] = useState('0');
  const [ucsY, setUcsY] = useState('0');
  const [ucsZ, setUcsZ] = useState('0');
  const [ucsResult, setUcsResult] = useState<{
    output: Vec3;
    spherical: { lon: number; lat: number; r: number };
    distanceLy: number;
  } | null>(null);

  const handleConvert = useCallback(() => {
    const r = convertCoord(input);
    setResult(r);
  }, [input]);

  const handleInput = useCallback((v: string) => {
    setInput(v);
    // Auto-convert on input
    const r = convertCoord(v);
    setResult(r);
  }, []);

  const copyToClipboard = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 1500);
    });
  }, []);

  const fillExample = useCallback((value: string) => {
    setInput(value);
    const r = convertCoord(value);
    setResult(r);
  }, []);

  const handleUcsConvert = useCallback(() => {
    try {
      const src: Vec3 = { x: parseFloat(ucsX) || 0, y: parseFloat(ucsY) || 0, z: parseFloat(ucsZ) || 0 };
      const output = convertCoordinates(src, ucsFrom, ucsTo);
      const spherical = cartesianToSpherical(output);
      const distanceLy = convertDistance(spherical.r, 'mpc', 'ly');
      setUcsResult({ output, spherical, distanceLy });
    } catch {
      setUcsResult(null);
    }
  }, [ucsFrom, ucsTo, ucsX, ucsY, ucsZ]);

  const formatLabel: Record<string, string> = {
    dd: '十进制度 (DD)',
    dms: '度分秒 (DMS)',
    dm: '度分 (DM)',
    utm: 'UTM',
    gk: '高斯克吕格 (GK)',
    unknown: '未知格式',
  };

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-violet-600/20 text-violet-400 text-sm">
            ⟳
          </div>
          <h3 className="text-sm font-bold text-slate-100">坐标转换</h3>
        </div>
        <button onClick={onClose} className="rounded p-1 text-slate-500 hover:bg-slate-700 hover:text-slate-300">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg bg-slate-800 p-1">
        <button
          onClick={() => setTab('earth')}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            tab === 'earth' ? 'bg-violet-600/30 text-violet-300' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          地球坐标
        </button>
        <button
          onClick={() => setTab('universe')}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            tab === 'universe' ? 'bg-cyan-600/30 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          全宇宙坐标
        </button>
      </div>

      {/* Earth coordinate tab */}
      {tab === 'earth' && (<>
      <div className="space-y-1.5">
        <label className="text-xs text-slate-400">输入坐标（自动识别格式）</label>
        <textarea
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="输入任意格式坐标，如: 39.9042 116.4074 或 39°54'15&quot;N 116°24'26&quot;E"
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
          rows={2}
        />
        {result && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="rounded bg-violet-600/20 px-1.5 py-0.5 text-violet-400">
              已识别: {formatLabel[result.format] || result.format}
            </span>
          </div>
        )}
      </div>

      {/* Quick examples */}
      <div className="space-y-1.5">
        <label className="text-xs text-slate-400">示例（点击填入）</label>
        <div className="flex flex-wrap gap-1">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => fillExample(ex.value)}
              className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">转换结果</label>
          {[
            { key: 'dd', label: '十进制度 (DD)', value: result.dd },
            { key: 'dms', label: '度分秒 (DMS)', value: result.dms },
            { key: 'dm', label: '度分 (DM)', value: result.dm },
            { key: 'utm', label: 'UTM', value: result.utm },
            { key: 'gk', label: '高斯克吕格 (GK)', value: result.gk },
          ].map((item) => (
            <div
              key={item.key}
              className="group relative rounded-md border border-slate-700/50 bg-slate-800/50 px-3 py-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{item.label}</span>
                <button
                  onClick={() => copyToClipboard(item.value, item.key)}
                  className="rounded px-1.5 py-0.5 text-xs text-slate-500 transition-colors hover:bg-slate-700 hover:text-slate-300"
                >
                  {copied === item.key ? '已复制' : '复制'}
                </button>
              </div>
              <div className="mt-0.5 font-mono text-sm text-slate-100">{item.value}</div>
            </div>
          ))}
        </div>
      )}

      {!result && input && (
        <div className="rounded-md border border-red-800/50 bg-red-900/20 px-3 py-2 text-xs text-red-400">
          无法识别坐标格式，请检查输入
        </div>
      )}

      {/* Format reference */}
      <div className="space-y-1.5">
        <label className="text-xs text-slate-400">支持的格式</label>
        <div className="space-y-1 text-xs text-slate-500">
          <div><span className="text-slate-300">DD:</span> 39.9042, 116.4074 或 39.9042N 116.4074E</div>
          <div><span className="text-slate-300">DMS:</span> 39°54'15"N 116°24'26"E</div>
          <div><span className="text-slate-300">DM:</span> 39°54.252'N 116°24.432'E</div>
          <div><span className="text-slate-300">UTM:</span> 50S 449152 4418620</div>
          <div><span className="text-slate-300">GK:</span> X=4418620 Y=39449152</div>
        </div>
      </div>
      </>)}

      {/* Universe coordinate tab */}
      {tab === 'universe' && (
        <div className="space-y-3">
          {/* Description */}
          <div className="rounded-md border border-cyan-800/30 bg-cyan-900/10 px-3 py-2 text-xs text-cyan-300">
            全宇宙坐标系(UCS) — 以宇宙中心为原点，地球为定位参考点，统一9大坐标系的转换参数
          </div>

          {/* Source system */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">源坐标系</label>
            <select
              value={ucsFrom}
              onChange={(e) => setUcsFrom(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
            >
              {getAllCoordinateSystems().map(cs => (
                <option key={cs.id} value={cs.id}>{cs.name} ({cs.nameEn})</option>
              ))}
            </select>
          </div>

          {/* Input coordinates */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">坐标值 (X, Y, Z) — UCS单位: Mpc, 其他: AU或适当单位</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={ucsX}
                onChange={(e) => setUcsX(e.target.value)}
                placeholder="X"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                step="any"
              />
              <input
                type="number"
                value={ucsY}
                onChange={(e) => setUcsY(e.target.value)}
                placeholder="Y"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                step="any"
              />
              <input
                type="number"
                value={ucsZ}
                onChange={(e) => setUcsZ(e.target.value)}
                placeholder="Z"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                step="any"
              />
            </div>
          </div>

          {/* Target system */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">目标坐标系</label>
            <select
              value={ucsTo}
              onChange={(e) => setUcsTo(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
            >
              {getAllCoordinateSystems().map(cs => (
                <option key={cs.id} value={cs.id}>{cs.name} ({cs.nameEn})</option>
              ))}
            </select>
          </div>

          {/* Convert button */}
          <button
            onClick={handleUcsConvert}
            className="w-full rounded-md bg-cyan-600/30 px-3 py-2 text-sm font-medium text-cyan-200 transition-colors hover:bg-cyan-600/50"
          >
            转换坐标
          </button>

          {/* Results */}
          {ucsResult && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">转换结果</label>

              {/* Cartesian output */}
              <div className="rounded-md border border-slate-700/50 bg-slate-800/50 px-3 py-2">
                <div className="text-xs text-slate-500">直角坐标 (X, Y, Z)</div>
                <div className="mt-0.5 font-mono text-sm text-slate-100">
                  X={ucsResult.output.x.toFixed(6)} Y={ucsResult.output.y.toFixed(6)} Z={ucsResult.output.z.toFixed(6)}
                </div>
              </div>

              {/* Spherical output */}
              <div className="rounded-md border border-slate-700/50 bg-slate-800/50 px-3 py-2">
                <div className="text-xs text-slate-500">球面坐标 (经度, 纬度, 距离)</div>
                <div className="mt-0.5 font-mono text-sm text-slate-100">
                  经度={ucsResult.spherical.lon.toFixed(4)}° 纬度={ucsResult.spherical.lat.toFixed(4)}°
                </div>
                <div className="font-mono text-sm text-cyan-300">
                  距离: {ucsResult.spherical.r.toFixed(6)} Mpc ({ucsResult.distanceLy.toFixed(2)} 光年)
                </div>
              </div>
            </div>
          )}

          {/* UCS System reference */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">9大坐标系一览</label>
            <div className="space-y-1 text-xs text-slate-500">
              {getAllCoordinateSystems().map(cs => (
                <div key={cs.id} className="flex gap-2">
                  <span className="text-cyan-400 w-20 shrink-0">{cs.name}</span>
                  <span>原点: {cs.origin} | 参考: {cs.referencePlane}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick examples */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">示例（点击填入）</label>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => { setUcsFrom('heliocentric'); setUcsTo('ucs'); setUcsX('0'); setUcsY('0'); setUcsZ('0'); }}
                className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
              >
                太阳→UCS
              </button>
              <button
                onClick={() => { setUcsFrom('heliocentric'); setUcsTo('ucs'); setUcsX('1'); setUcsY('0'); setUcsZ('0'); }}
                className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
              >
                地球→UCS
              </button>
              <button
                onClick={() => { setUcsFrom('heliocentric'); setUcsTo('ucs'); setUcsX('5.203'); setUcsY('0'); setUcsZ('0'); }}
                className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
              >
                木星→UCS
              </button>
              <button
                onClick={() => { setUcsFrom('ucs'); setUcsTo('galactocentric'); setUcsX('0'); setUcsY('0'); setUcsZ('0'); }}
                className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
              >
                宇宙中心→银心
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
