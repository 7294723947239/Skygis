'use client';

import dynamic from 'next/dynamic';
import type { MapTool } from '@/lib/gis-context';

// Dynamic import to avoid SSR issues with WebGL
const GlobeMap = dynamic(() => import('./globe-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-cyan-500/20" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-cyan-500" style={{ animationDuration: '0.8s' }} />
        </div>
        <span className="text-xs text-slate-500">正在加载3D地球...</span>
      </div>
    </div>
  ),
});

interface GlobeContainerProps {
  onMapClick?: (lat: number, lng: number) => void;
  onFeatureSelect?: (featureId: string) => void;
  features?: Array<{ id: string; title: string; latitude: number; longitude: number; feature_type: string; layer_id: string | null }>;
  layers?: Array<{ id: string; name: string; color: string; is_visible?: boolean }>;
  activeTool?: MapTool;
  flyToPosition?: { lat: number; lng: number; altitude?: number } | null;
}

export default function GlobeContainer(props: GlobeContainerProps) {
  return <GlobeMap {...(props as any)} />;
}
