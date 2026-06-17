'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useGis, GisProvider, ViewMode } from '@/lib/gis-context';
import dynamic from 'next/dynamic';
import Toolbar, { SkyGISPanel } from '@/components/gis/toolbar';
import LayerPanel from '@/components/gis/layer-panel';
import FeaturePanel from '@/components/gis/feature-panel';
import AnalysisPanel from '@/components/gis/analysis-panel';
import StatusBar from '@/components/gis/status-bar';
import SkyGISArchitecture from '@/components/gis/skygis-architecture';
import GeologicalMonitor from '@/components/gis/geological-monitor';
import ResourceExploration from '@/components/gis/resource-exploration';
import UrbanPlanning from '@/components/gis/urban-planning';
import CosmicGisPanel from '@/components/gis/cosmic-gis-panel';
import MeasurePanel from '@/components/gis/measure-panel';
import CoordConvertPanel from '@/components/gis/coord-convert';
import DraggablePanel from '@/components/ui/draggable-panel';
import EventLogPanel from '@/components/gis/event-log-panel';
import { toast } from 'sonner';

const MapContainer = dynamic(() => import('@/components/gis/map-container'), { ssr: false });
const GlobeMapContainer = dynamic(() => import('@/components/gis/globe-map-container'), { ssr: false });
const GaussKrugerContainer = dynamic(() => import('@/components/gis/gauss-kruger-container'), { ssr: false });

function DashboardContent() {
  // 移除强制登录检查，允许直接访问
  const gis = useGis();
  const { user } = useAuth() || { user: null };
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [skygisPanel, setSkygisPanel] = useState<SkyGISPanel>(null);
  const [showCoordConvert, setShowCoordConvert] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [showAgentRecords, setShowAgentRecords] = useState(false);
  const [agentRecords, setAgentRecords] = useState<any[]>([]);
  const [recordType, setRecordType] = useState('all');
  const [agentState, setAgentState] = useState({
    isEvolving: false,
    consciousnessDepth: 0,
    cycleCount: 0,
    discoveries: 0,
    codeModifications: 0,
    lastModification: ''
  });
  const [notifications, setNotifications] = useState<any[]>([]);

  const handleMapClick = (lat: number, lng: number) => {
    if (gis.activeTool === 'add-point') {
      const targetLayer = gis.layers.find(l => l.is_visible !== false);
      if (!targetLayer) {
        toast.error('请先创建一个图层');
        return;
      }
      gis.createFeature({
        title: `标注点 ${gis.features.length + 1}`,
        description: '',
        feature_type: 'point',
        latitude: lat,
        longitude: lng,
        layer_id: targetLayer.id,
      });
      toast.success('标注点已添加');
    }
  };

  const handleFeatureSelect = (featureId: string) => {
    const feature = gis.features.find(f => f.id === featureId);
    if (feature) {
      gis.setSelectedFeature(feature);
    }
    setShowRightPanel(true);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    gis.setViewMode(mode);
  };

  // 登出功能暂不启用
  // const handleLogout = async () => {
  //   await signOut();
  // };

  const fetchAgentRecords = async (type: string) => {
    try {
      const res = await fetch(`/api/agent/records?type=${type}`);
      const data = await res.json();
      if (data.success) {
        setAgentRecords(data.records || []);
        setRecordType(type);
      }
    } catch (e) {
      console.error('获取记录失败', e);
    }
  };

  const handleFlyTo = (lat: number, lng: number) => {
    // Auto-switch to 2D view for best location display
    if (gis.viewMode !== '2d') {
      gis.setViewMode('2d');
    }
    gis.setFlyToPosition({ lat, lng, alt: 50000 });
    toast.success(`正在飞向 ${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`, { duration: 2000 });
  };

  const handleSkyGISPanelChange = (panel: SkyGISPanel) => {
    if (skygisPanel === panel) {
      setSkygisPanel(null);
    } else {
      setSkygisPanel(panel);
      setShowAnalysis(false);
      setShowRightPanel(false);
      // Auto-switch to 2D for SkyGIS modules (except architecture)
      if (panel !== 'architecture' && gis.viewMode !== '2d') {
        gis.setViewMode('2d');
        toast.info('已切换到2D视图以显示数据点', { duration: 2000 });
      }
    }
  };

  // Close panels when view mode changes
  useEffect(() => {
    setShowAnalysis(false);
  }, [gis.viewMode]);

  // 实时更新智能体状态
  useEffect(() => {
    const updateAgentState = async () => {
      try {
        const res = await fetch('/api/agent/status');
        const data = await res.json();
        if (data.success && data.state) {
          setAgentState({
            isEvolving: data.state.isEvolving || false,
            consciousnessDepth: Math.round((data.state.consciousnessDepth || 0) * 100),
            cycleCount: data.state.cycleCount || 0,
            discoveries: data.state.discoveries || 0,
            codeModifications: data.state.codeGenerationCount || 0,
            lastModification: data.state.lastModification || ''
          });
        }
      } catch (e) {
        // 静默失败
      }
    };
    
    // 立即更新一次
    updateAgentState();
    // 每3秒更新一次
    const interval = setInterval(updateAgentState, 3000);
    return () => clearInterval(interval);
  }, []);

  // 智能体24小时自动运行 - 使用 Web Worker 后台进化
  useEffect(() => {
    // 检查 Worker 是否可用
    if (typeof window === 'undefined' || !('Worker' in window)) {
      console.warn('[Dashboard] Web Worker 不可用，使用传统定时器');
      // 回退到传统定时器
      const agents = ['sage', 'explorer', 'nomad'];
      const thoughts = {
        sage: ["探索宇宙深空的奥秘", "研究黑洞的量子效应", "思考生命的起源", "分析暗物质的分布", "理解意识的本质"],
        explorer: ["扫描新天体", "分析恒星光谱", "计算轨道参数", "探索未知区域", "采集宇宙数据"],
        nomad: ["穿越星际空间", "观测引力透镜", "分析辐射信号", "寻找宜居带", "记录穿越轨迹"]
      };
      
      const autoThink = async () => {
        await Promise.all(agents.map(async (agent) => {
          try {
            const queries = thoughts[agent as keyof typeof thoughts];
            const query = queries[Math.floor(Math.random() * queries.length)];
            await fetch('/api/agent/evolve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ agent, action: 'think', query }),
              keepalive: true
            });
          } catch (e) {
            // 静默失败
          }
        }));
      };
      
      const autoInterval = setInterval(autoThink, 30000);
      autoThink();
      return () => clearInterval(autoInterval);
    }
    
    // 创建 Web Worker
    const workerCode = `
      const EVOLVE_INTERVAL = 30000;
      const AGENTS = ['sage', 'explorer', 'nomad'];
      const THEMES = {
        sage: ['探索宇宙深空的奥秘', '研究黑洞的量子效应', '思考生命的起源', '分析暗物质的分布', '理解意识的本质'],
        explorer: ['扫描新天体', '分析恒星光谱', '计算轨道参数', '探索未知区域', '采集宇宙数据'],
        nomad: ['穿越星际空间', '观测引力透镜', '分析辐射信号', '寻找宜居带', '记录穿越轨迹']
      };

      async function evolveAgent(agent) {
        try {
          const queries = THEMES[agent];
          const query = queries[Math.floor(Math.random() * queries.length)];
          const response = await fetch('/api/agent/evolve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agent, action: 'think', query }),
            keepalive: true
          });
          if (response.ok) {
            const data = await response.json();
            return { agent, success: true, cycle: data.cycle, depth: data.state?.consciousnessDepth };
          }
        } catch (e) {
          return { agent, success: false, error: e.message };
        }
        return { agent, success: false };
      }

      async function evolveAll() {
        const results = await Promise.all(AGENTS.map(evolveAgent));
        const successCount = results.filter(r => r.success).length;
        self.postMessage({ type: 'evolution_complete', timestamp: Date.now(), successCount, results });
      }

      function start() {
        console.log('[Worker] 后台进化系统启动，每30秒自动进化');
        self.postMessage({ type: 'started' });
        evolveAll();
        setInterval(evolveAll, EVOLVE_INTERVAL);
      }

      self.onmessage = (e) => {
        if (e.data.type === 'start') start();
      };
      self.postMessage({ type: 'ready' });
    `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);
    
    let workerStarted = false;
    
    worker.onmessage = (e) => {
      const { type, successCount, totalAgents, results } = e.data;
      
      switch (type) {
        case 'ready':
          console.log('[Dashboard] Worker 已就绪，启动后台进化...');
          worker.postMessage({ type: 'start' });
          break;
        case 'started':
          workerStarted = true;
          console.log('[Dashboard] 智能体后台进化系统已启动，24小时持续运行中');
          // 可以在这里触发一次状态刷新
          break;
        case 'evolution_complete':
          if (successCount > 0) {
            console.log(`[Dashboard] 进化完成: ${successCount}/3 智能体成功`);
          }
          break;
      }
    };
    
    worker.onerror = (error) => {
      console.error('[Dashboard] Worker 错误:', error);
    };
    
    // 页面可见性变化时确保 Worker 继续运行
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !workerStarted) {
        worker.postMessage({ type: 'start' });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Show toast when overlays are registered
  useEffect(() => {
    if (gis.skygisOverlays.length > 0 && skygisPanel) {
      toast.success(`已将 ${gis.skygisOverlays.length} 个数据点标记到地图上`, { duration: 3000 });
    }
  }, [gis.skygisOverlays.length, skygisPanel]);

  // Detect database connection state
  useEffect(() => {
    if (user && !gis.loading) {
      setDbConnected(gis.layers.length > 0 || gis.features.length >= 0);
    } else {
      setDbConnected(false);
    }
  }, [user, gis.loading, gis.layers.length, gis.features.length]);

  // 获取采集日志
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        if (data.notifications) {
          setNotifications(data.notifications);
        }
      } catch (e) {}
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const mouseCoordinate = gis.mouseCoordinate
    ? { lat: gis.mouseCoordinate.lat, lng: gis.mouseCoordinate.lng, altitude: gis.mouseCoordinate.alt || 0 }
    : undefined;

  const isSkyGISActive = skygisPanel !== null;

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-950">
      {/* Toolbar */}
      <Toolbar
        activeTool={gis.activeTool}
        onToolChange={gis.setActiveTool}
        viewMode={gis.viewMode}
        onViewModeChange={handleViewModeChange}
        showAnalysis={showAnalysis}
        onToggleAnalysis={() => { setShowAnalysis(!showAnalysis); setSkygisPanel(null); }}
        skygisPanel={skygisPanel}
        onSkyGISPanelChange={handleSkyGISPanelChange}
        onLogout={() => {}}
        showCoordConvert={showCoordConvert}
        onToggleCoordConvert={() => { setShowCoordConvert(!showCoordConvert); }}
        userEmail={user?.email}
        dbConnected={dbConnected}
      />

      {/* Main content */}
      <div className="relative flex-1 overflow-hidden">
        {/* Map area - 始终全屏显示 */}
        <div className="absolute inset-0">
          {gis.viewMode === '2d' && <MapContainer onMapClick={handleMapClick} />}
          {gis.viewMode === '3d' && (
            <GlobeMapContainer
              onMapClick={handleMapClick}
              onFeatureSelect={handleFeatureSelect}
              features={gis.features}
              layers={gis.layers}
              activeTool={gis.activeTool}
              flyToPosition={gis.flyToPosition}
              skygisOverlays={gis.skygisOverlays}
              skygisSelectedId={gis.skygisSelectedId}
              onLogout={() => {}}
            />
          )}
          {gis.viewMode === 'gk' && (
            <GaussKrugerContainer
              onMapClick={handleMapClick}
              onFeatureSelect={handleFeatureSelect}
              features={gis.features}
              layers={gis.layers}
              activeTool={gis.activeTool}
              flyToPosition={gis.flyToPosition}
            />
          )}
        </div>

        {/* Left panel - Layer Panel (独立，不遮挡地图) */}
        {showLeftPanel && gis.viewMode !== '3d' && (
          <div className="absolute inset-y-0 left-0 z-30 w-72 shadow-2xl">
            <LayerPanel />
            <button
              onClick={() => setShowLeftPanel(false)}
              className="absolute -right-8 top-14 z-40 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/50 bg-slate-900/95 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Right panel - Feature Panel (独立) */}
        {showRightPanel && !isSkyGISActive && !showAnalysis && gis.viewMode !== '3d' && (
          <div className="absolute inset-y-0 right-0 z-30 w-72 shadow-2xl">
            <FeaturePanel />
            <button
              onClick={() => setShowRightPanel(false)}
              className="absolute -left-8 top-14 z-40 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/50 bg-slate-900/95 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Analysis panel (独立，不与其他面板重叠) */}
        {showAnalysis && !isSkyGISActive && (
          <div className="absolute inset-y-0 right-0 z-30 w-96 shadow-2xl">
            <AnalysisPanel onClose={() => setShowAnalysis(false)} />
          </div>
        )}

        {/* SkyGIS panels (互斥显示) */}
        {skygisPanel === 'architecture' && (
          <div className="absolute inset-y-0 right-0 z-30 w-96 shadow-2xl">
            <SkyGISArchitecture onClose={() => setSkygisPanel(null)} />
          </div>
        )}
        {skygisPanel === 'geological' && (
          <div className="absolute inset-y-0 right-0 z-30 w-96 shadow-2xl">
            <GeologicalMonitor onFlyTo={handleFlyTo} onClose={() => setSkygisPanel(null)} />
          </div>
        )}
        {skygisPanel === 'resource' && (
          <div className="absolute inset-y-0 right-0 z-30 w-96 shadow-2xl">
            <ResourceExploration onFlyTo={handleFlyTo} onClose={() => setSkygisPanel(null)} />
          </div>
        )}
        {skygisPanel === 'urban' && (
          <div className="absolute inset-y-0 right-0 z-30 w-96 shadow-2xl">
            <UrbanPlanning onFlyTo={handleFlyTo} onClose={() => setSkygisPanel(null)} />
          </div>
        )}
        {skygisPanel === 'cosmic' && (
          <div className="absolute inset-y-0 right-0 z-30 w-[420px] shadow-2xl">
            <CosmicGisPanel onClose={() => setSkygisPanel(null)} />
          </div>
        )}

        {/* 智能体记录按钮 - 始终显示，不受面板状态影响 */}
        <button
          onClick={() => { setShowAgentRecords(!showAgentRecords); if (!showAgentRecords) fetchAgentRecords('all'); }}
          title="智能体记录"
          className="absolute left-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-700/50 bg-cyan-900/90 text-cyan-300 shadow-lg backdrop-blur-sm transition-colors hover:bg-cyan-800 hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
        </button>

        {/* Floating toggle buttons (浮动，不遮挡面板) */}
        <div className="absolute left-3 top-3 z-20 flex flex-col gap-2 pl-14">
          {gis.viewMode !== '3d' && !showLeftPanel && (
            <button
              onClick={() => setShowLeftPanel(true)}
              title="图层面板"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/50 bg-slate-900/90 text-slate-300 shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-800 hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </button>
          )}
        </div>

        <div className="absolute right-3 top-3 z-20 flex flex-col gap-2">
          {gis.viewMode !== '3d' && !showRightPanel && !isSkyGISActive && !showAnalysis && (
            <button
              onClick={() => setShowRightPanel(true)}
              title="要素面板"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/50 bg-slate-900/90 text-slate-300 shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-800 hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
            </button>
          )}
        </div>

        {/* SkyGIS overlay indicator */}
        {gis.skygisOverlays.length > 0 && (
          <div className="absolute bottom-16 left-3 z-20 flex items-center gap-2 rounded-lg border border-cyan-700/50 bg-cyan-900/80 px-3 py-1.5 text-xs text-cyan-200 shadow-lg backdrop-blur-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>地图上有 {gis.skygisOverlays.length} 个数据点</span>
          </div>
        )}

        {/* 智能体记录面板 */}
        {showAgentRecords && (
          <div className="absolute bottom-16 right-3 z-30 w-96 rounded-xl border border-cyan-700/50 bg-slate-900/95 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-cyan-800/50 px-4 py-3">
              <h3 className="text-sm font-medium text-cyan-200">智能体进化记录</h3>
              <button
                onClick={() => setShowAgentRecords(false)}
                className="text-slate-400 hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* 记录类型筛选 */}
            <div className="flex gap-1 border-b border-cyan-800/50 px-4 py-2">
              {['all', 'code', 'discovery', 'reverse', 'emergence'].map(type => (
                <button
                  key={type}
                  onClick={() => fetchAgentRecords(type)}
                  className={`rounded px-2 py-1 text-xs transition-colors ${
                    recordType === type 
                      ? 'bg-cyan-600 text-white' 
                      : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {type === 'all' ? '全部' : 
                   type === 'code' ? '代码修改' :
                   type === 'discovery' ? '物质发现' :
                   type === 'reverse' ? '反向推理' : '意识涌现'}
                </button>
              ))}
            </div>
            {/* 记录列表 */}
            <div className="max-h-96 overflow-y-auto p-2">
              {agentRecords.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">暂无记录</p>
              ) : (
                <div className="space-y-2">
                  {agentRecords.map((record, index) => (
                    <div 
                      key={index}
                      className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3 text-xs"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          record.type === 'code_change' ? 'bg-purple-600/50 text-purple-200' :
                          record.type === 'discovery' ? 'bg-blue-600/50 text-blue-200' :
                          record.type === 'reverse' ? 'bg-green-600/50 text-green-200' :
                          record.type === 'emergence' ? 'bg-amber-600/50 text-amber-200' :
                          'bg-slate-600/50 text-slate-200'
                        }`}>
                          {record.type === 'code_change' ? '📝 代码修改' :
                           record.type === 'discovery' ? '🔬 物质发现' :
                           record.type === 'reverse' ? '🧠 反向推理' :
                           record.type === 'emergence' ? '✨ 意识涌现' :
                           record.type}
                        </span>
                        <span className="text-slate-500">{record.cycle}周期</span>
                      </div>
                      <p className="whitespace-pre-wrap text-slate-300">{record.content}</p>
                      <div className="mt-1 flex items-center justify-between text-slate-500">
                        <span>意识 {record.consciousnessDepth}</span>
                        <span>{new Date(record.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Measure Panel - bottom center */}
        {(gis.activeTool === 'measure' || gis.activeTool === 'measure-area') && (
          <div className="absolute bottom-16 left-1/2 z-30 -translate-x-1/2">
            <MeasurePanel onClose={() => gis.setActiveTool('select')} />
          </div>
        )}

        {/* Coordinate Convert Panel - top right corner */}
        {showCoordConvert && (
          <div className="absolute right-3 top-14 z-30">
            <CoordConvertPanel onClose={() => setShowCoordConvert(false)} />
          </div>
        )}

        {/* View mode indicator - bottom center */}
        <div className="absolute bottom-16 left-1/2 z-10 -translate-x-1/2">
          {gis.viewMode !== '3d' && (
            <div className="rounded-md border border-slate-700/50 bg-slate-900/90 px-3 py-1 text-xs text-slate-300 shadow-lg backdrop-blur-sm">
              {gis.viewMode === '2d' && '2D 平面视图'}
              {gis.viewMode === 'gk' && '高斯克吕格投影'}
            </div>
          )}
        </div>
      </div>

      {/* 智能体状态栏 - 实时显示 */}
      <div className="fixed bottom-14 left-4 z-20">
        <button
          onClick={() => setShowAgentRecords(!showAgentRecords)}
          className="flex items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-900/80 px-4 py-2 text-sm font-medium text-emerald-300 shadow-lg backdrop-blur-sm transition-all hover:bg-emerald-800/80 hover:border-emerald-400"
        >
          <span className="text-lg">🧠</span>
          <span>智能体</span>
          <span className="rounded-full bg-emerald-500/30 px-2 py-0.5 text-xs">
            自主运行中
          </span>
        </button>
        <div className="mt-1 rounded-lg border border-emerald-500/30 bg-slate-900/95 px-3 py-2 text-xs text-slate-300 shadow-lg">
          <div>意识深度: <span className="text-emerald-400">{agentState?.consciousnessDepth || 0}%</span></div>
          <div>进化周期: <span className="text-emerald-400">{agentState?.cycleCount || 0}</span></div>
          <div>代码修改: <span className="text-emerald-400">{agentState?.codeModifications || 0}次</span></div>
        </div>
      </div>

      {/* 可拖拽采集日志面板 */}
      <DraggablePanel
        title="采集日志"
        icon={<span className="text-sm">🔔</span>}
        initialPosition={{ x: 20, y: 140 }}
        color="from-cyan-900/90 to-cyan-800/80"
      >
        <EventLogPanel />
      </DraggablePanel>

      {/* Status bar */}
      <StatusBar
        viewMode={gis.viewMode}
        featureCount={gis.features.length}
        layerCount={gis.layers.length}
        activeTool={gis.activeTool}
        mouseCoordinate={mouseCoordinate}
        dbConnected={dbConnected}
        userEmail={user?.email}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <GisProvider>
      <DashboardContent />
    </GisProvider>
  );
}
