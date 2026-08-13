# KrishiNiti — Precision Nutrient Intelligence Platform

> **Offline-First Precision Nutrient Intelligence Platform for Farmers and Agriculture Officers**

## Project Overview

KrishiNiti is a multilingual, offline-first agricultural decision-support platform designed to convert soil test data, crop lifecycle stage, fertilizer application history, weather forecast, and economic factors into explainable, actionable fertilizer dosage and timing recommendations for farmers. It also provides regional agricultural authorities with aggregated nutrient intelligence dashboards.

### Core Principles
- **Offline-First**: Core farmer workflow functions completely without internet connectivity.
- **Safety First**: Deterministic agronomic rules engine. LLMs are never used for fertilizer dosage.
- **Multilingual & Voice**: Full support for Gujarati, Hindi, and English with local TTS.
- **No Paid Dependencies**: Zero requirement for paid APIs or paid LLMs in P0 functionality.

---

## Monorepo Architecture

```
krishiniti/
├── apps/
│   ├── mobile/          # Flutter Mobile Application (Farmer Workflow)
│   └── dashboard/       # Next.js Officer Web Dashboard (Regional Intelligence)
├── packages/
│   ├── engine/          # Deterministic Python Agronomic Recommendation Engine
│   └── shared/          # Shared Locales, Schemas, Crop & Fertilizer Catalogs
├── backend/             # FastAPI Backend Server & Sync Engine
├── docs/                # Architecture Specs, Database Schema & Agronomic Sources
└── scripts/             # DB Migrations, Seed Data & Utilities
```

---

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- Python >= 3.10
- Flutter SDK >= 3.19.0
- PostgreSQL (or Supabase CLI)

### Installation
Refer to individual app and package directories for setup commands.
