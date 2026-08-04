#!/usr/bin/env python3
import os
import sys
import json
import re
import urllib.request
import subprocess
from datetime import datetime
from pathlib import Path

# Dinamik Kök Dizin Tespiti
BASE_DIR = Path(os.getenv("GITHUB_WORKSPACE", Path(__file__).resolve().parent.parent))
LIBRARY_PATH = BASE_DIR / "docs" / "jules" / "JULES_PRO_PROMPTS_LIBRARY.md"
REPORT_PATH = BASE_DIR / "docs" / "jules" / "JULES_TASKS_REPORT.md"
STATE_FILE = BASE_DIR / "docs" / "jules" / "queue_state.json"


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


key = get_jules_api_key()
REPO_SOURCE = "sources/github/bekircansnk/myworld"
ALL_TARGETS = list(range(1, 25))


def get_active_session_count():
    if not key:
        print("Hata: JULES_API_KEY anahtarı bulunamadı!")
        return 10

    sessions = []
    page_token = None
    
    while True:
        url = "https://jules.googleapis.com/v1alpha/sessions?pageSize=50"
        if page_token:
            url += f"&pageToken={page_token}"
        req = urllib.request.Request(url, headers={"X-Goog-Api-Key": key})
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                data = json.loads(response.read().decode("utf-8"))
                page_sessions = data.get("sessions", [])
                sessions.extend(page_sessions)
                page_token = data.get("nextPageToken")
                if not page_token or not page_sessions:
                    break
        except Exception as e:
            print(f"Aktif seans sayısı alınırken hata: {e}")
            return 10

    active_count = 0
    for s in sessions:
        src = s.get('sourceContext', {}).get('source', '')
        if 'myworld' in src.lower() or '2-my-world' in src.lower():
            state = s.get("state")
            if state in ["IN_PROGRESS", "AWAITING_USER_FEEDBACK", "PLANNING"]:
                active_count += 1
                
    return active_count


def load_queue_state():
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"State file okuma uyarısı: {e}")
    return {"triggered": []}


def save_queue_state(state):
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)


def parse_prompts():
    if not LIBRARY_PATH.exists():
        print(f"Hata: {LIBRARY_PATH} bulunamadı!")
        return {}
        
    with open(LIBRARY_PATH, "r", encoding="utf-8") as f:
        content = f.read()
        
    prompts_dict = {}
    sections = re.split(r'###\s+(\d+)\.\s+([^\n]+)', content)
    
    for i in range(1, len(sections), 3):
        num = int(sections[i].strip())
        title = sections[i+1].strip()
        block = sections[i+2]
        
        code_blocks = re.findall(r'```[a-zA-Z]*\r?\n(.*?)\r?\n```', block, re.DOTALL)
        if code_blocks:
            prompts_dict[num] = {
                "title": title,
                "prompt": code_blocks[0].strip()
            }
            
    return prompts_dict


def trigger_session(num, p_data):
    url = "https://jules.googleapis.com/v1alpha/sessions"
    title = p_data["title"]
    prompt = p_data["prompt"]
    
    payload = {
        "title": title,
        "prompt": prompt,
        "sourceContext": {
            "source": REPO_SOURCE,
            "githubRepoContext": {
                "startingBranch": "main"
            }
        }
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "X-Goog-Api-Key": key
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            session_id = res_data.get("name", "").split("/")[-1]
            return session_id
    except Exception as e:
        print(f"Görev {num} ({title}) tetiklenirken hata: {e}")
        return None


def update_report(num, title, session_id):
    if not REPORT_PATH.exists():
        return
    with open(REPORT_PATH, "r", encoding="utf-8") as f:
        content = f.read()
        
    today_str = datetime.now().strftime("%d.%m.%Y")
    new_row = f"| {num} | {title} | 🔄 | {today_str} | {today_str} | {session_id} |"
    
    pattern = r"(\| # \| Görev \| Durum \| Başlangıç \| Son Güncelleme \| Seans ID \|\n\|---\|---\|---\|---\|---\|---\|\n)"
    replacement = rf"\g<1>{new_row}\n"
    
    updated_content = re.sub(pattern, replacement, content)
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write(updated_content)


def push_changes():
    if not os.getenv("GITHUB_WORKSPACE"):
        subprocess.run(["git", "add", "."], cwd=BASE_DIR, check=False)
        subprocess.run(["git", "commit", "-m", "docs: update report with newly auto-triggered session"], cwd=BASE_DIR, check=False)
        subprocess.run(["git", "push", "origin", "main"], cwd=BASE_DIR, check=False)


def main():
    active_count = get_active_session_count()
    print(f"Mevcut aktif seans sayısı: {active_count}")
    
    if active_count >= 10:
        print("Maksimum eşzamanlı seans limitine ulaşıldı (10/10). Bekleniyor...")
        return
        
    slots_available = 10 - active_count
    print(f"Kalan boş slot sayısı: {slots_available}")
    
    state = load_queue_state()
    triggered_list = state.get("triggered", [])
    
    remaining_targets = [t for t in ALL_TARGETS if t not in triggered_list]
    print(f"Tetiklenmeyi bekleyen görevler: {remaining_targets}")
    
    if not remaining_targets:
        print("Tebrikler! Tüm 24 otomasyon görevi sırayla tetiklendi.")
        return
        
    prompts_dict = parse_prompts()
    
    triggered_any = False
    for num in remaining_targets[:slots_available]:
        if num not in prompts_dict:
            continue
        p_data = prompts_dict[num]
        print(f"Görev {num} ({p_data['title']}) tetikleniyor...")
        session_id = trigger_session(num, p_data)
        if session_id:
            print(f"✓ Başarıyla tetiklendi! Seans ID: {session_id}")
            triggered_list.append(num)
            update_report(num, p_data["title"], session_id)
            triggered_any = True
        else:
            print(f"❌ Görev {num} tetiklenemedi.")
            
    if triggered_any:
        state["triggered"] = triggered_list
        save_queue_state(state)
        push_changes()
        print("✓ Rapor güncellendi ve kaydedildi.")


if __name__ == "__main__":
    main()
