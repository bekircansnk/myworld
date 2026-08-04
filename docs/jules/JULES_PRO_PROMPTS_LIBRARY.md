# 📚 JULES PRO PROMPTS & MASTER BUNDLE LIBRARY — Planla (2-My-World)

> **Proje:** Planla — Yapay Zeka Destekli İş ve Maaş Yönetim Sistemi
> **Repo:** `bekircansnk/myworld`
> **Jules PRO Hesabı:** `bekirsnk@gmail.com` / `bekirsnk34@gmail.com` (PRO Hesap 2 — 100 Seans/Gün)
> **Son Güncelleme:** 04.08.2026
> **Toplam Prompt:** 24 | **Master Bundle Sayısı:** 6

---

## 🏛️ MASTER BULUT YÖNERGESİ VE OTONOMİ DİREKTİFİ

> **[CRITICAL DIRECTIVE - 100% DECISION AUTONOMY & ZERO QUESTIONS]**
> Every session and scheduled task executed by Google Jules MUST follow these mandatory rules:
> 1. **100% Decision Autonomy:** NEVER ask questions or wait for human feedback (`Needs clarification`). Autonomously choose the safest, most performant implementation.
> 2. **Zero Mock Data:** Always respect real PostgreSQL schemas, live FastAPI connection patterns, and typed interfaces.
> 3. **Verification Gate:** Execute `cd app/web && pnpm run build` after changes and verify zero TypeScript or lint errors before completing.
> 4. **Zero Unicode Emoji:** DO NOT use unicode emojis in UI, comments, commit messages, or changelogs. Use `lucide-react` icons or SVG elements.
> 5. **Changelog Record:** Update `docs/jules/JULES_CHANGELOG.md` in Turkish using the standard format.

---

## 📦 6 MASTER PROMPT BUNDLE KATALOĞU

```
docs/jules/
├── master-security       (Bundle 1: Security & Secret Audit)
├── master-performance    (Bundle 2: Performance & SWR Cache)
├── master-quality        (Bundle 3: Code Quality & Clean Code)
├── master-health         (Bundle 4: E2E & Health Verification)
├── master-mobile         (Bundle 5: PWA & Mobile Optimization)
└── master-docs           (Bundle 6: Documentation & Schema Sync)
```

---

## 🛡️ BUNDLE 1: Master Security & Secret Audit (`master-security`)
**Zamanlama:** Pazartesi 02:00 UTC | **API Alias:** `master-security`, `security`

```text
[Bundle 1: Master Security & Secret Audit]
Role: Senior Security Auditor & DevSecOps Specialist
Goal: Audit the Planla (2-My-World) codebase for hardcoded secrets, dependency vulnerabilities, auth flow integrity, and FastAPI CORS boundaries.

Instructions:
1. Hardcoded Secret Scan: Scan `app/backend/` and `app/web/src/` for exposed API keys, DB passwords, JWT secrets, or Base64 encoded credentials.
2. Dependency Audit: Check `app/web/package.json` with `pnpm audit` and `app/backend/requirements.txt` for known CVEs. Apply safe patch updates automatically.
3. Auth Flow Integrity: Audit JWT expiration, refresh token rotation in `app/backend/app/routers/auth.py`, and 401 interceptors in frontend apiClient.
4. CORS & API Boundaries: Ensure FastAPI CORS middleware in `app/backend/app/main.py` restricts origin hosts securely.
5. Verification: Execute `cd app/web && pnpm build` to confirm zero errors.
6. Documentation: Update `docs/jules/JULES_CHANGELOG.md` in Turkish without using unicode emojis.
```

---

## ⚡ BUNDLE 2: Master Performance & SWR Cache (`master-performance`)
**Zamanlama:** Çarşamba 03:00 UTC | **API Alias:** `master-performance`, `performance`

```text
[Bundle 2: Master Performance & SWR Cache]
Role: Senior Performance & Systems Optimization Specialist
Goal: Audit Next.js bundle sizes, SWR deduplication, async FastAPI endpoints, and Neon PostgreSQL database query efficiency.

Instructions:
1. Frontend Bundle Analysis: Run `cd app/web && pnpm build` and identify chunks over 100KB. Apply code splitting or dynamic imports for heavy components.
2. Backend Async Response Time: Review router files in `app/backend/app/routers/` for blocking I/O, un-indexed queries, or missing pagination.
3. SWR Client Caching: Verify `dedupingInterval: 30000` and `revalidateOnFocus: false` settings across React hooks to prevent duplicate fetches.
4. Neon DB Connection Pool: Review `pool_size`, `max_overflow`, and SSL settings in `app/backend/app/database.py`.
5. Verification: Execute `cd app/web && pnpm build` to confirm zero errors.
6. Documentation: Update `docs/jules/JULES_CHANGELOG.md` in Turkish without using unicode emojis.
```

---

## 🧹 BUNDLE 3: Master Quality & Clean Code (`master-quality`)
**Zamanlama:** Cuma 02:00 UTC | **API Alias:** `master-quality`, `quality`, `cleanup`

```text
[Bundle 3: Master Quality & Clean Code]
Role: Lead Code Quality Engineer
Goal: Clean up dead code, fix TypeScript strict mode issues, refactor oversized components (>300 lines), and resolve ESLint warnings.

Instructions:
1. Dead Code Removal: Find and remove unused imports, orphaned CSS classes, leftover console.log statements, and obsolete code comments.
2. TypeScript Strict Mode: Replace `any` types with explicit interfaces in `app/web/src/types/` and Zustand store actions.
3. God Component Refactoring: Split components exceeding 300 lines into sub-components.
4. Constitutional Rules Check: Enforce React Portals (`createPortal`) for popovers, `DD.MM.YYYY` date format, and zero unicode emojis in UI.
5. Verification: Execute `cd app/web && pnpm build` to confirm zero errors.
6. Documentation: Update `docs/jules/JULES_CHANGELOG.md` in Turkish without using unicode emojis.
```

---

## 🧪 BUNDLE 4: Master E2E & Health Verification (`master-health`)
**Zamanlama:** Günlük 06:00 UTC | **API Alias:** `master-health`, `health`

```text
[Bundle 4: Master E2E & Health Verification]
Role: Automated QA & Health Inspector
Goal: Perform end-to-end API health checks, verify Next.js build integrity, and test offline sync queue resilience.

Instructions:
1. Backend Health Audit: Verify `/api/health` endpoint responds with 200 OK and valid DB connection status.
2. Build Verification: Run `cd app/web && pnpm build` and capture build time, static page generation, and deprecation warnings.
3. Offline Sync Queue: Test IndexedDB sync queue in `app/web/src/lib/syncQueue.ts` for retry policies and conflict resolution.
4. Verification: Execute `cd app/web && pnpm build` to confirm zero errors.
5. Documentation: Update `docs/jules/JULES_CHANGELOG.md` in Turkish without using unicode emojis.
```

---

## 📱 BUNDLE 5: Master PWA & Mobile Optimization (`master-mobile`)
**Zamanlama:** Cumartesi 03:00 UTC | **API Alias:** `master-mobile`, `mobile`, `pwa`

```text
[Bundle 5: Master PWA & Mobile Optimization]
Role: Mobile & PWA UX Specialist
Goal: Audit Serwist Service Worker integrity, Capacitor Android theme compatibility, minimum 44x44px touch targets, and viewport safe-area locks.

Instructions:
1. Service Worker Audit: Check `app/web/src/app/sw.ts` to ensure NO `caches.match('/')` causes infinite redirect loops.
2. Touch Targets & UI: Verify all interactive buttons and icons maintain at least 44x44px touch areas for mobile accessibility.
3. Capacitor Android Compatibility: Check `capacitor.config.ts` (`webDir: 'out.nosync'`) and verify `NoActionBar` Android theme setting.
4. Viewport Rubber-band Locks: Ensure `overscroll-behavior-y: none` prevents unwanted elastic scrolling in WebViews.
5. Verification: Execute `cd app/web && pnpm build` to confirm zero errors.
6. Documentation: Update `docs/jules/JULES_CHANGELOG.md` in Turkish without using unicode emojis.
```

---

## 📚 BUNDLE 6: Master Docs & Schema Synchronization (`master-docs`)
**Zamanlama:** Salı 03:00 UTC | **API Alias:** `master-docs`, `docs`

```text
[Bundle 6: Master Docs & Schema Synchronization]
Role: System Architect & Technical Writer
Goal: Synchronize FastAPI OpenAPI schemas, Alembic database migrations, project READMEs, and Turkish changelogs.

Instructions:
1. OpenAPI Schema Sync: Verify FastAPI Pydantic models align with frontend TypeScript interfaces.
2. Alembic Migration Integrity: Ensure SQLAlchemy models in `app/backend/app/models/` match Alembic revision files.
3. System Documentation: Update `README.md`, `AGENTS.md`, and environment variable descriptions.
4. Verification: Execute `cd app/web && pnpm build` to confirm zero errors.
5. Documentation: Update `docs/jules/JULES_CHANGELOG.md` in Turkish without using unicode emojis.
```

---

## 📌 BÖLÜM B: 24 MİKRO PROMPT DETAYLARI

*(Tüm 24 mikro-prompt 6 Master Bundle ile senkronize olarak çalışmaktadır.)*

### 1. Hardcoded Secret Scan
**Zamanlama:** Pazartesi 02:00 UTC | **Bundle:** Master Security
```text
Scan the entire codebase for hardcoded secrets, API keys, passwords, tokens, and credentials.
Check app/backend/app/config.py and app/web/src/ for exposed credentials.
Run `cd app/web && pnpm build` after any changes.
Update docs/jules/JULES_CHANGELOG.md in Turkish without unicode emojis.
```

### 2. Dependency Vulnerability Audit
**Zamanlama:** Salı 02:00 UTC | **Bundle:** Master Security
```text
Run a full dependency vulnerability audit with `pnpm audit` in app/web and requirements.txt check in app/backend.
Apply safe minor/patch updates automatically.
Run `cd app/web && pnpm build` after any changes.
Update docs/jules/JULES_CHANGELOG.md in Turkish without unicode emojis.
```

### 3. Auth Flow Integrity Check
**Zamanlama:** Aylık 1. Gün | **Bundle:** Master Security
```text
Perform authentication and authorization security audit on app/backend/app/routers/auth.py and authStore.ts.
Verify token expiration, RBAC hierarchy, and 401 interceptors.
Run `cd app/web && pnpm build` after any changes.
Update docs/jules/JULES_CHANGELOG.md in Turkish without unicode emojis.
```

### 4. Bundle Size Analysis
**Zamanlama:** 2 Haftada Bir | **Bundle:** Master Performance
```text
Analyze Next.js frontend bundle size by running `cd app/web && pnpm build`.
Identify chunks larger than 100KB and apply dynamic imports for heavy components.
Update docs/jules/JULES_CHANGELOG.md in Turkish without unicode emojis.
```

### 5. Backend Response Time Audit
**Zamanlama:** Perşembe 02:00 UTC | **Bundle:** Master Performance
```text
Audit FastAPI backend routers for un-indexed queries, missing pagination, and async bottlenecks.
Update docs/jules/JULES_CHANGELOG.md in Turkish without unicode emojis.
```

### 6. Database Query Optimization
**Zamanlama:** Aylık 15. Gün | **Bundle:** Master Performance
```text
Review SQLAlchemy models and Alembic migrations for index coverage and query performance.
Update docs/jules/JULES_CHANGELOG.md in Turkish without unicode emojis.
```

### 7. Dead Code Cleanup
**Zamanlama:** Cuma 02:00 UTC | **Bundle:** Master Quality
```text
Remove unused imports, dead components, and debug console.log statements across app/web/src and app/backend/.
Run `cd app/web && pnpm build` after cleanup.
Update docs/jules/JULES_CHANGELOG.md in Turkish without unicode emojis.
```

### 8. TypeScript Strict Mode Compliance
**Zamanlama:** 2 Haftada Bir | **Bundle:** Master Quality
```text
Replace `any` types with explicit interfaces in app/web/src/ and Zustand stores.
Run `cd app/web && pnpm build` after fixes.
Update docs/jules/JULES_CHANGELOG.md in Turkish without unicode emojis.
```

### 9. Component Size Audit
**Zamanlama:** Aylık 5. Gün | **Bundle:** Master Quality
```text
Refactor oversized components (>300 lines) into sub-components.
Run `cd app/web && pnpm build` after refactoring.
Update docs/jules/JULES_CHANGELOG.md in Turkish without unicode emojis.
```

### 10. ESLint Fix
**Zamanlama:** Cumartesi 02:00 UTC | **Bundle:** Master Quality
```text
Fix ESLint warnings and formatting issues across app/web/src.
Run `cd app/web && pnpm build` after fixes.
Update docs/jules/JULES_CHANGELOG.md in Turkish without unicode emojis.
```

### 11. API Endpoint Health Check
**Zamanlama:** Günlük 06:00 UTC | **Bundle:** Master Health
```text
Verify all backend API endpoints (/api/health, /api/auth/me) respond correctly.
Update docs/jules/JULES_CHANGELOG.md in Turkish without unicode emojis.
```

### 12. Frontend Build Verification
**Zamanlama:** Günlük 07:00 UTC | **Bundle:** Master Health
```text
Run `cd app/web && pnpm build` and verify static generation and zero build errors.
Update docs/jules/JULES_CHANGELOG.md in Turkish without unicode emojis.
```

### 13. Auth Flow E2E Test
**Zamanlama:** Pazar 03:00 UTC | **Bundle:** Master Health
```text
Run end-to-end authentication tests in app/backend/tests/test_auth.py.
Update docs/jules/JULES_CHANGELOG.md in Turkish without unicode emojis.
```

### 14. Offline Sync Queue Test
**Zamanlama:** 2 Haftada Bir | **Bundle:** Master Health
```text
Audit IndexedDB sync queue in app/web/src/lib/syncQueue.ts for retry logic and conflict handling.
Run `cd app/web && pnpm build` after changes.
Update docs/jules/JULES_CHANGELOG.md in Turkish without unicode emojis.
```

### 15. WCAG AA Compliance Scan
**Zamanlama:** Aylık 10. Gün | **Bundle:** Master Quality / Health
```text
Audit UI accessibility, aria-labels, and color contrast compliance.
Run `cd app/web && pnpm build` after fixes.
Update docs/jules/JULES_CHANGELOG.md in Turkish without unicode emojis.
```

### 16. API Documentation Sync
**Zamanlama:** 2 Haftada Bir | **Bundle:** Master Docs
```text
Synchronize FastAPI OpenAPI docs with frontend TypeScript types.
Update docs/jules/JULES_CHANGELOG.md in Turkish without unicode emojis.
```

### 17. README Update
**Zamanlama:** Aylık 20. Gün | **Bundle:** Master Docs
```text
Update project README.md, AGENTS.md, and environment variable documentation.
Update docs/jules/JULES_CHANGELOG.md in Turkish without unicode emojis.
```

### 18. Migration Consistency Check
**Zamanlama:** Çarşamba 02:00 UTC | **Bundle:** Master Docs
```text
Check Alembic migration consistency with SQLAlchemy models in app/backend/app/models/.
Update docs/jules/JULES_CHANGELOG.md in Turkish without unicode emojis.
```

### 19. Connection Pool Health
**Zamanlama:** 2 Haftada Bir | **Bundle:** Master Performance
```text
Review PostgreSQL connection pool settings in app/backend/app/database.py.
Update docs/jules/JULES_CHANGELOG.md in Turkish without unicode emojis.
```

### 20. Dependency Update Proposal
**Zamanlama:** Aylık 25. Gün | **Bundle:** Master Security / Quality
```text
Analyze dependencies in package.json and requirements.txt for safe patch/minor updates.
Run `cd app/web && pnpm build` after updates.
Update docs/jules/JULES_CHANGELOG.md in Turkish without unicode emojis.
```

### 21. New Feature Opportunity Scan
**Zamanlama:** Aylık 28. Gün | **Bundle:** Master Docs
```text
Scan codebase for feature gaps, error boundary coverage, and UX opportunities.
Update docs/jules/JULES_CHANGELOG.md in Turkish without unicode emojis.
```

### 22. Service Worker Integrity
**Zamanlama:** Pazar 02:00 UTC | **Bundle:** Master Mobile
```text
Verify Serwist Service Worker implementation in app/web/src/app/sw.ts.
Run `cd app/web && pnpm build` after changes.
Update docs/jules/JULES_CHANGELOG.md in Turkish without unicode emojis.
```

### 23. Capacitor Plugin Compatibility
**Zamanlama:** 2 Haftada Bir | **Bundle:** Master Mobile
```text
Check Capacitor plugin versions in package.json and verify `webDir: 'out.nosync'`.
Run `cd app/web && pnpm build` after changes.
Update docs/jules/JULES_CHANGELOG.md in Turkish without unicode emojis.
```

### 24. Mobile UI Responsiveness
**Zamanlama:** Aylık 12. Gün | **Bundle:** Master Mobile
```text
Audit mobile UI responsiveness, safe-area paddings, and 44x44px touch targets.
Run `cd app/web && pnpm build` after changes.
Update docs/jules/JULES_CHANGELOG.md in Turkish without unicode emojis.
```

---

*Planla (2-My-World) — Jules Pro Prompts & Master Bundle Library v2.0.0*
