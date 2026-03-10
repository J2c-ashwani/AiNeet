import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';
import { predictRank } from '@/lib/ai-engine';
import { calculateSuccessProbability } from '@/lib/scoring';

export async function GET(request) {
  try {
    const supabase = getSupabase();
    const decoded = getUserFromRequest(request);
    if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    // Fetch Base Metadata (Need all subjects regardless of performance)
    const { data: subjects } = await supabase.from('subjects').select('*');
    const { data: chapters } = await supabase.from('chapters').select('*, subjects(name, color)');

    // Fetch User Performance with relationships
    const { data: performance } = await supabase
      .from('user_performance')
      .select(`
        *,
        topics!inner(
          name, 
          chapter_id,
          chapters!inner(
            name,
            subject_id,
            subjects!inner(name, color, icon)
          )
        )
      `)
      .eq('user_id', decoded.id);

    const perfArray = performance || [];

    // 1. subjectPerformance
    const subjectPerformance = (subjects || []).map(s => {
      const matchingPerf = perfArray.filter(p => p.topics?.chapters?.subject_id === s.id);

      const total_attempted = matchingPerf.reduce((sum, p) => sum + (p.total_attempted || 0), 0);
      const total_correct = matchingPerf.reduce((sum, p) => sum + (p.total_correct || 0), 0);
      const avg_accuracy = matchingPerf.length > 0
        ? matchingPerf.reduce((sum, p) => sum + (p.accuracy || 0), 0) / matchingPerf.length
        : 0;

      return {
        id: s.id,
        name: s.name,
        icon: s.icon,
        color: s.color,
        avg_accuracy,
        total_attempted,
        total_correct
      };
    });

    // 2. chapterStrength
    // Group by chapter id
    const chapterMap = {};
    perfArray.forEach(p => {
      const cId = p.topics?.chapter_id;
      if (!cId) return;
      if (!chapterMap[cId]) {
        chapterMap[cId] = {
          id: cId,
          name: p.topics.chapters.name,
          subject_name: p.topics.chapters.subjects.name,
          color: p.topics.chapters.subjects.color,
          accSum: 0,
          count: 0,
          total_attempted: 0
        };
      }
      chapterMap[cId].accSum += (p.accuracy || 0);
      chapterMap[cId].count += 1;
      chapterMap[cId].total_attempted += (p.total_attempted || 0);
    });

    let chapterStrength = Object.values(chapterMap)
      .filter(c => c.total_attempted > 0)
      .map(c => ({
        ...c,
        accuracy: c.accSum / c.count
      }))
      .sort((a, b) => a.accuracy - b.accuracy);

    // 3. Weak Areas
    let weakAreas = perfArray
      .filter(p => p.accuracy < 50 && p.total_attempted >= 2)
      .map(p => ({
        topic_name: p.topics.name,
        chapter_name: p.topics.chapters.name,
        subject_name: p.topics.chapters.subjects.name,
        accuracy: p.accuracy,
        total_attempted: p.total_attempted,
        total_correct: p.total_correct
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 10);

    // 4. Strong Areas
    let strongAreas = perfArray
      .filter(p => p.accuracy >= 80 && p.total_attempted >= 2)
      .map(p => ({
        topic_name: p.topics.name,
        chapter_name: p.topics.chapters.name,
        subject_name: p.topics.chapters.subjects.name,
        accuracy: p.accuracy,
        total_attempted: p.total_attempted
      }))
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 10);

    // 5. Test History
    const { data: testHistoryRows } = await supabase
      .from('tests')
      .select('id, type, score, total_marks, correct_count, incorrect_count, unanswered_count, total_questions, time_taken_seconds, completed_at')
      .eq('user_id', decoded.id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(20);

    const testHistory = testHistoryRows || [];

    // 6. Overall Stats
    const { data: allTests } = await supabase
      .from('tests')
      .select('score, correct_count, total_questions')
      .eq('user_id', decoded.id)
      .not('completed_at', 'is', null);

    const total_tests = (allTests || []).length;
    let best_score = 0;
    let sum_score = 0;
    let sum_acc = 0;

    (allTests || []).forEach(t => {
      if (t.score > best_score) best_score = t.score;
      sum_score += (t.score || 0);
      sum_acc += t.total_questions > 0 ? (t.correct_count / t.total_questions) * 100 : 0;
    });

    const overallStats = {
      total_tests,
      avg_score: total_tests > 0 ? sum_score / total_tests : 0,
      best_score,
      avg_accuracy: total_tests > 0 ? sum_acc / total_tests : 0
    };

    const rankPrediction = predictRank(overallStats.avg_score || 0, overallStats.total_tests || 0, overallStats.avg_accuracy || 0);

    // Add Success Probability
    const recentScores = testHistory.map(t => t.score).reverse(); // oldest -> newest
    const successProb = calculateSuccessProbability(recentScores);
    rankPrediction.successProbability = successProb.probability;
    rankPrediction.trend = successProb.trend;

    // 7. Activity Data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split('T')[0];

    // We can rely on testHistory for the last 7 days since they are ordered by completed_at DESC
    // To be perfectly accurate we fetch from tests again:
    const { data: rawActivity } = await supabase
      .from('tests')
      .select('completed_at, total_questions')
      .eq('user_id', decoded.id)
      .gte('completed_at', dateStr);

    const activityMap = {};
    (rawActivity || []).forEach(row => {
      if (!row.completed_at) return;
      const date = row.completed_at.split('T')[0];
      activityMap[date] = (activityMap[date] || 0) + (row.total_questions || 0);
    });

    const activityData = Object.entries(activityMap).map(([date, count]) => ({ date, count }));

    return NextResponse.json({
      subjectPerformance, chapterStrength, weakAreas, strongAreas, testHistory,
      overallStats: { ...overallStats, avg_accuracy: Math.round(overallStats.avg_accuracy) },
      rankPrediction, activityData
    });
  } catch (error) {
    console.error('Performance error:', error);
    return NextResponse.json({ error: 'Failed to fetch performance' }, { status: 500 });
  }
}
