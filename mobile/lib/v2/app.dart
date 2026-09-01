import 'package:flutter/material.dart';
import 'core/constants/tokens.dart';
import 'core/security/secure_storage.dart';
import 'features/auth/presentation/login_screen.dart';
import 'features/auth/presentation/register_screen.dart';
import 'features/auth/presentation/otp_screen.dart';
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
import 'features/practice/presentation/test_results_screen.dart';

class _NeetSplashScreen extends StatelessWidget {
  const _NeetSplashScreen();
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NeetTokens.bgPrimary,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                gradient: NeetTokens.primaryGradient,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(Icons.school_rounded, color: Colors.white, size: 40),
            ),
            const SizedBox(height: 24),
            const Text(
              'AI NEET Coach',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: NeetTokens.textPrimary),
            ),
            const SizedBox(height: 8),
            const Text('Loading your personalized dashboard...', style: TextStyle(fontSize: 13, color: NeetTokens.textMuted)),
            const SizedBox(height: 32),
            const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2, color: NeetTokens.accentPrimary)),
          ],
        ),
      ),
    );
  }
}

/// Flutter V2 100% Complete Native Application Entry
class NeetV2App extends StatefulWidget {
  const NeetV2App({super.key});

  @override
  State<NeetV2App> createState() => _NeetV2AppState();
}

class _NeetV2AppState extends State<NeetV2App> with WidgetsBindingObserver {
  bool _isCheckingSession = true;
  bool _isLoggedIn = false;
  int _currentTab = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _restoreSession();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && _isLoggedIn) {
      debugPrint('📱 [AppLifecycle] App resumed — session active');
    }
  }

  Future<void> _restoreSession() async {
    final token = await SecureStorageService.getAuthToken();
    if (mounted) {
      setState(() {
        _isLoggedIn = token != null && token.isNotEmpty;
        _isCheckingSession = false;
      });
    }
  }

  void _navigateToResults(BuildContext context, Map<String, dynamic> resultData) {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (resultsCtx) => NativeTestResultsScreen(
          resultData: resultData,
          onReturnHome: () => Navigator.pop(resultsCtx),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AI NEET Coach Native',
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: NeetTokens.bgPrimary,
        colorScheme: ColorScheme.fromSeed(
          seedColor: NeetTokens.accentPrimary,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: _isCheckingSession
          ? const _NeetSplashScreen()
          : !_isLoggedIn
              ? Builder(
                  builder: (ctx) => NativeLoginScreen(
                    onLoginSuccess: () => setState(() => _isLoggedIn = true),
                    onNavigateToRegister: () {
                      Navigator.push(
                        ctx,
                        MaterialPageRoute(
                          builder: (registerCtx) => NativeRegisterScreen(
                            onNavigateToLogin: () => Navigator.pop(registerCtx),
                            onRegistered: (email) {
                              Navigator.pushReplacement(
                                registerCtx,
                                MaterialPageRoute(
                                  builder: (otpCtx) => NativeOtpScreen(
                                    email: email,
                                    onOtpSuccess: () {
                                      Navigator.of(otpCtx).popUntil((route) => route.isFirst);
                                      setState(() => _isLoggedIn = true);
                                    },
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      );
                    },
                  ),
                )
              : Builder(
                  builder: (scaffoldCtx) => Scaffold(
                    body: IndexedStack(
                      index: _currentTab,
                      children: [
                        NativeDashboardScreen(
                          onStartPractice: (topic) {
                            Navigator.push(
                              scaffoldCtx,
                              MaterialPageRoute(
                                builder: (testCtx) => NativeTestEngineScreen(
                                  testTitle: topic,
                                  onSubmitTest: (resultData) {
                                    _navigateToResults(testCtx, resultData);
                                  },
                                ),
                              ),
                            );
                          },
                          onOpenMistakes: () {
                            Navigator.push(
                              scaffoldCtx,
                              MaterialPageRoute(
                                builder: (_) => const NativeMistakeNotebookScreen(),
                              ),
                            );
                          },
                          onOpenRevision: () {
                            Navigator.push(
                              scaffoldCtx,
                              MaterialPageRoute(
                                builder: (_) => const NativeRevisionManagerScreen(),
                              ),
                            );
                          },
                          onOpenStudyPlan: () {
                            Navigator.push(
                              scaffoldCtx,
                              MaterialPageRoute(
                                builder: (_) => const NativeStudyPlanScreen(),
                              ),
                            );
                          },
                          onOpenBlueprint: () {
                            Navigator.push(
                              scaffoldCtx,
                              MaterialPageRoute(
                                builder: (_) => const NativeBlueprintScreen(),
                              ),
                            );
                          },
                          onOpenProfile: () {
                            Navigator.push(
                              scaffoldCtx,
                              MaterialPageRoute(
                                builder: (profileCtx) => NativeProfileScreen(
                                  onLogout: () async {
                                    await SecureStorageService.clearSession();
                                    if (profileCtx.mounted) {
                                      Navigator.pop(profileCtx);
                                    }
                                    if (mounted) {
                                      setState(() => _isLoggedIn = false);
                                    }
                                  },
                                ),
                              ),
                            );
                          },
                          onOpenPricing: () {
                            Navigator.push(
                              scaffoldCtx,
                              MaterialPageRoute(
                                builder: (_) => const NativePricingScreen(),
                              ),
                            );
                          },
                        ),
                        const NativeDoubtSolverScreen(),
                        const NativeOmrScannerScreen(),
                        const NativeNcertReaderScreen(),
                        const NativeBattlegroundScreen(),
                      ],
                    ),
                    bottomNavigationBar: BottomNavigationBar(
                      currentIndex: _currentTab,
                      onTap: (idx) {
                        NeetTokens.hapticSelection();
                        setState(() => _currentTab = idx);
                      },
                      backgroundColor: NeetTokens.bgSecondary,
                      selectedItemColor: NeetTokens.accentPrimary,
                      unselectedItemColor: NeetTokens.textMuted,
                      type: BottomNavigationBarType.fixed,
                      items: const [
                        BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Home'),
                        BottomNavigationBarItem(icon: Icon(Icons.lightbulb_outline), activeIcon: Icon(Icons.lightbulb), label: 'Doubts'),
                        BottomNavigationBarItem(icon: Icon(Icons.camera_alt_outlined), activeIcon: Icon(Icons.camera_alt), label: 'OMR'),
                        BottomNavigationBarItem(icon: Icon(Icons.menu_book_outlined), activeIcon: Icon(Icons.menu_book), label: 'NCERT'),
                        BottomNavigationBarItem(icon: Icon(Icons.sports_esports_outlined), activeIcon: Icon(Icons.sports_esports), label: 'Battle'),
                      ],
                    ),
                  ),
                ),
      debugShowCheckedModeBanner: false,
    );
  }
}
