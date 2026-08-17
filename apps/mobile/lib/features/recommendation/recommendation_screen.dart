import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/database/app_database.dart';
import '../../core/engine/offline_recommendation_engine.dart';
import '../../models/models.dart';
import '../history/record_application_screen.dart';

class RecommendationScreen extends StatefulWidget {
  final FieldModel field;

  const RecommendationScreen({super.key, required this.field});

  @override
  State<RecommendationScreen> createState() => _RecommendationScreenState();
}

class _RecommendationScreenState extends State<RecommendationScreen> {
  final FlutterTts _flutterTts = FlutterTts();
  OfflineRecommendationResult? _result;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _computeRecommendation();
  }

  Future<void> _computeRecommendation() async {
    final soil = await AppDatabase.instance.getLatestSoilTest(widget.field.id);
    final apps = await AppDatabase.instance.getApplications(widget.field.id);

    // Sum applied in current stage
    double appliedUrea = 0.0;
    double appliedDap = 0.0;
    double appliedMop = 0.0;

    for (var a in apps) {
      if (a.growthStageId.toLowerCase() == widget.field.currentStageId.toLowerCase()) {
        if (a.productId.toLowerCase() == 'urea') appliedUrea += a.quantityKg;
        if (a.productId.toLowerCase() == 'dap') appliedDap += a.quantityKg;
        if (a.productId.toLowerCase() == 'mop') appliedMop += a.quantityKg;
      }
    }

    final locale = Localizations.localeOf(context).languageCode;

    final rec = OfflineRecommendationEngine.generateRecommendation(
      areaAcres: widget.field.areaAcres,
      cropId: widget.field.cropId,
      stageId: widget.field.currentStageId,
      nitrogenN: soil?.nitrogenN,
      phosphorusP: soil?.phosphorusP,
      potassiumK: soil?.potassiumK,
      ph: soil?.ph,
      organicCarbon: soil?.organicCarbon,
      testDate: soil?.testDate ?? DateTime.now(),
      appliedUreaKg: appliedUrea,
      appliedDapKg: appliedDap,
      appliedMopKg: appliedMop,
      languageCode: locale,
    );

    setState(() {
      _result = rec;
      _isLoading = false;
    });
  }

  Future<void> _speakRecommendation() async {
    if (_result == null) return;
    String textToSpeak = "";
    final locale = Localizations.localeOf(context).languageCode;

    if (locale == 'gu') {
      textToSpeak = "આજના દિવસ માટે ભલામણ: ";
      for (var d in _result!.dosages) {
        textToSpeak += "${d.productName} ${d.quantityBags} થેલી અથવા ${d.quantityKg} કિલો આપો. ";
      }
      textToSpeak += _result!.explanation;
      await _flutterTts.setLanguage("gu-IN");
    } else if (locale == 'hi') {
      textToSpeak = "आज की अनुशंसित कार्रवाई: ";
      for (var d in _result!.dosages) {
        textToSpeak += "${d.productName} ${d.quantityBags} बोरी या ${d.quantityKg} किलो डालें। ";
      }
      textToSpeak += _result!.explanation;
      await _flutterTts.setLanguage("hi-IN");
    } else {
      textToSpeak = "Recommended Action: ";
      for (var d in _result!.dosages) {
        textToSpeak += "Apply ${d.quantityBags} bags (${d.quantityKg} kg) of ${d.productName}. ";
      }
      textToSpeak += _result!.explanation;
      await _flutterTts.setLanguage("en-IN");
    }

    await _flutterTts.speak(textToSpeak);
  }

  @override
  void dispose() {
    _flutterTts.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;

    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: Text(widget.field.name)),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final res = _result!;

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.field.name),
        actions: [
          IconButton(
            icon: const Icon(Icons.volume_up, size: 28),
            tooltip: t.translate('speak_btn'),
            onPressed: _speakRecommendation,
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // 1. TODAY'S ACTION CARD
          Card(
            color: AppTheme.primaryGreen,
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        t.translate('today_action').toUpperCase(),
                        style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.1),
                      ),
                      _buildConfidenceBadge(res.confidenceLevel),
                    ],
                  ),
                  const SizedBox(height: 12),
                  if (res.dosages.isEmpty)
                    const Text(
                      'No chemical fertilizer recommended for this stage. Maintain soil moisture.',
                      style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                    )
                  else
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: res.dosages.map((d) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 8.0),
                          child: Text(
                            '• ${d.productName}: ${d.quantityBags} Bags (${d.quantityKg} kg)',
                            style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                          ),
                        );
                      }).toList(),
                    ),
                  const SizedBox(height: 10),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: AppTheme.primaryGreen,
                    ),
                    icon: const Icon(Icons.volume_up, color: AppTheme.primaryGreen),
                    label: Text(t.translate('speak_btn')),
                    onPressed: _speakRecommendation,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // 2. NUTRIENT STATUS BARS
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    t.translate('nutrient_status'),
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.darkGreen),
                  ),
                  const SizedBox(height: 12),
                  _buildNutrientRow('Nitrogen (N)', res.nutrientStatus.nitrogen),
                  _buildNutrientRow('Phosphorus (P)', res.nutrientStatus.phosphorus),
                  _buildNutrientRow('Potassium (K)', res.nutrientStatus.potassium),
                  _buildNutrientRow('Organic Carbon (OC)', res.nutrientStatus.organicCarbon),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // 3. WEATHER & TIMING
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  const Icon(Icons.wb_sunny, size: 36, color: Colors.orange),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          t.translate('weather_timing'),
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.darkGreen),
                        ),
                        const SizedBox(height: 4),
                        Text(res.timingMessage, style: const TextStyle(fontSize: 13, color: Colors.black87)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // 4. ESTIMATED COST & SUSTAINABILITY
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        t.translate('cost_estimate'),
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.darkGreen),
                      ),
                      Text(
                        '₹${res.totalEstimatedCost.toStringAsFixed(0)}',
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen),
                      ),
                    ],
                  ),
                  if (res.sustainabilityWarning.isNotEmpty) ...[
                    const Divider(height: 20),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.warning_amber, color: Colors.orange, size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            res.sustainabilityWarning,
                            style: const TextStyle(fontSize: 13, color: Colors.brown),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // 5. WHY THIS RECOMMENDATION?
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    t.translate('why_this'),
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.darkGreen),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    res.explanation,
                    style: const TextStyle(fontSize: 14, color: Colors.black87, height: 1.4),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Rule Version: 1.0.0 (ICAR / Gujarat State Soil Health Card Protocol)',
                    style: TextStyle(fontSize: 11, color: Colors.grey),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // 6. RECORD APPLICATION BUTTON
          ElevatedButton.icon(
            icon: const Icon(Icons.check_circle_outline),
            label: Text(t.translate('record_applied_btn')),
            onPressed: () async {
              final res = await Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => RecordApplicationScreen(field: widget.field),
                ),
              );
              if (res == true) {
                _computeRecommendation();
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildNutrientRow(String label, String status) {
    Color badgeColor = Colors.grey;
    if (status == 'LOW') badgeColor = AppTheme.statusDeficient;
    if (status == 'MEDIUM') badgeColor = AppTheme.statusAdequate;
    if (status == 'HIGH') badgeColor = AppTheme.statusSurplus;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 14, color: Colors.black87)),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
            decoration: BoxDecoration(
              color: badgeColor.withOpacity(0.15),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: badgeColor, width: 1),
            ),
            child: Text(
              status,
              style: TextStyle(color: badgeColor, fontWeight: FontWeight.bold, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildConfidenceBadge(String level) {
    Color col = Colors.green;
    if (level == 'MODERATE') col = Colors.orange;
    if (level == 'LOW') col = Colors.red;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.verified, size: 14, color: col),
          const SizedBox(width: 4),
          Text(
            '$level CONFIDENCE',
            style: TextStyle(color: col, fontSize: 10, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}
