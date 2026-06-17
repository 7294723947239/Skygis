/**
 * 宇宙全知识数据库 — 恒星与星系知识条目
 * 涵盖：恒星物理/HR图/主序/巨星/白矮星/中子星/黑洞 + 星系类型/活动星系/星系团
 */

import type { KnowledgeEntry } from './universe-knowledge-database';

export const stellarGalacticEntries: KnowledgeEntry[] = [
  // ===================== 恒星物理 =====================
  { id: 'stellar_evolution', keywords: ['恒星演化', 'stellar evolution', '恒星生命', '恒星死亡', '恒星诞生'], category: '恒星', subcategory: '演化',
    title: '恒星演化',
    content: '恒星从分子云中诞生到死亡的全过程。低质量(<0.5M☉)：原恒星→主序(数百亿年)→白矮星(直接，不经巨星阶段)。中质量(0.5-8M☉)：主序→红巨星(RGB)→氦闪→水平分支→渐近巨星支(AGB)→行星状星云→白矮星。大质量(>8M☉)：主序→超巨星→超新星(II型)→中子星/黑洞。极大质量(>25M☉)：可能直接坍缩为黑洞(无超新星)。太阳当前46亿年，约50亿年后变红巨星，最终成白矮星。演化速度∝M⁻²·⁵(质量越大寿命越短)。',
    relatedIds: ['hr_diagram', 'main_sequence', 'red_giant', 'white_dwarf', 'supernova', 'neutron_star', 'black_hole'] },

  { id: 'hr_diagram', keywords: ['HR图', '赫罗图', 'Hertzsprung-Russell', '色光图', '恒星分类图'], category: '恒星', subcategory: '分类',
    title: '赫罗图(HR图)',
    content: '恒星绝对星等(或光度)vs光谱型(或温度)的散点图，1911-1913年由Hertzsprung和Russell独立提出。主要区域：主序带(左上→右下对角线，90%恒星，核心H燃烧)、巨星支(右上，壳层H燃烧)、超巨星(最上方，大质量)、白矮星(左下，电子简并)。演化轨迹：原恒星(主序右侧)→ZAMS(零龄主序)→主序→巨星→终态。HR图是理解恒星演化的核心工具，类似生命周期图。星团HR图可确定年龄(主序转折点)。',
    relatedIds: ['stellar_evolution', 'main_sequence', 'spectral_type', 'white_dwarf'] },

  { id: 'main_sequence', keywords: ['主序', '主序星', 'main sequence', '氢燃烧', 'ZAMS'], category: '恒星', subcategory: '分类',
    title: '主序星',
    content: '核心氢聚变为氦的稳定恒星，占恒星90%。主序关系：L∝M^3.5、R∝M^0.8、寿命∝M^(-2.5)。太阳(M☉,G2V)在主序上。O型(>16M☉,>30,000K，寿命<10Myr)→B→A→F→G(太阳)→K→M(<0.5M☉,<3,700K，寿命>100Gyr)。红矮星(M型)完全对流，寿命极长，可能不存在红巨星阶段。蓝离散星(碰撞/合并，位于主序上方)是例外。主序拟合是测距方法之一。',
    relatedIds: ['hr_diagram', 'stellar_evolution', 'spectral_type', 'nuclear_fusion'] },

  { id: 'spectral_type', keywords: ['光谱型', 'spectral type', 'OBAFGKM', '哈佛分类', '光谱分类'], category: '恒星', subcategory: '分类',
    title: '恒星光谱分类',
    content: '哈佛分类O-B-A-F-G-K-M(温度递减)。O(>30,000K,HeII线，蓝色)、B(10,000-30,000K,HeI线，蓝白)、A(7,500-10,000K,H线强，白)、F(6,000-7,500K,CaII线，黄白)、G(5,200-6,000K,金属线强，黄，太阳)、K(3,700-5,200K,分子带始现，橙)、M(<3,700K,TiO分子带，红)。扩展：L(1,300-3,700K，棕矮星)、T(500-1,300K，甲烷)、Y(<500K，最冷亚星体)。每个型分0-9子型(如G2)。光度分类：I(超巨星)→II→III(巨星)→IV→V(主序)→VI(亚矮星)。太阳=G2V。',
    relatedIds: ['hr_diagram', 'main_sequence', 'spectroscopy'] },

  { id: 'red_giant', keywords: ['红巨星', 'red giant', 'RGB', 'AGB', '氦闪', '巨星'], category: '恒星', subcategory: '演化晚期',
    title: '红巨星与AGB星',
    content: '中低质量恒星核心H耗尽后的演化阶段。红巨星支(RGB)：壳层H燃烧，核心收缩加热，外包层膨胀冷却(半径可达100R☉，温度3,000-5,000K，光度10³L☉)。氦闪：核心温度达10⁸K时He点燃(简并态热失控，几秒释放10¹¹L☉，被包层吸收)。水平分支(HB)：核心稳定He燃烧(3α过程→¹²C)。渐近巨星支(AGB)：核心He耗尽，双壳层燃烧(热脉冲，每10⁴-10⁵年一次)。AGB星产生s-过程元素(慢中子捕获)，通过星风和行星状星云返回星际介质。',
    relatedIds: ['stellar_evolution', 'nuclear_fusion', 'planetary_nebula', 'white_dwarf'] },

  { id: 'white_dwarf', keywords: ['白矮星', 'white dwarf', '电子简并', '钱德拉塞卡', '简并压'], category: '恒星', subcategory: '演化晚期',
    title: '白矮星',
    content: '中低质量恒星(<8M☉)的终态，由电子简并压支撑。典型质量0.6M☉，半径~地球(6,000km)，密度~10⁹kg/m³(1茶匙≈5吨)。钱德拉塞卡极限1.44M☉(超过则电子简并压无法支撑→坍缩为Ia超新星/中子星)。冷却时间极长(>100亿年趋近黑矮星，宇宙年龄不够尚未产生)。天狼星B是最著名的白矮星(1.0M☉,0.008R☉)。Ia超新星(白矮星从伴星吸积超限)是标准烛光(发现暗能量)。',
    relatedIds: ['stellar_evolution', 'electron_degeneracy', 'chandrasekhar', 'supernova_ia'] },

  { id: 'supernova', keywords: ['超新星', 'supernova', '恒星爆炸', '超新星爆发', 'SN'], category: '恒星', subcategory: '演化晚期',
    title: '超新星',
    content: '恒星壮烈死亡时的爆发，瞬间亮度可达10⁹L☉(超过整个星系)。分类：Ia型(白矮星吸积超钱德拉塞卡极限→碳引爆，无H线，标准烛光)；II型(>8M☉恒星核心坍缩→反弹激波，有H线)。核心坍缩超新星：铁核→光致蜕变→坍缩→中子简并反弹→激波→爆发。残留：中子星(脉冲星)或黑洞。产物：r-过程重元素(金/铂/铀)、⁵⁶Ni→⁵⁶Co→⁵⁶Fe(光变曲线能源)。1054年超新星→蟹状星云。SN 1987A(大麦哲伦云)是现代最近超新星。',
    relatedIds: ['stellar_evolution', 'neutron_star', 'black_hole', 'r_process', 'nuclear_fission'] },

  { id: 'supernova_ia', keywords: ['Ia超新星', 'Ia型超新星', '标准烛光', '白矮星爆炸', '暗能量发现'], category: '恒星', subcategory: '演化晚期',
    title: 'Ia型超新星',
    content: '白矮星在双星系统中从伴星吸积物质，超过钱德拉塞卡极限(1.44M☉)时碳引爆，整个星体被炸毁(无残骸)。因起始条件相同(1.44M☉)，峰值光度基本一致(绝对星等约-19.3)，是"标准烛光"。1998年利用Ia超新星发现宇宙加速膨胀(暗能量)。光变曲线：⁵⁶Ni→⁵⁶Co→⁵⁶Fe衰变供能(半衰期77天)。Phillips关系：光变曲线宽度修正后精度达0.15等。产物：0.6M☉的⁵⁶Fe(铁峰元素主要来源)。',
    relatedIds: ['white_dwarf', 'dark_energy', 'supernova', 'chandrasekhar'] },

  { id: 'neutron_star', keywords: ['中子星', 'neutron star', '脉冲星', 'pulsar', '磁星', '毫秒脉冲星'], category: '恒星', subcategory: '致密天体',
    title: '中子星',
    content: '核心坍缩超新星残骸，由中子简并压支撑。典型质量1.4-2.1M☉，半径10-15km，密度~10¹⁷kg/m³(一茶匙≈10亿吨)。表面引力2×10¹¹m/s²，逃逸速度0.3-0.5c。脉冲星(旋转中子星+磁轴倾斜)：周期1.4ms-8.5s，最慢PSR J0250+5854(23.5s)。磁星(磁场10¹⁴-10¹⁵G)产生SGR(软伽马重复暴)和AFXD(反常X射线脉冲星)。GW170817双中子星合并确认r-过程元素来源。TOV极限~2.2M☉(超过→黑洞)。',
    relatedIds: ['supernova', 'black_hole', 'gravitational_waves', 'r_process'] },

  { id: 'black_hole', keywords: ['黑洞', 'black hole', '事件视界', '施瓦西', '奇点', '霍金辐射'], category: '恒星', subcategory: '致密天体',
    title: '黑洞',
    content: '时空区域中引力强到光无法逃逸。施瓦西半径Rs=2GM/c²(太阳3km，地球9mm)。分类：恒星级(3-100M☉，X射线双星)、中等(10²-10⁴M☉，证据不足)、超大质量(10⁶-10¹⁰M☉，星系中心)。银河系中心Sgr A*(4.3×10⁶M☉)。2019年EHT拍摄M87*黑洞照片(阴影直径42μas)。霍金辐射(T=ℏc³/8πGM，太阳黑洞仅60nK)导致黑洞缓慢蒸发(10⁶⁷年)。信息悖论(落入信息去哪了)仍无定论。',
    relatedIds: ['general_relativity', 'neutron_star', 'supernova', 'gravitational_waves', 'sgr_a'] },

  { id: 'first_stars', keywords: ['第一代恒星', 'Population III', '初代星', '宇宙黎明', '无金属星'], category: '恒星', subcategory: '演化',
    title: '第一代恒星(Population III)',
    content: '大爆炸后约2亿年形成的第一批恒星，由纯H/He组成(无金属，因为之前没有恒星产生重元素)。推测质量很大(10-1000M☉，因无金属冷却，云需更大质量坍缩)。寿命极短(~3Myr)，以超新星或直接坍缩黑洞结束。对早期再电离贡献巨大。JWST已发现z>13的候选(如JADES-GS-z14-0, z=14.3)。这些超新星可能是r-过程和早期黑洞种子的来源。',
    relatedIds: ['big_bang', 'reionization', 'stellar_evolution', 'nucleosynthesis', 'jwst'] },

  { id: 'binary_star', keywords: ['双星', 'binary star', '联星', '食双星', '双星系统'], category: '恒星', subcategory: '分类',
    title: '双星与多星系统',
    content: '两颗或多颗恒星因引力束缚共同运动。约50%恒星在双星/多星系统中。分类：目视双星(可分辨)、分光双星(谱线位移)、食双星(亮度周期变化，如Algol)。密近双星：洛希瓣溢出→物质转移→Ia超新星/新星/X射线双星/毫秒脉冲星回收。天狼星(A1V+DA白矮星)、北极星(造父变数+伴星)是著名双星。三体问题无一般解析解(混沌)。三星系统：α Centauri(三合星，含比邻星)。',
    relatedIds: ['supernova_ia', 'white_dwarf', 'neutron_star', 'x_ray_binary'] },

  { id: 'variable_star', keywords: ['变星', 'variable star', '造父变星', '标准烛光', '周期光度'], category: '恒星', subcategory: '分类',
    title: '变星',
    content: '亮度随时间变化的恒星。脉动变星：造父变星(周期-光度关系，标准烛光，发现宇宙膨胀)、天琴RR型(球状星团距离)、米拉变星(长周期，AGB星)。爆发变星：新星(白矮星表面热核爆炸，光度增10³-10⁶倍)、超新星。食变星：几何原因(双星遮挡)。磁变星：耀星(M型，UV Ceti)。造父变星的周光关系(Leavitt定律)是哈勃发现宇宙膨胀的基础：P∝L^(1/1.5)。',
    relatedIds: ['stellar_evolution', 'red_giant', 'white_dwarf', 'cosmic_expansion'] },

  // ===================== 星系 =====================
  { id: 'galaxy', keywords: ['星系', 'galaxy', '银河', '星系分类', '螺旋星系', '椭圆星系'], category: '星系', subcategory: '分类',
    title: '星系分类',
    content: '哈勃音叉分类：椭圆星系E0-E7(圆→扁，无旋臂，老恒星为主，10⁹-10¹³M☉)、螺旋星系Sa-Sd(旋臂从紧到松，有/无棒SBa-SBd)、透镜星系S0(过渡型)。银河系=SBbc(棒旋)。矮星系(dE/dIrr)数量最多但质量小。不规则星系(如大小麦哲伦云)。星系质量10⁷-10¹³M☉，大小1-100kpc。Illuminated类型学更精细(6大类+细节)。星系形态受环境(合并/潮汐)和内在(角动量/反馈)共同影响。',
    relatedIds: ['milky_way', 'galaxy_cluster', 'dark_matter', 'galaxy_evolution'] },

  { id: 'milky_way', keywords: ['银河系', 'milky way', '银河', '棒旋星系', '本星系群'], category: '星系', subcategory: '银河系',
    title: '银河系',
    content: '我们的星系，棒旋星系(SBbc)。结构：核球(中央棒，长~3kpc)、盘(直径~30kpc，厚~0.3kpc，含旋臂)、晕(球状星团+暗物质)。4条主旋臂(英仙/盾牌-半人马/矩尺/人马)。太阳位于猎户臂(距银心8.2kpc，盘面以上20pc)。质量~1.5×10¹²M☉(90%暗物质)。恒星数~2-4×10¹¹。银心Sgr A*(4.3×10⁶M☉黑洞)。公转周期2.25亿年(银河年)。本星系群第三大(仙女座最大)。',
    relatedIds: ['galaxy', 'sgr_a', 'dark_matter', 'andromeda', 'local_group'] },

  { id: 'andromeda', keywords: ['仙女座星系', 'M31', 'andromeda', '仙女座', '螺旋星系'], category: '星系', subcategory: '近邻',
    title: '仙女座星系(M31)',
    content: '本星系群最大星系，螺旋星系(SA(s)b)。距银河2.54Mly(778kpc)，直径~220kpc，质量~1.5×10¹²M☉。恒星数~1×10¹²。蓝移(接近银河系，110km/s)，预计45亿年后与银河系合并(形成"银河仙女座"椭圆星系)。含~460个球状星团。M32和M110是伴星系(矮椭圆)。核心可能有双核(偏心盘)。肉眼最远天体(3.4等)。',
    relatedIds: ['milky_way', 'galaxy', 'local_group', 'galaxy_merger'] },

  { id: 'local_group', keywords: ['本星系群', 'local group', '星系群', '银河系邻居'], category: '星系', subcategory: '近邻',
    title: '本星系群',
    content: '银河系所在的星系群，含80+个星系，直径~3Mpc。三大星系：仙女座M31(最大)、银河系(第二)、三角座M33(第三，螺旋)。其余为矮星系：大/小麦哲伦云(银河系伴)、NGC 205/M32/M110(仙女座伴)、Sagittarius矮椭球(正在被银河系吞并)。总质量~2×10¹²M☉。本星系群是室女座超星系团的一部分，正向室女座星系团方向运动(600km/s)。',
    relatedIds: ['milky_way', 'andromeda', 'galaxy_cluster', 'virgo_cluster'] },

  { id: 'agn', keywords: ['活动星系核', 'AGN', 'active galactic nucleus', '类星体', 'quasar'], category: '星系', subcategory: '活动星系',
    title: '活动星系核(AGN)',
    content: '星系中心超大质量黑洞吸积物质释放巨大能量。统一模型：吸积盘+尘埃环+双极喷流，观测表现取决于视角。分类：类星体(最亮，z可达7.5，光度达10¹⁴L☉)、赛弗特星系(低光度AGN，I/II型)、射电星系(双瓣喷流)、耀变体(blazar，喷流指向我们)。吸积效率~10%(远超核聚变0.7%)。3C 273(首个类星体，1963)。AGN反馈(喷流+辐射加热气体)调控星系恒星形成，解释M-σ关系。',
    relatedIds: ['black_hole', 'supermassive_black_hole', 'galaxy_evolution'] },

  { id: 'supermassive_black_hole', keywords: ['超大质量黑洞', 'SMBH', '超大黑洞', '星系中心', 'M-σ关系'], category: '星系', subcategory: '活动星系',
    title: '超大质量黑洞(SMBH)',
    content: '位于几乎所有大星系中心的10⁶-10¹⁰M☉黑洞。银河系Sgr A*(4.3×10⁶M☉)、M87*(6.5×10⁹M☉)、TON 618(6.6×10¹⁰M☉，已知最大)。M-σ关系：SMBH质量∝星系核球速度弥散⁴(5，表明SMBH与星系共同演化)。形成方式：①种子黑洞(Pop III星坍缩~100M☉或直接坍缩~10⁴-10⁶M☉)→吸积增长；②合并增长。EHT 2019年拍摄M87*、2022年拍摄Sgr A*。爱因斯坦预言的阴影被确认。',
    relatedIds: ['black_hole', 'agn', 'sgr_a', 'galaxy_evolution'] },

  { id: 'galaxy_cluster', keywords: ['星系团', 'galaxy cluster', '星系群', 'ICM', '星系团介质'], category: '星系', subcategory: '大尺度',
    title: '星系团',
    content: '数百至数千个星系组成的引力束缚系统。星系间充满高温(10⁷-10⁸K)X射线发射气体(ICM，占总重子质量~15%)和暗物质(~85%)。ICM中金属(Fe等)来自星系风和AGN反馈。子弹星团(1E 0657-56)是暗物质存在的强证据(弱透镜显示暗物质与重子气体分离)。星系团是宇宙最大引力束缚结构(10¹⁴-10¹⁵M☉)。后发座星系团、英仙座星系团是著名例子。SZ效应(CMB光子被ICM逆康普顿散射)是探测星系团的重要手段。',
    relatedIds: ['dark_matter', 'large_scale_structure', 'galaxy', 'gravitational_lensing'] },

  { id: 'galaxy_evolution', keywords: ['星系演化', 'galaxy evolution', '星系形成', '星系合并', 'downsizing'], category: '星系', subcategory: '演化',
    title: '星系演化',
    content: '星系从高红移到今天的演化过程。等级式合并：小结构→大结构(暗物质晕先合并→重子物质后跟)。椭圆星系主要来自盘星系合并(气体耗尽→停止恒星形成→"红色和死亡")。Downsizing：大质量星系恒星形成更早完成，小质量星系持续形成恒星至今。恒星形成率密度在z≈2(约100亿年前)达峰值("宇宙正午")，此后持续下降。JWST正在发现z>10的早期盘星系(挑战合并驱动演化模型)。AGN反馈和超新星风是"淬灭"恒星形成的关键机制。',
    relatedIds: ['galaxy', 'agn', 'dark_matter', 'jwst'] },

  { id: 'galaxy_merger', keywords: ['星系合并', 'galaxy merger', '触须星系', '星暴', '潮汐尾'], category: '星系', subcategory: '演化',
    title: '星系合并',
    content: '两个星系因引力相互靠近并最终融合。阶段：接近→首次交会→分离→再接近→合并→弛豫。触发星暴(气体压缩→恒星形成率暴增10-100倍)。触须星系(NGC 4038/4039)是经典合并中期案例。合并驱动形态转化：螺旋+螺旋→椭圆(气体耗尽/潮汐破坏盘结构)。银河系-仙女座45亿年后合并(地球可能不受影响，星系间恒星间距极大)。超亮红外星系(ULIRG)多为合并星暴。合并率随红移增加∝(1+z)³。',
    relatedIds: ['galaxy_evolution', 'andromeda', 'galaxy'] },

  { id: 'sgr_a', keywords: ['Sgr A*', '人马座A星', '银心黑洞', '银河系中心黑洞'], category: '星系', subcategory: '银河系',
    title: '人马座A*(Sgr A*)',
    content: '银河系中心超大质量黑洞。质量4.3×10⁶M☉(由恒星轨道精确测量，Ghez/Genzel 2020诺贝尔奖)。距地球26,670光年(8.2kpc)。2022年EHT拍摄照片(阴影直径51.8μas，与广义相对论预言一致)。周围有G2云(2014接近，未如预期被吸积)。X射线耀发(日喷发1次，持续1小时)。吸积率极低(仅~10⁻⁸M☉/yr，"饥饿黑洞")。附近的S星群(轨道周期15.8年)是精确测量黑洞质量的关键。',
    relatedIds: ['black_hole', 'milky_way', 'supermassive_black_hole'] },

  // ===================== 星云与星际介质 =====================
  { id: 'nebula', keywords: ['星云', 'nebula', '发射星云', '反射星云', '行星状星云', '暗星云'], category: '星系', subcategory: '星际介质',
    title: '星云',
    content: '星际空间中的气体和尘埃云。分类：①发射星云(HII区，紫外电离发光，如猎户座星云M42，恒星摇篮)；②反射星云(反射附近恒星蓝光)；③暗星云(吸收背景光，如马头星云B33)；④行星状星云(低质量恒星死亡抛壳，如环状星云M57)；⑤超新星遗迹(如蟹状星云M1)。猎户座星云是最近的大型恒星形成区(1,344光年)，含200+种星际分子。分子云(冷，10-20K)是恒星形成场所。',
    relatedIds: ['stellar_evolution', 'planetary_nebula', 'supernova', 'interstellar_medium', 'star_formation'] },

  { id: 'interstellar_medium', keywords: ['星际介质', 'ISM', 'interstellar medium', '星际物质', '星际尘埃'], category: '星系', subcategory: '星际介质',
    title: '星际介质(ISM)',
    content: '恒星之间的物质(气体+尘埃)。银河系ISM平均密度~1个原子/cm³(极稀薄)，但分子云密度可达10⁴-10⁶/cm³。相态：热电离相(10⁶K)、温中性相(8,000K)、冷中性相(100K)、分子相(10-20K)。尘埃占质量1%，但吸收30-90%星光(消光)。ISM循环：恒星形成←分子云坍缩→恒星→星风+超新星→加热/搅拌ISM→冷却→再坍缩。银盘中ISM总质量~5×10⁹M☉(银河系的5%)。',
    relatedIds: ['nebula', 'star_formation', 'cosmic_dust'] },

  { id: 'star_formation', keywords: ['恒星形成', 'star formation', '原恒星', '分子云坍缩', 'Jeans质量'], category: '星系', subcategory: '星际介质',
    title: '恒星形成',
    content: '分子云在引力作用下坍缩形成恒星。Jeans判据：云质量>M_J∝T^(3/2)/ρ^(1/2)(超过即坍缩)。过程：分子云→致密核→原恒星(吸积盘+双极喷流)→T Tauri星(前主序)→主序星。Hubble时间~3×10⁷年(银河系恒星形成特征时间)。Salpeter IMF：dN/dM∝M^(-2.35)(低质量恒星远多于大质量)。猎户座星云是最近恒星形成区(1,344ly)。原行星盘(如HL Tau)是行星形成场所。JWST正在发现最早期恒星形成过程。',
    relatedIds: ['nebula', 'stellar_evolution', 'interstellar_medium', 'protoplanetary_disk'] },

  { id: 'planetary_nebula', keywords: ['行星状星云', 'planetary nebula', 'PN', '环状星云', '恒星死亡'], category: '星系', subcategory: '星际介质',
    title: '行星状星云',
    content: '低中质量恒星(0.8-8M☉)AGB阶段后期抛出的气体壳层，被中心白矮星紫外辐射激发发光。典型直径~1光年，膨胀速度20-30km/s，寿命~10,000年(短暂)。著名例子：环状星云M57、猫眼星云NGC 6543、螺旋星云NGC 7293。形状多样性(环/双极/沙漏/不规则)由双星交互和磁场塑造。返回星际介质：He/C/N/O/s-过程元素。是银河系化学增丰的重要贡献者。',
    relatedIds: ['red_giant', 'white_dwarf', 'stellar_evolution'] },

  { id: 'cosmic_dust', keywords: ['宇宙尘埃', 'cosmic dust', '星际尘埃', 'PAH', '多环芳烃'], category: '星系', subcategory: '星际介质',
    title: '宇宙尘埃',
    content: '星际空间中0.01-1μm的固态微粒。成分：硅酸盐(橄榄石/辉石，9.7/18μm特征)、碳质(石墨/PAH，3.3/6.2/7.7/8.6/11.3μm特征)、冰(水/CO/CO₂/CH₃OH，3-5μm)。消光律：A_V/N_H≈5.3×10⁻²²mag/cm²，R_V=A_V/E(B-V)≈3.1(银河系平均)。尘埃形成：AGB星风(主要)、超新星、星际介质冷凝。PAH(多环芳烃)是宇宙碳循环关键分子，占总碳10-20%。尘埃是行星形成的种子。',
    relatedIds: ['interstellar_medium', 'nebula', 'protoplanetary_disk'] },

  // ===================== 高频问答 =====================
  { id: 'star_lifecycle', keywords: ['恒星一生', '恒星怎么死', '恒星寿命', '恒星会死吗', '恒星终结', '恒星结局'], category: '演化', subcategory: '基础问答',
    title: '恒星的一生是怎样的？',
    content: '恒星从分子云中诞生，经历以下阶段：①分子云坍缩(触发：超新星冲击波/星系臂压缩) → ②原恒星(吸积盘+双极喷流，约10⁵-10⁷年) → ③主序星(氢→氦核聚变，最稳定阶段，占寿命90%) → ④后主序(取决于质量)：太阳质量→红巨星→行星状星云+白矮星；2-8倍太阳→AGB星→行星状星云+白矮星；8-25倍→红超巨星→超新星+中子星；>25倍→红/蓝超巨星→超新星+黑洞。关键转折点：质量决定一切。太阳主序寿命约100亿年(已过46亿)，大质量恒星可能仅数百万年。白矮星最终冷却成黑矮星(宇宙年龄不够，目前还不存在黑矮星)。',
    relatedIds: ['stellar_evolution', 'white_dwarf', 'supernova', 'neutron_star'] },

  { id: 'milky_way', keywords: ['银河系', 'galaxy', '银河', '我们星系', '银河系大小', '银河系结构', '银心'], category: '银河系', subcategory: '基础问答',
    title: '银河系长什么样？',
    content: '银河系是棒旋星系(SBbc型)，直径约10-18万光年，厚约2,000光年(盘面)。结构：①核球(中央隆起，含超大质量黑洞Sgr A*，400万太阳质量) ②棒(两端连接旋臂，长轴约2.7万光年) ③4条主旋臂(英仙臂、矩尺臂、南十字臂、人马臂) ④太阳位于猎户臂(较小分支)，距银心约2.6万光年 ⑤银晕(球状星团+暗物质，延伸至30万光年)。恒星数约1,000-4,000亿颗，总质量约1.5万亿太阳质量(含暗物质)。银河系正以110km/s朝仙女座星系运动，约45亿年后合并。太阳绕银心一周约2.25亿年(银河年)。',
    relatedIds: ['sag_a_star', 'galaxy_classification', 'andromeda'] },

  { id: 'supernova_types', keywords: ['超新星', 'supernova', '星爆', '恒星爆炸', '超新星类型', 'Ia超新星', '核心坍缩'], category: '演化晚期', subcategory: '基础问答',
    title: '超新星有哪些类型？',
    content: '两大类：①I型(无氢线)→Ia(双星系统中白矮星吸积到钱德拉塞卡极限1.44M☉后碳爆燃，标准烛光，发现宇宙加速膨胀)→Ib(无氢有氦，大质量星脱去氢包层)→Ic(无氢无氦，脱去更多包层，可能产生长伽马暴)。②II型(有氢线)→核心坍缩型(铁核>1.44M☉→中子简并压无法支撑→反弹激波→爆炸)→II-P(平台光变曲线)→II-L(线性下降)→IIn(窄发射线，与CSM相互作用)。Ia是热核爆炸，其他都是核心坍缩。超新星是宇宙重元素的主要来源——你我身体中的铁、钙、金都来自超新星遗迹。',
    relatedIds: ['stellar_evolution', 'neutron_star', 'black_holes', 'nucleosynthesis'] },

  { id: 'nebula_types', keywords: ['星云', 'nebula', '星际云', '发射星云', '反射星云', '行星状星云', '暗星云'], category: '星际介质', subcategory: '基础问答',
    title: '星云有哪些类型？',
    content: '星云是宇宙中最美的天体之一：①发射星云(氢被附近热星UV电离→Hα红光656.3nm，如猎户座大星云M42) ②反射星云(尘埃散射附近恒星蓝光，如昴星团周围的蓝色云) ③暗星云(密集尘埃挡住背景光，如马头星云B33) ④行星状星云(低质量恒星晚期抛出外层，UV照亮，如环状星云M57) ⑤超新星遗迹(爆炸抛射物与ISM相互作用，如蟹状星云M1) ⑥原行星云(AGB星到行星状星云的过渡，双极结构)。星云是恒星的摇篮和墓地——从尘埃中诞生，死后又把物质还给星云。',
    relatedIds: ['interstellar_medium', 'stellar_evolution', 'protoplanetary_disk'] },

  { id: 'sag_a_star', keywords: ['银心黑洞', '人马座A*', 'Sgr A*', '银河系黑洞', '中心黑洞', '超大质量黑洞'], category: '近邻', subcategory: '基础问答',
    title: '银河系中心的黑洞',
    content: '人马座A*(Sgr A*)是银河系中心的超大质量黑洞，质量约400万太阳质量，事件视界半径约1,200万km(约17个太阳半径)。2022年事件视界望远镜(EHT)首次拍摄到其"影像"(与M87*类似但小1500倍)。S2恒星绕其公转周期16年，近心点120AU，速度7,650km/s——精确验证了广义相对论。Sgr A*目前处于"安静"状态(吸积率极低)，但偶尔会"打嗝"(X射线耀斑)，可能来自小天体被潮汐瓦解。银心附近还有G2云(2014年近心点，未被瓦解)。',
    relatedIds: ['black_holes', 'milky_way', 'eht'] },

  { id: 'andromeda', keywords: ['仙女座', 'andromeda', 'M31', '仙女座星系', '最近星系', '银河系碰撞'], category: '近邻', subcategory: '基础问答',
    title: '仙女座星系——我们的"近邻"',
    content: '仙女座星系(M31/NGC 224)是距银河系最近的大型星系，约254万光年。它是本星系群中最大的星系，直径约22万光年，含约1万亿颗恒星(是银河系的2-3倍)。M31是旋涡星系(SA(s)b型)，有两个主要伴星系(M32和M110)。它正以约110km/s的速度向银河系靠近，预计约45亿年后两者合并(届时地球若仍在，夜空将非常壮观)。合并后将形成椭圆星系，暂称"Milkomeda"。M31是肉眼可见的最远天体之一(视星等3.4)。',
    relatedIds: ['milky_way', 'galaxy_classification', 'cosmic_expansion'] },

  { id: 'exoplanet_types', keywords: ['系外行星', '热木星', '超级地球', '热海王星', 'mini-Neptune', 'exoplanet分类'], category: '分类', subcategory: '基础问答',
    title: '系外行星有哪些类型？',
    content: '太阳系外的行星种类远超太阳系内的分类：①热木星(极近轨道，<0.1AU，如51 Peg b，温度>1000K) ②超级地球(1-10M⊕，可能是大号地球或小号海王星) ③迷你海王星(10-20M⊕，厚氢氦大气) ④水世界(全海洋覆盖，可能数百km深) ⑤熔岩世界(潮汐锁定，昼面熔岩海洋) ⑥钻石行星(碳为主，如55 Cancri e) ⑦自由浮游行星(不绕恒星，银河系可能有数千亿颗)。开普勒发现最常见的是1-4倍地球大小的行星——太阳系反而有点"异常"。',
    relatedIds: ['habitable_zone', 'kepler', 'transit_method'] },
];
