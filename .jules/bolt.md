## 2026-08-19 - Add missing useMemo for array filtering
**Learning:** Found that heavy filtering of tasks and notes arrays inside React components without `useMemo` causes severe performance bottlenecks during re-renders, especially when derived values are passed down or used in complex layouts like calendars.
**Action:** Always hoist invariant array manipulations or use `React.useMemo` to wrap derived list data, ensuring `O(N)` work only happens when dependencies change.
