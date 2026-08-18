import React from 'react';
import './globals.css';
import { RoleProvider } from '../context/RoleContext';
import { ThemeProvider } from '../context/ThemeContext';
import AppShell from '../components/AppShell';

export const metadata = {
  title: 'KrishiNiti — Precision Nutrient & Agronomic Decision Platform',
  description: 'Dual-portal agricultural intelligence: Farmer Precision Fertilizer Logger & Officer Regional Nutrient Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-[#0c1117] text-slate-900 dark:text-slate-100 font-sans antialiased">
        <ThemeProvider>
          <RoleProvider>
            <AppShell>{children}</AppShell>
          </RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
