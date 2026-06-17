#!/bin/bash
# SkyGIS 一键启动脚本
# 使用方法: chmod +x start.sh && ./start.sh

set -e

echo "========================================="
echo "  SkyGIS 太阳系天体地理信息系统"
echo "  一键启动脚本"
echo "========================================="
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "[错误] 未检测到 Node.js，请先安装 Node.js 18+"
    echo "  下载: https://nodejs.org/"
    exit 1
fi
echo "[OK] Node.js $(node -v)"

# 检查pnpm
if ! command -v pnpm &> /dev/null; then
    echo "[安装] 正在安装 pnpm..."
    npm install -g pnpm
fi
echo "[OK] pnpm $(pnpm -v)"

# 安装依赖
echo ""
echo "[步骤1/3] 安装依赖..."
pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# 配置环境变量（如未设置）
export DEPLOY_RUN_PORT=${DEPLOY_RUN_PORT:-5000}
export COZE_PROJECT_DOMAIN_DEFAULT=${COZE_PROJECT_DOMAIN_DEFAULT:-"http://localhost:$DEPLOY_RUN_PORT"}
export COZE_PROJECT_ENV=${COZE_PROJECT_ENV:-"DEV"}
export COZE_WORKSPACE_PATH=${COZE_WORKSPACE_PATH:-$(pwd)}

echo ""
echo "[步骤2/3] 构建项目..."
pnpm build

echo ""
echo "[步骤3/3] 启动服务..."
echo ""
echo "========================================="
echo "  SkyGIS 已启动!"
echo "  访问地址: http://localhost:$DEPLOY_RUN_PORT"
echo "========================================="
echo ""

pnpm start
