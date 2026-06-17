import { NextResponse } from 'next/server';

const APP_VERSION = '1.0.0';
const VERSION_CODE = 1;

export async function GET() {
  const domain = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000';
  const baseUrl = domain.startsWith('http') ? domain : `https://${domain}`;

  return NextResponse.json({
    version: APP_VERSION,
    versionCode: VERSION_CODE,
    appName: 'SkyGIS',
    packageName: 'com.skygis.app',
    downloadUrl: `${baseUrl}/SkyGIS.apk`,
    releaseNotes: [
      '新增全时空数字孪生模块',
      '新增空间智能体问答 (LLM驱动)',
      '新增原生AI模块 (撞击坑识别/3D场景生成)',
      '新增工程应用模块 (轨道规划/资源勘探)',
      'SkyGIS Hub跨模块互联架构',
      '多体引力场动态可视化',
      '地质年代-地貌演化时空叠合分析',
      '星际航行路径优化与资源规划',
      '天体演化史时空漫游',
      '多波段遥感数据融合分析',
      '公众科学小行星发现与分类',
    ],
    forceUpdate: false,
    minSupportVersionCode: 1,
    fileSize: '3.6 MB',
    md5: '',
    updateTime: new Date().toISOString(),
  });
}
