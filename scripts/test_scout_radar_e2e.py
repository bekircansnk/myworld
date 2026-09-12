import os
import re
import sys
import json
import time
import asyncio
import subprocess
from playwright.async_api import async_playwright

REPORT_MD_FILE = "/Users/bekir/.gemini/maestro/research_vault/daily/2026-09-12/AI_INTELLIGENCE_2026-09-12.md"
REPORT_HTML_FILE = "/Users/bekir/.gemini/maestro/research_vault/daily/2026-09-12/AI_INTELLIGENCE_2026-09-12.html"

with open(REPORT_MD_FILE, "r", encoding="utf-8") as f:
    full_markdown = f.read()

with open(REPORT_HTML_FILE, "r", encoding="utf-8") as f:
    full_html = f.read()

mock_user = {
    "id": 1,
    "username": "bekircan",
    "email": "sagnakbekircan@gmail.com",
    "name": "Bekir Can",
    "role": "super_admin",
    "permissions": {},
    "is_active": True
}

mock_scout_data = [
    {
        "id": 64,
        "title": "🛰️ Günlük AI İstihbarat Brifingi (2026-09-12)",
        "description": "MCP mimarisi AST tabanlı bilgi grafiğine evrildi (%99 token tasarrufu), Frontier modellerde çift kademeli dağıtım ve Karpathy 4-katman bellek hiyerarşisi devreye alındı.",
        "date": "2026-09-12",
        "created_at": "2026-09-12T09:00:00Z",
        "project_id": 4,
        "content": full_markdown,
        "html": full_html,
        "parsed": {
            "raw_sections": {
                "⚡ 60 Saniyelik Yönetici Özeti (Günün 3 Kritik Olayı)": "1. **MCP (Model Context Protocol) Evrimi:** DeusData AST Bilgi Grafiği ile %99 token tasarrufu.\n2. **Frontier Modellerde Çift Kademeli Dağıtım:** Hızlı İcracı (Gemini Omni) + Derin Doğrulayıcı (Claude Mythos 5.1).\n3. **Karpathy Bellek Hiyerarşisi:** `raw/` -> `wiki/` -> `ctx/` -> `mem/` ile döngü kilitlenmesi önleme.",
                "🚀 Radarımıza Giren En Sıcak GitHub & MCP Projeleri (Teknik Detaylar ve Linkler)": "* **[DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) — AST Destekli Bilgi Grafiği MCP Sunucusu:**\n  * **Teknik Nitelik:** Sıfır bağımlılıkla çalışan tek bir statik binary. %99 token tasarrufu sağlar.\n* **[livekit/agents](https://github.com/livekit/agents) — Olay Güdümlü Çok Modlu Konuşma Orkestrasyonu:**\n  * **Teknik Nitelik:** WebRTC full-duplex ses ve video ajanları.",
                "🔬 Frontier AI & Araştırma Bültenleri (DeepMind, Anthropic, OpenAI)": "Anthropic Claude Mythos 5.1 & Fable 5.1, DeepMind Gemini Omni & Nano Banana modelleri analiz edildi.",
                "🐦 Topluluk Nabzı: Twitter/X, Reddit & HackerNews Çıkarımları": "AI Slop yorgunluğu ve Karpathy dosya tabanlı durum hiyerarşisi açık kaynak dünyasında ana akım oldu.",
                "🏗️ Üretim Mimarisi ve Ajan Tasarımı İçin Kritik Dersler": "```\n+=======================================================================================+\n|                            MAESTRO 360 HİBRİT TOPOLOJİSİ                              |\n+=======================================================================================+\n|  MAC (KOKPİT & GELİŞTİRME)             VPS (COMPUTE, ORKESTRASYON & WORKER)           |\n|  +---------------------------+         +--------------------------------------------+ |\n|  | Modern Kokpit (React/SSE) |         | LiteLLM Proxy (Virtual Keys & Sanitizer)   | |\n|  +-------------▲-------------+         +---------------------▲----------------------+ |\n|                │ (SSE Replay)                                │ (Failover / Pinning)   |\n|  +-------------┴-------------+         +---------------------┴----------------------+ |\n|  | CQRS Outbox Olay Tüketimi |<=======>| Redis Streams / NATS JetStream Olay Yolu   | |\n+=======================================================================================+\n```",
                "🎯 Maestro 360 İçin Bugünkü Somut Aksiyon Listesi (Checklist)": "- [ ] **Codebase Memory MCP Entegrasyonu:** AST Bilgi Grafiği entegrasyonu.\n- [ ] **Karpathy Bellek Hiyerarşisi Kurulması:** `raw/`, `wiki/`, `ctx/`, `mem/` mimarisi.\n- [ ] **LiteLLM Provider Pinning Konfigürasyonu:** Sağlayıcı sabitlemesi ve önbellek kilitlenmesi.",
                "📊 Çoklu-Ajan Orkestrasyon & Kota Rotasyon Telemetrisi": "| Ajan Rolü | Görevlendirilen Google Hesabı | Çalışma Süresi | Durum |\n| :--- | :--- | :--- | :--- |\n| **Worker 1:** GitHub & MCP | `bekirsnk@gmail.com` | 19.55s | ✅ Başarılı |\n| **Worker 2:** Frontier Labs | `bekircansaganak@gmail.com` | 11.25s | ✅ Başarılı |\n| **Worker 3:** Topluluk Nabzı | `cazadoryedek@gmail.com` | 16.55s | ✅ Başarılı |\n| **Worker 4:** Üretim Mimarisi | `bekirsnk34@gmail.com` | 16.04s | ✅ Başarılı |\n| **Worker 5:** Sentez Direktörü | `kadekkazador@gmail.com` | 27.32s | ✅ Başarılı |"
            },
            "section_list": [
                {"title": "⚡ 60 Saniyelik Yönetici Özeti (Günün 3 Kritik Olayı)", "body": "1. **MCP (Model Context Protocol) Evrimi:** DeusData AST Bilgi Grafiği ile %99 token tasarrufu."},
                {"title": "🚀 Radarımıza Giren En Sıcak GitHub & MCP Projeleri (Teknik Detaylar ve Linkler)", "body": "* **[DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp)**"},
                {"title": "🔬 Frontier AI & Araştırma Bültenleri (DeepMind, Anthropic, OpenAI)", "body": "Claude Mythos 5.1 and Gemini Omni dual-tier evaluation."},
                {"title": "🐦 Topluluk Nabzı: Twitter/X, Reddit & HackerNews Çıkarımları", "body": "AI Slop yorgunluğu ve Karpathy mimarisi."},
                {"title": "🏗️ Üretim Mimarisi ve Ajan Tasarımı İçin Kritik Dersler", "body": "LangGraph FSM and CQRS Redis Streams."},
                {"title": "🎯 Maestro 360 İçin Bugünkü Somut Aksiyon Listesi (Checklist)", "body": "- [ ] AST MCP\n- [ ] Karpathy Memory"},
                {"title": "📊 Çoklu-Ajan Orkestrasyon & Kota Rotasyon Telemetrisi", "body": "| Ajan Rolü | Çalışma Süresi |\n| Worker 1 | 19.55s |"}
            ],
            "telemetry_rows": [
                {"Ajan Rolü": "Worker 1: GitHub & MCP", "Görevlendirilen Google Hesabı": "bekirsnk@gmail.com", "Çalışma Süresi": "19.55s", "Durum": "✅ Başarılı"},
                {"Ajan Rolü": "Worker 2: Frontier Labs", "Görevlendirilen Google Hesabı": "bekircansaganak@gmail.com", "Çalışma Süresi": "11.25s", "Durum": "✅ Başarılı"},
                {"Ajan Rolü": "Worker 3: Topluluk Nabzı", "Görevlendirilen Google Hesabı": "cazadoryedek@gmail.com", "Çalışma Süresi": "16.55s", "Durum": "✅ Başarılı"},
                {"Ajan Rolü": "Worker 4: Üretim Mimarisi", "Görevlendirilen Google Hesabı": "bekirsnk34@gmail.com", "Çalışma Süresi": "16.04s", "Durum": "✅ Başarılı"},
                {"Ajan Rolü": "Worker 5: Sentez Direktörü", "Görevlendirilen Google Hesabı": "kadekkazador@gmail.com", "Çalışma Süresi": "27.32s", "Durum": "✅ Başarılı"}
            ],
            "word_count": 2250,
            "reading_time_min": 8,
            "metrics": {
                "total_workers": 5,
                "successful_workers": 5,
                "quorum_str": "5/5",
                "total_duration_sec": 90.71,
                "token_saving_pct": 99,
                "completed_checks": 0,
                "total_checks": 3,
                "architecture_nodes": 4,
                "reading_time_min": 8
            }
        }
    }
]

async def run_e2e():
    print("[*] E2E Test Başlatılıyor: HTTP Statik Sunucu (Port 3001) kontrol ediliyor...", flush=True)
    web_out_dir = "/Users/bekir/Uygulamalarim/2-My-World/app/web/out"
    server_process = subprocess.Popen(
        [sys.executable, "-m", "http.server", "3001", "--directory", web_out_dir],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    time.sleep(1.5)

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            # service_workers='block' prevents Serwist SW from dropping mocked API calls
            context = await browser.new_context(viewport={"width": 1440, "height": 900}, service_workers="block")
            page = await context.new_page()

            cors_headers = {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "*"
            }

            async def handle_api(route):
                if route.request.method == "OPTIONS":
                    await route.fulfill(status=204, headers=cors_headers)
                    return

                url = route.request.url
                if "/api/auth/me" in url:
                    await route.fulfill(status=200, headers=cors_headers, content_type="application/json", body=json.dumps(mock_user))
                elif "/api/reports/scout" in url:
                    await route.fulfill(status=200, headers=cors_headers, content_type="application/json", body=json.dumps(mock_scout_data))
                elif "/api/projects" in url:
                    await route.fulfill(status=200, headers=cors_headers, content_type="application/json", body=json.dumps([{"id": 4, "title": "Maestro 360", "slug": "maestro-360", "color": "#6366f1"}]))
                elif "/api/cost" in url:
                    await route.fulfill(status=200, headers=cors_headers, content_type="application/json", body="{}")
                else:
                    await route.fulfill(status=200, headers=cors_headers, content_type="application/json", body="[]")

            await page.route(re.compile(r"https://myworld-twqx\.onrender\.com/api/.*"), handle_api)

            await page.add_init_script("""
                localStorage.setItem('token', 'mock-valid-jwt-token');
                sessionStorage.setItem('planla_session_greet', 'true');
            """)

            print("[*] http://localhost:3001 açılıyor...", flush=True)
            await page.goto("http://localhost:3001", wait_until="domcontentloaded")
            await page.wait_for_timeout(2500)

            # Dismiss Morning Screen if present
            morning_btn = await page.query_selector("button:has-text('Güne Başla')")
            if morning_btn:
                print("[*] Karşılama ekranı kapatılıyor...", flush=True)
                await morning_btn.click()
                await page.wait_for_timeout(1000)

            # Click Radar in TopNavbar
            scout_nav_btn = await page.query_selector("button:has-text('Radar')")
            assert scout_nav_btn is not None, "TopNavbar 'Radar' sekmesi bulunamadı!"
            print("[*] TopNavbar 'Radar' sekmesine tıklanıyor...", flush=True)
            await scout_nav_btn.click()
            await page.wait_for_timeout(2500)

            # 1. Başlık Doğrulaması
            title_elem = await page.query_selector("text=Maestro 360-Scout AI İstihbarat Radarı")
            assert title_elem is not None, "Scout Radar başlığı bulunamadı!"
            print("[OK] Radar Başlığı başarıyla doğrulandı.", flush=True)

            # 2. Bento Benchmark Vitrini Doğrulaması
            swarm_card = await page.query_selector("text=5-Worker Swarm")
            assert swarm_card is not None, "Bento Worker Swarm kartı bulunamadı!"
            token_card = await page.query_selector("text=%99 İndirim")
            assert token_card is not None, "Bento %99 İndirim kartı bulunamadı!"
            print("[OK] Bento Benchmark kartları dinamik olarak doğrulandı.", flush=True)

            os.makedirs("/Users/bekir/Uygulamalarim/2-My-World/scripts/screenshots", exist_ok=True)

            # 3. MOD 1: Cam HTML Önizleme İframe Doğrulaması
            print("[*] Mod 1: Cam HTML Önizleme İframe doğrulanıyor...", flush=True)
            iframe_elem = await page.query_selector("iframe[title='AI Intelligence HTML Report']")
            assert iframe_elem is not None, "HTML Önizleme İframe bulunamadı!"
            await page.screenshot(path="/Users/bekir/Uygulamalarim/2-My-World/scripts/screenshots/01_scout_html_preview.png", full_page=True)
            print("[OK] Screenshot 1 kaydedildi: 01_scout_html_preview.png", flush=True)

            # 4. MOD 2: İnteraktif Magazin Görünümü Doğrulaması
            print("[*] Mod 2: İnteraktif Magazin görünümüne geçiliyor...", flush=True)
            mag_btn = await page.query_selector("button:has-text('İnteraktif Magazin')")
            assert mag_btn is not None, "İnteraktif Magazin butonu bulunamadı!"
            await mag_btn.click()
            await page.wait_for_timeout(1000)
            
            mag_h1 = await page.query_selector("text=Dahili Stratejik İstihbarat")
            assert mag_h1 is not None, "Magazin görünümü render edilemedi!"
            await page.screenshot(path="/Users/bekir/Uygulamalarim/2-My-World/scripts/screenshots/02_scout_magazine_view.png", full_page=True)
            print("[OK] Screenshot 2 kaydedildi: 02_scout_magazine_view.png", flush=True)

            # 5. MOD 3: Bölüm Gezgini (Perspektif Sekmeleri)
            print("[*] Mod 3: Bölüm Gezgini moduna geçiliyor...", flush=True)
            persp_btn = await page.query_selector("button:has-text('Bölüm Gezgini')")
            assert persp_btn is not None, "Bölüm Gezgini butonu bulunamadı!"
            await persp_btn.click()
            await page.wait_for_timeout(1000)

            # Sekme 1: 60s Özeti
            summary_header = await page.query_selector("text=60 Saniyelik Stratejik Yönetici Özeti")
            assert summary_header is not None, "60s Özeti sekmesi görüntülenemedi!"
            print("[OK] 60s Özeti sekmesi başarıyla doğrulandı.", flush=True)

            # Sekme 2: Mimari & FSM
            arch_btn = await page.query_selector("button:has-text('Mimari & FSM')")
            if arch_btn:
                await arch_btn.click()
                await page.wait_for_timeout(800)
                await page.screenshot(path="/Users/bekir/Uygulamalarim/2-My-World/scripts/screenshots/03_scout_architecture_tab.png")
                print("[OK] Screenshot 3 kaydedildi: 03_scout_architecture_tab.png", flush=True)

            # Sekme 3: Aksiyonlar & İnteraktif Kontrol Listesi
            action_btn = await page.query_selector("button:has-text('Aksiyonlar')")
            if action_btn:
                await action_btn.click()
                await page.wait_for_timeout(800)
                await page.screenshot(path="/Users/bekir/Uygulamalarim/2-My-World/scripts/screenshots/04_scout_checklist_tab.png")
                print("[OK] Screenshot 4 kaydedildi: 04_scout_checklist_tab.png", flush=True)

            # 6. MOD 4: Ham Kaynak (Markdown / JSON / HTML Source)
            print("[*] Mod 4: Ham Kaynak moduna geçiliyor...", flush=True)
            raw_btn = await page.query_selector("button:has-text('Ham Kaynak')")
            assert raw_btn is not None, "Ham Kaynak butonu bulunamadı!"
            await raw_btn.click()
            await page.wait_for_timeout(800)
            
            # JSON alt sekmesine tıkla
            json_btn = await page.query_selector("button:has-text('Yapısal JSON')")
            if json_btn:
                await json_btn.click()
                await page.wait_for_timeout(800)

            await page.screenshot(path="/Users/bekir/Uygulamalarim/2-My-World/scripts/screenshots/05_scout_raw_json.png")
            print("[OK] Screenshot 5 kaydedildi: 05_scout_raw_json.png", flush=True)

            print("\n==================================================================", flush=True)
            print(" [BAŞARILI] PLAYWRIGHT E2E KONTROL VE TESTLERİ %100 BAŞARIYLA TAMAMLANDI!", flush=True)
            print("==================================================================", flush=True)

            await browser.close()
    finally:
        server_process.terminate()
        server_process.wait()
        print("[*] HTTP Statik Sunucu temizlendi.", flush=True)

if __name__ == "__main__":
    asyncio.run(run_e2e())
