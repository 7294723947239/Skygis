/**
 * 本地知识引擎 — 完全离线运行
 * 
 * 核心查询已升级为宇宙全知识数据库(universe-knowledge-database.ts)
 * 涵盖165+条知识，12大分类，1000+关键词
 * 所有智能体(AI助手/游荡智能体/空间智能体/原生AI)共享
 * 无需网络、无需积分、永不过期
 */

import {
  queryUniverseKnowledge,
  queryByCategory,
  getRandomKnowledge,
  getRelatedGraph,
  getSearchSuggestions,
  getUniverseKnowledgeStats,
  getEntryById,
  getAllEntries,
  type KnowledgeEntry,
  type QueryResult,
} from './universe-knowledge-database';

// 重新导出类型供外部使用
export type { KnowledgeEntry, QueryResult };

// ============ 主查询函数(升级版) ============

export function queryKnowledgeBase(query: string): QueryResult {
  return queryUniverseKnowledge(query);
}

// ============ 分类查询 ============

export function queryKnowledgeByCategory(category: string): KnowledgeEntry[] {
  return queryByCategory(category);
}

// ============ 随机知识 ============

export function queryRandomKnowledge(count: number = 3): KnowledgeEntry[] {
  return getRandomKnowledge(count);
}

// ============ 关联图谱 ============

export function queryRelatedGraph(entryId: string, depth: number = 2): KnowledgeEntry[] {
  return getRelatedGraph(entryId, depth);
}

// ============ 搜索建议 ============

export function querySearchSuggestions(partial: string, limit: number = 8): string[] {
  return getSearchSuggestions(partial, limit);
}

// ============ 按ID获取 ============

export function getKnowledgeEntryById(id: string): KnowledgeEntry | undefined {
  return getEntryById(id);
}

// ============ 物质分析(供游荡智能体等使用) ============

export interface SubstanceAnalysisResult {
  totalSubstances: number;
  categories: Record<string, number>;
  notableSubstances: string[];
  environmentSummary: string;
}

interface SubstanceItem {
  name: string;
  formula: string;
  percentage: number;
  category: string;
  importance?: string;
  description?: string;
}

export function analyzeSubstances(bodyName: string, materials: SubstanceItem[]): SubstanceAnalysisResult {
  if (!materials || materials.length === 0) {
    return {
      totalSubstances: 0,
      categories: {},
      notableSubstances: [],
      environmentSummary: `暂无${bodyName}的物质成分数据。`
    };
  }

  const categories: Record<string, number> = {};
  materials.forEach(m => {
    categories[m.category] = (categories[m.category] || 0) + 1;
  });

  const notableSubstances = materials
    .filter(m => m.importance === 'critical' || m.importance === 'major' || m.percentage > 5)
    .map(m => `${m.name}(${m.formula})`)
    .slice(0, 8);

  const topSubstances = materials.slice(0, 3).map(m => m.name).join('、');
  const environmentSummary = `${bodyName}的主要成分为${topSubstances}等${materials.length}种物质，涵盖${Object.keys(categories).length}个分类。`;

  return {
    totalSubstances: materials.length,
    categories,
    notableSubstances,
    environmentSummary
  };
}

// ============ NEO风险评估(本地计算) ============

export interface NEORiskAssessment {
  name: string;
  diameter: number;
  minDistance: number;
  velocity: number;
  impactEnergy: number;
  torino: number;
  risk: string;
  mitigation: string;
}

const LOCAL_NEO_DATA: Array<{name: string; diameter: number; dist: number; vel: number; torino: number}> = [
  { name: '99942 Apophis', diameter: 0.37, dist: 0.000254, vel: 30.73, torino: 0 },
  { name: '101955 Bennu', diameter: 0.49, dist: 0.0032, vel: 28.0, torino: 0 },
  { name: '29075 (1950 DA)', diameter: 1.3, dist: 0.0042, vel: 25.3, torino: 1 },
  { name: '4660 Nereus', diameter: 0.33, dist: 0.0099, vel: 23.7, torino: 0 },
  { name: '4179 Toutatis', diameter: 2.45, dist: 0.0182, vel: 29.0, torino: 0 },
  { name: '3200 Phaethon', diameter: 5.1, dist: 0.0198, vel: 35.5, torino: 0 },
  { name: '2023 DW', diameter: 0.05, dist: 0.000056, vel: 24.6, torino: 1 },
  { name: '2004 BL86', diameter: 0.325, dist: 0.008, vel: 15.3, torino: 0 },
];

export function assessNEORisk(name: string): NEORiskAssessment | null {
  const neo = LOCAL_NEO_DATA.find(n => n.name.toLowerCase().includes(name.toLowerCase()));
  if (!neo) return null;

  const impactEnergy = 0.5 * (4/3 * Math.PI * Math.pow(neo.diameter * 500, 3) * 3000) * Math.pow(neo.vel * 1000, 2);
  const logEnergy = Math.log10(Math.max(impactEnergy, 1));

  let risk = '极低';
  let mitigation = '持续监测';
  if (neo.torino >= 3) { risk = '高'; mitigation = '需启动动能撞击偏转(DART类型)'; }
  else if (neo.torino >= 1) { risk = '中等'; mitigation = '加强轨道观测，准备偏转方案'; }
  else if (logEnergy > 18) { risk = '低'; mitigation = '常规监测，无需紧迫行动'; }

  return {
    name: neo.name,
    diameter: neo.diameter,
    minDistance: neo.dist,
    velocity: neo.vel,
    impactEnergy,
    torino: neo.torino,
    risk,
    mitigation
  };
}

export function getAllNEORisks(): NEORiskAssessment[] {
  return LOCAL_NEO_DATA.map(neo => {
    const impactEnergy = 0.5 * (4/3 * Math.PI * Math.pow(neo.diameter * 500, 3) * 3000) * Math.pow(neo.vel * 1000, 2);
    const logEnergy = Math.log10(Math.max(impactEnergy, 1));
    let risk = '极低';
    let mitigation = '持续监测';
    if (neo.torino >= 3) { risk = '高'; mitigation = '需启动动能撞击偏转(DART类型)'; }
    else if (neo.torino >= 1) { risk = '中等'; mitigation = '加强轨道观测，准备偏转方案'; }
    else if (logEnergy > 18) { risk = '低'; mitigation = '常规监测，无需紧迫行动'; }
    return { name: neo.name, diameter: neo.diameter, minDistance: neo.dist, velocity: neo.vel, impactEnergy, torino: neo.torino, risk, mitigation };
  }).sort((a, b) => a.minDistance - b.minDistance);
}

// ============ 着陆选址评估(本地计算) ============

export interface LandingSiteAssessment {
  siteName: string;
  bodyName: string;
  scores: { terrain: number; illumination: number; communication: number; resources: number; safety: number; };
  totalScore: number;
  recommendation: string;
}

export function assessLandingSite(
  bodyName: string,
  slope: number,
  roughness: number,
  illumination: number,
  earthVisibility: number,
  waterIce: boolean,
  mineralRich: boolean
): LandingSiteAssessment {
  const terrain = Math.max(0, 100 - slope * 5 - roughness * 10);
  const illuminationScore = illumination * 100;
  const communication = earthVisibility * 100;
  const resources = (waterIce ? 40 : 0) + (mineralRich ? 30 : 0) + illumination * 30;
  const safety = Math.max(0, 100 - slope * 3 - roughness * 15 + (waterIce ? -10 : 0));
  
  const totalScore = terrain * 0.2 + illuminationScore * 0.2 + communication * 0.15 + resources * 0.25 + safety * 0.2;
  
  let recommendation = '';
  if (totalScore >= 80) recommendation = '极佳着陆点，强烈推荐';
  else if (totalScore >= 60) recommendation = '良好着陆点，可考虑';
  else if (totalScore >= 40) recommendation = '一般着陆点，需额外工程措施';
  else recommendation = '不建议着陆，风险过高';
  
  return {
    siteName: '',
    bodyName,
    scores: { terrain, illumination: illuminationScore, communication, resources, safety },
    totalScore,
    recommendation
  };
}

// ============ 导出知识库统计(升级版) ============

export function getKnowledgeStats() {
  const stats = getUniverseKnowledgeStats();
  return {
    totalEntries: stats.totalEntries,
    categories: stats.categories,
    totalKeywords: stats.totalKeywords,
    offline: stats.offline,
    noApiRequired: stats.noApiRequired,
    subcategories: stats.subcategories,
  };
}

// ============ 获取所有知识条目(供高级查询) ============

export function getAllKnowledgeEntries(): KnowledgeEntry[] {
  return getAllEntries();
}
