## 2024-05-24 - Database Counts in SQLAlchemy
**Learning:** Calculating statistics or counts in the FastAPI backend by fetching all records into memory via `.scalars().all()` (and then using `len()`) introduces an O(N) memory overhead and is a severe bottleneck for large tables.
**Action:** Always use SQLAlchemy database-level aggregate queries like `select(func.count(Model.id))` to calculate counts, which reduces memory overhead to O(1).
