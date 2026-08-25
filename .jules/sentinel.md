
## 2024-05-24 - Path Traversal in File Uploads
**Vulnerability:** A Path Traversal vulnerability was found in the `create_ai_analysis` endpoint where `file.filename` was used to construct a file path without sanitization, despite being prefixed with a UUID.
**Learning:** Prefixing a user-controlled filename with a UUID (e.g., `f"{uuid}_{filename}"`) prevents absolute path overrides but DOES NOT protect against relative traversal sequences (e.g., `../`), allowing attackers to write files outside the intended directory.
**Prevention:** Always sanitize filenames from user uploads using `os.path.basename(filename)` before joining them with upload directory paths to remove any directory components.
