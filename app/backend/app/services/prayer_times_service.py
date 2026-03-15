import os
import requests
from datetime import datetime, date
import json

CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "cache")

def _get_cache_file(date_str: str, city: str, country: str) -> str:
    if not os.path.exists(CACHE_DIR):
        os.makedirs(CACHE_DIR)
    safe_city = city.replace(" ", "_").lower()
    return os.path.join(CACHE_DIR, f"prayer_{safe_city}_{country}_{date_str}.json")

def get_prayer_times(for_date: date = None, city: str = "Istanbul", country: str = "Turkey") -> dict:
    """
    Aladhan API üzerinden namaz vakitlerini alır.
    İstekleri gün bazında cache'ler ki sürekli API'ye gidilmesin.
    """
    if for_date is None:
        for_date = date.today()
        
    date_str = for_date.strftime("%d-%m-%Y")
    cache_file = _get_cache_file(date_str, city, country)
    
    # 1. Önce Cache'e bak
    if os.path.exists(cache_file):
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Prayer times cache okuma hatası: {e}")
            
    # 2. Eğer cache'de yoksa API'den çek
    try:
        url = f"http://api.aladhan.com/v1/timingsByCity/{date_str}"
        params = {
            "city": city,
            "country": country,
            "method": 13, # 13: Diyanet İşleri Başkanlığı
        }
        res = requests.get(url, params=params, timeout=5)
        res.raise_for_status()
        data = res.json()
        
        timings = data.get("data", {}).get("timings", {})
        
        if not timings:
            return _fallback_prayer_times()
            
        result = {
            "imsak": timings.get("Imsak"),
            "gunes": timings.get("Sunrise"),
            "ogle": timings.get("Dhuhr"),
            "ikindi": timings.get("Asr"),
            "aksam": timings.get("Maghrib"), # İftar!
            "yatsi": timings.get("Isha")
        }
        
        # Cache'e yaz
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(result, f)
            
        return result
        
    except Exception as e:
        print(f"Prayer times API hatası: {e}")
        return _fallback_prayer_times()

def _fallback_prayer_times() -> dict:
    # API çökerse yaklaşık değerler
    return {
        "imsak": "05:00",
        "gunes": "06:30",
        "ogle": "13:00",
        "ikindi": "16:30",
        "aksam": "19:00",
        "yatsi": "20:30"
    }
