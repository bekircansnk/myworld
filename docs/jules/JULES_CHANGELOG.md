# 📝 JULES CHANGELOG — Planla (2-My-World)

> Jules otonom ajanının yaptığı tüm değişikliklerin Türkçe günlüğü.
> Format: DD.MM.YYYY

---

## 19.07.2026 — Başlangıç

### 🏗️ Jules Otonom Altyapı Kurulumu
- Jules prompt kütüphanesi oluşturuldu (24 prompt, 9 kategori)
- Jules docs altyapısı kuruldu (Changelog, Tasks Report, Guide, Registry)
- GitHub Actions CI/CD pipeline eklendi
- Güvenlik düzeltmesi: Hardcoded MSSQL şifresi `.env`'ye taşındı

### 🔍 Backend API Sağlık Kontrolü
- Canlı backend API (https://myworld-twqx.onrender.com) üzerindeki kritik uç noktalar (Health, Info, Auth, Tasks, Notes, Calendar) test edildi.
- Tüm uç noktaların beklenen HTTP durum kodlarını (200, 401, 422) döndürdüğü doğrulandı, 500 veya zaman aşımı hatasına rastlanmadı.

## 19.07.2026 — Veritabanı ve Pool Yapılandırma İyileştirmeleri

### 🔧 Veritabanı Pool & Bağlantı Ayarları
- `app/backend/app/database.py` içerisinde Neon Postgresql için veritabanı bağlantı havuzu (pool) optimize edildi: `pool_size` 10, `max_overflow` 20 yapıldı.
- Bağlantı kopmalarını engellemek için `pool_timeout=30` eklendi.
- Neon bağlantıları için gerekli olan SSL yapılandırması `connect_args={"ssl": True}` olarak, sadece "development" dışındaki ortamlarda devreye girecek şekilde eklendi.
- Bağlantı tekrar deneme (retry) mekanizması için SQLAlchemy'nin yerleşik `pool_pre_ping=True` ve havuz zaman aşımı ayarları güvence altına alındı.

### 🏥 Sağlık Kontrolü Uç Noktası (Health Check)
- `app/backend/app/main.py` içerisindeki mevcut `/api/health` uç noktası güncellendi.
- Veritabanı bağlantısını doğrulamak için uç noktaya `SELECT 1` raw SQL sorgusu eklendi ve hata durumunda 503 döndürmesi sağlandı.

### 📝 MSSQL (Venus) Hakkında Not
- Venus (MSSQL) bağlantısı ile ilgili kod incelemesi yapıldı. Venus modelleri ve servislerinin şu anda ana PostgreSQL veritabanını (`app/backend/app/database.py`) kullandığı ve projede aktif/ayrı bir MSSQL bağlantısı bulunmadığı tespit edildi.

---

<!-- Yeni girişler bu satırın üzerine eklenecek -->
