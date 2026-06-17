'use client';

import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  summary: string;
  evolved: boolean;
  timestamp: number;
}

export default function 采集日志区域() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // 轮询获取通知
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 3000); // 每3秒刷新
    return () => clearInterval(interval);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'evolution': return '⬆️';
      case 'risk': return '⚠️';
      case 'body': return '🪐';
      case 'discovery': return '🔬';
      default: return '📌';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'evolution': return 'border-amber-600/50 bg-amber-950/80 text-amber-200';
      case 'risk': return 'border-rose-600/50 bg-rose-950/80 text-rose-200';
      case 'body': return 'border-cyan-600/50 bg-cyan-950/80 text-cyan-200';
      default: return 'border-purple-600/50 bg-purple-950/80 text-purple-200';
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-800/60 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-slate-300">📡 采集日志</h3>
        <span className="text-[10px] text-slate-500">{notifications.length}条</span>
      </div>
      
      {loading ? (
        <div className="text-slate-600 text-[10px] text-center py-2">加载中...</div>
      ) : notifications.length === 0 ? (
        <div className="text-slate-600 text-[10px] text-center py-2">暂无采集记录</div>
      ) : (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {notifications.slice(0, 15).map((n) => (
            <div
              key={n.id}
              className={`rounded border px-2 py-1.5 text-[10px] ${getTypeColor(n.type)}`}
            >
              <div className="flex items-center gap-1">
                <span>{getTypeIcon(n.type)}</span>
                <span className="font-medium truncate flex-1">{n.title}</span>
                <span className="text-slate-400">{formatTime(n.timestamp)}</span>
                {n.evolved && <span className="text-amber-400">⚡</span>}
              </div>
              {n.summary && (
                <div className="text-[9px] opacity-70 mt-0.5 truncate pl-4">{n.summary}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
