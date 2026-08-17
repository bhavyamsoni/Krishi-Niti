'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Database,
  FileText,
  Sprout,
  ShieldCheck
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Regional Overview', href: '/overview', icon: LayoutDashboard },
  { name: 'Priority Map', href: '/map', icon: MapPin },
  { name: 'Nutrient Trends', href: '/trends', icon: TrendingUp },
  { name: 'Priority Intervention Areas', href: '/priority', icon: AlertTriangle },
  { name: 'Data Freshness & Quality', href: '/quality', icon: Database },
  { name: 'Government Reports', href: '/reports', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-primary-700 text-white min-h-screen flex flex-col border-r border-primary-600">
      {/* Brand Header */}
      <div className="p-6 border-b border-primary-600 flex items-center space-x-3">
        <div className="bg-primary-500 p-2 rounded-xl">
          <Sprout className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">KrishiNiti</h1>
          <p className="text-xs text-primary-200 font-medium">Officer Intelligence</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href === '/overview' && pathname === '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-primary-100 hover:bg-primary-600 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Privacy Notice Card */}
      <div className="p-4 m-4 bg-primary-600/50 rounded-xl border border-primary-500/30 text-xs text-primary-100 flex items-start space-x-2">
        <ShieldCheck className="w-5 h-5 text-primary-accent flex-shrink-0 mt-0.5" />
        <p>
          <strong>Privacy Guaranteed:</strong> Field metrics are anonymized & aggregated. No farmer PII exposed.
        </p>
      </div>

      {/* User Info Footer */}
      <div className="p-4 border-t border-primary-600 flex items-center justify-between text-xs text-primary-200">
        <div>
          <p className="font-semibold text-white">Agriculture Officer</p>
          <p>Gujarat State Division</p>
        </div>
        <span className="inline-block w-2.5 h-2.5 bg-emerald-400 rounded-full"></span>
      </div>
    </aside>
  );
}
