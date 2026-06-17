'use client';

import dynamic from 'next/dynamic';
import type { MapTool } from '@/lib/gis-context';

const GaussKrugerMap = dynamic(() => import('./gauss-kruger-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="mb-3 h-8 w-8 mx-auto animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        <div className="text-sm text-slate-300">加载高斯克吕格投影地图...</div>
      </div>
    </div>
  ),
});

interface GaussKrugerProps {
  onMapClick?: (lat: number, lng: number) => void;
  onFeatureSelect?: (featureId: string) => void;
  features?: Array<{ id: string; title: string; latitude: number; longitude: number; feature_type: string; layer_id: string | null }>;
  layers?: Array<{ id: string; name: string; color: string; is_visible?: boolean }>;
  activeTool?: MapTool;
  flyToPosition?: { lat: number; lng: number; altitude?: number } | null;
}

export default function GaussKrugerContainer(props: GaussKrugerProps) {
  return <GaussKrugerMap {...(props as any)} />;
}
