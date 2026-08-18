'use client';

import React from 'react';
import { ShieldAlert, Lock, ArrowRight, UserCheck, Sprout, Building2 } from 'lucide-react';
import { useRole } from '../context/RoleContext';

export default function OfficerAccessGuard() {
  const { switchRole, farmerName } = useRole();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white dark:bg-[#141b22] rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden text-center p-8 md:p-10 space-y-6">
        {/* Shield Icon */}
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 shadow-inner">
          <ShieldAlert className="w-10 h-10" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-700">
            <Lock className="w-3.5 h-3.5" />
            <span>Administrative Access Restricted</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Agriculture Officer Portal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            You are currently in <strong className="text-slate-800 dark:text-slate-200">Farmer Mode ({farmerName})</strong>.
            District telemetry, village aggregate deficiency reports, and government policy analytics are restricted to authorized officers.
          </p>
        </div>

        {/* Explanatory Box */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs text-slate-600 dark:text-slate-400 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-slate-800 dark:text-slate-200">
            <Building2 className="w-4 h-4 text-primary-500" />
            <span>Access Policy & Privacy Shield:</span>
          </div>
          <p>
            Farmers have exclusive access to their own plots, fertilizer logs, soil health cards, and precision recommendations in the <strong>Farmer Portal</strong> without exposure of district-level governmental metrics.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => switchRole('farmer')}
            className="w-full sm:w-auto px-6 py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm"
          >
            <Sprout className="w-4 h-4" />
            <span>Go to Farmer Portal</span>
          </button>

          <button
            onClick={() => switchRole('officer')}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold rounded-2xl shadow transition-all flex items-center justify-center space-x-2 text-sm"
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Authenticate as Officer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
