# SkyGIS 全工作流索引

> 太阳系天体地理信息系统 — 从0到v2.8的完整构建流程

## 项目概览

| 项 | 值 |
|------|------|
| 名称 | SkyGIS - 太阳系天体地理信息系统 |
| 版本 | v2.8.0 |
| 技术栈 | Next.js 16 + React 19 + TypeScript 5 + Three.js + Tailwind CSS 4 + shadcn/ui |
| 3D引擎 | Three.js (OrbitControls + 程序化纹理) |
| 数据库 | Supabase (线上) + localStorage (离线降级) |
| 2D地图 | Leaflet + 高德瓦片 |
| 高斯投影 | OpenLayers + proj4 (EPSG:4490 CGCS2000) |
| APK | Capacitor WebView壳, 3.6MB |
| 运行模式 | 在线(全功能) + 离线(本地知识引擎+localStorage) |

---

## 工作流目录

### 01. 宇宙全量物质数据库
- **文件**: [workflow-01-universe-materials.md](workflow-01-universe-materials.md)
- **核心**: 324+去重物质数据库 (94元素+15同位素+120分子+60矿物+35奇异)
- **数据文件**: `src/lib/all-cosmic-substances.ts`
- **去重逻辑**: 同一化学式只出现一次，内置校验

### 02. 宇宙3D视图渲染修复
- **文件**: [workflow-02-universe-scene-fix.md](workflow-02-universe-scene-fix.md)
- **核心**: 方块点→圆形粒子、缩小尺寸、减少密度、深度排序
- **问题**: PointsMaterial默认渲染方块，星云过大，标签过多
- **修复**: circleTexture+depthWrite:false+AdditiveBlending

### 03. 星系3D模型
- **文件**: [workflow-03-galaxy-3d-models.md](workflow-03-galaxy-3d-models.md)
- **核心**: 12种星系类型程序化纹理+3D形状
- **纹理生成器**: createGalaxyTexture(旋涡/棒旋/椭圆/不规则/星暴/环状等)
- **数据文件**: `src/lib/cosmic-catalog.ts` (120个命名天体)

### 04. 太阳系全量天体3D呈现
- **文件**: [workflow-04-solar-system-expansion.md](workflow-04-solar-system-expansion.md)
- **核心**: 8行星→39天体 (5矮行星+19卫星+6彗星)
- **数据文件**: `src/lib/solar-system-materials.ts` (25个天体300+种物质)
- **3D**: 卫星绕母星运行+轨道线+标签+公转动画

### 05. 不可见现象3D动态可视化
- **文件**: [workflow-05-invisible-phenomena.md](workflow-05-invisible-phenomena.md)
- **核心**: 磁场→粒子流、太阳风→明亮径向流、辐射带→粒子环、暗物质→流动粒子云
- **改进**: 从静态几何体→动态发光粒子流系统
- **默认**: 关闭(⚡场按钮切换)

### 06. 2万亿星系与宇宙大尺度结构
- **文件**: [workflow-06-universe-large-scale.md](workflow-06-universe-large-scale.md)
- **核心**: 程序化生成宇宙大尺度结构
- **规模**: 15000星系点+3000星云+8000恒星+5空洞+3纤维
- **搜索**: 全局搜索(天体/分类/物质三维度)

### 07. 自主进化智能体
- **文件**: [workflow-07-autonomous-agent.md](workflow-07-autonomous-agent.md)
- **核心**: 手动→自主(感知/采集/总结/进化/迭代)
- **等级**: 初始探测器→初级勘探者→空间分析师→星际科学家→宇宙学者→全知观测者
- **数据结构**: Discovery+KnowledgeNode+AgentLevel+行为日志

### 08. APK自动更新
- **文件**: [workflow-08-apk-auto-update.md](workflow-08-apk-auto-update.md)
- **核心**: Capacitor WebView壳+版本检测+缓存清理
- **API**: /api/version → 版本号+更新日志+下载链接
- **组件**: CapacitorUpdater(检测新版本→更新提示)

### 09. 离线模式
- **文件**: [workflow-09-offline-mode.md](workflow-09-offline-mode.md)
- **核心**: 所有功能本地化，零云端依赖
- **新建**: local-knowledge-engine.ts(8知识域)+offline-storage.ts(localStorage CRUD)
- **改造**: auth-context(访客模式)+gis-context(降级)+spatial-agent(本地引擎)
- **离线功能**: 3D视图/物质搜索/智能问答/CRUD/认证/坐标转换

### 10. 物质3D可视化
- **文件**: [workflow-10-substance-3d.md](workflow-10-substance-3d.md)
- **核心**: 行星5层3D物质可视化
- **层**: 大气层(气态壳)→表面云(8球体)→内部(3层嵌套)→海洋(蓝壳)→特殊特征(标记点)
- **着色**: N₂蓝白/CO₂黄褐/CH₄蓝绿/H₂淡蓝/SO₂黄

### 11. 太阳系视觉修复
- **文件**: [workflow-11-solar-visual-fix.md](workflow-11-solar-visual-fix.md)
- **核心**: 行星增大50%+标签+不可见现象默认关闭+轨道线增强
- **UI**: 面板重叠修复+更新通知关闭按钮+版本号统一

---

## 数据文件对照

| 文件 | 内容 | 数量 |
|------|------|------|
| `src/lib/all-cosmic-substances.ts` | 全宇宙去重物质库 | 324+种 |
| `src/lib/cosmic-taxonomy.ts` | 宇宙天体分类体系 | 11大类/60+类型/412物质 |
| `src/lib/cosmic-catalog.ts` | 命名天体目录 | 120个(3D位置+详情) |
| `src/lib/solar-system-materials.ts` | 太阳系天体物质 | 25天体/300+种 |
| `src/lib/universe-materials.ts` | 宇宙环境物质 | 459种(20环境) |
| `src/lib/local-knowledge-engine.ts` | 本地知识引擎 | 8知识域/模板生成 |
| `src/lib/offline-storage.ts` | 离线存储层 | localStorage CRUD |

## 3D场景统计

| 视图 | 元素 | 数量 |
|------|------|------|
| 地球 | 3D球体+大气+云层 | 3层 |
| 月球 | 3D球体 | 1层 |
| 太阳系 | 行星+卫星+矮行星+彗星+小行星带 | 39+天体 |
| 太阳系(物质) | 大气壳+表面云+内部层+海洋 | 5层/天体 |
| 太阳系(现象) | 磁场粒子+太阳风+辐射带+CME+射线+黄道光 | 6类 |
| 宇宙 | 星系+星云+恒星+暗物质+CMB+星际介质 | 3万+点 |
| 宇宙(天体) | 120个命名天体3D模型 | 12种类型纹理 |

## 版本历史

| 版本 | 日期 | 核心更新 |
|------|------|----------|
| v1.0 | 2026-05-31 | 初始版本(8行星+基础GIS) |
| v2.6 | 2026-05-31 | 宇宙视图+搜索+物质库 |
| v2.7 | 2026-06-01 | 自主智能体+不可见现象+APK更新 |
| v2.8 | 2026-06-01 | 离线模式+物质3D可视化+视觉修复 |
