## 2024-05-18 - [Path Traversal in AI Analysis Report Uploads]
**Vulnerability:** The AI analysis report upload endpoint (`/api/ads/reports/ai-analysis`) constructed file paths using the user-provided `file.filename` without sanitization. A malicious user could send a filename like `../../../etc/passwd` or `..\..\..\etc\passwd`, potentially allowing them to write files to arbitrary locations on the server file system.
**Learning:** Never trust user input, especially filenames provided in multipart form uploads.
**Prevention:** Always sanitize filenames from uploads before using them to construct paths. A robust way is to replace backslashes with forward slashes (to handle Windows paths on Linux servers) and then use `os.path.basename()` to extract only the final component of the path.
