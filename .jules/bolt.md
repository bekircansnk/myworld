## 2026-09-04 - Resolve N+1 query in task reordering
**Learning:** Found a loop executing a separate SELECT query for every task ID being reordered, which causes an N+1 performance bottleneck, especially on large lists.
**Action:** Use `.in_()` with a list of IDs to fetch all required entities in a single query, then update their values using an in-memory mapping.
