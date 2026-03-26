import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase config');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTable() {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error.message);
    if (error.code === '42P01') {
      console.log('Table "courses" does NOT exist.');
    } else {
      console.log('Other error:', error.code);
    }
  } else {
    console.log('Table "courses" exists. Found:', data.length, 'rows.');
  }
}

checkTable();
