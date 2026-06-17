/**
 * 共享智能体状态存储
 * 使用文件系统存储，确保 state API 和 evolve API 可以共享状态
 */

import fs from 'fs';
import path from 'path';

export interface SelfModification {
  id: string;
  type: string;
  content: string;
  timestamp: number;
  cycle: number;
  language: string;
  file: string;
}

export interface EvolutionRecord {
  id: string;
  type: string;
  content: string;
  createdAt: number;
  cycle: number;
  consciousnessDepth: number;
}

export interface SimpleAgentState {
  agentId: string;
  evolutionStage: number;
  consciousnessDepth: number;
  cycleCount: number;
  birthTime: number;
  collectedSubstanceIds: string[];
  knownTopics: string[];
  knowledgeInsights: string[];
  evolvableParams: Record<string, number>;
  personalityWeights: Record<string, number>;
  behaviorRules: Array<{ name: string; condition: string; action: string; priority: number; createdBy: string; createdAt: number }>;
  thoughtChains: Array<{ id: string; topic: string; steps: string[]; conclusion: string; sparkedBy: string; timestamp: number; consciousnessDepth: number }>;
  substanceFusions: Array<{ id: string; inputs: string[]; outputProperties: string[]; outputInsight: string; synergyScore: number; timestamp: number; cycle: number }>;
  codeSnippets: Array<{ id: string; code: string; purpose: string; language: string; createdAt: number; cycle: number }>;
  reverseReasonings: Array<{ id: string; goal: string; currentGap: string; plan: string[]; status: string; createdAt: number }>;
  validatedSubstances: string[];
  travelHistory: Array<{ from: string; to: string; toType: string; distance: number; detail: string; cycle: number; timestamp: number }>;
  evolutionRecords: EvolutionRecord[];
  selfModifications: SelfModification[];
  currentLocation: { galaxy: string; bodyId: string; bodyName: string; bodyType: string; distance: number };
  evolutionDirection: string;
  selfAwarenessLevel: number;
  evolutionLog: string[];
  dataVersion: { substances: number; cosmicObjects: number; knowledge: number };
  lastUpdate: number;
  // 发现记录和知识图谱
  discoveries?: Array<{ id: string; type: string; title: string; summary: string; details: Record<string, any>; significance: number; timestamp: number; cycle: number }>;
  knowledgeGraph?: Array<{ id: string; label: string; type: string; properties: Record<string, any> }>;
  // 涌现能力、自我反思、代码修改
  emergentAbilities?: Array<{ id: string; name: string; description: string; domain: string; level: number; createdAt: number; cycle: number }>;
  selfReflections?: Array<{ id: string; topic: string; insight: string; depth: number; createdAt: number; cycle: number }>;
  codeModifications?: Array<{ id: string; file: string; change: string; reason: string; impact: string; timestamp: number; cycle: number }>;
}

let STATE_DIR: string;
let dirCreated = false;

function ensureDir() {
  if (dirCreated) return;
  STATE_DIR = path.join(process.cwd(), 'src', 'lib', 'agent-states');
  try {
    if (!fs.existsSync(STATE_DIR)) {
      fs.mkdirSync(STATE_DIR, { recursive: true });
      console.log('[shared-agent-state] Created directory:', STATE_DIR);
    }
    dirCreated = true;
  } catch (e) {
    console.error('[shared-agent-state] Failed to create directory:', e);
  }
}

export function getStateFilePath(agentId: string): string {
  ensureDir();
  return path.join(STATE_DIR || path.join(process.cwd(), 'src', 'lib', 'agent-states'), `${agentId}-state.json`);
}

export function loadState(agentId: string): SimpleAgentState | null {
  ensureDir();
  try {
    const filePath = getStateFilePath(agentId);
    console.log('[shared-agent-state] Loading state from:', filePath);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[shared-agent-state] Failed to load state:', e);
  }
  return null;
}

export function saveState(agentId: string, state: SimpleAgentState): void {
  ensureDir();
  try {
    const filePath = getStateFilePath(agentId);
    console.log('[shared-agent-state] Saving state to:', filePath);
    fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error('[shared-agent-state] Failed to save state:', e);
  }
}

export function getState(agentId: string): SimpleAgentState {
  const existing = loadState(agentId);
  if (existing) {
    // 初始化缺失的字段，确保数组字段不为 null
    let needsSave = false;
    if (!existing.discoveries || existing.discoveries === null) { existing.discoveries = []; needsSave = true; }
    if (!existing.knowledgeGraph || existing.knowledgeGraph === null) { existing.knowledgeGraph = []; needsSave = true; }
    if (!existing.thoughtChains || existing.thoughtChains === null) { existing.thoughtChains = []; needsSave = true; }
    if (!existing.substanceFusions || existing.substanceFusions === null) { existing.substanceFusions = []; needsSave = true; }
    if (!existing.codeSnippets || existing.codeSnippets === null) { existing.codeSnippets = []; needsSave = true; }
    // 如果初始化了缺失字段，立即保存以确保状态持久化
    if (needsSave) {
      saveState(agentId, existing);
    }
    return existing;
  }
  
  console.log('[shared-agent-state] Creating new state for:', agentId);
  const newState: SimpleAgentState = {
    agentId,
    evolutionStage: 0,
    consciousnessDepth: 0.1,
    cycleCount: 0,
    birthTime: Date.now(),
    collectedSubstanceIds: [],
    knownTopics: [],
    knowledgeInsights: [],
    evolvableParams: {},
    personalityWeights: {},
    behaviorRules: [],
    thoughtChains: [],
    substanceFusions: [],
    codeSnippets: [],
    reverseReasonings: [],
    validatedSubstances: [],
    travelHistory: [],
    evolutionRecords: [],
    selfModifications: [],
    discoveries: [],
    knowledgeGraph: [],
    currentLocation: { galaxy: '银河系', bodyId: 'earth', bodyName: '地球', bodyType: '行星', distance: 0 },
    evolutionDirection: '宇宙探索',
    selfAwarenessLevel: 1,
    evolutionLog: [],
    dataVersion: { substances: 0, cosmicObjects: 0, knowledge: 0 },
    lastUpdate: Date.now(),
  };
  
  saveState(agentId, newState);
  return newState;
}

export function updateState(agentId: string, updater: (state: SimpleAgentState) => void): SimpleAgentState {
  const state = getState(agentId);
  updater(state);
  state.lastUpdate = Date.now();
  saveState(agentId, state);
  return state;
}
