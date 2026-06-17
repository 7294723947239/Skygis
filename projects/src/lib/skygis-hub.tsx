// SkyGIS 类型定义
'use client';

// 面板类型
export type SkyGISPanelId = 
  | 'layers' 
  | 'properties' 
  | 'tools' 
  | 'search' 
  | 'legend' 
  | 'measure'
  | 'agent'
  | 'neo'
  | 'gravity-field'
  | 'geological-evolution'
  | 'navigation-planner'
  | 'evolution-history'
  | 'remote-sensing'
  | 'asteroid-discovery'
  | 'digital-twin'
  | 'spatial-agent'
  | 'native-ai'
  | 'engineering'
  | 'smart-command'
  | 'ai-assistant'
  | 'celestial-layers'
  | 'wander-agent'
  | 'gravity'
  | 'solar-db'
  | 'time-controller'
  | 'cosmic-gis';

// 天体类型
export interface CelestialBody {
  id: string;
  name: string;
  nameCn?: string;
  type: string;
  position: [number, number, number];
  radius?: number;
  mass?: number;
  orbitRadius?: number;
  orbitPeriod?: number;
  parentId?: string;
}

// 信号标签
export const SIGNAL_LABELS: Record<string, string> = {
  DB_CONNECTED: 'DB连接',
  DB_ERROR: 'DB错误',
  AGENT_RUNNING: '智能体运行中',
  AGENT_IDLE: '智能体空闲',
  VIEW_3D: '3D模式',
  VIEW_2D: '2D模式',
  VIEW_GAUSSIAN: '高斯模式',
  'focus-body': '聚焦天体',
  'assess-neo-risk': 'NEO风险评估',
  'compare-gravity': '引力对比',
  'plan-orbit': '轨道规划',
  'plan-mining': '采矿规划',
  'build-twin': '构建数字孪生',
  'select-landing': '选择着陆点',
  'view-geological': '地质视图',
  'analyze-remote': '遥感分析',
  'detect-craters': '撞击坑检测',
  'run-simulation': '运行模拟',
  'classify-asteroid': '小行星分类',
  'wander-collect': '漫游采集',
};

// 信号类型
export type mmSignalType = keyof typeof SIGNAL_LABELS;
export type HubSignalType = mmSignalType;

// 数字孪生状态
export interface TwinState {
  enabled: boolean;
  activeNodes: string[];
  simulationTime: number;
  dataStreams: Record<string, unknown>;
  built?: boolean;
  precision?: number | string;
  updateInterval?: string;
  bodyCount?: number;
  lastUpdate?: string;
  bodies?: CelestialBody[];
}

export interface DigitalTwinState extends TwinState {}

// 智能命令结果
export interface SmartCommandResult {
  type?: 'detection' | 'collision' | 'sampling' | 'observation';
  data?: Record<string, unknown>;
  timestamp?: number;
  query?: string;
  intent?: string;
  modules?: string[];
  summary?: string;
  actions?: Array<{
    signal: string;
    label: string;
    payload?: Record<string, unknown>;
  }>;
  bodyAnalysis?: {
    body?: string;
    gravity?: number;
    radius?: number;
    mass?: number;
    temp?: number;
    escapeVelocity?: number;
  };
  orbitPlan?: {
    from?: string;
    to?: string;
    deltaV?: number;
    transferTime?: number;
    hohmannWindow?: string;
  };
  neoRisk?: {
    name?: string;
    probability?: string;
    level?: string;
  };
  landingSites?: Array<{
    name?: string;
    lat?: number;
    lng?: number;
    score?: number;
    hazards?: string[];
    safety?: number;
    resource?: number;
    science?: number;
  }>;
  geologicalEra?: {
    body?: string;
    era?: string;
    yearsAgo?: number;
    features?: string[];
  };
  remoteSensing?: {
    body?: string;
    bands?: string[];
    findings?: string[];
  };
}

// 信号事件
export interface mmSignalEvent {
  type: mmSignalType;
  source?: string;
  target?: string;
  targetPanel?: SkyGISPanelId;
  payload?: Record<string, unknown>;
}

export interface HubSignalEvent extends mmSignalEvent {
  timestamp?: number;
  label?: string;
  icon?: string;
}

// 信号（带标签）
export interface HubSignal extends mmSignalEvent {
  timestamp?: number;
  label?: string;
  icon?: string;
}

// 建议项
export interface Suggestion {
  icon: string;
  label: string;
}

// 空操作函数
const noop = (..._args: unknown[]) => {};
const noopWithArg = <T = unknown>(_arg?: T) => {};

// Mock 对象
export const mockmm = {
  state: {
    activePanels: [] as SkyGISPanelId[],
    celestialBodies: [] as CelestialBody[],
    smartCommands: [] as SmartCommandResult[],
    selectedBodyId: null as string | null,
    viewMode: '3d' as const,
    dbConnected: true,
    agentRunning: true,
    twinState: {
      enabled: false,
      activeNodes: [],
      simulationTime: Date.now(),
      dataStreams: {},
      built: false,
    },
  },
  focusedBody: null as CelestialBody | null,
  twinState: {
    enabled: false,
    activeNodes: [],
    simulationTime: Date.now(),
    dataStreams: {},
    built: false,
  } as TwinState,
  suggestions: [] as Suggestion[],
  lastSignal: null as mmSignalEvent | null,
  signals: [] as HubSignal[],
  smartCommandResult: null as SmartCommandResult | null,
  togglePanel: noop,
  selectBody: noop,
  setViewMode: noop,
  addSmartCommand: noop,
  emitSignal: noopWithArg<mmSignalEvent>,
  openPanel: noop,
  setTwinState: noop,
  setFocusedBody: noop,
  setSmartCommandResult: noop,
  emitSignalWithTarget: noopWithArg<HubSignalEvent>,
};

// useSkyGISmm hook
export function useSkyGISmm() {
  return mockmm;
}

// Provider
export function SkyGISmmProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// 兼容性别名
export { mockmm as mockHub };
export { useSkyGISmm as useSkyGISHub };
export { SkyGISmmProvider as SkyGISHubProvider };
