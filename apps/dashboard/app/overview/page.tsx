'use client';

import React, { useEffect, useState } from 'react';
import { fetchOfficerAnalytics, OfficerAnalyticsData } from '../../lib/api';
import {
  Layers,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function OverviewPage() {
  const [data, setData] = useState<OfficerAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfficerAnalytics().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const { overview, village_breakdown } = data;

  const chartData = [
    { name: 'Nitrogen (N)', percent: overview.nitrogen_deficiency_percent, color: '#D32F2F' },
    { name: 'Phosphorus (P)', percent: overview.phosphorus_deficiency_percent, color: '#F9A825' },
    { name: 'Potassium (K)', percent: overview.potassium_deficiency_percent, color: '#2E7D32' },
    { name: 'Potential Overuse', percent: overview.potential_overuse_percent, color: '#E65100' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Regional Nutrient Intelligence Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Aggregated nutrient status & decision intelligence across Gujarat agricultural zones</p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 px-3.5 py-1.5 rounded-lg border border-emerald-200 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Real-time Sync Active</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Fields */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Fields Assessed</span>
            <Layers className="w-5 h-5 text-primary-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{overview.total_fields_assessed.toLocaleString()}</div>
          <p className="text-xs text-slate-500 mt-2 flex items-center">
            <span className="text-emerald-600 font-semibold flex items-center mr-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12%
            </span> vs previous season
          </p>
        </div>

        {/* Nitrogen Deficiency */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Nitrogen Deficit</span>
            <Flame className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-3xl font-extrabold text-red-600">{overview.nitrogen_deficiency_percent}%</div>
          <p className="text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded font-medium mt-2 inline-block">
            Priority Intervention Required
          </p>
        </div>

        {/* Phosphorus Deficiency */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Phosphorus Deficit</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{overview.phosphorus_deficiency_percent}%</div>
          <p className="text-xs text-slate-500 mt-2">Moderate deficiency in cotton belts</p>
        </div>

        {/* Overuse / Imbalance Risk */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Overuse / Leaching</span>
            <TrendingDown className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-extrabold text-orange-600">{overview.potential_overuse_percent}%</div>
          <p className="text-xs text-slate-500 mt-2">Excess chemical urea splitting risk</p>
        </div>
      </div>

      {/* Chart and Quick Priority Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deficiency Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1">Regional Nutrient Deficiency Profile (%)</h2>
          <p className="text-xs text-slate-500 mb-6">Percentage of assessed field samples testing below ICAR critical thresholds</p>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  formatter={(val: number) => [`${val}%`, 'Deficiency / Risk']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="percent" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Quality & Stale Soil Warning */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-slate-800 font-bold mb-1">
              <Calendar className="w-5 h-5 text-primary-500" />
              <h2>Soil Health Card Freshness</h2>
            </div>
            <p className="text-xs text-slate-500 mb-6">Age distribution of underlying soil test records</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Fresh (&lt; 6 months)</span>
                  <span className="text-emerald-600">62.0%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[62%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Moderate (6 - 12 months)</span>
                  <span className="text-amber-600">23.2%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[23.2%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Stale (&gt; 12 months)</span>
                  <span className="text-red-600">{overview.stale_soil_tests_percent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full w-[14.8%]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-600 mt-6 border border-slate-200/60">
            <strong>Extension Action Recommendation:</strong> Trigger mobile soil testing drive in Gondal and Babra blocks.
          </div>
        </div>
      </div>

      {/* Village Priority Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Priority Intervention Villages</h2>
            <p className="text-xs text-slate-500 mt-0.5">Villages exhibiting critical nitrogen deficits or continuous chemical over-application</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Village / Block</th>
                <th className="px-6 py-3.5">District</th>
                <th className="px-6 py-3.5">Fields Assessed</th>
                <th className="px-6 py-3.5">Nitrogen Deficit</th>
                <th className="px-6 py-3.5">Phosphorus Deficit</th>
                <th className="px-6 py-3.5">Overuse Risk</th>
                <th className="px-6 py-3.5">Top Crops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {village_breakdown.map((v, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{v.village} <span className="text-slate-400 font-normal">({v.block})</span></td>
                  <td className="px-6 py-4">{v.district}</td>
                  <td className="px-6 py-4 font-medium">{v.fields_count.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-red-600">{v.nitrogen_deficiency_percent}%</span>
                  </td>
                  <td className="px-6 py-4 font-medium">{v.phosphorus_deficiency_percent}%</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      v.overuse_risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                      v.overuse_risk_level === 'MODERATE' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {v.overuse_risk_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">
                    {v.top_crops.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
