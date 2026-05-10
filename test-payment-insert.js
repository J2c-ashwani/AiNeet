require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkPaymentInsertion() {
    console.log('Testing payments table insert...');
    
    const userId = 'd1ded445-2307-41be-8a8f-a7ba6d9469e0'; // user id for jhasalcreativepeople@gmail.com
    
    // First test user query
    const { data: user, error: userError } = await supabase.from('users').select('id, name, email').eq('id', userId).single();
    if (userError) {
        console.error('User query error:', userError);
        return;
    }
    console.log('User found:', user);
    
    // Now test payments insert
    const paymentId = uuidv4();
    const { data, error } = await supabase.from('payments').insert({
        id: paymentId,
        user_id: userId,
        amount: 399,
        currency: 'INR',
        status: 'pending',
        provider_order_id: 'mock_order_123'
    });
    
    if (error) {
        console.error('Payments insert error:', error);
    } else {
        console.log('Payments insert success!');
    }
}

checkPaymentInsertion();
