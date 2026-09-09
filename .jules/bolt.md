## 2024-09-09 - Avoid N+1 bottlenecks in SQLAlchemy updates and deletes
**Learning:** Performing updates or deletes on multiple records by iterating over fetched scalar objects (e.g., using `for task in tasks: db.delete(task)`) causes N+1 query bottlenecks and slows down database operations, especially for large datasets in this architecture.
**Action:** Always use SQLAlchemy's bulk update/delete operations (e.g., `await db.execute(update(Model).where(...).values(...))` or `await db.execute(delete(Model).where(...))`) instead of loops to optimize backend performance.
