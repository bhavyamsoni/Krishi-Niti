import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../../models/models.dart';

class AppDatabase {
  static final AppDatabase instance = AppDatabase._init();
  static Database? _database;

  AppDatabase._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('krishiniti_local.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future _createDB(Database db, int version) async {
    await db.execute('''
      CREATE TABLE fields (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        area_acres REAL NOT NULL,
        crop_id TEXT NOT NULL,
        current_stage_id TEXT NOT NULL,
        latitude REAL,
        longitude REAL
      )
    ''');

    await db.execute('''
      CREATE TABLE soil_tests (
        id TEXT PRIMARY KEY,
        field_id TEXT NOT NULL,
        test_date TEXT NOT NULL,
        nitrogen_n REAL,
        phosphorus_p REAL,
        potassium_k REAL,
        ph REAL,
        organic_carbon REAL
      )
    ''');

    await db.execute('''
      CREATE TABLE applications (
        id TEXT PRIMARY KEY,
        field_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity_kg REAL NOT NULL,
        application_date TEXT NOT NULL,
        growth_stage_id TEXT NOT NULL
      )
    ''');

    // Pre-seed with demo field for Hackathon offline walkthrough
    await db.insert('fields', {
      'id': 'demo-field-1',
      'name': 'Ramesh Plot 1 (કપાસ પ્લોટ)',
      'area_acres': 2.5,
      'crop_id': 'cotton',
      'current_stage_id': 'flowering',
      'latitude': 21.9619,
      'longitude': 70.7923,
    });

    await db.insert('soil_tests', {
      'id': 'demo-soil-1',
      'field_id': 'demo-field-1',
      'test_date': DateTime.now().subtract(const Duration(days: 45)).toIso8601String(),
      'nitrogen_n': 180.0, // Low Nitrogen
      'phosphorus_p': 24.0, // Adequate
      'potassium_k': 210.0, // Adequate
      'ph': 7.2,
      'organic_carbon': 0.52,
    });
  }

  // Fields CRUD
  Future<List<FieldModel>> getAllFields() async {
    final db = await instance.database;
    final maps = await db.query('fields');
    return maps.map((e) => FieldModel.fromMap(e)).toList();
  }

  Future<void> insertField(FieldModel field) async {
    final db = await instance.database;
    await db.insert('fields', field.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
  }

  // Soil Tests CRUD
  Future<SoilTestModel?> getLatestSoilTest(String fieldId) async {
    final db = await instance.database;
    final maps = await db.query(
      'soil_tests',
      where: 'field_id = ?',
      whereArgs: [fieldId],
      orderBy: 'test_date DESC',
      limit: 1,
    );
    if (maps.isNotEmpty) {
      return SoilTestModel.fromMap(maps.first);
    }
    return null;
  }

  Future<void> insertSoilTest(SoilTestModel soilTest) async {
    final db = await instance.database;
    await db.insert('soil_tests', soilTest.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
  }

  // Applications CRUD
  Future<List<ApplicationHistoryModel>> getApplications(String fieldId) async {
    final db = await instance.database;
    final maps = await db.query(
      'applications',
      where: 'field_id = ?',
      whereArgs: [fieldId],
      orderBy: 'application_date DESC',
    );
    return maps.map((e) => ApplicationHistoryModel.fromMap(e)).toList();
  }

  Future<void> insertApplication(ApplicationHistoryModel app) async {
    final db = await instance.database;
    await db.insert('applications', app.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
  }
}
