#!/usr/bin/env python3
"""
Pikseliş Marka Dönüşüm Scripti
Pikseliş → Pikseliş otomatik metin değiştirme
"""

import os
import shutil
from pathlib import Path

# Proje kök dizini
ROOT = Path(__file__).resolve().parent.parent

# --- Değiştirme Haritası ---
REPLACEMENTS = [
    # Paket ID ve Android
    ("com.pikselai.pikselis",     "com.pikselai.pikselis"),
    ("com.pikselai",             "com.pikselai"),
    # Uygulama adı varyasyonları
    ("Pikseliş — İş & Maaş Yönetim Sistemi", "Pikseliş — İş & Maaş Yönetim Sistemi"),
    ("Pikseliş — İş &amp; Maaş Yönetim Sistemi", "Pikseliş — İş &amp; Maaş Yönetim Sistemi"),
    ("Pikseliş — İş & Maaş Yönetim Sistemi", "Pikseliş — İş & Maaş Yönetim Sistemi"),
    ("Pikseliş — İş Yönetimi",  "Pikseliş — İş Yönetimi"),
    ("Pikseliş API",                "Pikseliş API"),
    ("Pikseliş",                    "Pikseliş"),
    ("pikselis",                    "pikselis"),
    ("pikselis",                     "pikselis"),
    ("pikselis",                    "pikselis"),
    ("Pikselis",                     "Pikselis"),
    # Açıklamalar
    ("Yapay Zeka Destekli İş ve Maaş Yönetim Sistemi",
     "Yapay Zeka Destekli İş ve Maaş Yönetim Sistemi"),
    ("Yapay Zeka Destekli İş ve Maaş Yönetimi",
     "Yapay Zeka Destekli İş ve Maaş Yönetimi"),
    # APK yayıncı / author bilgisi
    ("PikselAI",             "PikselAI"),
    ("pikselai",             "pikselai"),
    ("pikselai",             "pikselai"),
    ("pikselai",                 "pikselai"),
]

# --- İşlenecek Uzantılar ---
EXTENSIONS = {
    ".py", ".ts", ".tsx", ".js", ".json",
    ".xml", ".gradle", ".md", ".ini", ".txt",
    ".html", ".css", ".sh", ".env", ".example",
}

# --- Atlanan Dizinler ---
SKIP_DIRS = {
    "node_modules", ".git", "venv", "__pycache__",
    ".next", "out", "build",                      # Android build artifacts - otomatik üretilir
    ".silinecekler_cop_kutusu",
}

# --- İşleme Fonksiyonu ---
def should_skip(path: Path) -> bool:
    """Atlanan dizin içinde mi kontrol et."""
    for part in path.parts:
        if part in SKIP_DIRS:
            return True
    return False

def replace_in_file(filepath: Path) -> tuple[bool, int]:
    """Dosyada metin değiştir. (değişti mi, kaç değişiklik) döndür."""
    if filepath.suffix not in EXTENSIONS and filepath.name not in {".env", ".env.example"}:
        return False, 0

    try:
        content = filepath.read_text(encoding="utf-8", errors="ignore")
    except Exception as e:
        print(f"  ⚠️  Okunamadı: {filepath} — {e}")
        return False, 0

    original = content
    count = 0
    for old, new in REPLACEMENTS:
        if old in content:
            n = content.count(old)
            content = content.replace(old, new)
            count += n

    if content != original:
        filepath.write_text(content, encoding="utf-8")
        return True, count
    return False, 0

def rename_android_package():
    """Android Java paket klasörünü taşı."""
    old_dir = ROOT / "app/web/android/app/src/main/java/com/pikselai/pikselis"
    new_base = ROOT / "app/web/android/app/src/main/java/com/pikselai"
    new_dir  = new_base / "pikselis"

    if old_dir.exists():
        new_base.mkdir(parents=True, exist_ok=True)
        shutil.copytree(str(old_dir), str(new_dir), dirs_exist_ok=True)
        # Eski dizini cop kutusuna taşı
        trash = ROOT / ".silinecekler_cop_kutusu/android_old_package"
        trash.mkdir(parents=True, exist_ok=True)
        shutil.move(str(old_dir.parent.parent), str(trash / "pikselai"))
        print(f"  ✅ Android paketi taşındı: {old_dir} → {new_dir}")
        return True
    else:
        print(f"  ℹ️  Android paket dizini bulunamadı (atlandı): {old_dir}")
        return False

def main():
    print("=" * 60)
    print("🚀 Pikseliş Marka Dönüşümü Başlıyor")
    print("=" * 60)

    changed_files = []
    total_replacements = 0

    # Tüm dosyaları tara
    for filepath in ROOT.rglob("*"):
        if filepath.is_file() and not should_skip(filepath):
            changed, n = replace_in_file(filepath)
            if changed:
                changed_files.append((filepath.relative_to(ROOT), n))
                total_replacements += n

    # Android paket dizini yeniden adlandırma
    print("\n📁 Android Paket Dizini:")
    rename_android_package()

    # Özet Rapor
    print(f"\n{'=' * 60}")
    print(f"✅ Tamamlandı! {len(changed_files)} dosya güncellendi, {total_replacements} değişiklik yapıldı.")
    print(f"{'=' * 60}")
    for f, n in sorted(changed_files, key=lambda x: -x[1]):
        print(f"  [{n:3d}] {f}")

if __name__ == "__main__":
    main()
