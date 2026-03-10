// Script to fix RLS policies on join_requests table
const { createClient } = require('@supabase/supabase-js');

// Use environment variable or local config
const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY_HERE';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function fixPolicies() {
  try {
    console.log('Executing RLS policy fixes...');
    
    const sql = `
      -- Drop existing problematic policies
      DROP POLICY IF EXISTS "join_requests_select_admin" ON join_requests;
      
      -- Add proper admin read policy
      CREATE POLICY "join_requests_select_admin"
        ON join_requests
        FOR SELECT
        USING (auth.uid() IN (
          SELECT id FROM auth.users WHERE email = 'admin@sparx.local'
        ));
    `;
    
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error:', error);
      process.exit(1);
    }
    
    console.log('Policies fixed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Exception:', err);
    process.exit(1);
  }
}

fixPolicies();
