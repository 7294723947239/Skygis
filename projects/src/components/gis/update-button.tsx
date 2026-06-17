'use client';

import { useState, useEffect } from 'react';
import { checkForUpdate, downloadAndInstallUpdate, getCurrentAppVersion } from '@/lib/app-update';

interface UpdateButtonProps {
  className?: string;
}

export default function UpdateButton({ className = '' }: UpdateButtonProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [checking, setChecking] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{
    version: string;
    downloadUrl: string;
    notes: string[];
    forceUpdate: boolean;
    fileSize: string;
    updateTime: string;
  } | null>(null);
  const [currentVersion, setCurrentVersion] = useState('--');
  const [showPanel, setShowPanel] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  // Get current version on mount
  useEffect(() => {
    getCurrentAppVersion().then(v => {
      if (v) setCurrentVersion(v.version);
    });
  }, []);

  const handleCheckUpdate = async () => {
    setChecking(true);
    try {
      const result = await checkForUpdate();
      setLastCheckTime(new Date());
      if (result) {
        // In browser, always show latest version info
        const serverRes = await fetch('/api/app-version');
        const serverData = serverRes.ok ? await serverRes.json() : null;
        const hasNewVersion = serverData ? serverData.versionCode > (result.currentVersionCode || 0) : false;
        
        setUpdateAvailable(hasNewVersion);
        setUpdateInfo({
          version: serverData?.version || result.serverVersion,
          downloadUrl: serverData?.downloadUrl || result.downloadUrl,
          notes: serverData?.releaseNotes || (result.releaseNotes ? result.releaseNotes.split('\n') : []),
          forceUpdate: serverData?.forceUpdate || result.forceUpdate,
          fileSize: serverData?.fileSize || '',
          updateTime: serverData?.updateTime || '',
        });
        setShowPanel(true);
      }
    } catch (e) {
      console.error('Check update failed:', e);
    }
    setChecking(false);
  };

  const handleUpdate = async () => {
    if (!updateInfo) return;
    setDownloading(true);
    setDownloadProgress(0);

    // Simulate progress for web fallback
    const progressInterval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      await downloadAndInstallUpdate(updateInfo.downloadUrl);
      setDownloadProgress(100);
    } catch {
      // ignore
    }
    clearInterval(progressInterval);
    setTimeout(() => {
      setDownloading(false);
      setDownloadProgress(0);
    }, 1500);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Update button */}
      <button
        onClick={handleCheckUpdate}
        title="检查更新"
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white relative"
      >
        {checking ? (
          <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
        )}
        <span className="hidden sm:inline">v{currentVersion}</span>
        {updateAvailable && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500" />
          </span>
        )}
      </button>

      {/* Update panel */}
      {showPanel && (
        <div className="absolute top-full right-0 mt-2 z-[100] w-[calc(100vw-32px)] sm:w-80 rounded-xl border border-slate-700/50 bg-slate-800/95 backdrop-blur-md shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-900/50">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span className="text-sm font-bold text-slate-200">SkyGIS 更新</span>
            </div>
            <button onClick={() => setShowPanel(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {updateAvailable && updateInfo ? (
            <div className="p-4">
              {/* New version badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                  NEW
                </span>
                <span className="text-sm font-bold text-amber-300">v{updateInfo.version}</span>
                <span className="text-[10px] text-slate-500">← v{currentVersion}</span>
              </div>

              {/* Release notes */}
              {updateInfo.notes.length > 0 && (
                <div className="mb-4">
                  <div className="text-[10px] text-slate-500 mb-1.5 font-medium uppercase tracking-wider">更新内容</div>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {updateInfo.notes.map((note, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <svg className="h-3 w-3 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Meta info */}
              <div className="flex items-center gap-3 mb-4 text-[10px] text-slate-500">
                {updateInfo.fileSize && (
                  <span className="flex items-center gap-1">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    {updateInfo.fileSize}
                  </span>
                )}
                {updateInfo.updateTime && (
                  <span className="flex items-center gap-1">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(updateInfo.updateTime).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Download progress */}
              {downloading && (
                <div className="mb-3">
                  <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-amber-400 transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 text-center">
                    {downloadProgress < 100 ? `下载中 ${Math.round(downloadProgress)}%` : '下载完成，正在安装...'}
                  </div>
                </div>
              )}

              {/* Update button */}
              <button
                onClick={handleUpdate}
                disabled={downloading}
                className="w-full rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
              >
                {downloading ? '下载更新中...' : '立即更新'}
              </button>

              {updateInfo.forceUpdate && (
                <div className="mt-2 text-center text-[10px] text-amber-400">此更新为强制更新</div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 mb-3">
                <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm font-bold text-slate-200 mb-1">已是最新版本</div>
              <div className="text-xs text-slate-500">当前版本 v{currentVersion}</div>
              {lastCheckTime && (
                <div className="text-[10px] text-slate-600 mt-2">
                  上次检查: {lastCheckTime.toLocaleTimeString()}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-700/50 bg-slate-900/30 flex items-center justify-between">
            <span className="text-[10px] text-slate-600">SkyGIS v{currentVersion}</span>
            <button
              onClick={handleCheckUpdate}
              disabled={checking}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors disabled:text-slate-600"
            >
              {checking ? '检查中...' : '重新检查'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
