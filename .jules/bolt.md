## 2026-08-18 - O(N) optimization for weekly model rendering
**Learning:** Calling `.filter()` on a large dataset inside a `.map()` loop creates an O(N*M) performance bottleneck, which causes unnecessary delays on render.
**Action:** Precompute a grouped hash map in a single O(N) pass wrapped in `useMemo` outside of the map loop to prevent redundant work.
