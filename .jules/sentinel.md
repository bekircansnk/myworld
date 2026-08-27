## 2026-08-27 - Prevent Path Traversal in File Uploads
**Vulnerability:** Path Traversal (CWE-22) in `create_ai_analysis` endpoint.
**Learning:** Constructing file paths with user-supplied filenames and a UUID prefix (`f"{uuid}_{filename}"`) stops absolute path injections but fails to prevent relative traversal sequences (e.g., `../../../`).
**Prevention:** Always sanitize uploaded filenames using `os.path.basename()` before appending them to path construction logic, and verify required modules (`import os`) are present.
