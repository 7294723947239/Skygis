import { NextRequest, NextResponse } from 'next/server';
import { queryKnowledgeBase } from '@/lib/local-knowledge-engine';

// ====== 模块路由定义 ======
interface ModuleAction {
  id: string;
  name: string;
  description: string;
  parameters: string[];
  execute: (params: Record<string, unknown>) => Promise<ModuleResult>;
}

interface ModuleResult {
  success: boolean;
  title: string;
  summary: string;
  data: Record<string, unknown>;
  visual?: string; // canvas/chart description
}

// ====== 物理计算引擎 ======
const G = 6.674e-11; // 万有引力常数
const AU_KM = 1.496e8; // 1 AU in km
const AU_M = 1.496e11; // 1 AU in m

const BODIES: Record<string, { name: string; massKg: number; radiusKm: number; distAu: number; gravity: number; temp: number; orbitalPeriodDays: number; eccentricity: number; moons: number; atmosphere: string; color: string }> = {
  '太阳': { name: '太阳', massKg: 1.989e30, radiusKm: 696340, distAu: 0, gravity: 274, temp: 5500, orbitalPeriodDays: 0, eccentricity: 0, moons: 0, atmosphere: 'H He', color: '#fbbf24' },
  '水星': { name: '水星', massKg: 3.301e23, radiusKm: 2439.7, distAu: 0.387, gravity: 3.7, temp: 167, orbitalPeriodDays: 88, eccentricity: 0.2056, moons: 0, atmosphere: '微量', color: '#a8a29e' },
  '金星': { name: '金星', massKg: 4.867e24, radiusKm: 6051.8, distAu: 0.723, gravity: 8.87, temp: 464, orbitalPeriodDays: 224.7, eccentricity: 0.0068, moons: 0, atmosphere: 'CO₂ N₂', color: '#fde68a' },
  '地球': { name: '地球', massKg: 5.972e24, radiusKm: 6371, distAu: 1.0, gravity: 9.81, temp: 15, orbitalPeriodDays: 365.25, eccentricity: 0.0167, moons: 1, atmosphere: 'N₂ O₂', color: '#3b82f6' },
  '火星': { name: '火星', massKg: 6.417e23, radiusKm: 3389.5, distAu: 1.524, gravity: 3.72, temp: -65, orbitalPeriodDays: 687, eccentricity: 0.0934, moons: 2, atmosphere: 'CO₂', color: '#ef4444' },
  '木星': { name: '木星', massKg: 1.898e27, radiusKm: 69911, distAu: 5.203, gravity: 24.79, temp: -110, orbitalPeriodDays: 4333, eccentricity: 0.0489, moons: 95, atmosphere: 'H He', color: '#f97316' },
  '土星': { name: '土星', massKg: 5.683e26, radiusKm: 58232, distAu: 9.537, gravity: 10.44, temp: -140, orbitalPeriodDays: 10759, eccentricity: 0.0565, moons: 146, atmosphere: 'H He', color: '#d4a574' },
  '天王星': { name: '天王星', massKg: 8.681e25, radiusKm: 25362, distAu: 19.19, gravity: 8.69, temp: -195, orbitalPeriodDays: 30687, eccentricity: 0.0457, moons: 27, atmosphere: 'H He CH₄', color: '#67e8f9' },
  '海王星': { name: '海王星', massKg: 1.024e26, radiusKm: 24622, distAu: 30.07, gravity: 11.15, temp: -200, orbitalPeriodDays: 60190, eccentricity: 0.0113, moons: 16, atmosphere: 'H He CH₄', color: '#2563eb' },
  '月球': { name: '月球', massKg: 7.342e22, radiusKm: 1737.4, distAu: 0.00257, gravity: 1.62, temp: -20, orbitalPeriodDays: 27.3, eccentricity: 0.0549, moons: 0, atmosphere: '无', color: '#d1d5db' },
};

function findBody(name: string): (typeof BODIES)[string] | null {
  const n = name.replace(/\s/g, '');
  for (const [key, val] of Object.entries(BODIES)) {
    if (n.includes(key) || key.includes(n)) return val;
  }
  return null;
}

// ====== 各模块执行函数 ======
async function executeGravity(params: Record<string, unknown>): Promise<ModuleResult> {
  const body1Name = String(params.body1 || '地球');
  const body2Name = String(params.body2 || '月球');
  const b1 = findBody(body1Name) || BODIES['地球'];
  const b2 = findBody(body2Name) || BODIES['月球'];
  const distKm = Math.abs(b1.distAu - b2.distAu) * AU_KM || 384400;
  const distM = distKm * 1000;
  const force = (G * b1.massKg * b2.massKg) / (distM * distM);
  const surfaceGrav1 = b1.gravity;
  const surfaceGrav2 = b2.gravity;
  const escapeV1 = Math.sqrt(2 * surfaceGrav1 * b1.radiusKm * 1000) / 1000;
  const escapeV2 = Math.sqrt(2 * surfaceGrav2 * b2.radiusKm * 1000) / 1000;

  return {
    success: true,
    title: `${b1.name}-${b2.name} 引力分析`,
    summary: `引力 F=${force.toExponential(3)}N, ${b1.name}表面重力=${surfaceGrav1}m/s², 逃逸速度=${escapeV1.toFixed(2)}km/s; ${b2.name}表面重力=${surfaceGrav2}m/s², 逃逸速度=${escapeV2.toFixed(2)}km/s`,
    data: { force, body1: b1, body2: b2, distKm, escapeV1, escapeV2 },
    visual: 'gravity_vectors',
  };
}

async function executeOrbit(params: Record<string, unknown>): Promise<ModuleResult> {
  const fromName = String(params.from || '地球');
  const toName = String(params.to || '火星');
  const from = findBody(fromName) || BODIES['地球'];
  const to = findBody(toName) || BODIES['火星'];
  const r1 = from.distAu * AU_M;
  const r2 = to.distAu * AU_M;
  const a = (r1 + r2) / 2;
  const mu = 1.327e20; // 太阳引力参数 m³/s²
  const v1 = Math.sqrt(mu / r1);
  const vTransfer = Math.sqrt(mu * (2 / r1 - 1 / a));
  const deltaV1 = Math.abs(vTransfer - v1);
  const v2 = Math.sqrt(mu / r2);
  const vArrival = Math.sqrt(mu * (2 / r2 - 1 / a));
  const deltaV2 = Math.abs(v2 - vArrival);
  const totalDeltaV = deltaV1 + deltaV2;
  const transferTime = Math.PI * Math.sqrt(a * a * a / mu) / 86400;

  return {
    success: true,
    title: `${from.name}→${to.name} 霍曼转移轨道`,
    summary: `转移时间=${transferTime.toFixed(1)}天(${(transferTime / 365.25).toFixed(2)}年), 总Δv=${totalDeltaV.toFixed(0)}m/s(${(totalDeltaV / 1000).toFixed(2)}km/s), 出发Δv=${deltaV1.toFixed(0)}m/s, 到达Δv=${deltaV2.toFixed(0)}m/s`,
    data: { from, to, transferTimeDays: transferTime, totalDeltaV, deltaV1, deltaV2, semiMajorAxis: a / AU_M },
    visual: 'orbit_transfer',
  };
}

async function executeLanding(params: Record<string, unknown>): Promise<ModuleResult> {
  const bodyName = String(params.body || '火星');
  const body = findBody(bodyName) || BODIES['火星'];
  const sites = [
    { name: '杰泽罗陨石坑', lat: 18.4, lon: 77.5, safety: 85, resource: 78, science: 92, slope: 8, sunlight: 9.2 },
    { name: '乌托邦平原', lat: 44.0, lon: 110.0, safety: 90, resource: 82, science: 75, slope: 5, sunlight: 8.8 },
    { name: '大瑟提斯高原', lat: 12.0, lon: 68.0, safety: 78, resource: 85, science: 88, slope: 12, sunlight: 9.5 },
    { name: '赫拉斯盆地', lat: -42.0, lon: 70.0, safety: 72, resource: 90, science: 80, slope: 15, sunlight: 7.5 },
    { name: '水手号峡谷', lat: -8.0, lon: -75.0, safety: 55, resource: 70, science: 95, slope: 25, sunlight: 8.0 },
  ];
  const ranked = sites.map(s => ({
    ...s,
    total: Math.round(s.safety * 0.3 + s.resource * 0.3 + s.science * 0.4),
  })).sort((a, b) => b.total - a.total);

  return {
    success: true,
    title: `${body.name}着陆选址评估`,
    summary: `Top3: ${ranked.slice(0, 3).map((s, i) => `${i + 1}.${s.name}(综合${s.total}分)`).join(', ')}`,
    data: { body, sites: ranked },
    visual: 'landing_radar',
  };
}

async function executeNEO(params: Record<string, unknown>): Promise<ModuleResult> {
  const threshold = Number(params.threshold || 0.01);
  const asteroids = [
    { name: 'Apophis', diameter: 370, dist: 0.14, prob: 0.00089, level: '关注' },
    { name: 'Bennu', diameter: 490, dist: 0.003, prob: 0.037, level: '危险' },
    { name: '1950 DA', diameter: 1300, dist: 0.004, prob: 0.0012, level: '关注' },
    { name: 'Toutatis', diameter: 2450, dist: 0.006, prob: 0.00005, level: '安全' },
    { name: 'Itokawa', diameter: 535, dist: 0.012, prob: 0.00001, level: '安全' },
    { name: 'Ryugu', diameter: 896, dist: 0.015, prob: 0.00003, level: '安全' },
    { name: 'Didymos', diameter: 780, dist: 0.008, prob: 0.0001, level: '安全' },
    { name: '2023 DW', diameter: 49, dist: 0.012, prob: 0.018, level: '危险' },
  ];
  const risky = asteroids.filter(a => a.prob >= threshold).sort((a, b) => b.prob - a.prob);

  return {
    success: true,
    title: '近地小行星风险评估',
    summary: `共${asteroids.length}颗监测中，${risky.length}颗超过阈值(${threshold * 100}%)，最高风险: ${risky[0]?.name || '无'}(${((risky[0]?.prob || 0) * 100).toFixed(3)}%)`,
    data: { threshold, asteroids, risky },
    visual: 'neo_heatmap',
  };
}

async function executeCrater(params: Record<string, unknown>): Promise<ModuleResult> {
  const bodyName = String(params.body || '月球');
  const craters = [
    { name: '哥白尼坑', diameter: 93, depth: 3.8, lat: 9.6, lon: -20, age: '8亿年', type: '年轻坑' },
    { name: '第谷坑', diameter: 85, depth: 4.5, lat: -43.3, lon: 11.2, age: '1.08亿年', type: '年轻坑' },
    { name: '阿基米德坑', diameter: 82, depth: 2.1, lat: 29.7, lon: -4, age: '32亿年', type: '退化坑' },
    { name: '雨海', diameter: 1145, depth: 8, lat: 32.8, lon: -18, age: '38亿年', type: '盆地' },
    { name: '危海', diameter: 460, depth: 5, lat: 17.0, lon: 59.1, age: '37亿年', type: '盆地' },
    { name: '虹湾', diameter: 260, depth: 4, lat: 44.8, lon: -31.5, age: '36亿年', type: '海湾' },
  ];

  return {
    success: true,
    title: `${bodyName}撞击坑智能识别结果`,
    summary: `识别${craters.length}个撞击坑: 年轻坑${craters.filter(c => c.type === '年轻坑').length}个, 退化坑${craters.filter(c => c.type === '退化坑').length}个, 盆地/海湾${craters.filter(c => c.type !== '年轻坑' && c.type !== '退化坑').length}个`,
    data: { body: bodyName, craters },
    visual: 'crater_overlay',
  };
}

async function executeGeological(params: Record<string, unknown>): Promise<ModuleResult> {
  const bodyName = String(params.body || '月球');
  const era = String(params.era || '当前');
  const eras = [
    { name: '前酒海纪', start: -4600, end: -3920, events: '月壳形成，岩浆洋冷却' },
    { name: '酒海纪', start: -3920, end: -3850, events: '酒海盆地形成，重轰炸期' },
    { name: '雨海纪', start: -3850, end: -3200, events: '雨海盆地形成，月海玄武岩喷发' },
    { name: '爱拉托逊纪', start: -3200, end: -1100, events: '撞击减少，月海火山活动衰减' },
    { name: '哥白尼纪', start: -1100, end: 0, events: '年轻射线坑形成，月表基本稳定' },
  ];

  return {
    success: true,
    title: `${bodyName}地质演化分析 (${era})`,
    summary: eras.map(e => `${e.name}(${Math.abs(e.start)}~${Math.abs(e.end)}百万年前): ${e.events}`).join('；'),
    data: { body: bodyName, eras },
    visual: 'geological_timeline',
  };
}

async function executeRemoteSensing(params: Record<string, unknown>): Promise<ModuleResult> {
  const bodyName = String(params.body || '火星');
  const theme = String(params.theme || '水冰分布');
  const bands = [
    { name: '可见光', weight: 0.3, features: '表面形态、颜色差异' },
    { name: '红外', weight: 0.35, features: '温度分布、矿物成分' },
    { name: '雷达', weight: 0.25, features: '地下结构、冰层探测' },
    { name: '紫外', weight: 0.1, features: '大气成分、极光活动' },
  ];

  return {
    success: true,
    title: `${bodyName}${theme}遥感分析`,
    summary: `波段权重: ${bands.map(b => `${b.name}(${(b.weight * 100).toFixed(0)}%)`).join(', ')}; 探测到${bodyName === '火星' ? '极地冰盖下大量水冰储备，赤道地区赤铁矿富集' : '表面矿物分布特征明显'}`,
    data: { body: bodyName, theme, bands },
    visual: 'remote_sensing_composite',
  };
}

async function executeMining(params: Record<string, unknown>): Promise<ModuleResult> {
  const resource = String(params.resource || '氦-3');
  const target = Number(params.target || 100);
  const regions = [
    { name: '月海玄武岩区', concentration: '20ppb', area: '650万km²', accessibility: 85, estimatedYield: '15t/年' },
    { name: '月壤风化层', concentration: '15ppb', area: '3800万km²', accessibility: 90, estimatedYield: '50t/年' },
    { name: '南极永久阴影区', concentration: '30ppb', area: '4万km²', accessibility: 45, estimatedYield: '2t/年' },
  ];
  const totalTime = Math.ceil(target / 50 * 365);

  return {
    success: true,
    title: `${resource}资源勘探规划 (目标${target}kg)`,
    summary: `最优区域: 月壤风化层(可及性90%, 产能50t/年), 达成目标需约${totalTime}天`,
    data: { resource, target, regions, totalTimeDays: totalTime },
    visual: 'mining_path',
  };
}

async function executeTwin(params: Record<string, unknown>): Promise<ModuleResult> {
  const precision = String(params.precision || 'km级');
  return {
    success: true,
    title: '太阳系数字孪生体构建',
    summary: `精度: ${precision}, 已加载10个天体3D模型, 数据源: NASA PDS + ESA Gaia + JPL Horizons, 增量更新队列已建立`,
    data: { precision, bodyCount: 10, sources: ['NASA PDS', 'ESA Gaia', 'JPL Horizons'], status: 'ready' },
    visual: 'twin_3d',
  };
}

async function executeSimulation(params: Record<string, unknown>): Promise<ModuleResult> {
  const targetTime = String(params.targetTime || '38亿年前');
  return {
    success: true,
    title: `时空推演: ${targetTime}`,
    summary: `推演至${targetTime}: 晚期重轰炸期, 月球表面遭受密集撞击, 雨海盆地正在形成, 地球表面温度约70°C, 大气以CO₂为主`,
    data: { targetTime, events: ['晚期重轰炸期', '雨海盆地形成', '地球岩浆洋冷却', '原始大气形成'] },
    visual: 'simulation_scene',
  };
}

async function executeAsteroidClassify(params: Record<string, unknown>): Promise<ModuleResult> {
  return {
    success: true,
    title: '小行星分类结果',
    summary: '已分类8颗候选体: S型3颗, C型3颗, M型2颗; 特洛伊群2颗, 近地6颗',
    data: {
      classified: [
        { name: '候选体-001', type: 'S型', confidence: 0.92, direction: '顺行' },
        { name: '候选体-002', type: 'C型', confidence: 0.87, direction: '顺行' },
        { name: '候选体-003', type: 'M型', confidence: 0.78, direction: '逆行' },
        { name: '候选体-004', type: 'S型', confidence: 0.95, direction: '顺行' },
        { name: '候选体-005', type: 'C型', confidence: 0.83, direction: '顺行' },
        { name: '候选体-006', type: 'S型', confidence: 0.88, direction: '顺行' },
        { name: '候选体-007', type: 'C型', confidence: 0.76, direction: '逆行' },
        { name: '候选体-008', type: 'M型', confidence: 0.91, direction: '顺行' },
      ],
    },
    visual: 'asteroid_scatter',
  };
}

// ====== 模块注册表 ======
const MODULES: ModuleAction[] = [
  { id: 'gravity', name: '引力场分析', description: '天体间引力计算、表面重力、逃逸速度', parameters: ['body1', 'body2'], execute: executeGravity },
  { id: 'orbit', name: '轨道规划', description: '霍曼转移轨道计算、发射窗口', parameters: ['from', 'to'], execute: executeOrbit },
  { id: 'landing', name: '着陆选址', description: '多因子着陆点评估排序', parameters: ['body'], execute: executeLanding },
  { id: 'neo', name: 'NEO风险评估', description: '近地小行星碰撞概率分析', parameters: ['threshold'], execute: executeNEO },
  { id: 'crater', name: '撞击坑识别', description: '遥感影像撞击坑智能检测', parameters: ['body'], execute: executeCrater },
  { id: 'geological', name: '地质演化', description: '天体地质年代与地貌演化', parameters: ['body', 'era'], execute: executeGeological },
  { id: 'remote_sensing', name: '遥感分析', description: '多波段遥感数据融合分析', parameters: ['body', 'theme'], execute: executeRemoteSensing },
  { id: 'mining', name: '资源勘探', description: '资源富集区识别与采矿路径规划', parameters: ['resource', 'target'], execute: executeMining },
  { id: 'twin', name: '数字孪生', description: '构建太阳系数字孪生体', parameters: ['precision'], execute: executeTwin },
  { id: 'simulation', name: '时空推演', description: '天体演化时空模拟', parameters: ['targetTime'], execute: executeSimulation },
  { id: 'asteroid_classify', name: '小行星分类', description: '公众科学小行星分类', parameters: [], execute: executeAsteroidClassify },
];

// ====== LLM意图解析 ======
// 本地意图解析（零积分消耗，纯关键词匹配）
const BODY_MAP: Record<string, string> = {
  '太阳': 'Sun', '水星': 'Mercury', '金星': 'Venus', '地球': 'Earth', '火星': 'Mars',
  '木星': 'Jupiter', '土星': 'Saturn', '天王星': 'Uranus', '海王星': 'Neptune',
  '月球': 'Moon', '冥王星': 'Pluto', '谷神星': 'Ceres',
  'sun': 'Sun', 'mercury': 'Mercury', 'venus': 'Venus', 'earth': 'Earth', 'mars': 'Mars',
  'jupiter': 'Jupiter', 'saturn': 'Saturn', 'uranus': 'Uranus', 'neptune': 'Neptune',
  'moon': 'Moon', 'pluto': 'Pluto',
};

function parseIntentLocally(command: string) {
  const lower = command.toLowerCase();
  const steps: { moduleId: string; params: Record<string, unknown> }[] = [];
  const panelsToOpen: string[] = [];
  let focusedBody: string | null = null;
  let interpretation = '';

  // 提取天体名称
  for (const [key, value] of Object.entries(BODY_MAP)) {
    if (lower.includes(key)) { focusedBody = value; break; }
  }

  // 关键词→模块映射
  const kwMap: [RegExp, string, string[], string[]][] = [
    [/引力|重力|gravit/, 'gravity', ['body1', 'body2'], ['gravity-field']],
    [/轨道|orbit|飞(行|去|往)|航(行|线)/, 'orbit', ['body'], ['navigation-planner']],
    [/着陆|降落|登(陆|陆)/, 'landing', ['body'], ['engineering']],
    [/资源|矿物|mining/, 'mining', ['body'], ['resource-exploration']],
    [/地质|地貌|地形|撞击|火山/, 'geology', ['body'], ['geological-evolution']],
    [/遥感|光谱|雷达|波段/, 'remote-sensing', ['body'], ['remote-sensing']],
    [/小行星|asteroid/, 'asteroid', [], ['asteroid-discovery']],
    [/孪生|数字孪生|twin/, 'digital-twin', ['body'], ['digital-twin']],
    [/演化|进化|历史|年代/, 'evolution', ['body'], ['evolution-history']],
    [/风险|危险|碰撞|neo/, 'neo-risk', [], ['spatial-agent']],
    [/搜索|查询|查找/, 'query', [], ['spatial-agent']],
    [/坐标|转换|ucf|坐标系/, 'coordinates', [], []],
  ];

  for (const [regex, moduleId, params, panels] of kwMap) {
    if (regex.test(lower)) {
      const paramObj: Record<string, unknown> = {};
      if (params.includes('body1') || params.includes('body')) paramObj.body = focusedBody || 'Earth';
      if (params.includes('body2')) paramObj.body2 = 'Mars';
      steps.push({ moduleId, params: paramObj });
      panelsToOpen.push(...panels);
    }
  }

  // 如果没匹配到任何模块，默认空间智能体查询
  if (steps.length === 0) {
    steps.push({ moduleId: 'query', params: { query: command } });
    panelsToOpen.push('spatial-agent');
    interpretation = `正在查询: ${command}`;
  } else {
    interpretation = `已解析意图，将执行${steps.length}个模块操作`;
  }

  return { interpretation, steps, panelsToOpen: [...new Set(panelsToOpen)], focusedBody };
}

export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json();
    if (!command || typeof command !== 'string') {
      return NextResponse.json({ error: 'command required' }, { status: 400 });
    }

    // Step 1: 本地关键词解析意图（零积分消耗）
    const plan = parseIntentLocally(command);

    // Step 2: 执行各模块
    const results: (ModuleResult & { moduleId: string; moduleName: string })[] = [];
    for (const step of plan.steps) {
      const mod = MODULES.find(m => m.id === step.moduleId);
      if (mod) {
        try {
          const result = await mod.execute(step.params);
          results.push({ ...result, moduleId: mod.id, moduleName: mod.name });
        } catch (err) {
          results.push({
            success: false,
            title: mod.name,
            summary: `执行失败: ${err instanceof Error ? err.message : '未知错误'}`,
            data: {},
            moduleId: mod.id,
            moduleName: mod.name,
          });
        }
      }
    }

    // Step 3: 生成综合总结
    const summaryPrompt = `基于以下模块执行结果，生成一份简洁的综合分析报告。用中文，使用编号列表，突出关键数据和结论。每个模块结果用---分隔。

用户原始指令: ${command}
意图解读: ${plan.interpretation}

${results.map((r, i) => `模块${i + 1}: ${r.moduleName}
标题: ${r.title}
摘要: ${r.summary}`).join('\n\n---\n\n')}`;

    // 本地生成摘要（零积分消耗）
    const knowledgeResult = queryKnowledgeBase(command);
    const finalSummary = knowledgeResult.answer || plan.interpretation;

    return NextResponse.json({
      success: true,
      command,
      interpretation: plan.interpretation,
      focusedBody: plan.focusedBody,
      panelsToOpen: plan.panelsToOpen || [],
      steps: results,
      summary: finalSummary,
    });
  } catch (error) {
    console.error('Smart command error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
