
export type BackendMode = 'mvp_mock' | 'supabase';

const getEnvVar = (key: string, fallback: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || fallback;
    }
    if (typeof process !== 'undefined' && process.env) {
        return (process.env as any)[key] || fallback;
    }
  } catch (e) {}
  return fallback;
};

const savedStripePk = localStorage.getItem('nexus_stripe_pk');

// Determine if we should use Supabase mode (env-only)
const isSupabaseActive = !!(getEnvVar('VITE_SUPABASE_URL', '') && getEnvVar('VITE_SUPABASE_ANON_KEY', ''));

export const BACKEND_CONFIG = {
  // If keys are found, we force supabase mode
  mode: (isSupabaseActive ? 'supabase' : getEnvVar('VITE_BACKEND_MODE', 'mvp_mock')) as BackendMode,
  env: getEnvVar('VITE_ENV_NAME', 'production'),
  showDemoBanner: getEnvVar('VITE_DEMO_BANNER', 'false') === 'true',
  aiEnabled: true,
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL', ''),
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY', '')
  },
  stripe: {
    publicKey: savedStripePk || getEnvVar('VITE_STRIPE_PUBLIC_KEY', 'YOUR_STRIPE_PUBLIC_KEY'),
    secretKey: localStorage.getItem('nexus_stripe_sk') || ''
  }
};
