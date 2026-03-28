import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import '../router/app_router.dart';
import '../providers/providers.dart';
import '../core/ad_service.dart';

class MainShell extends ConsumerStatefulWidget {
  final Widget child;
  const MainShell({super.key, required this.child});
  @override
  ConsumerState<MainShell> createState() => _MainShellState();
}

class _MainShellState extends ConsumerState<MainShell> {
  int _selectedIndex = 0;
  BannerAd? _bannerAd;
  bool _isBannerReady = false;

  static const _tabs = [
    AppRoutes.dashboard,
    AppRoutes.testConfig,
    AppRoutes.doubts,
    AppRoutes.battleground,
    AppRoutes.profile,
  ];

  static const _navItems = [
    BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), activeIcon: Icon(Icons.dashboard_rounded), label: 'Home'),
    BottomNavigationBarItem(icon: Icon(Icons.quiz_outlined), activeIcon: Icon(Icons.quiz_rounded), label: 'Tests'),
    BottomNavigationBarItem(icon: Icon(Icons.psychology_outlined), activeIcon: Icon(Icons.psychology_rounded), label: 'Doubts'),
    BottomNavigationBarItem(icon: Icon(Icons.sports_kabaddi_outlined), activeIcon: Icon(Icons.sports_kabaddi), label: 'Battle'),
    BottomNavigationBarItem(icon: Icon(Icons.person_outline_rounded), activeIcon: Icon(Icons.person_rounded), label: 'Profile'),
  ];

  @override
  void initState() {
    super.initState();
    _loadBannerAd();
  }

  void _loadBannerAd() {
    // Only load ads for free tier users
    final authState = ref.read(authNotifierProvider);
    if (authState.user?.isPro == true) return;

    AdService().loadBannerAd(
      onLoaded: (ad) {
        if (mounted) {
          setState(() {
            _bannerAd = ad;
            _isBannerReady = true;
          });
        }
      },
    );
  }

  @override
  void dispose() {
    _bannerAd?.dispose();
    super.dispose();
  }

  Future<bool> _onBackPressed() async {
    if (_selectedIndex != 0) {
      setState(() => _selectedIndex = 0);
      context.go(_tabs[0]);
      return false;
    }
    // Show exit confirmation
    final shouldExit = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1e293b),
        title: const Text('Exit App?', style: TextStyle(color: Color(0xFFf1f5f9))),
        content: const Text('Are you sure you want to exit AI NEET Coach?', style: TextStyle(color: Color(0xFF94a3b8))),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel', style: TextStyle(color: Color(0xFF6366f1)))),
          ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Exit')),
        ],
      ),
    );
    if (shouldExit == true) {
      SystemNavigator.pop();
    }
    return false;
  }

  @override
  Widget build(BuildContext context) {
    // Watch auth state to reactively hide ads when user upgrades
    final authState = ref.watch(authNotifierProvider);
    final showAds = !(authState.user?.isPro == true);

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (!didPop) await _onBackPressed();
      },
      child: Scaffold(
        body: widget.child,
        bottomNavigationBar: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Banner Ad — only for free tier, above bottom nav
            if (showAds && _isBannerReady && _bannerAd != null)
              Container(
                width: double.infinity,
                height: _bannerAd!.size.height.toDouble(),
                color: const Color(0xFF0a0e1a),
                alignment: Alignment.center,
                child: AdWidget(ad: _bannerAd!),
              ),
            // Bottom Navigation Bar
            Container(
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: Color(0x20FFFFFF), width: 1)),
              ),
              child: BottomNavigationBar(
                currentIndex: _selectedIndex,
                onTap: (i) {
                  setState(() => _selectedIndex = i);
                  context.go(_tabs[i]);
                },
                items: _navItems,
                selectedFontSize: 11,
                unselectedFontSize: 11,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
