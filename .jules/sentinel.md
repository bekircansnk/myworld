## 2024-10-18 - Fix SQL Injection with SQLAlchemy text()
**Vulnerability:** SQL Injection via f-string formatting inside SQLAlchemy `text()` in `app/backend/app/routers/admin.py` when truncating tables.
**Learning:** `text()` passes the constructed SQL statement to the database unchanged, bypassing standard parameterization. DDL statements like `TRUNCATE TABLE` do not support parameterization, so dynamic table names cannot be safely passed even with placeholders.
**Prevention:** For DDL statements with dynamic but bounded targets (like table names), use a hardcoded list or dictionary of pre-constructed `text()` queries instead of string interpolation.
