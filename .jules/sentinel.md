## 2024-05-20 - Path Traversal in File Uploads with UUID Prefix
**Vulnerability:** Path traversal (CWE-22) in file uploads even when using a UUID prefix (e.g., `f"{uuid}_{filename}"`).
**Learning:** Concatenating a UUID prefix prevents absolute path overrides (e.g., starting with `/`) but does NOT protect against relative traversal sequences (e.g., `foo/../../../../etc/passwd`). The relative paths can still escape the intended upload directory.
**Prevention:** Always use `os.path.basename()` to sanitize filenames extracted from user uploads before concatenating them into file paths.
