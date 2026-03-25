// scripts/index_pseo_urls.js
/**
 * AI NEET Coach - Google Indexing API Pusher
 * 
 * This script pulls all PSEO routes from your database and pushes them
 * directly to Google, forcing rapid crawling of your question databank.
 * 
 * Prerequisites:
 * 1. Install googleapis: `npm install googleapis dotenv @supabase/supabase-js`
 * 2. Place your Google Cloud Service Account JSON file at the root as `google-service-account.json`.
 * 3. Have your `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in your .env file.
 */

require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuration
const BASE_URL = 'https://aineetcoach.com'; // Match your production domain
const SERVICE_ACCOUNT_FILE = './google-service-account.json';
const BATCH_LIMIT = 200; // Google Indexing API allows batches of 200 per request, up to 200/day by default (can request quota increase).

// Init Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role to bypass RLS

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('🚀 Starting Google Indexing Pusher for PSEO...\n');

  if (!fs.existsSync(SERVICE_ACCOUNT_FILE)) {
    console.error(`❌ Missing ${SERVICE_ACCOUNT_FILE}. Create a service account in GCP, enable Web Search Indexing API, and download the JSON key.`);
    process.exit(1);
  }

  // 1. Authenticate with Google API
  console.log('🔑 Authenticating with Google Cloud...');
  const key = require('.' + SERVICE_ACCOUNT_FILE);
  const jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/indexing'],
    null
  );

  await new Promise((resolve, reject) => {
    jwtClient.authorize((err, tokens) => {
      if (err) {
        console.error('❌ Google Auth Error:', err);
        reject();
        process.exit(1);
      }
      resolve();
    });
  });
  console.log('✅ Google Auth Successful');

  // 2. Fetch URLs from Database
  console.log('📡 Fetching questions from Supabase...');
  let hasMore = true;
  let page = 0;
  const pageSize = 1000;
  let allProcessedUrls = [];

  while (hasMore) {
    const { data: questions, error } = await supabase
      .from('questions')
      .select('id')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('❌ Supabase Error:', error.message);
      process.exit(1);
    }

    if (!questions || questions.length === 0) {
      hasMore = false;
      break;
    }

    // Process chunk pushing to index
    console.log(`\n📦 Submitting chunk ${page + 1} (${questions.length} URLs)...`);
    
    // We can loop over batches of 200 natively or submit one by one (100 a time to be safe)
    for (let i = 0; i < questions.length; i++) {
      const url = `${BASE_URL}/q/${questions[i].id}`;
      
      try {
        const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtClient.credentials.access_token}`
          },
          body: JSON.stringify({
            url: url,
            type: 'URL_UPDATED' // Triggers crawl
          })
        });

        if (response.status === 429) {
          console.warn('⚠️ Rate limit hit. Waiting 60 seconds...');
          await new Promise(r => setTimeout(r, 60000));
        } else if (response.status === 200) {
          allProcessedUrls.push(url);
          if (i % 50 === 0) process.stdout.write('🟢');
        } else {
          process.stdout.write('🔴');
        }
      } catch (err) {
         process.stdout.write('🔴');
      }
    }

    page++;
    console.log(`\n✅ Completed chunk ${page}`);
  }

  console.log(`\n🎉 Success! Push requested for ${allProcessedUrls.length} PSEO URLs.`);
  console.log('Google will crawl these within hours instead of waiting weeks. Traffic incoming!');
}

run().catch(console.error);
