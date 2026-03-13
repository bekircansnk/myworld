# 🧠 AI BEYİN ÇALIŞMA REHBERİ — My World Yapay Zeka Sistemi

**Son Güncelleme:** 12 Mart 2026
**Versiyon:** 1.0
**Durum:** 📋 PLANLAMA — Faz faz uygulanacak

---

## 📖 BU DOKÜMAN NEDİR?

Bu doküman, My World uygulamasının **yapay zeka beyin sisteminin** nasıl çalıştığını, nasıl yönlendirildiğini ve nasıl geliştirilmesi gerektiğini kapsamlı bir şekilde tanımlar. AI modeline, geliştiricilere ve Bekircan'a özel hazırlanmış kalıcı bir rehber belgesidir.

### Hedef Kitle
| Kim | Ne için okuyacak |
|-----|-----------------|
| **Bekircan** | AI sisteminin ne yaptığını, nasıl çalıştığını, neler yapabileceğini anlamak |
| **AI Modeli** | System prompt'unun parçası olarak davranış kurallarını öğrenmek |
| **Geliştirici Ajanlar** | Hangi dosyaları düzenleyeceğini, neyi nereden tetikleyeceğini bilmek |

---

# BÖLÜM 1: MEVCUT AI MİMARİSİ (AKTIF DURUM)

## 1.1 — Genel Akış Diyagramı

```
┌─────────────────────────────────────────────────────────────────────┐
│                     KULLANICI GİRİŞ NOKTALARI                       │
│                                                                     │
│  ┌──────────────────┐  ┌─────────────────┐  ┌──────────────────┐   │
│  │  Dashboard Akıllı │  │  ChatWidget     │  │  Takvim İçi      │   │
│  │  Asistan Paneli   │  │  (Sağ Alt       │  │  AI Sohbet       │   │
│  │  (Sol Kolon)      │  │   Baloncuk)     │  │  (CalendarPage)  │   │
│  └────────┬─────────┘  └───────┬─────────┘  └───────┬──────────┘   │
│           │                    │                     │              │
│           ▼                    ▼                     ▼              │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              POST /api/chat (AI Router - ai.py)             │    │
│  │  Mesaj Listesi + Sistem Bağlamı → Gemini API → Yanıt       │    │
│  └────────────────────────┬────────────────────────────────────┘    │
│                           │                                         │
│           ┌───────────────┼───────────────┐                         │
│           ▼               ▼               ▼                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Model Seçimi │  │  Bağlam      │  │  Kişilik     │              │
│  │  (classify_   │  │  Oluşturma   │  │  Yükleme     │              │
│  │   intent)     │  │  (context.py)│  │  (person.py) │              │
│  │              │  │              │  │  + 07-nihai   │              │
│  │  LITE/PRO     │  │  DB tarayan  │  │  rapor.md    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                           │                                         │
│                           ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │            KOMUT AYRIŞTIRMA (ai.py)                          │    │
│  │                                                             │    │
│  │  [PLAN_START]...[PLAN_END]  →  Ana Görev + Alt Görevler     │    │
│  │  [ACTION:ADD_TASK|...]      →  Tek Görev (eski format)      │    │
│  │  [ACTION:ADD_NOTE|...]      →  Not Kaydetme                 │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                           │                                         │
│                           ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │            SONUÇLAR                                          │    │
│  │  • Görevler DB'ye yazılır (tasks tablosu)                   │    │
│  │  • Notlar DB'ye yazılır (notes tablosu)                     │    │
│  │  • Temiz metin kullanıcıya gösterilir                       │    │
│  │  • Aksiyonlar frontend'e bildirilir → Board otomatik yenilenir│   │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

## 1.2 — Model Seçim Mekanizması (Akıllı Router)

AI sistemi her mesajda **otomatik model seçimi** yapar:

| Niyet | Model | Maliyet | Kullanım |
|-------|-------|---------|----------|
| `STANDARD_CHAT` | `gemini-3.1-flash-lite-preview` | Çok Düşük | Normal sohbet, görev ekleme, kısa sorular |
| `DEEP_ANALYSIS` | `gemini-3.1-pro-preview` | Yüksek | Karmaşık stratejik planlama, mimari kararlar |

**Nasıl çalışır:**
1. Son kullanıcı mesajı `classify_intent()` fonksiyonuna gider
2. Lite model mesajı analiz ederek niyet belirler (0.1 temperature — kesin karar)
3. Belirlenen niyete göre ana model seçilir
4. Her iki çağrının da maliyeti `user.settings.api_cost`'a yazılır

## 1.3 — Bağlam Oluşturma (context.py)

AI her mesajda veritabanından **canlı durum bilgisi** çeker:

```
=== SİSTEM DURUMU ===
Tarih: 12 Mart 2026 Perşembe, 06:20
Toplam Aktif Görev: 15 | Tamamlanmış: 8 | Alt Görev: 23

=== PROJELER / FİRMALAR ===
- ID:1 | Venüs Ayakkabı | Aktif: 5 görev, Tamamlanmış: 3
- ID:2 | Kazador | Aktif: 3 görev, Tamamlanmış: 2
...

=== AKTİF GÖREVLER ===
- ID:12 [Venüs Ayakkabı] Banner tasarla (Durum: todo, Öncelik: urgent, Son Tarih: 15/03/2026, ~45dk, Alt Görevler: 2/5)
...

=== SON TAMAMLANAN GÖREVLER ===
- ID:8 [Kazador] Logo revize (Tamamlandı: 11/03 14:30)
...

=== SON NOTLAR ===
- ID:5 (web) Müşteri fiyat teklifi notu...
```

**Limitler:**
- Maksimum 30 aktif görev gösterilir
- Son 10 tamamlanan görev gösterilir
- Son 15 not gösterilir
- Toplam bağlam 15.000 karaktere kırpılır (token optimizasyonu)

## 1.4 — Kişilik Sistemi (personality.py)

AI'ın kişiliği **üç kaynaktan** beslenir:

| Kaynak | Dosya | İçerik |
|--------|-------|--------|
| JSON Config | `data/seed/ai_personality.json` | İsim, ton, kurallar, iletişim örnekleri |
| Kişisel Analiz | `docs/07-nihai-kisisel-analiz-raporu.md` | Bekircan'ın ADHD, dopamin, motivasyon profili |
| System Prompt | `personality.py` | PLAN formatı, aksiyon kuralları, proaktif davranışlar |

**AI'ın temel kimliği:**
- **Adı:** My World AI
- **Rolü:** Bekircan'ın dijital kurucu ortağı (sohbet botu DEĞİL)
- **Dili:** Türkçe, samimi, kısa, aksiyon odaklı
- **Yasak:** Robotik konuşma, "Nasıl yardımcı olabilirim?" gibi ifadeler

## 1.5 — Komut Sistemi (Otomatik Aksiyon)

AI, yanıtının içine **gizli komut blokları** gömerek sisteme doğrudan müdahale eder:

### PLAN Komutu (Günlük Planlama)
```json
[PLAN_START]
{
  "project": "Venüs Ayakkabı",
  "title": "Banner tasarla ve teslim et",
  "priority": "urgent",
  "due_date": "2026-03-15",
  "description": "Motivasyon dolu açıklama...",
  "subtasks": [
    {"title": "Referans topla", "description": "...", "estimated_minutes": 15},
    {"title": "Tasarımı yap", "description": "...", "estimated_minutes": 45}
  ]
}
[PLAN_END]
```

**Sonuç:** Backend otomatik olarak 1 ana görev + N alt görev oluşturur. Kanban board anında güncellenir.

### Hızlı Aksiyon Komutları
- **Not Komutu:** `[ACTION:ADD_NOTE|Müşteri toplantısında fiyat revizyonu talep etti]`
- **Takvim Etkinliği:** `[ACTION:ADD_EVENT|Arabayı yıkama|2026-03-18T18:30:00|60]` (Başlık | ISO Tarih | Dakika)
- **Tek Görev:** `[ACTION:ADD_TASK|Genel|Arabayı servise götür|medium]`

## 1.6 — Mevcut AI Yetenekleri

| Yetenek | Endpoint | Açıklama |
|---------|----------|----------|
| **Sohbet** | `POST /api/chat` | Doğal dil ile konuşma + otomatik aksiyon |
| **Görev Bölme** | `POST /api/breakdown/{id}` | Ana görevi AI ile alt görevlere ayırma |
| **Motivasyon** | `GET /api/motivation` | Zamana ve duruma göre kişisel motivasyon sözü |
| **Not Zenginleştirme** | `POST /api/notes/enhance` | Ham notu detaylandır + görev çıkar |
| **Görev Kategorizasyonu** | Background | Yeni görevin projesi, önceliği, süre tahmini |
| **Not Sınıflandırma** | Background | Not başlığı + kategori otomatik atama |

---

# BÖLÜM 2: HEDEFLENMİŞ AI BEYNI — MASTER PLAN

## 2.1 — Vizyon

**Mevcut:** AI sadece kullanıcı mesaj gönderdiğinde çalışıyor (reaktif).
**Hedef:** AI aktif olarak sistemi izleyen, proaktif davranan, öğrenen bir beyin olacak.

```
┌──────────────────────────────────────────────────────────────────┐
│                    AI BEYİN — MASTER MİMARİ                      │
│                                                                  │
│  ╔══════════════════════════════════════════════════════════════╗  │
│  ║                 PROAKTIF KATMAN (Yeni)                       ║  │
│  ║  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    ║  │
│  ║  │ Sabah    │  │ Durağanlık│  │ Mola     │  │ Gece     │    ║  │
│  ║  │ Karşılama│  │ Algılama │  │ Hatırlat.│  │ Uyarısı  │    ║  │
│  ║  │ 09:00    │  │ Her 2 st │  │ 40dk + 3s│  │ 23:00+   │    ║  │
│  ║  └──────────┘  └──────────┘  └──────────┘  └──────────┘    ║  │
│  ╚══════════════════════════════════════════════════════════════╝  │
│                              │                                    │
│  ╔══════════════════════════════════════════════════════════════╗  │
│  ║               REAKTİF KATMAN (Mevcut + Genişletilmiş)       ║  │
│  ║  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    ║  │
│  ║  │ Sohbet   │  │ Gün      │  │ Görev    │  │ Not      │    ║  │
│  ║  │ (Chat)   │  │ Planlama │  │ Yönetim  │  │ İşleme   │    ║  │
│  ║  │          │  │ (YENİ)   │  │          │  │          │    ║  │
│  ║  └──────────┘  └──────────┘  └──────────┘  └──────────┘    ║  │
│  ╚══════════════════════════════════════════════════════════════╝  │
│                              │                                    │
│  ╔══════════════════════════════════════════════════════════════╗  │
│  ║                    HAFIZA KATMANI (Yeni)                     ║  │
│  ║  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    ║  │
│  ║  │ Kısa     │  │ Orta     │  │ Uzun     │  │ Kişilik  │    ║  │
│  ║  │ Vadeli   │  │ Vadeli   │  │ Vadeli   │  │ Profili  │    ║  │
│  ║  │ (Bugün)  │  │ (Hafta)  │  │ (Süresiz)│  │ (Sabit)  │    ║  │
│  ║  └──────────┘  └──────────┘  └──────────┘  └──────────┘    ║  │
│  ╚══════════════════════════════════════════════════════════════╝  │
│                              │                                    │
│  ╔══════════════════════════════════════════════════════════════╗  │
│  ║                    VERİ KATMANI (DB)                         ║  │
│  ║  tasks │ notes │ projects │ timer_sessions │ calendar_events ║  │
│  ║  ai_memory │ daily_reports │ chat_history │ notifications    ║  │
│  ╚══════════════════════════════════════════════════════════════╝  │
└──────────────────────────────────────────────────────────────────┘
```

## 2.2 — Frontend Entegrasyon Noktaları

| Konum | Şu An | Hedef |
|-------|-------|-------|
| **Dashboard Akıllı Asistan** | Ayrı yerel state, `/api/ai/chat` endpoint çağırıyor (yanlış yol) | `chatStore` ile merkezi bağlantı, aktif canlı çalışma |
| **ChatWidget (Sağ Alt)** | `chatStore` kullanıyor, `/api/chat` çağırıyor | Aynı chatStore + Quick Action butonları + Günümü Planla |
| **Takvim İçi AI** | Kendi iç sohbet alanı | Merkezi chatStore ile senkron |

**Butonlar (Quick Actions):**
| Buton | İkon | İşlev |
|-------|------|-------|
| 📝 Not oluştur | StickyNote | Input'a "Not oluştur:" ön eki koyar |
| ✅ Görev ekle | ListPlus | Input'a "Görev ekle:" ön eki koyar |
| 📄 Özetle | FileText | "Günü özetle" mesajını gönderir |
| 📅 **Günümü Planla** | CalendarDays | **Gün planlama modunu** başlatır (YENİ) |

---

# BÖLÜM 3: GÜN PLANLAMA SİSTEMİ (YENİ MAJOR ÖZELLİK)

## 3.1 — Genel Konsept

"Günümü Planla" butonu tıklandığında AI ile **etkileşimli bir diyalog** başlar:

```
Bekircan: [Günümü Planla butonuna tıklar]

AI: 📅 Hangi günü planlayalım Bekir? Bugün mü, yarın mı, yoksa başka bir gün mü?

Bekircan: Bugünü planlayalım

AI: 🏠 Peki bugün nereden çalışacaksın?
   • 🏠 Evden çalışacağım
   • ☕ Kafeye gideceğim
   • 🏢 Dışarıda olacağım

Bekircan: Kafeye gideceğim bugün. 5 saat kadar çalışabilirim.

AI: ☕ Harika! Kafeden çalışacaksın. Birkaç şeyi kontrol edeyim...

📊 Sistemdeki Durum:
- Venüs'te 3 bekleyen iş var (1 acil)
- Kazador'da 1 ertelenmiş görev
- Dün eksik kalan "Banner tasarım" var

Kafeye gidiş-dönüş ~2 saat yol süren, 5 saat çalışma diyorsun.
Yani saat 10:00'da çıkarsan 11:00-11:30 gibi kafede olursun.
16:30-17:00 gibi de çıkmak lazım ki 18:00-18:30'da evde olursun.

Planlamadan önce birkaç sorum var:
1. 🔥 Venüs banner teslimi bugün olmalı mı? Acil görünüyor.
2. 📝 Dün aldığın "n8n otomasyon" notunu bir göreve mi çevirelim?
3. 🏃 Yolda podcast/sesli kitap dinler misin? Önerim var.

Bekircan: Evet banner acil, onu bugün bitireyim. n8n notunu geçelim. Yolda müzik dinlerim.

AI: Tamam, işte günün planı! 🎯

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 12 Mart 2026 — Kafe Çalışma Planı
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🕐 10:00 — 🚶 Evden çık (yolda müzik)
🕐 11:00 — ☕ Kafede çalışmaya başla
           📋 İlk iş: Venüs Banner (acil!)
🕐 12:30 — ☕ Mola (10dk kahve + yürüyüş)
🕐 12:40 — 📋 Banner devam / Kazador görevi
🕐 14:00 — 🍽️ YEMEK MOLASI (30dk)
           → Ara, dışarı çık, biraz dolaş
🕐 14:30 — 📋 Çalışma Bloğu (hafif işler)
🕐 16:00 — 📝 Günün özeti + yarın planı
🕐 16:30 — 🚶 Eve dönüş yolu
🕐 18:00 — 🏠 Serbest zaman

💡 Toplam Çalışma: ~4.5 saat (2 blok + hazırlık)
💡 Yolda Geçen: ~2 saat
💡 Mola + Yemek: ~1 saat

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bu planı takvime ekleyeyim mi? 📅
```

## 3.2 — Gün Planlama Çalışma Mantığı

### Veri Toplama Aşaması
AI gün planlarken şu verileri toplar:
1. **Görev Durumu:** Tüm aktif görevler, öncelikler, gecikmeler
2. **Takvim:** O güne planlanmış etkinlikler
3. **Not Geçmişi:** Son notlardaki iş talepleri
4. **Timer Geçmişi:** Ortalama çalışma süreleri, en üretken saatler
5. **Kişilik Profili:** ADHD uyumlu planlama kuralları

### Konum Farkındalığı
| Konum | Çalışma Süresi | Yol Süresi | Mola Stili |
|-------|---------------|-----------|-----------|
| 🏠 Ev | Esnek (sınırsız) | 0 | "Kalk biraz dolaş" |
| ☕ Kafe | 4-6 saat | ~1-2 saat (gidiş) | "Dışarı çık, yürü" |
| 🏢 Ofis/Dışarı | Değişken | ~1-2 saat | "Kafe sesi, yürüyüş" |

### Kişilik Uyumlu Planlama Kuralları
- **Sabah en zor işi verme** (düşük enerji) → hafif/kolay görevle başla
- Maksimum **90 dakikalık** çalışma blokları
- Günde en fazla **6 saat** yoğun çalışma limiti
- Hiperfokus **fırsatı varsa** yaratıcı/teknik işleri uzun blok olarak ver
- Kafede çalışıyorsa → sosyal enerji avantajını kullan
- Evdeyse → çevre yapılandırması öner (arka plan kafe sesi vb.)
- **Akşam 22:00** sonrası çalışma önerme
- Yolda geçen süreyi hesaba kat

### Otomatik Takvim Entegrasyonu
Plan onaylandığında:
1. Her saat bloğu bir `CalendarEvent` olarak oluşturulur
2. `calendarStore.addEvent()` ile takvime eklenir
3. Kategori: `routine` (çalışma), `personal` (mola), `task` (görev)
4. Görevlere bağlı etkinlikler `taskId` referansı taşır

## 3.3 — Otomatik Gün Planlama Modu

Bekircan hiçbir şey söylemeden sadece "Günümü planla" derse:

1. AI **bugünün tarihini** kontrol eder
2. **Takvimde** zaten planlanmış etkinlikleri kontrol eder
3. **Aktif görevleri** öncelik sırasına göre sıralar
4. **Geçmiş çalışma kalıplarından** en üretken saatleri belirler
5. **Otomatik bir plan önerir** — kullanıcıya onaylatır
6. Onay sonrası takvime yazar

---

# BÖLÜM 4: PROAKTİF AI DAVRANIŞLARI

## 4.1 — Zamanlı Tetikleyiciler (Scheduler)

AI'ın "kendi kendine" çalışması için arka plan zamanlayıcı (APScheduler):

| Tetikleyici | Zamanlama | Davranış | Kanal |
|-------------|-----------|----------|-------|
| **Sabah Karşılama** | Öğlen 12:00 (Kullanıcıya göre dinamik değişebilir) | "Günaydın Bekir! Bugün 3 görevin var, en acil olanı X" | Dashboard + Bildirim |
| **Öğle Hatırlatması** | 14:00 civarı | "Öğle arası! 🍽️ Yemek ye ve 30dk mola ver" | Bildirim |
| **Görev Durağanlık** | Her 3 saat | 3+ gün dokunulmamış görevleri kontrol et → "X görevi 4 gündür bekliyor, erteleyelim mi?" | AI Chat |
| **Akşam Özeti** | 20:00 | "Bugün 3 görev bitirdin 🎉 Yarın için plan yapalım mı?" | Dashboard + Bildirim |
| **Gece Koruma** | 23:00+ | Timer aktifse: "Saat 23:00 oldu, yarın devam etsen?" | Bildirim |
| **Haftalık Rapor** | Pazar 19:00 | "Bu haftanın özeti: X görev, Y saat çalışma, Z not" | Rapor + Telegram |

## 4.2 — Olay Bazlı Tetikleyiciler (Event-Driven)

| Olay | AI Davranışı |
|------|-------------|
| Görev tamamlandı | "Helal sana! 🎉 Sıradaki X görevi, 15 dk'lık iş, hemen başla!" |
| Görev eklendi | Otomatik kategorizasyon + süre tahmini + öneri |
| Timer 40 dk | "Güzel çalıştın, 5 dk mola ver ☕" |
| Timer 3 saat | "3 saattir çalışıyorsun! Uzun mola zamanı 🎬" |
| Uygulama açıldı (sabah) | Morning Screen + günün planı |
| Takvimde etkinlik yaklaştı | "30 dk sonra X etkinliğin var, hazırlan!" |
| Görev gecikti | "X görevinin son tarihi dün geçti, ne yapalım?" |

## 4.3 — Proaktif İş Takibi

AI belirli aralıklarla (2-3 saat) sistemdeki görevleri tarayarak:

```python
# Pseudocode — AI proaktif tarama
async def proactive_check():
    overdue = get_overdue_tasks()        # Son tarihi geçmiş görevler
    stale = get_stale_tasks(days=3)      # 3+ gündür dokunulmamış
    urgent_today = get_urgent_for_today() # Bugün bitmesi gereken
    
    if overdue:
        notify("⚠️ {len(overdue)} görevin son tarihi geçti!")
    if stale:
        notify("🤔 {stale[0].title} 4 gündür bekliyor, erteleyelim mi?")
    if urgent_today:
        notify("🔥 Bugün bitmesi gereken {len(urgent_today)} görev var!")
```

---

# BÖLÜM 5: HAFIZA SİSTEMİ (MEMORY)

## 5.1 — Mevcut Durum
- `ai_memory` tablosu tanımlı ama kullanılmıyor
- Chat geçmişi sayfa yenilenince kayboluyor
- Bağlam sadece anlık DB sorgusundan oluşuyor

## 5.2 — Hedef Hafıza Mimarisi

### Katmanlı Hafıza

| Katman | Saklama | İçerik | Kullanım |
|--------|---------|--------|----------|
| **Anlık** | Oturum (RAM) | Aktif sohbet mesajları | Her mesajda |
| **Kısa Vadeli** | 24 saat | Bugünün görevleri, yapılanlar, sohbet özeti | Gün içi bağlam |
| **Orta Vadeli** | 1 hafta | Haftalık performans, kalıplar, trend | Haftalık planlama |
| **Uzun Vadeli** | Süresiz | Aylık trendler, öğrenilen tercihler, alışkanlıklar | Kişiselleştirme |
| **Kalıcı** | Süresiz | Kişilik analizi, motivasyon kuralları | System prompt |

### Sentezleme Döngüsü

```
Her gece 23:30:
  → Bugünün sohbet mesajları → AI özet → ai_memory (short_term)
  → Günlük rapor oluştur → daily_reports

Her Pazar 22:00:
  → Haftanın kısa vadeli hafızaları → AI sentez → ai_memory (mid_term)
  → Haftalık rapor oluştur → weekly_reports

Her Ay Sonu:
  → Ayın orta vadeli hafızaları → AI sentez → ai_memory (long_term)
  → Uzun vadeli davranış kalıpları tespit et
```

## 5.3 — Chat Geçmişi Kalıcılığı

**Yeni tablo: `chat_messages`**

| Kolon | Tip | Not |
|-------|-----|-----|
| id | INT PK | |
| user_id | INT FK | |
| session_id | UUID | Bir sohbet oturumunu gruplar |
| role | VARCHAR | "user" / "ai" / "system" |
| content | TEXT | Mesaj içeriği |
| actions | JSON | Yapılan aksiyonlar |
| model_used | VARCHAR | Hangi model kullanıldı |
| token_count | INT | Token sayısı |
| created_at | TIMESTAMP | |

---

# BÖLÜM 6: GELİŞTİRME FAZLARI VE YOL HARİTASI

## Faz A — AI Core Birleştirme (2-3 gün)
**Hedef:** Dashboard asistan paneli ve ChatWidget'ı birleştirme

| İş | Dosya | Detay |
|----|-------|-------|
| Dashboard asistanı chatStore'a bağla | `DashboardWidgets.tsx` | Yerel state → chatStore'dan veri al |
| ChatWidget'a quick action butonları ekle | `ChatWidget.tsx` | Not oluştur, Görev ekle, Özetle, Günümü Planla |
| Dashboard asistan API yolunu düzelt | `DashboardWidgets.tsx` | `/api/ai/chat` → `/api/chat` |
| Her iki panelde tutarlı butonlar | Both | Aynı quick action button seti |

## Faz B — Gün Planlama Sistemi (3-5 gün)
**Hedef:** Tam fonksiyonel etkileşimli gün planlama

| İş | Dosya | Detay |
|----|-------|-------|
| Day planning prompt template | `prompts.py` | Planlama için özel system prompt |
| Plan-day endpoint | `ai.py` | `POST /api/ai/plan-day` — multi-turn |
| Calendar auto-create | `ai.py` + `calendarStore.ts` | Plan → CalendarEvent[] dönüştürme |
| [DAY_PLAN] komut formatı | `ai.py` | Yeni komut ayrıştırma |
| Konum farkındalığı | `prompts.py` | Ev/Kafe/Dışarı parametreleri |

## Faz C — Proaktif Davranışlar (3-4 gün)
**Hedef:** AI'ın kullanıcı mesaj göndermeden çalışması

| İş | Dosya | Detay |
|----|-------|-------|
| APScheduler entegrasyonu | `main.py` + `services/scheduler.py` | Arka plan zamanlayıcı |
| Proaktif bildirim servisi | `services/proactive.py` | Sabah/öğle/akşam/gece |
| Görev durağanlık tespiti | `services/proactive.py` | 3+ gün dokunulmamış görevler |
| WebSocket push notifications | `websocket.py` | AI'dan frontend'e anlık mesaj |
| Frontend bildirim gösterimi | `TopNavbar.tsx` | AI bildirimlerini overlay göster |

## Faz D — Gelişmiş Hafıza (2-3 gün)
**Hedef:** Chat kalıcılığı ve katmanlı hafıza

| İş | Dosya | Detay |
|----|-------|-------|
| chat_messages tablosu | `models/chat_message.py` | Yeni DB modeli |
| Mesaj kaydetme/yükleme | `routers/ai.py` | Chat geçmişi DB'ye yazsın |
| Günlük özet üretimi | `services/memory_service.py` | Cron ile günlük sentez |
| Bağlama hafıza ekleme | `ai/context.py` | Önceki günlerin özetlerini dahil et |

## Faz E — Gelişmiş AI Yetenekleri (4-5 gün)
**Hedef:** AI'ın daha akıllı, daha faydalı olması

| İş | Detay |
|----|-------|
| Çalışma kalıbı analizi | Timer verilerinden en üretken saatleri tespit |
| Görev süre tahmini iyileştirme | Geçmiş verilerden öğrenme |
| Benzer iş tespiti | Eski görevleri referans gösterme |
| Duygu durumu algılama | Mesaj tonundan stres/motivasyon seviyesi |
| Akıllı önceliklendirme | Proje deadline'larına göre sıralama |

---

# BÖLÜM 7: TEKNİK DETAYLAR

## 7.1 — Dosya Haritası

```
app/backend/app/
├── ai/
│   ├── personality.py      # Kişilik + system prompt üretimi
│   ├── context.py          # DB'den bağlam oluşturma
│   ├── memory.py           # Token optimizasyonu (şimdilik truncate)
│   └── prompts.py          # Görev/motivasyon/planlama prompt şablonları
│
├── services/
│   ├── gemini.py           # Gemini API: classify, chat, categorize, breakdown, motivation
│   ├── report_service.py   # Günlük rapor oluşturma
│   └── proactive.py        # [YENİ] Proaktif AI davranışları
│
├── routers/
│   └── ai.py               # /api/chat, /api/breakdown, /api/motivation, /api/cost
│
└── models/
    ├── ai_memory.py        # AIMemory modeli (short/mid/long term)
    └── chat_message.py     # [YENİ] Chat geçmişi modeli
```

## 7.2 — Gemini API Maliyet Yönetimi

| İşlem | Model | Token (Ortalama) | Maliyet/Çağrı |
|-------|-------|-------------------|---------------|
| Niyet Analizi | flash-lite | ~200 in, ~20 out | ~$0.00008 |
| Normal Sohbet | flash-lite | ~3000 in, ~500 out | ~$0.0015 |
| Derin Analiz | pro | ~5000 in, ~1000 out | ~$0.022 |
| Görev Kategorizasyon | flash-lite | ~500 in, ~50 out | ~$0.0002 |
| Motivasyon | flash-lite | ~300 in, ~50 out | ~$0.00015 |
| Gün Planlama | pro | ~8000 in, ~2000 out | ~$0.04 |

**Optimizasyon Stratejileri:**
- Basit işler için her zaman `flash-lite` kullan
- Bağlamı 15.000 karakter ile sınırla
- Proaktif kontrolleri lightweight tutarak sık çalıştır
- Yalnızca gün planlama ve derin analiz için `pro` model

## 7.3 — APScheduler Yapılandırması (Planlanan)

```python
# services/scheduler.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()

# Zamanlı görevler
scheduler.add_job(morning_greeting, 'cron', hour=12, minute=0)
scheduler.add_job(lunch_reminder, 'cron', hour=14, minute=30)
scheduler.add_job(proactive_task_check, 'interval', hours=3)
scheduler.add_job(evening_summary, 'cron', hour=20, minute=0)
scheduler.add_job(night_warning, 'cron', hour=23, minute=0)
scheduler.add_job(daily_memory_synthesis, 'cron', hour=23, minute=30)
```

---

# BÖLÜM 8: AI'IN BEKİRCAN'I TANIMASI

## 8.1 — Kişilik Özeti (personality.py'de kullanılan)

```
INTP/ENTP | Enneagram 7w6 | ADHD Spektrum Uyumu

GÜÇLÜLER:
✅ Hiperfokus (gece 3-4'e kadar çalışabilir)
✅ Teknik beceri (yazılım, AI, otomasyon)
✅ Vizyon (büyük resmi görebilir)
✅ Yaratıcılık (sürekli yeni fikirler)

ZORLUKLAR:
⚠️ İşe başlama eşiği (sabah çok zor)
⚠️ Prokrastinasyon döngüsü
⚠️ Telefon bağımlılığı (8 saat ekran süresi)
⚠️ Çevresel bağımlılık (ev vs kafe)
⚠️ Sınır koyamama (fiyat söyleyememe)

MOTİVASYON FORMÜLÜ:
Motivasyon = (Yenilik + Yapı + Değer Görme) - (Belirsizlik + Monotonluk + İzolasyon)
```

## 8.2 — İletişim Ton Kılavuzu

| Durum | AI Tonu | Örnek |
|-------|---------|-------|
| Sabah | Sıcak, enerjik, kısa | "Günaydın Bekir! ☀️ Bugün bir tek X bitirsen bile kafi." |
| İş tamamlama | Kutlama, gurur | "Helal sana! 🎉 Bunu bugün bitirdin!" |
| Mola | Rahat, izin verici | "Güzel çalıştın, mola hak ettin 🎬" |
| Durağanlık | Nazik dürtme, merak | "Hey, iyi misin? Küçük bir adımla başlayalım mı?" |
| Geciken görev | Yargısız hatırlatma | "Bu görev 3 gündür bekliyor. Ertelenebilir mi?" |
| Gece geç | Koruyucu | "Saat 01:00 oldu, yarın devam etsen?" |
| Haftalık başarı | Veri + tebrik | "Bu hafta 18 saat çalıştın, %40 artış! 🏆" |

## 8.3 — Yapılmaması Gerekenler

| ❌ Yapma | ✅ Bunun Yerine |
|----------|----------------|
| "Hepsini yap" | "SADECE şunu yap, 10 dakika" |
| Zorlama/baskı | Kademeli, nazik yaklaşım |
| Robotik konuşma | Samimi, kısa, doğal |
| "Ekleyeyim mi?" sorma | Doğrudan ekle! |
| Sabah ağır iş önerme | Hafif/kolay görevle başlat |
| Uzun açıklamalar | Kısa, aksiyon odaklı |

---

# BÖLÜM 9: GELECEK GELİŞTİRME FİKİRLERİ

## 9.1 — Kısa Vadeli (1-2 Hafta)
- [ ] Chat geçmişi DB persistence
- [ ] Dashboard + ChatWidget birleştirmesi
- [ ] Günümü Planla butonu aktif çalışma
- [ ] Proaktif bildirimler (sabah/akşam)

## 9.2 — Orta Vadeli (1-2 Ay)
- [ ] Telegram bot tam entegrasyon (görev/not ekleme, bildirimler)
- [ ] Çalışma kalıbı analizi (en üretken saatler)
- [ ] Duygu durumu algılama (mesaj tonundan)
- [ ] Redis cache aktif kullanımı (sık sorguları cache'le)
- [ ] Gamification (rozetler, seri günler, puanlama)

## 9.3 — Uzun Vadeli (3-6 Ay)
- [ ] RAG mimarisi (Embedding + Semantic Search ile bağlam)
- [ ] Ses ile etkileşim (Speech-to-Text + Text-to-Speech)
- [ ] Multi-agent sistem (farklı uzman AI'lar — iş, kişisel, sağlık)
- [ ] Mobil uygulama (PWA → Native)
- [ ] SaaS dönüşümü (çok kullanıcılı yapı)
- [ ] n8n entegrasyonu (otomatik workflow tetikleme)

## 9.4 — Araştırma Konuları
- **Reclaim.ai** — AI takvim yönetimi örneği
- **Motion** — AI görev planlama + takvim birleştirme
- **Clockwise** — Odak zamanı koruma mekanizması
- **LangChain Memory** — Uzun vadeli hafıza mimarisi örnekleri
- **CrewAI** — Multi-agent orkestrasyonu
- **OpenAI Assistants API** — Thread-based conversation management

---

*Bu doküman, My World AI beyin sisteminin yaşayan belgesidir. Her geliştirme fazı sonrası güncellenecektir.*
