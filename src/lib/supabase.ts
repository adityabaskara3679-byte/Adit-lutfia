import { createClient } from '@supabase/supabase-js';

export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('mitra_keuangan_supabase_url') || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('mitra_keuangan_supabase_anon_key') || '' : '';

  const url = localUrl || envUrl;
  const key = localKey || envKey;

  const isConfigured = Boolean(
    url &&
    key &&
    !url.includes('your-project') &&
    !url.includes('placeholder')
  );

  return { url, key, isConfigured };
}

const creds = getSupabaseCredentials();

export const isSupabaseConfigured = creds.isConfigured;

export const supabase = createClient(
  creds.url || 'https://placeholder-url.supabase.co',
  creds.key || 'placeholder-anon-key'
);

export function setCustomSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mitra_keuangan_supabase_url', url.trim());
    localStorage.setItem('mitra_keuangan_supabase_anon_key', key.trim());
  }
}
