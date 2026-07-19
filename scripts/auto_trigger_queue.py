import urllib.request
import json
import re
import os
import subprocess
import sys

key = os.getenv("JULES_API_KEY")
if not key:
    print("Hata: JULES_API_KEY ortam değişkeni tanımlı değil!")
    sys.exit(1)
library_path = "/Users/bekir/Uygulamalarim/2-My-World/docs/jules/JULES_PRO_PROMPTS_LIBRARY.md"
report_path = "/Users/bekir/Uygulamalarim/2-My-World/docs/jules/JULES_TASKS_REPORT.md"
state_file = "/Users/bekir/Uygulamalarim/2-My-World/docs/jules/queue_state.json"

# Kalan hedeflenen görevler
all_targets = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]

def get_active_session_count():
    url = "https://jules.googleapis.com/v1alpha/sessions"
    req = urllib.request.Request(
        url,
        headers={"X-Goog-Api-Key": key}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode("utf-8"))
            sessions = data.get("sessions", [])
            active_count = 0
            for s in sessions:
                src = s.get('sourceContext', {}).get('source', '')
                if 'myworld' in src.lower() or '2-my-world' in src.lower():
                    state = s.get("state")
                    if state in ["IN_PROGRESS", "AWAITING_USER_FEEDBACK", "PLANNING"]:
                        active_count += 1
            return active_count
    except Exception as e:
        print(f"Aktif seans sayısı alınırken hata: {e}")
        return 10  # Hata durumunda garantiye alıp tetikleme yapma

def load_queue_state():
    if os.path.exists(state_file):
        try:
            with open(state_file, "r") as f:
                return json.load(f)
        except:
            pass
    return {"triggered": [1, 2, 3, 4, 5, 6, 7, 8, 11, 12]}  # İlk tetiklediklerimiz varsayılan olarak ekli

def save_queue_state(state):
    with open(state_file, "w") as f:
        json.dump(state, f, indent=2)

def parse_prompts():
    with open(library_path, "r", encoding="utf-8") as f:
        content = f.read()
    prompts_dict = {}
    pattern = r"### (\d+)\. ([^\n]+)\n\*\*Zamanlama:\*\* [^\n]+\n```\n(.*?)\n```"
    matches = re.findall(pattern, content, re.DOTALL)
    for num_str, title, prompt_body in matches:
        num = int(num_str)
        prompts_dict[num] = {
            "title": title.strip(),
            "prompt": prompt_body.strip()
        }
    return prompts_dict

def trigger_session(num, p_data):
    url = "https://jules.googleapis.com/v1alpha/sessions"
    title = p_data["title"]
    prompt = p_data["prompt"]
    full_prompt = f"## Task: {title}\n\n{prompt}"
    
    payload = {
        "title": title,
        "prompt": full_prompt,
        "sourceContext": {
            "source": "sources/github/bekircansnk/myworld",
            "githubRepoContext": {
                "startingBranch": "main"
            },
            "environmentVariablesEnabled": True
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
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            session_id = res_data.get("name", "").split("/")[-1]
            return session_id
    except Exception as e:
        print(f"Görev {num} tetiklenirken hata: {e}")
        return None

def update_report(num, title, session_id):
    if not os.path.exists(report_path):
        return
    with open(report_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Aktif görevler tablosuna yeni satırı ekleyelim
    new_row = f"| {num} | {title} | 🔄 | 19.07.2026 | 19.07.2026 | {session_id} |"
    
    # regex ile Aktif Görevler tablosunu bulup altına ekleyelim
    pattern = r"(\| # \| Görev \| Durum \| Başlangıç \| Son Güncelleme \| Seans ID \|\n\|---\|---\|---\|---\|---\|---\|\n)"
    replacement = rf"\g<1>{new_row}\n"
    
    updated_content = re.sub(pattern, replacement, content)
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(updated_content)

def push_changes():
    subprocess.run(["git", "add", "."], cwd="/Users/bekir/Uygulamalarim/2-My-World")
    subprocess.run(["git", "commit", "-m", "docs: update report with newly auto-triggered session"], cwd="/Users/bekir/Uygulamalarim/2-My-World")
    subprocess.run(["git", "push", "origin", "main"], cwd="/Users/bekir/Uygulamalarim/2-My-World")

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
    
    # Tetiklenmemiş hedefleri bul
    remaining_targets = [t for t in all_targets if t not in triggered_list]
    print(f"Tetiklenmeyi bekleyen görevler: {remaining_targets}")
    
    if not remaining_targets:
        print("Tebrikler! Tüm görevler tetiklendi.")
        # Eyalet dosyasını temizleyelim
        if os.path.exists(state_file):
            os.remove(state_file)
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
        print("✓ Rapor güncellendi ve GitHub'a push edildi.")

if __name__ == "__main__":
    main()
