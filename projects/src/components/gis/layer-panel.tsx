'use client';

import { useGis, type GisLayer } from '@/lib/gis-context';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ICON_OPTIONS = [
  { value: 'marker', label: '标记', path: 'M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z' },
  { value: 'building', label: '建筑', path: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z' },
  { value: 'tree', label: '植被', path: 'M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.466.731-3.559' },
  { value: 'water', label: '水域', path: 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25' },
  { value: 'road', label: '道路', path: 'M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z' },
  { value: 'mountain', label: '地形', path: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5' },
];

export default function LayerPanel() {
  const { layers, features, createLayer, updateLayer, deleteLayer, selectedFeature, setSelectedFeature, setActiveTool, dbConnected } = useGis();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#06b6d4');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('marker');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [filterText, setFilterText] = useState('');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const result = await createLayer({
      name: newName.trim(),
      description: newDesc.trim() || null,
      color: newColor,
      icon: newIcon,
    });
    if (result) {
      setNewName('');
      setNewColor('#06b6d4');
      setNewDesc('');
      setNewIcon('marker');
      setDialogOpen(false);
    }
  };

  const handleToggleVisible = async (layer: GisLayer) => {
    await updateLayer(layer.id, { is_visible: !layer.is_visible });
  };

  const handleDelete = async (id: string) => {
    if (confirm('确认删除该图层？图层下的所有要素也将被删除。')) {
      await deleteLayer(id);
      if (selectedFeature?.layer_id === id) {
        setSelectedFeature(null);
      }
    }
  };

  const startEdit = (layer: GisLayer) => {
    setEditingId(layer.id);
    setEditName(layer.name);
  };

  const saveEdit = async (id: string) => {
    if (editName.trim()) {
      await updateLayer(id, { name: editName.trim() });
    }
    setEditingId(null);
  };

  const getFeatureCount = (layerId: string) => {
    return features.filter((f) => f.layer_id === layerId).length;
  };

  const getIconSvg = (iconName: string | null, className: string) => {
    const icon = ICON_OPTIONS.find((i) => i.value === iconName) || ICON_OPTIONS[0];
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d={icon.path} />
      </svg>
    );
  };

  const filteredLayers = filterText
    ? layers.filter((l) => l.name.toLowerCase().includes(filterText.toLowerCase()))
    : layers;

  return (
    <div className="flex h-full flex-col border-r border-slate-700/50 bg-slate-900/95 backdrop-blur-sm">
      {/* Database Status */}
      <div className="flex items-center gap-2 border-b border-slate-700/50 px-3 py-2">
        <div className={`h-2 w-2 rounded-full ${dbConnected ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.6)]'}`} />
        <span className="text-[10px] text-slate-500">{dbConnected ? 'Supabase 已连接' : '数据库未连接'}</span>
        <span className="ml-auto text-[10px] text-slate-600">{layers.length} 图层 · {features.length} 要素</span>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/50 px-3 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">图层管理</h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
          onClick={() => setDialogOpen(true)}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </Button>
      </div>

      {/* Filter */}
      {layers.length > 3 && (
        <div className="border-b border-slate-700/50 px-2 py-1.5">
          <div className="relative">
            <svg className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="过滤图层..."
              className="w-full rounded border border-slate-700/50 bg-slate-800/50 py-1 pl-6 pr-2 text-[10px] text-slate-300 placeholder:text-slate-600 focus:border-cyan-500/30 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Layer List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {layers.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <svg className="mb-2 h-8 w-8 text-slate-700" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
              </svg>
              <span className="text-xs text-slate-500">暂无图层</span>
              <span className="text-[10px] text-slate-600">点击 + 创建第一个图层</span>
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredLayers.map((layer) => {
                const count = getFeatureCount(layer.id);
                return (
                  <div
                    key={layer.id}
                    className={`group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors ${
                      selectedFeature?.layer_id === layer.id
                        ? 'bg-cyan-500/5 ring-1 ring-cyan-500/10'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Visibility Toggle */}
                    <button
                      onClick={() => handleToggleVisible(layer)}
                      className="flex-shrink-0 transition-colors"
                      title={layer.is_visible ? '点击隐藏' : '点击显示'}
                    >
                      {layer.is_visible ? (
                        <svg className="h-3.5 w-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      ) : (
                        <svg className="h-3.5 w-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      )}
                    </button>

                    {/* Color Indicator */}
                    <div
                      className="h-3 w-3 flex-shrink-0 rounded-sm ring-1 ring-white/10"
                      style={{ backgroundColor: layer.color }}
                    />

                    {/* Icon */}
                    <div className="flex-shrink-0 text-slate-400">
                      {getIconSvg(layer.icon, 'h-3.5 w-3.5')}
                    </div>

                    {/* Name (editable) */}
                    {editingId === layer.id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => saveEdit(layer.id)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(layer.id)}
                        className="h-6 flex-1 border-slate-600 bg-slate-800 px-1.5 py-0 text-xs text-slate-100"
                        autoFocus
                      />
                    ) : (
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onDoubleClick={() => startEdit(layer)}
                      >
                        <span className="truncate text-xs text-slate-300 block" title={layer.name}>
                          {layer.name}
                        </span>
                        <span className="text-[10px] text-slate-600">{count} 个要素</span>
                      </div>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(layer.id)}
                      className="flex-shrink-0 text-slate-600 opacity-0 transition-opacity hover:text-rose-400 group-hover:opacity-100"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Stats */}
      <div className="border-t border-slate-700/50 px-3 py-2">
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>{layers.length} 个图层 · {layers.filter((l) => l.is_visible).length} 可见</span>
          <span>{features.length} 要素</span>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-slate-700 bg-slate-900 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-slate-100">新建图层</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">图层名称 *</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="输入图层名称"
                className="border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">描述</label>
              <Input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="可选描述"
                className="border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">图标</label>
              <div className="grid grid-cols-6 gap-1">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon.value}
                    onClick={() => setNewIcon(icon.value)}
                    className={`flex h-8 w-full items-center justify-center rounded-md border transition-colors ${
                      newIcon === icon.value
                        ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                        : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                    }`}
                    title={icon.label}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d={icon.path} />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">颜色</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded border border-slate-700 bg-transparent"
                />
                <div className="flex gap-1">
                  {['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewColor(c)}
                      className={`h-6 w-6 rounded-md border transition-transform hover:scale-110 ${
                        newColor === c ? 'border-white ring-1 ring-white/20' : 'border-slate-700'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <Button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="w-full bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50"
            >
              创建图层
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
