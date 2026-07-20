## 2024-03-14 - Replace O(n^2) filter with O(n) hash map in React Calendar Render
**Learning:** Found an O(n^2) rendering bottleneck in `CalendarPage.tsx` where `.filter()` was being called on the entire `events` array for every cell in the MonthView and WeekView grid during render, causing unnecessary slow performance on large calendars.
**Action:** Always group data before looping in React renders. Using an O(n) hash map lookup via `useMemo` to group events by their dates first significantly improves rendering time for data-heavy calendar grid views.
