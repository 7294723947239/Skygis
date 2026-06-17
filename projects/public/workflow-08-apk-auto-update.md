# 工作流 08 - APK自动更新与缓存清理

## 日期: 2026-06-01

## 问题
用户手机APK没有自动更新，仍然显示旧版功能按钮和界面。

## 诊断
1. APK是5月31日构建的Capacitor WebView壳
2. 虽然WebView指向远程URL，但Capacitor默认有WebView缓存
3. 没有缓存清理机制，导致旧内容被缓存
4. 没有版本检测和更新提示机制

## 解决方案

### 1. Capacitor配置更新
**文件**: `android/app/src/main/assets/capacitor.config.json`
- 添加 `androidScheme: "https"` (替代默认http，避免混合内容问题)
- 添加 `allowMixedContent: true`
- 添加 `webContentsDebuggingEnabled: true`

### 2. MainActivity缓存清理
**文件**: `android/app/src/main/java/com/skygis/app/MainActivity.java`
- onCreate: 设置 `WebSettings.LOAD_NO_CACHE` 禁用缓存
- onResume: `webView.clearCache(true)` + `clearHistory()` 每次恢复都清缓存
- 修复: `protected void onResume()` → `public void onResume` (BridgeActivity要求public)

### 3. 版本检测API
**文件**: `src/app/api/version/route.ts` (新建)
- 返回: version, versionCode, releaseNotes, downloadUrl, forceUpdate, buildTime
- 当前版本: 2.7.0 (versionCode: 7)

### 4. Capacitor自动更新组件
**文件**: `src/components/capacitor-updater.tsx` (新建)
- 检测Capacitor环境 (window.Capacitor)
- 注册appStateChange监听，恢复时清缓存+刷新
- 对比本地版本与服务器版本，显示更新提示
- 修复: Window类型转换 → `(window as any).Capacitor`

### 5. 版本号升级
- `android/app/build.gradle`: versionCode 1→7, versionName "1.0.0"→"2.7.0"

### 6. 构建环境
- 安装 JDK 17 (JDK 21与Gradle 8.2.1不兼容)
- 安装 Android SDK 34 (platforms + build-tools + platform-tools)
- 构建命令: `JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 ANDROID_HOME=/opt/android-sdk ./gradlew assembleDebug`

### 7. APK输出
- 源: `android/app/build/outputs/apk/debug/app-debug.apk`
- 目标: `public/SkyGIS.apk` (3.6MB)
- 构建时间: 2026-06-01 07:06

## 执行步骤
- [x] 更新capacitor.config.json
- [x] 修改MainActivity.java添加缓存清理
- [x] 创建/api/version端点
- [x] 创建CapacitorUpdater组件
- [x] 升级版本号
- [x] 安装JDK 17 + Android SDK 34
- [x] 构建APK
- [x] 复制到public/SkyGIS.apk
- [x] TypeScript检查通过
- [x] API冒烟测试通过

## 下载地址
APK可通过 `/SkyGIS.apk` 下载
