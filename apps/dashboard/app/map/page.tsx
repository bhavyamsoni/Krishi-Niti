'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Info, Layers, Filter } from 'lucide-react';

const REGIONS = [
  { id: '1', name: 'Moviya (Gondal)', lat: 21.9619, lng: 70.7923, status: 'CRITICAL', nDef: '48.6%', fields: 1420, crops: 'Cotton, Groundnut' },
  { id: '2', name: 'Atkot (Jasdan)', lat: 22.0125, lng: 71.2014, status: 'MODERATE', nDef: '39.2%', fields: 980, crops: 'Cotton, Wheat' },
  { id: '3', name: 'Bantwa (Keshod)', lat: 21.4930, lng: 70.0820, status: 'NORMAL', nDef: '28.5%', fields: 1850, crops: 'Groundnut, Wheat' },
  { id: '4', name: 'Kariyana (Babra)', lat: 21.8480, lng: 71.3050, status: 'CRITICAL', nDef: '54.0%', fields: 1150, crops: 'Cotton' },
];

export default function PriorityMapPage() {
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Regional Priority & Nutrient Heat Map</h1>
          <p className="text-sm text-slate-500 mt-1">Spatial intelligence showing localized nutrient deficiency clusters across Gujarat blocks</p>
        </div>
        <div className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm">
          <Filter className="w-4 h-4 text-slate-500" />
          <span>All Crops • Nitrogen Deficiency Layer</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container View */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 relative min-h-[500px] flex flex-col">
          <div className="bg-slate-100 rounded-xl flex-1 relative overflow-hidden flex items-center justify-center p-6 border border-slate-200">
            {/* Visual Interactive Map Representation */}
            <div className="w-full h-full min-h-[420px] bg-emerald-50/50 rounded-xl relative border border-emerald-200/60 p-6 flex flex-col justify-between">
              {/* Map Legend */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-md text-xs space-y-2 z-10">
                <p className="font-bold text-slate-800">Deficiency Severity</p>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-red-600"></span>
                  <span>Critical (&gt; 40% Deficit)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span>Moderate (20-40%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                  <span>Normal / Optimal</span>
                </div>
              </div>

              {/* Clickable Map Pins */}
              <div className="relative w-full h-full flex items-center justify-center">
                {REGIONS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRegion(r)}
                    className={`absolute p-3 rounded-2xl font-bold text-xs flex items-center space-x-2 shadow-lg transition-transform hover:scale-110 ${
                      r.id === selectedRegion.id ? 'ring-4 ring-primary-500 scale-105' : ''
                    } ${
                      r.status === 'CRITICAL' ? 'bg-red-600 text-white' :
                      r.status === 'MODERATE' ? 'bg-amber-500 text-white' :
                      'bg-emerald-600 text-white'
                    }`}
                    style={{
                      top: r.id === '1' ? '40%' : r.id === '2' ? '25%' : r.id === '3' ? '65%' : '50%',
                      left: r.id === '1' ? '45%' : r.id === '2' ? '65%' : r.id === '3' ? '25%' : '75%',
                    }}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>{r.name} ({r.nDef})</span>
                  </button>
                ))}
              </div>

              <div className="text-right text-[11px] text-slate-400">
                OpenStreetMap / Leaflet GeoJSON Layer • Gujarat Division
              </div>
            </div>
          </div>
        </div>

        {/* Region Detail Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                selectedRegion.status === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                selectedRegion.status === 'MODERATE' ? 'bg-amber-100 text-amber-800' :
                'bg-emerald-100 text-emerald-800'
              }`}>
                {selectedRegion.status} PRIORITY
              </span>
              <span className="text-xs text-slate-400">ID: REG-{selectedRegion.id}042</span>
            </div>

            <h2 className="text-xl font-extrabold text-slate-900">{selectedRegion.name}</h2>
            <p className="text-xs text-slate-500 mt-1">Saurashtra Agricultural Region, Gujarat</p>

            <div className="mt-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold">Nitrogen Deficiency Rate</span>
                <div className="text-2xl font-black text-red-600 mt-1">{selectedRegion.nDef}</div>
                <p className="text-[11px] text-slate-500 mt-1">Of 420 soil samples tested in past 60 days</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold">Fields Assessed</span>
                  <div className="text-lg font-bold text-slate-800 mt-1">{selectedRegion.fields.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold">Dominant Crops</span>
                  <div className="text-xs font-bold text-slate-800 mt-1.5 truncate">{selectedRegion.crops}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <button className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-xl shadow-md transition-all">
              Initiate Extension Campaign for this Region
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
