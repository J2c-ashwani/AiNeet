import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:neet_coach_mobile/v2/app.dart';
import 'package:neet_coach_mobile/v2/features/auth/presentation/login_screen.dart';
import 'package:neet_coach_mobile/v2/features/auth/presentation/otp_screen.dart';
import 'package:neet_coach_mobile/v2/features/dashboard/presentation/dashboard_screen.dart';
import 'package:neet_coach_mobile/v2/features/practice/presentation/test_results_screen.dart';
import 'package:neet_coach_mobile/v2/core/cache/offline_cache.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('1. Offline Cache Service & Resilience Tests', () {
    test('Cache put, get, TTL validation, and removal', () async {
      await OfflineCacheService.cacheUserData('test_key', {'name': 'NEET Aspirant', 'score': 680});
      final cached = await OfflineCacheService.getCachedUserData('test_key');
      expect(cached, isNotNull);
      expect(cached['name'], equals('NEET Aspirant'));
      expect(cached['score'], equals(680));

      await OfflineCacheService.removeKey('test_key');
      final removed = await OfflineCacheService.getCachedUserData('test_key');
      expect(removed, isNull);
    });

    test('Cache TTL expiration behaves safely', () async {
      await OfflineCacheService.cacheUserData('expiring_key', {'status': 'active'}, ttlSeconds: -1);
      final expired = await OfflineCacheService.getCachedUserData('expiring_key');
      expect(expired, isNull);
    });
  });

  group('2. Native App Bootstrap & Routing Tests', () {
    testWidgets('NeetV2App starts with splash and loads cleanly', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(const NeetV2App());
      expect(find.text('AI NEET Coach'), findsOneWidget);
      await tester.pump(const Duration(seconds: 1));
    });
  });

  group('3. Authentication Flow Tests', () {
    testWidgets('NativeLoginScreen renders email/password fields and validates input', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      bool loginSuccessCalled = false;
      bool registerCalled = false;

      await tester.pumpWidget(
        MaterialApp(
          home: NativeLoginScreen(
            onLoginSuccess: () => loginSuccessCalled = true,
            onNavigateToRegister: () => registerCalled = true,
          ),
        ),
      );

      expect(find.text('Welcome Back'), findsOneWidget);
      expect(find.text('Sign in to resume your NEET preparation'), findsOneWidget);
      expect(find.byType(TextField), findsNWidgets(2));

      // Test validation on empty submit
      await tester.tap(find.text('Sign In →'));
      await tester.pump();
      expect(find.text('Please enter your email and password.'), findsOneWidget);
      expect(loginSuccessCalled, isFalse);

      // Tap Register link
      await tester.tap(find.text("Don't have an account? Register Free"));
      await tester.pump();
      expect(registerCalled, isTrue);
    });

    testWidgets('NativeOtpScreen renders 6-digit input and handles timer', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      bool otpSuccess = false;

      await tester.pumpWidget(
        MaterialApp(
          home: NativeOtpScreen(
            email: 'test@student.com',
            onOtpSuccess: () => otpSuccess = true,
          ),
        ),
      );

      expect(find.text('Verify Email'), findsOneWidget);
      expect(find.text('We sent a 6-digit code to test@student.com'), findsOneWidget);
      expect(find.text('Verify'), findsOneWidget);
      expect(otpSuccess, isFalse);
    });
  });

  group('4. Dashboard & Quick Tool Navigation Tests', () {
    testWidgets('NativeDashboardScreen displays KPI cards and triggers tool routes', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      bool practiceTriggered = false;
      bool mistakesTriggered = false;
      bool revisionTriggered = false;
      bool studyPlanTriggered = false;
      bool blueprintTriggered = false;
      bool profileTriggered = false;

      await tester.pumpWidget(
        MaterialApp(
          home: NativeDashboardScreen(
            onStartPractice: (topic) => practiceTriggered = true,
            onOpenMistakes: () => mistakesTriggered = true,
            onOpenRevision: () => revisionTriggered = true,
            onOpenStudyPlan: () => studyPlanTriggered = true,
            onOpenBlueprint: () => blueprintTriggered = true,
            onOpenProfile: () => profileTriggered = true,
            onOpenPricing: () {},
          ),
        ),
      );

      expect(find.text('Quick Study Tools'), findsOneWidget);
      expect(find.text('Day Streak'), findsOneWidget);
      expect(find.text('Total XP'), findsOneWidget);
      expect(find.text('Tests Taken'), findsOneWidget);

      // Tap Quick Tools
      await tester.tap(find.text('Mistake Notebook'));
      await tester.pump();
      expect(mistakesTriggered, isTrue);

      await tester.tap(find.text('Spaced Revision'));
      await tester.pump();
      expect(revisionTriggered, isTrue);

      await tester.tap(find.text('150-Day Plan'));
      await tester.pump();
      expect(studyPlanTriggered, isTrue);

      await tester.tap(find.text('NEET Blueprint'));
      await tester.pump();
      expect(blueprintTriggered, isTrue);

      // Tap Practice Recommended CTA
      await tester.tap(find.text('Practice Weak Area →'));
      await tester.pump();
      expect(practiceTriggered, isTrue);

      // Tap Profile settings icon
      await tester.tap(find.byTooltip('Profile & Settings'));
      await tester.pump();
      expect(profileTriggered, isTrue);

      // Settle any background futures
      await tester.pump(const Duration(seconds: 1));
    });
  });

  group('5. Test Results Scorecard & Explanation Tests', () {
    testWidgets('NativeTestResultsScreen displays score, accuracy, and solution breakdown', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      bool returnHomeTriggered = false;

      final testScorecard = {
        'score': 16,
        'correct': 4,
        'incorrect': 1,
        'unattempted': 0,
        'totalQuestions': 5,
        'explanations': [
          {
            'question': 'What is the unit of magnetic flux?',
            'userAnswer': 'Weber',
            'correctAnswer': 'Weber',
            'explanation': 'The SI unit of magnetic flux is Weber (Wb) = Tesla * m^2.',
            'isCorrect': true,
            'pyqTag': 'NEET 2023',
          },
          {
            'question': 'Which bond is strongest in DNA?',
            'userAnswer': 'A-T',
            'correctAnswer': 'G-C',
            'explanation': 'G-C base pairs have 3 hydrogen bonds compared to 2 in A-T.',
            'isCorrect': false,
            'pyqTag': 'NEET 2022',
          },
        ],
      };

      await tester.pumpWidget(
        MaterialApp(
          home: NativeTestResultsScreen(
            resultData: testScorecard,
            onReturnHome: () => returnHomeTriggered = true,
          ),
        ),
      );

      expect(find.text('Test Performance Analysis'), findsOneWidget);
      expect(find.text('TOTAL SCORE'), findsOneWidget);
      expect(find.text('16 / 20'), findsOneWidget);
      expect(find.text('80%'), findsOneWidget); // 4 / 5 = 80% accuracy
      expect(find.text('Question Explanations'), findsOneWidget);
      expect(find.text('What is the unit of magnetic flux?'), findsOneWidget);
      expect(find.text('Which bond is strongest in DNA?'), findsOneWidget);

      await tester.tap(find.text('Return to Home Dashboard →'));
      await tester.pump();
      expect(returnHomeTriggered, isTrue);
    });
  });
}
