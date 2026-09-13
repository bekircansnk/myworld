## 2024-05-20 - Fast reordering bottleneck
**Learning:** Reordering tasks in an iteration loop using SQLAlchemy `.first()` results in O(N) database queries which slows down backend performance significantly.
**Action:** When updating a batch of items with distinct fields like `sort_order`, extract the IDs, bulk load them via `.in_()`, build an in-memory dictionary, and map updates directly to the instances.
