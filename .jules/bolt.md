## 2024-05-30 - Initializing Journal
**Learning:** Started looking for performance bottlenecks
**Action:** Exploring components for missing memoization or redundant calculations.
## 2024-05-30 - TaskCard React.memo and Theme Observer Optimization
**Learning:** Found that TaskCard in KanbanBoard is missing React.memo and uses a MutationObserver to detect dark mode instead of next-themes. MutationObserver in every TaskCard instance causes excessive memory/CPU usage, especially for lists. Also, KanbanBoard uses mainTasks.filter on every render for each column inside KanbanBoard map without memoization.
**Action:** Use next-themes `useTheme` in TaskCard or pass isDark as a prop. Wrap TaskCard in React.memo to prevent unnecessary re-renders when other columns update. Optimizing TaskCard is highly impactful because Kanban boards typically have many tasks rendered at once.
