## 2024-11-20 - Optimize Database Aggregate and Deletion Queries
**Learning:** Using `.scalars().all()` on SQLAlchemy execution results to perform counts in Python (e.g. `len(result.scalars().all())`) is extremely memory intensive and causes O(N) memory scaling when the number of records is large.
**Action:** When counting rows, use database-level aggregations (`select(func.count(Model.id))`) or use `result.rowcount` from a `delete()` operation to reduce memory overhead to O(1) and improve query performance.
