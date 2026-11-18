import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:neet_coach_mobile/v2/features/study_plan/presentation/study_plan_screen.dart';
import 'package:neet_coach_mobile/v2/features/blueprint/presentation/blueprint_screen.dart';
import 'package:neet_coach_mobile/v2/features/revision/presentation/revision_manager_screen.dart';
import 'package:neet_coach_mobile/v2/features/leaderboard/presentation/leaderboard_screen.dart';
import 'package:neet_coach_mobile/v2/features/analytics/presentation/analytics_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('V2 100% Parity Features Verification', () {
    testWidgets('NativeStudyPlanScreen renders timeline, goal, and recommendations', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const MaterialApp(
          home: NativeStudyPlanScreen(),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('AI Study Plan'), findsOneWidget);
      expect(find.textContaining('Daily Goal:'), findsOneWidget);
      expect(find.text('Daily Timeline'), findsOneWidget);
      expect(find.text('Start Practice Test'), findsOneWidget);
    });

    testWidgets('NativeBlueprintScreen renders subjects and chapter yield ranking', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const MaterialApp(
          home: NativeBlueprintScreen(),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('NEET Weightage Blueprint'), findsOneWidget);
      expect(find.text('Biology'), findsOneWidget);
      expect(find.text('Physics'), findsOneWidget);
      expect(find.text('Chemistry'), findsOneWidget);
      expect(find.textContaining('Ranked by PYQ Yield'), findsOneWidget);
    });

    testWidgets('NativeRevisionManagerScreen renders flashcard and show answer', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const MaterialApp(
          home: NativeRevisionManagerScreen(),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('Spaced Repetition Flashcards'), findsOneWidget);
      expect(find.textContaining('Card 1 of'), findsOneWidget);
      expect(find.text('Show Answer & Solution'), findsOneWidget);

      // Tap Show Answer
      await tester.tap(find.text('Show Answer & Solution'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.textContaining('CORRECT ANSWER:'), findsOneWidget);
      expect(find.text('Hard'), findsOneWidget);
      expect(find.text('Good'), findsOneWidget);
      expect(find.text('Easy'), findsOneWidget);
    });

    testWidgets('NativeLeaderboardScreen renders top ranks, podium and stats', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const MaterialApp(
          home: NativeLeaderboardScreen(),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('NEET All-India Leaderboard'), findsOneWidget);
      expect(find.text('🥇'), findsOneWidget);
      expect(find.text('🥈'), findsOneWidget);
      expect(find.text('🥉'), findsOneWidget);
      expect(find.textContaining('XP'), findsWidgets);
    });

    testWidgets('NativeAnalyticsScreen renders KPIs, rank predictor, and subject accuracy', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const MaterialApp(
          home: NativeAnalyticsScreen(),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('Performance Analytics'), findsOneWidget);
      expect(find.text('Total Tests'), findsOneWidget);
      expect(find.text('Avg Accuracy'), findsOneWidget);
      expect(find.text('AI NEET RANK PREDICTOR'), findsOneWidget);
      expect(find.text('Subject-wise Accuracy'), findsOneWidget);
    });
  });
}
