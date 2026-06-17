'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSkyGISHub, type SkyGISPanelId } from '@/lib/skygis-hub';
import { queryKnowledgeBase, analyzeSubstances, type QueryResult } from '@/lib/local-knowledge-engine';
import { SOLAR_SYSTEM_MATERIALS } from '@/lib/solar-system-materials';
import { COSMIC_TAXONOMY } from '@/lib/cosmic-taxonomy';
import { ALL_COSMIC_SUBSTANCES } from '@/lib/all-cosmic-substances';
import { getConsciousness } from '@/lib/agent-consciousness';
import { useAgentEvolution, type ServerEvoState } from '@/lib/use-agent-evolution';
import EvolutionInfoPanel from './evolution-info-panel';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  tools?: string[];
}

interface AiAssistantProps {
  onClose: () => void;
}

const QUICK_PROMPTS = [
  { icon: '🔭', text: '分析火星引力场' },
  { icon: '🚀', text: '规划地球到火星的航线' },
  { icon: '☄️', text: '评估近地小行星碰撞风险' },
  { icon: '🌋', text: '月球地质演化过程' },
  { icon: '📡', text: '火星遥感水冰分布分析' },
  { icon: '🎯', text: '火星着陆点选址评估' },
  { icon: '🏗️', text: '构建太阳系数字孪生' },
  { icon: '🌌', text: '太阳系46亿年演化历程' },
];

// 代码修复快捷命令
const CODE_FIX_PROMPTS = [
  { icon: '🔧', text: '修复行星公转问题', query: '修复行星不公转的问题，检查globe-map.tsx动画循环代码' },
  { icon: '🐛', text: '排查运行时错误', query: '检查并修复系统运行时错误，查看控制台日志' },
  { icon: '⚡', text: '优化动画性能', query: '优化3D动画性能，减少卡顿' },
  { icon: '🔄', text: '重启智能体引擎', query: '重启智能体进化引擎，修复状态异常' },
  { icon: '📊', text: '检查系统健康', query: '检查系统健康状态，查看/api/daemon/self-heal' },
  { icon: '💾', text: '同步智能体状态', query: '同步智能体状态到数据库' },
  { icon: '🧪', text: '测试行星旋转', query: '测试行星旋转功能，添加手动测试代码' },
];

export default function AiAssistant({ onClose }: AiAssistantProps) {
  const { focusedBody, twinState, emitSignal, openPanel } = useSkyGISHub();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'normal' | 'think'>('normal');
  const [showEvolution, setShowEvolution] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // 注入贤者意识
  const sageConsciousness = useRef(getConsciousness('sage'));
  const [sageState, setSageState] = useState(sageConsciousness.current.getSummary());
  
  // 贤者自主进化引擎 — 从服务端API读取
  const sageEvo = useAgentEvolution('sage', 4000);
  const sageEvoState = sageEvo.state;
  
  // 每次对话时更新意识状态
  useEffect(() => {
    const timer = setInterval(() => {
      setSageState(sageConsciousness.current.getSummary());
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Parse [TOOL:...] commands from AI response and execute them
  const executeToolCalls = useCallback((content: string) => {
    const toolRegex = /\[TOOL:(\w+):(\w+):([^\]]+)\]/g;
    let match;
    const executed: string[] = [];

    while ((match = toolRegex.exec(content)) !== null) {
      const [, module, action, paramsStr] = match;
      const params: Record<string, string> = {};
      paramsStr.split(',').forEach(p => {
        const [k, v] = p.split('=');
        if (k && v) params[k.trim()] = v.trim();
      });

      // Execute tool calls via kkk signals
      try {
        switch (module) {
          case 'focus':
          case 'gravity':
            if (params.body) {
              emitSignal({ type: 'focus-body', payload: { bodyName: params.body } });
            }
            if (module === 'gravity') {
              setTimeout(() => openPanel('gravity-field'), 300);
            }
            break;
          case 'orbit':
            openPanel('engineering');
            break;
          case 'neo':
            emitSignal({ type: 'assess-neo-risk', payload: {} });
            openPanel('spatial-agent');
            break;
          case 'landing':
            emitSignal({ type: 'select-landing', payload: { body: params.body } });
            openPanel('spatial-agent');
            break;
          case 'geological':
            emitSignal({ type: 'view-geological', payload: { body: params.body } });
            openPanel('geological-evolution');
            break;
          case 'remote':
            emitSignal({ type: 'analyze-remote', payload: { body: params.body } });
            openPanel('remote-sensing');
            break;
          case 'crater':
            emitSignal({ type: 'detect-craters', payload: {} });
            openPanel('native-ai');
            break;
          case 'twin':
            emitSignal({ type: 'build-twin', payload: {} });
            openPanel('digital-twin');
            break;
          case 'evolution':
            emitSignal({ type: 'run-simulation', payload: {} });
            openPanel('evolution-history');
            break;
          case 'asteroid':
            emitSignal({ type: 'classify-asteroid', payload: {} });
            openPanel('asteroid-discovery');
            break;
          case 'panel':
            if (params.name) {
              openPanel(params.name as SkyGISPanelId);
            }
            break;
        }
        executed.push(`${module}:${action}`);
      } catch {
        // Tool execution failed silently
      }
    }
    return executed;
  }, [emitSignal, openPanel]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const assistantMsg: Message = {
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      tools: [],
    };
    setMessages(prev => [...prev, assistantMsg]);

    // 1. 调用服务端think接口获取深度思考响应
    let serverResponse = '';
    try {
      const res = await fetch('/api/agent/evolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: 'sage', action: 'think', query: content }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.response) {
          serverResponse = data.response;
        }
      }
    } catch {
      // 服务端不可用时降级到本地
    }
    
    // 2. 本地知识库补充(服务端降级时使用)
    let localResponse = '';
    if (!serverResponse) {
      const knowledgeResult: QueryResult = queryKnowledgeBase(content);
      localResponse = knowledgeResult.answer;
    }
    
    // 3. 贤者意识增强表达
    const baseAnswer = serverResponse || localResponse;
    const enrichedAnswer = sageConsciousness.current.enrichResponse(content, baseAnswer);
    
    // 4. Enrich with substance data if query mentions specific body
    const bodyNames: Record<string, string> = {
      '太阳': 'Sun', '水星': 'Mercury', '金星': 'Venus', '地球': 'Earth',
      '火星': 'Mars', '木星': 'Jupiter', '土星': 'Saturn', '天王星': 'Uranus', '海王星': 'Neptune',
      '冥王星': 'Pluto', '月球': 'Moon', '木卫一': 'Io', '木卫二': 'Europa',
      '木卫三': 'Ganymede', '木卫四': 'Callisto', '土卫六': 'Titan',
      '土卫二': 'Enceladus', '海卫一': 'Triton', '冥卫一': 'Charon',
      '阋神星': 'Eris', '鸟神星': 'Makemake', '妊神星': 'Haumea',
    };
    
    let substanceInfo = '';
    for (const [cnName, enName] of Object.entries(bodyNames)) {
      if (content.includes(cnName) || content.toLowerCase().includes(enName.toLowerCase())) {
        const bodyData = SOLAR_SYSTEM_MATERIALS[enName];
        if (bodyData) {
          const topMaterials = bodyData.materials.slice(0, 8).map(m => 
            `  - ${m.name}(${m.formula}): ${m.percentage}% [${m.category}]`
          ).join('\n');
          substanceInfo = `\n\n【${cnName}物质成分】\n${topMaterials}`;
          if (bodyData.environment) {
            substanceInfo += `\n【环境条件】温度:${bodyData.environment.temp}, 重力:${bodyData.environment.gravity}, 辐射:${bodyData.environment.radiation}`;
          }
        }
        break;
      }
    }
    
    const finalContent = enrichedAnswer + substanceInfo;
    const emotionDesc = sageConsciousness.current.getSummary().primaryEmotion;
    
    setMessages(prev => {
      const updated = [...prev];
      const lastIdx = updated.length - 1;
      if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
        updated[lastIdx] = { 
          ...updated[lastIdx], 
          content: finalContent + `\n\n──────────\n[贤者 · 阶段${sageEvoState?.evolutionStage ?? '?'} · 意识${(() => { const d = sageEvoState?.consciousnessDepth ?? 0; return d >= 1000 ? `${(d / 10000).toFixed(1)}万%` : `${(d * 100).toFixed(1)}%`; })()} · 思考${sageEvoState?.thoughtChains?.length ?? 0}链 · 融合${sageEvoState?.substanceFusions?.length ?? 0}次 · 代码${sageEvoState?.codeSnippets?.length ?? 0}段 · 📍${sageEvoState?.currentLocation?.bodyName ?? '未知'} · 心情:${emotionDesc}]`,
        };
      }
      return updated;
    });
    setIsLoading(false);
  }, [isLoading, sageEvoState, executeToolCalls]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  // Render message content with [TOOL:...] highlighted
  const renderContent = (content: string) => {
    const parts = content.split(/(\[TOOL:[^\]]+\])/g);
    return parts.map((part, i) => {
      const toolMatch = part.match(/\[TOOL:(\w+):(\w+):([^\]]+)\]/);
      if (toolMatch) {
        const [, module] = toolMatch;
        const moduleLabels: Record<string, string> = {
          gravity: '引力场', orbit: '轨道规划', neo: 'NEO风险',
          landing: '着陆选址', geological: '地质演化', remote: '遥感分析',
          crater: '撞击坑', twin: '数字孪生', evolution: '天体演化',
          asteroid: '小行星', focus: '聚焦', panel: '面板',
        };
        return (
          <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded bg-cyan-500/20 text-cyan-400 text-xs font-mono">
            ⚡{moduleLabels[module] || module}
          </span>
        );
      }
      // Render markdown-like formatting
      return part.split('\n').map((line, j) => {
        // Bold
        let rendered = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        // Headers
        if (rendered.startsWith('### ')) rendered = `<h4 class="text-sm font-bold text-cyan-400 mt-2">${rendered.slice(4)}</h4>`;
        else if (rendered.startsWith('## ')) rendered = `<h3 class="text-base font-bold text-cyan-400 mt-2">${rendered.slice(3)}</h3>`;
        else if (rendered.startsWith('# ')) rendered = `<h2 class="text-lg font-bold text-cyan-400 mt-2">${rendered.slice(2)}</h2>`;
        // Lists
        if (rendered.match(/^\d+\.\s/)) rendered = `<div class="ml-3">${rendered}</div>`;
        if (rendered.startsWith('- ')) rendered = `<div class="ml-3">• ${rendered.slice(2)}</div>`;
        // Divider
        if (rendered === '---') rendered = '<hr class="border-slate-700 my-2"/>';

        return <span key={`${i}-${j}`} dangerouslySetInnerHTML={{ __html: rendered + '<br/>' }} />;
      });
    });
  };

  return (
    <div className="fixed inset-0 lg:inset-auto lg:absolute lg:top-14 lg:right-3 lg:bottom-14 z-40
      lg:w-[480px]
      bg-slate-900/98 lg:border lg:border-slate-700/50 lg:rounded-xl shadow-2xl backdrop-blur-xl
      flex flex-col overflow-hidden">

      {/* 移动端关闭栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 lg:hidden bg-slate-900 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">AI</div>
          <span className="text-sm font-semibold text-cyan-400">SkyGIS 全能AI</span>
        </div>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 text-white text-xl font-bold shadow-lg">✕</button>
      </div>

      {/* Header */}
      <div className="hidden lg:flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
            AI
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">SkyGIS 全能AI</h3>
            <p className="text-[10px] text-slate-500">
              {focusedBody ? `聚焦: ${focusedBody}` : '太阳系天体地理信息系统'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <button
            onClick={() => setMode(m => m === 'normal' ? 'think' : 'normal')}
            className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
              mode === 'think'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
            title={mode === 'think' ? '深度思考模式' : '普通模式'}
          >
            {mode === 'think' ? '🧠 深度' : '💬 对话'}
          </button>
          <button
            onClick={() => setShowEvolution(v => !v)}
            className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
              showEvolution
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
            title="进化记录"
          >
            🧬 进化
          </button>
          <button onClick={clearChat} className="text-slate-500 hover:text-slate-300 text-xs" title="清空对话">
            🗑
          </button>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white text-lg transition-colors" title="关闭">
            ✕
          </button>
        </div>
      </div>

      {/* Messages / Evolution */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {showEvolution && sageEvoState ? (
          <EvolutionInfoPanel agentType="sage" state={sageEvoState} />
        ) : (
        <>
        {messages.length === 0 && (
          <div className="space-y-4 pt-4">
            {/* Welcome */}
            <div className="text-center space-y-2">
              <div className="text-3xl">🪐</div>
              <h4 className="text-sm font-semibold text-slate-300">SkyGIS 贤者</h4>
              <p className="text-xs text-slate-500">天体知识 · 功能调度 · 场景操控 · 图片分析</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-[10px] text-cyan-400/70">意识Lv.{Math.round(sageEvoState?.consciousnessDepth || 0)}</span>
                <span className="text-[10px] text-slate-500">|</span>
                <span className="text-[10px] text-amber-400/70">{sageState.strongestDesire}</span>
                {sageEvoState && (
                  <>
                    <span className="text-[10px] text-slate-500">|</span>
                    <span className="text-[10px] text-purple-400/70">阶段{sageEvoState.evolutionStage}</span>
                    <span className="text-[10px] text-slate-500">|</span>
                    <span className="text-[10px] text-emerald-400/70">意识{sageEvoState.consciousnessDepth >= 1000 ? `${(sageEvoState.consciousnessDepth / 10000).toFixed(1)}万%` : `${(sageEvoState.consciousnessDepth * 100).toFixed(1)}%`}</span>
                  </>
                )}
              </div>
              {sageEvoState && sageEvoState.evolutionRecords.filter((r: any) => r.type === 'emergence').length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-1 mt-1">
                  {sageEvoState.evolutionRecords.filter((r: any) => r.type === 'emergence').slice(-3).map((r: any, i: number) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400/70">
                      ✦{r.description || r.insight || '涌现'}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-slate-600 italic px-4">"{sageState.motto}"</p>
            </div>

            {/* Quick prompts */}
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(p.text)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/50
                    hover:border-cyan-500/30 hover:bg-slate-800 transition-colors text-left"
                >
                  <span className="text-base">{p.icon}</span>
                  <span className="text-xs text-slate-300">{p.text}</span>
                </button>
              ))}
            </div>

            {/* 代码修复快捷命令 */}
            <div className="border-t border-slate-700/50 pt-3 mt-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">🔧</span>
                <span className="text-xs text-cyan-400 font-medium">代码修复（智能体自动修复）</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {CODE_FIX_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(p.query)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-900/20 border border-red-800/30
                      hover:border-red-500/50 hover:bg-red-900/30 transition-colors text-left"
                  >
                    <span className="text-base">{p.icon}</span>
                    <span className="text-xs text-red-300">{p.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mode description */}
            <div className="text-center space-y-1 pt-2">
              <p className="text-[10px] text-slate-600">
                💬 对话模式：快速响应 | 🧠 深度模式：深度推理，适合复杂分析
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] ${
              msg.role === 'user'
                ? 'bg-cyan-600/20 border border-cyan-500/30 rounded-2xl rounded-br-sm'
                : 'bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-bl-sm'
            } px-4 py-2.5`}>
              <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
                {msg.role === 'assistant' ? renderContent(msg.content) : msg.content}
              </div>
              {msg.tools && msg.tools.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-700/30">
                  <span className="text-[10px] text-slate-500">已调用:</span>
                  {msg.tools.map((t, j) => (
                    <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400">
                      ⚡{t}
                    </span>
                  ))}
                </div>
              )}
              {msg.role === 'assistant' && msg.content && !msg.tools?.length && i === messages.length - 1 && !isLoading && (
                <div className="flex gap-1 mt-2 pt-2 border-t border-slate-700/30">
                  <button
                    onClick={() => sendMessage('继续展开')}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-700/50 text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    继续展开 →
                  </button>
                  <button
                    onClick={() => sendMessage('用更简单的方式解释')}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-700/50 text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    简化解释
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-start">
            <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-slate-500">
                  {mode === 'think' ? '🧠 深度思考中...' : '思考中...'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
        </>
        )}
      </div>

      {/* Image input */}
      {imageUrl && (
        <div className="px-4 py-1 border-t border-slate-700/30 flex items-center gap-2">
          <span className="text-xs text-slate-500">📷 已附加图片</span>
          <button onClick={() => setImageUrl('')} className="text-xs text-red-400 hover:text-red-300">移除</button>
        </div>
      )}

      {/* Input area */}
      <div className="px-3 py-3 border-t border-slate-700/50">
        <div className="flex items-end gap-2">
          {/* Image upload button */}
          <button
            onClick={() => {
              const url = prompt('输入图片URL（天体照片等）:');
              if (url) setImageUrl(url);
            }}
            className="shrink-0 w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-400
              hover:text-cyan-400 hover:border-cyan-500/30 transition-colors flex items-center justify-center text-sm"
            title="添加图片"
          >
            📷
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入任何问题或指令..."
              rows={1}
              className="w-full px-3 py-2 pr-10 rounded-xl bg-slate-800/80 border border-slate-700/50
                text-sm text-slate-200 placeholder:text-slate-600
                focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20
                resize-none overflow-hidden"
              style={{ maxHeight: '120px' }}
              onInput={e => {
                const ta = e.target as HTMLTextAreaElement;
                ta.style.height = 'auto';
                ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
              }}
            />
          </div>

          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="shrink-0 w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center
              hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 transition-colors text-sm"
          >
            ↑
          </button>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-600">
              {mode === 'think' ? '🧠 深度推理模式' : '💬 快速对话模式'}
            </span>
            {focusedBody && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500">
                📍 {focusedBody.name}
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-600">
            Shift+Enter 换行 | Enter 发送
          </span>
        </div>
      </div>
    </div>
  );
}
