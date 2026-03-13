# Görev ↔ Takvim ↔ Not — Tam Çift Yönlü Entegrasyon Planı

## Amaç
Sistemdeki **Görevler**, **Takvim Etkinlikleri** ve **Notlar** arasında tam çift yönlü ilişki (cross-reference) kurarak; bir öğeye bakıldığında diğer ilişkili öğelerin görünür olmasını, tıklanabilir olmasını ve AI tarafından oluşturulduğunda otomatik bağlanmasını sağlamak.

---

## 🔍 Mevcut Durum Analizi

### Veritabanı Modelleri

| Model | Mevcut FK Bağlantıları | Eksikler |
|-------|----------------------|----------|
| `CalendarEvent` | `task_id → tasks.id` ✅ | `note_id` yok ❌ |
| `Note` | `project_id → projects.id` | `task_id` yok ❌ |
| `Task` | `project_id`, `parent_task_id` | `note_id` yok, `calendar_event` ilişkisi yok ❌ |

### Frontend Sorunları (EventDetailDialog)
1. **"Bu etkinlik tamamlandı"** → Saat geçmemiş olsa bile `is_completed=true` ise gösteriyor. Mantık hatalı.
2. **"Görev panosuna bağlı"** → Sadece statik metin, görev adı yok, tıklanabilir değil.
3. **Not bağlantısı** → Hiç yok.
4. **Görev/Not'tan takvim bağlantısı** → Hiç yok.

---

## 📐 Mimari Tasarım

### İlişki Şeması (Entity Relationship)

```
┌──────────┐       task_id FK        ┌──────────────────┐
│   Task   │◄────────────────────────│  CalendarEvent   │
│          │                         │                  │
│ note_ids │─ ─ ─ JSON ─ ─ ─ ─ ─ ─ ▶│  note_id FK      │
└──────────┘                         └──────────────────┘
     ▲                                       │
     │         task_id FK                    │ note_id FK
     │                                       ▼
     └───────────────────────────────┌──────────┐
                                     │   Note   │
                                     │ task_id  │
                                     └──────────┘
```

**Yeni Foreign Key'ler:**
- `CalendarEvent.note_id → notes.id` (Nullable)
- `Note.task_id → tasks.id` (Nullable)

---

## 🚀 Uygulama Planı

### Phase 1: Veritabanı Şema Güncellemeleri (Backend)

#### [MODIFY] `app/backend/app/models/calendar_event.py`
- `note_id = Column(Integer, ForeignKey("notes.id"), nullable=True)` ekle
- `note = relationship("Note")` ekle

#### [MODIFY] `app/backend/app/models/note.py`
- `task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)` ekle
- `task = relationship("Task")` ekle

#### Alembic Migration
- `alembic revision --autogenerate -m "add_cross_references"`
- `alembic upgrade head`

---

### Phase 2: AI Action Pattern Güncellemeleri (Backend)

#### [MODIFY] `app/backend/app/routers/ai.py`
AI bir sohbette hem görev, hem not, hem takvim etkinliği oluşturduğunda bunları otomatik bağla:

1. **Görev + Not birlikte oluşturulduğunda:** Not'a `task_id` ata
2. **Görev + Takvim birlikte oluşturulduğunda:** Zaten `task_id` mevcut ✅
3. **Not + Takvim birlikte oluşturulduğunda:** Takvim etkinliğine `note_id` ata
4. **Hepsi birlikteyse:** Üçünü de bağla

**Uygulama yöntemi:** AI action'ları parse edildikten sonra, aynı sohbet mesajında oluşturulan öğeleri bir `created_items` sözlüğünde topla, ardından cross-reference ata:

```python
created_items = {"tasks": [], "notes": [], "events": []}

# ... tüm action'lar işlendikten sonra:
for note in created_items["notes"]:
    if created_items["tasks"]:
        note.task_id = created_items["tasks"][0].id

for event in created_items["events"]:
    if created_items["notes"]:
        event.note_id = created_items["notes"][0].id
```

---

### Phase 3: API Endpoint Güncellemeleri (Backend)

#### [MODIFY] `app/backend/app/routers/tasks.py`
- `GET /api/tasks/{id}` → Response'a bağlı not ve takvim etkinliklerini ekle

#### [MODIFY] `app/backend/app/routers/notes.py`
- `GET /api/notes` → Response'a bağlı görev ve takvim bilgisini ekle

#### [MODIFY] Yeni endpoint veya mevcut calendar endpoint
- `GET /api/calendar/events` → Response'a bağlı görev ve not bilgisini ekle

#### Yeni API schemaları (Pydantic):
```python
# Task yanıtına eklenecek alanlar
linked_notes: Optional[List[LinkedNoteInfo]]  # [{id, title}]
linked_events: Optional[List[LinkedEventInfo]]  # [{id, title, start_time, end_time}]

# Note yanıtına eklenecek alanlar
linked_task: Optional[LinkedTaskInfo]  # {id, title, status}
linked_events: Optional[List[LinkedEventInfo]]

# CalendarEvent yanıtına eklenecek alanlar
linked_task: Optional[LinkedTaskInfo]  # {id, title, status, priority}
linked_note: Optional[LinkedNoteInfo]  # {id, title}
```

---

### Phase 4: Takvim Event Detail Popup Yeniden Tasarımı (Frontend)

#### [MODIFY] `CalendarPage.tsx` → `EventDetailDialog`

**Kaldırılacak:**
- ❌ "Görev panosuna bağlı" statik metin
- ❌ "Bu etkinlik tamamlandı" (koşulsuz gösterim)

**Eklenecek yeni bölümler:**

1. **Saat Aralığı Kartı** (mevcut, düzeltilebilir)
2. **Bağlı Görev Kartı** (tıklanabilir):
   - Görev adı, durumu (Bekliyor/Devam Ediyor), öncelik rengi
   - Tıklayınca `openTaskDetail(task)` çağır
3. **Bağlı Not Kartı** (tıklanabilir):
   - Not başlığı, oluşturma tarihi
   - Tıklayınca not detay paneli aç
4. **Tamamlama butonu** (sadece saat henüz geçmemişken "Tamamla" yaz, geçmişse otomatik durumu göster)

**Tamamlanma mantığı düzeltmesi:**
- Etkinliğin bitiş saati henüz geçmediyse → "Tamamla" butonu göster
- Etkinlik tamamlandıysa (is_completed=true VE saat geçmişse) → "Tamamlandı" rozeti göster
- Saat geçmemişse is_completed=false olmalı (otomatik set edilmez)

---

### Phase 5: Görev Detay Paneli Güncellemesi (Frontend)

#### [MODIFY] `TaskDetailPanel.tsx`

Görev detayına yeni "Bağlı Öğeler" bölümü ekle:
- **📝 Bağlı Not:** Not simgesi + not başlığı. Tıklayınca not paneli açılır.
- **📅 Takvim Etkinliği:** Takvim simgesi + saat aralığı. Tıklayınca takvim tarihine navigasyon.

Konum: Mevcut "Durum: Bekliyor · Tarih: X · Öncelik: Y" satırının sağ tarafında veya hemen altında etiket (badge) olarak.

---

### Phase 6: Not Detay Paneli Güncellemesi (Frontend)

#### [MODIFY] Not detay bileşeni (mevcut `NoteCard` veya `NoteDetail`)

Not başlığının yanında yeni etiketler:
- **✅ Bağlı Görev:** Görev adı + durum. Tıklayınca görev detayı açılır.
- **📅 Takvim:** Saat aralığı bilgisi. Tıklayınca takvim görünümüne git.

---

### Phase 7: AI Prompt Güncellemesi (Backend)

#### [MODIFY] `app/backend/app/ai/personality.py`
AI'a çapraz referans farkındalığı ver:

```
KURAL: Aynı konuşmada hem görev, hem not, hem takvim etkinliği oluşturduğunda, 
bunların birbiriyle bağlantılı olduğunu bilmelisin. Sistem bunları otomatik bağlayacak.
Kullanıcıya "Not, görev ve takvim etkinliği birbiriyle bağlantılı olarak oluşturuldu" şeklinde bilgi ver.
```

---

## ✅ Doğrulama Planı

### Otomatik Test Senaryoları
1. AI'a "Yarın telefonuma format atacağım, not al, görev oluştur, takvime ekle" mesajı gönder
2. Oluşturulan Not'un `task_id` alanının dolu olduğunu doğrula
3. Oluşturulan CalendarEvent'in `task_id` ve `note_id` alanlarının dolu olduğunu doğrula
4. `GET /api/tasks/{id}` yanıtında `linked_notes` ve `linked_events` alanlarını kontrol et

### Manuel Doğrulama
1. **Takvim popup:** Etkinliğe tıkla → görev adı ve not başlığı görünür, tıklanabilir
2. **Görev detayı:** Göreve gir → bağlı not ve takvim saati görünür
3. **Not detayı:** Nota gir → bağlı görev ve takvim saati görünür
4. **Tamamlanma mantığı:** Gelecek saatteki etkinlikte "tamamlandı" yazmamalı

---

## 📋 Öncelik ve Bağımlılık Sırası

```
Phase 1 (DB) → Phase 2 (AI Bağlama) → Phase 3 (API)
                                         ↓
Phase 7 (Prompt) → Phase 4 (Takvim UI) → Phase 5 (Görev UI) → Phase 6 (Not UI)
```

**Toplam Tahmini Dosya Değişiklikleri:** ~10 dosya
**Kritik Yol:** DB migration → AI cross-ref → API response → Frontend UI'lar
