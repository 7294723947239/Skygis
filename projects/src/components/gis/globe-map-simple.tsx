'use client';

import { useState } from 'react';

interface Props {
  fallback?: React.ReactNode;
  [key: string]: any;
}

export default function GlobeMapSimple(props: Props) {
  const [test, setTest] = useState('加载中...');
  
  // 简化测试
  setTimeout(() => setTest('GlobeMap 简化版本 - 加载成功'), 100);
  
  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-2xl mb-4">宇宙地图</h1>
        <p>{test}</p>
      </div>
    </div>
  );
}
