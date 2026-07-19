# 🤖 JULES PRO GUIDE — Planla (myworld)

> Jules otonom ajan kurulum, kullanım ve doğrulama rehberi.
> Son Güncelleme: 19.07.2026

---

## 📋 İçindekiler

1. [Jules Nedir?](#jules-nedir)
2. [CLI Kurulumu](#cli-kurulumu)
3. [Temel Komutlar](#temel-komutlar)
4. [Jules Değişikliklerini Kontrol Etme & Doğrulama](#jules-değişikliklerini-kontrol-etme--doğrulama)
5. [Zamanlayıcı Ekleme](#zamanlayıcı-ekleme)
6. [Görev Yönetimi](#görev-yönetimi)
7. [Prompt Yazım Kuralları](#prompt-yazım-kuralları)
8. [Limitler ve Kısıtlamalar](#limitler-ve-kısıtlamalar)

---

## Jules Nedir?

Jules, Google'ın AI destekli otonom kodlama ajanıdır. GitHub reposuna bağlanarak:
- Otomatik kod review ve düzeltme
- Zamanlı bakım görevleri
- Test oluşturma ve çalıştırma
- Güvenlik taraması
- Belgeleme güncellemesi

işlemlerini **insandan bağımsız** olarak gerçekleştirir.

---

## CLI Kurulumu

```bash
# Jules CLI zaten kurulu: /opt/homebrew/bin/jules
jules --version

# Kimlik doğrulama kontrolü
jules login
```

---

## Temel Komutlar

### Görev Oluşturma
```bash
jules remote new --repo bekircansnk/myworld --session "PROMPT_TEXT"
```

### Görev Listeleme
```bash
jules remote list --session
```

### Tamamlanan Görevi Çekme
```bash
jules remote pull --session <SESSION_ID> --apply
```

---

## Jules Değişikliklerini Kontrol Etme & Doğrulama

Jules bir görevi tamamlayıp yerel koda uyguladıktan sonra yapılması gereken **kontrol ve test adımları**:

### 🛡️ 1. Kod İncelemesi (Review)
Değişiklikleri çekip uyguladıktan sonra, git aracılığıyla hangi dosyaların değiştiğini gözden geçirin:
```bash
git diff
# ya da sadece değişen dosya adlarını görmek için
git diff --stat
```

### 🏥 2. Son Tamamlanan Veritabanı ve Pool Optimizasyonu Doğrulaması
Jules en son veritabanı havuz sağlığını (Seans ID: `11651531873073567975`) başarıyla optimize etti:
*   [app/backend/app/database.py](file:///Users/bekir/Uygulamalarim/2-My-World/app/backend/app/database.py) dosyasında: `pool_size=10` ve `max_overflow=20` ayarlarının geldiğini doğrulayın. SSL bağlantı argümanlarının `development` dışı ortamlar için set edildiğinden emin olun.
*   [app/backend/app/main.py](file:///Users/bekir/Uygulamalarim/2-My-World/app/backend/app/main.py) dosyasında: `/api/health` uç noktasının veritabanında `SELECT 1` sorgusunu çalıştıracak şekilde dependency (`Depends(get_db)`) aldığını ve hata durumunda 503 döndürdüğünü doğrulayın.

### 🧪 3. Derleme ve Testlerin Çalıştırılması
Jules'ün değişikliklerinin derlemeyi (build) bozmadığından emin olun:
```bash
# Frontend build testi
cd app/web && pnpm build

# Backend import/sözdizimi testi
cd ../backend && python -m py_compile app/main.py
```

---

## Zamanlayıcı Ekleme

> ⚠️ **Zamanlayıcılar sadece web arayüzünden eklenebilir!**

1. [jules.google.com](https://jules.google.com) → Repo seç (`bekircansnk/myworld`)
2. **"Scheduled"** sekmesi → **"+ Add Schedule"**
3. Prompt yapıştır (bkz: `JULES_PRO_PROMPTS_LIBRARY.md`)
4. Cron expression ayarla
5. Kaydet

---

## Görev Yönetimi

### Maestro ile Jules Yönetimi

Antigravity/Maestro üzerinden Jules'ü yönetmek için:

```
/jules-yonet durum      → Tüm görevlerin durumunu sorgula
/jules-yonet birleştir  → Tamamlanan görevleri yerel koda çek
/jules-yonet promptlar  → Prompt kütüphanesini görüntüle
/jules-yonet rapor      → Son 7 günlük rapor
/jules-yonet yeni-görev <açıklama> → Yeni görev oluştur
```

---

## Prompt Yazım Kuralları

Her Jules prompt'u şu kurallara uymalıdır:

1. **İngilizce yazılır** (Jules İngilizce çalışır)
2. **Adım adım talimatlar** içerir
3. **Doğrulama komutu** içerir: `Run cd app/web && pnpm build after changes.`
4. **Changelog güncellemesi** içerir: `Update docs/jules/JULES_CHANGELOG.md in Turkish.`
5. **Kapsam sınırı** belirtir (hangi dosyalar etkilenecek)
6. **Yapma listesi** içerir (neyi DEĞİŞTİRMEMELİ)

---

## Limitler ve Kısıtlamalar

| Kısıt | Değer |
|-------|-------|
| Günlük seans limiti (PRO) | 100 |
| Mevcut günlük kullanım | ~4-5 seans |
| Zamanlayıcı ekleme | Sadece web arayüzünden |
| CLI'dan görev oluşturma | ✅ Destekleniyor |
| Birden fazla repo | ✅ Destekleniyor |
| Eşzamanlı görevler | Sıralı çalışır |

---

## 📁 İlgili Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `docs/jules/JULES_PRO_PROMPTS_LIBRARY.md` | 24 prompt, 9 kategori |
| `docs/jules/JULES_CHANGELOG.md` | Değişiklik günlüğü |
| `docs/jules/JULES_TASKS_REPORT.md` | Görev durum raporu |
| `docs/jules/JULES_AUTOMATION_REGISTRY.md` | Otomasyon kayıt defteri |
