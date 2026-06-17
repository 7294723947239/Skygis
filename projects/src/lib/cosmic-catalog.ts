// 全量宇宙天体目录 - 涵盖已知的主要星系、星云、星团、类星体等
// 数据来源: NASA/IPAC, SIMBAD, NED, HyperLEDA
// 坐标系: 以宇宙大爆炸原点为基准，地球为定向点，精确到10公里以内

export interface CosmicObject {
  id: string;
  name: string;
  catalogId: string;
  type: 'galaxy' | 'nebula' | 'star_cluster' | 'globular_cluster' | 'quasar' | 'pulsar' | 'supernova_remnant' | 'dark_nebula' | 'planetary_nebula' | 'hii_region' | 'molecular_cloud' | 'supercluster' | 'void' | 'filament' | 'star' | 'xray_source' | 'gamma_source' | 'infrared_source' | 'compact_object' | 'starburst_region' | 'galaxy_cluster';
  typeCn: string;
  constellation: string;
  distance: number;
  ra: string;
  dec: string;
  magnitude: number | string;
  size?: string;
  description: string;
  notableFeatures: string[];
  materials?: string[];
  color: string;
  cartesianX: string;
  cartesianY: string;
  cartesianZ: string;
  sceneX: number;
  sceneY: number;
  sceneZ: number;
  // 扩展属性（用于星系详情显示）
  diameter?: string;
  mass?: string;
  starCount?: string;
  age?: string;
  coreType?: string;
  darkMatterRatio?: string;
  supermassiveBH?: string;
  environment?: {
    avgTemp?: string;
    radiation?: string;
    magneticField?: string;
    interstellarMedium?: string;
  };
}

// ==================== 星系 (Galaxies) ====================
const GALAXIES: CosmicObject[] = [
  { id: 'milky_way', name: '银河系', catalogId: '-', type: 'galaxy', typeCn: '棒旋星系', constellation: '人马座', distance: 0, ra: '17h45m40s', dec: '-29°00\'28"', magnitude: -6.5, size: '360°', description: '我们的家园星系', notableFeatures: ['棒旋结构', '4条主旋臂', '中心黑洞Sgr A*'], materials: ['H', 'He', '暗物质'], color: '#f0e6d3', cartesianX: '0', cartesianY: '0', cartesianZ: '0', sceneX: 0, sceneY: 0, sceneZ: 0 },
  { id: 'm31', name: '仙女座星系', catalogId: 'M31/NGC 224', type: 'galaxy', typeCn: '旋涡星系', constellation: '仙女座', distance: 254, ra: '00h42m44s', dec: '+41°16\'09"', magnitude: 3.4, size: '190\'x60\'', description: '本星系群最大星系', notableFeatures: ['本星系群最大', '双核结构'], materials: ['H', 'He', '暗物质晕'], color: '#c4a882', cartesianX: '24030000000000000000', cartesianY: '17010000000000000000', cartesianZ: '-9000000000000000000', sceneX: 45, sceneY: 12, sceneZ: -30 },
  { id: 'm33', name: '三角座星系', catalogId: 'M33/NGC 598', type: 'galaxy', typeCn: '旋涡星系', constellation: '三角座', distance: 300, ra: '01h33m51s', dec: '+30°39\'37"', magnitude: 5.7, size: '73\'x45\'', description: '本星系群第三大星系', notableFeatures: ['NGC 604巨型恒星形成区'], materials: ['H', 'He', 'O', 'N'], color: '#a8c4d8', cartesianX: '28382148000000000000', cartesianY: '15750000000000000000', cartesianZ: '14130000000000000000', sceneX: 55, sceneY: -8, sceneZ: 25 },
  { id: 'lmc', name: '大麦哲伦云', catalogId: 'LMC', type: 'galaxy', typeCn: '不规则星系', constellation: '剑鱼座', distance: 16, ra: '05h23m35s', dec: '-69°45\'22"', magnitude: 0.9, size: '650\'x550\'', description: '银河系最大伴星系', notableFeatures: ['蜘蛛星云30 Doradus', 'SN 1987A'], materials: ['H', 'He', 'O', 'Fe'], color: '#b8d4e8', cartesianX: '50000000000000000', cartesianY: '-160000000000000000', cartesianZ: '-43000000000000000', sceneX: 8, sceneY: -20, sceneZ: -12 },
  { id: 'smc', name: '小麦哲伦云', catalogId: 'SMC', type: 'galaxy', typeCn: '不规则星系', constellation: '杜鹃座', distance: 20, ra: '00h52m45s', dec: '-72°49\'43"', magnitude: 2.7, size: '320\'x205\'', description: '银河系伴星系', notableFeatures: ['低金属丰度'], materials: ['H', 'He'], color: '#98b8d0', cartesianX: '59000000000000000', cartesianY: '-170000000000000000', cartesianZ: '-52000000000000000', sceneX: 6, sceneY: -22, sceneZ: -15 },
  { id: 'm81', name: '波德星系', catalogId: 'M81/NGC 3031', type: 'galaxy', typeCn: '旋涡星系', constellation: '大熊座', distance: 120, ra: '09h55m33s', dec: '+69°03\'55"', magnitude: 6.9, size: '27\'x14\'', description: '大熊座方向最亮星系', notableFeatures: ['M81群核心'], materials: ['H', 'He', '重元素'], color: '#e8d8c8', cartesianX: '-30000000000000000', cartesianY: '25000000000000000', cartesianZ: '45000000000000000', sceneX: -25, sceneY: 35, sceneZ: 15 },
  { id: 'm82', name: '雪茄星系', catalogId: 'M82', type: 'galaxy', typeCn: '星暴星系', constellation: '大熊座', distance: 115, ra: '09h55m52s', dec: '+69°40\'47"', magnitude: 8.4, size: '11\'x5\'', description: '著名星暴星系', notableFeatures: ['剧烈星暴', '超级风'], materials: ['H', 'He', '尘埃'], color: '#ffd8a8', cartesianX: '-30100000000000000', cartesianY: '25200000000000000', cartesianZ: '45000000000000000', sceneX: -24, sceneY: 36, sceneZ: 16 },
  { id: 'm51', name: '涡旋星系', catalogId: 'M51', type: 'galaxy', typeCn: '旋涡星系', constellation: '猎犬座', distance: 230, ra: '13h29m53s', dec: '+47°11\'43"', magnitude: 8.4, size: '11\'x7\'', description: '与伴星系相互作用', notableFeatures: ['旋臂结构清晰'], materials: ['H', 'He', '分子气体'], color: '#c8e8d8', cartesianX: '-18000000000000000', cartesianY: '42000000000000000', cartesianZ: '28000000000000000', sceneX: -18, sceneY: 28, sceneZ: 20 },
  { id: 'm101', name: '风车星系', catalogId: 'M101', type: 'galaxy', typeCn: '旋涡星系', constellation: '大熊座', distance: 209, ra: '14h03m13s', dec: '+54°20\'57"', magnitude: 7.9, size: '29\'x27\'', description: '巨型旋涡星系', notableFeatures: ['巨大旋臂', '多个HII区'], materials: ['H', 'He', '重元素'], color: '#d8c8b8', cartesianX: '-22000000000000000', cartesianY: '35000000000000000', cartesianZ: '48000000000000000', sceneX: -20, sceneY: 25, sceneZ: 30 },
  { id: 'm104', name: '草帽星系', catalogId: 'M104', type: 'galaxy', typeCn: '旋涡星系', constellation: '室女座', distance: 310, ra: '12h39m59s', dec: '-11°37\'23"', magnitude: 8.0, size: '9\'x4\'', description: '侧向旋涡星系', notableFeatures: ['尘埃带', '中心黑洞'], materials: ['H', 'He', '尘埃'], color: '#d8c090', cartesianX: '-10000000000000000', cartesianY: '56000000000000000', cartesianZ: '-19000000000000000', sceneX: -12, sceneY: 40, sceneZ: -15 },
  { id: 'm87', name: '室女座A', catalogId: 'M87', type: 'galaxy', typeCn: '椭圆星系', constellation: '室女座', distance: 550, ra: '12h30m49s', dec: '+12°23\'28"', magnitude: 8.6, size: '8\'', description: '室女座星系团核心', notableFeatures: ['超大质量黑洞', '喷流'], materials: ['H', 'He', '暗物质'], color: '#e8e0d0', cartesianX: '-8000000000000000', cartesianY: '54000000000000000', cartesianZ: '11000000000000000', sceneX: -10, sceneY: 38, sceneZ: 8 },
  { id: 'centaurus_a', name: '半人马座A', catalogId: 'NGC 5128', type: 'galaxy', typeCn: '椭圆/星暴', constellation: '半人马座', distance: 140, ra: '13h25m28s', dec: '-43°01\'09"', magnitude: 6.8, size: '31\'x25\'', description: '最近的大型射电星系', notableFeatures: ['射电辐射', 'X射线喷流'], materials: ['H', 'He', '尘埃'], color: '#d08050', cartesianX: '-2000000000000000', cartesianY: '25000000000000000', cartesianZ: '-52000000000000000', sceneX: -5, sceneY: 18, sceneZ: -35 },
  { id: 'ngc_1300', name: 'NGC 1300', catalogId: 'NGC 1300', type: 'galaxy', typeCn: '棒旋星系', constellation: '波江座', distance: 610, ra: '03h19m41s', dec: '-19°24\'40"', magnitude: 10.9, size: '6\'x3\'', description: '经典棒旋星系', notableFeatures: ['棒状结构'], materials: ['H', 'He', '重元素'], color: '#e0d0c0', cartesianX: '55000000000000000', cartesianY: '25000000000000000', cartesianZ: '-36000000000000000', sceneX: 35, sceneY: 20, sceneZ: -25 },
  { id: 'ngc_4038', name: '触须星系', catalogId: 'NGC 4038/4039', type: 'galaxy', typeCn: '相互作用', constellation: '乌鸦座', distance: 650, ra: '12h01m53s', dec: '-18°52\'08"', magnitude: 10.3, size: '6\'x3\'', description: '两个星系碰撞合并中', notableFeatures: ['潮汐尾', '剧烈恒星形成'], materials: ['H', 'He', '分子气体'], color: '#ffa080', cartesianX: '-8500000000000000', cartesianY: '48000000000000000', cartesianZ: '-32000000000000000', sceneX: -10, sceneY: 35, sceneZ: -22 },
  { id: 'ngc_6946', name: 'NGC 6946', catalogId: 'NGC 6946', type: 'galaxy', typeCn: '旋涡星系', constellation: '仙王座', distance: 180, ra: '20h34m52s', dec: '+60°09\'14"', magnitude: 8.9, size: '11\'x10\'', description: '多颗超新星', notableFeatures: ['SN 2002hh', 'SN 2004et', 'SN 2008dh'], materials: ['H', 'He', '分子气体'], color: '#d0c8b8', cartesianX: '-25000000000000000', cartesianY: '10000000000000000', cartesianZ: '75000000000000000', sceneX: -22, sceneY: 8, sceneZ: 50 },
  { id: 'm42', name: '猎户座大星云', catalogId: 'M42', type: 'nebula', typeCn: '发射星云', constellation: '猎户座', distance: 13, ra: '05h35m17s', dec: '-05°23\'28"', magnitude: 4.0, size: '85\'x60\'', description: '最著名的星云', notableFeatures: ['恒星形成区', '猎户四合星'], materials: ['H', 'He', 'O', 'S'], color: '#ff9060', cartesianX: '43000000000000000', cartesianY: '-159000000000000000', cartesianZ: '-5100000000000000', sceneX: 28, sceneY: -30, sceneZ: -3 },
  { id: 'ngc_7000', name: '北美洲星云', catalogId: 'NGC 7000', type: 'nebula', typeCn: '发射星云', constellation: '天鹅座', distance: 22, ra: '20h58m47s', dec: '+44°19\'48"', magnitude: 4.0, size: '120\'x100\'', description: '大型发射星云', notableFeatures: ['IC 5070鹰嘴'], materials: ['H', 'He'], color: '#ff4040', cartesianX: '-23000000000000000', cartesianY: '10000000000000000', cartesianZ: '46000000000000000', sceneX: -20, sceneY: 8, sceneZ: 30 },
  { id: 'ngc_2237', name: '玫瑰星云', catalogId: 'NGC 2237', type: 'nebula', typeCn: '发射星云', constellation: '麒麟座', distance: 52, ra: '06h32m19s', dec: '+04°52\'35"', magnitude: 9.0, size: '80\'x70\'', description: '巨大发射星云', notableFeatures: ['NGC 2244恒星群'], materials: ['H', 'He', 'S'], color: '#ff6060', cartesianX: '55000000000000000', cartesianY: '-150000000000000000', cartesianZ: '4000000000000000', sceneX: 35, sceneY: -28, sceneZ: 3 },
  { id: 'ngc_6992', name: '东面纱星云', catalogId: 'NGC 6992', type: 'supernova_remnant', typeCn: '超新星遗迹', constellation: '天鹅座', distance: 24, ra: '20h56m24s', dec: '+31°43\'00"', magnitude: 7.0, size: '80\'', description: '面纱星云东段', notableFeatures: ['丝状结构', '激波'], materials: ['O', 'S', 'H'], color: '#60a0ff', cartesianX: '-21000000000000000', cartesianY: '12000000000000000', cartesianZ: '36000000000000000', sceneX: -18, sceneY: 10, sceneZ: 24 },
  { id: 'ngc_6960', name: '西面纱星云', catalogId: 'NGC 6960', type: 'supernova_remnant', typeCn: '超新星遗迹', constellation: '天鹅座', distance: 24, ra: '20h45m40s', dec: '+30°43\'00"', magnitude: 7.0, size: '70\'', description: '面纱星云西段', notableFeatures: ['witch\'s Broom'], materials: ['O', 'S'], color: '#80c0ff', cartesianX: '-20000000000000000', cartesianY: '12000000000000000', cartesianZ: '35000000000000000', sceneX: -17, sceneY: 10, sceneZ: 23 },
  { id: 'ngc_7023', name: '鸢尾花星云', catalogId: 'NGC 7023', type: 'nebula', typeCn: '反射星云', constellation: '仙王座', distance: 13, ra: '21h01m35s', dec: '+68°10\'17"', magnitude: 7.0, size: '18\'', description: '美丽反射星云', notableFeatures: ['蓝色尘埃'], materials: ['尘埃', 'H'], color: '#a0c0e0', cartesianX: '-22000000000000000', cartesianY: '8000000000000000', cartesianZ: '62000000000000000', sceneX: -18, sceneY: 6, sceneZ: 42 },
  { id: 'm57', name: '环状星云', catalogId: 'M57', type: 'planetary_nebula', typeCn: '行星状星云', constellation: '天琴座', distance: 23, ra: '18h53m35s', dec: '+33°01\'45"', magnitude: 8.8, size: '87"x60"', description: '最著名的行星状星云', notableFeatures: ['白矮星中心'], materials: ['He', 'H', 'O'], color: '#80ff80', cartesianX: '0', cartesianY: '22000000000000000', cartesianZ: '35000000000000000', sceneX: 0, sceneY: 17, sceneZ: 23 },
  { id: 'm27', name: '哑铃星云', catalogId: 'M27', type: 'planetary_nebula', typeCn: '行星状星云', constellation: '狐狸座', distance: 12, ra: '19h59m36s', dec: '+22°43\'16"', magnitude: 7.5, size: '8\'x6\'', description: '最大最亮行星状星云之一', notableFeatures: ['双极结构'], materials: ['He', 'H', 'O'], color: '#a0ff80', cartesianX: '-12000000000000000', cartesianY: '12000000000000000', cartesianZ: '21000000000000000', sceneX: -10, sceneY: 10, sceneZ: 14 },
  { id: 'm97', name: '猫头鹰星云', catalogId: 'M97', type: 'planetary_nebula', typeCn: '行星状星云', constellation: '大熊座', distance: 26, ra: '11h14m48s', dec: '+55°01\'05"', magnitude: 9.9, size: '3\'', description: '圆形行星状星云', notableFeatures: ['两个暗区'], materials: ['He', 'O'], color: '#80a0ff', cartesianX: '-3000000000000000', cartesianY: '27000000000000000', cartesianZ: '58000000000000000', sceneX: -3, sceneY: 20, sceneZ: 38 },
  { id: 'ngc_6543', name: '猫眼星云', catalogId: 'NGC 6543', type: 'planetary_nebula', typeCn: '行星状星云', constellation: '天龙座', distance: 33, ra: '17h58m34s', dec: '+66°37\'59"', magnitude: 8.1, size: '22"', description: '最复杂的行星状星云之一', notableFeatures: ['同心环结构'], materials: ['He', 'C', 'O'], color: '#80ffff', cartesianX: '0', cartesianY: '15000000000000000', cartesianZ: '61000000000000000', sceneX: 0, sceneY: 12, sceneZ: 40 },
  { id: 'ngc_2392', name: '爱斯基摩星云', catalogId: 'NGC 2392', type: 'planetary_nebula', typeCn: '行星状星云', constellation: '双子座', distance: 29, ra: '07h29m11s', dec: '+20°54\'42"', magnitude: 9.2, size: '47"', description: '复杂结构行星状星云', notableFeatures: ['星云嵌套'], materials: ['He', 'N', 'O'], color: '#ffa080', cartesianX: '52000000000000000', cartesianY: '-145000000000000000', cartesianZ: '19500000000000000', sceneX: 33, sceneY: -27, sceneZ: 13 },
  { id: 'ngc_7293', name: '螺旋星云', catalogId: 'NGC 7293', type: 'planetary_nebula', typeCn: '行星状星云', constellation: '宝瓶座', distance: 7, ra: '22h29m38s', dec: '-20°50\'13"', magnitude: 7.6, size: '25\'', description: '最近最亮行星状星云之一', notableFeatures: ['Helix图像'], materials: ['He', 'N', 'O'], color: '#ffa0a0', cartesianX: '-28000000000000000', cartesianY: '20000000000000000', cartesianZ: '-24000000000000000', sceneX: -22, sceneY: 15, sceneZ: -15 },
  { id: 'ic_443', name: '水母星云', catalogId: 'IC 443', type: 'supernova_remnant', typeCn: '超新星遗迹', constellation: '双子座', distance: 15, ra: '06h16m00s', dec: '+22°30\'00"', magnitude: 12.0, size: '50\'', description: '著名超新星遗迹', notableFeatures: ['与分子云相互作用'], materials: ['重元素', '高能粒子'], color: '#60a0ff', cartesianX: '47000000000000000', cartesianY: '-150000000000000000', cartesianZ: '21000000000000000', sceneX: 32, sceneY: -28, sceneZ: 14 },
  { id: 'ngc_6826', name: '闪烁星云', catalogId: 'NGC 6826', type: 'planetary_nebula', typeCn: '行星状星云', constellation: '天鹅座', distance: 22, ra: '19h44m48s', dec: '+50°31\'30"', magnitude: 8.8, size: '27"', description: '著名行星状星云', notableFeatures: ['快速闪烁'], materials: ['He', 'O'], color: '#80ffc0', cartesianX: '-12000000000000000', cartesianY: '8000000000000000', cartesianZ: '51000000000000000', sceneX: -10, sceneY: 6, sceneZ: 34 },
  { id: 'ngc_6888', name: '眉月星云', catalogId: 'NGC 6888', type: 'nebula', typeCn: '发射星云', constellation: '天鹅座', distance: 47, ra: '20h12m07s', dec: '+38°21\'17"', magnitude: 7.4, size: '20\'x10\'', description: 'Wolf-Rayet星周围星云', notableFeatures: ['WR 136', '壳层结构'], materials: ['H', 'He', 'N'], color: '#ff8080', cartesianX: '-18000000000000000', cartesianY: '14000000000000000', cartesianZ: '41000000000000000', sceneX: -15, sceneY: 11, sceneZ: 27 },
  { id: 'ngc_2024', name: '火焰星云', catalogId: 'NGC 2024', type: 'nebula', typeCn: '发射星云', constellation: '猎户座', distance: 15, ra: '05h41m43s', dec: '-01°50\'29"', magnitude: 10.0, size: '30\'', description: '猎户座分子云一部分', notableFeatures: ['恒星形成'], materials: ['H', 'He'], color: '#ff6020', cartesianX: '44000000000000000', cartesianY: '-157000000000000000', cartesianZ: '-1700000000000000', sceneX: 29, sceneY: -30, sceneZ: -1 },
  { id: 'ic_434', name: '马头星云', catalogId: 'IC 434', type: 'dark_nebula', typeCn: '暗星云', constellation: '猎户座', distance: 15, ra: '05h40m59s', dec: '-02°27\'30"', magnitude: 99, size: '8\'', description: '最著名的暗星云', notableFeatures: ['被参宿一照亮'], materials: ['尘埃'], color: '#2a1a0a', cartesianX: '43800000000000000', cartesianY: '-157500000000000000', cartesianZ: '-2300000000000000', sceneX: 28, sceneY: -30, sceneZ: -1 },
  { id: 'ngc_3603', name: 'NGC 3603', catalogId: 'NGC 3603', type: 'nebula', typeCn: '发射星云', constellation: '船底座', distance: 200, ra: '11h15m07s', dec: '-61°15\'38"', magnitude: 9.1, size: '2\'', description: '银河系最活跃恒星形成区', notableFeatures: ['HD 97950星团', 'Wolf-Rayet星'], materials: ['H', 'He', '重元素'], color: '#ff8060', cartesianX: '2000000000000000', cartesianY: '20000000000000000', cartesianZ: '-70000000000000000', sceneX: 3, sceneY: 15, sceneZ: -46 },
  { id: '30_doradus', name: '30 Doradus/大麦哲伦云', catalogId: 'LMC N157', type: 'nebula', typeCn: '发射星云', constellation: '剑鱼座', distance: 1600, ra: '05h38m42s', dec: '-69°06\'03"', magnitude: 8.0, size: '40\'', description: '大麦哲伦云中最大恒星形成区', notableFeatures: ['R136星团', '蜘蛛星云'], materials: ['H', 'He', 'O'], color: '#ff6040', cartesianX: '50000000000000000', cartesianY: '-160000000000000000', cartesianZ: '-43000000000000000', sceneX: 32, sceneY: -30, sceneZ: -28 },
  { id: 'carina_nebula', name: '船底座星云', catalogId: 'NGC 3372', type: 'nebula', typeCn: '发射星云', constellation: '船底座', distance: 85, ra: '10h45m05s', dec: '-59°41\'04"', magnitude: 99, size: '120\'x70\'', description: '银河系最大发射星云之一', notableFeatures: ['Eta Carinae', 'Keyhole Nebula'], materials: ['H', 'He', 'N'], color: '#ff5040', cartesianX: '2000000000000000', cartesianY: '18000000000000000', cartesianZ: '-65000000000000000', sceneX: 3, sceneY: 14, sceneZ: -43 },
  { id: 'betelgeuse', name: '参宿四', catalogId: 'Alpha Ori', type: 'star', typeCn: '红超巨星', constellation: '猎户座', distance: 7, ra: '05h55m10s', dec: '+07°24\'25"', magnitude: 0.5, size: '-', description: '著名红超巨星', notableFeatures: ['直径约太阳1000倍', '即将超新星爆发'], materials: ['H', 'He', '重元素'], color: '#ff8060', cartesianX: '46000000000000000', cartesianY: '-153000000000000000', cartesianZ: '6500000000000000', sceneX: 30, sceneY: -29, sceneZ: 4 },
  { id: 'rigel', name: '参宿七', catalogId: 'Beta Ori', type: 'star', typeCn: '蓝超巨星', constellation: '猎户座', distance: 8.6, ra: '05h14m32s', dec: '-08°12\'06"', magnitude: 0.13, size: '-', description: '猎户座最亮星', notableFeatures: ['B8Ia型', '比太阳亮120000倍'], materials: ['H', 'He'], color: '#a0c0ff', cartesianX: '41000000000000000', cartesianY: '-160000000000000000', cartesianZ: '-7600000000000000', sceneX: 27, sceneY: -30, sceneZ: -5 },
  { id: 'polaris', name: '北极星', catalogId: 'Alpha UMi', type: 'star', typeCn: '黄超巨星', constellation: '小熊座', distance: 4.3, ra: '02h31m49s', dec: '+89°15\'51"', magnitude: 1.98, size: '-', description: '当前北极星', notableFeatures: ['造父变星原型'], materials: ['H', 'He'], color: '#ffe0a0', cartesianX: '0', cartesianY: '4300000000000000', cartesianZ: '86000000000000000', sceneX: 0, sceneY: 3, sceneZ: 56 },
  { id: 'sirius', name: '天狼星', catalogId: 'Alpha CMa', type: 'star', typeCn: 'A1V型主序星', constellation: '大犬座', distance: 0.87, ra: '06h45m09s', dec: '-16°42\'58"', magnitude: -1.46, size: '-', description: '天空中最亮恒星', notableFeatures: ['白矮星伴星'], materials: ['H', 'He'], color: '#c0e0ff', cartesianX: '47000000000000000', cartesianY: '-150000000000000000', cartesianZ: '-16000000000000000', sceneX: 30, sceneY: -28, sceneZ: -10 },
  { id: 'vega', name: '织女星', catalogId: 'Alpha Lyr', type: 'star', typeCn: 'A0V型主序星', constellation: '天琴座', distance: 2.5, ra: '18h36m56s', dec: '+38°47\'01"', magnitude: 0.03, size: '-', description: '夏季大三角之一', notableFeatures: ['自转快速'], materials: ['H', 'He'], color: '#d0e8ff', cartesianX: '0', cartesianY: '2500000000000000', cartesianZ: '37000000000000000', sceneX: 0, sceneY: 2, sceneZ: 24 },
  { id: 'arcturus', name: '大角星', catalogId: 'Alpha Boo', type: 'star', typeCn: '红巨星', constellation: '牧夫座', distance: 3.7, ra: '14h16m22s', dec: '+19°10\'46"', magnitude: -0.05, size: '-', description: '全天第四亮星', notableFeatures: ['K1.5IIIpe型'], materials: ['H', 'He', '重元素'], color: '#ffcc80', cartesianX: '-12000000000000000', cartesianY: '4000000000000000', cartesianZ: '23000000000000000', sceneX: -9, sceneY: 3, sceneZ: 15 },
  { id: 'aldebaran', name: '毕宿五', catalogId: 'Alpha Tau', type: 'star', typeCn: '红巨星', constellation: '金牛座', distance: 6.5, ra: '04h35m55s', dec: '+16°30\'33"', magnitude: 0.85, size: '-', description: '毕宿五双星之一', notableFeatures: ['K5III型'], materials: ['H', 'He'], color: '#ff9060', cartesianX: '51000000000000000', cartesianY: '-165000000000000000', cartesianZ: '15000000000000000', sceneX: 32, sceneY: -31, sceneZ: 10 },
  { id: 'antares', name: '心宿二', catalogId: 'Alpha Sco', type: 'star', typeCn: '红超巨星', constellation: '天蝎座', distance: 5.2, ra: '16h29m24s', dec: '-26°25\'55"', magnitude: 1.06, size: '-', description: '天蝎座主星', notableFeatures: ['M1.5Iab-Ib型', '比太阳大700倍'], materials: ['H', 'He', '重元素'], color: '#ff6040', cartesianX: '8000000000000000', cartesianY: '40000000000000000', cartesianZ: '-37000000000000000', sceneX: 6, sceneY: 28, sceneZ: -24 },
  { id: 'spica', name: '角宿一', catalogId: 'Alpha Vir', type: 'star', typeCn: 'B1V型主序星', constellation: '室女座', distance: 2.5, ra: '13h25m12s', dec: '-11°09\'41"', magnitude: 0.97, size: '-', description: '室女座最亮星', notableFeatures: ['分光双星'], materials: ['H', 'He'], color: '#a0b8ff', cartesianX: '-2000000000000000', cartesianY: '25000000000000000', cartesianZ: '-19000000000000000', sceneX: -2, sceneY: 18, sceneZ: -12 },
  { id: 'proxima_centauri', name: '比邻星', catalogId: 'Alpha Cen C', type: 'star', typeCn: '红矮星', constellation: '半人马座', distance: 0.041, ra: '14h29m43s', dec: '-62°40\'46"', magnitude: 11.13, size: '-', description: '距太阳最近的恒星', notableFeatures: ['M5.5Ve型', '行星Proxima b'], materials: ['H', 'He'], color: '#ff9080', cartesianX: '-1000000000000000', cartesianY: '5000000000000000', cartesianZ: '-48000000000000000', sceneX: -1, sceneY: 3, sceneZ: -31 },
  { id: 'alpha_centauri_a', name: '南门二A', catalogId: 'Alpha Cen A', type: 'star', typeCn: 'G2V型主序星', constellation: '半人马座', distance: 0.044, ra: '14h39m37s', dec: '-60°50\'02"', magnitude: -0.01, size: '-', description: '距太阳第四近', notableFeatures: ['类似太阳'], materials: ['H', 'He'], color: '#fff0d0', cartesianX: '-500000000000000', cartesianY: '4000000000000000', cartesianZ: '-48000000000000000', sceneX: -1, sceneY: 3, sceneZ: -31 },
  { id: '3c_273', name: '类星体3C 273', catalogId: '3C 273', type: 'quasar', typeCn: '类星体', constellation: '室女座', distance: 2400000, ra: '12h29m07s', dec: '+02°03\'09"', magnitude: 12.9, size: '-', description: '最亮最远的类星体之一', notableFeatures: ['第一个识别的类星体', '约3万亿倍太阳光度'], materials: ['吸积盘', '高能粒子'], color: '#ffffff', cartesianX: '-8000000000000000', cartesianY: '54000000000000000', cartesianZ: '1800000000000000', sceneX: -9, sceneY: 38, sceneZ: 1 },
  { id: 'crab_pulsar', name: '蟹状星云脉冲星', catalogId: 'PSR B0531+21', type: 'pulsar', typeCn: '脉冲星', constellation: '金牛座', distance: 65, ra: '05h34m31s', dec: '+22°00\'52"', magnitude: 16.5, size: '~28km', description: '1054年超新星遗迹中心脉冲星', notableFeatures: ['33ms自转', 'SN 1054遗迹'], materials: ['中子'], color: '#a0ffff', cartesianX: '45000000000000000', cartesianY: '-155000000000000000', cartesianZ: '21000000000000000', sceneX: 29, sceneY: -29, sceneZ: 14 },
  { id: 'vela_pulsar', name: '船帆座脉冲星', catalogId: 'PSR B0833-45', type: 'pulsar', typeCn: '脉冲星', constellation: '船帆座', distance: 25, ra: '08h35m20s', dec: '-45°10\'35"', magnitude: 99, size: '~20km', description: '最亮脉冲星之一', notableFeatures: ['89ms自转'], materials: ['中子'], color: '#80ffc0', cartesianX: '3000000000000000', cartesianY: '-70000000000000000', cartesianZ: '-44000000000000000', sceneX: 3, sceneY: -46, sceneZ: -28 },
  { id: 'pulsar_1937', name: 'PSR B1937+21', catalogId: 'PSR B1937+21', type: 'pulsar', typeCn: '脉冲星', constellation: '仙王座', distance: 97, ra: '19h39m35s', dec: '+21°34\'08"', magnitude: 99, size: '~20km', description: '第二快脉冲星', notableFeatures: ['1.56ms自转', '第一个毫秒脉冲星'], materials: ['中子'], color: '#80ffff', cartesianX: '-12000000000000000', cartesianY: '9000000000000000', cartesianZ: '30000000000000000', sceneX: -10, sceneY: 7, sceneZ: 20 }
];

// 导出静态天体
export const STATIC_CELESTIAL_OBJECTS: CosmicObject[] = GALAXIES;

// 导入动态生成的天体
import { GENERATED_CELESTIAL_OBJECTS } from "./cosmic-data-generated";

// 合并所有天体
export const ALL_CELESTIAL_OBJECTS: CosmicObject[] = [
  ...STATIC_CELESTIAL_OBJECTS,
  ...GENERATED_CELESTIAL_OBJECTS
];

export default ALL_CELESTIAL_OBJECTS;

// 别名兼容
export const ALL_COSMIC_OBJECTS = ALL_CELESTIAL_OBJECTS;

export type CosmicObjectType = CosmicObject['type'];

// 类型映射
export const COSMIC_OBJECT_TYPE_MAP: Record<string, CosmicObject[]> = {
  galaxy: ALL_CELESTIAL_OBJECTS.filter(o => o.type === 'galaxy'),
  nebula: ALL_CELESTIAL_OBJECTS.filter(o => o.type === 'nebula'),
  star: ALL_CELESTIAL_OBJECTS.filter(o => o.type === 'star'),
  pulsar: ALL_CELESTIAL_OBJECTS.filter(o => o.type === 'pulsar'),
  quasar: ALL_CELESTIAL_OBJECTS.filter(o => o.type === 'quasar'),
  supernova_remnant: ALL_CELESTIAL_OBJECTS.filter(o => o.type === 'supernova_remnant'),
  planetary_nebula: ALL_CELESTIAL_OBJECTS.filter(o => o.type === 'planetary_nebula'),
  dark_nebula: ALL_CELESTIAL_OBJECTS.filter(o => o.type === 'dark_nebula'),
  star_cluster: ALL_CELESTIAL_OBJECTS.filter(o => o.type === 'star_cluster'),
  globular_cluster: ALL_CELESTIAL_OBJECTS.filter(o => o.type === 'globular_cluster'),
};

// 获取星系详情
export function getGalaxyDetail(id: string): CosmicObject | undefined {
  return ALL_CELESTIAL_OBJECTS.find(o => o.id === id || o.catalogId === id);
}

// 搜索天体函数
export function searchCosmicObjects(query: string, limit: number = 100): CosmicObject[] {
  const q = query.toLowerCase();
  const results: CosmicObject[] = [];
  
  for (const obj of ALL_CELESTIAL_OBJECTS) {
    if (results.length >= limit) break;
    if (
      obj.name.toLowerCase().includes(q) ||
      obj.catalogId.toLowerCase().includes(q) ||
      obj.typeCn.toLowerCase().includes(q) ||
      obj.constellation.toLowerCase().includes(q) ||
      obj.description.toLowerCase().includes(q)
    ) {
      results.push(obj);
    }
  }
  
  return results;
}
