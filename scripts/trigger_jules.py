#!/usr/bin/env python3
import json
import os
import re
import sys
import urllib.request
from pathlib import Path

# Dinamik Kök Dizin Tespiti
BASE_DIR = Path(os.getenv("GITHUB_WORKSPACE", Path(__file__).resolve().parent.parent))
PROMPTS_LIBRARY_PATH = BASE_DIR / "docs" / "jules" / "JULES_PRO_PROMPTS_LIBRARY.md"


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


def parse_prompts_from_markdown():
    if not PROMPTS_LIBRARY_PATH.exists():
        print(f"Hata: Prompt kütüphane dosyası bulunamadı! Yol: {PROMPTS_LIBRARY_PATH}", file=sys.stderr)
        sys.exit(1)
        
    with open(PROMPTS_LIBRARY_PATH, "r", encoding="utf-8") as f:
        content = f.read()
        
    prompts_map = {}

    # 1. Parse Master Bundles (## 🛡️ BUNDLE 1: Master Security & Secret Audit (`master-security`))
    bundle_splits = re.split(r'##\s+.*?BUNDLE\s+(\d+):\s+([^\n\(`]+)\s*\(`([^`]+)`\)', content)
    for i in range(1, len(bundle_splits), 4):
        b_num = bundle_splits[i].strip()
        b_title = bundle_splits[i+1].strip()
        b_slug = bundle_splits[i+2].strip().lower()
        b_block = bundle_splits[i+3]

        code_blocks = re.findall(r'```text\r?\n(.*?)\r?\n```', b_block, re.DOTALL)
        if code_blocks:
            item = {
                "title": f"Bundle {b_num}: {b_title}",
                "prompt": code_blocks[0].strip()
            }
            prompts_map[b_slug] = item
            clean_alias = b_slug.replace("master-", "")
            prompts_map[clean_alias] = item

    # 2. Parse Micro-Prompts & Suggestions (### 1. Title ...)
    sections = re.split(r'###\s+(\d+)\.\s+([^\n]+)', content)
    for i in range(1, len(sections), 3):
        prompt_num = sections[i].strip()
        raw_title = sections[i+1].strip()
        block = sections[i+2]
        
        # Check if title has backticked alias: ### 25. Jules Suggestion: ... (`suggestion-sqli-xss`)
        alias_match = re.search(r'`([^`]+)`', raw_title)
        alias = alias_match.group(1).lower().strip() if alias_match else None
        clean_title = re.sub(r'`[^`]+`', '', raw_title).strip()
        
        code_blocks = re.findall(r'```text\r?\n(.*?)\r?\n```', block, re.DOTALL)
        if not code_blocks:
            code_blocks = re.findall(r'```[a-zA-Z]*\r?\n(.*?)\r?\n```', block, re.DOTALL)

        if code_blocks:
            prompt_text = code_blocks[0].strip()
            item = {
                "title": clean_title,
                "prompt": prompt_text
            }
            
            prompts_map[prompt_num] = item
            if alias:
                prompts_map[alias] = item
            title_clean = clean_title.lower()
            
            if "hardcoded" in title_clean or "secret" in title_clean:
                prompts_map["security-secret"] = item
            elif "vulnerability" in title_clean:
                prompts_map["security-vuln"] = item
            elif "auth flow integrity" in title_clean:
                prompts_map["security-auth"] = item
            elif "bundle size" in title_clean:
                prompts_map["perf-bundle"] = item
            elif "backend response" in title_clean:
                prompts_map["perf-response"] = item
            elif "database query optimization" in title_clean:
                prompts_map["perf-query"] = item
            elif "dead code" in title_clean:
                prompts_map["code-dead"] = item
            elif "typescript strict" in title_clean:
                prompts_map["code-strict"] = item
            elif "component size" in title_clean:
                prompts_map["code-component"] = item
            elif "eslint" in title_clean:
                prompts_map["code-eslint"] = item
            elif "api endpoint health" in title_clean:
                prompts_map["test-health"] = item
            elif "frontend build verification" in title_clean:
                prompts_map["test-build"] = item
            elif "auth flow e2e" in title_clean:
                prompts_map["test-e2e"] = item
            elif "offline sync queue" in title_clean:
                prompts_map["test-offline"] = item
            elif "wcag" in title_clean:
                prompts_map["a11y"] = item
            elif "api documentation sync" in title_clean:
                prompts_map["docs-sync"] = item
            elif "readme" in title_clean:
                prompts_map["docs-readme"] = item
            elif "migration consistency" in title_clean:
                prompts_map["db-migration"] = item
            elif "connection pool" in title_clean:
                prompts_map["db-pool"] = item
            elif "dependency update" in title_clean:
                prompts_map["innovation-update"] = item
            elif "feature opportunity" in title_clean:
                prompts_map["innovation-feature"] = item
            elif "service worker" in title_clean:
                prompts_map["pwa-sw"] = item
            elif "capacitor plugin" in title_clean:
                prompts_map["pwa-capacitor"] = item
            elif "mobile ui" in title_clean:
                prompts_map["pwa-mobile"] = item

    return prompts_map


def trigger_session(task_name):
    if not API_KEY:
        print("Hata: JULES_API_KEY ortam değişkeni veya vault anahtarı bulunamadı!", file=sys.stderr)
        sys.exit(1)

    prompts_map = parse_prompts_from_markdown()
    search_key = task_name.lower().strip()
    
    if search_key not in prompts_map:
        print(f"Hata: '{task_name}' anahtarı ile eşleşen bir prompt JULES_PRO_PROMPTS_LIBRARY.md içinde bulunamadı!", file=sys.stderr)
        print("Mevcut anahtarlar/numaralar:", ", ".join(sorted(prompts_map.keys())), file=sys.stderr)
        sys.exit(1)
        
    p_info = prompts_map[search_key]
    title = p_info["title"]
    prompt_content = p_info["prompt"]
    
    print(f"Dinamik Prompt Başarıyla Yüklendi. Görev/Anahtar: {task_name} ({title})")
    print(f"Prompt Önizleme (İlk 150 Karakter): {prompt_content[:150]}...")
    
    url = "https://jules.googleapis.com/v1alpha/sessions"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY
    }
    
    payload = {
        "title": title,
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
        with urllib.request.urlopen(req, timeout=20) as response:
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
        print("Kullanım: python3 trigger_jules.py <task_name_or_alias_or_all>")
        sys.exit(1)
        
    arg = sys.argv[1].lower().strip()
    if arg in ["all", "master-all", "tum-bundle-paketleri"]:
        bundles = ["master-security", "master-performance", "master-quality", "master-health", "master-mobile", "master-docs"]
        print(f"🚀 Tüm {len(bundles)} Master Bundle Seansı Sırasıyla Başlatılıyor...")
        for b in bundles:
            try:
                trigger_session(b)
            except Exception as e:
                print(f"⚠️ {b} tetikleme uyarısı: {e}")
    elif arg in ["suggestions", "suggestions-all", "oneri-paketleri"]:
        suggestions_tasks = ["suggestion-sqli-xss", "suggestion-state-sync", "suggestion-logging", "suggestion-n1", "suggestion-tests"]
        print(f"💡 Tüm {len(suggestions_tasks)} Jules Onerisi Seansi Sırasıyla Başlatılıyor...")
        for st in suggestions_tasks:
            try:
                trigger_session(st)
            except Exception as e:
                print(f"⚠️ {st} tetikleme uyarısı: {e}")
    else:
        trigger_session(arg)
