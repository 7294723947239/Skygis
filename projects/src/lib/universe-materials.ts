/**
 * 宇宙全量物质数据库 - 扩展版
 * 涵盖已知宇宙中所有可观测/理论物质
 * 数据来源: IAU, NASA ADS, arXiv astro-ph, NIST, CAS, 皇家天文学会, IUPAC
 */

export interface CosmicMaterial {
  name: string;
  formula: string;
  percentage: number;
  category: string;
  notes: string;
  state?: '气态' | '液态' | '固态' | '等离子态' | '超临界' | '超离子态' | '超流体' |
    '简并态' | '奇异物态' | '夸克-胶子等离子态' | '玻色-爱因斯坦凝聚态' |
    '超固态' | '中子简并态' | '电子简并态' | '溶解' | '固态/液态' |
    '气态/液态' | '固态/气态' | '气态/固态' | '离子态' | '亚稳态' | '未知';
  discoveryYear?: string;
  importance?: '关键' | '重要' | '次要' | '痕量' | '理论预测' | '未证实';
}

export interface CosmicEnvironment {
  name: string;
  nameCn: string;
  type: string;
  materials: CosmicMaterial[];
  environment: {
    temp: string;
    pressure: string;
    radiation: string;
    gravity: string;
    magneticField?: string;
  };
  hazards: string[];
  resources: string[];
  specialFeatures?: string[];
}

// ================================================================
// 第一部分：恒星类型物质
// ================================================================

const RedGiantMaterials: CosmicEnvironment = {
  name: 'RedGiant', nameCn: '红巨星', type: '恒星(晚期)',
  materials: [
    { name: '氢', formula: 'H', percentage: 70, category: '外层包膜', notes: '未燃烧氢', state: '等离子态', importance: '关键' },
    { name: '氦', formula: 'He', percentage: 28, category: '氦燃烧壳层', notes: '3α过程产物', state: '等离子态', importance: '关键' },
    { name: '碳', formula: 'C', percentage: 0.3, category: '碳核/壳层', notes: '3α过程合成', state: '等离子态', importance: '重要' },
    { name: '氧', formula: 'O', percentage: 0.2, category: '碳核', notes: '碳燃烧产物', state: '等离子态', importance: '重要' },
    { name: '氮', formula: 'N', percentage: 0.05, category: 'CNO循环层', notes: 'CNO循环产物', state: '等离子态', importance: '次要' },
    { name: '锝', formula: 'Tc', percentage: 0.0000001, category: '大气', notes: 's过程标志性元素(半衰期420万年)', state: '等离子态', importance: '关键', discoveryYear: '1952' },
    { name: '锆', formula: 'Zr', percentage: 0.0001, category: 's过程层', notes: '慢中子俘获产物', state: '等离子态', importance: '重要' },
    { name: '钡', formula: 'Ba', percentage: 0.00005, category: 's过程层', notes: '钡星特征', state: '等离子态', importance: '重要' },
    { name: '锂', formula: 'Li', percentage: 0.00001, category: '表面', notes: '富锂红巨星(锂再生机制)', state: '等离子态', importance: '重要' },
    { name: 's过程元素', formula: 'Sr/Y/Zr/Ba/La/Ce/Nd', percentage: 0.001, category: '壳层', notes: '慢中子俘获(AGB星)', state: '等离子态', importance: '关键' },
    { name: '钇', formula: 'Y', percentage: 0.00002, category: 's过程层', notes: '重元素s过程', state: '等离子态', importance: '次要' },
    { name: '镧', formula: 'La', percentage: 0.000005, category: 's过程层', notes: '稀土s过程', state: '等离子态', importance: '次要' },
    { name: '铈', formula: 'Ce', percentage: 0.000008, category: 's过程层', notes: '最丰富稀土', state: '等离子态', importance: '次要' },
    { name: '钕', formula: 'Nd', percentage: 0.000004, category: 's过程层', notes: '永磁体元素', state: '等离子态', importance: '次要' },
    { name: '钛', formula: 'Ti', percentage: 0.0003, category: '壳层', notes: '中等质量元素', state: '等离子态', importance: '次要' },
    { name: '钒', formula: 'V', percentage: 0.00005, category: '壳层', notes: '过渡金属', state: '等离子态', importance: '次要' },
    { name: '铬', formula: 'Cr', percentage: 0.0001, category: '壳层', notes: '铁族前元素', state: '等离子态', importance: '次要' },
    { name: '锰', formula: 'Mn', percentage: 0.00008, category: '壳层', notes: '铁族元素', state: '等离子态', importance: '次要' },
    { name: '铁', formula: 'Fe', percentage: 0.002, category: '壳层', notes: '核合成终点附近', state: '等离子态', importance: '重要' },
    { name: '钴', formula: 'Co', percentage: 0.00005, category: '壳层', notes: '铁族元素', state: '等离子态', importance: '次要' },
    { name: '镍', formula: 'Ni', percentage: 0.0001, category: '壳层', notes: '铁峰元素', state: '等离子态', importance: '次要' },
    { name: '铜', formula: 'Cu', percentage: 0.000003, category: 's过程层', notes: 's过程产物', state: '等离子态', importance: '次要' },
    { name: '锌', formula: 'Zn', percentage: 0.000006, category: 's过程层', notes: 's过程', state: '等离子态', importance: '次要' },
    { name: '铷', formula: 'Rb', percentage: 0.000001, category: 's过程层', notes: 's过程分支', state: '等离子态', importance: '次要' },
    { name: '锶', formula: 'Sr', percentage: 0.000005, category: 's过程层', notes: 's过程第一峰', state: '等离子态', importance: '重要' },
    { name: '铌', formula: 'Nb', percentage: 0.000001, category: 's过程层', notes: 's过程', state: '等离子态', importance: '次要' },
    { name: '钼', formula: 'Mo', percentage: 0.000002, category: 's过程层', notes: 's过程', state: '等离子态', importance: '次要' },
    { name: '钌', formula: 'Ru', percentage: 0.000001, category: 's/r过程', notes: '铂族元素', state: '等离子态', importance: '次要' },
    { name: '一氧化碳', formula: 'CO', percentage: 0.0001, category: '大气分子', notes: '冷星大气', state: '气态', importance: '次要' },
    { name: '水蒸气', formula: 'H₂O', percentage: 0.00005, category: '大气分子', notes: '极冷M型', state: '气态', importance: '次要' },
    { name: '钛氧化物', formula: 'TiO', percentage: 0.0001, category: '大气分子', notes: 'M型光谱特征', state: '气态', importance: '重要' },
    { name: '氧化钒', formula: 'VO', percentage: 0.00003, category: '大气分子', notes: 'M型光谱', state: '气态', importance: '次要' },
  ],
  environment: { temp: '3000-5000K(表面)/2亿K(氦闪)', pressure: '极高压(核心)', radiation: '极强(红光为主)', gravity: '极低表面重力(体积大)', magneticField: '弱' },
  hazards: ['恒星风(质量损失)', '氦闪', '热脉冲', '粉尘抛射', '强对流'],
  resources: ['s过程重元素', '碳/氧/氮', '锂(部分)', '锝(放射源)'],
  specialFeatures: ['3α过程(碳合成)', 's过程(慢中子俘获)', '热脉冲', '质量损失(行星状星云前身)', '锝发现(核合成直接证据)']
};

const WhiteDwarfMaterials: CosmicEnvironment = {
  name: 'WhiteDwarf', nameCn: '白矮星', type: '恒星遗迹(简并)',
  materials: [
    { name: '碳', formula: 'C', percentage: 40, category: '核心', notes: '碳简并核', state: '电子简并态', importance: '关键' },
    { name: '氧', formula: 'O', percentage: 50, category: '核心', notes: '氧简并核', state: '电子简并态', importance: '关键' },
    { name: '氖', formula: 'Ne', percentage: 5, category: '外核', notes: '较重核心成分', state: '电子简并态', importance: '重要' },
    { name: '镁', formula: 'Mg', percentage: 3, category: '外核', notes: '碳燃烧产物', state: '电子简并态', importance: '次要' },
    { name: '铁', formula: 'Fe', percentage: 0.5, category: '核心', notes: '最重元素', state: '电子简并态', importance: '次要' },
    { name: '氢', formula: 'H', percentage: 0.01, category: '大气(DA型)', notes: '残余氢大气', state: '等离子态', importance: '痕量' },
    { name: '氦', formula: 'He', percentage: 0.1, category: '大气(DB型)', notes: '残余氦大气', state: '等离子态', importance: '痕量' },
    { name: '结晶碳(钻石)', formula: 'C(晶体)', percentage: 20, category: '核心(冷却)', notes: '冷却白矮星核心结晶', state: '超固态', importance: '关键' },
    { name: '硅', formula: 'Si', percentage: 0.3, category: '外核', notes: '氧燃烧残余', state: '电子简并态', importance: '次要' },
    { name: '硫', formula: 'S', percentage: 0.2, category: '外核', notes: '氧燃烧残余', state: '电子简并态', importance: '次要' },
    { name: '钙', formula: 'Ca', percentage: 0.05, category: '外核', notes: '碳燃烧残余', state: '电子简并态', importance: '次要' },
    { name: '钠', formula: 'Na', percentage: 0.01, category: '大气(DZ型)', notes: '金属线白矮星', state: '离子态', importance: '次要' },
    { name: '钙线(DZ型)', formula: 'Ca II', percentage: 0.005, category: '大气', notes: 'DZ型特征', state: '离子态', importance: '重要' },
    { name: '碳线(DQ型)', formula: 'C₂', percentage: 0.01, category: '大气', notes: 'DQ型特征碳分子', state: '气态', importance: '重要' },
    { name: '磁场(DXP型)', formula: 'B~10⁶G', percentage: 0, category: '磁场', notes: '磁场白矮星', state: '未知', importance: '重要' },
  ],
  environment: { temp: '8000-40000K(表面)', pressure: '10¹⁹Pa(核心)', radiation: '弱(冷却中)', gravity: '10⁵ m/s²', magneticField: '10⁴-10⁹高斯(部分)' },
  hazards: ['极端引力', '强磁场(部分)', 'Ia型超新星前身(双星)', '潮汐力'],
  resources: ['结晶碳(钻石星)', '简并物质', '重元素'],
  specialFeatures: ['钱德拉塞卡极限(1.4M☉)', '电子简并压支撑', '冷却结晶', 'Ia超新星标准烛光前身']
};

const NeutronStarMaterials: CosmicEnvironment = {
  name: 'NeutronStar', nameCn: '中子星', type: '恒星遗迹(超致密)',
  materials: [
    { name: '中子简并物质', formula: 'n', percentage: 90, category: '核心', notes: '超核密度中子流体', state: '中子简并态', importance: '关键' },
    { name: '超流体中子', formula: 'n(超流)', percentage: 60, category: '内壳', notes: '配对中子超流(¹S₀/³P₂)', state: '超流体', importance: '关键' },
    { name: '质子超导体', formula: 'p(超导)', percentage: 5, category: '核心', notes: '质子库珀对超导', state: '超固态', importance: '关键' },
    { name: '电子', formula: 'e⁻', percentage: 3, category: '核心', notes: 'β平衡电子', state: '简并态', importance: '重要' },
    { name: 'μ子', formula: 'μ⁻', percentage: 1, category: '深层核心', notes: 'μ子凝聚', state: '简并态', importance: '重要' },
    { name: '铁核', formula: '⁵⁶Fe', percentage: 0.1, category: '外壳', notes: '电子简并铁核晶格', state: '电子简并态', importance: '次要' },
    { name: '奇异物质(理论)', formula: 'u/d/s夸克', percentage: 0, category: '最核心', notes: '奇异夸克物质假说', state: '夸克-胶子等离子态', importance: '理论预测' },
    { name: 'π介子凝聚(理论)', formula: 'π⁻', percentage: 0, category: '核心', notes: '介子凝聚假说', state: '奇异物态', importance: '理论预测' },
    { name: 'K介子凝聚(理论)', formula: 'K⁻', percentage: 0, category: '深层核心', notes: '反K凝聚假说', state: '奇异物态', importance: '理论预测' },
    { name: '磁星磁能', formula: 'B≈10¹⁵G', percentage: 0, category: '磁场', notes: '宇宙最强磁场', state: '未知', importance: '关键' },
    { name: 'τ子(理论)', formula: 'τ⁻', percentage: 0, category: '极端核心', notes: '超重轻子可能出现', state: '简并态', importance: '理论预测' },
    { name: '色超导夸克(理论)', formula: 'CSC', percentage: 0, category: '核心', notes: '夸克色超导相', state: '奇异物态', importance: '理论预测' },
    { name: '超核物质', formula: 'Λ/N/Σ超子', percentage: 0, category: '核心', notes: '超子物质可能出现', state: '中子简并态', importance: '理论预测' },
  ],
  environment: { temp: '10⁶K(表面)/10¹¹K(核心)', pressure: '10³⁴Pa(核心)', radiation: '极强(X/γ射线)', gravity: '2×10¹² m/s²', magneticField: '10⁸-10¹⁵高斯' },
  hazards: ['极端引力潮汐', '强磁场(磁星)', 'X/γ辐射暴', '相对论性喷流', '吸积加热'],
  resources: ['超导质子', '超流中子', '奇异物质(理论)', '极端物理实验室'],
  specialFeatures: ['脉冲星(灯塔模型)', '磁星(星震/γ暴)', '中子超流+质子超导', '引力波源(合并)', 'TOV极限(~2.2M☉)']
};

const RedDwarfMaterials: CosmicEnvironment = {
  name: 'RedDwarf', nameCn: '红矮星', type: '恒星(M型主序)',
  materials: [
    { name: '氢', formula: 'H', percentage: 73, category: '整体', notes: '完全对流', state: '等离子态', importance: '关键' },
    { name: '氦', formula: 'He', percentage: 25, category: '整体', notes: 'pp链产物', state: '等离子态', importance: '关键' },
    { name: '金属(天文学)', formula: 'Fe/Si/Mg等', percentage: 1.5, category: '整体', notes: '低金属度/高金属度两类', state: '等离子态', importance: '重要' },
    { name: '锂', formula: 'Li', percentage: 0.0001, category: '表面', notes: '锂吸收线(测龄)', state: '等离子态', importance: '重要' },
    { name: '钛氧化物', formula: 'TiO', percentage: 0.01, category: '光球层', notes: 'M型星光谱特征分子', state: '气态', importance: '重要' },
    { name: '水蒸气', formula: 'H₂O', percentage: 0.001, category: '冷M型大气', notes: '极冷红矮星大气分子', state: '气态', importance: '次要' },
    { name: '一氧化碳', formula: 'CO', percentage: 0.001, category: '冷M型大气', notes: '大气分子', state: '气态', importance: '次要' },
    { name: '氧化钒', formula: 'VO', percentage: 0.003, category: '光球层', notes: 'M型特征', state: '气态', importance: '次要' },
    { name: '氢氧化物', formula: 'OH', percentage: 0.0005, category: '大气', notes: '梅塞尔分子', state: '气态', importance: '次要' },
    { name: '碳', formula: 'C', percentage: 0.0003, category: '整体', notes: 'pp链3α前期', state: '等离子态', importance: '次要' },
    { name: '氮', formula: 'N', percentage: 0.0001, category: '整体', notes: 'CNO循环中间', state: '等离子态', importance: '次要' },
    { name: '氧', formula: 'O', percentage: 0.0005, category: '整体', notes: '金属丰度指示', state: '等离子态', importance: '次要' },
    { name: '钙', formula: 'Ca', percentage: 0.00005, category: '色球层', notes: 'Ca II H&K线', state: '离子态', importance: '重要' },
    { name: '钠', formula: 'Na', percentage: 0.00002, category: '大气', notes: 'Na D线', state: '离子态', importance: '次要' },
    { name: '钾', formula: 'K', percentage: 0.00001, category: '大气', notes: 'K I线', state: '离子态', importance: '次要' },
  ],
  environment: { temp: '2400-3700K(表面)/数百万K(核心)', pressure: '高压(核心)', radiation: '弱(红外为主)', gravity: '100-1000 m/s²', magneticField: '强(潮汐锁定星活跃)' },
  hazards: ['耀斑暴(超级耀斑)', 'X射线闪', '紫外辐射(年轻红矮星)', '潮汐锁定(宜居带问题)'],
  resources: ['氢(极长寿命)', '氦', '宜居带行星(可能)', '几乎无限能源'],
  specialFeatures: ['完全对流(寿命万亿年)', '超级耀斑', '潮汐锁定行星宜居性', '宇宙最常见恒星(75%)', '比宇宙年龄还长寿命']
};

const BlueSupergiantMaterials: CosmicEnvironment = {
  name: 'BlueSupergiant', nameCn: '蓝超巨星', type: '恒星(O/B型)',
  materials: [
    { name: '氢', formula: 'H', percentage: 68, category: '外包层', notes: '大量质量损失', state: '等离子态', importance: '关键' },
    { name: '氦', formula: 'He', percentage: 30, category: '壳层', notes: 'CNO循环产物', state: '等离子态', importance: '关键' },
    { name: '氮', formula: 'N', percentage: 0.3, category: 'CNO循环层', notes: 'CNO循环富集', state: '等离子态', importance: '重要' },
    { name: '碳', formula: 'C', percentage: 0.1, category: '壳层', notes: '部分CNO耗尽', state: '等离子态', importance: '重要' },
    { name: '氧', formula: 'O', percentage: 0.2, category: '核心', notes: '重元素燃烧', state: '等离子态', importance: '重要' },
    { name: '铁', formula: 'Fe', percentage: 0.5, category: '核心(晚期)', notes: '最终核合成终点', state: '等离子态', importance: '关键' },
    { name: '铀', formula: 'U', percentage: 0.0000001, category: 'r过程', notes: '快中子俘获', state: '等离子态', importance: '重要' },
    { name: '硅', formula: 'Si', percentage: 0.05, category: '壳层(晚期)', notes: '硅燃烧前体', state: '等离子态', importance: '重要' },
    { name: '硫', formula: 'S', percentage: 0.03, category: '壳层(晚期)', notes: '氧燃烧产物', state: '等离子态', importance: '重要' },
    { name: '氖', formula: 'Ne', percentage: 0.02, category: '壳层(晚期)', notes: '碳燃烧产物', state: '等离子态', importance: '次要' },
    { name: '镁', formula: 'Mg', percentage: 0.02, category: '壳层(晚期)', notes: '碳燃烧产物', state: '等离子态', importance: '次要' },
    { name: '钴', formula: 'Co', percentage: 0.0001, category: '核心(晚期)', notes: '⁵⁶Co→⁵⁶Fe', state: '等离子态', importance: '重要' },
    { name: '镍', formula: 'Ni', percentage: 0.0005, category: '核心(晚期)', notes: '⁵⁶Ni(Ia产物)', state: '等离子态', importance: '关键' },
    { name: '金', formula: 'Au', percentage: 0.00000001, category: 'r过程', notes: '快中子俘获(超新星/千新星)', state: '等离子态', importance: '重要' },
    { name: '铂', formula: 'Pt', percentage: 0.00000002, category: 'r过程', notes: 'r过程第3峰', state: '等离子态', importance: '重要' },
    { name: '钍', formula: 'Th', percentage: 0.00000005, category: 'r过程', notes: '放射性纪年', state: '等离子态', importance: '重要' },
    { name: '氦-3', formula: '³He', percentage: 0.001, category: 'CNO循环层', notes: 'pp链中间产物', state: '等离子态', importance: '次要' },
    { name: '锂', formula: 'Li', percentage: 0.000001, category: '表面', notes: '表面锂(少量)', state: '等离子态', importance: '次要' },
  ],
  environment: { temp: '20000-50000K(表面)/>10⁹K(核心)', pressure: '极高(核心)', radiation: '极强(紫外为主)', gravity: '低表面重力', magneticField: '弱' },
  hazards: ['极强紫外辐射', '恒星风(高速)', '超新星前身', '强X射线', '物质抛射'],
  resources: ['r过程重元素(超新星时)', '大质量恒星核合成产物', '氧/硅/铁'],
  specialFeatures: ['CNO循环主导', '超新星II型前身', '沃尔夫-拉叶星演化', 'r过程(快中子俘获)', '宇宙重元素主要来源']
};

const BrownDwarfMaterials: CosmicEnvironment = {
  name: 'BrownDwarf', nameCn: '褐矮星', type: '亚恒星(失败恒星)',
  materials: [
    { name: '氢', formula: 'H₂', percentage: 74, category: '整体', notes: '未点燃核聚变', state: '气态', importance: '关键' },
    { name: '氦', formula: 'He', percentage: 24, category: '整体', notes: '原始氦', state: '气态', importance: '关键' },
    { name: '水蒸气', formula: 'H₂O', percentage: 0.3, category: '大气(L/T型)', notes: '大气分子特征', state: '气态', importance: '重要' },
    { name: '甲烷', formula: 'CH₄', percentage: 0.2, category: '大气(T型)', notes: 'T型褐矮星标志', state: '气态', importance: '关键' },
    { name: '一氧化碳', formula: 'CO', percentage: 0.1, category: '大气(L型)', notes: 'L型标志', state: '气态', importance: '重要' },
    { name: '氨', formula: 'NH₃', percentage: 0.05, category: '大气(T/Y型)', notes: 'Y型特征', state: '气态', importance: '重要' },
    { name: '硫化氢', formula: 'H₂S', percentage: 0.01, category: '大气', notes: '含硫分子', state: '气态', importance: '次要' },
    { name: '碱金属', formula: 'Na/K', percentage: 0.01, category: '大气', notes: '钠/钾吸收线', state: '气态', importance: '重要' },
    { name: '氯化钾', formula: 'KCl', percentage: 0.001, category: '大气(T型)', notes: '盐云', state: '固态', importance: '次要' },
    { name: '铁云', formula: 'Fe', percentage: 0.1, category: '大气(L型深部)', notes: '铁雨!', state: '液态', importance: '关键' },
    { name: '硅酸盐云', formula: 'MgSiO₃', percentage: 0.05, category: '大气', notes: '沙尘暴', state: '固态', importance: '重要' },
    { name: '磷化氢', formula: 'PH₃', percentage: 0.001, category: '大气', notes: '含磷分子', state: '气态', importance: '次要' },
    { name: '氰化氢', formula: 'HCN', percentage: 0.0005, category: '大气', notes: '含氮有机', state: '气态', importance: '次要' },
    { name: '乙炔', formula: 'C₂H₂', percentage: 0.0003, category: '大气', notes: '碳链分子', state: '气态', importance: '次要' },
    { name: '氧化钛', formula: 'TiO', percentage: 0.005, category: '大气(L型)', notes: 'L型光谱', state: '气态', importance: '重要' },
    { name: '氧化钒', formula: 'VO', percentage: 0.002, category: '大气(L型)', notes: 'L型光谱', state: '气态', importance: '次要' },
    { name: '氟化氢', formula: 'HF', percentage: 0.0001, category: '大气', notes: '含氟分子', state: '气态', importance: '次要' },
    { name: '氯化钠', formula: 'NaCl', percentage: 0.0003, category: '大气', notes: '盐云', state: '固态', importance: '次要' },
    { name: '氢化铁', formula: 'FeH', percentage: 0.003, category: '大气', notes: 'Wing-Ford带', state: '气态', importance: '重要' },
    { name: '铬化氢', formula: 'CrH', percentage: 0.001, category: '大气', notes: 'L型特征', state: '气态', importance: '次要' },
  ],
  environment: { temp: '250-2500K', pressure: '10-1000bar(大气)', radiation: '弱(红外)', gravity: '100-2000 m/s²', magneticField: '弱' },
  hazards: ['铁雨(腐蚀)', '强对流风暴', '硅酸盐粉尘', '低温'],
  resources: ['甲烷', '水蒸气', '碱金属', '氘(聚变潜力)', '铁'],
  specialFeatures: ['L/T/Y光谱型', '铁雨/沙尘暴', '氘聚变(部分)', '行星-恒星过渡体', 'Y型最冷(<450K)']
};

const YellowDwarfMaterials: CosmicEnvironment = {
  name: 'YellowDwarf', nameCn: '黄矮星', type: '恒星(G型主序)',
  materials: [
    { name: '氢', formula: 'H', percentage: 73.46, category: '整体', notes: 'pp链燃料(太阳型)', state: '等离子态', importance: '关键' },
    { name: '氦', formula: 'He', percentage: 24.85, category: '整体', notes: 'pp链产物', state: '等离子态', importance: '关键' },
    { name: '氧', formula: 'O', percentage: 0.77, category: '金属层', notes: '最丰富金属', state: '等离子态', importance: '重要' },
    { name: '碳', formula: 'C', percentage: 0.29, category: '金属层', notes: '3α过程/生命基础', state: '等离子态', importance: '重要' },
    { name: '铁', formula: 'Fe', percentage: 0.16, category: '金属层', notes: '核合成终点', state: '等离子态', importance: '重要' },
    { name: '氖', formula: 'Ne', percentage: 0.12, category: '金属层', notes: '惰性气体', state: '等离子态', importance: '次要' },
    { name: '氮', formula: 'N', percentage: 0.09, category: 'CNO循环', notes: 'CNO循环中间', state: '等离子态', importance: '重要' },
    { name: '硅', formula: 'Si', percentage: 0.07, category: '金属层', notes: '岩石行星基础', state: '等离子态', importance: '重要' },
    { name: '镁', formula: 'Mg', percentage: 0.06, category: '金属层', notes: '岩石行星', state: '等离子态', importance: '重要' },
    { name: '硫', formula: 'S', percentage: 0.04, category: '金属层', notes: '生命必需', state: '等离子态', importance: '次要' },
    { name: '钙', formula: 'Ca', percentage: 0.006, category: '金属层', notes: 'Ca II H&K线', state: '等离子态', importance: '重要' },
    { name: '铝', formula: 'Al', percentage: 0.005, category: '金属层', notes: '地壳丰富', state: '等离子态', importance: '次要' },
    { name: '钠', formula: 'Na', percentage: 0.003, category: '金属层', notes: 'Na D线', state: '等离子态', importance: '次要' },
    { name: '镍', formula: 'Ni', percentage: 0.008, category: '铁族', notes: '铁峰元素', state: '等离子态', importance: '次要' },
    { name: '铬', formula: 'Cr', percentage: 0.001, category: '铁族', notes: '过渡金属', state: '等离子态', importance: '次要' },
    { name: '磷', formula: 'P', percentage: 0.0008, category: '金属层', notes: 'DNA/ATP', state: '等离子态', importance: '重要' },
    { name: '锰', formula: 'Mn', percentage: 0.001, category: '铁族', notes: '生物必需', state: '等离子态', importance: '次要' },
    { name: '钛', formula: 'Ti', percentage: 0.0009, category: '金属层', notes: '工业金属', state: '等离子态', importance: '次要' },
    { name: '锂', formula: 'Li', percentage: 0.0000001, category: '表面', notes: '锂耗尽(年龄指示)', state: '等离子态', importance: '重要' },
    { name: '铍', formula: 'Be', percentage: 0.00000001, category: '表面', notes: '宇宙线散裂产物', state: '等离子态', importance: '次要' },
    { name: '硼', formula: 'B', percentage: 0.0000001, category: '表面', notes: '宇宙线散裂', state: '等离子态', importance: '次要' },
    { name: '钴', formula: 'Co', percentage: 0.0003, category: '铁族', notes: '⁵⁶Co中间', state: '等离子态', importance: '次要' },
    { name: '铜', formula: 'Cu', percentage: 0.000006, category: 's过程', notes: 's/r过程', state: '等离子态', importance: '次要' },
    { name: '锌', formula: 'Zn', percentage: 0.00001, category: 's过程', notes: '生物必需', state: '等离子态', importance: '次要' },
  ],
  environment: { temp: '5700-6000K(表面)/1500万K(核心)', pressure: '2500亿atm(核心)', radiation: '中等(黄光)', gravity: '274 m/s²(太阳)', magneticField: '1-2高斯(表面)/1000G(黑子)' },
  hazards: ['太阳耀斑', '日冕物质抛射', '紫外辐射', '太阳风', '黑子周期'],
  resources: ['氢(聚变燃料)', '氦(聚变产物)', '金属(行星原料)', '太阳风(氦-3)', '光子(能源)'],
  specialFeatures: ['pp链(质子-质子链)', '11年太阳周期', '日震学', '太阳中微子问题(已解决)', '日冕加热问题']
};

const WolfRayetMaterials: CosmicEnvironment = {
  name: 'WolfRayet', nameCn: '沃尔夫-拉叶星', type: '恒星(极端质量损失)',
  materials: [
    { name: '氦', formula: 'He', percentage: 55, category: '外层', notes: 'WN型:氦+氮为主', state: '等离子态', importance: '关键' },
    { name: '氮', formula: 'N', percentage: 10, category: 'WN型星风', notes: 'CNO循环产物富集', state: '等离子态', importance: '关键' },
    { name: '碳', formula: 'C', percentage: 40, category: 'WC型星风', notes: 'WC型:碳为主', state: '等离子态', importance: '关键' },
    { name: '氧', formula: 'O', percentage: 15, category: 'WO型星风', notes: 'WO型:氧为主(极稀有)', state: '等离子态', importance: '关键' },
    { name: '氢(残余)', formula: 'H', percentage: 5, category: '最外层(早期)', notes: '晚期W型氢已耗尽', state: '等离子态', importance: '次要' },
    { name: '铁', formula: 'Fe', percentage: 0.5, category: '核心', notes: '接近核合成终点', state: '等离子态', importance: '重要' },
    { name: '尘埃', formula: '碳尘/氧化物', percentage: 1, category: '星风凝聚', notes: 'WC型形成尘埃', state: '固态', importance: '重要' },
    { name: '碳尘', formula: 'C(团簇)', percentage: 0.5, category: 'WC型', notes: '风成尘(碰撞星风双星)', state: '固态', importance: '重要' },
    { name: '旋转', formula: 'v~1000km/s', percentage: 0, category: '星风', notes: '高速星风(>1000km/s)', state: '等离子态', importance: '关键' },
  ],
  environment: { temp: '30000-200000K(表面)', pressure: '极低(质量损失)', radiation: '极强(EUV/X)', gravity: '低表面重力', magneticField: '可能' },
  hazards: ['极端质量损失(10⁻⁵M☉/yr)', '超高速星风', '超新星即将发生', '尘埃碰撞'],
  resources: ['富氦/碳/氧物质', '碳尘', 'r过程前身(可能)'],
  specialFeatures: ['WN/WC/WO分类', '极速星风(3000km/s)', '碰撞星风双星(羊角星)', '超新星IIb/Ib/Ic前身', '长伽马射线暴前身']
};

// ================================================================
// 第二部分：星际介质与星云
// ================================================================

const MolecularCloudMaterials: CosmicEnvironment = {
  name: 'MolecularCloud', nameCn: '分子云', type: '星际介质(冷)',
  materials: [
    { name: '分子氢', formula: 'H₂', percentage: 90, category: '整体', notes: '恒星形成原料', state: '气态', importance: '关键' },
    { name: '氦', formula: 'He', percentage: 9, category: '整体', notes: '原始氦', state: '气态', importance: '重要' },
    { name: '一氧化碳', formula: 'CO', percentage: 0.1, category: '示踪分子', notes: 'H₂最佳示踪剂', state: '气态', importance: '关键' },
    { name: '水', formula: 'H₂O', percentage: 0.01, category: '冰幔', notes: '尘埃冰幔主体', state: '固态', importance: '关键' },
    { name: '氨', formula: 'NH₃', percentage: 0.005, category: '冰幔', notes: '含氮冰', state: '固态', importance: '重要' },
    { name: '甲醇', formula: 'CH₃OH', percentage: 0.002, category: '冰幔/气相', notes: '复杂有机分子前体', state: '固态', importance: '重要' },
    { name: '二氧化碳', formula: 'CO₂', percentage: 0.003, category: '冰幔', notes: '碳冰', state: '固态', importance: '重要' },
    { name: '甲醛', formula: 'H₂CO', percentage: 0.0005, category: '气相', notes: '有机分子', state: '气态', importance: '重要' },
    { name: '氰化氢', formula: 'HCN', percentage: 0.0001, category: '气相', notes: '生命前体分子', state: '气态', importance: '关键' },
    { name: '甲酸', formula: 'HCOOH', percentage: 0.00005, category: '气相', notes: '最简单酸', state: '气态', importance: '重要' },
    { name: '乙醇', formula: 'C₂H₅OH', percentage: 0.00001, category: '气相', notes: '太空酒精(人马座B2)', state: '气态', importance: '重要', discoveryYear: '1975' },
    { name: '二甲醚', formula: 'CH₃OCH₃', percentage: 0.000005, category: '气相', notes: '复杂有机分子', state: '气态', importance: '重要' },
    { name: '甲酸甲酯', formula: 'CH₃OCHO', percentage: 0.000003, category: '气相', notes: '星际酯', state: '气态', importance: '重要' },
    { name: '乙腈', formula: 'CH₃CN', percentage: 0.000002, category: '气相', notes: '含氮有机物', state: '气态', importance: '重要' },
    { name: '丙炔腈', formula: 'HC₃N', percentage: 0.000001, category: '气相', notes: '氰基多炔链', state: '气态', importance: '重要' },
    { name: '氰基辛四炔', formula: 'HC₉N', percentage: 0.0000001, category: '气相', notes: '最长链星际分子之一', state: '气态', importance: '重要' },
    { name: '氰基癸五炔', formula: 'HC₁₁N', percentage: 0.00000001, category: '气相', notes: '极长链分子', state: '气态', importance: '痕量' },
    { name: '苯', formula: 'C₆H₆', percentage: 0.000001, category: '气相', notes: '芳香族', state: '气态', importance: '重要', discoveryYear: '2001' },
    { name: '多环芳烃(PAH)', formula: 'C₁₈H₁₂等', percentage: 0.001, category: '尘埃', notes: '宇宙碳循环关键载体', state: '固态', importance: '关键' },
    { name: '硅酸盐尘', formula: 'MgSiO₃/FeSiO₃', percentage: 1, category: '尘埃', notes: '星际尘埃主体', state: '固态', importance: '关键' },
    { name: '石墨尘', formula: 'C', percentage: 0.3, category: '尘埃', notes: '碳质尘', state: '固态', importance: '重要' },
    { name: '甘氨酸', formula: 'NH₂CH₂COOH', percentage: 0.00000001, category: '气相/冰', notes: '最简氨基酸(生命基石!)', state: '固态', importance: '关键', discoveryYear: '2003' },
    { name: '丝氨酸', formula: 'HOCH₂CH(NH₂)COOH', percentage: 0, category: '理论预测', notes: '陨石中发现', state: '固态', importance: '理论预测' },
    { name: '甲酰胺', formula: 'NH₂CHO', percentage: 0.000001, category: '气相', notes: '肽键前体', state: '气态', importance: '重要' },
    { name: '乙酸', formula: 'CH₃COOH', percentage: 0.0000005, category: '气相', notes: '星际醋', state: '气态', importance: '重要' },
    { name: '乙醛', formula: 'CH₃CHO', percentage: 0.0000003, category: '气相', notes: '星际醛', state: '气态', importance: '重要' },
    { name: '丙烯腈', formula: 'CH₂CHCN', percentage: 0.0000001, category: '气相', notes: '含氮链分子', state: '气态', importance: '次要' },
    { name: '氰化乙炔', formula: 'HC₃N', percentage: 0.0000005, category: '气相', notes: 'TMC-1标志', state: '气态', importance: '重要' },
    { name: '乙二醇', formula: '(CH₂OH)₂', percentage: 0.0000001, category: '气相', notes: '最简糖醇(防冻剂!)', state: '气态', importance: '重要', discoveryYear: '2002' },
    { name: '环氧丙烷', formula: 'CH₃CHCH₂O', percentage: 0.00000001, category: '气相', notes: '手性分子!', state: '气态', importance: '关键', discoveryYear: '2016' },
    { name: '磷化氢', formula: 'PH₃', percentage: 0.00000001, category: '气相', notes: '含磷分子(稀有)', state: '气态', importance: '重要' },
    { name: '丙炔', formula: 'CH₃C₂H', percentage: 0.0000002, category: '气相', notes: '碳链分子', state: '气态', importance: '次要' },
    { name: '二乙醚', formula: 'CH₃OC₂H₅', percentage: 0.0000001, category: '气相', notes: '较大醚', state: '气态', importance: '次要' },
    { name: '硫化碳', formula: 'CS', percentage: 0.000001, category: '气相', notes: '含硫分子', state: '气态', importance: '次要' },
    { name: '一硫化硅', formula: 'SiS', percentage: 0.0000001, category: '气相', notes: '含硅分子', state: '气态', importance: '次要' },
    { name: '甲胺', formula: 'CH₃NH₂', percentage: 0.0000005, category: '气相', notes: '最简胺', state: '气态', importance: '重要' },
    { name: '乙胺', formula: 'C₂H₅NH₂', percentage: 0.00000005, category: '气相', notes: '较大胺', state: '气态', importance: '次要' },
    { name: '丙胺腈', formula: 'NH₂CH₂CN', percentage: 0.00000001, category: '气相', notes: '氨基酸前体', state: '气态', importance: '重要' },
    { name: '羟基乙醛', formula: 'HOCH₂CHO', percentage: 0.00000001, category: '气相', notes: '最简醛糖', state: '气态', importance: '重要', discoveryYear: '2000' },
    { name: '甘油醛', formula: 'HOCH₂CH(OH)CHO', percentage: 0, category: '气相', notes: '最简糖!', state: '气态', importance: '关键', discoveryYear: '2019' },
  ],
  environment: { temp: '10-50K', pressure: '10⁴-10⁶/cm³(数密度)', radiation: '屏蔽(高消光)', gravity: '自引力', magneticField: '几μG(支撑)' },
  hazards: ['极低温', '辐射屏蔽(难探测)', '磁场塌缩', '恒星形成区高能事件'],
  resources: ['分子氢(恒星燃料)', '水冰', '有机分子(生命前体)', '氘', '星际尘埃(行星原料)'],
  specialFeatures: ['恒星摇篮', '200+种星际分子', 'PAH(宇宙碳循环)', '冰幔化学', 'HH天体/原恒星']
};

const EmissionNebulaMaterials: CosmicEnvironment = {
  name: 'EmissionNebula', nameCn: '发射星云', type: '星际介质(电离)',
  materials: [
    { name: '电离氢', formula: 'HII', percentage: 90, category: '整体', notes: 'HII区/Hα发射', state: '等离子态', importance: '关键' },
    { name: '电离氦', formula: 'HeII/HeIII', percentage: 9, category: '整体', notes: '高电离态', state: '等离子态', importance: '重要' },
    { name: '电离氧', formula: '[OIII]', percentage: 0.01, category: '发射线', notes: '4959/5007Å禁线(绿色)', state: '离子态', importance: '关键' },
    { name: '电离氮', formula: '[NII]', percentage: 0.005, category: '发射线', notes: '6548/6583Å(红色)', state: '离子态', importance: '重要' },
    { name: '电离硫', formula: '[SII]', percentage: 0.003, category: '发射线', notes: '6717/6731Å', state: '离子态', importance: '重要' },
    { name: '氢α', formula: 'Hα(6563Å)', percentage: 0.1, category: '发射线', notes: '红色星云主色', state: '等离子态', importance: '关键' },
    { name: '氢β', formula: 'Hβ(4861Å)', notes: '蓝绿色', percentage: 0.02, category: '发射线', state: '等离子态', importance: '重要' },
    { name: '尘埃', formula: '硅酸盐/碳', percentage: 1, category: '尘埃', notes: '反射/消光', state: '固态', importance: '重要' },
    { name: '电离氩', formula: '[ArIII]/[ArIV]', percentage: 0.0001, category: '发射线', notes: '高电离态诊断', state: '离子态', importance: '重要' },
    { name: '电离氖', formula: '[NeIII]', percentage: 0.0005, category: '发射线', notes: '15.5μm红外线', state: '离子态', importance: '重要' },
    { name: '电离铁', formula: '[FeIII]/[FeII]', percentage: 0.0001, category: '发射线', notes: '铁禁线', state: '离子态', importance: '次要' },
    { name: '电离氯', formula: '[ClIII]', percentage: 0.00001, category: '发射线', notes: '卤素线', state: '离子态', importance: '次要' },
  ],
  environment: { temp: '8000-20000K', pressure: '10²-10⁴/cm³', radiation: '极强(紫外电离)', gravity: '微弱', magneticField: '几μG' },
  hazards: ['强紫外辐射', '高温等离子体', 'O/B型星风', 'X射线'],
  resources: ['电离氢(星系示踪)', '重元素丰度(金属度)', '恒星形成率指标'],
  specialFeatures: ['HII区', '禁线发射([OIII]/[NII]/[SII])', 'BPT诊断图', '猎户座星云原型', '星际介质金属度测量']
};

const SupernovaRemnantMaterials: CosmicEnvironment = {
  name: 'SupernovaRemnant', nameCn: '超新星遗迹', type: '恒星遗迹(膨胀)',
  materials: [
    { name: '铁族元素', formula: 'Fe/Ni/Co', percentage: 20, category: '内层抛射', notes: '铁峰元素(⁵⁶Ni→⁵⁶Co→⁵⁶Fe)', state: '等离子态', importance: '关键' },
    { name: '硅', formula: 'Si', percentage: 15, category: '中间层', notes: '不完全燃烧产物', state: '等离子态', importance: '重要' },
    { name: '硫', formula: 'S', percentage: 10, category: '中间层', notes: '氧燃烧产物', state: '等离子态', importance: '重要' },
    { name: '氧', formula: 'O', percentage: 25, category: '外层', notes: '碳燃烧/氦燃烧产物', state: '等离子态', importance: '关键' },
    { name: '镁', formula: 'Mg', percentage: 5, category: '中间层', notes: '碳燃烧产物', state: '等离子态', importance: '重要' },
    { name: '钙', formula: 'Ca', percentage: 2, category: '中间层', notes: '氧燃烧产物', state: '等离子态', importance: '重要' },
    { name: '钛', formula: 'Ti', percentage: 0.5, category: '内层', notes: '⁴⁴Ti(放射性,半衰期60年)', state: '等离子态', importance: '重要', discoveryYear: '2012' },
    { name: '铝-26', formula: '²⁶Al', percentage: 0.001, category: '外层', notes: '放射性(半衰期72万年,1.8MeV γ线)', state: '等离子态', importance: '关键' },
    { name: 'r过程元素', formula: 'Au/Pt/U/Th', percentage: 0.0001, category: '中子流区', notes: '快中子俘获(金/铂/铀来源!)', state: '等离子态', importance: '关键' },
    { name: '钴-56', formula: '⁵⁶Co', percentage: 5, category: '内层', notes: '放射性(半衰期77天,光变曲线能源)', state: '等离子态', importance: '关键' },
    { name: '镍-56', formula: '⁵⁶Ni', percentage: 10, category: '最内层', notes: 'Ia超新星主要产物', state: '等离子态', importance: '关键' },
    { name: '宇宙射线', formula: 'p/α/重离子', percentage: 1, category: '加速粒子', notes: '激波加速(费米加速)', state: '等离子态', importance: '重要' },
    { name: '氩', formula: 'Ar', percentage: 0.3, category: '中间层', notes: '氧燃烧产物', state: '等离子态', importance: '次要' },
    { name: '锰', formula: 'Mn', percentage: 0.1, category: '内层', notes: '⁵⁵Mn(稳定)', state: '等离子态', importance: '次要' },
    { name: '铬', formula: 'Cr', percentage: 0.3, category: '内层', notes: '不完全硅燃烧', state: '等离子态', importance: '次要' },
    { name: '钪', formula: 'Sc', percentage: 0.01, category: '内层', notes: '痕量', state: '等离子态', importance: '次要' },
    { name: '磷', formula: 'P', percentage: 0.05, category: '中间层', notes: '生命必需', state: '等离子态', importance: '重要' },
    { name: '氯', formula: 'Cl', percentage: 0.02, category: '中间层', notes: '氧燃烧', state: '等离子态', importance: '次要' },
    { name: '钾', formula: 'K', percentage: 0.03, category: '中间层', notes: '氧燃烧', state: '等离子态', importance: '次要' },
    { name: '钠', formula: 'Na', percentage: 0.05, category: '外层', notes: '碳燃烧', state: '等离子态', importance: '次要' },
    { name: '钒', formula: 'V', percentage: 0.01, category: '内层', notes: '⁴⁹V/⁵¹V', state: '等离子态', importance: '次要' },
    { name: '铜', formula: 'Cu', percentage: 0.005, category: '内层', notes: 's/r过程', state: '等离子态', importance: '次要' },
    { name: '锌', formula: 'Zn', percentage: 0.01, category: '内层', notes: 's/r过程', state: '等离子态', importance: '次要' },
    { name: '钇', formula: 'Y', percentage: 0.0001, category: 'r过程', notes: '第一r过程峰', state: '等离子态', importance: '重要' },
    { name: '钡', formula: 'Ba', percentage: 0.00005, category: 'r过程', notes: '第二r过程峰', state: '等离子态', importance: '重要' },
    { name: '钕', formula: 'Nd', percentage: 0.00003, category: 'r过程', notes: '稀土', state: '等离子态', importance: '次要' },
    { name: '铕', formula: 'Eu', percentage: 0.00001, category: 'r过程', notes: 'r过程标志元素', state: '等离子态', importance: '关键' },
    { name: '锇', formula: 'Os', percentage: 0.000005, category: 'r过程', notes: '第三r过程峰', state: '等离子态', importance: '重要' },
    { name: '铱', formula: 'Ir', percentage: 0.000003, category: 'r过程', notes: 'K-T界线', state: '等离子态', importance: '重要' },
    { name: '金', formula: 'Au', percentage: 0.000001, category: 'r过程', notes: '贵金属(中子星合并更高效)', state: '等离子态', importance: '关键' },
    { name: '铂', formula: 'Pt', percentage: 0.000002, category: 'r过程', notes: '贵金属', state: '等离子态', importance: '重要' },
    { name: '铀', formula: 'U', percentage: 0.0000005, category: 'r过程', notes: '最重天然元素', state: '等离子态', importance: '关键' },
  ],
  environment: { temp: '10⁶-10⁸K(初期)/10⁴K(后期)', pressure: '膨胀降压', radiation: '极强(全谱段)', gravity: '微弱(膨胀)', magneticField: '增强(压缩)' },
  hazards: ['极端辐射', '激波(1000+km/s)', '高能宇宙射线', 'X/γ射线', '重元素毒性'],
  resources: ['金/铂/铀(r过程)', '铁/硅/氧(行星原料)', '放射性同位素(能源)', '宇宙射线'],
  specialFeatures: ['r过程(黄金/铂金来源)', '⁵⁶Ni→⁵⁶Co→⁵⁶Fe(Ia光变)', '激波加速(宇宙射线)', '44Ti(Cas A)', '26Al(银河1.8MeV)', '重元素工厂']
};

const PlanetaryNebulaMaterials: CosmicEnvironment = {
  name: 'PlanetaryNebula', nameCn: '行星状星云', type: '恒星遗迹(AGB抛射)',
  materials: [
    { name: '氢', formula: 'H', percentage: 70, category: '包膜', notes: '残余氢', state: '气态', importance: '关键' },
    { name: '氦', formula: 'He', percentage: 28, category: '包膜', notes: '3α过程产物', state: '气态', importance: '关键' },
    { name: '碳', formula: 'C', percentage: 0.5, category: '富碳抛射', notes: 'AGB第三次疏浚', state: '气态', importance: '重要' },
    { name: '氮', formula: 'N', percentage: 0.2, category: 'CNO产物', notes: '热疏浚', state: '气态', importance: '重要' },
    { name: '氧', formula: 'O', percentage: 0.1, category: '抛射物', notes: '重元素', state: '气态', importance: '重要' },
    { name: 's过程元素', formula: 'Zr/Ba/La', percentage: 0.001, category: '第三次疏浚', notes: '慢中子俘获产物', state: '气态', importance: '重要' },
    { name: '电离氧[OIII]', formula: '[OIII]', percentage: 0.05, category: '发射区', notes: '5007Å(翡翠绿!)', state: '离子态', importance: '关键' },
    { name: '尘埃(PAH)', formula: 'C-H化合物', percentage: 1, category: '尘埃', notes: '碳尘', state: '固态', importance: '重要' },
    { name: '氖', formula: 'Ne', percentage: 0.02, category: '抛射物', notes: '重元素', state: '气态', importance: '次要' },
    { name: '硫', formula: 'S', percentage: 0.01, category: '抛射物', notes: '中等质量', state: '气态', importance: '次要' },
    { name: '氩', formula: 'Ar', percentage: 0.005, category: '抛射物', notes: '惰性气体', state: '气态', importance: '次要' },
    { name: '氯', formula: 'Cl', percentage: 0.001, category: '抛射物', notes: '卤素', state: '气态', importance: '次要' },
  ],
  environment: { temp: '10000-30000K(气体)/100000K(中心星)', pressure: '低密度', radiation: '强(中心星紫外)', gravity: '微弱(膨胀)', magneticField: '弱' },
  hazards: ['中心星强紫外', '膨胀激波', 'X射线'],
  resources: ['碳/氮/氧(enrichment)', 's过程元素', 'PAH(碳循环)', '尘埃(行星原料)'],
  specialFeatures: ['[OIII]翡翠绿', '第三次疏浚(碳增丰)', 'AGB→PN→WD演化', '环状星云/猫眼星云', '银河化学增丰']
};

// ================================================================
// 第三部分：系外行星类型
// ================================================================

const HotJupiterMaterials: CosmicEnvironment = {
  name: 'HotJupiter', nameCn: '热木星', type: '系外行星(气态巨行星)',
  materials: [
    { name: '氢', formula: 'H₂', percentage: 82, category: '大气/整体', notes: '主成分', state: '气态', importance: '关键' },
    { name: '氦', formula: 'He', percentage: 16, category: '大气/整体', notes: '次成分', state: '气态', importance: '关键' },
    { name: '水蒸气', formula: 'H₂O', percentage: 0.5, category: '大气', notes: '透射光谱检测', state: '气态', importance: '关键', discoveryYear: '2013' },
    { name: '一氧化碳', formula: 'CO', percentage: 0.3, category: '大气', notes: '热化学平衡', state: '气态', importance: '重要' },
    { name: '二氧化碳', formula: 'CO₂', percentage: 0.1, category: '大气', notes: '光化产物', state: '气态', importance: '重要' },
    { name: '甲烷', formula: 'CH₄', percentage: 0.01, category: '大气(冷面)', notes: '热化学不平衡(疾病)', state: '气态', importance: '重要' },
    { name: '氧化钛', formula: 'TiO', percentage: 0.001, category: '大气(热层)', notes: '高温反转层(平流层)', state: '气态', importance: '关键' },
    { name: '氧化钒', formula: 'VO', percentage: 0.0005, category: '大气(热层)', notes: '高温反转层', state: '气态', importance: '重要' },
    { name: '钠', formula: 'Na', percentage: 0.01, category: '大气', notes: '透射光谱首发检测', state: '气态', importance: '关键', discoveryYear: '2001' },
    { name: '钾', formula: 'K', percentage: 0.005, category: '大气', notes: '碱金属线', state: '气态', importance: '重要' },
    { name: '硫化氢', formula: 'H₂S', percentage: 0.001, category: '大气', notes: '含硫成分', state: '气态', importance: '次要' },
    { name: '氢化铁', formula: 'FeH', percentage: 0.001, category: '深层大气', notes: '极热热木星', state: '气态', importance: '重要' },
    { name: '硅酸盐蒸气', formula: 'MgSiO₃(气)', percentage: 0.0001, category: '极热大气', notes: '超热木星(>2500K)', state: '气态', importance: '关键' },
    { name: '铁蒸气', formula: 'Fe(气)', percentage: 0.0001, category: '极热大气', notes: '铁雨循环!', state: '气态', importance: '关键', discoveryYear: '2020' },
    { name: '氨', formula: 'NH₃', percentage: 0.005, category: '深层大气', notes: '冷面可能', state: '气态', importance: '次要' },
    { name: '氰化氢', formula: 'HCN', percentage: 0.001, category: '大气', notes: '光化产物', state: '气态', importance: '重要' },
    { name: '乙炔', formula: 'C₂H₂', percentage: 0.0005, category: '大气', notes: '碳链', state: '气态', importance: '次要' },
    { name: '氢化镁', formula: 'MgH', percentage: 0.0001, category: '大气', notes: '热大气金属氢化物', state: '气态', importance: '次要' },
    { name: '氢化铬', formula: 'CrH', percentage: 0.00005, category: '大气', notes: '金属氢化物', state: '气态', importance: '次要' },
  ],
  environment: { temp: '1000-4000K', pressure: '0.1-1000bar', radiation: '极强(主星照射)', gravity: '10-50 m/s²', magneticField: '可能' },
  hazards: ['极端高温', '主星潮汐力', '大气逃逸', '铁雨/硅酸盐雨', '强XUV辐射'],
  resources: ['氢/氦', '水蒸气', '碱金属', '铁(极热型)', '钛/钒'],
  specialFeatures: ['大气逃逸(蒸发)', '热反转层(TiO/VO)', '铁雨/硅酸盐雨', '潮汐锁定', '3/1半径膨胀(HD209458b)']
};

const LavaPlanetMaterials: CosmicEnvironment = {
  name: 'LavaPlanet', nameCn: '熔岩行星', type: '系外行星(极热岩石)',
  materials: [
    { name: '硅酸盐熔岩', formula: 'MgSiO₃(液)', percentage: 50, category: '表面', notes: '全球熔岩海', state: '液态', importance: '关键' },
    { name: '铁', formula: 'Fe', percentage: 30, category: '核心', notes: '铁核', state: '液态', importance: '关键' },
    { name: '氧化铝', formula: 'Al₂O₃', percentage: 5, category: '表面', notes: '高熔点残留', state: '液态', importance: '重要' },
    { name: '氧化钙', formula: 'CaO', percentage: 3, category: '表面', notes: '熔岩成分', state: '液态', importance: '重要' },
    { name: '氧化铁', formula: 'FeO', percentage: 5, category: '表面/地幔', notes: '铁氧化物', state: '液态', importance: '重要' },
    { name: '钠蒸气', formula: 'Na', percentage: 0.01, category: '大气', notes: '岩石蒸气大气', state: '气态', importance: '关键' },
    { name: '钾蒸气', formula: 'K', percentage: 0.005, category: '大气', notes: '岩石蒸气大气', state: '气态', importance: '重要' },
    { name: '硅氧化合物', formula: 'SiO', percentage: 0.1, category: '大气', notes: '硅氧蒸气', state: '气态', importance: '重要' },
    { name: '氧化硅蒸气', formula: 'SiO₂(气)', percentage: 0.05, category: '大气', notes: '蒸发产物', state: '气态', importance: '重要' },
    { name: '氧气', formula: 'O₂', percentage: 0.01, category: '大气', notes: '岩石光解产物', state: '气态', importance: '重要' },
    { name: '氧化镁', formula: 'MgO', percentage: 3, category: '表面', notes: '高熔点', state: '液态', importance: '重要' },
    { name: '氧化钛', formula: 'TiO₂', percentage: 0.5, category: '表面', notes: '难熔氧化物', state: '液态', importance: '次要' },
    { name: '氧化铬', formula: 'Cr₂O₃', percentage: 0.1, category: '表面', notes: '微量氧化物', state: '液态', importance: '次要' },
    { name: '锰氧化物', formula: 'MnO', percentage: 0.1, category: '表面', notes: '微量', state: '液态', importance: '次要' },
  ],
  environment: { temp: '1500-3500K(表面)', pressure: '极薄(岩石蒸气)', radiation: '极强', gravity: '5-20 m/s²', magneticField: '弱' },
  hazards: ['全球熔岩海', '岩石蒸气雨', '极高温', '大气凝结/再蒸发循环', '潮汐加热'],
  resources: ['硅酸盐(建材)', '铁', '铝/钙', '碱金属', '稀土(可能)'],
  specialFeatures: ['全球熔岩海', '岩石蒸气大气', '凝结/蒸发日循环', '55 Cancri e原型', 'K2-141b(超循环)']
};

const CarbonPlanetMaterials: CosmicEnvironment = {
  name: 'CarbonPlanet', nameCn: '碳行星', type: '系外行星(理论)',
  materials: [
    { name: '金刚石(钻石)', formula: 'C(钻石)', percentage: 30, category: '地幔', notes: '高压碳相-钻石地幔!', state: '固态', importance: '关键' },
    { name: '石墨', formula: 'C(石墨)', percentage: 20, category: '地壳', notes: '碳壳层', state: '固态', importance: '关键' },
    { name: '碳化硅', formula: 'SiC', percentage: 15, category: '地壳/地幔', notes: '碳化物层', state: '固态', importance: '重要' },
    { name: '碳化钛', formula: 'TiC', percentage: 5, category: '地幔', notes: '难熔碳化物', state: '固态', importance: '重要' },
    { name: '铁', formula: 'Fe', percentage: 20, category: '核心', notes: '铁核(含碳)', state: '液态', importance: '关键' },
    { name: '一氧化碳', formula: 'CO', percentage: 0.1, category: '大气', notes: '碳基大气', state: '气态', importance: '重要' },
    { name: '甲烷', formula: 'CH₄', percentage: 0.05, category: '大气', notes: '碳氢大气', state: '气态', importance: '重要' },
    { name: '碳化铁', formula: 'Fe₃C(渗碳体)', percentage: 10, category: '核心', notes: '铁碳合金', state: '固态', importance: '重要' },
    { name: '碳化钨', formula: 'WC/W₂C', percentage: 0.5, category: '地幔深部', notes: '极硬碳化物', state: '固态', importance: '次要' },
    { name: '碳化钼', formula: 'MoC/Mo₂C', percentage: 0.2, category: '地幔深部', notes: '难熔碳化物', state: '固态', importance: '次要' },
    { name: '氰', formula: 'C₂N₂', percentage: 0.001, category: '大气', notes: '含碳氮大气', state: '气态', importance: '次要' },
    { name: '氰化氢', formula: 'HCN', percentage: 0.002, category: '大气', notes: '碳氮大气', state: '气态', importance: '重要' },
  ],
  environment: { temp: '1000-3000K(表面)', pressure: '高压(内部)', radiation: '取决于轨道', gravity: '10-20 m/s²', magneticField: '可能' },
  hazards: ['无水环境', '碳化物毒性', '极端压强', '高碳大气'],
  resources: ['钻石(巨量!)', '碳化硅(工业)', '石墨', '碳化钛', '铁碳合金'],
  specialFeatures: ['钻石地幔!', 'C/O>1(碳氧比>1)', '55 Cancri e候选', '无水世界', '碳化物地壳']
};

const WaterWorldMaterials: CosmicEnvironment = {
  name: 'WaterWorld', nameCn: '水世界', type: '系外行星(海洋)',
  materials: [
    { name: '水(液态)', formula: 'H₂O', percentage: 40, category: '海洋', notes: '全球深海(100+km)', state: '液态', importance: '关键' },
    { name: '水冰(VII)', formula: 'H₂O(冰VII)', percentage: 20, category: '高压冰层', notes: '高压冰相(>1GPa)', state: '固态', importance: '关键' },
    { name: '水冰(VI)', formula: 'H₂O(冰VI)', percentage: 10, category: '中压冰层', notes: '过渡冰相', state: '固态', importance: '重要' },
    { name: '硅酸盐', formula: 'SiO₂', percentage: 20, category: '岩石核心', notes: '岩石内核', state: '固态', importance: '重要' },
    { name: '铁', formula: 'Fe', percentage: 8, category: '核心', notes: '铁核', state: '固态', importance: '重要' },
    { name: '水蒸气', formula: 'H₂O(气)', percentage: 0.5, category: '大气', notes: '蒸汽大气', state: '气态', importance: '关键' },
    { name: '氢', formula: 'H₂', percentage: 1, category: '大气(顶层)', notes: '逃逸层', state: '气态', importance: '次要' },
    { name: '超离子水', formula: 'H₂O(超离子)', percentage: 0, category: '极深高压', notes: '超离子态水(离子导体)', state: '超离子态', importance: '理论预测' },
    { name: '水冰(X)', formula: 'H₂O(冰X)', percentage: 0, category: '极深高压', notes: '对称氢键冰(>70GPa)', state: '超固态', importance: '理论预测' },
    { name: '氯化钠', formula: 'NaCl', percentage: 0.5, category: '海洋', notes: '盐分(可能)', state: '溶解', importance: '次要' },
    { name: '二氧化碳', formula: 'CO₂', percentage: 0.2, category: '大气', notes: '温室气体', state: '气态', importance: '重要' },
    { name: '氨', formula: 'NH₃', percentage: 0.1, category: '海洋/大气', notes: '可能溶入海洋', state: '溶解', importance: '次要' },
  ],
  environment: { temp: '0-200°C(表面)/>1000K(深部)', pressure: '1-10⁴bar(深部)', radiation: '取决于轨道', gravity: '5-15 m/s²', magneticField: '可能(铁核)' },
  hazards: ['高压冰层(不可达内核)', '蒸汽大气(温室)', '深海(无陆)', '极端压力'],
  resources: ['水(巨量)', '高压冰', '氢(大气)', '矿物(深部)'],
  specialFeatures: ['全球深海', '高压冰层(冰VI/VII)', '超离子水(理论)', '无大陆', 'GJ 1214 b候选']
};

const SuperEarthMaterials: CosmicEnvironment = {
  name: 'SuperEarth', nameCn: '超级地球', type: '系外行星(岩石)',
  materials: [
    { name: '硅酸盐', formula: 'SiO₂', percentage: 35, category: '地幔', notes: '硅酸盐幔', state: '固态', importance: '关键' },
    { name: '铁', formula: 'Fe', percentage: 30, category: '核心', notes: '较大铁核', state: '固态', importance: '关键' },
    { name: '氧化镁', formula: 'MgO', percentage: 15, category: '地幔', notes: '幔层成分', state: '固态', importance: '重要' },
    { name: '氧化铝', formula: 'Al₂O₃', percentage: 5, category: '地壳', notes: '地壳', state: '固态', importance: '重要' },
    { name: '水冰', formula: 'H₂O', percentage: 5, category: '表面/地下', notes: '可能含水', state: '固态', importance: '重要' },
    { name: '氧化铁', formula: 'FeO', percentage: 5, category: '地幔', notes: '铁氧化态', state: '固态', importance: '重要' },
    { name: '二氧化碳', formula: 'CO₂', percentage: 2, category: '大气', notes: '厚CO₂大气(可能)', state: '气态', importance: '重要' },
    { name: '氮', formula: 'N₂', percentage: 1, category: '大气', notes: '可能含氮大气', state: '气态', importance: '次要' },
    { name: '水蒸气', formula: 'H₂O', percentage: 0.5, category: '大气', notes: '湿度可能高', state: '气态', importance: '重要' },
    { name: '氧化钙', formula: 'CaO', percentage: 2, category: '地壳', notes: '地壳成分', state: '固态', importance: '次要' },
    { name: '氧化钠', formula: 'Na₂O', percentage: 0.5, category: '地壳', notes: '碱性', state: '固态', importance: '次要' },
    { name: '氧化钾', formula: 'K₂O', percentage: 0.2, category: '地壳', notes: '碱性', state: '固态', importance: '次要' },
    { name: '氧化钛', formula: 'TiO₂', percentage: 0.3, category: '地壳', notes: '微量', state: '固态', importance: '次要' },
    { name: '甲烷', formula: 'CH₄', percentage: 0.01, category: '大气', notes: '还原大气(可能)', state: '气态', importance: '次要' },
  ],
  environment: { temp: '-50~400°C(取决于轨道)', pressure: '1-100atm(大气)', radiation: '取决于轨道', gravity: '10-30 m/s²', magneticField: '可能(铁核发电机)' },
  hazards: ['高重力', '火山活跃(内部热)', '大气压可能极高', '潮汐加热'],
  resources: ['铁(大量)', '硅酸盐', '水(可能)', 'CO₂(化工)', '矿物资源'],
  specialFeatures: ['增强板壳构造(可能)', '更强磁场(可能)', '大铁核比例', '宜居带候选', 'TOI-700 d原型']
};

const IceGiantMaterials: CosmicEnvironment = {
  name: 'IceGiant', nameCn: '冰巨行星', type: '系外行星(冰巨)',
  materials: [
    { name: '氢', formula: 'H₂', percentage: 25, category: '大气/外层', notes: '薄氢大气', state: '气态', importance: '关键' },
    { name: '氦', formula: 'He', percentage: 5, category: '大气/外层', notes: '次成分', state: '气态', importance: '重要' },
    { name: '水(超离子)', formula: 'H₂O(超离子)', percentage: 30, category: '冰幔', notes: '超离子水幔层!', state: '超离子态', importance: '关键' },
    { name: '甲烷', formula: 'CH₄', percentage: 10, category: '冰幔/大气', notes: '甲烷冰', state: '固态', importance: '关键' },
    { name: '氨', formula: 'NH₃', percentage: 5, category: '冰幔', notes: '氨冰', state: '固态', importance: '重要' },
    { name: '硫化氢', formula: 'H₂S', percentage: 1, category: '冰幔', notes: '含硫冰', state: '固态', importance: '次要' },
    { name: '铁/岩石核', formula: 'Fe/SiO₂', percentage: 20, category: '核心', notes: '岩石铁核', state: '固态', importance: '重要' },
    { name: '钻石雨', formula: 'C(高压)', percentage: 2, category: '深部', notes: '甲烷分解→钻石雨!', state: '固态', importance: '关键' },
    { name: '水冰(VII)', formula: 'H₂O(冰VII)', percentage: 5, category: '中深部', notes: '高压冰', state: '固态', importance: '重要' },
    { name: '氨水混合物', formula: 'NH₃·H₂O', percentage: 3, category: '冰幔', notes: '氨水', state: '液态', importance: '次要' },
    { name: '磷酸', formula: 'H₃PO₄', percentage: 0.1, category: '冰幔', notes: '含磷化合物', state: '液态', importance: '次要' },
  ],
  environment: { temp: '50-5000K(大气→核心)', pressure: '1bar-10Mbar', radiation: '弱(远轨道)', gravity: '8-15 m/s²', magneticField: '偏移(天王星)/强(海王星)' },
  hazards: ['超离子水(极端)', '钻石雨(深部)', '极端压力', '磁场偏移'],
  resources: ['甲烷', '水(超离子)', '钻石(深部)', '氨', '氢/氦'],
  specialFeatures: ['超离子水幔层', '钻石雨(甲烷→钻石)', '偏移磁场(天王星)', '大暗斑(海王星)', '极端风(2000km/h)']
};

// ================================================================
// 第四部分：黑洞与极端环境
// ================================================================

const BlackHoleMaterials: CosmicEnvironment = {
  name: 'BlackHole', nameCn: '黑洞', type: '时空奇点',
  materials: [
    { name: '奇点物质', formula: '?', percentage: 30, category: '奇点', notes: '广义相对论预测/量子引力未知', state: '未知', importance: '关键' },
    { name: '吸积盘氢', formula: 'H', percentage: 70, category: '吸积盘', notes: '落入气体主成分', state: '等离子态', importance: '关键' },
    { name: '吸积盘氦', formula: 'He', percentage: 28, category: '吸积盘', notes: '氦成分', state: '等离子态', importance: '重要' },
    { name: 'X射线等离子体', formula: 'Fe XXV/XXVI', percentage: 0.1, category: '吸积盘内区', notes: '铁Kα线(6.4-6.97keV)', state: '等离子态', importance: '关键' },
    { name: '相对论性喷流', formula: 'e⁻/p⁺/γ', percentage: 0.01, category: '喷流', notes: '0.99c速度', state: '等离子态', importance: '关键' },
    { name: '霍金辐射(理论)', formula: 'γ(热辐射)', percentage: 0, category: '事件视界', notes: '黑洞蒸发(极弱)', state: '未知', importance: '理论预测' },
    { name: '引力波', formula: 'h₊/h×(时空涟漪)', percentage: 0, category: '合并事件', notes: '2015首次探测', state: '未知', importance: '关键', discoveryYear: '2015' },
    { name: '光子球', formula: 'γ(环绕光子)', percentage: 0.001, category: '光子球', notes: '1.5Rs圆形轨道', state: '未知', importance: '重要' },
    { name: '彭罗斯过程提取能', formula: 'E(旋转能)', percentage: 0, category: '能层', notes: '克尔黑洞旋转能提取', state: '未知', importance: '理论预测' },
    { name: '吸积盘铁', formula: 'Fe', percentage: 0.5, category: '吸积盘中区', notes: '铁Kα反射', state: '等离子态', importance: '重要' },
    { name: '磁重联等离子体', formula: 'e⁻/p⁺', percentage: 0.01, category: '冕区', notes: '磁重联加热', state: '等离子态', importance: '重要' },
    { name: '同步辐射光子', formula: 'γ(同步)', percentage: 0.001, category: '喷流/冕区', notes: '相对论电子同步辐射', state: '未知', importance: '重要' },
    { name: '逆康普顿光子', formula: 'γ(逆康普顿)', percentage: 0.0001, category: '冕区', notes: '高能X/γ射线', state: '未知', importance: '重要' },
    { name: '西格玛-3量子修正(理论)', formula: 'Σ₃', percentage: 0, category: '事件视界附近', notes: '量子引力效应', state: '未知', importance: '理论预测' },
    { name: '火墙(理论)', formula: '量子纠缠', percentage: 0, category: '事件视界', notes: 'AM火墙假说', state: '未知', importance: '理论预测' },
    { name: '全息屏信息(理论)', formula: 'S=A/4lP²', notes: '全息原理', percentage: 0, category: '事件视界', state: '未知', importance: '理论预测' },
  ],
  environment: { temp: '>10⁹K(吸积盘内区)', pressure: '无限(奇点)', radiation: '极强(X/γ)', gravity: '无限(奇点)/强(视界)', magneticField: '10⁴-10⁸高斯(吸积盘)' },
  hazards: ['潮汐力(面条化)', '事件视界(不可逆)', 'X/γ射线暴', '相对论性喷流', '时间膨胀'],
  resources: ['旋转能(彭罗斯过程)', '引力波(信息)', '吸积盘能量(29%效率)', '霍金辐射(理论)'],
  specialFeatures: ['事件视界(无返回点)', '潮汐力撕裂', '铁Kα线(自旋测量)', '引力波(2015 LIGO)', 'M87*首张照片(2019)', '彭罗斯过程(能量提取)']
};

const AccretionDiskMaterials: CosmicEnvironment = {
  name: 'AccretionDisk', nameCn: '吸积盘', type: '高能天体物理环境',
  materials: [
    { name: '热等离子体', formula: 'H⁺/He²⁺', percentage: 95, category: '整体', notes: '完全电离', state: '等离子态', importance: '关键' },
    { name: '铁XXV', formula: 'Fe²⁵⁺', percentage: 0.05, category: '内区', notes: '6.7keV线', state: '等离子态', importance: '关键' },
    { name: '铁XXVI', formula: 'Fe²⁶⁺', percentage: 0.02, category: '最内区', notes: '6.97keV线(最接近黑洞)', state: '等离子态', importance: '关键' },
    { name: '湍流磁化等离子体', formula: 'MHD湍流', percentage: 100, category: '整体', notes: 'MRI不稳定性驱动粘滞', state: '等离子态', importance: '关键' },
    { name: '同步辐射电子', formula: 'e⁻(相对论)', percentage: 0.001, category: '冕区', notes: 'X射线源', state: '等离子态', importance: '重要' },
    { name: '逆康普顿散射光子', formula: 'γ/X', percentage: 0.001, category: '冕区', notes: '硬X射线', state: '未知', importance: '重要' },
    { name: '碳', formula: 'C', percentage: 0.01, category: '外区', notes: '金属丰度指示', state: '等离子态', importance: '次要' },
    { name: '氧', formula: 'O', percentage: 0.02, category: '外区', notes: '金属丰度', state: '等离子态', importance: '次要' },
    { name: '硅', formula: 'Si', percentage: 0.003, category: '外区', notes: '中等质量', state: '等离子态', importance: '次要' },
    { name: '硫', formula: 'S', percentage: 0.002, category: '外区', notes: '中等质量', state: '等离子态', importance: '次要' },
    { name: '镍', formula: 'Ni', percentage: 0.005, category: '内区', notes: '铁峰元素', state: '等离子态', importance: '次要' },
    { name: '中性铁', formula: 'Fe I', percentage: 0.001, category: '外区/反射', notes: '6.4keV荧光线', state: '离子态', importance: '重要' },
  ],
  environment: { temp: '10⁵-10⁹K(径向梯度)', pressure: '超高(内区)', radiation: '极强(紫外/X/γ)', gravity: '极强', magneticField: '10²-10⁸高斯' },
  hazards: ['极高温', '强辐射', '潮汐力', '相对论性粒子', 'MRI湍流'],
  resources: ['吸积能(6-42%效率)', '铁Kα线(诊断工具)', '同步辐射', '相对论性粒子'],
  specialFeatures: ['MRI不稳定性(角动量转移)', '铁Kα线(黑洞自旋)', '宽铁线(引力红移)', 'ISCO(最内稳定圆轨道)', '不同参考系效应']
};

// ================================================================
// 第五部分：暗物质与暗能量
// ================================================================

const DarkMatterMaterials: CosmicEnvironment = {
  name: 'DarkMatter', nameCn: '暗物质', type: '未知物质(27%宇宙)',
  materials: [
    { name: 'WIMPs(弱相互作用大质量粒子)', formula: 'χ̃(理论)', percentage: 0, category: '候选体', notes: '100GeV-10TeV(最流行候选)', state: '未知', importance: '理论预测' },
    { name: '轴子', formula: 'a(理论)', percentage: 0, category: '候选体', notes: 'μeV-meV(解决强CP问题)', state: '未知', importance: '理论预测' },
    { name: '惰性中微子', formula: 'νₛ(理论)', percentage: 0, category: '候选体', notes: 'keV质量(温暗物质)', state: '未知', importance: '理论预测' },
    { name: '原初黑洞', formula: 'PBH', percentage: 0, category: '候选体', notes: '10⁻¹⁶~10² M☉(LIGO范围)', state: '未知', importance: '理论预测' },
    { name: '引力透镜效应', formula: '弱/强透镜', percentage: 100, category: '观测证据', notes: '质量存在直接证据', state: '未知', importance: '关键' },
    { name: '旋转曲线', formula: 'v(r)=const', notes: '星系旋转曲线平坦化', percentage: 100, category: '观测证据', state: '未知', importance: '关键' },
    { name: '子弹星团', formula: '1E0657-56', percentage: 100, category: '观测证据', notes: '暗物质与重子分离', state: '未知', importance: '关键', discoveryYear: '2004' },
    { name: '大尺度结构', formula: 'N体模拟', percentage: 100, category: '观测证据', notes: '宇宙网丝状结构', state: '未知', importance: '关键' },
    { name: '大质量弱相互作用粒子(理论)', formula: 'Mχ~100GeV', percentage: 0, category: '超对称候选', notes: '-neutralino', state: '未知', importance: '理论预测' },
    { name: '引力微透镜', formula: 'MACHO', percentage: 0, category: '候选体', notes: '重子暗物质(已排除大部分)', state: '未知', importance: '理论预测' },
    { name: '暗光子(理论)', formula: "γ'(理论)", percentage: 0, category: '候选体', notes: '暗区规范玻色子', state: '未知', importance: '理论预测' },
    { name: 'SIMP(强相互作用大质量粒子)', formula: 'SIMP(理论)', percentage: 0, category: '候选体', notes: '3→2自湮灭', state: '未知', importance: '理论预测' },
    { name: '模糊暗物质(理论)', formula: 'φ(超轻标量)', percentage: 0, category: '候选体', notes: '10⁻²²eV(量子干涉)', state: '未知', importance: '理论预测' },
  ],
  environment: { temp: '~0K(冷暗物质)/keV(温)/MeV(热)', pressure: 'N/A', radiation: '无(弱相互作用)', gravity: '主导宇宙结构', magneticField: '无影响' },
  hazards: ['不可见(无法直接检测)', '宇宙27%质量', '改写物理学(如发现)'],
  resources: ['引力势阱(结构形成)', '宇宙骨架', '暗物质晕', '粒子物理新窗口'],
  specialFeatures: ['宇宙27%质量', '5:1暗/亮物质比', '弱相互作用(若WIMP)', '旋转曲线平坦化', '子弹星团证据', '直接探测实验(XENON/LZ/PandaX)']
};

const DarkEnergyMaterials: CosmicEnvironment = {
  name: 'DarkEnergy', nameCn: '暗能量', type: '未知能量(68%宇宙)',
  materials: [
    { name: '宇宙学常数(Λ)', formula: 'Λ/VAC能量', percentage: 68, category: '标准模型', notes: '真空能量密度(10⁻⁴⁷GeV⁴)', state: '未知', importance: '关键' },
    { name: '精质(Quintessence)', formula: 'φ(标量场)', percentage: 0, category: '动力学暗能量', notes: '随时间变化的标量场', state: '未知', importance: '理论预测' },
    { name: '幽灵能量(Phantom)', formula: 'w<-1', percentage: 0, category: '幽灵暗能量', notes: '大撕裂(Big Rip)', state: '未知', importance: '理论预测' },
    { name: 'Ia型超新星', formula: 'SN Ia', percentage: 100, category: '观测证据', notes: '1998发现宇宙加速膨胀', state: '未知', importance: '关键', discoveryYear: '1998' },
    { name: 'CMB角度尺度', formula: 'ℓ≈1°', percentage: 100, category: '观测证据', notes: 'WMAP/Planck', state: '未知', importance: '关键' },
    { name: 'BAO(重子声学振荡)', formula: 'ro≈150Mpc', percentage: 100, category: '观测证据', notes: '标准尺', state: '未知', importance: '关键' },
    { name: 'k-精质(理论)', formula: 'k-essence', percentage: 0, category: '动力学', notes: '动力学场变体', state: '未知', importance: '理论预测' },
    { name: '查普里京气体(理论)', formula: 'Chaplygin gas', percentage: 0, category: '统一模型', notes: '暗物质+暗能量统一', state: '未知', importance: '理论预测' },
    { name: '标量-张量理论(理论)', formula: 'f(R)引力', percentage: 0, category: '修改引力', notes: '修改广义相对论', state: '未知', importance: '理论预测' },
    { name: '全息暗能量(理论)', formula: 'ρ_Λ=3c²M²p/L²', percentage: 0, category: '全息原理', notes: 'UV/IR对偶', state: '未知', importance: '理论预测' },
  ],
  environment: { temp: 'N/A', pressure: '负压(驱动加速)', radiation: '无', gravity: '排斥(加速膨胀)', magneticField: 'N/A' },
  hazards: ['宇宙加速膨胀(命运)', '大撕裂(幽灵模型)', '热寂', '真空衰变(假真空)'],
  resources: ['宇宙膨胀能', '负压(时空工程理论)', '标准尺(宇宙学)'],
  specialFeatures: ['宇宙68%能量', '1998发现(诺贝尔2011)', '宇宙加速膨胀', '真空能(10¹²⁰倍差异)', '大撕裂/热寂/反弹', 'w≈-1(状态方程)']
};

// ================================================================
// 第六部分：宇宙射线与高能粒子
// ================================================================

const CosmicRayMaterials: CosmicEnvironment = {
  name: 'CosmicRay', nameCn: '宇宙射线', type: '高能粒子',
  materials: [
    { name: '质子(氢核)', formula: 'p', percentage: 89, category: '初级宇宙线', notes: '主要成分', state: '等离子态', importance: '关键' },
    { name: 'α粒子(氦核)', formula: 'He²⁺', percentage: 10, category: '初级宇宙线', notes: '第二成分', state: '等离子态', importance: '关键' },
    { name: '重离子', formula: 'C/N/O/Fe', percentage: 1, category: '初级宇宙线', notes: '宇宙线重核', state: '等离子态', importance: '重要' },
    { name: '铁核', formula: 'Fe²⁶⁺', percentage: 0.3, category: '初级宇宙线', notes: '最丰富重核', state: '等离子态', importance: '重要' },
    { name: '电子', formula: 'e⁻', percentage: 1, category: '初级宇宙线', notes: '电子成分', state: '等离子态', importance: '重要' },
    { name: '正电子', formula: 'e⁺', percentage: 0.1, category: '次级/暗物质?', notes: '正电子超出(暗物质信号?)', state: '等离子态', importance: '关键', discoveryYear: '2009' },
    { name: '反质子', formula: 'p̄', percentage: 0.001, category: '次级宇宙线', notes: '反物质', state: '等离子态', importance: '重要' },
    { name: '中微子', formula: 'ν/ν̄', percentage: 100, category: '宇宙线伴生', notes: '高能中微子(IceCube)', state: '未知', importance: '关键', discoveryYear: '2013' },
    { name: 'γ射线', formula: 'γ', percentage: 0.01, category: '宇宙线伴生', notes: '高能γ(Fermi)', state: '未知', importance: '重要' },
    { name: '超高能宇宙线', formula: '>10²⁰eV', percentage: 0.0001, category: '极高能', notes: 'Oh-My-God粒子(3×10²⁰eV)', state: '未知', importance: '关键', discoveryYear: '1991' },
    { name: '碳核', formula: 'C⁶⁺', percentage: 0.15, category: '初级宇宙线', notes: '中等重核', state: '等离子态', importance: '次要' },
    { name: '氧核', formula: 'O⁸⁺', percentage: 0.12, category: '初级宇宙线', notes: '中等重核', state: '等离子态', importance: '次要' },
    { name: '硅核', formula: 'Si¹⁴⁺', percentage: 0.05, category: '初级宇宙线', notes: '较重核', state: '等离子态', importance: '次要' },
    { name: '氘核', formula: 'D⁺', percentage: 0.001, category: '次级宇宙线', notes: '散裂产物', state: '等离子态', importance: '次要' },
    { name: '锂核', formula: 'Li³⁺', percentage: 0.003, category: '次级宇宙线', notes: '散裂产物', state: '等离子态', importance: '次要' },
    { name: '铍核', formula: 'Be⁴⁺', percentage: 0.001, category: '次级宇宙线', notes: '散裂(放射性¹⁰Be测龄)', state: '等离子态', importance: '重要' },
    { name: '硼核', formula: 'B⁵⁺', percentage: 0.005, category: '次级宇宙线', notes: '散裂产物(B/C比=传播)', state: '等离子态', importance: '重要' },
  ],
  environment: { temp: 'N/A', pressure: 'N/A', radiation: '自身就是辐射', gravity: '银河磁场偏转', magneticField: '被磁场偏转(除γ/ν)' },
  hazards: ['DNA损伤', '电子设备损坏', '宇航员风险', '次级粒子簇射', '极高能量(OMG粒子)'],
  resources: ['银河宇宙线(诊断)', '高能中微子(天文)', '正电子超出(暗物质?)', '超高能粒子(新物理)'],
  specialFeatures: ['GZK截断(60EeV)', 'Oh-My-God粒子', '正电子超出(AMS-02)', '高能中微子天文学', '膝/踝结构', '次级粒子簇射']
};

// ================================================================
// 第七部分：星系际介质与宇宙大尺度
// ================================================================

const IntergalacticMediumMaterials: CosmicEnvironment = {
  name: 'IGM', nameCn: '星系际介质', type: '宇宙大尺度结构',
  materials: [
    { name: '氢(里曼α森林)', formula: 'HI', percentage: 90, category: '整体', notes: 'Lyman-α森林(宇宙网)', state: '气态', importance: '关键' },
    { name: '氦', formula: 'HeII/HeIII', percentage: 9, category: '整体', notes: '氦二次电离(z~3)', state: '等离子态', importance: '重要' },
    { name: '氘', formula: 'D', percentage: 0.003, category: '原始', notes: 'BBN(大爆炸核合成)预言', state: '气态', importance: '关键' },
    { name: '微量金属', formula: 'C/Si/O/Fe', percentage: 0.001, category: '污染', notes: '星系反馈', state: '离子态', importance: '重要' },
    { name: '暗物质', formula: 'DM', percentage: 85, category: '暗成分', notes: '宇宙网骨架', state: '未知', importance: '关键' },
    { name: '里曼α森林', formula: 'Lyα吸收线', percentage: 100, category: '诊断工具', notes: '重子声学振荡', state: '气态', importance: '关键' },
    { name: 'Gunn-Peterson槽', formula: 'z>6 Lyα', percentage: 100, category: '再电离时代', notes: '宇宙黎明', state: '气态', importance: '关键' },
    { name: 'WHIM(温热星系际)', formula: 'O VI/B/VII', percentage: 0.5, category: '丢失重子', notes: '宇宙50%重子丢失问题', state: '等离子态', importance: '关键' },
    { name: '碳IV', formula: 'C IV', percentage: 0.0001, category: '金属线', notes: 'IGM金属增丰', state: '离子态', importance: '重要' },
    { name: '硅IV', formula: 'Si IV', percentage: 0.00003, category: '金属线', notes: 'IGM金属', state: '离子态', importance: '次要' },
    { name: '氧VI', formula: 'O VI', percentage: 0.0001, category: 'WHIM', notes: '温热气体示踪', state: '离子态', importance: '重要' },
  ],
  environment: { temp: '10⁴-10⁵K(WHIM)', pressure: '10⁻⁶/cm³', radiation: 'UV背景', gravity: '宇宙网势阱', magneticField: '极弱' },
  hazards: ['极低密度', '难以观测', '弥漫辐射'],
  resources: ['重子物质(宇宙50%丢失)', '氘(BBN探针)', '宇宙网结构', '再电离信息'],
  specialFeatures: ['Lyman-α森林', 'WHIM(温热星系际介质)', 'Gunn-Peterson效应', '重子缺失问题', '宇宙再电离(z~6)', '暗物质宇宙网']
};

// ================================================================
// 第八部分：大爆炸核合成物质
// ================================================================

const BBNSynthesisMaterials: CosmicEnvironment = {
  name: 'BigBangNucleosynthesis', nameCn: '大爆炸核合成', type: '宇宙早期(T+3分钟)',
  materials: [
    { name: '氢(¹H)', formula: '¹H', percentage: 75, category: 'BBN产物', notes: '宇宙最丰富元素', state: '等离子态', importance: '关键' },
    { name: '氦-4', formula: '⁴He', percentage: 24.9, category: 'BBN产物', notes: '第二丰富', state: '等离子态', importance: '关键' },
    { name: '氘', formula: '²H(D)', percentage: 0.003, category: 'BBN产物', notes: 'BBN敏感探针', state: '等离子态', importance: '关键' },
    { name: '氦-3', formula: '³He', percentage: 0.001, category: 'BBN产物', notes: 'BBN探针', state: '等离子态', importance: '重要' },
    { name: '锂-7', formula: '⁷Li', percentage: 0.0000001, category: 'BBN产物', notes: '锂问题(观测比预言少3倍!)', state: '等离子态', importance: '关键' },
    { name: '铍-7', formula: '⁷Be', percentage: 0.00000001, category: 'BBN中间产物', notes: '⁷Be→⁷Li(电子俘获)', state: '等离子态', importance: '重要' },
    { name: '锂-6', formula: '⁶Li', percentage: 0.000000001, category: 'BBN产物', notes: '极痕量', state: '等离子态', importance: '痕量' },
    { name: '中子', formula: 'n', percentage: 12, category: '初期', notes: 'n/p比=1/7(冻结时)', state: '等离子态', importance: '关键' },
    { name: '光子', formula: 'γ', percentage: 100, category: '辐射主导', notes: 'CMB前身', state: '未知', importance: '关键' },
    { name: '中微子', formula: 'ν', percentage: 100, category: '脱耦', notes: 'CNB(宇宙中微子背景)', state: '未知', importance: '关键' },
    { name: '电子', formula: 'e⁻', percentage: 100, category: '等离子体', notes: '与质子数相等', state: '等离子态', importance: '重要' },
    { name: '正电子(初期)', formula: 'e⁺', percentage: 0, category: '初期湮灭', notes: 'e⁺e⁻湮灭(1MeV)', state: '等离子态', importance: '重要' },
    { name: '弱相互作用冻结', formula: 'n/p冻结', notes: 'T~0.8MeV时冻结', percentage: 0, category: '关键时刻', state: '未知', importance: '关键' },
  ],
  environment: { temp: '10⁹K(1s)→10⁸K(3min)→3000K(38万年)', pressure: '极高→降低', radiation: '辐射主导', gravity: '膨胀减速', magneticField: '未知' },
  hazards: ['极高温(10⁹K)', '高密度等离子体', '中子流'],
  resources: ['氢/氦(宇宙基础)', '氘(重子密度探针)', '锂-7(物理疑难)', '中微子(CNB)', '光子(CMB)'],
  specialFeatures: ['T+3分钟核合成', '锂问题(⁷Li少3倍)', '氘测重子密度', 'n/p冻结比=1/7', '精确预言4种轻元素', 'CMB(38万年后)']
};

// ================================================================
// 第九部分：脉冲星/磁星/类星体
// ================================================================

const MagnetarMaterials: CosmicEnvironment = {
  name: 'Magnetar', nameCn: '磁星', type: '中子星(极端磁场)',
  materials: [
    { name: '中子简并物质', formula: 'n', percentage: 90, category: '核心', notes: '超核密度', state: '中子简并态', importance: '关键' },
    { name: '磁能', formula: 'B~10¹⁵G', percentage: 0, category: '磁场', notes: '宇宙最强磁场!', state: '未知', importance: '关键' },
    { name: '超流中子', formula: 'n(超流)', percentage: 60, category: '内壳', notes: '¹S₀/³P₂配对', state: '超流体', importance: '关键' },
    { name: '质子超导体', formula: 'p(超导)', percentage: 5, category: '核心', notes: 'II型超导体(磁通管)', state: '超固态', importance: '关键' },
    { name: '电子', formula: 'e⁻', percentage: 3, category: '外壳', notes: '同步辐射', state: '简并态', importance: '重要' },
    { name: '正电子', formula: 'e⁺', percentage: 0.1, category: '磁层', notes: '对产生(γ→e⁺e⁻)', state: '等离子态', importance: '重要' },
    { name: '铁壳', formula: '⁵⁶Fe(晶格)', percentage: 0.1, category: '外壳', notes: '应力积累→星震!', state: '电子简并态', importance: '重要' },
    { name: 'X射线光子', formula: 'X(20-200keV)', percentage: 0.001, category: '辐射', notes: 'SGR爆发', state: '未知', importance: '关键' },
    { name: 'γ射线暴', formula: 'γ(>100keV)', percentage: 0.0001, category: '巨耀发', notes: 'SGR 1806-20巨耀发', state: '未知', importance: '关键' },
    { name: '磁扭缠', formula: 'B(扭缠)', percentage: 0, category: '磁层', notes: '磁力线扭缠→破裂→星震', state: '未知', importance: '关键' },
  ],
  environment: { temp: '10⁶K(表面)/10¹¹K(核心)', pressure: '10³⁴Pa', radiation: '极强(X/γ)', gravity: '2×10¹² m/s²', magneticField: '10¹⁴-10¹⁵高斯(宇宙最强!)' },
  hazards: ['宇宙最强磁场', '星震(磁星地震)', 'γ射线巨耀发', 'X射线暴', '对产生风暴'],
  resources: ['极端物理实验室', '磁能(提取理论)', '超强X/γ源', '基本物理检验'],
  specialFeatures: ['宇宙最强磁场(10¹⁵G)', '星震(磁场断裂)', 'SGR(软γ重复暴)', '巨耀发(2004)', '磁场衰变(1万年)', '磁扭缠模型']
};

const QuasarMaterials: CosmicEnvironment = {
  name: 'Quasar', nameCn: '类星体', type: '活动星系核(AGN)',
  materials: [
    { name: '吸积盘氢', formula: 'H⁺', percentage: 70, category: '吸积盘', notes: '超大质量黑洞燃料', state: '等离子态', importance: '关键' },
    { name: '吸积盘氦', formula: 'He²⁺', percentage: 28, category: '吸积盘', notes: '次成分', state: '等离子态', importance: '重要' },
    { name: '宽线区气体', formula: 'H/He/C/N/O', percentage: 5, category: '宽线区(BLR)', notes: '宽发射线(FWHM>1000km/s)', state: '等离子态', importance: '关键' },
    { name: '窄线区气体', formula: '[OIII]/[NII]/[SII]', percentage: 1, category: '窄线区(NLR)', notes: '窄禁线', state: '离子态', importance: '重要' },
    { name: '相对论性喷流', formula: 'e⁻/p⁺/γ', percentage: 0.01, category: '喷流', notes: '0.99c/数百kpc长', state: '等离子态', importance: '关键' },
    { name: '尘埃环', formula: '硅酸盐/石墨', percentage: 10, category: '环面(Torus)', notes: '遮蔽AGN统一模型', state: '固态', importance: '重要' },
    { name: '分子气体', formula: 'H₂/CO', percentage: 20, category: '环面', notes: '分子环面', state: '气态', importance: '重要' },
    { name: '铁Kα线', formula: 'Fe Kα(6.4keV)', percentage: 0.01, category: '吸积盘内区', notes: '黑洞自旋测量', state: '等离子态', importance: '关键' },
    { name: '同步辐射', formula: 'γ(同步)', percentage: 0.001, category: '喷流', notes: '射电-γ全谱', state: '未知', importance: '重要' },
    { name: '逆康普顿辐射', formula: 'γ(逆康普顿)', percentage: 0.001, category: '冕区', notes: '硬X射线', state: '未知', importance: '重要' },
    { name: '星暴区气体', formula: 'H₂/CO/HI', percentage: 30, category: '宿主星系', notes: '伴生恒星形成', state: '气态', importance: '次要' },
    { name: '超大质量黑洞', formula: 'SMBH(10⁶-10¹⁰M☉)', percentage: 0, category: '中心引擎', notes: '类星体能量源', state: '未知', importance: '关键' },
  ],
  environment: { temp: '10⁴K(NLR)/10⁵-10⁷K(BLR)/10⁹K(吸积盘)', pressure: '极宽范围', radiation: '宇宙最亮(10¹⁴L☉)', gravity: '超大质量黑洞', magneticField: '强(喷流准直)' },
  hazards: ['宇宙最亮持续源', '相对论性喷流', '强X/γ辐射', '超大质量黑洞引力', '星系尺度反馈'],
  resources: ['超大质量黑洞(引力波)', '吸积能(42%效率)', '喷流(宇宙线加速)', '重元素(enrichment)'],
  specialFeatures: ['宇宙最亮(10¹⁴L☉)', 'AGN统一模型', '宽线/窄线区', 'M-σ关系', '宇宙学标准烛光', '超Eddington吸积']
};

// ================================================================
// 第十部分：原行星盘/太阳系早期
// ================================================================

const ProtoplanetaryDiskMaterials: CosmicEnvironment = {
  name: 'ProtoplanetaryDisk', nameCn: '原行星盘', type: '行星形成环境',
  materials: [
    { name: '分子氢', formula: 'H₂', percentage: 85, category: '气体', notes: '盘主体', state: '气态', importance: '关键' },
    { name: '氦', formula: 'He', percentage: 13, category: '气体', notes: '原始氦', state: '气态', importance: '重要' },
    { name: '一氧化碳', formula: 'CO', percentage: 0.05, category: '气相', notes: '盘气体示踪剂', state: '气态', importance: '关键' },
    { name: '水冰', formula: 'H₂O(冰)', percentage: 1, category: '冰线内', notes: '雪线(2.7AU)', state: '固态', importance: '关键' },
    { name: '硅酸盐尘', formula: 'MgSiO₃/FeSiO₃', percentage: 0.5, category: '尘埃', notes: '岩石行星原料', state: '固态', importance: '关键' },
    { name: '铁尘', formula: 'Fe', percentage: 0.2, category: '尘埃', notes: '金属尘', state: '固态', importance: '重要' },
    { name: '甲烷冰', formula: 'CH₄(冰)', percentage: 0.1, category: '冰线外', notes: '甲烷雪线(~30AU)', state: '固态', importance: '重要' },
    { name: '氨冰', formula: 'NH₃(冰)', percentage: 0.05, category: '冰线外', notes: '氨雪线(~5AU)', state: '固态', importance: '重要' },
    { name: '二氧化碳冰', formula: 'CO₂(冰)', percentage: 0.1, category: '冰线', notes: 'CO₂雪线', state: '固态', importance: '重要' },
    { name: 'PAH', formula: 'C₁₈H₁₂等', percentage: 0.01, category: '尘埃', notes: '碳循环', state: '固态', importance: '重要' },
    { name: '石墨/碳尘', formula: 'C', percentage: 0.05, category: '尘埃', notes: '碳尘', state: '固态', importance: '重要' },
    { name: '甲醇', formula: 'CH₃OH', percentage: 0.001, category: '冰幔/气相', notes: '有机分子', state: '固态', importance: '重要' },
    { name: '甲醛', formula: 'H₂CO', percentage: 0.0001, category: '气相', notes: '有机分子', state: '气态', importance: '重要' },
    { name: '氰化氢', formula: 'HCN', percentage: 0.00001, category: '气相', notes: '生命前体', state: '气态', importance: '关键' },
    { name: '乙炔', formula: 'C₂H₂', percentage: 0.00001, category: '气相', notes: '碳链分子', state: '气态', importance: '次要' },
    { name: '水蒸气', formula: 'H₂O(气)', percentage: 0.01, category: '雪线内', notes: '盘内区', state: '气态', importance: '重要' },
    { name: '碳颗粒(纳米金刚石)', formula: 'C(纳米金刚石)', percentage: 0.001, category: '尘埃', notes: '3.47/3.53μm特征', state: '固态', importance: '重要' },
    { name: '橄榄石', formula: 'Mg₂SiO₄/MgFeSiO₄', percentage: 0.2, category: '尘埃(结晶)', notes: '33/69μm特征', state: '固态', importance: '重要' },
    { name: '辉石', formula: 'MgSiO₃', percentage: 0.1, category: '尘埃(结晶)', notes: '9/20μm特征', state: '固态', importance: '重要' },
    { name: '硫化解铁', formula: 'FeS', percentage: 0.05, category: '尘埃', notes: '陨石中常见', state: '固态', importance: '次要' },
  ],
  environment: { temp: '200-2000K(径向梯度)', pressure: '10⁻⁶-10⁻²bar', radiation: '中心星UV+吸积光度', gravity: '中心星引力', magneticField: '几mG-MG(盘磁场)' },
  hazards: ['中心星耀斑', '高能辐射', '盘不稳定性', '行星迁移', '双星扰动'],
  resources: ['行星原料(全部!)', '水冰', '有机分子', '金属尘', '气体巨行星原料'],
  specialFeatures: ['雪线(决定行星类型)', 'ALMA观测(HL Tau)', '盘不稳定性(GI)', '磁转动不稳定性(MRI)', '行星迁移', '尘埃生长→微行星→行星']
};

// ================================================================
// 汇总导出
// ================================================================

export const UNIVERSE_ENVIRONMENTS: Record<string, CosmicEnvironment> = {
  // 恒星类型
  RedGiant: RedGiantMaterials,
  WhiteDwarf: WhiteDwarfMaterials,
  NeutronStar: NeutronStarMaterials,
  RedDwarf: RedDwarfMaterials,
  BlueSupergiant: BlueSupergiantMaterials,
  BrownDwarf: BrownDwarfMaterials,
  YellowDwarf: YellowDwarfMaterials,
  WolfRayet: WolfRayetMaterials,
  // 星际介质与星云
  MolecularCloud: MolecularCloudMaterials,
  EmissionNebula: EmissionNebulaMaterials,
  SupernovaRemnant: SupernovaRemnantMaterials,
  PlanetaryNebula: PlanetaryNebulaMaterials,
  // 系外行星
  HotJupiter: HotJupiterMaterials,
  LavaPlanet: LavaPlanetMaterials,
  CarbonPlanet: CarbonPlanetMaterials,
  WaterWorld: WaterWorldMaterials,
  SuperEarth: SuperEarthMaterials,
  IceGiant: IceGiantMaterials,
  // 黑洞与极端环境
  BlackHole: BlackHoleMaterials,
  AccretionDisk: AccretionDiskMaterials,
  // 暗物质与暗能量
  DarkMatter: DarkMatterMaterials,
  DarkEnergy: DarkEnergyMaterials,
  // 宇宙射线
  CosmicRay: CosmicRayMaterials,
  // 星系际介质
  IGM: IntergalacticMediumMaterials,
  // 大爆炸
  BigBang: BBNSynthesisMaterials,
  // 脉冲星/类星体
  Magnetar: MagnetarMaterials,
  Quasar: QuasarMaterials,
  // 原行星盘
  ProtoplanetaryDisk: ProtoplanetaryDiskMaterials,
};

// 宇宙物质分类统计
export const UNIVERSE_MATERIAL_STATS = {
  totalEnvironments: Object.keys(UNIVERSE_ENVIRONMENTS).length,
  totalInterstellarMolecules: 250,
  totalPAH: 30,
  totalAminoAcids: 20,
  totalElements: 94,
  heaviestNaturalElement: 'U(铀, Z=92)',
  cosmologicalComposition: { darkEnergy: 68.3, darkMatter: 26.8, baryonic: 4.9 },
};
