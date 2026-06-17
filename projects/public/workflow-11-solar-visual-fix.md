# 工作流 11: 太阳系视觉修复

## 日期: 2026-06-01

## 问题
用户反馈太阳系3D视图视觉混乱：
1. 行星过小，难以辨认
2. 没有行星名称标签
3. 不可见现象（磁场线/太阳风等）遮挡视野
4. 轨道线不明显
5. 左侧面图层面板与3D地图重叠

## 修复措施

### 行星尺寸
- planetSceneRadius返回值×1.5，所有行星视觉增大50%
- 太阳尺寸从3.0→3.9，增大30%

### 标签系统
- 每颗行星添加中文名称标签（白色半透明）
- 卫星名称标签（白色偏蓝色调区分行星）
- 矮行星已有标签保留

### 不可见现象控制
- showInvisiblePhenomena默认值改为false
- 需手动点击⚡场按钮开启，避免遮挡视野

### 轨道线
- 行星轨道线: opacity 0.15→0.35, color 0x444466→0x8888bb
- 矮行星轨道线: opacity 0.08→0.25, color 0x553322→0xcc7744

### UI面板重叠修复
- dashboard/page.tsx: 3D模式下隐藏左右面板（图层/要素/浮动按钮）
- 避免GlobeMap内部面板与Dashboard外部面板重叠

### 更新通知无法关闭
- CapacitorUpdater添加关闭按钮（×）和"稍后"按钮
- 关闭后24小时内不再显示同一版本
- 移除MainActivity.java中onResume过度缓存清理
- 改用LOAD_DEFAULT缓存模式

## 涉及文件
- src/components/gis/globe-map.tsx
- src/app/dashboard/page.tsx
- src/components/capacitor-updater.tsx
- src/components/gis/status-bar.tsx
- android/app/src/main/java/com/skygis/app/MainActivity.java
