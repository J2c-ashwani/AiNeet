const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env.local
const envConfig = dotenv.parse(fs.readFileSync('./.env.local'));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkQuestions() {
  console.log('Connecting to Supabase...');
  
  // Get total count
  const { count: totalCount, error: countError } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true });
    
  if (countError) {
    console.error('Error fetching count:', countError);
    return;
  }
  
  console.log(`\n--- DATABASE AUDIT ---`);
  console.log(`Total Questions in DB: ${totalCount}`);
  
  // Get counts by subject
  const { data: subjectData, error: subjectError } = await supabase
    .from('questions')
    .select('subject');
    
  if (!subjectError && subjectData) {
    const subjectCounts = {};
    subjectData.forEach(q => {
      subjectCounts[q.subject] = (subjectCounts[q.subject] || 0) + 1;
    });
    console.log('\nBreakdown by Subject:');
    console.table(subjectCounts);
  }
  
  // Get counts by year
  const { data: yearData, error: yearError } = await supabase
    .from('questions')
    .select('year_asked')
    .not('year_asked', 'is', null);
    
  if (!yearError && yearData) {
    const yearCounts = {};
    yearData.forEach(q => {
      yearCounts[q.year_asked] = (yearCounts[q.year_asked] || 0) + 1;
    });
    console.log('\nBreakdown by Year:');
    
    // Sort years descending
    const sortedYears = Object.keys(yearCounts).sort((a,b) => b - a);
    sortedYears.forEach(year => {
      console.log(`${year}: ${yearCounts[year]} questions`);
    });
  }
  
  console.log(`----------------------\n`);
}

checkQuestions();
