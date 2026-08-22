// config/database.js
// Supabase client — compatible with Node.js 20 via 'ws' polyfill
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
require('dotenv').config();

let supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
    supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-id.supabase.co';
}

if (!supabaseKey || supabaseKey.includes('your-anon-public-key')) {
    supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-public-key-here';
}

if (supabaseUrl.includes('your-project-id') || supabaseKey.includes('your-anon-public-key')) {
    console.warn('⚠️  SUPABASE_URL or SUPABASE_ANON_KEY contains default placeholder values in .env');
    console.warn('⚠️  Database operations will fall back to local in-memory storage until real Supabase credentials are configured in .env.');
}

// Pass the 'ws' package as the WebSocket transport so the client
// works on Node.js 20 (which lacks native WebSocket support)
const supabase = createClient(supabaseUrl, supabaseKey, {
    realtime: {
        transport: WebSocket
    }
});

console.log('✅  Supabase client initialized');

module.exports = supabase;


