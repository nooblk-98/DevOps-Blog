import { createClient } from '@supabase/supabase-js'

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Fallback for environments where .env might not be loaded correctly.
// This is a temporary workaround and not recommended for production.
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables not found. Using hardcoded fallback values. This is not recommended for production."
  );
  supabaseUrl = "https://jpnfpmkszspbptyuujqe.supabase.co";
  supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwbmZwbWtzenNwYnB0eXV1anFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDA0MDMsImV4cCI6MjA2OTc3NjQwM30.C0wk0upEty4TXeFrrzq4CQVqCXplwo8JY-n3xM2mmII";
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key could not be loaded.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)