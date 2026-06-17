/**
 * SkyGIS 全数据集 - 从 skygis-data.json 导入的完整数据
 * 包含: 8大物理力引擎 + 8大坐标系 + 太阳系数据 + 宇宙数据库(19大分类17980条)
 */

// ===== 8大物理力引擎 =====
export interface ForceEngine {
  id: string;
  name: string;
  formula: string;
  description: string;
  constant: string;
  applications: string[];
}

export const FORCE_ENGINES: ForceEngine[] = [
  {
    id: "gravity",
    name: "万有引力引擎",
    formula: "F=Gm₁m₂/r²",
    description: "任意物体间的吸引力，是宇宙中最基本的力之一，决定了天体运动和宇宙大尺度结构",
    constant: "G=6.674×10⁻¹¹ N·m²/kg²",
    applications: ["行星轨道计算", "卫星运动预测", "潮汐现象分析", "天体质量测定", "引力透镜效应", "宇宙膨胀减速因子"]
  },
  {
    id: "electromagnetic",
    name: "电磁力引擎",
    formula: "F=kq₁q₂/r²",
    description: "带电粒子间的相互作用力，支配原子和分子的结合，是化学和生命的基础",
    constant: "k=8.988×10⁹ N·m²/C²",
    applications: ["电磁辐射谱分析", "粒子加速器设计", "光谱学观测", "等离子体约束", "无线电通信", "磁场探测"]
  },
  {
    id: "strongNuclear",
    name: "强核力引擎",
    formula: "强相互作用，势能V(r)=-4αs/3r + kr",
    description: "夸克与核子之间的束缚力，是自然界最强的力，将质子和中子束缚在原子核内",
    constant: "αs≈1 (跑动耦合常数，能量依赖)",
    applications: ["核聚变反应", "核裂变能量", "恒星内部核燃烧", "元素合成(核合成)", "中子星物质", "夸克胶子等离子体"]
  },
  {
    id: "weakNuclear",
    name: "弱核力引擎",
    formula: "G_F=1.166×10⁻⁵ GeV⁻²",
    description: "引起放射性衰变的力，负责β衰变和中微子产生，是恒星核反应链的关键步骤",
    constant: "G_F=1.166×10⁻⁵ GeV⁻² (费米常数)",
    applications: ["β衰变", "中微子产生与探测", "太阳pp链反应", "超新星中微子暴", "碳-14年代测定", "宇称不守恒"]
  },
  {
    id: "inertial",
    name: "惯性力引擎",
    formula: "F=-ma",
    description: "非惯性参考系中出现的虚拟力，用于描述加速运动系统中的力学现象",
    constant: "无基本常数(取决于参考系加速度)",
    applications: ["火箭推进加速度", "航天员训练离心机", "轨道机动计算", "引力辅助弹弓", "拉格朗日点分析", "太空电梯设计"]
  },
  {
    id: "centrifugal",
    name: "离心力引擎",
    formula: "F=mω²r",
    description: "旋转参考系中的惯性力，是离心分离和旋转稳定的基础",
    constant: "ω (角速度，取决于旋转系统)",
    applications: ["离心分离器", "行星自转形变", "旋转空间站人工重力", "土星环结构", "木星大红斑涡旋", "吸积盘动力学"]
  },
  {
    id: "coriolis",
    name: "科里奥利力引擎",
    formula: "F=2mv×ω",
    description: "旋转参考系中运动物体受到的偏转力，是大气环流和洋流偏转的根本原因",
    constant: "ω=7.292×10⁻⁵ rad/s (地球自转角速度)",
    applications: ["季风循环", "飓风旋向", "洋流偏转", "炮弹弹道修正", "傅科摆", "行星大气环流"]
  },
  {
    id: "tidal",
    name: "潮汐力引擎",
    formula: "ΔF=2GMmR/r³",
    description: "引力梯度效应产生的差分力，塑造了天体从地月系统到星系团的诸多现象",
    constant: "GM (取决于引力源质量)",
    applications: ["海洋潮汐", "潮汐加热(木卫火山活动)", "洛希极限与环系统", "潮汐锁定(月球同步自转)", "潮汐瓦解事件", "近距双星演化"]
  }
];

// ===== 8大坐标系 =====
export interface CoordinateSystem {
  id: string;
  name: string;
  center: string;
  reference: string;
  applications: string[];
  description: string;
}

export const COORDINATE_SYSTEMS: CoordinateSystem[] = [
  {
    id: "ucs",
    name: "全宇宙坐标系",
    center: "宇宙中心(CMB偶极子零点)",
    reference: "CMB各向同性面+地球定位方向",
    applications: ["宇宙大尺度结构", "全宇宙坐标统一", "跨星系团定位", "宇宙演化研究", "地外文明坐标交换"],
    description: "SkyGIS独创全宇宙坐标系(UCS)。以宇宙微波背景辐射(CMB)偶极子零点为原点，即宇宙的'绝对静止'参考系。以地球为定位点确定坐标轴方向，所有其他8种坐标系均可通过统一的7参数变换公式与UCS互转。单位: 百万秒差距(Mpc)。地球在UCS中的坐标约为(-0.0080, 8.1797, 0.0089) Mpc。"
  },
  {
    id: "geocentric",
    name: "地心坐标系",
    center: "地球中心",
    reference: "地球赤道面",
    applications: ["卫星轨道计算", "GPS定位", "地月系动力学", "航天器再入轨迹"],
    description: "以地球质心为原点，赤道面为参考平面。GPS系统使用WGS-84地心坐标系，是近地空间活动的基础参考系。"
  },
  {
    id: "heliocentric",
    name: "日心坐标系",
    center: "太阳中心",
    reference: "黄道面",
    applications: ["行星轨道", "小行星追踪", "彗星轨道", "行星际航行"],
    description: "以太阳质心为原点，黄道面为参考平面。哥白尼革命的产物，是行星际任务设计的标准参考系。"
  },
  {
    id: "galactocentric",
    name: "银心坐标系",
    center: "银河系中心(人马座A*)",
    reference: "银道面",
    applications: ["恒星运动", "银河系结构", "暗物质分布", "星流追踪"],
    description: "以银河系中心超大质量黑洞为原点，用于研究银河系大尺度结构和恒星动力学。"
  },
  {
    id: "equatorial",
    name: "赤道坐标系",
    center: "地心",
    reference: "天赤道",
    applications: ["天文观测", "星表编制", "望远镜指向", "卫星跟踪"],
    description: "以天赤道为基本圈，赤经α和赤纬δ定位天体。IAU定义的ICRS是其现代精确定义，J2000.0历元为标准。"
  },
  {
    id: "ecliptic",
    name: "黄道坐标系",
    center: "日心",
    reference: "黄道面",
    applications: ["行星运动", "日月食计算", "黄道带天体", "季节变化"],
    description: "以黄道面(地球公转轨道面)为基本圈，黄经λ和黄纬β定位天体。行星轨道计算和日月食预报的核心坐标系。"
  },
  {
    id: "galactic",
    name: "银道坐标系",
    center: "日心",
    reference: "银道面",
    applications: ["银河天体分布", "星云定位", "旋臂结构", "银河系射电源"],
    description: "以银道面为基本圈，银经l和银纬b定位天体。银河系中心方向定义为银经0°，是研究银河系内天体分布的标准坐标系。"
  },
  {
    id: "horizontal",
    name: "地平坐标系",
    center: "观测者位置",
    reference: "地平线",
    applications: ["天文观测", "卫星过境", "日出日落计算", "建筑遮挡分析"],
    description: "以观测者当地地平线为基本圈，方位角A和高度角h定位天体。随时间和地点变化，是最直观的观测坐标系。"
  },
  {
    id: "supergalactic",
    name: "超星系坐标系",
    center: "本超星系团中心",
    reference: "超星系平面",
    applications: ["宇宙大尺度结构", "星系团分布", "宇宙空洞", "暗物质大尺度分布"],
    description: "以本超星系团平面为基本圈，用于描述宇宙最大尺度结构。室女座超星系团是本星系群所属的超星系团。"
  }
];

// ===== 太阳系数据 =====
export interface SolarSystemStar {
  name: string;
  mass: string;
  radius: string;
  spectralType: string;
  surfaceTemp: string;
  luminosity: string;
  age: string;
}

export interface SolarSystemPlanet {
  name: string;
  orbit: string;
  mass: string;
  radius: string;
  gravity: string;
  escapeVelocity: string;
  dayLength: string;
  yearLength: string;
  moons: number;
  atmosphere: string;
  temperature: string;
  features: string;
  type: string;
}

export const SOLAR_STAR: SolarSystemStar = {
  name: "太阳",
  mass: "1.989×10³⁰ kg",
  radius: "696,340 km",
  spectralType: "G2V",
  surfaceTemp: "5,778 K (表面) / 1,570万K (核心)",
  luminosity: "3.828×10²⁶ W",
  age: "45.7亿年"
};

export const SOLAR_PLANETS: SolarSystemPlanet[] = [
  {
    name: "水星", orbit: "0.387 AU", mass: "3.301×10²³ kg", radius: "2,439.7 km",
    gravity: "3.7 m/s²", escapeVelocity: "4.25 km/s", dayLength: "58.6天",
    yearLength: "87.97天", moons: 0, atmosphere: "几乎无(微量Na,K)",
    temperature: "-173~427°C", features: "卡洛里盆地、迪斯卡弗里平原", type: "terrestrial"
  },
  {
    name: "金星", orbit: "0.723 AU", mass: "4.867×10²⁴ kg", radius: "6,051.8 km",
    gravity: "8.87 m/s²", escapeVelocity: "10.36 km/s", dayLength: "243天(逆行)",
    yearLength: "224.7天", moons: 0, atmosphere: "CO₂ 96.5%, N₂ 3.5%",
    temperature: "462°C(表面均温)", features: "马克斯韦尔山、阿芙罗狄蒂高地、伊什塔尔高地", type: "terrestrial"
  },
  {
    name: "地球", orbit: "1.0 AU", mass: "5.972×10²⁴ kg", radius: "6,371 km",
    gravity: "9.81 m/s²", escapeVelocity: "11.19 km/s", dayLength: "23h56m4s",
    yearLength: "365.25天", moons: 1, atmosphere: "N₂ 78%, O₂ 21%, Ar 0.9%",
    temperature: "15°C(全球均温)", features: "太平洋、喜马拉雅山、马里亚纳海沟、撒哈拉沙漠", type: "terrestrial"
  },
  {
    name: "火星", orbit: "1.524 AU", mass: "6.417×10²³ kg", radius: "3,389.5 km",
    gravity: "3.72 m/s²", escapeVelocity: "5.03 km/s", dayLength: "24h37m",
    yearLength: "687天", moons: 2, atmosphere: "CO₂ 95.3%, N₂ 2.7%",
    temperature: "-63°C(均温)", features: "奥林匹斯山(21.9km)、水手号峡谷、极冠冰盖", type: "terrestrial"
  },
  {
    name: "木星", orbit: "5.203 AU", mass: "1.898×10²⁷ kg", radius: "69,911 km",
    gravity: "24.79 m/s²", escapeVelocity: "59.5 km/s", dayLength: "9h56m",
    yearLength: "11.86年", moons: 95, atmosphere: "H₂ 89.8%, He 10.2%",
    temperature: "-108°C(云顶)", features: "大红斑、木星环、伽利略卫星群", type: "gas_giant"
  },
  {
    name: "土星", orbit: "9.537 AU", mass: "5.683×10²⁶ kg", radius: "58,232 km",
    gravity: "10.44 m/s²", escapeVelocity: "35.5 km/s", dayLength: "10h42m",
    yearLength: "29.46年", moons: 146, atmosphere: "H₂ 96.3%, He 3.25%",
    temperature: "-139°C(云顶)", features: "壮丽环系统、六边形风暴、泰坦卫星", type: "gas_giant"
  },
  {
    name: "天王星", orbit: "19.19 AU", mass: "8.681×10²⁵ kg", radius: "25,362 km",
    gravity: "8.69 m/s²", escapeVelocity: "21.3 km/s", dayLength: "17h14m(逆行)",
    yearLength: "84.01年", moons: 27, atmosphere: "H₂ 82.5%, He 15.2%, CH₄ 2.3%",
    temperature: "-197°C(云顶)", features: "97.8°轴倾斜、暗淡环系统、米兰达悬崖", type: "ice_giant"
  },
  {
    name: "海王星", orbit: "30.07 AU", mass: "1.024×10²⁶ kg", radius: "24,622 km",
    gravity: "11.15 m/s²", escapeVelocity: "23.5 km/s", dayLength: "16h6m",
    yearLength: "164.8年", moons: 16, atmosphere: "H₂ 80%, He 19%, CH₄ 1.5%",
    temperature: "-201°C(云顶)", features: "大暗斑、最快风速(2100km/h)、海卫一逆行轨道", type: "ice_giant"
  }
];

export const SOLAR_DWARF_PLANETS = [
  { name: "冥王星", orbit: "39.48 AU", mass: "1.303×10²² kg", type: "柯伊伯带" },
  { name: "谷神星", orbit: "2.77 AU", mass: "9.393×10²⁰ kg", type: "小行星带" },
  { name: "阋神星", orbit: "67.78 AU", mass: "1.66×10²² kg", type: "离散盘" },
  { name: "妊神星", orbit: "43.13 AU", mass: "4.006×10²¹ kg", type: "柯伊伯带" },
  { name: "鸟神星", orbit: "45.79 AU", mass: "~3×10²¹ kg", type: "柯伊伯带" }
];

export const SOLAR_MAJOR_MOONS = [
  { name: "月球", parent: "地球", radius: "1,737.4 km", features: "潮汐锁定，近侧平坦月海，远侧崎岖高地" },
  { name: "木卫一(Io)", parent: "木星", radius: "1,821.6 km", features: "太阳系最强火山活动，潮汐加热驱动，400+活火山" },
  { name: "木卫二(Europa)", parent: "木星", radius: "1,560.8 km", features: "冰壳下液态水海洋，地外生命候选地，冰下60-150km深海洋" },
  { name: "木卫三(Ganymede)", parent: "木星", radius: "2,634.1 km", features: "太阳系最大卫星，自身磁场，冰壳下可能含盐海洋" },
  { name: "木卫四(Callisto)", parent: "木星", radius: "2,410.3 km", features: "最古老表面，密集陨石坑，内部可能含地下海洋" },
  { name: "土卫六(Titan)", parent: "土星", radius: "2,574.7 km", features: "唯一浓密大气卫星，液态甲烷/乙烷湖泊河流，类地球天气系统" },
  { name: "天卫三(Titania)", parent: "天王星", radius: "788.4 km", features: "天王星最大卫星，冰与岩石混合体，密集撞击坑" },
  { name: "海卫一(Triton)", parent: "海王星", radius: "1,353.4 km", features: "逆行轨道(被捕获)，氮冰间歇泉，可能来自柯伊伯带" }
];

// ===== 宇宙数据库(19大分类17980条) =====
export interface CosmicDatabaseCategory {
  id: string;
  name: string;
  nameEn: string;
  count: number;
  description: string;
  keySubstances: string[];
  searchKeywords: string[];
}

export const COSMIC_DATABASE_CATEGORIES: CosmicDatabaseCategory[] = [
  {
    id: "elements", name: "化学元素", nameEn: "Chemical Elements", count: 118,
    description: "宇宙中全部118种已知化学元素，从氢(H)到Og，涵盖原子序数、原子量、电子构型、宇宙丰度、同位素等信息",
    keySubstances: ["氢(H)", "氦(He)", "碳(C)", "氧(O)", "铁(Fe)", "金(Au)", "铀(U)", "钚(Pu)"],
    searchKeywords: ["元素", "原子", "原子序数", "周期表", "element", "atomic", "化学元素", "原子量", "电子构型", "宇宙丰度"]
  },
  {
    id: "molecules", name: "星际分子", nameEn: "Interstellar Molecules", count: 61,
    description: "在星际空间和行星大气中检测到的61种分子，从简单的H₂到复杂的氨基酸前体，是生命起源研究的关键",
    keySubstances: ["H₂", "H₂O", "CO₂", "CH₄", "NH₃", "CH₃OH(甲醇)", "HCN(氰化氢)", "C₂H₂(乙炔)"],
    searchKeywords: ["分子", "星际分子", "化合", "molecule", "interstellar", "化学键", "有机分子", "前生命化学"]
  },
  {
    id: "isotopes", name: "同位素", nameEn: "Isotopes", count: 81,
    description: "81种重要同位素，涵盖稳定同位素和放射性同位素，用于年代测定、示踪和核物理研究",
    keySubstances: ["碳-14", "氧-18", "氘(D)", "氚(T)", "铀-235", "铀-238", "铁-56", "铅-206"],
    searchKeywords: ["同位素", "放射性", "衰变", "半衰期", "isotope", "radioactive", "碳14测年", "核素"]
  },
  {
    id: "dust", name: "宇宙尘埃", nameEn: "Cosmic Dust", count: 1100,
    description: "1100种宇宙尘埃颗粒，从星际尘到行星际尘，是恒星形成和行星诞生的原材料",
    keySubstances: ["硅酸盐尘", "碳尘", "铁尘", "冰尘", "多环芳烃(PAH)", "刚玉颗粒", "尖晶石", "金刚石尘"],
    searchKeywords: ["尘埃", "粉尘", "dust", "星际尘埃", "颗粒", "宇宙尘", "行星际尘", "星周尘"]
  },
  {
    id: "cosmicRay", name: "宇宙射线", nameEn: "Cosmic Rays", count: 1050,
    description: "1050种宇宙射线粒子事件，从低能太阳风到超高能GZK截断，是高能天体物理的窗口",
    keySubstances: ["质子射线", "α粒子", "铁核", "μ子", "中微子", "Oh-My-God粒子", "二次宇宙线", "太阳高能粒子"],
    searchKeywords: ["宇宙线", "射线", "辐射", "高能粒子", "cosmic ray", "GCR", "SCR", "粒子加速"]
  },
  {
    id: "darkMatter", name: "暗物质", nameEn: "Dark Matter", count: 1080,
    description: "1080种暗物质候选者和观测效应，占宇宙质量-能量的27%，仍是物理学最大谜题之一",
    keySubstances: ["WIMP", "轴子(axion)", "惰性中微子", "大质量致密晕天体(MACHO)", "超对称粒子", "暗光子", "引力透镜信号", "旋转曲线偏差"],
    searchKeywords: ["暗物质", "dark matter", "WIMP", "缺失质量", "旋转曲线", "引力透镜", "暗物质晕", "冷暗物质"]
  },
  {
    id: "plasma", name: "等离子体", nameEn: "Plasma", count: 960,
    description: "960种等离子体状态和现象，宇宙中99%可见物质以等离子态存在，从恒星内部到星系际介质",
    keySubstances: ["太阳风等离子体", "日冕等离子体", "吸积盘等离子体", "星际介质等离子体", "磁重联等离子体", "极光等离子体", "聚变等离子体", "尘埃等离子体"],
    searchKeywords: ["等离子体", "等离子", "plasma", "电离", "磁流体", "MHD", "等离子体波", "朗缪尔波"]
  },
  {
    id: "radiation", name: "辐射场", nameEn: "Radiation Fields", count: 1020,
    description: "1020种辐射场环境，从宇宙微波背景到伽马射线暴，是太空环境评估和防护设计的基础",
    keySubstances: ["宇宙微波背景(CMB)", "太阳紫外辐射", "范艾伦辐射带", "伽马射线暴", "X射线背景", "同步辐射", "热辐射", "切伦科夫辐射"],
    searchKeywords: ["辐射", "radiation", "电磁辐射", "电离辐射", "剂量", "拉德", "希沃特", "辐射防护"]
  },
  {
    id: "magnetic", name: "磁场环境", nameEn: "Magnetic Fields", count: 900,
    description: "900种宇宙磁场环境和效应，从行星磁层到星系磁场，决定了带电粒子的运动轨迹",
    keySubstances: ["地球磁场", "木星磁场", "太阳磁场", "星际磁场", "脉冲星磁场", "磁层顶", "磁尾", "磁重联区"],
    searchKeywords: ["磁场", "magnetic", "磁层", "磁暴", "磁极", "磁力线", "偶极磁场", "磁流体力学"]
  },
  {
    id: "intermediate", name: "中间态物质", nameEn: "Intermediate States", count: 960,
    description: "960种中间态和临界态物质，在相变边界上，展现出独特的量子效应",
    keySubstances: ["超导体", "超流体", "玻色-爱因斯坦凝聚态", "简并态物质", "量子临界态", "拓扑态", "夸克胶子等离子体", "中子简并态"],
    searchKeywords: ["中间态", "超导", "超流", "凝聚态", "相变", "简并态", "量子态", "超相"]
  },
  {
    id: "celestial", name: "天体物质", nameEn: "Celestial Materials", count: 2010,
    description: "2010种天体特有物质和结构，从陨石矿物到中子星物质，是行星科学和天体物理的核心数据",
    keySubstances: ["陨铁(铁镍合金)", "月壤", "火星壤", "小行星矿物", "彗星冰尘", "中子星物质", "白矮星物质", "星际金刚石"],
    searchKeywords: ["天体物质", "陨石", "月壤", "celestial", "矿物", "岩石", "冰", "天体化学"]
  },
  {
    id: "organic", name: "有机物质", nameEn: "Organic Substances", count: 1880,
    description: "1880种宇宙有机物质，从星际多环芳烃到可能的氨基酸，是地外生命搜索的焦点",
    keySubstances: ["多环芳烃(PAH)", "甲醇", "甲醛", "甲胺", "甘氨酸(氨基酸)", "核糖", "嘌呤碱基", "磷化氢"],
    searchKeywords: ["有机", "organic", "氨基酸", "生命前体", "碳化合物", "手性", "前生物化学", "生物标志物"]
  },
  {
    id: "inorganic", name: "无机物质", nameEn: "Inorganic Substances", count: 1100,
    description: "1100种宇宙无机物质，从硅酸盐矿物到金属氧化物，构成了行星和卫星的固体主体",
    keySubstances: ["橄榄石(Mg₂SiO₄)", "辉石", "长石", "磁铁矿(Fe₃O₄)", "钛铁矿", "水冰", "干冰(CO₂)", "氨冰"],
    searchKeywords: ["无机", "inorganic", "矿物", "硅酸盐", "氧化物", "硫化物", "卤化物", "碳酸盐"]
  },
  {
    id: "particle", name: "基本粒子", nameEn: "Fundamental Particles", count: 1200,
    description: "1200种基本粒子和复合粒子，从夸克到介子，是粒子物理标准模型和超出标准模型的领域",
    keySubstances: ["上夸克", "下夸克", "电子", "μ子", "τ子", "W/Z玻色子", "胶子", "希格斯玻色子"],
    searchKeywords: ["粒子", "particle", "夸克", "轻子", "玻色子", "费米子", "强子", "标准模型"]
  },
  {
    id: "energy", name: "能量形态", nameEn: "Energy Forms", count: 1160,
    description: "1160种能量形态和转换，从真空能到化学能，是理解宇宙动力学和工程应用的基础",
    keySubstances: ["真空能", "暗能量", "引力势能", "核聚变能", "化学能", "动能", "辐射能", "热能"],
    searchKeywords: ["能量", "energy", "功", "功率", "守恒", "转换", "热力学", "自由能"]
  },
  {
    id: "wave", name: "波动现象", nameEn: "Wave Phenomena", count: 1050,
    description: "1050种波动现象，从引力波到电磁波，是现代天文学多信使观测的核心",
    keySubstances: ["引力波", "电磁波", "声波(日震学)", "等离子体波", "阿尔芬波", "冲击波", "驻波", "潮汐波"],
    searchKeywords: ["波", "wave", "频率", "波长", "振幅", "干涉", "衍射", "共振"]
  },
  {
    id: "state", name: "物质状态", nameEn: "States of Matter", count: 1080,
    description: "1080种物质状态和相变，从固态到夸克-胶子等离子体，是热力学和凝聚态物理的核心",
    keySubstances: ["固态", "液态", "气态", "等离子态", "超固态", "简并态", "超流态", "玻色-爱因斯坦凝聚态"],
    searchKeywords: ["物态", "state", "相", "相变", "临界点", "三相点", "熔化", "凝固"]
  },
  {
    id: "phenomenon", name: "宇宙现象", nameEn: "Cosmic Phenomena", count: 1170,
    description: "1170种宇宙现象和事件，从超新星爆发到伽马射线暴，是天文学最活跃的研究领域",
    keySubstances: ["超新星爆发", "伽马射线暴", "潮汐瓦解事件", "快速射电暴(FRB)", "引力透镜", "吸积盘振荡", "磁星耀发", "引力波事件"],
    searchKeywords: ["现象", "phenomenon", "事件", "爆发", "暴", "瞬变", "变星", "天体物理"]
  }
];

// ===== 查询接口 =====

/** 搜索力引擎 */
export function searchForceEngine(query: string): ForceEngine[] {
  const q = query.toLowerCase();
  return FORCE_ENGINES.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.id.includes(q) ||
    e.description.includes(query) ||
    e.formula.toLowerCase().includes(q) ||
    e.applications.some(a => a.includes(query))
  );
}

/** 搜索坐标系 */
export function searchCoordinateSystem(query: string): CoordinateSystem[] {
  const q = query.toLowerCase();
  return COORDINATE_SYSTEMS.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.id.includes(q) ||
    c.center.includes(query) ||
    c.reference.includes(query) ||
    c.applications.some(a => a.includes(query)) ||
    c.description.includes(query)
  );
}

/** 搜索宇宙数据库分类 */
export function searchCosmicCategory(query: string): CosmicDatabaseCategory[] {
  const q = query.toLowerCase();
  return COSMIC_DATABASE_CATEGORIES.filter(c =>
    c.name.includes(query) ||
    c.nameEn.toLowerCase().includes(q) ||
    c.description.includes(query) ||
    c.searchKeywords.some(k => k.toLowerCase().includes(q) || query.includes(k.toLowerCase())) ||
    c.keySubstances.some(s => s.includes(query))
  );
}

/** 搜索太阳系天体 */
export function searchSolarBody(query: string): (SolarSystemPlanet | SolarSystemStar | typeof SOLAR_DWARF_PLANETS[0] | typeof SOLAR_MAJOR_MOONS[0])[] {
  const q = query.toLowerCase();
  const results: (SolarSystemPlanet | SolarSystemStar | typeof SOLAR_DWARF_PLANETS[0] | typeof SOLAR_MAJOR_MOONS[0])[] = [];
  
  if (SOLAR_STAR.name.includes(query)) results.push(SOLAR_STAR);
  results.push(...SOLAR_PLANETS.filter(p => p.name.includes(query) || p.type.includes(q)));
  results.push(...SOLAR_DWARF_PLANETS.filter(d => d.name.includes(query)));
  results.push(...SOLAR_MAJOR_MOONS.filter(m => m.name.includes(query) || m.parent.includes(query)));
  
  return results;
}

/** 获取宇宙数据库总览统计 */
export function getCosmicDatabaseStats(): { total: number; categories: number; categoryBreakdown: { id: string; name: string; count: number }[] } {
  return {
    total: COSMIC_DATABASE_CATEGORIES.reduce((sum, c) => sum + c.count, 0),
    categories: COSMIC_DATABASE_CATEGORIES.length,
    categoryBreakdown: COSMIC_DATABASE_CATEGORIES.map(c => ({ id: c.id, name: c.name, count: c.count }))
  };
}
