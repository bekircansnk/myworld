## 2026-08-25 - Avoid O(N*M) bottlenecks in mapped rendering
**Learning:** Calling `.filter()` on a large dataset inside a `.map()` loop creates an O(N*M) performance bottleneck, especially for frequent renders like in the dashboard.
**Action:** Precompute a grouped hash map (e.g. `Record<number, Task[]>`) outside the render loop using `useMemo` in a single O(N) pass, then look up values in O(1) time.
