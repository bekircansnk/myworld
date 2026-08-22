## 2024-08-22 - Precomputing Array Filters in Renders
**Learning:** Using `Array.filter()` inside a component's render function or map loop (like calling a function that filters the `tasks` array per task card to get subtask counts) causes severe O(N*M) performance bottlenecks and unnecessary recalculations on every render.
**Action:** Precompute grouped data into a hash map using a single O(N) pass wrapped in `useMemo`, and look up the values in the map loop.
