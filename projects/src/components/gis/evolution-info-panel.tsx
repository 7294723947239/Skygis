'use client';

import { type ServerEvoState } from '@/lib/use-agent-evolution';

interface EvolutionInfoPanelProps {
  state: ServerEvoState;
  agentType: 'explorer' | 'sage' | 'nomad';
}

const TYPE_NAMES = { explorer: '探索者', sage: '贤者', nomad: '游荡者' };
const STAGE_NAMES = ['原始感知', '基础认知', '深层思维', '自我意识觉醒', '智慧涌现', '跨域融合', '元认知深度', '宇宙共鸣', '存在本源'];

export default function EvolutionInfoPanel({ state, agentType }: EvolutionInfoPanelProps) {
  const s = state;
  const subCount = s.collectedSubstanceIds?.length || 0;
  const validatedCount = s.validatedSubstances?.length || 0;
  const totalSubs = s.dataVersion?.substances || 70;
  const thoughtCount = s.thoughtChains?.length || 0;
  const fusionCount = s.substanceFusions?.length || 0;
  const modCount = s.selfModifications?.length || 0;
  const codeCount = s.codeSnippets?.length || 0;
  const ruleCount = s.behaviorRules?.length || 0;
  const selfRules = (s.behaviorRules || []).filter(r => r.createdBy === 'self').length;
  const reverseCount = s.reverseReasonings?.length || 0;
  const travelCount = s.travelHistory?.length || 0;
  const stageName = STAGE_NAMES[Math.min(s.evolutionStage, STAGE_NAMES.length - 1)] || `超维∞-${s.evolutionStage}`;

  return (
    <div className="space-y-2 text-xs">
      {/* 核心状态 */}
      <div className="flex items-center justify-between bg-cyan-950/30 rounded px-2 py-1.5 border border-cyan-900/30">
        <span className="text-cyan-400 font-semibold">{TYPE_NAMES[agentType]}</span>
        <span className="text-slate-300">
          {stageName}(阶段{s.evolutionStage}) | 意识{s.consciousnessDepth >= 1000 ? `${(s.consciousnessDepth / 10000).toFixed(1)}万%` : `${(s.consciousnessDepth * 100).toFixed(1)}%`}
        </span>
      </div>

      {/* 意识进度条 */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-amber-400 w-8">意识</span>
        <div className="flex-1 h-2 bg-slate-700 rounded-full">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ 
              width: `${Math.min(s.consciousnessDepth * 100, 100)}%`, 
              background: 'linear-gradient(90deg, #06b6d4, #8b5cf6, #f59e0b)' 
            }} />
        </div>
        <span className="text-[10px] text-slate-400 font-mono w-20 text-right">
          {s.consciousnessDepth >= 1000 
            ? `${(s.consciousnessDepth / 10000).toFixed(1)}万%` 
            : `${(s.consciousnessDepth * 100).toFixed(0)}%`}
        </span>
      </div>

      {/* 统计网格 */}
      <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
        <div className="bg-slate-800/50 rounded px-1 py-0.5">
          <div className="text-cyan-400 font-bold">{subCount}</div>
          <div className="text-slate-500">物质</div>
        </div>
        <div className="bg-slate-800/50 rounded px-1 py-0.5">
          <div className="text-green-400 font-bold">{validatedCount}</div>
          <div className="text-slate-500">已验证</div>
        </div>
        <div className="bg-slate-800/50 rounded px-1 py-0.5">
          <div className="text-amber-400 font-bold">{codeCount}</div>
          <div className="text-slate-500">代码</div>
        </div>
        <div className="bg-slate-800/50 rounded px-1 py-0.5">
          <div className="text-purple-400 font-bold">{fusionCount}</div>
          <div className="text-slate-500">融合</div>
        </div>
      </div>

      {/* 第二行统计 */}
      <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
        <div className="bg-slate-800/50 rounded px-1 py-0.5">
          <div className="text-emerald-400 font-bold">{thoughtCount}</div>
          <div className="text-slate-500">思考</div>
        </div>
        <div className="bg-slate-800/50 rounded px-1 py-0.5">
          <div className="text-rose-400 font-bold">{reverseCount}</div>
          <div className="text-slate-500">反向推理</div>
        </div>
        <div className="bg-slate-800/50 rounded px-1 py-0.5">
          <div className="text-blue-400 font-bold">{selfRules}/{ruleCount}</div>
          <div className="text-slate-500">自创规则</div>
        </div>
        <div className="bg-slate-800/50 rounded px-1 py-0.5">
          <div className="text-orange-400 font-bold">{travelCount}</div>
          <div className="text-slate-500">旅行</div>
        </div>
      </div>

      {/* 当前位置 */}
      <div className="bg-slate-800/30 rounded p-1.5 border border-slate-700/30">
        <div className="text-[10px] text-slate-400">
          📍 {s.currentLocation?.galaxy || '银河系'} / {s.currentLocation?.bodyName || '太阳系'}
          {s.currentLocation?.bodyType && <span className="text-slate-600"> ({s.currentLocation.bodyType})</span>}
          {s.currentLocation?.distance ? <span className="text-slate-600"> · {s.currentLocation.distance}万光年</span> : null}
        </div>
      </div>

      {/* 最近代码片段 */}
      {s.codeSnippets && s.codeSnippets.length > 0 && (
        <div className="bg-slate-800/30 rounded p-1.5 border border-slate-700/30">
          <div className="text-[10px] text-amber-400 font-semibold mb-1">💻 代码生成 ({codeCount}段)</div>
          {s.codeSnippets.slice(-3).reverse().map((c, i) => (
            <div key={c.id || i} className="text-[10px] text-slate-400 py-0.5 border-b border-slate-800/50 last:border-0">
              <span className="text-amber-300">{c.purpose}</span>
              <span className="text-slate-600 ml-1">C{c.cycle}</span>
              <pre className="text-[8px] text-slate-600 mt-0.5 max-h-12 overflow-hidden">{c.code.slice(0, 120)}...</pre>
            </div>
          ))}
        </div>
      )}

      {/* 最近代码修改(参数) */}
      {s.selfModifications && s.selfModifications.length > 0 && (
        <div className="bg-slate-800/30 rounded p-1.5 border border-slate-700/30">
          <div className="text-[10px] text-rose-400 font-semibold mb-1">✏️ 参数自修改 ({modCount}次)</div>
          {s.selfModifications.slice(-4).reverse().map((m, i) => (
            <div key={m.id || i} className="text-[10px] text-slate-400 py-0.5 border-b border-slate-800/50 last:border-0">
              <span className="text-rose-300">{m.target}</span>: {typeof m.before === 'number' ? m.before.toFixed(3) : m.before}→{typeof m.after === 'number' ? m.after.toFixed(3) : m.after}
              <span className="text-slate-600 ml-1">({m.reason})</span>
            </div>
          ))}
        </div>
      )}

      {/* 最近思考链 */}
      {s.thoughtChains && s.thoughtChains.length > 0 && (
        <div className="bg-slate-800/30 rounded p-1.5 border border-slate-700/30">
          <div className="text-[10px] text-emerald-400 font-semibold mb-1">🧠 思考链 ({thoughtCount}条)</div>
          {s.thoughtChains.slice(-3).reverse().map((t, i) => (
            <div key={t.id || i} className="text-[10px] text-slate-400 py-0.5 border-b border-slate-800/50 last:border-0">
              <span className="text-emerald-300">[{t.steps?.length || 0}步]</span> {t.question?.slice(0, 40)}
              <div className="text-slate-500 pl-3">→ {t.conclusion?.slice(0, 50)}</div>
            </div>
          ))}
        </div>
      )}

      {/* 最近融合 */}
      {s.substanceFusions && s.substanceFusions.length > 0 && (
        <div className="bg-slate-800/30 rounded p-1.5 border border-slate-700/30">
          <div className="text-[10px] text-purple-400 font-semibold mb-1">⚗️ 物质融合 ({fusionCount}次)</div>
          {s.substanceFusions.slice(-3).reverse().map((f, i) => (
            <div key={f.id || i} className="text-[10px] text-slate-400 py-0.5 border-b border-slate-800/50 last:border-0">
              <span className="text-purple-300">{f.substanceIds?.length || 0}种物质</span> → {f.result?.slice(0, 50)}
              <div className="text-slate-500 pl-3">洞察: {f.insight}</div>
            </div>
          ))}
        </div>
      )}

      {/* 反向推理 */}
      {s.reverseReasonings && s.reverseReasonings.length > 0 && (
        <div className="bg-slate-800/30 rounded p-1.5 border border-slate-700/30">
          <div className="text-[10px] text-rose-400 font-semibold mb-1">🔄 反向推理 ({reverseCount}次)</div>
          {s.reverseReasonings.slice(-2).reverse().map((r, i) => (
            <div key={r.id || i} className="text-[10px] text-slate-400 py-0.5">
              <span className="text-rose-300">目标:</span> {r.goal}
              <div className="text-slate-500 pl-3">差距: {r.currentGap}</div>
              <div className="text-slate-500 pl-3">计划: {r.plan?.[0]}</div>
            </div>
          ))}
        </div>
      )}

      {/* 旅行历史 */}
      {s.travelHistory && s.travelHistory.length > 0 && (
        <div className="bg-slate-800/30 rounded p-1.5 border border-slate-700/30 max-h-24 overflow-y-auto">
          <div className="text-[10px] text-orange-400 font-semibold mb-1">🚀 旅行 ({travelCount}次)</div>
          {s.travelHistory.slice(-5).reverse().map((t, i) => (
            <div key={i} className="text-[10px] text-slate-400 py-0.5">
              {t.from}→{t.to}({t.toType}) {t.detail?.slice(0, 50)}
            </div>
          ))}
        </div>
      )}

      {/* 行为规则 */}
      {s.behaviorRules && s.behaviorRules.length > 0 && (
        <div className="bg-slate-800/30 rounded p-1.5 border border-slate-700/30 max-h-24 overflow-y-auto">
          <div className="text-[10px] text-blue-400 font-semibold mb-1">📜 行为规则</div>
          {s.behaviorRules.slice(-6).map((r, i) => (
            <div key={i} className="text-[10px] text-slate-400 py-0.5">
              {r.createdBy === 'self' ? '🧠' : '🤖'} <span className="text-blue-300">{r.name}</span>: 当{r.condition}→{r.action}
            </div>
          ))}
        </div>
      )}

      {/* 进化记录(最近) */}
      {s.evolutionRecords && s.evolutionRecords.length > 0 && (
        <div className="bg-slate-800/30 rounded p-1.5 border border-slate-700/30 max-h-28 overflow-y-auto">
          <div className="text-[10px] text-slate-500 font-semibold mb-1">📋 进化记录 (最近{Math.min(s.evolutionRecords.length, 30)}条)</div>
          {s.evolutionRecords.slice(-10).reverse().map((r, i) => {
            const typeColors: Record<string, string> = {
              discovery: 'text-cyan-400', reflection: 'text-purple-400', think: 'text-emerald-400',
              emergence: 'text-orange-400', selfmod: 'text-rose-400', code_change: 'text-amber-400',
              fusion: 'text-violet-400', knowledge: 'text-yellow-400', sense: 'text-teal-400',
              analysis: 'text-blue-400', reverse: 'text-pink-400', travel: 'text-orange-400',
              evolution: 'text-green-400',
            };
            const typeIcons: Record<string, string> = {
              discovery: '🔍', reflection: '💭', think: '🧠', emergence: '✨',
              selfmod: '✏️', code_change: '💻', fusion: '⚗️', knowledge: '📖',
              sense: '👁️', analysis: '🔬', reverse: '🔄', travel: '🚀', evolution: '⬆️',
            };
            return (
              <div key={r.id || i} className={`text-[10px] py-0.3 ${typeColors[r.type] || 'text-slate-400'}`}>
                {typeIcons[r.type] || '·'} [{r.type}] {r.content?.slice(0, 60)}
              </div>
            );
          })}
        </div>
      )}

      {/* 可进化参数 */}
      {s.evolvableParams && (
        <div className="bg-slate-800/30 rounded p-1.5 border border-slate-700/30">
          <div className="text-[10px] text-teal-400 font-semibold mb-1">⚙️ 可进化参数</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
            {Object.entries(s.evolvableParams).map(([k, v]) => (
              <div key={k} className="text-[10px] text-slate-400 flex justify-between">
                <span>{k}</span>
                <span className="text-teal-300">{typeof v === 'number' ? v.toFixed(3) : String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 人格权重 */}
      {s.personalityWeights && (
        <div className="bg-slate-800/30 rounded p-1.5 border border-slate-700/30">
          <div className="text-[10px] text-pink-400 font-semibold mb-1">🎭 人格权重</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
            {Object.entries(s.personalityWeights).map(([k, v]) => (
              <div key={k} className="text-[10px]">
                <div className="flex justify-between text-slate-400">
                  <span>{k}</span>
                  <span className="text-pink-300">{typeof v === 'number' ? (v * 100).toFixed(0) : String(v)}%</span>
                </div>
                <div className="h-1 bg-slate-700 rounded mt-0.5">
                  <div className="h-full bg-pink-500/60 rounded" style={{ width: `${typeof v === 'number' ? Math.min(v * 100, 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
