import { NextResponse } from 'next/server';

// 简单的内存存储（生产环境应该用数据库）
let notifications: Array<{
  id: string;
  type: string;
  title: string;
  summary: string;
  evolved: boolean;
  timestamp: number;
}> = [];

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    notifications: notifications.slice(0, 20) // 最多返回20条
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, notification } = body;
    
    if (action === 'add' && notification) {
      notifications = [notification, ...notifications].slice(0, 50);
    } else if (action === 'clear') {
      notifications = [];
    } else if (action === 'remove' && notification?.id) {
      notifications = notifications.filter(n => n.id !== notification.id);
    }
    
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
