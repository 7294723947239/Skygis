'use client';

import { useState, useEffect, useMemo } from 'react';
import { CELESTIAL_ATMOSPHERES, MATERIAL_COMPOSITIONS, ATMOSPHERIC_EVENTS, getLayerThicknessAtTime, type AtmosphereLayer, type CelestialAtmosphere, type MaterialComposition, type AtmosphericEvent } from '@/lib/celestial-layers-data';
import type { CelestialBody, HubSignalType, SkyGISPanelId } from '@/lib/skygis-hub';

interface CelestialLayersPanelProps {
  onClose: () => void;
  focusedBody: CelestialBody | null;
  onNavigate: (signal: { type: HubSignalType; source?: SkyGISPanelId; target?: SkyGISPanelId; payload?: Record<string, unknown> }) => void;
  simTimeBillionYearsAgo?: number; // 模拟时间(亿年前)
}

const LAYER_TYPE_COLORS: Record<string, string> = {
  troposphere: 'bg-cyan-500',
  stratosphere: 'bg-blue-500',
  mesosphere: 'bg-indigo-500',
  thermosphere: 'bg-orange-500',
  exosphere: 'bg-purple-500',
  ionosphere: 'bg-green-500',
  magnetosphere: 'bg-violet-500',
  cloud: 'bg-white',
  dust: 'bg-amber-600',
  ice: 'bg-sky-200',
  ocean: 'bg-blue-600',
  volcanic: 'bg-red-600',
};

const LAYER_TYPE_LABELS: Record<string, string> = {
  troposphere: '对流层',
  stratosphere: '平流层',
  mesosphere: '中间层',
  thermosphere: '热层',
  exosphere: '散逸层',
  ionosphere: '电离层',
  magnetosphere: '磁层',
  cloud: '云层',
  dust: '尘埃层',
  ice: '冰层',
  ocean: '海洋层',
  volcanic: '火山层',
};

export default function CelestialLayersPanel({ onClose, focusedBody, onNavigate, simTimeBillionYearsAgo = 0 }: CelestialLayersPanelProps) {
  const [selectedBody, setSelectedBody] = useState<string>(focusedBody?.name || 'Earth');
  const [timeGya, setTimeGya] = useState(simTimeBillionYearsAgo);
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set(CELESTIAL_ATMOSPHERES.find(a => a.bodyName === 'Earth')?.layers.map(l => l.id) || []));
  const [showMaterials, setShowMaterials] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  // 同步聚焦天体
  useEffect(() => {
    if (focusedBody?.name) setSelectedBody(focusedBody.name);
  }, [focusedBody?.name]);

  const atmosphere = useMemo(() => CELESTIAL_ATMOSPHERES.find(a => a.bodyName === selectedBody), [selectedBody]);
  const materials = useMemo(() => MATERIAL_COMPOSITIONS.find(m => m.bodyName === selectedBody), [selectedBody]);
  const timelineEvents = useMemo(() => ATMOSPHERIC_EVENTS.filter(e => e.bodyName === selectedBody).sort((a, b) => {
    const pa = parseFloat(a.yearsAgo.replace(/[^0-9.]/g, ''));
    const pb = parseFloat(b.yearsAgo.replace(/[^0-9.]/g, ''));
    return pb - pa;
  }), [selectedBody]);

  const toggleLayer = (layerId: string) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      if (next.has(layerId)) next.delete(layerId); else next.add(layerId);
      return next;
    });
  };

  const getTimeFactor = (layer: AtmosphereLayer): number => getLayerThicknessAtTime(layer, timeGya);

  const allBodies = CELESTIAL_ATMOSPHERES.map(a => ({ name: a.bodyName, nameCn: a.bodyNameCn, type: a.bodyType }));

  return (
    <div className="fixed inset-0 lg:inset-auto lg:absolute lg:top-14 lg:right-3 lg:w-[520px] lg:max-h-[85vh] z-50 flex flex-col bg-slate-900/98 lg:bg-slate-900/95 backdrop-blur-md lg:border lg:border-slate-700/50 lg:rounded-xl shadow-2xl overflow-y-auto">
      {/* 移动端关闭栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 lg:hidden bg-slate-900 shrink-0">
        <span className="text-sm font-medium text-cyan-400">🌍 天体大气层与物质分析</span>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 text-white text-xl font-bold shadow-lg">✕</button>
      </div>
      {/* Header */}
      <div className="sticky top-0 z-10 hidden lg:flex items-center justify-between border-b border-slate-700/50 bg-slate-900/98 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌍</span>
          <span className="text-sm font-semibold text-cyan-400">天体大气层与物质分析</span>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white text-lg transition-colors">&times;</button>
      </div>

      <div className="p-4 space-y-4">
        {/* 天体选择 */}
        <div>
          <div className="text-xs text-slate-500 mb-2">选择天体</div>
          <div className="flex flex-wrap gap-1.5">
            {allBodies.map(b => (
              <button key={b.name} onClick={() => setSelectedBody(b.name)}
                className={`rounded-full px-2.5 py-1 text-xs transition-colors ${selectedBody === b.name ? 'bg-cyan-900/80 text-cyan-400 ring-1 ring-cyan-500/50' : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700/80'}`}>
                {b.nameCn}
              </button>
            ))}
          </div>
        </div>

        {/* 时间滑块 - 大气演化 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">时间回溯 (大气演化)</span>
            <span className="text-xs font-mono text-amber-400">{timeGya === 0 ? '现在' : `${timeGya}亿年前`}</span>
          </div>
          <input type="range" min="0" max="46" step="0.5" value={timeGya}
            onChange={e => setTimeGya(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-slate-700 cursor-pointer accent-cyan-500" />
          <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
            <span>现在</span><span>46亿年前</span>
          </div>
        </div>

        {/* 大气层总览 */}
        {atmosphere && (
          <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-cyan-400">{atmosphere.bodyNameCn} {atmosphere.bodyName}</span>
              <span className="text-[10px] text-slate-500 rounded bg-slate-700/50 px-1.5 py-0.5">{atmosphere.bodyType}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
              {atmosphere.surfacePressure && <div><span className="text-slate-500">表面气压</span><br/><span className="text-cyan-400">{atmosphere.surfacePressure}</span></div>}
              <div><span className="text-slate-500">大气总高</span><br/><span className="text-cyan-400">{atmosphere.totalAtmosphereHeight.toLocaleString()} km</span></div>
              {atmosphere.greenhouseEffect && <div className="col-span-2"><span className="text-slate-500">温室效应</span><br/><span className="text-amber-400">{atmosphere.greenhouseEffect}</span></div>}
              {atmosphere.magneticField && <div className="col-span-2"><span className="text-slate-500">磁场</span><br/><span className="text-violet-400">{atmosphere.magneticField}</span></div>}
            </div>
            {atmosphere.timeEvolutionNote && (
              <div className="text-xs text-amber-400/80 bg-amber-950/20 rounded p-2 mt-1 border border-amber-900/30">
                {atmosphere.timeEvolutionNote}
              </div>
            )}
          </div>
        )}

        {/* 大气层列表 + 可视化 */}
        {atmosphere && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">大气层结构 ({atmosphere.layers.length}层)</span>
              <div className="flex gap-1">
                <button onClick={() => setActiveLayers(new Set(atmosphere.layers.map(l => l.id)))} className="text-[10px] text-cyan-400 hover:text-cyan-300">全选</button>
                <button onClick={() => setActiveLayers(new Set())} className="text-[10px] text-slate-500 hover:text-slate-300">清除</button>
              </div>
            </div>

            {/* 大气层结构可视化(柱状图) */}
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3 mb-3">
              <div className="flex items-end gap-0.5 h-32 justify-center">
                {atmosphere.layers.map(layer => {
                  const timeFactor = getTimeFactor(layer);
                  const height = Math.max(4, layer.thicknessRatio * 3000 * timeFactor * (activeLayers.has(layer.id) ? 1 : 0.2));
                  return (
                    <div key={layer.id} className="flex flex-col items-center gap-0.5 cursor-pointer" onClick={() => toggleLayer(layer.id)}
                      title={`${layer.nameCn}: ${layer.thicknessKm}km × ${timeFactor.toFixed(2)}`}>
                      <div className="text-[8px] text-slate-500 truncate w-8 text-center">{layer.nameCn.slice(0, 2)}</div>
                      <div style={{ height: `${height}px`, backgroundColor: layer.color, opacity: activeLayers.has(layer.id) ? layer.opacity * timeFactor : 0.15 }}
                        className="w-6 rounded-t transition-all duration-300" />
                      <div className="text-[8px] text-slate-600">{(layer.thicknessKm * timeFactor).toFixed(0)}</div>
                    </div>
                  );
                })}
              </div>
              <div className="text-[10px] text-slate-500 text-center mt-1">厚度(km) · 时间因子: ×{timeGya === 0 ? '1.00' : getTimeFactor(atmosphere.layers[0]).toFixed(2)}</div>
            </div>

            {/* 详细层列表 */}
            <div className="space-y-2">
              {atmosphere.layers.map(layer => {
                const timeFactor = getTimeFactor(layer);
                const isActive = activeLayers.has(layer.id);
                return (
                  <div key={layer.id}
                    onClick={() => toggleLayer(layer.id)}
                    className={`rounded-lg border p-2.5 cursor-pointer transition-all ${isActive ? 'border-slate-600/50 bg-slate-800/60' : 'border-slate-700/30 bg-slate-900/40 opacity-50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2.5 h-2.5 rounded-full ${LAYER_TYPE_COLORS[layer.type] || 'bg-slate-500'}`} style={{ backgroundColor: layer.color }} />
                      <span className="text-xs font-medium text-slate-200">{layer.nameCn}</span>
                      <span className="text-[10px] text-slate-500">{layer.name}</span>
                      <span className="text-[10px] text-slate-600 rounded bg-slate-700/50 px-1 py-0.5 ml-auto">{LAYER_TYPE_LABELS[layer.type]}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] ml-4">
                      <div><span className="text-slate-500">厚度</span> <span className="text-cyan-400">{(layer.thicknessKm * timeFactor).toFixed(0)} km</span>
                        {timeFactor !== 1.0 && <span className="text-amber-400 text-[10px]"> (×{timeFactor.toFixed(2)})</span>}
                      </div>
                      <div><span className="text-slate-500">成分</span> <span className="text-slate-300">{layer.composition}</span></div>
                      <div><span className="text-slate-500">温度</span> <span className="text-orange-400">{layer.tempRange}</span></div>
                      {layer.pressure && <div><span className="text-slate-500">气压</span> <span className="text-violet-400">{layer.pressure}</span></div>}
                    </div>
                    <div className="text-[10px] text-slate-500 ml-4 mt-1">{layer.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 物质成分 */}
        <div>
          <button onClick={() => setShowMaterials(!showMaterials)}
            className="flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300 mb-2">
            <span>{showMaterials ? '▼' : '▶'}</span> 物质成分分析
          </button>
          {showMaterials && materials && (
            <div className="rounded-lg border border-amber-800/30 bg-amber-950/10 p-3">
              <div className="text-xs text-amber-400 font-medium mb-2">{materials.bodyNameCn} 物质组成</div>
              <div className="space-y-1.5">
                {materials.materials.map((mat, i) => (
                  <div key={i} className="flex items-start gap-2 rounded bg-slate-800/50 px-2 py-1.5">
                    <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                      mat.category === 'metal' ? 'bg-gray-400' :
                      mat.category === 'mineral' ? 'bg-orange-400' :
                      mat.category === 'gas' ? 'bg-cyan-400' :
                      mat.category === 'ice' ? 'bg-sky-300' :
                      mat.category === 'organic' ? 'bg-green-400' :
                      mat.category === 'radioactive' ? 'bg-red-400' :
                      'bg-purple-400'
                    }`} />
                    <div className="text-[11px] flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-200 font-medium">{mat.nameCn}</span>
                        <span className="text-slate-500">{mat.name}</span>
                        <span className="text-cyan-400 ml-auto">{mat.abundance}</span>
                      </div>
                      <div className="text-slate-500">{mat.description}</div>
                      {mat.utilization && <div className="text-emerald-400 text-[10px]">利用: {mat.utilization}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 时间演化事件 */}
        <div>
          <button onClick={() => setShowTimeline(!showTimeline)}
            className="flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 mb-2">
            <span>{showTimeline ? '▼' : '▶'}</span> 大气演化事件 ({timelineEvents.length})
          </button>
          {showTimeline && timelineEvents.length > 0 && (
            <div className="space-y-1.5">
              {timelineEvents.map((evt, i) => (
                <div key={i} className="rounded border border-slate-700/30 bg-slate-800/40 px-3 py-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-violet-400">{evt.yearsAgo}</span>
                    <span className="text-xs text-slate-200">{evt.event}</span>
                  </div>
                  <div className="text-[10px] text-amber-400/80">{evt.impact}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 联动操作 */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-700/30">
          <span className="text-[10px] text-slate-500 self-center">联动:</span>
          <button onClick={() => onNavigate({ type: 'focus-body', source: 'celestial-layers', payload: { bodyName: selectedBody } })}
            className="rounded bg-slate-700/50 px-2 py-1 text-[10px] text-cyan-400 hover:bg-slate-600/50">聚焦天体</button>
          <button onClick={() => onNavigate({ type: 'analyze-remote', source: 'celestial-layers', target: 'remote-sensing', payload: { bodyName: selectedBody } })}
            className="rounded bg-slate-700/50 px-2 py-1 text-[10px] text-orange-400 hover:bg-slate-600/50">遥感分析</button>
          <button onClick={() => onNavigate({ type: 'view-geological', source: 'celestial-layers', target: 'geological-evolution', payload: { bodyName: selectedBody } })}
            className="rounded bg-slate-700/50 px-2 py-1 text-[10px] text-purple-400 hover:bg-slate-600/50">地质演化</button>
          <button onClick={() => onNavigate({ type: 'run-simulation', source: 'celestial-layers', target: 'evolution-history', payload: { bodyName: selectedBody, yearsAgo: timeGya } })}
            className="rounded bg-slate-700/50 px-2 py-1 text-[10px] text-indigo-400 hover:bg-slate-600/50">时空推演</button>
          <button onClick={() => onNavigate({ type: 'wander-collect', source: 'celestial-layers', target: 'wander-agent', payload: { bodyName: selectedBody } })}
            className="rounded bg-slate-700/50 px-2 py-1 text-[10px] text-emerald-400 hover:bg-slate-600/50">智能体扫描</button>
        </div>
      </div>
    </div>
  );
}
