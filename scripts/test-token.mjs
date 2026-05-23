import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });
require('dotenv').config({ path: path.join(process.cwd(), '.env.local'), override: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const token = "eyJhbGciOiJFUzI1NiIsImtpZCI6ImZlMjQzYzAzLTQ2ODctNGM5Mi05M2VjLWY3ODI0ZDJlMWQyOSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2xmd25yZWhxaml3cGZveWxobWJ5LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2NDlkZGQxMy00YmI2LTQyM2ItYjhhMi1jNGE0NWUzMGNiMDkiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzc5NTI3NzI1LCJpYXQiOjE3Nzk1MjQxMjUsImVtYWlsIjoicWFAbmVldGNvYWNoLmluIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3Nzk1MjQxMjV9XSwic2Vzc2lvbl9pZCI6ImE0MmRhYzI5LTg3ZmUtNDg5Mi04NWJmLWM2MWFjZDY4MGFhMyIsImlzX2Fub255bW91cyI6ZmFsc2V9.SLJRe5qqSm35u25YuF_q24uG0uEASB1lDLkBB4B7weDpX56hp3nfmIunKtRZdljf27CtG8jBcrFg7llWFD0dDQ";

const supabase = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false }
});

async function main() {
    const { data, error } = await supabase.auth.getUser(token);
    console.log('USER DATA:', data);
    console.log('ERROR:', error);
}

main();
