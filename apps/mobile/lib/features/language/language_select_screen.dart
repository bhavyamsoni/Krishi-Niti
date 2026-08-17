import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../fields/fields_list_screen.dart';

class LanguageSelectScreen extends StatelessWidget {
  final Function(Locale) onLanguageChanged;

  const LanguageSelectScreen({super.key, required this.onLanguageChanged});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.lightBackground,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(Icons.eco, size: 80, color: AppTheme.primaryGreen),
              const SizedBox(height: 16),
              const Text(
                'કૃષિનીતિ / कृषिनीति / KrishiNiti',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.darkGreen),
              ),
              const SizedBox(height: 8),
              const Text(
                'Offline-First Precision Nutrient Intelligence',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 14, color: Colors.grey),
              ),
              const SizedBox(height: 40),
              _buildLanguageCard(
                context,
                title: 'ગુજરાતી',
                subtitle: 'Gujarati',
                locale: const Locale('gu'),
              ),
              const SizedBox(height: 16),
              _buildLanguageCard(
                context,
                title: 'हिंदी',
                subtitle: 'Hindi',
                locale: const Locale('hi'),
              ),
              const SizedBox(height: 16),
              _buildLanguageCard(
                context,
                title: 'English',
                subtitle: 'English',
                locale: const Locale('en'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLanguageCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required Locale locale,
  }) {
    return InkWell(
      onTap: () {
        onLanguageChanged(locale);
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const FieldsListScreen()),
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.accentGreen.withOpacity(0.5), width: 1.5),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.darkGreen),
                ),
                Text(
                  subtitle,
                  style: const TextStyle(fontSize: 14, color: Colors.grey),
                ),
              ],
            ),
            const Icon(Icons.arrow_forward_ios, size: 20, color: AppTheme.primaryGreen),
          ],
        ),
      ),
    );
  }
}
