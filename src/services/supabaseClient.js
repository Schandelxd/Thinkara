import { createClient } from '@supabase/supabase-js';

function getEnvOrFallback(envValue, fallback) {
  if (!envValue || envValue.startsWith('your_') || envValue === 'placeholder') {
    return fallback;
  }
  return envValue;
}

const supabaseUrl = getEnvOrFallback(process.env.REACT_APP_SUPABASE_URL, 'https://placeholder.supabase.co');
const supabaseKey = getEnvOrFallback(process.env.REACT_APP_SUPABASE_ANON_KEY, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder');

export const supabase = createClient(supabaseUrl, supabaseKey);
