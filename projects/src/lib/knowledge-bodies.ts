/**
 * 宇宙全知识数据库 — 天体类知识条目
 * 涵盖：太阳 + 8行星 + 5矮行星 + 15+卫星 + 小天体类型
 * 所有智能体共享，完全离线可用
 */

import type { KnowledgeEntry } from './universe-knowledge-database';

export const celestialEntries: KnowledgeEntry[] = [
  // ===================== 恒星 =====================
  { id: 'sun', keywords: ['太阳', '恒星', 'sun', 'star', '日', 'sol', '日光', '太阳系中心', '黄矮星'], category: '天体', subcategory: '恒星',
    title: '太阳',
    content: '太阳是太阳系中心恒星，G2V型主序星。质量1.989×10³⁰kg(占太阳系99.86%)，半径696,340km，表面温度5,778K，核心温度1,500万K。主要成分：氢73.46%、氦24.85%、氧0.77%、碳0.29%、铁0.16%。光度3.828×10²⁶W，年龄约46亿年，预计主序寿命100亿年。太阳风速度400-800km/s，日冕温度100-300万K。太阳活动周期约11年，包含太阳黑子、耀斑、日冕物质抛射等现象。每秒将约400万吨物质转化为能量(4H→He+26.7MeV)。',
    relatedIds: ['solar_wind', 'magnetic_field', 'hydrogen', 'helium', 'stellar_evolution'] },

  // ===================== 类地行星 =====================
  { id: 'mercury', keywords: ['水星', 'mercury', '信使', '最近太阳', '最小行星', 'mercurial'], category: '天体', subcategory: '类地行星',
    title: '水星',
    content: '太阳系最小最近行星。质量3.301×10²³kg，半径2,439.7km，表面重力3.7m/s²。无大气层(仅有极稀薄外逸层：Na/K/O₂)。表面温度-180°C至430°C(极端温差)。磁场强度300nT(地球1%)。特征：Caloris盆地(直径1,550km)、大量撞击坑、巨大铁核(占半径75%)。公转88天，自转59天。信使号(2011-2015)发现水冰在极地永久阴影区存在。',
    relatedIds: ['sun', 'impact_crater', 'magnetic_field'] },

  { id: 'venus', keywords: ['金星', 'venus', '启明', '长庚', '太白', '地球姊妹', '温室'], category: '天体', subcategory: '类地行星',
    title: '金星',
    content: '太阳系最热行星(温室效应)，大小与地球相似。质量4.867×10²⁴kg，半径6,051.8km。大气极浓密：CO₂ 96.5%、N₂ 3.5%，表面气压92atm，温度462°C。硫酸云层厚45-70km。无磁场，自转逆行(243天)，公转225天。表面：Maxwell Montes(11km高)、大面积火山地形(>1,600座大火山)、冠状结构(金星独有构造)。可能仍有活跃火山(2023年发现火山变形证据)。',
    relatedIds: ['co2', 'greenhouse_effect', 'volcanism'] },

  { id: 'earth', keywords: ['地球', 'earth', '蓝星', '水球', '蓝色弹珠', '盖亚', '生命'], category: '天体', subcategory: '类地行星',
    title: '地球',
    content: '太阳系第三行星，唯一已知存在生命的天体。质量5.972×10²⁴kg，半径6,371km，表面重力9.8m/s²。大气层：N₂ 78.08%、O₂ 20.95%、Ar 0.93%、CO₂ 0.04%。拥有强磁场(25-65μT)、范艾伦辐射带、电离层。表面71%被水覆盖，地壳由硅酸盐岩石构成，地幔由橄榄石/辉石组成，地核为铁镍合金。板块构造活跃(7大板块+数小板块)。轨道半长轴1AU，离心率0.0167，倾角23.44°。',
    relatedIds: ['magnetic_field', 'radiation_belt', 'water', 'silicate', 'plate_tectonics'] },

  { id: 'mars', keywords: ['火星', 'mars', '红色星球', '战神', '赤色星', '火星人'], category: '天体', subcategory: '类地行星',
    title: '火星',
    content: '太阳系第四行星，因表面氧化铁呈红色。质量6.417×10²³kg，半径3,389.5km，表面重力3.72m/s²。大气稀薄(0.6kPa)：CO₂ 95.3%、N₂ 2.7%、Ar 1.6%。表面特征：奥林匹斯山(21.9km，太阳系最高山)、水手号峡谷(4,000km长，7km深)、南北极冠(干冰+水冰)。曾存在液态水(河谷网络、三角洲)，地下可能仍有液态水(2018年发现南极冰下湖)。是人类殖民首选目标，已有7个着陆器/火星车成功工作。',
    relatedIds: ['iron_oxide', 'co2', 'water', 'olympus_mons', 'valles_marineris'] },

  // ===================== 气态巨行星 =====================
  { id: 'jupiter', keywords: ['木星', 'jupiter', '气态巨行星', '朱庇特', '大红斑', 'jovian'], category: '天体', subcategory: '气态巨行星',
    title: '木星',
    content: '太阳系最大行星，质量1.898×10²⁷kg(318倍地球)，半径69,911km。大气：H₂ 89.8%、He 10.2%。大红斑是持续350+年的反气旋风暴(直径1.3倍地球)。磁场强度4.2G(地球10倍)，磁层延伸至土星轨道。内部可能存在金属氢层。95颗已知卫星，伽利略四卫星最著名：Io(火山最活跃)、Europa(冰下海洋)、Ganymede(最大卫星，有磁场)、Callisto(古老表面)。木星引力是小行星带和彗星轨道的主要影响者。',
    relatedIds: ['hydrogen', 'helium', 'magnetic_field', 'europa', 'io', 'ganymede', 'great_red_spot'] },

  { id: 'saturn', keywords: ['土星', 'saturn', '环', 'ringed', '土星环', '克洛诺斯', '环系'], category: '天体', subcategory: '气态巨行星',
    title: '土星',
    content: '太阳系第二大行星，以壮观环系闻名。质量5.683×10²⁶kg，半径58,232km。大气：H₂ 96.3%、He 3.25%。环系由冰粒和岩石碎片组成，宽28万km但厚度仅10-100m，总质量约3×10¹⁹kg。密度0.687g/cm³(低于水，太阳系唯一)。146颗已知卫星，Titan(浓密大气+甲烷湖泊)、Enceladus(南极喷射水冰，含有机分子)最著名。卡西尼号(2004-2017)完成详尽探测。',
    relatedIds: ['hydrogen', 'helium', 'titan', 'enceladus', 'saturn_rings'] },

  // ===================== 冰巨行星 =====================
  { id: 'uranus', keywords: ['天王星', 'uranus', '冰巨行星', '侧翻行星', '乌拉诺斯'], category: '天体', subcategory: '冰巨行星',
    title: '天王星',
    content: '太阳系第七行星，冰巨行星。质量8.681×10²⁵kg，半径25,362km。大气：H₂ 82.5%、He 15.2%、CH₄ 2.3%(吸收红光致蓝绿色)。自转轴倾斜97.8°(侧躺自转)，原因可能是早期巨大撞击。内部：水/甲烷/氨冰幔包裹岩石核心。磁场倾斜59°，偏离中心。27颗已知卫星(以莎士比亚/蒲柏角色命名)。旅行者2号(1986)唯一飞掠。极光不同于地球，不在极点而在赤道附近。',
    relatedIds: ['methane', 'ice_giant', 'neptune'] },

  { id: 'neptune', keywords: ['海王星', 'neptune', '冰巨行星', '蓝色', '波塞冬', '风暴'], category: '天体', subcategory: '冰巨行星',
    title: '海王星',
    content: '太阳系最远行星，冰巨行星。质量1.024×10²⁶kg，半径24,622km。大气：H₂ 80%、He 19%、CH₄ 1.5%(致深蓝色)。风速达2,100km/h(太阳系最快)。大黑斑(1989发现，后消失)。磁场倾斜47°，偏离中心0.55半径。内部结构与天王星相似。16颗已知卫星，Triton最大(逆行轨道，可能是捕获的柯伊伯带天体，有氮冰间歇泉)。公转165年，1846年通过数学预测发现。',
    relatedIds: ['methane', 'ice_giant', 'uranus', 'triton'] },

  // ===================== 矮行星 =====================
  { id: 'pluto', keywords: ['冥王星', 'pluto', '矮行星', '冥府', '柯伊伯带'], category: '天体', subcategory: '矮行星',
    title: '冥王星',
    content: '柯伊伯带矮行星，直径2,377km。新视野号2015年飞掠发现：心形氮冰平原(Sputnik Planitia)、甲烷冰山脉、稀薄大气(N₂为主，含CH₄/CO)。5颗卫星，Charon最大(直径1,212km，构成双星系统)。表面温度-230°C。轨道离心率0.25，周期248年，倾角17°。2006年IAU重新分类为矮行星。地质活跃：氮冰冰川流动、可能的地下海洋。',
    relatedIds: ['nitrogen', 'methane', 'kuiper_belt', 'charon'] },

  { id: 'ceres', keywords: ['谷神星', 'ceres', '矮行星', '小行星带', '最大小行星'], category: '天体', subcategory: '矮行星',
    title: '谷神星(Ceres)',
    content: '小行星带最大天体和唯一矮行星。直径946km，质量9.39×10²⁰kg(占小行星带总质量1/3)。Dawn号(2015-2018)发现：Occator陨石坑内有明亮沉积(碳酸钠，来自地下盐水)、Ahuna Mons(冰火山，4km高)、含水矿物25%以上。内部可能有液态水层。有极稀薄大气(水蒸气)。可能是未形成的原行星，太阳系早期遗迹。',
    relatedIds: ['asteroid_belt', 'water', 'carbonate'] },

  { id: 'eris', keywords: ['阋神星', 'eris', '矮行星', '离散盘', '比冥王星大'], category: '天体', subcategory: '矮行星',
    title: '阋神星(Eris)',
    content: '离散盘矮行星，质量比冥王星大27%(直径2,326km，略小)。远日点97.5AU，近日点38AU，周期559年。表面覆盖氮冰和甲烷冰，反照率0.96(太阳系最亮天体之一)。1颗卫星Dysnomia。2005年发现，直接导致冥王星降级(引发了矮行星分类定义)。可能经历过内部地质活动。',
    relatedIds: ['pluto', 'kuiper_belt', 'dwarf_planet'] },

  { id: 'makemake', keywords: ['鸟神星', 'makemake', '矮行星', '柯伊伯带'], category: '天体', subcategory: '矮行星',
    title: '鸟神星(Makemake)',
    content: '柯伊伯带矮行星，直径约1,430km。轨道半长轴45.8AU，周期306年。表面覆盖甲烷/乙烷/氮冰，呈红棕色。2016年发现1颗小卫星(MK2)。无大气(2021年恒星掩食确认)。亮度仅次于冥王星，是柯伊伯带第二亮天体。以复活岛神命名。',
    relatedIds: ['pluto', 'kuiper_belt', 'methane'] },

  { id: 'haumea', keywords: ['妊神星', 'haumea', '矮行星', '椭球', '环'], category: '天体', subcategory: '矮行星',
    title: '妊神星(Haumea)',
    content: "柯伊伯带矮行星，形状极度扁平(椭球：2,322×1,704×1,138km)，自转仅3.9小时(太阳系最快之一)。拥有环(2017年发现，半径2,287km，太阳系唯一有环的矮行星)。2颗卫星(Hi'iaka和Namaka)。表面覆盖结晶水冰(异常纯净，可能是巨大撞击的结果)。质量4.0×10²¹kg。",
    relatedIds: ['water', 'kuiper_belt', 'ring_system'] },

  // ===================== 伽利略卫星 =====================
  { id: 'io', keywords: ['木卫一', 'io', '伊奥', '火山', '硫磺'], category: '天体', subcategory: '卫星',
    title: '木卫一(Io)',
    content: '木星最内层伽利略卫星，太阳系火山最活跃天体。直径3,643km，有400+座火山。潮汐加热(木星+Europa引力拉扯)驱动火山活动，热流约2.5W/m²(地球0.08)。表面覆盖硫磺和二氧化硫(黄/橙/红色)。Loki火山是太阳系最强大火山(功率>100,000GW)。无撞击坑(表面不断被火山物质覆盖)。稀薄SO₂大气。木星磁层扫过Io，形成Io等离子体环。',
    relatedIds: ['jupiter', 'volcanism', 'tidal_heating', 'sulfur'] },

  { id: 'europa', keywords: ['木卫二', 'europa', '欧罗巴', '冰下海洋', '地外生命'], category: '天体', subcategory: '卫星',
    title: '木卫二(Europa)',
    content: '木星第四大卫星，直径3,121km。表面覆盖冰壳(厚5-30km)，下方存在全球性液态水海洋(深60-150km，水量为地球2-3倍)。冰面裂缝、冰脊和混沌地形表明潮汐加热活跃。Cl-bearing盐类和Na₂CO₃暗示海水含盐。木星磁场感应信号确认地下导体层(盐水海洋)。NASA Europa Clipper(2024发射)将详细探测。太阳系中最可能存在地外生命的天体之一。',
    relatedIds: ['water', 'magnetic_field', 'tidal_heating', 'extraterrestrial_life', 'jupiter'] },

  { id: 'ganymede', keywords: ['木卫三', 'ganymede', '加尼米德', '最大卫星', '磁场'], category: '天体', subcategory: '卫星',
    title: '木卫三(Ganymede)',
    content: '太阳系最大卫星，直径5,268km(大于水星)。唯一拥有内禀磁场的卫星(偶极场，赤道719nT)。冰壳下存在三层海洋(夹在冰层间的"三明治"结构)。表面分明亮/暗色两类地形，明亮地形较年轻(冰火山)。有稀薄O₂大气。伽利略号发现磁场摆动信号，确认地下海洋存在。质量1.48×10²³kg。',
    relatedIds: ['jupiter', 'magnetic_field', 'water', 'europa'] },

  { id: 'callisto', keywords: ['木卫四', 'callisto', '卡利斯托', '古老表面'], category: '天体', subcategory: '卫星',
    title: '木卫四(Callisto)',
    content: '木星第二大卫星，直径4,821km。表面极其古老(约40亿年无地质活动)，密布撞击坑。Valhalla盆地(多环结构，直径3,800km)是太阳系最大撞击结构之一。内部可能有不连通的地下含水层(未形成全球海洋)。伽利略号测量表明内部未完全分化(冰-岩混合核心)。人类深空基地候选(辐射低，轨道远)。',
    relatedIds: ['jupiter', 'impact_crater', 'water'] },

  // ===================== 土星主要卫星 =====================
  { id: 'titan', keywords: ['土卫六', 'titan', '泰坦', '甲烷雨', '浓密大气'], category: '天体', subcategory: '卫星',
    title: '土卫六(Titan)',
    content: '土星最大卫星，直径5,150km，太阳系唯一拥有浓密大气的卫星。大气压1.5atm，成分：N₂ 98.4%、CH₄ 1.4%。表面温度94K(-179°C)，存在甲烷/乙烷湖泊和河流循环(类似地球水循环)。惠更斯探测器2005年着陆，发现冰岩表面和有机雾霾层(由光化学反应产生，含复杂有机分子)。可能有地下氨水海洋。土卫六是研究前生物化学的天然实验室。',
    relatedIds: ['methane', 'nitrogen', 'organic_chemistry', 'saturn'] },

  { id: 'enceladus', keywords: ['土卫二', 'enceladus', '恩克拉多斯', '喷射', '水冰', '虎纹'], category: '天体', subcategory: '卫星',
    title: '土卫二(Enceladus)',
    content: '土星小卫星(直径504km)，却有极活跃的冰火山活动。南极4条"虎纹"裂缝喷射水冰/水蒸气(含NaCl、有机分子、SiO₂纳米颗粒)，供给土星E环。喷流速度400m/s，温度-133°C(远高于表面-201°C)。冰壳下存在全球性海洋(卡西尼号重力测量确认)，海底可能有热液活动(硅石颗粒证据)。是太阳系最可能存在生命的地点之一。',
    relatedIds: ['water', 'organic_chemistry', 'hydrothermal', 'saturn'] },

  { id: 'mimas', keywords: ['土卫一', 'mimas', '弥玛斯', '死星', '赫歇尔'], category: '天体', subcategory: '卫星',
    title: '土卫一(Mimas)',
    content: '土星卫星(直径396km)，因巨大的Herschel撞击坑(直径130km，几乎占卫星1/3)酷似《星球大战》死星。2023年卡西尼数据重新分析发现冰壳下可能有年轻海洋(潮汐加热)。表面密集撞击坑，内部可能分化。轨道共振维持土星环Cassini缝隙。',
    relatedIds: ['saturn', 'impact_crater', 'tidal_heating'] },

  { id: 'rhea', keywords: ['土卫五', 'rhea', '瑞亚', '环'], category: '天体', subcategory: '卫星',
    title: '土卫五(Rhea)',
    content: '土星第二大卫星，直径1,527km。表面以撞击坑为主，有明亮冰质悬崖。可能曾有稀薄环系统(2008年磁层数据暗示，但未确认)。主要由水冰组成(密度1.24g/cm³)。内部可能分化为岩石核心+冰幔。',
    relatedIds: ['saturn', 'water', 'impact_crater'] },

  { id: 'iapetus', keywords: ['土卫八', 'iapetus', '伊阿珀托斯', '两面色', '赤道脊'], category: '天体', subcategory: '卫星',
    title: '土卫八(Iapetus)',
    content: '土星卫星(直径1,469km)，有两个独特特征：①极度两面色(前导面暗如沥青，后随面亮如雪)，暗面物质可能来自Phoebe环；②赤道脊(高20km，宽20km，环绕赤道1/3)，成因不明(可能是古代扁球形自转的残留)。轨道倾角15°(远高于其他大卫星)，公转79天。密度1.09g/cm³(几乎纯冰)。',
    relatedIds: ['saturn', 'ring_system'] },

  // ===================== 其他重要卫星 =====================
  { id: 'triton', keywords: ['海卫一', 'triton', '特里同', '逆行', '间歇泉'], category: '天体', subcategory: '卫星',
    title: '海卫一(Triton)',
    content: '海王星最大卫星，直径2,707km。逆行轨道(太阳系唯一大卫星逆行)，可能是捕获的柯伊伯带天体。表面温度38K(-235°C，太阳系最冷天体之一)。有氮/甲烷间歇泉(喷到8km高)。极稀薄N₂大气(1.4Pa)。表面有"哈密瓜地形"(cantaloupe terrain，独特皱褶结构)和氮冰平原。内部可能有地下海洋。潮汐减速最终将导致Triton碎裂形成环。',
    relatedIds: ['neptune', 'nitrogen', 'kuiper_belt', 'geyser'] },

  { id: 'charon', keywords: ['冥卫一', 'charon', '卡戎', '双星系统', '潮汐锁定'], category: '天体', subcategory: '卫星',
    title: '冥卫一(Charon)',
    content: '冥王星最大卫星，直径1,212km(超过冥王星半径一半)，构成双矮行星系统(质心在冥王星外)。相互潮汐锁定(始终以同一面朝向对方)。新视野号发现：Mordor暗红色极冠(来自冥王星大气逃逸的甲烷)、峡谷(深9km)、山脉。无大气。表面以水冰为主，有少量氨冰。内部可能分化，可能有地下海洋(潮汐加热)。',
    relatedIds: ['pluto', 'water', 'tidal_locking'] },

  { id: 'moon', keywords: ['月球', 'moon', '月亮', 'lunar', '嫦娥', '阿波罗'], category: '天体', subcategory: '卫星',
    title: '月球',
    content: '地球唯一天然卫星，直径3,474km，质量7.342×10²²kg。平均距离384,400km，轨道周期27.3天。表面特征：月海(玄武岩平原，14个)、高地(斜长岩，古老)、撞击坑(密布)。极地永久阴影区有水冰(约6亿吨)。月壤含He-3(核聚变燃料，约100万吨)。形成：大撞击假说(地球与Theia碰撞)。潮汐锁定。阿波罗6次登月(1969-1972)，嫦娥5号2020采样返回。',
    relatedIds: ['earth', 'impact_crater', 'helium', 'tidal_locking', 'apollo'] },

  { id: 'phobos', keywords: ['火卫一', 'phobos', '福波斯', '恐惧'], category: '天体', subcategory: '卫星',
    title: '火卫一(Phobos)',
    content: '火星较大卫星，尺寸27×22×18km，不规则形状。轨道仅6,000km高(太阳系最近卫星)，公转7.66小时(比火星自转快，西升东落)。Stickney撞击坑(直径9km，近卫星宽度一半)。表面覆盖1m厚细尘。每世纪靠近火星1.8m，约5,000万年后将撞入火星或碎裂成环。',
    relatedIds: ['mars', 'impact_crater'] },

  { id: 'deimos', keywords: ['火卫二', 'deimos', '得摩斯', '恐惧'], category: '天体', subcategory: '卫星',
    title: '火卫二(Deimos)',
    content: '火星较小卫星，尺寸15×12×11km。轨道23,460km，公转30.3小时。表面较光滑(尘土覆盖撞击坑)。可能是捕获的小行星(D/C-type)。逃跑速度仅5.7m/s(人类可跳跃脱离)。',
    relatedIds: ['mars', 'phobos'] },

  // ===================== 小天体类型 =====================
  { id: 'asteroid_belt', keywords: ['小行星带', 'asteroid belt', '主带', '小行星主带'], category: '天体', subcategory: '小天体',
    title: '小行星带',
    content: '位于火星和木星之间(2.1-3.3AU)的小天体集合。总质量约3×10²¹kg(仅为月球4%)，Ceres占1/3。已编号小行星>60万颗。分类：C-type(碳质，75%，暗色，含水矿物)、S-type(硅酸盐，17%)、M-type(金属，8%，铁镍)。主要轨道族：Flora、Themis、Koronis。木星引力共振(Kirkwood空隙)塑造带内结构。小行星碰撞产生尘埃带(黄道光来源之一)。',
    relatedIds: ['ceres', 'asteroid_classification', 'jupiter'] },

  { id: 'kuiper_belt', keywords: ['柯伊伯带', 'kuiper belt', 'KBO', '埃奇沃斯', '海外天体', 'TNO'], category: '天体', subcategory: '小天体',
    title: '柯伊伯带',
    content: '海王星轨道外(30-50AU)的冰质小天体环带。已发现>3,000个KBO，估计总数>100,000(直径>100km)。分类：经典KBO(近圆轨道，低倾角)、共振KBO(与海王星轨道共振，如冥王星3:2)、散射盘(高离心率)。总质量约0.1-0.01地球质量。典型成分：水冰、甲烷冰、氮冰、氨。是短周期彗星的主要来源。',
    relatedIds: ['pluto', 'comet', 'neptune'] },

  { id: 'oort_cloud', keywords: ['奥尔特云', 'oort cloud', '奥尔特', '长周期彗星'], category: '天体', subcategory: '小天体',
    title: '奥尔特云',
    content: '太阳系最外层结构(2,000-100,000AU)，球壳状分布的冰质天体。估计含10¹²量级彗星核，总质量约5地球质量。是长周期彗星(>200年)的来源。尚未直接观测(距离太远)，由彗星轨道反推存在。内奥尔特云(2,000-20,000AU)呈盘状，外奥尔特云(20,000-100,000AU)呈球壳。Sedna(远日点937AU)可能是内奥尔特云天体。银河潮汐和近距恒星经过可扰动天体进入内太阳系。',
    relatedIds: ['comet', 'sedna', 'solar_system_boundary'] },

  { id: 'asteroid_classification', keywords: ['小行星分类', '小行星类型', 'C型', 'S型', 'M型', 'asteroid type'], category: '天体', subcategory: '小天体',
    title: '小行星分类体系',
    content: 'Tholen分类(14类)→SMASS分类(26类)。主要类型：C-type(碳质，75%，Ceres/Pallas/Hygiea，含水矿物+有机物，反照率0.03-0.1)；S-type(硅酸盐，17%，Vesta/Eros/Ida，橄榄石/辉石+金属，反照率0.1-0.2)；M-type(金属，8%，Psyche/Kleopatra，铁镍合金，反照率0.1-0.2)。其他：V-type(Vesta族，玄武岩)、D-type(特洛伊群，有机物富集)、X-type(未分类型)。',
    relatedIds: ['asteroid_belt', 'ceres', 'vesta'] },

  { id: 'vesta', keywords: ['灶神星', 'vesta', 'V-type', '小行星', '原行星'], category: '天体', subcategory: '小天体',
    title: '灶神星(Vesta)',
    content: '小行星带第二大天体(直径525km)和最亮小行星(肉眼可见)。V-type玄武岩表面(唯一有火山活动证据的小行星)。Dawn号(2011-2012)发现：Rheasilvia南极撞击盆地(直径505km，太阳系最大撞击坑之一)、铁镍核心(约220km半径，分化结构)。HED陨石(地球收集最多的一类)确认来自Vesta。是研究行星分化过程的窗口。',
    relatedIds: ['asteroid_belt', 'asteroid_classification'] },

  { id: 'sedna', keywords: ['赛德娜', 'sedna', '内奥尔特云', '极端轨道'], category: '天体', subcategory: '小天体',
    title: '赛德娜(Sedna)',
    content: '太阳系最远已知矮行星候选。远日点937AU(0.015光年)，近日点76AU，周期约11,400年。直径约995km，表面极红(太阳系最红天体之一，含复杂有机物)。轨道无法用现有太阳系模型解释(可能受太阳系外天体或伴星扰动，或太阳诞生星团残留)。可能是内奥尔特云天体的首个样本。2003年发现。',
    relatedIds: ['oort_cloud', 'dwarf_planet'] },

  // ===================== 彗星 =====================
  { id: 'comet', keywords: ['彗星', 'comet', '尾巴', '彗发', '脏雪球', '扫帚星'], category: '天体', subcategory: '彗星',
    title: '彗星',
    content: '由冰、尘埃和岩石组成的小天体("脏雪球"模型)。接近太阳时冰升华形成彗发(可达10⁵km)和尾巴：①离子尾(太阳风驱动，蓝色，直线，可达1AU+)；②尘埃尾(辐射压驱动，白色/黄色，弯曲)。来源：柯伊伯带(短周期，<200年，如Halley 76年)和奥尔特云(长周期，>200年)。著名彗星：Halley、Hale-Bopp、Neowise。Rosetta(2014-2016)着陆67P/Churyumov-Gerasimenko，发现氨基酸和有机分子。',
    relatedIds: ['kuiper_belt', 'oort_cloud', 'solar_wind', 'organic_chemistry'] },

  { id: 'halley_comet', keywords: ['哈雷彗星', 'halley', '哈雷', '76年'], category: '天体', subcategory: '彗星',
    title: '哈雷彗星',
    content: '最著名的短周期彗星，周期约75.3年。上次回归1986年，下次2061年。轨道半长轴17.8AU，离心率0.967。彗核15×8km(花生形)，质量2.2×10¹⁴kg，表面极暗(反照率0.04)。每次通过内太阳系损失约3×10¹¹kg物质。Giotto探测器1986年飞至596km，首次拍到彗核。人类观测记录可追溯至公元前240年(中国史书记载)。以Edmond Halley命名(预言回归)。',
    relatedIds: ['comet', 'kuiper_belt'] },

  // ===================== 太阳系结构 =====================
  { id: 'solar_system_structure', keywords: ['太阳系结构', '太阳系', 'solar system', '行星系', '太阳系边界'], category: '天体', subcategory: '太阳系',
    title: '太阳系结构总览',
    content: '太阳系由内到外：①内行星带(0.3-1.5AU)：水星/金星/地球/火星，岩石质；②小行星带(2.1-3.3AU)：岩石/碳质/金属小天体；③外行星区(5-30AU)：木星/土星(气态巨行星)、天王星/海王星(冰巨行星)；④柯伊伯带(30-50AU)：冰质矮行星和KBO；⑤散射盘(50-2,000AU)：高离心率冰天体；⑥奥尔特云(2,000-100,000AU)：彗星库。太阳系边界：日球层顶(heliopause，~120AU)是太阳风与星际介质的界面。旅行者1号2012年越过日球层顶进入星际空间。',
    relatedIds: ['sun', 'asteroid_belt', 'kuiper_belt', 'oort_cloud'] },

  { id: 'solar_system_boundary', keywords: ['太阳系边界', '日球层', 'heliopause', '星际空间', '旅行者'], category: '天体', subcategory: '太阳系',
    title: '太阳系边界',
    content: '太阳系边界多层结构：①日球层(heliosphere)：太阳风圈，终止激波(85AU)→日球层鞘→日球层顶(121AU)；②星际介质：太阳以~26km/s穿越本地星际云。旅行者1号(2012年，121AU)和旅行者2号(2018年，119AU)越过日球层顶。奥尔特云外缘(~100,000AU，~1.6光年)是太阳引力支配范围。最近的恒星比邻星4.24光年。太阳系绕银河系中心公转(2.25亿年/圈，银河年)。',
    relatedIds: ['oort_cloud', 'solar_wind', 'interstellar_medium'] },

  { id: 'habitable_zone', keywords: ['宜居带', 'habitable zone', '生命区', '金发姑娘', '液态水'], category: '天体', subcategory: '太阳系',
    title: '宜居带(金发姑娘区)',
    content: '恒星周围允许液态水存在的轨道区域。太阳系宜居带约0.95-1.37AU(仅地球完全在内，金星在热内缘，火星在冷外缘)。取决于：恒星光度(主序星OBAFGKM)、行星大气(温室效应)、反照率、板块活动。扩展宜居带概念：冰壳下海洋(Europa/Enceladus)可能在传统宜居带外存在生命。银河系宜居带：距银心7-9kpc(太近辐射强，太远金属少)。全银河系估计约3-40亿颗潜在宜居行星。',
    relatedIds: ['earth', 'mars', 'europa', 'enceladus', 'extraterrestrial_life'] },

  // ===================== 常见问答(用户高频问题) =====================
  { id: 'why_planets_round', keywords: ['行星为什么圆', '为什么圆', '球形', '为什么球体', '为什么是圆的', '行星形状'], category: '天体', subcategory: '基础问答',
    title: '为什么行星是圆的？',
    content: '当物体质量足够大时，自身引力会超过材料强度，使物质向质心坍缩成球形——这叫"流体静力平衡"。大约在直径超过800km的天体就能达到这个状态。小行星因为质量不够，形状不规则。旋转的行星赤道会略微鼓起(扁球体)，如地球赤道半径比极半径长21km，木星更明显(扁率0.065)。所以严格来说，行星不是完美球体，而是扁球体。',
    relatedIds: ['ceres', 'vesta', 'gravity_basics'] },

  { id: 'why_no_pluto', keywords: ['冥王星为什么不算', '冥王星降级', '为什么不是行星', '行星定义', '冥王星争议', 'IAU定义'], category: '天体', subcategory: '基础问答',
    title: '冥王星为什么不是行星？',
    content: '2006年IAU(国际天文学联合会)定义行星必须满足三个条件：①围绕太阳运行 ②质量足够大达到流体静力平衡(近球形) ③清除了轨道附近的其他天体。冥王星满足①②但不满足③——它与柯伊伯带众多天体共享轨道，没有"统治"自己的轨道区域。因此被归类为矮行星。同类还有谷神星、阋神星、鸟神星等。这个决定至今仍有争议，部分天文学家认为应该恢复冥王星的行星地位。',
    relatedIds: ['pluto', 'ceres', 'kuiper_belt', 'dwarf_planets'] },

  { id: 'how_hot_sun', keywords: ['太阳多热', '太阳温度', '太阳表面温度', '太阳核心温度', '太阳有多热'], category: '天体', subcategory: '基础问答',
    title: '太阳到底有多热？',
    content: '太阳不同部分温度差异巨大：核心约1,500万K(核聚变在此发生)，辐射区700万-200万K，对流区200万-5,700K，光球层(我们看到的"表面")5,778K，色球层约1万K，日冕(最外层)反而升至100-300万K——这是太阳物理最大的未解之谜之一，叫"日冕加热问题"。太阳黑子温度约3,800-4,200K(比周围暗所以看起来是"黑"的)。太阳每秒通过核聚变将400万吨物质转化为能量(E=mc²)。',
    relatedIds: ['sun', 'solar_wind', 'nuclear_fusion'] },

  { id: 'moon_origin', keywords: ['月球怎么来的', '月球起源', '月球形成', '月球哪里来', '大碰撞假说'], category: '天体', subcategory: '基础问答',
    title: '月球是怎么来的？',
    content: '最被接受的假说是"大碰撞假说"：约45亿年前，一颗火星大小的原行星(叫Theia)撞击了原始地球，抛射出的物质在地球轨道上聚合形成了月球。证据：①月球成分与地球地幔极其相似(同位素比值) ②月球铁核极小(Theia的核心沉入地球) ③月岩几乎不含挥发性元素(碰撞高温蒸发了) ④月球自转和公转角动量一致。其他假说(捕获说、同源说)无法同时解释以上所有特征。2023年新研究支持Theia残骸可能仍存在于地球深部(LLSVPs)。',
    relatedIds: ['moon', 'earth', 'impact_theory'] },

  { id: 'how_many_stars', keywords: ['多少星星', '银河系多少星', '宇宙多少星', '星星数量', '恒星数量', '可观测宇宙'], category: '天体', subcategory: '基础问答',
    title: '宇宙中有多少颗星星？',
    content: '银河系约1,000-4,000亿颗恒星。可观测宇宙约2万亿个星系。所以可观测宇宙恒星总数约10²⁴(1后面24个零)——比地球上所有沙滩的沙粒总数还多。但这只是"可观测"宇宙(半径465亿光年)，整个宇宙可能无限大。而每颗恒星周围平均有1-2颗行星(开普勒数据)，所以行星数量更是天文数字。你能看到的裸眼恒星约6,000颗(全球)，同一时刻约3,000颗。',
    relatedIds: ['milky_way', 'observable_universe', 'cosmic_scale'] },

  { id: 'planet_rings', keywords: ['行星环', '土星环', '木星环', '天王星环', '海王星环', '为什么有环', '环从哪来'], category: '天体', subcategory: '基础问答',
    title: '为什么土星有环？其他行星呢？',
    content: '四大气态巨行星都有环！土星环最壮观(主环宽7万km，厚度仅10-100m)，成分99.9%水冰，粒径从微尘到房屋大小。环的来源可能是：①被潮汐力撕碎的小卫星 ②卫星碰撞碎片 ③原始物质未被卫星清扫。木星环暗而薄(尘粒为主)，天王星有13条窄环(暗色)，海王星5条环(最外层亚当斯环有"弧"结构)。土星环可能很年轻——卡西尼数据暗示仅1-4亿年，意味着恐龙时代可能还没看到土星环！',
    relatedIds: ['saturn', 'jupiter', 'uranus', 'neptune'] },

  { id: 'jupiter_protect', keywords: ['木星保护', '木星盾牌', '木星防御', '引力盾', '地球保护者'], category: '天体', subcategory: '基础问答',
    title: '木星真的保护地球吗？',
    content: '这个说法有争议。传统观点认为木星强大引力会偏转或捕获小行星/彗星，保护内太阳系——典型例子是1994年苏梅克-列维9号彗星撞击木星。但2007年研究指出木星也可能把原本无害的小天体弹射到地球交叉轨道上，增加威胁。所以木星既是"盾牌"也是"弹弓"，净效果取决于具体参数。总体来说对长周期彗星的偏转作用更显著。',
    relatedIds: ['jupiter', 'shoemaker_levy', 'asteroid_defense', 'neo'] },

  { id: 'ocean_worlds', keywords: ['海洋世界', '地下海洋', '冰下海洋', '木卫二', '土卫二', '地外海洋', '地下海'], category: '天体', subcategory: '基础问答',
    title: '太阳系中有哪些地下海洋？',
    content: '至少6个天体确认或高度疑似存在地下液态水海洋：①木卫二Europa(冰壳下100km深海洋，水量是地球2倍) ②土卫二Enceladus(喷泉证实，全球海30km深) ③木卫三Ganymede(太阳系最大卫星，夹层海洋) ④木卫四Callisto(地下海证据较弱) ⑤土卫六Titan(甲烷湖泊+地下水-氨海) ⑥冥卫一Charon(疑似)。这些海洋世界是目前搜寻地外生命最优先目标，Europa Clipper(2024发射)和Dragonfly(2027发射)将重点探测。',
    relatedIds: ['europa', 'enceladus', 'ganymede', 'titan', 'extraterrestrial_life'] },

  { id: 'red_spot', keywords: ['大红斑', '木星大红斑', 'great red spot', '风暴', '木星风暴'], category: '天体', subcategory: '基础问答',
    title: '木星大红斑是什么？',
    content: '木星大红斑是太阳系最大的反气旋风暴，已持续至少350年(首次望远镜观测1665年)。当前尺寸约16,350×10,940km(可装1.3个地球)，但正在缩小——1979年旅行者号时约23,000km宽，现在约16,000km。风速高达680km/h(边缘)，旋转周期约6地球日。红色可能来自光化学反应产物(氨与乙炔在紫外下生成)，风暴将深层的硫化物或有机物翻到上层。大红斑正在缩小且变圆，可能在数十年内消失。',
    relatedIds: ['jupiter', 'atmosphere', 'storm'] },
];
