class FieldModel {
  final String id;
  final String name;
  final double areaAcres;
  final String cropId;
  final String currentStageId;
  final double? latitude;
  final double? longitude;

  FieldModel({
    required this.id,
    required this.name,
    required this.areaAcres,
    required this.cropId,
    required this.currentStageId,
    this.latitude,
    this.longitude,
  });

  Map<String, dynamic> toMap() => {
    'id': id,
    'name': name,
    'area_acres': areaAcres,
    'crop_id': cropId,
    'current_stage_id': currentStageId,
    'latitude': latitude,
    'longitude': longitude,
  };

  factory FieldModel.fromMap(Map<String, dynamic> map) => FieldModel(
    id: map['id'],
    name: map['name'],
    areaAcres: (map['area_acres'] as num).toDouble(),
    cropId: map['crop_id'],
    currentStageId: map['current_stage_id'],
    latitude: map['latitude'] != null ? (map['latitude'] as num).toDouble() : null,
    longitude: map['longitude'] != null ? (map['longitude'] as num).toDouble() : null,
  );
}

class SoilTestModel {
  final String id;
  final String fieldId;
  final DateTime testDate;
  final double? nitrogenN;
  final double? phosphorusP;
  final double? potassiumK;
  final double? ph;
  final double? organicCarbon;

  SoilTestModel({
    required this.id,
    required this.fieldId,
    required this.testDate,
    this.nitrogenN,
    this.phosphorusP,
    this.potassiumK,
    this.ph,
    this.organicCarbon,
  });

  Map<String, dynamic> toMap() => {
    'id': id,
    'field_id': fieldId,
    'test_date': testDate.toIso8601String(),
    'nitrogen_n': nitrogenN,
    'phosphorus_p': phosphorusP,
    'potassium_k': potassiumK,
    'ph': ph,
    'organic_carbon': organicCarbon,
  };

  factory SoilTestModel.fromMap(Map<String, dynamic> map) => SoilTestModel(
    id: map['id'],
    fieldId: map['field_id'],
    testDate: DateTime.parse(map['test_date']),
    nitrogenN: map['nitrogen_n'] != null ? (map['nitrogen_n'] as num).toDouble() : null,
    phosphorusP: map['phosphorus_p'] != null ? (map['phosphorus_p'] as num).toDouble() : null,
    potassiumK: map['potassium_k'] != null ? (map['potassium_k'] as num).toDouble() : null,
    ph: map['ph'] != null ? (map['ph'] as num).toDouble() : null,
    organicCarbon: map['organic_carbon'] != null ? (map['organic_carbon'] as num).toDouble() : null,
  );
}

class ApplicationHistoryModel {
  final String id;
  final String fieldId;
  final String productId;
  final double quantityKg;
  final DateTime applicationDate;
  final String growthStageId;

  ApplicationHistoryModel({
    required this.id,
    required this.fieldId,
    required this.productId,
    required this.quantityKg,
    required this.applicationDate,
    required this.growthStageId,
  });

  Map<String, dynamic> toMap() => {
    'id': id,
    'field_id': fieldId,
    'product_id': productId,
    'quantity_kg': quantityKg,
    'application_date': applicationDate.toIso8601String(),
    'growth_stage_id': growthStageId,
  };

  factory ApplicationHistoryModel.fromMap(Map<String, dynamic> map) => ApplicationHistoryModel(
    id: map['id'],
    fieldId: map['field_id'],
    productId: map['product_id'],
    quantityKg: (map['quantity_kg'] as num).toDouble(),
    applicationDate: DateTime.parse(map['application_date']),
    growthStageId: map['growth_stage_id'],
  );
}
