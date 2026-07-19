#!/usr/bin/env python3
import json
import os
import re
import sys
import urllib.request

# Google Jules API Key ve Repo Tanımları
API_KEY = os.getenv("JULES_API_KEY")
REPO_SOURCE = "sources/github/bekircansnk/myworld"
PROMPTS_LIBRARY_PATH = "/Users/bekir/Uygulamalarim/2-My-World/docs/jules/JULES_PRO_PROMPTS_LIBRARY.md"

# GitHub Actions üzerinde çalışırken workspace yolu farklı olur
if os.getenv("GITHUB_WORKSPACE"):
    PROMPTS_LIBRARY_PATH = os.path.join(os.getenv("GITHUB_WORKSPACE"), "docs/jules/JULES_PRO_PROMPTS_LIBRARY.md")

if not API_KEY:
    print("Hata: JULES_API_KEY ortam değişkeni set edilmemiş!", file=sys.stderr)
    sys.exit(1)

def parse_prompts_from_markdown():
    """
    JULES_PRO_PROMPTS_LIBRARY.md dosyasını okur ve içindeki tüm PROMPT'ları dinamik olarak parse eder.
    Dönüş formatı: { "1": "prompt...", "security": "prompt...", ... }
    """
    if not os.path.exists(PROMPTS_LIBRARY_PATH):
        print(f"Hata: Prompt kütüphane dosyası bulunamadı! Yol: {PROMPTS_LIBRARY_PATH}", file=sys.stderr)
        sys.exit(1)
        
    with open(PROMPTS_LIBRARY_PATH, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Her bir ## başlığını veya kategori başlığını ayıkla
    prompts_map = {}
    
    # regex ile '### (\d+)\. ([^\n]+)' veya prompt başlıklarını bul
    # JULES_PRO_PROMPTS_LIBRARY.md formatı:
    # ### 1. Hardcoded Secret Scan
    # Altında ``` veya ```text bloğu var
    sections = re.split(r'###\s+(\d+)\.\s+([^\n]+)', content)
    
    for i in range(1, len(sections), 3):
        prompt_num = sections[i].strip()
        title = sections[i+1].strip()
        block = sections[i+2]
        
        # Kod bloğu içerisindeki metni çıkar (```text ... ``` veya ``` ... ```)
        code_blocks = re.findall(r'```(?:text)?\n(.*?)\n```', block, re.DOTALL)
        if code_blocks:
            prompt_text = code_blocks[0].strip()
            
            # Hem numara olarak haritala: "1", "2"
            prompts_map[prompt_num] = prompt_text
            
            # Başlıktan slug oluştur
            title_clean = title.lower()
            
            # Özel anahtar kelime eşleştirmeleri
            if "secret" in title_clean or "hardcoded" in title_clean:
                prompts_map["security-secret"] = prompt_text
                prompts_map["security"] = prompt_text  # Fallback
            if "vulnerability" in title_clean or "dependency" in title_clean:
                prompts_map["security-vuln"] = prompt_text
            if "auth" in title_clean or "rbac" in title_clean:
                prompts_map["security-auth"] = prompt_text
                
            if "bundle" in title_clean or "size" in title_clean:
                prompts_map["perf-bundle"] = prompt_text
                prompts_map["performance"] = prompt_text  # Fallback
            if "response" in title_clean or "time" in title_clean or "fastapi" in title_clean:
                prompts_map["perf-response"] = prompt_text
            if "query" in title_clean or "database" in title_clean or "optimization" in title_clean:
                prompts_map["perf-query"] = prompt_text
                
            if "dead" in title_clean or "unused" in title_clean:
                prompts_map["code-dead"] = prompt_text
                prompts_map["cleanup"] = prompt_text  # Fallback
            if "strict" in title_clean or "type" in title_clean:
                prompts_map["code-strict"] = prompt_text
            if "component" in title_clean or "oversized" in title_clean:
                prompts_map["code-component"] = prompt_text
            if "eslint" in title_clean or "formatting" in title_clean:
                prompts_map["code-eslint"] = prompt_text
                
            if "health" in title_clean or "endpoint" in title_clean:
                prompts_map["test-health"] = prompt_text
                prompts_map["health"] = prompt_text  # Fallback
            if "build" in title_clean or "verification" in title_clean:
                prompts_map["test-build"] = prompt_text
            if "e2e" in title_clean or "auth flow" in title_clean:
                prompts_map["test-e2e"] = prompt_text
            if "offline" in title_clean or "sync" in title_clean:
                prompts_map["test-offline"] = prompt_text
                
            if "wcag" in title_clean or "accessibility" in title_clean:
                prompts_map["a11y"] = prompt_text
                
            if "documentation" in title_clean or "sync" in title_clean:
                prompts_map["docs-sync"] = prompt_text
            if "readme" in title_clean or "changelog" in title_clean:
                prompts_map["docs-readme"] = prompt_text
                
            if "migration" in title_clean or "alembic" in title_clean:
                prompts_map["db-migration"] = prompt_text
            if "pool" in title_clean or "connection" in title_clean:
                prompts_map["db-pool"] = prompt_text
                
            if "update" in title_clean or "package" in title_clean:
                prompts_map["innovation-update"] = prompt_text
            if "feature" in title_clean or "opportunity" in title_clean:
                prompts_map["innovation-feature"] = prompt_text
                
            if "worker" in title_clean or "sw.ts" in title_clean:
                prompts_map["pwa-sw"] = prompt_text
                prompts_map["pwa"] = prompt_text  # Fallback
            if "capacitor" in title_clean or "plugin" in title_clean:
                prompts_map["pwa-capacitor"] = prompt_text
            if "mobile" in title_clean or "responsiveness" in title_clean:
                prompts_map["pwa-mobile"] = prompt_text

    return prompts_map

def trigger_session(task_name):
    prompts_map = parse_prompts_from_markdown()
    
    search_key = task_name.lower().strip()
    
    if search_key not in prompts_map:
        print(f"Hata: '{task_name}' anahtarı ile eşleşen bir prompt JULES_PRO_PROMPTS_LIBRARY.md içinde bulunamadı!", file=sys.stderr)
        print("Mevcut anahtarlar/numaralar:", ", ".join(sorted(prompts_map.keys())), file=sys.stderr)
        sys.exit(1)
        
    prompt_content = prompts_map[search_key]
    print(f"Dinamik Prompt Başarıyla Yüklendi. Görev/Anahtar: {task_name}")
    print(f"Prompt Önizleme (İlk 150 Karakter): {prompt_content[:150]}...")
    
    url = "https://jules.googleapis.com/v1alpha/sessions"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY
    }
    
    payload = {
        "prompt": prompt_content,
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
        headers=headers, 
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            res_data = json.loads(res_body)
            session_name = res_data.get("name", "Bilinmiyor")
            print(f"Başarılı: Jules Bulut Oturumu Oluşturuldu! ID: {session_name}")
            return True
    except Exception as e:
        print(f"Hata: API isteği başarısız oldu! Detay: {e}", file=sys.stderr)
        if hasattr(e, "read"):
            print(f"API Yanıt Hatası: {e.read().decode('utf-8')}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Kullanım: python3 trigger_jules.py <task_name_or_number>", file=sys.stderr)
        sys.exit(1)
        
    trigger_session(sys.argv[1])
