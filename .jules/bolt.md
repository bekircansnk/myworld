## 2026-10-27 - N+1 in DataFrame Iteration
**Learning:** Parsing large excel files using `df.iterrows()` and executing individual database `select()` queries inside the loop causes a severe N+1 performance bottleneck.
**Action:** Pre-fetch potential matching database rows into Python dictionaries using `model_name.in_(...)` before the iteration loop begins, and use `dict.get()` for O(1) lookups during iteration.
