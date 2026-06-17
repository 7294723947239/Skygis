'use client';

import { useState, useEffect } from 'react';
import COSMIC_FORMULA_DATABASE from '@/lib/cosmic-formulas';

interface FormulaKnowledgePanelProps {
  agentLevel?: number;
  agentConsciousness?: number;
}

export default function FormulaKnowledgePanel({ 
  agentLevel = 1, 
  agentConsciousness = 0 
}: FormulaKnowledgePanelProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFormula, setExpandedFormula] = useState<string | null>(null);

  // 根据智能体等级解锁不同知识
  const getUnlockedCategories = () => {
    const unlocked: string[] = ['开普勒定律', '万有引力'];
    if (agentLevel >= 2) unlocked.push('轨道力学', '二体问题');
    if (agentLevel >= 3) unlocked.push('天体物理', '相对论');
    if (agentLevel >= 4) unlocked.push('宇宙学', '核物理');
    if (agentLevel >= 5) unlocked.push('宇宙距离阶梯');
    return unlocked;
  };

  const unlockedCategories = getUnlockedCategories();

  const categories = [
    { id: 'all', name: '全部', icon: '∞' },
    { id: '开普勒', name: '开普勒定律', icon: '🔄' },
    { id: '万有引力', name: '万有引力', icon: '🌌' },
    { id: '轨道', name: '轨道力学', icon: '🛸' },
    { id: '宇宙学', name: '宇宙学', icon: '🌠' },
    { id: '天体', name: '天体物理', icon: '⭐' },
    { id: '相对论', name: '相对论', icon: '⏱️' },
    { id: '核', name: '核物理', icon: '⚛️' }
  ];

  const getFormulas = () => {
    const all = COSMIC_FORMULA_DATABASE.getAllFormulas();
    
    if (searchTerm) {
      return all.filter(f => 
        f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.formula?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeCategory === 'all') return all;

    return all.filter(f => {
      const name = f.name || '';
      const desc = f.description || '';
      return name.includes(activeCategory) || desc.includes(activeCategory);
    });
  };

  const formulas = getFormulas();

  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg max-w-4xl mx-auto">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">🧠 宇宙公式知识库</h2>
        <div className="text-sm text-gray-400">
          智能体 Lv.{agentLevel} | 意识 {agentConsciousness}%
        </div>
      </div>

      {/* 搜索 */}
      <input
        type="text"
        placeholder="搜索公式..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 mb-4 text-white placeholder-gray-500"
      />

      {/* 分类标签 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id === 'all' ? 'all' : cat.name)}
            className={`px-3 py-1 rounded text-sm ${
              activeCategory === (cat.id === 'all' ? 'all' : cat.name)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* 公式列表 */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {formulas.map((formula, index) => {
          const isLocked = !unlockedCategories.some(cat => 
            formula.name?.includes(cat) || formula.description?.includes(cat)
          ) && !formula.name;

          if (isLocked && agentLevel < 3) return null;

          return (
            <div
              key={index}
              className={`bg-gray-800 rounded-lg p-3 ${
                isLocked ? 'opacity-50 border border-yellow-500' : ''
              }`}
            >
              <div 
                className="flex justify-between items-start cursor-pointer"
                onClick={() => setExpandedFormula(
                  expandedFormula === formula.name ? null : formula.name || String(index)
                )}
              >
                <div>
                  <h3 className="font-semibold text-blue-400">
                    {formula.name || `公式 ${index + 1}`}
                    {isLocked && ' 🔒'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{formula.description}</p>
                </div>
                <span className="text-gray-400">
                  {expandedFormula === (formula.name || String(index)) ? '▲' : '▼'}
                </span>
              </div>

              {expandedFormula === (formula.name || String(index)) && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <code className="block bg-gray-900 p-3 rounded text-green-400 font-mono text-sm overflow-x-auto">
                    {formula.formula || formula.reaction || formula.totalEnergy || formula.steps?.[0]?.reaction}
                  </code>
                  
                  {formula.variables && (
                    <div className="mt-3 text-sm">
                      <h4 className="text-gray-400 mb-1">变量说明：</h4>
                      <ul className="space-y-1">
                        {Object.entries(formula.variables).map(([key, value]) => (
                          <li key={key} className="text-gray-300">
                            <span className="text-yellow-400">{key}</span>: {value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 统计 */}
      <div className="mt-4 pt-4 border-t border-gray-700 text-sm text-gray-400 flex justify-between">
        <span>共 {formulas.length} 个公式</span>
        <span>知识库版本 {COSMIC_FORMULA_DATABASE.version}</span>
      </div>
    </div>
  );
}
