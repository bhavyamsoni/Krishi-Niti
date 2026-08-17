import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/database/app_database.dart';
import '../../models/models.dart';
import '../soil/soil_test_entry_screen.dart';

class CreateFieldScreen extends StatefulWidget {
  const CreateFieldScreen({super.key});

  @override
  State<CreateFieldScreen> createState() => _CreateFieldScreenState();
}

class _CreateFieldScreenState extends State<CreateFieldScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _areaController = TextEditingController(text: '2.5');

  String _selectedCrop = 'cotton';
  String _selectedStage = 'basal';

  final Map<String, List<String>> _cropStages = {
    'cotton': ['basal', 'vegetative', 'flowering', 'boll_development'],
    'wheat': ['basal', 'tillering', 'jointing', 'heading'],
    'rice': ['basal', 'active_tillering', 'panicle_initiation'],
    'groundnut': ['basal', 'flowering', 'pod_development'],
    'maize': ['basal', 'knee_high', 'tasseling'],
  };

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        title: Text(t.translate('add_field')),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                controller: _nameController,
                decoration: InputDecoration(
                  labelText: t.translate('field_name'),
                  prefixIcon: const Icon(Icons.edit, color: AppTheme.primaryGreen),
                ),
                validator: (val) => (val == null || val.trim().isEmpty) ? 'Please enter field name' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _areaController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: InputDecoration(
                  labelText: t.translate('field_area'),
                  prefixIcon: const Icon(Icons.aspect_ratio, color: AppTheme.primaryGreen),
                ),
                validator: (val) {
                  if (val == null || double.tryParse(val) == null || double.parse(val) <= 0) {
                    return 'Enter valid field area (> 0)';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _selectedCrop,
                decoration: InputDecoration(
                  labelText: t.translate('crop'),
                  prefixIcon: const Icon(Icons.eco, color: AppTheme.primaryGreen),
                ),
                items: [
                  DropdownMenuItem(value: 'cotton', child: Text(t.translate('cotton'))),
                  DropdownMenuItem(value: 'wheat', child: Text(t.translate('wheat'))),
                  DropdownMenuItem(value: 'rice', child: Text(t.translate('rice'))),
                  DropdownMenuItem(value: 'groundnut', child: Text(t.translate('groundnut'))),
                  DropdownMenuItem(value: 'maize', child: Text(t.translate('maize'))),
                ],
                onChanged: (val) {
                  if (val != null) {
                    setState(() {
                      _selectedCrop = val;
                      _selectedStage = _cropStages[val]!.first;
                    });
                  }
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _selectedStage,
                decoration: InputDecoration(
                  labelText: t.translate('growth_stage'),
                  prefixIcon: const Icon(Icons.timeline, color: AppTheme.primaryGreen),
                ),
                items: _cropStages[_selectedCrop]!.map((stage) {
                  return DropdownMenuItem(
                    value: stage,
                    child: Text(stage.replaceAll('_', ' ').toUpperCase()),
                  );
                }).toList(),
                onChanged: (val) {
                  if (val != null) {
                    setState(() {
                      _selectedStage = val;
                    });
                  }
                },
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () async {
                  if (_formKey.currentState!.validate()) {
                    final field = FieldModel(
                      id: const Uuid().v4(),
                      name: _nameController.text.trim(),
                      areaAcres: double.parse(_areaController.text.trim()),
                      cropId: _selectedCrop,
                      currentStageId: _selectedStage,
                    );
                    await AppDatabase.instance.insertField(field);

                    if (!mounted) return;
                    // Navigate to Soil Test Entry
                    Navigator.of(context).pushReplacement(
                      MaterialPageRoute(
                        builder: (_) => SoilTestEntryScreen(field: field),
                      ),
                    );
                  }
                },
                child: Text(t.translate('save_btn')),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
