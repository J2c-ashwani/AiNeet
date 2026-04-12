const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('./.env.local'));
for (const k in envConfig) process.env[k] = envConfig[k];

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkDetailedAudit() {
  console.log('--- Detailed Audit for Year 2022 ---');
  
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('year_asked', 2022);
    
  if (error) {
    console.error('Error fetching data:', error);
    return;
  }

  console.log(`Total 2022 Questions Found: ${data.length}`);
  
  if (data.length > 0) {
      console.log('Sample question schema:', Object.keys(data[0]));
      
      const subjectCounts = {};
      data.forEach(q => {
        const sub = q.subject_id || q.subject || 'Unknown';
        subjectCounts[sub] = (subjectCounts[sub] || 0) + 1;
      });
      
      console.log('\nBreakdown by Subject ID (2022):');
      console.table(subjectCounts);
  }

  // Look for any questions from 2022 stored as Strings or differently formatted
  const { data: allYears } = await supabase.from('questions').select('year_asked');
  const strCounts = {};
  allYears.forEach(q => {
      const yr = String(q.year_asked).trim();
      if (yr.includes('2022') || yr === '22') {
          strCounts[yr] = (strCounts[yr] || 0) + 1;
      }
  });
  console.log('\nAny other weird year formats containing "2022"?:', strCounts);
  
  // Total DB count just to be sure we are looking at the right place
  const { count } = await supabase.from('questions').select('*', { count: 'exact', head: true });
  console.log(`Total DB Questions: ${count}`);
}

checkDetailedAudit();
