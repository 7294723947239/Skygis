'use client';

import { MapTool, ViewMode } from '@/lib/gis-context';
import UpdateButton from './update-button';

import { type SkyGISPanelType } from '@/lib/gis-context';

export type SkyGISPanel = SkyGISPanelType | null;

interface ToolbarProps {
  activeTool: MapTool;
  onToolChange: (tool: MapTool) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showAnalysis: boolean;
  onToggleAnalysis: () => void;
  skygisPanel: SkyGISPanel;
  onSkyGISPanelChange: (panel: SkyGISPanel) => void;
  showCoordConvert: boolean;
  onToggleCoordConvert: () => void;
  onLogout: () => void;
  userEmail?: string | null;
  dbConnected?: boolean;
}

export default function Toolbar({
  activeTool,
  onToolChange,
  viewMode,
  onViewModeChange,
  showAnalysis,
  onToggleAnalysis,
  skygisPanel,
  onSkyGISPanelChange,
  showCoordConvert,
  onToggleCoordConvert,
  onLogout,
  userEmail,
  dbConnected,
}: ToolbarProps) {
  const is3D = viewMode === '3d';

  return (
    <div className="flex h-10 w-full items-center border-b border-slate-700/50 bg-slate-900/95 px-2 backdrop-blur-sm">
      {/* Left: View mode toggle */}
      <div className="flex items-center gap-1">
        <div className="flex overflow-hidden rounded-md border border-slate-700/50">
          <button
            onClick={() => onViewModeChange('2d')}
            className={`px-2 py-1 text-xs font-medium transition-colors ${viewMode === '2d' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            2D
          </button>
          <button
            onClick={() => onViewModeChange('3d')}
            className={`px-2 py-1 text-xs font-medium transition-colors ${viewMode === '3d' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            3D
          </button>
          <button
            onClick={() => onViewModeChange('gk')}
            className={`px-2 py-1 text-xs font-medium transition-colors ${viewMode === 'gk' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            高斯
          </button>
        </div>

        {/* Tool buttons - only in 2D/GK, hidden in 3D (globe-map has its own) */}
        {!is3D && (
          <>
            <div className="mx-0.5 h-5 w-px bg-slate-700/50" />
            <button
              onClick={() => onToolChange('select')}
              title="选择"
              className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${activeTool === 'select' ? 'bg-cyan-600/20 text-cyan-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
              </svg>
            </button>
            <button
              onClick={() => onToolChange('add-point')}
              title="标注"
              className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${activeTool === 'add-point' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            <button
              onClick={() => onToolChange('measure')}
              title="测距"
              className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${activeTool === 'measure' || activeTool === 'draw-line' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </button>
            <button
              onClick={() => onToolChange('measure-area')}
              title="测面积"
              className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${activeTool === 'measure-area' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
              </svg>
            </button>
            <button
              onClick={onToggleCoordConvert}
              title="坐标转换"
              className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${showCoordConvert ? 'bg-violet-500/20 text-violet-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side - compact */}
      <div className="flex items-center gap-1">
        {/* SkyGIS modules - only in 2D/GK */}
        {!is3D && (
          <div className="flex overflow-hidden rounded-md border border-slate-700/50">
            <button
              onClick={() => onSkyGISPanelChange(skygisPanel === 'architecture' ? null : 'architecture')}
              title="架构"
              className={`px-1.5 py-1 text-xs transition-colors ${skygisPanel === 'architecture' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              🏗
            </button>
            <button
              onClick={() => onSkyGISPanelChange(skygisPanel === 'geological' ? null : 'geological')}
              title="地质"
              className={`px-1.5 py-1 text-xs transition-colors ${skygisPanel === 'geological' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              ⚠
            </button>
            <button
              onClick={() => onSkyGISPanelChange(skygisPanel === 'resource' ? null : 'resource')}
              title="资源"
              className={`px-1.5 py-1 text-xs transition-colors ${skygisPanel === 'resource' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              ⛏
            </button>
            <button
              onClick={() => onSkyGISPanelChange(skygisPanel === 'urban' ? null : 'urban')}
              title="规划"
              className={`px-1.5 py-1 text-xs transition-colors ${skygisPanel === 'urban' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              🏙
            </button>
            <button
              onClick={() => onSkyGISPanelChange(skygisPanel === 'cosmic' ? null : 'cosmic')}
              title="宇宙GIS融合引擎"
              className={`px-1.5 py-1 text-xs transition-colors ${skygisPanel === 'cosmic' ? 'bg-gradient-to-r from-cyan-600 to-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              ☯
            </button>
          </div>
        )}

        {/* Analysis - only in 2D/GK */}
        {!is3D && (
          <button
            onClick={onToggleAnalysis}
            title="分析"
            className={`flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium transition-colors ${showAnalysis ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden md:inline">分析</span>
          </button>
        )}

        {/* Update + DB + User */}
        <div className="flex items-center gap-1">
          <UpdateButton />
          <div className={`h-1.5 w-1.5 rounded-full ${dbConnected ? 'bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)]' : 'bg-rose-400'}`} />
          {userEmail && (
            <span className="hidden max-w-[80px] truncate text-[10px] text-slate-500 lg:inline">{userEmail}</span>
          )}
          <button
            onClick={onLogout}
            className="flex items-center gap-1 rounded px-2.5 py-1 text-xs text-slate-400 transition-colors hover:bg-rose-900/60 hover:text-rose-300"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            退出
          </button>
        </div>
      </div>
    </div>
  );
}
