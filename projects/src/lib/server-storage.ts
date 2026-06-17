/**
 * 服务端持久化存储 - 用于智能体状态和代码修改记录
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const STATE_FILE = path.join(DATA_DIR, 'agent-states.json');
const MOD_LOG_FILE = path.join(DATA_DIR, 'code-modifications.json');

// 确保数据目录存在
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 读取智能体状态
export function getAgentStates(): Record<string, any> {
  ensureDataDir();
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('读取智能体状态失败:', e);
  }
  return {};
}

// 保存智能体状态
export function saveAgentStates(states: Record<string, any>) {
  ensureDataDir();
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(states, null, 2), 'utf-8');
  } catch (e) {
    console.error('保存智能体状态失败:', e);
  }
}

// 读取代码修改记录
export function getCodeModifications(): any[] {
  ensureDataDir();
  try {
    if (fs.existsSync(MOD_LOG_FILE)) {
      const data = fs.readFileSync(MOD_LOG_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('读取代码修改记录失败:', e);
  }
  return [];
}

// 添加代码修改记录
export function addCodeModification(modification: any) {
  ensureDataDir();
  try {
    const mods = getCodeModifications();
    mods.unshift({
      ...modification,
      id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    });
    // 只保留最近100条记录
    fs.writeFileSync(MOD_LOG_FILE, JSON.stringify(mods.slice(0, 100), null, 2), 'utf-8');
  } catch (e) {
    console.error('保存代码修改记录失败:', e);
  }
}

// 获取单个智能体的修改记录
export function getAgentModifications(agentType: string): any[] {
  const allMods = getCodeModifications();
  return allMods.filter(m => m.agentType === agentType).slice(0, 50);
}
