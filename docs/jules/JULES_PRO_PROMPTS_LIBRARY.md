# 📚 JULES PRO PROMPTS LIBRARY — Planla (2-My-World)

> **Proje:** Planla — Yapay Zeka Destekli İş ve Maaş Yönetim Sistemi
> **Repo:** bekircansnk/2-My-World
> **Son Güncelleme:** 19.07.2026
> **Toplam Prompt:** 24 | **Kategori:** 9

---

## 📋 İçindekiler

1. [🔒 Güvenlik (Security)](#-güvenlik-security)
2. [⚡ Performans (Performance)](#-performans-performance)
3. [🧹 Kod Kalitesi (Code Quality)](#-kod-kalitesi-code-quality)
4. [🧪 Test (Testing)](#-test-testing)
5. [♿ Erişilebilirlik (Accessibility)](#-erişilebilirlik-accessibility)
6. [📚 Belgeleme (Documentation)](#-belgeleme-documentation)
7. [🗄️ Veritabanı (Database)](#️-veritabanı-database)
8. [🚀 İnovasyon (Innovation)](#-inovasyon-innovation)
9. [📱 PWA & Capacitor](#-pwa--capacitor)

---

## 🔒 Güvenlik (Security)

### 1. Hardcoded Secret Scan
**Zamanlama:** Haftalık — Pazartesi 02:00 UTC
```
Scan the entire codebase for hardcoded secrets, API keys, passwords, tokens, and credentials.

Check these specific areas:
- app/backend/app/config.py — ensure no hardcoded passwords
- app/web/src/ — check for exposed API keys in client code
- All .ts, .tsx, .py files for patterns like: API_KEY=, password=, token=, secret=
- Base64 encoded strings that might be obfuscated credentials

Report findings in a markdown table with: File, Line, Type (API Key/Password/Token), Risk Level.
Run `cd app/web && pnpm build` after any changes.
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

### 2. Dependency Vulnerability Audit
**Zamanlama:** Haftalık — Salı 02:00 UTC
```
Run a full dependency vulnerability audit for both frontend and backend:

Frontend:
- cd app/web && pnpm audit --audit-level=moderate
- Check for deprecated packages in package.json
- Verify all @capacitor/* packages are compatible with Capacitor 8

Backend:
- Review requirements.txt for known CVEs
- Check if any pinned versions have security patches available
- Focus on: fastapi, sqlalchemy, pydantic, cryptography, python-jose

Create a prioritized fix list: Critical > High > Medium.
Apply safe minor/patch updates automatically.
Run `cd app/web && pnpm build` after any changes.
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

### 3. Auth Flow Integrity Check
**Zamanlama:** Aylık — 1. gün 03:00 UTC
```
Perform a comprehensive authentication and authorization security audit:

1. JWT Implementation (app/backend/app/routers/auth.py):
   - Verify token expiration is enforced
   - Check for JWT algorithm confusion vulnerabilities
   - Ensure refresh token rotation

2. RBAC System (app/web/src/store/authStore.ts):
   - Verify role hierarchy: super_admin > admin > editor > viewer
   - Check company-based access controls
   - Ensure no privilege escalation paths

3. Frontend Auth Guards:
   - Verify 401 interceptor in axios config
   - Check offline auth bypass security
   - Validate password reset flow security

4. Admin Panel Access:
   - Review hardcoded username check (username === 'bekir')
   - Suggest role-based admin access instead

Report all findings with severity ratings.
Run `cd app/web && pnpm build` after any changes.
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

---

## ⚡ Performans (Performance)

### 4. Bundle Size Analysis
**Zamanlama:** 2 Haftada Bir — Çarşamba 03:00 UTC
```
Analyze the Next.js frontend bundle size and identify optimization opportunities:

1. Run `cd app/web && pnpm build` and capture the build output
2. Identify chunks larger than 100KB
3. Check for:
   - Duplicate dependencies in the bundle
   - Large libraries that could be lazy-loaded (motion, jspdf, html2canvas)
   - Unused exports from large packages (lucide-react — only import used icons)
   - Components that should use dynamic imports

4. Key files to check for size:
   - TaskDetailPanel.tsx (75KB!) — should be split into sub-components
   - CalendarPage.tsx (64KB) — consider lazy loading views
   - DashboardWidgets.tsx (47KB) — widget-level code splitting
   - AIChatDashboard.tsx (31KB)

Propose specific refactoring with estimated size savings.
Run `cd app/web && pnpm build` after any changes.
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

### 5. Backend Response Time Audit
**Zamanlama:** Haftalık — Perşembe 02:00 UTC
```
Audit the FastAPI backend for performance issues:

1. Review all router files in app/backend/app/routers/ for:
   - N+1 query patterns (eager loading vs lazy loading)
   - Missing database indexes on frequently queried columns
   - Unoptimized SQLAlchemy queries (selectinload vs joinedload)
   - Missing pagination on list endpoints

2. Check specific heavy endpoints:
   - /api/tasks (26KB router — likely complex queries)
   - /api/ai/* (43KB router — Gemini API timeout handling)
   - /api/admin/* (24KB router — user listing optimization)

3. Review middleware performance:
   - Body caching middleware efficiency
   - CORS configuration optimization

4. Connection pool settings in database.py:
   - pool_size, max_overflow, pool_timeout values

Suggest improvements with priority ratings.
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

### 6. Database Query Optimization
**Zamanlama:** Aylık — 15. gün 03:00 UTC
```
Perform a database query optimization audit:

1. Review all SQLAlchemy models in app/backend/app/models/:
   - Check index coverage for common query patterns
   - Identify missing composite indexes
   - Review relationship definitions for optimal loading

2. Analyze Alembic migrations:
   - Ensure all migrations are forward-compatible
   - Check for missing index migrations

3. MSSQL (Venus) read-only queries:
   - Review query efficiency in ads/ routers
   - Check for unnecessary data transfer

4. Neon PostgreSQL specific:
   - Connection pooling via Neon pooler endpoint
   - SSL configuration correctness

Report with: Query, Current Cost, Suggested Optimization, Expected Improvement.
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

---

## 🧹 Kod Kalitesi (Code Quality)

### 7. Dead Code & Unused Import Cleanup
**Zamanlama:** Haftalık — Cuma 02:00 UTC
```
Clean up dead code and unused imports across the entire codebase:

Frontend (app/web/src/):
- Remove unused imports from all .ts and .tsx files
- Identify unused components (exported but never imported elsewhere)
- Find unused Zustand store actions/selectors
- Remove commented-out code blocks older than the last meaningful commit
- Check for orphaned CSS classes in globals.css

Backend (app/backend/app/):
- Remove unused Python imports
- Identify unused route handlers
- Find unreferenced utility functions
- Check for dead service methods

Do NOT remove:
- Type definitions that might be used dynamically
- Exported interfaces/types from types/ directory
- Test fixtures or test utilities

Run `cd app/web && pnpm build` after changes to verify nothing breaks.
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

### 8. TypeScript Strict Mode Compliance
**Zamanlama:** 2 Haftada Bir — Pazartesi 03:00 UTC
```
Improve TypeScript type safety across the frontend codebase:

1. Find and fix all `any` type usages in app/web/src/:
   - Replace with proper types from src/types/
   - Add missing type definitions where needed

2. Check for type-unsafe patterns:
   - Non-null assertions (!) without proper guards
   - Type casting with `as` without validation
   - Optional chaining that hides potential bugs

3. Verify all Zustand stores have proper type definitions:
   - Check stores/ directory (14 stores)
   - Ensure state and action types are explicit

4. Review API response types:
   - services/ directory should have typed responses
   - Axios interceptors should use generic types

5. Run `npx tsc --noEmit` and fix all errors

Run `cd app/web && pnpm build` after all changes.
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

### 9. Component Size Audit
**Zamanlama:** Aylık — 5. gün 03:00 UTC
```
Audit React components for size and complexity, then refactor oversized ones:

Target components exceeding 500 lines:
1. TaskDetailPanel.tsx (75KB) — Split into:
   - TaskHeader, TaskBody, TaskActions, TaskComments, TaskPhotos sub-components
2. CalendarPage.tsx (64KB) — Split into:
   - MonthView, WeekView, DayView, EventForm sub-components
3. DashboardWidgets.tsx (47KB) — Already modular? Verify widget isolation
4. AIChatDashboard.tsx (31KB) — Split into: ChatMessages, ChatInput, ChatSettings
5. LoginOverlay.tsx (22KB) — Split into: LoginForm, RegisterForm, SocialLogin

For each refactoring:
- Extract sub-components to the same directory
- Maintain all existing functionality
- Keep props interfaces clean and typed
- Ensure no circular dependencies

Run `cd app/web && pnpm build` after each component refactor.
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

### 10. ESLint & Formatting Fix
**Zamanlama:** Haftalık — Cumartesi 02:00 UTC
```
Fix all ESLint warnings and errors across the frontend codebase:

1. Run `cd app/web && pnpm lint` and capture all issues
2. Auto-fix what's possible with `pnpm lint --fix`
3. Manually fix remaining issues:
   - Missing React hooks dependencies
   - Unused variables
   - Import ordering
   - Accessibility warnings (jsx-a11y)

4. Review .eslintrc.json and eslint.config.mjs:
   - Ensure rules are appropriate for Next.js 16
   - Add any missing recommended rules

5. Check for consistent code formatting:
   - Indentation (2 spaces)
   - Quote style consistency
   - Trailing commas
   - Semicolons

Run `cd app/web && pnpm build` after all fixes.
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

---

## 🧪 Test (Testing)

### 11. API Endpoint Health Check
**Zamanlama:** Günlük — 06:00 UTC
```
Verify all backend API endpoints are responding correctly:

Test these critical endpoints against the live backend (https://myworld-twqx.onrender.com):

1. Health & Info:
   - GET /api/health → expect 200
   - GET /api/app-version → expect 200 with version object
   - GET /docs → expect 200 (FastAPI Swagger)

2. Auth (without token — expect 401 or specific responses):
   - POST /api/auth/login → expect 422 (missing body) or 200
   - GET /api/auth/me → expect 401

3. Protected endpoints (expect 401 without token):
   - GET /api/tasks → expect 401
   - GET /api/notes → expect 401
   - GET /api/calendar/events → expect 401

If any endpoint returns 500 or times out, create a bug report.
Do NOT create or modify any code — this is a read-only health check.
Update docs/jules/JULES_CHANGELOG.md in Turkish with results.
```

### 12. Frontend Build Verification
**Zamanlama:** Günlük — 07:00 UTC
```
Verify the frontend builds successfully and check for new warnings:

1. Run: cd app/web && pnpm install && pnpm build
2. Capture and analyze:
   - Build success/failure
   - Total build time
   - Any new TypeScript errors
   - Any new ESLint warnings
   - Bundle size changes from last build
   - Static page generation results

3. If build fails:
   - Identify the root cause
   - Fix the issue if it's a simple type error or import issue
   - If complex, create a detailed bug report

4. Check for deprecation warnings:
   - Next.js API deprecations
   - React 19 compatibility warnings
   - Tailwind CSS v4 migration warnings

Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

### 13. Auth Flow E2E Test
**Zamanlama:** Haftalık — Pazar 03:00 UTC
```
Create and run end-to-end authentication flow tests:

Create/update app/backend/tests/test_auth.py:

1. Test Login Flow:
   - POST /api/auth/login with valid credentials → 200 + JWT token
   - POST /api/auth/login with invalid password → 401
   - POST /api/auth/login with non-existent user → 404

2. Test Registration:
   - POST /api/auth/register with valid data → 201
   - POST /api/auth/register with duplicate email → 409
   - POST /api/auth/register with weak password → 422

3. Test Token Validation:
   - GET /api/auth/me with valid token → 200 + user data
   - GET /api/auth/me with expired token → 401
   - GET /api/auth/me with malformed token → 401

4. Test Password Reset:
   - POST /api/auth/forgot-password → verify email service called
   - POST /api/auth/reset-password with valid token → 200

Run tests with: cd app/backend && python -m pytest tests/ -v
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

### 14. Offline Sync Queue Test
**Zamanlama:** 2 Haftada Bir — Perşembe 03:00 UTC
```
Verify the offline sync queue implementation is correct and robust:

Review app/web/src/lib/syncQueue.ts:
1. IndexedDB storage mechanism
2. Queue processing order (FIFO)
3. Retry logic (max 5 retries)
4. Error handling for failed syncs
5. Network status detection integration
6. Conflict resolution strategy

Check integration points:
- taskStore.ts offline operations
- calendarStore.ts offline operations
- noteStore.ts offline operations

Verify:
- Queue items are properly serialized/deserialized
- Auth token is refreshed before replay
- Failed items don't block queue processing
- Queue is cleared after successful sync

Fix any issues found.
Run `cd app/web && pnpm build` after changes.
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

---

## ♿ Erişilebilirlik (Accessibility)

### 15. WCAG AA Compliance Scan
**Zamanlama:** Aylık — 10. gün 03:00 UTC
```
Perform a WCAG 2.1 AA compliance audit on all frontend components:

1. Interactive Elements (app/web/src/components/):
   - Verify all buttons, links, inputs have aria-label or aria-labelledby
   - Check form elements have associated <label> tags
   - Verify focus indicators are visible (not removed by CSS)

2. Color Contrast (globals.css + Tailwind):
   - Check text/background contrast ratios (min 4.5:1 for normal text)
   - Check large text contrast (min 3:1)
   - Verify focus outline visibility in both light and dark themes

3. Keyboard Navigation:
   - Tab order is logical through Sidebar, Dashboard, forms
   - All interactive elements are reachable via keyboard
   - Modal dialogs trap focus correctly
   - ESC closes modals and dropdowns

4. Screen Reader:
   - Semantic HTML usage (nav, main, article, section, aside)
   - Heading hierarchy (single h1 per view)
   - Alt text for images
   - Live regions for dynamic content (AI chat, notifications)

5. Key components to audit:
   - Sidebar.tsx — navigation landmark
   - LoginOverlay.tsx — form accessibility
   - TaskDetailPanel.tsx — complex interactive panel
   - CalendarPage.tsx — date picker accessibility

Fix issues found. Run `cd app/web && pnpm build` after changes.
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

---

## 📚 Belgeleme (Documentation)

### 16. API Documentation Sync
**Zamanlama:** 2 Haftada Bir — Salı 03:00 UTC
```
Synchronize API documentation with actual backend implementation:

1. Review all routers in app/backend/app/routers/:
   - auth.py, admin.py, tasks.py, ai.py, notes.py, calendar.py
   - timer.py, telegram.py, reports.py, meeting.py, activity.py
   - live_translate.py, websocket.py, task_comments.py
   - ads/ directory (11 sub-routers)

2. For each endpoint, verify/update:
   - HTTP method and path
   - Request body schema (Pydantic models)
   - Response schema and status codes
   - Authentication requirements
   - Query parameters

3. Create/update docs/API_REFERENCE.md with:
   - Endpoint table per router
   - Request/response examples
   - Error code reference

4. Check FastAPI auto-docs (/docs endpoint):
   - Ensure all endpoints have docstrings
   - Verify Pydantic model descriptions

Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

### 17. README & Changelog Update
**Zamanlama:** Aylık — 20. gün 03:00 UTC
```
Update project documentation to reflect current state:

1. Update README.md:
   - Current tech stack versions
   - Setup instructions accuracy
   - Feature list completeness
   - Environment variables documentation
   - Deployment instructions

2. Review/update SYSTEM_CHANGELOG.md:
   - Add any undocumented changes
   - Verify date format: DD.MM.YYYY

3. Check all docs/ files for accuracy:
   - Remove references to deprecated features
   - Update URLs and endpoints

4. Verify .env.example matches actual requirements:
   - All required variables are listed
   - No actual secrets in example file
   - Descriptions are helpful

Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

---

## 🗄️ Veritabanı (Database)

### 18. Migration Consistency Check
**Zamanlama:** Haftalık — Çarşamba 02:00 UTC
```
Verify Alembic migration consistency with SQLAlchemy models:

1. Compare current models (app/backend/app/models/) with migration history:
   - cd app/backend && alembic check
   - Identify any model changes not reflected in migrations

2. Review migration chain:
   - cd app/backend && alembic history
   - Verify no broken migration links
   - Check for duplicate revision IDs

3. Model-to-migration sync:
   - user, project, task, task_comment, note, calendar_event
   - chat_session, chat_message, ai_memory, timer_session
   - notification, report, activity_log, email_verification
   - role_templates, user_company_access
   - live_translate_session, live_translate_message
   - ads/ models

4. If inconsistencies found:
   - Generate auto migration: alembic revision --autogenerate -m "sync: fix model drift"
   - Review generated migration before applying

Do NOT apply migrations to production without explicit review.
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

### 19. Connection Pool Health
**Zamanlama:** 2 Haftada Bir — Cuma 03:00 UTC
```
Review database connection health and pool configuration:

1. Check app/backend/app/database.py:
   - pool_size setting (current: 5)
   - max_overflow setting
   - pool_timeout and pool_recycle values
   - SSL configuration for Neon

2. Evaluate connection patterns:
   - Are connections properly closed after requests?
   - Is there a connection leak risk?
   - Are async sessions properly managed with context managers?

3. MSSQL (Venus) connection:
   - Check connection timeout settings
   - Verify read-only access is enforced
   - Review connection string security

4. Recommendations:
   - Optimal pool_size for Neon free tier
   - Connection retry logic
   - Health check query implementation

Fix any issues found.
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

---

## 🚀 İnovasyon (Innovation)

### 20. Dependency Update Proposal
**Zamanlama:** Aylık — 25. gün 03:00 UTC
```
Analyze all dependencies and propose safe updates:

Frontend (app/web/package.json):
- Check for major version updates: next, react, react-dom
- Check Capacitor ecosystem: @capacitor/core, @capacitor/android, etc.
- Check UI libraries: lucide-react, motion, shadcn
- Check build tools: tailwindcss, typescript, eslint

Backend (app/backend/requirements.txt):
- Check for: fastapi, sqlalchemy, pydantic, uvicorn
- Check security packages: cryptography, python-jose, bcrypt
- Check AI packages: google-genai

For each update proposal:
- Current version → Latest version
- Breaking changes summary
- Migration effort estimate (Low/Medium/High)
- Security relevance

Apply ONLY safe patch updates automatically.
Major/minor updates: document but DO NOT apply.
Run `cd app/web && pnpm build` after any changes.
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

### 21. New Feature Opportunity Scan
**Zamanlama:** Aylık — 28. gün 03:00 UTC
```
Scan for new feature opportunities and improvements for Planla:

1. Review current feature gaps:
   - Missing error boundaries in critical components
   - Missing loading states
   - Missing empty states
   - Missing user onboarding flow

2. UX Improvements:
   - Keyboard shortcuts implementation
   - Dark/light theme consistency
   - Mobile touch gesture support
   - Drag & drop improvements

3. Technical Improvements:
   - React Server Components migration potential
   - Edge runtime for specific API routes
   - Image optimization with next/image
   - SEO improvements (meta tags, structured data)

4. AI Enhancement Ideas:
   - Gemini model upgrades
   - New AI features (summarization, smart scheduling)
   - Voice command integration improvements

Create a prioritized feature backlog in docs/FEATURE_BACKLOG.md.
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

---

## 📱 PWA & Capacitor

### 22. Service Worker Integrity
**Zamanlama:** Haftalık — Pazar 02:00 UTC
```
Verify Service Worker (Serwist) implementation is correct and safe:

1. Review app/web/src/app/sw.ts:
   - Cache strategy correctness
   - CRITICAL: Ensure NO caches.match('/') — this causes redirect loops
   - Verify precache manifest is generated correctly
   - Check runtime caching rules

2. Verify Serwist configuration:
   - @serwist/next plugin setup in next.config.ts
   - Scope and registration settings
   - Update strategy (prompt vs auto)

3. Offline behavior:
   - Critical assets are cached
   - API requests have proper fallback
   - Offline banner shows correctly

4. Cache management:
   - Old cache cleanup on version update
   - Cache size limits
   - Cache invalidation strategy

5. PWA Manifest:
   - Icons are correct sizes
   - Start URL and scope
   - Display mode and orientation

Fix any issues. Run `cd app/web && pnpm build` after changes.
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

### 23. Capacitor Plugin Compatibility
**Zamanlama:** 2 Haftada Bir — Cumartesi 03:00 UTC
```
Verify all Capacitor plugins are compatible and properly configured:

1. Check plugin versions in package.json:
   - @capacitor/core: ^8.3.1
   - @capacitor/android: ^8.3.1
   - @capacitor/app, @capacitor/filesystem, @capacitor/keyboard
   - @capacitor/local-notifications, @capacitor/network
   - @capacitor/share, @capacitor/status-bar

2. Verify capacitor.config.ts:
   - webDir points to correct build output (out.nosync)
   - Server allowNavigation list is complete
   - Android scheme is https

3. Check native plugin usage:
   - app/web/src/hooks/ — Capacitor hook implementations
   - Verify proper platform detection (Capacitor.isNativePlatform())
   - Error handling for web-only environments

4. Android project:
   - Review app/web/android/ configuration
   - Check gradle dependencies match plugin versions
   - Verify AndroidManifest.xml permissions

Report compatibility issues with fix suggestions.
Run `cd app/web && pnpm build` after any changes.
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

### 24. Mobile UI Responsiveness
**Zamanlama:** Aylık — 12. gün 03:00 UTC
```
Audit mobile UI responsiveness and touch interaction quality:

1. CSS Review (globals.css + component styles):
   - Verify responsive breakpoints consistency
   - Check viewport meta tag
   - Touch target sizes (minimum 44x44px per WCAG)
   - Safe area insets for notched devices

2. Component-specific checks:
   - Sidebar.tsx — mobile drawer behavior
   - Kanban board — horizontal scroll on mobile
   - CalendarPage — month/week/day responsive views
   - TaskDetailPanel — full-screen on mobile
   - Dashboard widgets — grid layout responsiveness

3. Touch interactions:
   - Swipe gestures (mobile-drag-drop integration)
   - Long press actions
   - Pull-to-refresh where appropriate
   - Pinch-to-zoom for photos

4. Performance on mobile:
   - Large component lazy loading
   - Image optimization for mobile bandwidth
   - Animation performance (60fps target)

Fix responsive issues found.
Run `cd app/web && pnpm build` after changes.
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

---

## 📅 Zamanlama Takvimi (Özet)

| Gün | Saat (UTC) | Görev |
|-----|-----------|-------|
| **Her Gün** | 06:00 | API Health Check (#11) |
| **Her Gün** | 07:00 | Frontend Build Verification (#12) |
| **Pazartesi** | 02:00 | Hardcoded Secret Scan (#1) |
| **Salı** | 02:00 | Dependency Vulnerability (#2) |
| **Çarşamba** | 02:00 | Migration Consistency (#18) |
| **Perşembe** | 02:00 | Backend Response Time (#5) |
| **Cuma** | 02:00 | Dead Code Cleanup (#7) |
| **Cumartesi** | 02:00 | ESLint Fix (#10) |
| **Pazar** | 02:00 | SW Integrity (#22) |
| **Pazar** | 03:00 | Auth E2E Test (#13) |
| **2 Haftada Çar** | 03:00 | Bundle Size (#4) |
| **2 Haftada Pzt** | 03:00 | TypeScript Strict (#8) |
| **2 Haftada Sal** | 03:00 | API Docs Sync (#16) |
| **2 Haftada Per** | 03:00 | Offline Sync Test (#14) |
| **2 Haftada Cum** | 03:00 | Connection Pool (#19) |
| **2 Haftada Cts** | 03:00 | Capacitor Compat (#23) |
| **Aylık 1.** | 03:00 | Auth Integrity (#3) |
| **Aylık 5.** | 03:00 | Component Size (#9) |
| **Aylık 10.** | 03:00 | WCAG Scan (#15) |
| **Aylık 12.** | 03:00 | Mobile UI (#24) |
| **Aylık 15.** | 03:00 | DB Query Opt (#6) |
| **Aylık 20.** | 03:00 | README Update (#17) |
| **Aylık 25.** | 03:00 | Dep Update (#20) |
| **Aylık 28.** | 03:00 | Feature Scan (#21) |

> **Günlük Ortalama:** ~4-5 seans/gün (PRO limit: 100/gün — güvenli)

---

## 🔧 Jules Zamanlayıcı Ekleme Talimatları

Jules zamanlayıcıları **sadece** [jules.google.com](https://jules.google.com) web arayüzünden eklenebilir:

1. jules.google.com → İlgili repo seç
2. **"Scheduled"** sekmesine geç
3. **"+ Add Schedule"** butonuna tıkla
4. Yukarıdaki promptlardan birini yapıştır
5. Cron expression'ı ayarla
6. Kaydet

> ⚠️ **CLI'dan zamanlayıcı eklenemez** — bu bir platform kısıtıdır.
