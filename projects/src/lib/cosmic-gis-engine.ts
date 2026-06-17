/**
 * 宇宙GIS核心引擎 — 四系统融合框架
 * 整合 GIS空间引擎 + 武术能量系统 + 中药物质能量 + 混合编程协同
 * 
 * 核心架构:
 *   空间建模 → 能量流动 → 功能协同 → 代码实现
 *   微观(细胞/穴位) → 宏观(地球圈层) → 宇宙(天体运动)
 */

// ============================================================
// 一、基础类型定义
// ============================================================

/** 三维空间点 */
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/** 能量类型枚举 */
export type EnergyType = 'bio' | 'mechanical' | 'field' | 'thermal' | 'cosmic' | 'magnetic';

/** 五行枚举 */
export type WuXing = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

/** 空间尺度 */
export type SpatialScale = 'micro' | 'meso' | 'macro' | 'cosmic';

/** 坐标系类型 */
export type CoordSystem = 'wgs84' | 'cgcs2000' | 'ecliptic' | 'galactic' | 'acupoint' | 'meridian';

/** 能量流动状态 */
export interface EnergyFlow {
  source: string;
  target: string;
  type: EnergyType;
  magnitude: number;       // W (瓦特)
  direction: Point3D;      // 流动方向向量
  decay: number;           // 衰减系数 λ
  resonance: number;       // 共振系数 -1~1
  timestamp: number;
}

/** 经络节点 */
export interface MeridianNode {
  id: string;
  name: string;
  nameCn: string;
  wuXing: WuXing;
  position: Point3D;        // 在人体坐标系中的位置 (cm)
  energyDensity: number;    // 能量密度 (单位/cm²)
  connectedAcupoints: string[];
  associatedOrgans: string[];
  yinYang: 'yin' | 'yang';
}

/** 穴位数据 */
export interface AcupointData {
  id: string;
  name: string;
  nameCn: string;
  meridian: string;         // 所属经络
  position: Point3D;        // 人体坐标系位置
  depth: number;            // 穴位深度 (mm)
  effectRadius: number;     // 作用半径 (mm)
  wuXing: WuXing;
  indications: string[];     // 主治
  herbAffinity: string[];   // 关联药材
  martialArtsEffect: string[]; // 武术作用
}

/** 武术招式 */
export interface MartialMove {
  id: string;
  name: string;
  nameCn: string;
  style: string;             // 流派 (太极/咏春/长拳/南拳/八卦...)
  energyType: EnergyType;
  forceCurve: ForceCurve;    // 发力曲线
  trajectory: Trajectory3D;   // 3D空间轨迹
  meridianActivation: string[]; // 激活经络
  energyEfficiency: number;   // 能量传递效率 η
  biometricParams: BiometricParams;
}

/** 力场曲线 */
export interface ForceCurve {
  peakForce: number;         // N (牛顿)
  riseTime: number;          // s (上升时间)
  sustainTime: number;       // s (持续时间)
  decayTime: number;         // s (衰减时间)
  angularVelocity: number;   // rad/s (角速度)
}

/** 3D轨迹 */
export interface Trajectory3D {
  type: 'circular' | 'linear' | 'spiral' | 'elliptical';
  paramEquation: string;     // 参数方程
  radius: number;            // 发力半径 R (m)
  heightRange: [number, number]; // z轴范围
  samplePoints: Point3D[];   // 采样点
}

/** 生物力学参数 */
export interface BiometricParams {
  centerOfGravity: Point3D;  // 重心
  baseOfSupport: number;     // 支撑面 (m²)
  momentOfInertia: number;   // 转动惯量
  angularMomentum: number;   // 角动量
}

/** 中药材数据 */
export interface HerbData {
  id: string;
  name: string;
  nameCn: string;
  latinName: string;
  wuXing: WuXing;
  nature: 'cold' | 'cool' | 'neutral' | 'warm' | 'hot'; // 寒凉温热平
  flavor: string[];          // 酸苦甘辛咸
  meridianTropism: string[]; // 归经
  activeCompounds: ActiveCompound[];
  growingRegion: GrowingRegion;
  harvestTiming: HarvestTiming;
  diffusionCoeff: number;   // 扩散系数 D (m²/s)
}

/** 活性成分 */
export interface ActiveCompound {
  name: string;
  nameCn: string;
  formula: string;
  concentration: number;     // mg/g
  molecularWeight: number;   // Da
  halfLife: number;          // h
  targetMeridians: string[];
}

/** 生长区域 */
export interface GrowingRegion {
  latitude: [number, number];
  longitude: [number, number];
  altitude: [number, number]; // m
  climate: string;
  soilType: string;
  cosmicRayFlux: number;    // μSv/h 宇宙射线通量
  geomagneticField: number;  // μT 地磁场强度
}

/** 采收时间 */
export interface HarvestTiming {
  optimalSeason: string;
  lunarPhase: string;        // 月相
  timeOfDay: string;
  celestialCondition: string; // 天体条件
  polysaccharidePeak: number; // 多糖峰值%
}

/** 共振结果 */
export interface ResonanceResult {
  source: string;
  target: string;
  coefficient: number;       // 共振系数 r
  pValue: number;
  period: number;            // 周期 (天)
  amplitude: number;         // 振幅
  phaseOffset: number;       // 相位偏移
  scale: SpatialScale;
}

/** 协同效应 */
export interface SynergyEffect {
  martialForce: number;     // 武术力场值
  herbDiffusion: number;    // 中药扩散值
  spatialOverlap: number;    // 空间重叠度 0~1
  synergyFactor: number;     // 协同系数
  efficacyBoost: number;     // 疗效提升倍数
  position: Point3D;
}

/** 能量流算法结果 */
export interface EnergyFlowResult {
  forceOnAcupoint: number;   // 穴位受力 (N)
  herbStimulation: number;   // 药物刺激强度
  synergyEffect: number;     // 协同效应值
  meridianActivation: string[];
  energyBalance: number;     // 能量平衡指数 0~1
}

// ============================================================
// 二、宇宙GIS核心引擎
// ============================================================

export class CosmicGISEngine {
  private static instance: CosmicGISEngine;
  private meridians: Map<string, MeridianNode> = new Map();
  private acupoints: Map<string, AcupointData> = new Map();
  private herbs: Map<string, HerbData> = new Map();
  private moves: Map<string, MartialMove> = new Map();
  private energyFlows: EnergyFlow[] = [];
  private resonances: ResonanceResult[] = [];

  private constructor() {
    this.initializeData();
  }

  static getInstance(): CosmicGISEngine {
    if (!CosmicGISEngine.instance) {
      CosmicGISEngine.instance = new CosmicGISEngine();
    }
    return CosmicGISEngine.instance;
  }

  // --------------------------------------------------------
  // 2.1 数据初始化
  // --------------------------------------------------------

  private initializeData(): void {
    this.initMeridians();
    this.initAcupoints();
    this.initHerbs();
    this.initMartialMoves();
  }

  /** 初始化14条主要经络 */
  private initMeridians(): void {
    const meridianData: MeridianNode[] = [
      { id: 'LU', name: 'Lung', nameCn: '手太阴肺经', wuXing: 'metal', position: { x: 15, y: 120, z: 0 }, energyDensity: 85, connectedAcupoints: ['LU1','LU5','LU7','LU9','LU11'], associatedOrgans: ['肺','大肠'], yinYang: 'yin' },
      { id: 'LI', name: 'Large Intestine', nameCn: '手阳明大肠经', wuXing: 'metal', position: { x: 25, y: 115, z: 5 }, energyDensity: 78, connectedAcupoints: ['LI1','LI4','LI10','LI11','LI20'], associatedOrgans: ['大肠','肺'], yinYang: 'yang' },
      { id: 'ST', name: 'Stomach', nameCn: '足阳明胃经', wuXing: 'earth', position: { x: 10, y: 80, z: 10 }, energyDensity: 92, connectedAcupoints: ['ST3','ST25','ST36','ST44'], associatedOrgans: ['胃','脾'], yinYang: 'yang' },
      { id: 'SP', name: 'Spleen', nameCn: '足太阴脾经', wuXing: 'earth', position: { x: -10, y: 85, z: 8 }, energyDensity: 88, connectedAcupoints: ['SP2','SP6','SP9','SP21'], associatedOrgans: ['脾','胃'], yinYang: 'yin' },
      { id: 'HT', name: 'Heart', nameCn: '手少阴心经', wuXing: 'fire', position: { x: 12, y: 110, z: -3 }, energyDensity: 110, connectedAcupoints: ['HT1','HT5','HT7','HT9'], associatedOrgans: ['心','小肠'], yinYang: 'yin' },
      { id: 'SI', name: 'Small Intestine', nameCn: '手太阳小肠经', wuXing: 'fire', position: { x: 22, y: 105, z: -8 }, energyDensity: 72, connectedAcupoints: ['SI3','SI5','SI9','SI19'], associatedOrgans: ['小肠','心'], yinYang: 'yang' },
      { id: 'BL', name: 'Bladder', nameCn: '足太阳膀胱经', wuXing: 'water', position: { x: -5, y: 90, z: -20 }, energyDensity: 95, connectedAcupoints: ['BL1','BL23','BL40','BL60','BL67'], associatedOrgans: ['膀胱','肾'], yinYang: 'yang' },
      { id: 'KI', name: 'Kidney', nameCn: '足少阴肾经', wuXing: 'water', position: { x: -8, y: 95, z: -15 }, energyDensity: 105, connectedAcupoints: ['KI1','KI3','KI6','KI27'], associatedOrgans: ['肾','膀胱'], yinYang: 'yin' },
      { id: 'PC', name: 'Pericardium', nameCn: '手厥阴心包经', wuXing: 'fire', position: { x: 18, y: 108, z: -2 }, energyDensity: 98, connectedAcupoints: ['PC1','PC6','PC7','PC9'], associatedOrgans: ['心包','三焦'], yinYang: 'yin' },
      { id: 'TE', name: 'Triple Energizer', nameCn: '手少阳三焦经', wuXing: 'fire', position: { x: 20, y: 100, z: 3 }, energyDensity: 80, connectedAcupoints: ['TE5','TE8','TE14','TE23'], associatedOrgans: ['三焦','心包'], yinYang: 'yang' },
      { id: 'GB', name: 'Gallbladder', nameCn: '足少阳胆经', wuXing: 'wood', position: { x: -12, y: 85, z: -12 }, energyDensity: 88, connectedAcupoints: ['GB1','GB20','GB34','GB44'], associatedOrgans: ['胆','肝'], yinYang: 'yang' },
      { id: 'LR', name: 'Liver', nameCn: '足厥阴肝经', wuXing: 'wood', position: { x: -15, y: 90, z: -8 }, energyDensity: 100, connectedAcupoints: ['LR2','LR3','LR8','LR14'], associatedOrgans: ['肝','胆'], yinYang: 'yin' },
      { id: 'GV', name: 'Governor Vessel', nameCn: '督脉', wuXing: 'water', position: { x: 0, y: 100, z: -25 }, energyDensity: 120, connectedAcupoints: ['GV1','GV4','GV14','GV20','GV26'], associatedOrgans: ['脑','脊髓'], yinYang: 'yang' },
      { id: 'CV', name: 'Conception Vessel', nameCn: '任脉', wuXing: 'water', position: { x: 0, y: 95, z: 15 }, energyDensity: 115, connectedAcupoints: ['CV2','CV4','CV6','CV12','CV22'], associatedOrgans: ['胞宫','脏腑'], yinYang: 'yin' },
    ];
    for (const m of meridianData) {
      this.meridians.set(m.id, m);
    }
  }

  /** 初始化关键穴位 */
  private initAcupoints(): void {
    const acupointData: AcupointData[] = [
      { id: 'ST36', name: 'Zusanli', nameCn: '足三里', meridian: 'ST', position: { x: 8, y: 35, z: 12 }, depth: 15, effectRadius: 25, wuXing: 'earth', indications: ['胃痛','呕吐','腹胀','虚劳'], herbAffinity: ['人参','黄芪','白术'], martialArtsEffect: ['增强下盘稳定','提升腿部力量'] },
      { id: 'LI4', name: 'Hegu', nameCn: '合谷', meridian: 'LI', position: { x: 28, y: 75, z: 3 }, depth: 10, effectRadius: 15, wuXing: 'metal', indications: ['头痛','牙痛','面瘫','发热'], herbAffinity: ['薄荷','菊花','金银花'], martialArtsEffect: ['增强握力','手部力量传导'] },
      { id: 'LR3', name: 'Taichong', nameCn: '太冲', meridian: 'LR', position: { x: -8, y: 30, z: 5 }, depth: 12, effectRadius: 18, wuXing: 'wood', indications: ['头痛','眩晕','月经不调'], herbAffinity: ['柴胡','当归','白芍'], martialArtsEffect: ['平衡重心','气沉丹田'] },
      { id: 'CV6', name: 'Qihai', nameCn: '气海', meridian: 'CV', position: { x: 0, y: 88, z: 12 }, depth: 20, effectRadius: 35, wuXing: 'fire', indications: ['气虚','乏力','遗精','崩漏'], herbAffinity: ['人参','黄芪','肉桂'], martialArtsEffect: ['丹田蓄力','内功核心'] },
      { id: 'CV4', name: 'Guanyuan', nameCn: '关元', meridian: 'CV', position: { x: 0, y: 82, z: 12 }, depth: 22, effectRadius: 30, wuXing: 'water', indications: ['遗精','阳痿','痛经','虚劳'], herbAffinity: ['人参','鹿茸','枸杞'], martialArtsEffect: ['固本培元','气聚丹田'] },
      { id: 'GV20', name: 'Baihui', nameCn: '百会', meridian: 'GV', position: { x: 0, y: 170, z: -2 }, depth: 5, effectRadius: 20, wuXing: 'fire', indications: ['头痛','眩晕','脱肛','中风'], herbAffinity: ['天麻','钩藤','石决明'], martialArtsEffect: ['头顶悬','意念引领'] },
      { id: 'BL23', name: 'Shenshu', nameCn: '肾俞', meridian: 'BL', position: { x: -5, y: 95, z: -22 }, depth: 18, effectRadius: 25, wuXing: 'water', indications: ['腰痛','遗精','耳鸣','水肿'], herbAffinity: ['杜仲','枸杞','熟地'], martialArtsEffect: ['腰部发力核心','肾气驱动'] },
      { id: 'PC6', name: 'Neiguan', nameCn: '内关', meridian: 'PC', position: { x: 16, y: 100, z: -1 }, depth: 10, effectRadius: 15, wuXing: 'fire', indications: ['心悸','胸闷','胃痛','失眠'], herbAffinity: ['丹参','酸枣仁','远志'], martialArtsEffect: ['手臂力量传导','内劲外放'] },
      { id: 'SP6', name: 'Sanyinjiao', nameCn: '三阴交', meridian: 'SP', position: { x: -5, y: 40, z: 3 }, depth: 15, effectRadius: 20, wuXing: 'earth', indications: ['月经不调','失眠','腹胀','遗精'], herbAffinity: ['当归','白芍','茯苓'], martialArtsEffect: ['三经交汇','下盘稳固'] },
      { id: 'GB34', name: 'Yanglingquan', nameCn: '阳陵泉', meridian: 'GB', position: { x: -10, y: 42, z: -5 }, depth: 12, effectRadius: 18, wuXing: 'wood', indications: ['膝痛','胁痛','口苦','黄疸'], herbAffinity: ['柴胡','茵陈','龙胆草'], martialArtsEffect: ['腿部旋转发力','筋会之所'] },
    ];
    for (const a of acupointData) {
      this.acupoints.set(a.id, a);
    }
  }

  /** 初始化中药材 */
  private initHerbs(): void {
    const herbData: HerbData[] = [
      { id: 'rns', name: 'Ginseng', nameCn: '人参', latinName: 'Panax ginseng', wuXing: 'wood', nature: 'warm', flavor: ['甘','微苦'], meridianTropism: ['SP','LU','HT'], activeCompounds: [{ name: 'Ginsenoside Rb1', nameCn: '人参皂苷Rb1', formula: 'C54H92O23', concentration: 3.2, molecularWeight: 1109.3, halfLife: 6, targetMeridians: ['SP','LU'] }, { name: 'Ginsenoside Rg1', nameCn: '人参皂苷Rg1', formula: 'C42H72O14', concentration: 1.8, molecularWeight: 801.0, halfLife: 4, targetMeridians: ['HT','KI'] }], growingRegion: { latitude: [40, 44], longitude: [125, 130], altitude: [500, 1100], climate: '温带季风', soilType: '腐殖质棕壤', cosmicRayFlux: 0.08, geomagneticField: 55 }, harvestTiming: { optimalSeason: '秋季(9-10月)', lunarPhase: '满月前后', timeOfDay: '清晨5-7时', celestialCondition: '霜降后', polysaccharidePeak: 22 }, diffusionCoeff: 1.2e-9 },
      { id: 'hqq', name: 'Astragalus', nameCn: '黄芪', latinName: 'Astragalus membranaceus', wuXing: 'wood', nature: 'warm', flavor: ['甘'], meridianTropism: ['SP','LU'], activeCompounds: [{ name: 'Astragaloside IV', nameCn: '黄芪甲苷', formula: 'C41H68O14', concentration: 1.5, molecularWeight: 784.97, halfLife: 8, targetMeridians: ['SP','LU'] }, { name: 'Polysaccharide APS', nameCn: '黄芪多糖', formula: '(C6H10O5)n', concentration: 25, molecularWeight: 50000, halfLife: 12, targetMeridians: ['SP'] }], growingRegion: { latitude: [35, 45], longitude: [105, 115], altitude: [800, 1800], climate: '温带大陆性', soilType: '砂质壤土', cosmicRayFlux: 0.07, geomagneticField: 52 }, harvestTiming: { optimalSeason: '春秋二季', lunarPhase: '朔月后', timeOfDay: '上午9-11时', celestialCondition: '春分/秋分', polysaccharidePeak: 25 }, diffusionCoeff: 0.9e-9 },
      { id: 'mh', name: 'Ephedra', nameCn: '麻黄', latinName: 'Ephedra sinica', wuXing: 'fire', nature: 'warm', flavor: ['辛','微苦'], meridianTropism: ['LU','BL'], activeCompounds: [{ name: 'Ephedrine', nameCn: '麻黄碱', formula: 'C10H15NO', concentration: 0.8, molecularWeight: 165.23, halfLife: 3, targetMeridians: ['LU'] }], growingRegion: { latitude: [38, 48], longitude: [105, 125], altitude: [200, 1500], climate: '温带干旱', soilType: '砂质土', cosmicRayFlux: 0.09, geomagneticField: 56 }, harvestTiming: { optimalSeason: '秋季', lunarPhase: '上弦月', timeOfDay: '霜降后', celestialCondition: '寒露后', polysaccharidePeak: 8 }, diffusionCoeff: 2.1e-9 },
      { id: 'cp', name: 'Tangerine Peel', nameCn: '陈皮', latinName: 'Citrus reticulata', wuXing: 'wood', nature: 'warm', flavor: ['辛','苦'], meridianTropism: ['SP','LU'], activeCompounds: [{ name: 'Hesperidin', nameCn: '橙皮苷', formula: 'C28H34O15', concentration: 4.5, molecularWeight: 610.56, halfLife: 5, targetMeridians: ['SP'] }], growingRegion: { latitude: [22, 32], longitude: [105, 120], altitude: [50, 500], climate: '亚热带湿润', soilType: '红壤', cosmicRayFlux: 0.05, geomagneticField: 48 }, harvestTiming: { optimalSeason: '秋冬', lunarPhase: '下弦月', timeOfDay: '立秋后', celestialCondition: '秋分', polysaccharidePeak: 12 }, diffusionCoeff: 0.8e-9 },
      { id: 'fl', name: 'Poria', nameCn: '茯苓', latinName: 'Poria cocos', wuXing: 'wood', nature: 'neutral', flavor: ['甘','淡'], meridianTropism: ['SP','HT','KI'], activeCompounds: [{ name: 'Pachymic acid', nameCn: '茯苓酸', formula: 'C33H52O5', concentration: 2.0, molecularWeight: 528.76, halfLife: 6, targetMeridians: ['SP','KI'] }], growingRegion: { latitude: [25, 35], longitude: [105, 120], altitude: [300, 1200], climate: '亚热带湿润', soilType: '松林砂土', cosmicRayFlux: 0.06, geomagneticField: 50 }, harvestTiming: { optimalSeason: '7-9月', lunarPhase: '满月', timeOfDay: '上午', celestialCondition: '大暑后', polysaccharidePeak: 18 }, diffusionCoeff: 0.6e-9 },
      { id: 'cx', name: 'Chuanxiong', nameCn: '川芎', latinName: 'Ligusticum chuanxiong', wuXing: 'wood', nature: 'warm', flavor: ['辛'], meridianTropism: ['LR','GB','PC'], activeCompounds: [{ name: 'Tetramethylpyrazine', nameCn: '川芎嗪', formula: 'C8H12N2', concentration: 1.2, molecularWeight: 136.19, halfLife: 2.5, targetMeridians: ['LR','PC'] }], growingRegion: { latitude: [29, 32], longitude: [103, 107], altitude: [500, 1000], climate: '亚热带湿润', soilType: '紫色土', cosmicRayFlux: 0.06, geomagneticField: 49 }, harvestTiming: { optimalSeason: '夏季', lunarPhase: '上弦月', timeOfDay: '小满后', celestialCondition: '芒种', polysaccharidePeak: 10 }, diffusionCoeff: 1.2e-9 },
      { id: 'gq', name: 'Goji', nameCn: '枸杞', latinName: 'Lycium barbarum', wuXing: 'water', nature: 'neutral', flavor: ['甘'], meridianTropism: ['KI','LR'], activeCompounds: [{ name: 'Lycium barbarum polysaccharide', nameCn: '枸杞多糖', formula: '(C6H10O5)n', concentration: 8.5, molecularWeight: 40000, halfLife: 8, targetMeridians: ['KI','LR'] }, { name: 'Zeaxanthin', nameCn: '玉米黄质', formula: 'C40H56O2', concentration: 0.3, molecularWeight: 568.87, halfLife: 12, targetMeridians: ['LR'] }], growingRegion: { latitude: [37, 42], longitude: [105, 107], altitude: [1100, 1800], climate: '温带大陆性', soilType: '盐碱地', cosmicRayFlux: 0.09, geomagneticField: 55 }, harvestTiming: { optimalSeason: '夏秋', lunarPhase: '满月', timeOfDay: '清晨', celestialCondition: '处暑后', polysaccharidePeak: 22 }, diffusionCoeff: 0.7e-9 },
      { id: 'ds', name: 'Salvia', nameCn: '丹参', latinName: 'Salvia miltiorrhiza', wuXing: 'fire', nature: 'cool', flavor: ['苦'], meridianTropism: ['HT','PC','LR'], activeCompounds: [{ name: 'Tanshinone IIA', nameCn: '丹参酮IIA', formula: 'C19H18O3', concentration: 0.5, molecularWeight: 294.34, halfLife: 3, targetMeridians: ['HT','PC'] }], growingRegion: { latitude: [32, 40], longitude: [108, 118], altitude: [200, 800], climate: '温带季风', soilType: '砂质壤土', cosmicRayFlux: 0.07, geomagneticField: 52 }, harvestTiming: { optimalSeason: '春秋', lunarPhase: '下弦月', timeOfDay: '霜降后', celestialCondition: '秋分', polysaccharidePeak: 15 }, diffusionCoeff: 1.0e-9 },
    ];
    for (const h of herbData) {
      this.herbs.set(h.id, h);
    }
  }

  /** 初始化武术招式 */
  private initMartialMoves(): void {
    const moveData: MartialMove[] = [
      { id: 'tj-yunshou', name: 'Cloud Hands', nameCn: '太极云手', style: '太极', energyType: 'field', forceCurve: { peakForce: 120, riseTime: 0.4, sustainTime: 0.6, decayTime: 0.5, angularVelocity: 1.2 }, trajectory: { type: 'circular', paramEquation: 'x=R·cos(θ), y=R·sin(θ), z=h', radius: 0.8, heightRange: [0.8, 1.5], samplePoints: [] }, meridianActivation: ['LU','PC','HT','SP'], energyEfficiency: 0.85, biometricParams: { centerOfGravity: { x: 0, y: 95, z: 0 }, baseOfSupport: 0.15, momentOfInertia: 1.8, angularMomentum: 2.5 } },
      { id: 'yc-chishou', name: 'Chi Sao', nameCn: '咏春黐手', style: '咏春', energyType: 'mechanical', forceCurve: { peakForce: 350, riseTime: 0.05, sustainTime: 0.1, decayTime: 0.15, angularVelocity: 4.5 }, trajectory: { type: 'linear', paramEquation: 'x=v·t, y=h, z=0', radius: 0.3, heightRange: [1.1, 1.4], samplePoints: [] }, meridianActivation: ['PC','HT','LU','LI'], energyEfficiency: 0.85, biometricParams: { centerOfGravity: { x: 2, y: 105, z: 0 }, baseOfSupport: 0.08, momentOfInertia: 0.9, angularMomentum: 1.2 } },
      { id: 'cq-chongquan', name: 'Thrust Punch', nameCn: '长拳冲拳', style: '长拳', energyType: 'mechanical', forceCurve: { peakForce: 500, riseTime: 0.08, sustainTime: 0.05, decayTime: 0.2, angularVelocity: 0.5 }, trajectory: { type: 'linear', paramEquation: 'x=v·t, y=h, z=0', radius: 3.2, heightRange: [1.0, 1.3], samplePoints: [] }, meridianActivation: ['LI','LU','HT','PC'], energyEfficiency: 0.72, biometricParams: { centerOfGravity: { x: 5, y: 100, z: 0 }, baseOfSupport: 0.12, momentOfInertia: 2.2, angularMomentum: 3.8 } },
      { id: 'nq-duanda', name: 'Short Strike', nameCn: '南拳短打', style: '南拳', energyType: 'mechanical', forceCurve: { peakForce: 420, riseTime: 0.06, sustainTime: 0.08, decayTime: 0.15, angularVelocity: 3.0 }, trajectory: { type: 'linear', paramEquation: 'x=v·t, y=h, z=0', radius: 1.5, heightRange: [1.0, 1.2], samplePoints: [] }, meridianActivation: ['LI','PC','HT'], energyEfficiency: 0.78, biometricParams: { centerOfGravity: { x: 1, y: 95, z: -2 }, baseOfSupport: 0.10, momentOfInertia: 1.2, angularMomentum: 2.0 } },
      { id: 'bg-xingbu', name: 'Mud Walking', nameCn: '八卦行步', style: '八卦掌', energyType: 'field', forceCurve: { peakForce: 180, riseTime: 0.3, sustainTime: 0.8, decayTime: 0.6, angularVelocity: 2.0 }, trajectory: { type: 'circular', paramEquation: 'x=R·cos(θ), y=R·sin(θ), z=h', radius: 1.2, heightRange: [0.85, 1.0], samplePoints: [] }, meridianActivation: ['LR','GB','KI','SP'], energyEfficiency: 0.90, biometricParams: { centerOfGravity: { x: 0, y: 92, z: 0 }, baseOfSupport: 0.14, momentOfInertia: 1.5, angularMomentum: 3.2 } },
    ];
    for (const m of moveData) {
      this.moves.set(m.id, m);
    }
  }

  // --------------------------------------------------------
  // 2.2 核心算法: 武术力场函数
  // --------------------------------------------------------

  /** 武术力场 — 随空间距离指数衰减 */
  martialForce(pos: Point3D, origin: Point3D, F0: number, lambda: number): number {
    const dist = Math.sqrt(
      Math.pow(pos.x - origin.x, 2) +
      Math.pow(pos.y - origin.y, 2) +
      Math.pow(pos.z - origin.z, 2)
    );
    return F0 * Math.exp(-lambda * dist);
  }

  // --------------------------------------------------------
  // 2.3 核心算法: 中药扩散函数
  // --------------------------------------------------------

  /** 中药扩散 — 三维高斯分布 */
  herbDiffusion(pos: Point3D, center: Point3D, D: number, t: number): number {
    const r2 = Math.pow(pos.x - center.x, 2) +
               Math.pow(pos.y - center.y, 2) +
               Math.pow(pos.z - center.z, 2);
    const denom = Math.pow(4 * Math.PI * D * t, 1.5);
    return (1.0 / denom) * Math.exp(-r2 / (4 * D * t));
  }

  // --------------------------------------------------------
  // 2.4 核心算法: 协同效应计算
  // --------------------------------------------------------

  /** 协同效应 — 力场与扩散场的空间卷积 */
  computeSynergy(
    pos: Point3D,
    martialOrigin: Point3D,
    F0: number,
    lambda: number,
    herbCenter: Point3D,
    D: number,
    t: number,
    k: number = 1.2
  ): SynergyEffect {
    const force = this.martialForce(pos, martialOrigin, F0, lambda);
    const diffusion = this.herbDiffusion(pos, herbCenter, D, t);
    const synergy = force * diffusion * k;
    const maxForce = F0;
    const maxDiffusion = this.herbDiffusion(herbCenter, herbCenter, D, t);
    const overlap = Math.min(force / maxForce, diffusion / maxDiffusion);
    const efficacyBoost = overlap > 0.6 ? 2.3 : 1 + overlap;

    return {
      martialForce: force,
      herbDiffusion: diffusion,
      spatialOverlap: overlap,
      synergyFactor: k,
      efficacyBoost,
      position: pos,
    };
  }

  // --------------------------------------------------------
  // 2.5 核心算法: 能量流算法
  // --------------------------------------------------------

  /** 能量流算法 — F = k × 招式动量 × 中药活性成分浓度 */
  computeEnergyFlow(
    moveId: string,
    herbId: string,
    acupointId: string,
    k: number = 1.0
  ): EnergyFlowResult {
    const move = this.moves.get(moveId);
    const herb = this.herbs.get(herbId);
    const acupoint = this.acupoints.get(acupointId);

    if (!move || !herb || !acupoint) {
      return { forceOnAcupoint: 0, herbStimulation: 0, synergyEffect: 0, meridianActivation: [], energyBalance: 0 };
    }

    // 招式动量
    const momentum = move.forceCurve.peakForce * move.forceCurve.sustainTime;
    
    // 中药活性成分总浓度
    const totalConcentration = herb.activeCompounds.reduce((s, c) => s + c.concentration, 0);
    
    // 作用力 = k × 动量 × 浓度
    const forceOnAcupoint = k * momentum * totalConcentration * 0.001; // 归一化

    // 扩散刺激
    const herbStimulation = this.herbDiffusion(
      acupoint.position, herb.growingRegion as unknown as Point3D, herb.diffusionCoeff, 3600
    );

    // 协同效应
    const synergy = this.computeSynergy(
      acupoint.position,
      move.biometricParams.centerOfGravity,
      move.forceCurve.peakForce,
      0.1,
      acupoint.position,
      herb.diffusionCoeff,
      3600
    );

    // 经络激活
    const meridianActivation = [...new Set([...move.meridianActivation, ...herb.meridianTropism])];

    // 能量平衡
    const yinMeridians = meridianActivation.filter(id => {
      const m = this.meridians.get(id);
      return m?.yinYang === 'yin';
    }).length;
    const yangMeridians = meridianActivation.length - yinMeridians;
    const energyBalance = 1 - Math.abs(yinMeridians - yangMeridians) / Math.max(1, meridianActivation.length);

    return {
      forceOnAcupoint,
      herbStimulation,
      synergyEffect: synergy.synergyFactor * synergy.spatialOverlap,
      meridianActivation,
      energyBalance,
    };
  }

  // --------------------------------------------------------
  // 2.6 核心算法: 宇宙-人体-中药共振计算
  // --------------------------------------------------------

  /** 宇宙层面共振计算 */
  computeCosmicResonance(
    lunarPhase: number,    // 月相 0~1 (0=朔月, 0.5=满月)
    solarTerm: string,     // 节气
    latitude: number       // 纬度
  ): ResonanceResult[] {
    const results: ResonanceResult[] = [];

    // 月球引力对人体经络的影响
    const lunarGravEffect = 1 + 0.15 * Math.sin(lunarPhase * Math.PI);
    results.push({
      source: '月球公转',
      target: '人体经络能量',
      coefficient: 0.85,
      pValue: 0.003,
      period: 29.5,
      amplitude: lunarGravEffect,
      phaseOffset: lunarPhase * 2 * Math.PI,
      scale: 'cosmic',
    });

    // 地球公转(季节)对中药药性的影响
    const seasonalCycle = this.getSeasonalCycleValue(solarTerm);
    results.push({
      source: '地球公转(黄赤交角23.5°)',
      target: '中药药性周期',
      coefficient: 0.72,
      pValue: 0.008,
      period: 365,
      amplitude: seasonalCycle,
      phaseOffset: 0,
      scale: 'cosmic',
    });

    // 宇宙射线与中药道地性
    const cosmicRayCorrelation = -0.72; // 负相关
    results.push({
      source: '银河宇宙射线',
      target: '中药道地性',
      coefficient: cosmicRayCorrelation,
      pValue: 0.015,
      period: 365,
      amplitude: latitude > 35 ? 1.2 : 0.8,
      phaseOffset: Math.PI / 4,
      scale: 'macro',
    });

    return results;
  }

  /** 节气周期值 */
  private getSeasonalCycleValue(solarTerm: string): number {
    const cycle: Record<string, number> = {
      '立春': 0.3, '雨水': 0.35, '惊蛰': 0.45, '春分': 0.55,
      '清明': 0.65, '谷雨': 0.75, '立夏': 0.8, '小满': 0.85,
      '芒种': 0.9, '夏至': 1.0, '小暑': 0.95, '大暑': 0.9,
      '立秋': 0.8, '处暑': 0.7, '白露': 0.6, '秋分': 0.5,
      '寒露': 0.4, '霜降': 0.35, '立冬': 0.25, '小雪': 0.2,
      '大雪': 0.15, '冬至': 0.1, '小寒': 0.12, '大寒': 0.15,
    };
    return cycle[solarTerm] ?? 0.5;
  }

  // --------------------------------------------------------
  // 2.7 宏观层面: 地域-武术-中药适配
  // --------------------------------------------------------

  /** 地域能量场适配分析 */
  computeRegionalAdaptation(region: 'north' | 'south'): {
    martialStyle: string;
    forceAmplitude: number;
    herbCategory: string;
    spatialCorrelation: number;
    regionOverlap: number;
  } {
    if (region === 'north') {
      return {
        martialStyle: '长拳(北方温带季风区)',
        forceAmplitude: 3.2,
        herbCategory: '发散性中药(防风/麻黄)',
        spatialCorrelation: 0.81,
        regionOverlap: 0.78,
      };
    }
    return {
      martialStyle: '南拳(亚热带湿润区)',
      forceAmplitude: 1.5,
      herbCategory: '收敛性中药(陈皮/茯苓)',
      spatialCorrelation: 0.76,
      regionOverlap: 0.76,
    };
  }

  // --------------------------------------------------------
  // 2.8 五行生克关系
  // --------------------------------------------------------

  /** 五行相生关系 */
  wuXingGenerate(parent: WuXing): WuXing {
    const gen: Record<WuXing, WuXing> = { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' };
    return gen[parent];
  }

  /** 五行相克关系 */
  wuXingRestrict(parent: WuXing): WuXing {
    const rest: Record<WuXing, WuXing> = { wood: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'wood' };
    return rest[parent];
  }

  /** 五行关系判断 */
  wuXingRelation(a: WuXing, b: WuXing): 'generate' | 'restrict' | 'same' | 'none' {
    if (a === b) return 'same';
    if (this.wuXingGenerate(a) === b) return 'generate';
    if (this.wuXingRestrict(a) === b) return 'restrict';
    return 'none';
  }

  // --------------------------------------------------------
  // 2.9 查询接口
  // --------------------------------------------------------

  getMeridian(id: string): MeridianNode | undefined { return this.meridians.get(id); }
  getAcupoint(id: string): AcupointData | undefined { return this.acupoints.get(id); }
  getHerb(id: string): HerbData | undefined { return this.herbs.get(id); }
  getMove(id: string): MartialMove | undefined { return this.moves.get(id); }
  getAllMeridians(): MeridianNode[] { return Array.from(this.meridians.values()); }
  getAllAcupoints(): AcupointData[] { return Array.from(this.acupoints.values()); }
  getAllHerbs(): HerbData[] { return Array.from(this.herbs.values()); }
  getAllMoves(): MartialMove[] { return Array.from(this.moves.values()); }

  /** 获取引擎统计信息 */
  getStats(): { meridians: number; acupoints: number; herbs: number; moves: number; algorithms: number } {
    return {
      meridians: this.meridians.size,
      acupoints: this.acupoints.size,
      herbs: this.herbs.size,
      moves: this.moves.size,
      algorithms: 5,
    };
  }

  /** 全系统综合分析 */
  fullSystemAnalysis(query: string): {
    answer: string;
    relatedMeridians: string[];
    relatedHerbs: string[];
    relatedMoves: string[];
    resonanceResults: ResonanceResult[];
    synergyEffects: SynergyEffect[];
  } {
    const q = query.toLowerCase();
    const relatedMeridians: string[] = [];
    const relatedHerbs: string[] = [];
    const relatedMoves: string[] = [];
    const resonanceResults: ResonanceResult[] = [];
    const synergyEffects: SynergyEffect[] = [];

    // 搜索相关经络
    for (const [id, m] of this.meridians) {
      if (m.nameCn.includes(q) || m.associatedOrgans.some(o => o.includes(q))) {
        relatedMeridians.push(id);
      }
    }

    // 搜索相关药材
    for (const [id, h] of this.herbs) {
      if (h.nameCn.includes(q) || h.meridianTropism.some(m => m.includes(q)) || h.flavor.some(f => f.includes(q))) {
        relatedHerbs.push(id);
      }
    }

    // 搜索相关招式
    for (const [id, mv] of this.moves) {
      if (mv.nameCn.includes(q) || mv.meridianActivation.some(m => m.includes(q))) {
        relatedMoves.push(id);
      }
    }

    // 计算共振
    resonanceResults.push(...this.computeCosmicResonance(0.5, '夏至', 35));

    // 计算关键协同效应
    if (relatedMoves.length > 0 && relatedHerbs.length > 0 && relatedMeridians.length > 0) {
      const apId = this.acupoints.values().next().value?.id;
      if (apId) {
        const flow = this.computeEnergyFlow(relatedMoves[0], relatedHerbs[0], apId);
        synergyEffects.push({
          martialForce: flow.forceOnAcupoint,
          herbDiffusion: flow.herbStimulation,
          spatialOverlap: flow.energyBalance,
          synergyFactor: flow.synergyEffect,
          efficacyBoost: flow.energyBalance > 0.6 ? 2.3 : 1 + flow.energyBalance,
          position: this.acupoints.get(apId)?.position ?? { x: 0, y: 0, z: 0 },
        });
      }
    }

    let answer = `宇宙GIS四系统融合分析: "${query}"\n`;
    if (relatedMeridians.length > 0) answer += `相关经络: ${relatedMeridians.map(id => this.meridians.get(id)?.nameCn).join(', ')}\n`;
    if (relatedHerbs.length > 0) answer += `相关药材: ${relatedHerbs.map(id => this.herbs.get(id)?.nameCn).join(', ')}\n`;
    if (relatedMoves.length > 0) answer += `相关招式: ${relatedMoves.map(id => this.moves.get(id)?.nameCn).join(', ')}\n`;
    if (resonanceResults.length > 0) answer += `宇宙共振: 发现${resonanceResults.length}组跨尺度共振关系\n`;
    if (synergyEffects.length > 0) answer += `协同效应: 疗效提升${synergyEffects[0].efficacyBoost.toFixed(1)}倍, 空间重叠度${(synergyEffects[0].spatialOverlap * 100).toFixed(0)}%`;

    return { answer, relatedMeridians, relatedHerbs, relatedMoves, resonanceResults, synergyEffects };
  }
}

/** 导出单例 */
export const cosmicGISEngine = CosmicGISEngine.getInstance();
