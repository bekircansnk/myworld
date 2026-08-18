## 2024-05-24 - Add missing indexes to SQLAlchemy ForeignKey columns
**Learning:** Adding `index=True` to SQLAlchemy ForeignKey columns is essential for performance on joins and filtering, but many models in the codebase were missing them.
**Action:** Always add `index=True` to `ForeignKey` columns in SQLAlchemy models, as specified in memory guidelines. I will programmatically update all models to add these indexes and create a migration script, keeping performance optimal.
