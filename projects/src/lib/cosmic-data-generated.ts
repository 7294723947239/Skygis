// 动态生成的天体数据
import type { CosmicObject } from './cosmic-catalog';

// 生成巨型恒星列表
function generateMassiveStars(): CosmicObject[] {
  const stars: CosmicObject[] = [];
  const massiveStarNames = [
    'R136a1', 'R136a2', 'R136c', 'R136b', 'Melnick 42', 'Melnick 34',
    'Eta Carinae A', 'Eta Carinae B', 'P Cygni', 'V382 Carinae',
    'S Doradus', 'V_X_Scorpii', 'WR 102ka', 'LBV 1806-20',
    'Peony Star', 'Pistol Star', 'Quasi-Star', 'M33 X-7', 'IC 10 X-1',
    'NGC 300 X-1', 'M101 ULX-1', 'Ho 2.10', 'Vela X-1', 'Centaurus X-3'
  ];
  
  for (let i = 0; i < massiveStarNames.length; i++) {
    const name = massiveStarNames[i];
    stars.push({
      id: `massive_star_${i}`,
      name: name,
      catalogId: `Wolf-Rayet/OB`,
      type: 'star',
      typeCn: '巨星/超新星前身',
      constellation: '船底座/其他',
      distance: 50 + Math.floor(Math.random() * 500),
      ra: `${Math.floor(Math.random() * 24)}h${Math.floor(Math.random() * 60)}m${Math.floor(Math.random() * 60)}s`,
      dec: `${Math.floor(Math.random() * 180) - 90}°${Math.floor(Math.random() * 60)}'${Math.floor(Math.random() * 60)}"`,
      magnitude: Math.floor(Math.random() * 15),
      size: `${Math.floor(Math.random() * 100)}倍太阳`,
      description: `Wolf-Rayet星或O/B型巨星，质量可达100倍以上太阳`,
      notableFeatures: [`质量${10 + Math.floor(Math.random() * 200)}太阳质量`, '恒星风极强'],
      materials: ['H', 'He', '重元素'],
      color: `hsl(${Math.random() * 360}, 80%, ${60 + Math.random() * 30}%)`,
      cartesianX: String(Math.floor(Math.random() * 1e17) - 5e16),
      cartesianY: String(Math.floor(Math.random() * 1e17) - 5e16),
      cartesianZ: String(Math.floor(Math.random() * 1e17) - 5e16),
      sceneX: (Math.random() - 0.5) * 200,
      sceneY: (Math.random() - 0.5) * 100,
      sceneZ: (Math.random() - 0.5) * 200
    });
  }
  return stars;
}

// 生成疏散星团和球状星团
function generateStarClusters(): CosmicObject[] {
  const clusters: CosmicObject[] = [];
  
  // 疏散星团
  for (let i = 0; i < 500; i++) {
    clusters.push({
      id: `open_cluster_${i}`,
      name: `NGC疏散星团-${1000 + i}`,
      catalogId: `NGC ${1000 + i}`,
      type: 'star_cluster',
      typeCn: '疏散星团',
      constellation: ['猎户座', '金牛座', '英仙座', '御夫座', '双子座', '船帆座'][Math.floor(Math.random() * 6)],
      distance: 100 + Math.floor(Math.random() * 5000),
      ra: `${Math.floor(Math.random() * 24)}h${Math.floor(Math.random() * 60)}m`,
      dec: `${Math.floor(Math.random() * 180) - 90}°`,
      magnitude: 5 + Math.floor(Math.random() * 10),
      size: `${Math.floor(Math.random() * 60)}'`,
      description: `疏散星团，含${100 + Math.floor(Math.random() * 1000)}颗年轻恒星`,
      notableFeatures: [`年龄${1 + Math.floor(Math.random() * 500)}百万年`, `${100 + Math.floor(Math.random() * 1000)}颗恒星`],
      materials: ['H', 'He'],
      color: `hsl(${Math.random() * 60 + 200}, 70%, ${50 + Math.random() * 30}%)`,
      cartesianX: String(Math.floor(Math.random() * 5e16) - 2.5e16),
      cartesianY: String(Math.floor(Math.random() * 5e16) - 2.5e16),
      cartesianZ: String(Math.floor(Math.random() * 5e16) - 2.5e16),
      sceneX: (Math.random() - 0.5) * 200,
      sceneY: (Math.random() - 0.5) * 100,
      sceneZ: (Math.random() - 0.5) * 200
    });
  }
  
  // 球状星团
  for (let i = 0; i < 200; i++) {
    clusters.push({
      id: `globular_cluster_${i}`,
      name: `球状星团-${i}`,
      catalogId: `NGC ${5000 + i}`,
      type: 'globular_cluster',
      typeCn: '球状星团',
      constellation: ['人马座', '蛇夫座', '天蝎座', '武仙座', '猎犬座'][Math.floor(Math.random() * 5)],
      distance: 1000 + Math.floor(Math.random() * 20000),
      ra: `${Math.floor(Math.random() * 24)}h${Math.floor(Math.random() * 60)}m`,
      dec: `${Math.floor(Math.random() * 180) - 90}°`,
      magnitude: 6 + Math.floor(Math.random() * 10),
      size: `${Math.floor(Math.random() * 30)}'`,
      description: `球状星团，含${10000 + Math.floor(Math.random() * 1000000)}颗古老恒星`,
      notableFeatures: [`年龄${10 + Math.floor(Math.random() * 12)}十亿年`, `${10000 + Math.floor(Math.random() * 1000000)}颗恒星`],
      materials: ['H', 'He', '重元素'],
      color: `hsl(${Math.random() * 60 + 20}, 60%, ${40 + Math.random() * 20}%)`,
      cartesianX: String(Math.floor(Math.random() * 5e16) - 2.5e16),
      cartesianY: String(Math.floor(Math.random() * 5e16) - 2.5e16),
      cartesianZ: String(Math.floor(Math.random() * 5e16) - 2.5e16),
      sceneX: (Math.random() - 0.5) * 200,
      sceneY: (Math.random() - 0.5) * 100,
      sceneZ: (Math.random() - 0.5) * 200
    });
  }
  
  return clusters;
}

// 生成星云
function generateNebulae(): CosmicObject[] {
  const nebulae: CosmicObject[] = [];
  
  for (let i = 0; i < 500; i++) {
    const isPlanetary = Math.random() > 0.7;
    nebulae.push({
      id: `nebula_${i}`,
      name: isPlanetary ? `行星状星云-${i}` : `发射星云-${i}`,
      catalogId: `NGC ${3000 + i}`,
      type: isPlanetary ? 'planetary_nebula' : 'nebula',
      typeCn: isPlanetary ? '行星状星云' : '发射星云',
      constellation: ['猎户座', '天鹅座', '人马座', '仙王座', '麒麟座'][Math.floor(Math.random() * 5)],
      distance: 100 + Math.floor(Math.random() * 10000),
      ra: `${Math.floor(Math.random() * 24)}h${Math.floor(Math.random() * 60)}m`,
      dec: `${Math.floor(Math.random() * 180) - 90}°`,
      magnitude: 8 + Math.floor(Math.random() * 8),
      size: `${Math.floor(Math.random() * 300)}"`,
      description: isPlanetary ? '行星状星云，恒星残骸' : '发射星云，恒星形成区',
      notableFeatures: [`直径${1 + Math.floor(Math.random() * 10)}光年`, '中心有白矮星'],
      materials: ['H', 'He', 'N', 'O'],
      color: isPlanetary 
        ? `hsl(${Math.random() * 360}, 80%, 70%)` 
        : `hsl(${Math.random() * 40 + 180}, 90%, 50%)`,
      cartesianX: String(Math.floor(Math.random() * 5e16) - 2.5e16),
      cartesianY: String(Math.floor(Math.random() * 5e16) - 2.5e16),
      cartesianZ: String(Math.floor(Math.random() * 5e16) - 2.5e16),
      sceneX: (Math.random() - 0.5) * 200,
      sceneY: (Math.random() - 0.5) * 100,
      sceneZ: (Math.random() - 0.5) * 200
    });
  }
  
  return nebulae;
}

// 生成脉冲星
function generatePulsars(): CosmicObject[] {
  const pulsars: CosmicObject[] = [];
  
  for (let i = 0; i < 300; i++) {
    pulsars.push({
      id: `pulsar_${i}`,
      name: `脉冲星-${i}`,
      catalogId: `PSR ${Math.floor(Math.random() * 9000) + 1000}+${Math.floor(Math.random() * 100)}`,
      type: 'pulsar',
      typeCn: '脉冲星',
      constellation: ['狐狸座', '天鹅座', '船帆座', '苍蝇座', '矩尺座'][Math.floor(Math.random() * 5)],
      distance: 100 + Math.floor(Math.random() * 15000),
      ra: `${Math.floor(Math.random() * 24)}h${Math.floor(Math.random() * 60)}m${Math.floor(Math.random() * 60)}s`,
      dec: `${Math.floor(Math.random() * 180) - 90}°${Math.floor(Math.random() * 60)}'${Math.floor(Math.random() * 60)}"`,
      magnitude: 15 + Math.floor(Math.random() * 10),
      size: '~20km',
      description: '高速旋转的中子星，磁极发射电磁辐射',
      notableFeatures: [`自转周期${0.001 + Math.random() * 5}秒`, '强磁场'],
      materials: ['中子简并物质'],
      color: `hsl(${180 + Math.random() * 60}, 70%, 60%)`,
      cartesianX: String(Math.floor(Math.random() * 5e16) - 2.5e16),
      cartesianY: String(Math.floor(Math.random() * 5e16) - 2.5e16),
      cartesianZ: String(Math.floor(Math.random() * 5e16) - 2.5e16),
      sceneX: (Math.random() - 0.5) * 200,
      sceneY: (Math.random() - 0.5) * 100,
      sceneZ: (Math.random() - 0.5) * 200
    });
  }
  
  return pulsars;
}

// 生成类星体
function generateQuasars(): CosmicObject[] {
  const quasars: CosmicObject[] = [];
  
  for (let i = 0; i < 500; i++) {
    quasars.push({
      id: `quasar_${i}`,
      name: `类星体-${i}`,
      catalogId: `QSO ${Math.floor(Math.random() * 900000) + 100000}`,
      type: 'quasar',
      typeCn: '类星体',
      constellation: ['牧夫座', '武仙座', '室女座', '猎犬座', '波江座'][Math.floor(Math.random() * 5)],
      distance: 100000 + Math.floor(Math.random() * 12000000),
      ra: `${Math.floor(Math.random() * 24)}h${Math.floor(Math.random() * 60)}m`,
      dec: `${Math.floor(Math.random() * 180) - 90}°`,
      magnitude: 12 + Math.floor(Math.random() * 10),
      size: '~光年(活动星系核)',
      description: '遥远宇宙中极明亮的活动星系核',
      notableFeatures: [`光度${1e12 + Math.random() * 1e14}倍太阳`, '中心超大质量黑洞'],
      materials: ['吸积盘物质', '高能粒子'],
      color: `hsl(${Math.random() * 60}, 90%, 60%)`,
      cartesianX: String(Math.floor(Math.random() * 1e23) - 5e22),
      cartesianY: String(Math.floor(Math.random() * 1e23) - 5e22),
      cartesianZ: String(Math.floor(Math.random() * 1e23) - 5e22),
      sceneX: (Math.random() - 0.5) * 200,
      sceneY: (Math.random() - 0.5) * 100,
      sceneZ: (Math.random() - 0.5) * 200
    });
  }
  
  return quasars;
}

// 生成超新星遗迹
function generateSupernovaRemnants(): CosmicObject[] {
  const remnants: CosmicObject[] = [];
  
  for (let i = 0; i < 200; i++) {
    remnants.push({
      id: `snr_${i}`,
      name: `超新星遗迹-${i}`,
      catalogId: `SNR ${Math.floor(Math.random() * 900) + 100}`,
      type: 'supernova_remnant',
      typeCn: '超新星遗迹',
      constellation: ['天鹅座', '船帆座', ' pup', '金牛座', '仙后座'][Math.floor(Math.random() * 5)],
      distance: 500 + Math.floor(Math.random() * 15000),
      ra: `${Math.floor(Math.random() * 24)}h${Math.floor(Math.random() * 60)}m`,
      dec: `${Math.floor(Math.random() * 180) - 90}°`,
      magnitude: 10 + Math.floor(Math.random() * 10),
      size: `${10 + Math.floor(Math.random() * 100)}光年`,
      description: '大质量恒星爆炸后的残骸',
      notableFeatures: [`年龄${1000 + Math.floor(Math.random() * 100000)}年`, 'X射线源'],
      materials: ['重元素', '高能粒子'],
      color: `hsl(${Math.random() * 40 + 200}, 80%, 60%)`,
      cartesianX: String(Math.floor(Math.random() * 5e16) - 2.5e16),
      cartesianY: String(Math.floor(Math.random() * 5e16) - 2.5e16),
      cartesianZ: String(Math.floor(Math.random() * 5e16) - 2.5e16),
      sceneX: (Math.random() - 0.5) * 200,
      sceneY: (Math.random() - 0.5) * 100,
      sceneZ: (Math.random() - 0.5) * 200
    });
  }
  
  return remnants;
}

// 生成暗物质云/分子云
function generateDarkNebulae(): CosmicObject[] {
  const darkNebulae: CosmicObject[] = [];
  
  for (let i = 0; i < 300; i++) {
    darkNebulae.push({
      id: `dark_nebula_${i}`,
      name: `分子云-${i}`,
      catalogId: `B ${Math.floor(Math.random() * 900) + 100}`,
      type: 'molecular_cloud',
      typeCn: '分子云',
      constellation: ['猎户座', '蛇夫座', '仙王座', '天猫座', '麒麟座'][Math.floor(Math.random() * 5)],
      distance: 100 + Math.floor(Math.random() * 5000),
      ra: `${Math.floor(Math.random() * 24)}h${Math.floor(Math.random() * 60)}m`,
      dec: `${Math.floor(Math.random() * 180) - 90}°`,
      magnitude: 99,
      size: `${5 + Math.floor(Math.random() * 100)}光年`,
      description: '低温分子气体云，恒星形成之地',
      notableFeatures: [`质量${100 + Math.floor(Math.random() * 10000)}太阳质量`, 'H2分子'],
      materials: ['H2', 'He', 'CO', '尘埃'],
      color: `hsl(${Math.random() * 20 + 200}, 30%, ${10 + Math.random() * 20}%)`,
      cartesianX: String(Math.floor(Math.random() * 5e16) - 2.5e16),
      cartesianY: String(Math.floor(Math.random() * 5e16) - 2.5e16),
      cartesianZ: String(Math.floor(Math.random() * 5e16) - 2.5e16),
      sceneX: (Math.random() - 0.5) * 200,
      sceneY: (Math.random() - 0.5) * 100,
      sceneZ: (Math.random() - 0.5) * 200
    });
  }
  
  return darkNebulae;
}

// 生成X射线源
function generateXRaySources(): CosmicObject[] {
  const sources: CosmicObject[] = [];
  
  for (let i = 0; i < 400; i++) {
    sources.push({
      id: `xray_${i}`,
      name: `X射线源-${i}`,
      catalogId: `XRS ${Math.floor(Math.random() * 9000) + 1000}`,
      type: 'xray_source',
      typeCn: 'X射线源',
      constellation: ['武仙座', '天鹅座', '猎户座', '天蝎座', '半人马座'][Math.floor(Math.random() * 5)],
      distance: 100 + Math.floor(Math.random() * 20000),
      ra: `${Math.floor(Math.random() * 24)}h${Math.floor(Math.random() * 60)}m${Math.floor(Math.random() * 60)}s`,
      dec: `${Math.floor(Math.random() * 180) - 90}°${Math.floor(Math.random() * 60)}'`,
      magnitude: 20,
      size: '点源',
      description: '高能X射线辐射源，通常为密近双星或活动星系核',
      notableFeatures: ['X射线辐射', '可能为黑洞或中子星系统'],
      materials: ['高能粒子'],
      color: `hsl(${Math.random() * 60 + 250}, 90%, 60%)`,
      cartesianX: String(Math.floor(Math.random() * 5e16) - 2.5e16),
      cartesianY: String(Math.floor(Math.random() * 5e16) - 2.5e16),
      cartesianZ: String(Math.floor(Math.random() * 5e16) - 2.5e16),
      sceneX: (Math.random() - 0.5) * 200,
      sceneY: (Math.random() - 0.5) * 100,
      sceneZ: (Math.random() - 0.5) * 200
    });
  }
  
  return sources;
}

// 导出所有生成的天体
export const GENERATED_CELESTIAL_OBJECTS: CosmicObject[] = [
  ...generateMassiveStars(),
  ...generateStarClusters(),
  ...generateNebulae(),
  ...generatePulsars(),
  ...generateQuasars(),
  ...generateSupernovaRemnants(),
  ...generateDarkNebulae(),
  ...generateXRaySources()
];
