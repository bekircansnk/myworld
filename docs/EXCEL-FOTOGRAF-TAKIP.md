# Fotoğraf Takip - Excel Entegrasyon Mantığı

Bu belge, **Fotoğraf Takip Paneli** içerisinde bulunan "İçe / Dışa Aktar" Excel süreçlerinin nasıl çalıştığını ve hangi sütunların sistemde nereye denk geldiğini açıklamaktadır.

## 📥 İçe Aktarma (Import) Mantığı

Sistem, yüklediğiniz Excel dosyasını satır satır okur. Her satırın sütun başlıklarına göre eşleştirme yapar. Sütun isimleri **BİREBİR AYNISI** olmak zorundadır.

| Excel Sütun Başlığı | Sistemdeki Karşılığı | Ne İşe Yarar? |
| :--- | :--- | :--- |
| **SEZON KODU** | `PhotoModel.sezon_kodu` | Modelin ait olduğu sezonu (Örn: SS26) belirtir. Opsiyoneldir. |
| **MADDE AÇIKLAMASI** | `PhotoModel.model_name` | Modelin adıdır. Eğer sistemde o ay içinde bu isimde bir model yoksa, **1. Hafta** olacak şekilde yeni bir model oluşturur. Aynı isimde model varsa, yeni renkleri o modele ekler. |
| **RENK** | `PhotoModelColor.color_name` | İlgili modele ait renk varyantıdır. Bir modelin birden çok rengi olabilir, bu nedenle Excel'deki alt alta olan aynı model ismindeki satırlar, o modele "yeni bir renk" olarak eklenir. |
| **Sosyal Medya** | `PhotoModelColor.ig_required` | Eğer bu hücre boş değilse (herhangi bir şey, örn "x" yazıyorsa), bu renk için Instagram fotoğrafı çekilmesi **ZORUNLU** olarak işaretlenir. |
| **WEB SİTESİ 16:9**| `PhotoModelColor.banner_required`| Eğer bu hücre boş değilse, bu renk için 16:9 Banner fotoğrafı çekilmesi **ZORUNLU** olarak işaretlenir. |

*Sistem `Unnamed: 3`, `TESLİM EDİLEN`, `REVİZE` ve `TESLİM EDİLME TARİHİ` sütunlarını **içe aktarırken (yeni model/renk oluştururken) görmezden gelir**. Bu değerler sistem içerisinde (Haftalık İşler/Aylık Takvim bölümünde) manuel yönetilir ve sadece **Dışa Aktarma (Export)** işleminde doldurulur.*

## 📤 Dışa Aktarma (Export) Mantığı

Sistemdeki verileri dışarı aktardığınızda, aynı şablon formatı korunarak sizin için otomatik doldurulur:

1. **SEZON KODU** ve **MADDE AÇIKLAMASI**: Sadece modelin ilk rengi yazılırken doldurulur (Excel'deki görünümü sadeleştirmek için alt satırlarda boş bırakılır).
2. **RENK**: Modelin tüm renkleri alt alta sıralanır.
3. **Sosyal Medya / WEB SİTESİ 16:9**: Sistemde "İstendi" olarak işaretlenmişse bu hücrelere otomatik "X" atılır.
4. **TESLİM EDİLEN**: Model eğer "Tamamlandı" olarak işaretlenmişse, otomatik `TAMAMLANDI` yazar.
5. **REVİZE**: "Revize Merkezi"ne girdiğiniz tüm revize açıklamaları aralarına virgül konularak listelenir.
6. **TESLİM EDİLME TARİHİ**: Sistemin tamamlandı olarak işaretlediği tarih YYYY-MM-DD formatında yazılır.

## Olası "Not Found" Hatasının Sebebi

Eğer Vercel üzerinden (canlı site) Excel yüklemeye çalışıp `Not Found` (404) hatası aldıysanız, bunun sebebi **Backend** sunucunuza (FastAPI/Render vb.) yeni yazdığımız uçların henüz deploy edilmemiş (yüklenmemiş) olmasıdır. Excel import uçları `/api/venus/photo-tracking/import-excel` adresindedir. Kodunuz güncellendiği an bu hata ortadan kalkacaktır.
