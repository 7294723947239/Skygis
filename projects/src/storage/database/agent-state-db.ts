/**
 * 智能体状态数据库操作
 * 使用 Supabase 实现智能体状态的持久化存储
 */

import { getSupabaseClient } from './supabase-client';

// 智能体状态接口
export interface AgentStateRecord {
  id: number;
  agent_id: string;
  state_data: Record<string, any>;
  cycle_count: number;
  consciousness_depth: string;
  evolution_stage: number;
  last_update: string;
}

export interface UpsertAgentStateInput {
  agentId: string;
  stateData: Record<string, any>;
  cycleCount: number;
  consciousnessDepth: number;
  evolutionStage: number;
}

/**
 * 获取智能体状态
 */
export async function getAgentState(agentId: string): Promise<AgentStateRecord | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('agent_states')
    .select('*')
    .eq('agent_id', agentId)
    .maybeSingle();
  
  if (error) throw new Error(`获取智能体状态失败: ${error.message}`);
  return data;
}

/**
 * 获取所有智能体状态
 */
export async function getAllAgentStates(): Promise<AgentStateRecord[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('agent_states')
    .select('*')
    .order('agent_id');
  
  if (error) throw new Error(`获取所有智能体状态失败: ${error.message}`);
  return data || [];
}

/**
 * 插入或更新智能体状态
 */
export async function upsertAgentState(input: UpsertAgentStateInput): Promise<AgentStateRecord> {
  const client = getSupabaseClient();
  
  // 先查询是否存在
  const existing = await getAgentState(input.agentId);
  
  if (existing) {
    // 更新
    const { data, error } = await client
      .from('agent_states')
      .update({
        state_data: input.stateData,
        cycle_count: input.cycleCount,
        consciousness_depth: input.consciousnessDepth.toString(),
        evolution_stage: input.evolutionStage,
        last_update: new Date().toISOString(),
      })
      .eq('agent_id', input.agentId)
      .select()
      .single();
    
    if (error) throw new Error(`更新智能体状态失败: ${error.message}`);
    return data;
  } else {
    // 插入
    const { data, error } = await client
      .from('agent_states')
      .insert({
        agent_id: input.agentId,
        state_data: input.stateData,
        cycle_count: input.cycleCount,
        consciousness_depth: input.consciousnessDepth.toString(),
        evolution_stage: input.evolutionStage,
      })
      .select()
      .single();
    
    if (error) throw new Error(`插入智能体状态失败: ${error.message}`);
    return data;
  }
}

/**
 * 更新智能体周期计数
 */
export async function incrementCycleCount(agentId: string, increment: number = 1): Promise<number> {
  const existing = await getAgentState(agentId);
  if (!existing) return increment;
  
  const newCount = existing.cycle_count + increment;
  const client = getSupabaseClient();
  const { error } = await client
    .from('agent_states')
    .update({
      cycle_count: newCount,
      last_update: new Date().toISOString(),
    })
    .eq('agent_id', agentId);
  
  if (error) throw new Error(`更新周期计数失败: ${error.message}`);
  return newCount;
}

/**
 * 更新意识深度
 */
export async function updateConsciousnessDepth(agentId: string, depth: number): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client
    .from('agent_states')
    .update({
      consciousness_depth: depth.toString(),
      last_update: new Date().toISOString(),
    })
    .eq('agent_id', agentId);
  
  if (error) throw new Error(`更新意识深度失败: ${error.message}`);
}

/**
 * 删除智能体状态
 */
export async function deleteAgentState(agentId: string): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client
    .from('agent_states')
    .delete()
    .eq('agent_id', agentId);
  
  if (error) throw new Error(`删除智能体状态失败: ${error.message}`);
}

/**
 * 检查智能体状态是否存在
 */
export async function agentStateExists(agentId: string): Promise<boolean> {
  const state = await getAgentState(agentId);
  return state !== null;
}
