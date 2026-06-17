'use client';

import { useState, useEffect, useCallback } from 'react';

interface SolarBody {
  id: string; name: string; body_type: string; parent_id: string | null;
  mass_kg: number; radius_km: number; density_g_cm3: number;
  surface_gravity_m_s2: number; escape_velocity_km_s: number;
  surface_temp_c: number; atmosphere: string; number_of_moons: number;
  description: string; color: string; icon: string;
}

interface OrbitalParams {
  id: string; body_id: string; semi_major_axis_au: number; eccentricity: number;
  inclination_deg: number; orbital_period_days: number; rotation_period_hours: number;
  perihelion_au: number; aphelion_au: number; mean_orbital_velocity_km_s: number;
  axial_tilt_deg: number; orbital_direction: string;
  solar_bodies?: { name: string; body_type: string };
}

interface SurfaceFeature {
  id: string; body_id: string; name: string; feature_type: string;
  latitude: number; longitude: number; diameter_km: number; depth_km: number;
  elevation_km: number; area_km2: number; description: string; properties: Record<string, unknown>;
  solar_bodies?: { name: string };
}

interface Asteroid {
  id: string; name: string; asteroid_type: string; semi_major_axis_au: number;
  eccentricity: number; inclination_deg: number; diameter_km: number;
  perihelion_au: number; aphelion_au: number; description: string;
}

interface Comet {
  id: string; name: string; semi_major_axis_au: number; eccentricity: number;
  inclination_deg: number; orbital_period_years: number; perihelion_au: number;
  nucleus_diameter_km: number; comet_type: string; description: string;
  last_perihelion_date: string | null; next_perihelion_date: string | null;
}

type TabType = 'bodies' | 'orbits' | 'surfaces' | 'asteroids' | 'comets' | 'analysis';

const BODY_TYPE_LABELS: Record<string, string> = {
  star: '恒星', planet: '行星', dwarf_planet: '矮行星', moon: '卫星', asteroid: '小行星', comet: '彗星',
};

const FEATURE_TYPE_LABELS: Record<string, string> = {
  crater: '撞击坑', mountain: '山脉', plain: '平原', valley: '峡谷', ridge: '山脊',
  mare: '月海', volcano: '火山', ice_cap: '冰盖', canyon: '峡谷', basin: '盆地',
  dune_field: '沙丘', lava_flow: '熔岩流',
};

const COMET_TYPE_LABELS: Record<string, string> = {
  short_period: '短周期', long_period: '长周期', halley_type: '哈雷型',
};

export default function SolarSystemPanel({ onClose }: { onClose?: () => void }) {
  const [activeTab, setActiveTab] = useState<TabType>('bodies');
  const [bodies, setBodies] = useState<SolarBody[]>([]);
  const [orbits, setOrbits] = useState<OrbitalParams[]>([]);
  const [surfaces, setSurfaces] = useState<SurfaceFeature[]>([]);
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [comets, setComets] = useState<Comet[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBody, setSelectedBody] = useState<SolarBody | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const fetchData = useCallback(async (table: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/solar?table=${table}`);
      const json = await res.json();
      if (json.data) {
        switch (table) {
          case 'bodies': setBodies(json.data); break;
          case 'orbits': setOrbits(json.data); break;
          case 'surfaces': setSurfaces(json.data); break;
          case 'asteroids': setAsteroids(json.data); break;
          case 'comets': setComets(json.data); break;
        }
      }
    } catch (e) { console.error('fetch error:', e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData(activeTab === 'analysis' ? 'bodies' : activeTab);
  }, [activeTab, fetchData]);

  const formatNumber = (n: number | null | undefined, decimals = 2) => {
    if (n == null) return '-';
    if (Math.abs(n) >= 1e20) return n.toExponential(2);
    return n.toFixed(decimals);
  };

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'bodies', label: '天体', icon: '🪐' },
    { key: 'orbits', label: '轨道', icon: '🔄' },
    { key: 'surfaces', label: '地貌', icon: '🌋' },
    { key: 'asteroids', label: '小行星', icon: '☄️' },
    { key: 'comets', label: '彗星', icon: '💫' },
    { key: 'analysis', label: '分析', icon: '📊' },
  ];

  const filteredBodies = filterType === 'all'
    ? bodies
    : bodies.filter(b => b.body_type === filterType);

  return (
    <div className="w-full h-full flex flex-col bg-[#0f172a] text-slate-200 text-sm overflow-hidden">
      {/* 标题栏 + 关闭按钮 */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-700 shrink-0">
        <span className="text-xs text-cyan-400 font-semibold">太阳系天体数据库</span>
        {onClose && (
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 text-xs">✕</button>
        )}
      </div>
      {/* Tab栏 */}
      <div className="flex border-b border-slate-700 shrink-0 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3 py-2 text-xs whitespace-nowrap transition-colors ${
              activeTab === t.key
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {loading && <div className="text-cyan-400 text-xs animate-pulse">加载中...</div>}

        {/* ===== 天体列表 ===== */}
        {activeTab === 'bodies' && (
          <>
            <div className="flex gap-1 flex-wrap">
              {['all', 'star', 'planet', 'dwarf_planet', 'moon'].map(t => (
                <button key={t} onClick={() => setFilterType(t)}
                  className={`px-2 py-1 rounded text-xs ${
                    filterType === t ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                  {t === 'all' ? '全部' : BODY_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {filteredBodies.map(b => (
                <div key={b.id}
                  onClick={() => setSelectedBody(selectedBody?.id === b.id ? null : b)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedBody?.id === b.id ? 'bg-cyan-900/40 ring-1 ring-cyan-500' : 'bg-slate-800 hover:bg-slate-700'
                  }`}>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                    <span className="font-semibold">{b.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-600 text-slate-300">
                      {BODY_TYPE_LABELS[b.body_type]}
                    </span>
                  </div>
                  {selectedBody?.id === b.id && (
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-300">
                      <div>半径: <span className="text-cyan-400">{formatNumber(b.radius_km)} km</span></div>
                      <div>质量: <span className="text-cyan-400">{formatNumber(b.mass_kg)} kg</span></div>
                      <div>密度: <span className="text-cyan-400">{formatNumber(b.density_g_cm3)} g/cm³</span></div>
                      <div>表面重力: <span className="text-cyan-400">{formatNumber(b.surface_gravity_m_s2)} m/s²</span></div>
                      <div>逃逸速度: <span className="text-cyan-400">{formatNumber(b.escape_velocity_km_s)} km/s</span></div>
                      <div>表面温度: <span className="text-cyan-400">{formatNumber(b.surface_temp_c, 0)} °C</span></div>
                      <div>卫星数: <span className="text-cyan-400">{b.number_of_moons}</span></div>
                      <div>大气: <span className="text-cyan-400">{b.atmosphere || '无'}</span></div>
                      <div className="col-span-2 mt-1 text-slate-400">{b.description}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ===== 轨道参数 ===== */}
        {activeTab === 'orbits' && (
          <div className="space-y-2">
            {orbits.map(o => (
              <div key={o.id} className="p-3 rounded-lg bg-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">{o.solar_bodies?.name || '未知'}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-600">
                    {BODY_TYPE_LABELS[o.solar_bodies?.body_type || '']}
                  </span>
                  {o.orbital_direction === 'retrograde' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-700 text-amber-200">逆行</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-300">
                  <div>半长轴: <span className="text-cyan-400">{formatNumber(o.semi_major_axis_au, 3)} AU</span></div>
                  <div>偏心率: <span className="text-cyan-400">{formatNumber(o.eccentricity, 4)}</span></div>
                  <div>倾角: <span className="text-cyan-400">{formatNumber(o.inclination_deg, 2)}°</span></div>
                  <div>公转周期: <span className="text-cyan-400">{formatNumber(o.orbital_period_days, 1)} 天</span></div>
                  <div>自转周期: <span className="text-cyan-400">{formatNumber(Math.abs(o.rotation_period_hours), 1)} 小时</span></div>
                  <div>近日点: <span className="text-cyan-400">{formatNumber(o.perihelion_au, 3)} AU</span></div>
                  <div>远日点: <span className="text-cyan-400">{formatNumber(o.aphelion_au, 3)} AU</span></div>
                  <div>平均速度: <span className="text-cyan-400">{formatNumber(o.mean_orbital_velocity_km_s, 2)} km/s</span></div>
                  <div>轴倾角: <span className="text-cyan-400">{formatNumber(o.axial_tilt_deg, 2)}°</span></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== 地外地貌 ===== */}
        {activeTab === 'surfaces' && (
          <div className="space-y-2">
            {surfaces.map(s => (
              <div key={s.id} className="p-3 rounded-lg bg-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{s.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-700/60 text-emerald-300">
                    {FEATURE_TYPE_LABELS[s.feature_type] || s.feature_type}
                  </span>
                  <span className="text-[10px] text-slate-500">({s.solar_bodies?.name})</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-slate-400">
                  {s.latitude != null && <div>纬度: {formatNumber(s.latitude)}°</div>}
                  {s.longitude != null && <div>经度: {formatNumber(s.longitude)}°</div>}
                  {s.diameter_km != null && <div>直径: {formatNumber(s.diameter_km, 1)} km</div>}
                  {s.depth_km != null && <div>深度: {formatNumber(s.depth_km, 1)} km</div>}
                  {s.elevation_km != null && <div>海拔: {formatNumber(s.elevation_km, 1)} km</div>}
                  {s.area_km2 != null && <div>面积: {formatNumber(s.area_km2, 0)} km²</div>}
                </div>
                <div className="text-xs text-slate-500 mt-1">{s.description}</div>
              </div>
            ))}
          </div>
        )}

        {/* ===== 小行星 ===== */}
        {activeTab === 'asteroids' && (
          <div className="space-y-2">
            {asteroids.map(a => (
              <div key={a.id} className="p-3 rounded-lg bg-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{a.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-700/60 text-purple-300">
                    {a.asteroid_type || '未知'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-slate-400">
                  <div>半长轴: {formatNumber(a.semi_major_axis_au, 3)} AU</div>
                  <div>偏心率: {formatNumber(a.eccentricity, 4)}</div>
                  <div>倾角: {formatNumber(a.inclination_deg, 2)}°</div>
                  <div>直径: {formatNumber(a.diameter_km, 1)} km</div>
                  <div>近日点: {formatNumber(a.perihelion_au, 3)} AU</div>
                  <div>远日点: {formatNumber(a.aphelion_au, 3)} AU</div>
                </div>
                <div className="text-xs text-slate-500 mt-1">{a.description}</div>
              </div>
            ))}
          </div>
        )}

        {/* ===== 彗星 ===== */}
        {activeTab === 'comets' && (
          <div className="space-y-2">
            {comets.map(c => (
              <div key={c.id} className="p-3 rounded-lg bg-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{c.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-700/60 text-amber-300">
                    {COMET_TYPE_LABELS[c.comet_type] || c.comet_type}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-slate-400">
                  <div>半长轴: {formatNumber(c.semi_major_axis_au, 1)} AU</div>
                  <div>偏心率: {formatNumber(c.eccentricity, 4)}</div>
                  <div>倾角: {formatNumber(c.inclination_deg, 2)}°</div>
                  <div>周期: {formatNumber(c.orbital_period_years, 1)} 年</div>
                  <div>近日点: {formatNumber(c.perihelion_au, 3)} AU</div>
                  {c.nucleus_diameter_km && <div>核径: {formatNumber(c.nucleus_diameter_km, 1)} km</div>}
                </div>
                <div className="text-xs text-slate-500 mt-1">{c.description}</div>
                {c.last_perihelion_date && (
                  <div className="text-xs text-amber-500 mt-0.5">上次近日点: {c.last_perihelion_date}</div>
                )}
                {c.next_perihelion_date && (
                  <div className="text-xs text-emerald-500 mt-0.5">下次近日点: {c.next_perihelion_date}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ===== 统计分析 ===== */}
        {activeTab === 'analysis' && (
          <SolarAnalysisPanel bodies={bodies} />
        )}
      </div>
    </div>
  );
}

/* ===== 统计分析子面板 ===== */
function SolarAnalysisPanel({ bodies }: { bodies: SolarBody[] }) {
  const [coordsData, setCoordsData] = useState<Record<string, Record<string, Record<string, number>>>>({});
  const [simDate, setSimDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  // 获取坐标数据
  const fetchCoords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/coords?action=positions&date=${simDate}`);
      const json = await res.json();
      if (json.data?.coords) setCoordsData(json.data.coords);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [simDate]);

  useEffect(() => { fetchCoords(); }, [fetchCoords]);

  const planets = bodies.filter(b => b.body_type === 'planet');

  return (
    <div className="space-y-4">
      {/* 天体大小对比 */}
      <div className="p-3 rounded-lg bg-slate-800">
        <h3 className="text-xs font-bold text-cyan-400 mb-2">天体大小对比（半径 km）</h3>
        <div className="space-y-1">
          {[...planets].sort((a, b) => (b.radius_km || 0) - (a.radius_km || 0)).map(p => {
            const maxR = 69911; // Jupiter
            const pct = ((p.radius_km || 0) / maxR) * 100;
            return (
              <div key={p.id} className="flex items-center gap-2 text-xs">
                <span className="w-16 text-right text-slate-400 shrink-0">{p.name}</span>
                <div className="flex-1 h-4 bg-slate-700 rounded overflow-hidden">
                  <div className="h-full rounded transition-all" style={{
                    width: `${Math.max(pct, 1)}%`,
                    backgroundColor: p.color || '#06b6d4',
                    opacity: 0.8,
                  }} />
                </div>
                <span className="w-20 text-slate-300 text-right">{formatNumber(p.radius_km, 0)} km</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 表面重力对比 */}
      <div className="p-3 rounded-lg bg-slate-800">
        <h3 className="text-xs font-bold text-cyan-400 mb-2">表面重力对比（地球=1.0）</h3>
        <div className="space-y-1">
          {[...planets].sort((a, b) => (b.surface_gravity_m_s2 || 0) - (a.surface_gravity_m_s2 || 0)).map(p => {
            const g = (p.surface_gravity_m_s2 || 0) / 9.81;
            const pct = g * 50;
            return (
              <div key={p.id} className="flex items-center gap-2 text-xs">
                <span className="w-16 text-right text-slate-400 shrink-0">{p.name}</span>
                <div className="flex-1 h-4 bg-slate-700 rounded overflow-hidden">
                  <div className="h-full rounded" style={{
                    width: `${Math.min(pct, 100)}%`,
                    backgroundColor: g > 1 ? '#ef4444' : g > 0.5 ? '#f59e0b' : '#10b981',
                    opacity: 0.8,
                  }} />
                </div>
                <span className="w-20 text-slate-300 text-right">{g.toFixed(2)} g</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 轨道距离示意 */}
      <div className="p-3 rounded-lg bg-slate-800">
        <h3 className="text-xs font-bold text-cyan-400 mb-2">轨道距离分布（AU）</h3>
        <div className="space-y-1">
          {[...planets].sort((a, b) => {
            const aD = getOrbitalDist(a.name);
            const bD = getOrbitalDist(b.name);
            return aD - bD;
          }).map(p => {
            const dist = getOrbitalDist(p.name);
            const pct = (dist / 30.07) * 100; // Neptune
            return (
              <div key={p.id} className="flex items-center gap-2 text-xs">
                <span className="w-16 text-right text-slate-400 shrink-0">{p.name}</span>
                <div className="flex-1 h-4 bg-slate-700 rounded overflow-hidden relative">
                  <div className="absolute top-0 h-full w-1 rounded" style={{
                    left: `${Math.max(pct, 0.5)}%`,
                    backgroundColor: p.color || '#06b6d4',
                  }} />
                </div>
                <span className="w-20 text-slate-300 text-right">{dist.toFixed(3)} AU</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 实时坐标查询 */}
      <div className="p-3 rounded-lg bg-slate-800">
        <h3 className="text-xs font-bold text-cyan-400 mb-2">天体坐标实时查询</h3>
        <div className="flex gap-2 mb-2">
          <input type="date" value={simDate} onChange={e => setSimDate(e.target.value)}
            className="flex-1 bg-slate-700 rounded px-2 py-1 text-xs text-slate-200 border border-slate-600" />
          <button onClick={fetchCoords} disabled={loading}
            className="px-3 py-1 rounded bg-cyan-600 text-white text-xs hover:bg-cyan-500 disabled:opacity-50">
            查询
          </button>
        </div>
        {Object.keys(coordsData).length > 0 && (
          <div className="space-y-2 max-h-60 overflow-auto">
            {Object.entries(coordsData).map(([name, data]) => (
              <div key={name} className="text-xs p-2 rounded bg-slate-700/50">
                <span className="font-semibold text-cyan-400">{name}</span>
                <div className="grid grid-cols-3 gap-1 mt-1 text-slate-400">
                  <div>经度: {data.ecliptic?.lon?.toFixed(2)}°</div>
                  <div>纬度: {data.ecliptic?.lat?.toFixed(2)}°</div>
                  <div>距离: {data.ecliptic?.r?.toFixed(3)} AU</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getOrbitalDist(name: string): number {
  const map: Record<string, number> = {
    '水星': 0.387, '金星': 0.723, '地球': 1.000, '火星': 1.524,
    '木星': 5.203, '土星': 9.537, '天王星': 19.191, '海王星': 30.069,
  };
  return map[name] || 0;
}

function formatNumber(n: number | null | undefined, decimals = 2): string {
  if (n == null) return '-';
  if (Math.abs(n) >= 1e20) return n.toExponential(2);
  return n.toFixed(decimals);
}
