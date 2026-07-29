## 2024-05-24 - Path Traversal Vulnerability in File Uploads
**Vulnerability:** User-provided filenames (`file.filename`) were used directly in file saving operations and database records across multiple endpoints (e.g., reports, csv_imports, photo_tracking) without sanitization.
**Learning:** This existed because FastAPI's `UploadFile.filename` passes the client-provided string exactly as received, including path separators (like `../` or `..` or `..` ) which could allow an attacker to overwrite sensitive files outside the intended upload directory.
**Prevention:** Always sanitize user-provided filenames using `os.path.basename(file.filename.replace("\\", "/"))` before using them in file system operations or storing them.
