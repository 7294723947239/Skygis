/**
 * 全宇宙天体分类体系数据库
 * 覆盖可观测宇宙全部天体类型：2万亿+星系、所有恒星/行星/星云/黑洞等
 * 架构：宇宙 > 宇宙结构 > 星系 > 恒星系统 > 天体 > 物质
 */

// ========== 类型定义 ==========

export type MatterState =
  | "气态" | "液态" | "固态" | "等离子态" | "超临界" | "超离子态"
  | "简并态" | "中子简并态" | "电子简并态" | "超流体" | "超固态"
  | "奇异物态" | "夸克-胶子等离子态" | "玻色-爱因斯坦凝聚态"
  | "离子态" | "亚稳态" | "溶解" | "固态/液态" | "气态/液态"
  | "固态/气态" | "气态/固态" | "分子态" | "金属态" | "半导体态"
  | "超导态" | "铁磁态" | "反铁磁态" | "多种" | "固态/中子简并态"
  | "液态/固态" | "气态/液态/金属态" | "超离子态/液态"
  | "液态/超临界" | "固态(冰)" | "分子态/固态" | "固态/分子态"
  | "奇点" | "未知";

export type Importance = "主导" | "关键" | "重要" | "次要" | "痕量" | "理论预测" | "未证实";

export interface CosmicMaterial {
  name: string;
  formula: string;
  percentage: number;
  category: string;
  state: MatterState;
  importance: Importance;
  note?: string;
  discovered?: string;
}

export interface CosmicObject {
  id: string;
  name: string;
  nameCn: string;
  type: string; // 天体类型
  estimatedCount: string; // 估计数量
  countNote?: string; // 数量说明
  description: string;
  subTypes?: CosmicSubType[];
  materials: CosmicMaterial[];
  environment: {
    temperature: string;
    gravity: string;
    pressure: string;
    radiation: string;
  };
  hazards?: string[];
  resources?: string[];
  features?: string[];
}

export interface CosmicSubType {
  id: string;
  name: string;
  nameCn: string;
  estimatedCount: string;
  description: string;
  materials: CosmicMaterial[];
  environment: {
    temperature: string;
    gravity: string;
    pressure: string;
    radiation: string;
  };
}

export interface CosmicCategory {
  id: string;
  name: string;
  nameCn: string;
  icon: string;
  estimatedCount: string;
  description: string;
  objects: CosmicObject[];
}

// ========== 宇宙全量天体分类 ==========

export const COSMIC_TAXONOMY: CosmicCategory[] = [
  // ============================================================
  // 1. 宇宙大尺度结构
  // ============================================================
  {
    id: "cosmic-structure",
    name: "Cosmic Structure",
    nameCn: "宇宙大尺度结构",
    icon: "🌌",
    estimatedCount: "1",
    description: "可观测宇宙的整体结构，由暗物质骨架支撑，形成宇宙网状拓扑",
    objects: [
      {
        id: "observable-universe",
        name: "Observable Universe",
        nameCn: "可观测宇宙",
        type: "宇宙",
        estimatedCount: "1",
        countNote: "半径465亿光年，体积3.57×10⁸⁰ m³",
        description: "从地球可观测的整个宇宙范围，包含约2万亿个星系",
        materials: [
          { name: "暗能量", formula: "Λ/Quintessence", percentage: 68.3, category: "暗能量", state: "未知", importance: "主导", note: "驱动宇宙加速膨胀的神秘能量" },
          { name: "冷暗物质", formula: "CDM", percentage: 26.8, category: "暗物质", state: "未知", importance: "主导", note: "通过引力影响可见物质" },
          { name: "重子物质", formula: "Baryonic", percentage: 4.9, category: "普通物质", state: "多种", importance: "关键", note: "所有可见物质：恒星/星云/行星等" },
          { name: "光子", formula: "γ", percentage: 0.005, category: "辐射", state: "未知", importance: "重要", note: "宇宙微波背景辐射" },
          { name: "中微子", formula: "ν", percentage: 0.003, category: "轻子", state: "未知", importance: "重要", note: "宇宙中微子背景" },
        ],
        environment: { temperature: "2.725K (CMB)", gravity: "~0", pressure: "~0", radiation: "CMB 2.725K" },
        features: ["宇宙微波背景", "宇宙膨胀", "哈勃流", "重子声学振荡"],
        subTypes: [
          { id: "cosmic-web", name: "Cosmic Web", nameCn: "宇宙网", estimatedCount: "1", description: "暗物质和星系组成的网状大尺度结构", materials: [
            { name: "暗物质丝状体", formula: "DM Filament", percentage: 60, category: "暗物质", state: "未知", importance: "主导", note: "连接星系团的暗物质桥" },
            { name: "WHIM", formula: "Warm-Hot IGM", percentage: 25, category: "星系际介质", state: "等离子态", importance: "重要", note: "温热星系际介质，可能解决重子缺失" },
            { name: "星系团节点", formula: "Galaxy Clusters", percentage: 10, category: "重子物质", state: "多种", importance: "重要" },
            { name: "宇宙空洞", formula: "Cosmic Voids", percentage: 5, category: "真空", state: "未知", importance: "次要", note: "宇宙中最空旷的区域" },
          ], environment: { temperature: "10⁵-10⁷K", gravity: "微弱", pressure: "10⁻²⁴ Pa", radiation: "X射线" } },
          { id: "supercluster", name: "Supercluster", nameCn: "超星系团", estimatedCount: "~1000万", description: "数百至数千个星系团组成的巨大结构", materials: [
            { name: "暗物质晕", formula: "DM Halo", percentage: 85, category: "暗物质", state: "未知", importance: "主导" },
            { name: "热星系际气体", formula: "ICM", percentage: 12, category: "星系际介质", state: "等离子态", importance: "重要", note: "X射线辐射源" },
            { name: "星系", formula: "Galaxies", percentage: 3, category: "重子物质", state: "多种", importance: "关键" },
          ], environment: { temperature: "10⁷-10⁸K", gravity: "弱", pressure: "10⁻¹⁴ Pa", radiation: "X射线/γ射线" } },
          { id: "galaxy-filament", name: "Galaxy Filament", nameCn: "星系丝状体", estimatedCount: "~100万", description: "宇宙网中最密集的结构，连接超星系团", materials: [
            { name: "暗物质丝", formula: "DM Filament", percentage: 70, category: "暗物质", state: "未知", importance: "主导" },
            { name: "温热气体", formula: "WHIM", percentage: 20, category: "星系际介质", state: "等离子态", importance: "重要" },
            { name: "星系链", formula: "Galaxy Chains", percentage: 10, category: "重子物质", state: "多种", importance: "关键" },
          ], environment: { temperature: "10⁵-10⁷K", gravity: "微弱", pressure: "10⁻²⁰ Pa", radiation: "软X射线" } },
          { id: "cosmic-void", name: "Cosmic Void", nameCn: "宇宙空洞", estimatedCount: "~数百万", description: "宇宙中几乎没有星系的巨大空旷区域", materials: [
            { name: "暗能量", formula: "DE", percentage: 75, category: "暗能量", state: "未知", importance: "主导", note: "空洞中暗能量主导" },
            { name: "稀薄气体", formula: "IGM H/He", percentage: 15, category: "星系际介质", state: "气态", importance: "重要" },
            { name: "矮星系", formula: "Dwarf Galaxies", percentage: 5, category: "重子物质", state: "多种", importance: "次要" },
            { name: "暗物质", formula: "DM Underdensity", percentage: 5, category: "暗物质", state: "未知", importance: "次要", note: "密度低于平均值" },
          ], environment: { temperature: "~10⁴K", gravity: "极弱", pressure: "10⁻²⁶ Pa", radiation: "CMB + 弱UV" } },
        ],
      },
    ],
  },

  // ============================================================
  // 2. 星系 (2万亿+)
  // ============================================================
  {
    id: "galaxies",
    name: "Galaxies",
    nameCn: "星系",
    icon: "🌀",
    estimatedCount: "2万亿+ (2×10¹²)",
    description: "由恒星、气体、尘埃和暗物质组成的巨大引力束缚系统",
    objects: [
      {
        id: "spiral-galaxy",
        name: "Spiral Galaxy",
        nameCn: "旋涡星系",
        type: "星系",
        estimatedCount: "~6000亿",
        description: "具有旋臂结构的盘状星系，如银河系和仙女座星系",
        materials: [
          { name: "暗物质晕", formula: "DM Halo", percentage: 85, category: "暗物质", state: "未知", importance: "主导", note: "质量占比最大" },
          { name: "氢气", formula: "H₂", percentage: 6, category: "星际介质", state: "分子态", importance: "关键", note: "恒星形成原料" },
          { name: "氦气", formula: "He", percentage: 2.5, category: "星际介质", state: "气态", importance: "重要" },
          { name: "恒星物质", formula: "Stellar", percentage: 2, category: "恒星", state: "多种", importance: "关键" },
          { name: "星际尘埃", formula: "Silicate/C", percentage: 1, category: "尘埃", state: "固态", importance: "重要", note: "硅酸盐和碳质颗粒" },
          { name: "重元素", formula: "Metals", percentage: 0.5, category: "金属", state: "多种", importance: "重要" },
          { name: "电离氢", formula: "HII", percentage: 1.5, category: "星际介质", state: "等离子态", importance: "重要", note: "HII区标志恒星形成" },
          { name: "CO分子", formula: "CO", percentage: 0.3, category: "星际分子", state: "分子态", importance: "重要", note: "示踪分子氢" },
          { name: "中性氢", formula: "HI", percentage: 1.2, category: "星际介质", state: "气态", importance: "关键", note: "21cm线示踪" },
        ],
        environment: { temperature: "10-10⁷K", gravity: "中等", pressure: "10⁻¹⁷-10⁻¹² Pa", radiation: "UV/Optical/IR" },
        features: ["旋臂", "棒状结构", "星系盘", "核球", "暗物质晕"],
        subTypes: [
          { id: "barred-spiral", name: "Barred Spiral", nameCn: "棒旋星系", estimatedCount: "~3000亿", description: "中心有棒状结构的旋涡星系(银河系即是)", materials: [
            { name: "暗物质", formula: "DM", percentage: 85, category: "暗物质", state: "未知", importance: "主导" },
            { name: "棒状结构恒星", formula: "Bar Stars", percentage: 5, category: "恒星", state: "等离子态", importance: "关键" },
            { name: "分子氢", formula: "H₂", percentage: 4, category: "星际介质", state: "分子态", importance: "关键" },
            { name: "中性氢", formula: "HI", percentage: 2, category: "星际介质", state: "气态", importance: "重要" },
            { name: "尘埃", formula: "Dust", percentage: 1, category: "尘埃", state: "固态", importance: "重要" },
          ], environment: { temperature: "10-10⁷K", gravity: "中等", pressure: "10⁻¹⁷ Pa", radiation: "多波段" } },
          { id: "grand-design-spiral", name: "Grand Design Spiral", nameCn: "宏象旋涡星系", estimatedCount: "~1500亿", description: "具有两条清晰旋臂的旋涡星系", materials: [
            { name: "暗物质", formula: "DM", percentage: 86, category: "暗物质", state: "未知", importance: "主导" },
            { name: "旋臂气体", formula: "Arm Gas", percentage: 5, category: "星际介质", state: "多种", importance: "关键" },
            { name: "OB星协", formula: "OB Assoc", percentage: 2, category: "恒星", state: "等离子态", importance: "关键" },
            { name: "分子云复合体", formula: "GMC", percentage: 3, category: "星际介质", state: "分子态", importance: "重要" },
          ], environment: { temperature: "10-10⁷K", gravity: "中等", pressure: "10⁻¹⁷ Pa", radiation: "UV/Optical" } },
        ],
      },
      {
        id: "elliptical-galaxy",
        name: "Elliptical Galaxy",
        nameCn: "椭圆星系",
        type: "星系",
        estimatedCount: "~8000亿",
        description: "呈椭球形的星系，恒星运动无序，缺乏新恒星形成",
        materials: [
          { name: "暗物质晕", formula: "DM Halo", percentage: 88, category: "暗物质", state: "未知", importance: "主导" },
          { name: "老年恒星", formula: "Old Stars", percentage: 5, category: "恒星", state: "等离子态", importance: "关键", note: "红巨星/水平分支星为主" },
          { name: "热星际气体", formula: "Hot X-ray Gas", percentage: 4, category: "星际介质", state: "等离子态", importance: "重要", note: "X射线辐射源" },
          { name: "行星状星云", formula: "PN", percentage: 0.5, category: "星云", state: "等离子态", importance: "次要" },
          { name: "球状星团", formula: "GC", percentage: 2, category: "恒星团", state: "多种", importance: "重要" },
          { name: "尘埃", formula: "Dust", percentage: 0.5, category: "尘埃", state: "固态", importance: "次要" },
        ],
        environment: { temperature: "10⁶-10⁷K", gravity: "强", pressure: "10⁻¹⁴ Pa", radiation: "X射线强" },
      },
      {
        id: "irregular-galaxy",
        name: "Irregular Galaxy",
        nameCn: "不规则星系",
        type: "星系",
        estimatedCount: "~3000亿",
        description: "无规则形状的星系，通常富含气体和年轻恒星",
        materials: [
          { name: "暗物质", formula: "DM", percentage: 80, category: "暗物质", state: "未知", importance: "主导" },
          { name: "分子氢", formula: "H₂", percentage: 8, category: "星际介质", state: "分子态", importance: "关键", note: "极高气体含量" },
          { name: "年轻恒星", formula: "Young Stars", percentage: 4, category: "恒星", state: "等离子态", importance: "关键" },
          { name: "HII区", formula: "HII", percentage: 3, category: "星际介质", state: "等离子态", importance: "重要" },
          { name: "尘埃", formula: "Dust", percentage: 2, category: "尘埃", state: "固态", importance: "重要" },
          { name: "重元素", formula: "Metals", percentage: 3, category: "金属", state: "多种", importance: "重要" },
        ],
        environment: { temperature: "10-10⁷K", gravity: "弱-中", pressure: "10⁻¹⁶ Pa", radiation: "UV/Optical" },
      },
      {
        id: "dwarf-galaxy",
        name: "Dwarf Galaxy",
        nameCn: "矮星系",
        type: "星系",
        estimatedCount: "~数千亿",
        description: "小型星系，通常围绕大星系运转，暗物质含量极高",
        materials: [
          { name: "暗物质", formula: "DM", percentage: 95, category: "暗物质", state: "未知", importance: "主导", note: "暗物质占比极高" },
          { name: "恒星", formula: "Stars", percentage: 2, category: "恒星", state: "等离子态", importance: "关键" },
          { name: "气体", formula: "Gas", percentage: 2, category: "星际介质", state: "气态", importance: "重要" },
          { name: "尘埃", formula: "Dust", percentage: 1, category: "尘埃", state: "固态", importance: "次要" },
        ],
        environment: { temperature: "10⁴-10⁶K", gravity: "弱", pressure: "10⁻²⁰ Pa", radiation: "弱" },
        subTypes: [
          { id: "dwarf-spheroidal", name: "Dwarf Spheroidal", nameCn: "矮球状星系", estimatedCount: "~数千亿", description: "几乎无气体的极暗弱小星系", materials: [
            { name: "暗物质", formula: "DM", percentage: 98, category: "暗物质", state: "未知", importance: "主导", note: "暗物质占比最高的天体之一" },
            { name: "老年恒星", formula: "Old Stars", percentage: 2, category: "恒星", state: "等离子态", importance: "关键" },
          ], environment: { temperature: "~10⁴K", gravity: "极弱", pressure: "极低", radiation: "弱" } },
          { id: "dwarf-elliptical", name: "Dwarf Elliptical", nameCn: "矮椭圆星系", estimatedCount: "~数千亿", description: "小型椭圆星系", materials: [
            { name: "暗物质", formula: "DM", percentage: 90, category: "暗物质", state: "未知", importance: "主导" },
            { name: "恒星", formula: "Stars", percentage: 6, category: "恒星", state: "等离子态", importance: "关键" },
            { name: "热气体", formula: "Hot Gas", percentage: 4, category: "星际介质", state: "等离子态", importance: "重要" },
          ], environment: { temperature: "10⁶K", gravity: "弱", pressure: "10⁻¹⁸ Pa", radiation: "X射线" } },
          { id: "ultrafaint-dwarf", name: "Ultra-faint Dwarf", nameCn: "超暗弱矮星系", estimatedCount: "~数百亿", description: "已知暗物质比例最高的天体", materials: [
            { name: "暗物质", formula: "DM", percentage: 99.9, category: "暗物质", state: "未知", importance: "主导", note: "暗物质占比最高" },
            { name: "极少量恒星", formula: "Few Stars", percentage: 0.1, category: "恒星", state: "等离子态", importance: "关键" },
          ], environment: { temperature: "~10³K", gravity: "极弱", pressure: "极低", radiation: "极弱" } },
        ],
      },
      {
        id: "lenticular-galaxy",
        name: "Lenticular Galaxy",
        nameCn: "透镜状星系",
        type: "星系",
        estimatedCount: "~2000亿",
        description: "介于椭圆和旋涡之间的过渡型星系，有盘无臂",
        materials: [
          { name: "暗物质", formula: "DM", percentage: 87, category: "暗物质", state: "未知", importance: "主导" },
          { name: "老年恒星", formula: "Old Stars", percentage: 7, category: "恒星", state: "等离子态", importance: "关键" },
          { name: "稀薄气体", formula: "Gas", percentage: 3, category: "星际介质", state: "气态", importance: "重要" },
          { name: "尘埃", formula: "Dust", percentage: 2, category: "尘埃", state: "固态", importance: "次要" },
          { name: "球状星团", formula: "GC", percentage: 1, category: "恒星团", state: "多种", importance: "重要" },
        ],
        environment: { temperature: "10⁵-10⁷K", gravity: "中等", pressure: "10⁻¹⁶ Pa", radiation: "X射线/Optical" },
      },
      {
        id: "active-galaxy",
        name: "Active Galaxy / AGN",
        nameCn: "活动星系 / 活动星系核",
        type: "星系",
        estimatedCount: "~数十亿",
        description: "核心具有超大质量黑洞吸积的活跃星系",
        materials: [
          { name: "暗物质", formula: "DM", percentage: 80, category: "暗物质", state: "未知", importance: "主导" },
          { name: "吸积盘等离子体", formula: "Accretion Disk", percentage: 5, category: "等离子体", state: "等离子态", importance: "关键" },
          { name: "相对论性喷流", formula: "Relativistic Jet", percentage: 2, category: "等离子体", state: "等离子态", importance: "关键", note: "接近光速" },
          { name: "尘埃环", formula: "Dust Torus", percentage: 3, category: "尘埃", state: "固态", importance: "重要" },
          { name: "宽线区气体", formula: "BLR Gas", percentage: 2, category: "星际介质", state: "等离子态", importance: "重要" },
          { name: "窄线区气体", formula: "NLR Gas", percentage: 1, category: "星际介质", state: "等离子态", importance: "重要" },
          { name: "恒星", formula: "Stars", percentage: 5, category: "恒星", state: "等离子态", importance: "重要" },
          { name: "星际气体", formula: "ISG", percentage: 2, category: "星际介质", state: "多种", importance: "重要" },
        ],
        environment: { temperature: "10⁴-10⁹K", gravity: "极强", pressure: "10⁻⁸ Pa", radiation: "全波段极端" },
        hazards: ["强辐射", "相对论性喷流", "X射线暴"],
        subTypes: [
          { id: "quasar", name: "Quasar", nameCn: "类星体", estimatedCount: "~100万", description: "宇宙中最明亮的天体，超大质量黑洞猛烈吸积", materials: [
            { name: "吸积盘", formula: "Accretion Disk", percentage: 40, category: "等离子体", state: "等离子态", importance: "主导" },
            { name: "相对论喷流", formula: "Jet", percentage: 15, category: "等离子体", state: "等离子态", importance: "关键" },
            { name: "尘埃环", formula: "Dust Torus", percentage: 15, category: "尘埃", state: "固态", importance: "重要" },
            { name: "宽线区", formula: "BLR", percentage: 10, category: "气体", state: "等离子态", importance: "重要" },
            { name: "窄线区", formula: "NLR", percentage: 5, category: "气体", state: "等离子态", importance: "重要" },
            { name: "宿主星系", formula: "Host Galaxy", percentage: 15, category: "重子物质", state: "多种", importance: "重要" },
          ], environment: { temperature: "10⁵-10¹⁰K", gravity: "极强", pressure: "极高", radiation: "极端全波段" } },
          { id: "blazar", name: "Blazar", nameCn: "耀变体", estimatedCount: "~数千", description: "喷流直指地球的AGN，极端变光天体", materials: [
            { name: "相对论喷流", formula: "Jet", percentage: 50, category: "等离子体", state: "等离子态", importance: "主导", note: "接近光速" },
            { name: "吸积盘", formula: "Accretion Disk", percentage: 30, category: "等离子体", state: "等离子态", importance: "关键" },
            { name: "同步辐射电子", formula: "Synchrotron e⁻", percentage: 15, category: "辐射", state: "未知", importance: "关键" },
            { name: "宿主星系", formula: "Host", percentage: 5, category: "重子物质", state: "多种", importance: "次要" },
          ], environment: { temperature: "10⁸-10¹²K", gravity: "极强", pressure: "极高", radiation: "γ射线主导" } },
          { id: "seyfert", name: "Seyfert Galaxy", nameCn: "赛弗特星系", estimatedCount: "~数十亿", description: "低光度活动星系核", materials: [
            { name: "暗物质", formula: "DM", percentage: 85, category: "暗物质", state: "未知", importance: "主导" },
            { name: "吸积盘", formula: "Accretion Disk", percentage: 3, category: "等离子体", state: "等离子态", importance: "关键" },
            { name: "宽线区气体", formula: "BLR", percentage: 2, category: "气体", state: "等离子态", importance: "重要" },
            { name: "窄线区气体", formula: "NLR", percentage: 2, category: "气体", state: "等离子态", importance: "重要" },
            { name: "恒星", formula: "Stars", percentage: 5, category: "恒星", state: "等离子态", importance: "重要" },
            { name: "星际气体", formula: "ISG", percentage: 3, category: "星际介质", state: "多种", importance: "重要" },
          ], environment: { temperature: "10⁴-10⁸K", gravity: "强", pressure: "10⁻¹⁰ Pa", radiation: "X射线强" } },
        ],
      },
    ],
  },

  // ============================================================
  // 3. 恒星 (约2×10²³ 颗)
  // ============================================================
  {
    id: "stars",
    name: "Stars",
    nameCn: "恒星",
    icon: "⭐",
    estimatedCount: "约2000亿万亿 (2×10²³)",
    description: "可观测宇宙中的所有恒星，约2万亿星系×每星系1000-4000亿颗",
    objects: [
      {
        id: "o-type-star",
        name: "O-type Main Sequence",
        nameCn: "O型主序星",
        type: "恒星",
        estimatedCount: "~数百万",
        description: "最热最亮的主序星，寿命短但影响巨大",
        materials: [
          { name: "氢", formula: "H", percentage: 70, category: "元素", state: "等离子态", importance: "主导" },
          { name: "氦", formula: "He", percentage: 28, category: "元素", state: "等离子态", importance: "关键" },
          { name: "碳", formula: "C", percentage: 0.3, category: "金属", state: "等离子态", importance: "重要" },
          { name: "氮", formula: "N", percentage: 0.1, category: "金属", state: "等离子态", importance: "重要" },
          { name: "氧", formula: "O", percentage: 0.6, category: "金属", state: "等离子态", importance: "重要" },
          { name: "氖", formula: "Ne", percentage: 0.2, category: "金属", state: "等离子态", importance: "次要" },
          { name: "铁", formula: "Fe", percentage: 0.05, category: "金属", state: "等离子态", importance: "次要" },
          { name: "硅", formula: "Si", percentage: 0.04, category: "金属", state: "等离子态", importance: "次要" },
          { name: "星风物质", formula: "Stellar Wind", percentage: 0.71, category: "星风", state: "等离子态", importance: "关键", note: "强烈星风损失质量" },
        ],
        environment: { temperature: "30000-50000K", gravity: "中等", pressure: "极高(核心)", radiation: "极强UV" },
        features: ["强UV辐射", "猛烈星风", "HII区创造者", "超新星前身"],
      },
      {
        id: "b-type-star",
        name: "B-type Main Sequence",
        nameCn: "B型主序星",
        type: "恒星",
        estimatedCount: "~数千万",
        description: "蓝白色高温主序星，如猎户座参宿七",
        materials: [
          { name: "氢", formula: "H", percentage: 71, category: "元素", state: "等离子态", importance: "主导" },
          { name: "氦", formula: "He", percentage: 27, category: "元素", state: "等离子态", importance: "关键" },
          { name: "碳氮氧", formula: "CNO", percentage: 0.8, category: "金属", state: "等离子态", importance: "重要", note: "CNO循环主导" },
          { name: "铁峰元素", formula: "Fe-peak", percentage: 0.1, category: "金属", state: "等离子态", importance: "次要" },
          { name: "氖镁", formula: "Ne/Mg", percentage: 0.1, category: "金属", state: "等离子态", importance: "次要" },
        ],
        environment: { temperature: "10000-30000K", gravity: "中等", pressure: "极高", radiation: "强UV" },
      },
      {
        id: "a-type-star",
        name: "A-type Main Sequence",
        nameCn: "A型主序星",
        type: "恒星",
        estimatedCount: "~数亿",
        description: "白色主序星，如天狼星A、织女星",
        materials: [
          { name: "氢", formula: "H", percentage: 72, category: "元素", state: "等离子态", importance: "主导" },
          { name: "氦", formula: "He", percentage: 26, category: "元素", state: "等离子态", importance: "关键" },
          { name: "金属", formula: "Metals", percentage: 1.5, category: "金属", state: "等离子态", importance: "重要" },
          { name: "钙", formula: "Ca", percentage: 0.07, category: "金属", state: "等离子态", importance: "重要", note: "Ca II K线特征" },
        ],
        environment: { temperature: "7500-10000K", gravity: "中等", pressure: "高", radiation: "UV/Optical" },
      },
      {
        id: "f-type-star",
        name: "F-type Main Sequence",
        nameCn: "F型主序星",
        type: "恒星",
        estimatedCount: "~数十亿",
        description: "黄白色主序星，如南河三",
        materials: [
          { name: "氢", formula: "H", percentage: 73, category: "元素", state: "等离子态", importance: "主导" },
          { name: "氦", formula: "He", percentage: 25, category: "元素", state: "等离子态", importance: "关键" },
          { name: "重元素", formula: "Metals", percentage: 1.8, category: "金属", state: "等离子态", importance: "重要" },
        ],
        environment: { temperature: "6000-7500K", gravity: "中等", pressure: "高", radiation: "Optical" },
      },
      {
        id: "g-type-star",
        name: "G-type Main Sequence",
        nameCn: "G型主序星(类太阳)",
        type: "恒星",
        estimatedCount: "~数千亿",
        description: "黄色主序星，我们的太阳即属此类",
        materials: [
          { name: "氢", formula: "H", percentage: 73.46, category: "元素", state: "等离子态", importance: "主导" },
          { name: "氦", formula: "He", percentage: 24.85, category: "元素", state: "等离子态", importance: "关键" },
          { name: "氧", formula: "O", percentage: 0.77, category: "金属", state: "等离子态", importance: "重要" },
          { name: "碳", formula: "C", percentage: 0.29, category: "金属", state: "等离子态", importance: "重要" },
          { name: "氖", formula: "Ne", percentage: 0.12, category: "金属", state: "等离子态", importance: "次要" },
          { name: "铁", formula: "Fe", percentage: 0.16, category: "金属", state: "等离子态", importance: "重要" },
          { name: "氮", formula: "N", percentage: 0.09, category: "金属", state: "等离子态", importance: "重要" },
          { name: "硅", formula: "Si", percentage: 0.07, category: "金属", state: "等离子态", importance: "次要" },
          { name: "镁", formula: "Mg", percentage: 0.05, category: "金属", state: "等离子态", importance: "次要" },
          { name: "硫", formula: "S", percentage: 0.04, category: "金属", state: "等离子态", importance: "次要" },
        ],
        environment: { temperature: "5200-6000K", gravity: "中等(274m/s²表面)", pressure: "高", radiation: "Optical" },
        features: ["pp链聚变", "11年活动周期", "日冕", "太阳风"],
      },
      {
        id: "k-type-star",
        name: "K-type Main Sequence",
        nameCn: "K型主序星(橙矮星)",
        type: "恒星",
        estimatedCount: "~数万亿",
        description: "橙色主序星，宜居行星的最佳候选宿主",
        materials: [
          { name: "氢", formula: "H", percentage: 74, category: "元素", state: "等离子态", importance: "主导" },
          { name: "氦", formula: "He", percentage: 24, category: "元素", state: "等离子态", importance: "关键" },
          { name: "金属", formula: "Metals", percentage: 2.0, category: "金属", state: "等离子态", importance: "重要" },
          { name: "TiO", formula: "TiO", percentage: 0.1, category: "分子", state: "分子态", importance: "重要", note: "K型星光谱特征" },
        ],
        environment: { temperature: "3900-5200K", gravity: "中等", pressure: "高", radiation: "Optical/IR" },
        features: ["长寿命(150-300亿年)", "宜居带近", "耀斑活动"],
      },
      {
        id: "m-type-star",
        name: "M-type Main Sequence",
        nameCn: "M型主序星(红矮星)",
        type: "恒星",
        estimatedCount: "~1.5×10²³ (占恒星75%)",
        description: "宇宙中数量最多的恒星，寿命可达万亿年",
        materials: [
          { name: "氢", formula: "H", percentage: 75, category: "元素", state: "等离子态", importance: "主导" },
          { name: "氦", formula: "He", percentage: 23, category: "元素", state: "等离子态", importance: "关键" },
          { name: "TiO分子", formula: "TiO", percentage: 0.3, category: "分子", state: "分子态", importance: "关键", note: "红矮星光谱标志" },
          { name: "VO分子", formula: "VO", percentage: 0.1, category: "分子", state: "分子态", importance: "重要" },
          { name: "H₂O蒸气", formula: "H₂O", percentage: 0.1, category: "分子", state: "分子态", importance: "重要" },
          { name: "金属", formula: "Metals", percentage: 1.5, category: "金属", state: "等离子态", importance: "重要" },
        ],
        environment: { temperature: "2400-3900K", gravity: "中-强", pressure: "高", radiation: "IR主导" },
        features: ["占恒星总数75%", "寿命万亿年", "强烈耀斑", "潮汐锁定行星"],
      },
      {
        id: "red-giant",
        name: "Red Giant",
        nameCn: "红巨星",
        type: "恒星",
        estimatedCount: "~数万亿",
        description: "低质量恒星演化后期的膨胀阶段",
        materials: [
          { name: "氢包层", formula: "H Envelope", percentage: 60, category: "元素", state: "等离子态", importance: "主导" },
          { name: "氦核心", formula: "He Core", percentage: 30, category: "元素", state: "简并态", importance: "关键" },
          { name: "碳氧核", formula: "C/O Core", percentage: 5, category: "元素", state: "简并态", importance: "重要" },
          { name: "s过程元素", formula: "Sr/Ba/Pb", percentage: 0.1, category: "重元素", state: "等离子态", importance: "关键", note: "慢中子俘获" },
          { name: "锝", formula: "Tc", percentage: 0.001, category: "重元素", state: "等离子态", importance: "关键", note: "s过程标志，半衰期4.2Ma" },
          { name: "锂", formula: "Li", percentage: 0.01, category: "轻元素", state: "等离子态", importance: "重要", note: "Cameron-Fowler机制" },
          { name: "ZrO分子", formula: "ZrO", percentage: 0.01, category: "分子", state: "分子态", importance: "重要", note: "S型星标志" },
        ],
        environment: { temperature: "3000-5000K(表面)", gravity: "低(表面)", pressure: "极高(核心)", radiation: "Optical/IR" },
      },
      {
        id: "supergiant",
        name: "Supergiant",
        nameCn: "超巨星",
        type: "恒星",
        estimatedCount: "~数百万",
        description: "大质量恒星演化后期，直径可达太阳数百倍",
        materials: [
          { name: "氢包层", formula: "H Envelope", percentage: 50, category: "元素", state: "等离子态", importance: "主导" },
          { name: "氦层", formula: "He Shell", percentage: 20, category: "元素", state: "等离子态", importance: "关键" },
          { name: "碳层", formula: "C Shell", percentage: 8, category: "元素", state: "等离子态", importance: "重要" },
          { name: "氧层", formula: "O Shell", percentage: 8, category: "元素", state: "等离子态", importance: "重要" },
          { name: "硅层", formula: "Si Shell", percentage: 5, category: "元素", state: "等离子态", importance: "重要" },
          { name: "铁核心", formula: "Fe Core", percentage: 5, category: "元素", state: "电子简并态", importance: "关键", note: "核合成终点" },
          { name: "镍", formula: "⁵⁶Ni", percentage: 2, category: "重元素", state: "等离子态", importance: "关键", note: "→⁵⁶Co→⁵⁶Fe 超新星光源" },
          { name: "重元素", formula: "Heavy r-process", percentage: 2, category: "重元素", state: "等离子态", importance: "关键", note: "r过程：Au/Pt/U等" },
        ],
        environment: { temperature: "3000-30000K(表面)", gravity: "极低(表面)", pressure: "极高(核心)", radiation: "极强Optical/UV" },
        hazards: ["即将超新星爆发", "强星风", "质量损失"],
      },
      {
        id: "white-dwarf",
        name: "White Dwarf",
        nameCn: "白矮星",
        type: "恒星残骸",
        estimatedCount: "~数十万亿",
        description: "低质量恒星终态，电子简并压支撑",
        materials: [
          { name: "碳", formula: "C", percentage: 40, category: "元素", state: "电子简并态", importance: "主导" },
          { name: "氧", formula: "O", percentage: 50, category: "元素", state: "电子简并态", importance: "主导" },
          { name: "氖镁", formula: "Ne/Mg", percentage: 5, category: "元素", state: "电子简并态", importance: "重要", note: "8-10 M☉恒星产物" },
          { name: "氢大气", formula: "H Atm", percentage: 2, category: "元素", state: "等离子态", importance: "重要", note: "DA型白矮星" },
          { name: "氦大气", formula: "He Atm", percentage: 3, category: "元素", state: "等离子态", importance: "重要", note: "DB型白矮星" },
        ],
        environment: { temperature: "8000-40000K(表面)", gravity: "10⁵g", pressure: "10²² Pa", radiation: "UV" },
        features: ["钻石核心", "钱德拉塞卡极限", "Ia超新星前身"],
      },
      {
        id: "neutron-star",
        name: "Neutron Star",
        nameCn: "中子星",
        type: "恒星残骸",
        estimatedCount: "~数十亿",
        description: "超新星爆发后的极致密天体，一茶匙重约60亿吨",
        materials: [
          { name: "中子超流体", formula: "n (superfluid)", percentage: 80, category: "核物质", state: "中子简并态", importance: "主导" },
          { name: "质子超导体", formula: "p (superconductor)", percentage: 5, category: "核物质", state: "超导态", importance: "关键" },
          { name: "电子", formula: "e⁻", percentage: 1, category: "轻子", state: "简并态", importance: "重要" },
          { name: "中子星壳层", formula: "Neutron Drip", percentage: 5, category: "核物质", state: "固态/中子简并态", importance: "重要" },
          { name: "μ子", formula: "μ⁻", percentage: 2, category: "轻子", state: "简并态", importance: "重要" },
          { name: "夸克物质", formula: "QGP", percentage: 3, category: "基本粒子", state: "夸克-胶子等离子态", importance: "关键", note: "理论预测内核" },
          { name: "超子物质", formula: "Σ/Λ/Ξ", percentage: 3, category: "奇异物质", state: "奇异物态", importance: "重要", note: "奇异中子星假说" },
          { name: "铁壳层", formula: "⁵⁶Fe Lattice", percentage: 1, category: "元素", state: "超固态", importance: "重要", note: "极端压力下的铁晶格" },
        ],
        environment: { temperature: "10⁶K", gravity: "2×10¹¹g", pressure: "10³⁴ Pa", radiation: "X射线/射电脉冲" },
        hazards: ["极端磁场", "辐射束", "潮汐力"],
        subTypes: [
          { id: "pulsar", name: "Pulsar", nameCn: "脉冲星", estimatedCount: "~数十亿", description: "旋转的中子星，周期性发射射电脉冲", materials: [
            { name: "中子物质", formula: "Neutron Matter", percentage: 95, category: "核物质", state: "中子简并态", importance: "主导" },
            { name: "磁层等离子体", formula: "Magnetosphere", percentage: 3, category: "等离子体", state: "等离子态", importance: "关键" },
            { name: "铁壳层", formula: "Fe Crust", percentage: 2, category: "元素", state: "超固态", importance: "重要" },
          ], environment: { temperature: "10⁶K", gravity: "10¹¹g", pressure: "10³⁴ Pa", radiation: "射电/X射线脉冲" } },
          { id: "magnetar", name: "Magnetar", nameCn: "磁星", estimatedCount: "~数百万", description: "磁场极强的中子星(10¹⁰-10¹¹T)", materials: [
            { name: "中子超流体", formula: "n", percentage: 85, category: "核物质", state: "中子简并态", importance: "主导" },
            { name: "磁扭结", formula: "Magnetic Flux Tubes", percentage: 5, category: "磁场", state: "未知", importance: "关键", note: "星震来源" },
            { name: "质子超导体", formula: "p (Type II SC)", percentage: 5, category: "核物质", state: "超导态", importance: "关键" },
            { name: "外部磁层", formula: "Magnetosphere", percentage: 5, category: "等离子体", state: "等离子态", importance: "重要" },
          ], environment: { temperature: "10⁶-10⁸K", gravity: "10¹¹g", pressure: "10³⁵ Pa", radiation: "X/γ闪光" } },
        ],
      },
      {
        id: "wolf-rayet-star",
        name: "Wolf-Rayet Star",
        nameCn: "沃尔夫-拉叶星",
        type: "恒星",
        estimatedCount: "~数千",
        description: "极热大质量恒星，猛烈星风剥去外层",
        materials: [
          { name: "氦核", formula: "He Core", percentage: 40, category: "元素", state: "等离子态", importance: "主导" },
          { name: "碳氮", formula: "C/N", percentage: 20, category: "元素", state: "等离子态", importance: "关键", note: "WN型" },
          { name: "碳氧", formula: "C/O", percentage: 20, category: "元素", state: "等离子态", importance: "关键", note: "WC型" },
          { name: "星风", formula: "Stellar Wind", percentage: 15, category: "星风", state: "等离子态", importance: "关键", note: "v~3000km/s" },
          { name: "氧", formula: "O", percentage: 5, category: "元素", state: "等离子态", importance: "重要", note: "WO型" },
        ],
        environment: { temperature: "30000-200000K", gravity: "中-低", pressure: "极高(核心)", radiation: "极强UV/X" },
      },
      {
        id: "brown-dwarf",
        name: "Brown Dwarf",
        nameCn: "褐矮星",
        type: "亚恒星",
        estimatedCount: "~数千亿-数万亿",
        description: "质量不足以维持氢聚变，介于恒星和行星之间",
        materials: [
          { name: "氢", formula: "H₂", percentage: 72, category: "元素", state: "分子态", importance: "主导" },
          { name: "氦", formula: "He", percentage: 25, category: "元素", state: "气态", importance: "关键" },
          { name: "铁雨", formula: "Fe Rain", percentage: 0.5, category: "金属", state: "液态", importance: "关键", note: "L型褐矮星特征" },
          { name: "Na/K蒸气", formula: "Na/K", percentage: 0.3, category: "碱金属", state: "气态", importance: "重要", note: "T型褐矮星特征" },
          { name: "CH₄", formula: "CH₄", percentage: 0.3, category: "分子", state: "分子态", importance: "关键", note: "T型标志" },
          { name: "NH₃", formula: "NH₃", percentage: 0.2, category: "分子", state: "分子态", importance: "重要", note: "Y型标志" },
          { name: "盐云", formula: "NaCl/KCl", percentage: 0.1, category: "盐", state: "固态", importance: "重要", note: "L/T过渡型" },
          { name: "硅酸盐云", formula: "Silicate", percentage: 0.3, category: "矿物", state: "固态", importance: "重要" },
          { name: "水冰", formula: "H₂O Ice", percentage: 0.1, category: "冰", state: "固态", importance: "次要", note: "Y型可能" },
          { name: "H₂S", formula: "H₂S", percentage: 0.2, category: "分子", state: "分子态", importance: "次要" },
        ],
        environment: { temperature: "250-2500K", gravity: "中-强", pressure: "高", radiation: "IR" },
      },
    ],
  },

  // ============================================================
  // 4. 行星 (数万亿+)
  // ============================================================
  {
    id: "planets",
    name: "Planets",
    nameCn: "行星",
    icon: "🪐",
    estimatedCount: "数万亿+ (保守估计1-10万亿)",
    description: "宇宙中围绕恒星运转的所有行星，含太阳系8大行星和系外行星",
    objects: [
      {
        id: "rocky-planet",
        name: "Rocky / Terrestrial Planet",
        nameCn: "岩石行星(类地行星)",
        type: "行星",
        estimatedCount: "~数千亿",
        description: "由岩石和金属组成的固态行星，如地球、火星",
        materials: [
          { name: "硅酸盐地幔", formula: "MgSiO₃/Mg₂SiO₄", percentage: 65, category: "矿物", state: "固态/液态", importance: "主导" },
          { name: "铁镍核心", formula: "Fe/Ni", percentage: 30, category: "金属", state: "固态/液态", importance: "关键" },
          { name: "地壳硅酸盐", formula: "SiO₂/Al₂O₃", percentage: 1, category: "矿物", state: "固态", importance: "重要" },
          { name: "大气层", formula: "N₂/O₂/CO₂", percentage: 0.001, category: "大气", state: "气态", importance: "关键" },
          { name: "水", formula: "H₂O", percentage: 0.02, category: "挥发物", state: "液态/固态", importance: "关键" },
          { name: "硫", formula: "S", percentage: 2, category: "非金属", state: "固态/液态", importance: "重要" },
          { name: "铝", formula: "Al", percentage: 1, category: "金属", state: "固态", importance: "重要" },
          { name: "钙", formula: "Ca", percentage: 1, category: "金属", state: "固态", importance: "次要" },
        ],
        environment: { temperature: "150-800K", gravity: "3-10m/s²", pressure: "0-10⁶ Pa", radiation: "中" },
        subTypes: [
          { id: "earth-like", name: "Earth-like", nameCn: "类地行星", estimatedCount: "~数百亿", description: "与地球大小和温度相似的行星", materials: [
            { name: "硅酸盐", formula: "Silicates", percentage: 60, category: "矿物", state: "固态", importance: "主导" },
            { name: "铁核", formula: "Fe/Ni Core", percentage: 32, category: "金属", state: "固态/液态", importance: "关键" },
            { name: "水", formula: "H₂O", percentage: 0.1, category: "挥发物", state: "液态", importance: "关键" },
            { name: "氮气", formula: "N₂", percentage: 5, category: "大气", state: "气态", importance: "关键" },
            { name: "氧气", formula: "O₂", percentage: 2, category: "大气", state: "气态", importance: "关键" },
            { name: "CO₂", formula: "CO₂", percentage: 0.8, category: "大气", state: "气态", importance: "重要" },
          ], environment: { temperature: "200-330K", gravity: "5-12m/s²", pressure: "10⁴-10⁵ Pa", radiation: "中" } },
          { id: "venus-like", name: "Venus-like", nameCn: "类金星行星", estimatedCount: "~数百亿", description: "失控温室效应的炙热行星", materials: [
            { name: "硅酸盐", formula: "Silicates", percentage: 70, category: "矿物", state: "固态", importance: "主导" },
            { name: "铁核", formula: "Fe Core", percentage: 28, category: "金属", state: "固态/液态", importance: "关键" },
            { name: "CO₂大气", formula: "CO₂", percentage: 1.5, category: "大气", state: "气态", importance: "关键" },
            { name: "N₂", formula: "N₂", percentage: 0.3, category: "大气", state: "气态", importance: "重要" },
            { name: "H₂SO₄云", formula: "H₂SO₄", percentage: 0.01, category: "大气", state: "液态", importance: "关键" },
            { name: "SO₂", formula: "SO₂", percentage: 0.02, category: "大气", state: "气态", importance: "重要" },
          ], environment: { temperature: "600-900K", gravity: "5-12m/s²", pressure: "10⁶-10⁷ Pa", radiation: "弱(云层遮挡)" } },
          { id: "mars-like", name: "Mars-like", nameCn: "类火星行星", estimatedCount: "~数千亿", description: "薄大气层的寒冷岩石行星", materials: [
            { name: "硅酸盐", formula: "Silicates", percentage: 70, category: "矿物", state: "固态", importance: "主导" },
            { name: "铁核", formula: "Fe Core", percentage: 25, category: "金属", state: "固态", importance: "关键" },
            { name: "氧化铁", formula: "Fe₂O₃", percentage: 3, category: "矿物", state: "固态", importance: "重要", note: "红色来源" },
            { name: "CO₂大气", formula: "CO₂", percentage: 0.5, category: "大气", state: "气态", importance: "重要" },
            { name: "水冰", formula: "H₂O Ice", percentage: 1, category: "挥发物", state: "固态", importance: "重要" },
            { name: "干冰", formula: "CO₂ Ice", percentage: 0.5, category: "挥发物", state: "固态", importance: "次要" },
          ], environment: { temperature: "150-300K", gravity: "2-5m/s²", pressure: "500-1000 Pa", radiation: "UV强" } },
        ],
      },
      {
        id: "gas-giant",
        name: "Gas Giant",
        nameCn: "气态巨行星",
        type: "行星",
        estimatedCount: "~数千亿",
        description: "以氢氦为主的巨行星，如木星、土星",
        materials: [
          { name: "分子氢", formula: "H₂", percentage: 75, category: "元素", state: "气态/液态/金属态", importance: "主导" },
          { name: "氦", formula: "He", percentage: 24, category: "元素", state: "气态/液态", importance: "关键" },
          { name: "金属氢", formula: "Metallic H", percentage: 5, category: "奇异物质", state: "金属态", importance: "关键", note: "深处高压相" },
          { name: "氨", formula: "NH₃", percentage: 0.3, category: "分子", state: "气态/固态", importance: "重要" },
          { name: "甲烷", formula: "CH₄", percentage: 0.2, category: "分子", state: "气态", importance: "重要" },
          { name: "水蒸气", formula: "H₂O", percentage: 0.1, category: "挥发物", state: "气态", importance: "重要" },
          { name: "H₂S", formula: "H₂S", percentage: 0.01, category: "分子", state: "气态", importance: "次要" },
          { name: "PH₃", formula: "PH₃", percentage: 0.001, category: "分子", state: "气态", importance: "次要" },
          { name: "重元素核心", formula: "Rocky/Ice Core", percentage: 1, category: "核心", state: "固态/液态", importance: "关键" },
        ],
        environment: { temperature: "100-1000K(表面)~20000K(核心)", gravity: "15-30m/s²", pressure: "10⁵-10¹² Pa", radiation: "热辐射" },
      },
      {
        id: "ice-giant",
        name: "Ice Giant",
        nameCn: "冰巨行星",
        type: "行星",
        estimatedCount: "~数千亿",
        description: "以水/氨/甲烷等挥发物为主的巨行星，如天王星、海王星",
        materials: [
          { name: "氢", formula: "H₂", percentage: 25, category: "元素", state: "气态", importance: "主导" },
          { name: "氦", formula: "He", percentage: 5, category: "元素", state: "气态", importance: "重要" },
          { name: "水", formula: "H₂O", percentage: 30, category: "挥发物", state: "超离子态/液态", importance: "关键", note: "超离子水" },
          { name: "甲烷", formula: "CH₄", percentage: 15, category: "挥发物", state: "气态/固态", importance: "关键", note: "蓝色来源" },
          { name: "氨", formula: "NH₃", percentage: 10, category: "挥发物", state: "液态/固态", importance: "重要" },
          { name: "H₂S", formula: "H₂S", percentage: 3, category: "分子", state: "气态", importance: "重要" },
          { name: "岩石核心", formula: "Rocky Core", percentage: 12, category: "核心", state: "固态", importance: "关键" },
        ],
        environment: { temperature: "50-500K(表面)~7000K(核心)", gravity: "8-15m/s²", pressure: "10⁵-10¹¹ Pa", radiation: "IR" },
      },
      {
        id: "hot-jupiter",
        name: "Hot Jupiter",
        nameCn: "热木星",
        type: "系外行星",
        estimatedCount: "~数百亿",
        description: "极近轨道的气态巨行星，表面温度>1000K",
        materials: [
          { name: "氢", formula: "H₂", percentage: 70, category: "元素", state: "气态", importance: "主导" },
          { name: "氦", formula: "He", percentage: 25, category: "元素", state: "气态", importance: "关键" },
          { name: "Na蒸气", formula: "Na", percentage: 0.5, category: "碱金属", state: "气态", importance: "关键", note: "透射光谱标志" },
          { name: "K蒸气", formula: "K", percentage: 0.1, category: "碱金属", state: "气态", importance: "重要" },
          { name: "TiO/VO", formula: "TiO/VO", percentage: 0.1, category: "金属氧化物", state: "气态", importance: "关键", note: "热反转层" },
          { name: "CO", formula: "CO", percentage: 0.3, category: "分子", state: "气态", importance: "重要" },
          { name: "H₂O蒸气", formula: "H₂O", percentage: 0.2, category: "挥发物", state: "气态", importance: "重要" },
          { name: "SiO蒸气", formula: "SiO", percentage: 0.05, category: "金属氧化物", state: "气态", importance: "重要", note: ">2000K时" },
          { name: "Fe蒸气", formula: "Fe", percentage: 0.02, category: "金属", state: "气态", importance: "关键", note: "极高温度下铁蒸气" },
          { name: "Mg蒸气", formula: "Mg", percentage: 0.01, category: "金属", state: "气态", importance: "重要" },
        ],
        environment: { temperature: "1000-4000K", gravity: "10-30m/s²", pressure: "10⁴-10⁷ Pa", radiation: "极强" },
      },
      {
        id: "super-earth",
        name: "Super-Earth",
        nameCn: "超级地球",
        type: "系外行星",
        estimatedCount: "~数千亿",
        description: "质量1-10倍地球的岩石行星，宇宙中最常见的行星类型",
        materials: [
          { name: "硅酸盐地幔", formula: "MgSiO₃", percentage: 50, category: "矿物", state: "固态/液态", importance: "主导" },
          { name: "铁核", formula: "Fe/Ni", percentage: 30, category: "金属", state: "固态/液态", importance: "关键" },
          { name: "高压冰", formula: "Ice VII/X", percentage: 10, category: "挥发物", state: "超离子态", importance: "重要", note: "超离子冰" },
          { name: "水/大气", formula: "H₂O/N₂/CO₂", percentage: 8, category: "大气", state: "多种", importance: "重要" },
          { name: "碳化物层", formula: "SiC/TiC", percentage: 2, category: "碳化物", state: "固态", importance: "次要" },
        ],
        environment: { temperature: "200-1000K", gravity: "10-30m/s²", pressure: "10⁵-10⁹ Pa", radiation: "中" },
      },
      {
        id: "lava-planet",
        name: "Lava Planet",
        nameCn: "熔岩行星",
        type: "系外行星",
        estimatedCount: "~数百亿",
        description: "表面完全覆盖岩浆海的极热行星",
        materials: [
          { name: "硅酸盐岩浆", formula: "Melt Silicates", percentage: 60, category: "熔体", state: "液态", importance: "主导" },
          { name: "铁核", formula: "Fe Core", percentage: 30, category: "金属", state: "液态", importance: "关键" },
          { name: "SiO蒸气", formula: "SiO", percentage: 3, category: "蒸气", state: "气态", importance: "关键" },
          { name: "Na/K蒸气", formula: "Na/K", percentage: 2, category: "碱金属", state: "气态", importance: "重要" },
          { name: "Fe蒸气", formula: "Fe", percentage: 1, category: "金属", state: "气态", importance: "重要" },
          { name: "Mg₂SiO₄蒸气", formula: "Mg₂SiO₄", percentage: 2, category: "蒸气", state: "气态", importance: "重要" },
          { name: "SiO₂蒸气", formula: "SiO₂", percentage: 2, category: "蒸气", state: "气态", importance: "重要" },
        ],
        environment: { temperature: "1500-4000K", gravity: "5-20m/s²", pressure: "10⁵-10⁸ Pa", radiation: "极强" },
        hazards: ["岩浆海", "金属蒸气雨", "极端温差"],
      },
      {
        id: "ocean-planet",
        name: "Ocean Planet",
        nameCn: "海洋行星",
        type: "系外行星",
        estimatedCount: "~数百亿",
        description: "表面完全被海洋覆盖的行星",
        materials: [
          { name: "水", formula: "H₂O", percentage: 40, category: "挥发物", state: "液态/超临界", importance: "主导" },
          { name: "硅酸盐", formula: "Silicates", percentage: 35, category: "矿物", state: "固态", importance: "关键" },
          { name: "铁核", formula: "Fe Core", percentage: 20, category: "金属", state: "固态/液态", importance: "关键" },
          { name: "高压冰", formula: "Ice VI/VII", percentage: 3, category: "冰", state: "固态", importance: "重要", note: "海底高压冰层" },
          { name: "N₂/O₂大气", formula: "N₂/O₂", percentage: 2, category: "大气", state: "气态", importance: "重要" },
        ],
        environment: { temperature: "250-400K", gravity: "5-15m/s²", pressure: "10⁵-10⁸ Pa", radiation: "中" },
        features: ["全球海洋", "高压冰层", "超级台风"],
      },
      {
        id: "carbon-planet",
        name: "Carbon Planet",
        nameCn: "碳行星",
        type: "系外行星",
        estimatedCount: "~数十亿",
        description: "碳含量高于氧的行星，含大量碳化物和钻石",
        materials: [
          { name: "碳化硅地幔", formula: "SiC", percentage: 30, category: "碳化物", state: "固态", importance: "主导" },
          { name: "铁核", formula: "Fe Core", percentage: 30, category: "金属", state: "固态/液态", importance: "关键" },
          { name: "碳化钛", formula: "TiC", percentage: 15, category: "碳化物", state: "固态", importance: "重要" },
          { name: "钻石层", formula: "Diamond", percentage: 10, category: "碳", state: "固态", importance: "关键", note: "地下钻石层" },
          { name: "石墨地壳", formula: "Graphite", percentage: 10, category: "碳", state: "固态", importance: "重要" },
          { name: "CO/CH₄大气", formula: "CO/CH₄", percentage: 5, category: "大气", state: "气态", importance: "重要" },
        ],
        environment: { temperature: "300-2000K", gravity: "5-15m/s²", pressure: "10⁵-10⁹ Pa", radiation: "中" },
        features: ["钻石层", "碳化物地幔", "焦油海洋"],
      },
      {
        id: "rogue-planet",
        name: "Rogue Planet",
        nameCn: "流浪行星",
        type: "行星",
        estimatedCount: "~数万亿-数百亿万亿",
        description: "不围绕任何恒星运转的行星，在星际空间流浪",
        materials: [
          { name: "硅酸盐", formula: "Silicates", percentage: 50, category: "矿物", state: "固态", importance: "主导" },
          { name: "铁核", formula: "Fe Core", percentage: 35, category: "金属", state: "固态", importance: "关键" },
          { name: "冰壳", formula: "H₂O/NH₃/CH₄ Ice", percentage: 10, category: "冰", state: "固态", importance: "重要", note: "绝缘层保持内部热量" },
          { name: "液态水层", formula: "H₂O Liquid", percentage: 3, category: "挥发物", state: "液态", importance: "关键", note: "地热维持" },
          { name: "放射热源", formula: "²³⁸U/²³²Th/⁴⁰K", percentage: 0.01, category: "放射性", state: "固态", importance: "关键", note: "维持内部热量" },
          { name: "稀薄大气", formula: "H₂/He", percentage: 2, category: "大气", state: "气态", importance: "重要" },
        ],
        environment: { temperature: "3-30K(表面)~300K(深海)", gravity: "3-15m/s²", pressure: "10⁻⁵-10⁷ Pa", radiation: "极弱" },
        features: ["星际流浪", "地下海洋", "放射性热源"],
      },
    ],
  },

  // ============================================================
  // 5. 黑洞 (数万亿+)
  // ============================================================
  {
    id: "black-holes",
    name: "Black Holes",
    nameCn: "黑洞",
    icon: "🕳️",
    estimatedCount: "数万亿-百亿万亿 (10¹²-10¹⁸)",
    description: "时空中引力极强的区域，连光都无法逃逸",
    objects: [
      {
        id: "stellar-black-hole",
        name: "Stellar Black Hole",
        nameCn: "恒星级黑洞",
        type: "黑洞",
        estimatedCount: "~数万亿-千万亿",
        description: "3-100太阳质量，大质量恒星超新星爆发后形成",
        materials: [
          { name: "奇点", formula: "Singularity", percentage: 90, category: "时空", state: "未知", importance: "主导", note: "量子引力范畴" },
          { name: "吸积盘", formula: "Accretion Disk", percentage: 8, category: "等离子体", state: "等离子态", importance: "关键" },
          { name: "相对论喷流", formula: "Relativistic Jet", percentage: 1, category: "等离子体", state: "等离子态", importance: "重要" },
          { name: "事件视界", formula: "Event Horizon", percentage: 1, category: "时空", state: "未知", importance: "关键" },
        ],
        environment: { temperature: "10⁶-10⁹K(吸积盘)", gravity: "∞(奇点)", pressure: "∞(奇点)", radiation: "X/γ" },
        hazards: ["潮汐力撕裂", "时间膨胀", "霍金辐射(极弱)"],
      },
      {
        id: "supermassive-black-hole",
        name: "Supermassive Black Hole",
        nameCn: "超大质量黑洞",
        type: "黑洞",
        estimatedCount: "~2万亿+ (每星系1个)",
        description: "10⁶-10¹⁰太阳质量，位于每个星系中心",
        materials: [
          { name: "奇点", formula: "Singularity", percentage: 85, category: "时空", state: "未知", importance: "主导" },
          { name: "吸积盘", formula: "Accretion Disk", percentage: 10, category: "等离子体", state: "等离子态", importance: "关键", note: "温度10⁵-10⁹K" },
          { name: "相对论喷流", formula: "Jet", percentage: 2, category: "等离子体", state: "等离子态", importance: "关键" },
          { name: "事件视界", formula: "Event Horizon", percentage: 1, category: "时空", state: "未知", importance: "关键" },
          { name: "光子球", formula: "Photon Sphere", percentage: 1, category: "光子", state: "未知", importance: "重要" },
          { name: "ISCO区域", formula: "ISCO", percentage: 1, category: "等离子体", state: "等离子态", importance: "重要", note: "最内稳定圆轨道" },
        ],
        environment: { temperature: "10⁵-10¹⁰K", gravity: "∞(奇点)", pressure: "∞(奇点)", radiation: "全波段极端" },
        features: ["星系核心", "AGN引擎", "引力波源"],
        subTypes: [
          { id: "smbh-quiet", name: "Quiet SMBH", nameCn: "沉寂超大质量黑洞", estimatedCount: "~1.9万亿", description: "不活跃的星系中心黑洞(如银河系Sgr A*)", materials: [
            { name: "奇点", formula: "Singularity", percentage: 99, category: "时空", state: "未知", importance: "主导" },
            { name: "稀薄吸积流", formula: "RIAF", percentage: 0.5, category: "等离子体", state: "等离子态", importance: "重要" },
            { name: "S星团", formula: "S-Stars", percentage: 0.5, category: "恒星", state: "等离子态", importance: "重要" },
          ], environment: { temperature: "10⁶K", gravity: "∞", pressure: "∞", radiation: "弱射电/X" } },
          { id: "smbh-active", name: "Active SMBH", nameCn: "活跃超大质量黑洞", estimatedCount: "~数十亿", description: "猛烈吸积的SMBH，驱动AGN/类星体", materials: [
            { name: "奇点", formula: "Singularity", percentage: 85, category: "时空", state: "未知", importance: "主导" },
            { name: "厚吸积盘", formula: "Thick Disk", percentage: 10, category: "等离子体", state: "等离子态", importance: "关键" },
            { name: "喷流", formula: "Jet", percentage: 3, category: "等离子体", state: "等离子态", importance: "关键" },
            { name: "尘埃环", formula: "Torus", percentage: 2, category: "尘埃", state: "固态", importance: "重要" },
          ], environment: { temperature: "10⁷-10¹⁰K", gravity: "∞", pressure: "∞", radiation: "全波段极端" } },
        ],
      },
      {
        id: "intermediate-black-hole",
        name: "Intermediate-mass Black Hole",
        nameCn: "中等质量黑洞",
        type: "黑洞",
        estimatedCount: "~数百万-数十亿(待确认)",
        description: "100-10⁶太阳质量，可能是球状星团核心",
        materials: [
          { name: "奇点", formula: "Singularity", percentage: 90, category: "时空", state: "未知", importance: "主导" },
          { name: "吸积盘", formula: "Accretion Disk", percentage: 5, category: "等离子体", state: "等离子态", importance: "关键" },
          { name: "潮汐碎片", formula: "Tidal Debris", percentage: 5, category: "重子物质", state: "多种", importance: "重要" },
        ],
        environment: { temperature: "10⁶-10⁸K", gravity: "∞", pressure: "∞", radiation: "X射线" },
      },
      {
        id: "primordial-black-hole",
        name: "Primordial Black Hole",
        nameCn: "原初黑洞",
        type: "黑洞",
        estimatedCount: "~未知(理论预测)",
        description: "宇宙大爆炸早期形成的微型黑洞",
        materials: [
          { name: "奇点", formula: "Singularity", percentage: 99, category: "时空", state: "未知", importance: "主导" },
          { name: "霍金辐射", formula: "Hawking Radiation", percentage: 1, category: "量子效应", state: "未知", importance: "关键", note: "黑体辐射谱" },
        ],
        environment: { temperature: "6×10⁻⁸(M☉/M)K", gravity: "∞", pressure: "∞", radiation: "霍金辐射" },
        features: ["可能为暗物质候选", "霍金蒸发", "微小质量"],
      },
    ],
  },

  // ============================================================
  // 6. 星云与星际介质
  // ============================================================
  {
    id: "nebulae",
    name: "Nebulae & ISM",
    nameCn: "星云与星际介质",
    icon: "🌫",
    estimatedCount: "数十亿+ (银河系内~数千)",
    description: "星际空间中的气体和尘埃云，是恒星诞生和死亡的场所",
    objects: [
      {
        id: "molecular-cloud",
        name: "Molecular Cloud",
        nameCn: "分子云",
        type: "星云",
        estimatedCount: "~数百万(银河系内~6000)",
        description: "恒星形成的摇篮，温度仅10-20K",
        materials: [
          { name: "分子氢", formula: "H₂", percentage: 75, category: "分子", state: "分子态", importance: "主导" },
          { name: "氦", formula: "He", percentage: 23, category: "元素", state: "气态", importance: "关键" },
          { name: "CO", formula: "CO", percentage: 0.5, category: "分子", state: "分子态", importance: "关键", note: "最重要示踪剂" },
          { name: "尘埃", formula: "Silicate/C", percentage: 1, category: "尘埃", state: "固态", importance: "重要" },
          { name: "NH₃", formula: "NH₃", percentage: 0.05, category: "分子", state: "固态(冰)", importance: "重要" },
          { name: "H₂O冰", formula: "H₂O Ice", percentage: 0.1, category: "冰", state: "固态", importance: "重要" },
          { name: "甲醇", formula: "CH₃OH", percentage: 0.01, category: "有机分子", state: "分子态/固态", importance: "重要" },
          { name: "HCN", formula: "HCN", percentage: 0.005, category: "有机分子", state: "分子态", importance: "重要" },
          { name: "HCO⁺", formula: "HCO⁺", percentage: 0.003, category: "离子", state: "离子态", importance: "重要" },
          { name: "甲醛", formula: "H₂CO", percentage: 0.002, category: "有机分子", state: "分子态", importance: "重要" },
          { name: "乙醇", formula: "C₂H₅OH", percentage: 0.001, category: "有机分子", state: "分子态", importance: "重要", note: "星际酒精" },
          { name: "二甲醚", formula: "CH₃OCH₃", percentage: 0.0005, category: "有机分子", state: "分子态", importance: "次要" },
          { name: "PAH", formula: "C₂₂H₁₂+", percentage: 0.01, category: "有机分子", state: "固态/分子态", importance: "重要", note: "多环芳烃" },
          { name: "甘氨酸", formula: "NH₂CH₂COOH", percentage: 0.0001, category: "氨基酸", state: "固态", importance: "关键", note: "最简氨基酸" },
          { name: "甲胺", formula: "CH₃NH₂", percentage: 0.0002, category: "有机分子", state: "分子态", importance: "重要" },
        ],
        environment: { temperature: "10-20K", gravity: "微弱", pressure: "10⁻¹³ Pa", radiation: "微波/IR" },
        features: ["恒星工厂", "深冷环境", "有机化学实验室"],
      },
      {
        id: "emission-nebula",
        name: "Emission Nebula",
        nameCn: "发射星云",
        type: "星云",
        estimatedCount: "~数百万",
        description: "被年轻恒星UV辐射电离的气体云，发出美丽光芒",
        materials: [
          { name: "电离氢", formula: "HII", percentage: 70, category: "离子", state: "等离子态", importance: "主导", note: "Hα红光" },
          { name: "电离氦", formula: "HeII/III", percentage: 20, category: "离子", state: "等离子态", importance: "重要" },
          { name: "[OIII]", formula: "O²⁺", percentage: 2, category: "离子", state: "等离子态", importance: "关键", note: "5007Å绿光" },
          { name: "[NII]", formula: "N⁺", percentage: 1, category: "离子", state: "等离子态", importance: "重要" },
          { name: "[SII]", formula: "S⁺", percentage: 0.5, category: "离子", state: "等离子态", importance: "重要" },
          { name: "尘埃", formula: "Dust", percentage: 5, category: "尘埃", state: "固态", importance: "重要" },
          { name: "中性氢", formula: "HI", percentage: 1.5, category: "元素", state: "气态", importance: "次要" },
        ],
        environment: { temperature: "8000-20000K", gravity: "微弱", pressure: "10⁻¹² Pa", radiation: "UV强" },
      },
      {
        id: "planetary-nebula",
        name: "Planetary Nebula",
        nameCn: "行星状星云",
        type: "星云",
        estimatedCount: "~数十亿(银河系内~1500)",
        description: "低质量恒星死亡时抛出的气体壳层",
        materials: [
          { name: "电离氢", formula: "HII", percentage: 50, category: "离子", state: "等离子态", importance: "主导" },
          { name: "氦", formula: "He", percentage: 30, category: "元素", state: "等离子态", importance: "关键" },
          { name: "碳", formula: "C²⁺/C³⁺", percentage: 5, category: "元素", state: "等离子态", importance: "关键", note: "AGB核合成" },
          { name: "氮", formula: "N²⁺", percentage: 3, category: "元素", state: "等离子态", importance: "重要" },
          { name: "氧", formula: "O²⁺/O³⁺", percentage: 5, category: "元素", state: "等离子态", importance: "重要" },
          { name: "氖", formula: "Ne²⁺", percentage: 1, category: "元素", state: "等离子态", importance: "次要" },
          { name: "硫", formula: "S⁺/S²⁺", percentage: 0.5, category: "元素", state: "等离子态", importance: "次要" },
          { name: "尘埃", formula: "Carbonaceous", percentage: 3, category: "尘埃", state: "固态", importance: "重要" },
          { name: "PAH", formula: "PAH", percentage: 1, category: "有机", state: "固态", importance: "重要" },
          { name: "分子氢", formula: "H₂", percentage: 1.5, category: "分子", state: "分子态", importance: "重要" },
        ],
        environment: { temperature: "8000-15000K", gravity: "微弱", pressure: "10⁻¹² Pa", radiation: "UV" },
      },
      {
        id: "supernova-remnant",
        name: "Supernova Remnant",
        nameCn: "超新星残骸",
        type: "星云",
        estimatedCount: "~数百万(银河系内~300)",
        description: "超新星爆发后向外膨胀的激波和抛射物",
        materials: [
          { name: "氢", formula: "H", percentage: 30, category: "元素", state: "等离子态", importance: "主导" },
          { name: "氦", formula: "He", percentage: 20, category: "元素", state: "等离子态", importance: "重要" },
          { name: "氧", formula: "O", percentage: 10, category: "元素", state: "等离子态", importance: "关键" },
          { name: "碳", formula: "C", percentage: 5, category: "元素", state: "等离子态", importance: "重要" },
          { name: "硅", formula: "Si", percentage: 5, category: "元素", state: "等离子态", importance: "重要" },
          { name: "铁", formula: "Fe", percentage: 8, category: "元素", state: "等离子态", importance: "关键" },
          { name: "镍-56", formula: "⁵⁶Ni→⁵⁶Co→⁵⁶Fe", percentage: 3, category: "放射性", state: "等离子态", importance: "关键", note: "超新星光源" },
          { name: "r过程元素", formula: "Au/Pt/U/Th", percentage: 0.01, category: "重元素", state: "等离子态", importance: "关键", note: "快中子俘获" },
          { name: "激波加速粒子", formula: "CR Particles", percentage: 5, category: "宇宙射线", state: "未知", importance: "关键" },
          { name: "尘埃", formula: "Dust", percentage: 10, category: "尘埃", state: "固态", importance: "重要" },
          { name: "钴-56", formula: "⁵⁶Co", percentage: 2, category: "放射性", state: "等离子态", importance: "重要" },
          { name: "钛-44", formula: "⁴⁴Ti", percentage: 0.001, category: "放射性", state: "等离子态", importance: "重要", note: "超新星示踪" },
          { name: "铝-26", formula: "²⁶Al", percentage: 0.001, category: "放射性", state: "等离子态", importance: "重要", note: "1.8MeV γ线" },
        ],
        environment: { temperature: "10⁴-10⁸K", gravity: "微弱", pressure: "10⁻⁹ Pa", radiation: "X/γ/射电" },
        features: ["r过程工厂", "宇宙射线加速器", "星际化学富化"],
      },
      {
        id: "dark-nebula",
        name: "Dark Nebula",
        nameCn: "暗星云",
        type: "星云",
        estimatedCount: "~数百万",
        description: "致密的尘埃云，遮挡背景星光",
        materials: [
          { name: "分子氢", formula: "H₂", percentage: 70, category: "分子", state: "分子态", importance: "主导" },
          { name: "尘埃", formula: "Silicate/Carbon", percentage: 10, category: "尘埃", state: "固态", importance: "关键" },
          { name: "CO", formula: "CO", percentage: 1, category: "分子", state: "分子态", importance: "关键" },
          { name: "冰幔颗粒", formula: "H₂O/CO/CO₂ Ice", percentage: 3, category: "冰", state: "固态", importance: "重要" },
          { name: "氨", formula: "NH₃", percentage: 0.1, category: "分子", state: "固态", importance: "重要" },
          { name: "CS", formula: "CS", percentage: 0.01, category: "分子", state: "分子态", importance: "重要" },
          { name: "SO₂", formula: "SO₂", percentage: 0.01, category: "分子", state: "分子态", importance: "次要" },
        ],
        environment: { temperature: "5-15K", gravity: "微弱", pressure: "10⁻¹³ Pa", radiation: "极弱(屏蔽)" },
      },
    ],
  },

  // ============================================================
  // 7. 小天体
  // ============================================================
  {
    id: "small-bodies",
    name: "Small Bodies",
    nameCn: "小天体",
    icon: "☄️",
    estimatedCount: "百亿万亿+ (10¹⁸+)",
    description: "小行星、彗星、流星体、柯伊伯带天体、奥尔特云天体等",
    objects: [
      {
        id: "asteroid",
        name: "Asteroid",
        nameCn: "小行星",
        type: "小天体",
        estimatedCount: "~10亿+ (太阳系), 全宇宙~10²⁰+",
        description: "围绕恒星运转的岩石/金属小天体",
        materials: [
          { name: "硅酸盐", formula: "Silicates", percentage: 40, category: "矿物", state: "固态", importance: "主导", note: "S型" },
          { name: "碳质物", formula: "Carbonaceous", percentage: 30, category: "碳", state: "固态", importance: "关键", note: "C型" },
          { name: "铁镍合金", formula: "Fe/Ni", percentage: 20, category: "金属", state: "固态", importance: "关键", note: "M型" },
          { name: "水冰", formula: "H₂O Ice", percentage: 5, category: "挥发物", state: "固态", importance: "重要" },
          { name: "有机物", formula: "Organics", percentage: 3, category: "有机", state: "固态", importance: "重要" },
          { name: "铂族金属", formula: "Pt/Rh/Pd/Ir", percentage: 0.01, category: "贵金属", state: "固态", importance: "关键", note: "采矿价值" },
        ],
        environment: { temperature: "150-400K", gravity: "微弱", pressure: "~0", radiation: "UV" },
        subTypes: [
          { id: "c-type-asteroid", name: "C-type", nameCn: "碳质小行星", estimatedCount: "~75%小行星", description: "含大量碳和有机物", materials: [
            { name: "碳质基质", formula: "Carbon Matrix", percentage: 50, category: "碳", state: "固态", importance: "主导" },
            { name: "层状硅酸盐", formula: "Phyllosilicates", percentage: 25, category: "矿物", state: "固态", importance: "关键" },
            { name: "水冰", formula: "H₂O", percentage: 10, category: "挥发物", state: "固态", importance: "重要" },
            { name: "有机物", formula: "Organics", percentage: 8, category: "有机", state: "固态", importance: "重要" },
            { name: "铁镍", formula: "Fe/Ni", percentage: 5, category: "金属", state: "固态", importance: "重要" },
            { name: "氨基酸", formula: "Amino Acids", percentage: 0.001, category: "有机", state: "固态", importance: "关键", note: "生命前体" },
          ], environment: { temperature: "150-250K", gravity: "极弱", pressure: "~0", radiation: "弱" } },
          { id: "s-type-asteroid", name: "S-type", nameCn: "硅质小行星", estimatedCount: "~17%小行星", description: "硅酸盐为主", materials: [
            { name: "辉石", formula: "Pyroxene", percentage: 40, category: "矿物", state: "固态", importance: "主导" },
            { name: "橄榄石", formula: "Olivine", percentage: 25, category: "矿物", state: "固态", importance: "关键" },
            { name: "铁镍", formula: "Fe/Ni", percentage: 20, category: "金属", state: "固态", importance: "重要" },
            { name: "长石", formula: "Feldspar", percentage: 15, category: "矿物", state: "固态", importance: "重要" },
          ], environment: { temperature: "200-400K", gravity: "极弱", pressure: "~0", radiation: "中" } },
          { id: "m-type-asteroid", name: "M-type", nameCn: "金属小行星", estimatedCount: "~8%小行星", description: "几乎纯铁镍合金", materials: [
            { name: "铁", formula: "Fe", percentage: 70, category: "金属", state: "固态", importance: "主导" },
            { name: "镍", formula: "Ni", percentage: 15, category: "金属", state: "固态", importance: "关键" },
            { name: "钴", formula: "Co", percentage: 2, category: "金属", state: "固态", importance: "重要" },
            { name: "铂族", formula: "PGM", percentage: 0.01, category: "贵金属", state: "固态", importance: "关键", note: "极高采矿价值" },
            { name: "硅酸盐", formula: "Silicates", percentage: 13, category: "矿物", state: "固态", importance: "次要" },
          ], environment: { temperature: "200-350K", gravity: "极弱", pressure: "~0", radiation: "中" } },
        ],
      },
      {
        id: "comet",
        name: "Comet",
        nameCn: "彗星",
        type: "小天体",
        estimatedCount: "~10万亿+(奥尔特云), 全宇宙~10²⁵+",
        description: "由冰和尘埃组成的脏雪球，接近恒星时产生彗发和彗尾",
        materials: [
          { name: "水冰", formula: "H₂O Ice", percentage: 40, category: "冰", state: "固态", importance: "主导" },
          { name: "CO冰", formula: "CO Ice", percentage: 15, category: "冰", state: "固态", importance: "关键" },
          { name: "CO₂冰", formula: "CO₂ Ice", percentage: 10, category: "冰", state: "固态", importance: "重要" },
          { name: "尘埃", formula: "Silicate/C", percentage: 20, category: "尘埃", state: "固态", importance: "重要" },
          { name: "甲烷冰", formula: "CH₄ Ice", percentage: 5, category: "冰", state: "固态", importance: "重要" },
          { name: "氨冰", formula: "NH₃ Ice", percentage: 3, category: "冰", state: "固态", importance: "重要" },
          { name: "有机物", formula: "Organics", percentage: 5, category: "有机", state: "固态", importance: "关键" },
          { name: "H₂CO", formula: "H₂CO", percentage: 1, category: "有机", state: "分子态", importance: "重要" },
          { name: "HCN", formula: "HCN", percentage: 0.5, category: "有机", state: "分子态", importance: "重要" },
          { name: "CH₃OH", formula: "CH₃OH", percentage: 0.5, category: "有机", state: "分子态", importance: "重要" },
        ],
        environment: { temperature: "5-400K(近日点)", gravity: "极弱", pressure: "~0-10⁻⁵ Pa", radiation: "弱-强" },
        features: ["彗发", "离子尾", "尘埃尾", "太阳系原始物质"],
      },
      {
        id: "kuiper-belt-object",
        name: "Kuiper Belt Object",
        nameCn: "柯伊伯带天体",
        type: "小天体",
        estimatedCount: "~10万+ (太阳系), 全宇宙~10²⁰+",
        description: "海王星轨道外的冰质天体，包括冥王星等",
        materials: [
          { name: "水冰", formula: "H₂O Ice", percentage: 30, category: "冰", state: "固态", importance: "主导" },
          { name: "甲烷冰", formula: "CH₄ Ice", percentage: 15, category: "冰", state: "固态", importance: "关键" },
          { name: "氮冰", formula: "N₂ Ice", percentage: 15, category: "冰", state: "固态", importance: "关键", note: "冥王星表面" },
          { name: "CO冰", formula: "CO Ice", percentage: 10, category: "冰", state: "固态", importance: "重要" },
          { name: "硅酸盐岩石", formula: "Silicates", percentage: 20, category: "矿物", state: "固态", importance: "重要" },
          { name: "有机物", formula: "Tholins", percentage: 10, category: "有机", state: "固态", importance: "重要", note: "托林——红色来源" },
        ],
        environment: { temperature: "30-60K", gravity: "极弱", pressure: "~0", radiation: "极弱" },
      },
    ],
  },

  // ============================================================
  // 8. 暗物质与暗能量
  // ============================================================
  {
    id: "dark-sector",
    name: "Dark Sector",
    nameCn: "暗物质与暗能量",
    icon: "👻",
    estimatedCount: "占宇宙95.1%",
    description: "宇宙中95%的成分：暗物质26.8% + 暗能量68.3%",
    objects: [
      {
        id: "dark-matter",
        name: "Dark Matter",
        nameCn: "暗物质",
        type: "暗物质",
        estimatedCount: "宇宙质量的26.8%",
        description: "通过引力效应推断的不可见物质，主导宇宙结构形成",
        materials: [
          { name: "WIMP", formula: "χ (100GeV-1TeV)", percentage: 40, category: "暗物质粒子", state: "未知", importance: "关键", note: "弱相互作用大质量粒子" },
          { name: "轴子", formula: "a (μeV-meV)", percentage: 25, category: "暗物质粒子", state: "未知", importance: "重要", note: "QCD轴子" },
          { name: "中性子", formula: "Neutralino", percentage: 15, category: "暗物质粒子", state: "未知", importance: "重要", note: "超对称最轻粒子" },
          { name: "暗光子", formula: "A'", percentage: 10, category: "暗力", state: "未知", importance: "次要", note: "暗电磁力载体" },
          { name: "原始黑洞", formula: "PBH", percentage: 5, category: "黑洞", state: "奇点", importance: "次要", note: "暗物质候选" },
          { name: "惰性中微子", formula: "ν_s (keV)", percentage: 5, category: "暗物质粒子", state: "未知", importance: "次要" },
        ],
        environment: { temperature: "未知", gravity: "主导可见物质运动", pressure: "未知", radiation: "无(或极弱)" },
        features: ["星系旋转曲线", "引力透镜", "宇宙结构骨架", "子弹星团证据"],
      },
      {
        id: "dark-energy",
        name: "Dark Energy",
        nameCn: "暗能量",
        type: "暗能量",
        estimatedCount: "宇宙能量的68.3%",
        description: "驱动宇宙加速膨胀的神秘能量",
        materials: [
          { name: "宇宙学常数", formula: "Λ = 10⁻⁵² m⁻²", percentage: 60, category: "真空能", state: "未知", importance: "主导", note: "爱因斯坦宇宙学常数" },
          { name: "精质场", formula: "Quintessence φ", percentage: 25, category: "标量场", state: "未知", importance: "重要", note: "动力学暗能量" },
          { name: "量子真空能", formula: "ρ_vac", percentage: 10, category: "真空涨落", state: "未知", importance: "重要", note: "比观测值大10¹²⁰倍" },
          { name: "幽灵能量", formula: "Phantom w<-1", percentage: 5, category: "奇异能量", state: "未知", importance: "理论预测", note: "大撕裂假说" },
        ],
        environment: { temperature: "未知", gravity: "排斥(反引力)", pressure: "负压", radiation: "无" },
        features: ["加速膨胀", "哈勃张力", "可能的大撕裂终局"],
      },
    ],
  },

  // ============================================================
  // 9. 宇宙射线与高能粒子
  // ============================================================
  {
    id: "cosmic-rays",
    name: "Cosmic Rays & High Energy",
    nameCn: "宇宙射线与高能粒子",
    icon: "☢️",
    estimatedCount: "持续 bombardment",
    description: "来自宇宙的高能粒子流，包含最高能量的粒子",
    objects: [
      {
        id: "cosmic-rays-particles",
        name: "Cosmic Rays",
        nameCn: "宇宙射线",
        type: "高能粒子",
        estimatedCount: "~10⁴/m²/s(地表)",
        description: "来自宇宙的高能带电粒子流",
        materials: [
          { name: "质子", formula: "p", percentage: 85, category: "核子", state: "未知", importance: "主导" },
          { name: "α粒子", formula: "He²⁺", percentage: 12, category: "核子", state: "未知", importance: "关键" },
          { name: "重离子", formula: "C/O/Fe等", percentage: 1, category: "重核", state: "未知", importance: "重要" },
          { name: "电子", formula: "e⁻", percentage: 1, category: "轻子", state: "未知", importance: "重要" },
          { name: "正电子", formula: "e⁺", percentage: 0.1, category: "反物质", state: "未知", importance: "重要", note: "暗物质湮灭信号？" },
          { name: "反质子", formula: "p̄", percentage: 0.01, category: "反物质", state: "未知", importance: "重要" },
          { name: "中微子", formula: "ν", percentage: 0.9, category: "轻子", state: "未知", importance: "重要" },
          { name: "Oh-My-God粒子", formula: "UHECR 3×10²⁰eV", percentage: 0.000001, category: "超高能", state: "未知", importance: "关键", note: "已知最高能量粒子" },
        ],
        environment: { temperature: "10¹²K+(等效)", gravity: "受磁场偏转", pressure: "N/A", radiation: "次级粒子簇射" },
        features: ["能量跨越13个量级", "Oh-My-God粒子", "广延大气簇射"],
      },
      {
        id: "gamma-ray-burst",
        name: "Gamma-Ray Burst",
        nameCn: "伽马射线暴",
        type: "高能事件",
        estimatedCount: "~每天1-2次(可观测)",
        description: "宇宙中最猛烈的爆炸，数秒释放超过太阳一生能量",
        materials: [
          { name: "伽马光子", formula: "γ (>100keV)", percentage: 50, category: "光子", state: "未知", importance: "主导" },
          { name: "相对论性喷流", formula: "Relativistic Jet", percentage: 30, category: "等离子体", state: "等离子态", importance: "关键" },
          { name: "r过程元素", formula: "Au/Pt/U", percentage: 5, category: "重元素", state: "等离子态", importance: "关键", note: "千新星/并合暴" },
          { name: "中微子暴", formula: "ν burst", percentage: 10, category: "轻子", state: "未知", importance: "重要" },
          { name: "引力波", formula: "GW", percentage: 5, category: "时空波", state: "未知", importance: "关键", note: "双中子星并合" },
        ],
        environment: { temperature: "10¹⁰K+", gravity: "极强", pressure: "极高", radiation: "极端γ" },
        hazards: ["毁灭性辐射", "臭氧层破坏", "物种灭绝级事件"],
      },
    ],
  },

  // ============================================================
  // 10. 宇宙起源
  // ============================================================
  {
    id: "cosmic-origin",
    name: "Cosmic Origin",
    nameCn: "宇宙起源与演化",
    icon: "💫",
    estimatedCount: "1",
    description: "从大爆炸到现在的138亿年宇宙演化全过程",
    objects: [
      {
        id: "big-bang",
        name: "Big Bang",
        nameCn: "大爆炸",
        type: "宇宙事件",
        estimatedCount: "1",
        description: "宇宙的起点，一切物质、能量、时间和空间的起源",
        materials: [
          { name: "夸克-胶子等离子体", formula: "QGP", percentage: 40, category: "基本粒子", state: "夸克-胶子等离子态", importance: "主导", note: "t<10⁻⁶s" },
          { name: "光子", formula: "γ", percentage: 25, category: "规范玻色子", state: "未知", importance: "关键" },
          { name: "轻子", formula: "e/μ/τ/ν", percentage: 15, category: "轻子", state: "未知", importance: "重要" },
          { name: "反物质", formula: "p̄/e⁺", percentage: 10, category: "反物质", state: "未知", importance: "重要", note: "几乎全部湮灭" },
          { name: "希格斯场", formula: "H", percentage: 5, category: "标量场", state: "未知", importance: "关键", note: "赋予质量" },
          { name: "暴胀场", formula: "Inflaton φ", percentage: 5, category: "标量场", state: "未知", importance: "关键", note: "驱动暴胀" },
        ],
        environment: { temperature: ">10³²K(普朗克温度)", gravity: "量子引力", pressure: "∞", radiation: "所有形式极端" },
      },
      {
        id: "big-bang-nucleosynthesis",
        name: "Big Bang Nucleosynthesis",
        nameCn: "大爆炸核合成",
        type: "宇宙事件",
        estimatedCount: "1",
        description: "大爆炸后3分钟内形成轻元素的过程",
        materials: [
          { name: "氢", formula: "¹H", percentage: 75, category: "元素", state: "等离子态", importance: "主导", note: "宇宙最丰富元素" },
          { name: "氦-4", formula: "⁴He", percentage: 24, category: "元素", state: "等离子态", importance: "关键", note: "第二大丰度" },
          { name: "氘", formula: "²H(D)", percentage: 0.003, category: "元素", state: "等离子态", importance: "关键", note: "大爆炸关键检验" },
          { name: "氦-3", formula: "³He", percentage: 0.001, category: "元素", state: "等离子态", importance: "重要" },
          { name: "锂-7", formula: "⁷Li", percentage: 0.0000001, category: "元素", state: "等离子态", importance: "关键", note: "锂问题：观测值比预测低3倍" },
          { name: "微量铍/硼", formula: "⁹Be/¹¹B", percentage: 0.00000001, category: "元素", state: "等离子态", importance: "次要" },
        ],
        environment: { temperature: "10⁹-10¹⁰K", gravity: "中等", pressure: "极高", radiation: "极强" },
      },
      {
        id: "recombination",
        name: "Recombination Epoch",
        nameCn: "复合时期",
        type: "宇宙事件",
        estimatedCount: "1",
        description: "大爆炸38万年后，电子与质子结合形成中性原子，宇宙变透明",
        materials: [
          { name: "中性氢", formula: "HI", percentage: 75, category: "原子", state: "气态", importance: "主导" },
          { name: "中性氦", formula: "HeI", percentage: 24, category: "原子", state: "气态", importance: "关键" },
          { name: "光子", formula: "γ (CMB)", percentage: 0.01, category: "辐射", state: "未知", importance: "关键", note: "脱耦→CMB" },
          { name: "暗物质", formula: "DM", percentage: 85, category: "暗物质", state: "未知", importance: "主导" },
        ],
        environment: { temperature: "3000K→2.725K(今)", gravity: "弱", pressure: "10⁻¹⁷ Pa", radiation: "CMB" },
      },
    ],
  },
];

// ========== 统计信息 ==========

export const COSMIC_TAXONOMY_STATS = {
  totalCategories: COSMIC_TAXONOMY.length,
  totalObjects: COSMIC_TAXONOMY.reduce((sum, cat) => sum + cat.objects.length, 0),
  totalSubTypes: COSMIC_TAXONOMY.reduce((sum, cat) =>
    sum + cat.objects.reduce((s, obj) => s + (obj.subTypes?.length ?? 0), 0), 0),
  totalMaterialEntries: COSMIC_TAXONOMY.reduce((sum, cat) =>
    sum + cat.objects.reduce((s, obj) =>
      s + obj.materials.length + (obj.subTypes?.reduce((ss, st) => ss + st.materials.length, 0) ?? 0), 0), 0),
  cosmologicalComposition: {
    darkEnergy: 68.3,
    darkMatter: 26.8,
    baryonicMatter: 4.9,
  },
  estimatedTotalGalaxies: "2万亿+",
  estimatedTotalStars: "2×10²³",
  estimatedTotalPlanets: "1-10万亿",
  estimatedTotalBlackHoles: "10¹²-10¹⁸",
  estimatedTotalSmallBodies: "10¹⁸+",
};
