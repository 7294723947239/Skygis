'use client';

import { useState, useRef, useCallback, useEffect, ReactNode } from 'react';

interface DraggablePanelProps {
  title: string;
  icon?: ReactNode;
  initialPosition?: { x: number; y: number };
  children: ReactNode;
  defaultCollapsed?: boolean;
  color?: string;
}

export default function DraggablePanel({
  title,
  icon,
  initialPosition = { x: 20, y: 120 },
  children,
  defaultCollapsed = false,
  color = 'from-purple-900/90 to-purple-800/80'
}: DraggablePanelProps) {
  const [position, setPosition] = useState(initialPosition);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const isDraggingRef = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 检查点击目标是否在 no-drag 区域内
    const target = e.target as HTMLElement;
    if (target.closest('.no-drag')) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    isDraggingRef.current = true;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y
    };
  }, [position.x, position.y]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !dragRef.current) return;
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    setPosition({
      x: Math.max(0, Math.min(window.innerWidth - 320, dragRef.current.startPosX + deltaX)),
      y: Math.max(0, Math.min(window.innerHeight - 100, dragRef.current.startPosY + deltaY))
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
      setIsDragging(false);
      isDraggingRef.current = false;
      dragRef.current = null;
    }
  }, []);

  // 使用 useEffect 正确管理事件监听
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const onMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const onMouseUp = () => handleMouseUp();
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      className={`fixed z-50 select-none transition-shadow duration-200 ${isDragging ? 'shadow-2xl' : 'shadow-lg'}`}
      style={{
        left: position.x,
        top: position.y,
        width: 300
      }}
    >
      {/* 拖拽手柄 */}
      <div
        className={`bg-gradient-to-r ${color} rounded-t-xl px-3 py-2 flex items-center justify-between cursor-move border border-white/10`}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-white font-medium text-sm">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="no-drag w-6 h-6 rounded hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? '展开' : '收起'}
          >
            {collapsed ? '▶' : '▼'}
          </button>
          <button
            className="no-drag w-6 h-6 rounded hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            onClick={() => setPosition({ x: -1000, y: -1000 })}
            title="关闭"
          >
            ✕
          </button>
        </div>
      </div>
      
      {/* 内容区域 */}
      {!collapsed && (
        <div className="bg-gray-900/95 rounded-b-xl border border-white/10 border-t-0 max-h-96 overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );
}
