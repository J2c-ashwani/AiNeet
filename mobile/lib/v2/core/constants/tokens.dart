import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// NEET Coach V2 Design Tokens
/// Ethos: Calm → Fast → Tactile → Native → Academically Serious
class NeetTokens {
  NeetTokens._();

  // ── Colors ───────────────────────────────────────────────────
  static const Color bgPrimary = Color(0xFF080C18);
  static const Color bgSecondary = Color(0xFF0F172A);
  static const Color bgCard = Color(0xFF1E293B);
  static const Color bgCardHover = Color(0xFF334155);

  static const Color accentPrimary = Color(0xFF818CF8);
  static const Color accentSecondary = Color(0xFFC084FC);
  static const Color accentGlow = Color(0xFF6366F1);

  // Subject Branding
  static const Color physicsColor = Color(0xFFF59E0B);   // Amber
  static const Color chemistryColor = Color(0xFF38BDF8); // Sky Cyan
  static const Color biologyColor = Color(0xFF10B981);   // Emerald

  // Status & Utility
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF38BDF8);

  // Typography Colors
  static const Color textPrimary = Color(0xFFF8FAFC);
  static const Color textSecondary = Color(0xFFCBD5E1);
  static const Color textMuted = Color(0xFF94A3B8);
  static const Color border = Color(0xFF334155);

  // ── Gradients ──────────────────────────────────────────────
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF6366F1), Color(0xFFA855F7)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cardGradient = LinearGradient(
    colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  // ── Radii ──────────────────────────────────────────────────
  static const double radiusSm = 8.0;
  static const double radiusMd = 12.0;
  static const double radiusLg = 16.0;
  static const double radiusXl = 24.0;

  // ── Haptic Triggers ────────────────────────────────────────
  static void hapticLight() => HapticFeedback.lightImpact();
  static void hapticMedium() => HapticFeedback.mediumImpact();
  static void hapticSelection() => HapticFeedback.selectionClick();
  static void hapticSuccess() => HapticFeedback.heavyImpact();
}
