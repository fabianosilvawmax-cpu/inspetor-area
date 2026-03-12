import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validation: check if URL is a valid string and starts with http
const isValidConfig = supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey;

if (!isValidConfig) {
  console.warn('Supabase configuration is missing or invalid. App will use local storage fallback.');
}

export const supabase = isValidConfig 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
