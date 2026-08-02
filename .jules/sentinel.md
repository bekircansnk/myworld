## 2024-05-18 - Path Traversal in File Uploads
**Vulnerability:** File upload endpoint in `ads/reports.py` used unsanitized `file.filename` directly in `os.path.join` to determine where to save the file. This allowed path traversal (e.g., `../../../etc/passwd` or absolute paths).
**Learning:** `os.path.join` on Python can return an absolute path if a later argument is an absolute path. File names containing backslashes or forward slashes can bypass basic validation and write arbitrary files.
**Prevention:** Always sanitize user-provided filenames using `os.path.basename()` after replacing backslashes with forward slashes (e.g., `os.path.basename(filename.replace('\\', '/'))`) before writing files to the disk.
