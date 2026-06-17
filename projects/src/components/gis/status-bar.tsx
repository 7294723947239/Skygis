'use client';

import { useEffect, useState } from 'react';
import { ViewMode } from '@/lib/gis-context';
import { checkForUpdate, downloadAndInstallUpdate } from '@/lib/app-update';

interface StatusBarProps {
  viewMode: ViewMode;
  featureCount: number;
  layerCount: number;
  activeTool: string;
  mouseCoordinate?: { lat: number; lng: number; altitude: number } | null;
  dbConnected?: boolean;
  userEmail?: string;
}

export default function StatusBar({ viewMode, featureCount, layerCount, activeTool, mouseCoordinate, dbConnected, userEmail }: StatusBarProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{ version: string; downloadUrl: string; notes: string; forceUpdate: boolean } | null>(null);
  const [showUpdatePanel, setShowUpdatePanel] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const result = await checkForUpdate();
      if (result && result.hasUpdate) {
        setUpdateAvailable(true);
        setUpdateInfo({
          version: result.serverVersion,
          downloadUrl: result.downloadUrl,
          notes: result.releaseNotes,
          forceUpdate: result.forceUpdate,
        });
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleUpdate = async () => {
    if (!updateInfo) return;
    setDownloading(true);
    await downloadAndInstallUpdate(updateInfo.downloadUrl);
    setDownloading(false);
  };

  const toolLabels: Record<string, string> = {
    'select': '选择',
    'add-point': '添加点',
    'measure': '测量',
    'draw-line': '画线',
    'draw-polygon': '画多边形',
  };

  const viewLabel = viewMode === '2d' ? '2D' : viewMode === '3d' ? '3D' : '高斯';
  const viewColor = viewMode === '3d' ? 'bg-cyan-500' : viewMode === 'gk' ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="flex h-6 items-center justify-between border-t border-slate-700/50 bg-slate-900/95 px-2 sm:px-3 backdrop-blur-sm">
      <div className="flex items-center gap-2 sm:gap-3 text-[10px] text-slate-500 overflow-x-auto">
        <span className="flex items-center gap-1 flex-shrink-0">
          <svg className="h-2.5 w-2.5 text-cyan-500" fill="currentColor" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="3" />
          </svg>
          {toolLabels[activeTool] || activeTool}
        </span>
        <span className="h-2.5 w-px bg-slate-700/50 flex-shrink-0" />
        <span className="font-mono flex-shrink-0">
          {mouseCoordinate
            ? `${mouseCoordinate.lat.toFixed(4)}, ${mouseCoordinate.lng.toFixed(4)}`
            : '--'}
        </span>
        {viewMode === 'gk' && mouseCoordinate && (
          <>
            <span className="h-2.5 w-px bg-slate-700/50 flex-shrink-0" />
            <span className="font-mono text-amber-500 flex-shrink-0">
              Y:{((mouseCoordinate.lng + 180) * 111320).toFixed(0)} X:{((mouseCoordinate.lat) * 110540).toFixed(0)}
            </span>
          </>
        )}
        <span className="hidden sm:inline h-2.5 w-px bg-slate-700/50 flex-shrink-0" />
        <span className="hidden sm:inline flex-shrink-0">
          {featureCount} 要素 / {layerCount} 图层
        </span>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 text-[10px] text-slate-500">
        {/* Version info */}
        <span className="flex items-center gap-1 text-cyan-600 font-mono font-medium">
          SkyGIS v2.8
        </span>
        <span className="h-2.5 w-px bg-slate-700/50" />
        {/* Database connection indicator */}
        <span className="flex items-center gap-1">
          <div className={`h-1.5 w-1.5 rounded-full ${dbConnected ? 'bg-emerald-400' : 'bg-red-400'} ${dbConnected ? '' : 'animate-pulse'}`} />
          <span className="hidden sm:inline">{dbConnected ? 'DB' : '离线'}</span>
        </span>
        {userEmail && (
          <>
            <span className="h-2.5 w-px bg-slate-700/50" />
            <span className="hidden md:inline max-w-[120px] truncate">{userEmail}</span>
          </>
        )}
        <span className="h-2.5 w-px bg-slate-700/50" />
        <span className="flex items-center gap-1">
          <div className={`h-1.5 w-1.5 rounded-full ${viewColor} animate-pulse`} />
          {viewLabel}
        </span>
        {/* Update indicator */}
        {updateAvailable && (
          <>
            <span className="h-2.5 w-px bg-slate-700/50" />
            <button
              onClick={() => setShowUpdatePanel(!showUpdatePanel)}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors animate-pulse"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              v{updateInfo?.version}
            </button>
          </>
        )}
      </div>
      {/* Update panel */}
      {showUpdatePanel && updateInfo && (
        <div className="absolute bottom-6 right-2 z-50 w-72 rounded-lg border border-amber-500/30 bg-slate-800/95 backdrop-blur-md p-3 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400">新版本 v{updateInfo.version}</span>
            <button onClick={() => setShowUpdatePanel(false)} className="text-slate-500 hover:text-slate-300 text-xs">✕</button>
          </div>
          {updateInfo.notes && (
            <div className="text-[10px] text-slate-400 mb-3 max-h-32 overflow-y-auto whitespace-pre-line">
              {updateInfo.notes}
            </div>
          )}
          <button
            onClick={handleUpdate}
            disabled={downloading}
            className="w-full rounded bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-slate-900 text-xs font-bold py-1.5 transition-colors"
          >
            {downloading ? '下载中...' : '立即更新'}
          </button>
        </div>
      )}
    </div>
  );
}
