## 2026-08-17 - Array filtering within render loops
**Learning:** Calling `.filter()` on a large dataset inside a `.map()` iteration during the React render cycle creates an O(N*M) bottleneck, causing unnecessary overhead especially as list sizes grow.
**Action:** When rendering grouped lists (like items per week), precalculate a hash map (e.g. `Record<key, Item[]>`) in a single O(N) pass and memoize it using `useMemo`. Retrieve from the dictionary within the render loop to keep complexity at O(N).
