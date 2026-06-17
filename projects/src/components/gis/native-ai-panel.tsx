'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { type CelestialBody, type HubSignal } from '@/lib/skygis-hub';
import CrossModuleLink from './cross-module-link';

/* ───────────── Types ───────────── */
interface Crater {
  id: string;
  name: string;
  body: string;
  lat: number;
  lon: number;
  diameter: number;
  depth: number;
  rimCondition: 'sharp' | 'moderate' | 'degraded';
  age: string;
  confidence: number;
  x: number;
  y: number;
}

interface SceneTemplate {
  id: string;
  name: string;
  description: string;
  year: number;
  bodies: string[];
  cameraTarget: string;
}

/* ───────────── Static Data ───────────── */
const DETECTED_CRATERS: Crater[] = [
  { id: 'c1', name: 'CR-001', body: '火星', lat: 18.4, lon: 77.5, diameter: 45.0, depth: 0.8, rimCondition: 'moderate', age: '亚马逊纪(1-3Ga)', confidence: 0.94, x: 180, y: 90 },
  { id: 'c2', name: 'CR-002', body: '火星', lat: -14.6, lon: 175.5, diameter: 150.0, depth: 1.2, rimCondition: 'degraded', age: '诺亚纪(>3.7Ga)', confidence: 0.89, x: 290, y: 130 },
  { id: 'c3', name: 'CR-003', body: '火星', lat: 5.2, lon: 120.0, diameter: 12.0, depth: 0.3, rimCondition: 'sharp', age: '亚马逊纪(<1Ga)', confidence: 0.97, x: 220, y: 105 },
  { id: 'c4', name: 'CR-004', body: '火星', lat: -25.0, lon: 60.0, diameter: 85.0, depth: 1.5, rimCondition: 'moderate', age: '西方纪(3-3.7Ga)', confidence: 0.91, x: 145, y: 140 },
  { id: 'c5', name: 'CR-005', body: '火星', lat: 43.0, lon: 110.0, diameter: 200.0, depth: 2.1, rimCondition: 'degraded', age: '诺亚纪(>3.7Ga)', confidence: 0.85, x: 245, y: 60 },
  { id: 'c6', name: 'CR-006', body: '月球', lat: -16.5, lon: 35.0, diameter: 80.0, depth: 3.5, rimCondition: 'moderate', age: '雨海纪(3.2-3.8Ga)', confidence: 0.93, x: 150, y: 125 },
  { id: 'c7', name: 'CR-007', body: '月球', lat: 8.5, lon: -30.0, diameter: 35.0, depth: 1.8, rimCondition: 'sharp', age: '哥白尼纪(<1.1Ga)', confidence: 0.96, x: 110, y: 95 },
  { id: 'c8', name: 'CR-008', body: '月球', lat: -89.7, lon: 0, diameter: 21.0, depth: 4.2, rimCondition: 'moderate', age: '前酒海纪(>4.1Ga)', confidence: 0.88, x: 200, y: 175 },
  { id: 'c9', name: 'CR-009', body: '月球', lat: 25.5, lon: -47.5, diameter: 40.0, depth: 2.8, rimCondition: 'sharp', age: '埃拉托斯特尼纪(1.1-3.2Ga)', confidence: 0.95, x: 90, y: 80 },
  { id: 'c10', name: 'CR-010', body: '月球', lat: 1.0, lon: 31.4, diameter: 15.0, depth: 0.6, rimCondition: 'degraded', age: '前酒海纪(>4.1Ga)', confidence: 0.82, x: 185, y: 100 },
];

const SCENE_TEMPLATES: SceneTemplate[] = [
  { id: 's1', name: '2030年木星冲日', description: '木星与太阳相对地球呈180°，最佳观测窗口', year: 2030, bodies: ['地球', '木星', '太阳'], cameraTarget: '木星' },
  { id: 's2', name: '2028年火星大冲', description: '火星距离地球最近，约5500万公里', year: 2028, bodies: ['地球', '火星', '太阳'], cameraTarget: '火星' },
  { id: 's3', name: '2061年哈雷彗星回归', description: '哈雷彗星近日点，上次为1986年', year: 2061, bodies: ['太阳', '地球', '哈雷彗星'], cameraTarget: '哈雷彗星' },
  { id: 's4', name: '土星环最大倾斜', description: '土星环相对地球倾斜角度最大，壮观景观', year: 2032, bodies: ['地球', '土星', '太阳'], cameraTarget: '土星' },
  { id: 's5', name: '金星凌日2049', description: '金星从地球视角横越太阳圆面', year: 2049, bodies: ['太阳', '金星', '地球'], cameraTarget: '金星' },
];

/* ───────────── Component ───────────── */
interface Props {
  onClose: () => void;
  focusedBody?: CelestialBody | null;
  onNavigate?: (signal: Omit<HubSignal, 'timestamp'>) => void;
}

export default function NativeAiPanel({ onClose, focusedBody, onNavigate }: Props) {
  const [tab, setTab] = useState<'crater' | 'scene'>('crater');
  const [detectBody, setDetectBody] = useState('火星');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [craters, setCraters] = useState<Crater[]>([]);
  const [selectedCrater, setSelectedCrater] = useState<Crater | null>(null);
  const craterCanvasRef = useRef<HTMLCanvasElement>(null);

  const [selectedScene, setSelectedScene] = useState<SceneTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [sceneGenerated, setSceneGenerated] = useState(false);
  const sceneCanvasRef = useRef<HTMLCanvasElement>(null);
  const sceneAnimRef = useRef<number>(0);

  // Crater detection
  const runDetection = useCallback(() => {
    setIsDetecting(true);
    setDetectionProgress(0);
    const steps = [
      { pct: 15, msg: '加载遥感影像...' },
      { pct: 35, msg: 'VARnet模型推理...' },
      { pct: 55, msg: '边缘提取与特征匹配...' },
      { pct: 75, msg: '年代分类(退化/中度/清晰)...' },
      { pct: 90, msg: '关联数字孪生体...' },
      { pct: 100, msg: '识别完成!' },
    ];
    let i = 0;
    const iv = setInterval(() => {
      i++;
      if (i < steps.length) setDetectionProgress(steps[i].pct);
      else {
        clearInterval(iv);
        setIsDetecting(false);
        const filtered = DETECTED_CRATERS.filter(c => c.body === detectBody);
        setCraters(filtered);
        // Render crater annotations on canvas
        setTimeout(() => renderCraterCanvas(filtered), 50);
      }
    }, 350);
  }, [detectBody]);

  const renderCraterCanvas = useCallback((detectedCraters: Crater[]) => {
    const canvas = craterCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;

    // Background surface
    const bodyColors: Record<string, string> = { '火星': '#8b4513', '月球': '#6b6b6b' };
    ctx.fillStyle = bodyColors[detectBody] || '#6b6b6b';
    ctx.fillRect(0, 0, w, h);

    // Surface noise
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const alpha = 0.05 + Math.random() * 0.1;
      ctx.fillStyle = `rgba(0,0,0,${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw craters
    detectedCraters.forEach(crater => {
      const cx = crater.x * (w / 400);
      const cy = crater.y * (h / 200);
      const r = Math.max(8, Math.min(40, crater.diameter * 0.2));

      // Crater shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.arc(cx + 2, cy + 2, r, 0, Math.PI * 2);
      ctx.fill();

      // Crater depression
      const grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 0, cx, cy, r);
      grad.addColorStop(0, 'rgba(0,0,0,0.4)');
      grad.addColorStop(0.7, 'rgba(0,0,0,0.1)');
      grad.addColorStop(1, 'rgba(255,255,255,0.15)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Rim
      const rimColors: Record<string, string> = {
        sharp: 'rgba(255,255,255,0.6)',
        moderate: 'rgba(255,255,255,0.3)',
        degraded: 'rgba(255,255,255,0.1)',
      };
      ctx.strokeStyle = rimColors[crater.rimCondition];
      ctx.lineWidth = crater.rimCondition === 'sharp' ? 1.5 : 0.8;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Label
      ctx.fillStyle = 'rgba(6,182,212,0.8)';
      ctx.font = '9px monospace';
      ctx.fillText(crater.name, cx + r + 3, cy + 3);
    });

    // Legend
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(w - 110, 5, 105, 55);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('边缘状况:', w - 105, 18);
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillText('● 清晰(sharp)', w - 105, 30);
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillText('● 中度(moderate)', w - 105, 42);
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillText('● 退化(degraded)', w - 105, 54);
  }, [detectBody]);

  // Generate 3D scene
  const generateScene = useCallback((scene: SceneTemplate) => {
    setSelectedScene(scene);
    setIsGenerating(true);
    setGenProgress(0);
    setSceneGenerated(false);

    let pct = 0;
    const iv = setInterval(() => {
      pct += 8;
      if (pct >= 100) {
        clearInterval(iv);
        setIsGenerating(false);
        setSceneGenerated(true);
      }
      setGenProgress(Math.min(100, pct));
    }, 200);
  }, []);

  // Scene animation
  useEffect(() => {
    if (!sceneGenerated || !selectedScene) return;
    const canvas = sceneCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;

    const animate = () => {
      const t = Date.now() * 0.001;
      ctx.fillStyle = '#050810';
      ctx.fillRect(0, 0, w, h);

      // Stars
      for (let i = 0; i < 100; i++) {
        const sx = (i * 37.7 + t * 0.1) % w;
        const sy = (i * 53.1) % h;
        ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(i + t) * 0.2})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sun
      const sg = ctx.createRadialGradient(w * 0.2, h * 0.5, 0, w * 0.2, h * 0.5, 25);
      sg.addColorStop(0, 'rgba(255, 220, 80, 1)');
      sg.addColorStop(0.5, 'rgba(255, 160, 40, 0.4)');
      sg.addColorStop(1, 'rgba(255, 100, 20, 0)');
      ctx.fillStyle = sg;
      ctx.fillRect(w * 0.2 - 30, h * 0.5 - 30, 60, 60);

      // Orbit circles
      const orbits = [0.3, 0.45, 0.6, 0.78];
      orbits.forEach((r, idx) => {
        ctx.strokeStyle = `rgba(100,116,139,${0.15 + idx * 0.03})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.ellipse(w * 0.35, h * 0.5, r * w * 0.5, r * h * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Target body
      const targetIdx = selectedScene.bodies.length - 1;
      const tx = w * 0.35 + Math.cos(t * 0.3) * orbits[targetIdx % orbits.length] * w * 0.5;
      const ty = h * 0.5 + Math.sin(t * 0.3) * orbits[targetIdx % orbits.length] * h * 0.3;

      const bodyColors: Record<string, string> = {
        '地球': '#06b6d4', '火星': '#ef4444', '木星': '#f59e0b', '土星': '#eab308',
        '金星': '#fbbf24', '哈雷彗星': '#a78bfa',
      };
      const color = bodyColors[selectedScene.cameraTarget] || '#94a3b8';

      // Glow
      const tg = ctx.createRadialGradient(tx, ty, 0, tx, ty, 20);
      tg.addColorStop(0, color);
      tg.addColorStop(0.5, `${color}40`);
      tg.addColorStop(1, `${color}00`);
      ctx.fillStyle = tg;
      ctx.beginPath();
      ctx.arc(tx, ty, 20, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(tx, ty, 8, 0, Math.PI * 2);
      ctx.fill();

      // Saturn ring
      if (selectedScene.cameraTarget === '土星') {
        ctx.strokeStyle = `${color}80`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(tx, ty, 16, 4, -0.2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Comet tail
      if (selectedScene.cameraTarget === '哈雷彗星') {
        ctx.strokeStyle = `${color}60`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + 40, ty - 15);
        ctx.stroke();
        ctx.strokeStyle = `${color}30`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + 50, ty - 20);
        ctx.stroke();
      }

      // Earth
      const ex = w * 0.35 + Math.cos(t * 0.3 + 1) * orbits[0] * w * 0.5;
      const ey = h * 0.5 + Math.sin(t * 0.3 + 1) * orbits[0] * h * 0.3;
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(ex, ey, 4, 0, Math.PI * 2);
      ctx.fill();

      // Labels
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '9px monospace';
      ctx.fillText(selectedScene.cameraTarget, tx + 12, ty - 10);
      ctx.fillText('地球', ex + 8, ey - 6);

      // Year label
      ctx.fillStyle = 'rgba(6,182,212,0.8)';
      ctx.font = '12px monospace';
      ctx.fillText(`${selectedScene.year}年`, 8, 18);

      sceneAnimRef.current = requestAnimationFrame(animate);
    };

    sceneAnimRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(sceneAnimRef.current);
  }, [sceneGenerated, selectedScene]);

  const rimLabel = (r: string) => r === 'sharp' ? '清晰' : r === 'moderate' ? '中度' : '退化';
  const rimColor = (r: string) => r === 'sharp' ? 'text-emerald-400' : r === 'moderate' ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="fixed inset-0 lg:inset-auto lg:absolute lg:top-14 lg:right-3 lg:w-[440px] lg:max-h-[85vh] z-30 flex flex-col bg-slate-900/98 lg:bg-slate-900/95 backdrop-blur-md lg:border lg:border-slate-700/50 lg:rounded-xl shadow-2xl overflow-y-auto">
      {/* 移动端关闭栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 lg:hidden bg-slate-900 shrink-0">
        <span className="text-sm font-medium text-cyan-400">原生AI模块</span>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 text-white text-xl font-bold shadow-lg">✕</button>
      </div>
      <div className="sticky top-0 z-10 hidden lg:flex items-center justify-between px-4 py-3 bg-slate-900/98 border-b border-slate-700/50">
        <h2 className="text-sm font-bold text-cyan-400">原生AI模块</h2>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white text-lg transition-colors">✕</button>
      </div>

      <div className="flex border-b border-slate-700/50">
        {(['crater', 'scene'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-medium ${tab === t ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-300'}`}>
            {t === 'crater' ? '撞击坑识别' : '3D场景生成'}
          </button>
        ))}
      </div>

      <div className="p-3 space-y-3">
        {tab === 'crater' && (
          <>
            <div className="bg-slate-800/60 rounded-lg p-3 space-y-2">
              <h3 className="text-xs font-semibold text-slate-300">crater_detection_ai() 智能识别</h3>
              <div className="flex items-center gap-2">
                <select value={detectBody} onChange={e => setDetectBody(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200">
                  <option>火星</option><option>月球</option>
                </select>
                <button onClick={runDetection} disabled={isDetecting}
                  className="px-3 py-1.5 rounded text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white">
                  {isDetecting ? `推理中 ${detectionProgress}%` : '开始识别'}
                </button>
              </div>
              {isDetecting && (
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div className="bg-cyan-500 h-1.5 rounded-full transition-all" style={{ width: `${detectionProgress}%` }} />
                </div>
              )}
            </div>

            {/* Crater Canvas */}
            {craters.length > 0 && (
              <div className="bg-slate-800/60 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-slate-300 mb-2">crater_layer 标注图层</h3>
                <canvas ref={craterCanvasRef} width={416} height={200} className="w-full rounded-lg border border-slate-700/50" />
              </div>
            )}

            {/* Crater List */}
            {craters.length > 0 && (
              <div className="bg-slate-800/60 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-slate-300 mb-2">crater_annotations 标注结果 ({craters.length}个)</h3>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {craters.map(c => (
                    <div key={c.id}
                      onClick={() => setSelectedCrater(c)}
                      className={`p-2 rounded cursor-pointer transition-colors ${selectedCrater?.id === c.id ? 'bg-slate-700/80 border border-cyan-500/30' : 'bg-slate-800/40 hover:bg-slate-700/50'}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-200 font-medium">{c.name}</span>
                        <span className={`text-[10px] ${rimColor(c.rimCondition)}`}>{rimLabel(c.rimCondition)}</span>
                        <span className="text-[10px] text-slate-500 ml-auto">置信度 {c.confidence}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 mt-1 text-[10px] text-slate-500">
                        <span>Ø{c.diameter}km</span>
                        <span>深{c.depth}km</span>
                        <span>{c.age}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedCrater && (
              <div className="bg-slate-800/60 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-slate-300 mb-1">撞击坑详情</h3>
                <div className="text-[11px] text-slate-300 space-y-0.5">
                  <p>名称: {selectedCrater.name} | 坐标: ({selectedCrater.lat}°, {selectedCrater.lon}°)</p>
                  <p>直径: {selectedCrater.diameter}km | 深度: {selectedCrater.depth}km</p>
                  <p>边缘: <span className={rimColor(selectedCrater.rimCondition)}>{rimLabel(selectedCrater.rimCondition)}</span> | 年代: {selectedCrater.age}</p>
                  <p className="text-slate-500 text-[10px]">边缘退化程度与地质年代呈正相关: 清晰=年轻, 退化=古老</p>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'scene' && (
          <>
            <div className="bg-slate-800/60 rounded-lg p-3 space-y-2">
              <h3 className="text-xs font-semibold text-slate-300">generate_3d_scene() 场景生成</h3>
              <p className="text-[10px] text-slate-500">输入需求，解析时间与天体，生成交互式3D动画</p>
            </div>

            {/* Scene templates */}
            <div className="bg-slate-800/60 rounded-lg p-3">
              <h3 className="text-xs font-semibold text-slate-300 mb-2">scene_request 预设场景</h3>
              <div className="space-y-1.5">
                {SCENE_TEMPLATES.map(s => (
                  <div key={s.id}
                    onClick={() => generateScene(s)}
                    className={`p-2 rounded cursor-pointer transition-colors ${selectedScene?.id === s.id ? 'bg-cyan-900/30 border border-cyan-500/30' : 'bg-slate-800/40 hover:bg-slate-700/50'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-200 font-medium">{s.name}</span>
                      <span className="text-[10px] text-cyan-400 ml-auto">{s.year}年</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{s.description}</p>
                    <div className="flex gap-1 mt-1">
                      {s.bodies.map(b => (
                        <span key={b} className="text-[9px] px-1.5 py-0.5 bg-slate-700/80 text-slate-400 rounded">{b}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Generation progress */}
            {isGenerating && (
              <div className="bg-slate-800/60 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-slate-300 mb-2">生成进度</h3>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div className="bg-cyan-500 h-1.5 rounded-full transition-all" style={{ width: `${genProgress}%` }} />
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {genProgress < 30 ? '解析需求...' : genProgress < 60 ? '调取天体位置数据...' : genProgress < 90 ? '渲染场景...' : '完成!'}
                </div>
              </div>
            )}

            {/* Scene Canvas */}
            {sceneGenerated && selectedScene && (
              <div className="bg-slate-800/60 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-slate-300 mb-2">interactive_scene 交互式场景</h3>
                <canvas ref={sceneCanvasRef} width={416} height={220} className="w-full rounded-lg border border-slate-700/50" />
                <div className="mt-2 text-[11px] text-slate-400">
                  <p>场景: {selectedScene.name}</p>
                  <p>时间: {selectedScene.year}年 | 目标: {selectedScene.cameraTarget}</p>
                </div>
                <div className="mt-1.5 p-1.5 bg-slate-900/60 rounded border border-slate-700/50 text-[10px] text-cyan-400 font-mono">
                  scene_params: {'{'}
                  year: {selectedScene.year}, target: &quot;{selectedScene.cameraTarget}&quot;,
                  bodies: [{selectedScene.bodies.join(', ')}]
                  {'}'}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 跨模块关联操作 */}
      <div className="border-t border-slate-700/50 bg-slate-900/80 px-3 py-2">
        <div className="mb-1.5 text-[10px] text-slate-500">原生AI → 关联模块</div>
        <div className="flex flex-wrap gap-1.5">
          <CrossModuleLink signal="view-geological" label="地质演化" payload={{ fromCrater: true }} />
          <CrossModuleLink signal="analyze-remote" label="遥感分析" payload={{ fromCrater: true }} />
          <CrossModuleLink signal="select-landing" label="着陆选址" payload={{ fromCrater: true }} />
          <CrossModuleLink signal="query-spatial" label="空间查询" payload={{ fromCrater: true }} />
          <CrossModuleLink signal="build-twin" label="构建孪生体" payload={{ fromCrater: true }} />
        </div>
      </div>
    </div>
  );
}
