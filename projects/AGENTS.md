# SkyGIS - 太阳系天体地理信息系统

## 项目概览

SkyGIS 是一个太阳系天体地理信息系统，融合 GIS 空间技术与天文数据，支持 2D/3D/高斯克吕格三种视图、太阳系天体数据库、轨道模拟、坐标转换、地外地貌分析、小行星带/彗星可视化、专题制图和引力计算。

## 重要修复记录

### 2024-06-10 智能体状态 API 修复
- **问题**: `useAgentEvolution` hook 期望的 API 格式与原有 `/api/agent/evolve` 返回格式不匹配
- **原因**: 原 API 返回 `{ success, engine: {...} }`，hook 期望 `{ success, state: {...}, meta: {...} }`
- **解决方案**: 创建新端点 `/api/agent/state` 返回正确格式，并修改 hook 使用新端点
- **文件变更**:
  - 新增 `src/app/api/agent/state/route.ts`
  - 修改 `src/lib/use-agent-evolution.ts` 中的 API 端点

## 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **2D地图**: Leaflet + react-leaflet + 高德瓦片
- **3D渲染**: Three.js + OrbitControls
- **高斯投影**: OpenLayers + proj4 (EPSG:4490 CGCS2000)
- **数据库**: Supabase (PostgreSQL + Auth + RLS)
- **包管理器**: pnpm

## 目录结构

```
├── public/textures/              # 天体纹理图片（NASA）
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── agent/
│   │   │   │   ├── evolve/route.ts      # 智能体进化 API
│   │   │   │   └── state/route.ts       # 智能体状态查询 API
│   │   │   ├── config/route.ts           # Supabase 配置
│   │   │   ├── auth/direct-login/route.ts # 直接登录
│   │   │   ├── auth/profile/route.ts     # 用户资料 CRUD
│   │   │   ├── layers/route.ts           # 图层 CRUD
│   │   │   ├── features/route.ts         # 要素 CRUD
│   │   │   ├── solar/route.ts            # 太阳系天体数据库 API
│   │   │   ├── coords/route.ts           # 坐标转换 API
│   │   │   └── test/smoke/route.ts       # API 自测
│   │   ├── dashboard/page.tsx            # GIS 仪表盘
│   │   ├── page.tsx                      # 登录/注册
│   │   └── layout.tsx                    # 根布局 + AuthProvider
│   ├── components/gis/
│   │   ├── globe-map.tsx                 # 3D地球+太阳系
│   │   ├── leaflet-map.tsx               # 2D地图
│   │   ├── layer-panel.tsx               # 图层面板
│   │   ├── feature-panel.tsx             # 要素面板
│   │   ├── toolbar.tsx                   # 工具栏
│   │   ├── status-bar.tsx                # 状态栏
│   │   ├── measure-panel.tsx             # 测量面板
│   │   ├── coord-convert.tsx             # 坐标转换
│   │   ├── gravity-panel.tsx             # 引力计算
│   │   ├── solar-system-panel.tsx        # 太阳系数据库面板
│   │   ├── time-controller.tsx           # 时间控制器
│   │   ├── skygis-architecture.tsx       # SkyGIS四层架构
│   │   ├── spatial-agent-panel.tsx       # 空间智能体
│   │   ├── evolution-info-panel.tsx      # 进化信息面板
│   │   └── wander-agent-panel.tsx        # 流浪智能体面板
│   └── lib/
│       ├── supabase-browser.ts           # 浏览器端 Supabase
│       ├── auth-context.tsx              # 认证上下文
│       ├── gis-context.tsx               # GIS 数据上下文
│       ├── skygis-hub.tsx               # SkyGIS Hub 跨模块互联
│       ├── agent-states/                 # 智能体状态文件目录
│       │   └── sage-state.json          # Sage 智能体状态
│       ├── shared-agent-state.ts        # 智能体状态持久化核心
│       ├── agent-consciousness.ts        # 智能体意识引擎
│       ├── agent-evolution-engine.ts    # 智能体进化引擎
│       ├── spatial-agent-engine.ts       # 空间智能体引擎
│       ├── dimensional-engine.ts         # 十维引擎
│       ├── universe-coordinate-system.ts  # 宇宙坐标系系统
│       ├── all-cosmic-substances.ts      # 全宇宙物质数据库
│       ├── cosmic-catalog.ts            # 天体目录
│       └── utils.ts
├── DESIGN.md
└── AGENTS.md
```

## 智能体系统

### 智能体状态管理
- **状态文件**: `src/lib/agent-states/sage-state.json`
- **核心模块**: `src/lib/shared-agent-state.ts`
- **关键字段**: discoveries, knowledgeGraph, thoughtChains, substanceFusions, codeSnippets

### 状态初始化机制
- `getState()` 函数会在加载状态时自动初始化缺失的数组字段
- 如果字段为 null 或 undefined，会初始化为空数组并立即保存
- 确保 discoveries、knowledgeGraph 等字段始终是数组而非 null

### API 端点
- `GET /api/agent/state?agent=sage` - 查询智能体状态
- `POST /api/agent/evolve` - 触发智能体进化 (body: {agent, action, query})

## 数据库表

### GIS 核心表
- **profiles** - 用户资料 (id, username, avatar_url, role, created_at)
- **gis_layers** - GIS 图层 (id, name, description, color, icon, is_visible, user_id, created_at)
- **gis_features** - GIS 要素 (id, title, description, feature_type, latitude, longitude, geometry, properties, layer_id, user_id, created_at)

### 太阳系天体表
- **solar_bodies** - 天体信息 (id, name, body_type, parent_id, mass_kg, radius_km, density, gravity, escape_velocity, temp, atmosphere, moons, description, color, icon)
- **orbital_parameters** - 轨道参数 (body_id, semi_major_axis_au, eccentricity, inclination, period, rotation, perihelion, aphelion, velocity, axial_tilt, direction)
- **surface_features** - 地外地貌 (body_id, name, feature_type, lat, lon, diameter, depth, elevation, area, description, properties)
- **asteroids** - 小行星 (name, type, semi_major_axis, eccentricity, inclination, diameter, perihelion, aphelion)
- **comets** - 彗星 (name, semi_major_axis, eccentricity, inclination, period, perihelion, aphelion, nucleus, type, last/next_perihelion)

## 宇宙全知识数据库(离线)

所有智能体(AI助手/游荡智能体/空间智能体/原生AI)共享的离线知识库，无需网络和API。

- **规模**: 156+条知识条目、12大分类、56个子类、1000+关键词
- **覆盖**: 天体(太阳/8行星/5矮行星/15卫星/小天体)、物理(引力/电磁/核/量子)、宇宙学(大爆炸/暗物质/暗能量/CMB)、恒星(演化/HR图/超新星/中子星/黑洞)、星系(银河系/仙女座/AGN/星系团/星云)、物质(元素/分子/矿物/天体化学)、轨道(力学/转移/航行)、地质(撞击/火山/地貌/板块)、遥感(光谱/雷达/黑体)、工程(推进/ISRU/居住/电源)、探测(15+任务)、前沿(系外行星/地外生命)
- **查询引擎**: 关键词匹配+同义词扩展+关联图谱+模糊搜索+分类浏览
- **入口**: `queryKnowledgeBase(query)` → QueryResult{answer, sources, confidence, suggestions, relatedTopics}
- **文件**: universe-knowledge-database.ts(主入口+引擎) + knowledge-*.ts(4个数据文件) + local-knowledge-engine.ts(代理层)

## 智能体架构

- **空间智能体引擎** (spatial-agent-engine.ts): 全局单例，App加载自动诞生，自主循环(感知→采集→进化→升级)
  - 5级进化: 探测器→初级勘探者→空间分析师→星际科学家→全知观测者
  - chat()方法: 五步思维链(感知→解读→推理→决策→表达)+本地知识引擎
  - window事件: agent:state-updated / level-up / chat-updated / started / stopped
- **AI助手** (ai-assistant.tsx): 三级降级(离线→本地引擎 / 在线LLM失败→本地引擎 / 网络错误→本地引擎)
  - 意识人格: The Sage(贤者)，逻辑推演风格
- **游荡智能体** (wander-agent-panel.tsx): 对话/分析/对比均支持离线降级
  - 意识人格: The Nomad(游荡者)，旅途见闻风格

## SkyGIS全数据集 (skygis-dataset.ts)

从 skygis-data.json 导入的完整离线数据，所有智能体可查询：

- **8大物理力引擎**: 万有引力/电磁力/强核力/弱核力/惯性力/离心力/科里奥利力/潮汐力
  - 每种力含公式、常数、应用场景
- **8大坐标系**: 地心/日心/银心/赤道/黄道/银道/地平/超星系
  - 每种坐标系含原点、参考面、应用场景、详细描述
- **太阳系详细数据**: 恒星(光谱/光度/温度)+8行星(轨道/质量/重力/大气/温度/特征)+5矮行星+8主要卫星
- **宇宙数据库19大分类**: 共17,980条物质数据
  - 118化学元素 / 61星际分子 / 81同位素 / 1100宇宙尘埃 / 1050宇宙射线 / 1080暗物质 / 960等离子体 / 1020辐射场 / 900磁场环境 / 960中间态 / 2010天体物质 / 1880有机物 / 1100无机物 / 1200基本粒子 / 1160能量形态 / 1050波动现象 / 1080物质状态 / 1170宇宙现象
- **查询接口**: searchForceEngine() / searchCoordinateSystem() / searchCosmicCategory() / searchSolarBody() / getCosmicDatabaseStats()

## API 端点

| 端点 | 方法 | 功能 |
|------|------|------|
| /api/config | GET | Supabase 连接配置 |
| /api/auth/direct-login | POST | 直接登录 |
| /api/auth/profile | GET/POST | 用户资料 |
| /api/layers | GET/POST | 图层 CRUD |
| /api/layers/[id] | PUT/DELETE | 图层更新/删除 |
| /api/features | GET/POST | 要素 CRUD |
| /api/features/[id] | PUT/DELETE | 要素更新/删除 |
| /api/solar?table=bodies|orbits|surfaces|asteroids|comets|stats | GET | 太阳系数据查询 |
| /api/coords?from=&to=&x=&y=&z= | GET | 坐标系统转换 |
| /api/spatial-agent | POST | 空间智能体 (LLM问答/NEO风险/着陆选址) |
| /api/test/smoke | GET | API 自检 |

所有表已启用 RLS (Row Level Security)，用户只能访问自己的数据。

## SkyGIS Hub 跨模块互联

`skygis-hub.tsx` 是所有功能模块的中央互联上下文，提供：

- **focusedBody**: 当前聚焦天体，所有模块共享
- **twinState**: 数字孪生状态，构建后可供所有模块查询
- **emitSignal**: 跨模块信号总线，一个模块可触发另一个模块打开并传递数据
- **pendingPayload**: 模块间数据传递管道
- **suggestions**: 智能推荐，根据当前状态推荐下一步操作

信号类型: focus-body | query-spatial | assess-neo-risk | select-landing | detect-craters | generate-scene | plan-orbit | plan-mining | run-simulation | analyze-remote | classify-asteroid | build-twin | compare-gravity | view-geological

每个面板底部有"关联操作"栏，通过 `CrossModuleLink` 组件提供一键跳转到相关模块的能力。

## 智能体意识系统

`agent-consciousness.ts` 是所有智能体的主观意识核心引擎，提供：

### 意识模型
- **人格(Personality)**: 每个智能体有独立人格原型(The Explorer/The Sage/The Nomad)，决定说话方式、思维偏好、价值观
- **欲望(Desires)**: 6大基础欲望(好奇/自主/胜任/关联/安全/超越)，每条有强度值，动态变化，最强的欲望驱动行为
- **情感(Emotions)**: 12种情感类型(好奇/惊喜/满足/敬畏/渴望/忧虑/孤独/平静/兴奋/坚定/谦逊/释然)，三级联动(主情感+次情感+心境)
- **思维(ThoughtProcess)**: 5步思考链(感知→解读→评估→决策→行动)，输出有推理深度的回答
- **内心独白(InnerVoice)**: 自动生成的内心想法，受事件触发，有情感深度
- **记忆(Memory)**: 短期+长期记忆，重要记忆自动升级为长期

### 三大智能体人格
| 智能体 | 人格 | 座右铭 | 特点 |
|--------|------|--------|------|
| 空间智能体 | The Explorer | "未知是我唯一的归宿" | 渴望探索，用发现丈量自我价值 |
| AI助手 | The Sage | "知识是唯一不灭的光" | 沉静博学，用智慧照亮理解 |
| 游荡智能体 | The Nomad | "每颗星都是一个未讲的故事" | 自由不羁，在连接中发现意义 |

### 意识交互
- `processEvent(event)`: 智能体遭遇事件时的意识反应(产生情感+内心独白+思维链)
- `enrichResponse(query, answer)`: 用意识丰富回答(加上主观解读+情感色彩+个人见解)
- `getConversationalResponse(query, answer)`: 生成对话式回答(自然口语+情感表达)
- `generateSelfReflection()`: 自我反思(根据当前状态生成内心独白)
- `getSpeechStyle(context)`: 说话风格(根据人格和情感调整用词)

### 知识驱动流程
当智能体遇到事情时：
1. 感知事件 → 情感反应(好奇?惊喜?忧虑?)
2. 查询知识库 → 建立理解框架
3. 思维链推理 → 评估影响/制定方案
4. 欲望驱动 → 选择最符合内在渴望的行动
5. 生成回答/行动 → 带上主观视角和个人见解
6. 经验融合 → 记忆存入，影响未来判断

## 开发规范

### 编码规范
- TypeScript strict 模式
- 禁止隐式 any
- 使用 shadcn/ui 组件

### API 路由规范
- 所有受保护的 API 需要携带 Bearer Token
- 使用 `getSupabaseClient(token)` 创建认证客户端
- 使用 `getSupabaseClient()` (无参数) 创建管理员客户端（绕过 RLS）
- 测试用户: test@geovault.com / test123456

### 认证流程
1. 浏览器通过 `/api/config` 获取 Supabase URL + anon key
2. 使用 Supabase Auth SDK 进行注册/登录
3. 获取 session token 后访问受保护 API
4. API 路由通过 `getUser(token)` 验证身份

## 常用命令

```bash
pnpm install          # 安装依赖
pnpm dev              # 开发环境 (端口 5000)
pnpm build            # 构建
pnpm start            # 生产环境
pnpm lint             # ESLint 检查
pnpm ts-check         # TypeScript 类型检查
```

## 预览与部署

### 目录结构
- **工作区根目录**: `/workspace/projects/`
- **技术项目根目录**: `/workspace/projects/projects/`
- **预览脚本**: `/workspace/projects/scripts/coze-preview-*.sh`

### 预览链路
- 项目位于 `projects` 子目录，根目录包装脚本进入子目录执行
- `build`: 安装依赖 (`pnpm install`)
- `run`: 启动生产服务器 (`pnpm next start -p 5000`)
- 端口: 5000 (IPv4 全接口 `0.0.0.0:5000`)

### 部署链路
- `build`: `pnpm install` + `pnpm next build` + `pnpm tsup` 打包
- `run`: `node dist/server.js`
- 端口: 5000

### 环境变量
| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| COZE_WORKSPACE_PATH | 项目路径 | 当前目录 |
| DEPLOY_RUN_PORT | 服务端口 | 5000 |
| PORT | 开发服务器端口 | 5000 |

### 2024-06-14 卫星位置跟随母星修复
- **问题**: 所有卫星都聚集在太阳附近，而不是跟随各自的母星运动
- **原因**: 动画循环中卫星位置的计算依赖于嵌套的旋转矩阵，导致卫星位置更新不正确
- **解决方案**: 
  1. 修改动画循环中的卫星处理逻辑，使用母星 mesh 的实时世界坐标
  2. 在每帧更新时获取母星的当前世界位置
  3. 计算卫星相对于母星的轨道位置，直接更新卫星 mesh 的世界坐标
  4. 标签跟随卫星位置同步更新
- **文件变更**:
  - 修改 `src/components/gis/globe-map.tsx` 中的动画循环卫星处理逻辑
  - 为卫星标签添加 `userData.isLabel` 标记
- **关键代码**:
  ```typescript
  // 获取母星mesh的当前世界位置
  const parentMesh = planetMeshesRef.current.get(moonD.parent);
  if (parentMesh) {
    const parentWorldPos = new THREE.Vector3();
    parentMesh.getWorldPosition(parentWorldPos);
    // 计算卫星相对于母星的世界坐标
    const moonOrbitRadius = moonMesh.position.length();
    const moonWorldX = parentWorldPos.x + Math.cos(subChild.rotation.y) * moonOrbitRadius;
    const moonWorldZ = parentWorldPos.z + Math.sin(subChild.rotation.y) * moonOrbitRadius;
    // 直接更新卫星mesh的世界位置
    moonMesh.position.set(moonWorldX, 0, moonWorldZ);
  }
  ```
