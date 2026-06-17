import { NextResponse } from 'next/server';
import {
  convertCoordinates,
  convertToAllSystems,
  getCoordinateSystem,
  getAllCoordinateSystems,
  getTransformParams,
  getUCSTransformParams,
  heliocentricEclipticToUCS,
  ucsToHeliocentricEcliptic,
  cartesianToSpherical as ucsCartesianToSpherical,
  sphericalToCartesian as ucsSphericalToCartesian,
  convertDistance,
  type Vec3,
} from '@/lib/universe-coordinate-system';

/**
 * 天体坐标系统转换 API
 * 支持9大坐标系互转：全宇宙(UCS) + 日心(HCI) + 地心赤道(GEO) + 黄道(ECL) + 天球赤道(EQ) + 银心 + 银道 + 地平 + 超星系
 * 参考历元：J2000.0
 * 新增UCS全宇宙坐标系：宇宙中心为原点，地球为定位点
 */

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

// 行星轨道参数（J2000.0）
const ORBITAL_DATA: Record<string, {
  a: number; e: number; i: number; omega: number; w: number; M0: number; period: number;
}> = {
  '水星': { a: 0.387, e: 0.2056, i: 7.005, omega: 48.331, w: 29.124, M0: 174.796, period: 87.969 },
  '金星': { a: 0.723, e: 0.0068, i: 3.3947, omega: 76.680, w: 54.884, M0: 50.115, period: 224.701 },
  '地球': { a: 1.000, e: 0.0167, i: 0.0, omega: -11.261, w: 114.208, M0: 357.517, period: 365.256 },
  '火星': { a: 1.524, e: 0.0934, i: 1.850, omega: 49.558, w: 286.502, M0: 19.373, period: 686.980 },
  '木星': { a: 5.203, e: 0.0489, i: 1.303, omega: 100.464, w: 273.867, M0: 20.020, period: 4332.59 },
  '土星': { a: 9.537, e: 0.0565, i: 2.489, omega: 113.665, w: 339.392, M0: 317.020, period: 10759.22 },
  '天王星': { a: 19.191, e: 0.0463, i: 0.773, omega: 74.006, w: 96.998, M0: 142.238, period: 30688.5 },
  '海王星': { a: 30.069, e: 0.0095, i: 1.770, omega: 131.784, w: 276.336, M0: 256.228, period: 60182.0 },
};

// 解开普勒方程：M = E - e*sin(E)
function solveKepler(M: number, e: number, tol = 1e-8): number {
  let E = M;
  for (let i = 0; i < 50; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < tol) break;
  }
  return E;
}

// 计算天体在给定日期的日心直角坐标 (AU)
function getHeliocentricCartesian(body: string, jde: number): { x: number; y: number; z: number } {
  const orb = ORBITAL_DATA[body];
  if (!orb) return { x: 0, y: 0, z: 0 };

  const T = (jde - 2451545.0) / 36525.0; // J2000.0 centuries
  const n = 360 / orb.period; // mean motion deg/day
  const daysSinceJ2000 = jde - 2451545.0;
  const M = ((orb.M0 + n * daysSinceJ2000) % 360) * DEG;

  const E = solveKepler(M, orb.e);
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);

  // 轨道平面坐标
  const xOrb = orb.a * (cosE - orb.e);
  const yOrb = orb.a * Math.sqrt(1 - orb.e * orb.e) * sinE;

  // 旋转到黄道坐标
  const omega = orb.omega * DEG;
  const w = orb.w * DEG;
  const i = orb.i * DEG;

  const cosW = Math.cos(w); const sinW = Math.sin(w);
  const cosO = Math.cos(omega); const sinO = Math.sin(omega);
  const cosI = Math.cos(i); const sinI = Math.sin(i);

  const x = (cosO * cosW - sinO * sinW * cosI) * xOrb + (-cosO * sinW - sinO * cosW * cosI) * yOrb;
  const y = (sinO * cosW + cosO * sinW * cosI) * xOrb + (-sinO * sinW + cosO * cosW * cosI) * yOrb;
  const z = (sinW * sinI) * xOrb + (cosW * sinI) * yOrb;

  return { x, y, z };
}

// 黄道直角坐标 → 球面坐标 (经度, 纬度, 距离)
function cartesianToSpherical(x: number, y: number, z: number): { lon: number; lat: number; r: number } {
  const r = Math.sqrt(x * x + y * y + z * z);
  const lon = Math.atan2(y, x) * RAD;
  const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * RAD;
  return { lon: ((lon % 360) + 360) % 360, lat, r };
}

// 黄道坐标 → 赤道坐标 (绕X轴旋转 -23.4393°)
function eclipticToEquatorial(x: number, y: number, z: number): { x: number; y: number; z: number } {
  const eps = 23.4393 * DEG;
  const cosEps = Math.cos(eps);
  const sinEps = Math.sin(eps);
  return {
    x,
    y: y * cosEps - z * sinEps,
    z: y * sinEps + z * cosEps,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'convert';

  try {
    if (action === 'convert') {
      // 坐标转换
      const fromSystem = searchParams.get('from'); // hci | ecl | eq
      const toSystem = searchParams.get('to'); // hci | ecl | eq | spherical
      const x = parseFloat(searchParams.get('x') || '0');
      const y = parseFloat(searchParams.get('y') || '0');
      const z = parseFloat(searchParams.get('z') || '0');

      if (!fromSystem || !toSystem) {
        return NextResponse.json({ error: 'from and to system required (UCS|hci|ecl|eq|spherical)' }, { status: 400 });
      }

      // 先转到黄道坐标
      let eclX = x, eclY = y, eclZ = z;
      if (fromSystem === 'UCS') {
        // UCS → 黄道(HCI): 使用7参数逆变换
        const hci = ucsToHeliocentricEcliptic({ x, y, z });
        eclX = hci.x; eclY = hci.y; eclZ = hci.z;
      } else if (fromSystem === 'eq') {
        const result = eclipticToEquatorial(x, y, z);
        // 逆变换：赤道→黄道
        const eps = 23.4393 * DEG;
        eclY = y * Math.cos(eps) + z * Math.sin(eps);
        eclZ = -y * Math.sin(eps) + z * Math.cos(eps);
      } else if (fromSystem === 'spherical') {
        // 球面→直角(黄道)
        const r = x; // radius
        const lon = y * DEG; // longitude in degrees
        const lat = z * DEG; // latitude in degrees
        eclX = r * Math.cos(lat) * Math.cos(lon);
        eclY = r * Math.cos(lat) * Math.sin(lon);
        eclZ = r * Math.sin(lat);
      }

      // 从黄道坐标转到目标系统
      let result: Record<string, number | string>;
      if (toSystem === 'ecl') {
        result = { x: eclX, y: eclY, z: eclZ, system: 'ecliptic' };
      } else if (toSystem === 'eq') {
        const eq = eclipticToEquatorial(eclX, eclY, eclZ);
        result = { x: eq.x, y: eq.y, z: eq.z, system: 'equatorial' };
      } else if (toSystem === 'spherical') {
        const sp = cartesianToSpherical(eclX, eclY, eclZ);
        result = { lon: sp.lon, lat: sp.lat, r: sp.r, system: 'spherical' };
      } else if (toSystem === 'UCS') {
        // 黄道(HCI) → UCS: 使用7参数正变换
        const ucs = heliocentricEclipticToUCS(eclX, eclY, eclZ);
        result = { x: +ucs.x.toFixed(6), y: +ucs.y.toFixed(6), z: +ucs.z.toFixed(6), system: 'UCS' };
      } else {
        // hci = heliocentric (same as ecliptic for J2000)
        result = { x: eclX, y: eclY, z: eclZ, system: 'hci' };
      }

      return NextResponse.json({ data: result });
    }

    if (action === 'positions') {
      // 获取所有天体在指定日期的位置
      const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];
      const jde = dateToJDE(dateStr);
      const coords: Record<string, Record<string, unknown>> = {};

      for (const body of Object.keys(ORBITAL_DATA)) {
        const hci = getHeliocentricCartesian(body, jde);
        const eclSph = cartesianToSpherical(hci.x, hci.y, hci.z);
        const eq = eclipticToEquatorial(hci.x, hci.y, hci.z);
        const eqSph = cartesianToSpherical(eq.x, eq.y, eq.z);

        coords[body] = {
          hci: { x: +hci.x.toFixed(6), y: +hci.y.toFixed(6), z: +hci.z.toFixed(6) },
          ecliptic: { lon: +eclSph.lon.toFixed(4), lat: +eclSph.lat.toFixed(4), r: +eclSph.r.toFixed(6) },
          equatorial: { ra: +eqSph.lon.toFixed(4), dec: +eqSph.lat.toFixed(4), r: +eqSph.r.toFixed(6) },
        };
      }

      return NextResponse.json({ data: { date: dateStr, jde, coords } });
    }

    if (action === 'geocentric') {
      // 地心视角：从地球看其他天体的位置
      const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];
      const jde = dateToJDE(dateStr);
      const earthPos = getHeliocentricCartesian('地球', jde);
      const result: Record<string, Record<string, unknown>> = {};

      for (const body of Object.keys(ORBITAL_DATA)) {
        if (body === '地球') continue;
        const bodyPos = getHeliocentricCartesian(body, jde);
        // 地心坐标 = 日心坐标 - 地球日心坐标
        const geoX = bodyPos.x - earthPos.x;
        const geoY = bodyPos.y - earthPos.y;
        const geoZ = bodyPos.z - earthPos.z;
        const geoSph = cartesianToSpherical(geoX, geoY, geoZ);
        const geoEq = eclipticToEquatorial(geoX, geoY, geoZ);
        const geoEqSph = cartesianToSpherical(geoEq.x, geoEq.y, geoEq.z);

        result[body] = {
          distance_au: +geoSph.r.toFixed(6),
          ecliptic: { lon: +geoSph.lon.toFixed(4), lat: +geoSph.lat.toFixed(4) },
          equatorial: { ra: +geoEqSph.lon.toFixed(4), dec: +geoEqSph.lat.toFixed(4) },
          elongation: +calculateElongation(earthPos, bodyPos).toFixed(2),
        };
      }

      return NextResponse.json({ data: { date: dateStr, jde, geocentric: result } });
    }

    if (action === 'systems') {
      // 获取所有坐标系定义
      const systems = getAllCoordinateSystems().map(cs => ({
        id: cs.id,
        name: cs.name,
        nameEn: cs.nameEn,
        origin: cs.origin,
        referencePlane: cs.referencePlane,
        referenceDir: cs.referenceDir,
        unit: cs.unit,
        description: cs.description,
      }));
      return NextResponse.json({ data: systems });
    }

    if (action === 'ucs-convert') {
      // 全宇宙坐标系转换：支持9大坐标系互转
      const fromSystem = searchParams.get('from');
      const toSystem = searchParams.get('to');
      const x = parseFloat(searchParams.get('x') || '0');
      const y = parseFloat(searchParams.get('y') || '0');
      const z = parseFloat(searchParams.get('z') || '0');

      if (!fromSystem || !toSystem) {
        return NextResponse.json({ error: 'from and to system required. Available: ucs|geocentric|heliocentric|galactocentric|equatorial|ecliptic|galactic|horizontal|supergalactic' }, { status: 400 });
      }

      const fromCS = getCoordinateSystem(fromSystem);
      const toCS = getCoordinateSystem(toSystem);
      if (!fromCS) return NextResponse.json({ error: `Unknown source system: ${fromSystem}` }, { status: 400 });
      if (!toCS) return NextResponse.json({ error: `Unknown target system: ${toSystem}` }, { status: 400 });

      const sourcePoint: Vec3 = { x, y, z };
      const converted = convertCoordinates(sourcePoint, fromSystem, toSystem);
      const spherical = ucsCartesianToSpherical(converted);

      return NextResponse.json({
        data: {
          input: { system: fromSystem, x, y, z },
          output: {
            system: toSystem,
            x: +converted.x.toFixed(12),
            y: +converted.y.toFixed(12),
            z: +converted.z.toFixed(12),
          },
          spherical: {
            lon: +spherical.lon.toFixed(6),
            lat: +spherical.lat.toFixed(6),
            r: +spherical.r.toFixed(12),
          },
          distanceMpc: +spherical.r.toFixed(12),
          distanceLy: +convertDistance(spherical.r, 'mpc', 'ly').toFixed(2),
        }
      });
    }

    if (action === 'ucs-all') {
      // 将一个坐标转换为所有其他坐标系
      const fromSystem = searchParams.get('from') || 'heliocentric';
      const x = parseFloat(searchParams.get('x') || '0');
      const y = parseFloat(searchParams.get('y') || '0');
      const z = parseFloat(searchParams.get('z') || '0');

      const results = convertToAllSystems(x, y, z, fromSystem);
      return NextResponse.json({ data: { source: { system: fromSystem, x, y, z }, conversions: results } });
    }

    if (action === 'transform-params') {
      // 获取两个坐标系之间的转换参数
      const from = searchParams.get('from') || 'ucs';
      const to = searchParams.get('to') || 'heliocentric';
      const params = getTransformParams(from, to);
      if (!params) return NextResponse.json({ error: 'Invalid system IDs' }, { status: 400 });
      return NextResponse.json({ data: params });
    }

    if (action === 'ucs-params') {
      // 获取UCS与所有其他坐标系的转换参数
      const params = getUCSTransformParams();
      return NextResponse.json({ data: params });
    }

    if (action === 'hci-to-ucs') {
      // 日心黄道坐标 → UCS快捷转换
      const x = parseFloat(searchParams.get('x') || '0');
      const y = parseFloat(searchParams.get('y') || '0');
      const z = parseFloat(searchParams.get('z') || '0');
      const ucs = heliocentricEclipticToUCS(x, y, z);
      const spherical = ucsCartesianToSpherical(ucs);
      return NextResponse.json({
        data: {
          hci: { x, y, z },
          ucs: { x: +ucs.x.toFixed(12), y: +ucs.y.toFixed(12), z: +ucs.z.toFixed(12) },
          spherical: { lon: +spherical.lon.toFixed(6), lat: +spherical.lat.toFixed(6), r: +spherical.r.toFixed(12) },
        }
      });
    }

    if (action === 'ucs-to-hci') {
      // UCS → 日心黄道坐标快捷转换
      const x = parseFloat(searchParams.get('x') || '0');
      const y = parseFloat(searchParams.get('y') || '0');
      const z = parseFloat(searchParams.get('z') || '0');
      const hci = ucsToHeliocentricEcliptic({ x, y, z });
      return NextResponse.json({
        data: {
          ucs: { x, y, z },
          hci: { x: +hci.x.toFixed(6), y: +hci.y.toFixed(6), z: +hci.z.toFixed(6) },
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action. Use: convert|positions|geocentric|systems|ucs-convert|ucs-all|transform-params|ucs-params|hci-to-ucs|ucs-to-hci' }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function dateToJDE(dateStr: string): number {
  const d = new Date(dateStr);
  return d.getTime() / 86400000 + 2440587.5;
}

function calculateElongation(earthPos: { x: number; y: number; z: number }, bodyPos: { x: number; y: number; z: number }): number {
  // 日-地-天体夹角（离日度）
  const eR = Math.sqrt(earthPos.x ** 2 + earthPos.y ** 2 + earthPos.z ** 2);
  const bR = Math.sqrt(bodyPos.x ** 2 + bodyPos.y ** 2 + bodyPos.z ** 2);
  const dot = earthPos.x * bodyPos.x + earthPos.y * bodyPos.y + earthPos.z * bodyPos.z;
  const cosElongation = dot / (eR * bR);
  return Math.acos(Math.max(-1, Math.min(1, cosElongation))) * RAD;
}
