'use client';

import React from 'react';
import { Bell, Search, Globe, Sprout, Building2, Sun, Moon } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { switchRole, officerName } = useRole();
  const { isDark, toggle } = useTheme();

  return (
    <header className="h-16 bg-white dark:bg-[#141b22] border-b border-slate-200 dark:border-slate-700 px-8 flex items-center justify-between shadow-sm sticky top-0 z-30">
      {/* Search Filter */}
      <div className="flex items-center space-x-3 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by district, block, or village..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
          <Globe className="w-4 h-4 text-primary-500" />
          <span>Gujarat Zone (ગુજરાત ઝોન)</span>
        </div>

        {/* Portal Switcher Button */}
        <button
          onClick={() => switchRole('farmer')}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-700 text-xs font-bold transition-all"
        >
          <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Farmer Portal →</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggle}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>

        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            AO
          </div>
          <div className="hidden md:block text-left text-xs">
            <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight">{officerName}</p>
            <p className="text-slate-400 dark:text-slate-500">Govt. of Gujarat</p>
          </div>
        </div>
      </div>
    </header>
  );
}
