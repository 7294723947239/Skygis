'use client';

import { useGis, type GisFeature } from '@/lib/gis-context';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const FEATURE_TYPE_ICONS: Record<string, string> = {
  point: 'M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z',
  line: 'M2.25 18 9 11.25l4.306 4.306a2.25 2.25 0 0 0 3.183 0L21.75 10.5',
  polygon: 'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z',
};

const FEATURE_TYPE_LABELS: Record<string, string> = {
  point: '点',
  line: '线',
  polygon: '面',
};

export default function FeaturePanel() {
  const {
    features,
    layers,
    selectedFeature,
    setSelectedFeature,
    createFeature,
    updateFeature,
    deleteFeature,
    activeTool,
    dbConnected,
  } = useGis();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [featureType, setFeatureType] = useState('point');
  const [layerId, setLayerId] = useState('__none__');
  const [isCreating, setIsCreating] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Populate form when a feature is selected
  useEffect(() => {
    if (selectedFeature) {
      setTitle(selectedFeature.title);
      setDescription(selectedFeature.description || '');
      setLatitude(String(selectedFeature.latitude));
      setLongitude(String(selectedFeature.longitude));
      setFeatureType(selectedFeature.feature_type);
      setLayerId(selectedFeature.layer_id || '__none__');
      setIsCreating(false);
      setIsEditing(false);
    } else if (activeTool === 'add-point') {
      setIsCreating(true);
      setTitle('');
      setDescription('');
      setLatitude('');
      setLongitude('');
      setFeatureType('point');
      setIsEditing(false);
    }
  }, [selectedFeature, activeTool]);

  const handleCreate = useCallback(async () => {
    if (!title.trim() || !latitude || !longitude) return;
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    const result = await createFeature({
      title: title.trim(),
      description: description.trim() || null,
      feature_type: featureType,
      latitude: lat,
      longitude: lng,
      layer_id: layerId === '__none__' ? null : layerId,
    });
    if (result) {
      setTitle('');
      setDescription('');
      setLatitude('');
      setLongitude('');
      setIsCreating(false);
    }
  }, [title, description, latitude, longitude, featureType, layerId, createFeature]);

  const handleUpdate = async () => {
    if (!selectedFeature || !title.trim()) return;
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    await updateFeature(selectedFeature.id, {
      title: title.trim(),
      description: description.trim() || null,
      latitude: lat,
      longitude: lng,
      feature_type: featureType,
      layer_id: layerId === '__none__' ? null : layerId,
    });
    setIsEditing(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确认删除该要素？')) {
      await deleteFeature(id);
      setSelectedFeature(null);
    }
  };

  const getLayerName = (lid: string | null) => {
    if (!lid) return '未分类';
    const layer = layers.find((l) => l.id === lid);
    return layer?.name || '未知图层';
  };

  const getLayerColor = (lid: string | null) => {
    if (!lid) return '#64748b';
    const layer = layers.find((l) => l.id === lid);
    return layer?.color || '#64748b';
  };

  const filteredFeatures = filterText
    ? features.filter((f) =>
        f.title.toLowerCase().includes(filterText.toLowerCase()) ||
        (f.description || '').toLowerCase().includes(filterText.toLowerCase())
      )
    : features;

  // Group features by layer
  const groupedFeatures = filteredFeatures.reduce((acc, f) => {
    const key = f.layer_id || '__none__';
    if (!acc[key]) acc[key] = [];
    acc[key].push(f);
    return acc;
  }, {} as Record<string, GisFeature[]>);

  return (
    <div className="flex h-full flex-col border-l border-slate-700/50 bg-slate-900/95 backdrop-blur-sm">
      {/* Database Status */}
      <div className="flex items-center gap-2 border-b border-slate-700/50 px-3 py-2">
        <div className={`h-2 w-2 rounded-full ${dbConnected ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.6)]'}`} />
        <span className="text-[10px] text-slate-500">{dbConnected ? '数据库已连接' : '数据库未连接'}</span>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/50 px-3 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {selectedFeature ? '要素详情' : '要素列表'}
        </h2>
        <div className="flex items-center gap-1">
          {selectedFeature && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-slate-400 hover:text-slate-200"
              onClick={() => { setSelectedFeature(null); setIsCreating(false); setIsEditing(false); }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
            onClick={() => { setSelectedFeature(null); setIsCreating(true); setIsEditing(false); setTitle(''); setDescription(''); setLatitude(''); setLongitude(''); setFeatureType('point'); setLayerId('__none__'); }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Feature List View */}
          {!selectedFeature && !isCreating && (
            <>
              {/* Filter */}
              {features.length > 3 && (
                <div className="mb-2">
                  <div className="relative">
                    <svg className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <input
                      type="text"
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      placeholder="搜索要素..."
                      className="w-full rounded border border-slate-700/50 bg-slate-800/50 py-1 pl-6 pr-2 text-[10px] text-slate-300 placeholder:text-slate-600 focus:border-cyan-500/30 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {features.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <svg className="mb-2 h-8 w-8 text-slate-700" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <span className="text-xs text-slate-500">暂无要素</span>
                  <span className="text-[10px] text-slate-600">使用地图工具添加或点击 + 手动创建</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(groupedFeatures).map(([groupId, groupFeatures]) => (
                    <div key={groupId}>
                      <div className="flex items-center gap-1.5 px-1 pb-1">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: getLayerColor(groupId === '__none__' ? null : groupId) }}
                        />
                        <span className="text-[10px] font-medium text-slate-500">
                          {getLayerName(groupId === '__none__' ? null : groupId)}
                        </span>
                        <span className="text-[10px] text-slate-600">({groupFeatures.length})</span>
                      </div>
                      <div className="space-y-0.5">
                        {groupFeatures.map((feature) => (
                          <button
                            key={feature.id}
                            className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-slate-800/50"
                            onClick={() => setSelectedFeature(feature)}
                          >
                            <div className="flex-shrink-0">
                              <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d={FEATURE_TYPE_ICONS[feature.feature_type] || FEATURE_TYPE_ICONS.point} />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="block truncate text-xs text-slate-300">{feature.title}</span>
                              <span className="block text-[10px] text-slate-600 font-mono">
                                {feature.latitude.toFixed(4)}, {feature.longitude.toFixed(4)}
                              </span>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(feature.id); }}
                              className="flex-shrink-0 text-slate-600 opacity-0 transition-opacity hover:text-rose-400 group-hover:opacity-100"
                            >
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                              </svg>
                            </button>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Feature Detail / Edit View */}
          {(selectedFeature || isCreating) && (
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  {isCreating ? '新建要素' : (isEditing ? '编辑要素' : '要素详情')}
                </span>
                {selectedFeature && !isEditing && !isCreating && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                      onClick={() => setIsEditing(true)}
                    >
                      <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                      编辑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                      onClick={() => handleDelete(selectedFeature!.id)}
                    >
                      <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                      删除
                    </Button>
                  </div>
                )}
              </div>

              {/* Read-only detail view */}
              {selectedFeature && !isEditing && !isCreating && (
                <div className="space-y-2">
                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d={FEATURE_TYPE_ICONS[selectedFeature.feature_type] || FEATURE_TYPE_ICONS.point} />
                      </svg>
                      <span className="text-sm font-medium text-slate-200">{selectedFeature.title}</span>
                      <span className="rounded bg-slate-700/50 px-1.5 py-0.5 text-[10px] text-slate-400">
                        {FEATURE_TYPE_LABELS[selectedFeature.feature_type] || selectedFeature.feature_type}
                      </span>
                    </div>
                    {selectedFeature.description && (
                      <p className="text-xs text-slate-400 mb-2">{selectedFeature.description}</p>
                    )}
                    <div className="space-y-1 text-[10px]">
                      <div className="flex items-center gap-2 text-slate-500">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                        <span className="font-mono">{selectedFeature.latitude.toFixed(6)}, {selectedFeature.longitude.toFixed(6)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getLayerColor(selectedFeature.layer_id) }} />
                        <span>{getLayerName(selectedFeature.layer_id)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit/Create Form */}
              {(isEditing || isCreating) && (
                <div className="space-y-2.5">
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">标题 *</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="要素名称"
                      className="border-slate-700 bg-slate-800/50 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500/30 focus:ring-cyan-500/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">描述</label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="可选描述"
                      className="border-slate-700 bg-slate-800/50 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500/30 focus:ring-cyan-500/10"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs text-slate-400">纬度 *</label>
                      <Input
                        type="number"
                        step="any"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="39.9042"
                        className="border-slate-700 bg-slate-800/50 font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500/30 focus:ring-cyan-500/10"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-slate-400">经度 *</label>
                      <Input
                        type="number"
                        step="any"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="116.4074"
                        className="border-slate-700 bg-slate-800/50 font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500/30 focus:ring-cyan-500/10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">类型</label>
                    <Select value={featureType} onValueChange={setFeatureType}>
                      <SelectTrigger className="border-slate-700 bg-slate-800/50 text-sm text-slate-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-slate-700 bg-slate-800">
                        <SelectItem value="point">点 (Point)</SelectItem>
                        <SelectItem value="line">线 (Line)</SelectItem>
                        <SelectItem value="polygon">面 (Polygon)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">所属图层</label>
                    <Select value={layerId} onValueChange={setLayerId}>
                      <SelectTrigger className="border-slate-700 bg-slate-800/50 text-sm text-slate-100">
                        <SelectValue placeholder="选择图层" />
                      </SelectTrigger>
                      <SelectContent className="border-slate-700 bg-slate-800">
                        <SelectItem value="__none__">未分类</SelectItem>
                        {layers.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
                              {l.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-1">
                    {isEditing && (
                      <Button
                        variant="ghost"
                        className="flex-1 text-slate-400 hover:text-slate-200"
                        onClick={() => setIsEditing(false)}
                      >
                        取消
                      </Button>
                    )}
                    <Button
                      className="flex-1 bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50"
                      onClick={isCreating ? handleCreate : handleUpdate}
                      disabled={!title.trim() || !latitude || !longitude}
                    >
                      {isCreating ? '创建要素' : '保存修改'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-slate-700/50 px-3 py-2">
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>{features.length} 个要素</span>
          {activeTool === 'add-point' && (
            <span className="flex items-center gap-1 text-cyan-400">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              点击地图添加
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
