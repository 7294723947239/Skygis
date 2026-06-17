'use client';

import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import {
  getOfflineLayers, saveOfflineLayer, deleteOfflineLayer as removeOfflineLayer,
  getOfflineFeatures, saveOfflineFeature, deleteOfflineFeature as removeOfflineFeature,
  generateId,
  type OfflineLayer, type OfflineFeature,
} from '@/lib/offline-storage';

export type SkyGISPanelType = 'architecture' | 'geological' | 'resource' | 'urban' | 'cosmic';

export interface GisLayer {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  is_visible: boolean;
  user_id: string;
  created_at: string;
  updated_at: string | null;
}

export interface GisFeature {
  id: string;
  title: string;
  description: string | null;
  feature_type: string;
  latitude: number;
  longitude: number;
  geometry: Record<string, unknown> | null;
  properties: Record<string, unknown> | null;
  layer_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string | null;
  gis_layers?: { name: string; color: string } | null;
}

export type MapTool = 'select' | 'add-point' | 'draw-line' | 'draw-polygon' | 'measure' | 'measure-distance' | 'measure-area' | 'profile';

export type ViewMode = '2d' | '3d' | 'gk';

export interface SkyGISOverlayPoint {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  color: string;
  category: string;
  level?: string;
  panel: 'geological' | 'resource' | 'urban';
  rawData?: Record<string, unknown>;
}

export interface AnalysisResult {
  type: 'distance' | 'area' | 'elevation' | 'profile';
  value: number;
  unit: string;
  points?: { lat: number; lng: number; alt: number }[];
  label?: string;
}

interface GisContextType {
  layers: GisLayer[];
  features: GisFeature[];
  selectedFeature: GisFeature | null;
  activeTool: MapTool;
  mapCenter: [number, number];
  mapZoom: number;
  loading: boolean;
  searchQuery: string;
  viewMode: ViewMode;
  analysisResult: AnalysisResult | null;
  mouseCoordinate: { lat: number; lng: number; alt: number } | null;
  flyToPosition: { lat: number; lng: number; alt?: number } | null;
  skygisOverlays: SkyGISOverlayPoint[];
  skygisSelectedId: string | null;
  setActiveTool: (tool: MapTool) => void;
  setSelectedFeature: (feature: GisFeature | null) => void;
  setMapCenter: (center: [number, number]) => void;
  setMapZoom: (zoom: number) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setMouseCoordinate: (coord: { lat: number; lng: number; alt: number } | null) => void;
  setFlyToPosition: (pos: { lat: number; lng: number; alt?: number } | null) => void;
  setSkygisSelectedId: (id: string | null) => void;
  dbConnected: boolean;
  registerSkygisPanel: (panel: SkyGISPanelType, points: SkyGISOverlayPoint[]) => void;
  unregisterSkygisPanel: (panel: SkyGISPanelType) => void;
  fetchLayers: () => Promise<void>;
  fetchFeatures: () => Promise<void>;
  createLayer: (data: Partial<GisLayer>) => Promise<GisLayer | null>;
  updateLayer: (id: string, data: Partial<GisLayer>) => Promise<GisLayer | null>;
  deleteLayer: (id: string) => Promise<boolean>;
  createFeature: (data: Partial<GisFeature>) => Promise<GisFeature | null>;
  updateFeature: (id: string, data: Partial<GisFeature>) => Promise<GisFeature | null>;
  deleteFeature: (id: string) => Promise<boolean>;
  toggleLayerVisibility: (id: string) => Promise<void>;
  focusFeature: (feature: GisFeature) => void;
}

const GisContext = createContext<GisContextType | undefined>(undefined);

export function GisProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [layers, setLayers] = useState<GisLayer[]>([]);
  const [features, setFeatures] = useState<GisFeature[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<GisFeature | null>(null);
  const [activeTool, setActiveTool] = useState<MapTool>('select');
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.9042, 116.4074]);
  const [mapZoom, setMapZoom] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('2d');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [mouseCoordinate, setMouseCoordinate] = useState<{ lat: number; lng: number; alt: number } | null>(null);
  const [flyToPosition, setFlyToPosition] = useState<{ lat: number; lng: number; alt?: number } | null>(null);
  const [skygisSelectedId, setSkygisSelectedId] = useState<string | null>(null);
  const [skygisPanelData, setSkygisPanelData] = useState<Record<string, SkyGISOverlayPoint[]>>({});
  const [dbConnected, setDbConnected] = useState(false);

  // Computed overlays from all panels - memoized
  const skygisOverlays = useMemo(() => Object.values(skygisPanelData).flat(), [skygisPanelData]);

  const registerSkygisPanel = useCallback((panel: SkyGISPanelType, points: SkyGISOverlayPoint[]) => {
    setSkygisPanelData(prev => ({ ...prev, [panel]: points }));
  }, []);

  const unregisterSkygisPanel = useCallback((panel: SkyGISPanelType) => {
    setSkygisPanelData(prev => {
      const next = { ...prev };
      delete next[panel];
      return next;
    });
    // Clear selection if it belonged to this panel
    setSkygisSelectedId(prev => {
      if (prev && prev.startsWith(panel.substring(0, 3))) return null;
      return prev;
    });
  }, []);

  const getToken = useCallback(() => user?.id || '', [user]);

  // 尝试云端获取，失败则从离线存储读取
  const fetchLayers = useCallback(async () => {
    const token = getToken();
    if (!token) {
      // 离线模式：从localStorage读取
      const offlineLayers = getOfflineLayers();
      setLayers(offlineLayers.map(l => ({ ...l, is_visible: l.is_visible ?? true })));
      return;
    }
    try {
      const res = await fetch('/api/layers', {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.layers) setLayers(data.layers);
    } catch (err) {
      console.warn('云端获取图层失败，使用离线数据:', err);
      const offlineLayers = getOfflineLayers();
      setLayers(offlineLayers.map(l => ({ ...l, is_visible: l.is_visible ?? true })));
    }
  }, [getToken]);

  const fetchFeatures = useCallback(async () => {
    const token = getToken();
    if (!token) {
      // 离线模式
      const offlineFeatures = getOfflineFeatures();
      setFeatures(offlineFeatures.map(f => ({
        ...f,
        latitude: typeof f.latitude === 'string' ? parseFloat(f.latitude as unknown as string) : f.latitude,
        longitude: typeof f.longitude === 'string' ? parseFloat(f.longitude as unknown as string) : f.longitude,
      })));
      return;
    }
    try {
      const res = await fetch('/api/features', {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.features) {
        const normalized = data.features.map((f: GisFeature) => ({
          ...f,
          latitude: typeof f.latitude === 'string' ? parseFloat(f.latitude) : f.latitude,
          longitude: typeof f.longitude === 'string' ? parseFloat(f.longitude) : f.longitude,
        }));
        setFeatures(normalized);
      }
    } catch (err) {
      console.warn('云端获取要素失败，使用离线数据:', err);
      const offlineFeatures = getOfflineFeatures();
      setFeatures(offlineFeatures.map(f => ({
        ...f,
        latitude: typeof f.latitude === 'string' ? parseFloat(f.latitude as unknown as string) : f.latitude,
        longitude: typeof f.longitude === 'string' ? parseFloat(f.longitude as unknown as string) : f.longitude,
      })));
    }
  }, [getToken]);

  useEffect(() => {
    setLoading(true);
    if (user) {
      Promise.all([fetchLayers(), fetchFeatures()])
        .then(() => setDbConnected(true))
        .catch(() => setDbConnected(false))
        .finally(() => setLoading(false));
    } else {
      // 离线/访客模式：从本地存储加载数据
      fetchLayers().catch(() => {});
      fetchFeatures().catch(() => {});
      setDbConnected(false);
      setLoading(false);
    }
  }, [user, fetchLayers, fetchFeatures]);

  const createLayer = useCallback(async (data: Partial<GisLayer>): Promise<GisLayer | null> => {
    const token = getToken();
    // 离线模式：存到localStorage
    if (!token) {
      const offlineLayer: OfflineLayer = {
        id: generateId(),
        name: data.name || '未命名图层',
        description: data.description || '',
        color: data.color || '#06b6d4',
        icon: data.icon || 'layer',
        is_visible: data.is_visible ?? true,
        user_id: 'offline',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      saveOfflineLayer(offlineLayer);
      const gisLayer = offlineLayer as unknown as GisLayer;
      setLayers((prev) => [...prev, gisLayer]);
      toast.success('图层已创建(离线)', { description: gisLayer.name });
      return gisLayer;
    }
    try {
      const res = await fetch('/api/layers', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.layer) {
        setLayers((prev) => [...prev, result.layer]);
        saveOfflineLayer(result.layer as unknown as OfflineLayer);
        toast.success('图层已创建', { description: result.layer.name });
        return result.layer;
      }
      toast.error('创建图层失败', { description: result.error || '未知错误' });
      return null;
    } catch (err) {
      console.warn('云端创建图层失败，使用离线存储:', err);
      const offlineLayer: OfflineLayer = {
        id: generateId(),
        name: data.name || '未命名图层',
        description: data.description || '',
        color: data.color || '#06b6d4',
        icon: data.icon || 'layer',
        is_visible: data.is_visible ?? true,
        user_id: 'offline',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      saveOfflineLayer(offlineLayer);
      const gisLayer = offlineLayer as unknown as GisLayer;
      setLayers((prev) => [...prev, gisLayer]);
      toast.success('图层已创建(离线)', { description: gisLayer.name });
      return gisLayer;
    }
  }, [getToken]);

  const updateLayer = useCallback(async (id: string, data: Partial<GisLayer>): Promise<GisLayer | null> => {
    const token = getToken();
    if (!token) {
      // 离线模式
      const layers = getOfflineLayers();
      const existing = layers.find(l => l.id === id);
      if (existing) {
        const updated = { ...existing, ...data, updated_at: new Date().toISOString() };
        saveOfflineLayer(updated);
        const gisLayer = updated as unknown as GisLayer;
        setLayers((prev) => prev.map((l) => (l.id === id ? gisLayer : l)));
        return gisLayer;
      }
      return null;
    }
    try {
      const res = await fetch('/api/layers', {
        method: 'PUT',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      const result = await res.json();
      if (result.layer) {
        setLayers((prev) => prev.map((l) => (l.id === id ? result.layer : l)));
        saveOfflineLayer(result.layer as unknown as OfflineLayer);
        return result.layer;
      }
      return null;
    } catch {
      return null;
    }
  }, [getToken]);

  const deleteLayer = useCallback(async (id: string): Promise<boolean> => {
    const token = getToken();
    if (!token) {
      removeOfflineLayer(id);
      setLayers((prev) => prev.filter((l) => l.id !== id));
      setFeatures((prev) => prev.filter((f) => f.layer_id !== id));
      toast.success('图层已删除(离线)');
      return true;
    }
    try {
      const res = await fetch(`/api/layers?id=${id}`, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setLayers((prev) => prev.filter((l) => l.id !== id));
        setFeatures((prev) => prev.filter((f) => f.layer_id !== id));
        removeOfflineLayer(id);
        toast.success('图层已删除');
        return true;
      }
      toast.error('删除图层失败');
      return false;
    } catch {
      removeOfflineLayer(id);
      setLayers((prev) => prev.filter((l) => l.id !== id));
      setFeatures((prev) => prev.filter((f) => f.layer_id !== id));
      toast.success('图层已删除(离线)');
      return true;
    }
  }, [getToken]);

  const createFeature = useCallback(async (data: Partial<GisFeature>): Promise<GisFeature | null> => {
    const token = getToken();
    if (!token) {
      const offlineFeature: OfflineFeature = {
        id: generateId(),
        title: data.title || '未命名要素',
        description: data.description || '',
        feature_type: data.feature_type || 'point',
        latitude: data.latitude ?? 0,
        longitude: data.longitude ?? 0,
        geometry: data.geometry ?? null,
        properties: data.properties ?? null,
        layer_id: data.layer_id ?? null,
        user_id: 'offline',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      saveOfflineFeature(offlineFeature);
      const gisFeature = offlineFeature as unknown as GisFeature;
      setFeatures((prev) => [gisFeature, ...prev]);
      toast.success('要素已创建(离线)');
      return gisFeature;
    }
    try {
      const res = await fetch('/api/features', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.feature) {
        const f = result.feature;
        const normalized = {
          ...f,
          latitude: typeof f.latitude === 'string' ? parseFloat(f.latitude) : f.latitude,
          longitude: typeof f.longitude === 'string' ? parseFloat(f.longitude) : f.longitude,
        };
        setFeatures((prev) => [normalized, ...prev]);
        saveOfflineFeature(normalized as unknown as OfflineFeature);
        return normalized;
      }
      toast.error('创建要素失败');
      return null;
    } catch {
      const offlineFeature: OfflineFeature = {
        id: generateId(),
        title: data.title || '未命名要素',
        description: data.description || '',
        feature_type: data.feature_type || 'point',
        latitude: data.latitude ?? 0,
        longitude: data.longitude ?? 0,
        geometry: data.geometry ?? null,
        properties: data.properties ?? null,
        layer_id: data.layer_id ?? null,
        user_id: 'offline',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      saveOfflineFeature(offlineFeature);
      const gisFeature = offlineFeature as unknown as GisFeature;
      setFeatures((prev) => [gisFeature, ...prev]);
      toast.success('要素已创建(离线)');
      return gisFeature;
    }
  }, [getToken]);

  const updateFeature = useCallback(async (id: string, data: Partial<GisFeature>): Promise<GisFeature | null> => {
    const token = getToken();
    if (!token) {
      const features = getOfflineFeatures();
      const existing = features.find(f => f.id === id);
      if (existing) {
        const updated = { ...existing, ...data, updated_at: new Date().toISOString() };
        saveOfflineFeature(updated);
        const gisFeature = updated as unknown as GisFeature;
        setFeatures((prev) => prev.map((item) => (item.id === id ? gisFeature : item)));
        if (selectedFeature?.id === id) setSelectedFeature(gisFeature);
        return gisFeature;
      }
      return null;
    }
    try {
      const res = await fetch('/api/features', {
        method: 'PUT',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      const result = await res.json();
      if (result.feature) {
        const f = result.feature;
        const normalized = {
          ...f,
          latitude: typeof f.latitude === 'string' ? parseFloat(f.latitude) : f.latitude,
          longitude: typeof f.longitude === 'string' ? parseFloat(f.longitude) : f.longitude,
        };
        setFeatures((prev) => prev.map((item) => (item.id === id ? normalized : item)));
        if (selectedFeature?.id === id) setSelectedFeature(normalized);
        saveOfflineFeature(normalized as unknown as OfflineFeature);
        return normalized;
      }
      return null;
    } catch {
      return null;
    }
  }, [getToken, selectedFeature]);

  const deleteFeature = useCallback(async (id: string): Promise<boolean> => {
    const token = getToken();
    if (!token) {
      removeOfflineFeature(id);
      setFeatures((prev) => prev.filter((f) => f.id !== id));
      if (selectedFeature?.id === id) setSelectedFeature(null);
      toast.success('要素已删除(离线)');
      return true;
    }
    try {
      const res = await fetch(`/api/features?id=${id}`, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setFeatures((prev) => prev.filter((f) => f.id !== id));
        if (selectedFeature?.id === id) setSelectedFeature(null);
        removeOfflineFeature(id);
        toast.success('要素已删除');
        return true;
      }
      toast.error('删除要素失败');
      return false;
    } catch {
      removeOfflineFeature(id);
      setFeatures((prev) => prev.filter((f) => f.id !== id));
      if (selectedFeature?.id === id) setSelectedFeature(null);
      toast.success('要素已删除(离线)');
      return true;
    }
  }, [getToken, selectedFeature]);

  const toggleLayerVisibility = useCallback(async (id: string) => {
    const layer = layers.find((l) => l.id === id);
    if (!layer) return;
    await updateLayer(id, { is_visible: !layer.is_visible });
  }, [layers, updateLayer]);

  const focusFeature = useCallback((feature: GisFeature) => {
    setSelectedFeature(feature);
    setMapCenter([feature.latitude, feature.longitude]);
    setMapZoom(15);
  }, []);

  return (
    <GisContext.Provider
      value={{
        layers, features, selectedFeature, activeTool, mapCenter, mapZoom, loading, searchQuery,
        viewMode, analysisResult, mouseCoordinate, flyToPosition, skygisOverlays, skygisSelectedId,
        setActiveTool, setSelectedFeature, setMapCenter, setMapZoom, setSearchQuery,
        setViewMode, setAnalysisResult, setMouseCoordinate, setFlyToPosition,
        registerSkygisPanel, unregisterSkygisPanel, setSkygisSelectedId, dbConnected,
        fetchLayers, fetchFeatures, createLayer, updateLayer, deleteLayer,
        createFeature, updateFeature, deleteFeature, toggleLayerVisibility, focusFeature,
      }}
    >
      {children}
    </GisContext.Provider>
  );
}

export function useGis() {
  const context = useContext(GisContext);
  if (context === undefined) {
    throw new Error('useGis must be used within a GisProvider');
  }
  return context;
}
