#!/usr/bin/env python3
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

REPLACEMENTS = [
    ("pikselis-dashboard.vercel.app", "pikselis-dashboard.vercel.app"),
    ("Pikseliş", "Pikseliş"), # just in case
]

EXTENSIONS = {
    ".py", ".ts", ".tsx", ".js", ".json",
    ".xml", ".gradle", ".md", ".ini", ".txt",
    ".html", ".css", ".sh", ".env", ".example",
}

SKIP_DIRS = {
    "node_modules", ".git", "venv", "__pycache__",
    ".next", "out", "build",
    ".silinecekler_cop_kutusu",
}

def should_skip(path: Path) -> bool:
    for part in path.parts:
        if part in SKIP_DIRS:
            return True
    return False

def replace_in_file(filepath: Path) -> tuple[bool, int]:
    if filepath.suffix not in EXTENSIONS and filepath.name not in {".env", ".env.example"}:
        return False, 0

    try:
        content = filepath.read_text(encoding="utf-8", errors="ignore")
    except Exception:
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

def main():
    print("Alan adı değişimi ve temizlik başlatılıyor...")
    changed_files = []
    for filepath in ROOT.rglob("*"):
        if filepath.is_file() and not should_skip(filepath):
            changed, n = replace_in_file(filepath)
            if changed:
                changed_files.append((filepath.relative_to(ROOT), n))
                
    print(f"Toplam {len(changed_files)} dosya güncellendi:")
    for f, n in sorted(changed_files, key=lambda x: -x[1]):
        print(f"  - {f} ({n} değişiklik)")

if __name__ == "__main__":
    main()
