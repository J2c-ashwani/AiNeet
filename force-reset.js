require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function resetPassword() {
    const email = 'jhasalcreativepeople@gmail.com';
    const newPassword = 'JaiShreeRam@123'; // Setting a new standard password

    console.log(`Looking up user: ${email}`);
    
    // 1. Get user ID
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const user = users.find(u => u.email === email);
    if (!user) {
        console.error('User not found!');
        return;
    }

    console.log(`Found user ID: ${user.id}`);

    // 2. Update password
    const { data, error } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
    );

    if (error) {
        console.error('Error updating password:', error);
    } else {
        console.log('✅ Password successfully updated!');
        console.log(`New Password: ${newPassword}`);
    }
}

resetPassword();
