'use client';

import { useState, useMemo } from 'react';
import { COSMIC_TAXONOMY, COSMIC_TAXONOMY_STATS, type CosmicCategory, type CosmicObject, type CosmicSubType, type CosmicMaterial } from '@/lib/cosmic-taxonomy';
import { SOLAR_SYSTEM_MATERIALS } from '@/lib/solar-system-materials';
import { ALL_COSMIC_SUBSTANCES, SUBSTANCE_STATS, type CosmicSubstance } from '@/lib/all-cosmic-substances';

interface UniverseMaterialsPanelProps {
  onClose: () => void;
  onNavigateToBody?: (bodyKey: string) => void;
}

// 展开的物质行（统一类型）
interface FlatMaterial {
  name: string;
  formula: string;
  percentage: number;
  category: string;
  state: string;
  importance: string;
  note: string;
  discovered: string;
  sourceId: string;
  sourceCn: string;
  categoryId: string;
  categoryCn: string;
  subTypeName?: string;
}

// 物态选项
const STATE_OPTIONS = ['全部', '气态', '液态', '固态', '等离子态', '超临界', '超离子态', '简并态', '中子简并态', '电子简并态', '超流体', '超固态', '奇异物态', '夸克-胶子等离子态', '玻色-爱因斯坦凝聚态', '离子态', '亚稳态', '分子态', '金属态', '超导态', '未知'];
// 重要性选项
const IMPORTANCE_OPTIONS = ['全部', '主导', '关键', '重要', '次要', '痕量', '理论预测', '未证实'];

export default function UniverseMaterialsPanel({ onClose, onNavigateToBody }: UniverseMaterialsPanelProps) {
  const [viewMode, setViewMode] = useState<'all' | 'taxonomy' | 'substances'>('substances');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedObject, setExpandedObject] = useState<string | null>(null);
  const [selectedSubType, setSelectedSubType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState('全部');
  const [filterImportance, setFilterImportance] = useState('全部');

  // 展开所有物质为平铺列表
  const allMaterials = useMemo(() => {
    const list: FlatMaterial[] = [];

    // 从分类体系获取
    for (const cat of COSMIC_TAXONOMY) {
      for (const obj of cat.objects) {
        for (const m of obj.materials) {
          list.push({
            name: m.name, formula: m.formula, percentage: m.percentage,
            category: m.category, state: m.state, importance: m.importance,
            note: m.note || '', discovered: m.discovered || '',
            sourceId: obj.id, sourceCn: obj.nameCn,
            categoryId: cat.id, categoryCn: cat.nameCn,
          });
        }
        if (obj.subTypes) {
          for (const st of obj.subTypes) {
            for (const m of st.materials) {
              list.push({
                name: m.name, formula: m.formula, percentage: m.percentage,
                category: m.category, state: m.state, importance: m.importance,
                note: m.note || '', discovered: m.discovered || '',
                sourceId: obj.id, sourceCn: obj.nameCn,
                categoryId: cat.id, categoryCn: cat.nameCn,
                subTypeName: st.nameCn,
              });
            }
          }
        }
      }
    }

    // 太阳系天体物质
    for (const [key, body] of Object.entries(SOLAR_SYSTEM_MATERIALS)) {
      for (const m of body.materials) {
        list.push({
          name: m.name, formula: m.formula, percentage: m.percentage,
          category: m.category, state: m.state || '未知', importance: m.importance || '次要',
          note: m.notes, discovered: m.discoveryYear || '',
          sourceId: key, sourceCn: body.nameCn,
          categoryId: 'solar-system', categoryCn: '太阳系天体',
        });
      }
    }

    return list;
  }, []);

  // 筛选后的物质列表
  const filteredMaterials = useMemo(() => {
    let mats = allMaterials;
    if (filterState !== '全部') mats = mats.filter(m => m.state === filterState);
    if (filterImportance !== '全部') mats = mats.filter(m => m.importance === filterImportance);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      mats = mats.filter(m =>
        m.name.includes(searchQuery) || m.formula.toLowerCase().includes(q) ||
        m.note.includes(searchQuery) || m.sourceCn.includes(searchQuery) ||
        m.category.includes(searchQuery) || m.categoryCn.includes(searchQuery)
      );
    }
    return [...mats].sort((a, b) => b.percentage - a.percentage);
  }, [allMaterials, filterState, filterImportance, searchQuery]);

  // 获取分类体系的当前选中对象
  const currentObject = useMemo((): CosmicObject | null => {
    if (!expandedObject) return null;
    for (const cat of COSMIC_TAXONOMY) {
      const obj = cat.objects.find(o => o.id === expandedObject);
      if (obj) return obj;
    }
    return null;
  }, [expandedObject]);

  const currentSubTypeObj = useMemo((): { obj: CosmicObject; sub: CosmicSubType } | null => {
    if (!selectedSubType || !currentObject) return null;
    const sub = currentObject.subTypes?.find(s => s.id === selectedSubType);
    if (!sub) return null;
    return { obj: currentObject, sub };
  }, [selectedSubType, currentObject]);

  // 重要性颜色
  const impColor = (imp: string) => {
    switch (imp) {
      case '主导': return 'bg-cyan-900/50 text-cyan-200';
      case '关键': return 'bg-red-900/40 text-red-300';
      case '重要': return 'bg-amber-900/40 text-amber-300';
      case '理论预测': return 'bg-purple-900/40 text-purple-300';
      case '未证实': return 'bg-orange-900/40 text-orange-300';
      case '痕量': return 'bg-slate-700/50 text-slate-400';
      default: return 'bg-slate-700/50 text-slate-400';
    }
  };

  // 渲染物质行
  const renderMaterial = (m: FlatMaterial, idx: number) => (
    <div key={`${m.sourceId}-${idx}`} className="px-3 py-2 hover:bg-slate-800/40 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-200 font-medium">{m.name}</span>
            {m.formula && <span className="text-[10px] text-slate-500 font-mono">{m.formula}</span>}
            {m.subTypeName && <span className="text-[9px] rounded-full bg-violet-900/30 text-violet-300 px-1.5 py-0.5">{m.subTypeName}</span>}
            <button
              onClick={() => { setExpandedObject(m.sourceId); setExpandedCategory(m.categoryId); }}
              className="text-[9px] rounded-full bg-cyan-900/30 text-cyan-300 px-1.5 py-0.5 hover:bg-cyan-800/40"
            >
              {m.sourceCn}
            </button>
            <span className="text-[9px] rounded-full bg-slate-700/50 px-1.5 py-0.5 text-slate-400">{m.category}</span>
            {m.state && m.state !== '未知' && <span className="text-[9px] rounded-full bg-slate-700/40 px-1.5 py-0.5 text-slate-500">{m.state}</span>}
            {m.importance && m.importance !== '次要' && (
              <span className={`text-[9px] rounded-full px-1.5 py-0.5 ${impColor(m.importance)}`}>{m.importance}</span>
            )}
          </div>
          {m.note && <div className="text-[10px] text-slate-500 mt-0.5">{m.note}</div>}
        </div>
        <div className="flex items-center gap-2 w-24 shrink-0">
          <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                m.percentage > 20 ? 'bg-gradient-to-r from-cyan-500 to-emerald-500' :
                m.percentage > 5 ? 'bg-gradient-to-r from-cyan-600 to-cyan-400' :
                m.percentage > 1 ? 'bg-cyan-700' : 'bg-slate-600'
              }`}
              style={{ width: `${Math.min(100, Math.max(2, m.percentage * 2))}%` }}
            />
          </div>
          <span className="text-[10px] text-cyan-400 font-mono w-12 text-right">{m.percentage}%</span>
        </div>
      </div>
    </div>
  );

  // 渲染环境标签
  const renderEnv = (env: { temperature?: string; temp?: string; gravity: string; pressure: string; radiation: string }) => (
    <div className="flex flex-wrap gap-1.5 text-[10px]">
      <span className="rounded-full bg-red-900/30 text-red-300 px-2 py-0.5">🌡 {env.temperature || env.temp}</span>
      <span className="rounded-full bg-blue-900/30 text-blue-300 px-2 py-0.5">⬇ {env.gravity}</span>
      <span className="rounded-full bg-purple-900/30 text-purple-300 px-2 py-0.5">⏲ {env.pressure}</span>
      <span className="rounded-full bg-yellow-900/30 text-yellow-300 px-2 py-0.5">☢ {env.radiation}</span>
    </div>
  );

  // 渲染标签列表
  const renderTags = (items: string[] | undefined, color: string, label: string) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mt-1.5">
        <span className={`text-[9px] text-${color}-400`}>{label}:</span>
        <div className="flex flex-wrap gap-1 mt-0.5">
          {items.map((item, i) => (
            <span key={i} className={`text-[9px] rounded-full bg-${color}-900/30 text-${color}-300 px-1.5 py-0.5`}>{item}</span>
          ))}
        </div>
      </div>
    );
  };

  // 渲染物质详情列表
  const renderMaterialList = (materials: CosmicMaterial[], sourceCn: string, sourceId: string, categoryId: string, categoryCn: string) => {
    const grouped = new Map<string, CosmicMaterial[]>();
    for (const m of materials) {
      if (!grouped.has(m.category)) grouped.set(m.category, []);
      grouped.get(m.category)!.push(m);
    }
    return Array.from(grouped.entries()).map(([cat, mats]) => (
      <div key={cat} className="rounded-lg border border-slate-700/30 bg-slate-800/30 overflow-hidden">
        <div className="px-3 py-1.5 bg-slate-800/60 border-b border-slate-700/30">
          <span className="text-xs font-medium text-amber-400">{cat}</span>
          <span className="text-[10px] text-slate-500 ml-2">{mats.length}种</span>
        </div>
        <div className="divide-y divide-slate-700/20">
          {mats.sort((a, b) => b.percentage - a.percentage).map((m, i) => (
            <div key={i} className="px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-slate-200 font-medium">{m.name}</span>
                    {m.formula && <span className="text-[10px] text-slate-500 font-mono">{m.formula}</span>}
                    {m.state && m.state !== '未知' && <span className="text-[9px] rounded-full bg-slate-700/50 px-1.5 py-0.5 text-slate-400">{m.state}</span>}
                    {m.importance && m.importance !== '次要' && (
                      <span className={`text-[9px] rounded-full px-1.5 py-0.5 ${impColor(m.importance)}`}>{m.importance}</span>
                    )}
                  </div>
                  {m.note && <div className="text-[10px] text-slate-500 mt-0.5">{m.note}</div>}
                  {m.discovered && <div className="text-[9px] text-slate-600 mt-0.5">发现: {m.discovered}</div>}
                </div>
                <div className="flex items-center gap-2 w-28 shrink-0">
                  <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        m.percentage > 20 ? 'bg-gradient-to-r from-cyan-500 to-emerald-500' :
                        m.percentage > 5 ? 'bg-gradient-to-r from-cyan-600 to-cyan-400' :
                        m.percentage > 1 ? 'bg-cyan-700' : 'bg-slate-600'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(2, m.percentage * 2))}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono w-14 text-right">{m.percentage}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className="fixed inset-0 lg:inset-auto lg:absolute lg:top-14 lg:left-3 lg:w-[580px] lg:max-h-[85vh] z-50 bg-slate-900/98 backdrop-blur-xl border border-slate-700/50 rounded-none lg:rounded-xl shadow-2xl overflow-hidden flex flex-col">
      {/* 手机端关闭栏 */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-800/90 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-cyan-400">⚛ 宇宙全量物质</span>
          <div className="flex rounded-md border border-slate-700/50 overflow-hidden">
            <button onClick={() => setViewMode('substances')} className={`px-2 py-0.5 text-[10px] ${viewMode === 'substances' ? 'bg-cyan-600/80 text-white' : 'text-slate-400'}`}>物质</button>
            <button onClick={() => setViewMode('all')} className={`px-2 py-0.5 text-[10px] ${viewMode === 'all' ? 'bg-cyan-600/80 text-white' : 'text-slate-400'}`}>全部</button>
            <button onClick={() => setViewMode('taxonomy')} className={`px-2 py-0.5 text-[10px] ${viewMode === 'taxonomy' ? 'bg-cyan-600/80 text-white' : 'text-slate-400'}`}>分类</button>
          </div>
        </div>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-red-900/60 text-red-300 hover:bg-red-800 text-xl">×</button>
      </div>

      {/* 标题栏 - 桌面 */}
      <div className="hidden lg:flex items-center justify-between px-4 py-2.5 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <span className="text-base">⚛</span>
          <span className="text-sm font-semibold text-cyan-400">宇宙全量物质</span>
          <span className="text-[10px] text-slate-500 bg-slate-800 rounded-full px-2 py-0.5">
            {COSMIC_TAXONOMY_STATS.estimatedTotalGalaxies}星系 · {SUBSTANCE_STATS.totalUnique}种唯一物质
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-slate-700/50 overflow-hidden">
            <button onClick={() => setViewMode('substances')} className={`px-2 py-0.5 text-[10px] ${viewMode === 'substances' ? 'bg-cyan-600/80 text-white' : 'text-slate-400 hover:text-white'}`}>物质</button>
            <button onClick={() => setViewMode('all')} className={`px-2 py-0.5 text-[10px] ${viewMode === 'all' ? 'bg-cyan-600/80 text-white' : 'text-slate-400 hover:text-white'}`}>全部</button>
            <button onClick={() => setViewMode('taxonomy')} className={`px-2 py-0.5 text-[10px] ${viewMode === 'taxonomy' ? 'bg-cyan-600/80 text-white' : 'text-slate-400 hover:text-white'}`}>分类</button>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-lg leading-none">×</button>
        </div>
      </div>

      {/* 宇宙总览条 */}
      <div className="px-3 py-1.5 bg-slate-800/40 border-b border-slate-700/30">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-400">
            可观测宇宙: {COSMIC_TAXONOMY_STATS.estimatedTotalGalaxies}星系 · {COSMIC_TAXONOMY_STATS.estimatedTotalStars}恒星 · {COSMIC_TAXONOMY_STATS.estimatedTotalPlanets}行星
          </span>
          <div className="flex gap-2">
            <span className="text-slate-500">暗能量 {COSMIC_TAXONOMY_STATS.cosmologicalComposition.darkEnergy}%</span>
            <span className="text-slate-500">暗物质 {COSMIC_TAXONOMY_STATS.cosmologicalComposition.darkMatter}%</span>
            <span className="text-slate-500">重子 {COSMIC_TAXONOMY_STATS.cosmologicalComposition.baryonicMatter}%</span>
          </div>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="px-3 py-2 border-b border-slate-700/30">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索物质/天体/分类..."
            className="flex-1 rounded-lg bg-slate-800/80 border border-slate-700/50 px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
          />
          <span className="text-[10px] text-slate-500 whitespace-nowrap">{filteredMaterials.length}种</span>
        </div>
      </div>

      {/* 筛选标签 */}
      <div className="px-3 py-1.5 border-b border-slate-700/30 space-y-1">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[9px] text-slate-500 shrink-0">物态</span>
          {STATE_OPTIONS.slice(0, 8).map(s => (
            <button key={s} onClick={() => setFilterState(s)} className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] transition-colors ${filterState === s ? 'bg-amber-600/80 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-white'}`}>
              {s}
            </button>
          ))}
          {filterState !== '全部' && !STATE_OPTIONS.slice(0, 8).includes(filterState) && (
            <button className="shrink-0 rounded-full px-2 py-0.5 text-[10px] bg-amber-600/80 text-white">{filterState}</button>
          )}
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[9px] text-slate-500 shrink-0">级别</span>
          {IMPORTANCE_OPTIONS.map(s => (
            <button key={s} onClick={() => setFilterImportance(s)} className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] transition-colors ${filterImportance === s ? 'bg-violet-600/80 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {viewMode === 'substances' ? (
          /* ========== 去重物质数据库视图 ========== */
          <SubstanceDatabaseView searchQuery={searchQuery} filterState={filterState} />
        ) : viewMode === 'all' ? (
          /* ========== 全部物质平铺 ========== */
          <div className="divide-y divide-slate-700/20">
            {filteredMaterials.map((m, i) => renderMaterial(m, i))}
            {filteredMaterials.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-500">未找到匹配物质</div>
            )}
          </div>
        ) : expandedObject && currentObject ? (
          /* ========== 天体详情 ========== */
          <div className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <button onClick={() => { setExpandedObject(null); setSelectedSubType(null); }} className="text-xs text-cyan-400 hover:text-cyan-300">← 返回分类</button>
              <span className="text-[10px] text-slate-500">·</span>
              <button onClick={() => { setExpandedCategory(null); setExpandedObject(null); setSelectedSubType(null); }} className="text-xs text-slate-400 hover:text-slate-300">回到总览</button>
            </div>

            <div className="rounded-lg border border-slate-700/40 bg-slate-800/50 p-3">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-cyan-400">{currentObject.nameCn}</span>
                <span className="text-[10px] text-slate-500 bg-slate-700/50 rounded-full px-1.5 py-0.5">{currentObject.type}</span>
              </div>
              <div className="text-xs text-amber-400 mt-0.5 font-medium">估计数量: {currentObject.estimatedCount}</div>
              {currentObject.countNote && <div className="text-[10px] text-slate-500">{currentObject.countNote}</div>}
              <div className="text-xs text-slate-400 mt-1">{currentObject.description}</div>
              <div className="mt-2">{renderEnv(currentObject.environment)}</div>
              {renderTags(currentObject.hazards, 'red', '危险')}
              {renderTags(currentObject.resources, 'emerald', '资源')}
              {renderTags(currentObject.features, 'amber', '特征')}
              {onNavigateToBody && (
                <button
                  onClick={() => onNavigateToBody(currentObject.id)}
                  className="mt-3 rounded-md bg-cyan-900/40 px-3 py-1.5 text-xs text-cyan-300 hover:bg-cyan-800/50 transition-colors"
                >
                  🧬 派遣探针前往
                </button>
              )}
            </div>

            {/* 子类型选择 */}
            {currentObject.subTypes && currentObject.subTypes.length > 0 && (
              <div>
                <div className="text-[10px] text-slate-500 mb-1.5">子类型 ({currentObject.subTypes.length})</div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedSubType(null)}
                    className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${!selectedSubType ? 'bg-cyan-600/80 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-white'}`}
                  >
                    全部
                  </button>
                  {currentObject.subTypes.map(st => (
                    <button
                      key={st.id}
                      onClick={() => setSelectedSubType(st.id)}
                      className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${selectedSubType === st.id ? 'bg-cyan-600/80 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-white'}`}
                    >
                      {st.nameCn} <span className="text-[9px] opacity-60">({st.estimatedCount})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 子类型详情 */}
            {selectedSubType && currentSubTypeObj && (
              <div className="rounded-lg border border-violet-700/40 bg-violet-900/10 p-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-violet-400">{currentSubTypeObj.sub.nameCn}</span>
                  <span className="text-[10px] text-amber-400 bg-amber-900/30 rounded-full px-1.5 py-0.5">{currentSubTypeObj.sub.estimatedCount}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">{currentSubTypeObj.sub.description}</div>
                <div className="mt-2">{renderEnv(currentSubTypeObj.sub.environment)}</div>
              </div>
            )}

            {/* 物质列表 */}
            <div className="text-[10px] text-slate-500 mb-1">
              {selectedSubType && currentSubTypeObj
                ? `${currentSubTypeObj.sub.nameCn}: ${currentSubTypeObj.sub.materials.length}种物质`
                : `${currentObject.nameCn}: ${currentObject.materials.length + (currentObject.subTypes?.reduce((s, st) => s + st.materials.length, 0) ?? 0)}种物质`
              }
            </div>
            {selectedSubType && currentSubTypeObj
              ? renderMaterialList(currentSubTypeObj.sub.materials, currentSubTypeObj.obj.nameCn, currentSubTypeObj.obj.id, expandedCategory || '', '')
              : renderMaterialList(currentObject.materials, currentObject.nameCn, currentObject.id, expandedCategory || '', '')
            }
          </div>
        ) : (
          /* ========== 分类浏览 ========== */
          <div className="p-3 space-y-1.5">
            {!expandedCategory ? (
              /* 一级: 分类总览 */
              <>
                <div className="text-center py-2">
                  <div className="text-2xl mb-1">🌌</div>
                  <div className="text-sm font-semibold text-cyan-400">全宇宙天体物质分类体系</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {COSMIC_TAXONOMY.length}大类 · {COSMIC_TAXONOMY_STATS.totalObjects}天体类型 · {allMaterials.length}种物质
                  </div>
                  <div className="mt-1 text-[10px] text-amber-400/70">
                    可观测宇宙直径930亿光年 · {COSMIC_TAXONOMY_STATS.estimatedTotalGalaxies}星系
                  </div>
                </div>
                {COSMIC_TAXONOMY.map(cat => {
                  const totalMats = cat.objects.reduce((s, o) => s + o.materials.length + (o.subTypes?.reduce((ss, st) => ss + st.materials.length, 0) ?? 0), 0);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setExpandedCategory(cat.id)}
                      className="w-full rounded-lg border border-slate-700/40 bg-slate-800/40 hover:bg-slate-700/40 p-3 text-left transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{cat.icon}</span>
                          <span className="text-sm font-medium text-slate-200">{cat.nameCn}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-amber-400">{cat.estimatedCount}</div>
                          <div className="text-[9px] text-slate-500">{cat.objects.length}类型 · {totalMats}物质</div>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 line-clamp-2">{cat.description}</div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {cat.objects.slice(0, 6).map(o => (
                          <span key={o.id} className="text-[9px] rounded-full bg-slate-700/60 px-2 py-0.5 text-slate-400">{o.nameCn}</span>
                        ))}
                        {cat.objects.length > 6 && <span className="text-[9px] text-slate-500">+{cat.objects.length - 6}...</span>}
                      </div>
                    </button>
                  );
                })}
                {/* 太阳系天体（从solar-system-materials.ts） */}
                <button
                  onClick={() => setExpandedCategory('solar-system')}
                  className="w-full rounded-lg border border-slate-700/40 bg-slate-800/40 hover:bg-slate-700/40 p-3 text-left transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">☀️</span>
                      <span className="text-sm font-medium text-slate-200">太阳系天体</span>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-amber-400">1恒星+8行星+矮行星+卫星</div>
                      <div className="text-[9px] text-slate-500">{Object.keys(SOLAR_SYSTEM_MATERIALS).length}天体 · {allMaterials.filter(m => m.categoryId === 'solar-system').length}物质</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {Object.values(SOLAR_SYSTEM_MATERIALS).slice(0, 8).map(b => (
                      <span key={b.nameCn} className="text-[9px] rounded-full bg-slate-700/60 px-2 py-0.5 text-slate-400">{b.nameCn}</span>
                    ))}
                    <span className="text-[9px] text-slate-500">+更多...</span>
                  </div>
                </button>
              </>
            ) : expandedCategory === 'solar-system' ? (
              /* 太阳系天体列表 */
              <>
                <button onClick={() => setExpandedCategory(null)} className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 mb-1">
                  ← 返回分类总览
                </button>
                <div className="text-xs text-slate-500 mb-2">☀️ 太阳系天体 · {Object.keys(SOLAR_SYSTEM_MATERIALS).length}个</div>
                {Object.entries(SOLAR_SYSTEM_MATERIALS).map(([key, body]) => (
                  <div key={key} className="rounded-lg border border-slate-700/30 bg-slate-800/30 overflow-hidden">
                    <div className="px-3 py-2 bg-slate-800/60 border-b border-slate-700/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-200">{body.nameCn}</span>
                          <span className="text-[10px] text-slate-500 bg-slate-700/50 rounded-full px-1.5 py-0.5">{body.type}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">{body.materials.length}种物质</span>
                      </div>
                      <div className="mt-1">{renderEnv(body.environment)}</div>
                    </div>
                    <div className="divide-y divide-slate-700/20">
                      {body.materials.sort((a, b) => b.percentage - a.percentage).map((m, i) => (
                        <div key={i} className="px-3 py-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] text-slate-200">{m.name}</span>
                              {m.formula && <span className="text-[9px] text-slate-500 font-mono">{m.formula}</span>}
                              {m.state && m.state !== '未知' && <span className="text-[8px] rounded-full bg-slate-700/50 px-1.5 py-0.5 text-slate-400">{m.state}</span>}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <div className="w-12 h-1 bg-slate-700/50 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-600 rounded-full" style={{ width: `${Math.min(100, Math.max(2, m.percentage * 2))}%` }} />
                              </div>
                              <span className="text-[9px] text-cyan-400 font-mono w-10 text-right">{m.percentage}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              /* 二级: 分类下的天体类型 */
              (() => {
                const cat = COSMIC_TAXONOMY.find(c => c.id === expandedCategory);
                if (!cat) return null;
                return (
                  <>
                    <button onClick={() => setExpandedCategory(null)} className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 mb-1">
                      ← 返回分类总览
                    </button>
                    <div className="text-xs text-slate-500 mb-2">{cat.icon} {cat.nameCn} · {cat.estimatedCount} · {cat.objects.length}天体类型</div>
                    <div className="text-[10px] text-slate-600 mb-2">{cat.description}</div>
                    {cat.objects.map(obj => {
                      const totalMats = obj.materials.length + (obj.subTypes?.reduce((s, st) => s + st.materials.length, 0) ?? 0);
                      return (
                        <button
                          key={obj.id}
                          onClick={() => { setExpandedObject(obj.id); setSelectedSubType(null); }}
                          className="w-full rounded-lg border border-slate-700/30 bg-slate-800/40 hover:bg-slate-700/40 p-2.5 text-left transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-200">{obj.nameCn}</span>
                                <span className="text-[10px] text-amber-400 bg-amber-900/20 rounded-full px-1.5 py-0.5">{obj.estimatedCount}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{obj.type} · {totalMats}种物质</div>
                              {obj.subTypes && obj.subTypes.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {obj.subTypes.map(st => (
                                    <span key={st.id} className="text-[8px] rounded-full bg-violet-900/30 text-violet-300 px-1.5 py-0.5">{st.nameCn}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-slate-500 text-lg ml-2">›</div>
                          </div>
                        </button>
                      );
                    })}
                  </>
                );
              })()
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ========== 去重物质数据库视图组件 ==========
function SubstanceDatabaseView({ searchQuery, filterState }: { searchQuery: string; filterState: string }) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const categoryMap: Record<string, { label: string; color: string; icon: string }> = {
    element: { label: '元素', color: 'emerald', icon: '⚛' },
    isotope: { label: '同位素', color: 'blue', icon: '☢' },
    molecule: { label: '星际分子', color: 'cyan', icon: '🔮' },
    mineral: { label: '矿物', color: 'amber', icon: '💎' },
    organic: { label: '有机物', color: 'teal', icon: '🧬' },
    exotic: { label: '奇异物质', color: 'purple', icon: '🌀' },
  };

  const filtered = useMemo(() => {
    let list = ALL_COSMIC_SUBSTANCES;
    if (categoryFilter !== 'all') list = list.filter(s => s.category === categoryFilter);
    if (filterState !== '全部') list = list.filter(s => (s.state || '').includes(filterState));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s =>
        (s.nameCn || '').toLowerCase().includes(q) ||
        (s.nameEn || '').toLowerCase().includes(q) ||
        s.formula.toLowerCase().includes(q) ||
        (s.note || '').toLowerCase().includes(q) ||
        (s.foundIn || []).some((f: string) => f.toLowerCase().includes(q))
      );
    }
    return list;
  }, [categoryFilter, filterState, searchQuery]);

  // 按分类统计
  const statsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of ALL_COSMIC_SUBSTANCES) {
      const cat = s.category || 'other';
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, []);

  return (
    <div className="space-y-0">
      {/* 分类筛选标签 */}
      <div className="px-3 py-2 border-b border-slate-700/30 sticky top-0 bg-slate-900/95 z-10">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] transition-colors ${categoryFilter === 'all' ? 'bg-cyan-600/80 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-white'}`}
          >
            全部({ALL_COSMIC_SUBSTANCES.length})
          </button>
          {Object.entries(categoryMap).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setCategoryFilter(key)}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] transition-colors ${categoryFilter === key ? `bg-${val.color}-600/80 text-white` : 'bg-slate-800/60 text-slate-400 hover:text-white'}`}
            >
              {val.icon} {val.label}({statsByCategory[key] || 0})
            </button>
          ))}
        </div>
        <div className="text-[10px] text-slate-500 mt-1">
          显示 {filtered.length} / {ALL_COSMIC_SUBSTANCES.length} 种物质
          {filtered.length !== ALL_COSMIC_SUBSTANCES.length && ` (已筛选)`}
        </div>
      </div>

      {/* 物质列表 */}
      <div className="divide-y divide-slate-700/20">
        {filtered.map((s) => {
          const catInfo = categoryMap[s.category || 'exotic'] || categoryMap.exotic;
          const isExpanded = expandedItem === s.formula;
          return (
            <div key={s.formula} className="hover:bg-slate-800/30 transition-colors">
              <button
                onClick={() => setExpandedItem(isExpanded ? null : s.formula)}
                className="w-full px-3 py-2 flex items-center gap-2 text-left"
              >
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{
                  backgroundColor: s.category === 'element' ? '#10b981' :
                    s.category === 'isotope' ? '#3b82f6' :
                    s.category === 'molecule' ? '#06b6d4' :
                    s.category === 'mineral' ? '#f59e0b' :
                    s.category === 'organic' ? '#14b8a6' : '#a855f7'
                }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-slate-200 font-medium">{s.nameCn}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">{s.formula}</span>
                    <span className="text-[9px] rounded-full bg-slate-700/50 px-1.5 py-0.5 text-slate-400">{catInfo.label}</span>
                    <span className="text-[9px] rounded-full bg-slate-700/40 px-1.5 py-0.5 text-slate-500">{s.state}</span>
                    {s.importance === 'critical' && <span className="text-[9px] rounded-full bg-red-900/40 text-red-300 px-1.5 py-0.5">关键</span>}
                    {s.importance === 'theoretical' && <span className="text-[9px] rounded-full bg-purple-900/40 text-purple-300 px-1.5 py-0.5">理论</span>}
                  </div>
                  {!isExpanded && (
                    <div className="text-[10px] text-slate-500 mt-0.5 truncate">{s.note}</div>
                  )}
                </div>
                <span className="text-[10px] text-slate-600 shrink-0">{isExpanded ? '▲' : '▼'}</span>
              </button>
              {isExpanded && (
                <div className="px-3 pb-3 space-y-2">
                  <div className="text-xs text-slate-300">{s.note}</div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[9px] rounded-full bg-cyan-900/30 text-cyan-300 px-2 py-0.5">化学式: {s.formula}</span>
                    <span className="text-[9px] rounded-full bg-amber-900/30 text-amber-300 px-2 py-0.5">英文名: {s.nameEn}</span>
                    <span className="text-[9px] rounded-full bg-violet-900/30 text-violet-300 px-2 py-0.5">物态: {s.state}</span>
                    <span className="text-[9px] rounded-full bg-emerald-900/30 text-emerald-300 px-2 py-0.5">丰度排名: {s.abundance}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500">存在区域:</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {(s.foundIn || []).map((f: string, i: number) => (
                        <span key={i} className="text-[9px] rounded-full bg-slate-700/40 text-slate-400 px-1.5 py-0.5">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-500">未找到匹配物质</div>
        )}
      </div>
    </div>
  );
}
