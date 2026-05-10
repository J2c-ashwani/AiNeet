require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function runDataIntegrityCheck() {
    console.log('--- MODULE 11: DATA INTEGRITY CHECK ---');
    
    // 1. Verify Score Integrity
    console.log('\n[1] Checking Test Scores Integrity...');
    const { data: tests, error: testErr } = await supabase
        .from('tests')
        .select('id, user_id, score, total_marks, completed_at')
        .order('completed_at', { ascending: false })
        .limit(10);
        
    if (testErr) {
        console.error('Failed to fetch tests:', testErr.message);
    } else {
        tests.forEach(t => {
            if (t.completed_at) {
                // Total marks is equivalent to max score
                if (t.score > t.total_marks) {
                    console.log(`❌ IMPOSSIBLE SCORE DETECTED: Test ${t.id} has score ${t.score} out of ${t.total_marks}`);
                } else if (t.total_marks !== 720 && t.total_marks !== 40 && t.total_marks !== 0) {
                     console.log(`⚠️ UNUSUAL MAX SCORE: Test ${t.id} has total_marks ${t.total_marks}`);
                } else {
                    console.log(`✅ Valid Score Log: Test ${t.id} | Score: ${t.score}/${t.total_marks}`);
                }
            } else {
                console.log(`ℹ️ Incomplete Test: ${t.id}`);
            }
        });
    }

    // 2. Check for Orphaned Answers
    console.log('\n[2] Checking Database Relationships (Orphaned Answers)...');
    const { count: answerCount, error: ansErr } = await supabase
        .from('test_answers')
        .select('*', { count: 'exact', head: true });
        
    const { count: activeAnswerCount, error: relErr } = await supabase
        .from('test_answers')
        .select('tests!inner(id)', { count: 'exact', head: true });
        
    if (ansErr || relErr) {
        console.error('Failed to verify relationships');
    } else {
        if (answerCount !== activeAnswerCount) {
             console.log(`❌ ORPHANED DATA: Found ${answerCount - activeAnswerCount} answers belonging to deleted tests!`);
        } else {
             console.log(`✅ Referential Integrity: All ${answerCount} answers correctly belong to an existing test.`);
        }
    }

    // 3. Verify Payment Logs
    console.log('\n[3] Checking Payment Logs...');
    const { data: payments, error: payErr } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
        
    if (payErr) {
        console.error('Failed to fetch payments:', payErr.message);
    } else {
        if (payments.length === 0) {
            console.log('ℹ️ No payments logged yet.');
        }
        payments.forEach(p => {
             if (!p.user_id || !p.amount || !p.provider_order_id) {
                 console.log(`❌ CORRUPT PAYMENT RECORD: ${p.id} is missing critical fields!`);
             } else {
                 console.log(`✅ Valid Payment Log: ${p.id} | Amount: ${p.amount} | Status: ${p.status}`);
             }
        });
    }
}

runDataIntegrityCheck();
