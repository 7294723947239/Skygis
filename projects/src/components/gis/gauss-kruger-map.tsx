'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { GisFeature, GisLayer, MapTool } from '@/lib/gis-context';
import { toast } from 'sonner';

interface GaussKrugerMapProps {
  onMapClick?: (lat: number, lng: number) => void;
  onFeatureSelect?: (featureId: string) => void;
  features?: GisFeature[];
  layers?: GisLayer[];
  activeTool?: MapTool;
  flyToPosition?: { lat: number; lng: number; altitude?: number } | null;
}

export default function GaussKrugerMap({
  onMapClick,
  onFeatureSelect,
  features = [],
  layers = [],
  activeTool = 'select',
  flyToPosition,
}: GaussKrugerMapProps) {
  const mapRef = useRef<any>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(4);
  const [currentScale, setCurrentScale] = useState('1:15,000,000');
  const [centerCoord, setCenterCoord] = useState({ lat: 30, lng: 104 });
  const [radiusSearch, setRadiusSearch] = useState<{
    lat: number; lng: number; radius: number; results: (GisFeature & { distance: number })[];
  } | null>(null);
  const [radiusInput, setRadiusInput] = useState('10');

  useEffect(() => {
    if (!targetRef.current || mapRef.current) return;

    let olMap: any;

    const initMap = async () => {
      const Map = (await import('ol/Map')).default;
      const View = (await import('ol/View')).default;
      const TileLayer = (await import('ol/layer/Tile')).default;
      const XYZ = (await import('ol/source/XYZ')).default;
      const VectorLayer = (await import('ol/layer/Vector')).default;
      const VectorSource = (await import('ol/source/Vector')).default;
      const { fromLonLat, toLonLat } = await import('ol/proj');
      const ScaleLine = (await import('ol/control/ScaleLine')).default;
      const { defaults: defaultsControl } = await import('ol/control');
      const proj4 = (await import('proj4')).default;
      const { register } = await import('ol/proj/proj4');

      // Register Gauss-Kruger projection (CGCS2000 3-degree zone 35, central meridian 105E)
      proj4.defs('EPSG:4527', '+proj=tmerc +lat_0=0 +lon_0=105 +k=1 +x_0=35500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
      register(proj4);

      const { get: getProj } = await import('ol/proj');
      const gkProjection = getProj('EPSG:4527');

      const tileLayer = new TileLayer({
        source: new XYZ({
          url: 'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
          attributions: '&copy; 高德地图',
          crossOrigin: 'anonymous',
        }),
      });
      const vectorSource = new VectorSource();
      const vectorLayer = new VectorLayer({ source: vectorSource });
      const radiusSource = new VectorSource();
      const radiusLayer = new VectorLayer({ source: radiusSource });

      olMap = new Map({
        target: targetRef.current!,
        layers: [tileLayer, radiusLayer, vectorLayer],
        view: new View({
          projection: gkProjection || 'EPSG:3857',
          center: fromLonLat([104, 30], gkProjection || 'EPSG:3857'),
          zoom: 4,
          minZoom: 2,
          maxZoom: 18,
        }),
        controls: defaultsControl({ attribution: false }).extend([
          new ScaleLine({ target: document.createElement('div') }),
        ]),
      });

      olMap.on('click', (e: any) => {
        const lonLat = toLonLat(e.coordinate, olMap.getView().getProjection());
        const lat = lonLat[1];
        const lng = lonLat[0];
        if (onMapClick) onMapClick(lat, lng);
        if (activeTool === 'select') {
          setRadiusSearch({ lat, lng, radius: parseFloat(radiusInput) || 10, results: [] });
        }
        olMap.forEachFeatureAtPixel(e.pixel, (feature: any) => {
          const fid = feature.get('featureId');
          if (fid && onFeatureSelect) onFeatureSelect(fid);
        });
      });

      olMap.on('moveend', () => {
        const view = olMap.getView();
        const center = toLonLat(view.getCenter(), view.getProjection());
        setCenterCoord({ lat: center[1], lng: center[0] });
        setCurrentZoom(view.getZoom());
      });

      mapRef.current = olMap;
      setMapReady(true);
    };

    initMap();

    return () => {
      if (olMap) olMap.setTarget(undefined);
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update features on map
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    const updateFeatures = async () => {
      const Feature = (await import('ol/Feature')).default;
      const { Point } = await import('ol/geom');
      const { fromLonLat } = await import('ol/proj');
      const Style = (await import('ol/style/Style')).default;
      const CircleStyle = (await import('ol/style/Circle')).default;
      const Fill = (await import('ol/style/Fill')).default;
      const Stroke = (await import('ol/style/Stroke')).default;
      const Text = (await import('ol/style/Text')).default;

      const map = mapRef.current;
      if (!map) return;
      const view = map.getView();
      if (!view) return;
      const projection = view.getProjection();
      const mapLayers = map.getLayers().getArray();
      const vectorLayer = mapLayers[2];
      if (!vectorLayer) return;
      const source = vectorLayer.getSource();
      source.clear();

      features.forEach(f => {
        if (f.latitude == null || f.longitude == null) return;
        const layer = layers.find(l => l.id === f.layer_id);
        const color = layer?.color || '#06b6d4';

        const feature = new Feature({
          geometry: new Point(fromLonLat([f.longitude, f.latitude], projection)),
        });
        feature.set('featureId', f.id);

        feature.setStyle(new Style({
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({ color }),
            stroke: new Stroke({ color: '#ffffff', width: 2 }),
          }),
          text: new Text({
            text: f.title,
            offsetY: -18,
            font: '12px sans-serif',
            fill: new Fill({ color: '#f1f5f9' }),
            stroke: new Stroke({ color: '#0f172a', width: 3 }),
          }),
        }));

        source.addFeature(feature);
      });
    };

    updateFeatures();
  }, [features, layers, mapReady]);

  // Fly to position
  useEffect(() => {
    if (!mapRef.current || !flyToPosition) return;

    const flyTo = async () => {
      const { fromLonLat } = await import('ol/proj');
      const map = mapRef.current;
      if (!map) return;
      const view = map.getView();
      if (!view) return;
      const projection = view.getProjection();
      const target = fromLonLat([flyToPosition.lng, flyToPosition.lat], projection);
      map.getView().animate({ center: target, zoom: 8, duration: 2000 });
    };

    flyTo();
  }, [flyToPosition]);

  // Draw radius circle
  useEffect(() => {
    if (!mapRef.current || !mapReady || !radiusSearch) return;

    const drawCircle = async () => {
      const Feature = (await import('ol/Feature')).default;
      const { fromLonLat } = await import('ol/proj');
      const Circle = (await import('ol/geom/Circle')).default;

      const map = mapRef.current;
      if (!map) return;
      const view = map.getView();
      if (!view) return;
      const projection = view.getProjection();
      const mapLayers = map.getLayers().getArray();
      const radiusLayer = mapLayers[1];
      if (!radiusLayer) return;
      const source = radiusLayer.getSource();
      source.clear();

      const center = fromLonLat([radiusSearch.lng, radiusSearch.lat], projection);
      const radiusMeters = radiusSearch.radius * 1000;
      const circle = new Feature({ geometry: new Circle(center, radiusMeters) });
      source.addFeature(circle);
    };

    drawCircle();
  }, [radiusSearch, mapReady]);

  const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const wgs84ToGaussKruger = (lat: number, lng: number) => {
    const zone = Math.round(lng / 3);
    const centralMeridian = zone * 3;
    const a = 6378137.0;
    const f = 1 / 298.257223563;
    const e2 = 2 * f - f * f;
    const ePrime2 = e2 / (1 - e2);
    const latRad = lat * Math.PI / 180;
    const dLng = (lng - centralMeridian) * Math.PI / 180;
    const N = a / Math.sqrt(1 - e2 * Math.sin(latRad) ** 2);
    const T = Math.tan(latRad) ** 2;
    const C = ePrime2 * Math.cos(latRad) ** 2;
    const A = dLng * Math.cos(latRad);
    const M = a * (
      (1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256) * latRad
      - (3 * e2 / 8 + 3 * e2 ** 2 / 32 + 45 * e2 ** 3 / 1024) * Math.sin(2 * latRad)
      + (15 * e2 ** 2 / 256 + 45 * e2 ** 3 / 1024) * Math.sin(4 * latRad)
      - (35 * e2 ** 3 / 3072) * Math.sin(6 * latRad)
    );
    const x = N * (A + (1 - T + C) * A ** 3 / 6 + (5 - 18 * T + T ** 2 + 72 * C - 58 * ePrime2) * A ** 5 / 120);
    const y = M + N * Math.tan(latRad) * (A ** 2 / 2 + (5 - T + 9 * C + 4 * C ** 2) * A ** 4 / 24 + (61 - 58 * T + T ** 2 + 600 * C - 330 * ePrime2) * A ** 6 / 720);
    const falseEasting = zone * 1000000 + 500000 + x;
    return { x: Math.round(falseEasting), y: Math.round(y), zone };
  };

  const handleRadiusSearch = useCallback(() => {
    if (!radiusSearch) return;
    const radius = parseFloat(radiusInput) || 10;
    const results = features.filter(f => {
      if (f.latitude == null || f.longitude == null) return false;
      return haversineDistance(radiusSearch.lat, radiusSearch.lng, f.latitude, f.longitude) <= radius;
    }).map(f => ({
      ...f,
      distance: Math.round(haversineDistance(radiusSearch.lat, radiusSearch.lng, f.latitude, f.longitude) * 10) / 10,
    })).sort((a, b) => a.distance - b.distance);

    setRadiusSearch(prev => prev ? { ...prev, radius, results } : null);
    if (results.length === 0) {
      toast.info(`${radius}公里范围内未找到要素`);
    } else {
      toast.success(`找到 ${results.length} 个要素`);
    }
  }, [radiusSearch, radiusInput, features]);

  const gkCoord = wgs84ToGaussKruger(centerCoord.lat, centerCoord.lng);

  const scales: Record<number, string> = {
    2: '1:70,000,000', 3: '1:35,000,000', 4: '1:15,000,000',
    5: '1:10,000,000', 6: '1:4,000,000', 7: '1:2,000,000',
    8: '1:1,000,000', 9: '1:500,000', 10: '1:250,000',
    11: '1:150,000', 12: '1:70,000', 13: '1:35,000',
    14: '1:15,000', 15: '1:8,000', 16: '1:4,000',
    17: '1:2,000', 18: '1:1,000',
  };

  return (
    <div className="relative w-full h-full">
      <div ref={targetRef} className="absolute inset-0 w-full h-full" />

      {/* Coordinate & Scale Overlay */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        <div className="rounded-md bg-slate-900/90 px-3 py-1.5 text-xs text-slate-300 backdrop-blur-sm border border-slate-700/50">
          <div>WGS84: {centerCoord.lat.toFixed(4)}, {centerCoord.lng.toFixed(4)}</div>
          <div className="text-cyan-400">
            高斯克吕格 ({gkCoord.zone}度带): X={gkCoord.x}, Y={gkCoord.y}
          </div>
        </div>
        <div className="rounded-md bg-slate-900/90 px-3 py-1 text-xs text-amber-400 backdrop-blur-sm border border-slate-700/50">
          比例尺: {scales[Math.round(currentZoom)] || currentScale} | 缩放: {currentZoom.toFixed(1)}
        </div>
        <div className="rounded-md bg-cyan-900/80 px-3 py-1 text-xs text-cyan-300 backdrop-blur-sm border border-cyan-700/50">
          高斯克吕格投影 (CGCS2000 3度带)
        </div>
      </div>

      {/* Radius Search Panel */}
      {radiusSearch && (
        <div className="absolute top-2 right-2 z-20 w-72 rounded-xl bg-slate-900/95 border border-slate-700/50 p-4 backdrop-blur-sm shadow-xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-cyan-400">范围搜索</span>
            <button onClick={() => setRadiusSearch(null)} className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-700 hover:text-white text-xs">✕</button>
          </div>
          <div className="text-xs text-slate-400 mb-2">中心: {radiusSearch.lat.toFixed(4)}, {radiusSearch.lng.toFixed(4)}</div>
          <div className="flex items-center gap-2 mb-3">
            <input type="number" value={radiusInput} onChange={(e) => setRadiusInput(e.target.value)} className="w-20 rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-white" placeholder="公里" />
            <span className="text-xs text-slate-400">公里</span>
            <button onClick={handleRadiusSearch} className="rounded-md bg-cyan-600 px-3 py-1 text-xs font-medium text-white hover:bg-cyan-500">搜索</button>
          </div>
          {radiusSearch.results.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs text-slate-400">找到 {radiusSearch.results.length} 个要素 (半径 {radiusSearch.radius}km)</div>
              {radiusSearch.results.map(f => (
                <div key={f.id} className="rounded-md bg-slate-800/80 p-2 border border-slate-700/40">
                  <div className="text-xs font-medium text-white">{f.title}</div>
                  <div className="text-xs text-slate-400">距离: {f.distance} km</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-30">
          <div className="text-center">
            <div className="mb-3 h-8 w-8 mx-auto animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            <div className="text-sm text-slate-300">加载高斯克吕格投影地图...</div>
          </div>
        </div>
      )}
    </div>
  );
}
