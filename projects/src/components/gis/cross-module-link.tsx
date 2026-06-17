'use client';

import { useSkyGISHub, SIGNAL_LABELS, type mmSignalType, type SkyGISPanelId } from '@/lib/skygis-hub';

interface CrossModuleLinkProps {
  signal: mmSignalType;
  payload?: Record<string, unknown>;
  label?: string;
  className?: string;
  variant?: 'chip' | 'button' | 'inline';
}

export default function CrossModuleLink({
  signal,
  payload,
  label,
  className = '',
  variant = 'chip',
}: CrossModuleLinkProps) {
  const { emitSignal } = useSkyGISHub();
  const metaLabel = SIGNAL_LABELS[signal] || signal;

  const handleClick = () => {
    emitSignal({
      type: signal,
      payload: payload ?? {},
    });
  };

  if (variant === 'inline') {
    return (
      <button
        onClick={handleClick}
        className={`text-cyan-400 hover:text-cyan-300 underline underline-offset-2 decoration-cyan-400/30 hover:decoration-cyan-400/60 transition-colors text-xs ${className}`}
        title={`跳转至${metaLabel}`}
      >
        {label ?? metaLabel}
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 rounded-md bg-cyan-900/40 border border-cyan-700/40 px-3 py-1.5 text-xs text-cyan-300 hover:bg-cyan-800/60 hover:border-cyan-600/50 transition-all ${className}`}
        title={`跳转至${metaLabel}`}
      >
        <span>{label ?? metaLabel}</span>
        <span className="text-cyan-500/50">→</span>
      </button>
    );
  }

  // chip variant (default)
  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1 rounded-full bg-slate-800/80 border border-slate-600/30 px-2 py-0.5 text-[10px] text-slate-300 hover:bg-cyan-900/40 hover:border-cyan-600/40 hover:text-cyan-300 transition-all cursor-pointer ${className}`}
      title={`跳转至${metaLabel}`}
    >
      <span>{label ?? metaLabel}</span>
    </button>
  );
}

// ====== 关联推荐栏组件 ======
interface SuggestionBarProps {
  sourcePanel: SkyGISPanelId;
  customSuggestions?: { signal: mmSignalType; payload?: Record<string, unknown> }[];
}

export function SuggestionBar({ sourcePanel, customSuggestions }: SuggestionBarProps) {
  const { suggestions, focusedBody } = useSkyGISHub();

  // 如果有自定义推荐，使用自定义的
  const items = customSuggestions ?? suggestions.slice(0, 5).map((s: { signal?: string; label?: string }) => ({ signal: s.signal || ('DB_CONNECTED' as mmSignalType), payload: {} as Record<string, unknown> | undefined }));

  if (items.length === 0) return null;

  return (
    <div className="border-t border-slate-700/50 bg-slate-900/80 px-3 py-2">
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="text-[10px] text-slate-500">关联操作</span>
        {focusedBody && (
          <span className="text-[10px] text-cyan-500/70">
            当前: {focusedBody.nameCn}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item: { signal: mmSignalType; payload?: Record<string, unknown> }, i: number) => {
          const meta = SIGNAL_LABELS[item.signal] || item.signal;
          return (
            <CrossModuleLink
              key={`${item.signal}-${i}`}
              signal={item.signal}
              payload={item.payload}
              label={meta}
            />
          );
        })}
      </div>
    </div>
  );
}
