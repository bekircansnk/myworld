# AI Asistan Kapsamlı Güncelleme Planı
## İstanbul Konum Desteği, Saat Dilimi Düzeltmesi, Takvim Düzenleme ve Ezan Vakitleri

> **Amaç:** AI asistanın İstanbul/Başakşehir konumunu bilmesi, doğru saat diliminde çalışması, ezan vakitlerini tanıması, oluşturulan takvim etkinliklerini düzenleyebilmesi ve mevcut tüm sistem verilerine tam hakim olması.

---

## 🔴 Tespit Edilen Sorunlar

| # | Sorun | Kök Neden | Etki |
|---|-------|-----------|------|
| 1 | AI yanlış saatte takvim planlıyor | `context.py` ve `prompts.py` UTC kullanıyor, İstanbul +03:00 offset uygulanmıyor | Etkinlikler 3 saat yanlış planlanıyor |
| 2 | İftar vakti yanlış algılanıyor | Ezan/namaz vakitleri sisteme hiç tanımlanmamış | AI gerçek iftar saatini bilmiyor |
| 3 | Konum bilgisi yok | User modelinde ve AI bağlamında lokasyon alanı yok | AI coğrafi bağlam kuramıyor |
| 4 | Takvim düzenleme yapılamıyor | Sadece `[ACTION:ADD_EVENT]` komutu var; EDIT/DELETE komutu yok | Kullanıcı düzeltme istediğinde AI cevap veremiyor |
| 5 | AI mevcut etkinliklerin ID'sini bilmiyor | `context.py` etkinlik ID'si bağlama eklenmiyor | Hangi etkinliği düzenleyeceğini anlayamıyor |

---

## 📋 Fazlar ve Değişiklikler

---

### Phase 1: Konum ve Saat Dilimi Altyapısı

> Kullanıcının "İstanbul, Başakşehir" konumunu sisteme kalıcı olarak tanımlayıp tüm saat hesaplamalarının bu bölgeye göre yapılmasını sağlar.

#### [MODIFY] [user.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/models/user.py)
- `User` modeline `timezone` (String, default: `"Europe/Istanbul"`) ve `location` (JSON, default: `{"city": "Başakşehir", "district": "Başakşehir", "country": "Türkiye", "timezone": "Europe/Istanbul"}`) alanları eklenecek.
- Bu alanlar `settings` JSON'ının içinde de tutulabilir ama ayrı kolon olarak daha temiz olacaktır.

#### [NEW] [location_service.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/services/location_service.py)
- `get_user_timezone(user)` → kullanıcının timezone bilgisini döner (default: `Europe/Istanbul`)
- `get_current_time_for_user(user)` → kullanıcının yerel saatini döner
- `utc_to_local(dt, timezone_str)` ve `local_to_utc(dt, timezone_str)` dönüşüm fonksiyonları
- `pytz` veya `zoneinfo` (Python 3.9+ built-in) kullanılacak

#### [NEW] Alembic Migration
- `users` tablosuna `timezone` ve `location` kolonları ekleyen migration dosyası

---

### Phase 2: Ezan Vakitleri Entegrasyonu

> İstanbul/Başakşehir için güncel ezan vakitlerini (özellikle iftar = akşam ezanı) sisteme entegre eder.

#### [NEW] [prayer_times_service.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/services/prayer_times_service.py)
- **Birincil kaynak:** Diyanet İşleri Başkanlığı API'si veya [Aladhan API](https://aladhan.com/prayer-times-api) (ücretsiz, güvenilir)
- `get_prayer_times(date, city="Istanbul", district="Basaksehir")` → O günün namaz vakitlerini döner:
  ```json
  {
    "imsak": "05:22",
    "gunes": "06:48", 
    "ogle": "13:10",
    "ikindi": "16:35",
    "aksam": "19:18",  // ← İftar vakti
    "yatsi": "20:42"
  }
  ```
- Sonuçlar günlük olarak cache'lenir (Redis veya basit in-memory dict)
- Fallback: API erişilemezse, İstanbul için hesaplama tabanlı yaklaşık vakitler

#### [MODIFY] [context.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/ai/context.py)
- Bağlam metnine ezan vakitleri bölümü eklenir:
  ```
  === KONUM VE EZAN VAKİTLERİ ===
  📍 Konum: İstanbul, Başakşehir
  🕐 Yerel Saat: 16:46 (Europe/Istanbul, UTC+3)
  🕌 Bugünün Ezan Vakitleri:
    - İmsak: 05:22
    - Güneş: 06:48
    - Öğle: 13:10
    - İkindi: 16:35
    - Akşam (İftar): 19:18
    - Yatsı: 20:42
  ```

---

### Phase 3: Saat Dilimi Düzeltmeleri

> Tüm tarih/saat işlemlerini UTC yerine kullanıcının yerel saat dilimine göre yapar.

#### [MODIFY] [context.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/ai/context.py)
- Satır 47: `datetime.now()` → `datetime.now(ZoneInfo("Europe/Istanbul"))` olarak güncellenir
- Satır 51: `datetime.now(timezone.utc)` → kullanıcı timezone'una göre hesaplanır
- Tüm tarih gösterimleri yerel saat olarak formatlanır

#### [MODIFY] [prompts.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/ai/prompts.py)
- `DAY_PLANNING_PROMPT` içinde:
  - Satır 61: `current_date` artık İstanbul saatinde verilir
  - Yeni ekleme: "Kullanıcının konumu İstanbul/Başakşehir. Tüm saatleri İstanbul yerel saatinde (UTC+3) planla. UTC'ye çevirme! Ezan vakitleri bağlamda var, iftar/imsak vakitlerini dikkate al."
- `CATEGORIZE_TASK_PROMPT` içinde:
  - `current_date` İstanbul saatinde verilir

#### [MODIFY] [gemini.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/services/gemini.py)
- Satır 129: `datetime.now()` → İstanbul saatinde `datetime.now(ZoneInfo("Europe/Istanbul"))`
- `generate_chat_response` fonksiyonuna kullanıcı timezone parametresi eklenir

#### [MODIFY] [ai.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/routers/ai.py)
- Satır 360-362: Event oluşturulurken `start_dt` İstanbul saatinde parse edilir, UTC'ye çevrilmeden DB'ye yazılır veya timezone-aware olarak saklanır
- `CalendarEvent` oluştururken tutarlı timezone yönetimi

#### [MODIFY] [calendar.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/routers/calendar.py)
- Satır 49-52: Event oluşturulurken `timezone.utc` yerine kullanıcının timezone'u kullanılır
- Satır 88-89: Güncelleme sırasında da aynı düzeltme

---

### Phase 4: Takvim Düzenleme ve Silme Komutları

> AI'ın mevcut takvim etkinliklerini düzenleyebilmesi ve silebilmesi için yeni komut kalıpları eklenir.

#### [MODIFY] [personality.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/ai/personality.py)
- Sistem promptuna yeni komutlar eklenir:

```
--- KOMUT: TAKVİM ETKİNLİĞİ DÜZENLEME ---
FORMAT: [ACTION:EDIT_EVENT|EventID|Alan=Değer|Alan=Değer]
Alanlar: title, date (YYYY-MM-DD), start (HH:MM), end (HH:MM), duration (dakika)
Örnek: [ACTION:EDIT_EVENT|42|start=19:30|end=21:00]
Örnek: [ACTION:EDIT_EVENT|42|title=Yeni Başlık|date=2026-03-16]

--- KOMUT: TAKVİM ETKİNLİĞİ SİLME ---
FORMAT: [ACTION:DELETE_EVENT|EventID]
Örnek: [ACTION:DELETE_EVENT|42]

⚠️ DÜZENLEME KURALLARI:
- Kullanıcı "şu etkinliğin saatini değiştir" derse, bağlamdaki etkinlik listesinden doğru ID'yi bul.
- Kullanıcı ID vermezse, başlık veya saat eşleşmesiyle tanımla.
- Birden fazla eşleşme varsa kullanıcıya sor.
- Değişiklikten SONRA kullanıcıya yeni hali özet olarak bildir.
```

#### [MODIFY] [ai.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/routers/ai.py)
- Yeni regex kalıpları:
  ```python
  EDIT_EVENT_PATTERN = r"\[ACTION:EDIT_EVENT\|(\d+)\|([^\]]+)\]"
  DELETE_EVENT_PATTERN = r"\[ACTION:DELETE_EVENT\|(\d+)\]"
  ```
- `EDIT_EVENT` handler:
  - Event ID ile DB'den çeker
  - `Alan=Değer` çiftlerini parse eder (title, date, start, end, duration)
  - Güncelleme yapar, ActionLog döner
- `DELETE_EVENT` handler:
  - Event ID ile DB'den çeker
  - Soft-delete veya hard-delete yapar
  - ActionLog döner
- Temizleme regex'lerine yeni kalıplar eklenir (satır ~468)

#### [MODIFY] [context.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/ai/context.py)
- Satır 68-72: Etkinlik listesine **ID bilgisi** eklenir:
  ```
  - [ID:42] [15/03 16:00-17:30] Kategori 1-4 Hazırlık (Görev ID:5)
  ```
  AI'ın düzenleme yaparken doğru etkinliği hedefleyebilmesi için kritik.

#### [MODIFY] [aiChatStore.ts](file:///Users/bekir/Uygulamalarım/2-My-World/app/web/src/stores/aiChatStore.ts)
- `sendMessage` içinde `EDIT_EVENT` ve `DELETE_EVENT` aksiyonları algılandığında:
  - `calendarStore.fetchEvents()` ile takvimi yenile (tam tablo refresh)
  - Veya `updateEvent` / `removeEvent` çağrısı yapılır

---

### Phase 5: AI Bağlam Zenginleştirme ve Sohbet Hafızası

> AI'ın tüm sisteme tam hakim olmasını ve önceki sohbetleri hatırlamasını sağlar.

#### [MODIFY] [context.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/ai/context.py)
- **Son sohbet özeti eklenir:** Son 3 oturumun başlığı ve son mesaj önizlemesi bağlama dahil edilir.
  ```
  === SON SOHBET GEÇMİŞİ ===
  - [14/03 20:00] "Venüs Katalog Çekimi Planlaması" → 8 mesaj
  - [15/03 09:00] "Günlük Plan" → 4 mesaj
  ```
- **Konum ve kişisel bilgi bölümü eklenir:** Bağlam metninin en başına sabitlenir.

#### [MODIFY] [personality.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/ai/personality.py)
- Sistem promptuna eklenir:
  ```
  === KONUM VE KİŞİSEL BİLGİLER ===
  - Konum: İstanbul, Başakşehir, Türkiye
  - Saat Dilimi: Europe/Istanbul (UTC+3)
  - Dini Hassasiyetler: Ramazan ayında iftar/sahur vakitleri kritiktir.
  - Mesaj zamanını mutlaka İstanbul yerel saatine göre yorumla.
  
  === DÜZENLEME YETENEĞİ ===
  - Kullanıcı oluşturulmuş BİR ŞEYİ değiştirmek, düzenlemek veya düzeltmek istediğinde ANLAYIP UYGULAMALISIN.
  - "Saati değiştir", "Başlığı güncelle", "Sil", "Yarım saat ertele" gibi komutları algıla.
  - Bağlamdaki etkinlik listesinden doğru etkinliği tespit et.
  - Düzenleme istendiğinde ASLA sessiz kalma — kesinlikle bir aksiyon al veya netleştirici soru sor.
  ```

#### [MODIFY] [ai_personality.json](file:///Users/bekir/Uygulamalarım/2-My-World/data/seed/ai_personality.json)
- Yeni alanlar eklenir:
  ```json
  {
    "personality": {
      "location": {
        "city": "İstanbul",
        "district": "Başakşehir",
        "country": "Türkiye",
        "timezone": "Europe/Istanbul"
      },
      "capabilities": [
        "takvim_olusturma",
        "takvim_duzenleme",
        "takvim_silme",
        "ezan_vakitleri",
        "gorev_yonetimi",
        "sohbet_gecmisi_okuma"
      ]
    }
  }
  ```

---

## 📁 Değişiklik Özet Tablosu

| Dosya | İşlem | Faz |
|-------|-------|-----|
| `user.py` | MODIFY - timezone/location alanları | Phase 1 |
| `location_service.py` | NEW - saat dilimi yardımcıları | Phase 1 |
| Alembic migration | NEW - DB şeması güncelleme | Phase 1 |
| `prayer_times_service.py` | NEW - ezan vakitleri servisi | Phase 2 |
| `context.py` | MODIFY - konum, ezan, ID, sohbet geçmişi | Phase 2, 3, 4, 5 |
| `prompts.py` | MODIFY - saat dilimi düzeltmeleri | Phase 3 |
| `gemini.py` | MODIFY - saat dilimi düzeltmeleri | Phase 3 |
| `ai.py` | MODIFY - EDIT/DELETE event, timezone | Phase 3, 4 |
| `calendar.py` | MODIFY - timezone düzeltmeleri | Phase 3 |
| `personality.py` | MODIFY - yeni komutlar, konum bilgisi | Phase 4, 5 |
| `ai_personality.json` | MODIFY - konum ve yetenek tanımı | Phase 5 |
| `aiChatStore.ts` | MODIFY - yeni aksiyonlar için store güncellemesi | Phase 4 |

---

## ✅ Doğrulama Planı

### Otomatik Testler
- Mevcut projede test dosyası bulunmadığı için backend tarafında `pytest` ile yeni birim testleri yazılacak:
  - `test_location_service.py`: Saat dilimi dönüşüm fonksiyonları
  - `test_prayer_times.py`: Ezan vakti servisinin doğru veri döndürmesi
  - `test_event_edit.py`: EDIT_EVENT ve DELETE_EVENT regex parse testleri

### Manuel Doğrulama
1. **Saat Dilimi Testi:** AI'a "Şu an saat kaç?" sorulur → İstanbul saatini doğru söylemeli
2. **İftar Vakti Testi:** AI'a "Bugün iftar saat kaçta?" sorulur → Güncel Başakşehir iftar vaktini söylemeli
3. **Takvim Düzenleme Testi:** Mevcut bir etkinlik oluşturulup ardından "O etkinliğin saatini 19:30'a çek" denir → Etkinlik güncellenmeli
4. **Konum Farkındalığı Testi:** AI'a "Nerede yaşıyorum?" sorulur → "İstanbul, Başakşehir" demeli
5. **Gün Planlama Testi:** "Günümü planla" dendiğinde saatler İstanbul yerel saatinde olmalı (UTC+3)

---

## ⚠️ Kullanıcı Onayı Gereken Noktalar

> [!IMPORTANT]
> 1. **Ezan Vakitleri API Seçimi:** Aladhan API (ücretsiz, global) mi yoksa Diyanet API'si mi kullanılsın? Aladhan önerilir çünkü daha güvenilir ve dökümantasyonu iyi.
> 2. **DB Migration:** `users` tablosuna `timezone` ve `location` kolon eklemesi yapılacak. Mevcut kullanıcılar için default değerler otomatik atanacaktır.
> 3. **Takvim Saklama:** Etkinlikler DB'de UTC mi yoksa yerel saat mi olarak saklanmaya devam etsin? Önerimiz: DB'de UTC tutmaya devam, ama AI bağlamına ve promptlara yerel saat verilsin.

---

## 🚫 Bu Planda Olmayan (Kapsam Dışı)

- Frontend takvim UI değişiklikleri (sadece store güncellenir)
- Etkinlik tekrarlama (recurring events)
- Push notification entegrasyonu
- Diğer şehirler için çoklu konum desteği (şimdilik sadece İstanbul/Başakşehir)
