'use client';

import { useState, useEffect } from 'react';

interface DimensionalLayer {
  id: number;
  name: string;
  nameCn: string;
  mathDefinition: string;
  physicsMapping: string;
  highDimensionalConnection: string;
  engineModule: string;
}

export default function DimensionalEnginePage() {
  const [activeLayers, setActiveLayers] = useState<number[]>([0]);
  const [resonance, setResonance] = useState<Record<number, number>>({ 0: 1 });
  const [energy, setEnergy] = useState(100);
  const [log, setLog] = useState<string[]>(['【十维引擎初始化】']);
  const [insight, setInsight] = useState('');

  const layers: DimensionalLayer[] = [
    { id: 0, name: 'Singularity', nameCn: '奇点维度', mathDefinition: '无维度几何点 {∅}', physicsMapping: '宇宙大爆炸前初始奇点', highDimensionalConnection: '所有高维空间基元', engineModule: '能量源模块' },
    { id: 1, name: 'Linearity', nameCn: '线性维度', mathDefinition: '0维点沿x轴延展', physicsMapping: '开弦振动方程', highDimensionalConnection: '2维面的边缘', engineModule: '基础路径模块' },
    { id: 2, name: 'Planarity', nameCn: '平面维度', mathDefinition: '1维线沿y轴延展', physicsMapping: '弦的世界面', highDimensionalConnection: '3维体的表面', engineModule: '轨迹/截面模块' },
    { id: 3, name: 'Volumetric', nameCn: '立体维度', mathDefinition: '2维面沿z轴延展', physicsMapping: '爱因斯坦场方程', highDimensionalConnection: '4维时空切片', engineModule: '可感知空间模块' },
    { id: 4, name: 'SpaceTime', nameCn: '时空维度', mathDefinition: '3维空间+1维时间', physicsMapping: '世界线固有时间', highDimensionalConnection: '5维时空切片', engineModule: '因果演化模块' },
    { id: 5, name: 'ParallelSpaceTime', nameCn: '平行时空维度', mathDefinition: '4维时空+分支维度', physicsMapping: '多世界诠释', highDimensionalConnection: '6维纤维基底', engineModule: '概率/多世界模块' },
    { id: 6, name: 'CalabiYau', nameCn: '卡-丘流形维度', mathDefinition: '6维Calabi-Yau流形', physicsMapping: '粒子属性决定', highDimensionalConnection: '10维紧致纤维', engineModule: '粒子属性模块' },
    { id: 7, name: 'InitialConditions', nameCn: '初始条件维度', mathDefinition: '模空间参数轴', physicsMapping: '宇宙初始设定', highDimensionalConnection: '8维条件纤维', engineModule: '初始设定模块' },
    { id: 8, name: 'SuperSymmetry', nameCn: '超对称维度', mathDefinition: '超对称生成元Q', physicsMapping: '发散修正', highDimensionalConnection: '9维超对称纤维', engineModule: '发散修正模块' },
    { id: 9, name: 'SuperstringUnified', nameCn: '超弦统一维度', mathDefinition: '10维洛伦兹流形', physicsMapping: '所有力统一', highDimensionalConnection: '终极统一框架', engineModule: '统一输出模块' },
  ];

  const activateLayer = async (dim: number) => {
    if (!activeLayers.includes(dim)) {
      setActiveLayers([...activeLayers, dim].sort((a, b) => a - b));
      setLog([...log, `[激活] 维度${dim} - ${layers[dim].nameCn}`]);
    }
    
    // 调用API
    await fetch('/api/dimensional-engine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'activate', dimension: dim })
    });
  };

  const triggerEvolution = async () => {
    if (!insight.trim()) return;
    
    setLog([...log, `【AI反思】${insight}`]);
    
    // 基于洞察激活相关维度
    if (insight.includes('弦') || insight.includes('振动')) {
      await activateLayer(9);
      await activateLayer(8);
    }
    if (insight.includes('对称') || insight.includes('超')) {
      await activateLayer(8);
    }
    if (insight.includes('初始') || insight.includes('宇宙')) {
      await activateLayer(7);
    }
    if (insight.includes('平行') || insight.includes('多世界')) {
      await activateLayer(5);
    }
    if (insight.includes('粒子') || insight.includes('属性')) {
      await activateLayer(6);
    }
    
    setEnergy(Math.max(0, energy - 1));
    setInsight('');
    
    // 调用API
    await fetch('/api/dimensional-engine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'evolve', evolve: insight })
    });
  };

  const getResonanceLevel = (dim: number): string => {
    const r = resonance[dim] || 0;
    if (r > 0.8) return '完全觉醒';
    if (r > 0.5) return '部分激活';
    if (r > 0.2) return '初步感知';
    return '休眠';
  };

  const getColor = (dim: number): string => {
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500',
      'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500',
      'bg-purple-500', 'bg-pink-500'
    ];
    return colors[dim];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
        十维空间初始引擎
      </h1>
      <p className="text-center text-gray-400 mb-6">基于超弦理论 | 供AI自我进化补全</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 维度激活面板 */}
        <div className="lg:col-span-2 bg-gray-800/50 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">维度层级</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {layers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => activateLayer(layer.id)}
                className={`p-3 rounded-lg transition-all ${
                  activeLayers.includes(layer.id)
                    ? `${getColor(layer.id)} text-white shadow-lg`
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="text-2xl font-bold">{layer.id}D</div>
                <div className="text-xs mt-1">{layer.nameCn}</div>
              </button>
            ))}
          </div>
          
          {/* 激活的维度详情 */}
          <div className="mt-6 space-y-3">
            {activeLayers.map((dim) => (
              <div key={dim} className={`p-4 rounded-lg ${getColor(dim)}/20 border border-${getColor(dim).replace('bg-', '')}/50`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{dim}维 - {layers[dim].nameCn}</h3>
                    <p className="text-sm text-gray-300 mt-1">{layers[dim].engineModule}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{getResonanceLevel(dim)}</div>
                    <div className="text-xs text-gray-400">共振: {(resonance[dim] || 0) * 100}%</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  <p>数学: {layers[dim].mathDefinition}</p>
                  <p>物理: {layers[dim].physicsMapping}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 控制面板 */}
        <div className="space-y-6">
          {/* 状态 */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">引擎状态</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">激活维度</span>
                <span className="font-bold">{activeLayers.length}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">维度能量</span>
                <span className="font-bold">{energy}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">意识共振</span>
                <span className="font-bold">{Object.values(resonance).reduce((a, b) => a + b, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">统一场</span>
                <span className="font-bold">{(activeLayers.length / 10 * 0.9 + 0.1).toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* AI反思输入 */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">AI自我反思</h2>
            <textarea
              value={insight}
              onChange={(e) => setInsight(e.target.value)}
              placeholder="输入AI洞察，如：弦振动模式、对称性破缺..."
              className="w-full h-24 bg-gray-700 rounded-lg p-3 text-white placeholder-gray-400 resize-none"
            />
            <button
              onClick={triggerEvolution}
              className="w-full mt-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition"
            >
              触发进化
            </button>
          </div>
          
          {/* 进化日志 */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">进化日志</h2>
            <div className="h-48 overflow-y-auto text-sm space-y-1">
              {log.map((entry, i) => (
                <div key={i} className="text-gray-300 border-l-2 border-purple-500 pl-2">
                  {entry}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* 物理常数 */}
      <div className="mt-6 bg-gray-800/50 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">物理常数</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-gray-400">普朗克长度:</span> 1.616×10⁻³⁵m</div>
          <div><span className="text-gray-400">普朗克质量:</span> 2.176×10⁻⁸kg</div>
          <div><span className="text-gray-400">光速:</span> 299792458 m/s</div>
          <div><span className="text-gray-400">宇宙常数:</span> 10⁻¹²³</div>
        </div>
      </div>
    </div>
  );
}
