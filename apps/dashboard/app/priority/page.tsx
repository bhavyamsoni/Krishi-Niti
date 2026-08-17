'use client';

import React, { useState } from 'react';
import { Download, AlertCircle, Search, Filter } from 'lucide-react';

const PRIORITY_AREAS = [
  { id: 1, village: 'Moviya (મોવીયા)', block: 'Gondal', district: 'Rajkot', nDef: 48.6, pDef: 14.2, kDef: 8.5, overuse: 'CRITICAL', fields: 1420, recommendation: 'Deploy mobile soil testing lab + promote balanced split urea doses.' },
  { id: 2, village: 'Kariyana (કરીયાણા)', block: 'Babra', district: 'Amreli', nDef: 54.0, pDef: 16.5, kDef: 9.0, overuse: 'CRITICAL', fields: 1150, recommendation: 'Severe nitrogen deficit. Issue advisory for top dressing.' },
  { id: 3, village: 'Atkot (આટકોટ)', block: 'Jasdan', district: 'Rajkot', nDef: 39.2, pDef: 22.1, kDef: 15.0, overuse: 'MODERATE', fields: 980, recommendation: 'Phosphorus and organic carbon deficiency. Encourage FYM application.' },
  { id: 4, village: 'Bantwa (બાંટવા)', block: 'Keshod', district: 'Junagadh', nDef: 28.5, pDef: 34.0, kDef: 12.0, overuse: 'LOW', fields: 1850, recommendation: 'Monitor groundnut basal DAP dosage.' },
];

export default function PriorityPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = PRIORITY_AREAS.filter(
    (item) => item.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCSV = () => {
    const headers = 'Village,Block,District,Fields,N_Deficiency_%,P_Deficiency_%,Overuse_Risk,Action_Recommendation\n';
    const rows = filtered.map(r => `"${r.village}","${r.block}","${r.district}",${r.fields},${r.nDef}%,${r.pDef}%,"${r.overuse}","${r.recommendation}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KrishiNiti_Priority_Intervention_Areas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Priority Intervention Areas</h1>
          <p className="text-sm text-slate-500 mt-1">Actionable regional decision intelligence for targeted soil testing and extension support</p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Intervention List (CSV)</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search village or block..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">Showing {filtered.length} target zones</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Village</th>
                <th className="px-6 py-3.5">Block / District</th>
                <th className="px-6 py-3.5">Assessed Fields</th>
                <th className="px-6 py-3.5">Nitrogen Deficit</th>
                <th className="px-6 py-3.5">Overuse Risk</th>
                <th className="px-6 py-3.5">Action Directive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{item.village}</td>
                  <td className="px-6 py-4">{item.block}, {item.district}</td>
                  <td className="px-6 py-4 font-medium">{item.fields.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-red-600">{item.nDef}%</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      item.overuse === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                      item.overuse === 'MODERATE' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.overuse}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-700 max-w-xs">{item.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
