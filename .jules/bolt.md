## 2024-05-15 - Memoizing expensive array operations in DashboardWidgets
**Learning:** Frequent state updates (like a clock updating every minute) in a component that also performs expensive array filtering operations on a large dataset (like tasks) can cause unnecessary re-renders and performance degradation.
**Action:** Always wrap derived data calculations, especially array filters and sorts, in `useMemo` hooks, specifying exactly the dependencies they rely on, so they don't re-calculate when unrelated state (like the time) changes.
