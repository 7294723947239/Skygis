import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const apkPath = join(process.cwd(), 'SkyGIS-debug.apk');
    const apkBuffer = readFileSync(apkPath);
    
    return new NextResponse(apkBuffer, {
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="SkyGIS-debug.apk"',
        'Content-Length': apkBuffer.length.toString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'APK not found' }, { status: 404 });
  }
}
