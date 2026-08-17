from datetime import date
from typing import List, Dict, Tuple
from krishiniti_engine.models import SoilInput

def calculate_confidence_score(soil: SoilInput) -> Tuple[str, List[Dict[str, str]]]:
    reasons = []
    confidence = "HIGH"
    
    # 1. Evaluate Freshness (Age in months)
    days_old = (date.today() - soil.test_date).days
    months_old = days_old / 30.44
    
    if months_old > 12.0:
        confidence = "LOW"
        reasons.append({
            "en": f"Soil test is stale ({int(months_old)} months old). Soil nutrients may have changed significantly.",
            "hi": f"मृदा परीक्षण पुराना है ({int(months_old)} महीने)। मिट्टी के पोषक तत्वों में महत्वपूर्ण बदलाव हो सकता है।",
            "gu": f"જમીન ચકાસણી જૂની છે ({int(months_old)} મહિના). જમીનમાં પોષક તત્વોનું પ્રમાણ બદલાઈ ગયું હોઈ શકે."
        })
    elif months_old > 6.0:
        confidence = "MODERATE"
        reasons.append({
            "en": f"Soil test is slightly old ({int(months_old)} months). Fresh test is recommended for next season.",
            "hi": f"मृदा परीक्षण थोड़ा पुराना है ({int(months_old)} महीने)। अगले सीजन के लिए नए परीक्षण की सिफारिश की जाती है।",
            "gu": f"જમીન ચકાસણી થોડી જૂની છે ({int(months_old)} મહિના). આવતી મોસમ માટે નવો રિપોર્ટ કઢાવવા ભલામણ છે."
        })

    # 2. Evaluate Missing Parameters
    missing_params = []
    if soil.nitrogen_n is None:
        missing_params.append("Nitrogen")
    if soil.phosphorus_p is None:
        missing_params.append("Phosphorus")
    if soil.potassium_k is None:
        missing_params.append("Potassium")
        
    if missing_params:
        params_str = ", ".join(missing_params)
        # Demote confidence
        if confidence == "HIGH":
            confidence = "MODERATE"
        elif confidence == "MODERATE":
            confidence = "LOW"
            
        reasons.append({
            "en": f"Missing critical nutrient parameters: {params_str}.",
            "hi": f"महत्वपूर्ण पोषक तत्वों की कमी: {params_str}।",
            "gu": f"મહત્વના પોષક તત્વોનો અભાવ: {params_str}."
        })

    return confidence, reasons
