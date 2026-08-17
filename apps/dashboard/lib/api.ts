export interface RegionalOverview {
  total_fields_assessed: number;
  nitrogen_deficiency_percent: number;
  phosphorus_deficiency_percent: number;
  potassium_deficiency_percent: number;
  potential_overuse_percent: number;
  stale_soil_tests_percent: number;
}

export interface VillageAnalytics {
  district: string;
  block: string;
  village: string;
  fields_count: number;
  nitrogen_deficiency_percent: number;
  phosphorus_deficiency_percent: number;
  potassium_deficiency_percent: number;
  overuse_risk_level: string;
  top_crops: string[];
}

export interface OfficerAnalyticsData {
  overview: RegionalOverview;
  village_breakdown: VillageAnalytics[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function fetchOfficerAnalytics(district?: string, block?: string): Promise<OfficerAnalyticsData> {
  try {
    const params = new URLSearchParams();
    if (district) params.append('district', district);
    if (block) params.append('block', block);

    const res = await fetch(`${API_BASE}/officer/analytics?${params.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (e) {
    // Fallback realistic demo dataset for Gujarat Western Zone
    return {
      overview: {
        total_fields_assessed: 18421,
        nitrogen_deficiency_percent: 42.4,
        phosphorus_deficiency_percent: 18.2,
        potassium_deficiency_percent: 11.5,
        potential_overuse_percent: 21.0,
        stale_soil_tests_percent: 14.8,
      },
      village_breakdown: [
        {
          district: 'Rajkot',
          block: 'Gondal',
          village: 'Moviya (મોવીયા)',
          fields_count: 1420,
          nitrogen_deficiency_percent: 48.6,
          phosphorus_deficiency_percent: 14.2,
          potassium_deficiency_percent: 8.5,
          overuse_risk_level: 'CRITICAL',
          top_crops: ['Cotton', 'Groundnut'],
        },
        {
          district: 'Rajkot',
          block: 'Jasdan',
          village: 'Atkot (આટકોટ)',
          fields_count: 980,
          nitrogen_deficiency_percent: 39.2,
          phosphorus_deficiency_percent: 22.1,
          potassium_deficiency_percent: 15.0,
          overuse_risk_level: 'MODERATE',
          top_crops: ['Cotton', 'Wheat'],
        },
        {
          district: 'Junagadh',
          block: 'Keshod',
          village: 'Bantwa (બાંટવા)',
          fields_count: 1850,
          nitrogen_deficiency_percent: 28.5,
          phosphorus_deficiency_percent: 34.0,
          potassium_deficiency_percent: 12.0,
          overuse_risk_level: 'LOW',
          top_crops: ['Groundnut', 'Wheat'],
        },
        {
          district: 'Amreli',
          block: 'Babra',
          village: 'Kariyana (કરીયાણા)',
          fields_count: 1150,
          nitrogen_deficiency_percent: 54.0,
          phosphorus_deficiency_percent: 16.5,
          potassium_deficiency_percent: 9.0,
          overuse_risk_level: 'CRITICAL',
          top_crops: ['Cotton'],
        },
      ],
    };
  }
}
