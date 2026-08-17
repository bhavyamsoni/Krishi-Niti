class OfflineNutrientStatus {
  final String nitrogen; // LOW, MEDIUM, HIGH
  final String phosphorus;
  final String potassium;
  final String organicCarbon;
  final String phClassification;

  OfflineNutrientStatus({
    required this.nitrogen,
    required this.phosphorus,
    required this.potassium,
    required this.organicCarbon,
    required this.phClassification,
  });
}

class OfflineFertilizerDosage {
  final String productId;
  final String productName;
  final double quantityBags;
  final double quantityKg;
  final double totalCostInr;

  OfflineFertilizerDosage({
    required this.productId,
    required this.productName,
    required this.quantityBags,
    required this.quantityKg,
    required this.totalCostInr,
  });
}

class OfflineRecommendationResult {
  final OfflineNutrientStatus nutrientStatus;
  final List<OfflineFertilizerDosage> dosages;
  final String timingAction;
  final String timingMessage;
  final String confidenceLevel;
  final String explanation;
  final String sustainabilityWarning;
  final double totalEstimatedCost;

  OfflineRecommendationResult({
    required this.nutrientStatus,
    required this.dosages,
    required this.timingAction,
    required this.timingMessage,
    required this.confidenceLevel,
    required this.explanation,
    required this.sustainabilityWarning,
    required this.totalEstimatedCost,
  });
}

class OfflineRecommendationEngine {
  static const String ruleVersion = "1.0.0";

  static OfflineRecommendationResult generateRecommendation({
    required double areaAcres,
    required String cropId,
    required String stageId,
    required double? nitrogenN,
    required double? phosphorusP,
    required double? potassiumK,
    required double? ph,
    required double? organicCarbon,
    required DateTime testDate,
    required double appliedUreaKg,
    required double appliedDapKg,
    required double appliedMopKg,
    required String languageCode,
  }) {
    // 1. Classify Soil Nutrients
    String nStatus = (nitrogenN == null) ? "UNKNOWN" : (nitrogenN < 280 ? "LOW" : (nitrogenN <= 560 ? "MEDIUM" : "HIGH"));
    String pStatus = (phosphorusP == null) ? "UNKNOWN" : (phosphorusP < 11 ? "LOW" : (phosphorusP <= 25 ? "MEDIUM" : "HIGH"));
    String kStatus = (potassiumK == null) ? "UNKNOWN" : (potassiumK < 110 ? "LOW" : (potassiumK <= 280 ? "MEDIUM" : "HIGH"));
    String ocStatus = (organicCarbon == null) ? "UNKNOWN" : (organicCarbon < 0.50 ? "LOW" : "MEDIUM");
    String phClass = (ph == null) ? "NORMAL" : (ph < 6.5 ? "ACIDIC" : (ph > 8.2 ? "ALKALINE" : "NORMAL"));

    final status = OfflineNutrientStatus(
      nitrogen: nStatus,
      phosphorus: pStatus,
      potassium: kStatus,
      organicCarbon: ocStatus,
      phClassification: phClass,
    );

    // 2. Base Crop Requirements (kg/ha)
    double baseN = 120.0;
    double baseP = 60.0;
    double baseK = 50.0;

    if (cropId.toLowerCase() == "groundnut") {
      baseN = 25.0; baseP = 50.0; baseK = 0.0;
    } else if (cropId.toLowerCase() == "rice") {
      baseN = 100.0; baseP = 50.0; baseK = 50.0;
    }

    // 3. Status adjustment
    double adjN = (nStatus == "LOW") ? baseN * 1.2 : (nStatus == "HIGH" ? baseN * 0.7 : baseN);
    double adjP = (pStatus == "LOW") ? baseP * 1.2 : (pStatus == "HIGH" ? baseP * 0.7 : baseP);
    double adjK = (kStatus == "LOW") ? baseK * 1.2 : (kStatus == "HIGH" ? baseK * 0.7 : baseK);

    // 4. Growth stage distribution
    double nWeight = 0.33;
    double pWeight = (stageId.toLowerCase() == "basal") ? 1.0 : 0.0;
    double kWeight = (stageId.toLowerCase() == "basal") ? 1.0 : 0.0;

    if (stageId.toLowerCase() == "flowering" || stageId.toLowerCase() == "panicle_initiation") {
      nWeight = 0.34;
    }

    double targetN = adjN * nWeight;
    double targetP = adjP * pWeight;
    double targetK = adjK * kWeight;

    // 5. Subtract already applied nutrients in this stage
    double appliedN = (appliedUreaKg * 0.46) + (appliedDapKg * 0.18);
    double appliedP = appliedDapKg * 0.46;
    double appliedK = appliedMopKg * 0.60;

    double gapN = (targetN > appliedN) ? (targetN - appliedN) : 0.0;
    double gapP = (targetP > appliedP) ? (targetP - appliedP) : 0.0;
    double gapK = (targetK > appliedK) ? (targetK - appliedK) : 0.0;

    // 6. Convert to fertilizer dosages for field acreage (1 Ha = 2.471 Acres)
    double haToAcre = 2.471;
    List<OfflineFertilizerDosage> dosages = [];

    // DAP for Phosphorus
    double dapKgHa = gapP > 0 ? (gapP / 0.46) : 0.0;
    double nFromDap = dapKgHa * 0.18;
    if (dapKgHa > 0) {
      double dapKgField = (dapKgHa / haToAcre) * areaAcres;
      double bags = dapKgField / 50.0;
      dosages.add(OfflineFertilizerDosage(
        productId: "dap",
        productName: languageCode == "gu" ? "ડીએપી (DAP)" : (languageCode == "hi" ? "डीएपी (DAP)" : "DAP"),
        quantityBags: double.parse(bags.toStringAsFixed(2)),
        quantityKg: double.parse(dapKgField.toStringAsFixed(1)),
        totalCostInr: double.parse((bags * 1350.0).toStringAsFixed(2)),
      ));
    }

    // Urea for remaining Nitrogen
    double remNHa = (gapN > nFromDap) ? (gapN - nFromDap) : 0.0;
    double ureaKgHa = remNHa > 0 ? (remNHa / 0.46) : 0.0;
    if (ureaKgHa > 0) {
      double ureaKgField = (ureaKgHa / haToAcre) * areaAcres;
      double bags = ureaKgField / 45.0;
      dosages.add(OfflineFertilizerDosage(
        productId: "urea",
        productName: languageCode == "gu" ? "યુરિયા (Urea)" : (languageCode == "hi" ? "यूरिया (Urea)" : "Urea"),
        quantityBags: double.parse(bags.toStringAsFixed(2)),
        quantityKg: double.parse(ureaKgField.toStringAsFixed(1)),
        totalCostInr: double.parse((bags * 266.50).toStringAsFixed(2)),
      ));
    }

    // MOP for Potassium
    double mopKgHa = gapK > 0 ? (gapK / 0.60) : 0.0;
    if (mopKgHa > 0) {
      double mopKgField = (mopKgHa / haToAcre) * areaAcres;
      double bags = mopKgField / 50.0;
      dosages.add(OfflineFertilizerDosage(
        productId: "mop",
        productName: languageCode == "gu" ? "એમઓપી (MOP)" : (languageCode == "hi" ? "एमओपी (MOP)" : "MOP"),
        quantityBags: double.parse(bags.toStringAsFixed(2)),
        quantityKg: double.parse(mopKgField.toStringAsFixed(1)),
        totalCostInr: double.parse((bags * 1700.0).toStringAsFixed(2)),
      ));
    }

    double totalCost = dosages.fold(0.0, (sum, d) => sum + d.totalCostInr);

    // 7. Freshness & Confidence
    int daysOld = DateTime.now().difference(testDate).inDays;
    String conf = (daysOld > 365) ? "LOW" : (daysOld > 180 ? "MODERATE" : "HIGH");

    // 8. Explanations & Sustainability
    String explanation = "";
    if (languageCode == "gu") {
      explanation = (nStatus == "LOW")
          ? "જમીનમાં નાઇટ્રોજન ઓછું હોવાથી ૨૦% વધારાની માત્રા સાથે યુરિયાની ભલામણ કરેલ છે."
          : "પાકના વિકાસ તબક્કા મુજબ જરૂરી નાઇટ્રોજનની માત્રા નક્કી કરેલ છે.";
    } else if (languageCode == "hi") {
      explanation = (nStatus == "LOW")
          ? "मिट्टी में नाइट्रोजन की कमी के कारण 20% अतिरिक्त मात्रा के साथ यूरिया अनुशंसित है।"
          : "फसल के विकास चरण के अनुसार नाइट्रोजन की मात्रा निर्धारित की गई है।";
    } else {
      explanation = (nStatus == "LOW")
          ? "Soil nitrogen is low; dosage increased by 20% to support active growth."
          : "Standard split dosage calculated based on growth stage requirement.";
    }

    String warning = (ocStatus == "LOW")
        ? (languageCode == "gu" ? "સેન્દ્રિય કાર્બન ઓછો હોવાથી છાણિયું ખાતર આપવા ખાસ ભલામણ છે." : "Low organic carbon. Apply compost or farm yard manure.")
        : "";

    return OfflineRecommendationResult(
      nutrientStatus: status,
      dosages: dosages,
      timingAction: "APPLY_NOW",
      timingMessage: languageCode == "gu" ? "હવામાન ખાતર આપવા માટે અનુકૂળ છે." : (languageCode == "hi" ? "मौसम अनुकूल है।" : "Weather is suitable for application."),
      confidenceLevel: conf,
      explanation: explanation,
      sustainabilityWarning: warning,
      totalEstimatedCost: totalCost,
    );
  }
}
