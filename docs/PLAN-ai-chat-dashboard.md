# 🤖 AI Chat & Smart Planning Dashboard — Proje Planı

> **Amaç:** Mevcut "Bekir Akıllı Dashboard" temasıyla tutarlı, kalıcı hafızalı ve otomatik kategorize edilen bir AI sohbet dashboard ekranı oluşturmak.

---

## 📋 Özet

Bu plan, mevcut My World uygulamasına tam ekran bir **AI Chat Dashboard** ekranı ekler. Kullanıcı:
- **Sol panelde** AI ile sohbet eder (görev planlama, takvim, not defteri)
- **Sağ panelde** tüm sohbet geçmişini kalıcı olarak görür (asla silinmez)
- **Üst merkez kategori switcher** ile sohbetleri filtreler: Görev Planlama, Takvim Planlama, Not Defteri, Tüm Sohbetler

Tasarım, `dashboard1.png` referans temasına sadık kalır: krem tonları, sarı aksan renkleri, glassmorphism, yumuşak köşeler, premium tipografi.

---

## 🎯 Kullanıcı İnceleme Gerektiren Noktalar

> [!IMPORTANT]
> **Yeni ViewMode:** `page.tsx`'e yeni `ai_chat` viewMode eklenecek. `TopNavbar`'a "🤖 AI Chat" butonu eklenecek. Bu mevcut navigasyon akışını etkileyebilir.

> [!IMPORTANT]
> **Mevcut ChatWidget ile ilişki:** Mevcut sağ alt köşedeki floating `ChatWidget` korunacak. AI Chat Dashboard ayrı bir tam ekran deneyim sunacak. İkisi de aynı `chatStore`'u ve backend `/api/chat` endpoint'ini kullanacak, ancak Dashboard versiyonu oturum (session) bazlı çalışacak.

---

## 🏗️ Önerilen Değişiklikler

### Backend — Sohbet Oturumu Altyapısı

#### [NEW] [chat_session.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/models/chat_session.py)
Yeni `ChatSession` SQLAlchemy modeli:
```python
# chat_sessions tablosu
- id: INT PK
- user_id: INT FK→users
- title: VARCHAR (ilk mesajdan AI'ın otomatik ürettiği başlık)
- ai_category: VARCHAR ("gorev" / "takvim" / "not" / "genel")
- last_message_preview: TEXT (son mesajın kısa özeti)
- message_count: INT (default 0)
- is_active: BOOL (default true)
- created_at: TIMESTAMP(tz)
- updated_at: TIMESTAMP(tz)
```

#### [MODIFY] [chat_message.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/models/chat_message.py)
- `session_id` alanını `ChatSession` tablosuna FK olarak bağla (şu anda String(100), nullable True olarak var — FK ilişkisine dönüştürülecek)

#### [NEW] [chat_session.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/schemas/chat_session.py)
Pydantic şemaları: `ChatSessionCreate`, `ChatSessionResponse`, `ChatSessionListResponse`

#### [MODIFY] [ai.py](file:///Users/bekir/Uygulamalarım/2-My-World/app/backend/app/routers/ai.py)
Yeni endpoint'ler:
- `POST /api/chat/sessions` → Yeni oturum oluştur
- `GET /api/chat/sessions` → Oturumları listele (kategori filtrelemeli)
- `GET /api/chat/sessions/{session_id}/messages` → Oturuma ait mesajları getir
- `POST /api/chat` → Mevcut endpoint'i güncelle: `session_id` parametresi ekle, otomatik kategorizasyon ekle

**Otomatik Kategorizasyon Mantığı:**
AI cevabındaki aksiyonlara göre oturumun kategorisi belirlenir:
- `CREATE_PLAN`, `ADD_TASK`, `ADD_SUBTASKS` → `"gorev"`
- `ADD_EVENT` → `"takvim"`
- `ADD_NOTE` → `"not"`
- Hiçbiri yoksa → `"genel"`

---

### Frontend — AI Chat Dashboard Sayfası

#### [NEW] [AIChatDashboard.tsx](file:///Users/bekir/Uygulamalarım/2-My-World/app/frontend/src/components/ai-chat/AIChatDashboard.tsx)
Ana dashboard bileşeni (~600 satır):

**Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│   [Görev Planlama] [Takvim Planlama] [Not Defteri] [Tümü]   │  ← Üst Kategori Switcher
├──────────────────────────┬───────────────────────────────────┤
│                          │                                   │
│   AI SOHBET PANELİ       │   KALICI HAFIZA & GEÇMİŞ         │
│                          │                                   │
│  ┌────────────────────┐  │  ┌─────────────────────────────┐  │
│  │ Mesaj balonları... │  │  │ Sohbet kartı #1             │  │
│  │                    │  │  │ 🟡 Görev | 12 Mart 14:30    │  │
│  │                    │  │  │ Ben: "Haftalık plan yap"     │  │
│  │                    │  │  │ AI: "Planınız hazır..."      │  │
│  │                    │  │  ├─────────────────────────────┤  │
│  │                    │  │  │ Sohbet kartı #2             │  │
│  │                    │  │  │ 🔵 Takvim | 11 Mart 10:00   │  │
│  │                    │  │  │ Ben: "Toplantı ekle..."      │  │
│  └────────────────────┘  │  │ AI: "Eklendi!"               │  │
│  ┌────────────────────┐  │  └─────────────────────────────┘  │
│  │ 🔗 Not  📋 Görev  │  │                                   │
│  │ [Mesajını yaz...  ]│  │                                   │
│  └────────────────────┘  │                                   │
└──────────────────────────┴───────────────────────────────────┘
```

**Sol Panel (AI Sohbet) İçeriği:**
- AI avatar + durum göstergesi (aktif/düşünüyor)
- Mesaj balonları: Kullanıcı (sağda, koyu arka plan), AI (solda, açık arka plan)
- Yapılandırılmış AI cevapları (kod blokları, syntax highlighting, kopyala butonu)
- Aksiyon rozetleri (görev oluşturuldu, takvime eklendi vb.)
- Alt kısımda hızlı komut butonları + mesaj girdi alanı

**Sağ Panel (Kalıcı Hafıza & Geçmiş) İçeriği:**
- Sohbet kartları listesi (scrollable)
- Her kart: Kullanıcının son sorusu + AI özeti + kategori tag'i (renkli baloncuk) + tarih
- Kartın tıklanması → Sol panelde o oturumun devamı açılır
- Yeni Sohbet butonu (üstte)

**Kategori Tag Renkleri:**
- 🟡 Görev → `bg-amber-100 text-amber-700` (dark: `bg-amber-950 text-amber-300`)
- 🔵 Takvim → `bg-blue-100 text-blue-700`
- 🟢 Not → `bg-emerald-100 text-emerald-700`
- ⚪ Genel → `bg-slate-100 text-slate-600`

#### [NEW] [aiChatStore.ts](file:///Users/bekir/Uygulamalarım/2-My-World/app/frontend/src/stores/aiChatStore.ts)
Yeni Zustand store:
```typescript
interface AIChatState {
  sessions: ChatSession[]           // Tüm oturumlar
  activeSessionId: string | null    // Aktif oturum
  activeMessages: ChatMessage[]     // Aktif oturumun mesajları
  selectedCategory: CategoryFilter  // 'all' | 'gorev' | 'takvim' | 'not'
  isLoading: boolean
  
  // Metodlar
  fetchSessions: (category?) => void
  createSession: () => void
  selectSession: (id) => void
  sendMessage: (content, sessionId?) => void
  setCategory: (cat) => void
}
```

---

### Frontend — Navigasyon ve Routing

#### [MODIFY] [projectStore.ts](file:///Users/bekir/Uygulamalarım/2-My-World/app/frontend/src/stores/projectStore.ts)
- `ViewMode` tipine `'ai_chat'` ekle

#### [MODIFY] [page.tsx](file:///Users/bekir/Uygulamalarım/2-My-World/app/frontend/src/app/page.tsx)
- `ai_chat` viewMode için `AIChatDashboard` bileşenini render et
- `pageTitle` ve `pageDescription` ekle

#### [MODIFY] [TopNavbar.tsx](file:///Users/bekir/Uygulamalarım/2-My-World/app/frontend/src/components/layout/TopNavbar.tsx)
- Navbar'a "🤖 AI Chat" butonu ekle (mevcut butonlar arasına)

---

### Tema ve Tasarım

Tüm tasarım `dashboard1.png` referansıyla tutarlı olacak:
- **Arkaplan:** `bg-[#F5F2E8]` (krem), dark: `bg-background`
- **Kartlar:** `bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100`
- **Aksan:** `brand-yellow` (#F5C542)
- **Tipografi:** Mevcut font sistemi (Inter/system)
- **Mesaj Balonları:** Pastel tonlar, `rounded-2xl`, glassmorphism efektleri
- **Hover Efektleri:** `hover:bg-brand-yellow/10`, `hover:scale-[1.02]`
- **Geçiş Animasyonları:** `transition-all duration-300`, `animate-in slide-in`

---

## 🔬 Doğrulama Planı

### Backend API Testleri
```bash
# 1. Yeni oturum oluştur
curl -X POST http://localhost:8000/api/chat/sessions \
  -H "Content-Type: application/json"

# 2. Oturumları listele
curl http://localhost:8000/api/chat/sessions

# 3. Kategori filtreli listeleme
curl "http://localhost:8000/api/chat/sessions?category=gorev"

# 4. Oturum mesajlarını getir
curl http://localhost:8000/api/chat/sessions/{SESSION_ID}/messages

# 5. Oturuma mesaj gönder (mevcut /api/chat + session_id)
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Haftalık planımı yap"}], "session_id": "SESSION_ID"}'
```

### Frontend Tarayıcı Testi
1. `npm run dev` ile frontend'i başlat
2. Tarayıcıda `localhost:3000` aç
3. Üst navbar'dan **"🤖 AI Chat"** butonuna tıkla
4. İki panelli layout'un doğru render edildiğini kontrol et
5. **Yeni Sohbet** başlat — sol panelde AI ile konuş
6. Mesaj gönderdikten sonra sağ panelde sohbet kartının oluştuğunu gözlemle
7. Kategori switcher'ı tıkla — sohbetlerin filtrelendiğini doğrula
8. Sağ paneldeki bir sohbet kartına tıkla — sol panelde o oturumun yüklendiğini doğrula
9. Dark mode toggle — tüm bileşenlerin dark mode uyumunu kontrol et

### Manuel Doğrulama (Kullanıcı)
- Biçimlendirme ve görsel kalite (dashboard1 referansıyla uyum)
- Mobil cihazda responsive davranış (ekran küçülünce tek panel)

---

## 📊 Dosya Özeti

| Dosya | Durum | Açıklama |
|-------|-------|----------|
| `app/backend/app/models/chat_session.py` | [NEW] | ChatSession DB modeli |
| `app/backend/app/models/chat_message.py` | [MODIFY] | session_id FK bağlantısı |
| `app/backend/app/schemas/chat_session.py` | [NEW] | Pydantic şemaları |
| `app/backend/app/routers/ai.py` | [MODIFY] | Oturum API'leri + kategorizasyon |
| `app/frontend/src/components/ai-chat/AIChatDashboard.tsx` | [NEW] | Ana dashboard bileşeni |
| `app/frontend/src/stores/aiChatStore.ts` | [NEW] | Oturum/mesaj store |
| `app/frontend/src/stores/projectStore.ts` | [MODIFY] | ViewMode'a ai_chat ekle |
| `app/frontend/src/app/page.tsx` | [MODIFY] | Routing ekle |
| `app/frontend/src/components/layout/TopNavbar.tsx` | [MODIFY] | Navbar butonu ekle |

---

[ONAY] Bu plan dosyası kodlama öncesi değerlendirme içindir. Onay sonrası `/yeni_uygulama` veya geliştirme başlatılır.
