import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:neet_coach_mobile/v2/features/dashboard/presentation/dashboard_screen.dart';
import 'package:neet_coach_mobile/v2/features/practice/presentation/test_configure_screen.dart';
import 'package:neet_coach_mobile/v2/features/ncert/presentation/ncert_reader_screen.dart';

void main() {
  group('Mobile Parity Feature Tests', () {
    testWidgets('Dashboard renders Custom Test Generator card and triggers onOpenCustomTest', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      bool customTestOpened = false;

      await tester.pumpWidget(
        MaterialApp(
          home: NativeDashboardScreen(
            onStartPractice: (_) {},
            onOpenCustomTest: () => customTestOpened = true,
            onOpenMistakes: () {},
            onOpenRevision: () {},
            onOpenStudyPlan: () {},
            onOpenBlueprint: () {},
            onOpenProfile: () {},
            onOpenPricing: () {},
          ),
        ),
      );
      await tester.pump();

      // Verify Custom Test Generator card presence
      expect(find.text('CUSTOM TEST GENERATOR'), findsOneWidget);
      expect(find.text('Configure Custom Test →'), findsOneWidget);

      // Tap Configure Custom Test button
      await tester.tap(find.text('Configure Custom Test →'));
      await tester.pump();
      expect(customTestOpened, isTrue);

      // Clean up async timers
      await tester.pump(const Duration(seconds: 1));
    });

    testWidgets('NativeTestConfigureScreen renders all test types and difficulty options', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const MaterialApp(
          home: NativeTestConfigureScreen(),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 200));

      // Verify Test Types
      expect(find.text('Custom Test'), findsOneWidget);
      expect(find.text('Adaptive Practice'), findsOneWidget);
      expect(find.text('AI Generated'), findsOneWidget);
      expect(find.text('Chapter PYQ'), findsOneWidget);
      expect(find.text('Year-wise PYQ'), findsOneWidget);
      expect(find.text('Full Mock Test'), findsOneWidget);

      // Verify Subjects
      expect(find.text('Physics'), findsOneWidget);
      expect(find.text('Chemistry'), findsOneWidget);
      expect(find.text('Biology'), findsOneWidget);

      // Verify Difficulties
      expect(find.text('All Difficulties'), findsOneWidget);
      expect(find.text('Easy'), findsOneWidget);
      expect(find.text('Medium'), findsOneWidget);
      expect(find.text('Hard'), findsOneWidget);

      // Clean up async timers
      await tester.pump(const Duration(seconds: 1));
    });

    testWidgets('NativeNcertReaderScreen renders books, subject chips and chapter actions', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const MaterialApp(
          home: NativeNcertReaderScreen(),
        ),
      );

      await tester.pump();
      await tester.pump(const Duration(milliseconds: 200));

      // Verify AppBar & Filters
      expect(find.text('NCERT Smart Library'), findsOneWidget);
      expect(find.text('All Subjects'), findsOneWidget);
      expect(find.text('⚡ Physics'), findsOneWidget);
      expect(find.text('🧪 Chemistry'), findsOneWidget);
      expect(find.text('🧬 Biology'), findsOneWidget);

      // Verify Book item and Read PDF / Practice PYQs buttons
      expect(find.text('Physics Part I'), findsWidgets);
      expect(find.text('Units and Measurement'), findsOneWidget);
      expect(find.text('Read PDF'), findsWidgets);
      expect(find.text('Practice PYQs'), findsWidgets);

      // Clean up async timers
      await tester.pump(const Duration(seconds: 1));
    });
  });
}
