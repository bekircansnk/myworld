#!/usr/bin/env python3
"""
Jules Bulut Oturumu Toplu Yönetim ve Sorgulama CLI Betiği (2-My-World)

Kullanım:
    python3 scripts/jules_batch_executor.py list              -> Aktif/son bulut oturumlarını listeler
    python3 scripts/jules_batch_executor.py trigger <task>    -> Belirli görevi API ile tetikler
    python3 scripts/jules_batch_executor.py resume-all       -> Bekleyen/onay bekleyen oturumları uyandırır
    python3 scripts/jules_batch_executor.py status-sync     -> Bulut durumlarını JULES_TASKS_REPORT.md ile senkronize eder
    python3 scripts/jules_batch_executor.py batch-merge      -> Açık Jules PR'larını harmanlayıp tek commit olarak birleştirir
"""

import json
import os
import sys
import re
import subprocess
import urllib.request
from datetime import datetime
from pathlib import Path

# Dinamik Kök Dizin Tespiti
BASE_DIR = Path(os.getenv("GITHUB_WORKSPACE", Path(__file__).resolve().parent.parent))
PROMPTS_LIBRARY_PATH = BASE_DIR / "docs" / "jules" / "JULES_PRO_PROMPTS_LIBRARY.md"
REPORT_PATH = BASE_DIR / "docs" / "jules" / "JULES_TASKS_REPORT.md"
REGISTRY_PATH = BASE_DIR / "docs" / "jules" / "JULES_AUTOMATION_REGISTRY.md"


def get_jules_api_key():
    key = os.getenv("JULES_API_KEY")
    if key:
        return key
    vault_path = Path("/Users/bekir/.gemini/maestro/rules/global-connections.md")
    if vault_path.exists():
        try:
            with open(vault_path, "r", encoding="utf-8") as f:
                content = f.read()
                matches = re.findall(r"AQ\.Ab8RN6[a-zA-Z0-9_\-]+", content)
                if len(matches) >= 2:
                    return matches[1]  # PRO Hesabı 2 (My-World)
                elif matches:
                    return matches[0]
        except Exception:
            pass
    return None


API_KEY = get_jules_api_key()
REPO_SOURCE = "sources/github/bekircansnk/myworld"
BASE_URL = "https://jules.googleapis.com/v1alpha"


def fetch_all_sessions():
    """Tüm seansları sayfalama (pagination) ile API'den çeker."""
    if not API_KEY:
        print("Hata: JULES_API_KEY bulunamadı!", file=sys.stderr)
        return []

    sessions = []
    page_token = None
    
    while True:
        url = f"{BASE_URL}/sessions?pageSize=50"
        if page_token:
            url += f"&pageToken={page_token}"
        req = urllib.request.Request(url, headers={"X-Goog-Api-Key": API_KEY})
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                page_sessions = data.get("sessions", [])
                sessions.extend(page_sessions)
                page_token = data.get("nextPageToken")
                if not page_token or not page_sessions:
                    break
        except Exception as e:
            print(f"Hata: API isteği başarısız! {e}", file=sys.stderr)
            break
            
    return sessions


def list_sessions():
    """Jules bulut oturumlarını detaylı listeler."""
    sessions = fetch_all_sessions()
    print(f"\n📊 Jules Bulut Seansları (Toplam: {len(sessions)}):")
    print("=" * 80)
    
    if not sessions:
        print("Henüz aktif seans yok veya tüm seanslar arşivlendi.")
        return

    print(f"{'DURUM':<24} | {'BAŞLIK / SESSİON NAME':<35} | {'OLUŞTURULMA'}")
    print("-" * 80)
    for s in sessions:
        name = s.get("name", "").split("/")[-1]
        title = s.get("title", s.get("prompt", "Başlıksız")[:30].replace("\n", " "))
        state = s.get("state", "Bilinmiyor")
        created = s.get("createTime", "")[:19].replace("T", " ")
        print(f"{state:<24} | {title[:35]:<35} | {created}")
    print("=" * 80)


def resume_waiting_sessions():
    """Onay/geri bildirim bekleyen ('AWAITING_USER_FEEDBACK') seanslara otonom devam komutu gönderir."""
    sessions = fetch_all_sessions()
    waiting_sessions = [s for s in sessions if s.get("state") == "AWAITING_USER_FEEDBACK"]
    
    if not waiting_sessions:
        print("ℹ️ Onay bekleyen (AWAITING_USER_FEEDBACK) Jules oturumu bulunamadı.")
        return

    print(f"\n🔄 {len(waiting_sessions)} adet bekleyen seans uyandırılıyor...")
    for s in waiting_sessions:
        s_name = s.get("name")
        s_id = s_name.split("/")[-1]
        title = s.get("title", "Görev")
        print(f"   ⚡ Uyandırılıyor: [{s_id}] {title}...")
        
        url = f"{BASE_URL}/{s_name}:sendMessage"
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": API_KEY
        }
        payload = {
            "message": "Continue execution. Apply necessary fixes, verify with `cd app/web && pnpm build`, update `docs/jules/JULES_CHANGELOG.md` in Turkish, and finish."
        }
        req = urllib.request.Request(
            url, 
            data=json.dumps(payload).encode("utf-8"), 
            headers=headers, 
            method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                print(f"      ✅ Başarıyla uyandırıldı!")
        except Exception as e:
            print(f"      ❌ Uyandırma başarısız: {e}")


def status_sync():
    """Buluttaki seans durumlarını JULES_TASKS_REPORT.md ile senkronize eder."""
    sessions = fetch_all_sessions()
    if not REPORT_PATH.exists():
        print(f"Hata: {REPORT_PATH} bulunamadı!")
        return

    print("🔄 JULES_TASKS_REPORT.md durumları güncelleniyor...")
    session_state_map = {}
    for s in sessions:
        s_id = s.get("name", "").split("/")[-1]
        session_state_map[s_id] = s.get("state")

    with open(REPORT_PATH, "r", encoding="utf-8") as f:
        lines = f.readlines()

    updated_lines = []
    today_str = datetime.now().strftime("%d.%m.%Y")

    for line in lines:
        if line.startswith("|") and len(line.split("|")) >= 7:
            parts = [p.strip() for p in line.split("|")]
            s_id = parts[6]
            if s_id in session_state_map:
                st = session_state_map[s_id]
                icon = "🔄"
                if st in ["SUCCEEDED", "COMPLETED"]:
                    icon = "✅"
                elif st in ["FAILED", "CANCELLED"]:
                    icon = "❌"
                elif st == "AWAITING_USER_FEEDBACK":
                    icon = "⚠️"
                
                parts[3] = icon
                parts[5] = today_str
                line = "| " + " | ".join(parts[1:-1]) + " |\n"
        updated_lines.append(line)

    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.writelines(updated_lines)

    print("✅ JULES_TASKS_REPORT.md başarıyla güncellendi.")


def batch_merge_prs():
    """Açık olan Jules PR'larını harmanlayıp tek commit olarak yerel koda aktarır ve derlemeyi doğrular."""
    print("🔍 Açık Jules Pull Request'leri taranıyor...")
    try:
        res = subprocess.run(
            ["gh", "pr", "list", "--json", "number,title,headRefName", "--state", "open"],
            capture_output=True,
            text=True,
            check=True
        )
        prs = json.loads(res.stdout)
        jules_prs = [p for p in prs if "jules" in p.get("headRefName", "").lower() or "jules" in p.get("title", "").lower()]
        
        if not jules_prs:
            print("ℹ️ Birleştirilecek açık Jules PR'ı bulunamadı.")
            return

        print(f"\n📦 {len(jules_prs)} adet Jules PR'ı tespit edildi. Harmanlama başlatılıyor...")
        for pr in jules_prs:
            p_num = pr["number"]
            ref = pr["headRefName"]
            print(f"   🔀 Birleştiriliyor: PR #{p_num} ({ref})...")
            m_res = subprocess.run(["gh", "pr", "merge", str(p_num), "--squash", "--delete-branch", "--auto"], capture_output=True, text=True)
            if m_res.returncode == 0:
                print(f"    ✅ PR #{p_num} başarıyla harmanlandı!")
            else:
                print(f"    ⚠️ PR #{p_num} harmanlama uyarısı: {m_res.stderr.strip()}")

        subprocess.run(["git", "pull", "origin", "main"], check=False)
        print("\n🧪 Yerel Build Gate Çalıştırılıyor...")
        web_dir = BASE_DIR / "app" / "web"
        build_res = subprocess.run(["pnpm", "run", "build"], cwd=web_dir, capture_output=True, text=True)
        if build_res.returncode == 0:
            print("✅ Frontend derlemesi %100 BAŞARILI!")
        else:
            print(f"❌ Derleme Hatası: {build_res.stderr[:300]}")
    except Exception as e:
        print(f"❌ Harmanlama sırasında hata: {e}", file=sys.stderr)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
        
    cmd = sys.argv[1].lower()
    if cmd == "list":
        list_sessions()
    elif cmd in ["resume-all", "resume-waiting", "uyandir"]:
        resume_waiting_sessions()
    elif cmd in ["status-sync", "senkronize"]:
        status_sync()
    elif cmd in ["batch-merge", "harmanla", "toplu-birlestir"]:
        batch_merge_prs()
    else:
        print(__doc__)
