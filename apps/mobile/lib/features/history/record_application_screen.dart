import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../../core/theme/app_theme.dart';
import '../../core/database/app_database.dart';
import '../../models/models.dart';

class RecordApplicationScreen extends StatefulWidget {
  final FieldModel field;

  const RecordApplicationScreen({super.key, required this.field});

  @override
  State<RecordApplicationScreen> createState() => _RecordApplicationScreenState();
}

class _RecordApplicationScreenState extends State<RecordApplicationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _qtyController = TextEditingController(text: '45');
  String _selectedProduct = 'urea';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Record Applied Fertilizer'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              Card(
                color: AppTheme.primaryGreen.withOpacity(0.08),
                elevation: 0,
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Text(
                    'Field: ${widget.field.name}\nStage: ${widget.field.currentStageId.replaceAll('_', ' ').toUpperCase()}',
                    style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.darkGreen),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _selectedProduct,
                decoration: const InputDecoration(labelText: 'Fertilizer Product'),
                items: const [
                  DropdownMenuItem(value: 'urea', child: Text('Urea (46% N)')),
                  DropdownMenuItem(value: 'dap', child: Text('DAP (18-46-0)')),
                  DropdownMenuItem(value: 'mop', child: Text('MOP (0-0-60)')),
                  DropdownMenuItem(value: 'npk_12_32_16', child: Text('NPK 12:32:16')),
                  DropdownMenuItem(value: 'ssp', child: Text('SSP (16% P)')),
                ],
                onChanged: (val) {
                  if (val != null) setState(() => _selectedProduct = val);
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _qtyController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(
                  labelText: 'Quantity Applied (kg)',
                  helperText: '1 Bag of Urea = 45 kg, DAP/MOP = 50 kg',
                ),
                validator: (val) {
                  if (val == null || double.tryParse(val) == null || double.parse(val) <= 0) {
                    return 'Enter valid quantity in kg';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () async {
                  if (_formKey.currentState!.validate()) {
                    final app = ApplicationHistoryModel(
                      id: const Uuid().v4(),
                      fieldId: widget.field.id,
                      productId: _selectedProduct,
                      quantityKg: double.parse(_qtyController.text.trim()),
                      applicationDate: DateTime.now(),
                      growthStageId: widget.field.currentStageId,
                    );
                    await AppDatabase.instance.insertApplication(app);

                    if (!mounted) return;
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Fertilizer application recorded locally!')),
                    );
                    Navigator.of(context).pop(true);
                  }
                },
                child: const Text('Save Record & Update Plan'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
