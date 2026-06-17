'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGis, type GisFeature } from '@/lib/gis-context';

// Fix Leaflet default icon issue
function createLayerIcon(color: string, isSelected = false, scale = 1) {
  const s = isSelected ? 1.3 : scale;
  const fillColor = isSelected ? '#f59e0b' : color;
  const strokeColor = isSelected ? '#d97706' : color + '88';
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="${24 * s}" height="${36 * s}" style="filter: ${isSelected ? 'drop-shadow(0 0 6px ' + color + ')' : 'none'}; transition: all 0.2s ease">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>`,
    className: '',
    iconSize: [24 * s, 36 * s],
    iconAnchor: [12 * s, 36 * s],
    popupAnchor: [0, -36 * s],
  });
}

interface LeafletMapProps {
  onMapClick?: (lat: number, lng: number) => void;
}

export default function LeafletMap({ onMapClick }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const polylinesRef = useRef<Map<string, L.Polyline | L.Polygon>>(new Map());
  const drawLayerRef = useRef<L.LayerGroup | null>(null);
  const measureLayerRef = useRef<L.LayerGroup | null>(null);
  const drawPointsRef = useRef<L.LatLng[]>([]);
  const measurePointsRef = useRef<L.LatLng[]>([]);
  const tempLineRef = useRef<L.Polyline | null>(null);
  const tempMeasureLineRef = useRef<L.Polyline | null>(null);
  const measureLabelsRef = useRef<L.Marker[]>([]);
  const areaLayerRef = useRef<L.LayerGroup | null>(null);
  const areaPointsRef = useRef<L.LatLng[]>([]);
  const areaLabelsRef = useRef<L.Marker[]>([]);
  const tempAreaLineRef = useRef<L.Polyline | null>(null);
  const skygisMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const [mapReady, setMapReady] = useState(false);

  const {
    features, layers, selectedFeature, setSelectedFeature,
    activeTool, mapCenter, mapZoom, setMapCenter, setMapZoom,
    skygisOverlays, skygisSelectedId, setSkygisSelectedId,
    flyToPosition, setFlyToPosition,
  } = useGis();

  // Get visible layer IDs helper
  const getVisibleLayerIds = useCallback(() => {
    return new Set(layers.filter((l) => l.is_visible).map((l) => l.id));
  }, [layers]);

  const getLayerColor = useCallback((layerId: string | null) => {
    if (!layerId) return '#06b6d4';
    return layers.find((l) => l.id === layerId)?.color || '#06b6d4';
  }, [layers]);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: mapCenter,
      zoom: mapZoom,
      zoomControl: false,
      attributionControl: true,
    });

    // Dark-themed tile layer with Amap fallback for China
    const darkTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 20,
      subdomains: 'abcd',
    });
    const amapTile = L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['1', '2', '3', '4'],
    });
    // Try Carto dark first, fallback to Amap dark if tiles fail to load
    darkTile.addTo(map);
    darkTile.on('tileerror', () => {
      if (!map.hasLayer(amapTile)) {
        map.removeLayer(darkTile);
        amapTile.addTo(map);
      }
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Scale control
    L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);

    map.on('moveend', () => {
      const center = map.getCenter();
      setMapCenter([center.lat, center.lng]);
      setMapZoom(map.getZoom());
    });

    // Create draw & measure layer groups
    const drawLayer = L.layerGroup().addTo(map);
    drawLayerRef.current = drawLayer;
    const measureLayer = L.layerGroup().addTo(map);
    measureLayerRef.current = measureLayer;
    const areaLayer = L.layerGroup().addTo(map);
    areaLayerRef.current = areaLayer;

    mapRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle map interaction based on active tool
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      const latlng = e.latlng;

      switch (activeTool) {
        case 'add-point':
          onMapClick?.(latlng.lat, latlng.lng);
          break;

        case 'draw-line': {
          drawPointsRef.current.push(latlng);
          // Add vertex marker
          const vertexIcon = L.divIcon({
            html: `<div style="width:10px;height:10px;background:#06b6d4;border:2px solid #0e7490;border-radius:50%;box-shadow:0 0 6px #06b6d480;"></div>`,
            className: '',
            iconSize: [10, 10],
            iconAnchor: [5, 5],
          });
          L.marker(latlng, { icon: vertexIcon }).addTo(drawLayerRef.current!);

          // Update line
          if (drawPointsRef.current.length > 1) {
            if (tempLineRef.current) tempLineRef.current.remove();
            tempLineRef.current = L.polyline(drawPointsRef.current, {
              color: '#06b6d4', weight: 3, opacity: 0.8, dashArray: '8, 4',
            }).addTo(drawLayerRef.current!);
          }
          break;
        }

        case 'draw-polygon': {
          drawPointsRef.current.push(latlng);
          const vertexIcon = L.divIcon({
            html: `<div style="width:10px;height:10px;background:#10b981;border:2px solid #059669;border-radius:50%;box-shadow:0 0 6px #10b98180;"></div>`,
            className: '',
            iconSize: [10, 10],
            iconAnchor: [5, 5],
          });
          L.marker(latlng, { icon: vertexIcon }).addTo(drawLayerRef.current!);

          if (drawPointsRef.current.length > 1) {
            if (tempLineRef.current) tempLineRef.current.remove();
            tempLineRef.current = L.polyline(drawPointsRef.current, {
              color: '#10b981', weight: 3, opacity: 0.8, dashArray: '8, 4',
            }).addTo(drawLayerRef.current!);
          }
          break;
        }

        case 'measure': {
          measurePointsRef.current.push(latlng);
          const dotIcon = L.divIcon({
            html: `<div style="width:8px;height:8px;background:#f59e0b;border:2px solid #d97706;border-radius:50%;"></div>`,
            className: '',
            iconSize: [8, 8],
            iconAnchor: [4, 4],
          });
          L.marker(latlng, { icon: dotIcon }).addTo(measureLayerRef.current!);

          if (measurePointsRef.current.length > 1) {
            if (tempMeasureLineRef.current) tempMeasureLineRef.current.remove();
            tempMeasureLineRef.current = L.polyline(measurePointsRef.current, {
              color: '#f59e0b', weight: 2, opacity: 0.9, dashArray: '6, 6',
            }).addTo(measureLayerRef.current!);

            // Show distance label
            const prev = measurePointsRef.current[measurePointsRef.current.length - 2];
            const dist = prev.distanceTo(latlng);
            const distText = dist > 1000 ? `${(dist / 1000).toFixed(2)} km` : `${dist.toFixed(1)} m`;
            const midLat = (prev.lat + latlng.lat) / 2;
            const midLng = (prev.lng + latlng.lng) / 2;
            const labelIcon = L.divIcon({
              html: `<div style="background:#1e293b;color:#f59e0b;padding:2px 6px;border-radius:4px;font-size:11px;font-family:JetBrains Mono,monospace;border:1px solid #f59e0b40;white-space:nowrap;">${distText}</div>`,
              className: '',
              iconAnchor: [30, -8],
            });
            const labelMarker = L.marker([midLat, midLng], { icon: labelIcon }).addTo(measureLayerRef.current!);
            measureLabelsRef.current.push(labelMarker);

            // Total distance
            let totalDist = 0;
            for (let i = 1; i < measurePointsRef.current.length; i++) {
              totalDist += measurePointsRef.current[i - 1].distanceTo(measurePointsRef.current[i]);
            }
            const totalText = totalDist > 1000 ? `${(totalDist / 1000).toFixed(2)} km` : `${totalDist.toFixed(1)} m`;
            const lastPt = measurePointsRef.current[measurePointsRef.current.length - 1];
            const totalIcon = L.divIcon({
              html: `<div style="background:#f59e0b;color:#0f172a;padding:3px 8px;border-radius:4px;font-size:12px;font-weight:600;font-family:JetBrains Mono,monospace;white-space:nowrap;">Total: ${totalText}</div>`,
              className: '',
              iconAnchor: [40, -12],
            });
            const totalLabel = L.marker(lastPt, { icon: totalIcon }).addTo(measureLayerRef.current!);
            measureLabelsRef.current.push(totalLabel);
          }
          break;
        }

        case 'measure-area': {
          if (!areaLayerRef.current) {
            areaLayerRef.current = L.layerGroup().addTo(map);
          }
          areaPointsRef.current.push(latlng);
          const adotIcon = L.divIcon({
            html: `<div style="width:10px;height:10px;background:#ec4899;border:2px solid #db2777;border-radius:50%;box-shadow:0 0 6px #ec489980;"></div>`,
            className: '',
            iconSize: [10, 10],
            iconAnchor: [5, 5],
          });
          L.marker(latlng, { icon: adotIcon }).addTo(areaLayerRef.current!);

          // Draw lines between points
          if (areaPointsRef.current.length > 1) {
            if (tempAreaLineRef.current) tempAreaLineRef.current.remove();
            tempAreaLineRef.current = L.polyline(areaPointsRef.current, {
              color: '#ec4899', weight: 2, opacity: 0.9, dashArray: '8, 4',
            }).addTo(areaLayerRef.current!);

            // Edge distance label
            const aprev = areaPointsRef.current[areaPointsRef.current.length - 2];
            const adist = aprev.distanceTo(latlng);
            const adistText = adist > 1000 ? `${(adist / 1000).toFixed(2)} km` : `${adist.toFixed(1)} m`;
            const amidLat = (aprev.lat + latlng.lat) / 2;
            const amidLng = (aprev.lng + latlng.lng) / 2;
            const alabelIcon = L.divIcon({
              html: `<div style="background:#1e293b;color:#ec4899;padding:2px 6px;border-radius:4px;font-size:11px;font-family:JetBrains Mono,monospace;border:1px solid #ec489940;white-space:nowrap;">${adistText}</div>`,
              className: '',
              iconAnchor: [30, -8],
            });
            const alabelMarker = L.marker([amidLat, amidLng], { icon: alabelIcon }).addTo(areaLayerRef.current!);
            areaLabelsRef.current.push(alabelMarker);
          }
          break;
        }

        default:
          break;
      }
    };

    const handleDblClick = (e: L.LeafletMouseEvent) => {
      if (activeTool === 'draw-polygon' && drawPointsRef.current.length >= 3) {
        // Close the polygon
        if (tempLineRef.current) tempLineRef.current.remove();
        const polygon = L.polygon(drawPointsRef.current, {
          color: '#10b981', weight: 2, fillColor: '#10b981', fillOpacity: 0.15,
        }).addTo(drawLayerRef.current!);

        // Calculate area using Shoelace formula
        const pts = drawPointsRef.current;
        let area = 0;
        for (let i = 0; i < pts.length; i++) {
          const j = (i + 1) % pts.length;
          area += pts[i].lat * pts[j].lng;
          area -= pts[j].lat * pts[i].lng;
        }
        area = Math.abs(area) / 2;
        const areaSqM = area * 111320 * 111320; // rough conversion from degrees to m²
        const areaText = areaSqM > 1000000 ? `${(areaSqM / 1000000).toFixed(2)} km²` : `${areaSqM.toFixed(0)} m²`;
        polygon.bindTooltip(`Area: ${areaText}`, { sticky: true, className: 'gis-tooltip' });

        // Store in polylinesRef with a temp id
        const tempId = `polygon-${Date.now()}`;
        polylinesRef.current.set(tempId, polygon);

        // Reset draw state
        drawPointsRef.current = [];
        tempLineRef.current = null;
        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();
      }

      if (activeTool === 'measure-area' && areaPointsRef.current.length >= 3) {
        // Close the area polygon
        if (tempAreaLineRef.current) tempAreaLineRef.current.remove();

        const areaPoly = L.polygon(areaPointsRef.current, {
          color: '#ec4899', weight: 2, fillColor: '#ec4899', fillOpacity: 0.12,
        }).addTo(areaLayerRef.current!);

        // Calculate area using Shoelace formula (more accurate with lat/lng)
        const apts = areaPointsRef.current;
        let a = 0;
        for (let i = 0; i < apts.length; i++) {
          const j = (i + 1) % apts.length;
          a += apts[i].lat * apts[j].lng;
          a -= apts[j].lat * apts[i].lng;
        }
        a = Math.abs(a) / 2;
        // Convert from degree^2 to m^2 using latitude-adjusted conversion
        const avgLat = apts.reduce((s, p) => s + p.lat, 0) / apts.length;
        const mPerDegLat = 111320;
        const mPerDegLng = 111320 * Math.cos(avgLat * Math.PI / 180);
        const areaSqM2 = a * mPerDegLat * mPerDegLng;
        const perimeter = (() => {
          let p = 0;
          for (let i = 0; i < apts.length; i++) {
            p += apts[i].distanceTo(apts[(i + 1) % apts.length]);
          }
          return p;
        })();

        const areaText = areaSqM2 > 1000000 ? `${(areaSqM2 / 1000000).toFixed(4)} km²` : `${areaSqM2.toFixed(1)} m²`;
        const periText = perimeter > 1000 ? `${(perimeter / 1000).toFixed(2)} km` : `${perimeter.toFixed(1)} m`;

        // Show area label at centroid
        const centroidLat = apts.reduce((s, p) => s + p.lat, 0) / apts.length;
        const centroidLng = apts.reduce((s, p) => s + p.lng, 0) / apts.length;
        const areaLabelIcon = L.divIcon({
          html: `<div style="background:#0f172a;color:#ec4899;padding:6px 10px;border-radius:6px;font-size:12px;font-weight:600;font-family:JetBrains Mono,monospace;border:1px solid #ec489960;white-space:nowrap;text-align:center;">
            <div style="font-size:14px;margin-bottom:2px;">${areaText}</div>
            <div style="font-size:10px;color:#94a3b8;font-weight:400;">Perimeter: ${periText}</div>
          </div>`,
          className: '',
          iconAnchor: [50, 20],
        });
        const areaLabelMarker = L.marker([centroidLat, centroidLng], { icon: areaLabelIcon }).addTo(areaLayerRef.current!);
        areaLabelsRef.current.push(areaLabelMarker);

        // Reset area state
        areaPointsRef.current = [];
        tempAreaLineRef.current = null;
        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();
      }
    };

    const handleMouseMove = (e: L.LeafletMouseEvent) => {
      if (activeTool === 'draw-line' || activeTool === 'draw-polygon') {
        if (drawPointsRef.current.length > 0 && tempLineRef.current) {
          tempLineRef.current.setLatLngs([...drawPointsRef.current, e.latlng]);
        }
      }
      if (activeTool === 'measure' && measurePointsRef.current.length > 0) {
        if (tempMeasureLineRef.current) {
          tempMeasureLineRef.current.setLatLngs([...measurePointsRef.current, e.latlng]);
        } else {
          tempMeasureLineRef.current = L.polyline(
            [...measurePointsRef.current, e.latlng],
            { color: '#f59e0b', weight: 2, opacity: 0.5, dashArray: '6, 6' }
          ).addTo(measureLayerRef.current!);
        }
      }
      if (activeTool === 'measure-area' && areaPointsRef.current.length > 0) {
        if (tempAreaLineRef.current) {
          tempAreaLineRef.current.setLatLngs([...areaPointsRef.current, e.latlng]);
        } else if (areaLayerRef.current) {
          tempAreaLineRef.current = L.polyline(
            [...areaPointsRef.current, e.latlng],
            { color: '#ec4899', weight: 2, opacity: 0.5, dashArray: '8, 4' }
          ).addTo(areaLayerRef.current);
        }
      }
    };

    // Remove old listeners
    map.off('click');
    map.off('dblclick');
    map.off('mousemove');

    map.on('click', handleClick);
    map.on('dblclick', handleDblClick);
    map.on('mousemove', handleMouseMove);

    // Change cursor
    const container = map.getContainer();
    switch (activeTool) {
      case 'add-point': container.style.cursor = 'crosshair'; break;
      case 'draw-line': container.style.cursor = 'crosshair'; break;
      case 'draw-polygon': container.style.cursor = 'crosshair'; break;
      case 'measure': container.style.cursor = 'help'; break;
      case 'measure-area': container.style.cursor = 'help'; break;
      default: container.style.cursor = '';
    }

    // Reset draw/measure state when tool changes
    drawPointsRef.current = [];
    measurePointsRef.current = [];
    areaPointsRef.current = [];
    if (tempLineRef.current) { tempLineRef.current.remove(); tempLineRef.current = null; }
    if (tempMeasureLineRef.current) { tempMeasureLineRef.current.remove(); tempMeasureLineRef.current = null; }
    if (tempAreaLineRef.current) { tempAreaLineRef.current.remove(); tempAreaLineRef.current = null; }
    measureLabelsRef.current.forEach((m) => m.remove());
    areaLabelsRef.current.forEach((m) => m.remove());
    measureLabelsRef.current = [];
    areaLabelsRef.current = [];

    if (activeTool !== 'measure' && measureLayerRef.current) {
      measureLayerRef.current.clearLayers();
    }
    if (activeTool !== 'measure-area' && areaLayerRef.current) {
      areaLayerRef.current.clearLayers();
    }
    if (activeTool !== 'draw-line' && activeTool !== 'draw-polygon' && drawLayerRef.current) {
      drawLayerRef.current.clearLayers();
    }

    // Disable double-click zoom when drawing polygon or measuring area
    if (activeTool === 'draw-polygon' || activeTool === 'measure-area') {
      map.doubleClickZoom.disable();
    } else {
      map.doubleClickZoom.enable();
    }

    return () => {
      map.off('click', handleClick);
      map.off('dblclick', handleDblClick);
      map.off('mousemove', handleMouseMove);
    };
  }, [activeTool, onMapClick]);

  // Clear draw/measure layers helper - exposed via ref
  const clearDrawLayers = useCallback(() => {
    if (drawLayerRef.current) drawLayerRef.current.clearLayers();
    if (measureLayerRef.current) measureLayerRef.current.clearLayers();
    drawPointsRef.current = [];
    measurePointsRef.current = [];
    if (tempLineRef.current) { tempLineRef.current.remove(); tempLineRef.current = null; }
    if (tempMeasureLineRef.current) { tempMeasureLineRef.current.remove(); tempMeasureLineRef.current = null; }
    measureLabelsRef.current.forEach((m) => m.remove());
    measureLabelsRef.current = [];
  }, []);

  // Update markers when features change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const visibleLayerIds = getVisibleLayerIds();
    const currentIds = new Set<string>();

    features.forEach((feature) => {
      if (feature.layer_id && !visibleLayerIds.has(feature.layer_id)) {
        const existing = markersRef.current.get(feature.id);
        if (existing) {
          existing.remove();
          markersRef.current.delete(feature.id);
        }
        return;
      }

      currentIds.add(feature.id);
      const lat = Number(feature.latitude);
      const lng = Number(feature.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      const color = getLayerColor(feature.layer_id);
      const existingMarker = markersRef.current.get(feature.id);

      if (existingMarker) {
        existingMarker.setLatLng([lat, lng]);
      } else {
        const icon = createLayerIcon(color);
        const marker = L.marker([lat, lng], { icon })
          .addTo(map)
          .on('click', () => {
            setSelectedFeature(feature);
          });

        // Popup with feature details
        const popupContent = `
          <div style="font-family:Inter,sans-serif;min-width:180px;">
            <div style="font-weight:600;font-size:14px;color:#f1f5f9;margin-bottom:4px;">${feature.title}</div>
            ${feature.description ? `<div style="font-size:12px;color:#94a3b8;margin-bottom:6px;">${feature.description}</div>` : ''}
            <div style="font-size:11px;color:#64748b;font-family:JetBrains Mono,monospace;">
              ${lat.toFixed(6)}, ${lng.toFixed(6)}
            </div>
            <div style="margin-top:6px;font-size:11px;color:#64748b;">
              Type: ${feature.feature_type || 'point'}
            </div>
          </div>
        `;
        marker.bindPopup(popupContent, {
          className: 'gis-popup',
          closeButton: true,
        });

        marker.bindTooltip(feature.title, {
          direction: 'top',
          offset: [0, -36],
          className: 'gis-tooltip',
        });

        markersRef.current.set(feature.id, marker);
      }
    });

    // Remove markers not in current features
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });
  }, [features, layers, setSelectedFeature, getVisibleLayerIds, getLayerColor]);

  // Highlight selected feature
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker, id) => {
      const feature = features.find((f) => f.id === id);
      if (!feature) return;
      const color = getLayerColor(feature.layer_id);
      const isSelected = selectedFeature?.id === id;
      marker.setIcon(createLayerIcon(color, isSelected));
    });

    // Pan to selected feature
    if (selectedFeature) {
      const lat = Number(selectedFeature.latitude);
      const lng = Number(selectedFeature.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        map.panTo([lat, lng], { animate: true, duration: 0.5 });
        // Open popup
        const marker = markersRef.current.get(selectedFeature.id);
        if (marker) {
          setTimeout(() => marker.openPopup(), 500);
        }
      }
    }
  }, [selectedFeature, features, layers, getLayerColor]);

  // Render SkyGIS overlay markers on 2D map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentIds = new Set<string>();

    skygisOverlays.forEach(point => {
      currentIds.add(point.id);
      const existing = skygisMarkersRef.current.get(point.id);
      if (existing) {
        existing.remove();
      }

      // Create specialized icon for SkyGIS points
      const icon = L.divIcon({
        html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;">
          <div style="width:16px;height:16px;border-radius:50%;background:${point.color};border:2px solid ${point.color}80;box-shadow:0 0 8px ${point.color}60;"></div>
          <div style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);white-space:nowrap;background:#0f172a;color:${point.color};padding:1px 5px;border-radius:3px;font-size:9px;font-weight:500;border:1px solid ${point.color}30;font-family:Inter,sans-serif;">${point.title.length > 8 ? point.title.substring(0, 8) + '...' : point.title}</div>
        </div>`,
        className: '',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = L.marker([point.lat, point.lng], { icon })
        .addTo(map)
        .on('click', () => {
          setSkygisSelectedId(point.id);
        });

      // Popup with SkyGIS point details
      const popupContent = `
        <div style="font-family:Inter,sans-serif;min-width:200px;background:#0f172a;color:#f1f5f9;border:1px solid #334155;border-radius:8px;padding:8px;">
          <div style="font-weight:600;font-size:13px;color:${point.color};margin-bottom:4px;">${point.title}</div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:6px;">${point.description}</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap;">
            <span style="background:${point.color}20;color:${point.color};padding:1px 6px;border-radius:3px;font-size:10px;">${point.category}</span>
            <span style="background:#33415550;color:#94a3b8;padding:1px 6px;border-radius:3px;font-size:10px;">${point.level}</span>
          </div>
          <div style="font-size:10px;color:#64748b;margin-top:4px;font-family:JetBrains Mono,monospace;">
            ${point.lat.toFixed(4)}°N ${point.lng.toFixed(4)}°E
          </div>
        </div>
      `;
      marker.bindPopup(popupContent, { className: 'gis-popup', closeButton: true });
      marker.bindTooltip(point.title, { direction: 'top', offset: [0, -24], className: 'gis-tooltip' });

      skygisMarkersRef.current.set(point.id, marker);
    });

    // Remove markers not in current overlays
    skygisMarkersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        skygisMarkersRef.current.delete(id);
      }
    });
  }, [skygisOverlays, skygisSelectedId, setSkygisSelectedId, mapReady]);

  // Fly to position when flyToPosition changes
  useEffect(() => {
    if (!flyToPosition) return;
    // Wait for map to be ready (important after view mode switch)
    const tryFly = (attempt = 0) => {
      const map = mapRef.current;
      if (map) {
        map.flyTo([flyToPosition.lat, flyToPosition.lng], 12, { duration: 1.5 });
        setFlyToPosition(null);
      } else if (attempt < 20) {
        setTimeout(() => tryFly(attempt + 1), 100);
      }
    };
    tryFly();
  }, [flyToPosition, setFlyToPosition]);

  // Highlight selected SkyGIS point
  useEffect(() => {
    skygisMarkersRef.current.forEach((marker, id) => {
      const point = skygisOverlays.find(p => p.id === id);
      if (!point) return;
      const isSelected = skygisSelectedId === id;
      if (isSelected) {
        marker.openPopup();
        const map = mapRef.current;
        if (map) map.panTo([point.lat, point.lng], { animate: true, duration: 0.5 });
      }
    });
  }, [skygisSelectedId, skygisOverlays]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      style={{ zIndex: 0 }}
    />
  );
}
