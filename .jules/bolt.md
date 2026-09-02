## 2024-05-24 - Optimize O(N) memory overhead in get_stats
**Learning:** Fetching all User records into memory using `.scalars().all()` just to count active vs inactive users creates an O(N) memory overhead in Python. SQLAlchemy's `func.count()` should be used instead to push the aggregation to the database, resulting in O(1) memory complexity.
**Action:** Always use SQLAlchemy database-level aggregate queries like `select(func.count(Model.id))` to calculate statistics or counts rather than fetching full ORM objects into Python memory.
