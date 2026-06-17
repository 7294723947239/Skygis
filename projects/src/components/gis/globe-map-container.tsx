'use client';

import dynamic from 'next/dynamic';
import { Component, type ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  [key: string]: any;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('GlobeMap Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full bg-black flex items-center justify-center">
          <div className="text-white text-center p-8">
            <h2 className="text-xl text-red-400 mb-4">3D地图加载失败</h2>
            <p className="text-sm opacity-70">{this.state.error?.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const GlobeMap = dynamic(() => import('./globe-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <div className="text-white animate-pulse">加载宇宙地图...</div>
    </div>
  )
});

export default function GlobeMapContainer(props: { onMapClick?: (lat: number, lng: number) => void; onFeatureSelect?: (featureId: string) => void; features?: any; layers?: any; activeTool?: any; flyToPosition?: any; skygisOverlays?: any[]; skygisSelectedId?: any; onLogout?: any }) {
  return (
    <ErrorBoundary>
      <GlobeMap {...props} />
    </ErrorBoundary>
  );
}
