## 2024-05-18 - Avoid in-memory counting with .scalars().all() in statistics endpoints
**Learning:** The `/stats` admin endpoint fetched every single `User` record into application memory to count total and active users, causing an O(N) memory complexity which scales poorly.
**Action:** Always utilize database-level aggregate queries using `func.count()` (e.g., `select(func.count(User.id))`) to shift the computation workload to the database and achieve O(1) memory overhead in the Python backend.
