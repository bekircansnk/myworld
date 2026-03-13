# 🧠 AI Akıllı Mükerrer Kontrolü — Proje Planı (PLAN Dosyası)

> **Amaç:** AI'ın körlemesine etkinlik, görev ve not oluşturmasını engellemek. Oluşturmadan önce mevcut sistemi kontrol etmesini ve kullanıcıyı proaktif olarak yönlendirmesini sağlamak.

---

## 🔍 Kök Neden Analizi

Ekran görüntülerinde "PikselAI: Mobil Ekran Wireframe Tasarımı" ve "API Optimizasyon Testleri" takvimde ikişer kez görünüyor. Bunun **4 kök nedeni** tespit edildi:

| # | Kök Neden | Dosya | Detay |
|---|-----------|-------|-------|
| 1 | **Takvim bağlama dahil değil** | `context.py` | `CalendarEvent` hiç sorgulanmıyor — AI takvimi GÖRM-Ü-YOR |
| 2 | **System prompt'ta kontrol yok** | `personality.py` | "Oluşturmadan önce kontrol et" talimatı yok |
| 3 | **Backend'de mükerrer kontrolü yok** | `ai.py` | `ADD_EVENT` doğrudan oluşturuyor, benzer etkinlik kontrolü yapmıyor |
| 4 | **Gün planlama takvimi görmüyor** | `prompts.py` | `DAY_PLANNING_PROMPT` mevcut takvim verisi almıyor |

> [!CAUTION]
> Aynı sorun **görev oluşturma** (`PLAN_START`) için de geçerli. AI aynı başlıklı görevi tekrar oluşturabilir.

---

## 🏗️ Önerilen Değişiklikler

### Phase 1: Bağlama Takvim + Akıllı Kontrol Verisi Ekleme

#### [MODIFY] [context.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/ai/context.py)

Mevcut bağlam sadece **projeler**, **görevler** ve **notları** içeriyor. Eklenmesi gerekenler:

1. **Bugünün ve yarının takvim etkinlikleri** — AI tam gürünürlük kazanır
2. **Son 7 günün etkinlikleri** — Tekrarları görmesi için
3. **Etkinlik özet bloğu** — AI'ın "boş saatler" ve "dolu saatler" görmesi için

```python
# YENİ BÖLÜM: === TAKVİM ETKİNLİKLERİ ===
from app.models.calendar_event import CalendarEvent
from datetime import timedelta

# Bugün + yarın + son 7 gün etkinlikleri
today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0)
period_start = today_start - timedelta(days=7)
period_end = today_start + timedelta(days=2)

event_result = await db.execute(
    select(CalendarEvent)
    .filter(CalendarEvent.user_id == user_id,
            CalendarEvent.start_time >= period_start,
            CalendarEvent.start_time <= period_end)
    .order_by(CalendarEvent.start_time)
)
events = event_result.scalars().all()

context += "\n=== TAKVİM ETKİNLİKLERİ (SON 7 GÜN + BUGÜN + YARIN) ===\n"
context += "⚠️ AŞAĞIDAKİ ETKİNLİKLER ZATEN TAKVİMDE VAR. Benzer veya aynı etkinlik OLUŞTURMA!\n"
for e in events:
    time_str = e.start_time.strftime('%d/%m %H:%M')
    end_str = e.end_time.strftime('%H:%M') if e.end_time else "?"
    task_ref = f" (Görev ID:{e.task_id})" if e.task_id else ""
    context += f"- [{time_str}-{end_str}] {e.title}{task_ref}\n"
```

---

### Phase 2: System Prompt'a Mükerrer Koruma Talimatları

#### [MODIFY] [personality.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/ai/personality.py)

`get_personality_instruction()` fonksiyonunun `=== SİSTEME HAKİMİYET ===` bölümüne aşağıdaki kurallar eklenecek:

```
=== MÜKERRER KONTROL SİSTEMİ (KRİTİK P0) ===

HER OLUŞTURMA İŞLEMİNDEN ÖNCE BAĞLAMI KONTROL ET:

📅 TAKVİM ETKİNLİĞİ OLUŞTURMADAN ÖNCE:
- Takvim etkinlikleri bölümündeki mevcut etkinlikleri incele
- Aynı başlıkta veya aynı saatte zaten etkinlik varsa OLUŞTURMA
- Eğer benzer etkinlik varsa kullanıcıya bildir:
  "Bekir, takvimde zaten [13:00-14:30] 'Wireframe Tasarımı' var. Tekrar eklememi ister misin, yoksa saatini mi güncelleyeyim?"
- Eğer aynı görev için farklı saatte etkinlik varsa:
  "Bu görev için zaten [10:00-11:30] arası bir slot var. Saatini değiştirmek mi istiyorsun?"

📋 GÖREV OLUŞTURMADAN ÖNCE:
- Aktif görevler listesini incele
- Aynı veya çok benzer başlıklı görev varsa OLUŞTURMA
- Kullanıcıya bildir: "Bekir, 'Web sitesi tasarımı' adında zaten aktif bir görevin var (ID:38). Bunu mu düzenleyelim yoksa farklı bir görev mi?"

📝 NOT OLUŞTURMADAN ÖNCE:
- Son notlar bölümünü kontrol et
- Aynı içerikli not varsa tekrar oluşturma

🧠 GENEL ZEKA KURALI:
- Kullanıcı daha önce yaptığı bir isteği tekrar ederse, "Bunu daha önce konuşmuştuk, mevcut durum şu..." de
- Proaktif ol: "Senin zaten şöyle bir görevin vardı, buna benziyor. Bir kontrol edelim mi?"
- İkili kontrol: Emin değilsen SOR, emin isen oluşturma/güncelle
```

---

### Phase 3: DAY_PLANNING_PROMPT'a Takvim Verisi

#### [MODIFY] [prompts.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/ai/prompts.py)

`DAY_PLANNING_PROMPT`'a mevcut takvim etkinliklerini ekle:

```python
DAY_PLANNING_PROMPT = """
# MEVCUT ÖNEMLİ BİLGİLER:
...
Mevcut Takvim Etkinlikleri (BUGÜN):
{calendar_context}

⚠️ YUKARIDA ZATEN OLAN ETKİNLİKLERİ TEKRAR EKLEME! 
Sadece BOŞ saatlere yeni etkinlikler planla.
Zaman çakışması OLMASIN.
...
"""
```

#### [MODIFY] [gemini.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/services/gemini.py)

`generate_chat_response` fonksiyonunda `is_day_planning=True` iken `calendar_context` parametresini de geçir. Bu, `context.py`'den gelen takvim etkinliklerini day planning prompt'a enjekte eder.

---

### Phase 4: Backend Mükerrer Guard (Savunma Hattı)

#### [MODIFY] [ai.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/routers/ai.py)

AI prompt'ta kontrol etse bile, backend'de de son savunma hattı olarak mükerrer kontrolü yapılmalı:

**Etkinlik için:**
```python
# ADD_EVENT parse edilirken:
# 1. Aynı başlık + aynı gün + ±30 dakika farkla etkinlik var mı?
existing_event = await db.execute(
    select(CalendarEvent).where(
        CalendarEvent.user_id == MOCK_USER_ID,
        CalendarEvent.title == title,
        CalendarEvent.start_time >= start_dt - timedelta(minutes=30),
        CalendarEvent.start_time <= start_dt + timedelta(minutes=30)
    )
)
if existing_event.scalars().first():
    # OLUŞTURMA! → ActionLog'a "DUPLICATE_SKIPPED" yaz
    actions_executed.append(ActionLog(
        action="DUPLICATE_SKIPPED",
        details=f"'{title}' zaten takvimde var, atlandı",
        success=False
    ))
    continue  # Bir sonraki etkinliğe geç
```

**Görev için (PLAN_START):**
```python
# Aynı başlıkta aktif görev var mı?
existing_task = await db.execute(
    select(Task).where(
        Task.user_id == MOCK_USER_ID,
        Task.title == plan_title,
        Task.status != "done"
    )
)
if existing_task.scalars().first():
    # Atla + ActionLog
```

---

### Phase 5: Çoklu Kategori Desteği (Oturum Bazlı)

> [!IMPORTANT]
> Şu anki sistem tek kategori atıyor (`if/elif` mantığı). Ama bir sohbette AI aynı anda `CREATE_PLAN` + `ADD_NOTE` + `ADD_EVENT` yapabilir. Bu durumda oturum **tüm ilgili kategorilerde** gözükmeli.

**Sorunun ekran görüntüsü:** AI bir sohbette `CREATE_PLAN` + `ADD_SUBTASKS` + `ADD_NOTE` yapıyor → kart sadece "Görev" etiketi gösteriyor. Kullanıcı "Not Defteri" filtresine bakınca bu sohbeti göremiyor.

#### [MODIFY] [chat_session.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/models/chat_session.py)

`ai_category` alanını `String(20)` → `JSON` olarak değiştir:

```python
# ESKİ:
ai_category = Column(String(20), default="genel")

# YENİ:
ai_categories = Column(JSON, default=lambda: ["genel"])  # ["gorev", "not", "takvim"]
```

#### [MODIFY] [chat_session.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/schemas/chat_session.py)

```python
# ESKİ:
ai_category: str = "genel"

# YENİ:
ai_categories: list[str] = ["genel"]  # Çoklu kategori desteği
```

#### [MODIFY] [ai.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/routers/ai.py)

Kategorizasyon mantığını `if/elif` → **set biriktirme** olarak değiştir:

```python
# ESKİ (if/elif — sadece ilk eşleşme):
if action_types & {"CREATE_PLAN", "ADD_TASK", "ADD_SUBTASKS"}:
    current_session.ai_category = "gorev"
elif "ADD_EVENT" in action_types:
    current_session.ai_category = "takvim"
elif "ADD_NOTE" in action_types:
    current_session.ai_category = "not"

# YENİ (set biriktirme — tüm eşleşmeler):
new_categories = set(current_session.ai_categories or [])
if action_types & {"CREATE_PLAN", "ADD_TASK", "ADD_SUBTASKS"}:
    new_categories.add("gorev")
if "ADD_EVENT" in action_types:
    new_categories.add("takvim")
if "ADD_NOTE" in action_types:
    new_categories.add("not")
# "genel" sadece hiçbir kategori yoksa kalır
if len(new_categories) > 1:
    new_categories.discard("genel")
current_session.ai_categories = sorted(list(new_categories))
```

#### [MODIFY] `/api/chat/sessions` list endpoint

Filtreleme mantığı `==` → **JSON array contains** olarak değişir:

```python
# ESKİ:
query = query.where(ChatSession.ai_category == category)

# YENİ (PostgreSQL JSON array check):
from sqlalchemy import cast, String
from sqlalchemy.dialects.postgresql import ARRAY
query = query.where(ChatSession.ai_categories.contains([category]))
```

#### [MODIFY] [AIChatDashboard.tsx](file:///Users/bekir/Uygulamalarım/2-My-World/app/frontend/src/components/ai-chat/AIChatDashboard.tsx)

**SessionCard'da çoklu tag gösterme:**
```tsx
// ESKİ: Tek tag
<span>{cat.label}</span>

// YENİ: Birden fazla tag
{session.ai_categories.map(catKey => {
  const cat = CATEGORY_CONFIG[catKey]
  return (
    <span key={catKey} className={`${cat.bgColor} ${cat.color} ...`}>
      {cat.icon} {cat.label}
    </span>
  )
})}
```

#### [MODIFY] [aiChatStore.ts](file:///Users/bekir/Uygulamalarım/2-My-World/app/frontend/src/stores/aiChatStore.ts)

Interface tipi güncelleme:
```typescript
// ESKİ:
ai_category: 'gorev' | 'takvim' | 'not' | 'genel';

// YENİ:
ai_categories: string[];  // ["gorev", "not", "takvim"]
```

---

## 📊 Etkilenen Dosyalar Özeti

| Dosya | Faz | Değişiklik Türü |
|-------|-----|-----------------|
| `app/backend/app/ai/context.py` | Phase 1 | Takvim etkinliklerini bağlama ekle |
| `app/backend/app/ai/personality.py` | Phase 2 | Mükerrer kontrol talimatları ekle |
| `app/backend/app/ai/prompts.py` | Phase 3 | DAY_PLANNING_PROMPT'a takvim verisi ekle |
| `app/backend/app/services/gemini.py` | Phase 3 | calendar_context parametresi geçir |
| `app/backend/app/routers/ai.py` | Phase 4+5 | Backend duplicate guard + çoklu kategori |
| `app/backend/app/models/chat_session.py` | Phase 5 | ai_category → ai_categories (JSON array) |
| `app/backend/app/schemas/chat_session.py` | Phase 5 | Schema güncelleme |
| `app/frontend/src/stores/aiChatStore.ts` | Phase 5 | ChatSession tip güncelleme |
| `app/frontend/src/components/ai-chat/AIChatDashboard.tsx` | Phase 5 | Çoklu tag kartları |

---

## 🔬 Doğrulama Planı

### Test Senaryoları

| # | Senaryo | Beklenen Davranış |
|---|---------|-------------------|
| 1 | "Günümü planla" + takvimde zaten etkinlikler var | AI mevcut etkinlikleri görmeli, sadece boş saatlere plan yapmalı |
| 2 | Aynı "Günümü planla" komutunu 2. kez gönder | AI "Bunlar zaten takvimde var, tekrar eklemeyeceğim" demeli |
| 3 | "PikselAI incelemesi yap" + aynı görev zaten açık | AI "Zaten 'PikselAI İncelemesi' görevin var (ID:38)" demeli |
| 4 | "Yarın saat 14'te toplantı koy" + o saatte başka etkinlik var | AI "14:00'te zaten X var, başka saat önereyim mi?" demeli |
| 5 | Backend guard: Prompt geçse bile aynı etkinlik DB'ye gitmemeli | `DUPLICATE_SKIPPED` action log oluşmalı |
| 6 | AI tek sohbette görev + not + etkinlik oluştursun | Session kartında 3 tag gözükmeli: "Görev", "Not", "Takvim" |
| 7 | "Not Defteri" filtresi — yukarıdaki sohbet burada da gözükmeli | Çoklu kategoriye sahip oturumlar tüm ilgili filtrelerde görünmeli |

### Test Komutları
```bash
# 1. Context'te takvim etkinlikleri görünüyor mu?
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Bugün takvimimde ne var?"}]}'

# 2. Çoklu kategori testi
curl "http://localhost:8000/api/chat/sessions?category=not"
# Beklenen: Görev+Not birlikte olan oturumlar da burada gözükmeli
```

---

## ⏱ Tahmini Süre

| Faz | Süre |
|-----|------|
| Phase 1: Context'e takvim ekleme | ~15 dk |
| Phase 2: System prompt güncelleme | ~10 dk |
| Phase 3: DAY_PLANNING_PROMPT | ~15 dk |
| Phase 4: Backend guard | ~20 dk |
| Phase 5: Çoklu kategori desteği | ~25 dk |
| Test & Debug | ~15 dk |
| **Toplam** | **~100 dk** |

---

[ONAY] Bu plan dosyası kodlama öncesi değerlendirme içindir. Onay sonrası geliştirme başlatılır.

