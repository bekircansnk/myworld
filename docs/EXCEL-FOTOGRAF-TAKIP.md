# Fotoğraf Takip - Excel Entegrasyon Mantığı

Bu belge, **Fotoğraf Takip Paneli** içerisinde bulunan "İçe / Dışa Aktar" Excel süreçlerinin nasıl çalıştığını ve hangi sütunların sistemde nereye denk geldiğini açıklamaktadır.

## 🔄 Çift Yönlü Senkronizasyon (Bidirectional Sync)

Sistem, Excel dosyasını hem **dışa aktarma (export)** hem de **içe aktarma (import)** için **aynı sütun formatını** kullanır. Bu sayede dışarı aktardığınız Excel dosyasını düzenleyip tekrar içeri aktarabilirsiniz. Excel bir nevi **yedekleme ve toplu düzenleme aracı** olarak kullanılabilir.

## 📊 Sütun Eşleştirme Tablosu

| Excel Sütun Başlığı | Sistemdeki Karşılığı | Import | Export | Açıklama |
| :--- | :--- | :---: | :---: | :--- |
| **SEZON KOD** | `PhotoModel.sezon_kodu` | ✅ | ✅ | Modelin ait olduğu sezon (Örn: SS26). Opsiyonel. |
| **MADDE AÇIKLAMASI** | `PhotoModel.model_name` | ✅ | ✅ | Model adı. Tüm renk satırlarında tekrarlanır. |
| **RENK** | `PhotoModelColor.color_name` | ✅ | ✅ | Modele ait renk varyantı. |
| **Sosyal Medya** | `PhotoModelColor.ig_required` + `ig_photo_count` | ✅ | ✅ | Boş = gerekli değil, "X" = gerekli ama adet yok, Sayı = üretilen fotoğraf adedi. |
| **WEB SİTESİ 1** | `PhotoModelColor.banner_required` + `banner_photo_count` | ✅ | ✅ | Boş = gerekli değil, "X" = gerekli ama adet yok, Sayı = üretilen fotoğraf adedi. |
| **TESLİM EDİLEN** | Hesaplanır: `ig_photo_count + banner_photo_count` | ✅ | ✅ | Model "Bitti" ise her renk için toplam üretilen fotoğraf sayısı. Import sırasında model completed olarak işaretlenir. |
| **REVİZE** | `PhotoRevision.description` | ✅ | ✅ | Revize açıklamaları virgülle ayrılmış şekilde. |
| **TESLİM EDİLME TARİHİ** | `PhotoModel.delivery_date` | ✅ | ✅ | Model "Bitti" olarak işaretlendiğinde atanan tarih. Format: GG.AA.YYYY |

## 📥 İçe Aktarma (Import) Mantığı

1. Sistem Excel dosyasını satır satır okur.
2. `MADDE AÇIKLAMASI` sütunundaki model adına göre, o ay/yıl içinde aynı isimde model **varsa günceller**, **yoksa yeni oluşturur**.
3. `RENK` sütunundaki renk adına göre, modelin altında aynı isimde renk **varsa günceller (adetler dahil)**, **yoksa yeni ekler**.
4. `Sosyal Medya` ve `WEB SİTESİ 1` alanları akıllı ayrıştırma ile okunur:
   - Boş / "0" / "yok" → Gerekli değil, adet 0
   - "X" / "v" / "var" → Gerekli, adet 0 (henüz çekilmemiş)
   - Sayı (örn: 4) → Gerekli, adet 4 (çekilmiş)
5. `TESLİM EDİLEN` dolu ise model otomatik "completed" olarak işaretlenir.
6. `TESLİM EDİLME TARİHİ` GG.AA.YYYY formatında okunur ve `delivery_date` olarak kaydedilir.
7. Eski format sütun başlıkları da desteklenir (SEZON KODU, Sosyal Medya , WEB SİTESİ 16:9).

## 📤 Dışa Aktarma (Export) Mantığı

1. **SEZON KOD** ve **MADDE AÇIKLAMASI**: Tüm renk satırlarında dolu olarak yazılır (filtreleme kolaylığı için).
2. **RENK**: Modelin tüm renkleri alt alta sıralanır.
3. **Sosyal Medya / WEB SİTESİ 1**: 
   - Adet > 0 ise sayı yazılır (örn: 4)
   - Adet 0 ama gerekli ise "X" yazılır
   - Gerekli değilse boş bırakılır
4. **TESLİM EDİLEN**: Model "Bitti" ise, o renk için `Sosyal Medya + WEB SİTESİ 1` adetlerinin toplamı yazılır.
5. **REVİZE**: Revize Merkezi'ne girilen tüm açıklamalar virgülle ayrılarak listelenir.
6. **TESLİM EDİLME TARİHİ**: Model "Bitti" olarak işaretlendiğindeki tarih GG.AA.YYYY formatında yazılır.

## ⚠️ Önemli Notlar

- Excel dosyası **.xlsx** formatında olmalıdır.
- Sütun başlıkları **ilk satırda** ve **tam eşleşme** ile okunur.
- Bir modeli panel üzerinden "Bitti" olarak işaretlediğinizde, `delivery_date` otomatik atanır.
- Export sırasında modeller **hafta numarasına** göre sıralanır.
- Import/Export aynı formatı kullandığı için, dışarı aktardığınız dosyayı düzenleyip tekrar içeri aktarabilirsiniz.
