'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const TREND_DATA = [
  { stage: 'Basal (Sowing)', Nitrogen: 340, Phosphorus: 22, Potassium: 220, TargetN: 280 },
  { stage: 'Vegetative', Nitrogen: 260, Phosphorus: 20, Potassium: 215, TargetN: 280 },
  { stage: 'Flowering', Nitrogen: 190, Phosphorus: 18, Potassium: 210, TargetN: 280 },
  { stage: 'Boll Dev', Nitrogen: 210, Phosphorus: 17, Potassium: 205, TargetN: 280 },
];

export default function TrendsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Nutrient Depletion & Crop Lifecycle Trends</h1>
        <p className="text-sm text-slate-500 mt-1">Multi-stage soil nutrient availability vs. crop nutrient demand across season stages</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-1">Available Soil Nitrogen vs. Critical Threshold (kg/ha)</h2>
        <p className="text-xs text-slate-500 mb-6">Drop in nitrogen levels during flowering square formation stage in Cotton belts</p>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={TREND_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="stage" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Legend />
              <Line type="monotone" dataKey="Nitrogen" stroke="#D32F2F" strokeWidth={3} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="TargetN" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} name="Critical Threshold (280 kg/ha)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
