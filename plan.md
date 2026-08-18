1. Modify `app/web/src/components/calendar/CalendarPage.tsx` to wrap expensive `tasks.filter` and `events.filter` operations in `useMemo`.
   - The file currently does `tasks.filter` and `events.filter` directly in the render cycle, calculating `todayTasks`, `pendingTasksNoDate`, and `monthEvents` every time the component renders.
   - We will use `useMemo` to memoize these arrays to prevent O(N) recalculations on every render, especially since `tasks` and `events` arrays can get large.
2. Complete pre commit steps to ensure proper testing, verification, review, and reflection are done.
3. Submit the change with "⚡ Bolt: Memoize expensive task and event filters in CalendarPage" message.
