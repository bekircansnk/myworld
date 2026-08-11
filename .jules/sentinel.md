## 2025-02-28 - [Path Traversal in File Uploads]
**Vulnerability:** The application was using the raw `UploadFile.filename` from the user input in file paths, for example `file_path = os.path.join(upload_dir, f"{uuid.uuid4().hex}_{file_name}")` where `file_name = file.filename`.
**Learning:** This exposes the application to Path Traversal attacks where a malicious user uploads a file like `../../../etc/passwd` to overwrite arbitrary files on the filesystem.
**Prevention:** Always sanitize the filename before saving to disk using `os.path.basename` and removing any backslashes, for example with a custom `secure_filename` function (like `werkzeug.utils.secure_filename`).
