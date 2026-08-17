# KrishiNiti Design System & UI Specifications

Version: 1.0.0

## 1. Design Philosophy
- **Farmer-First**: Large touch targets (min 48x48dp), high-contrast visual cues, minimal text density, prominent icon-backed actions.
- **Multilingual Clarity**: Layouts designed with variable text expansion margins (Gujarati and Hindi strings are typically 15-25% longer than English).
- **Aesthetic Tone**: Earthy agricultural forest greens (`#2D6A4F`), warm soil ambers (`#DDA15E`), clean whites, and high-legibility status indicators.

---

## 2. Color Palette & Status Semantics

| Token | Hex | Role / Semantic Meaning |
|---|---|---|
| `primary.500` | `#2D6A4F` | Main Brand Green, Headers, Primary CTA |
| `primary.accent` | `#52B788` | Active Highlights, Toggle states, Success accents |
| `soil.500` | `#BC6C25` | Earthy secondary accents, Field boundaries |
| `status.adequate` | `#2E7D32` | 🟢 Soil Nutrient Status: Optimal / Adequate |
| `status.moderate` | `#F9A825` | 🟡 Caution, Moderate Nutrient level |
| `status.deficient` | `#D32F2F` | 🔴 Nutrient Deficient, Action required |
| `status.surplus` | `#1976D2` | 🔵 Surplus / High reserve |

---

## 3. Screen Specifications

### A. Farmer Mobile Screens (Flutter)
1. **Language Selection**: Large visual cards for Gujarati (ગુજરાતી), Hindi (हिंदी), and English.
2. **My Fields**: Card-based list displaying Field Name, Area (Acres), Active Crop, and latest recommendation status chip.
3. **Soil Entry Form**: Number input fields with real-time range validation, unit indicators (kg/ha, pH, %), and freshness age counter.
4. **Recommendation Action View**:
   - **Today's Action Card**: Large headline ("Apply 1 Bag Urea today").
   - **Nutrient Status Bar**: Visual color-coded horizontal bars for N, P, K.
   - **Weather Timing Card**: Dynamic alert chip ("Apply Now" or "⚠️ Delay 2 Days due to heavy rain").
   - **Confidence Badge**: High / Moderate / Low with explanation tooltip.
   - **Cost Breakdown**: Estimated total input cost in ₹.
   - **Record Application Button**: Big prominent 1-tap action to log fertilizer usage.

### B. Agriculture Officer Dashboard (Next.js)
1. **Overview Dashboard**: High-level regional KPIs with deficiency percentages and total fields assessed.
2. **Interactive Priority Map**: Regional Leaflet/MapLibre polygon map colored by deficiency severity (🟢 Normal, 🟡 Moderate, 🔴 Critical).
3. **Nutrient Trends**: Time-series multi-line charts across crop stages.
4. **Priority Areas Table**: Sortable list of villages by nitrogen/phosphorus deficit and overuse risk.
