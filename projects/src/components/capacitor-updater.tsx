'use client';

import { useEffect, useState } from 'react';

// 与 /api/version 保持一致
const CURRENT_WEB_VERSION = '2.8.0';

/**
 * Capacitor auto-update handler
 * - Detects if running inside Capacitor APK
 * - Shows dismissible update prompt when new version available
 * - DOES NOT force reload on resume (too aggressive)
 */
export function CapacitorUpdater() {
  const [isCapacitor, setIsCapacitor] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{
    serverVersion: string;
    releaseNotes: string[];
  } | null>(null);

  useEffect(() => {
    // Detect Capacitor environment
    const cap = (window as unknown as Record<string, unknown>).Capacitor;
    if (cap) {
      setIsCapacitor(true);
      checkForUpdate();
    }
  }, []);

  async function checkForUpdate() {
    try {
      const res = await fetch('/api/version');
      if (!res.ok) return;
      const data = await res.json();
      
      // Only show if server version is newer than current
      if (data.version && data.version !== CURRENT_WEB_VERSION) {
        setUpdateInfo({
          serverVersion: data.version,
          releaseNotes: data.releaseNotes || [],
        });
      }
    } catch {
      // Silently fail - offline is fine
    }
  }

  if (!isCapacitor || !updateInfo || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-cyan-700/95 backdrop-blur text-white p-3 text-sm shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-bold">SkyGIS v{updateInfo.serverVersion} 可用</p>
          <ul className="text-xs opacity-80 mt-1 space-y-0.5">
            {updateInfo.releaseNotes.slice(0, 3).map((note, i) => (
              <li key={i}>• {note}</li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="ml-2 text-white/60 hover:text-white text-lg leading-none p-1"
          aria-label="关闭"
        >
          ✕
        </button>
      </div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => window.location.reload()}
          className="bg-white text-cyan-700 px-4 py-1 rounded text-xs font-bold"
        >
          刷新更新
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="bg-white/20 text-white px-4 py-1 rounded text-xs"
        >
          稍后
        </button>
      </div>
    </div>
  );
}
