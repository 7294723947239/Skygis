'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    router.push('/dashboard');
    setLoading(false);
  };

  const handleQuickAccess = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SkyGIS</h1>
          <p className="text-gray-400 text-sm">宇宙探索智能体系统</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#111827] rounded-2xl p-6 shadow-xl border border-gray-800">
          <div className="flex gap-2 mb-6 bg-[#1f2937] rounded-lg p-1">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                mode === 'login' ? 'bg-cyan-500 text-white' : 'text-gray-400'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                mode === 'register' ? 'bg-cyan-500 text-white' : 'text-gray-400'
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">邮箱</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#1f2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">密码</label>
              <input
                type="password"
                placeholder="至少6位"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#1f2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? '处理中...' : '登录'}
            </button>
          </form>

          <div className="mt-4 space-y-3">
            <button
              onClick={handleQuickAccess}
              className="w-full py-3 bg-[#1f2937] border border-gray-700 text-cyan-400 rounded-lg font-medium hover:bg-[#374151] transition"
            >
              快速体验
            </button>
            <button
              onClick={handleQuickAccess}
              className="w-full py-3 bg-[#1f2937] border border-gray-700 text-yellow-400 rounded-lg font-medium hover:bg-[#374151] transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              离线模式
            </button>
          </div>

          <p className="text-center text-gray-400 text-sm mt-6">
            还没有账号？<span className="text-cyan-400 cursor-pointer hover:underline">注册新账号</span>
          </p>
        </div>
      </div>
    </div>
  );
}
