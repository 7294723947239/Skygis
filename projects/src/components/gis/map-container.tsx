'use client';

import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('./leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        <span className="text-sm text-slate-400">正在加载地图...</span>
      </div>
    </div>
  ),
});

interface MapContainerProps {
  onMapClick?: (lat: number, lng: number) => void;
}

export default function MapContainer({ onMapClick }: MapContainerProps) {
  return <LeafletMap onMapClick={onMapClick} />;
}
