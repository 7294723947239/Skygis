'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { SmartCommandResult as HubSmartCommandResult, HubSignalType, SkyGISPanelId } from '@/lib/skygis-hub';

interface SmartResult {
  success: boolean;
  command: string;
  interpretation: string;
  focusedBody: string | null;
  panelsToOpen: string[];
  steps: {
    moduleId: string;
    moduleName: string;
    success: boolean;
    title: string;
    summary: string;
    data: Record<string, unknown>;
    visual?: string;
  }[];
  summary: string;
  actions: { signal: HubSignalType; label: string; payload?: Record<string, unknown> }[];
}

interface Props {
  onResult?: (result: SmartResult | null) => void;
  onFocusBody?: (bodyName: string) => void;
  onOpenPanel?: (panelId: SkyGISPanelId) => void;
}

const QUICK_COMMANDS = [
  { icon: '🚀', label: '去火星', command: '规划从地球到火星的航行任务，包括轨道规划、着陆选址和资源勘探' },
  { icon: '🌙', label: '月球基地', command: '分析月球建立基地的可行性，包括着陆选址、资源勘探（氦-3）和地质条件' },
  { icon: '☄️', label: '小行星防御', command: '评估近地小行星碰撞风险，识别危险天体并分析撞击坑特征' },
  { icon: '🪐', label: '木星系统', command: '分析木星及其卫星系统，计算引力场，评估欧罗巴着陆可行性' },
  { icon: '⏳', label: '太阳系起源', command: '推演38亿年前太阳系场景，分析月球和火星地质演化' },
  { icon: '📡', label: '火星水源', command: '利用多波段遥感分析火星水冰分布，结合撞击坑识别和地质分析' },
];

export default function SmartCommandBar({ onResult, onFocusBody, onOpenPanel }: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartResult | null>(null);
  const [showQuick, setShowQuick] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl+K 快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setShowQuick(true);
      }
      if (e.key === 'Escape') {
        setShowQuick(false);
        setShowResult(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const executeCommand = useCallback(async (cmd: string) => {
    if (!cmd.trim()) return;
    setLoading(true);
    setResult(null);
    setShowQuick(false);
    try {
      const res = await fetch('/api/smart-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        setShowResult(true);
        onResult?.(data);
        if (data.focusedBody) onFocusBody?.(data.focusedBody);
        if (data.panelsToOpen?.length) {
          data.panelsToOpen.forEach((p: string) => onOpenPanel?.(p as SkyGISPanelId));
        }
      }
    } catch (err) {
      console.error('Smart command failed:', err);
    } finally {
      setLoading(false);
    }
  }, [onResult, onFocusBody, onOpenPanel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(input);
    setInput('');
  };

  return (
    <>
      {/* ===== 输入栏 ===== */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 w-[calc(100vw-24px)] lg:w-[560px] max-w-[95vw]">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center bg-slate-800/90 backdrop-blur-md border border-slate-600/50 rounded-xl shadow-2xl overflow-hidden">
            <div className="pl-4 text-cyan-400 text-lg">⌘</div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onFocus={() => setShowQuick(true)}
              placeholder="输入指令，联动全系统分析... (Ctrl+K)"
              className="flex-1 bg-transparent px-3 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              disabled={loading}
            />
            {loading && (
              <div className="pr-3 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-cyan-400">分析中</span>
              </div>
            )}
            {!loading && input && (
              <button type="submit" className="px-4 py-2 mr-1 text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors">
                执行
              </button>
            )}
          </div>
        </form>

        {/* ===== 快捷指令 ===== */}
        {showQuick && !loading && !result && (
          <div className="mt-1 bg-slate-800/95 backdrop-blur-md border border-slate-600/50 rounded-xl shadow-2xl p-3">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 px-1">快捷指令</div>
            <div className="grid grid-cols-3 gap-1.5">
              {QUICK_COMMANDS.map((q) => (
                <button
                  key={q.label}
                  onClick={() => { setInput(''); executeCommand(q.command); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/70 text-left transition-colors group"
                >
                  <span className="text-base">{q.icon}</span>
                  <span className="text-xs text-slate-300 group-hover:text-cyan-300">{q.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== 结果面板 ===== */}
      {showResult && result && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-24px)] lg:w-[640px] max-w-[95vw] max-h-[70vh] bg-slate-900/95 backdrop-blur-md border border-slate-600/50 rounded-xl shadow-2xl overflow-hidden flex flex-col">
          {/* 头部 */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400">⚡</span>
              <span className="text-sm font-semibold text-slate-100">智能分析结果</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-900/40 text-cyan-400 border border-cyan-700/30">
                {result.steps.length}个模块联动
              </span>
            </div>
            <button
              onClick={() => setShowResult(false)}
              className="text-slate-500 hover:text-slate-300 text-sm"
            >
              ✕
            </button>
          </div>

          {/* 意图解读 */}
          <div className="px-5 py-2.5 bg-slate-800/30 border-b border-slate-700/30">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">意图解读</div>
            <div className="text-xs text-slate-300 mt-0.5">{result.interpretation}</div>
          </div>

          {/* 可滚动区域 */}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
            {/* 模块执行步骤 */}
            {result.steps.map((step, i) => (
              <div key={i} className="border border-slate-700/40 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${step.success ? 'bg-emerald-900/50 text-emerald-400' : 'bg-rose-900/50 text-rose-400'}`}>
                      {step.success ? '✓' : '✕'}
                    </span>
                    <span className="text-xs font-medium text-slate-200">{step.title}</span>
                    <span className="text-[10px] text-slate-500">{step.moduleName}</span>
                  </div>
                  <span className="text-slate-500 text-xs">{expandedStep === i ? '▲' : '▼'}</span>
                </button>
                {expandedStep === i && (
                  <div className="px-4 py-3 bg-slate-800/20 space-y-2">
                    <p className="text-xs text-slate-300 leading-relaxed">{step.summary}</p>
                    {step.data && Object.keys(step.data).length > 0 && (
                      <div className="mt-2 p-2.5 bg-slate-900/50 rounded-lg border border-slate-700/30">
                        <div className="text-[10px] text-slate-500 mb-1.5">详细数据</div>
                        <pre className="text-[10px] text-cyan-300/80 whitespace-pre-wrap font-mono leading-relaxed">
                          {JSON.stringify(step.data, null, 2).slice(0, 800)}
                        </pre>
                      </div>
                    )}
                    {step.visual && (
                      <CanvasVisual type={step.visual} data={step.data} />
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* 综合总结 */}
            <div className="p-4 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-700/20 rounded-lg">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-cyan-400 text-sm">📋</span>
                <span className="text-xs font-semibold text-cyan-300">综合分析报告</span>
              </div>
              <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{result.summary}</div>
            </div>

            {/* 联动操作 */}
            {result.panelsToOpen.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] text-slate-500 self-center">打开面板:</span>
                {result.panelsToOpen.map((p) => (
                  <button
                    key={p}
                    onClick={() => onOpenPanel?.(p as SkyGISPanelId)}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-slate-700/50 text-slate-300 hover:bg-cyan-800/40 hover:text-cyan-300 border border-slate-600/30 hover:border-cyan-600/30 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ====== 简易Canvas可视化 ======
function CanvasVisual({ type, data }: { type: string; data: Record<string, unknown> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    switch (type) {
      case 'gravity_vectors': {
        // 两个天体 + 引力箭头
        const b1 = data.body1 as Record<string, unknown> | undefined;
        const b2 = data.body2 as Record<string, unknown> | undefined;
        const c1 = String(b1?.color || '#3b82f6');
        const c2 = String(b2?.color || '#d1d5db');
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, w, h);
        // Body 1
        ctx.beginPath(); ctx.arc(w * 0.3, h / 2, 20, 0, Math.PI * 2);
        ctx.fillStyle = c1; ctx.fill();
        ctx.font = '10px sans-serif'; ctx.fillStyle = '#e2e8f0'; ctx.textAlign = 'center';
        ctx.fillText(String(b1?.name || 'Body1'), w * 0.3, h / 2 + 35);
        // Body 2
        ctx.beginPath(); ctx.arc(w * 0.7, h / 2, 15, 0, Math.PI * 2);
        ctx.fillStyle = c2; ctx.fill();
        ctx.fillText(String(b2?.name || 'Body2'), w * 0.7, h / 2 + 30);
        // Arrows
        ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(w * 0.35, h / 2); ctx.lineTo(w * 0.65, h / 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w * 0.65, h / 2); ctx.lineTo(w * 0.35, h / 2); ctx.stroke();
        // Label
        ctx.fillStyle = '#06b6d4'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
        ctx.fillText(`F=${String(data.force ? Number(data.force).toExponential(2) : '?')}N`, w / 2, h / 2 - 10);
        break;
      }
      case 'orbit_transfer': {
        const from = data.from as Record<string, unknown> | undefined;
        const to = data.to as Record<string, unknown> | undefined;
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, w, h);
        // Sun
        ctx.beginPath(); ctx.arc(w / 2, h / 2, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24'; ctx.fill();
        ctx.font = '8px sans-serif'; ctx.fillStyle = '#e2e8f0'; ctx.textAlign = 'center';
        ctx.fillText('太阳', w / 2, h / 2 + 18);
        // Inner orbit
        const r1 = 35;
        ctx.strokeStyle = '#3b82f640'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(w / 2, h / 2, r1, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#3b82f6'; ctx.fillText(String(from?.name || '出发'), w / 2 + r1 + 12, h / 2);
        ctx.beginPath(); ctx.arc(w / 2 + r1, h / 2, 4, 0, Math.PI * 2); ctx.fill();
        // Outer orbit
        const r2 = 70;
        ctx.strokeStyle = '#ef444440'; ctx.beginPath(); ctx.arc(w / 2, h / 2, r2, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#ef4444'; ctx.fillText(String(to?.name || '目标'), w / 2 + r2 + 12, h / 2);
        ctx.beginPath(); ctx.arc(w / 2 + r2, h / 2, 3, 0, Math.PI * 2); ctx.fill();
        // Transfer ellipse
        ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
        ctx.beginPath();
        for (let a = 0; a <= Math.PI; a += 0.05) {
          const rr = (r1 * r2) / (r1 * Math.sin(a) ** 2 + r2 * Math.cos(a) ** 2);
          const x = w / 2 + rr * Math.cos(a + Math.PI);
          const y = h / 2 + rr * Math.sin(a + Math.PI);
          a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke(); ctx.setLineDash([]);
        // DeltaV
        ctx.fillStyle = '#06b6d4'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
        ctx.fillText(`Δv=${String(data.totalDeltaV ? (Number(data.totalDeltaV) / 1000).toFixed(1) : '?')}km/s`, w / 2, h - 10);
        break;
      }
      case 'landing_radar': {
        const sites = data.sites as Array<Record<string, number>> | undefined;
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, w, h);
        if (sites && sites.length > 0) {
          const top3 = sites.slice(0, 3);
          const metrics = ['安全', '资源', '科学'];
          const cx = w / 2; const cy = h / 2; const r = 50;
          // Axes
          for (let i = 0; i < 3; i++) {
            const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2;
            ctx.strokeStyle = '#334155'; ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(cx, cy);
            ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle)); ctx.stroke();
            ctx.fillStyle = '#64748b'; ctx.font = '8px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText(metrics[i], cx + (r + 12) * Math.cos(angle), cy + (r + 12) * Math.sin(angle));
          }
          // Polygons
          const colors = ['#06b6d4', '#f59e0b', '#10b981'];
          top3.forEach((site, si) => {
            ctx.strokeStyle = colors[si]; ctx.lineWidth = 1.5; ctx.beginPath();
            const vals = [site.safety || 0, site.resource || 0, site.science || 0];
            for (let i = 0; i < 3; i++) {
              const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2;
              const vr = (vals[i] / 100) * r;
              const x = cx + vr * Math.cos(angle);
              const y = cy + vr * Math.sin(angle);
              i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.closePath(); ctx.stroke();
            ctx.fillStyle = colors[si] + '20'; ctx.fill();
          });
          // Legend
          top3.forEach((site, si) => {
            ctx.fillStyle = colors[si]; ctx.font = '8px sans-serif'; ctx.textAlign = 'left';
            ctx.fillRect(8, 8 + si * 14, 8, 8);
            ctx.fillText(`#${si + 1} 综合${site.total || 0}分`, 20, 16 + si * 14);
          });
        }
        break;
      }
      default: {
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#64748b'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(type, w / 2, h / 2);
      }
    }
  }, [type, data]);

  return <canvas ref={canvasRef} width={280} height={160} className="rounded-lg border border-slate-700/30 mt-1" />;
}
