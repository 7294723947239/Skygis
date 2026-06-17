'use client';

import { useState, useEffect } from 'react';

interface Record {
  id: string;
  type: string;
  content: string;
  timestamp: string;
}

export default function AgentRecordsPanel() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      fetch('/api/agent/records')
        .then(r => r.json())
        .then(data => {
          setRecords(data.records || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [visible]);

  const handleClick = () => {
    setVisible(!visible);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="fixed bottom-20 right-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg z-[100] text-sm shadow-lg"
      >
        {visible ? '收起记录' : '查看记录'}
      </button>

      {visible && (
        <div className="fixed bottom-28 right-4 w-80 max-h-96 bg-gray-900/95 text-white rounded-lg z-[100] shadow-xl overflow-hidden">
          <div className="p-3 bg-gray-800 font-bold">智能体记录</div>
          <div className="max-h-80 overflow-y-auto p-2">
            {loading ? (
              <div className="text-gray-400 text-center py-4">加载中...</div>
            ) : records.length === 0 ? (
              <div className="text-gray-400 text-center py-4">暂无记录</div>
            ) : (
              records.map((record, i) => (
                <div key={i} className="mb-2 p-2 bg-gray-800 rounded text-xs">
                  <div className="text-gray-400 text-[10px]">{record.timestamp}</div>
                  <div className="text-purple-400">[{record.type}]</div>
                  <div className="mt-1">{record.content}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
