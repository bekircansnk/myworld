## 2024-05-18 - Missing useMemo on filter arrays
**Learning:** In React components with frequent state updates (like text inputs `aiInput`), failing to wrap array `.filter()` operations on list props with `useMemo` causes O(N) recalculations on every keystroke, which can significantly degrade performance as the list size grows.
**Action:** Always wrap array filtering operations with `useMemo` when the component also contains frequently updated state.
