'use client';

import React from 'react';
import { FileText, Printer, Download } from 'lucide-react';

export default function ReportsPage() {
  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Official Regional Nutrient Intelligence Brief</h1>
          <p className="text-sm text-slate-500 mt-1">Generated for Agriculture Officers and Extension Directors (Gujarat Division)</p>
        </div>

        <button
          onClick={triggerPrint}
          className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm space-y-8 max-w-4xl mx-auto">
        <div className="border-b border-slate-200 pb-6 flex items-start justify-between">
          <div>
            <div className="text-xs font-bold text-primary-600 uppercase tracking-wider">Government of Gujarat • Agriculture Directorate</div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">Saurashtra Zone Nutrient Assessment Report</h2>
            <p className="text-xs text-slate-500 mt-1">Report Reference: KN-GJ-2026-Q3 • Generated on {new Date().toLocaleDateString()}</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="font-bold text-slate-800">KrishiNiti Engine v1.0.0</p>
            <p>18,421 Total Fields Sampled</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-semibold uppercase">Nitrogen Deficient Fields</span>
            <div className="text-2xl font-extrabold text-red-600 mt-1">42.4%</div>
            <p className="text-[11px] text-slate-500 mt-1">7,810 fields require nitrogen booster</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-semibold uppercase">Phosphorus Deficient Fields</span>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">18.2%</div>
            <p className="text-[11px] text-slate-500 mt-1">3,352 fields below critical threshold</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-semibold uppercase">Potential Chemical Overuse</span>
            <div className="text-2xl font-extrabold text-orange-600 mt-1">21.0%</div>
            <p className="text-[11px] text-slate-500 mt-1">Repeated excessive urea splitting</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <h3 className="text-base font-bold text-slate-900">Key Agronomic Findings & Directives</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Critical Nitrogen Deficit in Cotton Belts:</strong> Soil tests in Gondal, Jasdan, and Babra blocks exhibit widespread available nitrogen levels below 280 kg/ha during vegetative to flowering transition stages.</li>
            <li><strong>Imbalance Risk:</strong> Farmers in Moviya and Kariyana are frequently applying 3 or more split doses of chemical urea without adequate organic basal carbon replenishment.</li>
            <li><strong>Target Recommendation:</strong> Extension workers are instructed to conduct Village Soil Awareness Sessions promoting 20% adjusted nitrogen split application aligned with real-time weather forecasts.</li>
          </ul>
        </div>

        <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
          <div>
            <p className="font-semibold text-slate-800">Approved by Regional Agronomy Committee</p>
            <p>State Agricultural University Extension Cell</p>
          </div>
          <div className="border-t border-slate-400 w-48 text-center pt-2 font-medium">
            Authorized Officer Signature
          </div>
        </div>
      </div>
    </div>
  );
}
