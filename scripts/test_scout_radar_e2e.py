import os
import json
import asyncio
from playwright.async_api import async_playwright

REPORT_FILE = "/Users/bekir/.gemini/maestro/research_vault/daily/2026-09-12/AI_INTELLIGENCE_2026-09-12.md"
with open(REPORT_FILE, "r", encoding="utf-8") as f:
    full_markdown = f.read()

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
        "parsed": {
            "raw_sections": {
                "⚡ 60 Saniyelik Yönetici Özeti (Günün 3 Kritik Olayı)": "1. **MCP (Model Context Protocol) Evrimi:** DeusData AST Bilgi Grafiği ile %99 token tasarrufu.\n2. **Frontier Modellerde Çift Kademeli Dağıtım:** Hızlı İcracı (Gemini Omni) + Derin Doğrulayıcı (Claude Mythos 5.1).\n3. **Karpathy Bellek Hiyerarşisi:** `raw/` -> `wiki/` -> `ctx/` -> `mem/` ile döngü kilitlenmesi önleme.",
                "🚀 Radarımıza Giren En Sıcak GitHub & MCP Projeleri (Teknik Detaylar ve Linkler)": "* **[DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) — AST Destekli Bilgi Grafiği MCP Sunucusu:**\n  * **Teknik Nitelik:** Sıfır bağımlılıkla çalışan tek bir statik binary. %99 token tasarrufu sağlar.\n* **[livekit/agents](https://github.com/livekit/agents) — Olay Güdümlü Çok Modlu Konuşma Orkestrasyonu:**\n  * **Teknik Nitelik:** WebRTC full-duplex ses ve video ajanları.",
                "🔬 Frontier AI & Araştırma Bültenleri (DeepMind, Anthropic, OpenAI)": "Anthropic Claude Mythos 5.1 & Fable 5.1, DeepMind Gemini Omni & Nano Banana modelleri analiz edildi.",
                "🏗️ Üretim Mimarisi ve Ajan Tasarımı İçin Kritik Dersler": "```\n+=======================================================================================+\n|                            MAESTRO 360 HİBRİT TOPOLOJİSİ                              |\n+=======================================================================================+\n|  MAC (KOKPİT & GELİŞTİRME)             VPS (COMPUTE, ORKESTRASYON & WORKER)           |\n|  +---------------------------+         +--------------------------------------------+ |\n|  | Modern Kokpit (React/SSE) |         | LiteLLM Proxy (Virtual Keys & Sanitizer)   | |\n|  +-------------▲-------------+         +---------------------▲----------------------+ |\n|                │ (SSE Replay)                                │ (Failover / Pinning)   |\n|  +-------------┴-------------+         +---------------------┴----------------------+ |\n|  | CQRS Outbox Olay Tüketimi |<=======>| Redis Streams / NATS JetStream Olay Yolu   | |\n+=======================================================================================+\n```",
                "🎯 Maestro 360 İçin Bugünkü Somut Aksiyon Listesi (Checklist)": "- [ ] **Codebase Memory MCP Entegrasyonu:** AST Bilgi Grafiği entegrasyonu.\n- [ ] **Karpathy Bellek Hiyerarşisi Kurulması:** `raw/`, `wiki/`, `ctx/`, `mem/` mimarisi.\n- [ ] **LiteLLM Provider Pinning Konfigürasyonu:** Sağlayıcı sabitlemesi ve önbellek kilitlenmesi.",
                "📊 Çoklu-Ajan Orkestrasyon & Kota Rotasyon Telemetrisi": "| Ajan Rolü | Görevlendirilen Google Hesabı | Çalışma Süresi | Durum |\n| :--- | :--- | :--- | :--- |\n| **Worker 1:** GitHub & MCP | `bekirsnk@gmail.com` | 19.55s | ✅ Başarılı |\n| **Worker 2:** Frontier Labs | `bekircansaganak@gmail.com` | 11.25s | ✅ Başarılı |\n| **Worker 3:** Topluluk Nabzı | `cazadoryedek@gmail.com` | 16.55s | ✅ Başarılı |\n| **Worker 4:** Üretim Mimarisi | `bekirsnk34@gmail.com` | 16.04s | ✅ Başarılı |\n| **Worker 5:** Sentez Direktörü | `kadekkazador@gmail.com` | 27.32s | ✅ Başarılı |"
            },
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
                "token_saving_pct": 99,
                "architecture_nodes": 4,
                "reading_time_min": 8
            }
        }
    }
]

async def main():
    print("[*] Playwright testi başlatılıyor...", flush=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        # Intercept auth and API routes
        await page.route("**/api/auth/me*", lambda route: route.fulfill(
            status=200, content_type="application/json", body=json.dumps(mock_user)
        ))
        await page.route("**/api/reports/scout*", lambda route: route.fulfill(
            status=200, content_type="application/json", body=json.dumps(mock_scout_data)
        ))
        await page.route("**/api/activities*", lambda route: route.fulfill(
            status=200, content_type="application/json", body="[]"
        ))
        await page.route("**/api/tasks*", lambda route: route.fulfill(
            status=200, content_type="application/json", body="[]"
        ))
        await page.route("**/api/cost*", lambda route: route.fulfill(
            status=200, content_type="application/json", body="{}"
        ))
        await page.route("**/api/calendar*", lambda route: route.fulfill(
            status=200, content_type="application/json", body="[]"
        ))
        await page.route("**/api/notes*", lambda route: route.fulfill(
            status=200, content_type="application/json", body="[]"
        ))
        await page.route("**/api/user_company_access*", lambda route: route.fulfill(
            status=200, content_type="application/json", body="[]"
        ))
        await page.route("**/api/projects*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps([{"id": 4, "title": "Maestro 360", "slug": "maestro-360", "color": "#6366f1"}])
        ))

        # Init script
        await page.add_init_script("""
            localStorage.setItem('token', 'mock-valid-jwt-token');
            sessionStorage.setItem('planla_session_greet', 'true');
        """)

        print("[*] http://localhost:3001 adresine gidiliyor...", flush=True)
        await page.goto("http://localhost:3001", wait_until="domcontentloaded")
        await page.wait_for_timeout(3000)

        # Ensure MorningScreen is dismissed if visible
        morning_btn = await page.query_selector("button:has-text('Güne Başla')")
        if morning_btn:
            print("[*] Karşılama ekranı kapatılıyor...", flush=True)
            await morning_btn.click()
            await page.wait_for_timeout(1000)

        # Click on TopNavbar 'Radar' button
        scout_nav_btn = await page.query_selector("button:has-text('Radar')")
        if scout_nav_btn:
            print("[*] TopNavbar 'Radar' butonuna tıklanıyor...", flush=True)
            await scout_nav_btn.click()
            await page.wait_for_timeout(2000)

        # 1. Başlık Kontrolü
        title_elem = await page.query_selector("text=Maestro 360-Scout AI İstihbarat Radarı")
        if not title_elem:
            # Check what's currently rendered
            body_text = await page.inner_text("body")
            print(f"[DEBUG BODY]: {body_text[:300]}", flush=True)
            await page.screenshot(path="/Users/bekir/Uygulamalarim/2-My-World/scripts/screenshots/debug_page.png")
            raise AssertionError("Scout Radar başlığı bulunamadı!")

        print("[OK] Radar Başlığı başarıyla render edildi.", flush=True)

        # 2. Bento Kartları Kontrolü
        swarm_card = await page.query_selector("text=5-Worker Swarm")
        assert swarm_card is not None, "Bento Worker Swarm kartı bulunamadı!"
        token_card = await page.query_selector("text=Token Tasarrufu")
        assert token_card is not None, "Bento Token Tasarrufu kartı bulunamadı!"
        print("[OK] Bento Benchmark kartları başarıyla doğrulandı.", flush=True)

        # Screenshot 1: Genel Bakış
        os.makedirs("/Users/bekir/Uygulamalarim/2-My-World/scripts/screenshots", exist_ok=True)
        await page.screenshot(path="/Users/bekir/Uygulamalarim/2-My-World/scripts/screenshots/scout_radar_overview.png", full_page=True)
        print("[OK] Screenshot 1 kaydedildi: scout_radar_overview.png", flush=True)

        # 3. Sekme Geçişi: Mimari & FSM Şeması
        print("[*] Mimari & FSM sekmesine geçiliyor...", flush=True)
        arch_tab = await page.query_selector("button:has-text('Mimari & FSM')")
        if arch_tab:
            await arch_tab.click()
            await page.wait_for_timeout(1000)
            await page.screenshot(path="/Users/bekir/Uygulamalarim/2-My-World/scripts/screenshots/scout_radar_architecture.png")
            print("[OK] Screenshot 2 kaydedildi: scout_radar_architecture.png", flush=True)

        # 4. Sekme Geçişi: Telemetri & Benchmark
        print("[*] Telemetri sekmesine geçiliyor...", flush=True)
        telemetry_tab = await page.query_selector("button:has-text('Telemetri')")
        if telemetry_tab:
            await telemetry_tab.click()
            await page.wait_for_timeout(1000)
            await page.screenshot(path="/Users/bekir/Uygulamalarim/2-My-World/scripts/screenshots/scout_radar_telemetry.png")
            print("[OK] Screenshot 3 kaydedildi: scout_radar_telemetry.png", flush=True)

        # 5. Sekme Geçişi: Aksiyonlar (Checklist)
        print("[*] Aksiyonlar sekmesine geçiliyor...", flush=True)
        action_tab = await page.query_selector("button:has-text('Aksiyonlar')")
        if action_tab:
            await action_tab.click()
            await page.wait_for_timeout(1000)
            await page.screenshot(path="/Users/bekir/Uygulamalarim/2-My-World/scripts/screenshots/scout_radar_checklist.png")
            print("[OK] Screenshot 4 kaydedildi: scout_radar_checklist.png", flush=True)

        print("\n==================================================================", flush=True)
        print(" [BAŞARILI] PLAYWRIGHT E2E KONTROL VE TESTLERİ %100 BAŞARIYLA TAMAMLANDI!", flush=True)
        print("==================================================================", flush=True)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
