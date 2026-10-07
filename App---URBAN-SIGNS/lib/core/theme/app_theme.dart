import 'package:flutter/material.dart';

class AppTheme {
  static const yellow = Color(0xFFFFC400);
  static const yellowDark = Color(0xFFE5B000);
  static const bgDark = Color(0xFF101313);
  static const surfaceDark = Color(0xFF181C1D);
  static const inputFillDark = Color(0xFF1F2425);
  static const borderDark = Color(0xFF2D3335);

  static ThemeData dark() {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: yellow,
      brightness: Brightness.dark,
      primary: yellow,
      onPrimary: Colors.black,
      primaryContainer: const Color(0xFF332B00),
      onPrimaryContainer: const Color(0xFFFFE082),
      secondary: const Color(0xFF37474F),
      onSecondary: Colors.white,
      surface: surfaceDark,
      onSurface: const Color(0xFFEDEDED),
      surfaceContainerHighest: const Color(0xFF252B2C),
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: bgDark,
      appBarTheme: const AppBarTheme(
        backgroundColor: bgDark,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.w900,
          letterSpacing: 0.4,
        ),
      ),
      cardTheme: CardThemeData(
        color: surfaceDark,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: borderDark, width: 1),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: inputFillDark,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
        labelStyle: const TextStyle(color: Color(0xFFA0A7A7), fontSize: 13),
        floatingLabelStyle: const TextStyle(
          color: yellow,
          fontWeight: FontWeight.w700,
          fontSize: 13,
        ),
        hintStyle: const TextStyle(color: Color(0xFF6B7272), fontSize: 13),
        prefixIconColor: yellow,
        suffixIconColor: const Color(0xFFA0A7A7),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: borderDark, width: 1.2),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: borderDark, width: 1.2),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: yellow, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.redAccent, width: 1.5),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.redAccent, width: 2),
        ),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: yellow,
        foregroundColor: Colors.black,
        elevation: 4,
        extendedTextStyle: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 0.3),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: yellow,
          foregroundColor: Colors.black,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: yellow,
          side: const BorderSide(color: yellow, width: 1.2),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: const Color(0xFF141718),
        indicatorColor: yellow,
        elevation: 6,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const TextStyle(
              color: yellow,
              fontWeight: FontWeight.w900,
              fontSize: 11,
            );
          }
          return const TextStyle(
            color: Color(0xFF888E8E),
            fontWeight: FontWeight.w600,
            fontSize: 11,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: Colors.black, size: 22);
          }
          return const IconThemeData(color: Color(0xFFA0A7A7), size: 22);
        }),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: surfaceDark,
        selectedColor: yellow.withValues(alpha: 0.2),
        labelStyle: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
        secondaryLabelStyle: const TextStyle(color: yellow, fontSize: 12, fontWeight: FontWeight.w800),
        side: const BorderSide(color: borderDark),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(99)),
      ),
    );
  }

  static ThemeData light() {
    return dark(); // El sistema usa la identidad visual Dark & Yellow del taller
  }
}
