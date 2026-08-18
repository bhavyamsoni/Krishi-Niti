'use client';

import React, { useState, useEffect, useCallback } from 'react';
import FarmerNavbar from '../../components/FarmerNavbar';
import {
  Tractor, Plus, FlaskConical, Zap, Leaf, CheckCircle2,
  AlertTriangle, RefreshCw, Sprout, Droplets,
  CloudRain, IndianRupee, Info, PackageCheck,
  Calendar, Layers, ArrowUpRight, Clock,
  TrendingUp, ShieldCheck, MapPin, Sparkles,
  Navigation, Crosshair, Trash2, Compass
} from 'lucide-react';

const API = 'http://127.0.0.1:8000/api/v1';

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  return res.json();
}

type Lang = 'en' | 'hi' | 'gu';

interface Field {
  id: string;
  name: string;
  area_acres: number;
  crop_id: string;
  current_stage_id: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
}

interface FertilizerApp {
  id: string;
  field_id: string;
  product_id: string;
  quantity_kg: number;
  application_date: string;
  growth_stage_id: string;
  notes?: string;
  created_at?: string;
}

interface SoilTest {
  id: string;
  field_id: string;
  test_date: string;
  nitrogen_n: number;
  phosphorus_p: number;
  potassium_k: number;
  ph: number;
  organic_carbon: number;
  quality_status?: string;
}

interface Dosage {
  product_id: string;
  product_name_keys: { en: string; hi: string; gu: string };
  quantity_bags: number;
  quantity_kg: number;
  total_cost_inr: number;
}

interface EngineOutput {
  rule_version: string;
  nutrient_status: {
    nitrogen: string;
    phosphorus: string;
    potassium: string;
    organic_carbon: string;
    ph_classification: string;
  };
  recommended_nutrients_gap_kg_ha: { n_kg: number; p_kg: number; k_kg: number };
  dosages: Dosage[];
  timing_action: string;
  timing_message_keys: { en: string; hi?: string; gu?: string };
  confidence_level: string;
  confidence_reasons: string[];
  sustainability_warnings: string[];
  explanation_keys: { en: string; hi?: string; gu?: string }[];
  estimated_total_cost_inr: number;
}

interface FertilizerProduct {
  id: string;
  name: string;
  grade: string;
  n_percent: number;
  p_percent: number;
  k_percent: number;
  bag_weight_kg: number;
  default_price_inr: number;
}

const CROPS = [
  { id: 'cotton',    en: 'Cotton',    gu: 'કપાસ (Cotton)',          hi: 'कपास (Cotton)' },
  { id: 'wheat',     en: 'Wheat',     gu: 'ઘઉં (Wheat)',            hi: 'गेहूं (Wheat)' },
  { id: 'rice',      en: 'Rice',      gu: 'ડાંગર / ચોખા (Rice)',   hi: 'धान / चावल (Rice)' },
  { id: 'groundnut', en: 'Groundnut', gu: 'મગફળી (Groundnut)',      hi: 'मूंगफली (Groundnut)' },
  { id: 'maize',     en: 'Maize',     gu: 'મકાઈ (Maize)',           hi: 'मक्का (Maize)' },
];

const STAGES: Record<string, { id: string; en: string; gu: string; hi: string }[]> = {
  cotton: [
    { id: 'basal',            en: 'Basal / Sowing',          gu: 'વાવણી પૂર્વ / પાયાનું ખાતર', hi: 'बुवाई पूर्व / बेसल' },
    { id: 'vegetative',       en: 'Vegetative (30-45 DAS)',  gu: 'વાનસ્પતિક વૃદ્ધિ (30-45 દિવસ)', hi: 'वानस्पतिक वृद्धि' },
    { id: 'flowering',        en: 'Square / Flowering',      gu: 'ચાપવા / ફૂલ અવસ્થા',          hi: 'फूल / कली अवस्था' },
    { id: 'boll_development', en: 'Boll Development',        gu: 'ઢીંડવા વિકાસ અવસ્થા',          hi: 'टिंडे का विकास' },
  ],
  wheat: [
    { id: 'basal',    en: 'Basal / Sowing',                  gu: 'પાયાનું ખાતર',                   hi: 'बुवाई पूर्व / बेसल' },
    { id: 'tillering',en: 'Crown Root / Tillering (21 DAS)', gu: 'કૂંટ ફૂટવાની અવસ્થા (21 દિવસ)', hi: 'कल्ले निकलने की अवस्था' },
    { id: 'jointing', en: 'Jointing Stage',                  gu: 'ગાંઠ પડવાની અવસ્થા',              hi: 'गांठ बनने की अवस्था' },
    { id: 'heading',  en: 'Heading / Grain Fill',            gu: 'ડૂંડી નીકળવાની / દાણા ભરાવાની',  hi: 'बाली / दाना भराव अवस्था' },
  ],
  rice: [
    { id: 'basal',    en: 'Basal / Transplanting', gu: 'રોપણી પૂર્વ પાયાનું ખાતર', hi: 'रोपाई पूर्व बेसल' },
    { id: 'tillering',en: 'Active Tillering',       gu: 'પીળા ફૂટવાની અવસ્થા',       hi: 'कल्ले फूटने की अवस्था' },
    { id: 'panicle',  en: 'Panicle Initiation',    gu: 'કણસલાં ગર્ભ અવસ્થા',        hi: 'बाली निर्माण' },
    { id: 'heading',  en: 'Heading & Grain Fill',  gu: 'દાણા દૂધિયા અવસ્થા',        hi: 'दूधिया / दाना भराव' },
  ],
  groundnut: [
    { id: 'basal',     en: 'Basal / Sowing',          gu: 'વાવણી પાયાનું ખાતર',           hi: 'बुवाई पूर्व बेसल' },
    { id: 'vegetative',en: 'Vegetative Growth',        gu: 'વાનસ્પતિક વૃદ્ધિ',              hi: 'वानस्पतिक वृद्धि' },
    { id: 'flowering', en: 'Flowering & Pegging',      gu: 'ફૂલ અને સૂયા બેસવાની અવસ્થા', hi: 'फूल और सुइयां बनना' },
    { id: 'pod_fill',  en: 'Pod Development',          gu: 'ડોડવા ભરાવાની અવસ્થા',         hi: 'फली दाना भराव' },
  ],
  maize: [
    { id: 'basal',     en: 'Basal / Sowing',      gu: 'પાયાનું ખાતર',               hi: 'बुवाई पूर्व बेसल' },
    { id: 'vegetative',en: 'Knee-High / V6',       gu: 'ગોઠણ સમાન ઊંચાઈ (V6)',      hi: 'घुटने तक ऊंचाई' },
    { id: 'tasseling', en: 'Tasseling & Silking',  gu: 'નર અને માદા ફૂલ અવસ્થા',    hi: 'मंजरी / सिल्क अवस्था' },
    { id: 'grain_fill',en: 'Grain Filling',        gu: 'દાણા ભરાવ અવસ્થા',           hi: 'दाना भराव' },
  ],
};

const APPLICATION_METHODS = [
  { id: 'broadcasting', label: 'Broadcasting / Surface Spreading (છંટકાવ)',    icon: '🌾' },
  { id: 'fertigation',  label: 'Fertigation / Drip Irrigation (ડ્રિપ દ્વારા)', icon: '💧' },
  { id: 'foliar',       label: 'Foliar Spray (પાંદડા પર સ્પ્રે)',               icon: '🌿' },
  { id: 'band',         label: 'Band Placement / Root Zone (પાળીમાં મૂકવું)',   icon: '🌱' },
];

function t(obj: Record<string, string> | undefined, lang: Lang): string {
  if (!obj) return '';
  return obj[lang] ?? obj['en'] ?? '';
}

export default function FarmerPortalPage() {
  const [activeTab, setActiveTab] = useState<string>('fertilizer');
  const [lang, setLang] = useState<Lang>('en');
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Dynamic Products List
  const [products, setProducts] = useState<FertilizerProduct[]>([]);

  // Fertilizer Application form state
  const [applications, setApplications] = useState<FertilizerApp[]>([]);
  const [appProductId, setAppProductId] = useState<string>('urea');
  const [appQuantity, setAppQuantity] = useState<string>('');
  const [appUnit, setAppUnit] = useState<'bags' | 'kg'>('bags');
  const [appDate, setAppDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [appStage, setAppStage] = useState<string>('vegetative');
  const [appMethod, setAppMethod] = useState<string>('broadcasting');
  const [appNotes, setAppNotes] = useState<string>('');

  // Field creation form state & Live Location
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldArea, setNewFieldArea] = useState('');
  const [newCropId, setNewCropId] = useState('cotton');
  const [newStageId, setNewStageId] = useState('vegetative');
  const [liveLat, setLiveLat] = useState<number | null>(null);
  const [liveLon, setLiveLon] = useState<number | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Soil test form state
  const [soilTests, setSoilTests] = useState<SoilTest[]>([]);
  const [soilN, setSoilN] = useState('');
  const [soilP, setSoilP] = useState('');
  const [soilK, setSoilK] = useState('');
  const [soilPH, setSoilPH] = useState('');
  const [soilOC, setSoilOC] = useState('');

  // Recommendation & Weather state
  const [recommendation, setRecommendation] = useState<EngineOutput | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);

  const selectedField = fields.find((f) => f.id === selectedFieldId) || fields[0] || null;

  const showNotify = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // ── Automatic Live Location Detection ─────────────────────────────────────
  const detectLiveLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lon = parseFloat(pos.coords.longitude.toFixed(6));
        const acc = Math.round(pos.coords.accuracy);

        setLiveLat(lat);
        setLiveLon(lon);
        setLocationAccuracy(acc);
        setIsLocating(false);

        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
            { headers: { 'User-Agent': 'KrishiNiti-App/1.0' } }
          );
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            const addr = geoData.address || {};
            const locality =
              addr.village || addr.town || addr.suburb || addr.city || addr.county || addr.state_district || '';
            const district = addr.state_district || addr.county || addr.state || '';
            const fullDesc = [locality, district].filter(Boolean).join(', ');
            if (fullDesc) {
              setLocationAddress(fullDesc);
              if (!newFieldName.trim()) {
                setNewFieldName(`${locality} Farm Plot`);
              }
            }
          }
        } catch (e) {
          console.warn('Reverse geocoding error (non-fatal):', e);
        }
      },
      (err) => {
        setIsLocating(false);
        let errMsg = 'Unable to retrieve location.';
        if (err.code === err.PERMISSION_DENIED) {
          errMsg = 'Location permission denied. You can still enter farm details.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errMsg = 'GPS signal unavailable.';
        }
        setLocationError(errMsg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [newFieldName]);

  const loadProducts = async () => {
    try {
      const data = await apiFetch('/applications/products');
      if (Array.isArray(data) && data.length > 0) setProducts(data);
    } catch (e) { console.error(e); }
  };

  const loadFields = async () => {
    try {
      const data = await apiFetch('/fields');
      if (Array.isArray(data)) {
        setFields(data);
        if (data.length > 0 && !selectedFieldId) setSelectedFieldId(data[0].id);
      }
    } catch (e) { console.error(e); }
  };

  const loadApplications = async (fieldId: string) => {
    if (!fieldId) { setApplications([]); return; }
    try {
      const data = await apiFetch(`/applications/field/${fieldId}`);
      if (Array.isArray(data)) setApplications(data);
    } catch (e) { console.error(e); }
  };

  const loadSoilTests = async (fieldId: string) => {
    if (!fieldId) { setSoilTests([]); return; }
    try {
      const data = await apiFetch(`/soil-tests/field/${fieldId}`);
      if (Array.isArray(data)) setSoilTests(data);
    } catch (e) { console.error(e); }
  };

  const loadWeather = async (fieldId: string) => {
    if (!fieldId) return;
    try {
      const data = await apiFetch(`/weather/${fieldId}`);
      if (data && !data.detail) setWeatherData(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadProducts();
    loadFields();
    detectLiveLocation();
  }, []);

  useEffect(() => {
    if (selectedField?.id) {
      loadApplications(selectedField.id);
      loadSoilTests(selectedField.id);
      loadWeather(selectedField.id);
      setRecommendation(null);
    } else {
      setApplications([]);
      setSoilTests([]);
      setWeatherData(null);
      setRecommendation(null);
    }
  }, [selectedField?.id]);

  const handleRecordApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedField) { showNotify('Please create a farm field first.', 'error'); return; }

    const prod = products.find((p) => p.id === appProductId);
    const bagKg = prod?.bag_weight_kg || 50;
    const qtyKg = appUnit === 'bags' ? parseFloat(appQuantity) * bagKg : parseFloat(appQuantity);

    if (!appQuantity || isNaN(qtyKg) || qtyKg <= 0) {
      showNotify('Please enter a valid quantity of fertilizer.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/applications', {
        method: 'POST',
        body: JSON.stringify({
          field_id: selectedField.id,
          product_id: appProductId,
          quantity_kg: qtyKg,
          application_date: appDate,
          growth_stage_id: appStage,
          notes: `${appMethod.toUpperCase()}${appNotes ? ` | ${appNotes}` : ''}`.trim(),
        }),
      });
      setLoading(false);
      if (res.id) {
        showNotify(`Recorded ${qtyKg} kg of ${prod?.name || appProductId} successfully!`);
        setAppQuantity('');
        setAppNotes('');
        loadApplications(selectedField.id);
      } else {
        showNotify(res.detail || 'Failed to record fertilizer application.', 'error');
      }
    } catch (err: any) {
      setLoading(false);
      showNotify('Error recording application: ' + err.message, 'error');
    }
  };

  const handleDeleteApplication = async (appId: string) => {
    if (!confirm('Are you sure you want to remove this fertilizer application record?')) return;
    try {
      const res = await apiFetch(`/applications/${appId}`, { method: 'DELETE' });
      if (res.message) {
        showNotify('Application record deleted.');
        if (selectedField?.id) loadApplications(selectedField.id);
      }
    } catch (e: any) {
      showNotify('Failed to delete application: ' + e.message, 'error');
    }
  };

  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) { showNotify('Please enter a name for your field plot.', 'error'); return; }
    const area = parseFloat(newFieldArea);
    if (!newFieldArea || isNaN(area) || area <= 0) {
      showNotify('Please enter a valid land area in acres.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/fields', {
        method: 'POST',
        body: JSON.stringify({
          name: newFieldName.trim(),
          area_acres: area,
          crop_id: newCropId,
          current_stage_id: newStageId,
          latitude: liveLat ?? 22.2587,
          longitude: liveLon ?? 71.1924,
        }),
      });
      setLoading(false);
      if (res.id) {
        showNotify(`Farm "${res.name}" created at live location!`);
        setNewFieldName('');
        setNewFieldArea('');
        await loadFields();
        setSelectedFieldId(res.id);
        setActiveTab('fertilizer');
      } else {
        showNotify(res.detail || 'Failed to create field.', 'error');
      }
    } catch (err: any) {
      setLoading(false);
      showNotify('Error creating field: ' + err.message, 'error');
    }
  };

  const handleDeleteField = async (fieldId: string, name: string) => {
    if (!confirm(`Delete farm "${name}" and all its logs?`)) return;
    try {
      const res = await apiFetch(`/fields/${fieldId}`, { method: 'DELETE' });
      if (res.message) {
        showNotify(`Farm "${name}" deleted.`);
        const remaining = fields.filter((f) => f.id !== fieldId);
        setFields(remaining);
        setSelectedFieldId(remaining[0]?.id || '');
      }
    } catch (e: any) {
      showNotify('Failed to delete field: ' + e.message, 'error');
    }
  };

  const handleSaveSoilTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedField) { showNotify('Please select or create a farm field first.', 'error'); return; }
    if (!soilN || !soilP || !soilK) {
      showNotify('Please enter Nitrogen, Phosphorus, and Potassium values from your Soil Health Card.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/soil-tests', {
        method: 'POST',
        body: JSON.stringify({
          field_id: selectedField.id,
          nitrogen_n: parseFloat(soilN),
          phosphorus_p: parseFloat(soilP),
          potassium_k: parseFloat(soilK),
          ph: soilPH ? parseFloat(soilPH) : 7.0,
          organic_carbon: soilOC ? parseFloat(soilOC) : 0.5,
          test_date: new Date().toISOString().split('T')[0],
        }),
      });
      setLoading(false);
      if (res.id) {
        showNotify('Soil Health Card record saved successfully!');
        setSoilN(''); setSoilP(''); setSoilK(''); setSoilPH(''); setSoilOC('');
        loadSoilTests(selectedField.id);
        setActiveTab('advisory');
      } else {
        showNotify(res.detail || 'Failed to save soil test.', 'error');
      }
    } catch (err: any) {
      setLoading(false);
      showNotify('Error saving soil test: ' + err.message, 'error');
    }
  };

  const handleGenerateRecommendation = async () => {
    if (!selectedField) { showNotify('Please create a farm field first.', 'error'); return; }
    setLoading(true);
    try {
      const res = await apiFetch('/recommendations', {
        method: 'POST',
        body: JSON.stringify({ field_id: selectedField.id, include_weather: true }),
      });
      setLoading(false);
      if (res.output_recommendation) {
        setRecommendation(res.output_recommendation);
        showNotify('Fertilizer Recommendation Plan generated successfully!');
      } else {
        showNotify(res.detail || 'Please record a Soil Health Card test for this field first.', 'error');
      }
    } catch (err: any) {
      setLoading(false);
      showNotify('Error generating recommendation: ' + err.message, 'error');
    }
  };

  // Live preview calculations
  const currentProduct = products.find((p) => p.id === appProductId);
  const enteredQtyKg =
    appUnit === 'bags'
      ? parseFloat(appQuantity || '0') * (currentProduct?.bag_weight_kg || 50)
      : parseFloat(appQuantity || '0');
  const previewN = ((enteredQtyKg * (currentProduct?.n_percent || 0)) / 100).toFixed(1);
  const previewP = ((enteredQtyKg * (currentProduct?.p_percent || 0)) / 100).toFixed(1);
  const previewK = ((enteredQtyKg * (currentProduct?.k_percent || 0)) / 100).toFixed(1);
  const previewCost = (
    currentProduct ? (enteredQtyKg / currentProduct.bag_weight_kg) * currentProduct.default_price_inr : 0
  ).toFixed(0);

  // Cumulative totals
  const totalAppliedN = applications.reduce((sum, a) => {
    const prod = products.find((p) => p.id === a.product_id);
    return sum + (a.quantity_kg * (prod?.n_percent || 0)) / 100;
  }, 0);
  const totalAppliedP = applications.reduce((sum, a) => {
    const prod = products.find((p) => p.id === a.product_id);
    return sum + (a.quantity_kg * (prod?.p_percent || 0)) / 100;
  }, 0);
  const totalAppliedK = applications.reduce((sum, a) => {
    const prod = products.find((p) => p.id === a.product_id);
    return sum + (a.quantity_kg * (prod?.k_percent || 0)) / 100;
  }, 0);
  const totalExpenditure = applications.reduce((sum, a) => {
    const prod = products.find((p) => p.id === a.product_id);
    return sum + (prod ? (a.quantity_kg / prod.bag_weight_kg) * prod.default_price_inr : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c1117] flex flex-col">
      {/* Standalone Farmer Navbar */}
      <FarmerNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        lang={lang}
        onLangChange={setLang}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 animate-bounce">
          <div
            className={`px-5 py-3 rounded-2xl shadow-xl border flex items-center space-x-3 text-sm font-bold ${
              notification.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-red-600 text-white border-red-500'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{notification.msg}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* Active Farm Selector Banner */}
        <div className="bg-white dark:bg-[#141b22] p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-700 font-black">
              🌾
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {lang === 'gu' ? 'પસંદ કરેલ ખેતર' : lang === 'hi' ? 'चयनित खेत' : 'Active Farm Plot'}
              </p>
              {fields.length > 0 ? (
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedField?.id || ''}
                    onChange={(e) => setSelectedFieldId(e.target.value)}
                    className="text-base font-extrabold text-slate-900 dark:text-white bg-transparent border-b-2 border-emerald-500 focus:outline-none cursor-pointer pr-4 py-0.5"
                  >
                    {fields.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.area_acres} Acres · {f.crop_id})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No farms added yet — Create your first farm below!</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('fields')}
              className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all border border-emerald-200 dark:border-emerald-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'gu' ? 'નવું ખેતર ઉમેરો' : lang === 'hi' ? 'नया खेत जोड़ें' : '+ Enter New Farm'}</span>
            </button>
            {fields.length > 0 && (
              <button
                onClick={() => setActiveTab('advisory')}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>{lang === 'gu' ? 'ખાતર ભલામણ' : lang === 'hi' ? 'उर्वरक सलाह' : 'Get Precision Plan'}</span>
              </button>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 1: FERTILIZER LOGGER & MANAGEMENT
           ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'fertilizer' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
                <PackageCheck className="w-7 h-7 text-emerald-600" />
                <span>
                  {lang === 'gu' ? 'ખાતર લોગ અને વ્યવસ્થાપન' : lang === 'hi' ? 'उर्वरक प्रबंधन एवं लॉग' : 'Fertilizer Application Logger'}
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Log every fertilizer dose applied to your farm, track pure N-P-K nutrient inflow, and record expenses.
              </p>
            </div>

            {/* Cumulative KPI Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#141b22] p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Nitrogen (N) Added</span>
                  <span className="text-red-500 font-bold text-xs">Pure N</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {totalAppliedN.toFixed(1)} <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">kg</span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Total across logged doses</p>
              </div>

              <div className="bg-white dark:bg-[#141b22] p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Phosphorus (P) Added</span>
                  <span className="text-amber-500 font-bold text-xs">P₂O₅</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {totalAppliedP.toFixed(1)} <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">kg</span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Root & stem nutrition</p>
              </div>

              <div className="bg-white dark:bg-[#141b22] p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Potassium (K) Added</span>
                  <span className="text-emerald-500 font-bold text-xs">K₂O</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {totalAppliedK.toFixed(1)} <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">kg</span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Plant immunity & drought resistance</p>
              </div>

              <div className="bg-white dark:bg-[#141b22] p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Fertilizer Cost</span>
                  <IndianRupee className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-600">
                  ₹{totalExpenditure.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Calculated at subsidised rates</p>
              </div>
            </div>

            {/* Application Entry Form & Live Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* The Form */}
              <div className="lg:col-span-2 bg-white dark:bg-[#141b22] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-700">
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-xl">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {lang === 'gu' ? 'નવું ખાતર લાગુ કરો / ઉમેરો' : lang === 'hi' ? 'नया उर्वरक प्रयोग दर्ज करें' : 'Record Fertilizer Application'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedField ? (
                        <>Adding dose for <strong className="text-slate-800 dark:text-slate-200">{selectedField.name}</strong> ({selectedField.area_acres} Acres)</>
                      ) : (
                        'Please create a farm field first to log fertilizer applications.'
                      )}
                    </p>
                  </div>
                </div>

                {fields.length === 0 ? (
                  <div className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-center space-y-3 border border-dashed border-slate-200 dark:border-slate-700">
                    <Tractor className="w-10 h-10 text-emerald-600 mx-auto" />
                    <p className="font-bold text-slate-800 dark:text-slate-200">You need to add a farm first</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Click below to enter your farm details with automatic GPS location detection.</p>
                    <button
                      onClick={() => setActiveTab('fields')}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all"
                    >
                      + Add Your Farm Plot Now
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRecordApplication} className="space-y-5">
                    {/* Product & Quantity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                          {lang === 'gu' ? 'ખાતરનો પ્રકાર (Product)' : lang === 'hi' ? 'उर्वरक उत्पाद' : 'Fertilizer Product *'}
                        </label>
                        <select
                          value={appProductId}
                          onChange={(e) => setAppProductId(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.grade}) — ₹{p.default_price_inr}/{p.bag_weight_kg}kg
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                          {lang === 'gu' ? 'જથ્થો (Quantity)' : lang === 'hi' ? 'मात्रा' : 'Quantity Applied *'}
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={appQuantity}
                            onChange={(e) => setAppQuantity(e.target.value)}
                            placeholder="e.g. 2 bags or 100 kg"
                            className="flex-1 px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            required
                          />
                          <select
                            value={appUnit}
                            onChange={(e) => setAppUnit(e.target.value as 'bags' | 'kg')}
                            className="px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          >
                            <option value="bags">Bags ({currentProduct?.bag_weight_kg || 50}kg)</option>
                            <option value="kg">Kilograms (kg)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Date & Growth Stage */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                          {lang === 'gu' ? 'ખાતર આપ્યાની તારીખ' : lang === 'hi' ? 'प्रयोग की तारीख' : 'Application Date *'}
                        </label>
                        <input
                          type="date"
                          value={appDate}
                          onChange={(e) => setAppDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                          {lang === 'gu' ? 'પાકનો તબક્કો (Growth Stage)' : lang === 'hi' ? 'फसल की अवस्था' : 'Crop Growth Stage'}
                        </label>
                        <select
                          value={appStage}
                          onChange={(e) => setAppStage(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          {(STAGES[selectedField?.crop_id || 'cotton'] || STAGES.cotton).map((st) => (
                            <option key={st.id} value={st.id}>
                              {lang === 'gu' ? st.gu : lang === 'hi' ? st.hi : st.en}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Application Method */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                        {lang === 'gu' ? 'ખાતર આપવાની રીત (Method)' : lang === 'hi' ? 'उर्वरक प्रयोग विधि' : 'Application Method'}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {APPLICATION_METHODS.map((m) => (
                          <button
                            type="button"
                            key={m.id}
                            onClick={() => setAppMethod(m.id)}
                            className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all flex flex-col justify-between ${
                              appMethod === m.id
                                ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-900 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-500'
                                : 'bg-white dark:bg-[#141b22] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <span className="text-base mb-1">{m.icon}</span>
                            <span className="leading-tight">{m.label.split('(')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notes / Brand Name */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                        {lang === 'gu' ? 'નોંધ / બ્રાન્ડ (વૈકલ્પિક)' : lang === 'hi' ? 'टिप्पणी / ब्रांड (वैकल्पिक)' : 'Notes & Brand Name (Optional)'}
                      </label>
                      <input
                        type="text"
                        value={appNotes}
                        onChange={(e) => setAppNotes(e.target.value)}
                        placeholder="e.g. IFFCO Neem Coated Urea, applied in morning irrigation"
                        className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading || !selectedField || !appQuantity}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm"
                    >
                      <PackageCheck className="w-5 h-5" />
                      <span>
                        {loading
                          ? 'Saving Application...'
                          : lang === 'gu'
                          ? 'ખાતર નોંધ સાચવો'
                          : lang === 'hi'
                          ? 'उर्वरक प्रविष्टि सहेजें'
                          : 'Record Fertilizer Application'}
                      </span>
                    </button>
                  </form>
                )}
              </div>

              {/* Inflow Live Preview Card */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-emerald-700 to-teal-800 text-white p-6 rounded-3xl shadow-md space-y-4">
                  <div className="flex items-center space-x-2 text-emerald-200 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    <span>Instant Nutrient Preview</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold">{currentProduct?.name || 'Selected Fertilizer'}</h3>
                    <p className="text-xs text-emerald-100 mt-0.5">
                      Grade: <span className="font-mono font-bold">{currentProduct?.grade || '—'}</span>
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur p-4 rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-emerald-100">Total Material Weight:</span>
                      <span className="font-bold">{enteredQtyKg} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-100">Estimated Cost:</span>
                      <span className="font-bold">₹{previewCost}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-600/60 space-y-2">
                    <p className="text-xs font-extrabold text-emerald-100 uppercase tracking-wide">
                      Pure Nutrients Supplied to Soil:
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white/15 p-2 rounded-xl">
                        <p className="text-lg font-black">{previewN} kg</p>
                        <p className="text-[10px] text-emerald-200 font-bold">Nitrogen (N)</p>
                      </div>
                      <div className="bg-white/15 p-2 rounded-xl">
                        <p className="text-lg font-black">{previewP} kg</p>
                        <p className="text-[10px] text-emerald-200 font-bold">Phos (P₂O₅)</p>
                      </div>
                      <div className="bg-white/15 p-2 rounded-xl">
                        <p className="text-lg font-black">{previewK} kg</p>
                        <p className="text-[10px] text-emerald-200 font-bold">Potash (K₂O)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subsidized Price Reference */}
                <div className="bg-white dark:bg-[#141b22] p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                  <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider">
                    <Info className="w-4 h-4 text-emerald-600" />
                    <span>Government Subsidised Rates</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {products.slice(0, 4).map((p) => (
                      <div key={p.id} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                        <span>{p.name}</span>
                        <span className="font-bold text-slate-900 dark:text-white">₹{p.default_price_inr.toFixed(0)} / {p.bag_weight_kg}kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Application History Log Table */}
            <div className="bg-white dark:bg-[#141b22] rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden space-y-4 p-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {lang === 'gu' ? 'ખાતરનો ઇતિહાસ (Application History)' : lang === 'hi' ? 'उर्वरक इतिहास' : 'Fertilizer Application History'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Chronological log of all fertilizers applied to {selectedField?.name || 'this farm'}
                  </p>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  {applications.length} Records
                </div>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <PackageCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No fertilizer applications logged yet</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Use the form above to record your first fertilizer application for this season.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">Product</th>
                        <th className="px-5 py-3">Quantity</th>
                        <th className="px-5 py-3">Est. Cost</th>
                        <th className="px-5 py-3">Stage</th>
                        <th className="px-5 py-3">Notes / Method</th>
                        <th className="px-5 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {applications.map((app) => {
                        const prod = products.find((p) => p.id === app.product_id);
                        const cost = prod ? (app.quantity_kg / prod.bag_weight_kg) * prod.default_price_inr : 0;
                        const bags = prod ? (app.quantity_kg / prod.bag_weight_kg).toFixed(1) : '-';
                        return (
                          <tr key={app.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                              {app.application_date}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="font-bold text-slate-800 dark:text-slate-200">{prod?.name || app.product_id}</span>
                              <span className="block text-[11px] text-slate-400">{prod?.grade}</span>
                            </td>
                            <td className="px-5 py-3.5 font-medium">
                              <span className="font-extrabold text-emerald-700 dark:text-emerald-400">{app.quantity_kg} kg</span>
                              <span className="block text-[11px] text-slate-400">({bags} bags)</span>
                            </td>
                            <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                              ₹{cost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </td>
                            <td className="px-5 py-3.5 text-xs font-semibold capitalize text-slate-600 dark:text-slate-400">
                              {app.growth_stage_id}
                            </td>
                            <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                              {app.notes || 'Standard application'}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <button
                                onClick={() => handleDeleteApplication(app.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                title="Delete application record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 2: MY FIELDS & LIVE GPS
           ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'fields' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
                  <Layers className="w-7 h-7 text-emerald-600" />
                  <span>{lang === 'gu' ? 'મારા ખેતરો અને લાઈવ લોકેશન' : lang === 'hi' ? 'मेरे खेत एवं लाइव लोकेशन' : 'My Farm Fields & Live Location'}</span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Enter new farm plots with automatic browser GPS location detection, acreage, and crop growth stages.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Existing Fields List */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Your Registered Farm Plots ({fields.length})</h2>

                {fields.length === 0 ? (
                  <div className="bg-white dark:bg-[#141b22] p-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-3">
                    <Tractor className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Farm Plots Registered Yet</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Use the form on the right to enter your farm. Your live GPS coordinates will be derived automatically!
                    </p>
                  </div>
                ) : (
                  fields.map((f) => {
                    const isSelected = f.id === selectedField?.id;
                    return (
                      <div
                        key={f.id}
                        onClick={() => setSelectedFieldId(f.id)}
                        className={`p-6 rounded-3xl border transition-all cursor-pointer bg-white dark:bg-[#141b22] ${
                          isSelected
                            ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between flex-wrap gap-3">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{f.name}</h3>
                              {isSelected && (
                                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-black rounded-full">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize">
                              Crop: <strong className="text-slate-800 dark:text-slate-200">{f.crop_id}</strong> · Stage:{' '}
                              <strong className="text-slate-800 dark:text-slate-200">{f.current_stage_id}</strong> · Area:{' '}
                              <strong className="text-slate-800 dark:text-slate-200">{f.area_acres} Acres</strong>
                            </p>
                            {f.latitude && f.longitude && (
                              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center space-x-1 font-mono">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                <span>GPS: {f.latitude.toFixed(4)}°N, {f.longitude.toFixed(4)}°E</span>
                              </p>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedFieldId(f.id); setActiveTab('fertilizer'); }}
                              className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-700 transition-all"
                            >
                              + Add Fertilizer
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedFieldId(f.id); setActiveTab('soil'); }}
                              className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-xl border border-amber-200 dark:border-amber-700 transition-all"
                            >
                              + Soil Test
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteField(f.id, f.name); }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                              title="Delete Farm Plot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Enter New Farm Form with GPS */}
              <div className="bg-white dark:bg-[#141b22] p-6 md:p-7 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
                  <Plus className="w-5 h-5 text-emerald-600" />
                  <span>Enter New Farm Plot</span>
                </div>

                {/* Live GPS Detector */}
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200/80 dark:border-emerald-700/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                      <Navigation className="w-4 h-4 text-emerald-600 animate-pulse" />
                      <span>Automatic Live Location</span>
                    </div>
                    <button
                      type="button"
                      onClick={detectLiveLocation}
                      disabled={isLocating}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold rounded-lg border border-emerald-300 dark:border-emerald-700 transition-all flex items-center space-x-1"
                    >
                      <Crosshair className="w-3 h-3" />
                      <span>{isLocating ? 'Locating...' : 'Refresh GPS'}</span>
                    </button>
                  </div>

                  {isLocating ? (
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold animate-pulse">
                      📡 Acquiring satellite GPS coordinates...
                    </p>
                  ) : liveLat && liveLon ? (
                    <div className="space-y-1 text-xs">
                      <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        📍 {liveLat.toFixed(5)}°N, {liveLon.toFixed(5)}°E{' '}
                        {locationAccuracy && (
                          <span className="text-slate-500 font-sans font-normal">(±{locationAccuracy}m accuracy)</span>
                        )}
                      </p>
                      {locationAddress && (
                        <p className="text-emerald-800 dark:text-emerald-400 font-bold text-[11px] flex items-center space-x-1">
                          <span>🏘️ Region: {locationAddress}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {locationError || 'Click Refresh GPS to detect your farm coordinates.'}
                    </p>
                  )}
                </div>

                <form onSubmit={handleCreateField} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Farm Name *</label>
                    <input
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      placeholder="e.g. North Plot / રાજકોટ ખેતર"
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Land Area (Acres) *</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={newFieldArea}
                        onChange={(e) => setNewFieldArea(e.target.value)}
                        placeholder="e.g. 2.5"
                        className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Crop</label>
                      <select
                        value={newCropId}
                        onChange={(e) => { setNewCropId(e.target.value); setNewStageId(STAGES[e.target.value][0].id); }}
                        className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        {CROPS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {lang === 'gu' ? c.gu : lang === 'hi' ? c.hi : c.en}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Current Growth Stage</label>
                    <select
                      value={newStageId}
                      onChange={(e) => setNewStageId(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {(STAGES[newCropId] || STAGES.cotton).map((st) => (
                        <option key={st.id} value={st.id}>
                          {lang === 'gu' ? st.gu : lang === 'hi' ? st.hi : st.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !newFieldName.trim() || !newFieldArea}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-sm transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{loading ? 'Creating...' : 'Save Farm with Live Location'}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 3: SOIL HEALTH CARDS
           ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'soil' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
                <FlaskConical className="w-7 h-7 text-amber-600" />
                <span>Soil Health Cards & Lab Records</span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Enter chemical soil test parameters from your Government Soil Health Card (SHC) or soil lab testing report.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Enter New Soil Test */}
              <div className="lg:col-span-2 bg-white dark:bg-[#141b22] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                  <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Record Soil Test Values for {selectedField?.name || 'Selected Field'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Values are calibrated with ICAR agricultural critical limits</p>
                  </div>
                </div>

                {!selectedField ? (
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Please create a farm field first.</p>
                ) : (
                  <form onSubmit={handleSaveSoilTest} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Available Nitrogen N (kg/ha) *</label>
                        <input
                          type="number"
                          value={soilN}
                          onChange={(e) => setSoilN(e.target.value)}
                          placeholder="e.g. 180"
                          className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          required
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Deficient if &lt; 280 kg/ha</p>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Available Phosphorus P (kg/ha) *</label>
                        <input
                          type="number"
                          value={soilP}
                          onChange={(e) => setSoilP(e.target.value)}
                          placeholder="e.g. 20"
                          className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          required
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Deficient if &lt; 11 kg/ha</p>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Available Potassium K (kg/ha) *</label>
                        <input
                          type="number"
                          value={soilK}
                          onChange={(e) => setSoilK(e.target.value)}
                          placeholder="e.g. 210"
                          className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          required
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Deficient if &lt; 110 kg/ha</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Soil pH (Reaction)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={soilPH}
                          onChange={(e) => setSoilPH(e.target.value)}
                          placeholder="e.g. 7.2"
                          className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Neutral ideal: 6.5 – 7.8</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Organic Carbon OC (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={soilOC}
                          onChange={(e) => setSoilOC(e.target.value)}
                          placeholder="e.g. 0.52"
                          className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Low if &lt; 0.50%</p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !selectedField || !soilN || !soilP || !soilK}
                      className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-md transition-all"
                    >
                      {loading ? 'Saving Record...' : 'Save Soil Health Card Data'}
                    </button>
                  </form>
                )}
              </div>

              {/* ICAR Benchmark Info */}
              <div className="bg-white dark:bg-[#141b22] p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">ICAR Soil Classification Guide</h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800">
                    <p className="font-bold">Low / Deficient</p>
                    <p className="text-[11px] mt-0.5">N &lt; 280, P &lt; 11, K &lt; 110 kg/ha. Needs +20-25% compensatory boost.</p>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded-xl border border-amber-200 dark:border-amber-800">
                    <p className="font-bold">Medium / Adequate</p>
                    <p className="text-[11px] mt-0.5">N 280-560, P 11-25, K 110-280 kg/ha. Standard recommended dose.</p>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <p className="font-bold">High / Optimal</p>
                    <p className="text-[11px] mt-0.5">N &gt; 560, P &gt; 25, K &gt; 280 kg/ha. Reduce dosage by 20% to avoid chemical waste.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 4: PRECISION ADVISORY
           ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'advisory' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
                  <Zap className="w-7 h-7 text-emerald-600" />
                  <span>Precision Fertilizer Plan & Advisory</span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Deterministic agronomic engine calculation for exact bags, cost in ₹, and weather-adjusted timing.
                </p>
              </div>
              <button
                onClick={handleGenerateRecommendation}
                disabled={loading || !selectedField}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-lg transition-all flex items-center space-x-2 text-sm"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>{loading ? 'Running Engine...' : 'Calculate Recommendation'}</span>
              </button>
            </div>

            {recommendation ? (
              <div className="space-y-6">
                {/* Hero Header */}
                <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 text-white p-8 rounded-3xl shadow-xl space-y-4">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">Official Precision Recommendation</p>
                      <h2 className="text-2xl font-black mt-1">{selectedField?.name}</h2>
                      <p className="text-sm text-emerald-100 capitalize mt-1">
                        Crop: {selectedField?.crop_id} · Stage: {selectedField?.current_stage_id} · Area: {selectedField?.area_acres} Acres
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-400 text-emerald-950 shadow">
                        {recommendation.confidence_level} CONFIDENCE
                      </span>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-mono">
                        v{recommendation.rule_version}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timing Advisory Banner */}
                {recommendation.timing_action && (
                  <div
                    className={`p-5 rounded-2xl border flex items-start space-x-3 ${
                      recommendation.timing_action === 'DELAY'
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700'
                        : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700'
                    }`}
                  >
                    <CloudRain
                      className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                        recommendation.timing_action === 'DELAY' ? 'text-orange-600' : 'text-emerald-600'
                      }`}
                    />
                    <div>
                      <p
                        className={`text-sm font-bold ${
                          recommendation.timing_action === 'DELAY'
                            ? 'text-orange-900 dark:text-orange-300'
                            : 'text-emerald-900 dark:text-emerald-300'
                        }`}
                      >
                        Timing Window:{' '}
                        {recommendation.timing_action === 'DELAY'
                          ? lang === 'gu'
                            ? 'વિલંબ ભલામણ (Delay Recommended)'
                            : lang === 'hi'
                            ? 'देरी अनुशंसित — वर्षा अपेक्षित'
                            : 'Delay Recommended — Rain Expected'
                          : 'Optimal Application Window'}
                      </p>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                        {t(recommendation.timing_message_keys, lang)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Recommended Fertilizer Dosages */}
                <div className="bg-white dark:bg-[#141b22] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                  <div className="flex items-center space-x-2">
                    <Leaf className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Recommended Fertilizer Dosages for {selectedField?.area_acres} Acres
                    </h3>
                  </div>

                  {recommendation.dosages && recommendation.dosages.length > 0 ? (
                    <div className="space-y-4">
                      {recommendation.dosages.map((d, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-50/70 dark:from-emerald-900/20 to-slate-50 dark:to-slate-800/30 rounded-2xl border border-emerald-100 dark:border-emerald-800"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-sm">
                              {i + 1}
                            </div>
                            <div>
                              <p className="text-lg font-black text-slate-900 dark:text-white">
                                {t(d.product_name_keys, lang) || d.product_id}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {d.quantity_kg} kg total ·{' '}
                                {(d.quantity_kg / (selectedField?.area_acres || 1)).toFixed(1)} kg/acre
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                              {d.quantity_bags.toFixed(1)}{' '}
                              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">bags</span>
                            </p>
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                              ₹{d.total_cost_inr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">All nutrients are at adequate levels for this stage.</p>
                  )}
                </div>

                {/* Total Cost & Engine Explanations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-[#141b22] p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Estimated Cost</p>
                      <p className="text-xs text-slate-400 mt-0.5">For {selectedField?.area_acres} acres at subsidised MRP</p>
                    </div>
                    <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                      ₹{recommendation.estimated_total_cost_inr?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-[#141b22] p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                    <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white text-sm">
                      <Info className="w-4 h-4 text-emerald-600" />
                      <span>Deterministic Agronomic Reasoning</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      {recommendation.explanation_keys?.map((exp, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-emerald-500 font-bold">✓</span>
                          <span>{t(exp, lang)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#141b22] p-12 rounded-3xl border border-slate-200 dark:border-slate-700 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-3xl flex items-center justify-center mx-auto text-emerald-700 dark:text-emerald-400">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Click Calculate to Generate Advisory</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  The engine will cross-reference your Soil Health Card, crop growth stage, and live weather forecast to produce your precise nutrient application dosage.
                </p>
                <button
                  onClick={handleGenerateRecommendation}
                  disabled={loading || !selectedField}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow transition-all"
                >
                  Generate Precision Plan
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 5: WEATHER & SPRAY WINDOW
           ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'weather' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
                <CloudRain className="w-7 h-7 text-sky-600" />
                <span>Field Weather & Application Window</span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Live Open-Meteo meteorological telemetry for field coordinates ({selectedField?.latitude?.toFixed(4) || '22.2587'}°N, {selectedField?.longitude?.toFixed(4) || '71.1924'}°E)
              </p>
            </div>

            {weatherData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#141b22] p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rainfall Probability</p>
                  <p className="text-3xl font-black text-sky-600">{weatherData.rainfall_probability}%</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Next 24-48 hours</p>
                </div>

                <div className="bg-white dark:bg-[#141b22] p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Expected Rainfall</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">{weatherData.expected_rainfall_mm} mm</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Precipitation volume</p>
                </div>

                <div className="bg-white dark:bg-[#141b22] p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Temperature & Humidity</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">{weatherData.temperature_c}°C</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Humidity: {weatherData.humidity_percent}%</p>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#141b22] p-10 rounded-3xl border border-slate-200 dark:border-slate-700 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">Weather data loaded from Open-Meteo service.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
