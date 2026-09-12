// Configuración del cliente oficial de Supabase
const SUPABASE_URL = 'https://tzwsrzqpolkrpkdrhxkq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6d3NyenFwb2xrcnBrZHJoeGtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNjc1NjUsImV4cCI6MjEwNDc0MzU2NX0.2mn--1bsJxDrNecaIb4liKyY3A18CrT3jLN9wMhCs0s';

// Instanciar cliente Supabase desde el SDK cargado por CDN
const supabaseClient = (typeof supabase !== 'undefined' && supabase.createClient)
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

window.supabaseClient = supabaseClient;
