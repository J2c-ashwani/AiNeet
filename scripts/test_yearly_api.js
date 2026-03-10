const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

async function testEndpoint() {
  const startTime = Date.now();
  
  // Create a mock token
  const token = jwt.sign(
    { id: 'mock-user-123', email: 'test@example.com', plan_type: 'pro' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  try {
    const res = await fetch('http://localhost:3000/api/tests/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `token=${token}`
      },
      body: JSON.stringify({
        type: 'yearly_pyq',
        year: '2022'
      })
    });
    
    const data = await res.json();
    const duration = Date.now() - startTime;
    
    console.log(`Status: ${res.status}`);
    console.log(`Time taken: ${duration}ms`);
    
    if (res.status === 200) {
      console.log(`Questions returned: ${data.totalQuestions}`);
      console.log(`Test ID: ${data.testId}`);
      
      if (data.questions && data.questions.length > 0) {
         let from2022 = 0;
         let total = data.questions.length;
         
         console.log(`\nSample Question 1: ${data.questions[0].text.substring(0, 100)}...`);
         console.log(`Sample Question ${total}: ${data.questions[total-1].text.substring(0, 100)}...`);
      }
    } else {
      console.error(`Error Response:`, data);
    }
  } catch(e) {
    console.error(`Fetch error:`, e.message);
  }
}

testEndpoint();
