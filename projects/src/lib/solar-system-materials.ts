/**
 * 太阳系全量物质数据库
 * 涵盖所有天体的大气、地壳、地幔、核心、海洋、环系统等各层物质成分
 * 数据来源: NASA PDS, ESA, JPL, IAU, 同位素地球化学文献
 */

export interface Material {
  name: string;
  formula: string;
  percentage: number;
  category: string;
  notes: string;
  state?: '气态' | '液态' | '固态' | '等离子态' | '超临界' | '超离子态' | '溶解' | '固态/液态' | '气态/液态' | '固态/气态' | '气态/固态' | '简并态' | '中子简并态' | '电子简并态' | '超流体' | '超固态' | '奇异物态' | '夸克-胶子等离子态' | '玻色-爱因斯坦凝聚态' | '离子态' | '亚稳态' | '未知';
  discoveryYear?: string;
  importance?: '关键' | '重要' | '次要' | '痕量';
}

export interface BodyMaterials {
  name: string;
  nameCn: string;
  type: string;
  materials: Material[];
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

// ========== 太阳 ==========
const SunMaterials: BodyMaterials = {
  name: 'Sun', nameCn: '太阳', type: '恒星(G2V)',
  materials: [
    { name: '氢', formula: 'H', percentage: 73.46, category: '整体', notes: '核聚变燃料', state: '等离子态', importance: '关键' },
    { name: '氦', formula: 'He', percentage: 24.85, category: '整体', notes: '聚变产物', state: '等离子态', importance: '关键' },
    { name: '氧', formula: 'O', percentage: 0.77, category: '金属层', notes: '重元素', state: '等离子态', importance: '重要' },
    { name: '碳', formula: 'C', percentage: 0.29, category: '金属层', notes: '重元素', state: '等离子态', importance: '重要' },
    { name: '铁', formula: 'Fe', percentage: 0.16, category: '核心', notes: '最重元素', state: '等离子态', importance: '重要' },
    { name: '氖', formula: 'Ne', percentage: 0.12, category: '金属层', notes: '稀有气体', state: '等离子态', importance: '次要' },
    { name: '氮', formula: 'N', percentage: 0.09, category: '金属层', notes: '重元素', state: '等离子态', importance: '次要' },
    { name: '硅', formula: 'Si', percentage: 0.07, category: '金属层', notes: '岩石元素', state: '等离子态', importance: '次要' },
    { name: '镁', formula: 'Mg', percentage: 0.05, category: '金属层', notes: '岩石元素', state: '等离子态', importance: '次要' },
    { name: '硫', formula: 'S', percentage: 0.04, category: '金属层', notes: '挥发元素', state: '等离子态', importance: '次要' },
    { name: '氩', formula: 'Ar', percentage: 0.006, category: '金属层', notes: '稀有气体', state: '等离子态', importance: '痕量' },
    { name: '铝', formula: 'Al', percentage: 0.005, category: '金属层', notes: '岩石元素', state: '等离子态', importance: '痕量' },
    { name: '钙', formula: 'Ca', percentage: 0.004, category: '金属层', notes: '岩石元素', state: '等离子态', importance: '痕量' },
    { name: '铬', formula: 'Cr', percentage: 0.001, category: '金属层', notes: '铁族元素', state: '等离子态', importance: '痕量' },
    { name: '镍', formula: 'Ni', percentage: 0.008, category: '核心', notes: '铁镍核心', state: '等离子态', importance: '痕量' },
    { name: '锂', formula: 'Li', percentage: 0.000001, category: '光球层', notes: '锂匮乏问题', state: '等离子态', importance: '痕量' },
    { name: '铍', formula: 'Be', percentage: 0.0000001, category: '金属层', notes: '痕量', state: '等离子态', importance: '痕量' },
    { name: '硼', formula: 'B', percentage: 0.0000001, category: '金属层', notes: '痕量', state: '等离子态', importance: '痕量' },
  ],
  environment: { temp: '5500°C(表面)/1500万°C(核心)', pressure: '2500亿atm(核心)', radiation: '极强(全谱段)', gravity: '274 m/s²', magneticField: '极强(25高斯)' },
  hazards: ['极端辐射', '日冕物质抛射', '太阳耀斑', '高温等离子体', '强磁场'],
  resources: ['氢(几乎无限)', '氦', '聚变能', '重元素'],
  specialFeatures: ['核聚变反应器', '11年太阳活动周期', '日冕加热问题', '中微子振荡']
};

// ========== 水星 ==========
const MercuryMaterials: BodyMaterials = {
  name: 'Mercury', nameCn: '水星', type: '类地行星',
  materials: [
    { name: '铁', formula: 'Fe', percentage: 60, category: '核心', notes: '巨大铁核(75%半径)', state: '固态', importance: '关键' },
    { name: '硅酸盐', formula: 'SiO₂', percentage: 25, category: '地壳/地幔', notes: '硅酸盐幔层', state: '固态', importance: '关键' },
    { name: '氧化镁', formula: 'MgO', percentage: 8, category: '地幔', notes: '幔层成分', state: '固态', importance: '重要' },
    { name: '氧化铝', formula: 'Al₂O₃', percentage: 3, category: '地壳', notes: '地壳成分', state: '固态', importance: '重要' },
    { name: '氧化钙', formula: 'CaO', percentage: 1.5, category: '地壳', notes: '地壳成分', state: '固态', importance: '次要' },
    { name: '氧化钛', formula: 'TiO₂', percentage: 0.5, category: '地壳', notes: '火山平原', state: '固态', importance: '次要' },
    { name: '硫', formula: 'S', percentage: 0.5, category: '核心', notes: '铁核硫化物', state: '固态', importance: '次要' },
    { name: '钾', formula: 'K', percentage: 0.05, category: '地壳', notes: '挥发性元素(异常富集)', state: '固态', importance: '痕量' },
    { name: '钠', formula: 'Na', percentage: 0.3, category: '外逸层', notes: '表面释放', state: '气态', importance: '痕量' },
    { name: '氢', formula: 'H', percentage: 0.001, category: '极区', notes: '永久阴影区水冰来源', state: '固态', importance: '痕量', discoveryYear: '2012' },
    { name: '水冰', formula: 'H₂O', percentage: 0.01, category: '极区坑底', notes: '永久阴影区冰', state: '固态', importance: '痕量', discoveryYear: '2012' },
    { name: '氮', formula: 'N₂', percentage: 0.0001, category: '外逸层', notes: '极稀薄', state: '气态', importance: '痕量' },
  ],
  environment: { temp: '-180~430°C', pressure: '~10⁻¹⁵ atm', radiation: '极强(无大气/磁场)', gravity: '3.7 m/s²', magneticField: '弱(1%地球)' },
  hazards: ['极端温差', '太阳辐射', '微陨石', '无大气保护', '太阳风轰击'],
  resources: ['铁(巨大核心)', '硅酸盐', '极区水冰', '稀有金属'],
  specialFeatures: ['巨大铁核', '极度温差', '逆行自转缓慢', '轨道共振3:2']
};

// ========== 金星 ==========
const VenusMaterials: BodyMaterials = {
  name: 'Venus', nameCn: '金星', type: '类地行星',
  materials: [
    { name: '二氧化碳', formula: 'CO₂', percentage: 96.5, category: '大气', notes: '温室效应主因', state: '气态', importance: '关键' },
    { name: '氮气', formula: 'N₂', percentage: 3.5, category: '大气', notes: '第二大气成分', state: '气态', importance: '重要' },
    { name: '硫酸', formula: 'H₂SO₄', percentage: 0.01, category: '云层', notes: '厚硫酸云层', state: '液态', importance: '重要' },
    { name: '二氧化硫', formula: 'SO₂', percentage: 0.015, category: '大气', notes: '火山气体', state: '气态', importance: '重要' },
    { name: '水蒸气', formula: 'H₂O', percentage: 0.002, category: '大气', notes: '极干燥', state: '气态', importance: '次要' },
    { name: '氩', formula: 'Ar', percentage: 0.007, category: '大气', notes: '稀有气体', state: '气态', importance: '痕量' },
    { name: '一氧化碳', formula: 'CO', percentage: 0.002, category: '大气', notes: '光化学产物', state: '气态', importance: '痕量' },
    { name: '氦', formula: 'He', percentage: 0.001, category: '大气', notes: '稀有气体', state: '气态', importance: '痕量' },
    { name: '硫化氢', formula: 'H₂S', percentage: 0.0001, category: '大气', notes: '火山信号', state: '气态', importance: '痕量' },
    { name: '羰基硫', formula: 'OCS', percentage: 0.0001, category: '大气', notes: '可能的生物标志物', state: '气态', importance: '痕量' },
    { name: '硅酸盐', formula: 'SiO₂', percentage: 45, category: '地壳', notes: '玄武岩地壳', state: '固态', importance: '关键' },
    { name: '氧化铁', formula: 'FeO', percentage: 8, category: '地幔', notes: '地幔成分', state: '固态', importance: '重要' },
    { name: '氧化镁', formula: 'MgO', percentage: 15, category: '地幔', notes: '地幔成分', state: '固态', importance: '重要' },
  ],
  environment: { temp: '462°C(表面)', pressure: '92 atm', radiation: '弱(厚云屏蔽)', gravity: '8.87 m/s²', magneticField: '极弱(感应磁层)' },
  hazards: ['失控温室效应', '硫酸雨', '极端高温高压', '超级旋转大气', '火山活跃'],
  resources: ['二氧化碳', '氮气', '硫酸', '可能的磷化氢(生物标志?)'],
  specialFeatures: ['失控温室效应', '逆向自转', '超级旋转大气(4天/圈)', '磷化氢争议']
};

// ========== 地球 ==========
const EarthMaterials: BodyMaterials = {
  name: 'Earth', nameCn: '地球', type: '类地行星',
  materials: [
    // 大气层
    { name: '氮气', formula: 'N₂', percentage: 78.09, category: '大气', notes: '大气主成分', state: '气态', importance: '关键' },
    { name: '氧气', formula: 'O₂', percentage: 20.95, category: '大气', notes: '生命产物', state: '气态', importance: '关键' },
    { name: '氩', formula: 'Ar', percentage: 0.93, category: '大气', notes: '稀有气体', state: '气态', importance: '重要' },
    { name: '水蒸气', formula: 'H₂O', percentage: 0.4, category: '大气', notes: '变化范围0-4%', state: '气态', importance: '重要' },
    { name: '二氧化碳', formula: 'CO₂', percentage: 0.042, category: '大气', notes: '温室气体(上升中)', state: '气态', importance: '重要' },
    { name: '氖', formula: 'Ne', percentage: 0.0018, category: '大气', notes: '稀有气体', state: '气态', importance: '痕量' },
    { name: '氦', formula: 'He', percentage: 0.0005, category: '大气', notes: '逃逸中', state: '气态', importance: '痕量' },
    { name: '甲烷', formula: 'CH₄', percentage: 0.00019, category: '大气', notes: '温室气体', state: '气态', importance: '痕量' },
    { name: '氪', formula: 'Kr', percentage: 0.00011, category: '大气', notes: '稀有气体', state: '气态', importance: '痕量' },
    { name: '臭氧', formula: 'O₃', percentage: 0.000007, category: '平流层', notes: 'UV屏蔽层', state: '气态', importance: '重要' },
    // 地壳
    { name: '硅酸盐', formula: 'SiO₂', percentage: 59, category: '地壳', notes: '地壳主体', state: '固态', importance: '关键' },
    { name: '铝氧化物', formula: 'Al₂O₃', percentage: 15, category: '地壳', notes: '第二丰富', state: '固态', importance: '关键' },
    { name: '氧化铁', formula: 'Fe₂O₃', percentage: 7, category: '地壳', notes: '红色土壤', state: '固态', importance: '重要' },
    { name: '氧化钙', formula: 'CaO', percentage: 5, category: '地壳', notes: '石灰岩', state: '固态', importance: '重要' },
    { name: '氧化镁', formula: 'MgO', percentage: 4, category: '地壳', notes: '地幔成分', state: '固态', importance: '重要' },
    { name: '氧化钠', formula: 'Na₂O', percentage: 3, category: '地壳', notes: '盐来源', state: '固态', importance: '次要' },
    { name: '氧化钾', formula: 'K₂O', percentage: 2.5, category: '地壳', notes: '钾盐', state: '固态', importance: '次要' },
    { name: '氧化钛', formula: 'TiO₂', percentage: 0.7, category: '地壳', notes: '工业金属', state: '固态', importance: '次要' },
    // 海洋
    { name: '水', formula: 'H₂O', percentage: 96.5, category: '海洋', notes: '液态水海洋', state: '液态', importance: '关键' },
    { name: '氯化钠', formula: 'NaCl', percentage: 2.7, category: '海洋', notes: '海水盐分', state: '溶解', importance: '重要' },
    { name: '氯化镁', formula: 'MgCl₂', percentage: 0.3, category: '海洋', notes: '海水成分', state: '溶解', importance: '次要' },
    { name: '硫酸钠', formula: 'Na₂SO₄', percentage: 0.2, category: '海洋', notes: '海水成分', state: '溶解', importance: '次要' },
    { name: '氯化钙', formula: 'CaCl₂', percentage: 0.1, category: '海洋', notes: '海水成分', state: '溶解', importance: '次要' },
    // 核心
    { name: '铁', formula: 'Fe', percentage: 85, category: '核心', notes: '铁镍核心', state: '固态/液态', importance: '关键' },
    { name: '镍', formula: 'Ni', percentage: 10, category: '核心', notes: '铁镍合金', state: '固态/液态', importance: '重要' },
    { name: '硫', formula: 'S', percentage: 5, category: '核心', notes: '轻元素合金', state: '液态', importance: '次要' },
  ],
  environment: { temp: '-89~57°C', pressure: '1 atm', radiation: '低(磁层+臭氧)', gravity: '9.81 m/s²', magneticField: '强(偶极子)' },
  hazards: ['地震', '火山', '海啸', '飓风', '小行星撞击'],
  resources: ['水', '氧', '铁', '铝', '硅', '稀土元素', '铀', '石油', '天然气', '煤炭'],
  specialFeatures: ['液态水海洋', '板块构造', '强磁场', '生命', '氧气大气']
};

// ========== 火星 ==========
const MarsMaterials: BodyMaterials = {
  name: 'Mars', nameCn: '火星', type: '类地行星',
  materials: [
    { name: '二氧化碳', formula: 'CO₂', percentage: 95.32, category: '大气', notes: '稀薄大气主成分', state: '气态', importance: '关键' },
    { name: '氮气', formula: 'N₂', percentage: 2.7, category: '大气', notes: '次要大气成分', state: '气态', importance: '重要' },
    { name: '氩', formula: 'Ar', percentage: 1.6, category: '大气', notes: '稀有气体', state: '气态', importance: '重要' },
    { name: '氧气', formula: 'O₂', percentage: 0.13, category: '大气', notes: '光解产物', state: '气态', importance: '次要' },
    { name: '一氧化碳', formula: 'CO', percentage: 0.08, category: '大气', notes: '光化学产物', state: '气态', importance: '次要' },
    { name: '水蒸气', formula: 'H₂O', percentage: 0.03, category: '大气', notes: '极稀薄', state: '气态', importance: '痕量' },
    { name: '臭氧', formula: 'O₃', percentage: 0.0001, category: '大气', notes: '微量臭氧层', state: '气态', importance: '痕量' },
    { name: '甲烷', formula: 'CH₄', percentage: 0.00001, category: '大气', notes: '争议性探测(生物?)', state: '气态', importance: '痕量', discoveryYear: '2003' },
    // 地壳
    { name: '氧化铁', formula: 'Fe₂O₃', percentage: 18, category: '地壳/表面', notes: '红色土壤', state: '固态', importance: '关键' },
    { name: '硅酸盐', formula: 'SiO₂', percentage: 43, category: '地壳', notes: '玄武岩壳', state: '固态', importance: '关键' },
    { name: '氧化铝', formula: 'Al₂O₃', percentage: 10, category: '地壳', notes: '地壳成分', state: '固态', importance: '重要' },
    { name: '氧化镁', formula: 'MgO', percentage: 8, category: '地幔', notes: '地幔成分', state: '固态', importance: '重要' },
    { name: '氧化钙', formula: 'CaO', percentage: 6, category: '地壳', notes: '地壳成分', state: '固态', importance: '重要' },
    { name: '氧化钛', formula: 'TiO₂', percentage: 0.8, category: '地壳', notes: '地壳成分', state: '固态', importance: '次要' },
    { name: '硫酸钙', formula: 'CaSO₄', percentage: 3, category: '沉积层', notes: '石膏矿脉', state: '固态', importance: '重要' },
    { name: '高氯酸盐', formula: 'ClO₄⁻', percentage: 0.5, category: '表面土壤', notes: '毒性物质', state: '固态', importance: '重要', discoveryYear: '2008' },
    { name: '水冰', formula: 'H₂O', percentage: 5, category: '极地/地下', notes: '大量水冰储备', state: '固态', importance: '关键', discoveryYear: '2002' },
    { name: '干冰', formula: 'CO₂', percentage: 2, category: '极冠', notes: '季节性极冠', state: '固态', importance: '重要' },
    { name: '赤铁矿', formula: 'Fe₂O₃', percentage: 3, category: '表面', notes: '蓝色球形结核', state: '固态', importance: '重要', discoveryYear: '2004' },
    { name: '针铁矿', formula: 'FeO(OH)', percentage: 1, category: '表面', notes: '含水矿物(水证据)', state: '固态', importance: '重要' },
    { name: '蒙脱石', formula: '(Na,Ca)₀.₃(Al,Mg)₂Si₄O₁₀(OH)₂', percentage: 1, category: '沉积', notes: '粘土矿物(水蚀变)', state: '固态', importance: '重要' },
  ],
  environment: { temp: '-140~20°C', pressure: '0.636 kPa', radiation: '强(薄大气)', gravity: '3.72 m/s²', magneticField: '极弱(局部)' },
  hazards: ['辐射暴露', '沙尘暴(全球性)', '低温', '稀薄大气', '高氯酸盐毒性', '尘卷风'],
  resources: ['水冰', '二氧化碳', '铁氧化物', '氘(聚变)', '稀土矿物', '粘土矿物'],
  specialFeatures: ['奥林帕斯山(最大火山)', '水手谷(最大峡谷)', '极冠水冰', '甲烷之谜']
};

// ========== 木星 ==========
const JupiterMaterials: BodyMaterials = {
  name: 'Jupiter', nameCn: '木星', type: '气态巨行星',
  materials: [
    { name: '氢', formula: 'H₂', percentage: 89.8, category: '大气/整体', notes: '分子氢主体', state: '气态/液态', importance: '关键' },
    { name: '氦', formula: 'He', percentage: 10.2, category: '大气/整体', notes: '太阳丰度差异', state: '气态/液态', importance: '关键' },
    { name: '甲烷', formula: 'CH₄', percentage: 0.3, category: '大气', notes: '光谱特征', state: '气态', importance: '重要' },
    { name: '氨', formula: 'NH₃', percentage: 0.026, category: '云层', notes: '白色云带', state: '固态/气态', importance: '重要' },
    { name: '磷化氢', formula: 'PH₃', percentage: 0.0001, category: '大气', notes: '大红斑成分', state: '气态', importance: '痕量' },
    { name: '水蒸气', formula: 'H₂O', percentage: 0.0004, category: '深层', notes: '深层云层', state: '气态', importance: '痕量' },
    { name: '乙烷', formula: 'C₂H₆', percentage: 0.0002, category: '大气', notes: '光化学产物', state: '气态', importance: '痕量' },
    { name: '乙炔', formula: 'C₂H₂', percentage: 0.00001, category: '大气', notes: '光化学产物', state: '气态', importance: '痕量' },
    { name: '锗烷', formula: 'GeH₄', percentage: 0.0000007, category: '大气', notes: '痕量成分', state: '气态', importance: '痕量' },
    { name: '砷化氢', formula: 'AsH₃', percentage: 0.0000002, category: '大气', notes: '痕量成分', state: '气态', importance: '痕量' },
    { name: '一氧化碳', formula: 'CO', percentage: 0.000001, category: '大气', notes: '痕量', state: '气态', importance: '痕量' },
    { name: '硫化氢', formula: 'H₂S', percentage: 0.00001, category: '云层', notes: '褐色云带', state: '气态', importance: '痕量' },
    // 内部
    { name: '金属氢', formula: 'H(金属)', percentage: 50, category: '内部', notes: '高压金属态(400万atm)', state: '超离子态', importance: '关键' },
    { name: '岩石/冰核', formula: '硅酸盐/冰', percentage: 5, category: '核心', notes: '10-20地球质量', state: '固态/液态', importance: '重要' },
  ],
  environment: { temp: '-145°C(云顶)/>30000°C(核心)', pressure: '>1000万atm(核心)', radiation: '极强(磁层)', gravity: '24.79 m/s²', magneticField: '极强(20000倍地球)' },
  hazards: ['极端辐射带', '强引力场', '大红斑风暴(持续350+年)', '无固体表面', '超级闪电(1000x地球)', '磁层粒子加速'],
  resources: ['氢(几乎无限)', '氦-3', '氦', '氨', '水(深层)', '甲烷', '金属氢(能源)'],
  specialFeatures: ['金属氢层', '大红斑', '极强辐射带', '67+颗卫星', '引力助推站']
};

// ========== 土星 ==========
const SaturnMaterials: BodyMaterials = {
  name: 'Saturn', nameCn: '土星', type: '气态巨行星',
  materials: [
    { name: '氢', formula: 'H₂', percentage: 96.3, category: '大气', notes: '主体成分', state: '气态/液态', importance: '关键' },
    { name: '氦', formula: 'He', percentage: 3.25, category: '大气', notes: '氦匮乏(雨沉)', state: '气态/液态', importance: '关键' },
    { name: '甲烷', formula: 'CH₄', percentage: 0.45, category: '大气', notes: '上大气层', state: '气态', importance: '重要' },
    { name: '氨', formula: 'NH₃', percentage: 0.0125, category: '云层', notes: '云带结构', state: '固态/气态', importance: '重要' },
    { name: '乙烷', formula: 'C₂H₆', percentage: 0.0002, category: '大气', notes: '光化学', state: '气态', importance: '痕量' },
    { name: '磷化氢', formula: 'PH₃', percentage: 0.0001, category: '大气', notes: '痕量', state: '气态', importance: '痕量' },
    { name: '水蒸气', formula: 'H₂O', percentage: 0.0004, category: '深层', notes: '深层', state: '气态', importance: '痕量' },
    // 环系统
    { name: '水冰', formula: 'H₂O', percentage: 99, category: '环系统', notes: '环主体(冰粒1cm-10m)', state: '固态', importance: '关键' },
    { name: '硅酸盐尘', formula: 'SiO₂', percentage: 0.5, category: '环系统', notes: '环尘', state: '固态', importance: '痕量' },
    { name: '碳化合物', formula: 'C', percentage: 0.3, category: '环系统', notes: '暗色环物质', state: '固态', importance: '痕量' },
    // 内部
    { name: '金属氢', formula: 'H(金属)', percentage: 40, category: '内部', notes: '高压金属态', state: '超离子态', importance: '关键' },
    { name: '岩石/冰核', formula: '硅酸盐/冰', percentage: 5, category: '核心', notes: '核心', state: '固态/液态', importance: '重要' },
  ],
  environment: { temp: '-178°C(云顶)', pressure: '>1000万atm(核心)', radiation: '中等', gravity: '10.44 m/s²', magneticField: '强(580倍地球)' },
  hazards: ['强辐射', '环碎片碰撞', '无固体表面', '卫星引力扰动', '氦雨'],
  resources: ['氢', '氦', '水冰(环)', '土卫六有机物', '氦-3'],
  specialFeatures: ['壮丽环系统', '氦雨现象', '六边形极地风暴', '82+颗卫星', '密度<水']
};

// ========== 天王星 ==========
const UranusMaterials: BodyMaterials = {
  name: 'Uranus', nameCn: '天王星', type: '冰巨行星',
  materials: [
    { name: '氢', formula: 'H₂', percentage: 82.5, category: '大气', notes: '外层大气', state: '气态', importance: '关键' },
    { name: '氦', formula: 'He', percentage: 15.2, category: '大气', notes: '大气成分', state: '气态', importance: '关键' },
    { name: '甲烷', formula: 'CH₄', percentage: 2.3, category: '大气', notes: '青色来源', state: '气态', importance: '重要' },
    { name: '硫化氢', formula: 'H₂S', percentage: 0.001, category: '大气', notes: '臭鸡蛋味(2018确认)', state: '气态', importance: '痕量', discoveryYear: '2018' },
    { name: '水冰', formula: 'H₂O', percentage: 50, category: '幔层', notes: '超离子水(热冰)', state: '超离子态', importance: '关键' },
    { name: '氨冰', formula: 'NH₃', percentage: 10, category: '幔层', notes: '冰幔成分', state: '固态', importance: '重要' },
    { name: '甲烷冰', formula: 'CH₄', percentage: 20, category: '幔层', notes: '高压冰态', state: '固态', importance: '重要' },
    { name: '硅酸盐', formula: 'SiO₂', percentage: 5, category: '核心', notes: '岩石核心', state: '固态', importance: '重要' },
    { name: '氢硫化物', formula: 'NH₄SH', percentage: 2, category: '云层', notes: '云层成分', state: '固态', importance: '次要' },
  ],
  environment: { temp: '-224°C', pressure: '高(内部)', radiation: '弱', gravity: '8.69 m/s²', magneticField: '异常(偏移59°)' },
  hazards: ['极端低温', '侧翻自转(98°)', '弱辐射带', '异常磁场'],
  resources: ['甲烷', '水冰', '氨', '氢', '超离子水(能源?)'],
  specialFeatures: ['侧翻自转(98°倾斜)', '超离子水', '异常偏移磁场', '最冷行星大气']
};

// ========== 海王星 ==========
const NeptuneMaterials: BodyMaterials = {
  name: 'Neptune', nameCn: '海王星', type: '冰巨行星',
  materials: [
    { name: '氢', formula: 'H₂', percentage: 80, category: '大气', notes: '外层', state: '气态', importance: '关键' },
    { name: '氦', formula: 'He', percentage: 19, category: '大气', notes: '大气', state: '气态', importance: '关键' },
    { name: '甲烷', formula: 'CH₄', percentage: 1.5, category: '大气', notes: '深蓝来源', state: '气态', importance: '重要' },
    { name: '硫化氢', formula: 'H₂S', percentage: 0.001, category: '大气', notes: '大气成分', state: '气态', importance: '痕量' },
    { name: '水冰', formula: 'H₂O', percentage: 50, category: '幔层', notes: '超离子水', state: '超离子态', importance: '关键' },
    { name: '氨冰', formula: 'NH₃', percentage: 10, category: '幔层', notes: '冰幔', state: '固态', importance: '重要' },
    { name: '甲烷冰', formula: 'CH₄', percentage: 20, category: '幔层', notes: '高压冰', state: '固态', importance: '重要' },
    { name: '硅酸盐', formula: 'SiO₂', percentage: 5, category: '核心', notes: '岩石核心', state: '固态', importance: '重要' },
  ],
  environment: { temp: '-218°C', pressure: '高(内部)', radiation: '弱', gravity: '11.15 m/s²', magneticField: '异常(偏移47°)' },
  hazards: ['超音速风暴(2100km/h)', '极端低温', '无固体表面', '异常磁场'],
  resources: ['甲烷', '水冰', '氢', '氦', '超离子水'],
  specialFeatures: ['最强风暴(2100km/h)', '大暗斑', '海卫一逆行', '内部热源(2.6倍接收)']
};

// ========== 月球 ==========
const MoonMaterials: BodyMaterials = {
  name: 'Moon', nameCn: '月球', type: '天然卫星',
  materials: [
    { name: '硅酸盐', formula: 'SiO₂', percentage: 45, category: '月壳(高地)', notes: '斜长岩高地', state: '固态', importance: '关键' },
    { name: '氧化铁', formula: 'FeO', percentage: 10, category: '月海', notes: '月海玄武岩', state: '固态', importance: '重要' },
    { name: '铝氧化物', formula: 'Al₂O₃', percentage: 15, category: '月壳(高地)', notes: '高地富集', state: '固态', importance: '关键' },
    { name: '氧化钙', formula: 'CaO', percentage: 12, category: '月壳', notes: '斜长石成分', state: '固态', importance: '重要' },
    { name: '氧化镁', formula: 'MgO', percentage: 8, category: '月幔', notes: '月幔橄榄石', state: '固态', importance: '重要' },
    { name: '氧化钛', formula: 'TiO₂', percentage: 2, category: '月海', notes: '钛铁矿富集区', state: '固态', importance: '重要' },
    { name: '氦-3', formula: '³He', percentage: 0.0001, category: '月壤', notes: '聚变燃料(百万吨级)', state: '固态', importance: '关键', discoveryYear: 'Apollo' },
    { name: '水冰', formula: 'H₂O', percentage: 0.1, category: '极区', notes: '永久阴影区', state: '固态', importance: '关键', discoveryYear: '2009' },
    { name: '钛铁矿', formula: 'FeTiO₃', percentage: 5, category: '月海', notes: '氧和金属来源', state: '固态', importance: '重要' },
    { name: '橄榄石', formula: '(Mg,Fe)₂SiO₄', percentage: 6, category: '月幔', notes: '深部物质', state: '固态', importance: '重要' },
    { name: '辉石', formula: '(Mg,Fe,Ca)SiO₃', percentage: 8, category: '月海/月幔', notes: '玄武岩成分', state: '固态', importance: '重要' },
    { name: '斜长石', formula: 'CaAl₂Si₂O₈', percentage: 20, category: '月壳', notes: '高地主体', state: '固态', importance: '关键' },
    { name: '磷灰石', formula: 'Ca₅(PO₄)₃(F,Cl)', percentage: 0.5, category: '月壳', notes: '磷酸盐矿物', state: '固态', importance: '次要' },
    { name: '钾', formula: 'K', percentage: 0.1, category: 'KREEP', notes: 'KREEP岩特殊成分', state: '固态', importance: '次要' },
    { name: '稀土元素', formula: 'REE', percentage: 0.02, category: 'KREEP', notes: 'KREEP岩富集', state: '固态', importance: '重要' },
    { name: '氩-40', formula: '⁴⁰Ar', percentage: 0.0001, category: '外逸层', notes: '钾衰变产物', state: '气态', importance: '痕量' },
  ],
  environment: { temp: '-233~123°C', pressure: '~10⁻¹² atm', radiation: '强(无大气)', gravity: '1.62 m/s²', magneticField: '极弱(局部异常)' },
  hazards: ['极端温差', '宇宙辐射', '月尘(磨蚀性)', '微陨石', '无大气'],
  resources: ['氦-3(聚变)', '水冰', '钛铁矿', '铝', '硅', '稀土元素', 'KREEP'],
  specialFeatures: ['潮汐锁定', 'KREEP岩', '月壤氦-3', '永久阴影区水冰', '背面差异']
};

// ========== 木卫二 ==========
const EuropaMaterials: BodyMaterials = {
  name: 'Europa', nameCn: '木卫二', type: '冰卫星',
  materials: [
    { name: '水冰', formula: 'H₂O', percentage: 80, category: '冰壳', notes: '15-25km全球冰壳', state: '固态', importance: '关键' },
    { name: '液态水', formula: 'H₂O', percentage: 15, category: '地下海洋', notes: '60-150km深(地球2倍水量)', state: '液态', importance: '关键' },
    { name: '硅酸盐', formula: 'SiO₂', percentage: 4, category: '岩石核心', notes: '内部岩石体', state: '固态', importance: '重要' },
    { name: '硫酸镁', formula: 'MgSO₄', percentage: 0.5, category: '表面', notes: '表面盐类(线条)', state: '固态', importance: '重要' },
    { name: '硫酸钠', formula: 'Na₂SO₄', percentage: 0.3, category: '表面', notes: '表面盐类', state: '固态', importance: '次要' },
    { name: '氧气', formula: 'O₂', percentage: 0.01, category: '大气', notes: '辐射分解产生', state: '气态', importance: '重要' },
    { name: '氯化钠', formula: 'NaCl', percentage: 0.2, category: '海洋', notes: '地下海洋盐分', state: '溶解', importance: '重要' },
    { name: '硫化物', formula: 'S²⁻', percentage: 0.1, category: '海洋', notes: '海底热液', state: '溶解', importance: '重要' },
    { name: '铁', formula: 'Fe', percentage: 2, category: '核心', notes: '铁核', state: '固态', importance: '重要' },
    { name: '过氧化氢', formula: 'H₂O₂', percentage: 0.001, category: '表面', notes: '辐射产物', state: '固态', importance: '痕量' },
    { name: '二氧化碳', formula: 'CO₂', percentage: 0.01, category: '大气/表面', notes: '微量', state: '气态/固态', importance: '痕量' },
  ],
  environment: { temp: '-160°C(表面)', pressure: '微薄大气', radiation: '极强(木星辐射带)', gravity: '1.315 m/s²', magneticField: '感应磁场' },
  hazards: ['木星辐射(致死级)', '冰壳不稳定', '潮汐应力', '极低温'],
  resources: ['液态水(巨大海洋)', '氧气', '可能的有机物', '矿物', '潮汐能'],
  specialFeatures: ['地下海洋(最可能的生命栖息地)', '冰壳裂缝', '水蒸气喷泉', '感应磁场']
};

// ========== 土卫六 ==========
const TitanMaterials: BodyMaterials = {
  name: 'Titan', nameCn: '土卫六', type: '冰卫星',
  materials: [
    { name: '氮气', formula: 'N₂', percentage: 98.4, category: '大气', notes: '浓密氮大气(1.47atm)', state: '气态', importance: '关键' },
    { name: '甲烷', formula: 'CH₄', percentage: 1.4, category: '大气/湖泊', notes: '甲烷循环(类比水循环)', state: '气态/液态', importance: '关键' },
    { name: '乙烷', formula: 'C₂H₆', percentage: 0.1, category: '湖泊', notes: '液态碳氢化合物湖', state: '液态', importance: '重要' },
    { name: '丙烷', formula: 'C₃H₈', percentage: 0.01, category: '大气', notes: '有机化学', state: '气态', importance: '痕量' },
    { name: '乙炔', formula: 'C₂H₂', percentage: 0.001, category: '大气', notes: '光化学产物', state: '气态', importance: '痕量' },
    { name: '氰化氢', formula: 'HCN', percentage: 0.001, category: '大气', notes: '生命前体分子', state: '气态', importance: '重要' },
    { name: '水冰', formula: 'H₂O', percentage: 50, category: '冰壳', notes: '坚固冰壳', state: '固态', importance: '关键' },
    { name: '氨', formula: 'NH₃', percentage: 2, category: '内部', notes: '内部海洋?', state: '液态', importance: '重要' },
    { name: '有机物(托林)', formula: 'CₓHᵧN_z', percentage: 1, category: '表面沉积', notes: '复杂有机化学工厂', state: '固态', importance: '关键' },
    { name: '丙烯', formula: 'C₃H₆', percentage: 0.001, category: '大气', notes: '2013发现', state: '气态', importance: '痕量', discoveryYear: '2013' },
    { name: '苯', formula: 'C₆H₆', percentage: 0.0001, category: '大气', notes: '芳香族', state: '气态', importance: '痕量' },
    { name: '二氧化碳', formula: 'CO₂', percentage: 0.001, category: '大气', notes: '微量', state: '气态', importance: '痕量' },
    { name: '氰', formula: 'C₂N₂', percentage: 0.00001, category: '大气', notes: '光化学产物', state: '气态', importance: '痕量' },
    { name: '硅酸盐', formula: 'SiO₂', percentage: 5, category: '核心', notes: '岩石核心', state: '固态', importance: '重要' },
  ],
  environment: { temp: '-179°C', pressure: '1.47 atm', radiation: '弱(厚大气屏蔽)', gravity: '1.352 m/s²', magneticField: '极弱' },
  hazards: ['极低温', '有毒大气', '甲烷暴风', '液态碳氢化合物', '氰化氢'],
  resources: ['甲烷(能源)', '乙烷', '有机物(托林)', '氮气', '水冰(深层)', '氰化氢(化工)'],
  specialFeatures: ['唯一厚大气卫星', '甲烷循环(类水循环)', '碳氢湖', '托林有机化学', '地下氨水海洋?']
};

// ========== 谷神星 ==========
const CeresMaterials: BodyMaterials = {
  name: 'Ceres', nameCn: '谷神星', type: '矮行星',
  materials: [
    { name: '水冰', formula: 'H₂O', percentage: 25, category: '地壳/地下', notes: '大量水冰', state: '固态', importance: '关键' },
    { name: '硅酸盐', formula: 'SiO₂', percentage: 40, category: '岩石核心', notes: '核心成分', state: '固态', importance: '关键' },
    { name: '粘土矿物', formula: 'Mg₃Si₂O₅(OH)₄', percentage: 15, category: '表面', notes: '与水反应产物', state: '固态', importance: '重要' },
    { name: '碳酸钠', formula: 'Na₂CO₃', percentage: 5, category: '明亮斑点', notes: 'Occator坑亮点', state: '固态', importance: '关键', discoveryYear: '2015' },
    { name: '氨盐', formula: 'NH₄Cl', percentage: 2, category: '表面', notes: '外太阳系起源证据', state: '固态', importance: '重要' },
    { name: '氧化铁', formula: 'FeO', percentage: 5, category: '地壳', notes: '铁化合物', state: '固态', importance: '次要' },
    { name: '氧化铝', formula: 'Al₂O₃', percentage: 3, category: '地壳', notes: '地壳成分', state: '固态', importance: '次要' },
    { name: '氯化钠', formula: 'NaCl', percentage: 1, category: '表面', notes: '盐类沉积', state: '固态', importance: '次要' },
    { name: '碳酸氢铵', formula: 'NH₄HCO₃', percentage: 0.5, category: '表面', notes: '有机盐', state: '固态', importance: '痕量' },
    { name: '石墨', formula: 'C', percentage: 0.1, category: '表面', notes: '碳沉积', state: '固态', importance: '痕量' },
  ],
  environment: { temp: '-106°C', pressure: '微薄', radiation: '中等', gravity: '0.28 m/s²', magneticField: '无' },
  hazards: ['低温', '微弱引力', '辐射', '无大气'],
  resources: ['水冰(丰富)', '碳酸钠', '氨', '粘土矿物', '盐类'],
  specialFeatures: ['最大小行星', '亮点(Occator)', '粘土矿物(水蚀变)', '氨盐(外太阳系起源)']
};

// ========== 小行星带通用物质 ==========
export const AsteroidBeltMaterials: BodyMaterials = {
  name: 'AsteroidBelt', nameCn: '小行星带', type: '小行星群',
  materials: [
    // C型(碳质)
    { name: '硅酸盐', formula: 'SiO₂', percentage: 30, category: 'C型小行星', notes: '碳质球粒陨石', state: '固态', importance: '关键' },
    { name: '碳化合物', formula: 'C', percentage: 20, category: 'C型小行星', notes: '有机碳', state: '固态', importance: '关键' },
    { name: '水合矿物', formula: 'H₂O(化合)', percentage: 10, category: 'C型小行星', notes: '含水矿物', state: '固态', importance: '重要' },
    { name: '粘土矿物', formula: '层状硅酸盐', percentage: 8, category: 'C型小行星', notes: '蚀变产物', state: '固态', importance: '重要' },
    // S型(硅酸盐)
    { name: '橄榄石', formula: '(Mg,Fe)₂SiO₄', percentage: 15, category: 'S型小行星', notes: '铁镁硅酸盐', state: '固态', importance: '重要' },
    { name: '辉石', formula: '(Mg,Fe)SiO₃', percentage: 12, category: 'S型小行星', notes: '硅酸盐', state: '固态', importance: '重要' },
    { name: '铁镍合金', formula: 'Fe-Ni', percentage: 8, category: 'S型小行星', notes: '金属颗粒', state: '固态', importance: '重要' },
    // M型(金属)
    { name: '铁', formula: 'Fe', percentage: 80, category: 'M型小行星', notes: '金属小行星(灵神星)', state: '固态', importance: '关键' },
    { name: '镍', formula: 'Ni', percentage: 10, category: 'M型小行星', notes: '铁镍合金', state: '固态', importance: '重要' },
    { name: '钴', formula: 'Co', percentage: 0.5, category: 'M型小行星', notes: '伴生金属', state: '固态', importance: '次要' },
    { name: '铂族元素', formula: 'Pt/Ir/Os', percentage: 0.01, category: 'M型小行星', notes: '贵金属(巨大经济价值)', state: '固态', importance: '关键' },
    { name: '金', formula: 'Au', percentage: 0.005, category: 'M型小行星', notes: '贵金属', state: '固态', importance: '重要' },
    // 稀有元素
    { name: '稀土元素', formula: 'REE', percentage: 0.01, category: '各类', notes: '球粒陨石标准化', state: '固态', importance: '重要' },
    { name: '铱', formula: 'Ir', percentage: 0.001, category: 'M型小行星', notes: '白金族', state: '固态', importance: '重要' },
    { name: '水冰', formula: 'H₂O', percentage: 3, category: 'C型小行星', notes: '含水矿物/冰', state: '固态', importance: '重要' },
  ],
  environment: { temp: '-70~-120°C', pressure: '真空', radiation: '中等', gravity: '极弱(~0.01m/s²)', magneticField: '无' },
  hazards: ['微弱引力', '碰撞风险', '辐射', '无大气', '尘埃'],
  resources: ['铂族金属(万亿级)', '铁镍', '水(化合)', '稀土元素', '碳化合物', '贵金属'],
  specialFeatures: ['灵神星(纯金属)', '碳质球粒陨石(太阳系原始物质)', '含水矿物', '3:1柯克伍德空隙']
};

// ========== 彗星通用物质 ==========
export const CometMaterials: BodyMaterials = {
  name: 'Comet', nameCn: '彗星', type: '彗星',
  materials: [
    { name: '水冰', formula: 'H₂O', percentage: 40, category: '彗核', notes: '脏雪球模型主体', state: '固态', importance: '关键' },
    { name: '一氧化碳', formula: 'CO', percentage: 10, category: '彗核/彗发', notes: '超挥发性', state: '固态/气态', importance: '重要' },
    { name: '二氧化碳', formula: 'CO₂', percentage: 8, category: '彗核', notes: '挥发成分', state: '固态/气态', importance: '重要' },
    { name: '甲烷', formula: 'CH₄', percentage: 3, category: '彗核', notes: '挥发成分', state: '固态/气态', importance: '重要' },
    { name: '氨', formula: 'NH₃', percentage: 2, category: '彗核', notes: '含氮成分', state: '固态/气态', importance: '重要' },
    { name: '甲醇', formula: 'CH₃OH', percentage: 2, category: '彗核', notes: '有机物', state: '固态/气态', importance: '重要' },
    { name: '甲醛', formula: 'H₂CO', percentage: 0.5, category: '彗核', notes: '有机物', state: '固态/气态', importance: '次要' },
    { name: '硫化氢', formula: 'H₂S', percentage: 0.5, category: '彗核', notes: '含硫成分', state: '固态/气态', importance: '次要' },
    { name: '氰化氢', formula: 'HCN', percentage: 0.1, category: '彗发', notes: '生命前体', state: '气态', importance: '重要' },
    { name: '硅酸盐尘', formula: 'SiO₂', percentage: 15, category: '彗核', notes: '尘埃成分', state: '固态', importance: '重要' },
    { name: '碳化合物', formula: 'C', percentage: 5, category: '彗核', notes: '暗色表面', state: '固态', importance: '重要' },
    { name: '铁', formula: 'Fe', percentage: 2, category: '彗核', notes: '金属尘', state: '固态', importance: '次要' },
    { name: '钠', formula: 'Na', percentage: 0.01, category: '彗尾', notes: '钠尾', state: '气态', importance: '痕量' },
    { name: '乙二醇', formula: '(CH₂OH)₂', percentage: 0.01, category: '彗核', notes: '罗塞塔发现', state: '固态', importance: '痕量', discoveryYear: '2015' },
    { name: '甘氨酸', formula: 'NH₂CH₂COOH', percentage: 0.001, category: '彗发', notes: '氨基酸(生命基石!)', state: '固态', importance: '关键', discoveryYear: '2009' },
    { name: '氩', formula: 'Ar', percentage: 0.001, category: '彗发', notes: '稀有气体', state: '气态', importance: '痕量' },
    { name: '氧', formula: 'O₂', percentage: 1, category: '彗发', notes: '分子氧(罗塞塔发现)', state: '气态', importance: '重要', discoveryYear: '2015' },
  ],
  environment: { temp: '-270°C(远日)/>0°C(近日)', pressure: '真空', radiation: '近日强', gravity: '极弱', magneticField: '无' },
  hazards: ['近日高温', '喷流不稳定', '尘埃碰撞', '辐射(近日)', '碎裂风险'],
  resources: ['水冰(丰富)', '有机物', '生命前体分子', '挥发物', '甘氨酸(氨基酸)'],
  specialFeatures: ['脏雪球模型', '甘氨酸(生命基石)', '分子氧', '两条彗尾(离子+尘埃)', '奥尔特云起源']
};

// ========== 冥王星 ==========
const PlutoMaterials: BodyMaterials = {
  name: 'Pluto', nameCn: '冥王星', type: '矮行星',
  materials: [
    { name: '氮冰', formula: 'N₂', percentage: 33, category: '表面', notes: '心形平原(Sputnik Planitia)', state: '固态', importance: '关键' },
    { name: '甲烷冰', formula: 'CH₄', percentage: 20, category: '表面', notes: '红褐色区域', state: '固态', importance: '关键' },
    { name: '一氧化碳冰', formula: 'CO', percentage: 10, category: '表面', notes: '与氮冰混合', state: '固态', importance: '重要' },
    { name: '水冰', formula: 'H₂O', percentage: 25, category: '地壳', notes: '基岩层', state: '固态', importance: '关键' },
    { name: '硅酸盐', formula: 'SiO₂', percentage: 8, category: '核心', notes: '岩石核心', state: '固态', importance: '重要' },
    { name: '乙烷', formula: 'C₂H₆', percentage: 2, category: '表面', notes: '汤博区域', state: '固态', importance: '次要' },
    { name: '乙烯', formula: 'C₂H₄', percentage: 1, category: '表面', notes: '痕量有机', state: '固态', importance: '痕量' },
    { name: '乙炔', formula: 'C₂H₂', percentage: 0.5, category: '大气', notes: '极稀薄大气', state: '气态', importance: '痕量' },
    { name: '氢氰酸', formula: 'HCN', percentage: 0.3, category: '大气', notes: '光化产物', state: '气态', importance: '痕量' },
    { name: '铁', formula: 'Fe', percentage: 0.2, category: '核心', notes: '重元素', state: '固态', importance: '痕量' },
  ],
  environment: { temp: '-230°C', pressure: '~1 Pa', radiation: '低', gravity: '0.62 m/s²', magneticField: '无' },
  hazards: ['极低温', '甲烷升华风险', '真空'],
  resources: ['氮冰', '甲烷', '水冰'],
  specialFeatures: ['心形氮冰平原', '甲烷冰山', '极稀薄大气随轨道变化'],
};

// ========== 木卫一(Io) ==========
const IoMaterials: BodyMaterials = {
  name: 'Io', nameCn: '木卫一', type: '火山卫星',
  materials: [
    { name: '二氧化硅', formula: 'SiO₂', percentage: 35, category: '地壳', notes: '硅酸盐地壳', state: '固态', importance: '关键' },
    { name: '硫', formula: 'S', percentage: 25, category: '表面', notes: '火山沉积，黄色表面', state: '固态', importance: '关键' },
    { name: '二氧化硫', formula: 'SO₂', percentage: 15, category: '大气/霜', notes: '火山喷发物，霜覆盖', state: '气态/固态', importance: '关键' },
    { name: '铁', formula: 'Fe', percentage: 10, category: '核心', notes: '铁硫核心', state: '液态', importance: '重要' },
    { name: '硫化铁', formula: 'FeS', percentage: 8, category: '核心', notes: '熔融态', state: '液态', importance: '重要' },
    { name: '钠', formula: 'Na', percentage: 3, category: '大气', notes: '钠云', state: '气态', importance: '次要' },
    { name: '钾', formula: 'K', percentage: 1, category: '大气', notes: '大气成分', state: '气态', importance: '次要' },
    { name: '氯', formula: 'Cl', percentage: 2, category: '火山', notes: '火山气体', state: '气态', importance: '次要' },
    { name: '氧气', formula: 'O₂', percentage: 0.5, category: '大气', notes: '极稀薄', state: '气态', importance: '痕量' },
    { name: '三氧化硫', formula: 'SO₃', percentage: 0.5, category: '火山', notes: '火山气体', state: '气态', importance: '痕量' },
  ],
  environment: { temp: '-183°C(平均)，火山口>1600°C', pressure: '~10⁻⁶ Pa', radiation: '极强(木星磁层)', gravity: '1.80 m/s²', magneticField: '感应磁场' },
  hazards: ['强辐射', '火山喷发', '熔岩流', '硫蒸气'],
  resources: ['硫', '地热能'],
  specialFeatures: ['太阳系火山最活跃天体', '400+活火山', '潮汐加热', '钠云'],
};

// ========== 木卫三(Ganymede) ==========
const GanymedeMaterials: BodyMaterials = {
  name: 'Ganymede', nameCn: '木卫三', type: '冰卫星',
  materials: [
    { name: '水冰', formula: 'H₂O', percentage: 50, category: '地壳', notes: '冰壳主体', state: '固态', importance: '关键' },
    { name: '硅酸盐', formula: 'SiO₂', percentage: 30, category: '地幔', notes: '岩石地幔', state: '固态', importance: '关键' },
    { name: '铁', formula: 'Fe', percentage: 12, category: '核心', notes: '液态铁核(产生磁场)', state: '液态', importance: '重要' },
    { name: '硫酸镁', formula: 'MgSO₄', percentage: 5, category: '表面', notes: '亮地形成分', state: '固态', importance: '重要' },
    { name: '二氧化碳', formula: 'CO₂', percentage: 1.5, category: '表面', notes: '极地沉积', state: '固态', importance: '次要' },
    { name: '二氧化硫', formula: 'SO₂', percentage: 0.5, category: '表面', notes: '痕量', state: '固态', importance: '痕量' },
    { name: '氧气', formula: 'O₂', percentage: 0.8, category: '大气', notes: '极稀薄大气', state: '气态', importance: '次要' },
    { name: '氢', formula: 'H', percentage: 0.2, category: '大气', notes: '溅射产物', state: '气态', importance: '痕量' },
  ],
  environment: { temp: '-163°C', pressure: '~10⁻⁸ Pa', radiation: '强(木星磁层)', gravity: '1.43 m/s²', magneticField: '自有偶极磁场(唯一卫星)' },
  hazards: ['辐射', '低温', '真空'],
  resources: ['水冰', '氧气'],
  specialFeatures: ['太阳系最大卫星', '唯一拥有磁场的卫星', '地下盐水层', '亮/暗两种地形'],
};

// ========== 木卫四(Callisto) ==========
const CallistoMaterials: BodyMaterials = {
  name: 'Callisto', nameCn: '木卫四', type: '冰卫星',
  materials: [
    { name: '水冰', formula: 'H₂O', percentage: 55, category: '地壳', notes: '冰壳主体', state: '固态', importance: '关键' },
    { name: '硅酸盐', formula: 'SiO₂', percentage: 28, category: '内部', notes: '未分化的岩石/冰混合', state: '固态', importance: '关键' },
    { name: '铁', formula: 'Fe', percentage: 8, category: '核心', notes: '小型铁核', state: '固态', importance: '重要' },
    { name: '二氧化碳', formula: 'CO₂', percentage: 4, category: '表面', notes: '表面沉积', state: '固态', importance: '重要' },
    { name: '二氧化硫', formula: 'SO₂', percentage: 2, category: '表面', notes: '火山沉积', state: '固态', importance: '次要' },
    { name: '氨', formula: 'NH₃', percentage: 1.5, category: '内部', notes: '地下海洋防冻剂', state: '溶解', importance: '次要' },
    { name: '镁硅酸盐', formula: 'Mg₂SiO₄', percentage: 1, category: '地壳', notes: '暗地形', state: '固态', importance: '次要' },
    { name: '氢', formula: 'H₂', percentage: 0.5, category: '大气', notes: '极稀薄', state: '气态', importance: '痕量' },
  ],
  environment: { temp: '-139°C', pressure: '~10⁻¹¹ Pa', radiation: '强', gravity: '1.24 m/s²', magneticField: '感应磁场' },
  hazards: ['辐射', '低温', '真空'],
  resources: ['水冰', '二氧化碳'],
  specialFeatures: ['最古老的表面', '密布陨石坑', '可能的地下海洋', '未完全分化内部'],
};

// ========== 土卫二(Enceladus) ==========
const EnceladusMaterials: BodyMaterials = {
  name: 'Enceladus', nameCn: '土卫二', type: '冰卫星',
  materials: [
    { name: '水冰', formula: 'H₂O', percentage: 65, category: '地壳', notes: '洁净冰壳', state: '固态', importance: '关键' },
    { name: '水蒸气', formula: 'H₂O(g)', percentage: 8, category: '喷泉', notes: '南极间歇泉', state: '气态', importance: '关键' },
    { name: '硅酸盐', formula: 'SiO₂', percentage: 18, category: '核心', notes: '岩石核心', state: '固态', importance: '重要' },
    { name: '氯化钠', formula: 'NaCl', percentage: 3, category: '喷泉', notes: '盐水喷泉', state: '溶解', importance: '关键' },
    { name: '碳酸氢钠', formula: 'NaHCO₃', percentage: 1.5, category: '喷泉', notes: '碱性海洋', state: '溶解', importance: '重要' },
    { name: '二氧化碳', formula: 'CO₂', percentage: 2, category: '喷泉', notes: '气体喷出物', state: '气态', importance: '重要' },
    { name: '甲烷', formula: 'CH₄', percentage: 1, category: '喷泉/海洋', notes: '可能生物来源', state: '溶解', importance: '关键' },
    { name: '氨', formula: 'NH₃', percentage: 1, category: '海洋', notes: '防冻剂', state: '溶解', importance: '重要' },
    { name: '硫化氢', formula: 'H₂S', percentage: 0.3, category: '喷泉', notes: '痕量', state: '气态', importance: '次要' },
    { name: '氩-40', formula: '⁴⁰Ar', percentage: 0.2, category: '喷泉', notes: '放射性衰变产物', state: '气态', importance: '次要' },
  ],
  environment: { temp: '-198°C(表面),0~100°C(地下海洋)', pressure: '冰下海洋高压', radiation: '中等', gravity: '0.113 m/s²', magneticField: '感应磁场' },
  hazards: ['南极喷泉', '辐射', '低温表面'],
  resources: ['水', '有机分子', '地热能'],
  specialFeatures: ['南极喷泉喷射水冰粒子', '全球地下海洋', '可能存在生命', '热液喷口'],
};

// ========== 海卫一(Triton) ==========
const TritonMaterials: BodyMaterials = {
  name: 'Triton', nameCn: '海卫一', type: '冰卫星',
  materials: [
    { name: '氮冰', formula: 'N₂', percentage: 30, category: '表面', notes: '粉色/蓝色冰原', state: '固态', importance: '关键' },
    { name: '水冰', formula: 'H₂O', percentage: 35, category: '地壳', notes: '基岩层', state: '固态', importance: '关键' },
    { name: '二氧化碳冰', formula: 'CO₂', percentage: 10, category: '表面', notes: '表面沉积', state: '固态', importance: '重要' },
    { name: '甲烷冰', formula: 'CH₄', percentage: 8, category: '表面', notes: '有机冰', state: '固态', importance: '重要' },
    { name: '一氧化碳冰', formula: 'CO', percentage: 5, category: '表面', notes: '与氮冰混合', state: '固态', importance: '重要' },
    { name: '硅酸盐', formula: 'SiO₂', percentage: 8, category: '核心', notes: '岩石核心', state: '固态', importance: '次要' },
    { name: '氮气', formula: 'N₂(g)', percentage: 2, category: '大气', notes: '稀薄大气', state: '气态', importance: '重要' },
    { name: '甲烷气', formula: 'CH₄(g)', percentage: 1, category: '大气', notes: '大气成分', state: '气态', importance: '次要' },
    { name: '乙烷', formula: 'C₂H₆', percentage: 0.5, category: '表面', notes: '光化产物', state: '固态', importance: '痕量' },
    { name: '乙烯', formula: 'C₂H₄', percentage: 0.5, category: '表面', notes: '光化产物', state: '固态', importance: '痕量' },
  ],
  environment: { temp: '-235°C', pressure: '~1.4 Pa', radiation: '低', gravity: '0.78 m/s²', magneticField: '无' },
  hazards: ['极低温', '氮气间歇泉', '逆行轨道不稳定'],
  resources: ['氮冰', '甲烷', '水冰'],
  specialFeatures: ['逆行轨道(被俘获)', '氮气间歇泉', '哈密瓜地形', '最冷天体之一'],
};

// ========== 冥卫一(Charon) ==========
const CharonMaterials: BodyMaterials = {
  name: 'Charon', nameCn: '冥卫一', type: '冰卫星',
  materials: [
    { name: '水冰', formula: 'H₂O', percentage: 55, category: '地壳', notes: '冰壳主体', state: '固态', importance: '关键' },
    { name: '氨冰', formula: 'NH₃', percentage: 5, category: '表面', notes: '结晶氨', state: '固态', importance: '重要' },
    { name: '硅酸盐', formula: 'SiO₂', percentage: 30, category: '核心', notes: '岩石核心', state: '固态', importance: '重要' },
    { name: '甲烷', formula: 'CH₄', percentage: 3, category: '极区', notes: 'Mordor Macula暗红极冠', state: '固态', importance: '重要' },
    { name: '氮', formula: 'N₂', percentage: 2, category: '表面', notes: '少量', state: '固态', importance: '次要' },
    { name: '一氧化碳', formula: 'CO', percentage: 2, category: '表面', notes: '少量', state: '固态', importance: '次要' },
    { name: '氢氰酸', formula: 'HCN', percentage: 1, category: '极区', notes: '暗红色有机物前体', state: '固态', importance: '次要' },
    { name: '铁', formula: 'Fe', percentage: 2, category: '核心', notes: '重元素', state: '固态', importance: '痕量' },
  ],
  environment: { temp: '-220°C', pressure: '~0', radiation: '低', gravity: '0.29 m/s²', magneticField: '无' },
  hazards: ['极低温', '真空'],
  resources: ['水冰', '氨'],
  specialFeatures: ['双星系统(与冥王星互绕)', 'Mordor暗红极冠', '峡谷与山脊'],
};

// ========== 阋神星(Eris) ==========
const ErisMaterials: BodyMaterials = {
  name: 'Eris', nameCn: '阋神星', type: '矮行星',
  materials: [
    { name: '氮冰', formula: 'N₂', percentage: 25, category: '表面', notes: '极亮表面(反照率0.96)', state: '固态', importance: '关键' },
    { name: '甲烷冰', formula: 'CH₄', percentage: 30, category: '表面', notes: '甲烷霜', state: '固态', importance: '关键' },
    { name: '水冰', formula: 'H₂O', percentage: 30, category: '地壳', notes: '基岩', state: '固态', importance: '关键' },
    { name: '硅酸盐', formula: 'SiO₂', percentage: 10, category: '核心', notes: '岩石核心', state: '固态', importance: '重要' },
    { name: '乙烷', formula: 'C₂H₆', percentage: 3, category: '表面', notes: '光化产物', state: '固态', importance: '次要' },
    { name: '一氧化碳', formula: 'CO', percentage: 1.5, category: '表面', notes: '痕量', state: '固态', importance: '痕量' },
    { name: '铁', formula: 'Fe', percentage: 0.5, category: '核心', notes: '重元素', state: '固态', importance: '痕量' },
  ],
  environment: { temp: '-243°C', pressure: '~0', radiation: '极低', gravity: '0.82 m/s²', magneticField: '未知' },
  hazards: ['极低温', '真空'],
  resources: ['甲烷', '氮冰', '水冰'],
  specialFeatures: ['比冥王星更重', '极高反照率', '离散盘天体'],
};

// ========== 鸟神星(Makemake) ==========
const MakemakeMaterials: BodyMaterials = {
  name: 'Makemake', nameCn: '鸟神星', type: '矮行星',
  materials: [
    { name: '甲烷冰', formula: 'CH₄', percentage: 35, category: '表面', notes: '主要表面成分', state: '固态', importance: '关键' },
    { name: '氮冰', formula: 'N₂', percentage: 15, category: '表面', notes: '含量比冥王星少', state: '固态', importance: '重要' },
    { name: '水冰', formula: 'H₂O', percentage: 35, category: '地壳', notes: '基岩', state: '固态', importance: '关键' },
    { name: '乙烷', formula: 'C₂H₆', percentage: 8, category: '表面', notes: '甲烷光化产物', state: '固态', importance: '重要' },
    { name: '乙烯', formula: 'C₂H₄', percentage: 3, category: '表面', notes: '光化产物', state: '固态', importance: '次要' },
    { name: '乙炔', formula: 'C₂H₂', percentage: 2, category: '表面', notes: '光化产物', state: '固态', importance: '次要' },
    { name: '硅酸盐', formula: 'SiO₂', percentage: 2, category: '核心', notes: '岩石核心', state: '固态', importance: '次要' },
  ],
  environment: { temp: '-239°C', pressure: '~0', radiation: '极低', gravity: '~0.5 m/s²', magneticField: '未知' },
  hazards: ['极低温', '真空'],
  resources: ['甲烷', '乙烷', '水冰'],
  specialFeatures: ['柯伊伯带第二亮天体', '甲烷主导表面', '无明显大气'],
};

// ========== 妊神星(Haumea) ==========
const HaumeaMaterials: BodyMaterials = {
  name: 'Haumea', nameCn: '妊神星', type: '矮行星',
  materials: [
    { name: '水冰', formula: 'H₂O', percentage: 70, category: '表面', notes: '几乎纯冰表面(反照率0.8)', state: '固态', importance: '关键' },
    { name: '硅酸盐', formula: 'SiO₂', percentage: 15, category: '内部', notes: '岩石核心', state: '固态', importance: '重要' },
    { name: '铁', formula: 'Fe', percentage: 5, category: '核心', notes: '重元素核心', state: '固态', importance: '重要' },
    { name: '碳酸钠', formula: 'Na₂CO₃', percentage: 3, category: '表面', notes: '罕见成分', state: '固态', importance: '次要' },
    { name: '氰化氢', formula: 'HCN', percentage: 2, category: '表面', notes: '有机分子', state: '固态', importance: '次要' },
    { name: '甲烷冰', formula: 'CH₄', percentage: 3, category: '局部', notes: '少量', state: '固态', importance: '次要' },
    { name: '氨冰', formula: 'NH₃', percentage: 2, category: '局部', notes: '少量', state: '固态', importance: '痕量' },
  ],
  environment: { temp: '-241°C', pressure: '~0', radiation: '极低', gravity: '~0.44 m/s²', magneticField: '未知' },
  hazards: ['极低温', '高速自转(4h)', '真空'],
  resources: ['水冰'],
  specialFeatures: ['椭球形(快速自转)', '拥有环系统', '两颗卫星', '碰撞家族'],
};

// ========== 汇总导出 ==========
export const SOLAR_SYSTEM_MATERIALS: Record<string, BodyMaterials> = {
  Sun: SunMaterials,
  Mercury: MercuryMaterials,
  Venus: VenusMaterials,
  Earth: EarthMaterials,
  Mars: MarsMaterials,
  Jupiter: JupiterMaterials,
  Saturn: SaturnMaterials,
  Uranus: UranusMaterials,
  Neptune: NeptuneMaterials,
  Moon: MoonMaterials,
  Io: IoMaterials,
  Europa: EuropaMaterials,
  Ganymede: GanymedeMaterials,
  Callisto: CallistoMaterials,
  Enceladus: EnceladusMaterials,
  Titan: TitanMaterials,
  Triton: TritonMaterials,
  Charon: CharonMaterials,
  Ceres: CeresMaterials,
  Pluto: PlutoMaterials,
  Eris: ErisMaterials,
  Makemake: MakemakeMaterials,
  Haumea: HaumeaMaterials,
  AsteroidBelt: AsteroidBeltMaterials,
  Comet: CometMaterials,
};

// 所有物质类别
export const MATERIAL_CATEGORIES = [
  '大气', '云层', '地壳', '地幔', '核心', '海洋', '冰壳', '冰幔',
  '地下海洋', '极区', '月壳', '月海', '月壤', '月幔',
  '环系统', '彗核', '彗发', '彗尾', '表面', '沉积层',
  '外逸层', '深层', '喷泉', 'KREEP', '整体', '内部',
  'C型小行星', 'S型小行星', 'M型小行星', '各类',
] as const;

// 关键物质(各天体最重要的物质)
export const KEY_MATERIALS = [
  { name: '水', formula: 'H₂O', why: '生命之源, 工业必需' },
  { name: '氦-3', formula: '³He', why: '清洁聚变燃料' },
  { name: '铁', formula: 'Fe', why: '建筑/工业基础金属' },
  { name: '硅酸盐', formula: 'SiO₂', why: '建材/电子/玻璃' },
  { name: '甲烷', formula: 'CH₄', why: '能源/化工原料' },
  { name: '氢', formula: 'H₂', why: '聚变/火箭推进/化工' },
  { name: '铂族元素', formula: 'Pt/Ir/Os', why: '催化剂/电子/万亿级经济价值' },
  { name: '稀土元素', formula: 'REE', why: '电子/磁体/国防' },
  { name: '甘氨酸', formula: 'NH₂CH₂COOH', why: '氨基酸-生命基石' },
  { name: '金属氢', formula: 'H(金属)', why: '超导/超强材料/能源' },
  { name: '钛铁矿', formula: 'FeTiO₃', why: '氧/钛/铁来源' },
  { name: '碳酸钠', formula: 'Na₂CO₃', why: '化工/玻璃原料' },
] as const;
