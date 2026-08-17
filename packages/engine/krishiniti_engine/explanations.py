from typing import List, Dict
from krishiniti_engine.models import NutrientStatus, CropInput, NutrientQuantities

def generate_explanations(
    status: NutrientStatus,
    crop: CropInput,
    gap: NutrientQuantities
) -> List[Dict[str, str]]:
    explanations = []

    crop_name = crop.crop_id.capitalize()
    stage_name = crop.growth_stage_id.replace("_", " ")

    # 1. Base statement
    explanations.append({
        "en": f"Calculated nutrient requirement for {crop_name} during the {stage_name} stage.",
        "hi": f"फसल {crop_name} के {stage_name} चरण के लिए पोषक तत्वों की आवश्यकता की गणना की गई है।",
        "gu": f"{crop_name} પાક માટે તેના {stage_name} તબક્કા દરમિયાન પોષક તત્વોની જરૂરિયાત નક્કી કરવામાં આવી છે."
    })

    # 2. Nitrogen logic
    if gap.n_kg > 0:
        if status.nitrogen == "LOW":
            explanations.append({
                "en": "Nitrogen dose increased by 20% because soil test indicates low nitrogen availability.",
                "hi": "नाइट्रोजन की मात्रा 20% बढ़ाई गई है क्योंकि मृदा परीक्षण में नाइट्रोजन की कमी पाई गई है।",
                "gu": "નાઇટ્રોજનનો જથ્થો ૨૦% વધારવામાં આવ્યો છે કારણ કે જમીનમાં નાઇટ્રોજન ઓછું છે."
            })
        else:
            explanations.append({
                "en": "Standard split dose of Nitrogen applied for vegetative/flowering growth support.",
                "hi": "वानस्पतिक/फूलों के विकास के समर्थन के लिए नाइट्रोजन की मानक खुराक दी गई है।",
                "gu": "છોડના યોગ્ય વિકાસ અને ફૂલો આવવાના સમયે નાઇટ્રોજનનો સામાન્ય હિસ્સો આપવા ભલામણ છે."
            })
    else:
        if status.nitrogen == "HIGH":
            explanations.append({
                "en": "No additional Nitrogen recommended as soil test shows high residual nitrogen.",
                "hi": "अतिरिक्त नाइट्रोजन की आवश्यकता नहीं है क्योंकि मिट्टी में पर्याप्त नाइट्रोजन मौजूद है।",
                "gu": "વધારાના નાઇટ્રોજનની જરૂર નથી કારણ કે જમીનની તપાસમાં નાઇટ્રોજન પૂરતું જણાયું છે."
            })

    # 3. Phosphorus logic
    if gap.p_kg > 0:
        if status.phosphorus == "LOW":
            explanations.append({
                "en": "Phosphorus recommended at basal stage to support early root development.",
                "hi": "शुरुआती जड़ों के विकास के लिए बुआई के समय फास्फोरस की सिफारिश की जाती है।",
                "gu": "મૂળના શરૂઆતના વિકાસ માટે વાવણી સમયે ફોસ્ફરસ આપવાની ખાસ જરૂર છે."
            })
    else:
        if status.phosphorus == "HIGH" or status.phosphorus == "MEDIUM":
            explanations.append({
                "en": "No additional Phosphorus recommended based on current crop stage and soil test levels.",
                "hi": "फसल के वर्तमान चरण और मृदा परीक्षण स्तर के अनुसार अतिरिक्त फास्फोरस की आवश्यकता नहीं है।",
                "gu": "પાકના હાલના તબક્કા અને જમીનમાં પૂરતો ફોસ્ફરસ હોવાથી વધારાના ફોસ્ફરસની જરૂર નથી."
            })

    return explanations
