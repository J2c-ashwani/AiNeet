import 'package:flutter/material.dart';
import 'core/constants/tokens.dart';
import 'features/auth/presentation/login_screen.dart';

/// Flutter V2 Native Application Entry
class NeetV2App extends StatelessWidget {
  const NeetV2App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AI NEET Coach V2',
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: NeetTokens.bgPrimary,
        colorScheme: ColorScheme.fromSeed(
          seedColor: NeetTokens.accentPrimary,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: NativeLoginScreen(
        onLoginSuccess: () {
          debugPrint('V2 Auth Success -> Redirecting to V2 Dashboard');
        },
        onNavigateToRegister: () {
          debugPrint('Navigate to V2 Register');
        },
      ),
      debugShowCheckedModeBanner: false,
    );
  }
}
