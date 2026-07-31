## 2024-05-18 - Optimize Subtask Counting with useMemo lookup
**Learning:** Calling `Array.prototype.filter` inside render helpers (like `getSubtaskCount`) causes O(N*M) time complexity if called for every rendered item M within a dataset of size N.
**Action:** Replace inline array filters with a single `useMemo` pass that creates an O(1) dictionary lookup for counts/aggregations.
