'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/** 服务端进化状态（与route.ts中的ServerAgentState一致） */
export interface ServerEvoState {
  agentId: string;
  agentType: string;
  evolutionStage: number;
  consciousnessDepth: number;
  cycleCount: number;
  totalRuntimeMs: number;
  birthTime: number;
  lastEvolveTime: number;
  collectedSubstanceIds: string[];
  knownTopics: string[];
  knowledgeInsights: string[];
  evolvableParams: Record<string, number>;
  personalityWeights: Record<string, number>;
  behaviorRules: Array<{ name: string; condition: string; action: string; priority: number; createdBy: string; createdAt: number }>;
  thoughtChains: Array<{ id: string; question: string; steps: string[]; conclusion: string; depth: number; createdAt: number }>;
  substanceFusions: Array<{ id: string; substanceIds: string[]; result: string; insight: string; createdAt: number }>;
  evolutionRecords: Array<{ id: string; type: string; content: string; detail?: string; createdAt: number; cycle: number; consciousnessDepth: number }>;
  selfModifications: Array<{ id: string; target: string; before: number; after: number; reason: string; depth: number; createdAt: number; cycle: number }>;
  currentLocation: { galaxy: string; bodyId: string; bodyName: string; bodyType: string; distance: number };
  evolutionDirection: string;
  selfAwarenessLevel: number;
  evolutionLog: string[];
  dataVersion: { substances: number; cosmicObjects: number; knowledge: number };
  codeSnippets?: Array<{ id: string; code: string; purpose: string; createdAt: number; cycle: number }>;
  validatedSubstances?: string[];
  reverseReasonings?: Array<{ id: string; goal: string; currentGap: string; plan: string[]; status: string; createdAt: number }>;
  travelHistory?: Array<{ from: string; to: string; toType: string; distance: number; detail: string; cycle: number; timestamp: number }>;
}

export interface EvoFetchResult {
  state: ServerEvoState | null;
  meta: {
    ageText: string;
    missedCycles: number;
    serverLoopRunning: boolean;
    stageName: string;
  } | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * 从服务端API获取智能体进化状态
 * 替代直接读客户端引擎（客户端引擎总是从0开始）
 */
export function useAgentEvolution(agentType: 'explorer' | 'sage' | 'nomad', pollMs = 4000): EvoFetchResult {
  const [state, setState] = useState<ServerEvoState | null>(null);
  const [meta, setMeta] = useState<EvoFetchResult['meta']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/agent/state?agent=${agentType}`);
      if (!res.ok) {
        if (mountedRef.current) setError(`HTTP ${res.status}`);
        return;
      }
      const data = await res.json();
      if (data.success && data.state) {
        if (mountedRef.current) {
          setState(data.state);
          setMeta(data.meta || null);
          setError(null);
          setLoading(false);
        }
      } else {
        if (mountedRef.current) {
          setError(data.error || 'Unknown error');
          setLoading(false);
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Network error');
        setLoading(false);
      }
    }
  }, [agentType]);

  useEffect(() => {
    mountedRef.current = true;
    fetchState();
    const timer = setInterval(fetchState, pollMs);
    return () => {
      mountedRef.current = false;
      clearInterval(timer);
    };
  }, [fetchState, pollMs]);

  return { state, meta, loading, error, refetch: fetchState };
}
