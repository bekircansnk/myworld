## YYYY-MM-DD - [Title]
**Learning:** [Insight]
**Action:** [How to apply next time]
## 2024-05-24 - N+1 Query in Task Reordering
**Learning:** Performing multiple individual `SELECT` queries in a loop to update task reordering (N+1 query problem) severely impacts database performance, especially for large lists.
**Action:** Always extract entity IDs into a list and use a single `.in_()` query to fetch all required entities in a batch before processing them in memory.
