import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/database/app_database.dart';
import '../../models/models.dart';
import '../recommendation/recommendation_screen.dart';

class SoilTestEntryScreen extends StatefulWidget {
  final FieldModel field;

  const SoilTestEntryScreen({super.key, required this.field});

  @override
  State<SoilTestEntryScreen> createState() => _SoilTestEntryScreenState();
}

class _SoilTestEntryScreenState extends State<SoilTestEntryScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nController = TextEditingController(text: '180');
  final _pController = TextEditingController(text: '24');
  final _kController = TextEditingController(text: '210');
  final _phController = TextEditingController(text: '7.2');
  final _ocController = TextEditingController(text: '0.55');

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        title: Text(t.translate('soil_test_entry')),
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
                  child: Row(
                    children: [
                      const Icon(Icons.info_outline, color: AppTheme.darkGreen),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          '${widget.field.name} (${widget.field.areaAcres} Acres)\nCrop: ${widget.field.cropId.toUpperCase()}',
                          style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.darkGreen),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _nController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: InputDecoration(
                  labelText: t.translate('nitrogen_kg_ha'),
                  helperText: 'Standard: Low (<280), Medium (280-560), High (>560)',
                ),
                validator: (val) {
                  if (val != null && val.isNotEmpty && (double.tryParse(val) == null || double.parse(val) < 0)) {
                    return 'Must be positive number';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _pController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: InputDecoration(
                  labelText: t.translate('phosphorus_kg_ha'),
                  helperText: 'Standard: Low (<11), Medium (11-25), High (>25)',
                ),
                validator: (val) {
                  if (val != null && val.isNotEmpty && (double.tryParse(val) == null || double.parse(val) < 0)) {
                    return 'Must be positive number';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _kController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: InputDecoration(
                  labelText: t.translate('potassium_kg_ha'),
                  helperText: 'Standard: Low (<110), Medium (110-280), High (>280)',
                ),
                validator: (val) {
                  if (val != null && val.isNotEmpty && (double.tryParse(val) == null || double.parse(val) < 0)) {
                    return 'Must be positive number';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _phController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: InputDecoration(
                        labelText: t.translate('ph_val'),
                      ),
                      validator: (val) {
                        if (val != null && val.isNotEmpty) {
                          final p = double.tryParse(val);
                          if (p == null || p < 0 || p > 14) return '0 to 14';
                        }
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _ocController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: InputDecoration(
                        labelText: t.translate('oc_percent'),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () async {
                  if (_formKey.currentState!.validate()) {
                    final soilTest = SoilTestModel(
                      id: const Uuid().v4(),
                      fieldId: widget.field.id,
                      testDate: DateTime.now(),
                      nitrogenN: double.tryParse(_nController.text.trim()),
                      phosphorusP: double.tryParse(_pController.text.trim()),
                      potassiumK: double.tryParse(_kController.text.trim()),
                      ph: double.tryParse(_phController.text.trim()),
                      organicCarbon: double.tryParse(_ocController.text.trim()),
                    );
                    await AppDatabase.instance.insertSoilTest(soilTest);

                    if (!mounted) return;
                    Navigator.of(context).pushReplacement(
                      MaterialPageRoute(
                        builder: (_) => RecommendationScreen(field: widget.field),
                      ),
                    );
                  }
                },
                child: Text(t.translate('generate_rec')),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
