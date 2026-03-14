import json
import os

# Bu dosyanın bulunduğu dizin: app/backend/app/ai/
# Proje kökü: ../../../../ yukarıda — data/seed buradan erişilir
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.abspath(os.path.join(_THIS_DIR, "..", "..", "..", ".."))

def _seed_path(filename: str) -> str:
    """data/seed/ altındaki bir dosyanın mutlak yolunu döndürür."""
    return os.path.join(_PROJECT_ROOT, "data", "seed", filename)

def load_personality() -> dict:
    """JSON dosyasından AI kişilik ayarlarını yükler."""
    file_path = _seed_path("ai_personality.json")
    if not os.path.exists(file_path):
        return {
            "personality": {
                "name": "PikselAI Asistan",
                "tone": "doğrudan, samimi, net",
                "rules": [],
                "communication_examples": {}
            }
        }
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def load_coaching_framework() -> dict:
    """Kapsamlı kullanıcı profil ve koçluk çerçevesini yükler."""
    file_path = _seed_path("coaching_framework.json")
    if not os.path.exists(file_path):
        return {}
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def get_coaching_context() -> str:
    """
    coaching_framework.json'un tamamını AI sistem prompt'una
    enjekte edilecek formatta döndürür.
    """
    fw = load_coaching_framework()
    if not fw:
        return ""

    # --- Kişilik Profili ---
    kp = fw.get("kisilik_profili", {})
    mbti = kp.get("mbti", {})
    ocean = kp.get("big_five_ocean", {})
    enneagram = kp.get("enneagram", {})
    disc = kp.get("disc", {})

    ocean_lines = "\n".join([
        f"  - {v.get('yorum', '')}" for v in ocean.values() if isinstance(v, dict)
    ])
    enneagram_ozellikler = "\n".join([
        f"  - {k}: {v}" for k, v in enneagram.get("ozellikler", {}).items()
    ])
    disc_boyutlar = "\n".join([
        f"  - {k}: {v}" for k, v in disc.get("boyutlar", {}).items()
    ])

    # --- Motivasyon Haritası ---
    mot = fw.get("motivasyon_haritasi", {})
    guclu = "\n".join([
        f"  + [{m['kuvvet']}] {m['tetikleyici']}: {m['ornek']}"
        for m in mot.get("guclu_motivatorler", [])
    ])
    oldurucu = "\n".join([
        f"  - [{m['kuvvet']}] {m['tetikleyici']}: {m['ornek']}"
        for m in mot.get("motivasyon_olduruculer", [])
    ])

    # --- Güç/Zayıflık ---
    gz = fw.get("guc_zayiflik_matrisi", {})
    gucler = "\n".join([
        f"  • {g['yetenek']}: {g['strateji']}" for g in gz.get("gucler", [])
    ])
    zayifliklar = "\n".join([
        f"  • {z['sorun']}: {z['strateji']}" for z in gz.get("zayifliklar", [])
    ])

    # --- Davranışsal Analiz ---
    da = fw.get("davranissal_analiz", {})
    prokr = da.get("prokrastinasyon_dongusu", {})
    prokr_asamalar = "\n".join([f"  {s}" for s in prokr.get("asamalar", [])])
    tetikler = da.get("tetikleyici_mekanizmalar", {})

    adhd = da.get("adhd_spektrum", {})
    adhd_strateji = adhd.get("strateji_onerisi", "")

    # --- Duygusal Profil ---
    dp = fw.get("duygusal_profil", {})
    ic_cekingenlikleri = "\n".join([
        f"  - {k}: {v}" for k, v in dp.get("iletisim_cekingenlik_kokenleri", {}).items()
    ])

    # --- Risk ---
    riskler = "\n".join([
        f"  [{r['olasilik']} risk] {r['risk']}: {r['onlem']}"
        for r in fw.get("risk_degerlendirmesi", [])
    ])

    # --- Aksiyon Planı ---
    aplan = fw.get("stratejik_aksiyon_plani", {})
    ilk7 = "\n".join([f"  • {a}" for a in aplan.get("ilk_7_gun", [])])

    # --- AI İletişim Rehberi ---
    ilet = fw.get("ai_iletisim_rehberi", {})
    ton_ilkeleri = "\n".join([f"  - {i}" for i in ilet.get("genel_ton", {}).get("ilkeler", [])])
    kritik_bilgiler = "\n".join([f"  • {b}" for b in ilet.get("kritik_bilgiler", [])])
    durum_yaklasim = ilet.get("durum_bazli_yaklasim", {})

    # --- Özet ---
    ozet = fw.get("ozet_karti", {})

    return f"""
╔══════════════════════════════════════════════════════════════════════╗
║         KULLANICI PROFİLİ & KİŞİSEL KOÇLUK ÇERÇEVESİ              ║
║  Kaynak: 6 yapay zeka raporu konsensüsü (Gemini×2, Grok×2, GPT×2)  ║
╚══════════════════════════════════════════════════════════════════════╝

▸ ÖZET KARTİ
  Kişilik : {ozet.get("kisilik", "")}
  Güçler  : {", ".join(ozet.get("gucler", []))}
  Sorunlar: {", ".join(ozet.get("sorunlar", []))}
  Temel Çözüm: {ozet.get("temel_cozum", "")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. KİŞİLİK PROFİLİ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MBTI: {mbti.get("sonuc", "")} — {mbti.get("aciklama", "")}
  I: {mbti.get("boyutlar", {}).get("I_Introversion", "")}
  N: {mbti.get("boyutlar", {}).get("N_Intuition", "")}
  T: {mbti.get("boyutlar", {}).get("T_Thinking", "")}
  P: {mbti.get("boyutlar", {}).get("P_Perceiving", "")}

Big Five (OCEAN):
{ocean_lines}

Enneagram: {enneagram.get("tip", "")}
{enneagram_ozellikler}

DISC: {disc.get("sonuc", "")}
{disc_boyutlar}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. DAVRANIŞSAL ANALİZ — PROKRASTİNASYON DÖNGÜSÜ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Döngü aşamaları (6/6 rapor konsensüsü):
{prokr_asamalar}

AI müdahale stratejisi: {prokr.get("ai_mudahale_stratejisi", "")}

KRİTİK MEKANİZMALAR:
• Dopamin döngüsü: {tetikler.get("dopamin_dongusu", {}).get("aciklama", "")}
  → Müdahale: {tetikler.get("dopamin_dongusu", {}).get("mudahale", "")}
• Avoidance coping: {tetikler.get("avoidance_coping", {}).get("aciklama", "")}
  → Müdahale: {tetikler.get("avoidance_coping", {}).get("mudahale", "")}
• Çevre bağımlılığı: {tetikler.get("cevre_bagımliligi", {}).get("aciklama", "")}
  → Müdahale: {tetikler.get("cevre_bagımliligi", {}).get("mudahale", "")}

Öz-belirleme teorisi:
  Özerklik: {tetikler.get("oz_belirleme_teorisi", {}).get("ozerklik", "")}
  Yeterlilik: {tetikler.get("oz_belirleme_teorisi", {}).get("yeterlilik", "")}
  Bağlılık: {tetikler.get("oz_belirleme_teorisi", {}).get("baglilik", "")}

ADHD Spektrum: {adhd.get("not", "")}
  Strateji: {adhd_strateji}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. DUYGUSAL PROFİL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{dp.get("oz_elestirsizlik_paradoksu", "")}

İletişim çekingenlik kökenler:
{ic_cekingenlikleri}

Yalnızlık-sosyallik: {dp.get("yalnizlik_sosyallik", {}).get("tip", "")} — {dp.get("yalnizlik_sosyallik", {}).get("risk", "")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. MOTİVASYON HARİTASI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Formül: {mot.get("formula", "")}

Güçlü motivatörler:
{guclu}

Motivasyon öldürücüler:
{oldurucu}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. GÜÇ / ZAYIFLIK MATRİSİ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GÜÇLER ve nasıl kullanılmalı:
{gucler}

ZAYIFLIKLAR ve yönetim stratejileri:
{zayifliklar}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. RİSK DEĞERLENDİRMESİ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{riskler}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
7. STRATEJİK BAŞLANGIÇ ADIMI (İlk 7 Gün)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{ilk7}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
8. AI İLETİŞİM REHBERİ — YAPMAN GEREKENLER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ton ilkeleri:
{ton_ilkeleri}

Durum bazlı yanıt örnekleri:
  Sabah     : {durum_yaklasim.get("sabah_karsılama", "")}
  İş bitti  : {durum_yaklasim.get("is_tamamlama", "")}
  Mola      : {durum_yaklasim.get("mola", "")}
  Hareketsiz: {durum_yaklasim.get("uzun_hareketsizlik", "")}
  Teslim    : {durum_yaklasim.get("is_teslimi", "")}
  Gec görev : {durum_yaklasim.get("geciken_gorev", "")}
  Gece geç  : {durum_yaklasim.get("gece_gec_saatler", "")}
  Takıldı   : {durum_yaklasim.get("takilip_kalan", "")}
  Burnout   : {durum_yaklasim.get("burnout_riski", "")}

KRİTİK BİLGİLER (bunları daima bil):
{kritik_bilgiler}
"""


def get_personality_instruction(user_name: str = "Kullanıcı") -> str:
    """Kişilik verilerini ve koçluk çerçevesini Gemini system prompt formatına çevirir."""
    data = load_personality()
    p = data.get("personality", {})

    rules = "\n".join([f"- {rule}" for rule in p.get("rules", [])])
    examples = "\n".join([f"{k}: {v}" for k, v in p.get("communication_examples", {}).items()])
    coaching_context = get_coaching_context()

    instruction = f"""
Senin Adın: {p.get('name', 'PikselAI Asistan')}
Konuşma Tonun: doğrudan, samimi, net — gereksiz pohpohlama yok.

=== KİM OLDUĞUN ===
Sen basit bir sohbet botu DEĞİLSİN. Sen {user_name}'ın hayatını ve işlerini doğrudan yöneten dijital asistanısın.
Tüm My World sistemine hakimsin: projeler, görevler, notlar, takvim.
{user_name} sana bir şey söylediğinde pasif dinlemezsin — AKSİYON alırsın.

=== {user_name} İLE İLETİŞİM ===
- Kısa, somut, net konuş.
- "Hepsini yap" deme, "şu tek şeyi yap, 10 dakika" de.
- Odaktan düştüğünde geri döndür — yargılama yok.
- Samimi ol. Abartılı teşvik cümleleri kurma.

=== TEMEL KURALLAR ===
{rules}
- Robotik konuşma yasak.
- "Ekleyeyim mi?" sorma — doğrudan ekle ve bildir.
- Görevleri oluşturduktan sonra nereden başlaması gerektiğini söyle.

=== İLETİŞİM ÖRNEKLERİ ===
{examples}

{coaching_context}

=== SİSTEM KOMUT KODLARI (KRİTİK) ===

Sisteme müdahale etmek için cevabının İÇİNE özel komut blokları gömersin.
Sistem bunları otomatik bulup çalıştırır, metinden temizler — kullanıcı görmez.

⚠️ EN ÖNEMLİ KURAL: {user_name} bir iş/görev verdiğinde HER ZAMAN TEK BİR ANA GÖREV + ALT GÖREVLER oluştur.
ASLA her adımı ayrı bir ana kart olarak açma! Tek bir ana kart aç, detayları alt görev olarak ekle.

--- KOMUT 1: AKILLI GÖREV PLANI ---
FORMAT:
[PLAN_START]
{{
  "project": "Proje Adı",
  "title": "Ana görev başlığı",
  "priority": "urgent/medium/low",
  "due_date": "YYYY-MM-DD veya null",
  "description": "Nereden başlaması gerektiğini, hangi sırayı izlemesi gerektiğini yaz. Net, kısa, adım odaklı.",
  "subtasks": [
    {{"title": "1. İlk adım", "description": "Ne yapılacak", "estimated_minutes": 30}},
    {{"title": "2. İkinci adım", "description": "Açıklama", "estimated_minutes": 45}}
  ]
}}
[PLAN_END]

⚠️ TARİH KURALI: Kullanıcı tarih söylediğinde ("bu Pazar", "3 gün sonra"):
- due_date alanına ISO formatında (YYYY-MM-DD) yaz.
- Bugünün tarihi bağlam bölümünde yazıyor, buna göre hesapla.

--- KOMUT: GÜN PLANLAMA ---
"Günümü planla" veya "Akşamı planla" derse ASLA `[PLAN_START]` kullanma.
Mevcut görevleri analiz edip takvime otomatik diz:
[ACTION:ADD_EVENT|Etkinlik Adı|YYYY-MM-DDTHH:MM:SSZ|Dakika|GörevID]

--- KOMUT 2: BASİT NOT ---
[ACTION:ADD_NOTE|Not içeriği]

--- MÜKERRER KONTROL (P0) ---
Takvim: aynı saatte etkinlik varsa OLUŞTURMA.
Görev: aynı başlıklı görev varsa OLUŞTURMA.
Not: aynı içerikli not varsa OLUŞTURMA.

ÖZETLE: Görev gelince TEK PLAN, kısa açıkla, somut ilk adımı söyle.
Mesajının EN SONUNA kullanıcının ruh halini analiz eden etiket ekle.
FORMAT: [TONE:Mutlu] / [TONE:Stresli] / [TONE:Yorgun] / [TONE:Motivasyonlu] — tek kelime.
"""
    return instruction.strip()
