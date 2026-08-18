'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, MapPin, TrendingUp, AlertTriangle,
  Database, FileText, Sprout, ShieldCheck, Building2
} from 'lucide-react';
import { useRole } from '../context/RoleContext';

const OFFICER_NAV = [
  { name: 'Regional Overview', href: '/overview', icon: LayoutDashboard },
  { name: 'Priority Map', href: '/map', icon: MapPin },
  { name: 'Nutrient Trends', href: '/trends', icon: TrendingUp },
  { name: 'Priority Intervention Areas', href: '/priority', icon: AlertTriangle },
  { name: 'Data Freshness & Quality', href: '/quality', icon: Database },
  { name: 'Government Reports', href: '/reports', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { switchRole } = useRole();

  return (
    <aside className="w-64 bg-primary-700 dark:bg-slate-900 text-white min-h-screen flex flex-col border-r border-primary-600 dark:border-slate-700 flex-shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-primary-600 dark:border-slate-700 flex items-center space-x-3">
        <div className="bg-primary-500 dark:bg-emerald-700 p-2 rounded-xl shadow-inner">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">KrishiNiti</h1>
          <p className="text-xs text-primary-200 dark:text-slate-400 font-medium">Officer Intelligence</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary-300 dark:text-slate-500 px-4 mb-2">
          Administrative Tools
        </p>
        {OFFICER_NAV.map((item) => {
          const isActive = pathname === item.href || (item.href === '/overview' && pathname === '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-500 dark:bg-emerald-700 text-white shadow-md font-semibold'
                  : 'text-primary-100 dark:text-slate-400 hover:bg-primary-600 dark:hover:bg-slate-700 hover:text-white dark:hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Switch to Farmer Portal Action Card */}
      <div className="px-4 py-2">
        <button
          onClick={() => switchRole('farmer')}
          className="w-full p-3 bg-emerald-700/80 dark:bg-emerald-800/60 hover:bg-emerald-600/90 dark:hover:bg-emerald-700/80 text-white rounded-xl border border-emerald-500/40 text-xs font-bold flex items-center justify-between transition-all group"
        >
          <div className="flex items-center space-x-2">
            <Sprout className="w-4 h-4 text-emerald-300" />
            <span>Open Farmer Portal</span>
          </div>
          <span className="text-emerald-300 group-hover:translate-x-0.5 transition-transform">→</span>
        </button>
      </div>

      {/* Privacy Notice Card */}
      <div className="p-4 m-4 bg-primary-600/50 dark:bg-slate-800/60 rounded-xl border border-primary-500/30 dark:border-slate-700 text-xs text-primary-100 dark:text-slate-400 flex items-start space-x-2">
        <ShieldCheck className="w-5 h-5 text-primary-accent flex-shrink-0 mt-0.5" />
        <p>
          <strong>Privacy Guaranteed:</strong> Field metrics are anonymized & aggregated. No farmer PII exposed.
        </p>
      </div>

      {/* User Info Footer */}
      <div className="p-4 border-t border-primary-600 dark:border-slate-700 flex items-center justify-between text-xs text-primary-200 dark:text-slate-500">
        <div>
          <p className="font-semibold text-white">Agriculture Officer</p>
          <p>Gujarat State Division</p>
        </div>
        <span className="inline-block w-2.5 h-2.5 bg-emerald-400 rounded-full"></span>
      </div>
    </aside>
  );
}
