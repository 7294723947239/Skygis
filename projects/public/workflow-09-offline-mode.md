# 工作流09: 离线模式 - 所有功能本地化

## 问题
用户指出：积分用完或断网后，所有功能失效。物质分析、知识对话等依赖云端API，APK无法独立运行。

## 云端依赖分析

| 依赖 | 用途 | 离线替代方案 |
|------|------|-------------|
| Supabase Auth | 用户登录认证 | 离线访客模式(GuestProfile) |
| Supabase DB | 图层/要素CRUD | localStorage (OfflineStorage) |
| /api/spatial-agent | LLM问答 | 本地知识引擎(规则匹配) |
| /api/wander-agent | 自主游荡 | 前端本地处理 |
| /api/coords | 坐标转换 | 前端计算(已有) |
| /api/solar | 天体数据 | 前端静态数据(已有) |

## 实施步骤

### [x] 1. 创建本地知识引擎 (local-knowledge-engine.ts)
- 8个知识域: 宇宙学/太阳系/天体物理/物质科学/引力场/轨道力学/遥感/行星地质
- 规则匹配: 关键词→知识域→模板生成
- 5种回答类型: 物质分析/天体信息/物理计算/比较分析/一般知识
- 完全前端运行，0网络请求

### [x] 2. 改造认证为离线模式 (auth-context.tsx)
- 新增GuestProfile: {id:'guest', email:'guest@skygis.local', ...}
- loginAsGuest(): 一键免登录进入
- Supabase连接失败→自动降级到GuestProfile
- 保留Supabase登录能力(有网时正常用)

### [x] 3. 改造登录页 (page.tsx)
- 添加"离线访客模式"按钮
- 离线模式下隐藏Supabase登录表单
- 自动检测网络状态

### [x] 4. 创建离线存储层 (offline-storage.ts)
- OfflineLayer/OfflineFeature类型定义
- localStorage CRUD操作
- generateId()本地ID生成
- 与Supabase格式兼容

### [x] 5. 改造GIS数据层 (gis-context.tsx)
- 所有Supabase调用增加try/catch
- 失败→自动降级到localStorage
- 混合模式: 有网用云端, 无网用本地
- 数据不丢失

### [x] 6. 改造空间智能体面板 (spatial-agent-panel.tsx)
- 问答功能: fetch(/api/spatial-agent)→localKnowledgeEngine.query()
- 0网络延迟, 即时响应
- 答案来源: 前端324+物质库+天体数据+知识模板

### [x] 7. APK重构建
- 版本: 2.7.0→2.8.0
- WebView缓存清理确保加载最新代码

## 离线功能对照

| 功能 | 离线可用 | 替代方案 |
|------|---------|---------|
| 3D太阳系/宇宙视图 | ✅ | 前端Three.js |
| 物质浏览/搜索 | ✅ | 前端静态数据 |
| 坐标转换 | ✅ | 前端计算 |
| 智能体问答 | ✅ | 本地知识引擎 |
| 智能体自主进化 | ✅ | 前端逻辑 |
| 磁场/太阳风/暗物质 | ✅ | 前端粒子系统 |
| 图层/要素CRUD | ✅ | localStorage |
| 登录认证 | ✅ | 访客模式 |
| Supabase云存储 | ❌→降级 | 自动降级到本地 |
