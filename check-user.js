require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkUser() {
    const email = 'jhasalcreativepeople@gmail.com';
    
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error('Error:', error);
        return;
    }

    const user = users.find(u => u.email === email);
    if (!user) {
        console.log(`User ${email} DOES NOT EXIST in Supabase auth.`);
    } else {
        console.log(`User ${email} exists!`);
        console.log(`Created at: ${user.created_at}`);
        console.log(`Last sign in: ${user.last_sign_in_at}`);
    }
}

checkUser();
