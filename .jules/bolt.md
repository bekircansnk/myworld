## 2024-07-27 - O(N) filtering operations combined with fast state updates

**Learning:** Array filtering combined with fast typing search bars causes O(N) calculations to trigger on every keystroke, which can cause significant UI stutter when lists grow. Also, repeating operations like `.toLowerCase()` inside these tight loops incurs an unnecessary performance penalty.

**Action:** Wrap filtering operations in React components using `useMemo` when they depend on frequently updated state (like search query), and hoist repetitive string operations (like `.toLowerCase()`) outside the loop to be evaluated once per rendering.
