import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/database/app_database.dart';
import '../../models/models.dart';
import 'create_field_screen.dart';
import '../recommendation/recommendation_screen.dart';
import '../history/fertilizer_history_screen.dart';

class FieldsListScreen extends StatefulWidget {
  const FieldsListScreen({super.key});

  @override
  State<FieldsListScreen> createState() => _FieldsListScreenState();
}

class _FieldsListScreenState extends State<FieldsListScreen> {
  late Future<List<FieldModel>> _fieldsFuture;

  @override
  void initState() {
    super.initState();
    _loadFields();
  }

  void _loadFields() {
    setState(() {
      _fieldsFuture = AppDatabase.instance.getAllFields();
    });
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        title: Text(t.translate('my_fields')),
        actions: [
          IconButton(
            icon: const Icon(Icons.sync),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(t.translate('offline_badge'))),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Offline status banner
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
            color: AppTheme.primaryGreen.withOpacity(0.12),
            child: Row(
              children: [
                const Icon(Icons.cloud_off, size: 18, color: AppTheme.darkGreen),
                const SizedBox(width: 8),
                Text(
                  t.translate('offline_badge'),
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.darkGreen),
                ),
              ],
            ),
          ),
          Expanded(
            child: FutureBuilder<List<FieldModel>>(
              future: _fieldsFuture,
              builder: (context, snapshot) {
                if (!snapshot.hasData) {
                  return const Center(child: CircularProgressIndicator());
                }
                final fields = snapshot.data!;
                if (fields.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Text(
                        t.translate('no_fields'),
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 16, color: Colors.grey),
                      ),
                    ),
                  );
                }
                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: fields.length,
                  itemBuilder: (context, index) {
                    final field = fields[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 16),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  field.name,
                                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.darkGreen),
                                ),
                                Chip(
                                  label: Text('${field.areaAcres} Acres', style: const TextStyle(color: Colors.white, fontSize: 12)),
                                  backgroundColor: AppTheme.soilBrown,
                                  padding: EdgeInsets.zero,
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(Icons.grass, size: 18, color: AppTheme.primaryGreen),
                                const SizedBox(width: 6),
                                Text(
                                  '${field.cropId.toUpperCase()} • ${field.currentStageId.replaceAll('_', ' ').toUpperCase()}',
                                  style: const TextStyle(fontSize: 14, color: Colors.black87),
                                ),
                              ],
                            ),
                            const Divider(height: 24),
                            Row(
                              children: [
                                Expanded(
                                  child: OutlinedButton.icon(
                                    icon: const Icon(Icons.history, size: 18),
                                    label: const Text('History'),
                                    onPressed: () {
                                      Navigator.of(context).push(
                                        MaterialPageRoute(
                                          builder: (_) => FertilizerHistoryScreen(field: field),
                                        ),
                                      );
                                    },
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: ElevatedButton.icon(
                                    icon: const Icon(Icons.analytics, size: 18),
                                    label: const Text('Action Plan'),
                                    onPressed: () {
                                      Navigator.of(context).push(
                                        MaterialPageRoute(
                                          builder: (_) => RecommendationScreen(field: field),
                                        ),
                                      );
                                    },
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppTheme.primaryGreen,
        icon: const Icon(Icons.add, color: Colors.white),
        label: Text(t.translate('add_field'), style: const TextStyle(color: Colors.white)),
        onPressed: () async {
          final res = await Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const CreateFieldScreen()),
          );
          if (res == true) {
            _loadFields();
          }
        },
      ),
    );
  }
}
