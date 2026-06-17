/**
 * 全宇宙坐标系 (Universal Cosmic Coordinate System - UCS)
 * 
 * 设计原理：
 * - 原点：宇宙大爆炸原点 (t=0时刻的奇点，宇宙所有物质和能量的共同起源)
 * - 定向点：地球（作为宇宙坐标系的锚定参考点）
 * - 基本面：宇宙微波背景辐射(CMB)偶极指向
 * - 参考方向：地球→宇宙大爆炸原点的时空连线方向
 * 
 * 坐标表示：
 * - UCS直角坐标 (Xu, Yu, Zu)：单位 Gpc（十亿秒差距）
 *   Xu: 指向宇宙大爆炸原点的反方向（宇宙膨胀方向）
 *   Yu: 垂直于Xu，在 CMB 偶极平面内
 *   Zu: CMB 偶极平面法线方向
 * - UCS球面坐标 (Lu, Bu, Ru)：经度/纬度/距离（宇宙学红移距离）
 * 
 * 宇宙学常数（基于 Planck 2018）：
 * - 哈勃常数: H₀ = 67.4 km/s/Mpc
 * - 宇宙年龄: 138亿年
 * - 可观测宇宙半径: 约 460 亿光年
 * - 宇宙大爆炸原点红移: z = ∞
 * 
 * 与其他坐标系的转换参数：
 * 每种坐标系通过旋转矩阵+平移向量与UCS建立双向转换关系
 */

// ========== 常量定义 ==========

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

/** 天文单位转兆秒差距: 1 AU = 4.84814e-12 Mpc */
const AU_TO_MPC = 4.84814e-12;
/** 秒差距转兆秒差距: 1 pc = 1e-6 Mpc */
const PC_TO_MPC = 1e-6;
/** 千秒差距转兆秒差距 */
const KPC_TO_MPC = 1e-3;
/** 光年转兆秒差距: 1 ly = 0.3066 pc = 0.3066e-6 Mpc */
const LY_TO_MPC = 0.3066e-6;

/** 太阳系在银河系中的位置（银心坐标系，约8.5kpc） */
const SUN_GALACTIC_R = 8.5e-3; // Mpc (8.5 kpc)

/** 
 * 宇宙大爆炸原点 (Big Bang Origin) - UCS的真正原点
 * 宇宙所有物质、能量、空间和时间的共同起点
 * 红移 z = ∞，宇宙年龄 t = 0
 */
const BIG_BANG_ORIGIN_UCS: Vec3 = { x: 0, y: 0, z: 0 }; // Gpc

/** 
 * 地球在宇宙坐标系中的位置（相对于大爆炸原点）
 * 地球位于可观测宇宙中，距大爆炸原点约 460 亿光年
 * 使用共动距离（comoving distance）计算
 */
const EARTH_UCS: Vec3 = { 
  x: 14.4,    // Gpc (约460亿光年)
  y: 0.0,     // Gpc
  z: 0.0      // Gpc
};

/** 银心在宇宙坐标系中的位置 */
const GALACTIC_CENTER_UCS: Vec3 = { 
  x: 14.4085, // 银心距大爆炸原点约14.4085 Gpc
  y: 0.0, 
  z: 0.0 
};

/** 太阳在宇宙坐标系中的位置 */
const SUN_UCS: Vec3 = { 
  x: 14.4085, // 太阳距大爆炸原点约14.4085 Gpc
  y: 0.0, 
  z: 0.0 
};

// ========== 3D向量运算 ==========

export interface Vec3 { x: number; y: number; z: number; }

function vecAdd(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function vecSub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function vecScale(a: Vec3, s: number): Vec3 {
  return { x: a.x * s, y: a.y * s, z: a.z * s };
}

function vecLength(a: Vec3): number {
  return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
}

function vecDot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function vecCross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function vecNormalize(a: Vec3): Vec3 {
  const len = vecLength(a);
  if (len < 1e-15) return { x: 0, y: 0, z: 0 };
  return vecScale(a, 1 / len);
}

// ========== 旋转矩阵 ==========

/** 绕X轴旋转theta弧度 */
function rotX(v: Vec3, theta: number): Vec3 {
  const c = Math.cos(theta), s = Math.sin(theta);
  return { x: v.x, y: v.y * c - v.z * s, z: v.y * s + v.z * c };
}

/** 绕Y轴旋转theta弧度 */
function rotY(v: Vec3, theta: number): Vec3 {
  const c = Math.cos(theta), s = Math.sin(theta);
  return { x: v.x * c + v.z * s, y: v.y, z: -v.x * s + v.z * c };
}

/** 绕Z轴旋转theta弧度 */
function rotZ(v: Vec3, theta: number): Vec3 {
  const c = Math.cos(theta), s = Math.sin(theta);
  return { x: v.x * c - v.y * s, y: v.x * s + v.y * c, z: v.z };
}

// ========== 坐标系定义 ==========

export interface CoordinateSystem {
  id: string;
  name: string;
  nameEn: string;
  origin: string;          // 原点描述
  referencePlane: string;  // 参考平面
  referenceDir: string;    // 参考方向
  unit: string;            // 坐标单位
  positionInUCS: Vec3;     // 原点在UCS中的位置 (Mpc)
  orientationAngles: {     // 相对于UCS的旋转欧拉角 (弧度)
    thetaX: number;        // 绕UCS X轴旋转角
    thetaY: number;        // 绕UCS Y轴旋转角
    thetaZ: number;        // 绕UCS Z轴旋转角
  };
  description: string;
}

/**
 * 9大坐标系完整定义
 * 包含全宇宙坐标系(UCS) + 8种传统坐标系
 * 每个坐标系都有在UCS中的位置和旋转参数
 */
export const COORDINATE_SYSTEMS: CoordinateSystem[] = [
  {
    id: 'ucs',
    name: '全宇宙坐标系',
    nameEn: 'Universal Cosmic System',
    origin: '宇宙大爆炸原点 (t=0, 宇宙所有物质/能量/时空的共同起源)',
    referencePlane: '宇宙微波背景辐射(CMB)偶极平面',
    referenceDir: '地球→宇宙大爆炸原点的时空连线',
    unit: 'Gpc (十亿秒差距)',
    positionInUCS: { x: 0, y: 0, z: 0 },
    orientationAngles: { thetaX: 0, thetaY: 0, thetaZ: 0 },
    description: '以宇宙大爆炸原点为原点、地球为定向锚点的统一坐标系。所有其他坐标系通过统一的旋转和平移参数与之转换。适用于宇宙大尺度结构描述和跨坐标系统一查询。宇宙年龄138亿年，可观测宇宙半径460亿光年。',
  },
  {
    id: 'geocentric',
    name: '地心坐标系',
    nameEn: 'Geocentric',
    origin: '地球中心',
    referencePlane: '地球赤道面',
    referenceDir: '春分点方向',
    unit: 'km / AU',
    positionInUCS: EARTH_UCS,
    orientationAngles: { thetaX: 62.87 * DEG, thetaY: -37.0 * DEG, thetaZ: 97.0 * DEG },
    description: '以地球中心为原点，赤道面为参考。GPS、卫星轨道等应用。地球距宇宙大爆炸原点约460亿光年(14.4 Gpc)。',
  },
  {
    id: 'heliocentric',
    name: '日心坐标系',
    nameEn: 'Heliocentric',
    origin: '太阳中心',
    referencePlane: '黄道面',
    referenceDir: '春分点方向',
    unit: 'AU',
    positionInUCS: SUN_UCS,
    orientationAngles: { thetaX: 62.87 * DEG, thetaY: -37.0 * DEG, thetaZ: 97.0 * DEG },
    description: '以太阳中心为原点，黄道面为参考。行星轨道、太阳系动力学。太阳距宇宙大爆炸原点约14.4085 Gpc。',
  },
  {
    id: 'galactocentric',
    name: '银心坐标系',
    nameEn: 'Galactocentric',
    origin: '银河系中心（人马座A*）',
    referencePlane: '银河系平面',
    referenceDir: '太阳-银心连线方向',
    unit: 'kpc (千秒差距)',
    positionInUCS: GALACTIC_CENTER_UCS,
    orientationAngles: { thetaX: 62.87 * DEG, thetaY: -37.0 * DEG, thetaZ: 0.0 * DEG },
    description: '以银河系中心为原点，银道面为参考。恒星运动、银河结构。银心距宇宙大爆炸原点约14.4085 Gpc。',
  },
  {
    id: 'equatorial',
    name: '赤道坐标系',
    nameEn: 'Equatorial',
    origin: '地心',
    referencePlane: '天赤道（地球赤道延伸）',
    referenceDir: '春分点',
    unit: '时角(h) / 度(°)',
    positionInUCS: EARTH_UCS,
    orientationAngles: { thetaX: 62.87 * DEG, thetaY: -37.0 * DEG, thetaZ: 97.0 * DEG },
    description: '天文观测标准坐标系。赤经(RA)/赤纬(Dec)描述天体在天球上的位置。受岁差影响需指定历元(J2000.0等)。地球距宇宙大爆炸原点约14.4 Gpc。',
  },
  {
    id: 'ecliptic',
    name: '黄道坐标系',
    nameEn: 'Ecliptic',
    origin: '日心',
    referencePlane: '黄道面（地球公转平面）',
    referenceDir: '春分点',
    unit: '度(°)',
    positionInUCS: SUN_UCS,
    orientationAngles: { thetaX: 62.87 * DEG, thetaY: -37.0 * DEG, thetaZ: 97.0 * DEG },
    description: '以黄道面为参考。行星位置、日月食计算。黄赤交角约23.44°。太阳距宇宙大爆炸原点约14.4085 Gpc。',
  },
  {
    id: 'galactic',
    name: '银道坐标系',
    nameEn: 'Galactic',
    origin: '日心',
    referencePlane: '银道面',
    referenceDir: '银心方向',
    unit: '度(°)',
    positionInUCS: GALACTIC_CENTER_UCS,
    orientationAngles: { thetaX: 62.87 * DEG, thetaY: -37.0 * DEG, thetaZ: 0.0 * DEG },
    description: '银河系结构研究标准坐标系。银经(l)/银纬(b)描述天体相对银道面位置。银心距宇宙大爆炸原点约14.4085 Gpc。',
  },
  {
    id: 'horizontal',
    name: '地平坐标系',
    nameEn: 'Horizontal',
    origin: '观测者位置',
    referencePlane: '地平线',
    referenceDir: '正北方向',
    unit: '度(°) / 方位角',
    positionInUCS: EARTH_UCS,
    orientationAngles: { thetaX: 90.0 * DEG, thetaY: 0.0 * DEG, thetaZ: 0.0 * DEG },
    description: '以观测者当地地平线为参考。方位角(Az)/高度角(Alt)。随地球自转和时间变化，需指定经纬度和时刻。地球距宇宙大爆炸原点约14.4 Gpc。',
  },
  {
    id: 'supergalactic',
    name: '超星系坐标系',
    nameEn: 'Supergalactic',
    origin: '本超星系团质心近似',
    referencePlane: '超星系平面',
    referenceDir: '超星系北极方向',
    unit: 'Mpc (兆秒差距)',
    positionInUCS: { x: 0.0, y: 0.0, z: 0.0 },
    orientationAngles: { thetaX: 0.0 * DEG, thetaY: 0.0 * DEG, thetaZ: 0.0 * DEG },
    description: '以超星系平面为参考，研究宇宙大尺度结构。超星系平面由室女座超星系团定义。与UCS基本面对齐。',
  },
];

// ========== 坐标系查找 ==========

export function getCoordinateSystem(id: string): CoordinateSystem | undefined {
  return COORDINATE_SYSTEMS.find(cs => cs.id === id);
}

export function getAllCoordinateSystems(): CoordinateSystem[] {
  return COORDINATE_SYSTEMS;
}

// ========== 核心转换算法 ==========

/**
 * 将一个坐标系中的直角坐标转换到UCS
 * 步骤: 先旋转(对齐轴向) → 再平移(移到UCS原点)
 */
function toUCS(point: Vec3, fromSystem: CoordinateSystem): Vec3 {
  // 步骤1: 应用旋转 (从源坐标系轴向旋转到UCS轴向)
  let rotated = { ...point };
  rotated = rotX(rotated, fromSystem.orientationAngles.thetaX);
  rotated = rotY(rotated, fromSystem.orientationAngles.thetaY);
  rotated = rotZ(rotated, fromSystem.orientationAngles.thetaZ);

  // 步骤2: 平移 (加上原点在UCS中的位置)
  return vecAdd(rotated, fromSystem.positionInUCS);
}

/**
 * 将UCS中的直角坐标转换到目标坐标系
 * 步骤: 先平移(移到目标原点) → 再逆向旋转(对齐目标轴向)
 */
function fromUCS(point: Vec3, toSystem: CoordinateSystem): Vec3 {
  // 步骤1: 平移 (减去目标原点在UCS中的位置)
  const translated = vecSub(point, toSystem.positionInUCS);

  // 步骤2: 逆向旋转 (反向旋转，顺序相反)
  let rotated = { ...translated };
  rotated = rotZ(rotated, -toSystem.orientationAngles.thetaZ);
  rotated = rotY(rotated, -toSystem.orientationAngles.thetaY);
  rotated = rotX(rotated, -toSystem.orientationAngles.thetaX);

  return rotated;
}

/**
 * 任意两个坐标系之间的转换
 * 先转到UCS，再从UCS转到目标坐标系
 */
export function convertCoordinates(
  point: Vec3,
  fromSystemId: string,
  toSystemId: string
): Vec3 {
  const fromSystem = getCoordinateSystem(fromSystemId);
  const toSystem = getCoordinateSystem(toSystemId);
  
  if (!fromSystem || !toSystem) {
    throw new Error(`未知坐标系: ${!fromSystem ? fromSystemId : toSystemId}`);
  }

  // 如果源或目标是UCS，直接转换
  if (fromSystemId === 'ucs') {
    return fromUCS(point, toSystem);
  }
  if (toSystemId === 'ucs') {
    return toUCS(point, fromSystem);
  }

  // 先转到UCS，再转到目标
  const ucsPoint = toUCS(point, fromSystem);
  return fromUCS(ucsPoint, toSystem);
}

// ========== 单位转换 ==========

export type DistanceUnit = 'mpc' | 'kpc' | 'pc' | 'ly' | 'au' | 'km';

const UNIT_TO_MPC: Record<DistanceUnit, number> = {
  mpc: 1,
  kpc: 1e-3,
  pc: 1e-6,
  ly: LY_TO_MPC,
  au: AU_TO_MPC,
  km: 3.2408e-20, // 1 km = 3.2408e-20 Mpc
};

export function convertDistance(value: number, from: DistanceUnit, to: DistanceUnit): number {
  const mpcValue = value * UNIT_TO_MPC[from];
  return mpcValue / UNIT_TO_MPC[to];
}

// ========== 球面坐标转换 ==========

export interface SphericalCoord {
  lon: number;  // 经度/方位角 (度)
  lat: number;  // 纬度/仰角 (度)
  r: number;    // 距离 (取决于坐标系单位)
}

/** 直角坐标 → 球面坐标 */
export function cartesianToSpherical(v: Vec3): SphericalCoord {
  const r = vecLength(v);
  if (r < 1e-15) return { lon: 0, lat: 0, r: 0 };
  const lat = Math.asin(Math.max(-1, Math.min(1, v.z / r))) * RAD;
  const lon = Math.atan2(v.y, v.x) * RAD;
  return {
    lon: ((lon % 360) + 360) % 360,
    lat,
    r,
  };
}

/** 球面坐标 → 直角坐标 */
export function sphericalToCartesian(s: SphericalCoord): Vec3 {
  const latRad = s.lat * DEG;
  const lonRad = s.lon * DEG;
  return {
    x: s.r * Math.cos(latRad) * Math.cos(lonRad),
    y: s.r * Math.cos(latRad) * Math.sin(lonRad),
    z: s.r * Math.sin(latRad),
  };
}

// ========== 特殊转换函数 ==========

/**
 * 地心赤道坐标 → UCS
 * 输入: 地心赤道直角坐标 (AU), 历元J2000.0
 * 流程: 地心赤道 → 日心黄道 → 日心银道 → 银心 → UCS
 */
export function geocentricEquatorialToUCS(xEq: number, yEq: number, zEq: number): Vec3 {
  // 地心 → 日心 (加上地球的日心坐标，这里用简化值)
  // 地球在J2000.0的日心黄道坐标约 (1, 0, 0) AU
  const xH = xEq + 1.0; // 简化：地球日心距离约1AU
  const yH = yEq;
  const zH = zEq;

  // 黄道 → 银道 (使用标准旋转)
  // 黄道与银道的转换涉及三次旋转
  // 简化使用欧拉角: 先绕Z轴转(角1), 再绕X轴转(角2)
  const lambda = 33.0 * DEG;  // 黄道-银道交角相关
  const phi = 60.2 * DEG;     // 黄道与银道夹角
  
  // 黄道直角 → 银道直角 (简化)
  let galPoint: Vec3 = { x: xH, y: yH, z: zH };
  galPoint = rotZ(galPoint, lambda);
  galPoint = rotX(galPoint, phi);

  // 日心银道 → 银心 (太阳在银心坐标系约 x=-8.5kpc)
  const kpcX = galPoint.x * AU_TO_MPC / KPC_TO_MPC + 8.5;
  const kpcY = galPoint.y * AU_TO_MPC / KPC_TO_MPC;
  const kpcZ = galPoint.z * AU_TO_MPC / KPC_TO_MPC;

  // 银心 → UCS (银心坐标系与UCS对齐，仅差平移)
  // 银心在UCS中的位置 + 旋转修正
  const ucsPoint = vecAdd(
    { x: kpcX * KPC_TO_MPC, y: kpcY * KPC_TO_MPC, z: kpcZ * KPC_TO_MPC },
    GALACTIC_CENTER_UCS
  );

  return ucsPoint;
}

/**
 * 日心黄道坐标(HCI) → UCS
 * 输入: HCI直角坐标 (AU)
 */
export function heliocentricEclipticToUCS(x: number, y: number, z: number): Vec3 {
  // HCI → 银道坐标
  let galPoint: Vec3 = { x, y, z };
  // 黄道到银道的旋转
  galPoint = rotZ(galPoint, 33.0 * DEG);
  galPoint = rotX(galPoint, 60.2 * DEG);

  // AU → Mpc，并加上太阳在银心坐标系的位置
  const mpcX = galPoint.x * AU_TO_MPC + 8.5 * KPC_TO_MPC;
  const mpcY = galPoint.y * AU_TO_MPC;
  const mpcZ = galPoint.z * AU_TO_MPC;

  // 银心坐标 → UCS
  return vecAdd({ x: mpcX, y: mpcY, z: mpcZ }, GALACTIC_CENTER_UCS);
}

/**
 * UCS → 日心黄道坐标(HCI)
 * 输入: UCS直角坐标 (Mpc)
 */
export function ucsToHeliocentricEcliptic(ucs: Vec3): Vec3 {
  // UCS → 银心坐标
  const galCenter = vecSub(ucs, GALACTIC_CENTER_UCS);
  
  // 减去太阳位置
  const sunGal: Vec3 = { x: 8.5 * KPC_TO_MPC, y: 0, z: 0 };
  const fromSun = vecSub(galCenter, sunGal);
  
  // Mpc → AU
  const auX = fromSun.x / AU_TO_MPC;
  const auY = fromSun.y / AU_TO_MPC;
  const auZ = fromSun.z / AU_TO_MPC;

  // 银道 → 黄道 (逆向旋转)
  let eclPoint: Vec3 = { x: auX, y: auY, z: auZ };
  eclPoint = rotX(eclPoint, -60.2 * DEG);
  eclPoint = rotZ(eclPoint, -33.0 * DEG);

  return eclPoint;
}

// ========== 批量转换 ==========

export interface ConversionResult {
  input: { system: string; x: number; y: number; z: number };
  output: { system: string; x: number; y: number; z: number };
  spherical: SphericalCoord;
  distanceMpc: number;
  distanceLy: number;
}

/**
 * 将一个坐标点转换为所有其他坐标系
 * 返回每种坐标系的转换结果
 */
export function convertToAllSystems(
  x: number, y: number, z: number,
  fromSystemId: string
): ConversionResult[] {
  const results: ConversionResult[] = [];
  const fromSystem = getCoordinateSystem(fromSystemId);
  if (!fromSystem) return results;

  const sourcePoint: Vec3 = { x, y, z };

  for (const targetSystem of COORDINATE_SYSTEMS) {
    if (targetSystem.id === fromSystemId) continue;
    
    try {
      const converted = convertCoordinates(sourcePoint, fromSystemId, targetSystem.id);
      const spherical = cartesianToSpherical(converted);
      const distMpc = vecLength(converted);
      
      results.push({
        input: { system: fromSystemId, x, y, z },
        output: { system: targetSystem.id, x: converted.x, y: converted.y, z: converted.z },
        spherical,
        distanceMpc: distMpc,
        distanceLy: convertDistance(distMpc, 'mpc', 'ly'),
      });
    } catch {
      // 跳过转换失败的
    }
  }

  return results;
}

// ========== 转换参数查询 ==========

export interface TransformParams {
  from: string;
  to: string;
  rotationAngles: { thetaX: number; thetaY: number; thetaZ: number };
  translation: Vec3;
  description: string;
}

/**
 * 获取两个坐标系之间的转换参数
 */
export function getTransformParams(fromId: string, toId: string): TransformParams | null {
  const from = getCoordinateSystem(fromId);
  const to = getCoordinateSystem(toId);
  if (!from || !to) return null;

  // 转换参数 = 目标系原点在源系中的位置 + 旋转差
  const translation = vecSub(to.positionInUCS, from.positionInUCS);
  
  // 旋转差 = 目标系旋转角 - 源系旋转角
  const rotationAngles = {
    thetaX: to.orientationAngles.thetaX - from.orientationAngles.thetaX,
    thetaY: to.orientationAngles.thetaY - from.orientationAngles.thetaY,
    thetaZ: to.orientationAngles.thetaZ - from.orientationAngles.thetaZ,
  };

  return {
    from: from.name,
    to: to.name,
    rotationAngles: {
      thetaX: +rotationAngles.thetaX.toFixed(6),
      thetaY: +rotationAngles.thetaY.toFixed(6),
      thetaZ: +rotationAngles.thetaZ.toFixed(6),
    },
    translation: {
      x: +translation.x.toFixed(8),
      y: +translation.y.toFixed(8),
      z: +translation.z.toFixed(8),
    },
    description: `${from.name} → ${to.name}: 先绕X轴旋转${(rotationAngles.thetaX * RAD).toFixed(2)}°, 再绕Y轴旋转${(rotationAngles.thetaY * RAD).toFixed(2)}°, 再绕Z轴旋转${(rotationAngles.thetaZ * RAD).toFixed(2)}°; 平移(${translation.x.toFixed(6)}, ${translation.y.toFixed(6)}, ${translation.z.toFixed(6)}) Mpc`,
  };
}

/**
 * 获取所有坐标系对的转换参数
 */
export function getAllTransformParams(): TransformParams[] {
  const params: TransformParams[] = [];
  for (let i = 0; i < COORDINATE_SYSTEMS.length; i++) {
    for (let j = 0; j < COORDINATE_SYSTEMS.length; j++) {
      if (i !== j) {
        const p = getTransformParams(COORDINATE_SYSTEMS[i].id, COORDINATE_SYSTEMS[j].id);
        if (p) params.push(p);
      }
    }
  }
  return params;
}

/**
 * 获取UCS与所有其他坐标系的转换参数（以UCS为中心）
 */
export function getUCSTransformParams(): TransformParams[] {
  const params: TransformParams[] = [];
  for (const cs of COORDINATE_SYSTEMS) {
    if (cs.id === 'ucs') continue;
    const forward = getTransformParams('ucs', cs.id);
    const backward = getTransformParams(cs.id, 'ucs');
    if (forward) params.push(forward);
    if (backward) params.push(backward);
  }
  return params;
}
