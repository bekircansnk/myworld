## 2024-08-20 - Path Traversal in File Upload via os.path.join
**Vulnerability:** Unsanitized file uploads where `file.filename` is concatenated using `os.path.join(dir, prefix + file.filename)`. If `filename` starts with `/`, `os.path.join` replaces the entire path string with it, leading to path traversal outside of the designated upload directory.
**Learning:** `os.path.join` does not sanitize filenames and evaluates absolute paths from the rightmost `/` parameter.
**Prevention:** Always sanitize uploaded filenames using a helper like `secure_filename` (which extracts `os.path.basename` and strips non-alphanumeric characters) before using them in file system operations.
