from typing import List, Dict
from krishiniti_engine.models import SoilInput, NutrientStatus, FertilizerHistoryItem

def evaluate_sustainability(
    soil: SoilInput,
    soil_status: NutrientStatus,
    history: List[FertilizerHistoryItem]
) -> List[Dict[str, str]]:
    warnings = []

    # 1. Acidic soil warning
    if soil_status.ph_classification == "ACIDIC":
        warnings.append({
            "en": "Soil is acidic (pH < 6.5). Continuous chemical nitrogen application may lower pH further. Consider applying agricultural lime or organic compost.",
            "hi": "मिट्टी अम्लीय है (pH < 6.5)। रासायनिक नाइट्रोजन के लगातार उपयोग से पीएच और गिर सकता है। चूना या जैविक खाद का प्रयोग करें।",
            "gu": "જમીન એસિડિક છે (pH < 6.5). રાસાયણિક નાઇટ્રોજનનો સતત ઉપયોગ કરવાથી પીએચ હજુ ઘટી શકે. ચૂનો અથવા દેશી ખાતર વાપરવા ભલામણ છે."
        })

    # 2. Low organic carbon warning
    if soil_status.organic_carbon == "LOW":
        warnings.append({
            "en": "Organic carbon level is low (< 0.5%). Prioritize Farm Yard Manure (FYM) or green manuring to improve fertilizer efficiency.",
            "hi": "जैविक कार्बन का स्तर कम है (< 0.5%)। उर्वरक दक्षता बढ़ाने के लिए गोबर की खाद या हरी खाद को प्राथमिकता दें।",
            "gu": "સેન્દ્રિય કાર્બનનું પ્રમાણ ઓછું છે (< 0.5%). ખાતરની કાર્યક્ષમતા વધારવા માટે છાણિયું ખાતર અથવા લીલો પડવાસ અવશ્ય આપો."
        })

    # 3. Excessive application check (e.g. history shows multiple Urea doses in same stage)
    urea_count = sum(1 for item in history if item.product_id.lower() == "urea")
    if urea_count >= 3:
        warnings.append({
            "en": "Multiple urea applications recorded. High risk of nitrogen leaching and insect pest susceptibility. Avoid splitting into too many small doses.",
            "hi": "एक से अधिक बार यूरिया छिड़काव दर्ज है। नाइट्रोजन बहने और कीटों के हमले का खतरा। आवश्यकता से अधिक खुराक से बचें।",
            "gu": "વારંવાર યુરિયા આપેલ હોવાનું નોંધાયું છે. નાઇટ્રોજનનો વ્યય અને રોગ-જીવાતનો ઉપદ્રવ વધવાની શક્યતા. વધુ પડતા છંટકાવથી બચો."
        })

    return warnings
