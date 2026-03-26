import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/providers.dart';
import '../screens/splash_screen.dart';
import '../screens/login_screen.dart';
import '../screens/register_screen.dart';
import '../screens/main_shell.dart';
import '../screens/dashboard_screen.dart';
import '../screens/test_config_screen.dart';
import '../screens/test_screen.dart';
import '../screens/results_screen.dart';
import '../screens/doubt_screen.dart';
import '../screens/leaderboard_screen.dart';
import '../screens/battleground_screen.dart';
import '../screens/profile_screen.dart';
import '../screens/study_plan_screen.dart';
import '../screens/revision_screen.dart';
import '../screens/ncert_screen.dart';
import '../models/models.dart';

/// Named routes
class AppRoutes {
  static const splash = '/';
  static const login = '/login';
  static const register = '/register';
  static const dashboard = '/dashboard';
  static const testConfig = '/test-config';
  static const test = '/test';
  static const results = '/results';
  static const doubts = '/doubts';
  static const leaderboard = '/leaderboard';
  static const battleground = '/battleground';
  static const profile = '/profile';
  static const studyPlan = '/study-plan';
  static const revision = '/revision';
  static const ncert = '/ncert';
}

GoRouter createRouter(Ref ref) {
  return GoRouter(
    initialLocation: AppRoutes.splash,
    redirect: (BuildContext context, GoRouterState state) {
      final authState = ref.read(authNotifierProvider);
      final isLoggingIn = state.matchedLocation == AppRoutes.login ||
          state.matchedLocation == AppRoutes.register ||
          state.matchedLocation == AppRoutes.splash;

      if (authState.status == AuthStatus.unknown) return null;
      if (!authState.isAuthenticated && !isLoggingIn) return AppRoutes.login;
      if (authState.isAuthenticated && isLoggingIn &&
          state.matchedLocation != AppRoutes.splash) return AppRoutes.dashboard;
      return null;
    },
    routes: [
      GoRoute(
        path: AppRoutes.splash,
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: AppRoutes.login,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: AppRoutes.register,
        builder: (context, state) => const RegisterScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: AppRoutes.dashboard,
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: AppRoutes.testConfig,
            builder: (context, state) => const TestConfigScreen(),
          ),
          GoRoute(
            path: AppRoutes.doubts,
            builder: (context, state) => const DoubtScreen(),
          ),
          GoRoute(
            path: AppRoutes.leaderboard,
            builder: (context, state) => const LeaderboardScreen(),
          ),
          GoRoute(
            path: AppRoutes.battleground,
            builder: (context, state) => const BattlegroundScreen(),
          ),
          GoRoute(
            path: AppRoutes.profile,
            builder: (context, state) => const ProfileScreen(),
          ),
          GoRoute(
            path: AppRoutes.studyPlan,
            builder: (context, state) => const StudyPlanScreen(),
          ),
          GoRoute(
            path: AppRoutes.revision,
            builder: (context, state) => const RevisionScreen(),
          ),
          GoRoute(
            path: AppRoutes.ncert,
            builder: (context, state) => const NcertScreen(),
          ),
        ],
      ),
      // Full-screen routes (not in shell / bottom nav)
      GoRoute(
        path: AppRoutes.test,
        builder: (context, state) {
          final session = state.extra as TestSession;
          return TestScreen(session: session);
        },
      ),
      GoRoute(
        path: AppRoutes.results,
        builder: (context, state) {
          final result = state.extra as TestResult;
          return ResultsScreen(result: result);
        },
      ),
    ],
  );
}

final routerProvider = Provider<GoRouter>((ref) {
  // Rebuild router when auth state changes
  ref.watch(authNotifierProvider);
  return createRouter(ref);
});
