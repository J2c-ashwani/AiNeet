import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';
import { getUserFromRequest } from '@/lib/auth';
import { predictRank } from '@/lib/ai-engine';
import { calculateSuccessProbability } from '@/lib/scoring';

export async function GET(request) {
  try {
    initializeDatabase();
    const db = getDb();
    const decoded = getUserFromRequest(request);
    if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const subjectPerformance = await db.all(`
      SELECT s.id, s.name, s.icon, s.color,
        COALESCE(AVG(up.accuracy), 0) as avg_accuracy,
        COALESCE(SUM(up.total_attempted), 0) as total_attempted,
        COALESCE(SUM(up.total_correct), 0) as total_correct
      FROM subjects s
      LEFT JOIN chapters c ON c.subject_id = s.id
      LEFT JOIN topics t ON t.chapter_id = c.id
      LEFT JOIN user_performance up ON up.topic_id = t.id AND up.user_id = ?
      GROUP BY s.id
    `, [decoded.id]);

    const chapterStrength = await db.all(`
      SELECT c.id, c.name, s.name as subject_name, s.color,
        COALESCE(AVG(up.accuracy), 0) as accuracy,
        COALESCE(SUM(up.total_attempted), 0) as total_attempted
      FROM chapters c
      JOIN subjects s ON s.id = c.subject_id
      LEFT JOIN topics t ON t.chapter_id = c.id
      LEFT JOIN user_performance up ON up.topic_id = t.id AND up.user_id = ?
      GROUP BY c.id HAVING total_attempted > 0 ORDER BY accuracy ASC
    `, [decoded.id]);

    const weakAreas = await db.all(`
      SELECT t.name as topic_name, c.name as chapter_name, s.name as subject_name,
        up.accuracy, up.total_attempted, up.total_correct
      FROM user_performance up
      JOIN topics t ON t.id = up.topic_id
      JOIN chapters c ON c.id = t.chapter_id
      JOIN subjects s ON s.id = c.subject_id
      WHERE up.user_id = ? AND up.accuracy < 50 AND up.total_attempted >= 2
      ORDER BY up.accuracy ASC LIMIT 10
    `, [decoded.id]);

    const strongAreas = await db.all(`
      SELECT t.name as topic_name, c.name as chapter_name, s.name as subject_name,
        up.accuracy, up.total_attempted
      FROM user_performance up
      JOIN topics t ON t.id = up.topic_id
      JOIN chapters c ON c.id = t.chapter_id
      JOIN subjects s ON s.id = c.subject_id
      WHERE up.user_id = ? AND up.accuracy >= 80 AND up.total_attempted >= 2
      ORDER BY up.accuracy DESC LIMIT 10
    `, [decoded.id]);

    const testHistory = await db.all(`
      SELECT id, type, score, total_marks, correct_count, incorrect_count, unanswered_count,
        total_questions, time_taken_seconds, completed_at
      FROM tests WHERE user_id = ? AND completed_at IS NOT NULL
      ORDER BY completed_at DESC LIMIT 20
    `, [decoded.id]);

    const overallStats = await db.get(`
      SELECT COUNT(*) as total_tests, COALESCE(AVG(score), 0) as avg_score,
        COALESCE(MAX(score), 0) as best_score,
        COALESCE(AVG(CAST(correct_count AS REAL) / NULLIF(total_questions, 0) * 100), 0) as avg_accuracy
      FROM tests WHERE user_id = ? AND completed_at IS NOT NULL
    `, [decoded.id]);

    const rankPrediction = predictRank(overallStats.avg_score || 0, overallStats.total_tests || 0, overallStats.avg_accuracy || 0);

    // Add Success Probability
    const recentScores = testHistory.map(t => t.score).reverse(); // oldest -> newest
    const successProb = calculateSuccessProbability(recentScores);
    rankPrediction.successProbability = successProb.probability;
    rankPrediction.trend = successProb.trend;

    // Activity Data (Cross-DB Compatible)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split('T')[0];

    const rawActivity = await db.all(`
      SELECT completed_at, total_questions
      FROM tests 
      WHERE user_id = ? AND completed_at >= ?
    `, [decoded.id, dateStr]);

    // Aggregate in JS
    const activityMap = {};
    for (const row of rawActivity) {
      const date = row.completed_at.split('T')[0]; // Extract YYYY-MM-DD
      activityMap[date] = (activityMap[date] || 0) + row.total_questions;
    }
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
