#!/usr/bin/env python3
"""
Jules PRO Seans Arşivleme Betiği (archive_completed_jules.py)

Tüm tamamlanmış veya pasif kalmış Jules bulut seanslarını 'POST /sessions/{id}:archive' ile topluca arşivler.
"""

import json
import os
import sys
import re
import urllib.request
from pathlib import Path

# Dinamik Kök Dizin Tespiti
BASE_DIR = Path(os.getenv("GITHUB_WORKSPACE", Path(__file__).resolve().parent.parent))


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
BASE_URL = "https://jules.googleapis.com/v1alpha"


def archive_session(session_name):
    clean_name = session_name if session_name.startswith("sessions/") else f"sessions/{session_name}"
    url = f"{BASE_URL}/{clean_name}:archive"
    headers = {
        "X-Goog-Api-Key": API_KEY,
        "Content-Type": "application/json"
    }
    body = json.dumps({}).encode('utf-8')
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            json.loads(resp.read().decode('utf-8'))
            print(f"✅ Başarıyla arşivlendi: {clean_name}")
            return True
    except Exception as e:
        print(f"❌ Arşivleme başarısız ({clean_name}): {e}")
        return False


def main():
    if not API_KEY:
        print("Hata: JULES_API_KEY anahtarı bulunamadı!", file=sys.stderr)
        sys.exit(1)

    print("🔍 Jules Bulut Seansları Taranıyor...")
    url = f"{BASE_URL}/sessions?pageSize=50"
    headers = {"X-Goog-Api-Key": API_KEY}
    req = urllib.request.Request(url, headers=headers)
    
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            sessions = data.get("sessions", [])
            print(f"📦 Toplam {len(sessions)} adet seans bulundu.")
            
            archived_count = 0
            for s in sessions:
                s_name = s.get("name", "")
                title = (s.get("prompt") or s.get("title") or "")[:50].replace("\n", " ")
                is_archived = s.get("archived", False)
                state = s.get("state", s.get("status", ""))
                
                if not is_archived:
                    print(f"Arşivleniyor -> ID: {s_name} | State: {state} | Başlık: {title}")
                    if archive_session(s_name):
                        archived_count += 1
                        
            print(f"🎉 Toplam {archived_count} adet pasif/eski seans arşivlendi!")
    except Exception as e:
        print(f"❌ Hata: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
