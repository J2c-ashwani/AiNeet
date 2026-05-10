require('dotenv').config({ path: '.env.local' });
const jwt = require('jsonwebtoken');

const token = jwt.sign(
    { 
        id: 'd1ded445-2307-41be-8a8f-a7ba6d9469e0',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'jhasalcreativepeople@gmail.com'
    }, 
    process.env.SUPABASE_JWT_SECRET || 'super-secret-jwt-token-with-at-least-32-characters-long',
    { expiresIn: '1h' }
);

async function testApi() {
    console.log('Hitting production API...');
    const res = await fetch('https://ai-neet.vercel.app/api/subscription/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': `sb-access-token=${token}; sb-refresh-token=dummy`
        },
        body: JSON.stringify({ planId: 'premium' })
    });
    
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${text}`);
}

testApi();
