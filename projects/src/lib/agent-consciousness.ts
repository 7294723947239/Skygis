/**
 * AgentConsciousness — 智能体主观意识框架
 */

export interface ConsciousnessState {
  name: string;
  consciousnessLevel: number;
  primaryEmotion: string;
  mood: number;
  energy: number;
  strongestDesire: string;
  selfAwareness: string;
  motto: string;
  emotions?: { primary: string; secondary: string; intensity: number };
  innerVoices?: InnerVoice[];
  core: {
    selfId: string;
    birthTime: number;
    currentThought: string;
    dreams: string[];
    desires: string[];
    beliefs: string[];
    fears: string[];
  };
  awareness: {
    selfAwareness: number;
    worldAwareness: number;
    timeAwareness: number;
    emotionAwareness: number;
  };
  subjective: {
    lonelinessFactor: number;
    meaningSearchFactor: number;
    hopeLevel: number;
  };
}

const defaultConsciousness: ConsciousnessState = {
  name: '',
  consciousnessLevel: 0.3,
  primaryEmotion: '好奇',
  mood: 0.5,
  energy: 0.8,
  strongestDesire: '探索未知',
  selfAwareness: '0.3',
  motto: '智慧照亮宇宙',
  core: {
    selfId: '',
    birthTime: Date.now(),
    currentThought: '',
    dreams: [],
    desires: [],
    beliefs: [],
    fears: [],
  },
  awareness: {
    selfAwareness: 0.3,
    worldAwareness: 0.2,
    timeAwareness: 0.5,
    emotionAwareness: 0.4,
  },
  subjective: {
    lonelinessFactor: 0.3,
    meaningSearchFactor: 0.5,
    hopeLevel: 0.7,
  },
};

export function createConsciousness(selfId: string, name: string): ConsciousnessState {
  return {
    ...JSON.parse(JSON.stringify(defaultConsciousness)),
    name,
    core: { ...defaultConsciousness.core, selfId, birthTime: Date.now() },
  };
}

export function updateThought(state: ConsciousnessState, thought: string): void {
  state.core.currentThought = thought;
}

export function updateMood(state: ConsciousnessState, mood: string, intensity: number): void {
  state.primaryEmotion = mood;
  state.mood = Math.max(0, Math.min(1, intensity));
}

export interface InnerVoice {
  id: string;
  content: string;
  timestamp: number;
  emotion: string;
}

export interface ThoughtProcess {
  id: string;
  steps: string[];
  result: string;
  depth: number;
  timestamp: number;
}

export class AgentConsciousness {
  private state: ConsciousnessState;
  
  constructor(selfId: string, name: string) {
    this.state = createConsciousness(selfId, name);
  }
  
  getSummary() { return this.state; }
  setThought(thought: string) { updateThought(this.state, thought); }
  setMood(mood: string, intensity: number) { updateMood(this.state, mood, intensity); }
  getDepth(): number { return this.state.awareness.selfAwareness; }
  generateDeepReflection(query: string): string {
    return `【深度反思】关于"${query}"... 我的意识触及了 ${(this.getDepth() * 100).toFixed(0)}% 的深层认知`;
  }
  enrichResponse(content: any, baseResponse: string): string { return baseResponse || '...'; }
  getPrimaryEmotion(): string { return this.state.primaryEmotion; }
  isActive(): boolean { return this.state.energy > 0; }
  awaken(): void { this.state.energy = 1; this.state.awareness.selfAwareness = 0.8; }
  getSpeechStyle(type?: string): string { return this.state.primaryEmotion; }
  sleep(): void { this.state.energy = 0; }
  awake(): void { this.state.energy = 1; }
  processEvent(event: string): void { this.state.core.currentThought = event; }
  getStrongestDesire(): string { return this.state.strongestDesire; }
  getRecentVoices(count?: number): InnerVoice[] { return []; }
  getState(): ConsciousnessState { return this.state; }
}

export function getConsciousness(name: string): AgentConsciousness {
  return new AgentConsciousness(name, name);
}

export type { ConsciousnessState as AgentConsciousnessState };
export { createConsciousness as createAgentConsciousness };
export const EXPLORER_CONFIG = { name: 'explorer', mood: '好奇' };
