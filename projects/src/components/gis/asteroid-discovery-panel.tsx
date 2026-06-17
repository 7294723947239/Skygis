'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { type CelestialBody, type HubSignal } from '@/lib/skygis-hub';
import CrossModuleLink from './cross-module-link';

/* ===== 公众科学参与式"小行星发现与分类"模块 ===== */

interface AsteroidCandidate {
  id: string;
  designation: string;
  ra: number; // 赤经 (度)
  dec: number; // 赤纬 (度)
  magnitude: number;
  motion_rate: number; // 角速度 "/min
  motion_dir: 'prograde' | 'retrograde';
  eccentricity: number;
  semi_major: number;
  inclination: number;
  status: 'unclassified' | 'pending' | 'classified' | 'confirmed';
  classifications: Classification[];
  discoverer?: string;
  notes: string;
}

interface Classification {
  userId: string;
  userName: string;
  motionType: string;
  confidence: number; // 0-100
  orbitType: string;
  timestamp: number;
}

// 模拟待分类小行星候选体
const CANDIDATES: AsteroidCandidate[] = [
  { id: 'SKY-2025-001', designation: '候选体 α', ra: 145.3, dec: 12.7, magnitude: 18.5, motion_rate: 0.82, motion_dir: 'prograde', eccentricity: 0.15, semi_major: 2.35, inclination: 5.2, status: 'unclassified', classifications: [], notes: '主带小行星候选' },
  { id: 'SKY-2025-002', designation: '候选体 β', ra: 230.1, dec: -8.4, magnitude: 21.2, motion_rate: 2.15, motion_dir: 'prograde', eccentricity: 0.45, semi_major: 1.85, inclination: 22.8, status: 'unclassified', classifications: [], notes: '近地天体疑似' },
  { id: 'SKY-2025-003', designation: '候选体 γ', ra: 310.7, dec: 45.2, magnitude: 19.8, motion_rate: 0.35, motion_dir: 'retrograde', eccentricity: 0.92, semi_major: 18.5, inclination: 65.3, status: 'unclassified', classifications: [], notes: '长周期彗星核疑似' },
  { id: 'SKY-2025-004', designation: '候选体 δ', ra: 78.9, dec: -22.1, magnitude: 16.3, motion_rate: 1.45, motion_dir: 'prograde', eccentricity: 0.28, semi_major: 2.75, inclination: 8.1, status: 'pending', classifications: [], notes: '3:1 共振区域' },
  { id: 'SKY-2025-005', designation: '候选体 ε', ra: 195.6, dec: 33.8, magnitude: 22.1, motion_rate: 3.80, motion_dir: 'prograde', eccentricity: 0.62, semi_major: 1.12, inclination: 35.6, status: 'unclassified', classifications: [], notes: '阿登型近地小行星' },
  { id: 'SKY-2025-006', designation: '候选体 ζ', ra: 45.2, dec: -55.3, magnitude: 17.9, motion_rate: 0.55, motion_dir: 'prograde', eccentricity: 0.08, semi_major: 5.18, inclination: 12.4, status: 'unclassified', classifications: [], notes: '木星特洛伊候选' },
  { id: 'SKY-2025-007', designation: '候选体 η', ra: 280.4, dec: 18.6, magnitude: 20.5, motion_rate: 1.20, motion_dir: 'prograde', eccentricity: 0.35, semi_major: 2.10, inclination: 15.9, status: 'unclassified', classifications: [], notes: '主带内侧' },
  { id: 'SKY-2025-008', designation: '候选体 θ', ra: 160.8, dec: -40.2, magnitude: 23.5, motion_rate: 4.20, motion_dir: 'retrograde', eccentricity: 0.85, semi_major: 25.0, inclination: 142.3, status: 'unclassified', classifications: [], notes: '逆行轨道异常天体' },
];

// 全局贡献者模拟
const SIMULATED_USERS = [
  { id: 'u1', name: 'AstroHunter', score: 2450 },
  { id: 'u2', name: '星海守望者', score: 2180 },
  { id: 'u3', name: 'CometChaser', score: 1920 },
  { id: 'u4', name: '深空猎手', score: 1650 },
  { id: 'u5', name: 'NEOWatcher', score: 1380 },
];

const ORBIT_TYPES = [
  '主带小行星 (MBA)',
  '近地小行星 (NEA)',
  '阿登型 (Aten)',
  '阿波罗型 (Apollo)',
  '阿莫尔型 (Amor)',
  '木星特洛伊 (Trojan)',
  '半人马型 (Centaur)',
  '海王星外天体 (TNO)',
  '彗星核 (Comet)',
];

const MOTION_TYPES = ['顺行', '逆行', '不确定'];

export default function AsteroidDiscoveryPanel({ onClose, focusedBody, onNavigate }: {
  onClose: () => void;
  focusedBody?: CelestialBody | null;
  onNavigate?: (signal: Omit<HubSignal, 'timestamp'>) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [candidates, setCandidates] = useState<AsteroidCandidate[]>(CANDIDATES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userClassifications, setUserClassifications] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [heatmapData, setHeatmapData] = useState<{ ra: number; dec: number; count: number }[]>([]);
  const [filter, setFilter] = useState<'all' | 'unclassified' | 'pending' | 'classified'>('all');
  const [classifying, setClassifying] = useState<{ motion: string; orbit: string; confidence: number }>({
    motion: '', orbit: '', confidence: 50,
  });

  const selected = candidates.find(c => c.id === selectedId);

  // 初始化热力图数据
  useEffect(() => {
    const data = Array.from({ length: 30 }, () => ({
      ra: Math.random() * 360,
      dec: (Math.random() - 0.5) * 180,
      count: Math.floor(Math.random() * 20) + 1,
    }));
    setHeatmapData(data);
  }, []);

  // 绘制天区图
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // 网格
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let ra = 0; ra <= 360; ra += 30) {
      const x = (ra / 360) * w;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let dec = -90; dec <= 90; dec += 30) {
      const y = ((90 - dec) / 180) * h;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // 标注
    ctx.font = '8px monospace';
    ctx.fillStyle = '#334155';
    ctx.textAlign = 'center';
    for (let ra = 0; ra <= 360; ra += 60) {
      ctx.fillText(`${ra}°`, (ra / 360) * w, h - 2);
    }

    // 热力图
    for (const hd of heatmapData) {
      const x = (hd.ra / 360) * w;
      const y = ((90 - hd.dec) / 180) * h;
      const r = Math.min(30, hd.count * 2);
      const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, `rgba(249,115,22,${Math.min(0.3, hd.count * 0.02)})`);
      grd.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    }

    // 候选体
    for (const c of candidates) {
      if (filter !== 'all' && c.status !== filter) continue;
      const x = (c.ra / 360) * w;
      const y = ((90 - c.dec) / 180) * h;

      const statusColor = c.status === 'unclassified' ? '#f59e0b' : c.status === 'pending' ? '#3b82f6' : '#10b981';
      // 光晕
      const grd = ctx.createRadialGradient(x, y, 0, x, y, 8);
      grd.addColorStop(0, statusColor + '60');
      grd.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // 点
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = statusColor;
      ctx.fill();

      // 选中高亮
      if (selectedId === c.id) {
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 速度方向指示
      const dir = c.motion_dir === 'prograde' ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + dir * c.motion_rate * 5, y);
      ctx.strokeStyle = statusColor + '80';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 标签
      ctx.font = '8px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'left';
      ctx.fillText(c.designation, x + 6, y + 3);
    }

  }, [candidates, selectedId, filter, heatmapData]);

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

  // 提交分类
  const submitClassification = () => {
    if (!selectedId || !classifying.motion || !classifying.orbit) return;

    const classification: Classification = {
      userId: 'current_user',
      userName: '你',
      motionType: classifying.motion,
      confidence: classifying.confidence,
      orbitType: classifying.orbit,
      timestamp: Date.now(),
    };

    setCandidates(prev => prev.map(c => {
      if (c.id !== selectedId) return c;
      const newClassifications = [...c.classifications, classification];
      const newStatus = newClassifications.length >= 3 ? 'classified' : 'pending';
      return { ...c, classifications: newClassifications, status: newStatus as AsteroidCandidate['status'] };
    }));

    // 模拟其他用户分类
    setTimeout(() => {
      const simUser = SIMULATED_USERS[Math.floor(Math.random() * SIMULATED_USERS.length)];
      const simClassification: Classification = {
        userId: simUser.id,
        userName: simUser.name,
        motionType: selected ? (selected.motion_dir === 'prograde' ? '顺行' : '逆行') : '不确定',
        confidence: 60 + Math.floor(Math.random() * 30),
        orbitType: (selected?.eccentricity ?? 0) > 0.5 ? '近地小行星 (NEA)' : '主带小行星 (MBA)',
        timestamp: Date.now(),
      };
      setCandidates(prev => prev.map(c => {
        if (c.id !== selectedId) return c;
        const newClassifications = [...c.classifications, simClassification];
        const newStatus = newClassifications.length >= 3 ? 'classified' : 'pending';
        return { ...c, classifications: newClassifications, status: newStatus as AsteroidCandidate['status'] };
      }));
    }, 1500);

    setUserClassifications(prev => prev + 1);
    setUserScore(prev => prev + Math.floor(classifying.confidence / 10) + 10);
    setClassifying({ motion: '', orbit: '', confidence: 50 });
  };

  const stats = {
    total: candidates.length,
    unclassified: candidates.filter(c => c.status === 'unclassified').length,
    pending: candidates.filter(c => c.status === 'pending').length,
    classified: candidates.filter(c => c.status === 'classified').length,
  };

  return (
    <div className="fixed inset-0 lg:inset-auto lg:absolute lg:top-14 lg:left-3 lg:w-[520px] lg:max-h-[85vh] z-30 pointer-events-auto flex flex-col bg-[#1e293b]/98 lg:bg-[#1e293b]/95 backdrop-blur-md lg:border lg:border-[#334155] lg:rounded-lg shadow-2xl overflow-y-auto">
      {/* 移动端关闭栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 lg:hidden bg-slate-900 shrink-0">
        <span className="text-sm font-medium text-cyan-400">小行星发现与分类</span>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 text-white text-xl font-bold shadow-lg">✕</button>
      </div>
      <div className="sticky top-0 z-10 hidden lg:flex items-center justify-between px-4 py-3 bg-[#1e293b] border-b border-[#334155]">
        <h2 className="text-sm font-semibold text-[#f1f5f9]">小行星发现与分类 公众科学模块</h2>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white text-lg transition-colors">&times;</button>
      </div>

      {/* 统计栏 */}
      <div className="grid grid-cols-4 gap-1 px-3 pt-3">
        {[
          { label: '总计', val: stats.total, color: '#e2e8f0' },
          { label: '未分类', val: stats.unclassified, color: '#f59e0b' },
          { label: '审核中', val: stats.pending, color: '#3b82f6' },
          { label: '已分类', val: stats.classified, color: '#10b981' },
        ].map(s => (
          <div key={s.label} className="bg-[#0f172a] rounded-md p-2 text-center">
            <div className="text-sm font-mono font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-[9px] text-[#64748b]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 天区图 */}
      <div className="relative mx-3 mt-3 rounded-md overflow-hidden border border-[#334155]" style={{ height: 240 }}>
        <canvas ref={canvasRef} className="w-full h-full" style={{ width: '100%', height: '100%' }} />
        <div className="absolute top-1 left-1 text-[8px] text-[#64748b]">赤经 →</div>
        <div className="absolute top-1 right-1 flex gap-1">
          {(['all', 'unclassified', 'pending', 'classified'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-1.5 py-0.5 text-[8px] rounded ${filter === f ? 'bg-[#06b6d4] text-white' : 'bg-[#0f172a]/80 text-[#94a3b8]'}`}>
              {f === 'all' ? '全部' : f === 'unclassified' ? '未分类' : f === 'pending' ? '审核中' : '已分类'}
            </button>
          ))}
        </div>
        {/* 热力图图例 */}
        <div className="absolute bottom-1 right-1 flex items-center gap-1 text-[8px] text-[#94a3b8]">
          <span>全球标注热度:</span>
          <div className="w-16 h-2 rounded-full" style={{ background: 'linear-gradient(to right, rgba(249,115,22,0), rgba(249,115,22,0.5))' }} />
        </div>
      </div>

      {/* 候选体列表 */}
      <div className="mx-3 mt-3 bg-[#0f172a] rounded-md overflow-hidden">
        <div className="px-3 py-2 text-xs font-semibold text-[#f59e0b] border-b border-[#334155]">待分类候选体</div>
        <div className="max-h-40 overflow-y-auto">
          {candidates.filter(c => filter === 'all' || c.status === filter).map(c => (
            <div key={c.id}
              className={`px-3 py-2 border-b border-[#1e293b] cursor-pointer hover:bg-[#1e293b] ${selectedId === c.id ? 'bg-[#06b6d4]/10' : ''}`}
              onClick={() => setSelectedId(c.id)}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${c.status === 'unclassified' ? 'bg-[#f59e0b]' : c.status === 'pending' ? 'bg-[#3b82f6]' : 'bg-[#10b981]'}`} />
                <span className="text-[11px] text-[#e2e8f0] font-medium">{c.designation}</span>
                <span className="text-[9px] text-[#64748b] font-mono">{c.id}</span>
                <span className="text-[9px] text-[#64748b] ml-auto">m={c.magnitude}</span>
              </div>
              <div className="flex gap-3 mt-0.5 text-[9px] text-[#94a3b8]">
                <span>α {c.ra.toFixed(1)}°</span>
                <span>δ {c.dec.toFixed(1)}°</span>
                <span>{c.motion_dir === 'prograde' ? '顺行' : '逆行'} {c.motion_rate.toFixed(2)}"/min</span>
                <span>e={c.eccentricity.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 分类表单 */}
      {selected && (
        <div className="mx-3 mt-3 bg-[#0f172a] rounded-md p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#f1f5f9]">分类: {selected.designation}</span>
            <span className="text-[9px] text-[#64748b]">{selected.notes}</span>
          </div>

          {/* 观测数据 */}
          <div className="grid grid-cols-4 gap-1">
            {[
              { label: '偏心率', val: selected.eccentricity.toFixed(3) },
              { label: '半长轴', val: selected.semi_major.toFixed(2) + ' AU' },
              { label: '倾角', val: selected.inclination.toFixed(1) + '°' },
              { label: '星等', val: selected.magnitude.toFixed(1) },
            ].map(d => (
              <div key={d.label} className="bg-[#1e293b] rounded px-2 py-1 text-center">
                <div className="text-[8px] text-[#64748b]">{d.label}</div>
                <div className="text-[10px] text-[#06b6d4] font-mono">{d.val}</div>
              </div>
            ))}
          </div>

          {/* 分类选择 */}
          <div className="space-y-2">
            <div>
              <div className="text-[9px] text-[#64748b] mb-1">运动方向</div>
              <div className="flex gap-1">
                {MOTION_TYPES.map(m => (
                  <button key={m} onClick={() => setClassifying(prev => ({ ...prev, motion: m }))}
                    className={`flex-1 px-2 py-1 text-[10px] rounded ${classifying.motion === m ? 'bg-[#06b6d4] text-white' : 'bg-[#334155] text-[#94a3b8]'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-[#64748b] mb-1">轨道类型</div>
              <div className="flex flex-wrap gap-1">
                {ORBIT_TYPES.map(o => (
                  <button key={o} onClick={() => setClassifying(prev => ({ ...prev, orbit: o }))}
                    className={`px-2 py-0.5 text-[9px] rounded ${classifying.orbit === o ? 'bg-[#06b6d4] text-white' : 'bg-[#334155] text-[#94a3b8]'}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-[#64748b]">置信度</span>
                <span className="text-[10px] text-[#94a3b8] font-mono">{classifying.confidence}%</span>
              </div>
              <input type="range" min="10" max="100" value={classifying.confidence}
                onChange={e => setClassifying(prev => ({ ...prev, confidence: Number(e.target.value) }))}
                className="w-full h-1 accent-[#06b6d4]" />
            </div>
          </div>

          <button onClick={submitClassification}
            disabled={!classifying.motion || !classifying.orbit}
            className="w-full py-2 text-xs bg-[#06b6d4] text-white rounded-md hover:bg-[#0891b2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            提交分类
          </button>

          {/* 已有分类 */}
          {selected.classifications.length > 0 && (
            <div className="space-y-1">
              <div className="text-[9px] text-[#64748b]">已有分类 ({selected.classifications.length})</div>
              {selected.classifications.map((cl, i) => (
                <div key={i} className="flex items-center gap-2 text-[9px]">
                  <span className="text-[#e2e8f0]">{cl.userName}</span>
                  <span className="text-[#94a3b8]">{cl.orbitType}</span>
                  <span className="text-[#94a3b8]">{cl.motionType}</span>
                  <span className="text-[#06b6d4] font-mono ml-auto">{cl.confidence}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 贡献排行榜 */}
      <div className="mx-3 mt-3 mb-3 bg-[#0f172a] rounded-md overflow-hidden">
        <div className="px-3 py-2 text-xs font-semibold text-[#f59e0b] border-b border-[#334155]">
          贡献度排行榜
        </div>
        <div className="p-2 space-y-1">
          {[
            ...SIMULATED_USERS,
            { id: 'current', name: '你', score: userScore },
          ]
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map((u, i) => (
              <div key={u.id} className={`flex items-center gap-2 px-2 py-1 rounded ${u.id === 'current' ? 'bg-[#06b6d4]/10' : ''}`}>
                <span className={`text-[10px] font-bold w-4 ${i === 0 ? 'text-[#fbbf24]' : i === 1 ? 'text-[#94a3b8]' : i === 2 ? 'text-[#f97316]' : 'text-[#64748b]'}`}>
                  {i + 1}
                </span>
                <span className={`text-[11px] ${u.id === 'current' ? 'text-[#06b6d4] font-semibold' : 'text-[#e2e8f0]'}`}>
                  {u.name}
                </span>
                <span className="text-[10px] text-[#94a3b8] font-mono ml-auto">{u.score} 分</span>
              </div>
            ))}
        </div>
        <div className="px-3 py-2 border-t border-[#334155] text-[9px] text-[#64748b]">
          优质标注数据可纳入正式天文数据库 (MPC小行星目录)，并署用户ID
          | 你的分类数: {userClassifications}
        </div>
      </div>

      {/* 跨模块关联操作 */}
      <div className="border-t border-slate-700/50 bg-slate-900/80 px-3 py-2">
        <div className="mb-1.5 text-[10px] text-slate-500">小行星发现 → 关联模块</div>
        <div className="flex flex-wrap gap-1.5">
          <CrossModuleLink signal="assess-neo-risk" label="NEO风险评估" payload={{ fromAsteroid: true }} />
          <CrossModuleLink signal="compare-gravity" label="引力场分析" payload={{ fromAsteroid: true }} />
          <CrossModuleLink signal="plan-orbit" label="轨道规划" payload={{ fromAsteroid: true }} />
          <CrossModuleLink signal="plan-mining" label="资源勘探" payload={{ fromAsteroid: true }} />
          <CrossModuleLink signal="build-twin" label="构建孪生体" payload={{ fromAsteroid: true }} />
        </div>
      </div>
    </div>
  );
}
