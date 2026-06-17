'use client';

import { useState } from 'react';

interface LayerInfo {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  color: string;
  description: string;
  components: { name: string; desc: string; tech: string }[];
}

const LAYERS: LayerInfo[] = [
  {
    id: 'perception',
    name: '感知层',
    nameEn: 'Perception',
    icon: '📡',
    color: '#06b6d4',
    description: '多源数据采集：卫星遥感、天文观测、地面与机载监测，构建全方位空间感知网络',
    components: [
      { name: '卫星遥感设备', desc: '光学/雷达/高光谱获取地表信息', tech: 'Python + C++ + GDAL' },
      { name: '卫星地面站接收软件', desc: '建立通信链路，实时接收卫星下传数据', tech: 'C++ 高速接收模块' },
      { name: '遥感影像预处理 (ENVI)', desc: '辐射校正、几何校正、影像融合', tech: 'Python + NumPy + GDAL' },
      { name: '天文观测设备', desc: '射电望远镜/光学望远镜天体观测', tech: 'Python + Astropy' },
      { name: '射电望远镜控制软件', desc: '控制望远镜指向、频率、信号采集', tech: 'C++ + Python + AIPS' },
      { name: 'LiDAR 数据采集 (TerraSolid)', desc: '机载LiDAR获取高精度地形点云', tech: 'C++ + Python + scikit-learn' },
      { name: '地面监测站软件 (LabVIEW)', desc: '实时采集气象、地质、位移传感器数据', tech: 'Python + pyserial + pandas' },
    ],
  },
  {
    id: 'network',
    name: '网络层',
    nameEn: 'Network',
    icon: '🌐',
    color: '#8b5cf6',
    description: '卫星通信、地面光纤/5G网络、专用数据传输协议，保障数据高效可靠传输',
    components: [
      { name: '卫星通信网络', desc: '卫星与地面站间大数据量稳定传输', tech: 'SNMS 卫星网络管理' },
      { name: '地面通信网络', desc: '光纤/4G·5G/无线传感器网络', tech: 'Cisco Prime Infrastructure' },
      { name: 'TCP/IP 协议栈', desc: '数据封装、传输、路由、接收基础协议', tech: 'C 语言底层实现' },
      { name: '遥感数据传输协议 (SDTP)', desc: '针对遥感数据特点优化传输效率', tech: 'C++ 协议实现' },
      { name: '天文数据传输协议 (CDF)', desc: '确保天文数据准确传输与格式一致', tech: 'Python + CDF 库' },
    ],
  },
  {
    id: 'platform',
    name: '平台层',
    nameEn: 'Platform',
    icon: '⚙️',
    color: '#f59e0b',
    description: '数据存储管理、空间分析与机器学习、Web服务与API，核心计算引擎',
    components: [
      { name: 'PostgreSQL + PostGIS', desc: '关系型+空间数据库，结构化数据存储', tech: 'SQL + psycopg2' },
      { name: 'ArcSDE 空间引擎', desc: '空间数据存储、检索、查询、分析', tech: 'Java + JDBC + ArcSDE API' },
      { name: 'HDFS + Cassandra', desc: '分布式海量数据存储，高并发读写', tech: 'Java MapReduce + pyhdfs' },
      { name: 'ArcGIS 空间分析', desc: '距离/缓冲区/叠加分析、三维建模', tech: 'ArcPy + ArcGIS Pro Python API' },
      { name: '机器学习 (scikit-learn/TF)', desc: '数据融合、建模、预测、深度学习', tech: 'Python + TensorFlow + PyTorch' },
      { name: 'Web 服务 (Tomcat/Spring)', desc: 'RESTful API 发布数据处理结果', tech: 'Java Spring Boot / Python Flask' },
      { name: 'API 管理 (Apigee)', desc: 'API设计、发布、监控、安全', tech: 'Apigee 管理平台' },
    ],
  },
  {
    id: 'application',
    name: '应用层',
    nameEn: 'Application',
    icon: '📊',
    color: '#10b981',
    description: '地质灾害监测、资源勘探、城市规划，面向行业的精准空间信息服务',
    components: [
      { name: '滑坡与泥石流监测系统', desc: '风险区域可视化、风险评估、预警触发', tech: 'Python + 机器学习模型' },
      { name: '地震监测与预警 (EMEWS)', desc: '实时地震数据、快速参数计算、预警发布', tech: 'Python + 实时数据处理' },
      { name: '矿产资源勘探 (MES)', desc: '地质异常识别、矿物分布预测', tech: '遥感分析 + 机器学习' },
      { name: '能源资源勘探 (EEAS)', desc: '油气/地热资源潜力评估', tech: 'GIS叠加分析 + 深度学习' },
      { name: '城市空间布局规划 (CSLPS)', desc: '用地适宜性评价、空间优化', tech: '多准则决策 + GIS分析' },
      { name: '城市基础设施规划 (UICPS)', desc: '路网优化、管线布局、设施选址', tech: '网络分析 + 空间优化' },
    ],
  },
];

export default function SkyGISArchitecture({ onClose }: { onClose: () => void }) {
  const [activeLayer, setActiveLayer] = useState<string>('perception');
  const current = LAYERS.find(l => l.id === activeLayer)!;

  return (
    <div className="flex h-full flex-col border-l border-slate-700/50 bg-slate-900/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 text-sm font-bold text-white">
            S
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">SkyGIS 架构</h2>
            <p className="text-[10px] text-slate-500">星空地理信息系统 · 四层网络架构</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Architecture diagram */}
      <div className="border-b border-slate-700/50 px-4 py-3">
        <div className="flex flex-col gap-1.5">
          {LAYERS.map((layer, idx) => (
            <div key={layer.id} className="flex items-center gap-2">
              {idx > 0 && (
                <div className="absolute left-6 -mt-3 h-3 w-px" style={{ backgroundColor: LAYERS[idx - 1].color + '40' }} />
              )}
              <button
                onClick={() => setActiveLayer(layer.id)}
                className={`flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-left transition-all ${
                  activeLayer === layer.id
                    ? 'border-l-2 bg-slate-800/80'
                    : 'bg-slate-800/30 hover:bg-slate-800/60'
                }`}
                style={{ borderLeftColor: activeLayer === layer.id ? layer.color : 'transparent' }}
              >
                <span className="text-base">{layer.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-200">{layer.name}</span>
                    <span className="text-[10px] text-slate-500">{layer.nameEn}</span>
                  </div>
                  {activeLayer === layer.id && (
                    <p className="mt-0.5 text-[10px] leading-tight text-slate-400 line-clamp-2">{layer.description}</p>
                  )}
                </div>
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: layer.color }}
                />
              </button>
            </div>
          ))}
        </div>
        {/* Data flow arrows */}
        <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-slate-500">
          <span>感知层</span>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          <span>网络层</span>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          <span>平台层</span>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          <span>应用层</span>
        </div>
      </div>

      {/* Layer details */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: current.color }} />
          <h3 className="text-xs font-semibold text-slate-200">{current.name} · 组件清单</h3>
        </div>
        <div className="space-y-2">
          {current.components.map((comp, idx) => (
            <div
              key={idx}
              className="rounded-md border border-slate-700/30 bg-slate-800/50 p-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium text-slate-200">{comp.name}</h4>
                  <p className="mt-0.5 text-[10px] leading-tight text-slate-400">{comp.desc}</p>
                </div>
                <div
                  className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium"
                  style={{
                    backgroundColor: current.color + '15',
                    color: current.color,
                  }}
                >
                  {comp.tech.split(' ')[0]}
                </div>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {comp.tech.split(/[+/·,]/).map((t, i) => (
                  <span
                    key={i}
                    className="rounded bg-slate-700/50 px-1.5 py-0.5 text-[9px] text-slate-400"
                  >
                    {t.trim()}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer stats */}
      <div className="border-t border-slate-700/50 px-4 py-2">
        <div className="grid grid-cols-4 gap-2 text-center">
          {LAYERS.map(layer => (
            <div key={layer.id}>
              <div className="text-xs font-bold" style={{ color: layer.color }}>
                {layer.components.length}
              </div>
              <div className="text-[9px] text-slate-500">{layer.name}</div>
            </div>
          ))}
        </div>
        <div className="mt-1.5 text-center text-[10px] text-slate-500">
          共 {LAYERS.reduce((sum, l) => sum + l.components.length, 0)} 个核心组件
        </div>
      </div>
    </div>
  );
}
