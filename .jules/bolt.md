## 2026-08-29 - O(N) memory overhead with scalars().all() on bulk deletions
**Learning:** Using `select(...)` and `scalars().all()` just to get the length of records being deleted causes severe O(N) memory overhead and N+1 query patterns.
**Action:** When performing bulk deletions in SQLAlchemy 2.0 and needing the count of deleted rows, use `result = await db.execute(delete(...))` and access `result.rowcount` rather than fetching all rows with `.scalars().all()` merely to count them.
