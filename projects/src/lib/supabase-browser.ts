import { createClient, SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;
let configPromise: Promise<{ url: string; anonKey: string }> | null = null;

async function getSupabaseConfig(): Promise<{ url: string; anonKey: string }> {
  if (configPromise) return configPromise;

  configPromise = (async () => {
    // Try env vars first (available in SSR)
    const envUrl = process.env.NEXT_PUBLIC_COZE_SUPABASE_URL || process.env.COZE_SUPABASE_URL || '';
    const envKey = process.env.NEXT_PUBLIC_COZE_SUPABASE_ANON_KEY || process.env.COZE_SUPABASE_ANON_KEY || '';

    if (envUrl && envKey) {
      return { url: envUrl, anonKey: envKey };
    }

    // Fallback: fetch from API config route
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.url && data.anonKey) {
        return { url: data.url, anonKey: data.anonKey };
      }
    } catch {
      // Ignore fetch errors
    }

    throw new Error('Supabase 环境变量未配置，请在 Coze 平台开通 Supabase 服务');
  })();

  return configPromise;
}

export async function getBrowserClient(): Promise<SupabaseClient> {
  if (browserClient) return browserClient;

  const { url, anonKey } = await getSupabaseConfig();

  browserClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}
