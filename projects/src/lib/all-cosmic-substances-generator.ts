// 宇宙物质生成器 - 生成10000+种宇宙物质
export const COSMIC_CATEGORIES = [
  '元素', '同位素', '星际分子', '矿物', '量子态', '等离子体',
  '暗物质候选', '宇宙射线', '核反应产物', '有机物', '电离态',
  '简并态', '致密物质', '宇宙尘埃', '冰晶', '等离子体态'
];

// 元素周期表基础
const ELEMENT_SYMBOLS = [
  'H','He','Li','Be','B','C','N','O','F','Ne',
  'Na','Mg','Al','Si','P','S','Cl','Ar','K','Ca',
  'Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn',
  'Ga','Ge','As','Se','Br','Kr','Rb','Sr','Y','Zr',
  'Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn',
  'Sb','Te','I','Xe','Cs','Ba','La','Ce','Pr','Nd',
  'Pm','Sm','Eu','Gd','Tb','Dy','Ho','Er','Tm','Yb',
  'Lu','Hf','Ta','W','Re','Os','Ir','Pt','Au','Hg',
  'Tl','Pb','Bi','Po','At','Rn','Fr','Ra','Ac','Th',
  'Pa','U','Np','Pu','Am','Cm','Bk','Cf','Es','Fm',
  'Md','No','Lr','Rf','Db','Sg','Bh','Hs','Mt','Ds',
  'Rg','Cn','Nh','Fl','Mc','Lv','Ts','Og'
];

// 生成所有元素的同位素 (约2000种)
export function generateIsotopes(): any[] {
  const isotopes: any[] = [];
  const isotopeTypes = ['稳定同位素', '放射性同位素', '宇宙射线同位素', '核合成同位素'];
  
  for (const element of ELEMENT_SYMBOLS) {
    for (let mass = 1; mass <= 30; mass++) {
      isotopes.push({
        formula: `${element}-${mass}`,
        name: `${element}同位素${mass}`,
        category: '同位素',
        type: isotopeTypes[Math.floor(Math.random() * isotopeTypes.length)],
        abundance: Math.random() * 100,
        halfLife: Math.random() > 0.5 ? `${(Math.random() * 10000).toFixed(0)}年` : '稳定',
        energy: Math.random() * 10,
        discoveryYear: 1900 + Math.floor(Math.random() * 124)
      });
    }
  }
  return isotopes;
}

// 生成星际分子 (约3000种)
export function generateInterstellarMolecules(): any[] {
  const molecules: any[] = [];
  const prefixes = ['氢', '氧', '碳', '氮', '硫', '硅', '磷', '金属'];
  const suffixes = ['化物', '酸盐', '醛', '酮', '醇', '胺', '酰胺', '酯', '醚', '烷', '烯', '炔'];
  const radicals = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'];
  
  for (let i = 0; i < 3000; i++) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const radical = radicals[Math.floor(Math.random() * radicals.length)];
    const num = Math.floor(Math.random() * 20) + 1;
    
    molecules.push({
      formula: `星际-${i + 1}`,
      name: `${prefix}${radical}${suffix}`,
      category: '星际分子',
      type: `多原子分子`,
      abundance: Math.random() * 1000,
      molecularWeight: 10 + Math.random() * 500,
      discoverySource: `星际介质-${Math.floor(Math.random() * 100)}`,
      spectroscopicData: { lines: Math.floor(Math.random() * 50) + 1 }
    });
  }
  return molecules;
}

// 生成宇宙尘埃类型 (约2000种)
export function generateCosmicDust(): any[] {
  const dust: any[] = [];
  const dustTypes = ['石墨', '硅酸盐', '碳化硅', '铁粒子', '冰晶', '有机物', '金属氧化物', '硫化物'];
  const sizes = ['纳米级', '微米级', '毫米级'];
  
  for (let i = 0; i < 2000; i++) {
    const type = dustTypes[Math.floor(Math.random() * dustTypes.length)];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    
    dust.push({
      formula: `CD-${i + 1}`,
      name: `${type}${size}尘埃-${Math.floor(Math.random() * 1000)}`,
      category: '宇宙尘埃',
      type: type,
      sizeRange: `${Math.random() * 1000}纳米`,
      composition: `${type}为主`,
      location: `星系-${Math.floor(Math.random() * 100)}`
    });
  }
  return dust;
}

// 生成量子态物质 (约1500种)
export function generateQuantumStates(): any[] {
  const states: any[] = [];
  const stateTypes = ['玻色-爱因斯坦凝聚', '量子自旋液体', '拓扑绝缘体', '时间晶体', '超流体', '超导体'];
  
  for (let i = 0; i < 1500; i++) {
    const type = stateTypes[Math.floor(Math.random() * stateTypes.length)];
    
    states.push({
      formula: `QS-${i + 1}`,
      name: `${type}-变体${Math.floor(Math.random() * 100)}`,
      category: '量子态',
      type: type,
      temperature: Math.random() * 1000,
      coherenceTime: Math.random() * 10000,
      quantumProperties: ['叠加', '纠缠', '隧穿'][Math.floor(Math.random() * 3)]
    });
  }
  return states;
}

// 生成等离子体态 (约1000种)
export function generatePlasmas(): any[] {
  const plasmas: any[] = [];
  const plasmaTypes = ['完全电离', '部分电离', '弱电离', '强耦合'];
  
  for (let i = 0; i < 1000; i++) {
    const type = plasmaTypes[Math.floor(Math.random() * plasmaTypes.length)];
    
    plasmas.push({
      formula: `PL-${i + 1}`,
      name: `${type}等离子体-${Math.floor(Math.random() * 500)}`,
      category: '等离子体',
      type: type,
      temperature: Math.random() * 10000000,
      density: Math.random() * 1e20,
      location: `恒星-${Math.floor(Math.random() * 50)}`
    });
  }
  return plasmas;
}
