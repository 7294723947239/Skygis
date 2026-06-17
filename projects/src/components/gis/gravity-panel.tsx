'use client';
import { useState, useMemo } from 'react';

// === 纹理路径 ===
const BODY_TEXTURES: Record<string, string> = {
  '太阳': '/textures/sun.jpg',
  '水星': '/textures/mercury.jpg',
  '金星': '/textures/venus.jpg',
  '地球': '/textures/earth.jpg',
  '火星': '/textures/mars.jpg',
  '木星': '/textures/jupiter.jpg',
  '土星': '/textures/saturn.jpg',
  '天王星': '/textures/uranus.jpg',
  '海王星': '/textures/neptune.jpg',
  '月球': '/textures/moon.jpg',
};

// === 天文常量 ===
const G = 6.674e-11; // 万有引力常量 N·m²/kg²
const AU = 1.496e11;  // 天文单位 m
const EARTH_RADIUS = 6.371e6; // 地球半径 m

interface CelestialBody {
  name: string;
  emoji: string;
  mass: number;       // kg
  radius: number;     // m
  orbitRadius: number; // m (距太阳)
  color: string;
}

// === 天体数据 ===
const BODIES: CelestialBody[] = [
  { name: '太阳', emoji: '☀️', mass: 1.989e30, radius: 6.957e8, orbitRadius: 0, color: '#fbbf24' },
  { name: '水星', emoji: '☿', mass: 3.301e23, radius: 2.4397e6, orbitRadius: 5.791e10, color: '#9ca3af' },
  { name: '金星', emoji: '♀', mass: 4.867e24, radius: 6.0518e6, orbitRadius: 1.082e11, color: '#fde68a' },
  { name: '地球', emoji: '🌍', mass: 5.972e24, radius: 6.371e6, orbitRadius: 1.496e11, color: '#06b6d4' },
  { name: '火星', emoji: '♂', mass: 6.417e23, radius: 3.3895e6, orbitRadius: 2.279e11, color: '#ef4444' },
  { name: '木星', emoji: '♃', mass: 1.898e27, radius: 6.9911e7, orbitRadius: 7.786e11, color: '#f59e0b' },
  { name: '土星', emoji: '♄', mass: 5.683e26, radius: 5.8232e7, orbitRadius: 1.4335e12, color: '#d4a574' },
  { name: '天王星', emoji: '♅', mass: 8.681e25, radius: 2.5362e7, orbitRadius: 2.8725e12, color: '#7dd3fc' },
  { name: '海王星', emoji: '♆', mass: 1.024e26, radius: 2.4622e7, orbitRadius: 4.4951e12, color: '#3b82f6' },
  { name: '月球', emoji: '🌙', mass: 7.342e22, radius: 1.7374e6, orbitRadius: 3.844e8, color: '#e2e8f0' },
];

// === 物理计算 ===
function gravForce(m1: number, m2: number, r: number): number {
  return G * m1 * m2 / (r * r);
}

function surfaceGravity(mass: number, radius: number): number {
  return G * mass / (radius * radius);
}

function escapeVelocity(mass: number, radius: number): number {
  return Math.sqrt(2 * G * mass / radius);
}

function orbitalVelocity(mass: number, orbitRadius: number): number {
  return Math.sqrt(G * mass / orbitRadius);
}

function orbitalPeriod(mass: number, orbitRadius: number): number {
  return 2 * Math.PI * Math.sqrt(Math.pow(orbitRadius, 3) / (G * mass));
}

function hillSphere(m1: number, m2: number, a: number): number {
  return a * Math.pow(m1 / (3 * m2), 1 / 3);
}

function formatSci(n: number): string {
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 0.01 && abs < 1e4) return n.toPrecision(4);
  const exp = Math.floor(Math.log10(abs));
  const mantissa = n / Math.pow(10, exp);
  return `${mantissa.toFixed(2)}×10^${exp}`;
}

function formatDistance(m: number): string {
  if (m >= AU * 0.1) return `${(m / AU).toFixed(3)} AU`;
  if (m >= 1e9) return `${(m / 1e9).toFixed(2)} Gm`;
  if (m >= 1e6) return `${(m / 1e6).toFixed(2)} Mm`;
  return `${m.toFixed(0)} m`;
}

type TabKey = 'pair' | 'surface' | 'escape' | 'field' | 'orbit';

interface Props {
  onClose?: () => void;
}

export default function GravityPanel({ onClose }: Props) {
  const [body1, setBody1] = useState(3); // 默认地球
  const [body2, setBody2] = useState(0); // 默认太阳
  const [tab, setTab] = useState<TabKey>('pair');
  const [customDist, setCustomDist] = useState('');
  const [fieldDist, setFieldDist] = useState('1'); // 以半径为单位

  const b1 = BODIES[body1];
  const b2 = BODIES[body2];

  // 两体引力计算
  const pairResult = useMemo(() => {
    const dist = customDist ? parseFloat(customDist) * 1e9 : Math.abs(b1.orbitRadius - b2.orbitRadius) || 1.496e11;
    if (dist <= 0) return null;
    const force = gravForce(b1.mass, b2.mass, dist);
    const a1 = force / b1.mass; // b1受到的加速度
    const a2 = force / b2.mass; // b2受到的加速度
    return { force, dist, a1, a2 };
  }, [b1, b2, customDist]);

  // 各天体表面引力
  const surfaceData = useMemo(() => {
    return BODIES.map(b => ({
      ...b,
      g: surfaceGravity(b.mass, b.radius),
      gRatio: surfaceGravity(b.mass, b.radius) / surfaceGravity(5.972e24, 6.371e6),
      vEsc: escapeVelocity(b.mass, b.radius),
      vOrb: b.orbitRadius > 0 ? orbitalVelocity(1.989e30, b.orbitRadius) : 0,
      period: b.orbitRadius > 0 ? orbitalPeriod(1.989e30, b.orbitRadius) : 0,
    }));
  }, []);

  // 引力场强度
  const fieldResult = useMemo(() => {
    const d = parseFloat(fieldDist) || 1;
    return BODIES.map(b => ({
      name: b.name,
      emoji: b.emoji,
      g: surfaceGravity(b.mass, b.radius * d),
      color: b.color,
    })).sort((a, b) => b.g - a.g);
  }, [fieldDist]);

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'pair', label: '两体引力', icon: '⚡' },
    { key: 'surface', label: '表面重力', icon: '⬇' },
    { key: 'escape', label: '逃逸速度', icon: '🚀' },
    { key: 'field', label: '引力场', icon: '🌀' },
    { key: 'orbit', label: '轨道参数', icon: '🔄' },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:inset-auto lg:absolute lg:top-14 lg:left-3 lg:z-30 lg:w-[420px] lg:max-h-[80vh] bg-[#0f172a]/95 backdrop-blur-md border border-[#334155] rounded-none lg:rounded-xl shadow-2xl text-[#f1f5f9] pointer-events-auto overflow-y-auto flex flex-col">
      {/* 移动端顶部关闭栏 */}
      {onClose && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#334155] lg:hidden bg-[#0f172a] shrink-0">
          <span className="text-sm font-medium text-cyan-400">天体引力计算器</span>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-red-900/60 text-red-300 hover:bg-red-800 text-xl">✕</button>
        </div>
      )}
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#334155] shrink-0">
        <h3 className="text-base font-bold flex items-center gap-2">
          <span className="text-cyan-400">⚡</span> 天体引力计算器
        </h3>
        {onClose && (
          <button onClick={onClose} className="w-7 h-7 rounded-md bg-[#1e293b] border border-[#334155] text-slate-400 hover:text-white text-sm flex items-center justify-center">✕</button>
        )}
      </div>

      {/* Tab 切换 */}
      <div className="flex border-b border-[#334155] shrink-0 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-xs whitespace-nowrap transition-colors ${
              tab === t.key ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5' : 'text-slate-400 hover:text-slate-200'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* 内容 */}
      <div className="overflow-y-auto p-4 space-y-3 flex-1 min-h-0">

        {/* ===== 两体引力 ===== */}
        {tab === 'pair' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">天体 A</label>
                <select value={body1} onChange={e => setBody1(+e.target.value)}
                  className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-[#f1f5f9]">
                  {BODIES.map((b, i) => <option key={i} value={i}>{b.emoji} {b.name}</option>)}
                </select>
                {BODY_TEXTURES[b1.name] && (
                  <div className="mt-1.5 rounded-md overflow-hidden border border-[#334155] h-16">
                    <img src={BODY_TEXTURES[b1.name]} alt={b1.name} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">天体 B</label>
                <select value={body2} onChange={e => setBody2(+e.target.value)}
                  className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-[#f1f5f9]">
                  {BODIES.map((b, i) => <option key={i} value={i}>{b.emoji} {b.name}</option>)}
                </select>
                {BODY_TEXTURES[b2.name] && (
                  <div className="mt-1.5 rounded-md overflow-hidden border border-[#334155] h-16">
                    <img src={BODY_TEXTURES[b2.name]} alt={b2.name} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">距离 (可自定义，单位: 百万km)</label>
              <input type="number" value={customDist} onChange={e => setCustomDist(e.target.value)}
                placeholder={body1 === 0 || body2 === 0 ? '自动取轨道距离' : `默认: ${(Math.abs(b1.orbitRadius - b2.orbitRadius) / 1e9).toFixed(1)} 百万km`}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] placeholder:text-slate-500" />
            </div>

            {pairResult && (
              <div className="space-y-2">
                <div className="bg-[#1e293b] rounded-lg p-3 border border-[#334155]">
                  <div className="text-xs text-slate-400 mb-1">万有引力 F = G·m₁·m₂/r²</div>
                  <div className="text-lg font-mono font-bold text-cyan-400">{formatSci(pairResult.force)} N</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#1e293b] rounded-lg p-2 border border-[#334155]">
                    <div className="text-xs text-slate-400">{b1.emoji} {b1.name} 受力加速度</div>
                    <div className="text-sm font-mono text-amber-400">{formatSci(pairResult.a1)} m/s²</div>
                  </div>
                  <div className="bg-[#1e293b] rounded-lg p-2 border border-[#334155]">
                    <div className="text-xs text-slate-400">{b2.emoji} {b2.name} 受力加速度</div>
                    <div className="text-sm font-mono text-amber-400">{formatSci(pairResult.a2)} m/s²</div>
                  </div>
                </div>
                <div className="bg-[#1e293b] rounded-lg p-2 border border-[#334155]">
                  <div className="text-xs text-slate-400">距离</div>
                  <div className="text-sm font-mono text-slate-200">{formatDistance(pairResult.dist)}</div>
                </div>

                {/* 引力可视化条 */}
                <div className="bg-[#1e293b] rounded-lg p-3 border border-[#334155]">
                  <div className="text-xs text-slate-400 mb-2">引力相对强度 (对数刻度)</div>
                  {BODIES.filter((_, i) => i !== body1).map((b, i) => {
                    const origIdx = BODIES.indexOf(b);
                    const d = Math.abs(b.orbitRadius - b1.orbitRadius) || 1.496e11;
                    const f = gravForce(b1.mass, b.mass, d);
                    const maxF = gravForce(b1.mass, 1.989e30, b1.orbitRadius || 1.496e11);
                    const pct = Math.min(100, (Math.log10(f) / Math.log10(maxF)) * 100);
                    return (
                      <div key={i} className="flex items-center gap-2 mb-1">
                        <span className="text-xs w-14 truncate">{b.emoji}{b.name}</span>
                        <div className="flex-1 h-3 bg-[#0f172a] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(2, pct)}%`, backgroundColor: b.color }} />
                        </div>
                        <span className="text-xs font-mono text-slate-400 w-16 text-right">{formatSci(f)}N</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 公式说明 */}
            <div className="text-xs text-slate-500 bg-[#0f172a] rounded-lg p-3 border border-[#334155]">
              <div className="font-mono text-cyan-600 mb-1">F = G × m₁ × m₂ / r²</div>
              <div>G = 6.674×10⁻¹¹ N·m²/kg²</div>
              <div>两体间距离越近，引力以平方反比增大</div>
            </div>
          </>
        )}

        {/* ===== 表面重力 ===== */}
        {tab === 'surface' && (
          <>
            <div className="text-xs text-slate-400 bg-[#0f172a] rounded-lg p-3 border border-[#334155] mb-2">
              <span className="font-mono text-cyan-600">g = G × M / R²</span> — 天体表面重力加速度
            </div>
            <div className="space-y-2">
              {surfaceData.map((b, i) => (
                <div key={i} className="bg-[#1e293b] rounded-lg p-3 border border-[#334155]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold flex items-center gap-1.5">
                      {BODY_TEXTURES[b.name] && (
                        <img src={BODY_TEXTURES[b.name]} alt={b.name} className="w-6 h-6 rounded-full object-cover border border-[#334155]" />
                      )}
                      {!BODY_TEXTURES[b.name] && <span style={{ color: b.color }}>{b.emoji}</span>}
                      {b.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#0f172a] text-slate-300">
                      {b.gRatio.toFixed(2)} g₀
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div>
                      <span className="text-slate-400">g = </span>
                      <span className="font-mono text-cyan-400">{b.g.toFixed(3)}</span>
                      <span className="text-slate-400"> m/s²</span>
                    </div>
                    <div className="flex-1 h-2 bg-[#0f172a] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, b.gRatio * 100 / 3)}%`, backgroundColor: b.color }} />
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    100kg物体在此重 {((b.gRatio) * 100).toFixed(1)} kg力
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ===== 逃逸速度 ===== */}
        {tab === 'escape' && (
          <>
            <div className="text-xs text-slate-400 bg-[#0f172a] rounded-lg p-3 border border-[#334155] mb-2">
              <span className="font-mono text-cyan-600">vₑ = √(2GM/R)</span> — 逃离天体引力所需最小速度
            </div>
            <div className="space-y-2">
              {BODIES.map((b, i) => {
                const vEsc = escapeVelocity(b.mass, b.radius);
                const vEscKm = vEsc / 1000;
                return (
                  <div key={i} className="bg-[#1e293b] rounded-lg p-3 border border-[#334155]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold flex items-center gap-1.5">
                        {BODY_TEXTURES[b.name] && (
                          <img src={BODY_TEXTURES[b.name]} alt={b.name} className="w-6 h-6 rounded-full object-cover border border-[#334155]" />
                        )}
                        {!BODY_TEXTURES[b.name] && <span style={{ color: b.color }}>{b.emoji}</span>}
                        {b.name}
                      </span>
                      <span className="font-mono text-amber-400 text-sm">{vEscKm.toFixed(2)} km/s</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex-1 h-2 bg-[#0f172a] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.min(100, vEscKm * 100 / 620)}%` }} />
                      </div>
                      <span className="text-slate-400 w-24 text-right">{(vEsc / 299792458 * 100).toFixed(4)}% c</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-slate-500 bg-[#0f172a] rounded-lg p-3 border border-[#334155]">
              地球逃逸速度 11.19 km/s — 需要约 40,320 km/h 才能离开地球
            </div>
          </>
        )}

        {/* ===== 引力场 ===== */}
        {tab === 'field' && (
          <>
            <div className="text-xs text-slate-400 bg-[#0f172a] rounded-lg p-3 border border-[#334155] mb-2">
              <span className="font-mono text-cyan-600">g(r) = GM/r²</span> — 距天体中心 r 处的引力场强度
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">距天体中心距离 (以半径 R 为单位)</label>
              <div className="flex items-center gap-3">
                <input type="range" min="0.5" max="50" step="0.1" value={fieldDist}
                  onChange={e => setFieldDist(e.target.value)}
                  className="flex-1 accent-cyan-500" />
                <span className="font-mono text-sm text-cyan-400 w-12">{fieldDist}R</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                1R = 表面 | 3R = 3倍半径处 | 10R = 10倍半径处
              </div>
            </div>
            <div className="space-y-1.5">
              {fieldResult.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  {BODY_TEXTURES[b.name] ? (
                    <img src={BODY_TEXTURES[b.name]} alt={b.name} className="w-5 h-5 rounded-full object-cover border border-[#334155] shrink-0" />
                  ) : (
                    <span className="text-xs w-5 text-center" style={{ color: b.color }}>{b.emoji}</span>
                  )}
                  <span className="text-xs w-12 truncate" style={{ color: b.color }}>{b.name}</span>
                  <div className="flex-1 h-4 bg-[#0f172a] rounded overflow-hidden">
                    <div className="h-full rounded transition-all" style={{
                      width: `${Math.min(100, Math.log10(Math.max(b.g, 1e-10)) / 12 * 100 + 50)}%`,
                      backgroundColor: b.color,
                      opacity: 0.7
                    }} />
                  </div>
                  <span className="font-mono text-xs text-slate-300 w-28 text-right">{formatSci(b.g)} m/s²</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ===== 轨道参数 ===== */}
        {tab === 'orbit' && (
          <>
            <div className="text-xs text-slate-400 bg-[#0f172a] rounded-lg p-3 border border-[#334155] mb-2">
              <span className="font-mono text-cyan-600">v = √(GM/r)</span> — 轨道速度 &nbsp;|&nbsp;
              <span className="font-mono text-cyan-600">T = 2π√(r³/GM)</span> — 轨道周期
            </div>
            <div className="space-y-2">
              {surfaceData.filter(b => b.orbitRadius > 0).map((b, i) => {
                const hill = hillSphere(b.mass, 1.989e30, b.orbitRadius);
                const syncOrbit = b.name === '地球' ? 42164 : 0; // 地球同步轨道km
                return (
                  <div key={i} className="bg-[#1e293b] rounded-lg p-3 border border-[#334155]">
                    <div className="text-sm font-bold mb-2 flex items-center gap-1.5">
                      {BODY_TEXTURES[b.name] && (
                        <img src={BODY_TEXTURES[b.name]} alt={b.name} className="w-6 h-6 rounded-full object-cover border border-[#334155]" />
                      )}
                      {!BODY_TEXTURES[b.name] && <span style={{ color: b.color }}>{b.emoji}</span>}
                      {b.name}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div><span className="text-slate-400">轨道半径:</span> <span className="font-mono text-slate-200">{(b.orbitRadius / AU).toFixed(3)} AU</span></div>
                      <div><span className="text-slate-400">轨道速度:</span> <span className="font-mono text-cyan-400">{(b.vOrb / 1000).toFixed(2)} km/s</span></div>
                      <div><span className="text-slate-400">公转周期:</span> <span className="font-mono text-amber-400">{(b.period / 86400).toFixed(1)} 天</span></div>
                      <div><span className="text-slate-400">希尔球:</span> <span className="font-mono text-slate-200">{formatDistance(hill)}</span></div>
                      {syncOrbit > 0 && (
                        <div><span className="text-slate-400">同步轨道:</span> <span className="font-mono text-emerald-400">{syncOrbit.toLocaleString()} km</span></div>
                      )}
                      <div><span className="text-slate-400">表面重力:</span> <span className="font-mono text-slate-200">{b.g.toFixed(3)} m/s²</span></div>
                      <div><span className="text-slate-400">逃逸速度:</span> <span className="font-mono text-slate-200">{(b.vEsc / 1000).toFixed(2)} km/s</span></div>
                      <div><span className="text-slate-400">质量:</span> <span className="font-mono text-slate-200">{formatSci(b.mass)} kg</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-slate-500 bg-[#0f172a] rounded-lg p-3 border border-[#334155]">
              <div>希尔球: 行星引力占主导的区域半径，卫星需在此范围内才能稳定运行</div>
              <div>同步轨道: 卫星公转周期等于行星自转周期的轨道高度</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
