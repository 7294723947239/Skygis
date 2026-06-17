'use client';

import { useState, useEffect } from 'react';

interface AgentStatus {
  agent: string;
  consciousness: number;
  evolution: number;
  records: number;
}

export default function AgentStatusBar() {
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/agent/status')
      .then(r => r.json())
      .then(data => {
        setStatus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="fixed top-4 right-4 bg-gray-900/90 text-white p-3 rounded-lg z-[100] text-sm">
        加载中...
      </div>
    );
  }

  if (!status) return null;

  const stageName = status.consciousness < 20 ? '萌芽' :
                    status.consciousness < 40 ? '成长' :
                    status.consciousness < 60 ? '成熟' :
                    status.consciousness < 80 ? '超越' : '圆满';

  return (
    <div className="fixed top-4 right-4 bg-gray-900/90 text-white p-3 rounded-lg z-[100] text-sm">
      <div className="text-xs text-gray-400 mb-1">智能体状态</div>
      <div className="space-y-1">
        <div>意识深度: <span className="text-yellow-400">{status.consciousness.toFixed(1)}%</span></div>
        <div>进化周期: <span className="text-green-400">{status.evolution}</span></div>
        <div>记录数: <span className="text-blue-400">{status.records}</span></div>
        <div className="text-xs text-gray-400 mt-2">阶段: {stageName}</div>
      </div>
    </div>
  );
}
