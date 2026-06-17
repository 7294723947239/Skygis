import { NextResponse } from 'next/server';

// SkyGIS version info - update this when releasing new features
const VERSION_INFO = {
  version: '3.0.0',
  versionCode: 10,
  releaseNotes: [
    '智能体自主生命体 — App加载自动运行',
    '智能体可对话交流(本地知识引擎)',
    '全AI模块离线可用(无需云端积分)',
    '自主进化5级系统',
    'NEO风险评估+着陆选址',
    '3D场景实时进化通知',
  ],
  downloadUrl: '/SkyGIS.apk',
  forceUpdate: false,
  minSupportVersionCode: 1,
  buildTime: new Date().toISOString(),
};

export async function GET() {
  return NextResponse.json(VERSION_INFO);
}
