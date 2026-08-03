## 2024-05-18 - Path Traversal in File Uploads
**Vulnerability:** FastApi `UploadFile.filename` was stored directly in the database or used to build paths, leading to potential Path Traversal attacks where a malicious user could save files to arbitrary paths on the server or inject traversal sequences.
**Learning:** `UploadFile.filename` is user-provided data and cannot be trusted. Even if saving the file locally or just storing the name in a DB, it may contain directory traversal characters like `../` or `..\\`.
**Prevention:** Always sanitize user-provided filenames using `os.path.basename(filename.replace("\\", "/"))` before using them to build paths or saving them to a database.
