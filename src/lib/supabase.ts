import { createClient } from '@supabase/supabase-js';

// Extend the window interface to avoid TS errors
declare global {
  interface Window {
    __SUPABASE_CONFIG__?: {
      url: string;
      key: string;
    };
  }
}

const config = window.__SUPABASE_CONFIG__;
const supabaseUrl = config?.url;
const supabaseAnonKey = config?.key;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('missing-url')) {
  console.error(
    "🛡️ HEIMDALL SECURITY ALERT:\n" +
    "As chaves do Supabase não foram detectadas via injeção dinâmica.\n\n" +
    "Verifique se você adicionou VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no painel de Secrets."
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://missing-url.supabase.co', 
  supabaseAnonKey || 'missing-key'
);
