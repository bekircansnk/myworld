## 2024-09-06 - Bulk Operations for Delete/Update
**Learning:** Found N+1 performance bottlenecks caused by calling `await db.delete(record)` or updating `record.attribute = True` within loops of fetched scalar objects.
**Action:** Use SQLAlchemy bulk operations (`delete().where()` and `update().where().values()`) and `await db.execute()` directly to perform the operation in a single query instead of executing N queries.
