## 2024-07-26 - Path Traversal via os.path.join Upload Handling
**Vulnerability:** Found arbitrary file write capability (path traversal) in `/api/ads/reports/ai-analysis` file uploads, where unsanitized user `file.filename` was concatenated using `os.path.join(upload_dir, f"{uuid}_{file.filename}")`. Python's `os.path.join` resets the root if an absolute path or extensive parent navigation is passed.
**Learning:** Even when prefixing with a UUID, `os.path.join` remains vulnerable if the dynamic user-controlled component contains path traversal sequences like `../../../` or absolute paths like `/etc/passwd`.
**Prevention:** Always sanitize user-provided filenames using `os.path.basename(file.filename.replace('\\', '/'))` before generating storage paths, regardless of any prefixes added.
