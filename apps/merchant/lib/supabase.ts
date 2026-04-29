import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xwujygpusfrixotgfekr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3dWp5Z3B1c2ZyaXhvdGdmZWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMTcxNDcsImV4cCI6MjA5MjY5MzE0N30.gdizpkh60dqbDZm5Lracez68__jsUNNeVqDwlSLcv5I';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
