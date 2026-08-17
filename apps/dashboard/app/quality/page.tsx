'use client';

import React from 'react';
import { Database, AlertOctagon, CheckCircle2, Clock } from 'lucide-react';

export default function QualityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Data Quality & Freshness Health</h1>
        <p className="text-sm text-slate-500 mt-1">Audit of soil test data staleness, incomplete parameter submissions, and confidence distribution</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 text-emerald-600 mb-3">
            <CheckCircle2 className="w-6 h-6" />
            <h2 className="font-bold text-slate-900">Valid & Fresh Tests</h2>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">85.2%</div>
          <p className="text-xs text-slate-500 mt-2">Tested within past 12 months with full N-P-K-pH parameter suite</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 text-amber-600 mb-3">
            <Clock className="w-6 h-6" />
            <h2 className="font-bold text-slate-900">Stale Records (&gt;12 Mo)</h2>
          </div>
          <div className="text-3xl font-extrabold text-amber-600">14.8%</div>
          <p className="text-xs text-slate-500 mt-2">Requires farmer re-sampling campaign for upcoming Kharif season</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 text-red-600 mb-3">
            <AlertOctagon className="w-6 h-6" />
            <h2 className="font-bold text-slate-900">Missing Key Nutrients</h2>
          </div>
          <div className="text-3xl font-extrabold text-red-600">3.4%</div>
          <p className="text-xs text-slate-500 mt-2">Partial records where Organic Carbon or Potassium was omitted</p>
        </div>
      </div>
    </div>
  );
}
