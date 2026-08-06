## 2024-08-06 - React List Rendering O(N*M) Filtering Optimization
**Learning:** In list views (like Kanban boards), calculating per-item derived states (such as subtask counts) using `.filter()` on a global array scales exponentially O(N*M), causing heavy render loop bottlenecks.
**Action:** Always extract inner array iteration operations into a single O(N) pre-calculation mapping hook via `useMemo`, shifting the per-item complexity from O(N) filtering to O(1) dictionary lookups.
