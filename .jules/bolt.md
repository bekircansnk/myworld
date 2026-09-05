## 2026-09-05 - N+1 Query in Task Reordering
**Learning:** Found an N+1 query bottleneck in `app/backend/app/routers/tasks.py` during task reordering (`/reorder`). The endpoint updates each task's `sort_order` sequentially within a loop via individual `await db.execute()` SELECT calls, causing O(n) database calls where n is the number of reordered tasks.
**Action:** Used a single `in_` query to fetch all required tasks efficiently and matched them in memory with the requested order map before updating, turning O(n) DB calls into O(1) calls.
