'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export type UserRole = 'officer' | 'farmer';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  isOfficer: boolean;
  isFarmer: boolean;
  farmerName: string;
  officerName: string;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('officer');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Determine initial role from URL or localStorage
    const saved = localStorage.getItem('krishiniti_role') as UserRole | null;
    if (pathname.startsWith('/farmer')) {
      setRoleState('farmer');
    } else if (saved === 'farmer' || saved === 'officer') {
      setRoleState(saved);
    } else {
      setRoleState('officer');
    }
    setMounted(true);
  }, [pathname]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('krishiniti_role', newRole);
    }
  };

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'farmer') {
      router.push('/farmer');
    } else {
      router.push('/overview');
    }
  };

  const value: RoleContextType = {
    role,
    setRole,
    switchRole,
    isOfficer: role === 'officer',
    isFarmer: role === 'farmer',
    farmerName: 'Ramesh Patel (રમેશ પટેલ)',
    officerName: 'Dr. Vivek Joshi (Agronomy Division)',
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
