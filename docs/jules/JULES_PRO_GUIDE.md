# 🤖 JULES PRO GUIDE — Planla (2-My-World)

> Jules otonom ajan kurulum ve kullanım rehberi.
> Son Güncelleme: 19.07.2026

---

## 📋 İçindekiler

1. [Jules Nedir?](#jules-nedir)
2. [CLI Kurulumu](#cli-kurulumu)
3. [Temel Komutlar](#temel-komutlar)
4. [Zamanlayıcı Ekleme](#zamanlayıcı-ekleme)
5. [Görev Yönetimi](#görev-yönetimi)
6. [Prompt Yazım Kuralları](#prompt-yazım-kuralları)
7. [Limitler ve Kısıtlamalar](#limitler-ve-kısıtlamalar)

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
jules auth status
```

---

## Temel Komutlar

### Görev Oluşturma
```bash
jules remote create --repo bekircansnk/2-My-World --prompt "PROMPT_TEXT"
```

### Görev Listeleme
```bash
jules remote list --session
```

### Görev Detayı
```bash
jules remote show --session <SESSION_ID>
```

### Tamamlanan Görevi Çekme
```bash
jules remote pull --session <SESSION_ID> --apply
```

---

## Zamanlayıcı Ekleme

> ⚠️ **Zamanlayıcılar sadece web arayüzünden eklenebilir!**

1. [jules.google.com](https://jules.google.com) → Repo seç
2. **"Scheduled"** sekmesi → **"+ Add Schedule"**
3. Prompt yapıştır (bkz: `JULES_PRO_PROMPTS_LIBRARY.md`)
4. Cron expression ayarla
5. Kaydet

### Cron Expression Örnekleri

| İfade | Anlamı |
|-------|--------|
| `0 6 * * *` | Her gün 06:00 UTC |
| `0 2 * * 1` | Her Pazartesi 02:00 UTC |
| `0 3 1 * *` | Her ayın 1'i 03:00 UTC |
| `0 3 */14 * 3` | 2 haftada bir Çarşamba 03:00 UTC |

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

### Prompt Şablonu

```
[GÖREV AÇIKLAMASI]

Steps:
1. [Adım 1]
2. [Adım 2]
3. [Adım 3]

Files to check:
- path/to/file1
- path/to/file2

Do NOT:
- [Kısıtlama 1]
- [Kısıtlama 2]

Run `cd app/web && pnpm build` after any changes.
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

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
