/**
 * 宇宙全知识数据库 — 物理与宇宙学知识条目
 * 涵盖：引力/电磁/核/量子物理 + 大爆炸/暗物质/暗能量/宇宙结构/宇宙演化
 */

import type { KnowledgeEntry } from './universe-knowledge-database';

export const physicsCosmologyEntries: KnowledgeEntry[] = [
  // ===================== 引力与时空 =====================
  { id: 'gravity', keywords: ['引力', 'gravity', '万有引力', '潮汐', '洛希极限', '牛顿引力', '重力'], category: '物理', subcategory: '引力',
    title: '引力',
    content: '四种基本力中最弱但作用范围无限的力。牛顿万有引力F=GMm/r²，广义相对论描述为时空弯曲(爱因斯坦场方程Gμν+Λgμν=8πGTμν)。太阳系应用：潮汐力(差引力，月球引起地球潮汐)、洛希极限(刚体2.456R，流体1.26R，天体被撕碎距离)、拉格朗日点(L1-L5两体引力平衡)、引力透镜(光线偏折)。引力波(LIGO 2015首次探测)以光速传播，振幅极弱(h~10⁻²¹)。',
    relatedIds: ['general_relativity', 'gravitational_waves', 'tidal_heating', 'lagrange_point'] },

  { id: 'general_relativity', keywords: ['广义相对论', 'general relativity', '时空弯曲', '爱因斯坦', 'GR', '等效原理'], category: '物理', subcategory: '引力',
    title: '广义相对论',
    content: '爱因斯坦1915年提出的引力理论。核心：质量/能量弯曲时空，自由落体沿测地线运动。验证：水星近日点进动(43"/世纪)、光线偏折(1919日食)、引力红移(Pound-Rebka)、Shapiro时延、引力波(LIGO 2015)、黑洞照片(EHT 2019)。预言：黑洞(施瓦西半径Rs=2GM/c²)、引力透镜(强/弱/微)、参考系拖拽(Gravity Probe B证实)、时间膨胀(GPS必须修正)。在强场(黑洞/中子星附近)与牛顿力学显著不同。',
    relatedIds: ['gravity', 'black_hole', 'gravitational_waves', 'special_relativity'] },

  { id: 'special_relativity', keywords: ['狭义相对论', 'special relativity', '光速不变', '洛伦兹', 'E=mc²', '时间膨胀'], category: '物理', subcategory: '引力',
    title: '狭义相对论',
    content: '爱因斯坦1905年提出。两个公设：①物理定律在所有惯性系相同；②真空中光速c=299,792,458m/s恒定。推论：时间膨胀(t\'=tγ)、长度收缩(L\'=L/γ)、同时性相对、质量-能量等价E=mc²(1kg物质=9×10¹⁶J≈21.5MtTNT)。γ=1/√(1-v²/c²)。高速粒子(宇宙线质子可达0.999999c)验证。μ子寿命延长是经典验证。GPS卫星必须修正狭义和广义相对论效应(合计约38μs/天)。',
    relatedIds: ['general_relativity', 'cosmic_ray', 'nuclear_fusion'] },

  { id: 'gravitational_waves', keywords: ['引力波', 'gravitational wave', 'LIGO', '时空涟漪', 'GW', '合并'], category: '物理', subcategory: '引力',
    title: '引力波',
    content: '时空度规的涟漪，以光速传播。2015年9月14日LIGO首次探测到GW150914(36+29太阳质量黑洞合并)。频率范围：nHz(脉冲星计时阵列)→mHz(LISA)→Hz-kHz(地面探测器)。源：致密双星合并(黑洞/中子星)、超新星核心坍缩、旋转中子星。GW170817(双中子星合并)首次多信使观测：引力波+伽马射线+光学，确认r-过程元素(金/铂)来源。引力波天文学开启多信使时代。',
    relatedIds: ['general_relativity', 'black_hole', 'neutron_star', 'multi_messenger'] },

  { id: 'tidal_heating', keywords: ['潮汐加热', 'tidal heating', '潮汐力', '内热', '潮汐形变'], category: '物理', subcategory: '引力',
    title: '潮汐加热',
    content: '天体因引力梯度差产生周期性形变，摩擦转化为内热。主要发生在偏心轨道卫星：Io(木星+Europa引力拉扯，热流2.5W/m²，驱动400+火山)、Enceladus(土星+Dione共振，南极热流0.25W/m²，驱动冰喷射)、Europa(潮汐加热维持地下海洋液态)。加热功率∝e²×(M_p/M_s)²×(R_s/a)⁵×n。潮汐加热是天体内部能量和地质活动的关键来源，也是地下海洋存在的保障。',
    relatedIds: ['io', 'europa', 'enceladus', 'gravity'] },

  { id: 'lagrange_point', keywords: ['拉格朗日点', 'L1', 'L2', 'L3', 'L4', 'L5', '特洛伊'], category: '物理', subcategory: '引力',
    title: '拉格朗日点',
    content: '两体系统中引力+离心力平衡的5个点。L1(日地间150万km)：SOHO/DSCOVR；L2(日地反向150万km)：JWST/Gaia/Planck；L3(太阳背面，科幻常用)；L4/L5(与两体等边三角形，稳定)：木星特洛伊群(>12,000颗小行星)、地球特洛伊(2020 TK7)。L4/L5稳定条件：主天体>25倍次天体质量。航天工程意义：L2是最热门深空观测位置(遮挡太阳/地球热辐射)。',
    relatedIds: ['gravity', 'solar_system_structure', 'jwst'] },

  // ===================== 电磁与等离子体 =====================
  { id: 'magnetic_field', keywords: ['磁场', '磁力线', 'magnetic', '磁层', '偶极场', '发电机理论'], category: '物理', subcategory: '电磁',
    title: '行星磁场',
    content: '行星磁场主要由液态金属核心的对流运动产生(发电机理论)。太阳系磁场：木星4.2G(最强)、土星0.21G、地球25-65μT、天王星0.23G(倾斜59°)、海王星0.14G(倾斜47°)、水星300nT(极弱)。火星和金星缺乏全球磁场。磁场保护大气免受太阳风剥蚀，形成磁层空腔。地球磁层日侧~10Re，夜侧磁尾延伸100+Re。磁重联释放能量(极光、地磁暴)。',
    relatedIds: ['solar_wind', 'radiation_belt', 'magnetosphere', 'dynamo'] },

  { id: 'magnetosphere', keywords: ['磁层', 'magnetosphere', '弓形激波', '磁鞘', '磁尾', '磁重联'], category: '物理', subcategory: '电磁',
    title: '磁层',
    content: '行星磁场在太阳风中形成的空腔。结构：弓形激波→磁鞘(减速加热的太阳风)→磁层顶(磁场压力=太阳风动压)→磁层。地球磁层：日侧10Re、夜侧磁尾>100Re。磁重联(日侧重联→磁暴，夜侧重联→亚暴)是能量释放机制。木星磁层是太阳系最大(日侧>100Rj)，由Io等离子体供给(1吨/秒)。土星磁层受Enceladus水蒸气影响。磁层粒子:辐射带(内)→环电流→等离子体层。',
    relatedIds: ['magnetic_field', 'solar_wind', 'radiation_belt', 'aurora'] },

  { id: 'solar_wind', keywords: ['太阳风', 'solar wind', '粒子流', '等离子体流', 'CME'], category: '物理', subcategory: '电磁',
    title: '太阳风',
    content: '日冕层持续喷射的超音速等离子体流，主要由电子和质子组成(约5%α粒子)。速度：慢太阳风400km/s，快太阳风800km/s。温度：质子4×10⁵K，电子1×10⁵K。密度：近地约5个质子/cm³。太阳风与行星磁场形成弓形激波和磁层，是极光和辐射带粒子的主要来源。日冕物质抛射(CME)时速度可达2,000km/s，可引发地磁暴(1859年卡林顿事件，极光至赤道，电报系统失效)。',
    relatedIds: ['sun', 'magnetic_field', 'magnetosphere', 'aurora', 'space_weather'] },

  { id: 'aurora', keywords: ['极光', 'aurora', '北极光', '南极光', 'aurora borealis'], category: '物理', subcategory: '电磁',
    title: '极光',
    content: '带电粒子沿磁力线进入大气，激发原子/分子发光。地球极光：O(557.7nm绿,630nm红)、N₂(427.8nm蓝紫)、N₂⁺(391.4nm紫)。典型高度100-300km。木星极光最强烈(X射线+UV+可见光，功率100TW，地球仅1-10GW)，由Io等离子体和磁场加速驱动。土星极光呈椭圆环。火星无全球磁场，极光呈弥散斑块。极光是磁层-电离层耦合的直接表现。',
    relatedIds: ['magnetosphere', 'solar_wind', 'magnetic_field'] },

  { id: 'radiation_belt', keywords: ['辐射带', '范艾伦', 'radiation belt', 'van allen', '高能粒子'], category: '物理', subcategory: '电磁',
    title: '辐射带(范艾伦带)',
    content: '被行星磁场捕获的高能带电粒子区域。地球内带(1.2-3Re)捕获高能质子(10-100MeV)，外带(3-10Re)捕获高能电子(1-10MeV)。木星辐射带太阳系最强，电子可达100MeV，对航天器电子设备造成严重威胁(Europa表面辐射剂量~5.4Sv/天)。Saturn辐射带较温和(被环和卫星吸收)。粒子来源：太阳风注入、宇宙线反照中子衰变(CRAND)、局部加速。',
    relatedIds: ['magnetic_field', 'solar_wind', 'magnetosphere'] },

  { id: 'space_weather', keywords: ['空间天气', 'space weather', '地磁暴', '太阳风暴', '卡林顿'], category: '物理', subcategory: '电磁',
    title: '空间天气',
    content: '太阳活动对日地空间环境的影响。太阳耀斑(X级最强)8分钟到达地球(电磁辐射)、CME 1-4天到达(等离子体)、太阳高能粒子(SEP)数十分钟到达。地磁暴等级：G1-G5。1859年卡林顿事件(Dst≈-1760nT)是最强记录，如今天发生可致全球电网瘫痪。1989年魁北克大停电(9小时)。预警：DSCOVR(L1)提供30分钟提前量。影响：卫星充电/单粒子翻转、GPS误差、电网感应电流、航空辐射。',
    relatedIds: ['solar_wind', 'magnetosphere', 'aurora', 'cme'] },

  { id: 'plasma', keywords: ['等离子体', 'plasma', '第四态', '电离气体', '离子体'], category: '物理', subcategory: '电磁',
    title: '等离子体',
    content: '物质的第四态(固/液/气之后)，由自由电子和离子组成，总体电中性。宇宙中99%可见物质处于等离子体态。太阳/恒星核心(10⁸K)→日冕(10⁶K)→太阳风(10⁵K)→星际介质(10⁴K)→星系团内介质(10⁷-10⁸K)。等离子体频率ωp=√(ne²/meε₀)，德拜长度λD=√(ε₀kT/ne²)。磁约束聚变(托卡马克)和惯性约束(NIF)研究等离子体。空间等离子体：磁重联、激波、湍流、波动。',
    relatedIds: ['sun', 'solar_wind', 'magnetosphere', 'nuclear_fusion'] },

  // ===================== 核物理与粒子 =====================
  { id: 'nuclear_fusion', keywords: ['核聚变', 'nuclear fusion', '质子链', 'CNO循环', 'pp链', '聚变反应'], category: '物理', subcategory: '核物理',
    title: '核聚变',
    content: '轻原子核结合为较重核释放能量的过程(质量亏损→E=Δmc²)。恒星主要反应：pp链(4¹H→⁴He+2e⁺+2ν+26.7MeV，太阳主反应)、CNO循环(催化，>1.3太阳质量恒星主导)、3α过程(3⁴He→¹²C+7.275MeV，红巨星)、碳燃烧(¹²C+¹²C→²⁰Ne/²⁴Mg，8×10⁸K)。人类聚变研究：D+T→⁴He+n+17.6MeV(最易实现)、D+³He→⁴He+p+18.4MeV(无中子)、p+¹¹B→3⁴He(终极方案)。',
    relatedIds: ['sun', 'stellar_evolution', 'hydrogen', 'helium', 'special_relativity'] },

  { id: 'nuclear_fission', keywords: ['核裂变', 'nuclear fission', '铀', '裂变反应', '链式反应'], category: '物理', subcategory: '核物理',
    title: '核裂变',
    content: '重原子核分裂为较轻核释放能量。²³⁵U+n→裂变产物+2-3n+~200MeV。自然核裂变反应堆：Oklo(加蓬，20亿年前，⁹⁵U丰度3%而非现在0.72%)。宇宙中宇宙中铀/钍等重元素由r-过程(快中子捕获)在超新星/中子星合并中产生。太空应用：RTG(放射性同位素热电发生器，²³⁸Pu，Voyager/Curiosity使用)、核脉冲推进(猎户座计划)、核热推进(NTP，比冲900s)。',
    relatedIds: ['nuclear_fusion', 'rtg', 'r_process'] },

  { id: 'cosmic_ray', keywords: ['宇宙线', 'cosmic ray', '高能粒子', '银河宇宙线', '宇宙射线'], category: '物理', subcategory: '核物理',
    title: '宇宙线',
    content: '来自太空的高能粒子流(主要为质子87%、α粒子12%、重核1%)。能量范围：10⁶-10²⁰eV(最高能量超LHC 10⁷倍)。来源：超新星遗迹(大部分银河宇宙线)、活动星系核(极高能)、太阳耀斑(SEP)。银河宇宙线通量：约1个/cm²/s。Oh-My-God粒子(1991年，3×10²⁰eV=50J，一个质子的能量等于棒球)。宇宙线与大气碰撞产生次级粒子簇射(海平面~200个/m²/s)。是地球大气碳-14的来源(碳定年法基础)。',
    relatedIds: ['supernova', 'agn', 'atmosphere'] },

  // ===================== 量子与基本粒子 =====================
  { id: 'quantum_mechanics', keywords: ['量子力学', 'quantum', '不确定性', '波函数', '薛定谔', '量子'], category: '物理', subcategory: '量子',
    title: '量子力学',
    content: '描述微观世界的基本理论。核心：波粒二象性(德布罗意λ=h/p)、不确定性原理(ΔxΔp≥ℏ/2)、薛定谔方程(iℏ∂ψ/∂t=Ĥψ)。天文应用：恒星结构(电子简并压支撑白矮星，泡利不相容原理)、光谱学(原子能级跃迁→发射/吸收线，是天体化学基础)、黑体辐射(恒星近似黑体，维恩位移定律λ_max=b/T)、量子隧穿(恒星pp链反应概率极低但通过隧穿实现，太阳才得以发光)。',
    relatedIds: ['white_dwarf', 'spectroscopy', 'stellar_evolution', 'blackbody'] },

  { id: 'fundamental_forces', keywords: ['基本力', '四种力', 'fundamental forces', '统一理论', '大统一'], category: '物理', subcategory: '量子',
    title: '四种基本力',
    content: '①强核力(作用范围10⁻¹⁵m，耦合常数1，胶子传递，束缚夸克为核子)；②电磁力(范围∞，1/137，光子传递，支配原子/分子/化学)；③弱核力(范围10⁻¹⁸m，10⁻⁵，W/Z玻色子传递，β衰变/核合成)；④引力(范围∞，10⁻³⁹，引力子假说，支配天体运动)。电弱统一(Glashow-Weinberg-Salam，10¹⁵K以上电磁力和弱力统一)。大统一理论(GUT)预期10²⁸K三种力统一。万物理论(TOE)加入引力。',
    relatedIds: ['gravity', 'nuclear_fusion', 'nuclear_fission', 'general_relativity'] },

  { id: 'antimatter', keywords: ['反物质', 'antimatter', '反粒子', '正电子', '物质不对称'], category: '物理', subcategory: '量子',
    title: '反物质',
    content: '与正物质电荷相反的粒子。正电子(e⁺,1932年发现)、反质子(p̄,1955)、反氢(1995)。正反物质湮灭释放E=2mc²(100%质能转换，核裂变仅0.1%，核聚变0.7%)。1kg反物质+1kg物质=1.8×10¹⁷J(约43MtTNT)。宇宙中物质远多于反物质(不对称性，重子数不对称参数η≈6×10⁻¹⁰)，原因仍未知(CP破坏不足以解释)。天然反物质源：宇宙线碰撞、⁴⁰K衰变、雷暴(正电子产生)。反物质推进(理论)仅需毫克级。',
    relatedIds: ['nuclear_fusion', 'fundamental_forces', 'big_bang'] },

  // ===================== 宇宙学 =====================
  { id: 'big_bang', keywords: ['大爆炸', 'big bang', '宇宙起源', '宇宙诞生', '奇点'], category: '宇宙学', subcategory: '起源',
    title: '大爆炸理论',
    content: '宇宙起源于138.2亿年前一个极高温高密度的奇点膨胀。证据：①哈勃定律(星系退行速度∝距离，1929)；②宇宙微波背景辐射(CMB，2.725K黑体，1965)；③轻元素丰度(H 75%、He 25%，与理论预言精确吻合)；④宇宙大尺度结构(从初始扰动生长)。时间线：0(奇点)→10⁻⁴³s(普朗克时间)→10⁻³⁶s(暴胀开始)→10⁻³²s(暴胀结束)→3min(核合成结束)→38万年(复合/CMB释放)→2亿年(第一代恒星)→92亿年(太阳系形成)→138亿年(现在)。',
    relatedIds: ['cmb', 'inflation', 'dark_matter', 'dark_energy', 'nucleosynthesis'] },

  { id: 'cmb', keywords: ['宇宙微波背景', 'CMB', '微波背景', 'cosmic microwave background', '2.7K'], category: '宇宙学', subcategory: '起源',
    title: '宇宙微波背景辐射(CMB)',
    content: '大爆炸后38万年(红移z=1100)宇宙冷却到3,000K，电子与质子复合为中性氢，光子脱耦形成。今日因膨胀红移至2.725K黑体谱(峰值160GHz)。COBE(1992)确认完美黑体+发现10⁻⁵各向异性→WMAP(2003)精确测量→Planck(2013)高分辨率全天图。CMB功率谱揭示：宇宙年龄13.8Gyr、平坦(Ω=1)、暗能量68.3%、暗物质26.8%、重子物质4.9%、哈勃常数67.4km/s/Mpc。CMB偏振(B模)可探测原初引力波(暴胀证据)。',
    relatedIds: ['big_bang', 'inflation', 'dark_matter', 'dark_energy'] },

  { id: 'inflation', keywords: ['暴胀', 'inflation', '宇宙暴胀', '指数膨胀', '慢滚'], category: '宇宙学', subcategory: '起源',
    title: '宇宙暴胀',
    content: '大爆炸后10⁻³⁶-10⁻³²s，宇宙经历指数膨胀(体积增大至少e⁶⁰≈10²⁶倍)。由标量场(暴胀子)驱动，势能主导产生加速膨胀。解决问题：①视界问题(为什么CMB各处温度均匀)；②平坦问题(为什么Ω≈1)；③磁单极子问题(为什么观测不到)。暴胀产生量子涨落→原初密度扰动→CMB各向异性→大尺度结构种子。预测：①宇宙近乎平坦(已确认)；②近标度不变的功率谱(已确认，n_s≈0.965)；③原初引力波(B模偏振，待确认)。',
    relatedIds: ['big_bang', 'cmb', 'gravitational_waves'] },

  { id: 'dark_matter', keywords: ['暗物质', 'dark matter', 'WIMP', '轴子', '缺失质量', '暗物质晕'], category: '宇宙学', subcategory: '暗成分',
    title: '暗物质',
    content: '占宇宙总质能26.8%，不发射/吸收/反射电磁辐射，仅通过引力效应被观测。证据：星系旋转曲线(外缘速度不降)、引力透镜(子弹星团)、CMB各向异性、大尺度结构。候选粒子：WIMP(10GeV-1TeV，直接探测未果)、轴子(μeV-meV，ADMX实验)、惰性中微子(keV)。银河系暗物质晕延伸~30万光年，质量约为可见物质10倍。暗物质密度：~0.3GeV/cm³(约0.5g/太阳系体积)。SkyGIS中通过紫色半透明粒子云可视化其分布。',
    relatedIds: ['dark_energy', 'big_bang', 'galaxy_rotation', 'gravitational_lensing'] },

  { id: 'dark_energy', keywords: ['暗能量', 'dark energy', '宇宙常数', '加速膨胀', 'Λ', '暗能量密度'], category: '宇宙学', subcategory: '暗成分',
    title: '暗能量',
    content: '占宇宙总质能68.3%，驱动宇宙加速膨胀。1998年通过Ia型超新星发现(Riess/Perlmutter/Schmidt，2011诺贝尔奖)。性质：负压强(w≈-1)、均匀分布、密度极低(~7×10⁻²⁷kg/m³)、不随膨胀稀释。最简模型：宇宙常数Λ(爱因斯坦1917年引入，后称"最大错误"，现回归)。替代模型：quintessence(动态标量场)、修改引力(f(R)理论)。暗能量不稀释意味着宇宙将走向"大冻结"：所有恒星熄灭、质子衰变、黑洞蒸发(10¹⁰⁰年后)。',
    relatedIds: ['dark_matter', 'big_bang', 'cosmic_expansion', 'universe_future'] },

  { id: 'cosmic_expansion', keywords: ['宇宙膨胀', '哈勃定律', 'Hubble', '红移', '退行', '宇宙加速'], category: '宇宙学', subcategory: '暗成分',
    title: '宇宙膨胀与哈勃定律',
    content: '哈勃1929年发现星系退行速度v=H₀×d。哈勃常数H₀≈67-74km/s/Mpc(张力问题：Planck 67.4±0.5 vs SH0ES 73.0±1.0)。红移z=(λ_obs-λ_emit)/λ_emit，z=v/c(低速)，1+z=a₀/a(t)(一般)。宇宙尺度因子a(t)：当前a=1，随时间增大。年龄-红移关系：z=1→7.9Gyr前，z=6→12.7Gyr前，z=1100→CMB。可观测宇宙半径~465亿光年(膨胀使实际距离大于光行距离)。',
    relatedIds: ['big_bang', 'dark_energy', 'cmb'] },

  { id: 'gravitational_lensing', keywords: ['引力透镜', 'gravitational lensing', '爱因斯坦环', '微透镜', '强透镜'], category: '宇宙学', subcategory: '观测',
    title: '引力透镜',
    content: '大质量天体弯曲光线(广义相对论预言)。三类：①强透镜(弧/爱因斯坦环/多重像，前景星系团，如Abell 2218)；②弱透镜(统计剪切，测量暗物质分布)；③微透镜(亮度放大，探测系外行星/暗天体)。爱因斯坦半径θ_E=√(4GM/c²×D_ls/D_lD_s)。子弹星团(1E 0657-56)通过弱透镜证明暗物质与重子物质分离(碰撞证据)。引力透镜是探测高红移宇宙和暗物质分布的核心工具。',
    relatedIds: ['general_relativity', 'dark_matter', 'galaxy_cluster'] },

  { id: 'large_scale_structure', keywords: ['大尺度结构', '宇宙网', 'cosmic web', '丝状体', '空洞', '超星系团'], category: '宇宙学', subcategory: '结构',
    title: '宇宙大尺度结构',
    content: '物质在宇宙最大尺度上的分布模式，形如"宇宙网"：丝状体(暗物质+星系)交叉处形成星系团，丝状体之间是巨大空洞。尺度层次：星系(10kpc)→星系群(1Mpc)→星系团(10Mpc)→超星系团(100Mpc)→宇宙网(Gpc)。最大结构：武仙-北冕座长城(100亿光年，挑战宇宙学原理)。斯隆数字巡天(SDSS)绘制了迄今最大3D宇宙图。结构形成：暗物质引力坍缩→重子落入→星系形成。CDM模型成功预测大尺度结构统计性质。',
    relatedIds: ['dark_matter', 'galaxy_cluster', 'cosmic_web'] },

  { id: 'cosmic_web', keywords: ['宇宙网', 'cosmic web', '纤维', 'filament', '重子声学振荡'], category: '宇宙学', subcategory: '结构',
    title: '宇宙网(Cosmic Web)',
    content: '宇宙大尺度结构的三维网络形态。由节点(星系团)、丝状体(暗物质+星系纤维)、片状结构和空洞组成。重子声学振荡(BAO)在CMB中留下声波印记(尺度~150Mpc)，作为"宇宙标准尺"测量膨胀率。宇宙网中的温-热星系际介质(WHIM，10⁵-10⁷K)可能含宇宙50%重子物质("缺失重子"问题)。模拟：IllustrisTNG、EAGLE、Millennium。2023年首次直接观测到丝状体中的冷重子气体。',
    relatedIds: ['large_scale_structure', 'dark_matter', 'galaxy_cluster'] },

  { id: 'galaxy_rotation', keywords: ['星系旋转曲线', '旋转曲线', 'flat rotation curve', '暗物质证据', '薇拉鲁宾'], category: '宇宙学', subcategory: '结构',
    title: '星系旋转曲线',
    content: '星系中恒星/气体的轨道速度随半径变化的关系。观测发现外缘速度不降(v≈常数)，而非预期的v∝1/√r(开普勒衰减)。1970年代Vera Rubin系统测量证实。这是暗物质存在的最直接证据之一：需要额外不可见质量(暗物质晕)才能解释平坦旋转曲线。典型螺旋星系暗物质占总质量85-90%。Tully-Fisher关系：螺旋星系光度∝旋转速度⁴。',
    relatedIds: ['dark_matter', 'galaxy', 'gravitational_lensing'] },

  // ===================== 宇宙演化与未来 =====================
  { id: 'nucleosynthesis', keywords: ['核合成', '大爆炸核合成', 'BBN', '原初核合成', '轻元素'], category: '宇宙学', subcategory: '演化',
    title: '大爆炸核合成',
    content: '大爆炸后1-3分钟内，温度从10¹⁰K降至10⁹K，质子和中子结合形成轻原子核。产物：¹H 75%(质子)、⁴He 25%(按质量)、²H(氘)~0.003%、³He~0.0001%、⁷Li~10⁻¹⁰(锂问题：观测值比理论少3倍)。CNO及以上元素在BBN中几乎不产生(时间太短)，后来由恒星核合成和超新星产生。氘是BBN最灵敏探针(只在BBN中大量产生，后被恒星破坏)。测量结果与理论预测惊人吻合，是大爆炸理论最强证据之一。',
    relatedIds: ['big_bang', 'nuclear_fusion', 'stellar_evolution', 'r_process'] },

  { id: 'universe_future', keywords: ['宇宙未来', '大冻结', '大撕裂', '大坍缩', '热寂', '宇宙结局'], category: '宇宙学', subcategory: '演化',
    title: '宇宙的未来',
    content: '三种主要结局取决于暗能量性质：①大冻结/热寂(最可能，w≈-1)：持续膨胀→恒星耗尽燃料(10¹⁴年)→质子衰变(10³⁶年?)→黑洞蒸发(10¹⁰⁰年)→最终仅存光子和轻子，温度趋近绝对零度；②大撕裂(w<-1)：暗能量增强→星系/恒星/原子依次被撕碎；③大坍缩(Ω>1)：膨胀减速→坍缩→大挤压(当前观测不支持)。真空衰变(假真空→真真空)是另一个潜在灾难(瞬间改变物理定律)。当前最佳拟合：永远膨胀的大冻结。',
    relatedIds: ['dark_energy', 'big_bang', 'cosmic_expansion'] },

  { id: 'multiverse', keywords: ['多元宇宙', 'multiverse', '平行宇宙', '永恒暴胀', '人择原理'], category: '宇宙学', subcategory: '前沿',
    title: '多元宇宙假说',
    content: '我们的宇宙可能只是无数宇宙之一。类型(Max Tegmark分类)：①级(同一宇宙不同因果区域，视界之外)；②级(永恒暴胀产生的泡泡宇宙，物理常数可能不同)；③级(量子多世界诠释的平行分支)；④级(数学结构不同的完全不同宇宙)。人择原理：我们存在于参数适合生命的宇宙中，但无法观测其他宇宙。暴胀理论自然产生多元宇宙(永恒暴胀)。弦论预言10⁵⁰⁰种可能的真空态(景观问题)。目前不可证伪(哲学边界)。',
    relatedIds: ['inflation', 'big_bang', 'quantum_mechanics'] },

  { id: 'reionization', keywords: ['再电离', 'reionization', '宇宙黎明', '第一代恒星', '黑暗时代'], category: '宇宙学', subcategory: '演化',
    title: '宇宙再电离',
    content: '大爆炸后~2亿年至~10亿年，第一代恒星/星系/类星体的UV辐射重新电离中性氢。之前：黑暗时代(中性氢为主，无光源)。再电离后：星际介质变为电离态(至今如此)。证据：类星体吸收谱(Gunn-Peterson效应，z>6完全吸收)、CMB偏振( Thomson散射)。JWST正在发现z>13的早期星系，改写再电离时间线。再电离是宇宙从"暗"到"明"的关键转变。',
    relatedIds: ['big_bang', 'first_stars', 'jwst', 'cmb'] },

  // ===================== 高频问答 =====================
  { id: 'gravity_basics', keywords: ['引力是什么', '重力是什么', '万有引力', '为什么有引力', 'gravity', '引力怎么产生', '为什么不会飘走'], category: '引力', subcategory: '基础问答',
    title: '引力到底是什么？',
    content: '牛顿说引力是物体间的吸引力(F=GMm/r²)。爱因斯坦说引力不是"力"——而是时空弯曲：质量告诉时空如何弯曲，弯曲的时空告诉物质如何运动。想象一个保龄球放在橡胶膜上，弹珠会沿弯曲表面滚向保龄球——这不是"吸引"，而是沿着弯曲空间的最短路径(测地线)运动。引力波的直接探测(2015年LIGO)证实了时空确实会"涟漪"。引力是四种基本力中最弱的(比电磁力弱10³⁶倍)，但因为只有吸引没有排斥，在大尺度上主导宇宙结构。',
    relatedIds: ['general_relativity', 'gravitational_waves', 'spacetime'] },

  { id: 'speed_of_light', keywords: ['光速', '为什么不能超光速', '超光速', '光速极限', '光速为什么有限', 'e=mc²'], category: '电磁', subcategory: '基础问答',
    title: '为什么不能超过光速？',
    content: '根据狭义相对论，有质量的物体速度越快，动能越大，接近光速时所需能量趋向无穷大，所以永远到不了光速。光子因为静质量为零所以以光速运动。更深层的解释：c(299,792,458m/s)不是"光的速度"，而是因果传播的速度极限——时空本身的传播上限。E=mc²意味着质量和能量等价，加速就是增加能量→增加质量→更难加速→正反馈。超光速会导致因果悖论(信息回到过去)。目前唯一"超光速"现象是宇宙膨胀(空间本身膨胀不受光速限制)。',
    relatedIds: ['special_relativity', 'em_spectrum', 'cosmic_inflation'] },

  { id: 'time_travel', keywords: ['时间旅行', '时间倒流', '穿越', '回到过去', '时间机器', '虫洞', 'time travel'], category: '引力', subcategory: '基础问答',
    title: '时间旅行可能吗？',
    content: '向前穿越：已经实现！国际空间站宇航员每半年比地面人年轻约0.01秒(狭义相对论时间膨胀)。GPS卫星每天快38微秒也必须修正。向未来穿越理论上可以——接近光速飞行1年回来，地球上可能已过数十年(双生子佯谬)。回到过去：困难得多。广义相对论允许某些时空结构(旋转黑洞、虫洞、提普勒柱体)产生闭合类时曲线，但需要"奇异物质"(负能量密度)来维持虫洞，目前未知是否存在。霍金提出"时序保护猜想"：物理定律可能禁止回到过去。量子力学的延迟选择实验也暗示时间可能比我们理解的更复杂。',
    relatedIds: ['general_relativity', 'special_relativity', 'wormhole', 'black_holes'] },

  { id: 'multiverse', keywords: ['多元宇宙', '平行宇宙', 'multiverse', '另一个宇宙', '多重宇宙', '宇宙有多少'], category: '前沿', subcategory: '基础问答',
    title: '平行宇宙真的存在吗？',
    content: '目前无直接证据，但有多个理论暗示其可能性：①永恒暴胀理论(宇宙无限膨胀，不同区域物理常数可能不同) ②量子力学的多世界诠释(每次量子测量宇宙分裂) ③弦理论的景观(10⁵⁰⁰种可能的真空态) ④数学宇宙假说(所有数学结构都"存在")。分级：Level I(同一宇宙不同区域) → Level II(泡泡宇宙) → Level III(量子多世界) → Level IV(不同数学结构)。批评者认为不可证伪，不算科学。但2023年CMB偏振数据中有人声称发现了"碰撞疤痕"——与其他泡泡宇宙碰撞的痕迹。',
    relatedIds: ['cosmic_inflation', 'quantum_mechanics', 'string_theory'] },

  { id: 'dark_matter_evidence', keywords: ['暗物质证据', '暗物质怎么发现', '暗物质存在', '星系旋转曲线', '引力透镜证据'], category: '暗成分', subcategory: '基础问答',
    title: '我们怎么知道暗物质存在？',
    content: '暗物质存在的6大证据：①星系旋转曲线(Vera Rubin发现：外围恒星速度不下降，说明有看不见的质量) ②引力透镜(光被弯曲程度远超可见物质所能产生) ③CMB功率谱(Planck卫星数据完美拟合Ωdm≈0.27) ④大尺度结构形成(没有暗物质，宇宙来不及形成今天的结构) ⑤子弹星团(碰撞中可见物质和引力中心分离) ⑥宇宙元素丰度(BBN要求重子物质只占5%)。暗物质约占宇宙27%，我们看到的普通物质仅5%，暗能量68%。就是说，我们能理解的一切只占5%。',
    relatedIds: ['dark_matter', 'dark_energy', 'cmb', 'gravitational_lensing'] },

  { id: 'black_hole_info', keywords: ['黑洞里面是什么', '黑洞内部', '进入黑洞', '黑洞里面', '落入黑洞', '黑洞信息'], category: '引力', subcategory: '基础问答',
    title: '黑洞里面是什么？',
    content: '广义相对论预测中心存在奇点(密度无穷大、体积为零)，但物理学家普遍认为这是理论失效的标志而非真实物理——需要量子引力理论才能描述。在外部观察者看来，落入黑洞的物体永远停在事件视界(时间膨胀至无穷)。对落体本身，会正常穿过视界(超大质量黑洞的潮汐力在视界处很弱，人不会被撕碎)，但在接近奇点时被拉伸(面条化)。霍金提出信息悖论：信息落入黑洞后是否真的丢失？这可能是通向量子引力的钥匙。2023年"黑洞岛"假说提出信息以量子关联形式保存在视界附近。',
    relatedIds: ['black_holes', 'general_relativity', 'hawking_radiation'] },

  { id: 'why_space_dark', keywords: ['为什么天是黑的', '夜空为什么暗', '奥尔伯斯', 'olbers', '宇宙为什么暗'], category: '宇宙学', subcategory: '基础问答',
    title: '为什么夜空是黑的？',
    content: '奥尔伯斯悖论：如果宇宙无限且均匀，视线总会落到某颗恒星上，夜空应该亮如白昼。解决这个悖论的关键：①宇宙年龄有限(138亿年)，光速有限，远处恒星的光还没到达我们 ②宇宙膨胀导致远处的光红移(波长拉长到可见光之外) ③恒星寿命有限，第一代恒星约在大爆炸后2亿年才出现。所以夜空黑暗本身就证明了宇宙有起点和演化——这是大爆炸理论的早期证据之一。',
    relatedIds: ['big_bang', 'observable_universe', 'cosmic_expansion'] },
];
