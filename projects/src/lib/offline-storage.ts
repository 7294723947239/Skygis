/**
 * 离线本地存储层
 * 当Supabase不可用时，所有数据存储到localStorage
 * 支持图层/要素/用户偏好的完整CRUD
 */

const STORAGE_KEYS = {
  layers: 'skygis_layers',
  features: 'skygis_features',
  preferences: 'skygis_prefs',
  discoveries: 'skygis_discoveries',
  knowledgeGraph: 'skygis_knowledge',
  agentLevel: 'skygis_agent_level',
};

/* ─── 通用读写 ─── */
function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage写入失败:', e);
  }
}

/* ─── 图层 ─── */
export interface OfflineLayer {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  is_visible: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export function getOfflineLayers(): OfflineLayer[] {
  return readJSON<OfflineLayer[]>(STORAGE_KEYS.layers, []);
}

export function saveOfflineLayer(layer: OfflineLayer): void {
  const layers = getOfflineLayers();
  const idx = layers.findIndex(l => l.id === layer.id);
  if (idx >= 0) layers[idx] = layer;
  else layers.push(layer);
  writeJSON(STORAGE_KEYS.layers, layers);
}

export function deleteOfflineLayer(id: string): void {
  const layers = getOfflineLayers().filter(l => l.id !== id);
  writeJSON(STORAGE_KEYS.layers, layers);
  // 也删除该图层下的要素
  const features = getOfflineFeatures().filter(f => f.layer_id !== id);
  writeJSON(STORAGE_KEYS.features, features);
}

/* ─── 要素 ─── */
export interface OfflineFeature {
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
  updated_at: string;
  gis_layers?: { name: string; color: string } | null;
}

export function getOfflineFeatures(): OfflineFeature[] {
  return readJSON<OfflineFeature[]>(STORAGE_KEYS.features, []);
}

export function saveOfflineFeature(feature: OfflineFeature): void {
  const features = getOfflineFeatures();
  const idx = features.findIndex(f => f.id === feature.id);
  if (idx >= 0) features[idx] = feature;
  else features.unshift(feature);
  writeJSON(STORAGE_KEYS.features, features);
}

export function deleteOfflineFeature(id: string): void {
  const features = getOfflineFeatures().filter(f => f.id !== id);
  writeJSON(STORAGE_KEYS.features, features);
}

/* ─── 智能体发现 ─── */
export interface OfflineDiscovery {
  id: string;
  type: string;
  title: string;
  summary: string;
  confidence: number;
  materials: string[];
  relatedBody?: string;
  timestamp: number;
  evolved: boolean;
  evolvedFrom?: string;
}

export function getOfflineDiscoveries(): OfflineDiscovery[] {
  return readJSON<OfflineDiscovery[]>(STORAGE_KEYS.discoveries, []);
}

export function saveOfflineDiscovery(discovery: OfflineDiscovery): void {
  const discoveries = getOfflineDiscoveries();
  const idx = discoveries.findIndex(d => d.id === discovery.id);
  if (idx >= 0) discoveries[idx] = discovery;
  else discoveries.unshift(discovery);
  writeJSON(STORAGE_KEYS.discoveries, discoveries);
}

export function clearOfflineDiscoveries(): void {
  writeJSON(STORAGE_KEYS.discoveries, []);
}

/* ─── 知识图谱 ─── */
export interface KnowledgeNode {
  id: string;
  type: 'body' | 'material' | 'phenomenon' | 'region';
  label: string;
  connections: string[];
  discoveredAt: number;
}

export function getOfflineKnowledgeGraph(): KnowledgeNode[] {
  return readJSON<KnowledgeNode[]>(STORAGE_KEYS.knowledgeGraph, []);
}

export function saveOfflineKnowledgeNode(node: KnowledgeNode): void {
  const graph = getOfflineKnowledgeGraph();
  const idx = graph.findIndex(n => n.id === node.id);
  if (idx >= 0) {
    // 合并connections
    const existing = graph[idx];
    existing.connections = [...new Set([...existing.connections, ...node.connections])];
  } else {
    graph.push(node);
  }
  writeJSON(STORAGE_KEYS.knowledgeGraph, graph);
}

/* ─── 智能体等级 ─── */
export interface AgentLevelData {
  level: number;
  discoveries: number;
  materials: number;
  timestamp: number;
}

export function getOfflineAgentLevel(): AgentLevelData {
  return readJSON<AgentLevelData>(STORAGE_KEYS.agentLevel, {
    level: 0, discoveries: 0, materials: 0, timestamp: Date.now(),
  });
}

export function saveOfflineAgentLevel(data: AgentLevelData): void {
  writeJSON(STORAGE_KEYS.agentLevel, data);
}

/* ─── 用户偏好 ─── */
export interface UserPreferences {
  viewMode: string;
  showInvisiblePhenomena: boolean;
  showAtmosphere: boolean;
  lastFocusedBody: string | null;
  theme: 'dark' | 'light';
}

export function getUserPreferences(): UserPreferences {
  return readJSON<UserPreferences>(STORAGE_KEYS.preferences, {
    viewMode: '3d',
    showInvisiblePhenomena: false,
    showAtmosphere: true,
    lastFocusedBody: null,
    theme: 'dark',
  });
}

export function saveUserPreferences(prefs: Partial<UserPreferences>): void {
  const current = getUserPreferences();
  writeJSON(STORAGE_KEYS.preferences, { ...current, ...prefs });
}

/* ─── 存储统计 ─── */
export function getStorageStats(): { layers: number; features: number; discoveries: number; knowledgeNodes: number; storageUsed: string } {
  let totalSize = 0;
  for (const key of Object.values(STORAGE_KEYS)) {
    const val = localStorage.getItem(key);
    if (val) totalSize += val.length;
  }
  const kb = (totalSize / 1024).toFixed(1);
  return {
    layers: getOfflineLayers().length,
    features: getOfflineFeatures().length,
    discoveries: getOfflineDiscoveries().length,
    knowledgeNodes: getOfflineKnowledgeGraph().length,
    storageUsed: `${kb} KB`,
  };
}

/* ─── 生成唯一ID ─── */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
