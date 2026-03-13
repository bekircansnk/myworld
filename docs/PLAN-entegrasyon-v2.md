# 🔗 Görev-Not-Takvim Çift Yönlü Entegrasyon Planı v2

> **Amaç:** Görevler, Notlar ve Takvim Etkinlikleri arasındaki çift yönlü bağlantıyı tam çalışır hale getirmek.

---

## 🔴 KÖK NEDEN ANALİZİ (Neden Çalışmıyor?)

### 1. Backend Şema Eksikliği (EN KRİTİK)
`NoteResponse` Pydantic şemasında **`task_id` alanı YOK**. Veritabanında `Note.task_id` FK olarak var ve AI doğru atıyor, ancak API yanıtı bu bilgiyi frontend'e **hiç göndermiyor**.

```
DB Model ✅ → Note.task_id = 42  (Doğru kaydedildi)
Schema  ❌ → NoteResponse'da task_id yok (Frontend'e gönderilmiyor)
Frontend ❌ → note.task_id = undefined (Veri asla gelmiyor)
```

### 2. Frontend Type Eksikliği
`types/index.ts` → `Note` interface'inde `task_id` alanı tanımlı değil. Backend doğru gönderse bile TypeScript onu tanımıyor.

### 3. Takvim Etkinliği Payload Eksikliği
AI etkinlik oluştururken payload'a `taskId` atıyor ama `noteId` **payload oluşturma anında henüz atanmadı**. Cross-reference mantığı payload'dan SONRA çalışıyor, dolayısıyla frontend tarafına `noteId` asla ulaşmıyor.

### 4. Cross-Reference Sıralama Hatası
`ai.py`'de cross-reference bölümü payload güncelleme yapsa bile, `act.payload` optional ve `None` olabilir, type guard eksik.

---

## 📋 PHASE 1: Backend Şema Düzeltmeleri

### 1.1 `NoteResponse` → `task_id` ekleme
**Dosya:** `app/backend/app/schemas/note.py`

```diff
class NoteResponse(NoteBase):
    id: int
    user_id: int
+   task_id: Optional[int] = None
    ai_analysis: Optional[str] = None
    ...
```

### 1.2 `NoteCreate` / `NoteBase` → `task_id` ekleme
```diff
class NoteBase(BaseModel):
    content: str
    title: Optional[str] = None
    project_id: Optional[int] = None
+   task_id: Optional[int] = None
    ...
```

---

## 📋 PHASE 2: Frontend Type Düzeltmeleri

### 2.1 `Note` interface → `task_id` ekleme
**Dosya:** `app/frontend/src/types/index.ts`

```diff
export interface Note {
    id: number;
    ...
+   task_id?: number;
    ...
}
```

---

## 📋 PHASE 3: AI Payload Düzeltmeleri (Takvim)

### 3.1 Payload'a Note ID ekleme DOĞRU ZAMANDA
**Dosya:** `app/backend/app/routers/ai.py`

**Sorun:** Event payload'ı cross-reference'dan ÖNCE oluşturuluyor. `noteId: null` olarak frontend'e gidiyor.

**Çözüm:** Cross-reference bölümünde payload'ları güncelleme mantığını güçlendirmek + type guard eklemek.

```python
# Cross-reference sonrası: payload'ları frontende uygun şekilde güncelle
for act in actions_executed:
    if act.action == "ADD_EVENT" and act.success and act.payload:
        for e in created_items["events"]:
            if act.payload.get("title") == e.title:
                act.payload["noteId"] = e.note_id
                act.payload["taskId"] = e.task_id
```

---

## 📋 PHASE 4: Frontend Bileşen Düzeltmeleri

### 4.1 EventDetailDialog — Görev kartı gösterilmiyor
**Dosya:** `CalendarPage.tsx`

**Sorun:** `linkedTask` değişkeni `event.taskId` ile task store'dan buluyor ama:
- Eğer AI event'i oluştururken `task_id_val` null ise taskId payload'a null gidiyor
- Cross-reference sonrası `taskId` güncellenmesine rağmen, event zaten localStorage'a `taskId: null` olarak yazılmış oluyor

**Çözüm:** Cross-reference'ın payload'a doğru `taskId` atamasını yapmasını garantilemek (Phase 3). Ayrıca frontend'de de backend'den gelen event verilerini doğru eşleştirmek.

### 4.2 TaskDetailPanel → LinkedItemsBadges çalışmıyor
**Dosya:** `TaskDetailPanel.tsx`

**Sorun:** `notes.find((n: any) => n.task_id === taskId)` — Frontend'deki not verilerinde `task_id` alanı yok çünkü Phase 1'deki sorundan dolayı API bu veriyi göndermiyor.

**Çözüm:** Phase 1 + Phase 2 düzeltmeleri yapıldığında otomatik çalışacak.

### 4.3 NoteDetailPanel → Bağlı görev gösterilmiyor
**Dosya:** `NoteDetailPanel.tsx`

**Sorun:** `(selectedNote as any).task_id` → Phase 1 düzeltmesi ile `task_id` gelecek, type casting'e gerek kalmayacak.

---

## 📋 PHASE 5: Doğrulama ve Test

### Otomatik Test Senaryosu:
1. Backend build kontrolü (Python import + alembic check)
2. Frontend build kontrolü (`npm run build`)
3. Tarayıcıda test:
   - AI'a görev+not+etkinlik oluşturmasını söyle
   - Takvimde etkinliğe tıkla → Hem not hem görev kartı görünmeli
   - Görev panelinde bağlı not rozeti görünmeli
   - Not panelinde bağlı görev rozeti görünmeli

---

## 📊 Etkilenen Dosyalar Özet Tablosu

| Dosya | Değişiklik | Phase |
|-------|-----------|-------|
| `backend/app/schemas/note.py` | `task_id` alanı ekleme | 1 |
| `frontend/src/types/index.ts` | `Note.task_id` ekleme | 2 |
| `backend/app/routers/ai.py` | Payload type guard + sıralama | 3 |
| `frontend/CalendarPage.tsx` | İyileştirme (Phase 1-3 çözünce otomatik) | 4 |
| `frontend/TaskDetailPanel.tsx` | İyileştirme (Phase 1-2 çözünce otomatik) | 4 |
| `frontend/NoteDetailPanel.tsx` | Type casting kaldır, doğrudan erişim | 4 |
