/**
 * Supabase Configuration for FTLuma
 */
const SUPABASE_URL = 'https://vkoozoumepnvstljmley.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrb296b3VtZXBudnN0bGptbGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTg1NDYsImV4cCI6MjA5MDk3NDU0Nn0.jexzMstXr6HU_Wa6p1HsQ2qNd5GT3f-QJqdO1SqXRsA';

console.log('FTLuma: Initializing Supabase Config...');

let supabaseClient;

if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
    const { createClient } = window.supabase;
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabase = supabaseClient;
} else {
    console.error('FTLuma: Supabase CDN library not found! Database features will not work.');
}

export { supabaseClient as supabase };
