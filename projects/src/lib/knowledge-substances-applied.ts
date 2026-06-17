/**
 * 宇宙全知识数据库 — 物质与天体化学 + 应用领域
 * 涵盖：元素/分子/矿物/星际化学 + 轨道力学/地质/遥感/工程/探测任务/星际航行
 */

import type { KnowledgeEntry } from './universe-knowledge-database';

export const substancesAppliedEntries: KnowledgeEntry[] = [
  // ===================== 核心元素 =====================
  { id: 'hydrogen', keywords: ['氢', 'hydrogen', 'H', 'H₂', '最轻元素', '燃料', '质子'], category: '物质', subcategory: '元素',
    title: '氢(H)',
    content: '宇宙最丰富元素，占可见物质质量73.46%(原子数92%)。存在形式：分子氢H₂(木星/土星大气)、原子氢H(星际介质)、离子氢H⁺(太阳核心)、金属氢(木星内部>400GPa)。恒星核聚变燃料(4H→He+26.7MeV)。液氢火箭燃料(比冲450s)。三种同位素：¹H(氕,99.98%)、²H/D(氘,0.02%，BBN探针)、³H/T(氚,痕量放射性)。H₂是最简单分子(键长0.74Å)。21cm射电谱线是银河系结构测绘的关键。',
    relatedIds: ['helium', 'sun', 'nuclear_fusion', 'big_bang'] },

  { id: 'helium', keywords: ['氦', 'helium', 'He', '惰性气体', '超流体'], category: '物质', subcategory: '元素',
    title: '氦(He)',
    content: '宇宙第二丰富元素(质量24.85%，原子8%)。恒星核聚变产物(3α→¹²C, pp链→⁴He)。地球上极稀缺(从天然气提取，0.3-2%)。He-3是潜在核聚变燃料(D+³He→⁴He+p+18.4MeV，无中子)。月球表面含He-3约100万吨(太阳风注入)。超流体He-4(<2.17K)零粘度流动，量子宏观现象(喷泉效应、第二声)。He-3/He-4混合物在极低温(<2.6mK)展现超流和磁性共存。',
    relatedIds: ['hydrogen', 'sun', 'nuclear_fusion', 'moon'] },

  { id: 'carbon', keywords: ['碳', 'carbon', 'C', '生命基础', '有机', '金刚石', '石墨'], category: '物质', subcategory: '元素',
    title: '碳(C)',
    content: '生命基础元素，宇宙丰度第4(H/He/O之后)。3α过程在红巨星中产生(3⁴He→¹²C)。独特成键能力(4个共价键)：有机化学核心。同素异形体：金刚石(3D四面体，超硬)、石墨(2D层状，导电)、石墨烯(单层，2004发现)、碳60(富勒烯)、碳纳米管、无定形碳。星际碳化学：CO(第二丰富分子)、CH₄、PAH(多环芳烃，宇宙碳循环)、HCN(生命前体)。太阳系：木星/土星大气含CH₄、CO；碳质小行星含水+有机物。',
    relatedIds: ['organic_chemistry', 'hydrogen', 'oxygen', 'stellar_evolution'] },

  { id: 'oxygen', keywords: ['氧', 'oxygen', 'O', 'O₂', '水', '燃烧'], category: '物质', subcategory: '元素',
    title: '氧(O)',
    content: '宇宙丰度第3(质量)、地球地壳最丰富元素(46%)。恒星核合成产物(¹⁶O: α过程，¹⁷O/¹⁸O: CNO循环)。太阳系：地球大气O₂ 20.95%(光合作用产生，24亿年前大氧化事件)；木卫二/三表面O₂(辐射分解冰产生)；火星大气O₂ 0.13%。星际：OH(羟基，星际化学起始)、H₂O(最丰富三原子分子)、CO(第二丰富双原子)、SiO(恒星出流)。氧的三种同位素(¹⁶O/¹⁷O/¹⁸O)比值是太阳系形成过程的重要示踪剂。',
    relatedIds: ['water', 'earth', 'silicate', 'stellar_evolution'] },

  { id: 'iron', keywords: ['铁', 'iron', 'Fe', '铁镍', '地核', '⁵⁶Fe'], category: '物质', subcategory: '元素',
    title: '铁(Fe)',
    content: '宇宙第6丰富元素，核合成终点(⁵⁶Fe最高比结合能8.8MeV/核子)。硅燃烧(¹²C+¹²C→⁵⁶Ni→⁵⁶Fe)在大质量恒星最后一天发生。地球核心：液态铁镍外核(产生磁场)+固态铁镍内核。火星表面氧化铁(Fe₂O₃)致红色。小行星16 Psyche可能是暴露的行星铁核(2.3×10¹⁹kg金属)。铁陨石(Fe-Ni合金)是最大陨石类型。铁的s-过程同位素(⁵⁴Fe/⁵⁶Fe/⁵⁷Fe/⁵⁸Fe)是宇宙化学演化指标。',
    relatedIds: ['earth', 'mars', 'nuclear_fusion', 'magnetic_field', 'asteroid_classification'] },

  { id: 'silicon', keywords: ['硅', 'silicon', 'Si', '硅酸盐', '半导体'], category: '物质', subcategory: '元素',
    title: '硅(Si)',
    content: '宇宙丰度第8，地球地壳第二丰富元素(28%)。恒星α链产物(²⁸Si)。硅酸盐矿物(SiO₄四面体)是类地行星和小行星的主要成分。橄榄石(Mg₂SiO₄)、辉石(MgSiO₃)、长石(KAlSi₃O₈)、石英(SiO₂)。星际：SiO是恒星出流标志分子(脉泽)。碳星(C/O>1)与正常星(C/O<1)的化学差异：碳星形成碳化物(Fe₃C/SiC)而非硅酸盐。S-type小行星含硅酸盐+金属。',
    relatedIds: ['silicate', 'earth', 'asteroid_classification'] },

  // ===================== 核心分子 =====================
  { id: 'water', keywords: ['水', 'water', 'H₂O', '冰', '液态水', '海洋', '水冰'], category: '物质', subcategory: '分子',
    title: '水(H₂O)',
    content: '生命之源，太阳系广泛存在：地球(液态海洋1.4×10²¹kg)、火星(极冠冰+地下液态水)、木卫二(冰下海洋60-150km深，水量为地球2-3倍)、木卫三(三层海洋)、土卫二(南极喷射水冰)、土卫六(甲烷/乙烷湖泊)、月球(极地6亿吨水冰)。小行星Ceres含水量25%。星际水丰富(分子云冷区、彗星、原行星盘)。高压相：冰VII(>2.1GPa)/冰X(>44GPa)/超离子相(兼具固体和液体特征)。水是原位资源利用(ISRU)的首要目标。',
    relatedIds: ['europa', 'enceladus', 'earth', 'mars', 'moon', 'isru'] },

  { id: 'methane', keywords: ['甲烷', 'methane', 'CH₄', '天然气'], category: '物质', subcategory: '分子',
    title: '甲烷(CH₄)',
    content: '太阳系第四丰富分子。土卫六大气1.4%CH₄(形成甲烷循环：蒸发→云→雨→河→湖→蒸发)。冥王星表面覆盖甲烷冰。火星大气微量CH₄(0.2-10ppb，来源争议：生物vs地质vs探测器污染)。天王星/海王星大气CH₄ 2-3%(吸收红光致蓝绿色)。星际有机化学起始分子(在分子云中合成更复杂有机物)。甲烷水合物(可燃冰)是潜在能源和气候因子。冥古宙地球可能存在甲烷雾(类似土卫六)。',
    relatedIds: ['titan', 'pluto', 'uranus', 'neptune', 'organic_chemistry'] },

  { id: 'co2', keywords: ['二氧化碳', 'CO₂', 'carbon dioxide', '温室气体', '干冰'], category: '物质', subcategory: '分子',
    title: '二氧化碳(CO₂)',
    content: '火星大气主要成分(95.3%)，极冠含有大量干冰(CO₂固态，升华点-78.5°C)。金星大气96.5%CO₂，极端温室效应(表面462°C)。地球大气CO₂ 0.04%(从工业前280ppm升至2024年425ppm)。木卫二表面CO₂冰与水冰混合。CO₂在高压(>7.38MPa)高温(>31.1°C)下成超临界流体。火星ISRU：CO₂→O₂(MOXIE实验2021年成功)。CO₂是碳循环的核心分子。',
    relatedIds: ['mars', 'venus', 'greenhouse_effect', 'isru'] },

  { id: 'ammonia', keywords: ['氨', 'ammonia', 'NH₃', '氨水'], category: '物质', subcategory: '分子',
    title: '氨(NH₃)',
    content: '木星/土星大气微量成分(NH₃云层是可见特征)。土卫六可能的地下海洋含氨水(氨降低冰点)。星际NH₃是分子云温度计(转动温度测量)。地球：工业生产肥料(哈伯法N₂+3H₂→2NH₃，1.5%全球能耗)。氨是生物固氮中间体。土星环中的NH₃冰。太阳系外：气态巨行星大气的NH₃丰度是金属度指标。',
    relatedIds: ['jupiter', 'saturn', 'titan', 'organic_chemistry'] },

  // ===================== 矿物与星际化学 =====================
  { id: 'silicate', keywords: ['硅酸盐', 'silicate', '橄榄石', '辉石', '长石', 'SiO₂', 'bridgmanite'], category: '物质', subcategory: '矿物',
    title: '硅酸盐矿物',
    content: '类地行星和小行星主要成分。橄榄石(Mg₂SiO₄-Fe₂SiO₄)：地幔主矿物(上地幔>60%)，月球/KBO表面常见，彗星尘中丰富。辉石(MgSiO₃-FeSiO₃)：地壳和月壳成分。长石(KAlSi₃O₈等)：月球高地(斜长岩壳)。Bridgmanite(MgSiO₃钙钛矿)：下地幔主矿物(占地球体积38%，2014年命名)。硅酸盐尘埃是原行星盘和ISM主要固体成分(9.7μm和18μm红外特征)。S-type小行星含硅酸盐+金属。',
    relatedIds: ['earth', 'silicon', 'moon', 'asteroid_classification'] },

  { id: 'carbonate', keywords: ['碳酸盐', 'carbonate', 'CaCO₃', '石灰岩', '方解石'], category: '物质', subcategory: '矿物',
    title: '碳酸盐矿物',
    content: '含CO₃²⁻的矿物。地球：石灰岩(方解石CaCO₃/文石)、白云石CaMg(CO₃)₂，是碳循环长期储库。火星：2008年凤凰号首次发现碳酸钙；轨道光谱发现Nili Fossae区域碳酸盐(中性/碱性水环境证据)。谷神星Occator陨石坑亮斑=碳酸钠(Na₂CO₃)，来自地下盐水。碳酸盐-硅酸盐循环(风化→海洋沉积→俯冲→火山返回)是地球长期气候调节器(数百万年)。',
    relatedIds: ['mars', 'ceres', 'co2', 'earth'] },

  { id: 'organic_chemistry', keywords: ['有机化学', '有机物', 'organic', '氨基酸', '前生命', '生命起源'], category: '物质', subcategory: '天体化学',
    title: '天体有机化学',
    content: '太阳系和星际空间中有机分子的合成与分布。星际：200+种已确认分子(2024)，含复杂有机物：甲醇CH₃OH、甲酸HCOOH、乙醇C₂H₅OH、甘氨酸(最简氨基酸，2003年在ISM中确认)。土卫六：惠更斯探测到复杂有机物(噻吩/苯/HCN聚合物)，是前生命化学天然实验室。陨石(Murchison 1969)：100+种氨基酸(含非地球手性)、碱基(嘌呤/嘧啶)、糖类。彗星67P：Rosetta发现甘氨酸和磷。生命可能起源于星际有机物输送到早期地球。',
    relatedIds: ['titan', 'comet', 'enceladus', 'extraterrestrial_life', 'nebula'] },

  { id: 'r_process', keywords: ['r过程', 'r-process', '快中子捕获', '重元素', '金', '铂', '铀'], category: '物质', subcategory: '天体化学',
    title: 'r-过程(快中子捕获)',
    content: '在极高中子通量下原子核快速捕获中子产生重元素的核过程(约一半比铁重的元素)。条件：中子密度>10²⁰/cm³，温度>10⁹K。场所：中子星合并(GW170817确认，产生约10地球质量的金和50地球质量的铀)、核心坍缩超新星(可能)。产物：金(ⁱ⁹⁷Au)、铂(¹⁹⁵Pt)、铀(²³⁸U)、钍(²³²Th)、稀土元素。s-过程(慢中子捕获)在AGB星中产生另一半重元素(如Ba/Sr/Pb)。宇宙化学演化：早期宇宙重元素极少(Pop III星)，随代际增加。',
    relatedIds: ['neutron_star', 'supernova', 'gravitational_waves', 'nuclear_fusion'] },

  // ===================== 轨道力学 =====================
  { id: 'orbital_mechanics', keywords: ['轨道力学', '开普勒', '椭圆', '公转', '轨道要素', 'orbital mechanics'], category: '轨道', subcategory: '基础',
    title: '轨道力学',
    content: '研究天体在引力场中运动的理论。开普勒三定律：①轨道为椭圆(焦点在中心天体)、②面积速度恒定(dA/dt=L/2m=const)、③T²=4π²a³/GM。6个轨道要素：半长轴a、离心率e、倾角i、升交点经度Ω、近日点幅角ω、真近点角ν。活力公式：v²=GM(2/r-1/a)。特殊轨道速度：v_circular=√(GM/r)、v_escape=√(2GM/r)。轨道能量E=-GMm/2a(椭圆轨道为负)。',
    relatedIds: ['gravity', 'transfer_orbit', 'lagrange_point'] },

  { id: 'transfer_orbit', keywords: ['霍曼转移', 'Hohmann', '转移轨道', '轨道转移', 'delta-v'], category: '轨道', subcategory: '转移',
    title: '轨道转移',
    content: '改变航天器轨道的方法。霍曼转移：最省燃料的双脉冲转移(切向加速→椭圆过渡→切向再加速)，地球→火星约259天，ΔV≈5.6km/s。双椭圆转移：三次脉冲，远地点极远，某些情况下比霍曼更省燃料。引力助推：利用行星引力改变速度(旅行者号通过木星/土星获得速度逃逸太阳系)，ΔV可达行星轨道速度量级。低推力转移：离子推进持续加速，螺旋扩展轨道(Dawn号)。月球自由返回轨道(Apollo 13使用)。',
    relatedIds: ['orbital_mechanics', 'gravity', 'space_propulsion', 'interplanetary'] },

  { id: 'interplanetary', keywords: ['行星际航行', 'interplanetary', '星际航行', '深空航行', '探测窗口'], category: '轨道', subcategory: '航行',
    title: '行星际航行',
    content: '太阳系内的航天器航行。发射窗口：行星对齐的最优时机(地球-火星每26个月，地球-木星每13个月)。通信时延：火星4-24分钟(取决于距离)、木星35-52分钟。辐射环境：太阳风+GCR(银河宇宙线)+SEP(太阳高能粒子)，火星往返约1-2Sv(增加5%终生致癌风险)。关键任务剖面：月球3天、火星6-9个月、木星5-7年(引力助推)、冥王星9.5年(新视野号直线)。深空网络(DSN)：加州/西班牙/澳大利亚3个站点提供连续通信。',
    relatedIds: ['transfer_orbit', 'space_propulsion', 'lagrange_point'] },

  // ===================== 行星地质 =====================
  { id: 'impact_crater', keywords: ['撞击坑', 'impact crater', '陨石坑', '冲击变质', '撞击事件'], category: '地质', subcategory: '撞击',
    title: '撞击坑地质学',
    content: '天体表面撞击形成的圆形凹陷。形成过程：接触→压缩→挖掘→修改(4阶段)。分类：简单坑(直径<2-4km，碗形)→复杂坑(中央隆起+阶地壁)→多环盆地(>300km)。撞击能量E=0.5mv²(典型20km/s)。著名撞击坑：Chicxulub(180km，6600万年前恐龙灭绝)、Vredefort(300km，最大已知)、Hellas(2,300km，火星)。定年法：crater计数(表面年龄∝累积密度)。月球高地>40亿年，Io表面<100万年。撞击是太阳系最普遍的地质过程。',
    relatedIds: ['mercury', 'moon', 'mars', 'mass_extinction'] },

  { id: 'volcanism', keywords: ['火山', 'volcanism', '火山活动', '岩浆', '熔岩', '冰火山'], category: '地质', subcategory: '火山',
    title: '地外火山学',
    content: '太阳系火山类型：①硅酸盐火山(地球/火星/Venus/Io)：岩浆由部分熔融产生，地球7%板块边界火山+热点。②冰火山(冰壳天体)：木卫二冰脊(水/冰喷出)、Enceladus虎纹喷射(水冰+有机物)、Ceres冰火山Ahuna Mons(盐水)。③硫火山(Io)：液态硫/二氧化硫。Olympus Mons(21.9km高，600km直径盾状火山，火星)是太阳系最高火山。Io Loki火山功率>100TW。冰火山是地下海洋存在的直接证据。',
    relatedIds: ['io', 'europa', 'enceladus', 'olympus_mons', 'mars'] },

  { id: 'olympus_mons', keywords: ['奥林匹斯山', 'Olympus Mons', '火星山', '最高山', '盾状火山'], category: '地质', subcategory: '地貌',
    title: '奥林匹斯山',
    content: '火星上的盾状火山，太阳系最高山。高度21.9km(珠峰2.9倍)，底部直径600km(面积≈法国)，火山口直径80km×60km(6个重叠塌陷坑)。坡度仅5°(典型盾状火山特征)。形成条件：火星无板块构造，热点固定→岩浆持续堆积→巨盾火山(对比地球夏威夷链：板块移动→岛链)。年龄约1-2亿年(相对年轻)，可能仍有弱活动。周围有lobed apron(熔岩流前缘)和aureole(巨大滑坡沉积)。',
    relatedIds: ['mars', 'volcanism', 'plate_tectonics'] },

  { id: 'valles_marineris', keywords: ['水手号峡谷', 'Valles Marineris', '火星峡谷', '大峡谷'], category: '地质', subcategory: '地貌',
    title: '水手号峡谷',
    content: '火星赤道附近的巨大峡谷系统，太阳系最大峡谷。长4,000km(美国宽度)、宽200km、深7km(大峡谷6倍深)。起因：早期Tharsis隆起产生的构造拉伸(非水流侵蚀，但后期水流扩大)。分支：Coprates Chasma、Ganges Chasma、Hebes Chasma等。内壁层状沉积物暗示曾有水活动。末端Chryse地区连接北部溢流河道(古代大洪水证据)。',
    relatedIds: ['mars', 'water', 'geology'] },

  { id: 'plate_tectonics', keywords: ['板块构造', 'plate tectonics', '板块', '俯冲', '地壳运动', '大陆漂移'], category: '地质', subcategory: '构造',
    title: '板块构造',
    content: '地球独有的地质过程(太阳系唯一确认)。7大板块+数小板块，运动速度1-10cm/年。驱动力：地幔对流(热上升→脊→俯冲→冷下沉)。三类边界：离散(洋中脊，新地壳)、汇聚(俯冲带/碰撞，旧地壳消减)、转换(走滑断层)。板块构造调节CO₂(硅酸盐风化-碳酸盐循环)，是地球长期宜居的关键。火星/Venus无板块构造：火星壳太厚(单壳)，Venus无水(水降低岩石强度，是板块运动的润滑剂)。木卫二可能有冰板块构造。',
    relatedIds: ['earth', 'mars', 'venus', 'volcanism'] },

  { id: 'mass_extinction', keywords: ['大灭绝', 'mass extinction', '恐龙灭绝', '希克苏鲁伯', 'K-T'], category: '地质', subcategory: '事件',
    title: '大灭绝事件',
    content: '地球5次大灭绝(显生宙)：①奥陶纪-志留纪(443Ma，86%种灭绝，冰期)；②晚泥盆纪(359Ma，75%，海洋缺氧)；③二叠纪-三叠纪(252Ma，96%，最大，西伯利亚暗色岩火山)；④三叠纪-侏罗纪(201Ma，80%，中大西洋火成岩省)；⑤白垩纪-古近纪(66Ma，76%，Chicxulub撞击)。第六次大灭绝可能正在发生(人类活动)。小行星撞击频率：100m级~1,000年、1km级~50万年、10km级~1亿年。',
    relatedIds: ['impact_crater', 'neo', 'asteroid_belt'] },

  // ===================== 遥感分析 =====================
  { id: 'spectroscopy', keywords: ['光谱学', 'spectroscopy', '光谱', '吸收线', '发射线', '光谱分析'], category: '遥感', subcategory: '技术',
    title: '光谱学',
    content: '通过分析天体电磁辐射的频率分布获取化学/物理信息。三大类型：发射光谱(原子/分子从高能级向低跃迁)、吸收光谱(连续谱经介质选择吸收)、连续光谱(黑体辐射)。原子谱线：Lyman系列(紫外)、Balmer系列(可见光)、Paschen系列(红外)。分子谱带：转动(微波/远红外)、振动(红外)、电子(可见/紫外)。多普勒效应→视向速度。红移→距离。金属丰度→化学演化。X射线光谱→高温等离子体。光谱是天体物理最重要的诊断工具。',
    relatedIds: ['doppler_effect', 'blackbody', 'spectral_type', 'remote_sensing'] },

  { id: 'remote_sensing', keywords: ['遥感', 'remote sensing', '雷达', 'LiDAR', '热成像', 'SAR'], category: '遥感', subcategory: '技术',
    title: '遥感技术',
    content: '非接触式获取天体表面/大气信息的技术。主动式：雷达(穿透云层/地下，Magellan测绘金星)、LiDAR(高程测量，MOLA测绘火星地形)、SAR(合成孔径雷达，Cassini测绘Titan表面)。被动式：多光谱成像(不同波段组合识别矿物)、热辐射(表面温度/热惯性)、紫外/红外光谱(大气成分)。Orbiter遥感：HiRISE(火星0.3m分辨率)、CRISM(矿物)、VIIRS(地球)。地面遥感：APXS(Curiosity化学分析)、LIBS(激光诱导击穿光谱)。',
    relatedIds: ['spectroscopy', 'mars', 'venus', 'titan'] },

  { id: 'blackbody', keywords: ['黑体辐射', 'blackbody', '维恩位移', '普朗克', 'Stefan-Boltzmann'], category: '遥感', subcategory: '基础',
    title: '黑体辐射',
    content: '理想吸收体(发射率=1)的热辐射。普朗克公式B(ν,T)=2hν³/c²×1/(e^(hν/kT)-1)。维恩位移定律：λ_max=2.898mm·K/T(太阳5,778K→502nm黄绿、宇宙CMB 2.725K→1.06mm微波)。Stefan-Boltzmann定律：L=σT⁴×4πR²(恒星光度∝T⁴R²)。天文应用：恒星近似黑体→由光谱型估计温度和半径；CMB是近乎完美黑体(偏差<10⁻⁵)；行星热辐射→表面温度；尘埃热辐射→温度和分布。',
    relatedIds: ['spectroscopy', 'sun', 'cmb', 'stellar_evolution'] },

  { id: 'doppler_effect', keywords: ['多普勒效应', 'Doppler', '红移', '蓝移', '视向速度'], category: '遥感', subcategory: '基础',
    title: '多普勒效应',
    content: '波源与观测者相对运动导致频率偏移。光的多普勒：λ_obs=λ_emit×√((1+β)/(1-β))(相对论性)，低速近似Δλ/λ=v/c。天文应用：①视向速度法探测系外行星(51 Peg b，1995)；②星系红移→距离(哈勃定律)；③谱线轮廓→恒星自转；④脉冲星计时→双星轨道参数；⑤日震学(太阳振动模式)。声学多普勒：轨道器与地面通信的频率偏移可探测行星重力场(质量瘤)。',
    relatedIds: ['spectroscopy', 'cosmic_expansion', 'exoplanet', 'pulsar'] },

  // ===================== 太空工程 =====================
  { id: 'space_propulsion', keywords: ['推进', 'propulsion', '火箭', '离子推进', '比冲', '燃料'], category: '工程', subcategory: '推进',
    title: '航天推进系统',
    content: '化学推进：液氢/液氧(比冲450s)、甲烷/液氧(比冲360s)、固体推进剂(比冲250s)。电推进：离子推进(比冲3,000s，推力<1N，Dawn/DS1/Hayabusa)、霍尔推进(比冲1,500-2,500s，Starlink卫星)、VASIMR(比冲5,000-30,000s，实验中)。核热推进(NTP)：比冲900s(反应堆加热H₂，火星39天)。核脉冲推进(猎户座计划)：比冲10,000s(核弹爆炸推板，理论可行)。光帆：Breakthrough Starshot(0.2c飞越比邻星)。齐奥尔科夫斯基方程：ΔV=Isp×g₀×ln(m₀/mf)。',
    relatedIds: ['interplanetary', 'transfer_orbit', 'isru'] },

  { id: 'isru', keywords: ['原位资源利用', 'ISRU', 'in-situ', '就地取材', 'MOXIE'], category: '工程', subcategory: '资源',
    title: '原位资源利用(ISRU)',
    content: '利用目的地天体的本地资源减少地球补给需求。月球：水冰(极地)→饮用水/O₂/H₂燃料、He-3(核聚变)、钛铁矿(FeTiO₃→Fe+O₂+TiO₂)、月壤(3D打印建筑材料)。火星：CO₂→O₂(MOXIE 2021年Perseverance成功，10gO₂/小时)、水冰→H₂+O₂、大气CO₂→CH₄+O₂(Sabatier反应)、铁氧化物→Fe+O₂。小行星：水(→燃料站)、铂族金属、镍。ISRU使长期驻留和深空任务经济可行(减少发射质量10-100倍)。',
    relatedIds: ['moon', 'mars', 'asteroid_belt', 'space_propulsion'] },

  { id: 'space_habitat', keywords: ['空间站', 'habitat', '太空居住', '生命保障', 'ECLSS'], category: '工程', subcategory: '居住',
    title: '太空居住与生命保障',
    content: "长期太空居住的关键系统。生命保障(ECLSS)：空气(O₂→CO₂→O₂循环，ISS水回收率93%)、水(尿液/汗液/湿气回收)、食物(目前全补给，未来需要太空农业)、辐射防护(水墙/月壤覆盖/GCR需>5m屏蔽)。ISS(1998至今)：6人常驻，轨道408km。月球基地概念：月壤3D打印+充气模块+地下熔岩管。火星基地：就地取材+温室+加压漫游车。旋转空间站(人工重力，O'Neill圆柱)：解决微重力骨质疏松。",
    relatedIds: ['isru', 'moon', 'mars', 'radiation_belt'] },

  { id: 'rtg', keywords: ['RTG', '放射性同位素热电发生器', '核电池', '钚238', '太空电源'], category: '工程', subcategory: '电源',
    title: '太空电源系统',
    content: '太阳电池：1AU~1,400W/m²，木星仅50W/m²(需RTG)。RTG(放射性同位素热电发生器)：²³⁸Pu衰变(半衰期87.7年)→热→电(效率6-7%)，Voyager(470W/台，47年后仍运行)、Curiosity/Perseverance(~110W)、New Horizons(245W)。核裂变电源：Kilopower(1-10kWe，⁹⁵U，2018年地面演示)。太阳能：近地/月球/火星可行(效率30-35%)，木星以远需核能。未来：聚变电源(远期)。',
    relatedIds: ['nuclear_fission', 'voyager', 'curiosity', 'jupiter'] },

  // ===================== 探测任务 =====================
  { id: 'apollo', keywords: ['阿波罗', 'Apollo', '登月', '人类登月', '阿姆斯特朗'], category: '探测', subcategory: '历史任务',
    title: '阿波罗计划',
    content: 'NASA 1961-1972年载人登月计划。6次成功登月(Apollo 11/12/14/15/16/17)，12人踏上月球。Apollo 11(1969.7.20)：Armstrong/Aldrin首次登月。共带回382kg月壤和岩石样本(最老~44亿年)。发现：月球无全球磁场、月海玄武岩(富铁/钛)、高地斜长岩(富铝)、KREEP岩(富K/REE/P)、月球内部仍有微弱月震。Apollo 17(1972)是最近一次载人登月。Artemis计划目标2025+重返月球。',
    relatedIds: ['moon', 'artemis', 'human_spaceflight'] },

  { id: 'voyager', keywords: ['旅行者', 'Voyager', '旅行者1号', '旅行者2号', '星际空间', '金唱片'], category: '探测', subcategory: '历史任务',
    title: '旅行者号任务',
    content: 'NASA 1977年发射的双探测器，利用百年一遇的行星大排列进行"大旅行"。Voyager 2：唯一飞掠4颗外行星(木星1979/土星1981/天王星1986/海王星1989)。Voyager 1：飞掠木星/土星后转向，2012年越过日球层顶(121AU)成为首个星际空间人造物。发现：Io火山(首次地外火山)、Europa冰面裂缝、土星环精细结构、天王星/海王星磁场倾斜、Great Dark Spot。携带金唱片(55种语言问候+音乐+地球图像)，4万年后接近另一恒星。',
    relatedIds: ['jupiter', 'saturn', 'uranus', 'neptune', 'solar_system_boundary'] },

  { id: 'cassini', keywords: ['卡西尼', 'Cassini', '惠更斯', '土星探测', 'Huygens'], category: '探测', subcategory: '历史任务',
    title: '卡西尼-惠更斯号',
    content: 'NASA/ESA/ASI联合土星轨道探测器(1997-2017)。2004年入轨，执行294圈土星轨道。惠更斯探测器2005年着陆土卫六(首次外太阳系着陆)。重大发现：Enceladus南极喷射水冰(含有机分子+NaCl+SiO₂)→地下海洋；Titan甲烷湖泊和河流；土星环年龄推测<2亿年(比恐龙年轻)；土星风暴"北六边形"；Hyperion海绵状表面；2017年9月15日坠入土星大气(终结任务，保护Enceladus宜居环境)。',
    relatedIds: ['saturn', 'titan', 'enceladus', 'saturn_rings'] },

  { id: 'curiosity', keywords: ['好奇号', 'Curiosity', 'MSL', '火星车', 'Gale陨石坑'], category: '探测', subcategory: '当前任务',
    title: '好奇号火星车',
    content: 'NASA火星科学实验室(MSL)，2012年着陆Gale陨石坑。重899kg(最大火星车)，核电源(RTG)。发现：古代可居住环境确认(黏土矿物+水痕迹)、有机分子(噻吩/苯/甲苯等)、甲烷季节性波动(来源未知)、火星辐射环境(表面~0.67mSv/天)；Mount Sharp层状沉积记录火星从湿润到干燥的气候演变。已行驶>30km，拍摄>100万张照片，钻探>35个样本。2023年仍在运行。',
    relatedIds: ['mars', 'perseverance', 'rtg', 'isru'] },

  { id: 'perseverance', keywords: ['毅力号', 'Perseverance', '火星2020', 'Jezero', 'MOXIE', 'Ingenuity'], category: '探测', subcategory: '当前任务',
    title: '毅力号火星车',
    content: 'NASA火星2020任务，2021年着陆Jezero陨石坑(古河流三角洲)。核心任务：天体生物学(寻找古代微生物化石痕迹)、样本缓存(30+管岩芯待回收)、MOXIE(ISRU演示，CO₂→O₂，成功10+次)、Ingenuity直升机(首架外星飞行器，72次飞行后退役)。发现：三角洲沉积物含有机分子和潜在生物标志物；火山岩和沉积岩交替层。火星样本返回(MSR)计划将取回缓存样本(2030s)。',
    relatedIds: ['mars', 'curiosity', 'isru', 'sample_return'] },

  { id: 'jwst', keywords: ['JWST', '韦伯', '詹姆斯韦伯', '韦伯望远镜', '红外望远镜'], category: '探测', subcategory: '当前任务',
    title: '詹姆斯韦伯太空望远镜',
    content: 'NASA/ESA/CSA联合红外太空望远镜，2021年发射，位于L2点(150万km)。6.5m镀金铍镜(18片折叠)，遮阳板网球场大小(降温至-233°C)。仪器：NIRCam(0.6-5μm成像)、NIRSpec(多目标光谱)、MIRI(5-28μm)、NIRISS/NIRSpec(光谱)。发现：z>13的早期星系(挑战星系形成模型)、系外行星大气光谱(CO₂/H₂O/CH₄/DMS)、太阳系天体高分辨率红外图像、原行星盘结构(HL Tau)、超新星细节。百倍于哈勃红外观测能力。',
    relatedIds: ['lagrange_point', 'first_stars', 'exoplanet_atmosphere', 'spectroscopy'] },

  { id: 'new_horizons', keywords: ['新视野号', 'New Horizons', '冥王星', '柯伊伯带', '飞掠'], category: '探测', subcategory: '历史任务',
    title: '新视野号',
    content: 'NASA 2006年发射的冥王星飞掠探测器。2015年7月14日最近冥王星(12,500km)，首次近距离观测。发现：心形氮冰平原Sputnik Planitia(活跃地质)、甲烷冰山脉(3,500m高)、薄雾层(~100km)、蓝色天空、N₂/CH₄/CO大气。2019年飞掠Arrokoth(2014 MU69，36×20km接触双星，原始柯伊伯带天体)。当前：仍在传输数据，测量太阳风和柯伊伯带尘埃。速度~14km/s(最快离开太阳系的航天器之一)。',
    relatedIds: ['pluto', 'kuiper_belt', 'rtg'] },

  { id: 'artemis', keywords: ['Artemis', '阿尔忒弥斯', '重返月球', '月球门户', 'Gateway'], category: '探测', subcategory: '未来任务',
    title: '阿尔忒弥斯计划',
    content: 'NASA重返月球计划，目标2025+载人登月。Artemis I(2022)：SLS+猎户座无人绕月飞行成功。Artemis II(2025)：载人绕月。Artemis III：载人登月(月球南极，含女性和有色人种宇航员)。月球门户(Gateway)：L2/NRHO轨道空间站(动力/居住/HALO模块，国际合作)。Starship HLS：SpaceX登月器。目标：建立月球南极基地(水冰+持续光照)、验证深空居住技术、为火星任务铺路。',
    relatedIds: ['moon', 'apollo', 'lagrange_point', 'isru'] },

  // ===================== 星际与前沿 =====================
  { id: 'exoplanet', keywords: ['系外行星', 'exoplanet', '外行星', '热木星', '超级地球', '宜居行星'], category: '前沿', subcategory: '系外行星',
    title: '系外行星',
    content: '太阳系外围绕其他恒星运行的行星。1992年首次确认(脉冲星行星)，1995年首颗主序星行星(51 Peg b，热木星)。5,700+颗已确认(2024)。探测方法：凌日法(74%，开普勒/TESS)、视向速度(20%)、直接成像(1%)、微透镜(2%)。分类：热木星(0.01-0.1AU)、超级地球(1-10M⊕)、迷你海王星(10-20M⊕)、类地行星。TRAPPIST-1系统7颗类地行星(3颗在宜居带)。JWST正在分析系外行星大气(CO₂/H₂O/CH₄/DMS)。',
    relatedIds: ['habitable_zone', 'spectroscopy', 'doppler_effect', 'jwst'] },

  { id: 'extraterrestrial_life', keywords: ['地外生命', 'extraterrestrial', '外星生命', '生物标志', '生命探测'], category: '前沿', subcategory: '天体生物学',
    title: '地外生命探索',
    content: '搜索太阳系内外的生命证据。太阳系候选：火星(古代微生物痕迹，Perseverance搜寻中)、Europa(冰下海洋，Clipper 2024)、Enceladus(喷射有机物，生命概率高)、Titan(前生命化学实验室)。生物标志物：O₂+CH₄(化学不平衡)、植被红边、DMS(二甲基硫，2023年K2-18b候选信号争议中)。费米悖论：如果生命常见，为什么没有观测到文明？大过滤器假说。Drake方程：N=R*×fp×ne×fl×fi×fc×L(各参数不确定性极大)。',
    relatedIds: ['europa', 'enceladus', 'titan', 'mars', 'habitable_zone', 'exoplanet'] },

  { id: 'greenhouse_effect', keywords: ['温室效应', 'greenhouse effect', '温室气体', '全球变暖', '气候'], category: '物理', subcategory: '大气',
    title: '温室效应',
    content: '大气中某些气体吸收红外辐射使表面升温。机制：太阳辐射(可见光)穿透大气→地表吸收→红外再辐射→温室气体(CO₂/H₂O/CH₄/N₂O)吸收→向下再辐射→表面升温。金星(96.5%CO₂)→462°C(失控温室)。地球(+33°C温室，从-18°C升至15°C)。火星(稀薄大气)→+5°C温室。地球当前危机：CO₂从280→425ppm，全球升温1.2°C(IPCC 2023)。2°C阈值是国际目标。失控温室的临界条件仍在研究中(地球轨道可能在10亿年后进入)。',
    relatedIds: ['venus', 'earth', 'mars', 'co2', 'atmosphere'] },

  { id: 'atmosphere', keywords: ['大气', 'atmosphere', '大气层', '大气结构', '大气逃逸'], category: '物理', subcategory: '大气',
    title: '行星大气',
    content: '行星周围被引力束缚的气体层。逃逸速度决定大气保留能力：v_esc=√(2GM/R)，热逃逸(v_thermal>v_esc)→大气流失。地球大气分层：对流层(0-12km，天气)、平流层(12-50km，臭氧)、中间层(50-85km)、热层(85-600km)、外逸层(>600km)。太阳系大气：Venus(92atm,CO₂)、Earth(1atm,N₂/O₂)、Mars(0.006atm,CO₂)、Jupiter/Saturn(H₂/He,无固体表面)、Uranus/Neptune(H₂/He/CH₄)、Titan(1.5atm,N₂/CH₄)。大气逃逸机制：热逃逸、溅射(太阳风)、光化学逃逸、极风。',
    relatedIds: ['greenhouse_effect', 'solar_wind', 'magnetosphere', 'earth', 'venus'] },

  { id: 'saturn_rings', keywords: ['土星环', 'saturn rings', '环系', '行星环', '环结构'], category: '天体', subcategory: '结构',
    title: '行星环系统',
    content: '太阳系4颗巨行星都有环，土星环最壮观。土星环：宽28万km，厚10-100m，由冰粒(0.1mm-10m)和岩石碎片组成，总质量~3×10¹⁹kg。结构：D→C→B(最亮)→Cassini缝→A→Encke缝→F(细窄)→G→E(最宽)。牧羊犬卫星维持环缘锐利。环年龄争议：卡西尼数据暗示<2亿年(比恐龙年轻)，但也有1-10亿年估计。起源：卫星碎裂或彗星碎裂。木星环(薄暗，尘为主)、天王星环(窄暗13条)、海王星环(5条窄环+弥漫弧)。',
    relatedIds: ['saturn', 'enceladus'] },

  { id: 'tidal_locking', keywords: ['潮汐锁定', 'tidal locking', '同步自转', '一面朝向', '潮汐减速'], category: '物理', subcategory: '引力',
    title: '潮汐锁定',
    content: '天体自转周期与公转周期相同(始终以同一面朝向伴星)。机制：潮汐隆起→扭矩→自转减慢→锁定。太阳系锁定：月球(27.3天)、Charon-冥王星(相互锁定)、所有大卫星与母星锁定、水星3:2共振(自转58天/公转88天)。近距系外行星几乎必然锁定(一侧永昼/一侧永夜)。潮汐锁定不等于无自转(只是自转=公转)。潮汐加热需要偏心率(锁定后偏心率趋于0→加热减弱)。',
    relatedIds: ['moon', 'charon', 'gravity', 'tidal_heating'] },

  { id: 'x_ray_binary', keywords: ['X射线双星', 'X-ray binary', '吸积盘', '致密天体', '吸积'], category: '恒星', subcategory: '致密天体',
    title: 'X射线双星',
    content: '含致密天体(中子星/黑洞)的双星系统，伴星物质被吸积释放X射线。分类：低质量X射线双星(LMXB，伴星<1M☉，热辐射主导)、高质量X射线双星(HMXB，伴星>10M☉，风吸积)。Cygnus X-1(首个黑洞候选，1964)。吸积盘：物质螺旋落入→释放引力能(效率10%→远超核聚变0.7%)→加热至10⁷K→X射线。中子星吸积柱(磁场引导)→脉冲X射线。准周期振荡(QPO)是研究强引力场的重要工具。',
    relatedIds: ['neutron_star', 'black_hole', 'binary_star', 'accretion_disk'] },

  { id: 'accretion_disk', keywords: ['吸积盘', 'accretion disk', '原行星盘', '盘结构'], category: '物理', subcategory: '流体',
    title: '吸积盘',
    content: '物质围绕中心天体旋转形成的盘状结构。角动量守恒→物质不能直接落入→形成盘→粘滞传递角动量→物质缓慢螺旋落入。类型：原行星盘(恒星形成，如HL Tau，JWST拍摄)、AGN吸积盘(SMBH，类星体能源)、X射线双星盘(中子星/黑洞)。吸积效率：BH自转0→6%，极端Kerr→42%(远超核聚变)。原行星盘→行星形成(尘埃凝聚→微行星→原行星)。磁旋转不稳定性(MRI)是角动量传递的关键机制。',
    relatedIds: ['star_formation', 'agn', 'protoplanetary_disk', 'x_ray_binary'] },

  { id: 'protoplanetary_disk', keywords: ['原行星盘', 'protoplanetary disk', '行星形成', '行星盘', '尘埃盘'], category: '前沿', subcategory: '行星形成',
    title: '原行星盘与行星形成',
    content: '恒星形成时周围残留的气体+尘埃盘，是行星形成场所。阶段：①尘埃凝聚(μm→cm→m→km，静电/碰撞粘结)；②微行星(1-100km，引力聚集)；③原行星(1000km，差异化吸积)；④气体巨行星(核心吸积10M⊕→吸积气体，或引力不稳定)。ALMA观测：HL Tau的环和间隙(行星正在清理轨道)、TW Hya的螺旋结构。JWST发现大量年轻盘(1-5Myr)中的水/CO₂/CO冰线。时标：类地行星~10-100Myr、木星~3Myr(需在气体消散前完成)。',
    relatedIds: ['star_formation', 'accretion_disk', 'jwst', 'solar_system_structure'] },

  { id: 'sample_return', keywords: ['采样返回', 'sample return', '样本返回', '月壤', '陨石'], category: '探测', subcategory: '方法',
    title: '天体采样返回',
    content: '将天体样本带回地球实验室分析。月球：Apollo 382kg+嫦娥5号1.73kg(2020)+嫦娥6号1.93kg(2024，首次月背采样)。小行星：Hayabusa(25143 Itokawa,1,500粒,2010)、Hayabusa2(162173 Ryugu,5.4g,2020)、OSIRIS-REx(101955 Bennu,121.6g,2023)。彗星：Stardust(81P/Wild 2,尘粒,2006)。火星：MSR(火星样本返回，2030s，取回Perseverance缓存30+管)。月球/小行星采样揭示：太阳系早期物质、有机分子、同位素指纹(比远程分析精度高1000倍)。',
    relatedIds: ['apollo', 'perseverance', 'asteroid_belt', 'comet'] },

  { id: 'interstellar_medium', keywords: ['星际介质', 'local bubble', '本地泡', '星际空间', 'Lyman-alpha森林'], category: '宇宙学', subcategory: '环境',
    title: '星际介质与本地环境',
    content: '太阳系周围的星际空间。本地泡(Local Bubble)：~300光年直径的低密度热等离子体腔(由过去超新星清扫)，温度~10⁶K，密度~0.05/cm³(远低于平均0.1-1/cm³)。太阳正在穿过本地星际云(LIC，温度~7,000K，密度~0.3/cm³)。Lyman-α森林：高红移类星体光谱中的大量氢吸收线，示踪宇宙重子物质分布。银河系SF密度~1M☉/yr(低活动星系)。',
    relatedIds: ['solar_system_boundary', 'supernova', 'big_bang'] },

  { id: 'neo', keywords: ['近地天体', 'NEO', '近地小行星', '撞击风险', 'DART', '行星防御'], category: '探测', subcategory: '防御',
    title: '近地天体防御',
    content: '监测和防御近地天体撞击。已知NEO ~34,000颗(2024)，1,200+直径>1km。主要威胁：Apophis(2029年近至31,000km，3.2×10⁻⁶概率)、Bennu(2182年1/1,750概率)。防御策略：①动能撞击(DART 2022年成功偏转Dimorphos，改变周期32分钟→首次行星防御验证)；②引力拖拽(航天器悬停，年偏移~0.1mm/s)；③核爆偏转(最后手段，偏转力最强但争议大)；④激光烧蚀(持续照射蒸发表面产生推力)。预警系统：Pan-STARRS、Catalina、NEOWISE、Vera Rubin Observatory。',
    relatedIds: ['impact_crater', 'mass_extinction', 'asteroid_classification'] },

  { id: 'geyser', keywords: ['间歇泉', 'geyser', '喷射', '冰火山喷射', '喷流'], category: '地质', subcategory: '冰地质',
    title: '地外间歇泉',
    content: '天体表面由内部压力驱动的物质喷射。Enceladus：4条虎纹裂缝喷射水冰/蒸气(400m/s，含NaCl/有机/SiO₂纳米颗粒)，功率~15.8GW，供给土星E环。Triton：氮气间歇泉(喷到8km高，暗沉积物呈羽状)。Io：火山喷射(硫/二氧化硫，高达500km)。Europa：水蒸气羽流(2012年Hubble发现，2018年Galileo数据回溯确认)。间歇泉是地下海洋/活动的直接证据，也是采样的理想目标(穿过喷射物即可，无需着陆钻探)。',
    relatedIds: ['enceladus', 'triton', 'io', 'europa'] },

  { id: 'electron_degeneracy', keywords: ['电子简并', 'degenerate', '简并压', '费米', '泡利不相容'], category: '物理', subcategory: '量子',
    title: '简并压',
    content: '量子力学效应产生的压力(非热压力)。电子简并压：泡利不相容原理→两个电子不能占据同一量子态→密度增大→费米动量增大→压力增大。白矮星由电子简并压支撑(≤1.44M☉钱德拉塞卡极限)。中子简并压：中子星由中子简并压支撑(≤~2.2M☉TOV极限)。简并态特性：压强与温度无关(P∝ρ^(5/3)非相对论，P∝ρ^(4/3)相对论)。简并物质热容极低(>99%热能存在于非简并离子中)。',
    relatedIds: ['white_dwarf', 'neutron_star', 'quantum_mechanics', 'chandrasekhar'] },

  { id: 'chandrasekhar', keywords: ['钱德拉塞卡极限', 'Chandrasekhar', '1.44', '白矮星极限', '质量极限'], category: '物理', subcategory: '量子',
    title: '钱德拉塞卡极限',
    content: '白矮星的最大质量1.44M☉(1931年钱德拉塞卡计算，1983年诺贝尔奖)。物理：相对论性电子简并压P∝ρ^(4/3)不足以平衡引力→无论密度多大引力都赢→坍缩。超过此质量：电子捕获→中子化→中子星或Ia超新星(取决于是否有伴星供积)。对应的中子星极限(TOV极限)约2.0-2.2M☉(更不确定，因为核物质状态方程未知)。观测确认最重白矮星WD 1654+160(1.31M☉)和最重中子星PSR J0740+6620(2.08±0.07M☉)。',
    relatedIds: ['white_dwarf', 'neutron_star', 'electron_degeneracy', 'supernova_ia'] },

  { id: 'geothermal', keywords: ['地热', 'geothermal', '地热梯度', '内部热量', '潮汐能'], category: '地质', subcategory: '能量',
    title: '天体内部热源',
    content: '天体内部能量来源。原始热：吸积能量(引力势能转化)和短寿命放射性核素(²⁶Al, t₁/₂=0.72Myr)在形成时加热。长期热源：长寿命放射性衰变(²³⁸U/²³⁵U/²³²Th/⁴⁰K)，地球热流0.087W/m²(47TW总功率)。潮汐加热：Io(2.5W/m²)、Enceladus(0.25W/m²)、Europa(维持海洋)。分化热：重元素下沉释放引力势能(铁灾变，早期地球温度升至2,000K)。冷却速率∝表面积/体积(小天体冷却快)。',
    relatedIds: ['tidal_heating', 'earth', 'io', 'enceladus'] },

  { id: 'human_spaceflight', keywords: ['载人航天', 'human spaceflight', '宇航员', '空间站', '载人登月'], category: '工程', subcategory: '载人',
    title: '载人航天',
    content: '人类进入太空的历史与现状。里程碑：Gagarin(1961首次太空)、Armstrong(1969首次登月)、中国杨利伟(2003)、SpaceX Crew Dragon(2020商业载人)。当前载人能力：ISS(6人)、天宫空间站(3人)。挑战：辐射(GCR+SEP，火星往返~1-2Sv)、微重力(骨质疏松1-2%/月、肌肉萎缩、视觉损伤)、心理(隔离+延迟通信)、生命保障(闭环ECLSS)。深空载人：Artemis(月球)、火星(2030s+)。SpaceX Starship可复用重型火箭是关键使能技术。',
    relatedIds: ['apollo', 'artemis', 'space_habitat', 'radiation_belt'] },

  // ===================== 高频问答 =====================
  { id: 'rocket_work', keywords: ['火箭怎么飞', '火箭原理', '火箭为什么能飞', '牛顿第三定律', '火箭推进', '反作用力'], category: '推进', subcategory: '基础问答',
    title: '火箭是怎么飞上天的？',
    content: '火箭基于牛顿第三定律(作用力与反作用力)：向后高速喷射燃气→获得向前的推力。不需要"推"空气——在真空中效率更高(没有大气阻力)。关键公式：齐奥尔科夫斯基方程 Δv=ve·ln(m₀/mf)，ve是喷气速度，m₀/mf是初始/最终质量比。这就是为什么火箭要分级(扔掉空壳减轻质量)和多级推进。目前最强火箭：SpaceX星舰(总推力~7,400吨，全流量分级燃烧循环)。化学推进的极限是液氢液氧(比冲450s)，更远的路需要电推进(离子发动机，比冲3000s但推力极小)或核热推进。',
    relatedIds: ['chemical_propulsion', 'ion_drive', 'nuclear_propulsion'] },

  { id: 'space_station', keywords: ['空间站', 'ISS', '天宫', '空间站干什么', '空间站用途', '国际空间站'], category: '当前任务', subcategory: '基础问答',
    title: '空间站是用来做什么的？',
    content: '空间站是微重力实验室和太空居住平台，主要功能：①科学实验(微重力下材料/流体/生物行为，无法在地面模拟) ②技术验证(生命保障、再生水、3D打印、太空农业) ③对地观测(随时拍摄地球，监测灾害/气候) ④天文观测(AMS-02宇宙射线探测器) ⑤人体研究(骨质疏松/肌肉萎缩/辐射/心理，为深空飞行积累数据) ⑥国际合作(ISS有15国参与)。ISS自2000年起持续有人驻留，寿命预计至2030年。中国天宫空间站(2022建成)可容纳6人(常态3人)，开展千余项实验。',
    relatedIds: ['human_spaceflight', 'space_habitat', 'artemis'] },

  { id: 'space_junk', keywords: ['太空垃圾', '太空碎片', '轨道碎片', '凯斯勒效应', '太空垃圾清理', '碎片数量'], category: '防御', subcategory: '基础问答',
    title: '太空垃圾有多严重？',
    content: '地球轨道上有超过3.6万个>10cm的碎片、100万个1-10cm碎片、1.3亿个<1cm碎片。最危险的：①Fengyun-1C反卫星试验(2007，制造3,500+碎片) ②Cosmos 2251与Iridium 33碰撞(2009，2,300+碎片) ③俄反卫星试验(2021，1,500+碎片)。凯斯勒效应：碎片密度达到临界值后碰撞级联，轨道不可用。最危险的轨道是700-1000km(太阳同步轨道，遥感卫星密集)。清理方案：激光推移、鱼叉捕获、拖帆减速、磁力脱轨。UN guidelines要求LEO卫星25年内脱轨。',
    relatedIds: ['orbital_mechanics', 'leo', 'satellite'] },

  { id: 'why_explore_space', keywords: ['为什么探索太空', '太空探索意义', '太空价值', '航天意义', '为什么花钱', '值得吗'], category: '基础', subcategory: '基础问答',
    title: '为什么要探索太空？',
    content: '六大理由：①科学认知(地球是唯一样本点，需要对比实验——行星科学就是宇宙尺度的对比实验) ②技术溢出(阿波罗计划催生了CT、净水技术、防火材料、计算器；GPS、气象卫星、通信卫星都来自航天) ③资源潜力(小行星一颗可能含数万亿美元铂系金属；月壤氦-3是清洁聚变燃料) ④文明存续(恐龙没有太空计划——单一星球文明灭绝概率100%) ⑤经济规模(全球航天产业2023年约5700亿美元，增速9%) ⑥精神价值("我们选择登月不是因为它容易，而是因为它困难"——肯尼迪)。更深层：探索是人类的本质，停止探索就是停止成长。',
    relatedIds: ['asteroid_mining', 'human_spaceflight', 'planetary_defense'] },

  { id: 'how_astronauts_live', keywords: ['宇航员怎么生活', '太空生活', '太空吃饭', '太空睡觉', '太空洗澡', '太空上厕所'], category: '居住', subcategory: '基础问答',
    title: '宇航员在太空怎么生活？',
    content: '太空生活细节：①吃：脱水食物加水恢复， Tortilla代替面包(不产生碎屑)，辣椒酱最受欢迎(微重力下味觉迟钝) ②睡：睡袋固定在墙上，没有"上下"感，手臂会自然飘起(肌肉放松) ③洗：湿毛巾擦身，免洗洗发水，空气流把水滴吸走 ④厕所：气流代替重力(最复杂的太空设备之一)，尿液回收为饮用水(ISS上93%水循环率) ⑤运动：每天2小时(跑步机+阻力机+自行车，用弹力绳固定) ⑥头发：剃的碎须会被吸走 ⑦哭泣：眼泪不会落下，会糊在眼上形成水球。最难适应的是：没有自然的"上下"感觉和私人空间的缺乏。',
    relatedIds: ['human_spaceflight', 'space_habitat', 'eclss'] },

  { id: 'asteroid_mining', keywords: ['小行星采矿', '太空采矿', '小行星资源', '太空资源', '矿物采掘'], category: '资源', subcategory: '基础问答',
    title: '小行星采矿可行吗？',
    content: '理论上可行且利润巨大。M-type小行星如16 Psyche估计含10万亿美元的铁镍和铂系金属。三种类型：①C-type(碳质，含水+有机物，可提取推进剂) ②S-type(硅酸盐，含镍铁) ③M-type(金属，铂系金属)。技术方案：锚定+钻探+熔炼 OR 俘获拖回。OSIRIS-REx已证明可以接触采样(2023年带回121.6g贝努小行星样品)。Psyche任务(2023发射)将首次访问金属小行星。主要挑战：Δv成本、自主无人操作、精炼技术、法律框架(外层空间条约规定不得据为己有)。时间线：2030s可能实现水冰提取(做燃料)，2040s金属采矿。',
    relatedIds: ['asteroids', 'isru', 'chemical_propulsion'] },

  { id: ' terraforming', keywords: ['地球化', '改造火星', '火星地球化', 'terraforming', '改造行星', '火星改造'], category: '居住', subcategory: '基础问答',
    title: '能把火星改造成第二个地球吗？',
    content: '理论可能但极其困难。需要解决：①升温(火星平均-60°C)——方案：轨道镜反射阳光、温室气体工厂、极地冰帽下的干冰升华 ②增厚大气(目前6mbar，需达1000mbar)——方案：释放极地CO₂干冰(NASA估计仅有mbar级) ③制造氧气(需数万年蓝藻) ④防辐射(无磁场，需人工磁场或地下居住) ⑤液态水(升温后极地冰帽可能释放)。最大障碍：火星质量太小(逃逸速度5km/s)，大气会被太阳风剥离(没有磁场保护)——即使造出来也留不住。Chris McKay估计最小地球化需10万年。更现实的方案：局部居住地(穹顶城市+地下洞穴)而非全球改造。',
    relatedIds: ['mars', 'atmosphere', 'magnetic_field', 'life_support'] },

  { id: 'fusion_energy', keywords: ['核聚变', '聚变能', '人造太阳', 'ITER', '托卡马克', '聚变发电'], category: '能量', subcategory: '基础问答',
    title: '核聚变什么时候能发电？',
    content: '核聚变是太阳的能源方式，目标是地球上实现可控聚变发电。两种路线：①磁约束(托卡马克/仿星器)：ITER(国际热核实验堆，法国，360亿欧元)预计2025年第一等离子体，2035年Q>10(输出10倍于输入)；中国EAST 2023年实现403秒长脉冲 ②惯性约束(激光)：NIF(美国)2022年12月首次实现Q>1(2.05MJ激光→3.15MJ聚变输出)。燃料：氘(海水中大量) + 氚(锂-6增殖) → 氦 + 17.6MeV中子。挑战：第一壁材料(14MeV中子辐照)、氚自持增殖、等离子体破裂控制、经济性。乐观估计2050s商业示范堆，但"永远还有30年"是聚变界的经典笑话。',
    relatedIds: ['nuclear_fusion', 'sun', 'energy', 'plasma'] },

  { id: 'search_et', keywords: ['寻找外星生命', 'SETI', '外星人', '费米悖论', '为什么没发现外星人', '大过滤器'], category: '天体生物学', subcategory: '基础问答',
    title: '为什么还没发现外星生命？',
    content: '费米悖论：宇宙那么大那么老，外星文明应该到处都是——但我们在哪都没找到。可能的解释：①大过滤器假说(从简单到星际文明有极难跨越的障碍，也许在生命起源、多细胞化、或核战争自毁) ②稀有地球假说(地球条件极其罕见：大月亮稳定自转、木星挡小行星、板块构造、磁场) ③黑暗森林(文明都在隐藏，暴露的被消灭——刘慈欣三体) ④模拟假说(我们是唯一的"玩家角色") ⑤时间窗口(文明存在时间相对宇宙年龄极短，重叠概率极小) ⑥我们太原始(外星文明用中微子/引力波通信，我们听不懂)。德雷克方程估算银河系通讯文明约0.01-1,000,000个——不确定性跨越8个数量级。',
    relatedIds: ['extraterrestrial_life', 'drake_equation', 'fermi_paradox', 'habitable_zone'] },
  { id: 'ucs_coordinate', keywords: ['全宇宙坐标系', 'UCS', '宇宙中心', '宇宙坐标', 'CMB坐标', '宇宙参考系', '宇宙绝对坐标'], category: '轨道力学', subcategory: '坐标系',
    title: '全宇宙坐标系(UCS) — SkyGIS独创',
    content: '全宇宙坐标系(Universal Coordinate System, UCS)以宇宙微波背景辐射(CMB)偶极子零点为原点——这是宇宙的"绝对静止"参考系，CMB在此点没有偶极各向异性。以地球为定位参考点确定坐标轴方向，单位为百万秒差距(Mpc)。地球在UCS中的坐标约为(-0.0080, 8.1797, 0.0089) Mpc。太阳位于(-0.0080, 8.1797, 0.0089) Mpc。银河系中心位于(0.0, 0.0, 0.02) Mpc。UCS与8大坐标系均有7参数(3平移+3旋转+1缩放)变换公式。例如：UCS→日心坐标转换中，平移向量为(8.1789, 0.0057, 0.0174) Mpc，旋转角为ε=23.4393°(黄赤交角)+l☉=63.87°(太阳银经)+b☉=0.0013°(太阳银纬)。这一坐标系使得全宇宙天体可以统一在一个参考框架下定位。',
    relatedIds: ['orbital_mechanics', 'gravitational_constant'] },
  { id: 'coord_transform_params', keywords: ['坐标转换参数', '坐标系转换', '七参数', '坐标变换', '坐标系互转', 'Helmert', 'Bursa-Wolf'], category: '轨道力学', subcategory: '坐标系',
    title: '9大坐标系统一转换参数',
    content: 'SkyGIS采用7参数Bursa-Wolf模型实现9大坐标系之间的统一转换。7参数为：3个平移分量(Tx,Ty,Tz)、3个旋转分量(Rx,Ry,Rz)、1个缩放因子(S)。转换公式：[X2,Y2,Z2]ᵀ = (1+S)·R·[X1,Y1,Z1]ᵀ + [Tx,Ty,Tz]ᵀ。UCS与其他8种坐标系的转换参数已全部标定，包括：UCS↔日心(平移8.1789Mpc+ε=23.4393°旋转)、UCS↔银心(平移0.008Mpc+银极倾角62.87°)、UCS↔赤道(平移8.1789Mpc+ε=23.4393°+本初子午线旋转)、UCS↔黄道(平移8.1789Mpc)、UCS↔银道(平移8.1797Mpc+银极方向旋转)、UCS↔地平(含观测者位置+地球自转)、UCS↔超星系(平移47.4Mpc+超星系面倾角)。任意两个坐标系之间可通过UCS中转实现间接转换。',
    relatedIds: ['ucs_coordinate', 'orbital_mechanics'] },
];
