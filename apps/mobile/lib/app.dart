import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'core/theme/app_theme.dart';
import 'core/localization/app_localizations.dart';
import 'features/language/language_select_screen.dart';

class KrishiNitiApp extends StatefulWidget {
  const KrishiNitiApp({super.key});

  @override
  State<KrishiNitiApp> createState() => _KrishiNitiAppState();
}

class _KrishiNitiAppState extends State<KrishiNitiApp> {
  Locale _currentLocale = const Locale('gu');

  void _setLocale(Locale newLocale) {
    setState(() {
      _currentLocale = newLocale;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'KrishiNiti',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      locale: _currentLocale,
      supportedLocales: const [
        Locale('en', 'US'),
        Locale('hi', 'IN'),
        Locale('gu', 'IN'),
      ],
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      home: LanguageSelectScreen(
        onLanguageChanged: _setLocale,
      ),
    );
  }
}
