from typing import Tuple, Dict
from krishiniti_engine.models import WeatherInput

def evaluate_weather_rules(weather: Optional[WeatherInput]) -> Tuple[str, Dict[str, str]]:
    if not weather:
        return "MONITOR", {
            "en": "Weather data unavailable. Monitor local weather forecast before applying fertilizer.",
            "hi": "मौसम का डेटा उपलब्ध नहीं है। उर्वरक डालने से पहले स्थानीय मौसम पूर्वानुमान की जांच करें।",
            "gu": "હવામાન ડેટા ઉપલબ્ધ નથી. ખાતર આપતા પહેલા સ્થાનિક હવામાનની ચકાસણી કરો."
        }
        
    # Check staleness
    if weather.retrieved_at_delta_hours > 24:
        return "MONITOR", {
            "en": f"Weather data is stale (fetched {weather.retrieved_at_delta_hours} hours ago). Monitor local sky before application.",
            "hi": f"मौसम डेटा पुराना है ({weather.retrieved_at_delta_hours} घंटे पहले का)। छिड़काव से पहले मौसम पर ध्यान दें।",
            "gu": f"હવામાન ડેટા જૂનો છે ({weather.retrieved_at_delta_hours} કલાક પહેલાનો). ખાતર આપતા પહેલા વાદળોની સ્થિતિ જુઓ."
        }
        
    # Weather rules logic:
    if weather.rainfall_probability >= 70.0 and weather.expected_rainfall_mm >= 10.0:
        return "DELAY_HEAVY_RAIN", {
            "en": f"Heavy rain forecast ({weather.expected_rainfall_mm}mm, {weather.rainfall_probability}% probability). Delay application to avoid run-off.",
            "hi": f"भारी बारिश का अनुमान ({weather.expected_rainfall_mm} मिमी, {weather.rainfall_probability}% संभावना)। पानी बहने से बचाने के लिए उर्वरक टालें।",
            "gu": f"ભારે વરસાદની આગાહી ({weather.expected_rainfall_mm}મીમી, {weather.rainfall_probability}% શક્યતા). ધોવાણ અટકાવવા ખાતર આપવાનું મોકૂફ રાખો."
        }
        
    return "APPLY_NOW", {
        "en": "Weather conditions are suitable for fertilizer application.",
        "hi": "मौसम की स्थिति उर्वरक प्रयोग के लिए अनुकूल है।",
        "gu": "હવામાન પરિસ્થિતિ ખાતર આપવા માટે અનુકૂળ છે."
    }
