## 2026-08-21 - Fix Path Traversal in File Uploads
**Vulnerability:** Path Traversal (CWE-22) in `app/backend/app/routers/ads/reports.py` during file upload handling.
**Learning:** Using `os.path.join(upload_dir, f"{uuid.uuid4().hex}_{file.filename}")` does NOT fully protect against path traversal. While the prepended UUID prefix prevents the filename from acting as an absolute path (by neutralizing a leading `/`), it does nothing to stop relative traversal sequences (e.g., `../../../`) embedded within the `file.filename`.
**Prevention:** Always extract the safe base name from user-supplied filenames using `os.path.basename()` (or a secure equivalent like `werkzeug.utils.secure_filename`) before passing it to `os.path.join()`, even when prefixing with unique identifiers.
