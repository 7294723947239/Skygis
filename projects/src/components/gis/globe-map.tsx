'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SOLAR_SYSTEM_MATERIALS, type BodyMaterials } from '@/lib/solar-system-materials';
import { COSMIC_TAXONOMY, type CosmicCategory, type CosmicObject as TaxonomyObject } from '@/lib/cosmic-taxonomy';
import { ALL_COSMIC_OBJECTS, searchCosmicObjects, COSMIC_OBJECT_TYPE_MAP, type CosmicObject } from '@/lib/cosmic-catalog';
import { ALL_COSMIC_SUBSTANCES, SUBSTANCE_STATS, type CosmicSubstance } from '@/lib/all-cosmic-substances';
import GravityPanel from './gravity-panel';
import SolarSystemPanel from './solar-system-panel';
import TimeController from './time-controller';
import GravityFieldPanel from './gravity-field-panel';
import GeologicalEvolutionPanel from './geological-evolution-panel';
import NavigationPlannerPanel from './navigation-planner-panel';
import EvolutionHistoryPanel from './evolution-history-panel';
import RemoteSensingPanel from './remote-sensing-panel';
import AsteroidDiscoveryPanel from './asteroid-discovery-panel';
import DigitalTwinPanel from './digital-twin-panel';
import SpatialAgentPanel from './spatial-agent-panel';
import { startAgent, getAgentEngine } from '@/lib/spatial-agent-engine';
import NativeAiPanel from './native-ai-panel';
import EngineeringPanel from './engineering-panel';
import SmartCommandBar from './smart-command-bar';
import AiAssistant from './ai-assistant';
import CelestialLayersPanel from './celestial-layers-panel';
import WanderAgentPanel from './wander-agent-panel';
import UniverseMaterialsPanel from './universe-materials-panel';
import { useSkyGISHub, type SkyGISPanelId, type CelestialBody, SIGNAL_LABELS, type mmSignalType, type SmartCommandResult } from '@/lib/skygis-hub';
import type { GisFeature, GisLayer, MapTool, SkyGISOverlayPoint } from '@/lib/gis-context';

interface GlobeMapProps {
  onMapClick?: (lat: number, lng: number) => void;
  onFeatureSelect?: (featureId: string) => void;
  features?: GisFeature[];
  layers?: GisLayer[];
  activeTool?: MapTool;
  flyToPosition?: { lat: number; lng: number } | null;
  skygisOverlays?: SkyGISOverlayPoint[];
  skygisSelectedId?: string | null;
  onLogout?: () => void;
}

// ====== 天文数据 ======
const AU_KM = 149597870.7;

interface PlanetData {
  name: string;
  nameCn: string;
  radiusKm: number;
  distAu: number;
  orbitalPeriodDays: number;
  color: number;
  emissive?: number;
  description: string;
  mass: string;
  gravity: string;
  moons: number;
  temp: string;
  type: string;
}

const PLANETS: PlanetData[] = [
  { name: 'Mercury', nameCn: '水星', radiusKm: 2440, distAu: 0.387, orbitalPeriodDays: 88, color: 0x8c7e6d, description: '最靠近太阳的行星，昼夜温差极大', mass: '3.285×10²³ kg', gravity: '3.7 m/s²', moons: 0, temp: '-173~427°C', type: '类地行星' },
  { name: 'Venus', nameCn: '金星', radiusKm: 6052, distAu: 0.723, orbitalPeriodDays: 225, color: 0xc9a84c, description: '最热的行星，浓密大气造成极强温室效应', mass: '4.867×10²⁴ kg', gravity: '8.87 m/s²', moons: 0, temp: '462°C', type: '类地行星' },
  { name: 'Earth', nameCn: '地球', radiusKm: 6371, distAu: 1.0, orbitalPeriodDays: 365.25, color: 0x1a6b8a, description: '唯一已知存在生命的行星', mass: '5.972×10²⁴ kg', gravity: '9.81 m/s²', moons: 1, temp: '-89~57°C', type: '类地行星' },
  { name: 'Mars', nameCn: '火星', radiusKm: 3390, distAu: 1.524, orbitalPeriodDays: 687, color: 0xc1440e, description: '红色星球，拥有太阳系最高的火山', mass: '6.39×10²³ kg', gravity: '3.72 m/s²', moons: 2, temp: '-87~-5°C', type: '类地行星' },
  { name: 'Jupiter', nameCn: '木星', radiusKm: 69911, distAu: 5.203, orbitalPeriodDays: 4333, color: 0xc88b3a, description: '太阳系最大行星，大红斑风暴持续数百年', mass: '1.898×10²⁷ kg', gravity: '24.79 m/s²', moons: 95, temp: '-108°C', type: '气态巨行星' },
  { name: 'Saturn', nameCn: '土星', radiusKm: 58232, distAu: 9.537, orbitalPeriodDays: 10759, color: 0xe8d5a3, description: '以壮观环系闻名的气态巨行星', mass: '5.683×10²⁶ kg', gravity: '10.44 m/s²', moons: 146, temp: '-139°C', type: '气态巨行星' },
  { name: 'Uranus', nameCn: '天王星', radiusKm: 25362, distAu: 19.19, orbitalPeriodDays: 30687, color: 0x7ec8e3, description: '自转轴几乎平行于公转面的冰巨星', mass: '8.681×10²⁵ kg', gravity: '8.69 m/s²', moons: 28, temp: '-197°C', type: '冰巨星' },
  { name: 'Neptune', nameCn: '海王星', radiusKm: 24622, distAu: 30.07, orbitalPeriodDays: 60190, color: 0x3f5cff, description: '太阳系最远行星，风速最快', mass: '1.024×10²⁶ kg', gravity: '11.15 m/s²', moons: 16, temp: '-201°C', type: '冰巨星' },
];

// ====== 矮行星 ======
const DWARF_PLANETS: PlanetData[] = [
  { name: 'Pluto', nameCn: '冥王星', radiusKm: 1188, distAu: 39.48, orbitalPeriodDays: 90560, color: 0xa8a29e, description: '柯伊伯带矮行星，拥有心形氮冰平原', mass: '1.303×10²² kg', gravity: '0.62 m/s²', moons: 5, temp: '-230°C', type: '矮行星' },
  { name: 'Eris', nameCn: '阋神星', radiusKm: 1163, distAu: 67.78, orbitalPeriodDays: 204199, color: 0xc4c0bc, description: '离散盘矮行星，比冥王星更重', mass: '1.66×10²² kg', gravity: '0.82 m/s²', moons: 1, temp: '-243°C', type: '矮行星' },
  { name: 'Ceres', nameCn: '谷神星', radiusKm: 473, distAu: 2.77, orbitalPeriodDays: 1682, color: 0x7a756e, description: '小行星带最大天体，拥有地下盐水', mass: '9.39×10²⁰ kg', gravity: '0.28 m/s²', moons: 0, temp: '-106°C', type: '矮行星' },
  { name: 'Makemake', nameCn: '鸟神星', radiusKm: 715, distAu: 45.79, orbitalPeriodDays: 111845, color: 0xb0a898, description: '柯伊伯带矮行星，表面覆盖甲烷冰', mass: '~3×10²¹ kg', gravity: '~0.5 m/s²', moons: 1, temp: '-239°C', type: '矮行星' },
  { name: 'Haumea', nameCn: '妊神星', radiusKm: 795, distAu: 43.22, orbitalPeriodDays: 103774, color: 0xd4c8b8, description: '椭球形矮行星，拥有环系统', mass: '4.006×10²¹ kg', gravity: '~0.44 m/s²', moons: 2, temp: '-241°C', type: '矮行星' },
];

// ====== 主要卫星 ======
interface MoonData {
  name: string;
  nameCn: string;
  radiusKm: number;
  parentDistKm: number;  // 距母星距离(km)
  orbitalPeriodDays: number;
  color: number;
  description: string;
  mass: string;
  gravity: string;
  temp: string;
  type: string;
  parent: string;  // 母星name
}
	const MAJOR_MOONS: MoonData[] = [
	  // ====== 地球卫星 ======
	  { name: 'Moon', nameCn: '月球', radiusKm: 1737, parentDistKm: 384400, orbitalPeriodDays: 27.32, color: 0xc8c8c8, description: '地球唯一的天然卫星', mass: '7.342×10²² kg', gravity: '1.62 m/s²', temp: '-233~123°C', type: '天然卫星', parent: 'Earth' },
	  
	  // ====== 火星卫星 ======
	  { name: 'Phobos', nameCn: '火卫一', radiusKm: 11, parentDistKm: 9376, orbitalPeriodDays: 0.32, color: 0x8a7a6a, description: '火星最大卫星，正在缓慢螺旋坠向火星', mass: '1.07×10¹⁶ kg', gravity: '0.0059 m/s²', temp: '-40°C', type: '不规则卫星', parent: 'Mars' },
	  { name: 'Deimos', nameCn: '火卫二', radiusKm: 6, parentDistKm: 23463, orbitalPeriodDays: 1.26, color: 0x9a8a7a, description: '火星最小卫星，形状不规则', mass: '1.48×10¹⁵ kg', gravity: '0.003 m/s²', temp: '-40°C', type: '不规则卫星', parent: 'Mars' },
	  
	  // ====== 木星卫星 (主要) ======
	  { name: 'Io', nameCn: '木卫一', radiusKm: 1822, parentDistKm: 421700, orbitalPeriodDays: 1.77, color: 0xe8d44d, description: '太阳系火山最活跃天体', mass: '8.932×10²² kg', gravity: '1.80 m/s²', temp: '-183°C', type: '火山卫星', parent: 'Jupiter' },
	  { name: 'Europa', nameCn: '木卫二', radiusKm: 1561, parentDistKm: 671100, orbitalPeriodDays: 3.55, color: 0xc8b896, description: '冰壳下可能存在液态海洋', mass: '4.8×10²² kg', gravity: '1.31 m/s²', temp: '-160°C', type: '冰卫星', parent: 'Jupiter' },
	  { name: 'Ganymede', nameCn: '木卫三', radiusKm: 2634, parentDistKm: 1070400, orbitalPeriodDays: 7.15, color: 0x9a9186, description: '太阳系最大卫星，拥有磁场', mass: '1.482×10²³ kg', gravity: '1.43 m/s²', temp: '-163°C', type: '冰卫星', parent: 'Jupiter' },
	  { name: 'Callisto', nameCn: '木卫四', radiusKm: 2410, parentDistKm: 1882700, orbitalPeriodDays: 16.69, color: 0x6b6356, description: '表面密布陨石坑的古老卫星', mass: '1.076×10²³ kg', gravity: '1.24 m/s²', temp: '-139°C', type: '冰卫星', parent: 'Jupiter' },
	  { name: 'Amalthea', nameCn: '木卫五', radiusKm: 83, parentDistKm: 181400, orbitalPeriodDays: 0.50, color: 0xcc9966, description: '红色著名卫星', mass: '2.1×10¹⁸ kg', gravity: '0.05 m/s²', temp: '-120°C', type: '内层卫星', parent: 'Jupiter' },
	  { name: 'Thebe', nameCn: '木卫十四', radiusKm: 49, parentDistKm: 221900, orbitalPeriodDays: 0.67, color: 0x998877, description: '木星第四内层卫星', mass: '4.3×10¹⁷ kg', gravity: '0.03 m/s²', temp: '-130°C', type: '内层卫星', parent: 'Jupiter' },
	  { name: 'Himalia', nameCn: '木卫六', radiusKm: 85, parentDistKm: 11461000, orbitalPeriodDays: 250.56, color: 0x8a7a6a, description: '加尔尼美群最大卫星', mass: '6.7×10¹⁸ kg', gravity: '0.06 m/s²', temp: '-170°C', type: '不规则卫星', parent: 'Jupiter' },
	  { name: 'Elara', nameCn: '木卫七', radiusKm: 43, parentDistKm: 11741000, orbitalPeriodDays: 259.64, color: 0x9a8a7a, description: '加尔尼美群卫星', mass: '8.7×10¹⁷ kg', gravity: '0.03 m/s²', temp: '-168°C', type: '不规则卫星', parent: 'Jupiter' },
	  { name: 'Ananke', nameCn: '木卫十二', radiusKm: 15, parentDistKm: 21276000, orbitalPeriodDays: 610.5, color: 0x6a6a6a, description: '安anke群核心卫星', mass: '3.0×10¹⁶ kg', gravity: '0.02 m/s²', temp: '-175°C', type: '不规则卫星', parent: 'Jupiter' },
	  { name: 'Carme', nameCn: '木卫十一', radiusKm: 23, parentDistKm: 23404000, orbitalPeriodDays: 692.7, color: 0x8a7060, description: '卡梅群最大卫星', mass: '1.3×10¹⁷ kg', gravity: '0.02 m/s²', temp: '-176°C', type: '不规则卫星', parent: 'Jupiter' },
	  { name: 'Pasiphae', nameCn: '木卫八', radiusKm: 29, parentDistKm: 23624000, orbitalPeriodDays: 708, color: 0x7a7060, description: '帕西法群最大卫星', mass: '3.0×10¹⁷ kg', gravity: '0.02 m/s²', temp: '-176°C', type: '不规则卫星', parent: 'Jupiter' },
	  { name: 'Sinope', nameCn: '木卫九', radiusKm: 19, parentDistKm: 23939000, orbitalPeriodDays: 724.5, color: 0x6a6a5a, description: '最远的木星卫星之一', mass: '7.8×10¹⁶ kg', gravity: '0.02 m/s²', temp: '-177°C', type: '不规则卫星', parent: 'Jupiter' },
	  
	  // ====== 土星卫星 (主要) ======
	  { name: 'Mimas', nameCn: '土卫一', radiusKm: 198, parentDistKm: 185404, orbitalPeriodDays: 0.94, color: 0xc8c8c8, description: '拥有巨大赫歇尔陨石坑', mass: '3.75×10¹⁹ kg', gravity: '0.064 m/s²', temp: '-209°C', type: '冰卫星', parent: 'Saturn' },
	  { name: 'Enceladus', nameCn: '土卫二', radiusKm: 252, parentDistKm: 237948, orbitalPeriodDays: 1.37, color: 0xf0f0ff, description: '南极喷泉喷射水冰粒子，存在地下海洋', mass: '1.08×10²⁰ kg', gravity: '0.113 m/s²', temp: '-198°C', type: '冰卫星', parent: 'Saturn' },
	  { name: 'Tethys', nameCn: '土卫三', radiusKm: 533, parentDistKm: 294619, orbitalPeriodDays: 1.89, color: 0xe0e0e8, description: '拥有奥德修斯大陨石坑', mass: '6.15×10²⁰ kg', gravity: '0.15 m/s²', temp: '-187°C', type: '冰卫星', parent: 'Saturn' },
	  { name: 'Dione', nameCn: '土卫四', radiusKm: 561, parentDistKm: 377396, orbitalPeriodDays: 2.74, color: 0xc0b8b0, description: '表面有冰崖和裂缝', mass: '1.096×10²¹ kg', gravity: '0.23 m/s²', temp: '-186°C', type: '冰卫星', parent: 'Saturn' },
	  { name: 'Rhea', nameCn: '土卫五', radiusKm: 764, parentDistKm: 527108, orbitalPeriodDays: 4.52, color: 0xd0d0d0, description: '土星第二大卫星', mass: '2.31×10²¹ kg', gravity: '0.26 m/s²', temp: '-174°C', type: '冰卫星', parent: 'Saturn' },
	  { name: 'Titan', nameCn: '土卫六', radiusKm: 2575, parentDistKm: 1221870, orbitalPeriodDays: 15.95, color: 0xc8a050, description: '唯一拥有浓密大气的卫星，有甲烷湖泊', mass: '1.345×10²³ kg', gravity: '1.35 m/s²', temp: '-179°C', type: '冰卫星', parent: 'Saturn' },
	  { name: 'Hyperion', nameCn: '土卫七', radiusKm: 135, parentDistKm: 1481000, orbitalPeriodDays: 21.28, color: 0xaa9060, description: '形状不规则的自转卫星', mass: '5.6×10¹⁸ kg', gravity: '0.05 m/s²', temp: '-180°C', type: '冰卫星', parent: 'Saturn' },
	  { name: 'Iapetus', nameCn: '土卫八', radiusKm: 735, parentDistKm: 3560820, orbitalPeriodDays: 79.32, color: 0x8a7a6a, description: '两半球颜色截然不同', mass: '1.806×10²¹ kg', gravity: '0.22 m/s²', temp: '-143°C', type: '冰卫星', parent: 'Saturn' },
	  { name: 'Pan', nameCn: '土卫十八', radiusKm: 14, parentDistKm: 133580, orbitalPeriodDays: 0.58, color: 0xd8d8d8, description: '恩克环缝中的牧羊犬卫星', mass: '4.95×10¹⁵ kg', gravity: '0.01 m/s²', temp: '-210°C', type: '内环卫星', parent: 'Saturn' },
	  { name: 'Atlas', nameCn: '土卫十五', radiusKm: 15, parentDistKm: 137670, orbitalPeriodDays: 0.60, color: 0xc8c8c8, description: '土星A环的牧羊犬卫星', mass: '6.6×10¹⁵ kg', gravity: '0.01 m/s²', temp: '-210°C', type: '内环卫星', parent: 'Saturn' },
	  { name: 'Prometheus', nameCn: '土卫十六', radiusKm: 43, parentDistKm: 139380, orbitalPeriodDays: 0.61, color: 0xb8a888, description: 'F环的牧羊犬卫星', mass: '1.6×10¹⁷ kg', gravity: '0.03 m/s²', temp: '-200°C', type: '内环卫星', parent: 'Saturn' },
	  { name: 'Pandora', nameCn: '土卫十七', radiusKm: 40, parentDistKm: 141890, orbitalPeriodDays: 0.63, color: 0xa89878, description: 'F环的牧羊犬卫星', mass: '1.4×10¹⁷ kg', gravity: '0.03 m/s²', temp: '-200°C', type: '内环卫星', parent: 'Saturn' },
	  { name: 'Epimetheus', nameCn: '土卫十一', radiusKm: 58, parentDistKm: 151410, orbitalPeriodDays: 0.69, color: 0xb8b0a0, description: '与土卫十共用轨道的卫星', mass: '5.3×10¹⁷ kg', gravity: '0.04 m/s²', temp: '-200°C', type: '内环卫星', parent: 'Saturn' },
	  { name: 'Janus', nameCn: '土卫十', radiusKm: 89, parentDistKm: 151470, orbitalPeriodDays: 0.69, color: 0xc0b8a8, description: '与土卫十一共用轨道的卫星', mass: '1.9×10¹⁸ kg', gravity: '0.05 m/s²', temp: '-198°C', type: '内环卫星', parent: 'Saturn' },
	  { name: 'Helene', nameCn: '土卫十二', radiusKm: 16, parentDistKm: 377400, orbitalPeriodDays: 2.59, color: 0xd0d0d0, description: '土卫四的特洛伊卫星', mass: '2.5×10¹⁶ kg', gravity: '0.01 m/s²', temp: '-198°C', type: '冰卫星', parent: 'Saturn' },
	  { name: 'Telesto', nameCn: '土卫十三', radiusKm: 12, parentDistKm: 294700, orbitalPeriodDays: 1.89, color: 0xd8d8d8, description: '土卫三的特洛伊卫星', mass: '8.2×10¹⁵ kg', gravity: '0.01 m/s²', temp: '-200°C', type: '冰卫星', parent: 'Saturn' },
	  
	  // ====== 天王星卫星 (主要) ======
	  { name: 'Miranda', nameCn: '天卫五', radiusKm: 236, parentDistKm: 129390, orbitalPeriodDays: 1.41, color: 0xb8b8c0, description: '拥有壮观维罗纳断崖', mass: '6.59×10¹⁹ kg', gravity: '0.079 m/s²', temp: '-187°C', type: '冰卫星', parent: 'Uranus' },
	  { name: 'Ariel', nameCn: '天卫一', radiusKm: 579, parentDistKm: 190900, orbitalPeriodDays: 2.52, color: 0xc8c8d0, description: '天王星最亮的卫星', mass: '1.29×10²¹ kg', gravity: '0.25 m/s²', temp: '-213°C', type: '冰卫星', parent: 'Uranus' },
	  { name: 'Umbriel', nameCn: '天卫二', radiusKm: 585, parentDistKm: 266000, orbitalPeriodDays: 4.14, color: 0x7a7a80, description: '天王星最暗的卫星', mass: '1.22×10²¹ kg', gravity: '0.23 m/s²', temp: '-213°C', type: '冰卫星', parent: 'Uranus' },
	  { name: 'Titania', nameCn: '天卫三', radiusKm: 789, parentDistKm: 436300, orbitalPeriodDays: 8.71, color: 0xb0b0b8, description: '天王星最大卫星', mass: '3.40×10²¹ kg', gravity: '0.37 m/s²', temp: '-203°C', type: '冰卫星', parent: 'Uranus' },
	  { name: 'Oberon', nameCn: '天卫四', radiusKm: 761, parentDistKm: 583500, orbitalPeriodDays: 13.46, color: 0xa0a0a8, description: '天王星外层主要卫星', mass: '2.88×10²¹ kg', gravity: '0.35 m/s²', temp: '-198°C', type: '冰卫星', parent: 'Uranus' },
	  { name: 'Puck', nameCn: '天卫十五', radiusKm: 81, parentDistKm: 86000, orbitalPeriodDays: 0.76, color: 0x9a9a9a, description: '天王星最大内层卫星', mass: '2.9×10¹⁸ kg', gravity: '0.05 m/s²', temp: '-209°C', type: '内环卫星', parent: 'Uranus' },
	  { name: 'Portia', nameCn: '天卫十二', radiusKm: 68, parentDistKm: 66090, orbitalPeriodDays: 0.51, color: 0xa8a0a0, description: '天王星内侧主要小卫星', mass: '1.7×10¹⁸ kg', gravity: '0.04 m/s²', temp: '-213°C', type: '内环卫星', parent: 'Uranus' },
	  { name: 'Juliet', nameCn: '天卫十一', radiusKm: 47, parentDistKm: 64350, orbitalPeriodDays: 0.49, color: 0xb0a8a0, description: '天王星内侧小卫星', mass: '5.6×10¹⁷ kg', gravity: '0.03 m/s²', temp: '-214°C', type: '内环卫星', parent: 'Uranus' },
	  { name: 'Cressida', nameCn: '天卫九', radiusKm: 41, parentDistKm: 61780, orbitalPeriodDays: 0.46, color: 0xb8b0a8, description: '天王星内侧小卫星', mass: '3.4×10¹⁷ kg', gravity: '0.03 m/s²', temp: '-215°C', type: '内环卫星', parent: 'Uranus' },
	  { name: 'Desdemona', nameCn: '天卫十', radiusKm: 32, parentDistKm: 62680, orbitalPeriodDays: 0.47, color: 0xb8b8b0, description: '天王星内侧小卫星', mass: '1.8×10¹⁷ kg', gravity: '0.02 m/s²', temp: '-214°C', type: '内环卫星', parent: 'Uranus' },
	  { name: 'Rosalind', nameCn: '天卫十三', radiusKm: 36, parentDistKm: 69940, orbitalPeriodDays: 0.56, color: 0xa0a0a8, description: '天王星内侧小卫星', mass: '2.5×10¹⁷ kg', gravity: '0.03 m/s²', temp: '-212°C', type: '内环卫星', parent: 'Uranus' },
	  { name: 'Belinda', nameCn: '天卫十四', radiusKm: 40, parentDistKm: 75260, orbitalPeriodDays: 0.62, color: 0xa8a8a0, description: '天王星内侧小卫星', mass: '3.6×10¹⁷ kg', gravity: '0.03 m/s²', temp: '-211°C', type: '内环卫星', parent: 'Uranus' },
	  { name: 'Bianca', nameCn: '天卫八', radiusKm: 27, parentDistKm: 59340, orbitalPeriodDays: 0.43, color: 0xc8c0c0, description: '天王星内侧小卫星', mass: '9.3×10¹⁶ kg', gravity: '0.02 m/s²', temp: '-216°C', type: '内环卫星', parent: 'Uranus' },
	  { name: 'Ophelia', nameCn: '天卫七', radiusKm: 21, parentDistKm: 53760, orbitalPeriodDays: 0.38, color: 0xc0c0c8, description: 'ε环的牧羊犬卫星', mass: '5.4×10¹⁶ kg', gravity: '0.02 m/s²', temp: '-218°C', type: '内环卫星', parent: 'Uranus' },
	  { name: 'Cordelia', nameCn: '天卫六', radiusKm: 20, parentDistKm: 49750, orbitalPeriodDays: 0.34, color: 0xc8c8c8, description: '天王星光环的牧羊犬卫星', mass: '4.5×10¹⁶ kg', gravity: '0.02 m/s²', temp: '-220°C', type: '内环卫星', parent: 'Uranus' },
	  { name: 'Caliban', nameCn: '天卫十六', radiusKm: 49, parentDistKm: 7231000, orbitalPeriodDays: 580, color: 0x6a6a60, description: '第一个发现的不规则卫星', mass: '2.5×10¹⁷ kg', gravity: '0.03 m/s²', temp: '-220°C', type: '不规则卫星', parent: 'Uranus' },
	  { name: 'Sycorax', nameCn: '天卫十七', radiusKm: 75, parentDistKm: 12179000, orbitalPeriodDays: 1286, color: 0x5a5a50, description: '最大不规则卫星', mass: '2.3×10¹⁸ kg', gravity: '0.05 m/s²', temp: '-228°C', type: '不规则卫星', parent: 'Uranus' },
	  { name: 'Prospero', nameCn: '天卫十八', radiusKm: 25, parentDistKm: 16256000, orbitalPeriodDays: 1950, color: 0x7a7060, description: '不规则卫星', mass: '8.5×10¹⁶ kg', gravity: '0.02 m/s²', temp: '-230°C', type: '不规则卫星', parent: 'Uranus' },
	  { name: 'Setebos', nameCn: '天卫十九', radiusKm: 18, parentDistKm: 17418000, orbitalPeriodDays: 2200, color: 0x6a6a5a, description: '最远不规则卫星之一', mass: '2.1×10¹⁶ kg', gravity: '0.02 m/s²', temp: '-232°C', type: '不规则卫星', parent: 'Uranus' },
	  { name: 'Stephano', nameCn: '天卫二十', radiusKm: 10, parentDistKm: 8004000, orbitalPeriodDays: 677, color: 0x8a8070, description: '不规则卫星', mass: '6.0×10¹⁵ kg', gravity: '0.01 m/s²', temp: '-222°C', type: '不规则卫星', parent: 'Uranus' },
	  { name: 'Trinculo', nameCn: '天卫二十一', radiusKm: 5, parentDistKm: 8505000, orbitalPeriodDays: 759, color: 0x7a7a6a, description: '不规则卫星', mass: '3.9×10¹⁴ kg', gravity: '0.005 m/s²', temp: '-224°C', type: '不规则卫星', parent: 'Uranus' },
	  { name: 'Francisco', nameCn: '天卫二十二', radiusKm: 6, parentDistKm: 4276000, orbitalPeriodDays: 266, color: 0x8a8a7a, description: '最外层天王星卫星之一', mass: '7.2×10¹⁵ kg', gravity: '0.005 m/s²', temp: '-220°C', type: '不规则卫星', parent: 'Uranus' },
	  { name: 'Margaret', nameCn: '天卫二十三', radiusKm: 5, parentDistKm: 5834000, orbitalPeriodDays: 426, color: 0x9a9080, description: '唯一顺行不规则卫星', mass: '5.4×10¹⁵ kg', gravity: '0.005 m/s²', temp: '-218°C', type: '不规则卫星', parent: 'Uranus' },
	  { name: 'Ferdinand', nameCn: '天卫二十四', radiusKm: 6, parentDistKm: 20900000, orbitalPeriodDays: 2820, color: 0x6a6a5a, description: '最远天王星卫星', mass: '5.4×10¹⁵ kg', gravity: '0.005 m/s²', temp: '-235°C', type: '不规则卫星', parent: 'Uranus' },
	  
	  // ====== 海王星卫星 (主要) ======
	  { name: 'Triton', nameCn: '海卫一', radiusKm: 1353, parentDistKm: 354759, orbitalPeriodDays: 5.88, color: 0xc8c0d0, description: '逆行轨道，可能是被俘获的柯伊伯带天体', mass: '2.14×10²² kg', gravity: '0.78 m/s²', temp: '-235°C', type: '冰卫星', parent: 'Neptune' },
	  { name: 'Nereid', nameCn: '海卫二', radiusKm: 170, parentDistKm: 5513400, orbitalPeriodDays: 360.14, color: 0xb8b0a0, description: '高偏心率轨道的不规则卫星', mass: '3.1×10¹⁹ kg', gravity: '0.08 m/s²', temp: '-220°C', type: '不规则卫星', parent: 'Neptune' },
	  { name: 'Naiad', nameCn: '海卫三', radiusKm: 29, parentDistKm: 48227, orbitalPeriodDays: 0.29, color: 0xb0b0b8, description: '最靠近海王星的内层卫星', mass: '1.9×10¹⁷ kg', gravity: '0.02 m/s²', temp: '-238°C', type: '内环卫星', parent: 'Neptune' },
	  { name: 'Thalassa', nameCn: '海卫四', radiusKm: 40, parentDistKm: 50074, orbitalPeriodDays: 0.31, color: 0xa8a8b0, description: '海王星内层卫星', mass: '3.5×10¹⁷ kg', gravity: '0.03 m/s²', temp: '-237°C', type: '内环卫星', parent: 'Neptune' },
	  { name: 'Despina', nameCn: '海卫五', radiusKm: 75, parentDistKm: 52526, orbitalPeriodDays: 0.33, color: 0xa0a0a8, description: '海王星内层卫星', mass: '2.1×10¹⁸ kg', gravity: '0.05 m/s²', temp: '-237°C', type: '内环卫星', parent: 'Neptune' },
	  { name: 'Galatea', nameCn: '海卫六', radiusKm: 88, parentDistKm: 61953, orbitalPeriodDays: 0.43, color: 0x9898a0, description: '可能维持亚当斯环结构', mass: '3.7×10¹⁸ kg', gravity: '0.06 m/s²', temp: '-236°C', type: '内环卫星', parent: 'Neptune' },
	  { name: 'Larissa', nameCn: '海卫七', radiusKm: 97, parentDistKm: 73548, orbitalPeriodDays: 0.55, color: 0x909098, description: '海王星内层较大卫星', mass: '4.2×10¹⁸ kg', gravity: '0.06 m/s²', temp: '-235°C', type: '内环卫星', parent: 'Neptune' },
	  { name: 'Proteus', nameCn: '海卫八', radiusKm: 210, parentDistKm: 117646, orbitalPeriodDays: 1.12, color: 0x808088, description: '海王星最大内层卫星，形状不规则', mass: '5.0×10¹⁹ kg', gravity: '0.11 m/s²', temp: '-233°C', type: '内环卫星', parent: 'Neptune' },
	  { name: 'Halimede', nameCn: '海卫九', radiusKm: 30, parentDistKm: 15728000, orbitalPeriodDays: 1874, color: 0x7a7060, description: '不规则卫星', mass: '9.0×10¹⁶ kg', gravity: '0.02 m/s²', temp: '-235°C', type: '不规则卫星', parent: 'Neptune' },
	  { name: 'Sao', nameCn: '海卫十一', radiusKm: 20, parentDistKm: 22580000, orbitalPeriodDays: 2914, color: 0x8a8070, description: '不规则卫星', mass: '5.0×10¹⁶ kg', gravity: '0.02 m/s²', temp: '-237°C', type: '不规则卫星', parent: 'Neptune' },
	  { name: 'Laomedeia', nameCn: '海卫十二', radiusKm: 20, parentDistKm: 32580000, orbitalPeriodDays: 3168, color: 0x8a7a6a, description: '不规则卫星', mass: '5.0×10¹⁶ kg', gravity: '0.02 m/s²', temp: '-238°C', type: '不规则卫星', parent: 'Neptune' },
	  { name: 'Psamathe', nameCn: '海卫十', radiusKm: 18, parentDistKm: 46695000, orbitalPeriodDays: 9113, color: 0x7a7a6a, description: '远距不规则卫星', mass: '4.0×10¹⁶ kg', gravity: '0.02 m/s²', temp: '-240°C', type: '不规则卫星', parent: 'Neptune' },
	  { name: 'Neso', nameCn: '海卫十三', radiusKm: 28, parentDistKm: 49510000, orbitalPeriodDays: 9880, color: 0x6a6a5a, description: '最远海王星卫星', mass: '2.0×10¹⁷ kg', gravity: '0.02 m/s²', temp: '-241°C', type: '不规则卫星', parent: 'Neptune' },
	  
	  // ====== 冥王星卫星 ======
	  { name: 'Charon', nameCn: '冥卫一', radiusKm: 606, parentDistKm: 19591, orbitalPeriodDays: 6.39, color: 0x888080, description: '冥王星最大卫星，双星系统', mass: '1.52×10²¹ kg', gravity: '0.29 m/s²', temp: '-220°C', type: '冰卫星', parent: 'Pluto' },
	  { name: 'Nix', nameCn: '冥卫二', radiusKm: 23, parentDistKm: 48694, orbitalPeriodDays: 24.85, color: 0xa0a0a0, description: '冥王星外层小卫星', mass: '4.5×10¹⁶ kg', gravity: '0.02 m/s²', temp: '-230°C', type: '外层卫星', parent: 'Pluto' },
	  { name: 'Hydra', nameCn: '冥卫三', radiusKm: 25, parentDistKm: 64738, orbitalPeriodDays: 38.20, color: 0x989898, description: '冥王星最外层卫星', mass: '4.8×10¹⁶ kg', gravity: '0.02 m/s²', temp: '-232°C', type: '外层卫星', parent: 'Pluto' },
	  { name: 'Kerberos', nameCn: '冥卫四', radiusKm: 7, parentDistKm: 57783, orbitalPeriodDays: 32.17, color: 0x808080, description: '冥王星第四颗卫星', mass: '1.6×10¹⁵ kg', gravity: '0.01 m/s²', temp: '-228°C', type: '外层卫星', parent: 'Pluto' },
	  { name: 'Styx', nameCn: '冥卫五', radiusKm: 5, parentDistKm: 42656, orbitalPeriodDays: 20.16, color: 0x909090, description: '冥王星最小卫星', mass: '7.5×10¹⁴ kg', gravity: '0.005 m/s²', temp: '-225°C', type: '外层卫星', parent: 'Pluto' },
	  
	  // ====== 矮行星卫星 ======
	  { name: 'Dysnomia', nameCn: '阋卫一', radiusKm: 342, parentDistKm: 37350, orbitalPeriodDays: 15.79, color: 0x8a8070, description: '阋神星唯一卫星', mass: '8.2×10¹⁹ kg', gravity: '0.16 m/s²', temp: '-240°C', type: '外层卫星', parent: 'Eris' },
	  { name: 'Hiʻiaka', nameCn: '妊卫一', radiusKm: 155, parentDistKm: 49878, orbitalPeriodDays: 49.12, color: 0xb8b0a0, description: '妊神星最大卫星', mass: '2.0×10¹⁹ kg', gravity: '0.08 m/s²', temp: '-220°C', type: '外层卫星', parent: 'Haumea' },
	  { name: 'Namaka', nameCn: '妊卫二', radiusKm: 85, parentDistKm: 25657, orbitalPeriodDays: 18.78, color: 0xa8a090, description: '妊神星内层卫星', mass: '2.0×10¹⁸ kg', gravity: '0.05 m/s²', temp: '-218°C', type: '外层卫星', parent: 'Haumea' },
	  { name: 'MK2', nameCn: '鸟卫一', radiusKm: 80, parentDistKm: 21100, orbitalPeriodDays: 12.4, color: 0x7a7060, description: '鸟神星唯一卫星', mass: '1.0×10¹⁸ kg', gravity: '0.04 m/s²', temp: '-235°C', type: '外层卫星', parent: 'Makemake' },
	];

// ====== 彗星数据(扩展) ======
const COMETS_DATA = [
  { name: '哈雷彗星', a_au: 17.834, e: 0.967, inc: 162.26, color: 0x88ccff },
  { name: '恩克彗星', a_au: 2.215, e: 0.848, inc: 11.78, color: 0xaaddff },
  { name: '海尔-波普彗星', a_au: 186, e: 0.995, inc: 89.43, color: 0x99ccee },
  { name: '百武彗星', a_au: 1000, e: 0.9998, inc: 124.92, color: 0xbbddee },
  { name: '洛夫乔伊彗星', a_au: 617, e: 0.997, inc: 78.87, color: 0x77bbdd },
  { name: '麦克诺特彗星', a_au: 4800, e: 0.9999, inc: 77.83, color: 0xddddff },
];

const SUN_DATA = {
  radiusKm: 696340,
  color: 0xffcc00,
  emissive: 0xffaa00,
  description: '太阳系的中心恒星，提供光和热',
  mass: '1.989×10³⁰ kg',
  gravity: '274 m/s²',
  temp: '5,500°C (表面)',
  type: 'G型主序星',
};

const MOON_DATA = {
  radiusKm: 1737,
  distKm: 384400,
  orbitalPeriodDays: 27.32,
  description: '地球唯一的天然卫星',
  mass: '7.342×10²² kg',
  gravity: '1.62 m/s²',
  temp: '-233~123°C',
};

// ====== 场景比例计算 ======
// 太阳系模式：以地球为基准保持真实比例
const EARTH_RADIUS_KM = 6371;
const EARTH_SCENE_RADIUS = 0.8; // 地球场景半径
const MAX_SCALE = 3; // 最大缩放因子（木星约地球11倍，限制为3倍使太阳更突出）

function planetSceneRadius(radiusKm: number): number {
  // 以地球为基准，保持真实比例关系
  // 真实比例：太阳(696340)是地球(6371)的109倍，木星(69911)是地球的11倍
  // 水星(2440)是地球的0.38倍，金星(6052)是地球的0.95倍
  const scale = radiusKm / EARTH_RADIUS_KM;
  const sceneRadius = EARTH_SCENE_RADIUS * scale;
  return Math.min(sceneRadius, EARTH_SCENE_RADIUS * MAX_SCALE);
}
// 太阳场景半径：太阳是地球的109倍，设为突出显示的大小
const SUN_SCENE_RADIUS = 8;
function orbitSceneDist(distAu: number): number {
  return 10 + 28 * Math.sqrt(distAu);
}
// 卫星轨道半径：使用宇宙数据库真实距离数据（对数缩放保持相对比例）
function moonOrbitSceneRadius(parentRadius: number, parentDistKm: number): number {
  const logDist = Math.log10(parentDistKm);
  return parentRadius + 2 + logDist * 0.3;
}

// 地球模式比例
const EARTH_RADIUS = 5;
const MOON_RADIUS = EARTH_RADIUS * (MOON_DATA.radiusKm / 6371);
const MOON_ORBIT_RADIUS = EARTH_RADIUS * (MOON_DATA.distKm / 6371);

// 工具函数
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
}
function vector3ToLatLng(v: THREE.Vector3): { lat: number; lng: number } {
  const r = v.length();
  const lat = 90 - Math.acos(v.y / r) * (180 / Math.PI);
  const lng = -(Math.atan2(v.z, -v.x) * (180 / Math.PI)) - 180;
  return { lat, lng: lng < -180 ? lng + 360 : lng > 180 ? lng - 360 : lng };
}
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ====== 经纬度网格(Graticule)生成器 ======
function createGraticule(radius: number, latStep: number, lngStep: number, color: number, opacity: number): THREE.Group {
  const group = new THREE.Group();
  const r = radius * 1.002; // 略高于球面避免z-fighting
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });

  // 纬线
  for (let lat = -90 + latStep; lat < 90; lat += latStep) {
    const pts: THREE.Vector3[] = [];
    const phi = (90 - lat) * (Math.PI / 180);
    for (let i = 0; i <= 360; i += 2) {
      const theta = (i + 180) * (Math.PI / 180);
      pts.push(new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)));
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }

  // 经线
  for (let lng = -180; lng < 180; lng += lngStep) {
    const pts: THREE.Vector3[] = [];
    const theta = (lng + 180) * (Math.PI / 180);
    for (let lat = -90; lat <= 90; lat += 2) {
      const phi = (90 - lat) * (Math.PI / 180);
      pts.push(new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)));
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }

  return group;
}

// 坐标标注（经纬度文字标签）
function createCoordLabels(radius: number, latStep: number, lngStep: number, color: string): THREE.Group {
  const group = new THREE.Group();
  const r = radius * 1.006;

  // 纬度标注（赤道侧边）
  for (let lat = -60; lat <= 60; lat += latStep) {
    if (lat === 0) continue; // 赤道单独标注
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (90 + 180) * (Math.PI / 180); // 右侧
    const x = -r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);
    const sprite = createTextSprite(`${lat}°`, color, 16);
    sprite.position.set(x, y, z);
    sprite.scale.set(1.2, 0.2, 1);
    group.add(sprite);
  }

  // 经度标注（赤道上）
  for (let lng = -180; lng < 180; lng += lngStep) {
    if (lng === 0) continue;
    const phi = (90 - 0) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);
    const sprite = createTextSprite(`${lng}°`, color, 16);
    sprite.position.set(x, y, z);
    sprite.scale.set(1.2, 0.2, 1);
    group.add(sprite);
  }

  // 赤道标注
  const eqPhi = (90 - 0) * (Math.PI / 180);
  const eqTheta = (0 + 180) * (Math.PI / 180);
  const eqSprite = createTextSprite('赤道 0°', color, 18);
  eqSprite.position.set(-r * Math.sin(eqPhi) * Math.cos(eqTheta), r * Math.cos(eqPhi), r * Math.sin(eqPhi) * Math.sin(eqTheta));
  eqSprite.scale.set(1.5, 0.25, 1);
  group.add(eqSprite);

  // 本初子午线标注
  const pmPhi = (90 - 5) * (Math.PI / 180);
  const pmTheta = (0 + 180) * (Math.PI / 180);
  const pmSprite = createTextSprite('0°经线', color, 18);
  pmSprite.position.set(-r * Math.sin(pmPhi) * Math.cos(pmTheta), r * Math.cos(pmPhi), r * Math.sin(pmPhi) * Math.sin(pmTheta));
  pmSprite.scale.set(1.5, 0.25, 1);
  group.add(pmSprite);

  return group;
}

// ====== 瓦片地图叠加层（球面瓦片渲染） ======
function createTileOverlaySphere(radius: number, tileUrl: string): THREE.Mesh {
  // 在纹理球体上方套一个略大的球，用Canvas动态绘制瓦片
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.clearRect(0, 0, 2048, 1024);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const geom = new THREE.SphereGeometry(radius * 1.004, 64, 64);
  const mesh = new THREE.Mesh(geom, mat);

  // 异步加载瓦片到Canvas
  const loadImage = (url: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Tile load failed: ${url}`));
    img.src = url;
  });

  // 加载2级瓦片（4x2=8张瓦片覆盖全球），瓦片编号对应等距柱状投影
  const zoom = 2;
  const xCount = Math.pow(2, zoom);
  const yCount = Math.pow(2, zoom);
  let loadedCount = 0;
  let failedCount = 0;

  for (let x = 0; x < xCount; x++) {
    for (let y = 0; y < yCount; y++) {
      const url = tileUrl.replace('{z}', String(zoom)).replace('{x}', String(x)).replace('{y}', String(y));
      loadImage(url).then(img => {
        const tw = 2048 / xCount;
        const th = 1024 / yCount;
        try {
          ctx.drawImage(img, x * tw, y * th, tw, th);
          tex.needsUpdate = true;
        } catch {
          // CORS tainted canvas — skip
        }
        loadedCount++;
      }).catch(() => {
        failedCount++;
        // 如果瓦片加载失败，用Canvas绘制网格作为替代
        const tw = 2048 / xCount;
        const th = 1024 / yCount;
        ctx.strokeStyle = 'rgba(6,182,212,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x * tw, y * th, tw, th);
        ctx.fillStyle = 'rgba(6,182,212,0.1)';
        ctx.font = '20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${zoom}/${x}/${y}`, x * tw + tw / 2, y * th + th / 2);
        tex.needsUpdate = true;
      });
    }
  }

  return mesh;
}

// ====== 纹理路径映射 ======
const TEXTURE_MAP: Record<string, string> = {
  Sun: '/textures/sun.jpg',
  Mercury: '/textures/mercury.jpg',
  Venus: '/textures/venus.jpg',
  Earth: '/textures/earth.jpg',
  Mars: '/textures/mars.jpg',
  Jupiter: '/textures/jupiter.jpg',
  Saturn: '/textures/saturn.jpg',
  Uranus: '/textures/uranus.jpg',
  Neptune: '/textures/neptune.jpg',
  Moon: '/textures/moon.jpg',
};

// ====== 纹理生成（降级用） ======
function createProceduralEarthTexture(): THREE.Texture {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#0a1628'; ctx.fillRect(0, 0, 1024, 512);
  ctx.fillStyle = '#1a3a4a'; ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 1;
  const lx = (l: number) => ((l + 180) / 360) * 1024;
  const ly = (l: number) => ((90 - l) / 180) * 512;
  [[73,18,62,35],[65,5,25,25],[35,20,30,20],[-10,35,50,25],[-20,-35,55,65],[-170,15,120,55],[-80,-55,50,65],[110,-40,45,30]].forEach(([lng,lat,w,h]) => {
    ctx.fillRect(lx(lng), ly(lat+h), (w/360)*1024, (h/180)*512);
    ctx.strokeRect(lx(lng), ly(lat+h), (w/360)*1024, (h/180)*512);
  });
  ctx.strokeStyle = 'rgba(6,182,212,0.2)'; ctx.lineWidth = 0.5;
  for (let i=0;i<=12;i++){const x=(i/12)*1024;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,512);ctx.stroke();}
  for (let i=0;i<=6;i++){const y=(i/6)*512;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1024,y);ctx.stroke();}
  const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
}

function createMoonTexture(): THREE.Texture {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#8a8a8a'; ctx.fillRect(0, 0, 1024, 512);
  [[40,30,180,100],[260,60,120,80],[300,180,100,70],[400,100,80,60],[500,60,90,70],[350,250,70,50],[450,220,60,50],[200,150,80,60]].forEach(([x,y,w,h]) => {
    ctx.fillStyle = '#5a5a5a'; ctx.beginPath(); ctx.ellipse(x,y,w/2,h/2,0,0,Math.PI*2); ctx.fill();
  });
  const rng = (s: number) => { let v=s; return ()=>{v=(v*16807)%2147483647;return v/2147483647;}; };
  const r = rng(42);
  for (let i=0;i<200;i++){const x=r()*1024,y=r()*512,rad=r()*12+2;
    ctx.strokeStyle=`rgba(180,180,180,${r()*0.4+0.2})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle=`rgba(70,70,70,${r()*0.3+0.1})`;ctx.beginPath();ctx.arc(x,y,rad*0.8,0,Math.PI*2);ctx.fill();
  }
  [[150,200,30],[380,80,25],[500,300,20],[700,150,35],[850,250,22],[120,400,18],[600,400,28],[900,100,15]].forEach(([x,y,rad]) => {
    ctx.strokeStyle='rgba(200,200,200,0.5)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='rgba(60,60,60,0.3)';ctx.beginPath();ctx.arc(x,y,rad*0.7,0,Math.PI*2);ctx.fill();
  });
  const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
}

function createSunTexture(): THREE.Texture {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createLinearGradient(0,0,0,512);
  grad.addColorStop(0,'#ffee88'); grad.addColorStop(0.3,'#ffcc44'); grad.addColorStop(0.5,'#ff9900'); grad.addColorStop(0.7,'#ffcc44'); grad.addColorStop(1,'#ffee88');
  ctx.fillStyle = grad; ctx.fillRect(0,0,1024,512);
  const rng = (s: number) => { let v=s; return ()=>{v=(v*16807)%2147483647;return v/2147483647;}; };
  const r = rng(7);
  for (let i=0;i<300;i++){const x=r()*1024,y=r()*512,rad=r()*15+3;
    ctx.fillStyle=`rgba(255,200,50,${r()*0.3})`;ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.fill();
  }
  // Sunspots
  for (let i=0;i<15;i++){const x=r()*1024,y=r()*512,rad=r()*8+2;
    ctx.fillStyle='rgba(100,50,0,0.4)';ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.fill();
  }
  const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
}

function createPlanetTexture(color: number, features: {type:string;params:number[]}[]): THREE.Texture {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const ctx = c.getContext('2d')!;
  const col = new THREE.Color(color);
  const baseR = Math.floor(col.r*255), baseG = Math.floor(col.g*255), baseB = Math.floor(col.b*255);
  // Base
  const grad = ctx.createLinearGradient(0,0,0,256);
  grad.addColorStop(0, `rgb(${baseR+20},${baseG+20},${baseB+20})`);
  grad.addColorStop(0.5, `rgb(${baseR},${baseG},${baseB})`);
  grad.addColorStop(1, `rgb(${Math.max(0,baseR-30)},${Math.max(0,baseG-30)},${Math.max(0,baseB-30)})`);
  ctx.fillStyle = grad; ctx.fillRect(0,0,512,256);
  // Bands
  for (let i=0;i<8;i++){
    const y = 20+i*30;
    ctx.fillStyle = `rgba(${baseR>128?baseR-40:baseR+40},${baseG>128?baseG-20:baseG+20},${baseB},${0.15+Math.random()*0.2})`;
    ctx.fillRect(0,y,512,8+Math.random()*15);
  }
  // Features
  features.forEach(f => {
    if (f.type === 'spot') {
      ctx.fillStyle = `rgba(${Math.max(0,baseR-60)},${Math.max(0,baseG-30)},${Math.max(0,baseB-20)},0.5)`;
      ctx.beginPath(); ctx.ellipse(f.params[0],f.params[1],f.params[2],f.params[3],0,0,Math.PI*2); ctx.fill();
    }
  });
  const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
}

function createTextSprite(text: string, color: string, fontSize: number): THREE.Sprite {
  const c = document.createElement('canvas'); c.width = 512; c.height = 64;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = color; ctx.font = `bold ${fontSize}px sans-serif`; ctx.textAlign = 'center';
  ctx.fillText(text, 256, 44);
  const t = new THREE.CanvasTexture(c); t.needsUpdate = true;
  const mat = new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false });
  const s = new THREE.Sprite(mat);
  return s;
}

// ====== 主组件 ======
export default function GlobeMap({ onMapClick, onFeatureSelect, features, layers, activeTool, flyToPosition, skygisOverlays = [], skygisSelectedId, onLogout }: GlobeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const cloudsRef = useRef<THREE.Mesh | null>(null);
  const earthGroupRef = useRef<THREE.Group | null>(null);
  const solarGroupRef = useRef<THREE.Group | null>(null);
  const universeGroupRef = useRef<THREE.Group | null>(null);
  const planetMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const planetOrbitGroupsRef = useRef<Map<string, THREE.Group>>(new Map()); // 保存行星轨道组引用
  const planetLabelsRef = useRef<Map<string, THREE.Sprite>>(new Map());
  const sunMeshRef = useRef<THREE.Mesh | null>(null);
  const moonMeshRef = useRef<THREE.Mesh | null>(null);
  const moonOrbitRef = useRef<THREE.Group | null>(null);
  const satelliteOrbitsRef = useRef<{ orbit: THREE.Group; parentMesh: THREE.Mesh; pivot: THREE.Group }[]>([]); // 所有卫星轨道组
  const markersRef = useRef<THREE.Group | null>(null);
  // 探针相关ref
  const probeTargetRef = useRef<THREE.Vector3 | null>(null);
  const probeMeshRef = useRef<THREE.Mesh | null>(null);
  const probeBrainRef = useRef<string | null>(null);
  const probeDecisionsRef = useRef<number>(0);
  const lastProbeDecisionRef = useRef<number>(0);  // 上次决策时间
  const consciousnessDepthRef = useRef<number>(5);  // 意识深度
  const consciousnessLevelRef = useRef<number>(1); // 意识等级
  const animFrameRef = useRef(0);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const radiusCircleRef = useRef<THREE.Line | null>(null);
  const searchCenterRef = useRef<{ lat: number; lng: number } | null>(null);
  const satGroupRef = useRef<THREE.Group | null>(null);
  const timeRef = useRef(0);

  // ====== 星际探针能力系统 ======
  const probeAbilitiesRef = useRef<{
    warpJump?: boolean;      // 跃迁（80%+）
    gravitySlingshot?: boolean; // 引力弹弓（60%+）
    deepScan?: boolean;      // 深度扫描（40%+）
    selfHeal?: boolean;      // 自我修复（20%+）
    totalExplored?: number;  // 总探索次数
    farthestTarget?: string; // 最远探索目标
  } | null>(null);
  
  // ====== 星际探针(AI智能体) 3D对象 ======
  const probeTrailRef = useRef<THREE.Line | null>(null);
  const probeTrailPointsRef = useRef<THREE.Vector3[]>([]);
  const lastProbeTaskFetch = useRef<number>(0);
  const [probePosition, setProbePosition] = useState<{ x: number; y: number; z: number; bodyName: string } | null>(null);
  const [probeScreenPos, setProbeScreenPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [probeDetection, setProbeDetection] = useState<{
    bodyName: string;
    bodyNameCn: string;
    distance: string;
    materials: { name: string; formula: string; percentage: number; category: string }[];
    environment: { temp: string; gravity: string; radiation: string };
    detectedAt: number;
  } | null>(null);
  const probeDetectionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);


  const [mouseCoordinate, setMouseCoordinate] = useState<{ lat: number; lng: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showRadiusSearch, setShowRadiusSearch] = useState(false);
  const [searchRadius, setSearchRadius] = useState(50);
  const [searchResults, setSearchResults] = useState<(GisFeature & { distance: number })[]>([]);
  const [autoRotate, setAutoRotate] = useState(true);
  const [scaleInfo, setScaleInfo] = useState('');
  const [viewMode, setViewMode] = useState<'earth' | 'moon' | 'solar' | 'universe'>('earth');
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);

  // ====== SkyGIS kkk 跨模块互联 ======
  const kkk = useSkyGISHub();

  // kkk信号→面板打开 同步（mock功能）
  useEffect(() => {
    if (!kkk.lastSignal) return;
  }, [kkk.lastSignal]);
  const [showInfo, setShowInfo] = useState(false);
  const [showGravity, setShowGravity] = useState(false);
  const [showSolarPanel, setShowSolarPanel] = useState(false);
  const [showTimeCtrl, setShowTimeCtrl] = useState(false);
  const [showGravityField, setShowGravityField] = useState(false);
  const [showGeoEvolution, setShowGeoEvolution] = useState(false);
  const [showNavPlanner, setShowNavPlanner] = useState(false);
  const [showEvoHistory, setShowEvoHistory] = useState(false);
  const [showRemoteSensing, setShowRemoteSensing] = useState(false);
  const [showAsteroidDiscovery, setShowAsteroidDiscovery] = useState(false);
  const [showDigitalTwin, setShowDigitalTwin] = useState(false);
  const [showSpatialAgent, setShowSpatialAgent] = useState(false);
  const [showNativeAi, setShowNativeAi] = useState(false);
  const [showEngineering, setShowEngineering] = useState(false);
  const [showSmartCommand, setShowSmartCommand] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [showCelestialLayers, setShowCelestialLayers] = useState(false);
  const [showWanderAgent, setShowWanderAgent] = useState(false);
  const [showFuncMenu, setShowFuncMenu] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUniverseMaterials, setShowUniverseMaterials] = useState(false);
  const [showInvisiblePhenomena, setShowInvisiblePhenomena] = useState(false);
  const [showSubstanceMode, setShowSubstanceMode] = useState(false);
  const substanceGroupsRef = useRef<Map<string, THREE.Group>>(new Map());
  const [simTime, setSimTime] = useState(Date.now());
  const [simSpeed, setSimSpeed] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showTiles, setShowTiles] = useState(true);
  const [hoverCoord, setHoverCoord] = useState<{lat: number; lng: number; body: string} | null>(null);

  // 智能体进化通知（默认不显示在覆盖层，改为控制面板显示）
  const [agentNotifications, setAgentNotifications] = useState<Array<{id: string; type: string; title: string; summary: string; evolved: boolean; timestamp: number}>>([]);
  const [showOverlayNotifications, setShowOverlayNotifications] = useState(false); // 默认关闭覆盖层通知
  const [agentEngineState, setAgentEngineState] = useState<{isRunning: boolean; agentLevel: number; discoveries: number; collectedSubstances: number}>({isRunning: false, agentLevel: 0, discoveries: 0, collectedSubstances: 0});
  const [animDebug, setAnimDebug] = useState<{running: boolean; frames: number; orbitGroups: number; meshes: number; dt: number}>({running: false, frames: 0, orbitGroups: 0, meshes: 0, dt: 0});
  
  // 发送通知到 API（供控制面板使用）
  const sendNotificationToAPI = async (notification: any) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', notification })
      });
    } catch {}
  };
  
  useEffect(() => {
    const handleDiscovery = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const notification = { id: `notif-${Date.now()}`, type: detail.type, title: detail.title, summary: detail.summary, evolved: detail.evolved, timestamp: Date.now() };
      // 发送到 API 供控制面板显示
      sendNotificationToAPI(notification);
      // 仅当开启覆盖层通知时显示
      if (showOverlayNotifications) {
        setAgentNotifications(prev => [notification, ...prev].slice(0, 5));
        setTimeout(() => {
          setAgentNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 6000);
      }
    };
    const handleEvolution = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const notification = { id: `evo-${Date.now()}`, type: 'evolution', title: `智能体进化: ${detail.title}`, summary: `Lv.${detail.level} | 发现${detail.discoveries} | 物质${detail.substances}`, evolved: true, timestamp: Date.now() };
      sendNotificationToAPI(notification);
      if (showOverlayNotifications) {
        setAgentNotifications(prev => [notification, ...prev].slice(0, 5));
        setTimeout(() => {
          setAgentNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 8000);
      }
    };
    // 监听智能体旅行事件 — 飞向目标星系
    const handleAgentTravel = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.objectId) return;
      // 找到目标天体在宇宙中的位置
      const targetObj = ALL_COSMIC_OBJECTS.find(o => o.id === detail.objectId || o.name === detail.objectName);
      if (targetObj) {
        // 切换到宇宙视图
        if (viewMode !== 'universe') setViewMode('universe');
        // 计算目标3D位置 (分段对数缩放)
        const rawDist = typeof targetObj.distance === 'string' ? parseFloat(targetObj.distance) : targetObj.distance;
        const distVal = isNaN(rawDist) ? 50 : rawDist;
        let tx: number, ty: number, tz: number;
        if (targetObj.sceneX != null && targetObj.sceneY != null && targetObj.sceneZ != null) {
          tx = targetObj.sceneX; ty = targetObj.sceneY; tz = targetObj.sceneZ;
        } else if (distVal <= 0.01) {
          const d = 5 + distVal * 1000; tx = d * Math.cos(distVal * 10); ty = d * 0.05; tz = d * Math.sin(distVal * 10);
        } else if (distVal <= 100) {
          const d = 15 + Math.log10(distVal) * 15; tx = d * Math.cos(distVal); ty = d * 0.05; tz = d * Math.sin(distVal);
        } else {
          const d = 50 + Math.log10(distVal) * 30; tx = d * Math.cos(distVal * 0.1); ty = d * 0.1; tz = d * Math.sin(distVal * 0.1);
        }
        // 飞向目标
        if (controlsRef.current && cameraRef.current) {
          const cam = cameraRef.current;
          const ctrl = controlsRef.current;
          const startPos = cam.position.clone();
          const endPos = new THREE.Vector3(tx + 8, ty + 6, tz + 8);
          const startTarget = ctrl.target.clone();
          const endTarget = new THREE.Vector3(tx, ty, tz);
          let t = 0;
          const flyAnim = () => {
            t += 0.008;
            if (t >= 1) { t = 1; }
            const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            cam.position.lerpVectors(startPos, endPos, ease);
            ctrl.target.lerpVectors(startTarget, endTarget, ease);
            ctrl.update();
            if (t < 1) requestAnimationFrame(flyAnim);
          };
          flyAnim();
        }
      }
    };
    window.addEventListener('skygis:agent-discovery', handleDiscovery);
    window.addEventListener('skygis:agent-evolution', handleEvolution);
    window.addEventListener('skygis:agent-travel', handleAgentTravel);
    return () => {
      window.removeEventListener('skygis:agent-discovery', handleDiscovery);
      window.removeEventListener('skygis:agent-evolution', handleEvolution);
      window.removeEventListener('skygis:agent-travel', handleAgentTravel);
    };
  }, [viewMode]);

  // ====== 启动自主智能体引擎 — App加载后自动存在 ======
  useEffect(() => {
    const engine = startAgent(); // 智能体自动诞生
    // 同步引擎状态到UI（智能体心跳指示灯）
    const syncTimer = setInterval(() => {
      const state = engine.getState();
      setAgentEngineState({
        isRunning: state.isRunning,
        agentLevel: state.agentLevel,
        discoveries: state.discoveries.length,
        collectedSubstances: state.collectedSubstances.size,
      });
    }, 2000);
    return () => { clearInterval(syncTimer); };
  }, []);

  // 同步环境数据给智能体引擎
  useEffect(() => {
    const engine = getAgentEngine();
    if (kkk.focusedBody) engine.focusedBody = { name: kkk.focusedBody.name, nameCn: kkk.focusedBody.nameCn || '' };
    engine.currentView = viewMode;
  }, [kkk.focusedBody, viewMode]);

  // 同步探针检测数据给智能体引擎
  useEffect(() => {
    const engine = getAgentEngine();
    if (probeDetection) engine.probeDetection = probeDetection;
  }, [probeDetection]);

  // 不可见现象可见性控制
  useEffect(() => {
    const sg = solarGroupRef.current;
    if (!sg) return;
    sg.children.forEach(child => {
      if (child instanceof THREE.Group && ['magnetGroup', 'radiationGroup', 'cmeGroup', 'cosmicRayGroup'].includes(child.name)) {
        child.visible = showInvisiblePhenomena;
      }
      if (child instanceof THREE.Points && child.name === 'solarWind') {
        child.visible = showInvisiblePhenomena;
      }
    });
    // 宇宙视图中暗物质和CMB
    const ug = universeGroupRef.current;
    if (ug) {
      ug.children.forEach(child => {
        if (child instanceof THREE.Group && child.name === 'darkMatterGroup') {
          child.visible = showInvisiblePhenomena;
        }
        if (child instanceof THREE.Mesh && child.name === 'cmb') {
          child.visible = showInvisiblePhenomena;
        }
      });
    }
  }, [showInvisiblePhenomena]);

  // 物质模式可见性切换
  useEffect(() => {
    if (!substanceGroupsRef.current) return;
    substanceGroupsRef.current.forEach((group) => {
      group.visible = showSubstanceMode;
    });
  }, [showSubstanceMode]);

  // Graticule groups per body
  const earthGridRef = useRef<THREE.Group | null>(null);
  const earthLabelsRef = useRef<THREE.Group | null>(null);
  const earthTileRef = useRef<THREE.Mesh | null>(null);
  const moonGridRef = useRef<THREE.Group | null>(null);
  const planetGridsRef = useRef<Map<string, THREE.Group>>(new Map());
  const planetTilesRef = useRef<Map<string, THREE.Mesh>>(new Map());

  // ====== 初始化场景 ======
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const w = container.clientWidth, h = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020510);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.01, 10000);
    camera.position.set(0, 2, 18);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch (e) {
      setError(`3D渲染器初始化失败: ${e instanceof Error ? e.message : '未知错误'}`);
      setIsLoading(false);
      return;
    }
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // WebGL 检测
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    setError('WebGL 不可用，请使用支持 WebGL 的浏览器（如 Chrome、Firefox）');
    setIsLoading(false);
    return;
  }
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 2.5;
    controls.maxDistance = 4000;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.8;
    controls.target.set(0, 0, 0);
    // 宇宙模式控制器参数(初始化时预存，切换视图时动态应用)
    const UNIVERSE_CONTROLS = { enablePan: true, minDistance: 0.5, maxDistance: 10000, rotateSpeed: 0.8, zoomSpeed: 1.2 };
    const SOLAR_CONTROLS = { enablePan: false, minDistance: 2.5, maxDistance: 4000, rotateSpeed: 0.5, zoomSpeed: 0.8 };
    const EARTH_CONTROLS = { enablePan: false, minDistance: 2.5, maxDistance: 4000, rotateSpeed: 0.5, zoomSpeed: 0.8 };
    (window as unknown as Record<string, unknown>).__SKYGIS_CONTROLS_PRESETS = { universe: UNIVERSE_CONTROLS, solar: SOLAR_CONTROLS, earth: EARTH_CONTROLS, moon: EARTH_CONTROLS };
    controlsRef.current = controls;

    // ====== 探针拖拽交互 (触摸+鼠标) ======
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 5 };
    const pointer = new THREE.Vector2();
    let isDraggingProbe = false;
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // XZ平面
    let lastTouchPos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      if (!probeMeshRef.current || !probeMeshRef.current.visible) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      // 检查是否点击了探针（扩大检测范围到探针周围20单位）
      const probePos = probeMeshRef.current.position;
      const probeScreen = probePos.clone().project(camera);
      const screenDist = Math.sqrt(
        Math.pow(pointer.x - probeScreen.x, 2) + Math.pow(pointer.y - probeScreen.y, 2)
      );
      if (screenDist < 0.08) { // 屏幕空间8%范围内视为点击探针
        isDraggingProbe = true;
        lastTouchPos = { x: e.clientX, y: e.clientY };
        controls.enabled = false;
        renderer.domElement.style.cursor = 'grabbing';
        renderer.domElement.style.touchAction = 'none';
        e.preventDefault();
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingProbe) return;
      e.preventDefault();
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersectPoint = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(dragPlane, intersectPoint)) {
        const dist = Math.sqrt(intersectPoint.x ** 2 + intersectPoint.z ** 2);
        if (dist < 3000) {
          probeTargetRef.current = intersectPoint;
        }
      }
      lastTouchPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      if (isDraggingProbe) {
        isDraggingProbe = false;
        controls.enabled = true;
        renderer.domElement.style.cursor = 'default';
        renderer.domElement.style.touchAction = '';
      }
    };

    // 触摸事件 - 防止页面滚动
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const fakeEvent = new PointerEvent('pointerdown', {
          clientX: touch.clientX,
          clientY: touch.clientY,
        });
        onPointerDown(fakeEvent);
        if (isDraggingProbe) e.preventDefault();
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isDraggingProbe && e.touches.length === 1) {
        e.preventDefault();
        const touch = e.touches[0];
        const fakeEvent = new PointerEvent('pointermove', {
          clientX: touch.clientX,
          clientY: touch.clientY,
        });
        onPointerMove(fakeEvent);
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      onPointerUp(new PointerEvent('pointerup'));
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
    renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });
    renderer.domElement.addEventListener('touchend', onTouchEnd);

    // 星空背景（使用真实星空纹理球体）
    const starGeom = new THREE.SphereGeometry(3000, 64, 32);
    const starMat = new THREE.MeshBasicMaterial({ color: 0x020510, side: THREE.BackSide });
    const starSphere = new THREE.Mesh(starGeom, starMat);
    scene.add(starSphere);
    // 加载真实星空纹理
    new THREE.TextureLoader().load('/textures/stars.jpg', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      starMat.map = tex; starMat.needsUpdate = true;
    });
    // 补充细小星点粒子
    const sg = new THREE.BufferGeometry();
    const sp = new Float32Array(9000);
    for (let i = 0; i < 9000; i++) sp[i] = (Math.random() - 0.5) * 4000;
    sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, sizeAttenuation: true })));

    // ====== 太阳系组 ======
    const solarGroup = new THREE.Group();
    scene.add(solarGroup);
    solarGroupRef.current = solarGroup;

    // 太阳
    const sunGeom = new THREE.SphereGeometry(SUN_SCENE_RADIUS, 64, 64);
    const sunMat = new THREE.MeshBasicMaterial({ map: createSunTexture() });
    const sun = new THREE.Mesh(sunGeom, sunMat);
    solarGroup.add(sun);
    sunMeshRef.current = sun;
    // 异步加载太阳影像纹理
    new THREE.TextureLoader().load(TEXTURE_MAP.Sun, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      sunMat.map = tex; sunMat.needsUpdate = true;
    });
    // 太阳光晕
    const glowGeom = new THREE.SphereGeometry(SUN_SCENE_RADIUS * 1.4, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.12, side: THREE.BackSide });
    solarGroup.add(new THREE.Mesh(glowGeom, glowMat));
    // 太阳标签
    const sunLabel = createTextSprite('太阳 Sun', '#ffcc00', 28);
    sunLabel.position.set(0, SUN_SCENE_RADIUS + 1.5, 0);
    sunLabel.scale.set(8, 1, 1);
    solarGroup.add(sunLabel);

    // 太阳经纬度网格
    const sunGrid = createGraticule(SUN_SCENE_RADIUS, 30, 30, 0xffaa00, 0.15);
    sun.add(sunGrid);
    planetGridsRef.current.set('Sun', sunGrid);

    // 点光源从太阳发出
    const sunLight = new THREE.PointLight(0xffffff, 2, 5000, 0.5);
    sunLight.position.set(0, 0, 0);
    solarGroup.add(sunLight);
	
    // ====== 探针自主决策 ======
    const decideTarget = async () => {
      const now = Date.now();
      // 每5秒最多决策一次
      if (now - lastProbeDecisionRef.current < 5000) return;
      lastProbeDecisionRef.current = now;
      
      try {
        const resp = await fetch('/api/agent/probe?view=decision');
        const data = await resp.json();
        
        if (data.currentTask) {
          probeBrainRef.current = data.currentTask.targetBody;
        } else if (data.autonomousDecision) {
          // API返回的自主决策
          probeBrainRef.current = data.autonomousDecision.target;
        } else {
          // API未决策，本地分析所有数据后决定
          const bodies = ['Mars', 'Europa', 'Titan', 'Ganymede', 'Moon', 'Io', 'Pluto'];
          const scores: Record<string, number> = {};
          
          bodies.forEach(body => {
            // 简单算法：随机+距离+历史
            const hash = (body: string, t: number) => {
              let h = 0;
              for (let i = 0; i < body.length; i++) { h = Math.imul(31, h) + body.charCodeAt(i) | 0; }
              return Math.abs(Math.sin(h + t * 0.001));
            };
            const dist = { Mars: 15, Europa: 45, Titan: 60, Ganymede: 45, Moon: 10, Io: 45, Pluto: 120 };
            scores[body] = hash(body, now) * 0.5 + (1 / (dist[body as keyof typeof dist] || 50)) * 0.5;
          });
          
          let best = '', bestScore = 0;
          Object.entries(scores).forEach(([body, score]) => {
            if (score > bestScore) { bestScore = score; best = body; }
          });
          if (best) probeBrainRef.current = best;
        }
      } catch (e) { console.error('[Probe] 决策失败:', e); }
    };
    
    // 设置定时任务获取
    setInterval(decideTarget, 5000);

    // ====== 行星 ======
    PLANETS.forEach((p, idx) => {
      const dist = orbitSceneDist(p.distAu);
      const radius = planetSceneRadius(p.radiusKm);
      const orbitGroup = new THREE.Group();
      orbitGroup.position.set(0, 0, 0); // orbitGroup 在原点（太阳位置），作为旋转组

      // 行星mesh — 先用程序化纹理，再替换为影像纹理
      const tex = p.nameCn === '地球'
        ? createProceduralEarthTexture()
        : createPlanetTexture(p.color, []);
      const geom = new THREE.SphereGeometry(radius, 32, 32);
      const mat = new THREE.MeshPhongMaterial({ map: tex, shininess: 10 });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(dist, 0, 0); // mesh 在轨道距离
      mesh.userData = { planetIndex: idx, planetData: p };
      orbitGroup.add(mesh);
      
      // 设置不同的初始相位角，让行星分布在不同位置
      orbitGroup.rotation.y = (idx / PLANETS.length) * Math.PI * 2;
      
      planetMeshesRef.current.set(p.name, mesh);
      planetOrbitGroupsRef.current.set(p.name, orbitGroup);
      // console.log('[SkyGIS] Registered planet:', p.name, 'orbitGroup pos:', orbitGroup.position.x);

      // 异步加载行星影像纹理
      const texPath = TEXTURE_MAP[p.name];
      if (texPath) {
        new THREE.TextureLoader().load(texPath, (loadedTex) => {
          loadedTex.colorSpace = THREE.SRGBColorSpace;
          mat.map = loadedTex; mat.needsUpdate = true;
        });
      }

      // 土星环
      if (p.name === 'Saturn') {
        const ringGeom = new THREE.RingGeometry(radius * 1.3, radius * 2.2, 64);
        // 调整UV让纹理正确映射
        const pos = ringGeom.attributes.position;
        const uv = ringGeom.attributes.uv;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i), y = pos.getY(i);
          const dist = Math.sqrt(x * x + y * y);
          const u = (dist - radius * 1.3) / (radius * 0.9);
          uv.setXY(i, u, 0.5);
        }
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xe8d5a3, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = Math.PI / 2.5;
        ring.position.copy(mesh.position);
        orbitGroup.add(ring);
        // 异步加载土星环真实纹理（带alpha通道的PNG）
        new THREE.TextureLoader().load('/textures/saturn-ring.png', (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          ringMat.map = tex; ringMat.transparent = true; ringMat.opacity = 1.0; ringMat.needsUpdate = true;
        });
      }

      // 天王星环（倾斜）
      if (p.name === 'Uranus') {
        const ringGeom = new THREE.RingGeometry(radius * 1.2, radius * 1.6, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x7ec8e3, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = Math.PI / 10; // Uranus tilted axis
        ring.rotation.z = Math.PI / 2.5;
        ring.position.copy(mesh.position);
        orbitGroup.add(ring);
      }

      // 标签
      const label = createTextSprite(p.nameCn, '#aaddff', 24);
      label.position.set(0, radius + 1.8, 0);
      label.scale.set(6, 0.9, 1);
      orbitGroup.add(label);
      planetLabelsRef.current.set(p.name, label);

      // 行星经纬度网格
      const planetGrid = createGraticule(radius, 30, 30, 0x4488aa, 0.3);
      mesh.add(planetGrid);
      planetGridsRef.current.set(p.name, planetGrid);

      // 行星坐标标注
      const pLabels = createCoordLabels(radius, 30, 30, '#4488aa');
      mesh.add(pLabels);

      // 轨道线
      const orbitPts: THREE.Vector3[] = [];
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        orbitPts.push(new THREE.Vector3(Math.cos(a) * dist, 0, Math.sin(a) * dist));
      }
      const orbitLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(orbitPts),
        new THREE.LineBasicMaterial({ color: 0x2a4a7a, transparent: true, opacity: 0.6 })
      );
      solarGroup.add(orbitLine);

      // 初始轨道角度（随机分布）
      orbitGroup.rotation.y = Math.random() * Math.PI * 2;
      solarGroup.add(orbitGroup);
    });

    // ====== 行星物质层3D可视化 ======
    // 物质分类颜色映射
    const matCatColor: Record<string, number> = {
      atmosphere: 0x88ccff, surface: 0xffaa44, interior: 0xff6644,
      ocean: 0x4488ff, special: 0x44ff88, ice: 0xaaddff,
      organic: 0x88dd66, mineral: 0xddaa55, metal: 0xcccccc,
    };
    const matCatCn: Record<string, string> = {
      atmosphere: '大气', surface: '表面', interior: '内部',
      ocean: '海洋', special: '特殊', ice: '冰层',
    };
    // 气体颜色映射
    const gasColorMap: Record<string, number> = {
      'H₂': 0x6699cc, 'He': 0xdddd66, 'CO₂': 0xddaa77, 'N₂': 0x77aadd,
      'CH₄': 0x88cc88, 'H₂O': 0x5588bb, 'SO₂': 0xddbb55, 'NH₃': 0x77bb99,
      'O₂': 0x88aacc, 'Ar': 0xbb88cc, 'Na': 0xffdd44, 'H': 0xccccff,
    };
    // 所有有天体物质数据的天体(行星+矮行星)
    const bodiesWithMaterials = [...PLANETS, ...DWARF_PLANETS];
    bodiesWithMaterials.forEach(body => {
      const bodyData = SOLAR_SYSTEM_MATERIALS[body.name];
      if (!bodyData || !bodyData.materials) return;
      const dist = orbitSceneDist(body.distAu);
      const subGroup = new THREE.Group();
      subGroup.position.set(dist, 0, 0);
      subGroup.userData = { bodyName: body.nameCn };
      const pRadius = planetSceneRadius(body.radiusKm);

      // 按category分组物质
      const grouped = new Map<string, typeof bodyData.materials>();
      bodyData.materials.forEach((m: { category: string }) => {
        const cat = m.category || 'surface';
        if (!grouped.has(cat)) grouped.set(cat, []);
        grouped.get(cat)!.push(m as typeof bodyData.materials[0]);
      });

      // 1. 大气层 — 半透明外壳+气体标签
      const atmMats = grouped.get('atmosphere') || [];
      if (atmMats.length > 0) {
        const mainGas = atmMats[0];
        const gasColor = gasColorMap[mainGas.formula] || 0x99aacc;
        const atmShell = new THREE.Mesh(
          new THREE.SphereGeometry(pRadius * 1.45, 24, 24),
          new THREE.MeshBasicMaterial({ color: gasColor, transparent: true, opacity: 0.1, side: THREE.BackSide, depthWrite: false })
        );
        subGroup.add(atmShell);
        // 大气成分标签(前3种)
        const top3 = atmMats.slice(0, 3).map((m: typeof atmMats[0]) => `${m.formula} ${m.percentage}%`).join(' | ');
        const atmLabel = createTextSprite(top3, '#88ccff', 12);
        atmLabel.position.set(0, pRadius * 1.8, 0);
        subGroup.add(atmLabel);
      }

      // 2. 表面/冰层/海洋 — 环绕物质标记点
      const surfCats = ['surface', 'ice', 'ocean'];
      surfCats.forEach(cat => {
        const mats = grouped.get(cat) || [];
        if (mats.length === 0) return;
        const topMats = mats.slice(0, 5);
        const catIdx = surfCats.indexOf(cat);
        topMats.forEach((mat: typeof mats[0], idx: number) => {
          const angle = (idx / topMats.length) * Math.PI * 2 + catIdx * 0.5;
          const orbitR = pRadius * (2.0 + catIdx * 0.6 + idx * 0.15);
          const dotSize = Math.max(0.08, Math.min(0.25, (mat.percentage || 10) / 40));
          const dotColor = matCatColor[cat] || 0xcccccc;
          const dot = new THREE.Mesh(
            new THREE.SphereGeometry(dotSize, 8, 8),
            new THREE.MeshBasicMaterial({ color: dotColor, transparent: true, opacity: 0.75 })
          );
          dot.position.set(Math.cos(angle) * orbitR, 0.15 * (catIdx - 1), Math.sin(angle) * orbitR);
          dot.userData = { substanceName: mat.name, formula: mat.formula, percentage: mat.percentage, category: cat };
          subGroup.add(dot);
          const matLabel = createTextSprite(mat.formula, `#${dotColor.toString(16).padStart(6, '0')}`, 10);
          matLabel.position.set(Math.cos(angle) * orbitR, 0.15 * (catIdx - 1) + 0.35, Math.sin(angle) * orbitR);
          subGroup.add(matLabel);
        });
      });

      // 3. 内部结构 — 分层环(仅大天体)
      const intMats = grouped.get('interior') || [];
      if (intMats.length > 0 && body.radiusKm > 3000) {
        intMats.slice(0, 4).forEach((mat: typeof intMats[0], idx: number) => {
          const layerR = pRadius * (0.5 + idx * 0.3);
          const layerColor = idx === 0 ? 0xff4422 : idx === 1 ? 0xff8844 : idx === 2 ? 0xccaa66 : 0x888888;
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(layerR - 0.04, layerR + 0.04, 48),
            new THREE.MeshBasicMaterial({ color: layerColor, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })
          );
          ring.rotation.x = -Math.PI / 2;
          ring.position.y = -(idx * 0.12);
          subGroup.add(ring);
          const intLabel = createTextSprite(mat.formula, '#ff6644', 9);
          intLabel.position.set(layerR + 0.3, -(idx * 0.12), 0);
          subGroup.add(intLabel);
        });
      }

      // 4. 特殊物质标签
      const specMats = grouped.get('special') || [];
      if (specMats.length > 0) {
        const specText = specMats.slice(0, 3).map((m: typeof specMats[0]) => m.name).join(' | ');
        const specLabel = createTextSprite(specText, '#44ff88', 10);
        specLabel.position.set(0, -pRadius * 1.6, 0);
        subGroup.add(specLabel);
      }

      subGroup.visible = showSubstanceMode;
      substanceGroupsRef.current.set(body.nameCn, subGroup);
      solarGroup.add(subGroup);
    });

    // ====== 小行星带（火星与木星之间 2.2-3.2 AU）======
    const asteroidCount = 600;
    const asteroidPositions = new Float32Array(asteroidCount * 3);
    const asteroidColors = new Float32Array(asteroidCount * 3);
    for (let i = 0; i < asteroidCount; i++) {
      const auDist = 2.2 + Math.random() * 1.0; // 2.2-3.2 AU
      const dist = orbitSceneDist(auDist);
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 0.6;
      asteroidPositions[i * 3] = Math.cos(angle) * dist;
      asteroidPositions[i * 3 + 1] = y;
      asteroidPositions[i * 3 + 2] = Math.sin(angle) * dist;
      const brightness = 0.4 + Math.random() * 0.3;
      asteroidColors[i * 3] = brightness;
      asteroidColors[i * 3 + 1] = brightness * 0.85;
      asteroidColors[i * 3 + 2] = brightness * 0.7;
    }
    const asteroidGeom = new THREE.BufferGeometry();
    asteroidGeom.setAttribute('position', new THREE.BufferAttribute(asteroidPositions, 3));
    asteroidGeom.setAttribute('color', new THREE.BufferAttribute(asteroidColors, 3));
    const asteroidMat = new THREE.PointsMaterial({ size: 0.15, vertexColors: true, transparent: true, opacity: 0.7, sizeAttenuation: true });
    const asteroidBelt = new THREE.Points(asteroidGeom, asteroidMat);
    solarGroup.add(asteroidBelt);

    // ====== 彗星轨道（使用扩展数据） ======
    const cometsGroup = new THREE.Group();
    COMETS_DATA.forEach(comet => {
      const a = orbitSceneDist(comet.a_au);
      const b = a * Math.sqrt(1 - comet.e * comet.e);
      const cx = -a * comet.e; // 椭圆中心偏移
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 256; i++) {
        const t = (i / 256) * Math.PI * 2;
        pts.push(new THREE.Vector3(cx + Math.cos(t) * a, 0, Math.sin(t) * b));
      }
      const cometOrbit = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: comet.color, transparent: true, opacity: 0.35 })
      );
      cometOrbit.rotation.x = (comet.inc * Math.PI) / 180;
      cometsGroup.add(cometOrbit);

      // 彗星头部
      const headGeom = new THREE.SphereGeometry(0.15, 16, 16);
      const headMat = new THREE.MeshBasicMaterial({ color: comet.color });
      const head = new THREE.Mesh(headGeom, headMat);
      // 彗尾
      const tailPts: THREE.Vector3[] = [];
      for (let i = 0; i < 20; i++) {
        tailPts.push(new THREE.Vector3(cx + a - i * 0.3, 0, i * 0.05));
      }
      const tailLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(tailPts),
        new THREE.LineBasicMaterial({ color: comet.color, transparent: true, opacity: 0.4 })
      );
      const cometGroup = new THREE.Group();
      cometGroup.add(head);
      cometGroup.add(tailLine);
      cometGroup.rotation.x = (comet.inc * Math.PI) / 180;
      cometsGroup.add(cometGroup);
    });
    solarGroup.add(cometsGroup);

    // ====== 矮行星 ======
    DWARF_PLANETS.forEach((dp, idx) => {
      const dist = orbitSceneDist(dp.distAu);
      const radius = Math.max(0.15, planetSceneRadius(dp.radiusKm) * 0.7); // 矮行星略小
      const orbitGroup = new THREE.Group();
      orbitGroup.position.set(0, 0, 0); // orbitGroup 在原点
      // orbitGroup.rotation.y 控制公转

      const tex = createPlanetTexture(dp.color, []);
      const geom = new THREE.SphereGeometry(radius, 24, 24);
      const mat = new THREE.MeshPhongMaterial({ map: tex, shininess: 5 });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(dist, 0, 0); // mesh 在轨道距离位置
      mesh.userData = { planetIndex: PLANETS.length + idx, planetData: dp, isDwarfPlanet: true };
      orbitGroup.add(mesh);
      planetMeshesRef.current.set(dp.name, mesh);
      planetOrbitGroupsRef.current.set(dp.name, orbitGroup);
      // console.log('[SkyGIS] Registered dwarf planet:', dp.name, 'orbitGroup pos:', orbitGroup.position.x);

      // 矮行星标签（橙色区分）
      const label = createTextSprite(dp.nameCn, '#ff9944', 18);
      label.position.set(0, radius + 0.8, 0);
      label.scale.set(4, 0.6, 1);
      orbitGroup.add(label);
      planetLabelsRef.current.set(dp.name, label);

      // 轨道线（虚线样式——用更低的opacity区分）
      const orbitPts: THREE.Vector3[] = [];
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        orbitPts.push(new THREE.Vector3(Math.cos(a) * dist, 0, Math.sin(a) * dist));
      }
      const orbitLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(orbitPts),
        new THREE.LineBasicMaterial({ color: 0x665533, transparent: true, opacity: 0.45 })
      );
      solarGroup.add(orbitLine);

      // 随机轨道角度
      orbitGroup.rotation.y = Math.random() * Math.PI * 2;
      // 冥王星和妊神星倾斜
      if (dp.name === 'Pluto' || dp.name === 'Haumea') {
        orbitGroup.rotation.x = (17 * Math.PI) / 180;
      }
      if (dp.name === 'Eris') {
        orbitGroup.rotation.x = (44 * Math.PI) / 180;
      }
      solarGroup.add(orbitGroup);
    });

    // ====== 主要卫星（绕母星运行）===== 
    // 清空旧的卫星引用，防止累积
    satelliteOrbitsRef.current = [];
    
    console.log(`[SkyGIS] Creating moons, planetMeshes available:`, Array.from(planetMeshesRef.current.keys()));
    console.log(`[SkyGIS] Creating moons, orbitGroups available:`, Array.from(planetOrbitGroupsRef.current.keys()));
    
    let moonsCreated = 0;
    let moonsFailed = 0;
    
    MAJOR_MOONS.forEach((moon) => {
      // 从 planetMeshesRef 获取母星 mesh，从 planetOrbitGroupsRef 获取母星的公转组
      const parentMesh = planetMeshesRef.current.get(moon.parent);
      const parentOrbitGroup = planetOrbitGroupsRef.current.get(moon.parent);
      
      if (!parentMesh || !parentOrbitGroup) {
        console.warn(`[SkyGIS] WARNING: parentMesh or orbitGroup not found for moon ${moon.nameCn}, parent: ${moon.parent}`);
        console.warn(`  Available planetMeshes:`, Array.from(planetMeshesRef.current.keys()));
        moonsFailed++;
        return;
      }
      
      const allPlanets = [...PLANETS, ...DWARF_PLANETS];
      const parentRadius = planetSceneRadius(
        allPlanets.find(p => p.name === moon.parent)?.radiusKm ?? 6371
      );
      // 卫星轨道半径：使用真实距离数据
      const moonOrbitRadius = moonOrbitSceneRadius(parentRadius, moon.parentDistKm);
      const moonRadius = Math.max(0.15, planetSceneRadius(moon.radiusKm));

      // moonPivot 添加到母星 mesh 上，这样卫星轨道跟随母星位置
      const moonPivot = new THREE.Group();
      moonPivot.position.set(0, 0, 0); // 在母星 mesh 局部坐标系中
      parentMesh.add(moonPivot);
      
      const moonOrbitGroup = new THREE.Group();
      moonPivot.add(moonOrbitGroup);
      // 保存卫星轨道组引用
      satelliteOrbitsRef.current.push({ orbit: moonOrbitGroup, parentMesh, pivot: moonPivot });
      
      console.log(`[SkyGIS] Created moon: ${moon.nameCn} around ${moon.parent}, orbitRadius: ${moonOrbitRadius.toFixed(2)}, moonRadius: ${moonRadius.toFixed(2)}`);

      // 卫星mesh
      const tex = createPlanetTexture(moon.color, []);
      const geom = new THREE.SphereGeometry(moonRadius, 16, 16);
      const mat = new THREE.MeshPhongMaterial({ map: tex, shininess: 5 });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(moonOrbitRadius, 0, 0);
      // 保存原始轨道半径，用于动画循环中计算位置
      mesh.userData = { moonData: moon, isMoon: true, orbitRadius: moonOrbitRadius };
      moonOrbitGroup.add(mesh);

      // 卫星标签
      const label = createTextSprite(moon.nameCn, '#99ccff', 18);
      label.position.set(moonOrbitRadius, moonRadius + 0.6, 0);
      label.scale.set(3.5, 0.55, 1);
      label.userData = { isLabel: true };
      moonOrbitGroup.add(label);

      // 卫星轨道线
      const orbitPts: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        orbitPts.push(new THREE.Vector3(Math.cos(a) * moonOrbitRadius, 0, Math.sin(a) * moonOrbitRadius));
      }
      const orbitLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(orbitPts),
        new THREE.LineBasicMaterial({ color: 0x334466, transparent: true, opacity: 0.25 })
      );
      moonOrbitGroup.add(orbitLine);

      // 随机初始角度
      moonOrbitGroup.rotation.y = Math.random() * Math.PI * 2;
      // 倾斜轨道
      moonOrbitGroup.rotation.x = (Math.random() - 0.5) * 0.3;

      // 注意：月球轨道组已在太阳系创建时添加到母星公转组
      
      // 调试：输出母星和卫星的世界坐标对比
      const worldPos = new THREE.Vector3();
      const parentWorldPos = new THREE.Vector3();
      moonOrbitGroup.getWorldPosition(worldPos);
      parentMesh.getWorldPosition(parentWorldPos);
      console.log(`[SkyGIS] ${moon.nameCn} @ (${worldPos.x.toFixed(1)}, ${worldPos.y.toFixed(1)}, ${worldPos.z.toFixed(1)}) | Parent ${moon.parent} @ (${parentWorldPos.x.toFixed(1)}, ${parentWorldPos.y.toFixed(1)}, ${parentWorldPos.z.toFixed(1)})`);
    });
    
    console.log(`[SkyGIS] Moons created: ${moonsCreated}, failed: ${moonsFailed}`);
    
    // 验证：打印所有卫星和母星的对应关系
    console.log('[SkyGIS] Moon-Parent mapping:');
    MAJOR_MOONS.forEach((moon) => {
      const parentMesh = planetMeshesRef.current.get(moon.parent);
      if (parentMesh) {
        console.log(`  ${moon.nameCn} (${moon.parent}) -> ✓`);
      } else {
        console.warn(`  ${moon.nameCn} (${moon.parent}) -> ✗ PARENT NOT FOUND!`);
      }
    });

    // ====== 不可见现象可视化 ======
    // 圆形粒子纹理(太阳系部分使用)
    const sysCircleTex = (() => {
      const size = 64;
      const c = document.createElement('canvas'); c.width = size; c.height = size;
      const ctx = c.getContext('2d')!;
      const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.3, 'rgba(255,255,255,0.8)');
      grad.addColorStop(0.7, 'rgba(255,255,255,0.2)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    })();

    // 发光条纹纹理(用于磁场线粒子拖尾)
    const glowStreakTex = (() => {
      const c = document.createElement('canvas'); c.width = 32; c.height = 64;
      const ctx = c.getContext('2d')!;
      ctx.clearRect(0, 0, 32, 64);
      const grad = ctx.createLinearGradient(0, 0, 0, 64);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(0.3, 'rgba(255,255,255,0.6)');
      grad.addColorStop(0.5, 'rgba(255,255,255,1)');
      grad.addColorStop(0.7, 'rgba(255,255,255,0.6)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(8, 0, 16, 64);
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    })();

    // -- 磁场线 → 发光粒子流(不是线条!) --
    const magnetPlanets = [
      { name: 'Earth', color: 0x4488ff, strength: 1.0, tilt: 11 },
      { name: 'Jupiter', color: 0xff6644, strength: 2.0, tilt: 10 },
      { name: 'Saturn', color: 0xffcc44, strength: 1.4, tilt: 1 },
      { name: 'Uranus', color: 0x44ffcc, strength: 1.2, tilt: 59 },
      { name: 'Neptune', color: 0x4466ff, strength: 1.3, tilt: 47 },
      { name: 'Mercury', color: 0x888888, strength: 0.3, tilt: 2 },
    ];
    const magnetGroup = new THREE.Group();
    magnetGroup.name = 'magnetGroup';
    magnetPlanets.forEach((mp) => {
      const parentMesh = planetMeshesRef.current.get(mp.name);
      if (!parentMesh) return;
      const pDef = PLANETS.find((p) => p.name === mp.name);
      if (!pDef) return;
      const fieldR = Math.max(0.5, pDef.radiusKm * mp.strength * 2.5);
      const linesGroup = new THREE.Group();
      // 每条磁力线上30个流动粒子
      const PARTICLES_PER_LINE = 30;
      const LINES = 8;
      const totalParticles = PARTICLES_PER_LINE * LINES;
      const mPositions = new Float32Array(totalParticles * 3);
      const mPhases = new Float32Array(totalParticles); // 每粒子沿线的相位
      const mLineIdx = new Float32Array(totalParticles); // 属于哪条线
      for (let line = 0; line < LINES; line++) {
        for (let j = 0; j < PARTICLES_PER_LINE; j++) {
          const idx = line * PARTICLES_PER_LINE + j;
          mPhases[idx] = j / PARTICLES_PER_LINE + Math.random() * 0.03;
          mLineIdx[idx] = line;
          // 初始位置(偶极场方程)
          const phi = (line / LINES) * Math.PI * 2;
          const theta = mPhases[idx] * Math.PI;
          const r = fieldR * Math.sin(theta) * Math.sin(theta);
          mPositions[idx * 3] = r * Math.sin(theta) * Math.cos(phi);
          mPositions[idx * 3 + 1] = r * Math.cos(theta);
          mPositions[idx * 3 + 2] = r * Math.sin(theta) * Math.sin(phi);
        }
      }
      const mGeom = new THREE.BufferGeometry();
      mGeom.setAttribute('position', new THREE.BufferAttribute(mPositions, 3));
      const mMat = new THREE.PointsMaterial({
        color: mp.color,
        size: 0.35 * mp.strength,
        transparent: true,
        opacity: 0.85,
        map: sysCircleTex,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const mPts = new THREE.Points(mGeom, mMat);
      mPts.userData.isMagnetParticles = true;
      mPts.userData.mPhases = mPhases;
      mPts.userData.mLineIdx = mLineIdx;
      mPts.userData.fieldR = fieldR;
      mPts.userData.numLines = LINES;
      mPts.userData.particlesPerLine = PARTICLES_PER_LINE;
      linesGroup.add(mPts);
      linesGroup.rotation.x = (mp.tilt * Math.PI) / 180;
      linesGroup.position.copy(parentMesh.position);
      linesGroup.userData.isMagnet = true;
      magnetGroup.add(linesGroup);
    });
    solarGroup.add(magnetGroup);

    // -- 太阳风 → 明亮径向粒子流 --
    const solarWindCount = 5000;
    const swPositions = new Float32Array(solarWindCount * 3);
    const swSpeeds = new Float32Array(solarWindCount);
    const swAngles = new Float32Array(solarWindCount * 2);
    for (let i = 0; i < solarWindCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2 + Math.random() * 70;
      swPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      swPositions[i * 3 + 1] = r * Math.cos(phi) * 0.15;
      swPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      swSpeeds[i] = 0.08 + Math.random() * 0.22;
      swAngles[i * 2] = theta;
      swAngles[i * 2 + 1] = phi;
    }
    const swGeom = new THREE.BufferGeometry();
    swGeom.setAttribute('position', new THREE.BufferAttribute(swPositions, 3));
    const swMat = new THREE.PointsMaterial({
      color: 0xffee88,
      size: 0.35,
      transparent: true,
      opacity: 0.7,
      map: sysCircleTex,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const solarWindPoints = new THREE.Points(swGeom, swMat);
    solarWindPoints.name = 'solarWind';
    solarWindPoints.userData.swSpeeds = swSpeeds;
    solarWindPoints.userData.swAngles = swAngles;
    solarGroup.add(solarWindPoints);

    // -- 辐射带 → 发光粒子环(不是TorusMesh!) --
    const radiationPlanets = [
      { name: 'Earth', innerR: 1.5, outerR: 4.0, color: 0x44aaff, tilt: 11, count: 600 },
      { name: 'Jupiter', innerR: 3.0, outerR: 12.0, color: 0xff8844, tilt: 10, count: 1000 },
      { name: 'Saturn', innerR: 2.5, outerR: 8.0, color: 0xffdd44, tilt: 1, count: 800 },
    ];
    const radiationGroup = new THREE.Group();
    radiationGroup.name = 'radiationGroup';
    radiationPlanets.forEach((rp) => {
      const parentMesh = planetMeshesRef.current.get(rp.name);
      if (!parentMesh) return;
      const pDef = PLANETS.find((p) => p.name === rp.name);
      if (!pDef) return;
      // 内外辐射带各一组粒子
      [rp.innerR, rp.outerR].forEach((beltR, bIdx) => {
        const count = Math.floor(rp.count / 2);
        const rPositions = new Float32Array(count * 3);
        const rPhases = new Float32Array(count); // 沿环的相位
        const rRadii = new Float32Array(count); // 实际半径(有波动)
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = beltR + (Math.random() - 0.5) * beltR * 0.3;
          const yOff = (Math.random() - 0.5) * 0.5;
          rPositions[i * 3] = r * Math.cos(angle);
          rPositions[i * 3 + 1] = yOff;
          rPositions[i * 3 + 2] = r * Math.sin(angle);
          rPhases[i] = angle;
          rRadii[i] = r;
        }
        const rGeom = new THREE.BufferGeometry();
        rGeom.setAttribute('position', new THREE.BufferAttribute(rPositions, 3));
        const rMat = new THREE.PointsMaterial({
          color: rp.color,
          size: bIdx === 0 ? 0.3 : 0.4,
          transparent: true,
          opacity: bIdx === 0 ? 0.7 : 0.55,
          map: sysCircleTex,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const rPts = new THREE.Points(rGeom, rMat);
        rPts.rotation.x = Math.PI / 2;
        rPts.position.copy(parentMesh.position);
        rPts.userData.isRadiationBelt = true;
        rPts.userData.rPhases = rPhases;
        rPts.userData.rRadii = rRadii;
        rPts.userData.beltR = beltR;
        rPts.userData.tilt = rp.tilt;
        radiationGroup.add(rPts);
      });
    });
    solarGroup.add(radiationGroup);

    // -- 日冕物质抛射(CME) → 明亮喷流 --
    const cmeGroup = new THREE.Group();
    cmeGroup.name = 'cmeGroup';
    for (let i = 0; i < 3; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spread = 0.3 + Math.random() * 0.4;
      const cmeCount = 500;
      const cmePositions = new Float32Array(cmeCount * 3);
      const cmePhases = new Float32Array(cmeCount);
      for (let j = 0; j < cmeCount; j++) {
        const t = Math.random();
        const r = 2 + t * 30;
        const dx = (Math.random() - 0.5) * spread * t;
        const dy = (Math.random() - 0.5) * spread * t * 0.3;
        const dz = (Math.random() - 0.5) * spread * t;
        cmePositions[j * 3] = r * Math.cos(angle) + dx;
        cmePositions[j * 3 + 1] = dy;
        cmePositions[j * 3 + 2] = r * Math.sin(angle) + dz;
        cmePhases[j] = t;
      }
      const cmeGeom = new THREE.BufferGeometry();
      cmeGeom.setAttribute('position', new THREE.BufferAttribute(cmePositions, 3));
      const cmeMat = new THREE.PointsMaterial({
        color: 0xffaa44,
        size: 0.5,
        transparent: true,
        opacity: 0.6,
        map: sysCircleTex,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const cmePts = new THREE.Points(cmeGeom, cmeMat);
      cmePts.userData.cmeAngle = angle;
      cmePts.userData.cmeSpeed = 0.003 + Math.random() * 0.005;
      cmePts.userData.cmePhases = cmePhases;
      cmeGroup.add(cmePts);
    }
    solarGroup.add(cmeGroup);

    // -- 宇宙射线 → 明亮长线+光点 --
    const cosmicRayGroup = new THREE.Group();
    cosmicRayGroup.name = 'cosmicRayGroup';
    for (let i = 0; i < 12; i++) {
      const startTheta = Math.random() * Math.PI * 2;
      const startPhi = Math.acos(2 * Math.random() - 1);
      const startR = 80;
      const dir = new THREE.Vector3(
        -Math.sin(startPhi) * Math.cos(startTheta),
        -Math.cos(startPhi),
        -Math.sin(startPhi) * Math.sin(startTheta)
      ).normalize();
      const endR = 1 + Math.random() * 30;
      const pts = [
        new THREE.Vector3(
          startR * Math.sin(startPhi) * Math.cos(startTheta),
          startR * Math.cos(startPhi),
          startR * Math.sin(startPhi) * Math.sin(startTheta)
        ),
        dir.clone().multiplyScalar(endR),
      ];
      const rayGeom = new THREE.BufferGeometry().setFromPoints(pts);
      const rayMat = new THREE.LineBasicMaterial({
        color: 0xaaffff,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        linewidth: 2,
      });
      const ray = new THREE.Line(rayGeom, rayMat);
      ray.userData.crPhase = Math.random() * Math.PI * 2;
      cosmicRayGroup.add(ray);
    }
    solarGroup.add(cosmicRayGroup);

    // -- 黄道光(太阳系尘埃盘) --
    const zodiacalCount = 2000;
    const zodPositions = new Float32Array(zodiacalCount * 3);
    for (let i = 0; i < zodiacalCount; i++) {
      const r = 5 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 1.5; // 薄盘
      zodPositions[i * 3] = r * Math.cos(theta);
      zodPositions[i * 3 + 1] = y;
      zodPositions[i * 3 + 2] = r * Math.sin(theta);
    }
    const zodGeom = new THREE.BufferGeometry();
    zodGeom.setAttribute('position', new THREE.BufferAttribute(zodPositions, 3));
    const zodMat = new THREE.PointsMaterial({
      color: 0xffeeaa,
      size: 0.08,
      transparent: true,
      opacity: 0.15,
      map: sysCircleTex,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    solarGroup.add(new THREE.Points(zodGeom, zodMat));

    // ====== 宇宙视图组（基于全量天体目录） ======
    const universeGroup = new THREE.Group();
    universeGroup.visible = false;
    scene.add(universeGroup);
    universeGroupRef.current = universeGroup;

    // 宇宙圆形粒子纹理(避免方块)
    const createCircleTexture = (): THREE.Texture => {
      const size = 64;
      const c = document.createElement('canvas'); c.width = size; c.height = size;
      const ctx = c.getContext('2d')!;
      const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.3, 'rgba(255,255,255,0.8)');
      grad.addColorStop(0.7, 'rgba(255,255,255,0.2)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    };
    const circleTexture = createCircleTexture();

    // 宇宙背景环境光
    const universeAmbient = new THREE.AmbientLight(0x222244, 0.5);
    universeGroup.add(universeAmbient);

    // 银河系中心标记 - 极小亮点(不模拟恒星外观)
    const mwCoreGeom = new THREE.SphereGeometry(0.08, 8, 8);
    const mwCoreMat = new THREE.MeshBasicMaterial({ color: 0xffddaa, transparent: true, opacity: 0.5 });
    const mwCore = new THREE.Mesh(mwCoreGeom, mwCoreMat);
    mwCore.userData = { cosmicObject: { id: 'mw-center', name: '银河系中心', type: '棒旋星系中心', distance: '26000光年', catalogEntry: ALL_COSMIC_OBJECTS.find(o => o.id === 'mw-center') } };
    universeGroup.add(mwCore);
    // 银河系标签(缩小)
    const mwLabel = createTextSprite('银河系 (Milky Way)', '#ffddaa', 14);
    mwLabel.position.set(0, 3, 0);
    mwLabel.scale.set(6, 1, 1);
    universeGroup.add(mwLabel);

    // 银河系盘面（4条螺旋臂+中央棒+恒星形成区 - 缩小尺寸避免与近邻星系重叠）
    const mwDiskPts: THREE.Vector3[] = [];
    const mwColors: number[] = [];
    // 中央棒结构
    for (let i = 0; i < 800; i++) {
      const barAngle = Math.random() * Math.PI * 2;
      const barDist = Math.random() * 3;
      const bx = Math.cos(barAngle) * barDist * 0.6;
      const bz = Math.sin(barAngle) * barDist * 0.15;
      const by = (Math.random() - 0.5) * 0.3 * Math.exp(-barDist / 4);
      mwDiskPts.push(new THREE.Vector3(bx, by, bz));
      mwColors.push(1.0, 0.85, 0.6); // 暖黄色核心
    }
    // 4条主螺旋臂
    const armColors = [
      [0.55, 0.7, 1.0],   // 蓝白-年轻恒星区
      [0.7, 0.6, 1.0],    // 紫蓝
      [0.55, 0.7, 1.0],   // 蓝白
      [0.7, 0.6, 1.0],    // 紫蓝
    ];
    for (let i = 0; i < 6000; i++) {
      const arm = Math.floor(Math.random() * 4);
      const dist = 2 + Math.random() * 18;
      const angle = (arm * Math.PI / 2) + (dist / 3.5) + (Math.random() - 0.5) * 0.35;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const y = (Math.random() - 0.5) * 0.3 * Math.exp(-dist / 10);
      mwDiskPts.push(new THREE.Vector3(x, y, z));
      const c = armColors[arm];
      mwColors.push(c[0], c[1], c[2]);
    }
    const mwDiskGeom = new THREE.BufferGeometry();
    mwDiskGeom.setFromPoints(mwDiskPts);
    mwDiskGeom.setAttribute('color', new THREE.Float32BufferAttribute(mwColors, 3));
    const mwDiskMat = new THREE.PointsMaterial({ size: 0.1, transparent: true, opacity: 0.45, sizeAttenuation: true, map: circleTexture, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true });
    universeGroup.add(new THREE.Points(mwDiskGeom, mwDiskMat));

    // 银河系光晕(大范围柔光)
    const mwHaloGeom = new THREE.SphereGeometry(25, 32, 32);
    const mwHaloMat = new THREE.MeshBasicMaterial({ color: 0x1a1a40, transparent: true, opacity: 0.04, depthWrite: false, side: THREE.BackSide });
    universeGroup.add(new THREE.Mesh(mwHaloGeom, mwHaloMat));
    // 银河系核心辉光(加法混合)
    const mwGlowGeom = new THREE.SphereGeometry(3, 24, 24);
    const mwGlowMat = new THREE.MeshBasicMaterial({ color: 0xffeebb, transparent: true, opacity: 0.08, depthWrite: false, blending: THREE.AdditiveBlending });
    universeGroup.add(new THREE.Mesh(mwGlowGeom, mwGlowMat));

    // 太阳系位置标记(银河系内微小点，不模拟恒星)
    const sunMarkerGeom = new THREE.SphereGeometry(0.06, 6, 6);
    const sunMarkerMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
    const sunMarker = new THREE.Mesh(sunMarkerGeom, sunMarkerMat);
    sunMarker.position.set(12, 0.15, 2);
    sunMarker.userData = { cosmicObject: { id: 'solar-system', name: '太阳系', type: 'G型主序星系统', distance: '0' } };
    universeGroup.add(sunMarker);
    const sunMarkerLabel = createTextSprite('☉太阳系', '#ffcc00', 9);
    sunMarkerLabel.position.set(12, 0.5, 2);
    sunMarkerLabel.scale.set(1.8, 0.4, 1);
    universeGroup.add(sunMarkerLabel);

    // 宇宙视图中的星际探针标记(小亮点, 银河系内游荡)
    const uProbeGeom = new THREE.OctahedronGeometry(0.04, 0);
    const uProbeMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const uProbe = new THREE.Mesh(uProbeGeom, uProbeMat);
    uProbe.position.set(12.5, 0.2, 2.3);
    uProbe.userData = { isUniverseProbe: true };
    universeGroup.add(uProbe);
    const uProbeLabel = createTextSprite('探针', '#f59e0b', 8);
    uProbeLabel.position.set(12.5, 0.35, 2.3);
    uProbeLabel.scale.set(1, 0.2, 1);
    universeGroup.add(uProbeLabel);

    // ====== 从全量天体目录渲染所有天体 ======
    // 距离对数缩放函数：将光年距离映射到3D坐标
    // 使用分段缩放，让不同尺度层级的天体有合理的空间分布
    const distTo3D = (dist: string | number): number => {
      let val: number;
      if (typeof dist === 'number') {
        val = dist * 10000; // distance单位是万光年，转为光年
      } else {
        const match = dist.match(/([\d.]+)\s*(万|亿)?\s*光年/);
        if (!match) return 120;
        val = parseFloat(match[1]);
        if (match[2] === '万') val *= 10000;
        if (match[2] === '亿') val *= 100000000;
      }
      // 分段缩放: 确保银河系盘面(半径20)与最近星系(25+)不重叠
      // <10万光年(银河系内): 映射到极小范围(银河系盘面内部)
      // 10万~100万光年(近邻星系): 30~65
      // 100万~1亿光年(远距星系): 65~155
      // 1亿~100亿光年(远宇宙): 155~355
      // >100亿光年(可观测宇宙边缘): 355~500
      if (val <= 100000) {
        // 银河系内部天体：映射到银河系盘面内
        return Math.min(15, 2 + (val / 100000) * 13);
      } else if (val <= 1000000) {
        return 30 + Math.log10(val / 100000) * 35;
      } else if (val <= 100000000) {
        return 65 + Math.log10(val / 1000000) * 30;
      } else if (val <= 10000000000) {
        return 155 + Math.log10(val / 100000000) * 50;
      } else {
        return 355 + Math.min(Math.log10(val / 10000000000) * 30, 145);
      }
    };

    // 使用确定性随机(基于id)生成位置
    const hashStr = (s: string): number => {
      let h = 0;
      for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
      return h;
    };
    const seededRandom = (seed: number): number => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    // ====== 为每个星系创建3D模型(类似太阳系行星) ======

    // 星系程序化纹理生成器
    const addAlpha = (color: string, alpha: string): string => {
      if (color.startsWith('hsl(') && color.endsWith(')')) {
        return color.replace('hsl(', 'hsla(').replace(')', `, ${parseInt(alpha, 16) / 255})`);
      }
      return color + alpha;
    };
    const createGalaxyTexture = (baseColor: string, type: string): THREE.Texture => {
      const size = 256;
      const c = document.createElement('canvas'); c.width = size; c.height = size;
      const ctx = c.getContext('2d')!;
      const cx = size / 2, cy = size / 2;
      ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, size, size);
      if (type.includes('椭圆') || type.includes('巨椭圆')) {
        // 椭圆星系: 中心亮, 向外渐暗
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.45);
        grad.addColorStop(0, baseColor);
        grad.addColorStop(0.3, baseColor);
        grad.addColorStop(0.7, addAlpha(baseColor, '60'));
        grad.addColorStop(1, '#000000');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
      } else if (type.includes('棒旋')) {
        // 棒旋星系: 核球+棒+旋臂
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.15);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.5, baseColor);
        grad.addColorStop(1, addAlpha(baseColor, '40'));
        ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
        // 棒
        ctx.save(); ctx.translate(cx, cy);
        ctx.fillStyle = addAlpha(baseColor, 'aa');
        ctx.fillRect(-size * 0.3, -size * 0.03, size * 0.6, size * 0.06);
        ctx.restore();
        // 旋臂
        for (let arm = 0; arm < 2; arm++) {
          ctx.beginPath(); ctx.strokeStyle = addAlpha(baseColor, '80'); ctx.lineWidth = 6;
          const offset = arm * Math.PI;
          for (let i = 0; i < 100; i++) {
            const t = i / 100;
            const angle = offset + t * Math.PI * 1.8;
            const r = size * 0.1 + t * size * 0.35;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else if (type.includes('旋涡') || type.includes('螺旋')) {
        // 旋涡星系: 核球+2旋臂
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.12);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.5, baseColor);
        grad.addColorStop(1, addAlpha(baseColor, '30'));
        ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
        for (let arm = 0; arm < 2; arm++) {
          ctx.beginPath(); ctx.strokeStyle = addAlpha(baseColor, '99'); ctx.lineWidth = 5;
          const offset = arm * Math.PI;
          for (let i = 0; i < 80; i++) {
            const t = i / 80;
            const angle = offset + t * Math.PI * 1.6;
            const r = size * 0.08 + t * size * 0.38;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else if (type.includes('不规则')) {
        // 不规则星系: 斑驳光团
        for (let i = 0; i < 30; i++) {
          const x = cx + (Math.random() - 0.5) * size * 0.7;
          const y = cy + (Math.random() - 0.5) * size * 0.7;
          const r = 5 + Math.random() * 25;
          const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
          grad.addColorStop(0, addAlpha(baseColor, 'cc'));
          grad.addColorStop(1, '#000000');
          ctx.fillStyle = grad; ctx.fillRect(x - r, y - r, r * 2, r * 2);
        }
      } else if (type.includes('星暴')) {
        // 星暴星系: 明亮核心+外溢
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.35);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.15, baseColor);
        grad.addColorStop(0.5, addAlpha(baseColor, '80'));
        grad.addColorStop(1, '#000000');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
        for (let i = 0; i < 15; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = size * 0.15 + Math.random() * size * 0.2;
          const x = cx + Math.cos(angle) * dist;
          const y = cy + Math.sin(angle) * dist;
          ctx.fillStyle = '#ffffff60';
          ctx.fillRect(x - 2, y - 2, 4, 4);
        }
      } else if (type.includes('环状')) {
        // 环状星系: 中心+外环
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.08);
        grad.addColorStop(0, baseColor);
        grad.addColorStop(1, '#000000');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
        ctx.beginPath(); ctx.arc(cx, cy, size * 0.35, 0, Math.PI * 2);
        ctx.strokeStyle = addAlpha(baseColor, 'cc'); ctx.lineWidth = 12; ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, size * 0.35, 0, Math.PI * 2);
        ctx.strokeStyle = addAlpha(baseColor, '60'); ctx.lineWidth = 20; ctx.stroke();
      } else if (type.includes('交互')) {
        // 交互星系: 双核+潮汐尾
        const g1 = ctx.createRadialGradient(cx - 20, cy, 0, cx - 20, cy, size * 0.18);
        g1.addColorStop(0, '#ffffff'); g1.addColorStop(0.5, baseColor); g1.addColorStop(1, '#000000');
        ctx.fillStyle = g1; ctx.fillRect(0, 0, size, size);
        const g2 = ctx.createRadialGradient(cx + 25, cy + 10, 0, cx + 25, cy + 10, size * 0.12);
        g2.addColorStop(0, '#ffffff'); g2.addColorStop(0.5, addAlpha(baseColor, 'aa')); g2.addColorStop(1, '#000000');
        ctx.fillStyle = g2; ctx.fillRect(0, 0, size, size);
        // 潮汐尾
        ctx.beginPath(); ctx.strokeStyle = addAlpha(baseColor, '50'); ctx.lineWidth = 3;
        ctx.moveTo(cx - 20, cy); ctx.quadraticCurveTo(cx, cy - 40, cx + 50, cy - 30); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 25, cy + 10); ctx.quadraticCurveTo(cx, cy + 40, cx - 40, cy + 30); ctx.stroke();
      } else if (type.includes('塞弗特')) {
        // 塞弗特星系: 亮核+微弱喷流
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.3);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.1, baseColor);
        grad.addColorStop(0.5, addAlpha(baseColor, '60'));
        grad.addColorStop(1, '#000000');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
        ctx.beginPath(); ctx.strokeStyle = addAlpha(baseColor, '40'); ctx.lineWidth = 2;
        ctx.moveTo(cx, cy - size * 0.05); ctx.lineTo(cx, cy - size * 0.4); ctx.stroke();
        ctx.moveTo(cx, cy + size * 0.05); ctx.lineTo(cx, cy + size * 0.4); ctx.stroke();
      } else if (type.includes('矮')) {
        // 矮星系: 弥散暗淡
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.25);
        grad.addColorStop(0, addAlpha(baseColor, 'aa'));
        grad.addColorStop(0.5, addAlpha(baseColor, '40'));
        grad.addColorStop(1, '#000000');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
      } else if (type.includes('致密')) {
        // 致密星系群
        for (let i = 0; i < 5; i++) {
          const x = cx + (Math.random() - 0.5) * size * 0.3;
          const y = cy + (Math.random() - 0.5) * size * 0.3;
          const grad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.08);
          grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.5, baseColor); grad.addColorStop(1, '#000000');
          ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
        }
      } else if (type.includes('透镜')) {
        // 透镜状星系: 核球+无旋臂+平滑过渡
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.4);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.15, baseColor);
        grad.addColorStop(0.5, addAlpha(baseColor, '60'));
        grad.addColorStop(1, '#000000');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
        // 微弱尘埃带
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.random() * Math.PI);
        ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(-size * 0.4, -size * 0.015, size * 0.8, size * 0.03);
        ctx.restore();
      } else if (type.includes('超亮红外') || type.includes('ULIRG')) {
        // 超亮红外星系: 极亮核心+尘埃遮蔽+外溢
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.3);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.1, '#ffd080');
        grad.addColorStop(0.4, addAlpha(baseColor, '80'));
        grad.addColorStop(1, '#000000');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
        // 尘埃环
        ctx.beginPath(); ctx.arc(cx, cy, size * 0.2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(200,150,80,0.3)'; ctx.lineWidth = 8; ctx.stroke();
      } else if (type.includes('射电') || type.includes('喷流')) {
        // 射电星系: 中心核+双极射电喷流
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.2);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, baseColor);
        grad.addColorStop(1, '#000000');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
        // 双极喷流
        ctx.beginPath(); ctx.strokeStyle = addAlpha(baseColor, '50'); ctx.lineWidth = 4;
        ctx.moveTo(cx, cy - size * 0.05); ctx.lineTo(cx, cy - size * 0.45); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy + size * 0.05); ctx.lineTo(cx, cy + size * 0.45); ctx.stroke();
        // 喷流终端热斑
        ctx.fillStyle = addAlpha(baseColor, '80');
        ctx.beginPath(); ctx.arc(cx, cy - size * 0.45, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy + size * 0.45, 4, 0, Math.PI * 2); ctx.fill();
      } else {
        // 默认星系纹理
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.35);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.2, baseColor);
        grad.addColorStop(0.6, addAlpha(baseColor, '50'));
        grad.addColorStop(1, '#000000');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
      }
      // 添加随机星点
      for (let i = 0; i < 60; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        ctx.fillStyle = `rgba(255,255,255,${0.1 + Math.random() * 0.3})`;
        ctx.fillRect(x, y, 1, 1);
      }
      const tex = new THREE.CanvasTexture(c); tex.needsUpdate = true;
      return tex;
    };

    // 星云程序化纹理生成器
    const createNebulaTexture = (baseColor: string, type: string): THREE.Texture => {
      const size = 256;
      const c = document.createElement('canvas'); c.width = size; c.height = size;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, size, size);
      const cx = size / 2, cy = size / 2;
      if (type.includes('发射') || type.includes('HII')) {
        // 发射星云: 红色云团
        for (let i = 0; i < 20; i++) {
          const x = cx + (Math.random() - 0.5) * size * 0.6;
          const y = cy + (Math.random() - 0.5) * size * 0.6;
          const r = 15 + Math.random() * 40;
          const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
          grad.addColorStop(0, addAlpha(baseColor, 'cc'));
          grad.addColorStop(1, '#000000');
          ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
        }
      } else if (type.includes('反射')) {
        // 反射星云: 蓝色弥漫
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.4);
        grad.addColorStop(0, addAlpha(baseColor, 'aa'));
        grad.addColorStop(0.5, addAlpha(baseColor, '40'));
        grad.addColorStop(1, '#000000');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
      } else if (type.includes('行星状')) {
        // 行星状星云: 环状
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.06);
        grad.addColorStop(0, '#ffffff'); grad.addColorStop(1, '#000000');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
        ctx.beginPath(); ctx.arc(cx, cy, size * 0.3, 0, Math.PI * 2);
        ctx.strokeStyle = addAlpha(baseColor, 'cc'); ctx.lineWidth = 15; ctx.stroke();
      } else if (type.includes('超新星')) {
        // 超新星遗迹: 丝状
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          const r1 = size * 0.1 + Math.random() * size * 0.1;
          const r2 = size * 0.25 + Math.random() * size * 0.1;
          ctx.beginPath(); ctx.strokeStyle = addAlpha(baseColor, '80'); ctx.lineWidth = 3;
          ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
          ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
          ctx.stroke();
        }
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.1);
        grad.addColorStop(0, baseColor); grad.addColorStop(1, '#000000');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
      } else if (type.includes('暗星云') || type.includes('暗')) {
        // 暗星云: 暗色剪影
        for (let i = 0; i < 8; i++) {
          const x = cx + (Math.random() - 0.5) * size * 0.5;
          const y = cy + (Math.random() - 0.5) * size * 0.5;
          const r = 20 + Math.random() * 30;
          ctx.fillStyle = '#0a0a0a'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        }
      } else if (type.includes('分子')) {
        // 分子云: 暗红色致密
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.35);
        grad.addColorStop(0, addAlpha(baseColor, '80'));
        grad.addColorStop(0.5, addAlpha(baseColor, '30'));
        grad.addColorStop(1, '#000000');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
        for (let i = 0; i < 10; i++) {
          const x = cx + (Math.random() - 0.5) * size * 0.4;
          const y = cy + (Math.random() - 0.5) * size * 0.4;
          ctx.fillStyle = 'rgba(50,20,30,0.5)'; ctx.beginPath(); ctx.arc(x, y, 10 + Math.random() * 15, 0, Math.PI * 2); ctx.fill();
        }
      } else {
        // 默认星云
        for (let i = 0; i < 15; i++) {
          const x = cx + (Math.random() - 0.5) * size * 0.5;
          const y = cy + (Math.random() - 0.5) * size * 0.5;
          const r = 10 + Math.random() * 30;
          const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
          grad.addColorStop(0, addAlpha(baseColor, 'aa'));
          grad.addColorStop(1, '#000000');
          ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
        }
      }
      const tex = new THREE.CanvasTexture(c); tex.needsUpdate = true;
      return tex;
    };

    // 渲染所有命名天体(类似太阳系行星渲染方式)
    ALL_COSMIC_OBJECTS.forEach((obj) => {
      const dist3D = distTo3D(obj.distance);
      const h = hashStr(obj.id);
      const theta = seededRandom(h) * Math.PI * 2;
      const phi = Math.acos(2 * seededRandom(h + 1) - 1);
      const x = obj.sceneX || dist3D * Math.sin(phi) * Math.cos(theta);
      const y = obj.sceneY || dist3D * Math.sin(phi) * Math.sin(theta) * 0.3;
      const z = obj.sceneZ || dist3D * Math.cos(phi);
      const vis = COSMIC_OBJECT_TYPE_MAP[obj.type] || COSMIC_OBJECT_TYPE_MAP['其他'];
      const objInfo = { id: obj.id, name: obj.name, type: obj.typeCn, distance: obj.distance >= 10000 ? `${(obj.distance / 10000).toFixed(1)}亿光年` : `${obj.distance}万光年`, catalogEntry: obj };

      if (obj.type === 'galaxy') {
        // ====== 星系: 3D旋转盘/球体+纹理+标签 ======
        const isDisk = obj.typeCn.includes('旋') || obj.typeCn.includes('星暴') || obj.typeCn.includes('交互') || obj.typeCn.includes('致密');
        const sizeScale = obj.typeCn.includes('矮') ? 0.5 : obj.typeCn.includes('超巨型') ? 2.0 : obj.typeCn.includes('椭圆') ? 1.0 : 0.8;
        const galaxyTex = createGalaxyTexture(obj.color, obj.typeCn);

        let mesh: THREE.Mesh;
        if (isDisk) {
          // 盘状星系: 扁平圆柱+加法混合让边缘更柔和
          const radius = sizeScale;
          const height = sizeScale * 0.12;
          const geom = new THREE.CylinderGeometry(radius, radius, height, 32, 1);
          const mat = new THREE.MeshBasicMaterial({ map: galaxyTex, transparent: true, opacity: 0.88, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
          mesh = new THREE.Mesh(geom, mat);
          // 随机倾斜
          mesh.rotation.x = (seededRandom(h + 2) - 0.5) * 1.2;
          mesh.rotation.z = (seededRandom(h + 3) - 0.5) * 0.6;
        } else {
          // 椭圆/球状星系+加法混合
          const radius = sizeScale;
          const geom = new THREE.SphereGeometry(radius, 24, 24);
          const mat = new THREE.MeshBasicMaterial({ map: galaxyTex, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending });
          mesh = new THREE.Mesh(geom, mat);
        }
        mesh.position.set(x, y, z);
        mesh.userData = { cosmicObject: objInfo, autoRotate: true, rotateSpeed: 0.002 + seededRandom(h + 4) * 0.003 };
        universeGroup.add(mesh);

        // 星系光晕(小范围辉光)
        const galHalo = new THREE.Mesh(
          new THREE.SphereGeometry(sizeScale * 1.5, 12, 12),
          new THREE.MeshBasicMaterial({ color: new THREE.Color(obj.color), transparent: true, opacity: 0.06, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide })
        );
        galHalo.position.set(x, y, z);
        universeGroup.add(galHalo);

        // 所有星系都显示标签(类似太阳系行星)
        const labelColor = obj.color || '#88ccff';
        const label = createTextSprite(obj.name, labelColor, 14);
        label.position.set(x, y + sizeScale + 0.8, z);
        label.scale.set(Math.max(obj.name.length * 1.2, 4), 1, 1);
        universeGroup.add(label);

      } else if (['nebula', 'dark_nebula', 'planetary_nebula', 'supernova_remnant', 'hii_region', 'molecular_cloud'].includes(obj.type)) {
        // ====== 星云: 带纹理的半透明球体+标签 ======
        const nebulaTex = createNebulaTexture(obj.color, obj.typeCn);
        const sizeScale = 1.2;
        const geom = new THREE.SphereGeometry(sizeScale, 24, 24);
        const mat = new THREE.MeshBasicMaterial({ map: nebulaTex, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(x, y, z);
        mesh.userData = { cosmicObject: objInfo };
        universeGroup.add(mesh);

        // 星云辉光
        const nebHalo = new THREE.Mesh(
          new THREE.SphereGeometry(1.8, 12, 12),
          new THREE.MeshBasicMaterial({ color: new THREE.Color(obj.color), transparent: true, opacity: 0.04, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide })
        );
        nebHalo.position.set(x, y, z);
        universeGroup.add(nebHalo);

        // 星云标签
        const label = createTextSprite(obj.name, obj.color || '#ff8888', 12);
        label.position.set(x, y + sizeScale + 0.6, z);
        label.scale.set(Math.max(obj.name.length * 0.9, 3), 0.7, 1);
        universeGroup.add(label);

      } else if (obj.type === 'supercluster' || obj.type === 'void') {
        // ====== 超星系团/空洞: 极淡虚线边界+稀疏内点+标签 ======
        const size = obj.type === 'supercluster' ? 2.5 : 3.5;
        // 用极淡点阵代替线框球体，避免多余线条
        const boundaryPts: THREE.Vector3[] = [];
        for (let i = 0; i < 60; i++) {
          const t2 = Math.random() * Math.PI * 2;
          const p2 = Math.acos(2 * Math.random() - 1);
          boundaryPts.push(new THREE.Vector3(
            x + size * Math.sin(p2) * Math.cos(t2),
            y + size * Math.sin(p2) * Math.sin(t2),
            z + size * Math.cos(p2)
          ));
        }
        const bGeom = new THREE.BufferGeometry();
        bGeom.setFromPoints(boundaryPts);
        universeGroup.add(new THREE.Points(bGeom, new THREE.PointsMaterial({ color: obj.color, size: 0.15, transparent: true, opacity: 0.12, sizeAttenuation: true, map: circleTexture, depthWrite: false })));
        const innerPts: THREE.Vector3[] = [];
        const innerCount = obj.type === 'supercluster' ? 200 : 30;
        for (let i = 0; i < innerCount; i++) {
          const r = Math.random() * size * 0.85;
          const t2 = Math.random() * Math.PI * 2;
          const p2 = Math.acos(2 * Math.random() - 1);
          innerPts.push(new THREE.Vector3(
            x + r * Math.sin(p2) * Math.cos(t2),
            y + r * Math.sin(p2) * Math.sin(t2) * 0.4,
            z + r * Math.cos(p2)
          ));
        }
        const iGeom = new THREE.BufferGeometry();
        iGeom.setFromPoints(innerPts);
        universeGroup.add(new THREE.Points(iGeom, new THREE.PointsMaterial({ color: obj.color, size: 0.25, transparent: true, opacity: 0.5, sizeAttenuation: true, map: circleTexture, depthWrite: false, blending: THREE.AdditiveBlending })));

        // 标签
        const label = createTextSprite(obj.name, obj.color || '#ff8888', 12);
        label.position.set(x, y + size + 1, z);
        label.scale.set(Math.max(obj.name.length * 0.9, 3), 0.7, 1);
        universeGroup.add(label);

      } else if (obj.type === 'quasar') {
        // ====== 类星体: 极亮核心+短喷流+标签 ======
        const qGeom = new THREE.SphereGeometry(0.2, 8, 8);
        const qMat = new THREE.MeshBasicMaterial({ color: 0xaabbff });
        const qMesh = new THREE.Mesh(qGeom, qMat);
        qMesh.position.set(x, y, z);
        qMesh.userData = { cosmicObject: objInfo };
        universeGroup.add(qMesh);
        // 喷流(缩短，减淡)
        const jetLen = 1.2;
        const jetUp: THREE.Vector3[] = [new THREE.Vector3(x, y, z), new THREE.Vector3(x, y + jetLen, z)];
        const jetDown: THREE.Vector3[] = [new THREE.Vector3(x, y, z), new THREE.Vector3(x, y - jetLen, z)];
        const jetMat = new THREE.LineBasicMaterial({ color: 0x8888ff, transparent: true, opacity: 0.15 });
        universeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(jetUp), jetMat));
        universeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(jetDown), jetMat));
        // 标签
        const label = createTextSprite(obj.name, '#aabbff', 12);
        label.position.set(x, y + jetLen + 0.5, z);
        label.scale.set(Math.max(obj.name.length * 0.9, 3), 0.7, 1);
        universeGroup.add(label);

      } else if (obj.type === 'pulsar') {
        // ====== 脉冲星: 极小亮点+标签 ======
        const pGeom = new THREE.SphereGeometry(0.15, 6, 6);
        const pMat = new THREE.MeshBasicMaterial({ color: 0x88ffcc });
        const pMesh = new THREE.Mesh(pGeom, pMat);
        pMesh.position.set(x, y, z);
        pMesh.userData = { cosmicObject: objInfo };
        universeGroup.add(pMesh);
        const label = createTextSprite(obj.name, '#88ffcc', 11);
        label.position.set(x, y + 0.8, z);
        label.scale.set(Math.max(obj.name.length * 0.8, 2.5), 0.6, 1);
        universeGroup.add(label);

      } else if ((obj as {type: string}).type === 'galaxy_cluster') {
        // ====== 星系团: 密集星系群+暗物质晕+标签 ======
        const clusterGalPts: THREE.Vector3[] = [];
        const clusterCount = 60;
        for (let i = 0; i < clusterCount; i++) {
          const r = Math.random() * 2;
          const t2 = Math.random() * Math.PI * 2;
          const p2 = Math.acos(2 * Math.random() - 1);
          clusterGalPts.push(new THREE.Vector3(
            x + r * Math.sin(p2) * Math.cos(t2),
            y + r * Math.sin(p2) * Math.sin(t2) * 0.5,
            z + r * Math.cos(p2)
          ));
        }
        const cgGeom = new THREE.BufferGeometry();
        cgGeom.setFromPoints(clusterGalPts);
        universeGroup.add(new THREE.Points(cgGeom, new THREE.PointsMaterial({ color: 0x8899cc, size: 0.3, transparent: true, opacity: 0.6, sizeAttenuation: true, map: circleTexture, depthWrite: false, blending: THREE.AdditiveBlending })));
        // 星系团暗物质晕(极淡)
        const clusterHalo = new THREE.Mesh(
          new THREE.SphereGeometry(3, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0x223355, transparent: true, opacity: 0.03, depthWrite: false, side: THREE.BackSide })
        );
        clusterHalo.position.set(x, y, z);
        universeGroup.add(clusterHalo);
        const label = createTextSprite(obj.name, '#8899cc', 13);
        label.position.set(x, y + 3, z);
        label.scale.set(Math.max(obj.name.length * 1.0, 4), 0.8, 1);
        universeGroup.add(label);

      } else if (obj.type === 'star_cluster') {
        // ====== 星团: 紧密星群+标签 ======
        const clusterPts: THREE.Vector3[] = [];
        const count = 40;
        for (let i = 0; i < count; i++) {
          const r = Math.random() * 0.8;
          const t2 = Math.random() * Math.PI * 2;
          const p2 = Math.acos(2 * Math.random() - 1);
          clusterPts.push(new THREE.Vector3(
            x + r * Math.sin(p2) * Math.cos(t2),
            y + r * Math.sin(p2) * Math.sin(t2),
            z + r * Math.cos(p2)
          ));
        }
        const cGeom = new THREE.BufferGeometry();
        cGeom.setFromPoints(clusterPts);
        universeGroup.add(new THREE.Points(cGeom, new THREE.PointsMaterial({ color: 0xffddaa, size: 0.15, transparent: true, opacity: 0.8, sizeAttenuation: true, map: circleTexture, depthWrite: false, blending: THREE.AdditiveBlending })));
        const label = createTextSprite(obj.name, '#ffddaa', 12);
        label.position.set(x, y + 1.5, z);
        label.scale.set(Math.max(obj.name.length * 0.9, 3), 0.7, 1);
        universeGroup.add(label);

      } else if (obj.type === 'filament') {
        // ====== 纤维: 极淡弧线+标签(几乎不可见,仅作为结构暗示) ======
        const len = 8;
        const dir = seededRandom(h + 5) * Math.PI * 2;
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i <= 10; i++) {
          const t = i / 10;
          pts.push(new THREE.Vector3(
            x + Math.cos(dir) * len * (t - 0.5) + (Math.random() - 0.5) * 0.8,
            y + (Math.random() - 0.5) * 0.5,
            z + Math.sin(dir) * len * (t - 0.5) + (Math.random() - 0.5) * 0.8
          ));
        }
        universeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x223366, transparent: true, opacity: 0.01 })));
        const label = createTextSprite(obj.name, '#4466aa', 11);
        label.position.set(x, y + 3, z);
        label.scale.set(Math.max(obj.name.length * 0.8, 3), 0.6, 1);
        universeGroup.add(label);

      } else {
        // ====== 其他天体: 默认小球+标签 ======
        const gGeom = new THREE.SphereGeometry(0.8, 16, 16);
        const gMat = new THREE.MeshBasicMaterial({ color: obj.color || '#ffffff', transparent: true, opacity: 0.8 });
        const gMesh = new THREE.Mesh(gGeom, gMat);
        gMesh.position.set(x, y, z);
        gMesh.userData = { cosmicObject: objInfo };
        universeGroup.add(gMesh);
        const label = createTextSprite(obj.name, obj.color || '#ffffff', 11);
        label.position.set(x, y + 1.5, z);
        label.scale.set(Math.max(obj.name.length * 0.8, 3), 0.6, 1);
        universeGroup.add(label);
      }
    });

    // ====== 程序化生成: 代表2万亿星系的宇宙大尺度结构 ======
    // 命名天体已经渲染在场景中，现在添加程序化生成的背景星系

    // 1. 宇宙纤维网络 - 沿纤维分布的星系团和星系
    const filamentPaths: [number, number, number][][] = [];
    // 银河系到各超星系团的纤维
    const superclusters = ALL_COSMIC_OBJECTS.filter(o => o.type === 'supercluster');
    const scPositions: [number, number, number][] = [[0, 0, 0]]; // 从银河系出发
    superclusters.forEach(o => { scPositions.push([o.sceneX, o.sceneY, o.sceneZ]); });
    // 超星系团之间的纤维(减少连接数和抖动)
    for (let i = 0; i < scPositions.length; i++) {
      for (let j = i + 1; j < scPositions.length; j++) {
        if (Math.random() < 0.75) continue; // 只连接25%的节点
        const pts: [number, number, number][] = [];
        const steps = 20;
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          pts.push([
            scPositions[i][0] * (1-t) + scPositions[j][0] * t + (Math.random() - 0.5) * 3,
            scPositions[i][1] * (1-t) + scPositions[j][1] * t + (Math.random() - 0.5) * 1.5,
            scPositions[i][2] * (1-t) + scPositions[j][2] * t + (Math.random() - 0.5) * 3
          ]);
        }
        filamentPaths.push(pts);
      }
    }

    // 2. 沿纤维和节点生成背景星系点(20000，圆形纹理+加法混合+大小变化)
    const bgGalaxyCount = 20000;
    const bgGalaxyPos = new Float32Array(bgGalaxyCount * 3);
    const bgGalaxyColors = new Float32Array(bgGalaxyCount * 3);
    const bgGalaxySizes = new Float32Array(bgGalaxyCount);

    const galaxyColorPalette = [
      [0.7, 0.8, 1.0],   // 蓝白
      [0.9, 0.9, 1.0],   // 白
      [1.0, 0.95, 0.7],  // 黄白
      [1.0, 0.8, 0.5],   // 橙黄
      [0.8, 0.6, 0.4],   // 红橙
    ];

    let bgIdx = 0;
    // 沿纤维分布星系(70%)
    for (const filament of filamentPaths) {
      const galaxiesPerFilament = Math.ceil(bgGalaxyCount * 0.7 / filamentPaths.length);
      for (let g = 0; g < galaxiesPerFilament && bgIdx < bgGalaxyCount * 0.7; g++) {
        const segIdx = Math.floor(Math.random() * (filament.length - 1));
        const t = Math.random();
        const basePt = filament[segIdx];
        const nextPt = filament[Math.min(segIdx + 1, filament.length - 1)];
        const spread = 8 + Math.random() * 15;
        bgGalaxyPos[bgIdx * 3] = basePt[0] * (1-t) + nextPt[0] * t + (Math.random() - 0.5) * spread;
        bgGalaxyPos[bgIdx * 3 + 1] = basePt[1] * (1-t) + nextPt[1] * t + (Math.random() - 0.5) * spread * 0.3;
        bgGalaxyPos[bgIdx * 3 + 2] = basePt[2] * (1-t) + nextPt[2] * t + (Math.random() - 0.5) * spread;
        const col = galaxyColorPalette[Math.floor(Math.random() * galaxyColorPalette.length)];
        bgGalaxyColors[bgIdx * 3] = col[0];
        bgGalaxyColors[bgIdx * 3 + 1] = col[1];
        bgGalaxyColors[bgIdx * 3 + 2] = col[2];
        bgGalaxySizes[bgIdx] = 0.15 + Math.random() * 0.6;
        bgIdx++;
      }
    }
    while (bgIdx < bgGalaxyCount) {
      const r = 50 + Math.random() * 700;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      bgGalaxyPos[bgIdx * 3] = r * Math.sin(phi) * Math.cos(theta);
      bgGalaxyPos[bgIdx * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.3;
      bgGalaxyPos[bgIdx * 3 + 2] = r * Math.cos(phi);
      const col = galaxyColorPalette[Math.floor(Math.random() * galaxyColorPalette.length)];
      bgGalaxyColors[bgIdx * 3] = col[0];
      bgGalaxyColors[bgIdx * 3 + 1] = col[1];
      bgGalaxyColors[bgIdx * 3 + 2] = col[2];
      bgIdx++;
    }

    const bgGalaxyGeom = new THREE.BufferGeometry();
    bgGalaxyGeom.setAttribute('position', new THREE.BufferAttribute(bgGalaxyPos, 3));
    bgGalaxyGeom.setAttribute('color', new THREE.BufferAttribute(bgGalaxyColors, 3));
    bgGalaxyGeom.setAttribute('size', new THREE.BufferAttribute(bgGalaxySizes, 1));
    const bgGalaxyMat = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      sizeAttenuation: true,
      map: circleTexture,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const bgGalaxies = new THREE.Points(bgGalaxyGeom, bgGalaxyMat);
    universeGroup.add(bgGalaxies);

    // 3. 绘制可见的宇宙纤维线(极淡，仅作为大尺度结构骨架暗示)
    for (const filament of filamentPaths) {
      const pts = filament.map(p => new THREE.Vector3(p[0], p[1], p[2]));
      const filGeom = new THREE.BufferGeometry();
      filGeom.setFromPoints(pts);
      universeGroup.add(new THREE.Line(filGeom, new THREE.LineBasicMaterial({ color: 0x1a2a55, transparent: true, opacity: 0.005 })));
    }

    // 4. 宇宙空洞标记 - 在纤维间隙用极淡点阵表示(避免线框遮挡)
    const voidPositions = ALL_COSMIC_OBJECTS.filter(o => o.type === 'void');
    voidPositions.forEach(v => {
      const voidPts: THREE.Vector3[] = [];
      for (let i = 0; i < 30; i++) {
        const t2 = Math.random() * Math.PI * 2;
        const p2 = Math.acos(2 * Math.random() - 1);
        const r = 4 + Math.random() * 2;
        voidPts.push(new THREE.Vector3(
          v.sceneX + r * Math.sin(p2) * Math.cos(t2),
          v.sceneY + r * Math.sin(p2) * Math.sin(t2),
          v.sceneZ + r * Math.cos(p2)
        ));
      }
      const vGeom = new THREE.BufferGeometry();
      vGeom.setFromPoints(voidPts);
      universeGroup.add(new THREE.Points(vGeom, new THREE.PointsMaterial({ color: 0x1a1a30, size: 0.15, transparent: true, opacity: 0.1, sizeAttenuation: true, map: circleTexture, depthWrite: false })));
    });

    // ====== 程序化生成: 星云云团（代表宇宙中数百万星云） ======
    // 星云类型和颜色
    const nebulaTypes = [
      { color: [1.0, 0.3, 0.2], name: '发射星云' },   // 红/粉
      { color: [0.3, 0.6, 1.0], name: '反射星云' },   // 蓝
      { color: [0.2, 0.8, 0.3], name: '行星状星云' },  // 绿
      { color: [1.0, 0.6, 0.1], name: '超新星残骸' },  // 橙
      { color: [0.8, 0.2, 0.8], name: '暗星云' },      // 暗紫
      { color: [0.2, 0.9, 0.9], name: 'HII区' },       // 青
      { color: [0.6, 0.4, 0.9], name: '分子云' },       // 紫
      { color: [1.0, 0.9, 0.4], name: '原行星盘' },     // 黄
    ];
    
    // 沿银河系盘面分布密集星云（~800个，缩小尺寸避免与近邻星系重叠）
    const nebulaCount = 800;
    const nebulaPos = new Float32Array(nebulaCount * 3);
    const nebulaColors = new Float32Array(nebulaCount * 3);
    for (let i = 0; i < nebulaCount; i++) {
      // 主要沿银河系盘面分布(扁平分布，限制在盘面半径内)
      const r = 3 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      nebulaPos[i * 3] = r * Math.cos(theta) + (Math.random() - 0.5) * 3;
      nebulaPos[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      nebulaPos[i * 3 + 2] = r * Math.sin(theta) + (Math.random() - 0.5) * 3;
      const nType = nebulaTypes[Math.floor(Math.random() * nebulaTypes.length)];
      nebulaColors[i * 3] = nType.color[0];
      nebulaColors[i * 3 + 1] = nType.color[1];
      nebulaColors[i * 3 + 2] = nType.color[2];
    }
    const nebulaGeom = new THREE.BufferGeometry();
    nebulaGeom.setAttribute('position', new THREE.BufferAttribute(nebulaPos, 3));
    nebulaGeom.setAttribute('color', new THREE.BufferAttribute(nebulaColors, 3));
    const nebulaMat = new THREE.PointsMaterial({
      size: 0.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.12,
      sizeAttenuation: true,
      map: circleTexture,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    universeGroup.add(new THREE.Points(nebulaGeom, nebulaMat));
    
    // 远处星云（~500个，更小更淡）
    const remoteNebulaCount = 500;
    const remoteNebPos = new Float32Array(remoteNebulaCount * 3);
    const remoteNebColors = new Float32Array(remoteNebulaCount * 3);
    for (let i = 0; i < remoteNebulaCount; i++) {
      // 沿纤维随机分布
      const filament = filamentPaths[Math.floor(Math.random() * Math.max(filamentPaths.length, 1))];
      if (filament && filament.length > 0) {
        const segIdx = Math.floor(Math.random() * filament.length);
        const pt = filament[segIdx];
        remoteNebPos[i * 3] = pt[0] + (Math.random() - 0.5) * 20;
        remoteNebPos[i * 3 + 1] = pt[1] + (Math.random() - 0.5) * 8;
        remoteNebPos[i * 3 + 2] = pt[2] + (Math.random() - 0.5) * 20;
      } else {
        const r = 100 + Math.random() * 400;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        remoteNebPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        remoteNebPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.3;
        remoteNebPos[i * 3 + 2] = r * Math.cos(phi);
      }
      const nType = nebulaTypes[Math.floor(Math.random() * nebulaTypes.length)];
      remoteNebColors[i * 3] = nType.color[0];
      remoteNebColors[i * 3 + 1] = nType.color[1];
      remoteNebColors[i * 3 + 2] = nType.color[2];
    }
    const remoteNebGeom = new THREE.BufferGeometry();
    remoteNebGeom.setAttribute('position', new THREE.BufferAttribute(remoteNebPos, 3));
    remoteNebGeom.setAttribute('color', new THREE.BufferAttribute(remoteNebColors, 3));
    const remoteNebMat = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.06,
      sizeAttenuation: true,
      map: circleTexture,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    universeGroup.add(new THREE.Points(remoteNebGeom, remoteNebMat));

    // ====== 恒星场（银河系内恒星） ======
    const starFieldCount = 6000;
    const starFieldPos = new Float32Array(starFieldCount * 3);
    const starFieldColors = new Float32Array(starFieldCount * 3);
    // 恒星颜色: O蓝→B蓝白→A白→F黄白→G黄→K橙→M红
    const starColorPalette = [
      [0.6, 0.7, 1.0],   // O型蓝
      [0.7, 0.8, 1.0],   // B型蓝白
      [0.9, 0.9, 1.0],   // A型白
      [1.0, 1.0, 0.85],  // F型黄白
      [1.0, 0.95, 0.6],  // G型黄(太阳)
      [1.0, 0.7, 0.3],   // K型橙
      [1.0, 0.4, 0.2],   // M型红
    ];
    for (let i = 0; i < starFieldCount; i++) {
      // 螺旋臂分布
      const armIdx = Math.floor(Math.random() * 4);
      const armAngle = armIdx * Math.PI / 2;
      const r = 5 + Math.random() * 70;
      const spiralAngle = armAngle + r * 0.04 + (Math.random() - 0.5) * 0.5;
      starFieldPos[i * 3] = r * Math.cos(spiralAngle) + (Math.random() - 0.5) * 4;
      starFieldPos[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      starFieldPos[i * 3 + 2] = r * Math.sin(spiralAngle) + (Math.random() - 0.5) * 4;
      const sColor = starColorPalette[Math.floor(Math.random() * starColorPalette.length)];
      starFieldColors[i * 3] = sColor[0];
      starFieldColors[i * 3 + 1] = sColor[1];
      starFieldColors[i * 3 + 2] = sColor[2];
    }
    const starFieldGeom = new THREE.BufferGeometry();
    starFieldGeom.setAttribute('position', new THREE.BufferAttribute(starFieldPos, 3));
    starFieldGeom.setAttribute('color', new THREE.BufferAttribute(starFieldColors, 3));
    const starFieldMat = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      map: circleTexture,
      depthWrite: false,
    });
    universeGroup.add(new THREE.Points(starFieldGeom, starFieldMat));

    // ====== 主要星系详细3D模型（近距离可见） ======
    // 为知名星系生成详细粒子模型
    const detailGalaxies = [
      { id: 'andromeda', name: '仙女座星系', type: 'spiral', color: [0.9, 0.85, 0.6], arms: 2, tilt: 0.3, size: 3.0 },
      { id: 'triangulum', name: '三角座星系', type: 'spiral', color: [0.6, 0.8, 1.0], arms: 2, tilt: 0.5, size: 1.5 },
      { id: 'centaurus-a', name: '半人马A', type: 'elliptical', color: [1.0, 0.6, 0.3], arms: 0, tilt: 0.2, size: 2.5 },
      { id: 'whirlpool', name: '涡状星系', type: 'spiral', color: [0.7, 0.9, 1.0], arms: 2, tilt: 0.4, size: 2.0 },
      { id: 'sombrero', name: '草帽星系', type: 'lenticular', color: [0.95, 0.85, 0.5], arms: 0, tilt: 0.85, size: 2.2 },
      { id: 'lmc', name: '大麦哲伦云', type: 'irregular', color: [0.5, 0.8, 1.0], arms: 0, tilt: 0.3, size: 1.8 },
      { id: 'smc', name: '小麦哲伦云', type: 'irregular', color: [0.6, 0.7, 1.0], arms: 0, tilt: 0.4, size: 1.0 },
      { id: 'pinwheel', name: '风车星系', type: 'spiral', color: [0.8, 0.9, 1.0], arms: 5, tilt: 0.15, size: 2.5 },
      { id: 'cartwheel', name: '车轮星系', type: 'ring', color: [0.5, 1.0, 0.8], arms: 0, tilt: 0.2, size: 2.0 },
      { id: 'ic1101', name: 'IC 1101', type: 'elliptical', color: [1.0, 0.8, 0.5], arms: 0, tilt: 0.1, size: 4.0 },
    ];
    // 找到每个星系在ALL_COSMIC_OBJECTS中的3D位置
    for (const dg of detailGalaxies) {
      const cosmicObj = ALL_COSMIC_OBJECTS.find(o => o.id === dg.id);
      if (!cosmicObj) continue;
      const gx = cosmicObj.sceneX ?? distTo3D(cosmicObj.distance);
      const gy = cosmicObj.sceneY ?? 0;
      const gz = cosmicObj.sceneZ ?? (Math.sin(cosmicObj.id.charCodeAt(0) * 0.1) * 30);
      const galaxyGroup = new THREE.Group();
      galaxyGroup.position.set(gx, gy, gz);
      const particleCount = dg.type === 'elliptical' ? 2000 : dg.type === 'irregular' ? 800 : 1500;
      const gPositions = new Float32Array(particleCount * 3);
      const gColors = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        let px: number, py: number, pz: number;
        if (dg.type === 'spiral' && dg.arms > 0) {
          // 螺旋星系：旋臂+核球
          const isBulge = Math.random() < 0.25;
          if (isBulge) {
            const r = Math.random() * dg.size * 0.15;
            const th = Math.random() * Math.PI * 2;
            const ph = Math.acos(2 * Math.random() - 1);
            px = r * Math.sin(ph) * Math.cos(th);
            py = r * Math.cos(ph) * 0.6;
            pz = r * Math.sin(ph) * Math.sin(th);
          } else {
            const arm = Math.floor(Math.random() * dg.arms);
            const t = Math.random() * 3;
            const r = t * dg.size * 0.3;
            const angle = t * 2.2 + arm * (Math.PI * 2 / dg.arms);
            px = r * Math.cos(angle) + (Math.random() - 0.5) * dg.size * 0.12;
            py = (Math.random() - 0.5) * dg.size * 0.04;
            pz = r * Math.sin(angle) + (Math.random() - 0.5) * dg.size * 0.12;
          }
        } else if (dg.type === 'elliptical') {
          // 椭圆星系：椭球分布
          const r = Math.pow(Math.random(), 0.5) * dg.size;
          const th = Math.random() * Math.PI * 2;
          const ph = Math.acos(2 * Math.random() - 1);
          px = r * Math.sin(ph) * Math.cos(th) * 0.8;
          py = r * Math.cos(ph) * 0.5;
          pz = r * Math.sin(ph) * Math.sin(th) * 0.8;
        } else if (dg.type === 'lenticular') {
          // 透镜状：扁平核球+盘面
          const isBulge = Math.random() < 0.3;
          if (isBulge) {
            const r = Math.random() * dg.size * 0.15;
            const th = Math.random() * Math.PI * 2;
            const ph = Math.acos(2 * Math.random() - 1);
            px = r * Math.sin(ph) * Math.cos(th);
            py = r * Math.cos(ph) * 0.8;
            pz = r * Math.sin(ph) * Math.sin(th);
          } else {
            const r = Math.random() * dg.size * 0.4;
            const th = Math.random() * Math.PI * 2;
            px = r * Math.cos(th) + (Math.random() - 0.5) * 0.2;
            py = (Math.random() - 0.5) * dg.size * 0.02;
            pz = r * Math.sin(th) + (Math.random() - 0.5) * 0.2;
          }
        } else if (dg.type === 'ring') {
          // 环星系
          const isCore = Math.random() < 0.3;
          if (isCore) {
            const r = Math.random() * dg.size * 0.1;
            const th = Math.random() * Math.PI * 2;
            px = r * Math.cos(th);
            py = (Math.random() - 0.5) * dg.size * 0.02;
            pz = r * Math.sin(th);
          } else {
            const angle = Math.random() * Math.PI * 2;
            const ringR = dg.size * (0.25 + Math.random() * 0.1);
            px = ringR * Math.cos(angle) + (Math.random() - 0.5) * dg.size * 0.05;
            py = (Math.random() - 0.5) * dg.size * 0.02;
            pz = ringR * Math.sin(angle) + (Math.random() - 0.5) * dg.size * 0.05;
          }
        } else {
          // 不规则星系：随机团块
          const blob = Math.floor(Math.random() * 3);
          const cx = (blob - 1) * dg.size * 0.3;
          const cy = (Math.random() - 0.5) * dg.size * 0.15;
          const cz = (Math.random() - 0.5) * dg.size * 0.2;
          px = cx + (Math.random() - 0.5) * dg.size * 0.25;
          py = cy;
          pz = cz + (Math.random() - 0.5) * dg.size * 0.25;
        }
        // 应用倾斜
        const cosT = Math.cos(dg.tilt);
        const sinT = Math.sin(dg.tilt);
        const rotY = py * cosT - pz * sinT;
        const rotZ = py * sinT + pz * cosT;
        gPositions[i * 3] = px;
        gPositions[i * 3 + 1] = rotY;
        gPositions[i * 3 + 2] = rotZ;
        // 颜色：核球区域偏暖，外围偏冷
        const distFromCenter = Math.sqrt(px * px + pz * pz) / dg.size;
        const isWarm = distFromCenter < 0.2;
        if (isWarm) {
          gColors[i * 3] = 1.0;
          gColors[i * 3 + 1] = 0.85;
          gColors[i * 3 + 2] = 0.5;
        } else {
          gColors[i * 3] = dg.color[0] * (0.6 + Math.random() * 0.4);
          gColors[i * 3 + 1] = dg.color[1] * (0.6 + Math.random() * 0.4);
          gColors[i * 3 + 2] = dg.color[2] * (0.6 + Math.random() * 0.4);
        }
      }
      const gGeom = new THREE.BufferGeometry();
      gGeom.setAttribute('position', new THREE.BufferAttribute(gPositions, 3));
      gGeom.setAttribute('color', new THREE.BufferAttribute(gColors, 3));
      const gMat = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true,
        map: circleTexture,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      galaxyGroup.add(new THREE.Points(gGeom, gMat));
      // 添加一个微弱光晕
      const haloGeom = new THREE.SphereGeometry(dg.size * 0.35, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(dg.color[0] * 0.5, dg.color[1] * 0.5, dg.color[2] * 0.5), transparent: true, opacity: 0.04, depthWrite: false });
      galaxyGroup.add(new THREE.Mesh(haloGeom, haloMat));
      universeGroup.add(galaxyGroup);
    }

    // ====== 统计信息标签 ======
    const statsLabel = createTextSprite(`2万亿+星系 | 2×10²³恒星 | 3000+星云 | ${ALL_COSMIC_SUBSTANCES.length}种物质 | 可观测宇宙 Φ930亿光年`, '#3a7cc8', 9);
    statsLabel.position.set(0, -8, 0);
    statsLabel.scale.set(35, 4, 1);
    universeGroup.add(statsLabel);

    // ====== 远景星场 ======
    // 中距离星场(2000颗，较亮，有色彩)
    const midStarCount = 2000;
    const midStarPos = new Float32Array(midStarCount * 3);
    const midStarColors = new Float32Array(midStarCount * 3);
    for (let i = 0; i < midStarCount; i++) {
      const r = 500 + Math.random() * 400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      midStarPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      midStarPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      midStarPos[i * 3 + 2] = r * Math.cos(phi);
      const sc = starColorPalette[Math.floor(Math.random() * starColorPalette.length)];
      midStarColors[i * 3] = sc[0] * 0.6;
      midStarColors[i * 3 + 1] = sc[1] * 0.6;
      midStarColors[i * 3 + 2] = sc[2] * 0.6;
    }
    const midStarGeom = new THREE.BufferGeometry();
    midStarGeom.setAttribute('position', new THREE.BufferAttribute(midStarPos, 3));
    midStarGeom.setAttribute('color', new THREE.BufferAttribute(midStarColors, 3));
    universeGroup.add(new THREE.Points(midStarGeom, new THREE.PointsMaterial({ size: 0.15, vertexColors: true, sizeAttenuation: true, map: circleTexture, transparent: true, opacity: 0.7, depthWrite: false })));

    // 远距离星场(12000颗，微弱白点)
    const farStarCount = 12000;
    const farStarPos = new Float32Array(farStarCount * 3);
    for (let i = 0; i < farStarCount; i++) {
      const r = 900 + Math.random() * 600;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      farStarPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      farStarPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      farStarPos[i * 3 + 2] = r * Math.cos(phi);
    }
    const farStarGeom = new THREE.BufferGeometry();
    farStarGeom.setAttribute('position', new THREE.BufferAttribute(farStarPos, 3));
    const farStarMat = new THREE.PointsMaterial({ color: 0xccccdd, size: 0.12, sizeAttenuation: true, map: circleTexture, transparent: true, opacity: 0.5, depthWrite: false });
    const farStars = new THREE.Points(farStarGeom, farStarMat);
    farStars.visible = false;
    universeGroup.add(farStars);

    // ====== 暗物质粒子云(动态流动,不是静态球壳!) ======
    const darkMatterGroup = new THREE.Group();
    darkMatterGroup.name = 'darkMatterGroup';
    // 银河系暗物质晕 → 粒子云
    const mwDmCount = 3000;
    const mwDmPositions = new Float32Array(mwDmCount * 3);
    const mwDmPhases = new Float32Array(mwDmCount);
    const mwDmRadii = new Float32Array(mwDmCount);
    const mwDmYBase = new Float32Array(mwDmCount);
    for (let i = 0; i < mwDmCount; i++) {
      const r = 20 + Math.random() * 110;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * r * 0.4;
      mwDmPositions[i * 3] = r * Math.cos(angle);
      mwDmPositions[i * 3 + 1] = y;
      mwDmPositions[i * 3 + 2] = r * Math.sin(angle);
      mwDmPhases[i] = angle;
      mwDmRadii[i] = r;
      mwDmYBase[i] = y;
    }
    const mwDmGeom = new THREE.BufferGeometry();
    mwDmGeom.setAttribute('position', new THREE.BufferAttribute(mwDmPositions, 3));
    const mwDmMat = new THREE.PointsMaterial({
      color: 0x8844ff,
      size: 0.8,
      transparent: true,
      opacity: 0.3,
      map: circleTexture,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const mwDmPts = new THREE.Points(mwDmGeom, mwDmMat);
    mwDmPts.userData.isDarkMatterParticles = true;
    mwDmPts.userData.dmPhases = mwDmPhases;
    mwDmPts.userData.dmRadii = mwDmRadii;
    mwDmPts.userData.dmYBase = mwDmYBase;
    darkMatterGroup.add(mwDmPts);
    // 暗物质纤维 → 沿纤维线的粒子流
    const dmFilaments = [
      { start: [-60, 5, -30], end: [60, -5, 40] },
      { start: [-40, 10, 50], end: [50, -3, -50] },
      { start: [0, 20, -70], end: [0, -15, 70] },
    ];
    dmFilaments.forEach((fil) => {
      const s = new THREE.Vector3(...fil.start);
      const e = new THREE.Vector3(...fil.end);
      const filCount = 800;
      const filPositions = new Float32Array(filCount * 3);
      const filPhases = new Float32Array(filCount);
      const filRadii = new Float32Array(filCount);
      const filYBase = new Float32Array(filCount);
      for (let i = 0; i < filCount; i++) {
        const t = Math.random();
        const pos = s.clone().lerp(e, t);
        const offset = (Math.random() - 0.5) * 15;
        pos.x += offset;
        pos.y += (Math.random() - 0.5) * 8;
        pos.z += (Math.random() - 0.5) * 15;
        const r = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
        const angle = Math.atan2(pos.z, pos.x);
        filPositions[i * 3] = pos.x;
        filPositions[i * 3 + 1] = pos.y;
        filPositions[i * 3 + 2] = pos.z;
        filPhases[i] = angle;
        filRadii[i] = r;
        filYBase[i] = pos.y;
      }
      const filGeom = new THREE.BufferGeometry();
      filGeom.setAttribute('position', new THREE.BufferAttribute(filPositions, 3));
      const filMat = new THREE.PointsMaterial({
        color: 0x6622cc,
        size: 0.6,
        transparent: true,
        opacity: 0.25,
        map: circleTexture,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const filPts = new THREE.Points(filGeom, filMat);
      filPts.userData.isDarkMatterParticles = true;
      filPts.userData.dmPhases = filPhases;
      filPts.userData.dmRadii = filRadii;
      filPts.userData.dmYBase = filYBase;
      darkMatterGroup.add(filPts);
    });
    // 各星系暗物质小晕 → 粒子云
    ALL_COSMIC_OBJECTS.filter(o => o.type === 'galaxy').forEach(g => {
      const dmR = (g.typeCn?.includes('矮') ? 6 : 10) + Math.random() * 4;
      const smallCount = 200;
      const sPositions = new Float32Array(smallCount * 3);
      const sPhases = new Float32Array(smallCount);
      const sRadii = new Float32Array(smallCount);
      const sYBase = new Float32Array(smallCount);
      for (let i = 0; i < smallCount; i++) {
        const r = Math.random() * dmR;
        const angle = Math.random() * Math.PI * 2;
        const y = (Math.random() - 0.5) * r * 0.3;
        sPositions[i * 3] = g.sceneX + r * Math.cos(angle);
        sPositions[i * 3 + 1] = g.sceneY + y;
        sPositions[i * 3 + 2] = g.sceneZ + r * Math.sin(angle);
        sPhases[i] = angle;
        sRadii[i] = r;
        sYBase[i] = y;
      }
      const sGeom = new THREE.BufferGeometry();
      sGeom.setAttribute('position', new THREE.BufferAttribute(sPositions, 3));
      const sMat = new THREE.PointsMaterial({
        color: 0x9955ff,
        size: 0.4,
        transparent: true,
        opacity: 0.2,
        map: circleTexture,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const sPts = new THREE.Points(sGeom, sMat);
      sPts.userData.isDarkMatterParticles = true;
      sPts.userData.dmPhases = sPhases;
      sPts.userData.dmRadii = sRadii;
      sPts.userData.dmYBase = sYBase;
      sPts.userData.centerOffset = { x: g.sceneX, y: g.sceneY, z: g.sceneZ };
      darkMatterGroup.add(sPts);
    });
    universeGroup.add(darkMatterGroup);

    // ====== 宇宙微波背景辐射(CMB) ======
    const cmbGeom = new THREE.SphereGeometry(1500, 32, 32);
    const cmbCanvas = document.createElement('canvas');
    cmbCanvas.width = 512; cmbCanvas.height = 256;
    const cmbCtx = cmbCanvas.getContext('2d')!;
    // 程序化CMB温度涨落
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 512; x++) {
        const noise = Math.sin(x * 0.08) * Math.cos(y * 0.1) * 0.3
          + Math.sin(x * 0.03 + y * 0.05) * 0.4
          + Math.random() * 0.3;
        const t = 0.5 + noise * 0.5;
        const r = Math.floor(255 * Math.min(1, t * 1.2));
        const g = Math.floor(255 * Math.min(1, t * 0.8));
        const b = Math.floor(255 * Math.min(1, 0.6 + t * 0.4));
        cmbCtx.fillStyle = `rgb(${r},${g},${b})`;
        cmbCtx.fillRect(x, y, 1, 1);
      }
    }
    const cmbTex = new THREE.CanvasTexture(cmbCanvas);
    const cmbMat = new THREE.MeshBasicMaterial({
      map: cmbTex,
      transparent: true,
      opacity: 0.06,
      depthWrite: false,
      side: THREE.BackSide,
    });
    const cmb = new THREE.Mesh(cmbGeom, cmbMat);
    cmb.name = 'cmb';
    universeGroup.add(cmb);

    // ====== 星际介质(银河系内弥散气体) ======
    const ismCount = 4000;
    const ismPos = new Float32Array(ismCount * 3);
    const ismColors = new Float32Array(ismCount * 3);
    for (let i = 0; i < ismCount; i++) {
      // 沿螺旋臂分布
      const armIdx = Math.floor(Math.random() * 4);
      const armAngle = (armIdx / 4) * Math.PI * 2;
      const r = 8 + Math.random() * 90;
      const angle = armAngle + r * 0.025 + (Math.random() - 0.5) * 0.5;
      ismPos[i * 3] = r * Math.cos(angle);
      ismPos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      ismPos[i * 3 + 2] = r * Math.sin(angle);
      // 颜色: HII区偏红, 分子云偏暗紫, 弥散氢偏蓝
      const rnd = Math.random();
      if (rnd < 0.3) { ismColors[i*3]=0.6; ismColors[i*3+1]=0.2; ismColors[i*3+2]=0.2; }
      else if (rnd < 0.6) { ismColors[i*3]=0.3; ismColors[i*3+1]=0.1; ismColors[i*3+2]=0.5; }
      else { ismColors[i*3]=0.2; ismColors[i*3+1]=0.3; ismColors[i*3+2]=0.6; }
    }
    const ismGeom = new THREE.BufferGeometry();
    ismGeom.setAttribute('position', new THREE.BufferAttribute(ismPos, 3));
    ismGeom.setAttribute('color', new THREE.BufferAttribute(ismColors, 3));
    const ismMat = new THREE.PointsMaterial({
      size: 0.6,
      transparent: true,
      opacity: 0.12,
      vertexColors: true,
      map: circleTexture,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const ism = new THREE.Points(ismGeom, ismMat);
    ism.visible = false;
    universeGroup.add(ism);

    // ====== 宇宙模式点击检测 ======
    const cosmicMeshes = universeGroup.children.filter(c => c.userData?.cosmicObject && c instanceof THREE.Mesh) as THREE.Mesh[];

    // ====== 星际探针(AI智能体) 3D模型 ======
    const probeGroup = new THREE.Group();
    probeGroup.name = 'wanderProbe';

    // 探针主体 - 八面体（钻石形）— 缩小尺寸
    const probeBodyGeom = new THREE.OctahedronGeometry(0.15, 0);
    const probeBodyMat = new THREE.MeshPhongMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.6, shininess: 100, transparent: true, opacity: 0.95 });
    const probeBody = new THREE.Mesh(probeBodyGeom, probeBodyMat);
    probeGroup.add(probeBody);

    // 探针光环（扫描环）— 缩小
    const probeRingGeom = new THREE.TorusGeometry(0.25, 0.02, 8, 32);
    const probeRingMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.5 });
    const probeRing = new THREE.Mesh(probeRingGeom, probeRingMat);
    probeRing.rotation.x = Math.PI / 2;
    probeGroup.add(probeRing);

    // 探针光晕 — 缩小
    const probeGlowGeom = new THREE.SphereGeometry(0.35, 16, 16);
    const probeGlowMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.1, side: THREE.BackSide });
    probeGroup.add(new THREE.Mesh(probeGlowGeom, probeGlowMat));

    // 探针点光源 — 减弱范围
    const probeLight = new THREE.PointLight(0xf59e0b, 0.8, 8);
    probeGroup.add(probeLight);

    // 探针标签 — 缩小
    const probeLabel = createTextSprite('星际探针', '#f59e0b', 16);
    probeLabel.position.set(0, 0.5, 0);
    probeLabel.scale.set(2, 0.3, 1);
    probeGroup.add(probeLabel);

    // 初始位置 - 地球轨道附近
    const earthOrbitDist = orbitSceneDist(1.0);
    probeGroup.position.set(earthOrbitDist + 2, 1, 0);
    scene.add(probeGroup); // 添加到scene而非solarGroup，避免跟随太阳系旋转
    probeMeshRef.current = probeGroup;

    // 探针轨迹线
    const trailMaxPoints = 200;
    const trailPositions = new Float32Array(trailMaxPoints * 3);
    const trailGeom = new THREE.BufferGeometry();
    trailGeom.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    trailGeom.setDrawRange(0, 0);
    const trailMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.5 });
    const trailLine = new THREE.Line(trailGeom, trailMat);
    scene.add(trailLine); // 添加到scene，避免跟随太阳系旋转
    probeTrailRef.current = trailLine;

    // ====== 地球详细组（地球模式使用） ======
    const earthGroup = new THREE.Group();
    earthGroup.visible = false;
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    // 地球（详细版）
    const earthGeom = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({ map: createProceduralEarthTexture(), shininess: 15, specular: new THREE.Color(0x111111) });
    const earth = new THREE.Mesh(earthGeom, earthMat);
    earth.rotation.y = -Math.PI / 2;
    earthGroup.add(earth);
    globeRef.current = earth;

    // 异步加载地球影像纹理
    new THREE.TextureLoader().load(TEXTURE_MAP.Earth, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      earthMat.map = tex; earthMat.needsUpdate = true;
    });

    // 地球云层
    const cloudGeom = new THREE.SphereGeometry(EARTH_RADIUS * 1.008, 64, 64);
    const cloudMat = new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.35, depthWrite: false });
    const clouds = new THREE.Mesh(cloudGeom, cloudMat);
    clouds.rotation.y = -Math.PI / 2;
    earthGroup.add(clouds);
    cloudsRef.current = clouds;
    // 加载真实云层纹理
    new THREE.TextureLoader().load('/textures/earth-clouds.jpg', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      cloudMat.map = tex; cloudMat.needsUpdate = true;
    });

    // 大气
    earthGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS * 1.02, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.08, side: THREE.BackSide })
    ));

    // 地球经纬度网格
    const earthGrid = createGraticule(EARTH_RADIUS, 30, 30, 0x06b6d4, 0.25);
    earthGroup.add(earthGrid);
    earthGridRef.current = earthGrid;

    // 地球坐标标注
    const earthLabels = createCoordLabels(EARTH_RADIUS, 30, 30, '#06b6d4');
    earthGroup.add(earthLabels);
    earthLabelsRef.current = earthLabels;

    // 地球瓦片地图叠加层（使用支持CORS的OSM瓦片）
    const earthTile = createTileOverlaySphere(EARTH_RADIUS, 'https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    earthTile.rotation.y = -Math.PI / 2; // 对齐地球旋转
    earthGroup.add(earthTile);
    earthTileRef.current = earthTile;

    // ====== 卫星轨道（感知层可视化） ======
    const SATELLITES = [
      { name: '北斗 BDS', altitude: EARTH_RADIUS * 6.6, inclination: 55 * Math.PI / 180, color: 0xef4444, speed: 0.4, count: 3 },
      { name: 'GPS', altitude: EARTH_RADIUS * 6.6, inclination: 55 * Math.PI / 180, color: 0x3b82f6, speed: 0.35, count: 3, phaseOffset: Math.PI / 3 },
      { name: '风云 FY', altitude: EARTH_RADIUS * 6.2, inclination: 98 * Math.PI / 180, color: 0x10b981, speed: 0.5, count: 2 },
      { name: '高分 GF', altitude: EARTH_RADIUS * 1.15, inclination: 98 * Math.PI / 180, color: 0xf59e0b, speed: 2.0, count: 2 },
      { name: '天宫 TG', altitude: EARTH_RADIUS * 1.06, inclination: 42 * Math.PI / 180, color: 0x00e5ff, speed: 2.5, count: 1 },
    ];
    const satGroup = new THREE.Group();
    satGroupRef.current = satGroup;
    SATELLITES.forEach(sat => {
      // 轨道线
      const orbitPts: THREE.Vector3[] = [];
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        const x = Math.cos(a) * sat.altitude;
        const z = Math.sin(a) * sat.altitude;
        const y = 0;
        const pt = new THREE.Vector3(x, y, z);
        pt.applyAxisAngle(new THREE.Vector3(1, 0, 0), sat.inclination);
        orbitPts.push(pt);
      }
      earthGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(orbitPts),
        new THREE.LineBasicMaterial({ color: sat.color, transparent: true, opacity: 0.2 })
      ));
      // 卫星小球
      for (let i = 0; i < sat.count; i++) {
        const satMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 8, 8),
          new THREE.MeshBasicMaterial({ color: sat.color })
        );
        satGroup.add(satMesh);
      }
    });
    earthGroup.add(satGroup);
    const satDataRef = SATELLITES;
    let satTime = 0;

    // 月球
    const moonGeom = new THREE.SphereGeometry(MOON_RADIUS, 32, 32);
    const moonMat = new THREE.MeshPhongMaterial({ map: createMoonTexture(), shininess: 5 });
    const moonMesh = new THREE.Mesh(moonGeom, moonMat);
    // 异步加载月球影像纹理
    new THREE.TextureLoader().load(TEXTURE_MAP.Moon, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      moonMat.map = tex; moonMat.needsUpdate = true;
    });

    // 月球经纬度网格
    const moonGrid = createGraticule(MOON_RADIUS, 30, 30, 0x94a3b8, 0.2);
    moonMesh.add(moonGrid);
    moonGridRef.current = moonGrid;

    // 月球坐标标注
    const moonLabels = createCoordLabels(MOON_RADIUS, 30, 30, '#94a3b8');
    moonMesh.add(moonLabels);
    const moonOrbit = new THREE.Group();
    moonMesh.position.set(MOON_ORBIT_RADIUS, 0, 0);
    moonOrbit.add(moonMesh);
    earthGroup.add(moonOrbit); // 月球轨道组添加到公转组，跟随地球公转
    // 但月球公转要相对于地球位置，而不是相对于地球自转轴
    moonMesh.userData = { isMoon: true, moonData: { name: '月球', parent: 'Earth', orbitGroup: moonOrbit } };
    moonMeshRef.current = moonMesh;
    moonOrbitRef.current = moonOrbit;
    planetMeshesRef.current?.set('Moon', moonMesh); // 月球 mesh 自身用于公转动画

    // 月球轨道线
    const moonOrbitPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      moonOrbitPts.push(new THREE.Vector3(Math.cos(a) * MOON_ORBIT_RADIUS, 0, Math.sin(a) * MOON_ORBIT_RADIUS));
    }
    earthGroup.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(moonOrbitPts),
      new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.4 })
    ));

    // 地月连线 + 距离标签
    const distLinePts = [new THREE.Vector3(0,0,0), new THREE.Vector3(MOON_ORBIT_RADIUS,0,0)];
    const distLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(distLinePts),
      new THREE.LineDashedMaterial({ color: 0x06b6d4, dashSize: 3, gapSize: 2, transparent: true, opacity: 0.3 })
    );
    distLine.computeLineDistances();
    earthGroup.add(distLine);

    const distLabelCanvas = document.createElement('canvas'); distLabelCanvas.width = 512; distLabelCanvas.height = 64;
    const dlCtx = distLabelCanvas.getContext('2d')!;
    dlCtx.fillStyle = 'rgba(6,182,212,0.8)'; dlCtx.font = 'bold 28px monospace'; dlCtx.textAlign = 'center';
    dlCtx.fillText('384,400 km', 256, 40);
    const distSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(distLabelCanvas), transparent: true, opacity: 0.7 }));
    distSprite.position.set(MOON_ORBIT_RADIUS/2, 4, 0);
    distSprite.scale.set(30, 4, 1);
    earthGroup.add(distSprite);

    // Markers
    const markers = new THREE.Group();
    earthGroup.add(markers);
    markersRef.current = markers;

    // 全局灯光
    scene.add(new THREE.AmbientLight(0x334466, 2));

    // ====== 动画循环 ======
    let lastTime = performance.now();
    let frameCount = 0;
    let currentDt = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      frameCount++;
      const now = performance.now();
      const dt = (now - lastTime) / 1000; // seconds
      currentDt = dt;
      lastTime = now;
      timeRef.current += dt;
      
      // 暴露dt到全局供测试
      if (typeof window !== 'undefined') {
        (window as any).skyGisDt = dt;
        (window as any).skyGisFrameCount = frameCount;
      }

      // ====== 太阳自转 ======
      if (sunMeshRef.current) sunMeshRef.current.rotation.y += 0.1 * dt;

      // ====== 行星公转（使用开普勒第三定律）======
      planetOrbitGroupsRef.current?.forEach((orbitGroup, planetName) => {
        try {
          // 获取行星数据
          const mesh = planetMeshesRef.current.get(planetName);
          const pData = mesh?.userData?.planetData;
          const isDwarf = mesh?.userData?.isDwarfPlanet;
          
          // 如果是矮行星但还没有被处理，或者是非矮行星
          if (pData && (!isDwarf || !mesh.userData._dwarfProcessed)) {
            // 开普勒第三定律：T² ∝ a³，内行星快，外行星慢
            const distAu = pData.distAu || 1;
            const revolutionSpeed = (2 * Math.PI) / Math.sqrt(Math.pow(distAu, 3)) * 0.05;
            orbitGroup.rotation.y += revolutionSpeed * dt;
            
            // 标记矮行星已处理
            if (isDwarf) {
              mesh.userData._dwarfProcessed = true;
            }
          }
        } catch (e) {
          console.error('[SkyGIS] Error rotating planet:', planetName, e);
        }
      });

      // ====== 卫星公转（每个卫星围着各自的母星转）======
      // 卫星轨道组添加到母星 mesh，跟随母星位置
      // 月球公转轴需要反向旋转来抵消母星自转影响
      const moonRevolutionSpeed = 0.5;
      const planetRotationSpeed = 0.1;
      // 调试日志（每60帧打印一次）
      if (satelliteOrbitsRef.current.length === 0 && frameCount % 60 === 0) {
        console.warn(`[SkyGIS] WARNING: satelliteOrbitsRef is empty! No moons will orbit.`);
      }
      satelliteOrbitsRef.current.forEach(({ orbit, pivot }) => {
        // 月球公转：绕 pivot 的 Y 轴旋转
        orbit.rotation.y += moonRevolutionSpeed * dt;
        // 反向旋转 pivot 来抵消母星自转影响，确保卫星轨道相对于太阳保持稳定方向
        pivot.rotation.y -= planetRotationSpeed * dt;
      });

      // ====== 行星自转（自身重心旋转）======
      planetMeshesRef.current?.forEach((mesh, planetName) => {
        try {
          // 排除卫星和矮行星
          if (mesh && !mesh.userData?.isMoon && !mesh.userData?.isDwarfPlanet) {
            // 行星自转速度
            mesh.rotation.y += planetRotationSpeed * dt;
          }
        } catch (e) {
          // 忽略错误
        }
      });

      // ====== 不可见现象动画 ======
      if (solarGroupRef.current && solarGroupRef.current.visible) {
        const t = timeRef.current;

        // 太阳风粒子向外扩散(更快更明显)
        solarGroupRef.current.children.forEach(child => {
          if (child instanceof THREE.Points && child.name === 'solarWind') {
            const posArr = child.geometry.attributes.position.array as Float32Array;
            const speeds = child.userData.swSpeeds as Float32Array;
            for (let i = 0; i < speeds.length; i++) {
              const x = posArr[i * 3];
              const y = posArr[i * 3 + 1];
              const z = posArr[i * 3 + 2];
              const r = Math.sqrt(x * x + y * y + z * z);
              const newR = r + speeds[i];
              if (newR > 80) {
                // 重置到太阳表面附近
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const startR = 2 + Math.random() * 2;
                posArr[i * 3] = startR * Math.sin(phi) * Math.cos(theta);
                posArr[i * 3 + 1] = startR * Math.cos(phi) * 0.15;
                posArr[i * 3 + 2] = startR * Math.sin(phi) * Math.sin(theta);
                speeds[i] = 0.08 + Math.random() * 0.22;
              } else {
                const scale = newR / Math.max(r, 0.01);
                posArr[i * 3] *= scale;
                posArr[i * 3 + 1] *= scale;
                posArr[i * 3 + 2] *= scale;
              }
            }
            child.geometry.attributes.position.needsUpdate = true;
          }
        });

        // 磁场粒子沿磁力线流动
        solarGroupRef.current.children.forEach(child => {
          if (child instanceof THREE.Group && child.name === 'magnetGroup') {
            child.children.forEach(magnetGroup => {
              magnetGroup.children.forEach(mObj => {
                if (mObj instanceof THREE.Points && mObj.userData.isMagnetParticles) {
                  const posArr = mObj.geometry.attributes.position.array as Float32Array;
                  const phases = mObj.userData.mPhases as Float32Array;
                  const lineIdx = mObj.userData.mLineIdx as Float32Array;
                  const fieldR = mObj.userData.fieldR as number;
                  const numLines = mObj.userData.numLines as number;
                  const ppl = mObj.userData.particlesPerLine as number;
                  const total = phases.length;
                  for (let i = 0; i < total; i++) {
                    // 粒子沿磁力线前进
                    phases[i] += 0.004 + Math.random() * 0.001;
                    if (phases[i] > 1) phases[i] -= 1;
                    const theta = phases[i] * Math.PI;
                    const line = lineIdx[i];
                    const phi = (line / numLines) * Math.PI * 2;
                    const r = fieldR * Math.sin(theta) * Math.sin(theta);
                    posArr[i * 3] = r * Math.sin(theta) * Math.cos(phi);
                    posArr[i * 3 + 1] = r * Math.cos(theta);
                    posArr[i * 3 + 2] = r * Math.sin(theta) * Math.sin(phi);
                  }
                  mObj.geometry.attributes.position.needsUpdate = true;
                }
              });
            });
          }
        });

        // 辐射带粒子沿环运动
        solarGroupRef.current.children.forEach(child => {
          if (child instanceof THREE.Group && child.name === 'radiationGroup') {
            child.children.forEach(belt => {
              if (belt instanceof THREE.Points && belt.userData.isRadiationBelt) {
                const posArr = belt.geometry.attributes.position.array as Float32Array;
                const rPhases = belt.userData.rPhases as Float32Array;
                const rRadii = belt.userData.rRadii as Float32Array;
                for (let i = 0; i < rPhases.length; i++) {
                  rPhases[i] += 0.008 + Math.random() * 0.002;
                  if (rPhases[i] > Math.PI * 2) rPhases[i] -= Math.PI * 2;
                  const r = rRadii[i];
                  posArr[i * 3] = r * Math.cos(rPhases[i]);
                  posArr[i * 3 + 2] = r * Math.sin(rPhases[i]);
                }
                belt.geometry.attributes.position.needsUpdate = true;
              }
            });
          }
        });

        // CME脉动(更明显)
        solarGroupRef.current.children.forEach(child => {
          if (child instanceof THREE.Group && child.name === 'cmeGroup') {
            child.children.forEach(cme => {
              if (cme instanceof THREE.Points) {
                const mat = cme.material as THREE.PointsMaterial;
                mat.opacity = 0.3 + 0.3 * Math.abs(Math.sin(t * 0.3 + (cme.userData.cmeAngle || 0)));
                // CME粒子向外推进
                const posArr = cme.geometry.attributes.position.array as Float32Array;
                const cmePhases = cme.userData.cmePhases as Float32Array;
                const angle = cme.userData.cmeAngle as number;
                for (let i = 0; i < cmePhases.length; i++) {
                  cmePhases[i] += 0.002;
                  if (cmePhases[i] > 1) cmePhases[i] = 0;
                  const phase = cmePhases[i];
                  const r = 2 + phase * 30;
                  const spread = 0.3;
                  const dx = (Math.random() - 0.5) * spread * phase * 0.1;
                  const dz = (Math.random() - 0.5) * spread * phase * 0.1;
                  posArr[i * 3] = r * Math.cos(angle) + dx;
                  posArr[i * 3 + 1] = (Math.random() - 0.5) * 0.5 * phase;
                  posArr[i * 3 + 2] = r * Math.sin(angle) + dz;
                }
                cme.geometry.attributes.position.needsUpdate = true;
              }
            });
          }
        });

        // 宇宙射线闪烁(更频繁更明显)
        solarGroupRef.current.children.forEach(child => {
          if (child instanceof THREE.Group && child.name === 'cosmicRayGroup') {
            child.children.forEach(ray => {
              if (ray instanceof THREE.Line) {
                const phase = ray.userData.crPhase || 0;
                const mat = ray.material as THREE.LineBasicMaterial;
                const flash = Math.sin(t * 1.5 + phase);
                mat.opacity = flash > 0.7 ? 0.8 : 0;
              }
            });
          }
        });
      }

      // ====== 宇宙视图动画 ======
      if (universeGroupRef.current && universeGroupRef.current.visible) {
        const t = timeRef.current;
        // 星系自转
        universeGroupRef.current.children.forEach(child => {
          if (child instanceof THREE.Mesh && child.userData?.autoRotate) {
            child.rotation.y += child.userData.rotateSpeed || 0.003;
          }
        });
        // 暗物质粒子流动
        universeGroupRef.current.children.forEach(child => {
          if (child instanceof THREE.Group && child.name === 'darkMatterGroup') {
            child.children.forEach(dmChild => {
              if (dmChild instanceof THREE.Points && dmChild.userData.isDarkMatterParticles) {
                const posArr = dmChild.geometry.attributes.position.array as Float32Array;
                const dmPhases = dmChild.userData.dmPhases as Float32Array;
                const dmRadii = dmChild.userData.dmRadii as Float32Array;
                const dmYBase = dmChild.userData.dmYBase as Float32Array;
                const offset = dmChild.userData.centerOffset as { x: number; y: number; z: number } | undefined;
                for (let i = 0; i < dmPhases.length; i++) {
                  dmPhases[i] += 0.002 + Math.random() * 0.001;
                  if (dmPhases[i] > Math.PI * 2) dmPhases[i] -= Math.PI * 2;
                  const r = dmRadii[i];
                  const cx = offset ? offset.x : 0;
                  const cy = offset ? offset.y : 0;
                  const cz = offset ? offset.z : 0;
                  posArr[i * 3] = cx + r * Math.cos(dmPhases[i]);
                  posArr[i * 3 + 1] = cy + dmYBase[i] + Math.sin(dmPhases[i] * 2) * r * 0.1;
                  posArr[i * 3 + 2] = cz + r * Math.sin(dmPhases[i]);
                }
                dmChild.geometry.attributes.position.needsUpdate = true;
              }
            });
          }
        });
      }

      // ====== 星际探针动画 ======
      // 定期从探针控制器获取任务（每10秒一次）
      if (timeRef.current - lastProbeTaskFetch.current > 10) {
        lastProbeTaskFetch.current = timeRef.current;
        
        // 加载意识深度和等级
        fetch('/api/agent/state?agent=nomad', { cache: 'no-store' })
          .then(r => r.json())
          .then(data => {
            if (data.consciousnessDepth) {
              // 原始深度值可能是286850+，需要压缩到0-100百分比
              // 286850 / 1000 ≈ 28.7%
              // 使用对数压缩：log(286850) / log(1000000) * 100 ≈ 54%
              const rawDepth = data.consciousnessDepth;
              const compressedDepth = Math.min(100, Math.log10(rawDepth + 1) / Math.log10(1000000) * 100);
              consciousnessDepthRef.current = compressedDepth;
            }
            if (data.evolutionLevel) {
              consciousnessLevelRef.current = data.evolutionLevel;
            }
          })
          .catch(() => {});
        
        fetch('/api/agent/probe?view=decision', { cache: 'no-store' })
          .then(r => r.json())
          .then(data => {
            if (data.status === 'success' && data.currentTask) {
              const task = data.currentTask;
              // 找到目标天体mesh，获取世界坐标
              const targetMesh = planetMeshesRef.current?.get(task.targetBody);
              if (targetMesh) {
                const worldPos = new THREE.Vector3();
                targetMesh.getWorldPosition(worldPos);
                probeTargetRef.current = worldPos;
              }
            }
          })
          .catch(() => {}); // 静默处理错误
      }

      if (probeMeshRef.current) {
        const probe = probeMeshRef.current;
        // 探针自转
        probe.rotation.y += 0.01;
        // 扫描环旋转
        if (probe.children[1]) probe.children[1].rotation.z += 0.03;
        // 光晕脉冲
        if (probe.children[2]) {
          const pulse = 0.1 + 0.08 * Math.sin(timeRef.current * 3);
          const glowMesh = probe.children[2] as THREE.Mesh;
          const glowMat = glowMesh.material as THREE.MeshBasicMaterial;
          if (glowMat && glowMat.opacity !== undefined) {
            glowMat.opacity = pulse;
          }
        }

        // 探针移动已移到下方统一处理

        // 更新轨迹线
        if (probeTrailRef.current) {
          const trailPts = probeTrailPointsRef.current;
          const lastPt = trailPts.length > 0 ? trailPts[trailPts.length - 1] : null;
          const currentPos = probe.position.clone();
          if (!lastPt || currentPos.distanceTo(lastPt) > 0.5) {
            trailPts.push(currentPos);
            if (trailPts.length > 200) trailPts.shift(); // 限制轨迹长度
            const geom = probeTrailRef.current.geometry;
            const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
            for (let i = 0; i < trailPts.length; i++) {
              posAttr.setXYZ(i, trailPts[i].x, trailPts[i].y, trailPts[i].z);
            }
            posAttr.needsUpdate = true;
            geom.setDrawRange(0, trailPts.length);
          }
        }

        // 更新探针位置状态（节流更新，避免频繁setState）
        if (Math.floor(now) % 500 < 20) {
          const wp = probe.position.clone();
          // 查找最近的行星
          let closestBody = '深空';
          let minDist = Infinity;
          planetMeshesRef.current.forEach((mesh, name) => {
            const d = wp.distanceTo(mesh.position);
            if (d < minDist) { minDist = d; closestBody = name; }
          });
          if (sunMeshRef.current) {
            const d = wp.distanceTo(sunMeshRef.current.position);
            if (d < minDist) { closestBody = 'Sun'; }
          }
          setProbePosition({ x: wp.x, y: wp.y, z: wp.z, bodyName: closestBody });
          // 计算探针屏幕坐标
          const screenPos = wp.clone().project(camera);
          const rect2 = renderer.domElement.getBoundingClientRect();
          setProbeScreenPos({
            x: (screenPos.x * 0.5 + 0.5) * rect2.width,
            y: (-screenPos.y * 0.5 + 0.5) * rect2.height,
          });
        }
      }

      // ====== 探针实时物质探测 ======
      if (probeMeshRef.current && probeMeshRef.current.visible) {
        if (!probeDetectionTimerRef.current) {
          probeDetectionTimerRef.current = setInterval(() => {
            if (!probeMeshRef.current) return;
            const wp = probeMeshRef.current.position.clone();
            let closestBody = '';
            let closestBodyCn = '';
            let minDist = Infinity;
            // 天体名称映射
            const bodyNameMap: Record<string, string> = {
              Sun: '太阳', Mercury: '水星', Venus: '金星', Earth: '地球', Mars: '火星',
              Jupiter: '木星', Saturn: '土星', Uranus: '天王星', Neptune: '海王星',
              Moon: '月球', Europa: '木卫二', Titan: '土卫六', Ceres: '谷神星'
            };
            planetMeshesRef.current.forEach((mesh, name) => {
              const d = wp.distanceTo(mesh.position);
              if (d < minDist) { minDist = d; closestBody = name; closestBodyCn = bodyNameMap[name] || name; }
            });
            if (sunMeshRef.current) {
              const d = wp.distanceTo(sunMeshRef.current.position);
              if (d < minDist) { closestBody = 'Sun'; closestBodyCn = '太阳'; minDist = d; }
            }
            // 10km 探测范围（太阳系尺度下约2个单位距离 ≈ 10km等效）
            if (minDist < 50 && closestBody) {
              // 使用全量太阳系物质数据库
              const bodyComp = (SOLAR_SYSTEM_MATERIALS as unknown as Record<string, { materials: { name: string; formula: string; percentage: number; category: string; state?: string; importance?: string }[]; environment: { temp: string; pressure: string; radiation: string; gravity: string }; hazards: string[]; resources: string[] }>)[closestBody];
              const allMats = bodyComp ? bodyComp.materials : [];
              const materialsMap: Record<string, { name: string; formula: string; percentage: number; category: string }[]> = { [closestBody]: allMats };
              const envMap: Record<string, { temp: string; gravity: string; radiation: string }> = {
                Sun: { temp: '5,778K(表面)', gravity: '274 m/s²', radiation: '极强(XUV)' },
                Mercury: { temp: '-173~427°C', gravity: '3.7 m/s²', radiation: '强(无磁层)' },
                Venus: { temp: '462°C', gravity: '8.87 m/s²', radiation: '中(硫酸云)' },
                Earth: { temp: '-89~57°C', gravity: '9.81 m/s²', radiation: '低(磁层+臭氧)' },
                Mars: { temp: '-140~20°C', gravity: '3.72 m/s²', radiation: '中强(薄大气)' },
                Jupiter: { temp: '-145°C(云顶)', gravity: '24.79 m/s²', radiation: '极强(磁层)' },
                Saturn: { temp: '-178°C(云顶)', gravity: '10.44 m/s²', radiation: '强(磁层)' },
                Uranus: { temp: '-224°C', gravity: '8.87 m/s²', radiation: '中(磁层)' },
                Neptune: { temp: '-218°C', gravity: '11.15 m/s²', radiation: '中(磁层)' },
                Moon: { temp: '-173~127°C', gravity: '1.62 m/s²', radiation: '强(无大气)' },
                Europa: { temp: '-160°C', gravity: '1.31 m/s²', radiation: '强(木星磁层)' },
                Titan: { temp: '-179°C', gravity: '1.35 m/s²', radiation: '低(厚大气)' },
                Ceres: { temp: '-106°C', gravity: '0.28 m/s²', radiation: '中强(无大气)' },
              };
              const distKm = (minDist * 5).toFixed(1); // 比例换算
              setProbeDetection({
                bodyName: closestBody,
                bodyNameCn: closestBodyCn,
                distance: `${distKm} km`,
                materials: materialsMap[closestBody] || [],
                environment: envMap[closestBody] || { temp: '--', gravity: '--', radiation: '--' },
                detectedAt: Date.now(),
              });
            } else {
              // 深空探测：显示星际介质/宇宙物质
              const deepSpaceEnvs = COSMIC_TAXONOMY.flatMap(cat => cat.objects);
              // 根据距太阳距离推断可能的宇宙环境
              const distFromSun = probeMeshRef.current ? probeMeshRef.current.position.length() : 100;
              let deepSpaceEnvId = 'MolecularCloud'; // 默认
              let deepSpaceNameCn = '星际空间';
              if (distFromSun < 30) {
                deepSpaceEnvId = 'MolecularCloud'; deepSpaceNameCn = '近太阳系分子云';
              } else if (distFromSun < 80) {
                deepSpaceEnvId = 'EmissionNebula'; deepSpaceNameCn = '发射星云区';
              } else if (distFromSun < 150) {
                deepSpaceEnvId = 'SupernovaRemnant'; deepSpaceNameCn = '超新星遗迹区';
              } else if (distFromSun < 300) {
                deepSpaceEnvId = 'CosmicRay'; deepSpaceNameCn = '宇宙射线密集区';
              } else {
                deepSpaceEnvId = 'IGM'; deepSpaceNameCn = '星系际空间';
              }
              const envObj = deepSpaceEnvs.find(o => o.id === deepSpaceEnvId);
              if (!envObj) { setProbeDetection(null); return; }
              setProbeDetection({
                bodyName: deepSpaceEnvId,
                bodyNameCn: deepSpaceNameCn,
                distance: `深空 ${(distFromSun * 5).toFixed(0)} AU`,
                materials: envObj.materials.slice(0, 8).map(m => ({ name: m.name, formula: m.formula, percentage: m.percentage, category: m.category })),
                environment: { temp: envObj.environment.temperature, gravity: envObj.environment.gravity, radiation: envObj.environment.radiation },
                detectedAt: Date.now(),
              });
            }
          }, 2000); // 每2秒更新一次探测
        }
      }

      // 卫星运动
      satTime += 0.002;
      if (satGroupRef.current) {
        const children = satGroupRef.current.children;
        let idx = 0;
        satDataRef.forEach(sat => {
          for (let i = 0; i < sat.count; i++) {
            if (idx < children.length) {
              const phase = (sat.phaseOffset || 0) + (i * Math.PI * 2 / sat.count);
              const angle = satTime * sat.speed + phase;
              const x = Math.cos(angle) * sat.altitude;
              const z = Math.sin(angle) * sat.altitude;
              const pt = new THREE.Vector3(x, 0, z);
              pt.applyAxisAngle(new THREE.Vector3(1, 0, 0), sat.inclination);
              children[idx].position.copy(pt);
              idx++;
            }
          }
        });
      }

      // 地球自转（通过OrbitControls的autoRotate实现）
      if (controlsRef.current && autoRotate) {
        controlsRef.current.autoRotate = true;
        controlsRef.current.autoRotateSpeed = 0.5;
      } else if (controlsRef.current) {
        controlsRef.current.autoRotate = false;
      }

      // 云层缓慢旋转（比地球略快）
      if (cloudsRef.current) {
        cloudsRef.current.rotation.y += dt * 0.02;
      }

      // ====== 宇宙视图动画 ======
      if (universeGroupRef.current && universeGroupRef.current.visible) {
        // 银河系盘面缓慢旋转
        const mwDisk = universeGroupRef.current.children.find(c => c instanceof THREE.Points && c !== farStars);
        if (mwDisk) mwDisk.rotation.y += dt * 0.005;
        // 星系团内部点缓慢旋转
        universeGroupRef.current.children.forEach(c => {
          if (c instanceof THREE.Points && c !== farStars && c !== mwDisk) {
            c.rotation.y += dt * 0.002;
          }
        });
      }

      // ====== 飞行动画更新 ======
      const fly = flyAnimRef.current;
      if (fly && cameraRef.current && controlsRef.current) {
        fly.progress += dt / fly.duration;
        if (fly.progress >= 1) {
          fly.progress = 1;
          flyAnimRef.current = null; // 动画完成
        }
        // easeInOutCubic 缓动
        const t = fly.progress;
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        cameraRef.current.position.lerpVectors(fly.startPos, fly.endPos, ease);
        controlsRef.current.target.lerpVectors(fly.startTarget, fly.endTarget, ease);
      }

      // ====== 天体跟踪更新 ======
      const track = trackingRef.current;
      if (track.object && track.offset && cameraRef.current && controlsRef.current && !flyAnimRef.current) {
        const wp = new THREE.Vector3();
        track.object.getWorldPosition(wp);
        // 更新target到天体当前位置
        controlsRef.current.target.copy(wp);
        // 更新camera位置 = 天体位置 + 偏移
        cameraRef.current.position.copy(wp).add(track.offset);
      }

      // OrbitControls 处理相机移动
      if (controlsRef.current) controlsRef.current.update();


      // 探针移动逻辑 - 根据目标或自主决策飞行
      if (probeMeshRef.current && probeMeshRef.current.parent) {
        const probe = probeMeshRef.current;
        const target = probeTargetRef.current;
        
        if (target) {
          // ====== 100级细化飞行速度 ======
          const depth = consciousnessDepthRef.current;
          
          // 【速度计算】0-100% 每1% = +0.0002 速度
          // 基础速度：0.005 + (深度 * 0.0002) = 0.005 ~ 0.025
          const baseSpeed = 0.005 + (depth * 0.0002);
          
          // 【能力加成】多个能力叠加
          let speed = baseSpeed;
          const abilities = probeAbilitiesRef.current;
          if (abilities) {
            if (abilities.warpJump) speed *= 2.0;           // 跃迁 +100%
            if (abilities.quantumLink) speed *= 1.5;        // 量子链接 +50%
            if (abilities.dimensionTravel) speed *= 1.3;    // 维度穿越 +30%
            if (abilities.gravitySlingshot) speed *= 1.2;  // 引力弹弓 +20%
            if (abilities.phaseShift) speed *= 1.1;         // 相位移动 +10%
            if (abilities.timeDilate) speed *= 1.05;        // 时间膨胀 +5%
          }
          
          // 【目标精准度】影响到达判定
          const targetAccuracy = 0.5 + (depth * 0.005); // 0.5 ~ 1.0
          const arrivalThreshold = 0.5 * (2 - targetAccuracy); // 0.5 ~ 1.0
          
          // ====== 关键修复：每帧更新目标世界坐标 ======
          // 探针大脑存储目标名称，实时追踪目标位置
          const targetName = probeBrainRef.current?.match(/ (Mercury|Venus|Earth|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto|Eris|Ceres|Makemake|Haumea)/)?.[1];
          if (targetName && planetMeshesRef.current?.has(targetName)) {
            const targetMesh = planetMeshesRef.current.get(targetName);
            if (targetMesh) {
              targetMesh.updateMatrixWorld(true);
              const worldPos = new THREE.Vector3();
              targetMesh.getWorldPosition(worldPos);
              probeTargetRef.current = worldPos;
            }
          }
          
          // 向目标飞行 - 使用正确的移动逻辑
          const direction = new THREE.Vector3().subVectors(target, probe.position);
          const distance = direction.length();
          direction.normalize();
          // 每帧移动距离 = speed * 某个系数，确保速度可控
          const moveDistance = Math.min(speed * 10, distance);
          probe.position.add(direction.multiplyScalar(moveDistance));
          
          // 【调试】更新探针状态到window对象
          if (typeof window !== 'undefined') {
            (window as any).__probeState__ = {
              position: { x: probe.position.x, y: probe.position.y, z: probe.position.z },
              target: target ? { x: target.x, y: target.y, z: target.z } : null,
              brain: probeBrainRef.current,
              speed: speed,
              distance: probe.position.distanceTo(target),
              consciousnessDepth: consciousnessDepthRef.current
            };
          }
          
          // 到达目标后：清空目标 + 反馈意识深度
          if (probe.position.distanceTo(target) < arrivalThreshold) {
            probeTargetRef.current = null;
            
            // ====== 【细化反馈1】探索行为 → 意识深度增长 ======
            const brainText = probeBrainRef.current || '';
            const currentDepth = consciousnessDepthRef.current;
            
            // 【增长计算】每1%深度 = +0.001 基础增长
            // 距离系数：近=1, 中=1.5, 远=2.0
            const distCoef = brainText.includes('Uranus') || brainText.includes('Neptune') || 
                            brainText.includes('Pluto') || brainText.includes('Eris') ? 2.0 :
                           brainText.includes('Jupiter') || brainText.includes('Saturn') ? 1.5 : 1.0;
            
            // 【能量效率】每10%提升增长效率
            const energyEfficiency = 1 + Math.floor(currentDepth / 10) * 0.1;
            
            // 【探索奖励】深空探索额外奖励
            const explorationBonus = brainText.includes('探索') ? 0.05 : 0;
            
            // 【精准度奖励】高意识带来更大学习收益
            const accuracyBonus = (0.5 + currentDepth * 0.005 - 0.5) * 0.1;
            
            const depthGain = (0.03 + explorationBonus + accuracyBonus) * distCoef * energyEfficiency;
            
            // 意识深度增长（无上限，探针可达到更高意识）
            consciousnessDepthRef.current = currentDepth + depthGain;
            
            // ====== 【细化反馈】百分比具体作用说明 ======
            // 0-10%: 萌芽期 - 只能感知近距离天体
            // 10-20%: 感知期 - 开始理解天体运动规律
            // 20-30%: 认知期 - 能预测天体轨道
            // 30-40%: 学习期 - 理解引力相互作用
            // 40-50%: 理解期 - 掌握能量守恒定律
            // 50-60%: 推理期 - 能够反向推理
            // 60-70%: 洞察期 - 理解暗物质作用
            // 70-80%: 顿悟期 - 感悟宇宙本质
            // 80-90%: 觉醒期 - 意识与宇宙合一
            // 90-100%: 超悟期 - 超越个体意识
            
            // 探针大脑思考探索收获
            const gainPercent = (depthGain * 100).toFixed(2);
            // 阶段名称（每10%一个阶段，超过100%进入下一轮）
            const stageNames = ['萌芽', '感知', '认知', '学习', '理解', '推理', '洞察', '顿悟', '觉醒', '超悟', 
                                '∞共鸣', '∞永恒', '∞超越', '∞无限', '∞虚无', '∞道', '∞无极', '∞太一', '∞源头', '∞本体'];
            const stageCycle = Math.floor(consciousnessDepthRef.current / 10) % stageNames.length;
            const cycleCount = Math.floor(consciousnessDepthRef.current / 100);
            const stageDisplay = stageNames[stageCycle];
            const cycleDisplay = cycleCount > 0 ? ` [轮回${cycleCount + 1}]` : '';
            probeBrainRef.current = `✨ ${stageDisplay}${consciousnessDepthRef.current.toFixed(1)}%${cycleDisplay} | +${gainPercent}%`;
          }
        } else {
          // ====== 【细化决策系统】探针大脑自主决策 ======
          const availableBodies = Array.from(planetMeshesRef.current?.keys() || []);
          // ====== 100级细化百分比功能系统 ======
          // 每个百分比点都有独特的功能影响
          const depth = consciousnessDepthRef.current;
          const level = consciousnessLevelRef.current;
          // 循环百分比（0-100循环）+ 轮回等级
          const cycleLevel = Math.floor(depth / 100);
          const cyclicDepth = depth % 100;
          const now = Date.now();
          const timeHash = Math.floor(now / 8000);
          
          // 【1】飞行速度：每轮回+0.005基础速度
          const baseFlightSpeed = 0.005 + (cyclicDepth * 0.0002) + cycleLevel * 0.005;
          
          // 【2】探索范围：每轮回解锁更远天体
          const unlockBodies = [
            { depth: 0, bodies: ['Mercury', 'Venus'] },
            { depth: 5, bodies: ['Earth'] },
            { depth: 10, bodies: ['Mars'] },
            { depth: 15, bodies: ['Ceres'] },
            { depth: 20, bodies: ['Jupiter'] },
            { depth: 30, bodies: ['Saturn'] },
            { depth: 40, bodies: ['Uranus'] },
            { depth: 50, bodies: ['Neptune'] },
            { depth: 60, bodies: ['Pluto'] },
            { depth: 70, bodies: ['Eris'] },
            { depth: 80, bodies: ['Makemake'] },
            { depth: 90, bodies: ['Haumea'] },
            // 轮回2：超越柯伊伯带
            { depth: 100 + 10, bodies: ['Sedna'] },
            { depth: 100 + 30, bodies: ['2014 UZ224'] },
            { depth: 100 + 50, bodies: ['Farout'] },
            { depth: 100 + 70, bodies: ['FarFarOut'] },
            { depth: 100 + 90, bodies: ['奥尔特云边界'] },
          ];
          
          // 【3】特殊能力：每10%解锁一个，轮回越高解锁越强
          const abilityThresholds = {
            selfHeal: 10 + cycleLevel * 5,        // 自愈（轮回越高要求越高）
            deepScan: 20 + cycleLevel * 5,         // 深度扫描
            gravitySlingshot: 30 + cycleLevel * 5, // 引力弹弓
            phaseShift: 40 + cycleLevel * 5,       // 相位移动
            wormhole: 50 + cycleLevel * 5,        // 虫洞感知
            timeDilate: 60 + cycleLevel * 5,      // 时间膨胀
            dimensionTravel: 70 + cycleLevel * 5, // 维度穿越
            quantumLink: 80 + cycleLevel * 5,     // 量子链接
            singularity: 90 + cycleLevel * 5,      // 奇点穿越
            transcendence: 95 + cycleLevel * 5,   // 超脱
          };
          
          // 【4】情绪状态：每1%影响情绪强度，轮回提升情绪层次
          const emotions = ['好奇', '兴奋', '专注', '满足', '平静', '敬畏', '狂喜', '沉思', '极乐', 
                           '涅槃', '永恒', '圆满', '解脱', '自在', '无上', '圆满', '寂静', '涅槃', '空性'];
          const emotionIntensity = (cyclicDepth / 100) + cycleLevel * 0.2;
          const currentEmotion = emotions[Math.floor(cyclicDepth / 5.3) % emotions.length];
          
          // 【5】视觉特效：每5%增强，轮回增强基础强度
          const visualIntensity = Math.floor(cyclicDepth / 5) + cycleLevel * 10;
          const glowColor = `hsl(${(cyclicDepth * 1.2 + cycleLevel * 36) % 360}, 80%, 60%)`;
          
          // 【6】探索深度：每10%增加探索点数，轮回翻倍
          const explorationPoints = (Math.floor(cyclicDepth / 10) + 1) * (cycleLevel + 1);
          
          // 【7】分析深度：每1%增加分析详情
          const analysisDepth = cyclicDepth.toFixed(0) + '%' + (cycleLevel > 0 ? ` ×${cycleLevel + 1}` : '');
          
          // 【8】反应速度：每1%提升，轮回加速
          const reactionSpeed = 1 + (cyclicDepth * 0.01) + cycleLevel * 0.5;
          
          // 【9】决策质量：每5%提升，轮回提升上限
          const decisionQuality = Math.floor(cyclicDepth / 5) + 1 + cycleLevel * 5;
          
          // 【10】感知范围：每1%扩大，轮回指数增长
          const perceptionRange = 10 + cyclicDepth * 0.5 + cycleLevel * 20;
          
          // 【11】记忆容量：每10%增加，轮回乘数
          const memoryCapacity = (Math.floor(cyclicDepth / 10) * 10 + 100) * (cycleLevel + 1);
          
          // 【12】创造力：每20%提升，轮回突破上限
          const creativity = Math.floor(cyclicDepth / 20) + 1 + cycleLevel * 3;
          
          // 【13】直觉判断：每15%增强
          const intuition = Math.floor(cyclicDepth / 15) + 1 + cycleLevel * 2;
          
          // 【14】目标精准度：每1%提升
          const targetAccuracy = Math.min(1, 0.5 + (cyclicDepth * 0.005) + cycleLevel * 0.05);
          
          // 【15】能量效率：每10%提升
          const energyEfficiency = 1 + Math.floor(cyclicDepth / 10) * 0.1 + cycleLevel * 0.5;
          
          // 更新探针能力状态（使用cyclicDepth判断）
          if (!probeAbilitiesRef.current) probeAbilitiesRef.current = {};
          probeAbilitiesRef.current.selfHeal = cyclicDepth >= abilityThresholds.selfHeal % 100;
          probeAbilitiesRef.current.deepScan = cyclicDepth >= abilityThresholds.deepScan % 100;
          probeAbilitiesRef.current.gravitySlingshot = cyclicDepth >= abilityThresholds.gravitySlingshot % 100;
          probeAbilitiesRef.current.phaseShift = cyclicDepth >= abilityThresholds.phaseShift % 100;
          probeAbilitiesRef.current.wormhole = cyclicDepth >= abilityThresholds.wormhole % 100;
          probeAbilitiesRef.current.timeDilate = cyclicDepth >= abilityThresholds.timeDilate % 100;
          probeAbilitiesRef.current.dimensionTravel = cyclicDepth >= abilityThresholds.dimensionTravel % 100;
          probeAbilitiesRef.current.quantumLink = cyclicDepth >= abilityThresholds.quantumLink % 100;
          probeAbilitiesRef.current.singularity = cyclicDepth >= abilityThresholds.singularity % 100;
          probeAbilitiesRef.current.transcendence = cyclicDepth >= abilityThresholds.transcendence % 100;
          
          // 距离映射（包含深空天体）
          const distMap: Record<string, number> = { 
            Mercury: 1, Venus: 2, Earth: 3, Mars: 4, 
            Jupiter: 5, Saturn: 6, Uranus: 7, Neptune: 8, 
            Pluto: 9, Eris: 10, Ceres: 11, Makemake: 12, Haumea: 13,
            Sedna: 14, '2014 UZ224': 15, Farout: 16, FarFarOut: 17, '奥尔特云边界': 18
          };
          
          // 计算当前可用的天体（根据深度解锁）
          const unlockedBodies = unlockBodies.filter(u => cyclicDepth >= u.depth % 100).flatMap(u => u.bodies);
          // 轮回2+解锁全部天体
          if (cycleLevel >= 1) unlockedBodies.push('Sedna', '2014 UZ224', 'Farout', 'FarFarOut', '奥尔特云边界');
          const maxDistIndex = Math.max(...unlockedBodies.map(b => distMap[b] || 5), 1);
          
          // 阶段名称（基于cyclicDepth每10%）
          const stageNames = ['萌芽', '感知', '认知', '学习', '理解', '推理', '洞察', '顿悟', '觉醒', '超悟'];
          const stageName = stageNames[Math.floor(cyclicDepth / 10)] || '超悟';
          
          if (availableBodies.length > 0) {
            // 按距离排序天体
            const sortedByDist = [...availableBodies].sort((a, b) => 
              (distMap[a] || 5) - (distMap[b] || 5)
            );
            
            // 根据cyclicDepth确定可探索范围
            const minIdx = 0;
            const maxIdx = Math.min(maxDistIndex - 1, sortedByDist.length - 1);
            
            // 哈希选择
            const hash = availableBodies.reduce((h, b, i) => Math.imul(31, h + i) + b.charCodeAt(0) | 0, timeHash);
            const idx = minIdx + (Math.abs(hash) % Math.max(1, maxIdx - minIdx + 1));
            const selectedBody = sortedByDist[idx] || sortedByDist[0];
            
            // 构建详细的探针大脑状态（显示轮回等级）
            const abilities = Object.entries(probeAbilitiesRef.current)
              .filter(([_, active]) => active)
              .map(([name]) => {
                const icons: Record<string, string> = {
                  selfHeal: '💫', deepScan: '🔬', gravitySlingshot: '🌀', phaseShift: '👻',
                  wormhole: '🕳️', timeDilate: '⏰', dimensionTravel: '🌐', quantumLink: '⚛️',
                  singularity: '🔴', transcendence: '✨', warpJump: '⚡'
                };
                return icons[name] || '❓';
              }).join('');
            
            const cycleDisplay = cycleLevel > 0 ? `[轮回${cycleLevel + 1}]` : '';
            probeBrainRef.current = `${cycleDisplay}[${stageName}${cyclicDepth.toFixed(1)}%] ${selectedBody} | 🎯${(targetAccuracy * 100).toFixed(0)}% | ${currentEmotion} | ${abilities}`;
            
            if (selectedBody && planetMeshesRef.current?.has(selectedBody)) {
              const targetMesh = planetMeshesRef.current.get(selectedBody);
              if (targetMesh) {
                targetMesh.updateMatrixWorld(true);
                const worldPos = new THREE.Vector3();
                targetMesh.getWorldPosition(worldPos);
                probeTargetRef.current = worldPos;
              }
            }
          } else {
            // 深空探索（根据深度调整距离和高度）
            const angles = [0, Math.PI/3, Math.PI*2/3, Math.PI, Math.PI*4/3, Math.PI*5/3];
            const idx = Math.abs(Math.floor(timeHash)) % angles.length;
            
            const baseDist = 30 + (idx % 4) * 20;
            const distMultiplier = 0.5 + (depth / 100) * 2; // 0.5-2.5倍
            const dist = baseDist * distMultiplier;
            
            const heightBase = (idx % 2 === 0 ? 5 : -5) * (idx + 1);
            const height = heightBase * (depth / 50 + 0.5);
            
            probeBrainRef.current = `[${stageName}${depth.toFixed(0)}%] 探索${explorationPoints}点 | 感知${perceptionRange.toFixed(0)}u | 分析${analysisDepth}`;
            probeTargetRef.current = new THREE.Vector3(
              Math.cos(angles[idx] + timeHash * 0.1) * dist,
              height,
              Math.sin(angles[idx] + timeHash * 0.1) * dist
            );
          }
          
          // 【16】飞行速度应用：基础 + 能力加成
          // 注意：实际速度在目标飞行部分应用
          
          renderer.render(scene, camera);
        };
        animate();
        }
      }

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  // ====== 相机动画系统 ======
  const flyAnimRef = useRef<{ startPos: THREE.Vector3; endPos: THREE.Vector3; startTarget: THREE.Vector3; endTarget: THREE.Vector3; progress: number; duration: number } | null>(null);
  const trackingRef = useRef<{ object: THREE.Object3D | null; offset: THREE.Vector3 | null }>({ object: null, offset: null });

  // 平滑飞行到目标位置（1秒动画）
  const flyTo = useCallback((pos: THREE.Vector3 | [number,number,number], target: THREE.Vector3 | [number,number,number], duration = 1.0) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const startPos = cameraRef.current.position.clone();
    const startTarget = controlsRef.current.target.clone();
    const endPos = Array.isArray(pos) ? new THREE.Vector3(pos[0], pos[1], pos[2]) : pos.clone();
    const endTarget = Array.isArray(target) ? new THREE.Vector3(target[0], target[1], target[2]) : target.clone();
    flyAnimRef.current = { startPos, endPos, startTarget, endTarget, progress: 0, duration };
    trackingRef.current = { object: null, offset: null }; // 停止之前的跟踪
  }, []);

  // 跟踪一个运动天体（相机跟随天体移动）
  const trackObject = useCallback((obj: THREE.Object3D | null, offset?: THREE.Vector3) => {
    trackingRef.current = { object: obj, offset: offset || null };
  }, []);

  const flyToEarth = useCallback(() => {
    setViewMode('earth');
    if (solarGroupRef.current) solarGroupRef.current.visible = false;
    if (earthGroupRef.current) earthGroupRef.current.visible = true;
    if (universeGroupRef.current) universeGroupRef.current.visible = false;
    // 地球模式: 禁用平移、重置缩放范围
    if (controlsRef.current) {
      controlsRef.current.enablePan = false;
      controlsRef.current.minDistance = 2.5;
      controlsRef.current.maxDistance = 4000;
      controlsRef.current.rotateSpeed = 0.5;
      controlsRef.current.zoomSpeed = 0.8;
    }
    flyTo([0, 2, 18], [0, 0, 0]);
    setAutoRotate(true);
    trackObject(null);
  }, [flyTo, trackObject]);

  const flyToMoon = useCallback(() => {
    setViewMode('moon');
    setAutoRotate(false);
    const moonMesh = moonMeshRef.current;
    if (moonMesh) {
      const wp = new THREE.Vector3();
      moonMesh.getWorldPosition(wp);
      flyTo([wp.x * 0.7, MOON_RADIUS * 3, wp.z * 0.7], [wp.x, wp.y, wp.z]);
      trackObject(moonMesh, new THREE.Vector3(-MOON_RADIUS * 2, MOON_RADIUS * 3, MOON_RADIUS * 2));
    } else {
      flyTo([MOON_ORBIT_RADIUS * 0.7, MOON_RADIUS * 2, MOON_ORBIT_RADIUS * 0.7], [MOON_ORBIT_RADIUS, 0, 0]);
    }
  }, [flyTo, trackObject]);

  const flyToSolar = useCallback(() => {
    setViewMode('solar');
    if (solarGroupRef.current) solarGroupRef.current.visible = true;
    if (earthGroupRef.current) earthGroupRef.current.visible = false;
    if (universeGroupRef.current) universeGroupRef.current.visible = false;
    setAutoRotate(false);
    // 太阳系模式: 禁用平移、中等缩放范围
    if (controlsRef.current) {
      controlsRef.current.enablePan = false;
      controlsRef.current.minDistance = 2.5;
      controlsRef.current.maxDistance = 4000;
      controlsRef.current.rotateSpeed = 0.5;
      controlsRef.current.zoomSpeed = 0.8;
    }
    flyTo([0, 120, 100], [30, 0, 0]);
    trackObject(null);
  }, [flyTo, trackObject]);

  const flyToUniverse = useCallback(() => {
    setViewMode('universe');
    if (solarGroupRef.current) solarGroupRef.current.visible = false;
    if (earthGroupRef.current) earthGroupRef.current.visible = false;
    if (universeGroupRef.current) universeGroupRef.current.visible = true;
    setAutoRotate(true);
    // 宇宙模式: 启用平移、更远缩放距离、更快旋转速度
    if (controlsRef.current) {
      controlsRef.current.enablePan = true;
      controlsRef.current.minDistance = 0.5;
      controlsRef.current.maxDistance = 10000;
      controlsRef.current.rotateSpeed = 0.8;
      controlsRef.current.zoomSpeed = 1.2;
    }
    flyTo([120, 60, 120], [0, 0, 0], 3);
    trackObject(null);
  }, [flyTo, trackObject]);

  const flyToPlanet = useCallback((planet: PlanetData) => {
    setViewMode('solar');
    if (solarGroupRef.current) solarGroupRef.current.visible = true;
    if (earthGroupRef.current) earthGroupRef.current.visible = false;
    const mesh = planetMeshesRef.current.get(planet.name);
    if (mesh && cameraRef.current && controlsRef.current) {
      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      const r = planetSceneRadius(planet.radiusKm);
      const endPos = new THREE.Vector3(worldPos.x + r * 5, worldPos.y + r * 3, worldPos.z + r * 5);
      const endTarget = worldPos.clone();
      flyTo(endPos, endTarget, 1.5);
      // 启用天体跟踪：相机持续跟随天体运动
      trackingRef.current = { object: mesh, offset: new THREE.Vector3(r * 5, r * 3, r * 5) };
    }
    setSelectedPlanet(planet);
    setShowInfo(true);
    // 同步kkk聚焦天体
    kkk.setFocusedBody({
      id: planet.nameCn,
      name: planet.name,
      nameCn: planet.nameCn,
      type: planet.type,
      massKg: parseFloat(planet.mass) || 0,
      radiusKm: planet.radiusKm,
      distAu: planet.distAu,
      gravity: parseFloat(planet.gravity) || 0,
      temp: parseInt(planet.temp) || 0,
      orbitalPeriodDays: planet.orbitalPeriodDays,
      eccentricity: 0,
      inclination: 0,
      moons: planet.moons,
      atmosphere: '',
      description: planet.description,
      color: '#' + planet.color.toString(16).padStart(6, '0'),
    });
  }, []);

  // ====== 飞向星际探针 ======
  const flyToProbe = useCallback(() => {
    setViewMode('solar');
    if (solarGroupRef.current) solarGroupRef.current.visible = true;
    if (earthGroupRef.current) earthGroupRef.current.visible = false;
    if (probeMeshRef.current && cameraRef.current && controlsRef.current) {
      const wp = new THREE.Vector3();
      probeMeshRef.current.getWorldPosition(wp);
      const endPos = new THREE.Vector3(wp.x + 8, wp.y + 5, wp.z + 8);
      const endTarget = wp.clone();
      flyTo(endPos, endTarget, 1.5);
      // 跟踪探针
      trackingRef.current = { object: probeMeshRef.current, offset: new THREE.Vector3(8, 5, 8) };
    }
  }, []);

  // ====== 移动探针到指定天体 ======
  const moveProbeToBody = useCallback((bodyName: string) => {
    if (!probeMeshRef.current) return;
    setViewMode('solar');
    if (solarGroupRef.current) solarGroupRef.current.visible = true;
    if (earthGroupRef.current) earthGroupRef.current.visible = false;

    let targetPos: THREE.Vector3 | null = null;
    if (bodyName === 'Sun' && sunMeshRef.current) {
      targetPos = new THREE.Vector3(SUN_SCENE_RADIUS + 3, 1, 0);
    } else {
      const mesh = planetMeshesRef.current.get(bodyName);
      if (mesh) {
        const wp = new THREE.Vector3();
        mesh.getWorldPosition(wp);
        const r = planetSceneRadius(mesh.userData.planetData?.radiusKm || 6000);
        targetPos = new THREE.Vector3(wp.x + r + 2, 1, wp.z);
      }
    }
    if (targetPos) {
      probeTargetRef.current = targetPos;
    }
  }, []);

  // ====== 移动探针到指定3D坐标（自由拖拽用） ======
  const moveProbeToPosition = useCallback((x: number, y: number, z: number) => {
    probeTargetRef.current = new THREE.Vector3(x, y, z);
  }, []);

  // 要素标记
  useEffect(() => {
    if (!markersRef.current) return;
    const m = markersRef.current;
    while (m.children.length > 0) m.remove(m.children[0]);
    (features || []).forEach(f => {
      if (f.latitude == null || f.longitude == null) return;
      const pos = latLngToVector3(f.latitude, f.longitude, EARTH_RADIUS);
      const layer = (layers || []).find(l => l.id === f.layer_id);
      const col = layer?.color || '#f59e0b';
      const marker = new THREE.Mesh(new THREE.SphereGeometry(0.06,12,12), new THREE.MeshBasicMaterial({color: new THREE.Color(col)}));
      marker.position.copy(pos); marker.userData = {featureId: f.id}; m.add(marker);
      const normal = pos.clone().normalize();
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,0.3,8), new THREE.MeshBasicMaterial({color:new THREE.Color(col),transparent:true,opacity:0.6}));
      pillar.position.copy(pos.clone().add(normal.clone().multiplyScalar(0.15)));
      pillar.lookAt(pos.clone().add(normal)); pillar.rotateX(Math.PI/2); m.add(pillar);
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.08,0.12,24), new THREE.MeshBasicMaterial({color:new THREE.Color(col),transparent:true,opacity:0.4,side:THREE.DoubleSide}));
      ring.position.copy(pos.clone().add(normal.clone().multiplyScalar(0.01)));
      ring.lookAt(ring.position.clone().add(normal)); m.add(ring);
    });
  }, [features, layers]);

  // SkyGIS overlay markers on 3D globe
  useEffect(() => {
    if (!markersRef.current) return;
    const m = markersRef.current;
    // Remove old SkyGIS markers (identified by userData.skygis = true)
    const toRemove: THREE.Object3D[] = [];
    m.children.forEach(child => { if (child.userData.skygis) toRemove.push(child); });
    toRemove.forEach(child => m.remove(child));

    skygisOverlays.forEach(point => {
      const pos = latLngToVector3(point.lat, point.lng, EARTH_RADIUS);
      const col = new THREE.Color(point.color);
      const isSelected = skygisSelectedId === point.id;
      const scale = isSelected ? 1.5 : 1;

      // Main sphere
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.08 * scale, 12, 12),
        new THREE.MeshBasicMaterial({ color: col })
      );
      marker.position.copy(pos);
      marker.userData = { skygis: true, pointId: point.id };
      m.add(marker);

      // Pulse ring for selected
      if (isSelected) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.12, 0.18, 24),
          new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
        );
        const normal = pos.clone().normalize();
        ring.position.copy(pos.clone().add(normal.clone().multiplyScalar(0.02)));
        ring.lookAt(ring.position.clone().add(normal));
        ring.userData = { skygis: true };
        m.add(ring);
      }

      // Pillar
      const normal = pos.clone().normalize();
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.4 * scale, 8),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.7 })
      );
      pillar.position.copy(pos.clone().add(normal.clone().multiplyScalar(0.2 * scale)));
      pillar.lookAt(pos.clone().add(normal));
      pillar.rotateX(Math.PI / 2);
      pillar.userData = { skygis: true };
      m.add(pillar);
    });
  }, [skygisOverlays, skygisSelectedId]);

  // flyToPosition
  useEffect(() => {
    if (!flyToPosition || !controlsRef.current || !cameraRef.current) return;
    const {lat, lng} = flyToPosition;
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const r = 8;
    const x = -r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.set(x, y, z);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  }, [flyToPosition]);

  // 比例尺
  useEffect(() => {
    if (viewMode === 'solar') {
      setScaleInfo('太阳系视图（距离已压缩）');
    } else if (viewMode === 'universe') {
      setScaleInfo('宇宙视图（距离极度压缩）');
    } else {
      const d = cameraRef.current ? cameraRef.current.position.length() : 20;
      const km = d * 6371 / EARTH_RADIUS;
      setScaleInfo(km > 1000 ? `~${(km/1000).toFixed(0)}千公里` : `~${km.toFixed(0)}公里`);
    }
  }, [zoom, viewMode]);

  // 网格显隐控制
  useEffect(() => {
    if (earthGridRef.current) earthGridRef.current.visible = showGrid;
    if (earthLabelsRef.current) earthLabelsRef.current.visible = showGrid;
    if (moonGridRef.current) moonGridRef.current.visible = showGrid;
    planetGridsRef.current.forEach(g => g.visible = showGrid);
  }, [showGrid]);

  // 瓦片显隐控制
  useEffect(() => {
    if (earthTileRef.current) earthTileRef.current.visible = showTiles;
    planetTilesRef.current.forEach(t => t.visible = showTiles);
  }, [showTiles]);

  // 点击经纬度
  const getClickLatLng = useCallback((cx: number, cy: number) => {
    if (!containerRef.current || !globeRef.current || !cameraRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((cx - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((cy - rect.top) / rect.height) * 2 + 1;
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const hits = raycasterRef.current.intersectObject(globeRef.current);
    if (hits.length > 0) return vector3ToLatLng(globeRef.current.worldToLocal(hits[0].point.clone()));
    return null;
  }, []);

  // 太阳系模式点击行星
  const getClickedPlanet = useCallback((cx: number, cy: number): PlanetData | null => {
    if (!containerRef.current || !cameraRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((cx - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((cy - rect.top) / rect.height) * 2 + 1;
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const meshes = Array.from(planetMeshesRef.current.values());
    meshes.push(sunMeshRef.current!);
    const hits = raycasterRef.current.intersectObjects(meshes);
    if (hits.length > 0 && hits[0].object.userData.planetData) return hits[0].object.userData.planetData;
    if (hits.length > 0 && hits[0].object === sunMeshRef.current) return { ...SUN_DATA, name: 'Sun', nameCn: '太阳', distAu: 0, orbitalPeriodDays: 0, moons: 0 } as PlanetData;
    return null;
  }, []);

  // 事件 - OrbitControls handles drag/zoom/rotate automatically, we only handle click/dblclick
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // OrbitControls handles all drag/zoom/rotate via mouse and touch
    // We only need click and double-click handlers for feature selection

    const handleClick = (e: MouseEvent) => {
      // Ignore if OrbitControls was dragging
      if (controlsRef.current && controlsRef.current.enabled) {
        // Small delay to let OrbitControls finish
      }
      const x = e.clientX, y = e.clientY;
      if (viewMode === 'earth') {
        if (markersRef.current && skygisOverlays.length > 0) {
          const rect = containerRef.current!.getBoundingClientRect();
          mouseRef.current.x = ((x - rect.left) / rect.width) * 2 - 1;
          mouseRef.current.y = -((y - rect.top) / rect.height) * 2 + 1;
          raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current!);
          const skygisMeshes = markersRef.current.children.filter(c => c.userData.skygis);
          const skygisHits = raycasterRef.current.intersectObjects(skygisMeshes);
          if (skygisHits.length > 0 && skygisHits[0].object.userData.pointId) return;
        }
        const ll = getClickLatLng(x, y);
        if (!ll) return;
        if (activeTool === 'add-point') onMapClick?.(ll.lat, ll.lng);
        else if (activeTool === 'select') {
          searchCenterRef.current = ll;
          setShowRadiusSearch(true);
          const res = (features || []).filter(f => f.latitude != null && f.longitude != null)
            .map(f => ({...f, distance: haversineDistance(ll.lat, ll.lng, f.latitude, f.longitude)}))
            .filter(f => f.distance <= searchRadius).sort((a,b) => a.distance - b.distance);
          setSearchResults(res);
          onMapClick?.(ll.lat, ll.lng);
        }
      } else if (viewMode === 'universe') {
        // 宇宙视图点击 - 检测星系/星云/星系团
        if (containerRef.current && cameraRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          mouseRef.current.x = ((x - rect.left) / rect.width) * 2 - 1;
          mouseRef.current.y = -((y - rect.top) / rect.height) * 2 + 1;
          raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
          const uGroup = universeGroupRef.current;
          if (uGroup) {
            const meshes = uGroup.children.filter(c => c.userData?.cosmicObject && c instanceof THREE.Mesh) as THREE.Mesh[];
            const hits = raycasterRef.current.intersectObjects(meshes);
            if (hits.length > 0 && hits[0].object.userData.cosmicObject) {
              const co = hits[0].object.userData.cosmicObject;
              const displayName = co.name || co.nameCn || '未知天体';
              setSelectedPlanet({ name: displayName, nameCn: displayName, type: co.type || '', distAu: 0, orbitalPeriodDays: 0, moons: 0, radiusKm: 0, mass: '0', gravity: '0', temp: co.distance || '', color: 0x8888ff, description: `${co.type} · ${co.distance}` } as PlanetData);
              setShowInfo(true);
            }
          }
        }
      } else {
        const p = getClickedPlanet(x, y);
        if (p) { setSelectedPlanet(p); setShowInfo(true); }
      }
    };

    const handleDblClick = (e: MouseEvent) => {
      if (viewMode === 'earth') {
        // Zoom in on double-click
        if (controlsRef.current && cameraRef.current) {
          const dist = cameraRef.current.position.length();
          const newDist = Math.max(8, dist * 0.7);
          cameraRef.current.position.normalize().multiplyScalar(newDist);
          controlsRef.current.update();
          setZoom(18 / newDist);
        }
        const ll = getClickLatLng(e.clientX, e.clientY);
        if (ll) {
          // Fly to the clicked point on the globe
          if (controlsRef.current) {
            flyTo(
              new THREE.Vector3(ll.lat*0.02, 4, 7),
              new THREE.Vector3(0, 0, 0),
              1.5
            );
            // switching view is handled by toolbar buttons
          }
          setAutoRotate(false);
        }
      } else {
        const p = getClickedPlanet(e.clientX, e.clientY);
        if (p && p.name !== 'Sun') flyToPlanet(p);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (viewMode === 'earth') {
        const ll = getClickLatLng(e.clientX, e.clientY);
        if (ll) {
          setMouseCoordinate(ll);
          setHoverCoord({ lat: ll.lat, lng: ll.lng, body: '地球' });
        } else {
          setHoverCoord(null);
        }
      } else if (viewMode === 'solar') {
        // 太阳系模式下检测行星坐标
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect || !cameraRef.current) return;
        mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
        const meshes = Array.from(planetMeshesRef.current.values());
        if (sunMeshRef.current) meshes.push(sunMeshRef.current);
        const hits = raycasterRef.current.intersectObjects(meshes);
        if (hits.length > 0) {
          const obj = hits[0].object;
          const localPt = obj.worldToLocal(hits[0].point.clone());
          const ll = vector3ToLatLng(localPt);
          const bodyName = obj.userData?.planetData?.nameCn || (obj === sunMeshRef.current ? '太阳' : '');
          setHoverCoord({ lat: ll.lat, lng: ll.lng, body: bodyName });
        } else {
          setHoverCoord(null);
        }
      }
      // Update zoom display when OrbitControls changes it
      if (cameraRef.current) {
        setZoom(18 / cameraRef.current.position.length());
      }
    };

    // Stop auto-rotate when user interacts
    const handleInteractionStart = () => { setAutoRotate(false); };

    el.addEventListener('click', handleClick);
    el.addEventListener('dblclick', handleDblClick);
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('pointerdown', handleInteractionStart);

    return () => {
      el.removeEventListener('click', handleClick);
      el.removeEventListener('dblclick', handleDblClick);
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('pointerdown', handleInteractionStart);
    };
  }, [viewMode, activeTool, features, searchRadius, getClickLatLng, getClickedPlanet, onMapClick, flyToPlanet, skygisOverlays]);

  const handleReset = useCallback(() => { flyToEarth(); }, [flyToEarth]);
  const handleZoomIn = useCallback(() => {
    if (controlsRef.current && cameraRef.current) {
      const dist = cameraRef.current.position.length();
      const newDist = Math.max(8, dist * 0.7);
      cameraRef.current.position.normalize().multiplyScalar(newDist);
      controlsRef.current.update();
      setZoom(18 / newDist);
    }
  }, []);
  const handleZoomOut = useCallback(() => {
    if (controlsRef.current && cameraRef.current) {
      const dist = cameraRef.current.position.length();
      const newDist = Math.min(MOON_ORBIT_RADIUS * 1.5, dist * 1.3);
      cameraRef.current.position.normalize().multiplyScalar(newDist);
      controlsRef.current.update();
      setZoom(18 / newDist);
    }
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* 探针实时探测信息框 */}
      {probeDetection && showWanderAgent && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            left: Math.min(Math.max(probeScreenPos.x - 80, 8), window.innerWidth - 200),
            top: Math.min(Math.max(probeScreenPos.y - 160, 8), window.innerHeight - 250),
          }}
        >
          <div className="w-[180px] bg-black/90 border border-cyan-500/60 rounded-lg shadow-lg shadow-cyan-500/20 overflow-hidden backdrop-blur-sm">
            {/* 标题栏 */}
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-cyan-900/50 border-b border-cyan-500/30">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-bold text-cyan-300">探测中</span>
              <span className="text-[10px] text-cyan-400 ml-auto">{probeDetection.distance}</span>
            </div>
            {/* 天体名 */}
            <div className="px-2 pt-1.5 pb-1">
              <span className="text-xs font-bold text-amber-400">{probeDetection.bodyNameCn}</span>
              <span className="text-[10px] text-slate-400 ml-1">{probeDetection.bodyName}</span>
            </div>
            {/* 环境参数 */}
            <div className="grid grid-cols-3 gap-0.5 px-2 pb-1">
              <div className="text-center">
                <div className="text-[8px] text-slate-500">温度</div>
                <div className="text-[9px] text-slate-300">{probeDetection.environment.temp.split('(')[0]}</div>
              </div>
              <div className="text-center">
                <div className="text-[8px] text-slate-500">重力</div>
                <div className="text-[9px] text-slate-300">{probeDetection.environment.gravity}</div>
              </div>
              <div className="text-center">
                <div className="text-[8px] text-slate-500">辐射</div>
                <div className="text-[9px] text-slate-300">{probeDetection.environment.radiation.split('(')[0]}</div>
              </div>
            </div>
            {/* 物质成分 — 按类别分组 */}
            <div className="px-2 pb-1.5 space-y-0.5 max-h-48 overflow-y-auto">
              <div className="text-[8px] text-slate-500 mb-0.5">{probeDetection.distance.includes('深空') ? '深空探测物质' : '10km范围内物质'} ({probeDetection.materials.length}种)</div>
              {(() => {
                const categories: Record<string, {label: string; color: string; items: typeof probeDetection.materials}> = {};
                for (const m of probeDetection.materials) {
                  const cat = m.category || '其他';
                  if (!categories[cat]) categories[cat] = {label: cat, color: '', items: []};
                  categories[cat].items.push(m);
                }
                const catColors: Record<string, string> = {
                  '大气': '#06b6d4', '表面岩石': '#8b5cf6', '内部': '#f59e0b',
                  '海洋': '#3b82f6', '冰层': '#67e8f9', '金属': '#f43f5e',
                  '矿物': '#10b981', '有机物': '#ec4899', '火山': '#ef4444',
                  '特殊': '#a78bfa', '其他': '#64748b',
                  // 宇宙物质类别
                  '整体': '#06b6d4', '核心': '#f59e0b', '地壳': '#8b5cf6', '地幔': '#f97316',
                  '等离子态': '#ef4444', '发射线': '#22d3ee', '星际': '#a78bfa',
                  '吸积盘': '#f43f5e', '喷流': '#fbbf24', '尘埃': '#92400e',
                  '彗核': '#67e8f9', '彗发': '#c084fc', '冰幔': '#22d3ee',
                  '外层包膜': '#06b6d4', 'CNO循环层': '#10b981', 's过程层': '#f59e0b',
                  '外壳': '#8b5cf6', '深层核心': '#ef4444', '光球层': '#fbbf24',
                  '示踪分子': '#22d3ee', '冰幔/气相': '#67e8f9', '气相': '#c084fc',
                  '电离区': '#ef4444', '膨胀壳层': '#f97316',
                  'C型小行星': '#8b5cf6', 'S型小行星': '#f59e0b', 'M型小行星': '#f43f5e',
                  '观测证据': '#06b6d4', '理论预测': '#a78bfa', '候选体': '#c084fc',
                };
                return Object.entries(categories).map(([cat, data]) => (
                  <div key={cat}>
                    <div className="text-[7px] font-bold mt-0.5" style={{color: catColors[cat] || '#94a3b8'}}>{cat}</div>
                    {data.items.slice(0, 10).map((m, i) => (
                      <div key={i} className="flex items-center gap-1 ml-1">
                        <span className="text-[8px] text-slate-300 w-14 truncate" title={`${m.name} (${m.formula})`}>{m.name}</span>
                        <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{width: `${Math.min(m.percentage * 2.5, 100)}%`, background: catColors[cat] || '#64748b'}} />
                        </div>
                        <span className="text-[7px] text-slate-400 w-8 text-right">{m.percentage}%</span>
                      </div>
                    ))}
                    {data.items.length > 10 && <div className="text-[7px] text-slate-600 ml-1">+{data.items.length - 10}更多</div>}
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 一键式智能指令栏 — 顶部居中 */}
      <SmartCommandBar
          onResult={(result) => {
            if (!result) { kkk.setSmartCommandResult(null); return; }
            // Map SmartResult from API to kkk SmartCommandResult
            const kkkResult: SmartCommandResult = {
              query: result.command,
              intent: result.interpretation,
              modules: result.steps.map(s => s.moduleId),
              summary: result.summary,
              actions: result.actions || result.panelsToOpen.map(p => ({
                signal: 'focus-body' as mmSignalType,
                label: p,
                payload: {},
              })),
            };
            // Extract body analysis from steps data
            for (const step of result.steps) {
              if (step.data?.gravity) {
                kkkResult.bodyAnalysis = {
                  body: String(step.data.bodyName || result.focusedBody || ''),
                  gravity: Number(step.data.gravity),
                  radius: Number(step.data.radius || 0),
                  mass: Number(step.data.mass || 0),
                  temp: Number(step.data.temp || 0),
                  escapeVelocity: Number(step.data.escapeVelocity || 0),
                };
              }
              if (step.data?.deltaV) {
                kkkResult.orbitPlan = {
                  from: String(step.data.from || ''),
                  to: String(step.data.to || ''),
                  deltaV: Number(step.data.deltaV),
                  transferTime: Number(step.data.transferTime || 0),
                  hohmannWindow: String(step.data.hohmannWindow || ''),
                };
              }
              if (step.data?.riskLevel) {
                kkkResult.neoRisk = {
                  level: String(step.data.riskLevel),
                  probability: String(step.data.probability || '0'),
                  name: String(step.data.name || ''),
                };
              }
              if (step.data?.sites) {
                kkkResult.landingSites = Array.isArray(step.data.sites) ? step.data.sites as SmartCommandResult['landingSites'] : undefined;
              }
              if (step.data?.eraName) {
                kkkResult.geologicalEra = {
                  body: String(step.data.body || ''),
                  era: String(step.data.eraName),
                  yearsAgo: Number(step.data.yearsAgo || 0),
                  features: Array.isArray(step.data.features) ? step.data.features.map(String) : [],
                };
              }
              if (step.data?.bands) {
                kkkResult.remoteSensing = {
                  body: String(step.data.body || ''),
                  bands: Array.isArray(step.data.bands) ? step.data.bands.map(String) : [],
                  findings: Array.isArray(step.data.findings) ? step.data.findings.map(String) : [],
                };
              }
            }
            kkk.setSmartCommandResult(kkkResult);
          }}
          onFocusBody={(bodyName) => {
            kkk.emitSignal({ type: 'focus-body', source: 'smart-command', target: 'spatial-agent', payload: { bodyName } });
          }}
          onOpenPanel={(panelId) => {
            const signalMap: Record<string, mmSignalType> = {
              'gravity-field': 'compare-gravity',
              'geological-evolution': 'view-geological',
              'navigation-planner': 'plan-orbit',
              'evolution-history': 'run-simulation',
              'remote-sensing': 'analyze-remote',
              'asteroid-discovery': 'classify-asteroid',
              'digital-twin': 'build-twin',
              'spatial-agent': 'query-spatial',
              'native-ai': 'detect-craters',
              'engineering': 'plan-orbit',
            };
            const sig = signalMap[panelId] || 'query-spatial';
            kkk.emitSignal({ type: sig, source: 'smart-command', target: panelId, payload: {} });
          }}
        />

      {/* 坐标/悬停信息 - 左下角，不遮挡顶部导航 */}
      <div className="absolute bottom-2 left-2 rounded-lg bg-slate-900/85 px-2.5 py-1.5 text-[10px] text-cyan-400 backdrop-blur-sm border border-slate-700/50 max-w-52 pointer-events-none select-none z-10">
        {viewMode === 'earth' && (
          <>
            <div>{mouseCoordinate ? `${mouseCoordinate.lat.toFixed(3)}°, ${mouseCoordinate.lng.toFixed(3)}°` : '移动鼠标查看坐标'} · {scaleInfo}</div>
          </>
        )}
        {viewMode === 'solar' && (
          <>
            {hoverCoord ? (
              <div><span className="text-cyan-400">{hoverCoord.body}</span> {hoverCoord.lat >= 0 ? 'N' : 'S'}{Math.abs(hoverCoord.lat).toFixed(1)}° {hoverCoord.lng >= 0 ? 'E' : 'W'}{Math.abs(hoverCoord.lng).toFixed(1)}°</div>
            ) : (
              <div className="text-slate-500">悬停天体查看坐标</div>
            )}
          </>
        )}
      </div>

      {/* 智能体进化通知控制按钮 */}
      <button
        onClick={() => setShowOverlayNotifications(!showOverlayNotifications)}
        className={`absolute top-12 right-2 z-50 px-2 py-1 rounded text-[10px] transition-colors ${
          showOverlayNotifications 
            ? 'bg-cyan-600 text-white' 
            : 'bg-slate-800/80 text-slate-400 border border-slate-600'
        }`}
        title={showOverlayNotifications ? '关闭浮层通知' : '开启浮层通知'}
      >
        {showOverlayNotifications ? '🔔 浮层通知' : '🔕 浮层通知'}
      </button>

      {/* 智能体进化通知浮层 */}
      {showOverlayNotifications && agentNotifications.length > 0 && (
        <div className="absolute top-12 right-2 z-50 pointer-events-none space-y-1.5 max-w-xs">
          {agentNotifications.map(n => (
            <div key={n.id}
              className={`pointer-events-auto rounded-lg border px-3 py-2 backdrop-blur-md shadow-lg text-xs animate-in slide-in-from-right-5 fade-in duration-300 ${
                n.type === 'evolution' ? 'border-amber-600/50 bg-amber-950/80 text-amber-200' :
                n.type === 'risk' ? 'border-rose-600/50 bg-rose-950/80 text-rose-200' :
                n.type === 'body' ? 'border-cyan-600/50 bg-cyan-950/80 text-cyan-200' :
                'border-purple-600/50 bg-purple-950/80 text-purple-200'
              }`}>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{n.type === 'evolution' ? '⬆️' : n.type === 'risk' ? '⚠️' : n.type === 'body' ? '🪐' : '🔬'}</span>
                <span className="font-medium truncate">{n.title}</span>
                {n.evolved && <span className="text-amber-400">⚡</span>}
              </div>
              {n.summary && <div className="text-[10px] opacity-70 mt-0.5 truncate">{n.summary}</div>}
            </div>
          ))}
        </div>
      )}

      {/* 天体信息面板 */}
      {showInfo && selectedPlanet && (
        <div className="absolute top-12 left-2 w-72 rounded-lg border border-slate-700/50 bg-slate-900/95 p-3 backdrop-blur-sm shadow-xl z-10 pointer-events-auto">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-cyan-400">{selectedPlanet.nameCn} {selectedPlanet.name}</span>
            <button onClick={() => setShowInfo(false)} className="text-slate-500 hover:text-slate-300 text-lg leading-none">&times;</button>
          </div>
          {/* 天体影像 */}
          {TEXTURE_MAP[selectedPlanet.name] && (
            <div className="mb-2 rounded-lg overflow-hidden border border-slate-700/50">
              <img src={TEXTURE_MAP[selectedPlanet.name]} alt={selectedPlanet.nameCn} className="w-full h-24 object-cover" />
            </div>
          )}
          {selectedPlanet.description && <div className="text-xs text-slate-400 mb-2">{selectedPlanet.description}</div>}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between"><span className="text-slate-400">类型</span><span className="text-cyan-400">{selectedPlanet.type}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">半径</span><span className="text-cyan-400">{selectedPlanet.radiusKm.toLocaleString()} km</span></div>
            <div className="flex justify-between"><span className="text-slate-400">质量</span><span className="text-cyan-400">{selectedPlanet.mass}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">表面引力</span><span className="text-cyan-400">{selectedPlanet.gravity}</span></div>
            {selectedPlanet.distAu > 0 && <div className="flex justify-between"><span className="text-slate-400">距太阳</span><span className="text-amber-400">{selectedPlanet.distAu} AU ({(selectedPlanet.distAu * 149.6).toFixed(1)}百万km)</span></div>}
            {selectedPlanet.orbitalPeriodDays > 0 && <div className="flex justify-between"><span className="text-slate-400">公转周期</span><span className="text-cyan-400">{selectedPlanet.orbitalPeriodDays.toLocaleString()} 天</span></div>}
            <div className="flex justify-between"><span className="text-slate-400">表面温度</span><span className="text-cyan-400">{selectedPlanet.temp}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">卫星数</span><span className="text-cyan-400">{selectedPlanet.moons}</span></div>
          </div>
        </div>
      )}

      {/* ===== 顶部导航栏 ===== */}
      <div className="absolute top-0 left-0 right-0 z-30 pointer-events-auto">
        <div className="flex items-center justify-between px-2 py-1.5 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/40">
          {/* 左: 视角切换 */}
          <div className="flex gap-0.5 rounded-md bg-slate-800/80 p-0.5">
            <button onClick={flyToEarth} className={`rounded px-3 py-1 text-xs font-medium transition-colors ${viewMode==='earth'?'bg-cyan-600 text-white':'text-slate-400 hover:text-white'}`}>地球</button>
            <button onClick={flyToMoon} className={`rounded px-3 py-1 text-xs font-medium transition-colors ${viewMode==='moon'?'bg-amber-600 text-white':'text-slate-400 hover:text-white'}`}>月球</button>
            <button onClick={flyToSolar} className={`rounded px-3 py-1 text-xs font-medium transition-colors ${viewMode==='solar'?'bg-violet-600 text-white':'text-slate-400 hover:text-white'}`}>太阳系</button>
            <button onClick={flyToUniverse} className={`rounded px-3 py-1 text-xs font-medium transition-colors ${viewMode==='universe'?'bg-indigo-600 text-white':'text-slate-400 hover:text-white'}`}>宇宙</button>
          </div>
          {/* 中: 坐标信息(紧凑) */}
          <div className="hidden sm:flex items-center text-[10px] text-slate-400 gap-2">
            {viewMode === 'earth' && mouseCoordinate && <span>{mouseCoordinate.lat.toFixed(2)}°,{mouseCoordinate.lng.toFixed(2)}°</span>}
            {viewMode === 'solar' && <span className="text-amber-400">太阳系 √比例</span>}
            {viewMode === 'universe' && <span className="text-indigo-400">宇宙 2万亿星系</span>}
          </div>
          {/* 右: 核心功能按钮(精简) */}
          <div className="flex items-center gap-1.5">
            {/* 智能体状态 */}
            {(() => { const st = agentEngineState; return (
              <button onClick={() => setShowSpatialAgent(!showSpatialAgent)} className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all ${showSpatialAgent?'bg-emerald-600 text-white':'bg-slate-800/80 text-slate-400 hover:text-white'}`}>
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${st?.isRunning?'bg-emerald-400 animate-pulse':'bg-slate-500'}`} />
                <span className="hidden sm:inline">智能体</span>
              </button>); })()}
            <button onClick={() => setShowAiAssistant(!showAiAssistant)} className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all ${showAiAssistant?'bg-cyan-600 text-white':'bg-slate-800/80 text-cyan-400 hover:bg-cyan-900/50'}`}>✦<span className="hidden sm:inline">AI</span></button>
            <button onClick={() => { setShowSearchPanel(true); setShowFuncMenu(false); }} className="rounded-md bg-indigo-900/40 px-2 py-1 text-xs text-indigo-300 hover:bg-indigo-900/60 hover:text-white transition-all" title="搜索">🔍</button>
            <button onClick={() => setShowFuncMenu(!showFuncMenu)} className="rounded-md bg-slate-800/80 px-2 py-1 text-xs text-slate-400 hover:text-white hover:bg-slate-700 transition-all">☰</button>
            <div className="h-4 w-px bg-slate-700/60" />
            <button onClick={onLogout} title="退出登录" className="flex items-center gap-1 rounded-md bg-slate-800/80 px-2 py-1 text-xs text-slate-400 hover:bg-rose-900/60 hover:text-rose-300 transition-all">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
              <span className="hidden sm:inline">退出</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===== 功能下拉菜单 ===== */}
      {showFuncMenu && (
        <>
          {/* 透明遮罩，点击关闭菜单 */}
          <div className="fixed inset-0 z-30" onClick={() => setShowFuncMenu(false)} />
          <div className="absolute top-10 right-2 z-40 pointer-events-auto w-60 max-h-[75vh] overflow-y-auto rounded-xl border border-slate-700/60 bg-slate-900/95 backdrop-blur-xl shadow-2xl">
          <div className="p-2 space-y-0.5">
            {/* 行星快速导航 - 太阳系专属 */}
            {viewMode === 'solar' && (
              <>
                <div className="text-[10px] font-medium text-slate-400 px-2 py-1">行星导航</div>
                <div className="flex flex-wrap gap-1 px-1 pb-2">
                  <button onClick={() => { setSelectedPlanet({...SUN_DATA,name:'Sun',nameCn:'太阳',distAu:0,orbitalPeriodDays:0,moons:0} as PlanetData); setShowInfo(true); flyTo(new THREE.Vector3(0,SUN_SCENE_RADIUS*3,SUN_SCENE_RADIUS*5), new THREE.Vector3(0,0,0), 2); trackObject(null); setShowFuncMenu(false); }} className="rounded-full bg-yellow-900/40 px-2.5 py-1 text-xs text-yellow-400 hover:bg-yellow-900/70">☀ 太阳</button>
                  {PLANETS.map(p => (
                    <button key={p.name} onClick={() => { flyToPlanet(p); setShowFuncMenu(false); }} className="rounded-full bg-slate-800/80 px-2.5 py-1 text-xs text-slate-400 hover:text-white hover:bg-slate-700">{p.nameCn}</button>
                  ))}
                </div>
                <div className="border-t border-slate-700/40 my-1" />
              </>
            )}
            {/* 可视化控制 */}
            <div className="text-[10px] font-medium text-slate-400 px-2 py-1">可视化</div>
            <div className="flex flex-wrap gap-1 px-1 pb-2">
              <button onClick={() => { setShowCelestialLayers(!showCelestialLayers); setShowFuncMenu(false); }} className={`rounded-full px-2.5 py-1 text-xs transition-colors ${showCelestialLayers?'bg-sky-600 text-white':'bg-slate-800/80 text-sky-400 hover:text-white hover:bg-slate-700'}`}>🌫大气</button>
              <button onClick={() => { setShowUniverseMaterials(!showUniverseMaterials); setShowFuncMenu(false); }} className={`rounded-full px-2.5 py-1 text-xs transition-colors ${showUniverseMaterials?'bg-emerald-600 text-white':'bg-emerald-900/40 text-emerald-400 hover:text-white hover:bg-emerald-900/70'}`}>⚛物质</button>
              <button onClick={() => { setShowSubstanceMode(!showSubstanceMode); setShowFuncMenu(false); }} className={`rounded-full px-2.5 py-1 text-xs transition-colors ${showSubstanceMode?'bg-lime-600 text-white':'bg-lime-900/40 text-lime-400 hover:text-white hover:bg-lime-900/70'}`}>🧪物层</button>
              <button onClick={() => { setShowInvisiblePhenomena(!showInvisiblePhenomena); setShowFuncMenu(false); }} className={`rounded-full px-2.5 py-1 text-xs transition-colors ${showInvisiblePhenomena?'bg-purple-600 text-white':'bg-purple-900/40 text-purple-400 hover:text-white hover:bg-purple-900/70'}`}>⚡场</button>
            </div>
            <div className="border-t border-slate-700/40 my-1" />
            {/* 探索工具 */}
            <div className="text-[10px] font-medium text-slate-400 px-2 py-1">探索</div>
            <div className="flex flex-wrap gap-1 px-1 pb-2">
              <button onClick={() => { setShowWanderAgent(!showWanderAgent); setShowFuncMenu(false); }} className={`rounded-full px-2.5 py-1 text-xs transition-colors ${showWanderAgent?'bg-amber-600 text-white':'bg-amber-900/40 text-amber-400 hover:text-white hover:bg-amber-900/70'}`}>🧬探针</button>
              <button onClick={() => { flyToProbe(); setShowFuncMenu(false); }} className="rounded-full bg-slate-800/80 px-2.5 py-1 text-xs text-amber-400 hover:text-white hover:bg-slate-700">◎定位</button>
              <button onClick={() => { setShowSolarPanel(!showSolarPanel); setShowFuncMenu(false); }} className={`rounded-full px-2.5 py-1 text-xs transition-colors ${showSolarPanel?'bg-violet-600 text-white':'bg-slate-800/80 text-slate-400 hover:text-white'}`}>☉天体库</button>
              <button onClick={() => { setShowTimeCtrl(!showTimeCtrl); setShowFuncMenu(false); }} className={`rounded-full px-2.5 py-1 text-xs transition-colors ${showTimeCtrl?'bg-rose-600 text-white':'bg-slate-800/80 text-slate-400 hover:text-white'}`}>⏱时间</button>
            </div>
            <div className="border-t border-slate-700/40 my-1" />
            {/* 分析工具 */}
            <div className="text-[10px] font-medium text-slate-400 px-2 py-1">分析</div>
            <div className="flex flex-wrap gap-1 px-1 pb-2">
              <button onClick={() => { setShowGravity(!showGravity); setShowFuncMenu(false); }} className={`rounded-full px-2.5 py-1 text-xs transition-colors ${showGravity?'bg-amber-600 text-white':'bg-slate-800/80 text-slate-400 hover:text-white'}`}>G引力</button>
              <button onClick={() => { setShowGravityField(!showGravityField); setShowFuncMenu(false); }} className={`rounded-full px-2.5 py-1 text-xs transition-colors ${showGravityField?'bg-cyan-600 text-white':'bg-slate-800/80 text-slate-400 hover:text-white'}`}>F引力场</button>
              <button onClick={() => { setShowGeoEvolution(!showGeoEvolution); setShowFuncMenu(false); }} className={`rounded-full px-2.5 py-1 text-xs transition-colors ${showGeoEvolution?'bg-purple-600 text-white':'bg-slate-800/80 text-slate-400 hover:text-white'}`}>⏳地质</button>
              <button onClick={() => { setShowNavPlanner(!showNavPlanner); setShowFuncMenu(false); }} className={`rounded-full px-2.5 py-1 text-xs transition-colors ${showNavPlanner?'bg-teal-600 text-white':'bg-slate-800/80 text-slate-400 hover:text-white'}`}>🚀航行</button>
              <button onClick={() => { setShowEvoHistory(!showEvoHistory); setShowFuncMenu(false); }} className={`rounded-full px-2.5 py-1 text-xs transition-colors ${showEvoHistory?'bg-indigo-600 text-white':'bg-slate-800/80 text-slate-400 hover:text-white'}`}>🌌演化</button>
              <button onClick={() => { setShowRemoteSensing(!showRemoteSensing); setShowFuncMenu(false); }} className={`rounded-full px-2.5 py-1 text-xs transition-colors ${showRemoteSensing?'bg-orange-600 text-white':'bg-slate-800/80 text-slate-400 hover:text-white'}`}>📡遥感</button>
              <button onClick={() => { setShowAsteroidDiscovery(!showAsteroidDiscovery); setShowFuncMenu(false); }} className={`rounded-full px-2.5 py-1 text-xs transition-colors ${showAsteroidDiscovery?'bg-amber-600 text-white':'bg-slate-800/80 text-slate-400 hover:text-white'}`}>☄小行星</button>
            </div>
            <div className="border-t border-slate-700/40 my-1" />
            {/* 高级模块 */}
            <div className="text-[10px] font-medium text-slate-400 px-2 py-1">高级</div>
            <div className="flex flex-wrap gap-1 px-1 pb-2">
              <button onClick={() => { setShowDigitalTwin(!showDigitalTwin); setShowFuncMenu(false); }} className={`rounded-full px-2.5 py-1 text-xs transition-colors ${showDigitalTwin?'bg-cyan-600 text-white':'bg-slate-800/80 text-slate-400 hover:text-white'}`}>DT孪生</button>
              <button onClick={() => { setShowSpatialAgent(!showSpatialAgent); setShowFuncMenu(false); }} className={`rounded-full px-2.5 py-1 text-xs transition-colors ${showSpatialAgent?'bg-emerald-600 text-white':'bg-slate-800/80 text-slate-400 hover:text-white'}`}>AI空间</button>
              <button onClick={() => { setShowNativeAi(!showNativeAi); setShowFuncMenu(false); }} className={`rounded-full px-2.5 py-1 text-xs transition-colors ${showNativeAi?'bg-violet-600 text-white':'bg-slate-800/80 text-slate-400 hover:text-white'}`}>NN原生</button>
              <button onClick={() => { setShowEngineering(!showEngineering); setShowFuncMenu(false); }} className={`rounded-full px-2.5 py-1 text-xs transition-colors ${showEngineering?'bg-orange-600 text-white':'bg-slate-800/80 text-slate-400 hover:text-white'}`}>EN工程</button>
            </div>
            <div className="border-t border-slate-700/40 my-1" />
            {/* 视图控制 */}
            <div className="text-[10px] font-medium text-slate-400 px-2 py-1">视图</div>
            <div className="flex items-center gap-1 px-1 pb-1">
              <button onClick={handleReset} className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-800/80 text-cyan-400 text-xs hover:bg-slate-700" title="复位">↺</button>
              <button onClick={handleZoomIn} className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-800/80 text-cyan-400 text-sm hover:bg-slate-700" title="放大">+</button>
              <button onClick={handleZoomOut} className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-800/80 text-cyan-400 text-sm hover:bg-slate-700" title="缩小">−</button>
              <button onClick={() => setAutoRotate(!autoRotate)} className={`flex h-7 w-7 items-center justify-center rounded-md text-xs hover:bg-slate-700 ${autoRotate?'bg-cyan-600 text-white':'bg-slate-800/80 text-slate-400'}`} title="自转">↻</button>
              <button onClick={() => setShowGrid(!showGrid)} className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold hover:bg-slate-700 ${showGrid?'bg-cyan-600 text-white':'bg-slate-800/80 text-slate-400'}`} title="网格">⊞</button>
              <button onClick={() => setShowTiles(!showTiles)} className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold hover:bg-slate-700 ${showTiles?'bg-emerald-600 text-white':'bg-slate-800/80 text-slate-400'}`} title="瓦片">▦</button>
            </div>
            </div>
          </div>
        </>
      )}

      {/* 引力计算面板 */}
      {showGravity && <GravityPanel onClose={() => setShowGravity(false)} />}

      {/* 宇宙物质数据库面板 */}
      {/* ===== 全局搜索面板 ===== */}
      {showSearchPanel && (
        <div className="fixed inset-0 z-50 lg:inset-auto lg:absolute lg:top-14 lg:left-3 lg:w-[480px] lg:max-h-[85vh] bg-slate-900/98 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-y-auto shadow-2xl">
          {/* 手机端关闭栏 */}
          <div className="flex items-center justify-between p-3 lg:hidden border-b border-slate-700/50">
            <span className="text-sm font-medium text-indigo-400">🔍 全宇宙搜索</span>
            <button onClick={() => { setShowSearchPanel(false); setSearchQuery(''); }} className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600/80 text-white text-lg">✕</button>
          </div>
          {/* 搜索框 */}
          <div className="p-3 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索2万亿星系、恒星、星云、黑洞、物质..."
                className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                autoFocus
              />
              <button onClick={() => { setShowSearchPanel(false); setSearchQuery(''); }} className="hidden lg:block text-slate-400 hover:text-white text-sm px-2">关闭</button>
            </div>
            {!searchQuery && (
              <div className="mt-2 text-xs text-slate-500">
                2万亿星系 · 2×10²³恒星 · 10⁸+白矮星/中子星 · {SUBSTANCE_STATS.totalUnique}种物质
              </div>
            )}
          </div>
          {/* 搜索结果 */}
          <div className="p-2 space-y-1 max-h-[70vh] lg:max-h-[65vh] overflow-y-auto">
            {searchQuery.length >= 1 && (() => {
              const q = searchQuery.toLowerCase();
              // 搜索1: 天体目录
              const catalogResults = searchCosmicObjects(q);
              // 搜索2: 宇宙分类(天体类型)
              const taxonomyResults: {cat: CosmicCategory; obj: TaxonomyObject}[] = [];
              for (const cat of COSMIC_TAXONOMY) {
                for (const obj of cat.objects) {
                  const match = obj.name.toLowerCase().includes(q) ||
                    obj.nameCn.toLowerCase().includes(q) ||
                    obj.description?.toLowerCase().includes(q) ||
                    obj.type.toLowerCase().includes(q);
                  if (match) taxonomyResults.push({cat, obj});
                }
              }
              // 搜索3: 物质(从统一去重数据库)
              const substanceResults: CosmicSubstance[] = [];
              for (const s of ALL_COSMIC_SUBSTANCES) {
                const mMatch = (s.nameCn || s.formula || '').toLowerCase().includes(q) ||
                  (s.nameEn || '').toLowerCase().includes(q) ||
                  s.formula.toLowerCase().includes(q) ||
                  (s.category || '').toLowerCase().includes(q) ||
                  (s.state || '').toLowerCase().includes(q) ||
                  (s.note || '').toLowerCase().includes(q) ||
                  (s.foundIn || []).some(f => f.toLowerCase().includes(q));
                if (mMatch) substanceResults.push(s);
              }
              // 太阳系物质(保留旧数据源作为补充)
              const solarResults: {name: string; formula: string; source: string; state: string; category: string}[] = [];
              for (const [bodyKey, bodyData] of Object.entries(SOLAR_SYSTEM_MATERIALS)) {
                const bd = bodyData as BodyMaterials;
                for (const m of bd.materials) {
                  const mMatch = m.name.toLowerCase().includes(q) ||
                    m.formula.toLowerCase().includes(q) ||
                    m.category.toLowerCase().includes(q);
                  if (mMatch) solarResults.push({name: m.name, formula: m.formula, source: bd.nameCn || bodyKey, state: m.state || '未知', category: m.category});
                }
              }
              // 去重: 太阳系物质中已在substanceResults里的不再重复
              const substanceFormulas = new Set(substanceResults.map(s => s.formula));
              const uniqueSolarResults = solarResults.filter(s => !substanceFormulas.has(s.formula));
              const totalResults = catalogResults.length + taxonomyResults.length + substanceResults.length + uniqueSolarResults.length;
              if (totalResults === 0) {
                return <div className="text-center text-slate-500 py-8">未找到匹配的天体或物质</div>;
              }
              return (
                <>
                  {/* 分类统计 */}
                  <div className="text-xs text-slate-500 px-2 pb-2">
                    找到 {catalogResults.length} 个天体 · {taxonomyResults.length} 个类型 · {substanceResults.length + uniqueSolarResults.length} 种物质
                  </div>
                  {/* 天体目录结果 */}
                  {catalogResults.length > 0 && (
                    <div className="space-y-0.5">
                      <div className="text-[9px] text-indigo-400 uppercase tracking-wider px-2 py-1">🔭 具名天体</div>
                      {catalogResults.map(obj => {
                        const vis = COSMIC_OBJECT_TYPE_MAP[obj.type as keyof typeof COSMIC_OBJECT_TYPE_MAP] || COSMIC_OBJECT_TYPE_MAP['其他' as keyof typeof COSMIC_OBJECT_TYPE_MAP];
                        return (
                          <button
                            key={obj.id}
                            onClick={() => {
                              if (viewMode !== 'universe') setViewMode('universe');
                              const tx = obj.sceneX;
                              const ty = obj.sceneY;
                              const tz = obj.sceneZ;
                              const bodyInfo = { id: obj.id, name: obj.name, nameCn: obj.name, type: obj.typeCn, massKg: 0, radiusKm: 0, distAu: obj.distance, gravity: 0, temp: 0, orbitalPeriodDays: 0, eccentricity: 0, inclination: 0, moons: 0, atmosphere: obj.description || '', description: obj.description || '', color: '#06b6d4' };
                              kkk.setFocusedBody(bodyInfo);
                              setTimeout(() => {
                                if (cameraRef.current && rendererRef.current) {
                                  const cam = cameraRef.current;
                                  const startPos = cam.position.clone();
                                  const sz = obj.size ? parseFloat(obj.size) * 0.01 : 2;
                                  const endPos = new THREE.Vector3(tx + sz * 5, ty + sz * 3, tz + sz * 5);
                                  const startTime = performance.now();
                                  const duration = 1500;
                                  const animateFly = () => {
                                    const elapsed = performance.now() - startTime;
                                    const t = Math.min(elapsed / duration, 1);
                                    const easeT = 1 - Math.pow(1 - t, 3);
                                    cam.position.lerpVectors(startPos, endPos, easeT);
                                    cam.lookAt(tx, ty, tz);
                                    if (t < 1) requestAnimationFrame(animateFly);
                                  };
                                  animateFly();
                                }
                              }, 100);
                              setShowSearchPanel(false);
                              setSearchQuery('');
                            }}
                            className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/80 transition-colors text-left"
                          >
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: obj.color || '#666' }} />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-white truncate">{obj.name}</div>
                              <div className="text-xs text-slate-500">{obj.typeCn} · {obj.distance}万光年{obj.constellation ? ` · ${obj.constellation}` : ''}</div>
                            </div>
                            <span className="text-xs text-indigo-400 flex-shrink-0">→</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {/* 宇宙分类结果 */}
                  {taxonomyResults.length > 0 && (
                    <div className="space-y-0.5 mt-2">
                      <div className="text-[9px] text-amber-400 uppercase tracking-wider px-2 py-1">🌌 天体类型(含数量)</div>
                      {taxonomyResults.slice(0, 30).map(({cat, obj}) => (
                        <button
                          key={obj.id}
                          onClick={() => {
                            if (viewMode !== 'universe') setViewMode('universe');
                            setShowSearchPanel(false);
                            setSearchQuery('');
                            setShowUniverseMaterials(true);
                          }}
                          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/80 transition-colors text-left"
                        >
                          <div className="w-3 h-3 rounded flex-shrink-0 bg-amber-500/60" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white truncate">{obj.nameCn} <span className="text-amber-400 text-xs">({obj.estimatedCount})</span></div>
                            <div className="text-xs text-slate-500">{cat.nameCn} · {obj.type}{obj.description ? ` · ${obj.description.slice(0, 30)}` : ''}</div>
                          </div>
                          <span className="text-xs text-amber-400 flex-shrink-0">→</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {/* 物质搜索结果 - 统一去重数据库 */}
                  {substanceResults.length > 0 && (
                    <div className="space-y-0.5 mt-2">
                      <div className="text-[9px] text-emerald-400 uppercase tracking-wider px-2 py-1">⚛ 物质 ({substanceResults.length}种)</div>
                      {substanceResults.slice(0, 80).map((s) => {
                        const catLabel = s.category === 'element' ? '元素' : s.category === 'isotope' ? '同位素' : s.category === 'molecule' ? '分子' : s.category === 'mineral' ? '矿物' : s.category === 'organic' ? '有机物' : '奇异物质';
                        return (
                          <button
                            key={s.formula}
                            onClick={() => {
                              setShowSearchPanel(false);
                              setSearchQuery('');
                              setShowUniverseMaterials(true);
                            }}
                            className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/80 transition-colors text-left"
                          >
                            <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: s.category === 'exotic' ? '#a855f7' : s.category === 'element' ? '#10b981' : s.category === 'mineral' ? '#f59e0b' : s.category === 'organic' ? '#06b6d4' : '#64748b' }} />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-white truncate">{s.nameCn} <span className="text-emerald-400 text-xs">{s.formula}</span></div>
                              <div className="text-xs text-slate-500">{catLabel} · {s.state} · {(s.foundIn || []).slice(0, 2).join('/')}</div>
                            </div>
                            <span className="text-xs text-emerald-400 flex-shrink-0">→</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {/* 太阳系补充物质 */}
                  {uniqueSolarResults.length > 0 && (
                    <div className="space-y-0.5 mt-2">
                      <div className="text-[9px] text-cyan-400 uppercase tracking-wider px-2 py-1">☀ 太阳系物质 ({uniqueSolarResults.length}种)</div>
                      {uniqueSolarResults.slice(0, 30).map((m, i) => (
                        <button
                          key={`solar-mat-${i}`}
                          onClick={() => {
                            setShowSearchPanel(false);
                            setSearchQuery('');
                            setShowUniverseMaterials(true);
                          }}
                          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/80 transition-colors text-left"
                        >
                          <div className="w-3 h-3 rounded flex-shrink-0 bg-cyan-500/60" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white truncate">{m.name} <span className="text-cyan-400 text-xs">{m.formula}</span></div>
                            <div className="text-xs text-slate-500">{m.source} · {m.state} · {m.category}</div>
                          </div>
                          <span className="text-xs text-cyan-400 flex-shrink-0">→</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {showUniverseMaterials && (
        <UniverseMaterialsPanel
          onClose={() => setShowUniverseMaterials(false)}
          onNavigateToBody={(bodyKey: string) => {
            moveProbeToBody(bodyKey);
            setShowUniverseMaterials(false);
          }}
        />
      )}

      {/* 太阳系天体数据库面板 */}
      {showSolarPanel && (
        <div className="fixed inset-0 z-50 lg:inset-auto lg:absolute lg:top-14 lg:left-3 lg:z-30 lg:w-[520px] lg:max-h-[calc(100vh-5rem)] bg-slate-900/95 lg:bg-transparent overflow-y-auto">
          <div className="flex items-center justify-between p-3 lg:hidden border-b border-slate-700/50">
            <span className="text-sm font-medium text-cyan-400">太阳系天体数据库</span>
            <button onClick={() => setShowSolarPanel(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 text-lg">✕</button>
          </div>
          <SolarSystemPanel onClose={() => setShowSolarPanel(false)} />
        </div>
      )}

      {/* 时间控制器 */}
      {showTimeCtrl && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 w-[calc(100vw-1.5rem)] lg:w-[480px]">
          <TimeController
            onDateChange={(jde: number) => setSimTime(jde)}
            onSpeedChange={(spd: number) => setSimSpeed(spd)}
          />
        </div>
      )}

      {/* 多体引力场动态可视化 */}
      {showGravityField && (
        <GravityFieldPanel onClose={() => setShowGravityField(false)} focusedBody={kkk.focusedBody} onNavigate={kkk.emitSignal} />
      )}

      {/* 地质年代-地貌演化分析 */}
      {showGeoEvolution && (
        <GeologicalEvolutionPanel onClose={() => setShowGeoEvolution(false)} focusedBody={kkk.focusedBody} onNavigate={kkk.emitSignal} />
      )}

      {/* 星际航行路径规划 */}
      {showNavPlanner && (
        <NavigationPlannerPanel onClose={() => setShowNavPlanner(false)} focusedBody={kkk.focusedBody} onNavigate={kkk.emitSignal} />
      )}

      {/* 天体演化史时空漫游 */}
      {showEvoHistory && (
        <EvolutionHistoryPanel onClose={() => setShowEvoHistory(false)} focusedBody={kkk.focusedBody} onNavigate={kkk.emitSignal} />
      )}

      {/* 多波段遥感分析 */}
      {showRemoteSensing && (
        <RemoteSensingPanel onClose={() => setShowRemoteSensing(false)} focusedBody={kkk.focusedBody} onNavigate={kkk.emitSignal} />
      )}

      {/* 小行星发现与分类 */}
      {showAsteroidDiscovery && (
        <AsteroidDiscoveryPanel onClose={() => setShowAsteroidDiscovery(false)} focusedBody={kkk.focusedBody} onNavigate={kkk.emitSignal} />
      )}

      {/* 全时空数字孪生 */}
      {showDigitalTwin && (
        <DigitalTwinPanel onClose={() => setShowDigitalTwin(false)} focusedBody={kkk.focusedBody} twinState={kkk.twinState} onTwinUpdate={kkk.setTwinState} onNavigate={kkk.emitSignal} />
      )}

      {/* 空间智能体 */}
      {showSpatialAgent && (
        <SpatialAgentPanel onClose={() => setShowSpatialAgent(false)} focusedBody={kkk.focusedBody} onNavigate={kkk.emitSignal} currentView={viewMode} probeDetection={probeDetection} />
      )}

      {/* 原生AI模块 */}
      {showNativeAi && (
        <NativeAiPanel onClose={() => setShowNativeAi(false)} focusedBody={kkk.focusedBody} onNavigate={kkk.emitSignal} />
      )}

      {/* 工程应用 */}
      {showEngineering && (
        <EngineeringPanel onClose={() => setShowEngineering(false)} focusedBody={kkk.focusedBody} twinState={kkk.twinState} onNavigate={kkk.emitSignal} />
      )}

      {/* 全能AI助手 */}
      {showAiAssistant && (
        <AiAssistant onClose={() => setShowAiAssistant(false)} />
      )}

      {/* 天体大气层 */}
      {showCelestialLayers && (
        <CelestialLayersPanel
          onClose={() => setShowCelestialLayers(false)}
          focusedBody={kkk.focusedBody}
          onNavigate={kkk.emitSignal}
          simTimeBillionYearsAgo={0}
        />
      )}

      {/* 星际探针 · 自主游荡智能体（任何视角可用） */}
      {showWanderAgent && (
        <WanderAgentPanel
          onClose={() => setShowWanderAgent(false)}
          focusedBody={kkk.focusedBody}
          onNavigate={kkk.emitSignal}
          onMoveProbe={moveProbeToBody}
          onLocateProbe={flyToProbe}
          probePosition={probePosition}
        />
      )}

      {/* 智能指令结果面板 */}
      {kkk.smartCommandResult && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 w-[calc(100vw-1rem)] lg:w-[560px] max-h-[70vh] overflow-y-auto rounded-xl border border-cyan-700/50 bg-slate-900/95 p-4 backdrop-blur-md shadow-2xl pointer-events-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <span className="text-sm font-semibold text-cyan-400">智能分析结果</span>
              <span className="text-xs text-slate-500">「{kkk.smartCommandResult.query}」</span>
            </div>
            <button onClick={() => kkk.setSmartCommandResult(null)} className="text-slate-500 hover:text-slate-300 text-lg leading-none">&times;</button>
          </div>
          <div className="space-y-3 text-xs">
            {/* 意图识别 */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500">识别意图:</span>
              <span className="rounded bg-cyan-900/50 px-2 py-0.5 text-cyan-400">{kkk.smartCommandResult.intent}</span>
              {(kkk.smartCommandResult.modules || []).map((m: string) => (
                <span key={m} className="rounded bg-slate-700/50 px-2 py-0.5 text-slate-300">{m}</span>
              ))}
            </div>
            {/* 天体分析 */}
            {kkk.smartCommandResult.bodyAnalysis && (
              <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
                <div className="text-amber-400 font-medium mb-2">{kkk.smartCommandResult.bodyAnalysis.body} 物理参数</div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {kkk.smartCommandResult.bodyAnalysis.mass && <div><span className="text-slate-500">质量</span><br/><span className="text-cyan-400">{kkk.smartCommandResult.bodyAnalysis.mass}</span></div>}
                  {kkk.smartCommandResult.bodyAnalysis.radius && <div><span className="text-slate-500">半径</span><br/><span className="text-cyan-400">{kkk.smartCommandResult.bodyAnalysis.radius}</span></div>}
                  {kkk.smartCommandResult.bodyAnalysis.gravity && <div><span className="text-slate-500">表面引力</span><br/><span className="text-cyan-400">{kkk.smartCommandResult.bodyAnalysis.gravity} m/s²</span></div>}
                  {kkk.smartCommandResult.bodyAnalysis.temp && <div><span className="text-slate-500">表面温度</span><br/><span className="text-cyan-400">{kkk.smartCommandResult.bodyAnalysis.temp}°C</span></div>}
                  {kkk.smartCommandResult.bodyAnalysis.escapeVelocity && <div><span className="text-slate-500">逃逸速度</span><br/><span className="text-cyan-400">{kkk.smartCommandResult.bodyAnalysis.escapeVelocity} km/s</span></div>}
                </div>
              </div>
            )}
            {/* 轨道规划 */}
            {kkk.smartCommandResult.orbitPlan && (
              <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
                <div className="text-violet-400 font-medium mb-2">轨道转移方案</div>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-slate-500">出发</span> <span className="text-cyan-400">{kkk.smartCommandResult.orbitPlan.from}</span></div>
                  <div><span className="text-slate-500">到达</span> <span className="text-cyan-400">{kkk.smartCommandResult.orbitPlan.to}</span></div>
                  <div><span className="text-slate-500">Δv</span> <span className="text-amber-400">{kkk.smartCommandResult.orbitPlan.deltaV} km/s</span></div>
                  <div><span className="text-slate-500">转移时间</span> <span className="text-cyan-400">{kkk.smartCommandResult.orbitPlan.transferTime} 天</span></div>
                  <div className="col-span-2"><span className="text-slate-500">窗口期</span> <span className="text-emerald-400">{kkk.smartCommandResult.orbitPlan.hohmannWindow}</span></div>
                </div>
              </div>
            )}
            {/* NEO风险 */}
            {kkk.smartCommandResult.neoRisk && (
              <div className={`rounded-lg border p-3 ${kkk.smartCommandResult.neoRisk.level === '紧急' ? 'border-red-600/50 bg-red-950/30' : kkk.smartCommandResult.neoRisk.level === '危险' ? 'border-orange-600/50 bg-orange-950/30' : 'border-slate-700/50 bg-slate-800/50'}`}>
                <div className="text-rose-400 font-medium mb-1">近地小行星风险</div>
                <div className="grid grid-cols-3 gap-2">
                  <div><span className="text-slate-500">天体</span><br/><span className="text-white">{kkk.smartCommandResult.neoRisk.name}</span></div>
                  <div><span className="text-slate-500">碰撞概率</span><br/><span className="text-amber-400">{kkk.smartCommandResult.neoRisk.probability}%</span></div>
                  <div><span className="text-slate-500">威胁等级</span><br/><span className={kkk.smartCommandResult.neoRisk.level === '紧急' ? 'text-red-400' : kkk.smartCommandResult.neoRisk.level === '危险' ? 'text-orange-400' : 'text-emerald-400'}>{kkk.smartCommandResult.neoRisk.level}</span></div>
                </div>
              </div>
            )}
            {/* 着陆选址 */}
            {kkk.smartCommandResult.landingSites && kkk.smartCommandResult.landingSites.length > 0 && (
              <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
                <div className="text-emerald-400 font-medium mb-2">着陆候选区</div>
                <div className="space-y-1.5">
                  {kkk.smartCommandResult.landingSites.map((s, i) => (
                    <div key={i} className="flex items-center justify-between rounded bg-slate-900/50 px-2 py-1.5">
                      <span className="text-slate-300">{s.name}</span>
                      <div className="flex gap-3">
                        <span className="text-emerald-400">安全{s.safety}</span>
                        <span className="text-cyan-400">资源{s.resource}</span>
                        <span className="text-violet-400">科学{s.science}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* 地质时代 */}
            {kkk.smartCommandResult.geologicalEra && (
              <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
                <div className="text-amber-400 font-medium mb-2">{kkk.smartCommandResult.geologicalEra.body} · {kkk.smartCommandResult.geologicalEra.era}</div>
                <div className="text-slate-400 mb-1">约{kkk.smartCommandResult.geologicalEra.yearsAgo}年前</div>
                <div className="flex flex-wrap gap-1">{(kkk.smartCommandResult.geologicalEra.features || []).map((f: string, i: number) => <span key={i} className="rounded bg-slate-700/50 px-1.5 py-0.5 text-slate-300">{f}</span>)}</div>
              </div>
            )}
            {/* 遥感发现 */}
            {kkk.smartCommandResult.remoteSensing && (
              <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
                <div className="text-violet-400 font-medium mb-2">{kkk.smartCommandResult.remoteSensing.body} 多波段遥感</div>
                <div className="flex gap-1 mb-1.5">{(kkk.smartCommandResult.remoteSensing.bands || []).map((b: string, i: number) => <span key={i} className="rounded bg-violet-900/50 px-1.5 py-0.5 text-violet-300 text-[10px]">{b}</span>)}</div>
                <ul className="space-y-0.5 text-slate-300">{(kkk.smartCommandResult.remoteSensing.findings || []).map((f: string, i: number) => <li key={i}>• {f}</li>)}</ul>
              </div>
            )}
            {/* 综合结论 */}
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-950/20 p-3">
              <div className="text-cyan-400 font-medium mb-1">综合分析</div>
              <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">{kkk.smartCommandResult.summary}</div>
            </div>
            {/* 联动操作 */}
            {kkk.smartCommandResult.actions && kkk.smartCommandResult.actions.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-slate-500">联动操作:</span>
                {kkk.smartCommandResult.actions.map((a, i) => (
                  <button key={i} onClick={() => { kkk.emitSignal({ type: a.signal as mmSignalType, payload: a.payload ?? {} }); kkk.setSmartCommandResult(null); }} className="rounded bg-slate-700/50 px-2.5 py-1 text-xs text-cyan-400 hover:bg-slate-600/50 transition-colors">
                    {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 范围搜索 */}
      {showRadiusSearch && searchCenterRef.current && viewMode === 'earth' && (
        <div className="absolute bottom-16 left-2 w-72 rounded-lg border border-slate-700/50 bg-slate-900/95 p-3 backdrop-blur-sm shadow-xl pointer-events-auto">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-cyan-400">范围搜索</span>
            <button onClick={() => { setShowRadiusSearch(false); setSearchResults([]); }} className="text-slate-500 hover:text-slate-300">&times;</button>
          </div>
          <div className="mb-2 text-xs text-slate-400">中心: {searchCenterRef.current.lat.toFixed(4)}°, {searchCenterRef.current.lng.toFixed(4)}°</div>
          <div className="mb-2 flex items-center gap-2">
            <label className="text-xs text-slate-400 whitespace-nowrap">半径:</label>
            <input type="number" value={searchRadius} onChange={e => { const v=parseInt(e.target.value)||1; setSearchRadius(v); if(searchCenterRef.current){const res=(features||[]).filter(f=>f.latitude!=null&&f.longitude!=null).map(f=>({...f,distance:haversineDistance(searchCenterRef.current!.lat,searchCenterRef.current!.lng,f.latitude,f.longitude)})).filter(f=>f.distance<=v).sort((a,b)=>a.distance-b.distance); setSearchResults(res);} }} className="w-20 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-200" min="1" max="20000" />
            <span className="text-xs text-slate-400">公里</span>
          </div>
          <div className="text-xs text-slate-400">找到 {searchResults.length} 个要素</div>
          <div className="mt-1 max-h-32 overflow-y-auto">
            {searchResults.map(f => <div key={f.id} onClick={() => onFeatureSelect?.(f.id)} className="cursor-pointer rounded px-2 py-1 text-xs text-amber-400 hover:bg-slate-800 truncate">{f.title} ({f.distance.toFixed(1)}km)</div>)}
          </div>
        </div>
      )}

      {/* 底部提示 */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/90 px-4 py-1 text-[10px] text-slate-500 backdrop-blur-sm border border-slate-700/30 whitespace-nowrap pointer-events-none select-none z-[35]">
        {viewMode === 'earth' ? '双击放大 | 拖拽旋转 | 滚轮缩放' : viewMode === 'universe' ? '点击星系/星云查看 · 滚轮缩放 · 拖拽旋转' : '点击行星查看信息 · 双击飞向行星 · 滚轮缩放'}
      </div>
    </div>
  );
}

// 全局测试函数：在浏览器控制台输入 window.testPlanetRotation() 调用
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).testPlanetRotation = () => {
    console.log('【SkyGIS 测试】触发行星旋转测试...');
    // 模拟一次动画帧
    const event = new CustomEvent('skygis-test-rotation');
    window.dispatchEvent(event);
    return '已触发旋转测试事件';
  };
  
  (window as unknown as Record<string, unknown>).checkOrbitGroups = () => {
    // 这个需要在组件内部执行，返回提示信息
    return '请在控制台查看 globe-map.tsx 中的 planetOrbitGroupsRef.size';
  };
}
