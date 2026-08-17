import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/database/app_database.dart';
import '../../models/models.dart';
import 'record_application_screen.dart';

class FertilizerHistoryScreen extends StatefulWidget {
  final FieldModel field;

  const FertilizerHistoryScreen({super.key, required this.field});

  @override
  State<FertilizerHistoryScreen> createState() => _FertilizerHistoryScreenState();
}

class _FertilizerHistoryScreenState extends State<FertilizerHistoryScreen> {
  late Future<List<ApplicationHistoryModel>> _historyFuture;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  void _loadHistory() {
    setState(() {
      _historyFuture = AppDatabase.instance.getApplications(widget.field.id);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('${widget.field.name} - History'),
      ),
      body: FutureBuilder<List<ApplicationHistoryModel>>(
        future: _historyFuture,
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final items = snapshot.data!;
          if (items.isEmpty) {
            return const Center(
              child: Text(
                'No fertilizer applied yet for this field.',
                style: TextStyle(color: Colors.grey, fontSize: 16),
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: items.length,
            itemBuilder: (context, index) {
              final item = items[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: AppTheme.primaryGreen,
                    child: Icon(Icons.inventory, color: Colors.white, size: 20),
                  ),
                  title: Text(
                    '${item.productId.toUpperCase()} - ${item.quantityKg} kg',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Text('Stage: ${item.growthStageId.toUpperCase()} • ${item.applicationDate.toString().split(' ')[0]}'),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppTheme.primaryGreen,
        child: const Icon(Icons.add, color: Colors.white),
        onPressed: () async {
          final res = await Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => RecordApplicationScreen(field: widget.field),
            ),
          );
          if (res == true) _loadHistory();
        },
      ),
    );
  }
}
