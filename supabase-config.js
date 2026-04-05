/**
 * Supabase Configuration for FTLuma
 */
const SUPABASE_URL = 'https://vkoozoumepnvstljmley.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrb296b3VtZXBudnN0bGptbGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTg1NDYsImV4cCI6MjA5MDk3NDU0Nn0.jexzMstXr6HU_Wa6p1HsQ2qNd5GT3f-QJqdO1SqXRsA';

// Initialize the Supabase client using the global 'supabase' object from the CDN
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Make it globally accessible as 'supabase' to match existing script usage
window.supabase = supabaseClient;
