# SkyGIS 太阳系天体地理信息系统 - 部署指南

## 快速启动

### 方式一：一键启动（推荐）
```bash
chmod +x start.sh
./start.sh
```

### 方式二：手动启动
```bash
# 1. 安装依赖
pnpm install

# 2. 构建
pnpm build

# 3. 启动（默认端口5000）
pnpm start
```

### 方式三：开发模式（热更新）
```bash
pnpm install
pnpm dev
```

## 环境要求
- Node.js 18+
- pnpm 8+
- 端口 5000 可用

## 环境变量
| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| DEPLOY_RUN_PORT | 服务端口 | 5000 |
| COZE_PROJECT_DOMAIN_DEFAULT | 对外域名 | http://localhost:5000 |
| COZE_PROJECT_ENV | 运行环境 | DEV |
| COZE_WORKSPACE_PATH | 项目路径 | 当前目录 |

## 功能说明
- 2D/3D/高斯克吕格三种视图
- 太阳系40+天体3D渲染
- 物质成分可视化（大气/表面/内部/海洋）
- 不可见现象动态粒子（磁场/太阳风/暗物质/辐射带）
- 自主智能体（自动探索/进化/对话）
- 离线模式（本地知识引擎8大知识域）
- 星系3D模型（12种类型程序化渲染）
- 小行星/彗星/NEO风险可视化

## 离线模式
启动后点击"离线访客模式"即可使用，无需云端API积分。
所有对话功能使用本地知识引擎，支持：
- 天体物质查询
- 宇宙分类体系
- 物质成分分析
- 引力计算
- 轨道力学

## 技术栈
- Next.js 16 (App Router)
- React 19 + TypeScript 5
- Three.js (3D渲染)
- Leaflet (2D地图)
- Tailwind CSS 4 + shadcn/ui
- Supabase (数据库，可选)
