## 2024-05-29 - Optimize Bulk Deletes
**Learning:** Fetching objects via .scalars().all() for counting causes O(N) memory overhead.
**Action:** Execute delete() directly and capture result.rowcount for O(1) efficiency.
