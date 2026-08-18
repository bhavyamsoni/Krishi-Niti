'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import OfficerAccessGuard from './OfficerAccessGuard';
import { useRole } from '../context/RoleContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isFarmer } = useRole();

  const isFarmerRoute = pathname.startsWith('/farmer');

  // Farmer route → standalone farmer layout (no officer sidebar)
  if (isFarmerRoute) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0c1117] flex flex-col">
        {children}
      </div>
    );
  }

  // Officer route but active role is Farmer → show access guard
  if (isFarmer) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0c1117] flex flex-col">
        <OfficerAccessGuard />
      </div>
    );
  }

  // Full Officer layout with sidebar + navbar
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0c1117]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
