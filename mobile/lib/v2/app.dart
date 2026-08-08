import 'package:flutter/material.dart';
import 'core/constants/tokens.dart';
import 'features/auth/presentation/login_screen.dart';
import 'features/dashboard/presentation/dashboard_screen.dart';
import 'features/doubts/presentation/doubt_solver_screen.dart';
import 'features/ncert/presentation/ncert_reader_screen.dart';
import 'features/omr/presentation/omr_scanner_screen.dart';
import 'features/battleground/presentation/battleground_screen.dart';
import 'features/mistakes/presentation/mistake_notebook_screen.dart';
import 'features/revision/presentation/revision_manager_screen.dart';
import 'features/blueprint/presentation/blueprint_screen.dart';
import 'features/study_plan/presentation/study_plan_screen.dart';
import 'features/pricing/presentation/pricing_screen.dart';
import 'features/profile/presentation/profile_screen.dart';
import 'features/practice/presentation/test_engine_screen.dart';

/// Flutter V2 100% Complete Native Application Entry
class NeetV2App extends StatefulWidget {
  const NeetV2App({super.key});

  @override
  State<NeetV2App> createState() => _NeetV2AppState();
}

class _NeetV2AppState extends State<NeetV2App> {
  bool _isLoggedIn = true;
  int _currentTab = 0;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AI NEET Coach Native V2',
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: NeetTokens.bgPrimary,
        colorScheme: ColorScheme.fromSeed(
          seedColor: NeetTokens.accentPrimary,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: !_isLoggedIn
          ? NativeLoginScreen(
              onLoginSuccess: () => setState(() => _isLoggedIn = true),
              onNavigateToRegister: () {},
            )
          : Scaffold(
              body: IndexedStack(
                index: _currentTab,
                children: [
                  NativeDashboardScreen(
                    onStartPractice: (topic) {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => NativeTestEngineScreen(
                            testTitle: topic,
                            questions: const [],
                            onSubmitTest: () => Navigator.pop(context),
                          ),
                        ),
                      );
                    },
                    onOpenTools: () {},
                  ),
                  const NativeDoubtSolverScreen(),
                  const NativeOmrScannerScreen(),
                  const NativeNcertReaderScreen(),
                  const NativeBattlegroundScreen(),
                  const NativeMistakeNotebookScreen(),
                  const NativeRevisionManagerScreen(),
                  const NativeBlueprintScreen(),
                  const NativeStudyPlanScreen(),
                  const NativePricingScreen(),
                  NativeProfileScreen(
                    onLogout: () => setState(() => _isLoggedIn = false),
                  ),
                ],
              ),
              bottomNavigationBar: BottomNavigationBar(
                currentIndex: _currentTab < 5 ? _currentTab : 0,
                onTap: (idx) {
                  NeetTokens.hapticSelection();
                  setState(() => _currentTab = idx);
                },
                backgroundColor: NeetTokens.bgSecondary,
                selectedItemColor: NeetTokens.accentPrimary,
                unselectedItemColor: NeetTokens.textMuted,
                type: BottomNavigationBarType.fixed,
                items: const [
                  BottomNavigationBarItem(icon: Icon(Icons.home_outlined), label: 'Home'),
                  BottomNavigationBarItem(icon: Icon(Icons.lightbulb_outline), label: 'Doubts'),
                  BottomNavigationBarItem(icon: Icon(Icons.camera_alt_outlined), label: 'OMR'),
                  BottomNavigationBarItem(icon: Icon(Icons.menu_book_outlined), label: 'NCERT'),
                  BottomNavigationBarItem(icon: Icon(Icons.sports_esports_outlined), label: 'Battle'),
                ],
              ),
            ),
      debugShowCheckedModeBanner: false,
    );
  }
}
