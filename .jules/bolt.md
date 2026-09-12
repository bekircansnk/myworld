## 2024-05-24 - Task Reorder N+1 Query Elimination
**Learning:** Reordering tasks in a loop performed N SELECTs which is a classic N+1 bottleneck when sorting many items simultaneously.
**Action:** Always extract IDs and use a single `.in_()` select combined with an in-memory dictionary cache to batch update properties for matching rows instead of looping queries.
