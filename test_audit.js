const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://lfwnrehqjiwpfoylhmby.supabase.co','REDACTED_KEY_ROTATED', { auth: { persistSession: false }});

async function runAudit() {
  const report = {};
  
  // Mod 1: Auth
  const { data: users } = await s.from('users').select('id, fcm_token, onboarding_completed, parent_email');
  report.auth = {
    totalUsers: users?.length || 0,
    withFcm: users?.filter(u => !!u.fcm_token).length || 0,
    withParent: users?.filter(u => !!u.parent_email).length || 0,
    onboarded: users?.filter(u => u.onboarding_completed).length || 0
  };

  // Mod 2: Test Submissions
  const { count: testsCount } = await s.from('tests').select('*', { count: 'exact', head: true }).not('completed_at', 'is', null);
  const { count: testAnswersCount } = await s.from('test_answers').select('*', { count: 'exact', head: true });
  const { count: testAttemptsCount, error: attemptsErr } = await s.from('test_attempts').select('*', { count: 'exact', head: true });
  report.tests = { completedTests: testsCount, totalAnswers: testAnswersCount, totalAttempts: testAttemptsCount, attemptsError: attemptsErr?.message };

  // Mod 4: OMR
  const { count: omrCount } = await s.from('omr_scans').select('*', { count: 'exact', head: true });
  report.omr = { scans: omrCount };

  // Mod 5: Doubts
  const { count: doubtConvs } = await s.from('doubt_conversations').select('*', { count: 'exact', head: true });
  const { count: doubtMsgs } = await s.from('doubt_messages').select('*', { count: 'exact', head: true });
  report.doubts = { conversations: doubtConvs, messages: doubtMsgs };

  // Mod 6: Subscriptions
  const { data: payments } = await s.from('payments').select('id, status, user_id, amount');
  const { data: subs } = await s.from('subscriptions').select('id, user_id, billing_status');
  report.payments = { 
    totalPayments: payments?.length, 
    completedPayments: payments?.filter(p => p.status === 'completed').length,
    activeSubs: subs?.length 
  };

  console.log(JSON.stringify(report, null, 2));
}
runAudit().catch(console.error);
