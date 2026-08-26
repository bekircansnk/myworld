## 2024-10-24 - N+1 Queries in Bulk Operations
**Learning:** The codebase has an anti-pattern of implementing bulk updates (like task reordering) with sequential N+1 database queries in loops rather than batching them with `IN` clauses.
**Action:** Always batch database lookups using `.in_()` and map the results in memory using a dictionary for O(1) lookups before applying updates to multiple records.
