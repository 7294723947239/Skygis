/**
 * SkyGIS App Update Module
 * Bridges Capacitor plugin with frontend for in-app updates
 */

interface AppUpdateResult {
  hasUpdate: boolean;
  currentVersion: string;
  currentVersionCode: number;
  serverVersion: string;
  serverVersionCode: number;
  downloadUrl: string;
  forceUpdate: boolean;
  releaseNotes: string;
}

interface VersionInfo {
  version: string;
  versionCode: number;
  packageName: string;
}

declare global {
  interface Window {
    AppUpdate?: {
      checkUpdate: (options: { versionUrl: string }) => Promise<AppUpdateResult>;
      getCurrentVersion: () => Promise<VersionInfo>;
      downloadAndInstall: (options: { downloadUrl: string }) => Promise<{ status: string }>;
    };
  }
}

const VERSION_API = '/api/app-version';

export async function checkForUpdate(): Promise<AppUpdateResult | null> {
  try {
    // Get base URL from current location
    const baseUrl = window.location.origin;
    const versionUrl = `${baseUrl}${VERSION_API}`;

    // Try native Capacitor plugin first (when running in APK)
    if (window.AppUpdate) {
      const result = await window.AppUpdate.checkUpdate({ versionUrl });
      return result;
    }

    // Fallback: web-based update check (when running in browser/PWA)
    const response = await fetch(VERSION_API);
    if (!response.ok) return null;

    const serverInfo = await response.json();
    return {
      hasUpdate: false, // In browser, always latest
      currentVersion: serverInfo.version,
      currentVersionCode: serverInfo.versionCode,
      serverVersion: serverInfo.version,
      serverVersionCode: serverInfo.versionCode,
      downloadUrl: serverInfo.downloadUrl,
      forceUpdate: false,
      releaseNotes: serverInfo.releaseNotes?.join('\n') || '',
    };
  } catch (e) {
    console.error('Update check failed:', e);
    return null;
  }
}

export async function getCurrentAppVersion(): Promise<VersionInfo | null> {
  try {
    if (window.AppUpdate) {
      return await window.AppUpdate.getCurrentVersion();
    }
    const response = await fetch(VERSION_API);
    if (!response.ok) return null;
    const info = await response.json();
    return {
      version: info.version,
      versionCode: info.versionCode,
      packageName: info.packageName,
    };
  } catch {
    return null;
  }
}

export async function downloadAndInstallUpdate(downloadUrl: string): Promise<boolean> {
  try {
    if (window.AppUpdate) {
      await window.AppUpdate.downloadAndInstall({ downloadUrl });
      return true;
    }
    // Fallback: open download URL in browser
    window.open(downloadUrl, '_blank');
    return true;
  } catch {
    return false;
  }
}
