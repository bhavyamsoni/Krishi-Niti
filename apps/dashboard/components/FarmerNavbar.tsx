'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sprout, Tractor, Layers, FlaskConical, Zap,
  CloudRain, Building2, PackageCheck, Sun, Moon
} from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { useTheme } from '../context/ThemeContext';

interface FarmerNavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  lang?: 'en' | 'hi' | 'gu';
  onLangChange?: (lang: 'en' | 'hi' | 'gu') => void;
}

const TABS = [
  { id: 'fields',      name: 'My Fields & Plots',              icon: Layers,       gu: 'મારા ખેતરો',         hi: 'मेरे खेत' },
  { id: 'fertilizer',  name: 'Fertilizer Logger & Management', icon: PackageCheck, gu: 'ખાતર વ્યવસ્થાપન',   hi: 'उर्वरक प्रबंधन' },
  { id: 'soil',        name: 'Soil Health Cards',              icon: FlaskConical, gu: 'જમીન આરોગ્ય કાર્ડ', hi: 'मृदा स्वास्थ्य कार्ड' },
  { id: 'advisory',    name: 'Precision Fertilizer Advisory',  icon: Zap,          gu: 'ખાતર ભલામણ',        hi: 'उर्वरक सलाह' },
  { id: 'weather',     name: 'Weather & Spray Window',         icon: CloudRain,    gu: 'હવામાન આગાહી',       hi: 'मौसम पूर्वानुमान' },
];

export default function FarmerNavbar({
  activeTab = 'fields',
  onTabChange,
  lang = 'en',
  onLangChange
}: FarmerNavbarProps) {
  const { switchRole, farmerName } = useRole();
  const { isDark, toggle } = useTheme();

  return (
    <header className="bg-white dark:bg-[#141b22] border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 shadow-sm">
      {/* Top Banner: Brand, Farmer Profile, and Role Switcher */}
      <div className="px-6 py-3.5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between flex-wrap gap-3">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-sm">
            <Tractor className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">KrishiNiti</span>
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold rounded-full">
                FARMER PORTAL
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Precision Fertilizer & Soil Nutrient Intelligence</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-2">
          {/* Language Selector */}
          {onLangChange && (
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              {(['en', 'hi', 'gu'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => onLangChange(l)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    lang === l
                      ? 'bg-white dark:bg-slate-600 text-emerald-700 dark:text-emerald-300 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'hi' ? 'हिंदी' : 'ગુજ'}
                </button>
              ))}
            </div>
          )}

          {/* Farmer Profile Badge */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-700 text-xs font-semibold">
            <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{farmerName}</span>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggle}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Role Switcher to Officer */}
          <button
            onClick={() => switchRole('officer')}
            className="flex items-center space-x-2 px-3.5 py-1.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Building2 className="w-3.5 h-3.5 text-primary-300" />
            <span>Officer Portal →</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation Bar */}
      {onTabChange && (
        <div className="px-6 flex items-center space-x-1 overflow-x-auto scrollbar-none bg-white dark:bg-[#141b22]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const label = lang === 'gu' ? tab.gu : lang === 'hi' ? tab.hi : tab.name;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
