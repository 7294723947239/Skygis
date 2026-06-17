/**
 * 宇宙全知识数据库 — 主入口
 * 
 * 整合所有知识域，提供统一查询接口
 * 所有智能体(AI助手/游荡智能体/空间智能体/原生AI)共享
 * 完全离线可用，无需网络和API
 * 
 * 知识域覆盖：
 * - 天体: 太阳+8行星+5矮行星+15+卫星+小天体+彗星 (~35条)
 * - 物理: 引力/时空/电磁/等离子体/核物理/量子/大气 (~25条)
 * - 宇宙学: 大爆炸/CMB/暴胀/暗物质/暗能量/宇宙结构/演化 (~18条)
 * - 恒星: 演化/HR图/主序/巨星/白矮星/超新星/中子星/黑洞/双星/变星 (~15条)
 * - 星系: 分类/银河系/仙女座/本星系群/AGN/星系团/星云/星际介质 (~20条)
 * - 物质: 元素/分子/矿物/天体化学/r-过程 (~15条)
 * - 轨道: 力学/转移/行星际航行 (~3条)
 * - 地质: 撞击/火山/地貌/板块/大灭绝/间歇泉/地热 (~10条)
 * - 遥感: 光谱学/遥感/黑体/多普勒 (~4条)
 * - 工程: 推进/ISRU/居住/电源/载人 (~5条)
 * - 探测: Apollo/Voyager/Cassini/Curiosity/Perseverance/JWST/新视野/Artemis (~10条)
 * - 前沿: 系外行星/地外生命/原行星盘/采样返回/NEO防御 (~6条)
 * 
 * 总计: ~165+ 条知识条目
 */

// ============ 类型定义 ============

export interface KnowledgeEntry {
  id: string;
  keywords: string[];
  category: string;
  subcategory: string;
  title: string;
  content: string;
  relatedIds: string[];
}

export interface QueryResult {
  answer: string;
  sources: string[];
  confidence: number;
  suggestions: string[];
  relatedTopics: string[];
}

export interface KnowledgeStats {
  totalEntries: number;
  categories: string[];
  subcategories: string[];
  totalKeywords: number;
  offline: boolean;
  noApiRequired: boolean;
}

// ============ 导入所有知识域 ============

import { celestialEntries } from './knowledge-bodies';
import { physicsCosmologyEntries } from './knowledge-physics-cosmology';
import { stellarGalacticEntries } from './knowledge-stellar-galactic';
import { substancesAppliedEntries } from './knowledge-substances-applied';

// ============ 导入SkyGIS全数据集 ============
import {
  FORCE_ENGINES, COORDINATE_SYSTEMS, COSMIC_DATABASE_CATEGORIES,
  SOLAR_STAR, SOLAR_PLANETS, SOLAR_DWARF_PLANETS, SOLAR_MAJOR_MOONS,
  searchForceEngine, searchCoordinateSystem, searchCosmicCategory, searchSolarBody,
  getCosmicDatabaseStats
} from './skygis-dataset';

// ============ 合并知识库 ============

const ALL_ENTRIES: KnowledgeEntry[] = [
  ...celestialEntries,
  ...physicsCosmologyEntries,
  ...stellarGalacticEntries,
  ...substancesAppliedEntries,
];

// 构建索引
const ENTRY_MAP = new Map<string, KnowledgeEntry>();
ALL_ENTRIES.forEach(e => ENTRY_MAP.set(e.id, e));

// 构建关键词倒排索引(加速搜索)
const KEYWORD_INDEX = new Map<string, Set<string>>();
ALL_ENTRIES.forEach(entry => {
  entry.keywords.forEach(kw => {
    const kwLower = kw.toLowerCase();
    if (!KEYWORD_INDEX.has(kwLower)) {
      KEYWORD_INDEX.set(kwLower, new Set());
    }
    KEYWORD_INDEX.get(kwLower)!.add(entry.id);
  });
  // 标题也作为关键词索引
  const titleLower = entry.title.toLowerCase();
  if (!KEYWORD_INDEX.has(titleLower)) {
    KEYWORD_INDEX.set(titleLower, new Set());
  }
  KEYWORD_INDEX.get(titleLower)!.add(entry.id);
});

// ============ 增强型查询引擎 ============

function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[，。！？、；：""''（）【】《》\[\]{}·…—\-\/\\]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 0);
}

function matchScore(query: string, entry: KnowledgeEntry): number {
  const qLower = query.toLowerCase();
  const tokens = tokenize(query);
  
  let score = 0;
  
  // 1. 精确标题匹配 (最高优先级)
  if (entry.title.toLowerCase() === qLower) return 100;
  
  // 2. 标题包含查询
  const titleLower = entry.title.toLowerCase();
  if (titleLower.includes(qLower) || qLower.includes(titleLower)) return 90;
  
  // 3. 标题部分词匹配
  for (const token of tokens) {
    if (titleLower.includes(token)) score += 25;
  }
  
  // 4. 关键词精确匹配
  for (const kw of entry.keywords) {
    const kwLower = kw.toLowerCase();
    if (qLower === kwLower) { score += 30; continue; }
    if (qLower.includes(kwLower) || kwLower.includes(qLower)) { score += 20; continue; }
    for (const token of tokens) {
      if (token.length >= 2 && (kwLower.includes(token) || token.includes(kwLower))) { score += 10; }
    }
  }
  
  // 5. 分类匹配
  for (const token of tokens) {
    if (entry.category.toLowerCase().includes(token)) score += 5;
    if (entry.subcategory.toLowerCase().includes(token)) score += 5;
  }
  
  // 6. 内容匹配(较弱的信号)
  const contentLower = entry.content.toLowerCase();
  for (const token of tokens) {
    if (token.length >= 2 && contentLower.includes(token)) score += 3;
  }
  
  return score;
}

// 同义词/别名扩展表
const SYNONYM_MAP: Record<string, string[]> = {
  '太阳系': ['solar system', '行星系', '太阳系结构'],
  '月球': ['moon', '月亮', 'lunar'],
  '火星': ['mars', '红色星球'],
  '地球': ['earth', '蓝星'],
  '木星': ['jupiter', '朱庇特'],
  '土星': ['saturn'],
  '金星': ['venus', '启明'],
  '水星': ['mercury'],
  '天王星': ['uranus'],
  '海王星': ['neptune'],
  '冥王星': ['pluto', '矮行星'],
  '黑洞': ['black hole', '事件视界'],
  '超新星': ['supernova', '恒星爆炸'],
  '中子星': ['neutron star', '脉冲星', 'pulsar', '磁星'],
  '白矮星': ['white dwarf', '简并星'],
  '暗物质': ['dark matter', 'WIMP'],
  '暗能量': ['dark energy', '宇宙常数'],
  '大爆炸': ['big bang', '宇宙起源'],
  '引力': ['gravity', '万有引力', '重力'],
  '磁场': ['magnetic field', '磁层'],
  '太阳风': ['solar wind', '等离子体流'],
  '极光': ['aurora', '北极光'],
  '轨道': ['orbit', '公转'],
  '火山': ['volcanism', '岩浆'],
  '撞击坑': ['impact crater', '陨石坑'],
  '水': ['water', 'H₂O', '冰'],
  '甲烷': ['methane', 'CH₄'],
  '光谱': ['spectroscopy', '光谱学'],
  '遥感': ['remote sensing', '雷达'],
  '推进': ['propulsion', '火箭', '引擎'],
  '生命': ['life', '地外生命', '生物'],
  '系外行星': ['exoplanet', '外行星'],
  '宜居': ['habitable', '宜居带'],
  '核聚变': ['fusion', '聚变'],
  '核合成': ['nucleosynthesis', 'BBN'],
  '星云': ['nebula'],
  '星系': ['galaxy'],
  '银河': ['milky way'],
  '宇宙线': ['cosmic ray'],
  '辐射': ['radiation'],
  '探测': ['mission', '探测任务'],
  '基地': ['base', '栖息地', 'habitat'],
  'ISRU': ['原位资源', '就地取材'],
  '潮汐': ['tidal', '潮汐力'],
  '演化': ['evolution'],
  '分类': ['classification', 'taxonomy'],
  '物质': ['substance', 'material', '成分'],
  '元素': ['element', '化学元素', '周期表'],
  '分子': ['molecule', '星际分子'],
  '矿物': ['mineral'],
  '力': ['force', '力引擎', '引力', '电磁力', '强核力', '弱核力'],
  '坐标': ['coordinate', '坐标系', '参考系'],
  '电磁': ['electromagnetic', '电磁力', '电磁场'],
  '核力': ['nuclear', '强核力', '弱核力', '强相互作用'],
  '等离子体': ['plasma', '电离'],
  '尘埃': ['dust', '宇宙尘埃', '星际尘埃'],
  '离心': ['centrifugal', '离心力'],
  '科里奥利': ['coriolis', '科里奥利力'],
  '惯性': ['inertial', '惯性力'],
};

function expandQuery(query: string): string[] {
  const queries = [query];
  const qLower = query.toLowerCase();
  
  for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
    if (qLower.includes(key.toLowerCase()) || synonyms.some(s => qLower.includes(s.toLowerCase()))) {
      synonyms.forEach(s => {
        if (!qLower.includes(s.toLowerCase())) {
          queries.push(s);
        }
      });
    }
  }
  
  return queries;
}

// ============ 主查询函数 ============

export function queryUniverseKnowledge(query: string): QueryResult {
  if (!query || query.trim().length === 0) {
    return {
      answer: '请输入您想了解的宇宙知识。我可以回答关于天体、物理、宇宙学、恒星、星系、物质、轨道、地质、遥感、工程、探测任务等方面的问题。',
      sources: [],
      confidence: 0,
      suggestions: ['太阳', '黑洞', '暗物质', '大爆炸', '木卫二', '系外行星', '轨道力学', '太空采矿'],
      relatedTopics: []
    };
  }

  // 同义词扩展查询
  const expandedQueries = expandQuery(query);
  
  // 对每个扩展查询进行匹配
  const allScored = new Map<string, number>();
  
  for (const q of expandedQueries) {
    ALL_ENTRIES.forEach(entry => {
      const score = matchScore(q, entry);
      if (score > 0) {
        const prev = allScored.get(entry.id) || 0;
        allScored.set(entry.id, Math.max(prev, score));
      }
    });
  }
  
  // 排序取top结果
  const scored = Array.from(allScored.entries())
    .map(([id, score]) => ({ id, entry: ENTRY_MAP.get(id)!, score }))
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    const categories = [...new Set(ALL_ENTRIES.map(e => e.category))];
    return {
      answer: `暂未找到"${query}"的相关知识。当前知识库覆盖 ${ALL_ENTRIES.length} 个知识条目，涵盖：${categories.join('、')}。试试更具体的关键词，如天体名称、物理现象、物质名称等。`,
      sources: [],
      confidence: 0,
      suggestions: ['太阳', '黑洞', '暗物质', '木卫二', '超新星', '系外行星', '火星', '大爆炸'],
      relatedTopics: []
    };
  }

  const topEntry = scored[0].entry;
  const confidence = Math.min(scored[0].score / 80, 1);
  
  // 构建回答
  let answer = `**${topEntry.title}**\n\n${topEntry.content}`;
  
  // 添加关联信息(深度1层)
  const relatedEntries = topEntry.relatedIds
    .map(id => ENTRY_MAP.get(id))
    .filter(Boolean) as KnowledgeEntry[];
  
  if (relatedEntries.length > 0) {
    answer += `\n\n**相关知识：** ${relatedEntries.map(e => e.title).join('、')}`;
  }
  
  // 添加第二匹配结果的摘要
  if (scored.length > 1 && scored[1].score > 15) {
    const second = scored[1].entry;
    answer += `\n\n---\n**您可能还想了解：${second.title}**\n${second.content.substring(0, 120)}...`;
  }
  
  // 第三匹配(如果有)
  if (scored.length > 2 && scored[2].score > 15) {
    const third = scored[2].entry;
    answer += `\n\n**相关话题：** ${third.title}`;
  }

  // ===== 增强搜索：查询SkyGIS数据集 =====
  const datasetResults: string[] = [];
  
  // 搜索8大物理力引擎
  const forceEngines = searchForceEngine(query);
  if (forceEngines.length > 0) {
    forceEngines.forEach(fe => {
      datasetResults.push(`【${fe.name}】${fe.description}。公式：${fe.formula}，常数：${fe.constant}。应用：${fe.applications.join('、')}。`);
    });
  }
  
  // 搜索8大坐标系
  const coordSystems = searchCoordinateSystem(query);
  if (coordSystems.length > 0) {
    coordSystems.forEach(cs => {
      datasetResults.push(`【${cs.name}】${cs.description}原点：${cs.center}，参考面：${cs.reference}。应用：${cs.applications.join('、')}。`);
    });
  }
  
  // 搜索宇宙数据库19大分类
  const cosmicCategories = searchCosmicCategory(query);
  if (cosmicCategories.length > 0) {
    cosmicCategories.forEach(cc => {
      datasetResults.push(`【${cc.name}(${cc.nameEn})】共${cc.count}种。${cc.description} 关键物质：${cc.keySubstances.slice(0, 5).join('、')}等。`);
    });
  }
  
  // 搜索太阳系天体详细数据
  const solarBodies = searchSolarBody(query);
  if (solarBodies.length > 0) {
    solarBodies.forEach(body => {
      if ('orbit' in body) {
        datasetResults.push(`【${(body as typeof SOLAR_PLANETS[0]).name}】轨道：${(body as typeof SOLAR_PLANETS[0]).orbit}，质量：${(body as typeof SOLAR_PLANETS[0]).mass}，半径：${(body as typeof SOLAR_PLANETS[0]).radius}，重力：${(body as typeof SOLAR_PLANETS[0]).gravity}，逃逸速度：${(body as typeof SOLAR_PLANETS[0]).escapeVelocity}，自转：${(body as typeof SOLAR_PLANETS[0]).dayLength}，公转：${(body as typeof SOLAR_PLANETS[0]).yearLength}，卫星：${(body as typeof SOLAR_PLANETS[0]).moons}颗，大气：${(body as typeof SOLAR_PLANETS[0]).atmosphere}，温度：${(body as typeof SOLAR_PLANETS[0]).temperature}，特征：${(body as typeof SOLAR_PLANETS[0]).features}`);
      } else if ('spectralType' in body) {
        datasetResults.push(`【${(body as typeof SOLAR_STAR).name}】质量：${(body as typeof SOLAR_STAR).mass}，半径：${(body as typeof SOLAR_STAR).radius}，光谱型：${(body as typeof SOLAR_STAR).spectralType}，表面温度：${(body as typeof SOLAR_STAR).surfaceTemp}，光度：${(body as typeof SOLAR_STAR).luminosity}，年龄：${(body as typeof SOLAR_STAR).age}`);
      } else if ('parent' in body) {
        datasetResults.push(`【${(body as typeof SOLAR_MAJOR_MOONS[0]).name}】${(body as typeof SOLAR_MAJOR_MOONS[0]).parent}的卫星，半径：${(body as typeof SOLAR_MAJOR_MOONS[0]).radius}，特征：${(body as typeof SOLAR_MAJOR_MOONS[0]).features}`);
      } else if ('type' in body) {
        datasetResults.push(`【${(body as typeof SOLAR_DWARF_PLANETS[0]).name}】轨道：${(body as typeof SOLAR_DWARF_PLANETS[0]).orbit}，质量：${(body as typeof SOLAR_DWARF_PLANETS[0]).mass}，分类：${(body as typeof SOLAR_DWARF_PLANETS[0]).type}`);
      }
    });
  }
  
  // 如果主知识库没有结果，但数据集有结果，优先使用数据集
  if (scored.length === 0 && datasetResults.length > 0) {
    const answer = datasetResults.slice(0, 3).join('\n\n');
    return {
      answer,
      sources: ['skygis-dataset'],
      confidence: 0.7,
      suggestions: COSMIC_DATABASE_CATEGORIES.slice(0, 4).map(c => c.name),
      relatedTopics: cosmicCategories.map(c => c.name)
    };
  }
  
  // 如果主知识库有结果，也补充数据集信息
  if (scored.length > 0 && datasetResults.length > 0) {
    answer += `\n\n---\n**SkyGIS数据参考：**\n${datasetResults.slice(0, 2).join('\n\n')}`;
  }

  // 收集关联主题
  const relatedTopics = relatedEntries.map(e => e.title);
  // 加上第二/三匹配的标题
  if (scored.length > 1 && scored[1].score > 15) relatedTopics.push(scored[1].entry.title);
  if (scored.length > 2 && scored[2].score > 15) relatedTopics.push(scored[2].entry.title);
  // 加上数据集关联主题
  cosmicCategories.forEach(c => { if (!relatedTopics.includes(c.name)) relatedTopics.push(c.name); });

  return {
    answer,
    sources: [topEntry.id, ...topEntry.relatedIds.slice(0, 3)],
    confidence,
    suggestions: relatedEntries.map(e => e.title).slice(0, 4),
    relatedTopics: [...new Set(relatedTopics)].slice(0, 6)
  };
}

// ============ 分类查询 ============

export function queryByCategory(category: string): KnowledgeEntry[] {
  return ALL_ENTRIES.filter(e => 
    e.category.toLowerCase() === category.toLowerCase() ||
    e.subcategory.toLowerCase() === category.toLowerCase()
  );
}

// ============ 随机知识 ============

export function getRandomKnowledge(count: number = 3): KnowledgeEntry[] {
  const shuffled = [...ALL_ENTRIES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ============ 获取关联图谱 ============

export function getRelatedGraph(entryId: string, depth: number = 2): KnowledgeEntry[] {
  const visited = new Set<string>();
  const result: KnowledgeEntry[] = [];
  
  function traverse(id: string, d: number) {
    if (visited.has(id) || d <= 0) return;
    visited.add(id);
    const entry = ENTRY_MAP.get(id);
    if (!entry) return;
    result.push(entry);
    entry.relatedIds.forEach(rid => traverse(rid, d - 1));
  }
  
  traverse(entryId, depth);
  return result;
}

// ============ 搜索建议 ============

export function getSearchSuggestions(partial: string, limit: number = 8): string[] {
  const pLower = partial.toLowerCase();
  const matches: Array<{ title: string; score: number }> = [];
  
  ALL_ENTRIES.forEach(entry => {
    let score = 0;
    if (entry.title.toLowerCase().includes(pLower)) score += 30;
    for (const kw of entry.keywords) {
      if (kw.toLowerCase().startsWith(pLower)) score += 20;
      else if (kw.toLowerCase().includes(pLower)) score += 10;
    }
    if (score > 0) matches.push({ title: entry.title, score });
  });
  
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(m => m.title);
}

// ============ 导出统计 ============

export function getUniverseKnowledgeStats(): KnowledgeStats {
  const categories = [...new Set(ALL_ENTRIES.map(e => e.category))];
  const subcategories = [...new Set(ALL_ENTRIES.map(e => `${e.category}/${e.subcategory}`))];
  const totalKeywords = ALL_ENTRIES.reduce((sum, e) => sum + e.keywords.length, 0);
  const cosmicStats = getCosmicDatabaseStats();
  
  return {
    totalEntries: ALL_ENTRIES.length + cosmicStats.total,
    categories,
    subcategories,
    totalKeywords,
    offline: true,
    noApiRequired: true
  };
}

// ============ 导出完整知识库(供其他模块使用) ============

export function getAllEntries(): KnowledgeEntry[] {
  return ALL_ENTRIES;
}

export function getEntryById(id: string): KnowledgeEntry | undefined {
  return ENTRY_MAP.get(id);
}
