// ====== 天体大气层与各种层数据模型 ======
// 每个天体的大气层、磁层、电离层、水冰层等
// 支持时间演化：不同地质年代大气成分与厚度变化

export interface AtmosphereLayer {
  id: string;
  name: string;
  nameCn: string;
  type: 'troposphere' | 'stratosphere' | 'mesosphere' | 'thermosphere' | 'exosphere' | 'ionosphere' | 'magnetosphere' | 'cloud' | 'dust' | 'ice' | 'ocean' | 'volcanic';
  color: string;           // 渲染颜色 hex
  opacity: number;         // 渲染透明度 0-1
  thicknessKm: number;     // 层厚度(km)
  thicknessRatio: number;  // 相对天体半径的比例(用于3D渲染)
  composition: string;     // 主要成分
  tempRange: string;       // 温度范围
  pressure?: string;       // 气压
  description: string;
  // 时间演化: key为距今年代(单位:亿年), value为厚度比例因子
  timeEvolution?: Record<string, number>;
}

export interface CelestialAtmosphere {
  bodyName: string;
  bodyNameCn: string;
  bodyType: string;
  layers: AtmosphereLayer[];
  totalAtmosphereHeight: number;  // 大气总高度(km)
  surfacePressure?: string;       // 表面气压
  greenhouseEffect?: string;      // 温室效应描述
  magneticField?: string;         // 磁场描述
  timeEvolutionNote?: string;     // 时间演化总述
}

// ====== 各天体大气层数据 ======
export const CELESTIAL_ATMOSPHERES: CelestialAtmosphere[] = [
  {
    bodyName: 'Sun', bodyNameCn: '太阳', bodyType: 'G型主序星',
    layers: [
      { id: 'sun-photosphere', name: 'Photosphere', nameCn: '光球层', type: 'thermosphere', color: '#ffcc00', opacity: 0.9, thicknessKm: 400, thicknessRatio: 0.006, composition: '氢、氦等离子体', tempRange: '5,500°C', description: '太阳可见表面，黑子和耀斑发生地', timeEvolution: { '46': 0.9, '30': 0.95, '10': 0.98, '0': 1.0 } },
      { id: 'sun-chromosphere', name: 'Chromosphere', nameCn: '色球层', type: 'thermosphere', color: '#ff6633', opacity: 0.3, thicknessKm: 2000, thicknessRatio: 0.003, composition: '氢、氦', tempRange: '4,000-25,000°C', description: '日珥和闪焰的起源层', timeEvolution: { '46': 1.2, '0': 1.0 } },
      { id: 'sun-corona', name: 'Corona', nameCn: '日冕层', type: 'exosphere', color: '#ffffff', opacity: 0.12, thicknessKm: 5000000, thicknessRatio: 0.02, composition: '高温等离子体', tempRange: '1-3百万°C', description: '太阳最外层大气，太阳风起源', timeEvolution: { '46': 1.5, '0': 1.0 } },
      { id: 'sun-magnetosphere', name: 'Heliosphere', nameCn: '日球层', type: 'magnetosphere', color: '#ffaa44', opacity: 0.05, thicknessKm: 0, thicknessRatio: 0.08, composition: '太阳风等离子体', tempRange: '~100,000°C', description: '太阳风充斥的巨大空间，延伸至冥王星轨道之外' },
    ],
    totalAtmosphereHeight: 5000000, magneticField: '偶极磁场，极区~1-2G', timeEvolutionNote: '主序星阶段太阳辐射缓慢增强，日冕活动周期11年'
  },
  {
    bodyName: 'Mercury', bodyNameCn: '水星', bodyType: '类地行星',
    layers: [
      { id: 'mercury-exosphere', name: 'Exosphere', nameCn: '散逸层', type: 'exosphere', color: '#aaaacc', opacity: 0.03, thicknessKm: 1000, thicknessRatio: 0.004, composition: '氧、钠、氢、氦、钾', tempRange: '< 300°C', description: '极稀薄，几乎为真空，由太阳风和微陨石轰击产生', timeEvolution: { '46': 2.0, '40': 1.2, '30': 0.8, '0': 1.0 } },
      { id: 'mercury-magnetosphere', name: 'Magnetosphere', nameCn: '磁层', type: 'magnetosphere', color: '#6688ff', opacity: 0.06, thicknessKm: 0, thicknessRatio: 0.015, composition: '磁场捕获粒子', tempRange: '变化极大', description: '微弱磁偶极，强度约地球1%', timeEvolution: { '46': 3.0, '40': 2.0, '0': 1.0 } },
    ],
    totalAtmosphereHeight: 1000, surfacePressure: '~10⁻¹⁵ atm', magneticField: '微弱偶极磁场，约300nT', timeEvolutionNote: '早期可能有较厚大气，被太阳风剥离殆尽'
  },
  {
    bodyName: 'Venus', bodyNameCn: '金星', bodyType: '类地行星',
    layers: [
      { id: 'venus-troposphere', name: 'Troposphere', nameCn: '对流层', type: 'troposphere', color: '#c9a84c', opacity: 0.4, thicknessKm: 65, thicknessRatio: 0.01, composition: '96.5% CO₂, 3.5% N₂', tempRange: '462°C (表面)', pressure: '92 atm', description: '极端温室效应，表面温度超过铅熔点', timeEvolution: { '46': 0.5, '40': 0.8, '30': 1.2, '10': 1.0, '0': 1.0 } },
      { id: 'venus-cloud', name: 'Cloud Deck', nameCn: '云层', type: 'cloud', color: '#e8d5a3', opacity: 0.5, thicknessKm: 20, thicknessRatio: 0.005, composition: '硫酸液滴', tempRange: '~0°C', description: '全球覆盖的厚硫酸云层，反照率0.75', timeEvolution: { '46': 0.3, '40': 0.7, '0': 1.0 } },
      { id: 'venus-stratosphere', name: 'Stratosphere', nameCn: '平流层', type: 'stratosphere', color: '#aa8833', opacity: 0.15, thicknessKm: 30, thicknessRatio: 0.006, composition: 'CO₂', tempRange: '-30°C', description: '缺乏臭氧层，温度梯度平缓' },
      { id: 'venus-mesosphere', name: 'Mesosphere', nameCn: '中间层', type: 'mesosphere', color: '#886622', opacity: 0.08, thicknessKm: 35, thicknessRatio: 0.006, composition: 'CO₂', tempRange: '-100°C', description: '大气层中较冷区域' },
      { id: 'venus-thermosphere', name: 'Thermosphere', nameCn: '热层', type: 'thermosphere', color: '#cc8844', opacity: 0.05, thicknessKm: 200, thicknessRatio: 0.01, composition: 'O, CO, CO₂', tempRange: '-100~300°C', description: '昼夜温差极大，夜间冰帽现象' },
      { id: 'venus-ionosphere', name: 'Ionosphere', nameCn: '电离层', type: 'ionosphere', color: '#ffaa66', opacity: 0.04, thicknessKm: 0, thicknessRatio: 0.005, composition: 'O⁺, O₂⁺', tempRange: '2000-3000K', description: '太阳辐射电离产生，日侧较厚' },
    ],
    totalAtmosphereHeight: 250, surfacePressure: '92 atm', greenhouseEffect: '极端温室效应：+462°C增温', magneticField: '无内禀磁场，感应磁层', timeEvolutionNote: '早期可能与地球类似，失控温室效应使海洋蒸发'
  },
  {
    bodyName: 'Earth', bodyNameCn: '地球', bodyType: '类地行星',
    layers: [
      { id: 'earth-troposphere', name: 'Troposphere', nameCn: '对流层', type: 'troposphere', color: '#88ccee', opacity: 0.25, thicknessKm: 12, thicknessRatio: 0.004, composition: '78% N₂, 21% O₂, 0.04% CO₂', tempRange: '-60~40°C', pressure: '1 atm', description: '天气现象发生层，水循环核心', timeEvolution: { '46': 1.5, '40': 1.3, '24': 1.1, '5': 1.0, '0': 1.0 } },
      { id: 'earth-stratosphere', name: 'Stratosphere', nameCn: '平流层', type: 'stratosphere', color: '#66aadd', opacity: 0.12, thicknessKm: 38, thicknessRatio: 0.006, composition: 'O₃ (臭氧层)', tempRange: '-60~0°C', description: '臭氧层吸收UV，保护地表生命', timeEvolution: { '46': 0, '24': 0.3, '6': 0.9, '0': 1.0 } },
      { id: 'earth-mesosphere', name: 'Mesosphere', nameCn: '中间层', type: 'mesosphere', color: '#4488bb', opacity: 0.06, thicknessKm: 35, thicknessRatio: 0.006, composition: 'N₂, O₂', tempRange: '-90°C', description: '流星燃烧层' },
      { id: 'earth-thermosphere', name: 'Thermosphere', nameCn: '热层', type: 'thermosphere', color: '#3366aa', opacity: 0.04, thicknessKm: 500, thicknessRatio: 0.015, composition: 'O, N₂', tempRange: '500-2000°C', description: '极光发生区，ISS轨道层' },
      { id: 'earth-ionosphere', name: 'Ionosphere', nameCn: '电离层', type: 'ionosphere', color: '#44ff88', opacity: 0.05, thicknessKm: 0, thicknessRatio: 0.008, composition: 'O⁺, H⁺, e⁻', tempRange: '~2000K', description: '无线电通信反射层' },
      { id: 'earth-exosphere', name: 'Exosphere', nameCn: '散逸层', type: 'exosphere', color: '#223366', opacity: 0.02, thicknessKm: 10000, thicknessRatio: 0.02, composition: 'H, He', tempRange: '~1500K', description: '大气与太空过渡区' },
      { id: 'earth-magnetosphere', name: 'Magnetosphere', nameCn: '磁层', type: 'magnetosphere', color: '#4488ff', opacity: 0.04, thicknessKm: 0, thicknessRatio: 0.03, composition: '等离子体', tempRange: '变化大', description: '地磁场阻挡太阳风，保护大气', timeEvolution: { '46': 0.3, '35': 0.6, '10': 0.9, '0': 1.0 } },
      { id: 'earth-cloud', name: 'Cloud Layer', nameCn: '云层', type: 'cloud', color: '#ffffff', opacity: 0.35, thicknessKm: 8, thicknessRatio: 0.003, composition: '水蒸气、冰晶', tempRange: '-40~20°C', description: '约67%表面被云覆盖', timeEvolution: { '46': 0.2, '40': 0.5, '24': 0.8, '0': 1.0 } },
    ],
    totalAtmosphereHeight: 10000, surfacePressure: '1 atm', greenhouseEffect: '适度温室效应：+33°C增温', magneticField: '强偶极磁场，~25-65μT', timeEvolutionNote: '太古代几乎无氧，大氧化事件(24亿年前)后O₂增加，臭氧层约6亿年前形成'
  },
  {
    bodyName: 'Mars', bodyNameCn: '火星', bodyType: '类地行星',
    layers: [
      { id: 'mars-troposphere', name: 'Troposphere', nameCn: '对流层', type: 'troposphere', color: '#c1440e', opacity: 0.12, thicknessKm: 10, thicknessRatio: 0.005, composition: '95% CO₂, 2.7% N₂', tempRange: '-87~-5°C', pressure: '0.006 atm', description: '稀薄大气，偶有沙尘暴', timeEvolution: { '46': 2.0, '40': 1.5, '35': 1.0, '30': 0.5, '10': 0.3, '0': 1.0 } },
      { id: 'mars-stratosphere', name: 'Stratosphere', nameCn: '平流层', type: 'stratosphere', color: '#aa3300', opacity: 0.05, thicknessKm: 25, thicknessRatio: 0.005, composition: 'CO₂', tempRange: '-100°C', description: '无臭氧层保护' },
      { id: 'mars-thermosphere', name: 'Thermosphere', nameCn: '热层', type: 'thermosphere', color: '#882200', opacity: 0.03, thicknessKm: 120, thicknessRatio: 0.008, composition: 'O, CO₂', tempRange: '200-400K', description: '受太阳活动强烈影响' },
      { id: 'mars-exosphere', name: 'Exosphere', nameCn: '散逸层', type: 'exosphere', color: '#661100', opacity: 0.02, thicknessKm: 200, thicknessRatio: 0.004, composition: 'O, CO, H', tempRange: '~300K', description: '正在被太阳风剥离' },
      { id: 'mars-dust', name: 'Dust Storms', nameCn: '沙尘层', type: 'dust', color: '#dd8844', opacity: 0.15, thicknessKm: 20, thicknessRatio: 0.004, composition: 'Fe₂O₃微尘', tempRange: '随对流层', description: '全球性沙尘暴可持续数月' },
      { id: 'mars-ice', name: 'Polar Ice Caps', nameCn: '极冠冰层', type: 'ice', color: '#eeeeff', opacity: 0.3, thicknessKm: 3, thicknessRatio: 0.002, composition: '干冰(CO₂)、水冰', tempRange: '-150°C', description: '季节性膨胀收缩，水冰储量巨大', timeEvolution: { '46': 0, '40': 0.2, '30': 0.5, '0': 1.0 } },
    ],
    totalAtmosphereHeight: 200, surfacePressure: '0.006 atm', greenhouseEffect: '微弱温室效应：+5°C', magneticField: '无全球磁场，局部地壳磁异常', timeEvolutionNote: '早期有浓厚CO₂大气和液态水海洋，35亿年前磁场消失后大气被太阳风剥离'
  },
  {
    bodyName: 'Jupiter', bodyNameCn: '木星', bodyType: '气态巨行星',
    layers: [
      { id: 'jupiter-troposphere', name: 'Troposphere', nameCn: '对流层', type: 'troposphere', color: '#c88b3a', opacity: 0.5, thicknessKm: 50, thicknessRatio: 0.008, composition: '90% H₂, 10% He', tempRange: '-108°C (云顶)', description: '强烈对流，大红斑风暴', timeEvolution: { '46': 0.8, '20': 0.9, '0': 1.0 } },
      { id: 'jupiter-stratosphere', name: 'Stratosphere', nameCn: '平流层', type: 'stratosphere', color: '#aa7733', opacity: 0.15, thicknessKm: 300, thicknessRatio: 0.01, composition: 'H₂, He, CH₄', tempRange: '-160°C', description: '甲烷光化学产生碳氢化合物雾霾' },
      { id: 'jupiter-thermosphere', name: 'Thermosphere', nameCn: '热层', type: 'thermosphere', color: '#996622', opacity: 0.05, thicknessKm: 1000, thicknessRatio: 0.012, composition: 'H, H₂', tempRange: '~1000K', description: '极光活跃区域' },
      { id: 'jupiter-ionosphere', name: 'Ionosphere', nameCn: '电离层', type: 'ionosphere', color: '#ffcc66', opacity: 0.04, thicknessKm: 0, thicknessRatio: 0.005, composition: 'H⁺, H₃⁺', tempRange: '~1000K', description: 'H₃⁺离子是极光发射的主要来源' },
      { id: 'jupiter-magnetosphere', name: 'Magnetosphere', nameCn: '磁层', type: 'magnetosphere', color: '#4466ff', opacity: 0.06, thicknessKm: 0, thicknessRatio: 0.05, composition: '等离子体', tempRange: '变化大', description: '太阳系最强行星磁场，磁层延伸至土星轨道', timeEvolution: { '46': 1.2, '0': 1.0 } },
      { id: 'jupiter-cloud', name: 'Cloud Bands', nameCn: '云带层', type: 'cloud', color: '#ddbb77', opacity: 0.4, thicknessKm: 30, thicknessRatio: 0.005, composition: 'NH₃冰、NH₄SH、H₂O', tempRange: '-145~-108°C', description: '纬向风带，风速达620km/h', timeEvolution: { '46': 0.5, '20': 0.8, '0': 1.0 } },
    ],
    totalAtmosphereHeight: 1000, greenhouseEffect: '内热为主，辐射能量是吸收太阳能的1.67倍', magneticField: '最强行星磁场，赤道420μT，极区1.4mT', timeEvolutionNote: '形成后缓慢冷却，大红斑可能已存在350年以上'
  },
  {
    bodyName: 'Saturn', bodyNameCn: '土星', bodyType: '气态巨行星',
    layers: [
      { id: 'saturn-troposphere', name: 'Troposphere', nameCn: '对流层', type: 'troposphere', color: '#e8d5a3', opacity: 0.45, thicknessKm: 200, thicknessRatio: 0.008, composition: '96% H₂, 3% He', tempRange: '-139°C (云顶)', description: '纬向气流显著，六角形风暴' },
      { id: 'saturn-stratosphere', name: 'Stratosphere', nameCn: '平流层', type: 'stratosphere', color: '#ccbb88', opacity: 0.12, thicknessKm: 300, thicknessRatio: 0.008, composition: 'H₂, He, CH₄', tempRange: '-180°C', description: '含复杂碳氢化合物' },
      { id: 'saturn-thermosphere', name: 'Thermosphere', nameCn: '热层', type: 'thermosphere', color: '#bbaa77', opacity: 0.04, thicknessKm: 800, thicknessRatio: 0.01, composition: 'H₂', tempRange: '~800K', description: '异常高温来源未明' },
      { id: 'saturn-magnetosphere', name: 'Magnetosphere', nameCn: '磁层', type: 'magnetosphere', color: '#5577ff', opacity: 0.05, thicknessKm: 0, thicknessRatio: 0.04, composition: '等离子体', tempRange: '变化大', description: '强磁场，磁层内含土星环和卫星' },
      { id: 'saturn-cloud', name: 'Cloud Bands', nameCn: '云带层', type: 'cloud', color: '#eeddbb', opacity: 0.35, thicknessKm: 50, thicknessRatio: 0.005, composition: 'NH₃冰', tempRange: '-150°C', description: '比木星更淡的云带结构' },
    ],
    totalAtmosphereHeight: 800, greenhouseEffect: '内热显著，赤道辐射高于极区', magneticField: '强偶极磁场，赤道20μT', timeEvolutionNote: '与木星类似，持续缓慢冷却'
  },
  {
    bodyName: 'Uranus', bodyNameCn: '天王星', bodyType: '冰巨星',
    layers: [
      { id: 'uranus-troposphere', name: 'Troposphere', nameCn: '对流层', type: 'troposphere', color: '#7ec8e3', opacity: 0.35, thicknessKm: 200, thicknessRatio: 0.008, composition: '83% H₂, 15% He, 2% CH₄', tempRange: '-197°C', description: '甲烷吸收红光呈蓝绿色' },
      { id: 'uranus-stratosphere', name: 'Stratosphere', nameCn: '平流层', type: 'stratosphere', color: '#5eaac3', opacity: 0.08, thicknessKm: 100, thicknessRatio: 0.005, composition: 'H₂, CH₄, C₂H₂', tempRange: '-220°C', description: '极冷大气' },
      { id: 'uranus-thermosphere', name: 'Thermosphere', nameCn: '热层', type: 'thermosphere', color: '#4d88aa', opacity: 0.03, thicknessKm: 500, thicknessRatio: 0.008, composition: 'H₂', tempRange: '~800K', description: '异常高温' },
      { id: 'uranus-magnetosphere', name: 'Magnetosphere', nameCn: '磁层', type: 'magnetosphere', color: '#4466cc', opacity: 0.04, thicknessKm: 0, thicknessRatio: 0.025, composition: '等离子体', tempRange: '变化大', description: '磁轴与自转轴成59°夹角，极度倾斜' },
    ],
    totalAtmosphereHeight: 500, greenhouseEffect: '微弱内热，最冷行星大气', magneticField: '倾斜偏心偶极，约23μT', timeEvolutionNote: '可能经历过巨大撞击导致自转轴倾斜97°'
  },
  {
    bodyName: 'Neptune', bodyNameCn: '海王星', bodyType: '冰巨星',
    layers: [
      { id: 'neptune-troposphere', name: 'Troposphere', nameCn: '对流层', type: 'troposphere', color: '#3f5cff', opacity: 0.4, thicknessKm: 200, thicknessRatio: 0.008, composition: '80% H₂, 19% He, 1% CH₄', tempRange: '-201°C', description: '太阳系最强风速达2,100km/h' },
      { id: 'neptune-stratosphere', name: 'Stratosphere', nameCn: '平流层', type: 'stratosphere', color: '#3344cc', opacity: 0.1, thicknessKm: 100, thicknessRatio: 0.005, composition: 'H₂, CH₄', tempRange: '-230°C', description: '甲烷光解产生雾霾' },
      { id: 'neptune-thermosphere', name: 'Thermosphere', nameCn: '热层', type: 'thermosphere', color: '#2233aa', opacity: 0.04, thicknessKm: 600, thicknessRatio: 0.01, composition: 'H₂', tempRange: '~750K', description: '内热远超吸收太阳能' },
      { id: 'neptune-magnetosphere', name: 'Magnetosphere', nameCn: '磁层', type: 'magnetosphere', color: '#4455dd', opacity: 0.05, thicknessKm: 0, thicknessRatio: 0.025, composition: '等离子体', tempRange: '变化大', description: '磁轴倾斜47°' },
    ],
    totalAtmosphereHeight: 600, greenhouseEffect: '内热是吸收太阳能的2.6倍', magneticField: '倾斜偶极磁场，约27μT', timeEvolutionNote: '内热来源成谜，比天王星活跃得多'
  },
  {
    bodyName: 'Moon', bodyNameCn: '月球', bodyType: '卫星',
    layers: [
      { id: 'moon-exosphere', name: 'Exosphere', nameCn: '散逸层', type: 'exosphere', color: '#ccccdd', opacity: 0.02, thicknessKm: 100, thicknessRatio: 0.003, composition: 'He, Ar, Na, K', tempRange: '~100K', description: '极稀薄，每cm³仅数万个原子', timeEvolution: { '46': 3.0, '40': 1.5, '30': 0.8, '0': 1.0 } },
      { id: 'moon-dust', name: 'Dust Envelope', nameCn: '尘埃层', type: 'dust', color: '#aaaaaa', opacity: 0.05, thicknessKm: 50, thicknessRatio: 0.002, composition: '月壤微尘', tempRange: '随表面', description: '日照下悬浮的月尘，月球黎明弧' },
    ],
    totalAtmosphereHeight: 100, surfacePressure: '~3×10⁻¹⁵ atm', timeEvolutionNote: '早期可能有短暂岩浆海释气形成的稀薄大气，现已近乎真空'
  },
];

// ====== 天体物质成分数据(供游荡智能体分析) ======
export interface MaterialComposition {
  bodyName: string;
  bodyNameCn: string;
  materials: {
    name: string;
    nameCn: string;
    category: 'metal' | 'mineral' | 'gas' | 'ice' | 'organic' | 'radioactive' | 'volatile';
    abundance: string;      // 丰度
    description: string;
    utilization?: string;   // 利用价值
  }[];
}

export const MATERIAL_COMPOSITIONS: MaterialComposition[] = [
  {
    bodyName: 'Mercury', bodyNameCn: '水星',
    materials: [
      { name: 'Iron', nameCn: '铁', category: 'metal', abundance: '~60%(核心)', description: '巨大铁核占比极高', utilization: '航天器防护材料' },
      { name: 'Silicate', nameCn: '硅酸盐', category: 'mineral', abundance: '~35%', description: '地壳和地幔主要成分' },
      { name: 'Sodium', nameCn: '钠', category: 'metal', abundance: '微量', description: '外逸层主要成分' },
      { name: 'Helium-3', nameCn: '氦-3', category: 'radioactive', abundance: '极微量', description: '太阳风注入', utilization: '聚变燃料(潜在)' },
    ],
  },
  {
    bodyName: 'Venus', bodyNameCn: '金星',
    materials: [
      { name: 'CO₂', nameCn: '二氧化碳', category: 'gas', abundance: '96.5%', description: '大气主要成分，极端温室效应' },
      { name: 'Sulfuric Acid', nameCn: '硫酸', category: 'mineral', abundance: '云层', description: '云层硫酸液滴', utilization: '化工原料(理论)' },
      { name: 'Nitrogen', nameCn: '氮', category: 'gas', abundance: '3.5%', description: '大气次要成分' },
      { name: 'Iron Oxide', nameCn: '氧化铁', category: 'mineral', abundance: '表面', description: '表面岩石成分' },
    ],
  },
  {
    bodyName: 'Earth', bodyNameCn: '地球',
    materials: [
      { name: 'Water', nameCn: '水', category: 'ice', abundance: '71%表面', description: '液态水海洋', utilization: '生命支撑、燃料分解' },
      { name: 'Oxygen', nameCn: '氧', category: 'gas', abundance: '21%', description: '大气主要成分，生命产物' },
      { name: 'Silicon', nameCn: '硅', category: 'mineral', abundance: '28%地壳', description: '地壳最丰富元素之一' },
      { name: 'Iron', nameCn: '铁', category: 'metal', abundance: '32%核心', description: '地核主要成分', utilization: '结构材料' },
      { name: 'Rare Earth', nameCn: '稀土元素', category: 'metal', abundance: '微量', description: '高科技应用关键材料', utilization: '电子、磁体' },
    ],
  },
  {
    bodyName: 'Mars', bodyNameCn: '火星',
    materials: [
      { name: 'Iron Oxide', nameCn: '氧化铁', category: 'mineral', abundance: '表面广泛', description: '赋予火星红色外观', utilization: '颜料、铁矿' },
      { name: 'CO₂', nameCn: '二氧化碳', category: 'gas', abundance: '95%大气', description: '稀薄大气主成分', utilization: '可转化为O₂和CH₄燃料' },
      { name: 'Water Ice', nameCn: '水冰', category: 'ice', abundance: '极冠和地下', description: '极冠和次表面冰层', utilization: '饮水、O₂、H₂燃料' },
      { name: 'Perchlorates', nameCn: '高氯酸盐', category: 'mineral', abundance: '土壤中', description: '土壤中有毒盐类' },
      { name: 'Basalt', nameCn: '玄武岩', category: 'mineral', abundance: '表面广泛', description: '火山岩，建筑材料', utilization: '建筑、3D打印基材' },
    ],
  },
  {
    bodyName: 'Jupiter', bodyNameCn: '木星',
    materials: [
      { name: 'Hydrogen', nameCn: '氢', category: 'gas', abundance: '89.8%', description: '金属氢核心，极端压力', utilization: '燃料(大气上层提取)' },
      { name: 'Helium', nameCn: '氦', category: 'gas', abundance: '10.2%', description: '次丰富元素' },
      { name: 'Helium-3', nameCn: '氦-3', category: 'radioactive', abundance: '极微量', description: '聚变燃料理想材料', utilization: '核聚变燃料(极高价值)' },
      { name: 'Ammonia', nameCn: '氨', category: 'volatile', abundance: '0.026%', description: '云层成分', utilization: '化肥、制冷' },
      { name: 'Methane', nameCn: '甲烷', category: 'organic', abundance: '0.3%', description: '微量有机物', utilization: '燃料' },
    ],
  },
  {
    bodyName: 'Saturn', bodyNameCn: '土星',
    materials: [
      { name: 'Hydrogen', nameCn: '氢', category: 'gas', abundance: '96.3%', description: '金属氢核心' },
      { name: 'Helium', nameCn: '氦', category: 'gas', abundance: '3.25%', description: '氦雨现象' },
      { name: 'Water Ice', nameCn: '水冰', category: 'ice', abundance: '环系统', description: '土星环主体成分', utilization: '水资源' },
      { name: 'Titan Organics', nameCn: '泰坦有机物', category: 'organic', abundance: '泰坦卫星', description: '甲烷/乙烷湖泊，复杂有机物', utilization: '有机化学原料' },
    ],
  },
  {
    bodyName: 'Uranus', bodyNameCn: '天王星',
    materials: [
      { name: 'Hydrogen', nameCn: '氢', category: 'gas', abundance: '82.5%', description: '大气主体' },
      { name: 'Helium', nameCn: '氦', category: 'gas', abundance: '15.2%', description: '次成分' },
      { name: 'Methane', nameCn: '甲烷', category: 'organic', abundance: '2.3%', description: '赋予蓝绿色', utilization: '燃料、化工' },
      { name: 'Water Ice', nameCn: '水冰(高压)', category: 'ice', abundance: '内部', description: '高压冰层' },
      { name: 'Ammonia Ice', nameCn: '氨冰', category: 'ice', abundance: '内部', description: '冰巨行星地幔成分' },
    ],
  },
  {
    bodyName: 'Neptune', bodyNameCn: '海王星',
    materials: [
      { name: 'Hydrogen', nameCn: '氢', category: 'gas', abundance: '80%', description: '大气主体' },
      { name: 'Helium', nameCn: '氦', category: 'gas', abundance: '19%', description: '次成分' },
      { name: 'Methane', nameCn: '甲烷', category: 'organic', abundance: '1.5%', description: '赋予深蓝色', utilization: '燃料' },
      { name: 'Diamond Rain', nameCn: '钻石雨', category: 'mineral', abundance: '内部', description: '极端压力下碳形成钻石', utilization: '工业钻石(理论)' },
      { name: 'Water Ice', nameCn: '水冰(高压)', category: 'ice', abundance: '内部', description: '超离子水冰层' },
    ],
  },
  {
    bodyName: 'Moon', bodyNameCn: '月球',
    materials: [
      { name: 'Helium-3', nameCn: '氦-3', category: 'radioactive', abundance: '~100万吨(估算)', description: '太阳风注入月壤', utilization: '清洁聚变燃料(极高战略价值)' },
      { name: 'Anorthite', nameCn: '钙长石', category: 'mineral', abundance: '高地', description: '铝硅酸盐矿物', utilization: '铝、硅来源' },
      { name: 'Ilmenite', nameCn: '钛铁矿', category: 'mineral', abundance: '月海', description: 'FeTiO₃', utilization: '钛、铁、O₂提取' },
      { name: 'Water Ice', nameCn: '水冰', category: 'ice', abundance: '极地永久阴影区', description: 'LCROSS确认存在', utilization: '饮水、燃料分解' },
      { name: 'Regolith', nameCn: '月壤', category: 'mineral', abundance: '表面', description: '含O₂约40-45%(重量)', utilization: 'O₂提取、3D打印建材' },
    ],
  },
];

// ====== 时间演化关键事件 ======
export interface AtmosphericEvent {
  yearsAgo: string;     // 距今年代
  bodyName: string;
  bodyNameCn: string;
  event: string;
  impact: string;       // 对大气层的影响
}

export const ATMOSPHERIC_EVENTS: AtmosphericEvent[] = [
  { yearsAgo: '46亿年', bodyName: 'Sun', bodyNameCn: '太阳', event: '太阳诞生', impact: 'T Tauri阶段，强烈太阳风' },
  { yearsAgo: '45亿年', bodyName: 'Mercury', bodyNameCn: '水星', event: '岩浆海凝固', impact: '释气形成早期大气' },
  { yearsAgo: '44亿年', bodyName: 'Earth', bodyNameCn: '地球', event: '岩浆海冷却', impact: '水蒸气大气，开始凝结' },
  { yearsAgo: '42亿年', bodyName: 'Earth', bodyNameCn: '地球', event: '晚期重轰炸', impact: '大量挥发性物质输送' },
  { yearsAgo: '40亿年', bodyName: 'Mars', bodyNameCn: '火星', event: '磁场消失', impact: '大气开始被太阳风剥离' },
  { yearsAgo: '38亿年', bodyName: 'Venus', bodyNameCn: '金星', event: '失控温室效应', impact: '海洋蒸发，CO₂积累' },
  { yearsAgo: '24亿年', bodyName: 'Earth', bodyNameCn: '地球', event: '大氧化事件', impact: 'O₂累积，厌氧生物灭绝' },
  { yearsAgo: '6亿年', bodyName: 'Earth', bodyNameCn: '地球', event: '臭氧层形成', impact: 'UV屏蔽，生命登陆' },
  { yearsAgo: '2.5亿年', bodyName: 'Earth', bodyNameCn: '地球', event: '二叠纪大灭绝', impact: '大规模火山释气，大气成分剧变' },
  { yearsAgo: '6600万年', bodyName: 'Earth', bodyNameCn: '地球', event: 'K-Pg撞击', impact: '全球尘埃遮蔽，短期降温' },
  { yearsAgo: '现在', bodyName: 'Earth', bodyNameCn: '地球', event: '人为气候变化', impact: 'CO₂浓度400+ppm，温室效应增强' },
];

// 根据时间获取大气层厚度比例因子
export function getLayerThicknessAtTime(layer: AtmosphereLayer, billionYearsAgo: number): number {
  if (!layer.timeEvolution) return 1.0;
  const keys = Object.keys(layer.timeEvolution).map(Number).sort((a, b) => a - b);
  if (keys.length === 0) return 1.0;
  if (billionYearsAgo <= keys[0]) return layer.timeEvolution[String(keys[0])];
  if (billionYearsAgo >= keys[keys.length - 1]) return layer.timeEvolution[String(keys[keys.length - 1])];
  // 线性插值
  for (let i = 0; i < keys.length - 1; i++) {
    if (billionYearsAgo >= keys[i] && billionYearsAgo <= keys[i + 1]) {
      const t = (billionYearsAgo - keys[i]) / (keys[i + 1] - keys[i]);
      const v1 = layer.timeEvolution[String(keys[i])];
      const v2 = layer.timeEvolution[String(keys[i + 1])];
      return v1 + (v2 - v1) * t;
    }
  }
  return 1.0;
}
